const Core = require('../shared/game-core.js');
const Platform = require('./platform.js');
const { ROSTER, LEVELS, ENEMIES, WAVES, DIFFICULTIES, BONDS } = require('./data.js');

const RARITY_COLORS = ['#918b79', '#5f9db5', '#8c62b2', '#d29637', '#ca4938'];
const POPULATION = [1, 1, 2, 2, 3];
const BASE_UNLOCKS = ['bifang','fuzhu','jiuwei','tiangou','xuangui','shengsheng','kaiming','bo','zheng','qiuniu','yazi','chaofeng','dayu','qinglong'];
const STAGE_UNLOCKS = [['pulao','suanni'],['bixi','bian'],['fuxi_long','chiwen'],['gonggong'],['baihu','zhuque','xuanwu','huangdi','fuxi','nuwa']];
const WAVE_REWARDS = [18,14,12,12,20,14,12,12,12,24,10,10,10,10,0];
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');
const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
const VIEW_W = 1280;
const VIEW_H = 720;
const scale = Math.min(info.windowWidth / VIEW_W, info.windowHeight / VIEW_H);
const offsetX = (info.windowWidth - VIEW_W * scale) / 2;
const offsetY = (info.windowHeight - VIEW_H * scale) / 2;
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

const state = {
  screen: 'select', modal: '', stage: 0, difficulty: 'normal', codexPage: 0,
  completions: new Set(Array.isArray(saved.completions) ? saved.completions : []),
  growth: saved.growth && typeof saved.growth === 'object' ? saved.growth : {}, merit: Number(saved.merit) || 0,
  unlocked: new Set(BASE_UNLOCKS), buttons: [], logs: [], speed: 1, paused: false,
  wave: 0, phase: 'prep', cooldown: 12, groups: null, bossSpawned: false, hp: 10, energy: 0, score: 0, kills: 0,
  towers: [], backpack: [], enemies: [], projectiles: [], selectedUid: null, selectedTowerUid: null, nextUid: 1,
  summonMode: 'normal', summonOffers: [], summonRemaining: 0, summonSwap: 0, summonAttempts: 0, requiredId: 'bifang', freeSwapUsed: false,
  backpackPage: 0, adPending: false,
  runFielded: new Set(), runKills: {}, runEvolutions: {}, continued: false, doubled: false, resultReward: 0, finished: false,
  growthSettled: false, growthAwardedKills: {}, victoryGrowthAwarded: false,
};

STAGE_UNLOCKS.forEach((ids, stage) => {
  if ([...state.completions].some((key) => key.startsWith(`${stage}:`))) ids.forEach((id) => state.unlocked.add(id));
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const level = () => LEVELS[state.stage];
const difficulty = () => DIFFICULTIES[state.difficulty];
const beast = (id) => ROSTER.find((item) => item.id === id);
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
  Platform.save({ completions: [...state.completions], growth: state.growth, merit: state.merit });
}

function log(message) { state.logs.unshift(message); state.logs = state.logs.slice(0, 2); }
function completionKey() { return `${state.stage}:${state.difficulty}`; }
function threeSpeedUnlocked() { return LEVELS.every((_, stage) => [...state.completions].some((key) => key.startsWith(`${stage}:`))); }
function populationUsed() { return state.towers.reduce((sum, tower) => sum + POPULATION[beast(tower.id).rarity], 0); }
function growthFor(id) { const item = state.growth[id] || { xp: 0, appearances: 0, kills: 0 }; const levelValue = Math.min(20, 1 + Math.floor(Math.sqrt(item.xp / 25))); return { ...item, level: levelValue, power: 1 + (levelValue - 1) * .025, haste: 1 + (levelValue - 1) * .012, range: 1 + (levelValue - 1) * .01 }; }
function evolutionFor(id) { return (state.runEvolutions[id] || []).reduce((totals, pathId) => { const path = Core.EVOLUTION_PATHS.find((item) => item.id === pathId); if (path) Object.entries(path.bonus).forEach(([key, value]) => { totals[key] = (totals[key] || 0) + value; }); return totals; }, { power:0, cdr:0, manaCost:0, range:0, support:0 }); }
function ownedIds() { return new Set([...state.towers, ...state.backpack].map((unit) => unit.id)); }
function activeBonds() { const ids = new Set(state.towers.map((tower) => tower.id)); return BONDS.filter((bond) => bond.members.filter((id) => ids.has(id)).length >= bond.need); }

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
  const rule = Core.SUMMON_RULES[mode];
  const cost = rule.cost * count * (count === 5 ? .8 : 1);
  if (state.backpack.length + count > 12) { log(`背包需要预留 ${count} 个空位。`); return; }
  if (state.energy < cost) { log(`灵蕴不足，需要 ${cost} 点。`); return; }
  state.energy -= cost; state.summonMode = mode; state.summonRemaining = count; buildOffers(); state.modal = 'summon';
}

function receive(candidate) {
  const existing = [...state.towers, ...state.backpack].find((unit) => unit.id === candidate.id);
  if (existing) existing.level = Math.min(9, existing.level + 1);
  else if (state.backpack.length < 12) state.backpack.push({ uid:`u${state.nextUid++}`, id:candidate.id, level:1, cd:.1, skillCd:0, mana:100, growthKills:0 });
  state.summonRemaining -= 1;
  if (state.summonRemaining > 0) buildOffers();
  else { state.modal = ''; state.summonOffers = []; }
  log(existing ? `${candidate.name}同卡升级。` : `${candidate.name}已入背包。`);
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

function startGame() {
  state.screen = 'game'; state.modal = ''; state.wave = 0; state.phase = 'prep'; state.cooldown = 12; state.groups = null; state.bossSpawned = false; state.hp = 10;
  state.energy = Math.round(level().essence * difficulty().essence); state.score = 0; state.kills = 0; state.speed = 1; state.paused = false; state.finished = false;
  state.towers = []; state.backpack = []; state.enemies = []; state.projectiles = []; state.selectedUid = null; state.selectedTowerUid = null; state.nextUid = 1;
  state.summonOffers = []; state.summonRemaining = 0; state.summonSwap = 0; state.summonAttempts = 0; state.freeSwapUsed = false; state.continued = false; state.doubled = false;
  state.backpackPage = 0; state.adPending = false;
  state.runFielded = new Set(); state.runKills = {}; state.runEvolutions = {}; state.logs = [];
  state.growthSettled = false; state.growthAwardedKills = {}; state.victoryGrowthAwarded = false;
  const pool = ROSTER.filter((item) => state.unlocked.has(item.id)); state.requiredId = pool[Math.floor(Math.random() * pool.length)].id;
  log(`${Core.STAGE_MECHANICS[state.stage].name}：${Core.STAGE_MECHANICS[state.stage].copy}`);
}

function startWave() {
  const routeCount = routes().length;
  state.groups = WAVES[state.wave].map((group, index) => ({ type:group[0], count:Math.max(1, Math.round(group[1] * difficulty().count)), gap:group[2], timer:group[3], hpMul:group[4], role:group[5] || 'normal', spawned:0, route:index % routeCount }));
  state.phase = 'combat'; state.bossSpawned = false; log(`第 ${state.wave + 1} 波开始。`);
}

function spawnEnemy(type, hpMul, routeIndex, distance = 0, role = 'normal') {
  const def = ENEMIES[type]; const route = routes()[routeIndex] || routes()[0]; const tide = state.stage === 2;
  const maxHp = def.hp * level().hp * difficulty().hp * hpMul;
  const point = pointAt(route, distance);
  state.enemies.push({ type, def, role, route, routeIndex, routeLength:routeLength(route), d:distance, x:point[0], y:point[1], hp:maxHp, maxHp, speed:def.speed * level().speed * difficulty().speed * (state.stage === 1 && ['fei','wangliang'].includes(type) ? 1.08 : 1), armor:Math.max(0,(def.armor || 0) + difficulty().armor), shield:(def.shield || 0) + (state.stage === 4 && role !== 'normal' ? 80 : 0), slow:0, slowTimer:0, stunned:0, revived:false, contributors:new Set(), healTimer:tide ? 6 : def.heal ? 5 : 0 });
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
  else log([4,9,14].includes(state.wave) ? `首领波预警，${state.cooldown} 秒后进攻。` : '下一波将在 7 秒后进攻。');
}

function supportBonus(tower) {
  let power = 0; let haste = 0; let range = 0;
  state.towers.forEach((source) => { if (source.uid === tower.uid || Math.hypot(source.x - tower.x, source.y - tower.y) > 175) return; const type = source.id.charCodeAt(0) % 3; const value = .05 + beast(source.id).rarity * .012; if (type === 0) power += value; else if (type === 1) haste += value; else range += value; });
  return { power:Math.min(.35,power), haste:Math.min(.3,haste), range:Math.min(.25,range) };
}

function updateTowers(dt) {
  const bondPower = activeBonds().length * .07;
  state.towers.forEach((tower) => {
    const def = beast(tower.id); const persistent = growthFor(tower.id); const passive = Core.passiveBonus(tower.id, tower.growthKills); const evolution = evolutionFor(tower.id); const support = supportBonus(tower);
    tower.mana = Math.min(100, tower.mana + dt * 3.2); tower.skillCd = Math.max(0, tower.skillCd - dt);
    tower.cd -= dt * persistent.haste * (1 + passive.haste + support.haste);
    if (tower.cd > 0) return;
    const range = def.range * persistent.range * (1 + evolution.range + support.range);
    const targets = state.enemies.filter((enemy) => enemy.hp > 0 && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range).sort((a,b) => b.d - a.d);
    if (!targets.length) return;
    const power = def.dmg * persistent.power * difficulty().power * (1 + passive.power + evolution.power + support.power + bondPower) * (1 + (tower.level - 1) * .24);
    [targets[0], ...targets.slice(1, 1 + passive.targets)].forEach((target, index) => state.projectiles.push({ x:tower.x, y:tower.y, target, speed:390, damage:power * (index ? .65 : 1), source:tower, def }));
    tower.cd = def.interval;
  });
}

function damageEnemy(enemy, damage, source, def, skill = false) {
  if (!enemy || enemy.hp <= 0 || (enemy.def.immuneMag && def.dmgType === 'mag')) return;
  enemy.contributors.add(source.uid);
  let amount = damage;
  if (enemy.shield > 0) { const rate = def.breakShield ? 1.7 : .55; const absorbed = Math.min(enemy.shield, amount * rate); enemy.shield -= absorbed; amount -= absorbed / rate; if (amount <= 0) return; }
  enemy.hp -= amount * Math.max(.35, 1 - enemy.armor / 100);
  if (def.slow) { enemy.slow = Math.max(enemy.slow, def.slow); enemy.slowTimer = 2.5; }
  if (skill) enemy.stunned = Math.max(enemy.stunned, 1.8);
  if (def.splash) state.enemies.filter((item) => item !== enemy && item.hp > 0 && Math.hypot(item.x - enemy.x, item.y - enemy.y) <= 52).forEach((item) => { item.contributors.add(source.uid); item.hp -= amount * .42; if (item.hp <= 0) killEnemy(item, source); });
  if (enemy.hp <= 0) killEnemy(enemy, source);
}

function killEnemy(enemy, killer) {
  if (enemy.def.revive && !enemy.revived) { enemy.revived = true; enemy.hp = enemy.maxHp * .35; enemy.shield = 120; return; }
  if (enemy.dead) return; enemy.dead = true;
  enemy.contributors.forEach((uid) => { const tower = state.towers.find((item) => item.uid === uid); if (tower) tower.growthKills += 1; });
  if (killer) state.runKills[killer.id] = (state.runKills[killer.id] || 0) + 1;
  state.kills += enemy.def.reward; state.score += enemy.def.reward * 100; state.energy += enemy.def.reward * 2;
}

function updateProjectiles(dt) {
  state.projectiles = state.projectiles.filter((projectile) => { const target = projectile.target; if (!target || target.hp <= 0) return false; const dx = target.x - projectile.x; const dy = target.y - projectile.y; const distance = Math.hypot(dx,dy); const step = projectile.speed * dt; projectile.x += dx / Math.max(1,distance) * step; projectile.y += dy / Math.max(1,distance) * step; if (distance <= step + target.def.radius) { damageEnemy(target, projectile.damage, projectile.source, projectile.def); return false; } return true; });
}

function updateEnemies(dt) {
  state.enemies.forEach((enemy) => {
    if (enemy.hp <= 0) return;
    enemy.slowTimer -= dt; if (enemy.slowTimer <= 0) enemy.slow = 0; enemy.stunned = Math.max(0, enemy.stunned - dt);
    if (enemy.healTimer > 0) { enemy.healTimer -= dt; if (enemy.healTimer <= 0) { enemy.healTimer = enemy.def.heal ? 5 : 6; enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.maxHp * (enemy.def.heal ? .08 : .012)); } }
    if (enemy.stunned > 0) return;
    enemy.d += enemy.speed * (1 - enemy.slow) * dt; const point = pointAt(enemy.route, enemy.d); enemy.x = point[0]; enemy.y = point[1];
    if (enemy.d >= enemy.routeLength) { enemy.hp = 0; state.hp -= enemy.role === 'stageBoss' ? 9 : enemy.role === 'miniBoss' ? 5 : 1; }
  });
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0 && !enemy.dead);
  if (state.hp <= 0) finishGame(false);
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
  unit.x = x; unit.y = y; unit.mana = 100; unit.skillCd = 0; unit.growthKills = 0; state.towers.push(unit); state.backpack = state.backpack.filter((item) => item.uid !== unit.uid); state.runFielded.add(unit.id); state.selectedUid = null; state.selectedTowerUid = unit.uid; log(`${beast(unit.id).name}已入阵。`);
}

function castSkill() {
  const tower = state.towers.find((item) => item.uid === state.selectedTowerUid); if (!tower) { log('先点击场上妖灵，再发动主动技能。'); return; }
  const evolution = evolutionFor(tower.id); const cost = Math.round(50 * (1 - evolution.manaCost)); if (tower.mana < cost || tower.skillCd > 0) { log(tower.skillCd > 0 ? `技能还需 ${tower.skillCd.toFixed(1)} 秒。` : `法力不足，需要 ${cost}。`); return; }
  const def = beast(tower.id); const range = def.range * 1.35 * (1 + evolution.range); const targets = state.enemies.filter((enemy) => Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range);
  if (!targets.length) { log('技能范围内没有敌军。'); return; }
  const power = def.dmg * growthFor(tower.id).power * (3.2 + def.rarity * .18) * (1 + evolution.power); targets.forEach((enemy) => damageEnemy(enemy,power,tower,def,true)); tower.mana -= cost; tower.skillCd = 22 * (1 - evolution.cdr); log(`${def.name}发动主动技能，造成范围伤害与眩晕。`);
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
  state.growthSettled = true; if (won) state.victoryGrowthAwarded = true;
  if (won) { state.completions.add(completionKey()); STAGE_UNLOCKS[state.stage].forEach((id) => state.unlocked.add(id)); }
  saveProgress();
}

async function continueWithAd() {
  if (state.continued || state.resultWon || state.adPending) return; state.adPending = true;
  try { const granted = await Platform.showRewarded('continue'); if (!granted || state.continued || state.resultWon || state.screen !== 'result') return;
    state.continued = true; state.finished = false; state.screen = 'game'; state.hp = 5; state.enemies = []; state.projectiles = []; state.groups = null; state.phase = 'rest'; state.cooldown = 7; log('封印续接成功，恢复 5 点完整度。');
  } finally { state.adPending = false; }
}

async function doubleReward() {
  if (state.doubled || !state.resultWon || !state.resultReward || state.adPending) return; state.adPending = true;
  try { const granted = await Platform.showRewarded('doubleReward'); if (!granted || state.doubled || !state.resultWon || state.screen !== 'result') return;
    state.doubled = true; state.merit += state.resultReward; saveProgress();
  } finally { state.adPending = false; }
}

function nextWave() { if ((state.phase === 'prep' || state.phase === 'rest') && !state.modal) { state.cooldown = 0; } }

function update(dt) {
  if (state.screen !== 'game' || state.paused || state.modal || state.finished) return;
  const scaled = dt * state.speed; updateSpawning(scaled); updateTowers(scaled); updateProjectiles(scaled); updateEnemies(scaled);
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
  button('start','开始守关',495,535,290,65,'red'); button('codex','山海经图谱',805,535,180,65,'gold');
  text('标准模式 · 15波 · 约10分钟 · 第5/10波小首领 · 第15波关卡首领',640,640,14,'#493925','center');
}

function drawBattlefield() {
  const ox=150, oy=70, w=960, h=540; const bg=backgrounds[state.stage]; if(bg.loaded) ctx.drawImage(bg,ox,oy,w,h); else {ctx.fillStyle='#273634';ctx.fillRect(ox,oy,w,h);} ctx.fillStyle='rgba(24,27,22,.12)';ctx.fillRect(ox,oy,w,h);
  ctx.save();ctx.translate(ox,oy); routes().forEach((route)=>{ctx.beginPath();route.forEach((point,index)=>index?ctx.lineTo(point[0],point[1]):ctx.moveTo(point[0],point[1]));ctx.strokeStyle='#30271d';ctx.lineWidth=76;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.strokeStyle='#c3a46d';ctx.lineWidth=62;ctx.stroke();ctx.strokeStyle='rgba(250,229,177,.48)';ctx.lineWidth=3;ctx.setLineDash([9,12]);ctx.stroke();ctx.setLineDash([]);});
  routes().forEach((route)=>{const start=route[0];const end=route[route.length-1];ctx.strokeStyle='#d05743';ctx.lineWidth=3;ctx.beginPath();ctx.arc(start[0],start[1],25,0,Math.PI*2);ctx.stroke();text('裂',start[0],start[1],13,'#d05743','center','bold');ctx.strokeStyle='#dfb658';ctx.beginPath();ctx.arc(end[0],end[1],32,0,Math.PI*2);ctx.stroke();text('封',end[0],end[1],13,'#f0d078','center','bold');});
  state.towers.forEach((tower)=>{const def=beast(tower.id);drawPortrait(def,tower.x-30,tower.y-30,60);ctx.strokeStyle=RARITY_COLORS[def.rarity];ctx.lineWidth=3;ctx.beginPath();ctx.arc(tower.x,tower.y,31,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#2a2520';ctx.fillRect(tower.x-28,tower.y+34,56,6);ctx.fillStyle='#6fa7c7';ctx.fillRect(tower.x-28,tower.y+34,56*clamp(tower.mana/100,0,1),6); if(tower.uid===state.selectedTowerUid){ctx.strokeStyle='#f1cf68';ctx.lineWidth=2;ctx.beginPath();ctx.arc(tower.x,tower.y,beast(tower.id).range*growthFor(tower.id).range,0,Math.PI*2);ctx.stroke();}});
  state.enemies.forEach((enemy)=>{const r=enemy.def.radius*1.55;if(enemyAtlas.loaded){const cw=enemyAtlas.width/5,ch=enemyAtlas.height/2;ctx.drawImage(enemyAtlas,(enemy.def.sprite%5)*cw,Math.floor(enemy.def.sprite/5)*ch,cw,ch,enemy.x-r,enemy.y-r,r*2,r*2);}else{ctx.fillStyle='#a46f5c';ctx.beginPath();ctx.arc(enemy.x,enemy.y,r,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#302821';ctx.fillRect(enemy.x-r,enemy.y-r-8,r*2,5);ctx.fillStyle='#67b18e';ctx.fillRect(enemy.x-r,enemy.y-r-8,r*2*clamp(enemy.hp/enemy.maxHp,0,1),5);if(enemy.shield>0){ctx.strokeStyle='#8dd4d2';ctx.lineWidth=2;ctx.beginPath();ctx.arc(enemy.x,enemy.y,r+4,0,Math.PI*2);ctx.stroke();}});
  state.projectiles.forEach((item)=>{ctx.fillStyle=item.def.color;ctx.beginPath();ctx.arc(item.x,item.y,5,0,Math.PI*2);ctx.fill();}); ctx.restore();
}

function drawGame() {
  ctx.fillStyle='#17120e';ctx.fillRect(0,0,VIEW_W,VIEW_H);panel(0,0,VIEW_W,58,'#e6d09a','#8b693c');text(`封印 ${Math.max(0,state.hp)}/10`,24,29,19,'#9c2f28','left','bold');text(`${level().name} · ${difficulty().name} · 第${state.wave+1}/15波`,640,29,21,'#33251b','center','bold');text(`灵蕴 ${Math.floor(state.energy)}   人口 ${populationUsed()}/18   分数 ${state.score}`,1250,29,16,'#3b2b1d','right','bold');
  drawBattlefield();
  button('pause',state.paused?'继续':'暂停',1125,78,135,48);button('speed',`${state.speed}倍速`,1125,134,135,48);button('next','下一波',1125,190,135,48,'gold',state.phase==='combat');button('skill','主动技能',1125,246,135,58,'jade',!state.selectedTowerUid);button('bonds',`羁绊 ${activeBonds().length}`,1125,312,135,48,'gold');
  panel(1125,372,135,128,'#332b22','#a67b3e');text(`天命：${beast(state.requiredId).name}`,1192,394,11,'#f0d49a','center','bold');text(`背包 ${state.backpack.length}/12`,1192,421,11,'#e8dcc0','center');text(state.phase==='combat'?`余敌 ${state.enemies.length}`:`等待 ${Math.ceil(state.cooldown)}s`,1192,449,13,'#d9b85f','center','bold');text(state.logs[0]||'',1192,480,9,'#dfcfad','center');
  const dockY=620; button('summon:normal:1','普通单抽 20',150,dockY,180,55,'red');button('summon:normal:5','普通五连 80',338,dockY,180,55,'red');button('summon:advanced:1','高级单抽 50',526,dockY,180,55,'jade');button('summon:advanced:5','高级五连 200',714,dockY,190,55,'jade');
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

function drawBondsModal() { drawModalBackdrop();text('羁绊谱 · 上场即触发',640,135,28,'#9c3028','center','bold');BONDS.forEach((bond,index)=>{const ids=new Set(state.towers.map((tower)=>tower.id));const count=bond.members.filter((id)=>ids.has(id)).length;const x=300+(index%2)*350,y=175+Math.floor(index/2)*72;panel(x,y,330,58,count>=bond.need?'#d8c489':'#c7b589',count>=bond.need?'#a43229':'#8d744f');text(bond.name,x+15,y+20,15,'#33251b','left','bold');text(`${count}/${bond.need} · ${count>=bond.need?'已触发：全队战力提升':'未触发'}`,x+15,y+41,10,count>=bond.need?'#9c3028':'#6e5a41');});button('close','关闭',565,565,150,42,'red'); }

function drawResult() { const bg=backgrounds[state.stage];if(bg.loaded)ctx.drawImage(bg,0,0,VIEW_W,VIEW_H);ctx.fillStyle='rgba(225,204,154,.9)';ctx.fillRect(0,0,VIEW_W,VIEW_H);panel(300,90,680,540,'#f0deb0','#956d3b');text(state.resultWon?'封印守住了':'封印被突破',640,150,38,state.resultWon?'#3c756b':'#a63028','center','bold');text(`${level().name} · ${difficulty().name} · 第 ${Math.min(15,state.wave+1)} 波`,640,205,18,'#59432e','center');text(`得分 ${state.score}`,640,260,42,'#a42f27','center','bold');text(`击破 ${state.kills} · 剩余封印 ${Math.max(0,state.hp)}/10 · 功勋 +${state.resultReward}${state.doubled?'×2':''}`,640,315,16,'#4e3b2a','center');text(`永久功勋 ${state.merit} · 妖灵成长经验已结算`,640,355,14,'#6a5034','center');button('replay','再守一次',390,425,210,56,'red');button('select','返回关卡',620,425,210,56,'dark');if(!state.resultWon&&!state.continued)button('ad-continue','广告续关一次',390,500,210,50,'jade');if(state.resultWon&&!state.doubled)button('ad-double','广告奖励加倍',620,500,210,50,'gold'); }

function draw() {
  state.buttons=[];ctx.clearRect(-offsetX/scale,-offsetY/scale,info.windowWidth/scale,info.windowHeight/scale);ctx.fillStyle='#0e0b09';ctx.fillRect(0,0,VIEW_W,VIEW_H);
  if(state.screen==='select')drawSelect();else if(state.screen==='game')drawGame();else drawResult();
  if(state.modal==='summon')drawSummonModal();else if(state.modal==='evolution')drawEvolutionModal();else if(state.modal==='codex')drawCodexModal();else if(state.modal==='bonds')drawBondsModal();
}

function hit(x,y) { const buttons=[...state.buttons].reverse().filter((item)=>!item.disabled); return buttons.find((item)=>x>=item.x&&x<=item.x+item.w&&y>=item.y&&y<=item.y+item.h)||buttons.find((item)=>x>=item.x-14&&x<=item.x+item.w+14&&y>=item.y-14&&y<=item.y+item.h+14); }
function handleButton(id,x,y) {
  if(id.startsWith('stage:')){state.stage=Number(id.split(':')[1]);return;} if(id.startsWith('difficulty:')){state.difficulty=id.split(':')[1];return;} if(id==='start'){startGame();return;} if(id==='codex'){state.modal='codex';state.codexPage=0;return;}
  if(id.startsWith('summon:')){const [,mode,count]=id.split(':');openSummon(mode,Number(count));return;} if(id.startsWith('offer:')){receive(state.summonOffers[Number(id.split(':')[1])]);return;} if(id==='swap'){swapOffers();return;} if(id==='ad-swap'){adFreeSwap();return;}
  if(id.startsWith('unit:')){state.selectedUid=id.slice(5);state.selectedTowerUid=null;return;} if(id==='battlefield'){const bx=x-150,by=y-70;const tower=state.towers.find((item)=>Math.hypot(item.x-bx,item.y-by)<=36);if(tower){state.selectedTowerUid=tower.uid;state.selectedUid=null;}else placeSelected(bx,by);return;}
  if(id==='backpack-prev'){state.backpackPage=Math.max(0,state.backpackPage-1);return;}if(id==='backpack-next'){state.backpackPage+=1;return;}
  if(id==='pause'){state.paused=!state.paused;return;}if(id==='speed'){const speeds=threeSpeedUnlocked()?[1,2,3]:[1,2];state.speed=speeds[(speeds.indexOf(state.speed)+1)%speeds.length];if(!threeSpeedUnlocked()&&state.speed===2)log('任意难度完成全部五关后永久解锁3倍速。');return;}if(id==='next'){nextWave();return;}if(id==='skill'){castSkill();return;}if(id==='bonds'){state.modal='bonds';return;}
  if(id.startsWith('evolution:')){chooseEvolution(Number(id.split(':')[1]));return;}if(id==='close'){state.modal='';return;}if(id==='codex-prev'){state.codexPage=Math.max(0,state.codexPage-1);return;}if(id==='codex-next'){state.codexPage=Math.min(2,state.codexPage+1);return;}
  if(id==='replay'){startGame();return;}if(id==='select'){state.screen='select';state.modal='';return;}if(id==='ad-continue'){continueWithAd();return;}if(id==='ad-double'){doubleReward();}
}

wx.onTouchStart((event)=>{const touch=event.touches[0];const x=(touch.clientX-offsetX)/scale;const y=(touch.clientY-offsetY)/scale;const target=hit(x,y);if(target)handleButton(target.id,x,y);});
let last=Date.now();
function frame(){const now=Date.now();const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);draw();if(canvas.requestAnimationFrame)canvas.requestAnimationFrame(frame);else if(typeof requestAnimationFrame==='function')requestAnimationFrame(frame);else setTimeout(frame,16);}
frame();

module.exports = { state, Core, ROSTER, LEVELS, WAVES, startGame, startWave, openSummon, swapOffers, receive, update, draw };
