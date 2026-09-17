const Core = require('../shared/game-core.js');
const Platform = require('./platform.js');
const { ROSTER, LEVELS, ENEMIES, WAVES, ACTIVE_SKILLS, SUPPORT_SKILLS, DIFFICULTIES, BONDS } = require('./data.js');

const RARITY_COLORS = ['#918b79', '#5f9db5', '#8c62b2', '#d29637', '#ca4938'];
const RARITY_POWER = [1, 1.03, 1.08, 1.16, 1.3];
const CULTIVATION_STAGES = [
  { kills:0, name:'初窥门径', power:0, summonLevel:1 }, { kills:30, name:'灵脉初开', power:.1, summonLevel:1 }, { kills:120, name:'丹府凝形', power:.2, summonLevel:2 }, { kills:320, name:'元神照野', power:.3, summonLevel:2 }, { kills:700, name:'山海同寿', power:.4, summonLevel:2 },
];
const POPULATION = [1, 1, 2, 2, 3];
const BASE_UNLOCKS = ['bifang','fuzhu','jiuwei','tiangou','xuangui','shengsheng','kaiming','bo','zheng','qiuniu','yazi','chaofeng','dayu','qinglong'];
const STAGE_UNLOCKS = [['pulao','suanni'],['bixi','bian'],['fuxi_long','chiwen'],['gonggong'],['baihu','zhuque','xuanwu','huangdi','fuxi','nuwa']];
const WAVE_REWARDS = [18,14,12,12,20,14,12,12,12,24,10,10,10,10,0];
const MAX_UNIT_LEVEL = 9;
const DUPLICATE_COMPENSATION = 12;
const BASIC_ATTACK_ARMOR_BREAK = 12;
const BASIC_ATTACK_ARMOR_BREAK_DURATION = 3;
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');
const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
const VIEW_W = 1280;
const VIEW_H = 720;
const scale = Math.min(info.windowWidth / VIEW_W, info.windowHeight / VIEW_H);
const offsetX = (info.windowWidth - VIEW_W * scale) / 2;
const offsetY = (info.windowHeight - VIEW_H * scale) / 2;
const portraitMode = info.windowHeight > info.windowWidth;
canvas.width = Math.round(info.windowWidth * (info.pixelRatio || 1));
canvas.height = Math.round(info.windowHeight * (info.pixelRatio || 1));
ctx.setTransform((info.pixelRatio || 1) * scale, 0, 0, (info.pixelRatio || 1) * scale, (info.pixelRatio || 1) * offsetX, (info.pixelRatio || 1) * offsetY);

function image(src) {
  const result = canvas.createImage ? canvas.createImage() : wx.createImage();
  result.loaded = false;
  result.onload = () => { result.loaded = true; };
  result.src = src;
  return result;
}

const backgrounds = LEVELS.map((level) => image(`assets/background-${level.background}.webp`));
const beastAtlas = image('assets/beast-atlas.webp');
const enemyAtlas = image('assets/enemy-atlas.webp');
const saved = Platform.loadSave();
const validCompletions = Array.isArray(saved.completions)
  ? [...new Set(saved.completions.map((key) => {
    const match = typeof key === 'string' ? /^(\d+):(easy|normal|hard)$/.exec(key) : null;
    if (!match || Number(match[1]) >= LEVELS.length) return null;
    return `${Number(match[1])}:${match[2]}`;
  }).filter(Boolean))]
  : [];
if (JSON.stringify(saved.completions || []) !== JSON.stringify(validCompletions)) Platform.save({ ...saved, completions: validCompletions });

const state = {
  screen: 'select', modal: '', stage: 0, difficulty: 'normal', codexPage: 0,
  completions: new Set(validCompletions),
  tutorialCompleted: saved.tutorialCompleted === true,
  growth: saved.growth && typeof saved.growth === 'object' ? saved.growth : {}, merit: Number(saved.merit) || 0, xp: Number(saved.xp) || 0, tier: 0,
  unlocked: new Set(BASE_UNLOCKS), buttons: [], logs: [], speed: 1, paused: false, backgroundPaused: false,
  wave: 0, phase: 'prep', cooldown: 12, groups: null, bossSpawned: false, hp: 10, energy: 0, score: 0, kills: 0,
  towers: [], backpack: [], enemies: [], projectiles: [], selectedUid: null, selectedTowerUid: null, selectedEnemy: null, nextUid: 1,
  summonMode: 'normal', summonOffers: [], summonRemaining: 0, summonSwap: 0, summonAttempts: 0, requiredId: 'bifang', freeSwapUsed: false,
  backpackPage: 0, adPending: false,
  runFielded: new Set(), runKills: {}, runEvolutions: {}, continued: false, doubled: false, resultReward: 0, finished: false, bossEscaped: false,
  growthSettled: false, growthAwardedKills: {}, victoryGrowthAwarded: false, resultBreakdown: null,
  tutorialMode: false, tutorialStep: -1, bondCooldowns: {}, selectedBondId: null, bondPulse: null,
};

STAGE_UNLOCKS.forEach((ids, stage) => {
  if ([...state.completions].some((key) => key.startsWith(`${stage}:`))) ids.forEach((id) => state.unlocked.add(id));
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const level = () => LEVELS[state.stage];
const difficulty = () => DIFFICULTIES[state.difficulty];
const beast = (id) => ROSTER.find((item) => item.id === id);
const skillFor = (id) => ACTIVE_SKILLS[id];
const manaStats = (id) => { const rarity = beast(id).rarity; return { maxMana:72 + rarity * 11, manaRegen:2.7 + rarity * .35 }; };
const routes = () => level().routes;
const routeLength = (points) => points.slice(1).reduce((sum, point, index) => sum + Math.hypot(point[0] - points[index][0], point[1] - points[index][1]), 0);

function pointAt(points, distance) {
  let remaining = distance;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]; const current = points[index];
    const length = Math.hypot(current[0] - previous[0], current[1] - previous[1]);
    if (remaining <= length) { const ratio = remaining / Math.max(1, length); return [previous[0] + (current[0] - previous[0]) * ratio, previous[1] + (current[1] - previous[1]) * ratio]; }
    remaining -= length;
  }
  return points[points.length - 1];
}

function segmentDistance(x, y, a, b) {
  const vx = b[0] - a[0]; const vy = b[1] - a[1];
  const ratio = clamp(((x - a[0]) * vx + (y - a[1]) * vy) / Math.max(1, vx * vx + vy * vy), 0, 1);
  return Math.hypot(x - a[0] - vx * ratio, y - a[1] - vy * ratio);
}

function saveProgress() {
  Platform.save({ completions: [...state.completions], growth: state.growth, merit: state.merit, xp: state.xp, tutorialCompleted: state.tutorialCompleted });
}

function log(message) { state.logs.unshift(message); state.logs = state.logs.slice(0, 2); }
function completionKey() { return `${state.stage}:${state.difficulty}`; }
function threeSpeedUnlocked() { return LEVELS.every((_, stage) => [...state.completions].some((key) => key.startsWith(`${stage}:`))); }
function populationUsed() { return state.towers.reduce((sum, tower) => sum + POPULATION[beast(tower.id).rarity], 0); }
function cultivationTierFor(kills) { return CULTIVATION_STAGES.reduce((tier, stage, index) => kills >= stage.kills ? index : tier, 0); }
function cultivation() { return CULTIVATION_STAGES[state.tier] || CULTIVATION_STAGES[0]; }
state.tier = cultivationTierFor(state.xp);
function growthFor(id) { const item = state.growth[id] || { xp: 0, appearances: 0, kills: 0 }; const levelValue = Math.min(20, 1 + Math.floor(Math.sqrt(item.xp / 25))); return { ...item, level: levelValue, power: 1 + (levelValue - 1) * .025, haste: 1 + (levelValue - 1) * .012, range: 1 + (levelValue - 1) * .01 }; }
function evolutionFor(id) { return (state.runEvolutions[id] || []).reduce((totals, pathId) => { const path = Core.EVOLUTION_PATHS.find((item) => item.id === pathId); if (path) Object.entries(path.bonus).forEach(([key, value]) => { totals[key] = (totals[key] || 0) + value; }); return totals; }, { power:0, cdr:0, manaCost:0, range:0, support:0 }); }
function ownedIds() { return new Set([...state.towers, ...state.backpack].map((unit) => unit.id)); }
function bondState(towers = state.towers) {
  const totals = { power:0, haste:0, range:0, cdr:0, sunder:0, enemySlow:0 };
  const active = BONDS.filter((bond) => {
    const members = new Set(towers.filter((tower) => bond.members.includes(tower.id)).map((tower) => tower.id));
    if (members.size < bond.need) return false;
    totals[bond.stat] += bond.bonus + Math.max(0, members.size - bond.need) * bond.stepBonus;
    return true;
  });
  totals.power = Math.min(1.2, totals.power); totals.haste = Math.min(.7, totals.haste); totals.range = Math.min(.45, totals.range); totals.cdr = Math.min(.6, totals.cdr); totals.sunder = Math.min(.45, totals.sunder); totals.enemySlow = Math.min(.45, totals.enemySlow);
  return { active, totals };
}
function activeBonds() { return bondState().active; }
function selectedBond() {
  const active = activeBonds();
  const selected = active.find((bond) => bond.id === state.selectedBondId);
  if (selected) return selected;
  state.selectedBondId = active[0]?.id || null;
  return active[0] || null;
}

function orderedBackpack() {
  const units = [...state.backpack]; const ids = new Set(units.map((unit) => unit.id)); const ordered = []; const used = new Set();
  BONDS.filter((bond) => bond.members.filter((id) => ids.has(id)).length >= 2).forEach((bond) => bond.members.forEach((id) => units.filter((unit) => unit.id === id && !used.has(unit.uid)).forEach((unit) => { used.add(unit.uid); ordered.push(unit); })));
  return ordered.concat(units.filter((unit) => !used.has(unit.uid)).sort((a,b) => beast(b.id).rarity - beast(a.id).rarity));
}

function randomFromWeights(weights) {
  let roll = Math.random() * weights.reduce((sum, pair) => sum + pair[1], 0);
  for (const pair of weights) { roll -= pair[1]; if (roll < 0) return pair[0]; }
  return weights[weights.length - 1][0];
}

function randomBeast(weights, excluded = new Set()) {
  const rarity = randomFromWeights(weights);
  const unlocked = ROSTER.filter((item) => state.unlocked.has(item.id) && !excluded.has(item.id));
  let pool = unlocked.filter((item) => item.rarity === rarity);
  if (!pool.length) pool = unlocked.sort((a, b) => Math.abs(a.rarity - rarity) - Math.abs(b.rarity - rarity)).filter((item, _, list) => Math.abs(item.rarity - rarity) === Math.abs(list[0].rarity - rarity));
  return pool[Math.floor(Math.random() * pool.length)];
}

function waveTemplate(waveIndex) {
  const cycleWave = waveIndex % WAVES.length;
  const groups = WAVES[cycleWave].map((group) => [...group]);
  const additions = {
    0: { 3: ['xingxing', 2, .95, 1.8, .84], 6: ['shanxiao', 1, 1.35, 2.4, .82], 11: ['shanxiao', 2, 1.1, 2.2, .86] },
    1: { 1: ['fei', 1, 1.15, 1.4, .8], 4: ['wangliang', 1, 1.2, 2.2, .82], 7: ['fei', 2, 1.1, 1.6, .8], 10: ['wangliang', 2, 1.05, 2, .84], 13: ['fei', 2, .95, 1.2, .86] },
    2: { 2: ['wangliang', 1, 1.2, 1.8, .84], 5: ['huali', 1, 1.25, 2.4, .82], 8: ['wangliang', 2, 1.1, 1.8, .84], 11: ['huali', 2, 1.05, 2, .84], 14: ['wangliang', 2, .95, 1.4, .86] },
    3: { 1: ['bashe', 1, 1.35, 1.5, .82], 4: ['fei', 2, 1.15, 1.2, .86], 7: ['bashe', 1, 1.25, 1.8, .86], 10: ['fei', 2, 1, 1.5, .88], 13: ['bashe', 2, 1.15, 1.2, .88] },
    4: { 2: ['wangliang', 2, 1.15, 1.5, .84], 5: ['huali', 1, 1.2, 2, .86], 8: ['wangliang', 2, 1.05, 1.2, .86], 11: ['huali', 2, 1, 1.6, .88], 14: ['wangliang', 2, .95, 1, .9] },
  };
  if (additions[state.stage]?.[cycleWave]) groups.push(additions[state.stage][cycleWave]);
  return groups;
}

function waveThreatText(groups) {
  return groups.map(([type, count, , , , role = 'normal']) => `${ENEMIES[type].name}${role === 'miniBoss' ? '首领' : ''}×${Math.max(1, Math.round(count * difficulty().count))}`).join('、');
}

function buildOffers() {
  const rule = Core.SUMMON_RULES[state.summonMode];
  const used = new Set(); const offers = [];
  while (offers.length < rule.choices) { const candidate = randomBeast(rule.weights, used); if (!candidate) break; offers.push(candidate); used.add(candidate.id); }
  state.summonAttempts += 1;
  const required = beast(state.requiredId);
  const requiredInPool = rule.weights.some((pair) => pair[0] === required.rarity);
  if (state.summonAttempts === 3 && requiredInPool && !ownedIds().has(state.requiredId) && !offers.some((item) => item.id === state.requiredId)) {
    offers[0] = beast(state.requiredId);
  }
  state.summonOffers = offers;
  state.summonSwap = 0;
}

function openSummon(mode, count) {
  if (state.modal || state.finished) return;
  if (state.tutorialMode && (state.tutorialStep !== 0 || mode !== 'normal' || count !== 1)) { log('教学第一步：请先进行一次普通单抽。'); return; }
  const rule = Core.SUMMON_RULES[mode];
  const cost = rule.cost * count * (count === 5 ? .8 : 1);
  if (state.backpack.length + count > 12) { log(`背包需要预留 ${count} 个空位。`); return; }
  if (state.energy < cost) { log(`灵蕴不足，需要 ${cost} 点。`); return; }
  state.energy -= cost; state.summonMode = mode; state.summonRemaining = count; buildOffers(); state.modal = 'summon';
}

function receive(candidate) {
  const existing = [...state.towers, ...state.backpack].find((unit) => unit.id === candidate.id);
  if (existing && existing.level >= MAX_UNIT_LEVEL) { state.energy += DUPLICATE_COMPENSATION; log(`${candidate.name}已满 Lv.${MAX_UNIT_LEVEL}，重复召灵返还 ${DUPLICATE_COMPENSATION} 灵蕴。`); }
  else if (existing) existing.level = Math.min(MAX_UNIT_LEVEL, existing.level + 1);
  else if (state.backpack.length < 12) { const mana = manaStats(candidate.id); state.backpack.push({ uid:`u${state.nextUid++}`, id:candidate.id, level:cultivation().summonLevel, cd:.1, skillCd:0, mana:mana.maxMana, maxMana:mana.maxMana, manaRegen:mana.manaRegen, growthKills:0 }); }
  state.summonRemaining -= 1;
  if (state.summonRemaining > 0) buildOffers();
  else { state.modal = ''; state.summonOffers = []; }
  if (state.tutorialMode && state.tutorialStep === 0 && !existing) { state.tutorialStep = 1; log('教学 2/3：点击下方妖灵卡，选中要上场的妖灵。'); }
  else if (!existing) log(`${candidate.name}已入背包。`);
  else if (existing.level < MAX_UNIT_LEVEL) log(`${candidate.name}同卡升级。`);
}

function swapOffers(free = false) {
  if (state.summonSwap >= 2) return;
  const cost = Core.SUMMON_RULES[state.summonMode].swaps[state.summonSwap];
  if (!free && state.energy < cost) { log(`置换需要 ${cost} 灵蕴。`); return; }
  if (!free) state.energy -= cost;
  const previousAttempts = state.summonAttempts; const previousSwaps = state.summonSwap;
  buildOffers(); state.summonAttempts = previousAttempts; state.summonSwap = previousSwaps + 1;
}

async function adFreeSwap() {
  if (state.freeSwapUsed || state.adPending || state.summonSwap >= 2) return;
  state.adPending = true;
  try {
    const granted = await Platform.showRewarded('freeSwap');
    if (!granted) { log('激励广告未完整播放，未获得免费置换。'); return; }
    if (state.freeSwapUsed || state.modal !== 'summon' || state.summonSwap >= 2) return;
    state.freeSwapUsed = true; swapOffers(true); log('本局免费置换已使用。');
  } finally { state.adPending = false; }
}

function startGame(tutorial = false) {
  state.screen = 'game'; state.modal = ''; state.wave = 0; state.phase = 'prep'; state.cooldown = 12; state.groups = null; state.bossSpawned = false; state.hp = 10;
  state.energy = Math.round(level().essence * difficulty().essence); state.score = 0; state.kills = 0; state.speed = 1; state.paused = false; state.backgroundPaused = false; state.finished = false;
  state.towers = []; state.backpack = []; state.enemies = []; state.projectiles = []; state.selectedUid = null; state.selectedTowerUid = null; state.selectedEnemy = null; state.nextUid = 1;
  state.summonOffers = []; state.summonRemaining = 0; state.summonSwap = 0; state.summonAttempts = 0; state.freeSwapUsed = false; state.continued = false; state.doubled = false; state.bondCooldowns = {}; state.selectedBondId = null; state.bondPulse = null;
  state.backpackPage = 0; state.adPending = false;
  state.runFielded = new Set(); state.runKills = {}; state.runEvolutions = {}; state.logs = []; state.bossEscaped = false;
  state.growthSettled = false; state.growthAwardedKills = {}; state.victoryGrowthAwarded = false; state.resultBreakdown = null;
  state.tutorialMode = tutorial; state.tutorialStep = tutorial ? 0 : -1;
  const pool = ROSTER.filter((item) => state.unlocked.has(item.id)); state.requiredId = pool[Math.floor(Math.random() * pool.length)].id;
  if (tutorial) { state.phase = 'tutorial'; state.cooldown = 0; log('教学 1/3：点击普通单抽，召出一只妖灵。'); }
  else log(`${Core.STAGE_MECHANICS[state.stage].name}：${Core.STAGE_MECHANICS[state.stage].copy}`);
}

function startWave() {
  const routeCount = routes().length;
  state.groups = waveTemplate(state.wave).map((group, index) => ({ type:group[0], count:Math.max(1, Math.round(group[1] * difficulty().count)), gap:group[2], timer:group[3], hpMul:group[4], role:group[5] || 'normal', spawned:0, route:index % routeCount }));
  state.phase = 'combat'; state.bossSpawned = false; log(`第 ${state.wave + 1} 波：${waveThreatText(waveTemplate(state.wave))}`);
}

function spawnEnemy(type, hpMul, routeIndex, distance = 0, role = 'normal') {
  const def = ENEMIES[type]; const route = routes()[routeIndex] || routes()[0]; const tide = state.stage === 2;
  const easy = state.difficulty === 'easy'; const hard = state.difficulty === 'hard';
  const maxHp = def.hp * level().hp * difficulty().hp * hpMul;
  const point = pointAt(route, distance);
  const heavenShield = state.stage === 4 && role !== 'normal' ? (role === 'stageBoss' ? 160 : 55) : 0;
  const enemy = { type, def, role, route, routeIndex, routeLength:routeLength(route), d:distance, x:point[0], y:point[1], hp:maxHp, maxHp, speed:def.speed * level().speed * difficulty().speed * (state.stage === 1 && ['fei','wangliang'].includes(type) ? 1.08 : 1), armor:Math.max(0,(def.armor || 0) + difficulty().armor), shield:(def.shield || 0) * (hard ? 1.35 : easy ? .7 : 1) + heavenShield, immuneMag:Boolean(def.immuneMag && !easy), immunePhy:Boolean(def.immunePhy || (hard && type === 'bashe')), resistMag:easy && def.immuneMag ? .45 : 0, slow:0, slowTimer:0, stunned:0, stealthTimer:def.stealth ? (hard ? 3.5 : easy ? 1 : 2) : 0, armorBreak:0, armorBreakTimer:0, burnTimer:0, burnDps:0, burnSource:null, revived:false, contributors:new Set(), healRate:hard ? .12 : easy ? .05 : .08, healInterval:hard ? 5 : easy ? 9 : 7, healTimer:tide ? 6 : def.heal ? (hard ? 5 : easy ? 9 : 7) : 0 };
  state.enemies.push(enemy);
  return enemy;
}

function updateSpawning(dt) {
  if (state.phase === 'prep' || state.phase === 'rest') { state.cooldown -= dt; if (state.cooldown <= 0) startWave(); return; }
  if (!state.groups) return;
  let done = true;
  state.groups.forEach((group) => { group.timer -= dt; if (group.spawned < group.count) { done = false; if (group.timer <= 0) { spawnEnemy(group.type, group.hpMul, (group.route + group.spawned) % routes().length, 0, group.role); group.spawned += 1; group.timer = group.gap; } } });
  if (!done || state.enemies.length) return;
  if (state.wave === 14 && !state.bossSpawned) { state.bossSpawned = true; spawnEnemy(level().boss, .94 + state.stage * .05, Math.floor(Math.random() * routes().length), 0, 'stageBoss'); log(`关卡首领「${ENEMIES[level().boss].name}」降临。`); return; }
  const completed = state.wave; state.energy += WAVE_REWARDS[completed]; state.wave += 1; state.groups = null;
  if (state.wave >= 15) { finishGame(true); return; }
  state.phase = 'rest'; state.cooldown = [4,9,14].includes(state.wave) ? 12 : 7;
  if ((completed + 1) % 5 === 0 && state.towers.length) openEvolution(completed);
  else log([4,9,14].includes(state.wave) ? `首领波预警：${waveThreatText(waveTemplate(state.wave))}` : `下一波：${waveThreatText(waveTemplate(state.wave))}`);
}

function supportBonus(tower) {
  const totals = { power:0, haste:0, range:0, cdr:0, manaRegen:0 };
  state.towers.forEach((source) => {
    if (source.uid === tower.uid) return;
    const { stat, value, radius } = supportSkillForSource(source);
    if (!stat || Math.hypot(source.x - tower.x, source.y - tower.y) > radius) return;
    totals[stat] += value;
  });
  totals.power = Math.min(.42, totals.power); totals.haste = Math.min(.38, totals.haste); totals.range = Math.min(.32, totals.range); totals.cdr = Math.min(.48, totals.cdr); totals.manaRegen = Math.min(1, totals.manaRegen);
  return totals;
}

function supportSkillForSource(source) {
  const [name = '无', stat = '', baseValue = 0, baseRadius = 0] = SUPPORT_SKILLS[source.id] || [];
  const evolution = evolutionFor(source.id);
  return { name, stat, value:baseValue * (1 + evolution.support), radius:baseRadius * (1 + evolution.support) };
}

function effectiveTowerRange(tower, bonds = bondState().totals, support = supportBonus(tower), evolution = evolutionFor(tower.id)) {
  return beast(tower.id).range * growthFor(tower.id).range * (1 + evolution.range) * (1 + bonds.range + support.range);
}

function hasCounter(def, counter) { return (def?.counters || []).includes(counter) || (counter === 'breakShield' && def?.breakShield === true); }
function canSeeEnemy(enemy, def) { return Boolean(enemy && enemy.hp > 0 && ((enemy.stealthTimer || 0) <= 0 || hasCounter(def, 'insight'))); }
function canDamageEnemy(enemy, def) {
  if (!canSeeEnemy(enemy, def)) return false;
  if (def.dmgType === 'phy' && enemy.immunePhy) return false;
  if (def.dmgType === 'mag' && enemy.immuneMag && !hasCounter(def, 'purge')) return false;
  return true;
}

function enemySealDamage(enemy) { return enemy.role === 'stageBoss' ? 9 : enemy.role === 'miniBoss' ? 5 : 1; }
function enemySpecialTrait(enemy) {
  if (enemy.def.heal) return '周期治疗';
  if (enemy.def.revive) return enemy.revived ? '已复活' : '濒死复活';
  if (enemy.def.split) return '击杀分裂';
  return '';
}
function enemyCounterHint(enemy) {
  if (enemy.immuneMag) return '法免：物/净';
  if (enemy.immunePhy) return '物免：法/真';
  if (enemy.stealthTimer > 0) return '隐身：需洞察';
  if (enemy.shield > 0) return '护盾：破盾更快';
  if (enemy.armor > 0) return `护甲 ${Math.round(enemy.armor)}`;
  return '无特殊防御';
}
function enemyPanelLines(enemy) {
  const special = enemySpecialTrait(enemy);
  return {
    title: `${enemy.def.name} · HP ${Math.ceil(Math.max(0, enemy.hp))}/${Math.ceil(enemy.maxHp)}`,
    counter: enemyCounterHint(enemy),
    threat: `${special || '普通敌军'} · 破封 ${enemySealDamage(enemy)}`,
  };
}
function enemyStatusText(enemy) {
  const status = [enemyCounterHint(enemy), enemy.armorBreakTimer > 0 ? '破甲中' : '', enemySpecialTrait(enemy)].filter(Boolean).join(' · ');
  return `${enemyPanelLines(enemy).title} · ${status} · 破封 ${enemySealDamage(enemy)}`;
}

function updateTowers(dt) {
  const bonds = bondState().totals;
  state.towers.forEach((tower) => {
    const def = beast(tower.id); const persistent = growthFor(tower.id); const passive = Core.passiveBonus(tower.id, tower.growthKills); const evolution = evolutionFor(tower.id); const support = supportBonus(tower);
    const mana = manaStats(tower.id); tower.maxMana ||= mana.maxMana; tower.manaRegen ||= mana.manaRegen; tower.mana = Math.min(tower.maxMana, tower.mana + tower.manaRegen * (1 + support.manaRegen) * dt); tower.skillCd = Math.max(0, tower.skillCd - dt * (1 + bonds.cdr + support.cdr));
    tower.cd -= dt * persistent.haste * (1 + passive.haste) * (1 + bonds.haste + support.haste);
    if (tower.cd > 0) return;
    const range = effectiveTowerRange(tower, bonds, support, evolution);
    const targets = state.enemies.filter((enemy) => canDamageEnemy(enemy, def) && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range).sort((a,b) => b.d - a.d);
    if (!targets.length) return;
    const power = def.dmg * RARITY_POWER[def.rarity] * persistent.power * difficulty().power * (1 + passive.power + evolution.power) * (1 + support.power + bonds.power) * (1 + (tower.level - 1) * .26) * (1 + cultivation().power);
    const target = targets[0];
    if (tower.hitTarget === target) tower.hitCount = (tower.hitCount || 0) + 1; else { tower.hitTarget = target; tower.hitCount = 1; }
    const special = def.stunEvery && tower.hitCount % def.stunEvery === 0 ? -1 : def.breakAt && tower.hitCount % def.breakAt === 0 ? -2 : 0;
    const skill = skillFor(tower.id);
    const extraTargets = tower.skillShots > 0 ? Math.max(1, (skill?.count || 2) - 1) : passive.targets;
    const extraDamage = tower.skillShots > 0 ? (skill?.mult || .7) : .65;
    [target, ...targets.slice(1, 1 + extraTargets)].forEach((item, index) => state.projectiles.push({ x:tower.x, y:tower.y, target:item, speed:390, damage:power * (index ? extraDamage : 1), source:tower, def, special:index ? 0 : special }));
    if (tower.skillShots > 0) tower.skillShots -= 1;
    tower.cd = def.interval;
  });
}

function damageEnemy(enemy, damage, source, def, skill = false, allowSplash = true, special = 0) {
  if (!canSeeEnemy(enemy, def) || (def.dmgType === 'phy' && enemy.immunePhy) || (def.dmgType === 'mag' && enemy.immuneMag && !hasCounter(def, 'purge'))) return;
  const impactDamage = damage;
  if (def.dmgType === 'mag' && enemy.resistMag) damage *= 1 - enemy.resistMag;
  if (def.dmgType !== 'true' && special === -2) { enemy.armorBreak = BASIC_ATTACK_ARMOR_BREAK; enemy.armorBreakTimer = BASIC_ATTACK_ARMOR_BREAK_DURATION; damage *= 1.2; }
  if (enemy.shield > 0) {
    const shieldMultiplier = hasCounter(def, 'breakShield') ? 1.5 : .3;
    const absorbed = Math.min(enemy.shield, damage * shieldMultiplier);
    enemy.shield = Math.max(0, enemy.shield - damage * shieldMultiplier);
    if (enemy.shield > 0) return;
    damage = Math.max(0, damage - absorbed / shieldMultiplier);
  }
  if (source?.uid) enemy.contributors.add(source.uid);
  source?.creditUids?.forEach((uid) => enemy.contributors.add(uid));
  const armor = Math.max(0, enemy.armor - (enemy.armorBreak || 0) - bondState().totals.sunder * 40);
  let amount = def.dmgType === 'true' ? damage : damage * Math.max(.35, 1 - armor / 100);
  if (hasCounter(def, 'execute') && enemy.hp / enemy.maxHp < .25) amount *= 1.6;
  enemy.hp -= amount;
  if (def.slow) { enemy.slow = Math.max(enemy.slow, def.slow); enemy.slowTimer = Math.max(enemy.slowTimer, def.slowDur || 2.5); }
  if (skill || special === -1) enemy.stunned = Math.max(enemy.stunned, 1.8);
  if (def.burn) { enemy.burnTimer = Math.max(enemy.burnTimer, 4); const burnDps = def.dmg * (def.burnDps || .22); if (burnDps >= enemy.burnDps) { enemy.burnDps = burnDps; enemy.burnSource = source; } }
  if (allowSplash && def.splash) state.enemies.filter((item) => item !== enemy && canDamageEnemy(item, def) && Math.hypot(item.x - enemy.x, item.y - enemy.y) <= def.splashRadius).forEach((item) => damageEnemy(item, impactDamage * .7, source, def, false, false));
  if (enemy.hp <= 0) killEnemy(enemy, source);
}

function killEnemy(enemy, killer) {
  if (enemy.def.revive && !enemy.revived) { enemy.revived = true; enemy.hp = enemy.maxHp * .35; enemy.shield = state.difficulty === 'hard' ? 180 : state.difficulty === 'easy' ? 70 : 120; return; }
  if (enemy.dead) return; enemy.dead = true;
  if (enemy.def.split && !enemy.split) { enemy.split = true; for (let index = 0; index < 2; index += 1) spawnEnemy('xingxing', .55, enemy.routeIndex, enemy.d); }
  enemy.contributors.forEach((uid) => { const tower = state.towers.find((item) => item.uid === uid); if (tower) tower.growthKills += 1; });
  if (killer) state.runKills[killer.id] = (state.runKills[killer.id] || 0) + 1;
  state.kills += enemy.def.reward; state.score += enemy.def.reward * 100; state.energy += enemy.def.reward * 2; state.xp += enemy.def.reward;
}

function updateProjectiles(dt) {
  state.projectiles = state.projectiles.filter((projectile) => { const target = projectile.target; if (!target || target.hp <= 0) return false; const dx = target.x - projectile.x; const dy = target.y - projectile.y; const distance = Math.hypot(dx,dy); const step = projectile.speed * dt; projectile.x += dx / Math.max(1,distance) * step; projectile.y += dy / Math.max(1,distance) * step; if (distance <= step + target.def.radius) { damageEnemy(target, projectile.damage, projectile.source, projectile.def, false, true, projectile.special || 0); if (projectile.def.chain) { let from = target; const visited = new Set([target]); for (let hop = 0; hop < projectile.def.chain; hop += 1) { const next = state.enemies.filter((item) => canDamageEnemy(item, projectile.def) && !visited.has(item) && Math.hypot(item.x - from.x, item.y - from.y) <= 130).sort((a,b) => Math.hypot(from.x - a.x, from.y - a.y) - Math.hypot(from.x - b.x, from.y - b.y))[0]; if (!next) break; visited.add(next); damageEnemy(next, projectile.damage * .65, projectile.source, projectile.def, false, false); from = next; } } return false; } return true; });
}

function updateEnemies(dt) {
  const bonds = bondState().totals;
  state.enemies.forEach((enemy) => {
    if (enemy.hp <= 0) return;
    enemy.slowTimer -= dt; if (enemy.slowTimer <= 0) enemy.slow = 0; enemy.stunned = Math.max(0, enemy.stunned - dt); enemy.stealthTimer = Math.max(0, enemy.stealthTimer - dt); enemy.armorBreakTimer = Math.max(0, (enemy.armorBreakTimer || 0) - dt); if (enemy.armorBreakTimer <= 0) enemy.armorBreak = 0; if (enemy.burnTimer > 0) { enemy.burnTimer -= dt; damageEnemy(enemy, enemy.burnDps * dt, enemy.burnSource, { dmgType:'true', counters:['insight'], burn:false }); }
    if (enemy.hp <= 0) return;
    if (enemy.healTimer > 0) { enemy.healTimer -= dt; if (enemy.healTimer <= 0) { enemy.healTimer = enemy.def.heal ? enemy.healInterval : 6; enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.maxHp * (enemy.def.heal ? enemy.healRate : .012)); } }
    if (enemy.stunned > 0) return;
    enemy.d += enemy.speed * (1 - enemy.slow) * (1 - bonds.enemySlow) * dt; const point = pointAt(enemy.route, enemy.d); enemy.x = point[0]; enemy.y = point[1];
    if (enemy.d >= enemy.routeLength) { enemy.hp = 0; state.hp -= enemy.role === 'stageBoss' ? 9 : enemy.role === 'miniBoss' ? 5 : 1; state.bossEscaped ||= enemy.role === 'stageBoss'; if (enemy.role === 'stageBoss') log(`${enemy.def.name}破封，终局首领未被击退。`); }
  });
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0 && !enemy.dead);
  if (state.hp <= 0 || state.bossEscaped) finishGame(false);
}

function validPlace(x, y) {
  if (x < 42 || x > 918 || y < 42 || y > 505) return false;
  if (routes().some((route) => route.some((point, index) => index && segmentDistance(x,y,route[index - 1],point) < 46))) return false;
  return !state.towers.some((tower) => Math.hypot(tower.x - x, tower.y - y) < 78);
}

function placeSelected(x, y) {
  const unit = state.backpack.find((item) => item.uid === state.selectedUid); if (!unit) return;
  if (state.towers.some((tower) => tower.id === unit.id)) { log('每局每种妖灵只能上场一次。'); return; }
  if (populationUsed() + POPULATION[beast(unit.id).rarity] > 18) { log('人口不足，当前上限为 18。'); return; }
  if (!validPlace(x,y)) { log('此处不能安置，请避开道路、裂口与其他妖灵。'); return; }
  const mana = manaStats(unit.id); unit.x = x; unit.y = y; unit.maxMana = mana.maxMana; unit.manaRegen = mana.manaRegen; unit.mana = mana.maxMana; unit.skillCd = 0; unit.growthKills = 0; state.towers.push(unit); state.backpack = state.backpack.filter((item) => item.uid !== unit.uid); state.runFielded.add(unit.id); state.selectedUid = null; state.selectedTowerUid = unit.uid;
  if (state.tutorialMode && state.tutorialStep === 2) { state.tutorialStep = 3; state.tutorialMode = false; state.tutorialCompleted = true; state.phase = 'prep'; state.cooldown = 3; saveProgress(); log('教学完成，3 秒后开始第一波。'); }
  else log(`${beast(unit.id).name}已入阵。`);
}

function selectBackpackUnit(uid) {
  if (!state.backpack.some((item) => item.uid === uid)) return;
  state.selectedUid = uid; state.selectedTowerUid = null; state.selectedEnemy = null;
  if (state.tutorialMode && state.tutorialStep === 1) { state.tutorialStep = 2; log('教学 3/3：已选中妖灵，点击道路旁的空地部署。'); }
}

function autoDeploy() {
  if (state.modal || state.phase === 'combat' || state.tutorialMode || !state.backpack.length) return;
  const candidates = [];
  for (let x = 100; x <= 860; x += 42) for (let y = 82; y <= 500; y += 42) if (validPlace(x, y)) candidates.push({ x, y });
  [...state.backpack].sort((a, b) => beast(b.id).rarity - beast(a.id).rarity).forEach((unit) => {
    const legalCandidates = candidates.filter((candidate) => validPlace(candidate.x, candidate.y));
    const coverage = routes().map((route) => state.towers.reduce((count, tower) => {
      const towerDistance = Math.min(...route.slice(1).map((point, index) => segmentDistance(tower.x, tower.y, route[index], point)));
          const towerRange = effectiveTowerRange(tower);
      return count + (towerDistance <= towerRange ? 1 : 0);
    }, 0));
    const routeDistancesFor = (candidate) => {
      return routes().map((route) => Math.min(...route.slice(1).map((point, index) => segmentDistance(candidate.x, candidate.y, route[index], point))));
    };
    const unitRange = beast(unit.id).range * growthFor(unit.id).range * (1 + evolutionFor(unit.id).range);
    const spot = legalCandidates.sort((a, b) => {
      const score = (candidate) => {
        const distances = routes().map((route) => Math.min(...route.slice(1).map((point, index) => segmentDistance(candidate.x, candidate.y, route[index], point))));
        const lane = distances.indexOf(Math.min(...distances));
        const weakestCoverage = Math.min(...coverage);
        const coverageGain = distances.reduce((count, distance, index) => count + (coverage[index] === 0 && distance <= unitRange ? 1 : 0), 0);
        const routeUncovered = coverage[lane] === 0 ? -720 : 0;
        const routeDeficit = coverage[lane] === weakestCoverage ? -280 : 0;
        const routeFit = Math.max(0, unitRange - distances[lane]) * .18;
        return -coverageGain * 1000 + routeUncovered + routeDeficit - Math.abs(Math.min(...distances) - 62) + routeFit;
      };
      return score(a) - score(b);
    })[0];
    if (!spot) return;
    state.selectedUid = unit.uid;
    const before = state.towers.length;
    placeSelected(spot.x, spot.y);
    if (state.towers.length === before) return;
  });
  state.selectedUid = null;
  const uncoveredRoutes = routes().map((route, index) => {
    const covered = state.towers.some((tower) => {
      const distance = Math.min(...route.slice(1).map((point, pointIndex) => segmentDistance(tower.x, tower.y, route[pointIndex], point)));
      const range = effectiveTowerRange(tower);
      return distance <= range;
    });
    return covered ? null : index + 1;
  }).filter(Boolean);
  log(`一键部阵完成，已部署 ${state.towers.length} 只妖灵。${uncoveredRoutes.length ? ` 第 ${uncoveredRoutes.join('、')} 路尚无火力覆盖，请手动补位。` : routes().length > 1 ? ' 双路均已有火力覆盖。' : ''}`);
}

function recallSelected() {
  const index = state.towers.findIndex((tower) => tower.uid === state.selectedTowerUid);
  if (index < 0) { log('请先点击场上的妖灵，再将其单独下场。'); return; }
  if (state.backpack.length >= 12) { log('背包已满，无法将这只妖灵下场。'); return; }
  const [tower] = state.towers.splice(index, 1);
  const { x, y, ...unit } = tower;
  state.backpack.push(unit);
  state.selectedTowerUid = null;
  state.selectedUid = unit.uid;
  log(`${beast(unit.id).name}已单独下场，收入背包。`);
}

function castSkill() {
  const tower = state.towers.find((item) => item.uid === state.selectedTowerUid); if (!tower) { log('先点击场上妖灵，再发动主动技能。'); return; }
  const def = beast(tower.id); const skill = skillFor(tower.id); const evolution = evolutionFor(tower.id); const support = supportBonus(tower); const bonds = bondState().totals; const cost = Math.round((skill?.mana || 50) * (1 - evolution.manaCost));
  if (tower.mana < cost || tower.skillCd > 0) { log(tower.skillCd > 0 ? `技能还需 ${tower.skillCd.toFixed(1)} 秒。` : `法力不足，需要 ${cost}。`); return; }
  const range = def.range * growthFor(tower.id).range * (1 + evolution.range) * (1 + bonds.range + support.range) * (skill?.rangeMul || 1.2); const skillDef = { ...def, splash:0, chain:0, slow:0, slowDur:0, stunEvery:0, breakAt:0, counters:[...new Set([...(def.counters || []), ...(skill?.type === 'armorBreak' ? ['breakShield'] : [])])] };
  const visible = state.enemies.filter((enemy) => canSeeEnemy(enemy, skillDef) && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range).sort((a,b) => b.d - a.d);
  const damageable = visible.filter((enemy) => canDamageEnemy(enemy, skillDef));
  const target = damageable[0] || visible[0];
  const passive = Core.passiveBonus(tower.id, tower.growthKills || 0);
  const power = def.dmg * RARITY_POWER[def.rarity] * growthFor(tower.id).power * difficulty().power * (3.2 + def.rarity * .18) * (1 + passive.power + evolution.power) * (1 + bonds.power + support.power) * (1 + (tower.level - 1) * .26) * (1 + cultivation().power);
  const applyStatus = (enemy) => {
    if (skill?.slow) { enemy.slow = Math.max(enemy.slow, skill.slow); enemy.slowTimer = Math.max(enemy.slowTimer, skill.duration); }
    if (skill?.armorBreak) { enemy.armorBreak = Math.max(enemy.armorBreak, skill.armorBreak); enemy.armorBreakTimer = Math.max(enemy.armorBreakTimer, skill.duration); }
  };
  if (!visible.length || (skill?.type === 'area' && !skill.slow && !damageable.length)) { log(`${skill?.name || '技能'}范围内没有可用敌军。`); return; }
  if (skill?.type === 'split') {
    if (!damageable.length) { log(`${skill.name}当前没有可伤害目标。`); return; }
    tower.skillShots = Math.max(tower.skillShots || 0, skill.shots);
  } else if (skill?.type === 'multishot') {
    if (!damageable.length) { log(`${skill.name}当前没有可伤害目标。`); return; }
    damageable.slice(0, skill.count).forEach((enemy) => state.projectiles.push({ x:tower.x, y:tower.y, target:enemy, speed:390, damage:power * skill.mult, source:tower, def:skillDef, special:0 }));
  } else if (skill?.type === 'targetStun') {
    if (!target) { log(`${skill.name}当前没有可选目标。`); return; }
    target.stunned = Math.max(target.stunned, skill.stun);
    damageEnemy(target, power * (skill.mult || 1), tower, skillDef, true, true);
  } else {
    if (!target && skill?.type !== 'slow') { log(`${skill?.name || '技能'}范围内没有敌军。`); return; }
    const center = skill?.type === 'area' ? target : tower;
    const targets = (skill?.type === 'slow' ? visible : visible).filter((enemy) => Math.hypot(enemy.x - center.x, enemy.y - center.y) <= (skill?.radius || range));
    if (!targets.length) { log(`${skill?.name || '技能'}范围内没有敌军。`); return; }
    targets.forEach((enemy) => { if (skill?.mult) damageEnemy(enemy, power * skill.mult, tower, skillDef, skill.type === 'areaStun', true); if (skill?.type === 'areaStun' && skill.stun) enemy.stunned = Math.max(enemy.stunned, skill.stun); applyStatus(enemy); });
  }
  tower.mana -= cost; tower.skillCd = (skill?.cooldown || 22) * (1 - evolution.cdr); log(`${def.name}发动「${skill?.name || '主动技能'}」。`);
}

function useBondSkill() {
  const bond = selectedBond();
  if (!bond || state.bondCooldowns[bond.id] > 0) return false;
  const members = bond.members.map((id) => state.towers.find((tower) => tower.id === id)).filter(Boolean);
  if (members.length < bond.need) return false;
  const living = state.enemies.filter((enemy) => enemy.hp > 0);
  if (bond.skill !== 'restore' && !living.length) { log(`${bond.ult}需要敌军进入战场后才能发动。`); return false; }
  const nearby = (radius) => living.filter((enemy) => members.some((member) => Math.hypot(member.x - enemy.x, member.y - enemy.y) <= radius));
  const radius = { tide:250, roar:235, fire:215 }[bond.skill];
  const targets = radius ? nearby(radius) : living;
  if (radius && !targets.length) { log(`${bond.ult}范围内没有敌军，技能未进入冷却。`); return false; }
  const memberScale = 1 + Math.max(0, members.length - bond.need) * .25;
  const source = { id:`bond:${bond.id}`, creditUids:members.map((member) => member.uid) };
  const trueDamage = { dmgType:'true', counters:['execute','breakShield','purge'], color:bond.color, burn:false };
  state.bondPulse = { members:members.map((member) => ({ x:member.x, y:member.y })), color:bond.color, radius:radius || (bond.skill === 'restore' ? 130 : 250), ttl:.65, maxTtl:.65 };
  if (bond.skill === 'tide') {
    targets.forEach((enemy) => { enemy.slow = Math.max(enemy.slow, .6); enemy.slowTimer = Math.max(enemy.slowTimer, 3.2); });
    log(`${bond.ult}发动：范围内敌军减速 60%，持续 3.2 秒。`);
  } else if (bond.skill === 'roar') {
    targets.forEach((enemy) => { enemy.stunned = Math.max(enemy.stunned || 0, 1.5); enemy.armorBreak = Math.max(enemy.armorBreak || 0, 8); enemy.armorBreakTimer = Math.max(enemy.armorBreakTimer || 0, 6); });
    log(`${bond.ult}发动：范围内敌军眩晕 1.5 秒并破甲 8，持续 6 秒。`);
  } else if (bond.skill === 'fire') {
    const amount = members.reduce((sum, member) => sum + beast(member.id).dmg, 0) / members.length * 3.4 * memberScale * (1 + bondState().totals.power);
    const burnDamage = { ...trueDamage, dmg:amount, burn:true, burnDps:.22 };
    targets.forEach((enemy) => damageEnemy(enemy, amount, source, burnDamage));
    log(`${bond.ult}发动：范围内敌军承受真伤并被灼烧。`);
  } else if (bond.skill === 'storm') {
    const amount = 95 * bond.ultMul * memberScale * (1 + bondState().totals.power);
    living.forEach((enemy) => { damageEnemy(enemy, amount, source, trueDamage); enemy.stunned = Math.max(enemy.stunned || 0, .8); });
    log(`${bond.ult}发动：全场雷击并短暂眩晕敌军。`);
  } else if (bond.skill === 'restore') {
    state.towers.forEach((tower) => { tower.mana = Math.min(tower.maxMana, tower.mana + tower.maxMana * .45); tower.skillCd = Math.max(0, tower.skillCd - 8); });
    Object.keys(state.bondCooldowns).forEach((id) => { if (id !== bond.id) state.bondCooldowns[id] = Math.max(0, state.bondCooldowns[id] - 6); });
    log(`${bond.ult}发动：全军回复 45% 法力，妖灵技能恢复 8 秒。`);
  } else {
    const amount = 120 * bond.ultMul * memberScale * (1 + bondState().totals.power);
    living.forEach((enemy) => damageEnemy(enemy, amount, source, trueDamage));
    log(`${bond.ult}发动：全场真伤。`);
  }
  state.bondCooldowns[bond.id] = bond.cooldown * Math.max(.35, 1 - bondState().totals.cdr);
  return true;
}

function openEvolution(completedWave) {
  state.evolutionChoices = Core.evolutionChoices(state.towers.map((tower) => tower.id), Date.now() + completedWave * 97); state.modal = 'evolution';
}

function chooseEvolution(index) {
  const choice = state.evolutionChoices[index]; if (!choice) return; state.runEvolutions[choice.beastId] ||= []; state.runEvolutions[choice.beastId].push(choice.id); state.modal = ''; log(`${beast(choice.beastId).name}进化「${choice.name}」。`);
}

function finishGame(won) {
  if (state.finished) return; state.finished = true; state.screen = 'result'; state.resultWon = won; state.resultReward = won ? 40 + state.stage * 12 + (state.difficulty === 'hard' ? 24 : state.difficulty === 'normal' ? 12 : 0) : 0; state.merit += state.resultReward;
  state.runFielded.forEach((id) => {
    const old = growthFor(id); const totalKills = state.runKills[id] || 0; const previousKills = state.growthAwardedKills[id] || 0; const newKills = Math.max(0, totalKills - previousKills);
    const baseXp = state.growthSettled ? 0 : 12; const victoryXp = won && !state.victoryGrowthAwarded ? 8 : 0;
    state.growth[id] = { xp:old.xp + baseXp + newKills * 5 + victoryXp, appearances:old.appearances + (state.growthSettled ? 0 : 1), kills:old.kills + newKills };
    state.growthAwardedKills[id] = totalKills;
  });
  state.growthSettled = true; if (won) state.victoryGrowthAwarded = true; state.tier = cultivationTierFor(state.xp);
  if (won) { state.completions.add(completionKey()); STAGE_UNLOCKS[state.stage].forEach((id) => state.unlocked.add(id)); }
  state.resultBreakdown = { combat: state.score, reward: state.resultReward, kills: state.kills, hp: Math.max(0, state.hp), energy: Math.floor(state.energy), bonds: activeBonds().length };
  saveProgress();
}

async function continueWithAd() {
  if (state.continued || state.resultWon || state.adPending) return; state.adPending = true;
  try { const granted = await Platform.showRewarded('continue'); if (!granted || state.continued || state.resultWon || state.screen !== 'result') return;
    state.continued = true; state.finished = false; state.bossEscaped = false; state.screen = 'game'; state.hp = 5; state.enemies = []; state.projectiles = []; state.groups = null; state.phase = 'rest'; state.cooldown = 7; log('封印续接成功，恢复 5 点完整度。');
  } finally { state.adPending = false; }
}

async function doubleReward() {
  if (state.doubled || !state.resultWon || !state.resultReward || state.adPending) return; state.adPending = true;
  try { const granted = await Platform.showRewarded('doubleReward'); if (!granted || state.doubled || !state.resultWon || state.screen !== 'result') return;
    state.doubled = true; state.merit += state.resultReward; saveProgress();
  } finally { state.adPending = false; }
}

function nextWave() { if ((state.phase === 'prep' || state.phase === 'rest') && !state.modal) { const reward = Math.max(1, Math.floor(state.cooldown * .35)); state.energy += reward; state.cooldown = 0; log(`提前开波，获得 ${reward} 灵蕴。`); } }

function togglePause() {
  if (state.screen !== 'game') return;
  if (state.paused) {
    state.paused = false;
    if (state.backgroundPaused) log('已回到战场，继续守关。');
    state.backgroundPaused = false;
    return;
  }
  state.paused = true;
}

function pauseForBackground() {
  if (state.screen !== 'game' || state.paused) return;
  state.paused = true;
  state.backgroundPaused = true;
  log('小游戏已切到后台，战局自动暂停；回到游戏后点击继续。');
}

function resumeForeground() {
  last = Date.now();
  if (state.screen === 'game' && state.backgroundPaused) log('已回到前台，战局仍暂停；点击继续守关。');
}

function update(dt) {
  if (state.screen !== 'game' || state.paused || state.modal || state.finished) return;
  const scaled = dt * state.speed; Object.keys(state.bondCooldowns).forEach((id) => { state.bondCooldowns[id] = Math.max(0, state.bondCooldowns[id] - scaled); }); if(state.bondPulse){state.bondPulse.ttl=Math.max(0,state.bondPulse.ttl-scaled);if(!state.bondPulse.ttl)state.bondPulse=null;} updateSpawning(scaled); updateTowers(scaled); updateProjectiles(scaled); updateEnemies(scaled); if (state.selectedEnemy && (!state.enemies.includes(state.selectedEnemy) || state.selectedEnemy.hp <= 0)) state.selectedEnemy = null;
}

function panel(x,y,w,h,fill='#ead9aa',stroke='#9a7440') { ctx.fillStyle=fill; ctx.fillRect(x,y,w,h); ctx.strokeStyle=stroke; ctx.lineWidth=2; ctx.strokeRect(x,y,w,h); }
function text(value,x,y,size=18,color='#2d2118',align='left',weight='normal') { ctx.fillStyle=color; ctx.font=`${weight} ${Math.max(12,size)}px sans-serif`; ctx.textAlign=align; ctx.textBaseline='middle'; ctx.fillText(String(value),x,y); }
function button(id,label,x,y,w,h,style='dark',disabled=false) { const colors=style==='red'?['#a82f27','#f4e4b5']:style==='jade'?['#386b60','#eef0d2']:style==='gold'?['#8b6025','#f4dfa6']:['#40372b','#f4e7c5']; panel(x,y,w,h,disabled?'#756e60':colors[0],disabled?'#8c8372':'#b58a47'); text(label,x+w/2,y+h/2,16,colors[1],'center','bold'); state.buttons.push({id,x,y,w,h,disabled}); }
function drawPortrait(item,x,y,size) { if (!beastAtlas.loaded) return; const cw=beastAtlas.width/6; const ch=beastAtlas.height/5; ctx.drawImage(beastAtlas,(item.portraitIndex%6)*cw,Math.floor(item.portraitIndex/6)*ch,cw,ch,x,y,size,size); }

function drawSelect() {
  const bg=backgrounds[4]; if(bg.loaded) ctx.drawImage(bg,0,0,VIEW_W,VIEW_H); ctx.fillStyle='rgba(232,213,164,.88)'; ctx.fillRect(0,0,VIEW_W,VIEW_H);
  text('山海异兽志',640,65,48,'#a52f27','center','bold'); text(`功勋 ${state.merit} · 已解锁 ${state.unlocked.size}/27`,640,105,15,'#694d2e','center');
  LEVELS.forEach((item,index)=>{const x=45+index*243; panel(x,145,220,290,index===state.stage?'#f1dca6':'#d9c18e',index===state.stage?'#a72e26':'#98713e'); const imageItem=backgrounds[index]; if(imageItem.loaded) ctx.drawImage(imageItem,x+10,155,200,118); text(`0${index+1} · ${item.name}`,x+110,294,21,'#33251b','center','bold'); text(item.intro,x+110,329,11,'#6b5238','center'); text(Core.STAGE_MECHANICS[index].name,x+110,370,14,index===state.stage?'#a52f27':'#5b4631','center','bold'); state.buttons.push({id:`stage:${index}`,x,y:145,w:220,h:290});});
  ['easy','normal','hard'].forEach((key,index)=>button(`difficulty:${key}`,DIFFICULTIES[key].name,420+index*150,463,140,48,state.difficulty===key?'red':'dark'));
  button('start','开始守关',495,535,290,65,'red'); button('codex','山海经图谱',805,535,180,65,'gold'); button('tutorial',state.tutorialCompleted?'重看教学':'新手演示',1005,535,180,65,'jade');
  text('标准模式 · 15波 · 约10分钟 · 第5/10波小首领 · 第15波关卡首领',640,640,14,'#493925','center');
}

function drawBattlefield() {
  const ox=150, oy=70, w=960, h=540; const bg=backgrounds[state.stage]; if(bg.loaded) ctx.drawImage(bg,ox,oy,w,h); else {ctx.fillStyle='#273634';ctx.fillRect(ox,oy,w,h);} ctx.fillStyle='rgba(24,27,22,.12)';ctx.fillRect(ox,oy,w,h);
  ctx.save();ctx.translate(ox,oy); routes().forEach((route)=>{ctx.beginPath();route.forEach((point,index)=>index?ctx.lineTo(point[0],point[1]):ctx.moveTo(point[0],point[1]));ctx.strokeStyle='#30271d';ctx.lineWidth=76;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.strokeStyle='#c3a46d';ctx.lineWidth=62;ctx.stroke();ctx.strokeStyle='rgba(250,229,177,.48)';ctx.lineWidth=3;ctx.setLineDash([9,12]);ctx.stroke();ctx.setLineDash([]);});
  routes().forEach((route)=>{const start=route[0];const end=route[route.length-1];ctx.strokeStyle='#d05743';ctx.lineWidth=3;ctx.beginPath();ctx.arc(start[0],start[1],25,0,Math.PI*2);ctx.stroke();text('裂',start[0],start[1],13,'#d05743','center','bold');ctx.strokeStyle='#dfb658';ctx.beginPath();ctx.arc(end[0],end[1],32,0,Math.PI*2);ctx.stroke();text('封',end[0],end[1],13,'#f0d078','center','bold');});
  state.towers.forEach((tower)=>{const def=beast(tower.id);drawPortrait(def,tower.x-30,tower.y-30,60);ctx.strokeStyle=RARITY_COLORS[def.rarity];ctx.lineWidth=3;ctx.beginPath();ctx.arc(tower.x,tower.y,31,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#2a2520';ctx.fillRect(tower.x-28,tower.y+34,56,6);ctx.fillStyle='#6fa7c7';ctx.fillRect(tower.x-28,tower.y+34,56*clamp(tower.mana/Math.max(1,tower.maxMana||manaStats(tower.id).maxMana),0,1),6); if(tower.uid===state.selectedTowerUid){const range=effectiveTowerRange(tower);const support=supportSkillForSource(tower);ctx.strokeStyle='#f1cf68';ctx.lineWidth=2;ctx.beginPath();ctx.arc(tower.x,tower.y,range,0,Math.PI*2);ctx.stroke();if(support.value){ctx.strokeStyle='#6bc3ba';ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.beginPath();ctx.arc(tower.x,tower.y,support.radius,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}}});
  if(state.bondPulse){const pulse=state.bondPulse;const phase=1-pulse.ttl/pulse.maxTtl;ctx.save();ctx.globalAlpha=Math.max(.18,pulse.ttl/pulse.maxTtl);ctx.strokeStyle=pulse.color;ctx.lineWidth=3;ctx.setLineDash([10,6]);pulse.members.forEach((member)=>{ctx.beginPath();ctx.arc(member.x,member.y,34+pulse.radius*phase,0,Math.PI*2);ctx.stroke();});ctx.setLineDash([]);ctx.restore();}
  state.enemies.forEach((enemy)=>{const r=enemy.def.radius*1.55;if(enemyAtlas.loaded){const cw=enemyAtlas.width/5,ch=enemyAtlas.height/2;ctx.drawImage(enemyAtlas,(enemy.def.sprite%5)*cw,Math.floor(enemy.def.sprite/5)*ch,cw,ch,enemy.x-r,enemy.y-r,r*2,r*2);}else{ctx.fillStyle='#a46f5c';ctx.beginPath();ctx.arc(enemy.x,enemy.y,r,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#302821';ctx.fillRect(enemy.x-r,enemy.y-r-8,r*2,5);ctx.fillStyle='#67b18e';ctx.fillRect(enemy.x-r,enemy.y-r-8,r*2*clamp(enemy.hp/enemy.maxHp,0,1),5);if(enemy.shield>0){ctx.strokeStyle='#8dd4d2';ctx.lineWidth=2;ctx.beginPath();ctx.arc(enemy.x,enemy.y,r+4,0,Math.PI*2);ctx.stroke();}if(enemy===state.selectedEnemy){ctx.strokeStyle='#f1cf68';ctx.lineWidth=3;ctx.setLineDash([6,4]);ctx.beginPath();ctx.arc(enemy.x,enemy.y,r+9,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}});
  state.projectiles.forEach((item)=>{ctx.fillStyle=item.def.color;ctx.beginPath();ctx.arc(item.x,item.y,5,0,Math.PI*2);ctx.fill();}); ctx.restore();
}

function drawGame() {
  ctx.fillStyle='#17120e';ctx.fillRect(0,0,VIEW_W,VIEW_H);panel(0,0,VIEW_W,58,'#e6d09a','#8b693c');text(`封印 ${Math.max(0,state.hp)}/10`,24,29,19,'#9c2f28','left','bold');text(`${level().name} · ${difficulty().name} · 第${state.wave+1}/15波`,640,29,21,'#33251b','center','bold');text(`灵蕴 ${Math.floor(state.energy)}   人口 ${populationUsed()}/18   分数 ${state.score}`,1250,29,16,'#3b2b1d','right','bold');
  drawBattlefield();
  const bond=selectedBond();const bondCooldown=bond?state.bondCooldowns[bond.id]||0:0;
  button('pause',state.paused?'继续':'暂停',1125,78,135,48);button('speed',`${state.speed}倍速`,1125,134,135,48);button('next','下一波',1125,190,135,48,'gold',state.phase==='combat');button('skill','主动技能',1125,246,135,58,'jade',!state.selectedTowerUid);button('bond-skill',bond?(bondCooldown>0?`${bond.ult} ${Math.ceil(bondCooldown)}s`:`羁绊·${bond.ult}`):'羁绊未就绪',1125,312,135,48,'gold',!bond||bondCooldown>0);button('bonds',`选择羁绊 ${activeBonds().length}`,1125,366,135,42,'dark');
  const selectedTower=state.towers.find((tower)=>tower.uid===state.selectedTowerUid);const selectedEnemy=state.selectedEnemy;const selectedEnemyInfo=selectedEnemy?enemyPanelLines(selectedEnemy):null;const selectedSupport=selectedTower?supportSkillForSource(selectedTower):null;const receivedSupport=selectedTower?supportBonus(selectedTower):null;const supportLabels={power:'攻击',haste:'攻速',range:'射程',cdr:'冷却恢复',manaRegen:'回灵'};const receivedEntries=receivedSupport?Object.entries(receivedSupport).filter(([,value])=>value>0):[];const receivedText=receivedEntries.length?`受益 ${receivedEntries.length} 项 · ${supportLabels[receivedEntries[0][0]]}+${Math.round(receivedEntries[0][1]*100)}%`:'未受友军增益';
  panel(1125,418,135,82,'#332b22','#a67b3e');text(selectedEnemyInfo?selectedEnemyInfo.title:selectedTower?beast(selectedTower.id).name:`天命：${beast(state.requiredId).name}`,1192,438,selectedEnemyInfo?10:11,'#f0d49a','center','bold');text(selectedEnemyInfo?selectedEnemyInfo.counter:selectedTower?`辅助：${supportLabels[selectedSupport.stat]} +${Math.round(selectedSupport.value*100)}%`:`背包 ${state.backpack.length}/12`,1192,458,10,'#e8dcc0','center');text(selectedEnemyInfo?selectedEnemyInfo.threat:selectedTower?`生效半径 ${Math.round(selectedSupport.radius)}`:state.phase==='combat'?`余敌 ${state.enemies.length}`:`等待 ${Math.ceil(state.cooldown)}s`,1192,478,10,'#d9b85f','center','bold');text(selectedEnemy?'点击空处取消选择':selectedTower?receivedText:state.logs[0]||'',1192,495,9,selectedEnemy?'#f0d49a':'#dfcfad','center');
  button('recall', '选中下场', 1125, 510, 135, 42, 'dark', !state.selectedTowerUid || state.backpack.length >= 12); button('auto', '一键部阵', 1125, 558, 135, 42, 'gold', !state.backpack.length || state.phase === 'combat');
  const dockY=620; const tutorialSingle = state.tutorialMode && state.tutorialStep === 0; button('summon:normal:1','普通单抽 20',150,dockY,180,55,'red',state.tutorialMode&&!tutorialSingle);button('summon:normal:5','普通五连 80',338,dockY,180,55,'red',state.tutorialMode);button('summon:advanced:1','高级单抽 50',526,dockY,180,55,'jade',state.tutorialMode);button('summon:advanced:5','高级五连 200',714,dockY,190,55,'jade',state.tutorialMode);
  panel(912,dockY,198,55,'#dbc28d','#a57b40'); const ordered=orderedBackpack(); const pageCount=Math.max(1,Math.ceil(ordered.length/4)); state.backpackPage=clamp(state.backpackPage,0,pageCount-1); const visible=ordered.slice(state.backpackPage*4,state.backpackPage*4+4); button('backpack-prev','‹',914,dockY+8,18,38,'dark',state.backpackPage===0); visible.forEach((unit,index)=>{const item=beast(unit.id);drawPortrait(item,935+index*39,dockY+8,38);if(unit.uid===state.selectedUid){ctx.strokeStyle='#b62f27';ctx.lineWidth=3;ctx.strokeRect(933+index*39,dockY+6,42,42);}state.buttons.push({id:`unit:${unit.uid}`,x:933+index*39,y:dockY+6,w:42,h:42});});button('backpack-next','›',1090,dockY+8,18,38,'dark',state.backpackPage>=pageCount-1);
  state.buttons.push({id:'battlefield',x:150,y:70,w:960,h:540});
}

function drawModalBackdrop() { ctx.fillStyle='rgba(9,8,6,.72)';ctx.fillRect(0,0,VIEW_W,VIEW_H);state.buttons.push({id:'modal-block',x:0,y:0,w:VIEW_W,h:VIEW_H});panel(240,95,800,530,'#ead39b','#a4763d'); }
function drawSummonModal() {
  drawModalBackdrop(); const rule=Core.SUMMON_RULES[state.summonMode]; text(`${state.summonMode==='advanced'?'高级三选一':'普通二选一'} · ${state.summonRemaining>1?`五连剩余 ${state.summonRemaining} 组`:'选择妖灵'}`,640,135,27,'#9d3028','center','bold');
  const cardW=state.summonMode==='advanced'?220:260;const gap=18;const total=state.summonOffers.length*cardW+(state.summonOffers.length-1)*gap;const start=(VIEW_W-total)/2;
  state.summonOffers.forEach((item,index)=>{const x=start+index*(cardW+gap);panel(x,175,cardW,310,'#f1dfad',RARITY_COLORS[item.rarity]);drawPortrait(item,x+(cardW-130)/2,188,130);text(Core.RARITIES[item.rarity],x+cardW/2,329,15,RARITY_COLORS[item.rarity],'center','bold');text(item.name,x+cardW/2,357,24,'#312319','center','bold');const profile=Core.describeBeast(item,item,{type:item.slow?'slow':item.splash?'area':'multishot'},BONDS,ownedIds());text(`${profile.damageType} · ${profile.output}伤害 · ${profile.control}`,x+cardW/2,391,11,'#604a33','center');text(`${profile.growth} · 羁绊潜力${profile.bondGrade}`,x+cardW/2,415,11,'#604a33','center');text(profile.growthText.slice(0,22),x+cardW/2,439,9,'#78583b','center');button(`offer:${index}`,'选择',x+32,461,cardW-64,38,'red');});
  const cost=rule.swaps[state.summonSwap];button('swap',cost==null?'置换已用完':`置换候选 ${cost}`,400,520,210,46,'gold',cost==null||state.energy<cost);button('ad-swap',state.adPending?'广告加载中':state.freeSwapUsed?'免费置换已用':'广告免费置换',630,520,250,46,'jade',state.adPending||state.freeSwapUsed||state.summonSwap>=2);text(`固定概率 · 每组最多置换2次 · 当前 ${state.summonSwap}/2`,640,592,11,'#694e31','center');
}

function drawEvolutionModal() { drawModalBackdrop();text('妖灵进化 · 本局生效',640,142,28,'#9c3028','center','bold');state.evolutionChoices.forEach((choice,index)=>{const item=beast(choice.beastId);const x=305+index*230;panel(x,190,210,260,'#f1dfad',RARITY_COLORS[item.rarity]);drawPortrait(item,x+55,205,100);text(item.name,x+105,324,15,'#5d4630','center');text(choice.name,x+105,354,20,'#9d3028','center','bold');text(choice.copy,x+105,390,10,'#5f4933','center');button(`evolution:${index}`,'选择进化',x+28,418,154,38,'red');}); }

function drawCodexModal() { drawModalBackdrop();text('山海经图谱',640,132,30,'#9c3028','center','bold');const entries=ROSTER.slice(state.codexPage*9,state.codexPage*9+9);entries.forEach((item,index)=>{const col=index%3,row=Math.floor(index/3),x=290+col*235,y=170+row*125;panel(x,y,215,108,'#f1dfad',state.unlocked.has(item.id)?RARITY_COLORS[item.rarity]:'#716b5e');drawPortrait(item,x+8,y+8,88);text(state.unlocked.has(item.id)?item.name:'未解锁',x+112,y+28,17,'#36291d','left','bold');text(`${Core.RARITIES[item.rarity]} · ${item.dmgType==='mag'?'法术':item.dmgType==='true'?'真实':'物理'}`,x+112,y+54,10,'#604a34');text(`攻击${item.dmg}  攻速${(1/item.interval).toFixed(1)}`,x+112,y+76,9,'#604a34');});button('codex-prev','上一卷',390,570,130,42,'dark',state.codexPage===0);button('codex-next','下一卷',535,570,130,42,'dark',state.codexPage>=2);button('close','关闭',680,570,130,42,'red'); }

function bondEffectText(bond,count){const value=bond.bonus+Math.max(0,count-bond.need)*bond.stepBonus;if(bond.stat==='cdr')return `冷却恢复 +${Math.round(value*100)}%`;if(bond.stat==='sunder')return `无视护甲 ${Math.round(value*40)} 点`;if(bond.stat==='enemySlow')return `敌军移速 -${Math.round(value*100)}%`;const labels={power:'攻击',haste:'攻速',range:'射程'};return `${labels[bond.stat]} +${Math.round(value*100)}%`;}
function bondSkillText(bond){return {tide:'圈内减速',roar:'眩晕破甲',fire:'真伤灼烧',storm:'全场雷击',restore:'全军回灵'}[bond.skill]||'全场真伤';}
function drawBondsModal() { drawModalBackdrop();text('羁绊谱 · 选择已触发联动技',640,125,28,'#9c3028','center','bold');BONDS.forEach((bond,index)=>{const ids=new Set(state.towers.map((tower)=>tower.id));const count=bond.members.filter((id)=>ids.has(id)).length;const x=255+(index%3)*260,y=148+Math.floor(index/3)*82;const active=count>=bond.need;const selected=state.selectedBondId===bond.id;const cooldown=state.bondCooldowns[bond.id]||0;const status=cooldown>0?`CD ${Math.ceil(cooldown)}s`:'就绪';panel(x,y,250,66,active?'#d8c489':'#c7b589',selected?'#d1372f':active?'#a43229':'#8d744f');text(`${bond.name} · ${active?bond.ult:'未触发'}`,x+12,y+19,14,'#33251b','left','bold');text(`${count}/${bond.need} · ${active?`${bondSkillText(bond)} · ${status}`:bondEffectText(bond,bond.need)}`,x+12,y+43,9,active?'#9c3028':'#6e5a41');if(active)state.buttons.push({id:`bond:${bond.id}`,x,y,w:250,h:66});});button('close','关闭',565,568,150,42,'red'); }

function drawResult() { const bg=backgrounds[state.stage];const result=state.resultBreakdown||{combat:state.score,reward:state.resultReward,kills:state.kills,hp:Math.max(0,state.hp),energy:Math.floor(state.energy),bonds:activeBonds().length};if(bg.loaded)ctx.drawImage(bg,0,0,VIEW_W,VIEW_H);ctx.fillStyle='rgba(225,204,154,.9)';ctx.fillRect(0,0,VIEW_W,VIEW_H);panel(300,90,680,540,'#f0deb0','#956d3b');text(state.resultWon?'封印守住了':'封印被突破',640,150,38,state.resultWon?'#3c756b':'#a63028','center','bold');text(`${level().name} · ${difficulty().name} · 第 ${Math.min(15,state.wave+1)} 波`,640,205,18,'#59432e','center');text(`总评分 ${result.combat + result.reward}`,640,260,42,'#a42f27','center','bold');text(`战斗得分 ${result.combat} · 击破 ${result.kills} · 通关奖励 ${result.reward}`,640,315,15,'#4e3b2a','center');text(`剩余封印 ${result.hp}/10 · 羁绊 ${result.bonds} · 剩余灵蕴 ${result.energy}`,640,350,14,'#6a5034','center');text(`${state.bossEscaped?'终局首领已破封 · ':''}永久功勋 ${state.merit} · 妖灵成长经验已结算`,640,382,13,'#6a5034','center');button('replay','再守一次',390,425,210,56,'red');button('select','返回关卡',620,425,210,56,'dark');if(!state.resultWon&&!state.continued)button('ad-continue','广告续关一次',390,500,210,50,'jade');if(state.resultWon&&!state.doubled)button('ad-double','广告奖励加倍',620,500,210,50,'gold'); }

function draw() {
  state.buttons=[];ctx.clearRect(-offsetX/scale,-offsetY/scale,info.windowWidth/scale,info.windowHeight/scale);ctx.fillStyle='#0e0b09';ctx.fillRect(0,0,VIEW_W,VIEW_H);
  if(state.screen==='select')drawSelect();else if(state.screen==='game')drawGame();else drawResult();
  if(state.modal==='summon')drawSummonModal();else if(state.modal==='evolution')drawEvolutionModal();else if(state.modal==='codex')drawCodexModal();else if(state.modal==='bonds')drawBondsModal();
  if (portraitMode) { ctx.fillStyle='rgba(17,13,10,.94)'; ctx.fillRect(0,0,VIEW_W,VIEW_H); text('请旋转设备至横屏后继续',640,330,28,'#f0d49a','center','bold'); text('山海战场需要更宽的视野',640,370,15,'#d6c09a','center'); }
}

function hit(x,y) { if (portraitMode) return null; const buttons=[...state.buttons].reverse().filter((item)=>!item.disabled); return buttons.find((item)=>x>=item.x&&x<=item.x+item.w&&y>=item.y&&y<=item.y+item.h)||buttons.find((item)=>x>=item.x-14&&x<=item.x+item.w+14&&y>=item.y-14&&y<=item.y+item.h+14); }
function handleButton(id,x,y) {
  if(id.startsWith('stage:')){state.stage=Number(id.split(':')[1]);return;} if(id.startsWith('difficulty:')){state.difficulty=id.split(':')[1];return;} if(id==='start'){startGame();return;} if(id==='tutorial'){state.stage=0;state.difficulty='easy';startGame(true);return;} if(id==='codex'){state.modal='codex';state.codexPage=0;return;}
  if(id.startsWith('summon:')){const [,mode,count]=id.split(':');openSummon(mode,Number(count));return;} if(id.startsWith('offer:')){receive(state.summonOffers[Number(id.split(':')[1])]);return;} if(id==='swap'){swapOffers();return;} if(id==='ad-swap'){adFreeSwap();return;}
  if(id.startsWith('unit:')){selectBackpackUnit(id.slice(5));return;} if(id==='battlefield'){const bx=x-150,by=y-70;const tower=state.towers.find((item)=>Math.hypot(item.x-bx,item.y-by)<=36);const enemy=state.enemies.filter((item)=>item.hp>0&&Math.hypot(item.x-bx,item.y-by)<=item.def.radius*1.8).sort((a,b)=>b.y-a.y)[0];if(tower){state.selectedTowerUid=tower.uid;state.selectedUid=null;state.selectedEnemy=null;}else if(!state.selectedUid&&enemy){state.selectedEnemy=enemy;state.selectedTowerUid=null;log(enemyStatusText(enemy));}else placeSelected(bx,by);return;}
  if(id==='backpack-prev'){state.backpackPage=Math.max(0,state.backpackPage-1);return;}if(id==='backpack-next'){state.backpackPage+=1;return;}
  if(id==='pause'){togglePause();return;}if(id==='speed'){const speeds=threeSpeedUnlocked()?[1,2,3]:[1,2];state.speed=speeds[(speeds.indexOf(state.speed)+1)%speeds.length];if(!threeSpeedUnlocked()&&state.speed===2)log('任意难度完成全部五关后永久解锁3倍速。');return;}if(id==='next'){nextWave();return;}if(id==='skill'){castSkill();return;}if(id==='bond-skill'){useBondSkill();return;}if(id==='bonds'){state.modal='bonds';return;}if(id.startsWith('bond:')){state.selectedBondId=id.slice(5);state.modal='';return;}if(id==='recall'){recallSelected();return;}if(id==='auto'){autoDeploy();return;}
  if(id.startsWith('evolution:')){chooseEvolution(Number(id.split(':')[1]));return;}if(id==='close'){state.modal='';return;}if(id==='codex-prev'){state.codexPage=Math.max(0,state.codexPage-1);return;}if(id==='codex-next'){state.codexPage=Math.min(2,state.codexPage+1);return;}
  if(id==='replay'){startGame();return;}if(id==='select'){state.screen='select';state.modal='';return;}if(id==='ad-continue'){continueWithAd();return;}if(id==='ad-double'){doubleReward();}
}

let last=Date.now();
wx.onTouchStart((event)=>{const touch=event.touches[0];const x=(touch.clientX-offsetX)/scale;const y=(touch.clientY-offsetY)/scale;const target=hit(x,y);if(target)handleButton(target.id,x,y);});
if (typeof wx.onHide === 'function') wx.onHide(pauseForBackground);
if (typeof wx.onShow === 'function') wx.onShow(resumeForeground);
function frame(){const now=Date.now();const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);draw();if(canvas.requestAnimationFrame)canvas.requestAnimationFrame(frame);else if(typeof requestAnimationFrame==='function')requestAnimationFrame(frame);else setTimeout(frame,16);}
frame();

module.exports = { state, Core, ROSTER, LEVELS, WAVES, startGame, startWave, waveTemplate, nextWave, spawnEnemy, damageEnemy, openSummon, swapOffers, receive, selectBackpackUnit, placeSelected, recallSelected, autoDeploy, castSkill, useBondSkill, selectedBond, bondState, supportBonus, effectiveTowerRange, enemySpecialTrait, enemyCounterHint, enemyPanelLines, togglePause, pauseForBackground, resumeForeground, update, draw };
