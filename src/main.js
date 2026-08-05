const RARITIES = ['N', 'R', 'SR', 'SSR', 'UR'];
const SAVE_KEY = 'shan-hai-rebuild-v1';
const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const biomeAtlas = document.createElement('img');
biomeAtlas.src = './assets/biome-atlas.png';
const caveBattlefield = document.createElement('img');
caveBattlefield.src = './assets/cave-battlefield.png';
const stageBackgrounds = [
  './assets/background-cave.png',
  './assets/background-grass.png',
  './assets/background-sea.png',
  './assets/background-volcano.png',
  './assets/background-heaven.png',
].map((src) => { const image = document.createElement('img'); image.src = src; return image; });
const beastAtlas = document.createElement('img');
beastAtlas.src = './assets/beast-atlas.png';
const enemyAtlas = document.createElement('img');
enemyAtlas.src = './assets/enemy-atlas.png';

const ROSTER = [
  ['bifang', '毕方', 0], ['fuzhu', '夫诸', 0], ['jiuwei', '九尾狐', 0], ['tiangou', '天狗', 0], ['xuangui', '旋龟', 0],
  ['shengsheng', '狌狌', 1], ['kaiming', '开明兽', 1], ['bo', '驳', 1], ['zheng', '狰', 1],
  ['qiuniu', '囚牛', 2], ['yazi', '睚眦', 2], ['chaofeng', '嘲风', 2], ['pulao', '蒲牢', 2], ['suanni', '狻猊', 2], ['bixi', '霸下', 2], ['bian', '狴犴', 2], ['fuxi_long', '负屭', 2], ['chiwen', '螭吻', 2],
  ['dayu', '大禹', 3], ['gonggong', '共工', 3],
  ['qinglong', '青龙', 4], ['baihu', '白虎', 4], ['zhuque', '朱雀', 4], ['xuanwu', '玄武', 4], ['huangdi', '黄帝', 4], ['fuxi', '伏羲', 4], ['nuwa', '女娲', 4],
].map(([id, name, rarity], portraitIndex) => ({ id, name, rarity, portraitIndex }));

const STARTER_IDS = ['bifang', 'fuzhu', 'jiuwei', 'tiangou', 'xuangui'];
const SUMMON_COST = 28;
const MAX_HAND = 12;
const SUMMON_WEIGHTS = [[0, 56], [1, 28], [2, 12], [3, 3], [4, 1]];
const BEASTS = {
  bifang: { dmg: 20, interval: 1.15, range: 168, projSpeed: 380, proj: 'ember', burn: true, burnDps: .22, dmgType: 'mag', counters: ['purge'], color: '#e77854', kindText: '灼烧 · 破法', cost: 18 },
  fuzhu: { dmg: 15, interval: .92, range: 155, projSpeed: 420, proj: 'wisp', slow: .28, slowDur: 2.5, dmgType: 'mag', counters: ['insight'], color: '#80c7be', kindText: '减速 · 洞察', cost: 20 },
  jiuwei: { dmg: 25, interval: 1.48, range: 175, projSpeed: 340, proj: 'wisp', chain: 2, dmgType: 'mag', counters: ['splash'], color: '#b78ed5', kindText: '连锁 · 溅射', cost: 24 },
  tiangou: { dmg: 17, interval: .82, range: 145, projSpeed: 460, proj: 'claw', stunEvery: 4, dmgType: 'phy', counters: ['execute'], color: '#dca85e', kindText: '快攻 · 斩杀', cost: 22 },
  xuangui: { dmg: 34, interval: 1.85, range: 138, projSpeed: 265, proj: 'quake', splash: 54, breakAt: 3, dmgType: 'phy', counters: ['breakShield'], color: '#76a8c4', kindText: '重击 · 破盾', cost: 26 },
  shengsheng: { dmg: 27, interval: 1.2, range: 165, projSpeed: 370, proj: 'claw', dmgType: 'phy', counters: ['execute'], color: '#a6bf94', kindText: '追猎', cost: 23 },
  kaiming: { dmg: 22, interval: .98, range: 155, projSpeed: 410, proj: 'ember', burn: true, burnDps: .18, dmgType: 'mag', counters: ['purge'], color: '#d78966', kindText: '火眼', cost: 24 },
  bo: { dmg: 31, interval: 1.55, range: 170, projSpeed: 330, proj: 'claw', breakAt: 2, dmgType: 'phy', counters: ['breakShield'], color: '#b8a07c', kindText: '穿甲', cost: 28 },
  zheng: { dmg: 19, interval: .74, range: 150, projSpeed: 450, proj: 'claw', slow: .18, slowDur: 2, dmgType: 'phy', counters: ['insight'], color: '#d4776c', kindText: '疾袭', cost: 25 },
  qiuniu: { dmg: 21, interval: 1.12, range: 174, projSpeed: 390, proj: 'wisp', chain: 1, dmgType: 'mag', counters: ['splash'], color: '#b394c4', kindText: '余音', cost: 27 },
  yazi: { dmg: 38, interval: 1.7, range: 145, projSpeed: 310, proj: 'claw', breakAt: 2, dmgType: 'phy', counters: ['execute'], color: '#d06c57', kindText: '凶刃', cost: 29 },
  chaofeng: { dmg: 18, interval: .86, range: 182, projSpeed: 440, proj: 'wisp', slow: .22, slowDur: 2.8, dmgType: 'mag', counters: ['insight'], color: '#8db9c0', kindText: '望风', cost: 26 },
  pulao: { dmg: 24, interval: 1.1, range: 165, projSpeed: 365, proj: 'ember', splash: 34, dmgType: 'mag', counters: ['splash'], color: '#df9860', kindText: '震响', cost: 28 },
  suanni: { dmg: 29, interval: 1.38, range: 154, projSpeed: 320, proj: 'quake', burn: true, burnDps: .2, dmgType: 'mag', counters: ['purge'], color: '#d5b16b', kindText: '焚香', cost: 30 },
  bixi: { dmg: 44, interval: 2.1, range: 132, projSpeed: 240, proj: 'quake', splash: 45, breakAt: 2, dmgType: 'phy', counters: ['breakShield'], color: '#82aab1', kindText: '镇岳', cost: 32 },
  bian: { dmg: 20, interval: .82, range: 166, projSpeed: 440, proj: 'claw', stunEvery: 5, dmgType: 'phy', counters: ['execute'], color: '#cf8a72', kindText: '明察', cost: 29 },
  fuxi_long: { dmg: 32, interval: 1.35, range: 178, projSpeed: 370, proj: 'wisp', chain: 2, dmgType: 'mag', counters: ['splash'], color: '#c28fae', kindText: '龙吟', cost: 34 },
  chiwen: { dmg: 23, interval: .94, range: 190, projSpeed: 430, proj: 'wisp', slow: .2, slowDur: 3, dmgType: 'mag', counters: ['insight'], color: '#72b3b1', kindText: '吞潮', cost: 32 },
  dayu: { dmg: 40, interval: 1.7, range: 184, projSpeed: 300, proj: 'quake', splash: 58, slow: .24, slowDur: 2, dmgType: 'true', counters: ['breakShield', 'splash'], color: '#7eb0c3', kindText: '真伤 · 治水', cost: 38 },
  gonggong: { dmg: 35, interval: 1.42, range: 180, projSpeed: 350, proj: 'wisp', chain: 2, slow: .2, slowDur: 2.5, dmgType: 'true', counters: ['purge', 'insight'], color: '#5595a6', kindText: '潮汐 · 真伤', cost: 40 },
  qinglong: { dmg: 50, interval: 1.55, range: 206, projSpeed: 440, proj: 'wisp', chain: 3, slow: .25, slowDur: 3, dmgType: 'mag', counters: ['insight', 'splash'], color: '#5eb7ad', kindText: '四象 · 连锁', cost: 48 },
  baihu: { dmg: 66, interval: 1.9, range: 160, projSpeed: 470, proj: 'claw', breakAt: 2, dmgType: 'phy', counters: ['execute', 'breakShield'], color: '#d6c6b5', kindText: '四象 · 破甲', cost: 50 },
  zhuque: { dmg: 45, interval: 1.22, range: 194, projSpeed: 390, proj: 'ember', splash: 52, burn: true, burnDps: .25, dmgType: 'mag', counters: ['purge', 'splash'], color: '#ea7257', kindText: '四象 · 炎域', cost: 50 },
  xuanwu: { dmg: 32, interval: .9, range: 188, projSpeed: 420, proj: 'wisp', slow: .36, slowDur: 3.4, dmgType: 'true', counters: ['breakShield', 'insight'], color: '#7594ae', kindText: '四象 · 玄水', cost: 52 },
  huangdi: { dmg: 41, interval: 1.3, range: 190, projSpeed: 400, proj: 'ember', burn: true, burnDps: .2, dmgType: 'true', counters: ['purge', 'execute'], color: '#d7a957', kindText: '人祖 · 真火', cost: 47 },
  fuxi: { dmg: 38, interval: 1.05, range: 215, projSpeed: 430, proj: 'wisp', chain: 2, dmgType: 'mag', counters: ['insight', 'splash'], color: '#a58bc7', kindText: '人祖 · 观阵', cost: 47 },
  nuwa: { dmg: 36, interval: 1.15, range: 200, projSpeed: 370, proj: 'quake', splash: 42, slow: .24, slowDur: 2.6, dmgType: 'true', counters: ['breakShield', 'purge'], color: '#d589a2', kindText: '人祖 · 补天', cost: 47 },
};

const BOND_DEFS = [
  { id: 'wild', name: '山野同气', members: ['bifang', 'fuzhu', 'jiuwei', 'tiangou', 'xuangui'], need: 3, stat: 'power', bonus: .14, stepBonus: .07, shape: 'triangle', color: '#d98a67', ult: '焚野', ultMul: 2.2 },
  { id: 'fierce', name: '山海猛兽', members: ['zheng', 'kaiming', 'bo', 'shengsheng'], need: 2, stat: 'haste', bonus: .12, stepBonus: .06, shape: 'line', color: '#e1ac65', ult: '猎潮', ultMul: 2 },
  { id: 'dragon', name: '龙生九子', members: ['qiuniu', 'yazi', 'chaofeng', 'pulao', 'suanni', 'bixi', 'bian', 'fuxi_long', 'chiwen'], need: 3, stat: 'haste', bonus: .12, stepBonus: .045, shape: 'square', color: '#b58bd0', ult: '九子镇海', ultMul: 2.6 },
  { id: 'sishou', name: '四象归位', members: ['qinglong', 'baihu', 'zhuque', 'xuanwu'], need: 2, stat: 'range', bonus: .1, stepBonus: .06, shape: 'square', color: '#65b7af', ult: '四象天门', ultMul: 3.4 },
  { id: 'renzu', name: '人祖开天', members: ['huangdi', 'fuxi', 'nuwa'], need: 2, stat: 'cdr', bonus: .16, stepBonus: .1, shape: 'triangle', color: '#d4a355', ult: '开天', ultMul: 3 },
  { id: 'zhishui', name: '治水之争', members: ['dayu', 'gonggong'], need: 2, stat: 'sunder', bonus: .16, stepBonus: 0, shape: 'line', color: '#66a9c3', ult: '怒海分流', ultMul: 2.8 },
  { id: 'yanhuo', name: '炎火同源', members: ['bifang', 'zheng', 'zhuque', 'nuwa'], need: 2, stat: 'power', bonus: .1, stepBonus: .08, shape: 'square', color: '#e66f55' },
  { id: 'shuize', name: '水泽同流', members: ['fuzhu', 'chiwen', 'xuanwu', 'gonggong'], need: 2, stat: 'enemySlow', bonus: .09, stepBonus: .06, shape: 'cluster', color: '#5fa8b2' },
];

const ENEMIES = {
  xingxing: { name: '狌狌', hp: 92, speed: 45, radius: 12, color: '#b78668', reward: 1, sprite: 0 },
  fei: { name: '飞廉', hp: 135, speed: 62, radius: 13, color: '#8fb7b5', reward: 1, sprite: 1 },
  bashe: { name: '巴蛇', hp: 360, speed: 31, radius: 18, color: '#8a985e', armor: 8, reward: 2, sprite: 2 },
  huali: { name: '化蛇', hp: 230, speed: 38, radius: 15, color: '#6e9ab0', immuneMag: true, reward: 2, sprite: 3 },
  wangliang: { name: '魍魉', hp: 180, speed: 56, radius: 13, color: '#9f7db5', stealth: true, reward: 2, sprite: 4 },
  zhuyan: { name: '朱厌', hp: 420, speed: 28, radius: 20, color: '#bf6751', armor: 16, shield: 100, reward: 3, sprite: 5 },
  taotie: { name: '饕餮', hp: 760, speed: 22, radius: 25, color: '#d28e54', shield: 220, armor: 12, boss: true, skill: 'heal', reward: 5, sprite: 6 },
  baize: { name: '白泽', hp: 560, speed: 25, radius: 22, color: '#cfbc92', skill: 'revive', boss: true, reward: 5, sprite: 7 },
  shanxiao: { name: '山魈', hp: 200, speed: 50, radius: 14, color: '#9b6f59', skill: 'split', reward: 2, sprite: 8 },
};

const LEVELS = [
  { name: '幽都洞窟', intro: '窄路回旋，先学会把火力交叉覆盖。', hpMul: 1, spdMul: 1, essence: 56, tint: '#647f78', path: 'cave', spawnCount: 1 },
  { name: '北野草原', intro: '开阔地带，远程单位的范围开始变得重要。', hpMul: 1.25, spdMul: 1.05, essence: 62, tint: '#7d9d81', path: 'grass', spawnCount: 1 },
  { name: '沧海之上', intro: '潮汐折返，减速和连锁能把敌群拖在射程内。', hpMul: 1.55, spdMul: 1.1, essence: 70, tint: '#5b8e9c', path: 'sea', spawnCount: 1 },
  { name: '赤焰火山', intro: '两道裂口同时喷涌，必须分散阵型。', hpMul: 1.9, spdMul: 1.15, essence: 78, tint: '#b56454', path: 'volcano', spawnCount: 2 },
  { name: '天庭云阶', intro: '双路交汇，强敌拥有护盾与复活机制。', hpMul: 2.3, spdMul: 1.2, essence: 86, tint: '#8a82aa', path: 'cloud', spawnCount: 2 },
];

const WAVES = [
  [['xingxing', 7, 1.1, 0, 1]], [['xingxing', 8, 1, 0, 1], ['fei', 2, 1.4, 3, 1]], [['xingxing', 8, .9, 0, 1], ['bashe', 1, 0, 5, 1]],
  [['fei', 6, 1, 0, 1], ['wangliang', 2, 1.5, 2, 1]], [['xingxing', 10, .72, 0, 1.1], ['bashe', 2, 1.3, 4, 1]], [['huali', 5, 1.1, 0, 1], ['fei', 5, .9, 1, 1]],
  [['wangliang', 5, .9, 0, 1], ['zhuyan', 1, 0, 7, 1]], [['xingxing', 12, .65, 0, 1.1], ['shanxiao', 3, 1.2, 3, 1]],
  [['bashe', 4, 1.2, 0, 1], ['fei', 8, .7, 1, 1]], [['huali', 7, .9, 0, 1], ['wangliang', 4, 1, 2, 1]], [['zhuyan', 2, 0, 0, 1], ['xingxing', 13, .55, 1, 1.1]],
  [['shanxiao', 6, .85, 0, 1], ['bashe', 4, 1.1, 2, 1.1]], [['huali', 10, .72, 0, 1.1], ['zhuyan', 2, 0, 5, 1]], [['fei', 15, .5, 0, 1.2], ['wangliang', 4, 1, 2, 1]],
  [['bashe', 7, .9, 0, 1.2], ['shanxiao', 7, .7, 1, 1.2]], [['zhuyan', 3, 0, 0, 1.2], ['huali', 10, .72, 2, 1.2]], [['taotie', 1, 0, 0, 1.15], ['xingxing', 16, .44, 1, 1.25]],
  [['wangliang', 10, .65, 0, 1.25], ['baize', 1, 0, 4, 1.2]], [['zhuyan', 5, 0, 0, 1.3], ['shanxiao', 10, .55, 1, 1.25]], [['taotie', 1, 0, 0, 1.3], ['baize', 1, 0, 4, 1.25], ['huali', 14, .5, 2, 1.3]],
];

const refs = Object.fromEntries(['selectScreen', 'gameScreen', 'resultScreen', 'stageList', 'rosterList', 'bondPreviewList', 'selectedStageLabel', 'codexCount', 'cultivationSummary', 'startGame', 'backToSelect', 'pauseGame', 'speedGame', 'gameTerrain', 'gameLevel', 'hpLabel', 'hpMeter', 'waveLabel', 'waveTrack', 'combatLog', 'essenceLabel', 'killLabel', 'populationLabel', 'gameRoster', 'gameBonds', 'summonBeast', 'teamSkill', 'skillLabel', 'replayGame', 'returnSelect', 'resultTitle', 'resultStage', 'resultKills', 'resultXp', 'resultCombo', 'resultCopy', 'codexOpen', 'codexClose', 'codexDialog', 'codexDialogList'].map((key) => [key, document.querySelector(`#${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`)]));

const state = {
  screen: 'select', stage: 0, selectedBeast: 'bifang', hand: [], maxPopulation: 20, unlocked: new Set(STARTER_IDS), xp: 0, tier: 1,
  paused: false, speed: 1, lastTime: 0, wave: 0, waveTimer: 0, spawning: null, waveCooldown: 0,
  energy: 0, maxHp: 10, hp: 10, kills: 0, combo: 0, bestCombo: 0, waveStarted: false,
  towers: [], enemies: [], projectiles: [], particles: [], damageTexts: [], logs: [], mouse: { x: 480, y: 270, inside: false },
  skillCooldown: 0, skillBond: null, finishTimer: 0,
};

const arena = { left: 38, right: 922, top: 46, bot: 510, roadW: 66, sealX: 74, sealY: 108, spawnR: 30, wardR: 34, plate: 24 };
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const currentLevel = () => LEVELS[state.stage];
const beastDef = (id) => ({ ...ROSTER.find((item) => item.id === id), ...BEASTS[id] });

function pathInfo(level = currentLevel()) {
  if (level.path === 'cave') return [{ sx: 884, sy: 430, points: [[884, 430], [220, 430], [220, 280], [884, 280], [884, 108], [74, 108]] }];
  if (level.path === 'grass') return [{ sx: 884, sy: 402, points: [[884, 402], [622, 402], [498, 315], [316, 315], [200, 402], [74, 402]] }];
  if (level.path === 'sea') return [{ sx: 884, sy: 270, points: [[884, 270], [680, 138], [522, 248], [348, 116], [220, 240], [74, 152]] }];
  if (level.path === 'volcano') return [{ sx: 884, sy: 270, points: [[884, 270], [660, 270], [518, 270], [330, 270], [230, 104], [74, 104]] }, { sx: 884, sy: 270, points: [[884, 270], [660, 270], [518, 270], [330, 270], [230, 436], [74, 436]] }];
  return [{ sx: 884, sy: 270, points: [[884, 270], [660, 270], [510, 190], [322, 190], [214, 88], [74, 88]] }, { sx: 884, sy: 270, points: [[884, 270], [660, 270], [510, 350], [322, 350], [214, 452], [74, 452]] }];
}

function interpolatePath(points, distanceAlong) {
  let remaining = distanceAlong;
  for (let i = 1; i < points.length; i += 1) {
    const a = { x: points[i - 1][0], y: points[i - 1][1] };
    const b = { x: points[i][0], y: points[i][1] };
    const len = dist(a, b);
    if (remaining <= len) {
      const t = len ? remaining / len : 0;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    remaining -= len;
  }
  const last = points[points.length - 1];
  return { x: last[0], y: last[1] };
}

function pathLength(points) {
  return points.slice(1).reduce((sum, point, index) => sum + dist({ x: points[index][0], y: points[index][1] }, { x: point[0], y: point[1] }), 0);
}

function distToPath(x, y, level = currentLevel()) {
  let nearest = Infinity;
  for (const route of pathInfo(level)) {
    for (let i = 0; i < route.points.length - 1; i += 1) {
      const a = { x: route.points[i][0], y: route.points[i][1] };
      const b = { x: route.points[i + 1][0], y: route.points[i + 1][1] };
      const vx = b.x - a.x; const vy = b.y - a.y;
      const t = clamp(((x - a.x) * vx + (y - a.y) * vy) / (vx * vx + vy * vy), 0, 1);
      nearest = Math.min(nearest, Math.hypot(x - (a.x + vx * t), y - (a.y + vy * t)));
    }
  }
  return nearest;
}

function canPlaceAt(x, y, ignoreSlot = -1) {
  if (x < arena.left + arena.plate * .5 || x > arena.right - arena.plate * .5 || y < arena.top + 30 || y > arena.bot - 6) return false;
  if (distToPath(x, y) < arena.roadW * .5 + arena.plate * .5) return false;
  if (Math.hypot(x - arena.sealX, y - arena.sealY) < arena.wardR + arena.plate * .4) return false;
  for (let i = 0; i < state.towers.length; i += 1) {
    if (i === ignoreSlot) continue;
    if (Math.hypot(state.towers[i].x - x, state.towers[i].y - y) < arena.plate * 3.25) return false;
  }
  return true;
}

function loadSave() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    state.xp = Number(saved.xp) || 0;
    state.tier = Number(saved.tier) || 1;
    state.unlocked = new Set([...(saved.unlocked || STARTER_IDS), ...STARTER_IDS]);
  } catch {
    state.unlocked = new Set(STARTER_IDS);
  }
}

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ xp: state.xp, tier: state.tier, unlocked: [...state.unlocked] }));
  document.querySelector('#save-status').textContent = '本地存档已更新';
}

function showScreen(name) {
  state.screen = name;
  refs.selectScreen.classList.toggle('is-hidden', name !== 'select');
  refs.gameScreen.classList.toggle('is-hidden', name !== 'game');
  refs.resultScreen.classList.toggle('is-hidden', name !== 'result');
}

function renderSelect() {
  refs.stageList.innerHTML = LEVELS.map((level, index) => `<button class="stage-card ${index === state.stage ? 'is-selected' : ''}" data-stage="${index}" type="button"><span class="stage-number">0${index + 1}</span><span><strong>${level.name}</strong><small>${level.intro}</small></span><span class="stage-difficulty">${'◆'.repeat(index + 1)}</span></button>`).join('');
  refs.stageList.querySelectorAll('[data-stage]').forEach((button) => button.addEventListener('click', () => { state.stage = Number(button.dataset.stage); renderSelect(); }));
  refs.rosterList.innerHTML = ROSTER.map((beast) => {
    const data = beastDef(beast.id); const locked = !state.unlocked.has(beast.id);
    return `<button class="roster-card rarity-${RARITIES[beast.rarity]} ${locked ? 'is-locked' : ''}" data-beast="${beast.id}" type="button" ${locked ? 'disabled' : ''}><span class="portrait">${beast.name.slice(0, 1)}</span><strong>${beast.name}</strong><small>${RARITIES[beast.rarity]} · ${data.kindText}</small></button>`;
  }).join('');
  refs.rosterList.querySelectorAll('[data-beast]').forEach((button) => button.addEventListener('click', () => { state.selectedBeast = button.dataset.beast; renderSelect(); }));
  const chosen = beastDef(state.selectedBeast);
  refs.bondPreviewList.innerHTML = BOND_DEFS.map((bond) => `<div class="bond-row"><i class="bond-pill ${bond.members.includes(state.selectedBeast) ? 'active' : ''}" style="--bond:${bond.color}"></i><span>${bond.name}</span><strong>${bond.need}人 · ${bond.stat === 'power' ? '攻击' : bond.stat === 'haste' ? '攻速' : '范围'}</strong></div>`).join('');
  refs.codexCount.textContent = `${state.unlocked.size} / ${ROSTER.length}`;
  refs.cultivationSummary.textContent = `初始编制 · 全局战力 ×${(1 + state.tier * .04).toFixed(2)}`;
  refs.selectedStageLabel.textContent = `${LEVELS[state.stage].name} · 0${state.stage + 1} · ${chosen.name}待命`;
}

function addLog(message) {
  state.logs.unshift(message); state.logs = state.logs.slice(0, 3);
  refs.combatLog.innerHTML = state.logs.map((item) => `<div>${item}</div>`).join('');
}

function randomSummon() {
  let roll = Math.random() * SUMMON_WEIGHTS.reduce((sum, [, weight]) => sum + weight, 0);
  let rarity = 0;
  for (const [candidate, weight] of SUMMON_WEIGHTS) {
    roll -= weight;
    if (roll <= 0) { rarity = candidate; break; }
  }
  const pool = ROSTER.filter((beast) => beast.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

function summonBeast() {
  if (state.screen !== 'game' || state.paused) return;
  if (state.energy < SUMMON_COST) { addLog(`灵蕴不足，需要 ${SUMMON_COST} 点才能召唤。`); return; }
  if (state.hand.length >= MAX_HAND) { addLog('召唤栏已满，请先放置手牌中的妖灵。'); return; }
  const beast = randomSummon();
  state.energy -= SUMMON_COST;
  state.hand.push(beast.id);
  state.selectedBeast = beast.id;
  addLog(`召唤成功：${beast.name}（${RARITIES[beast.rarity]}），点击卡牌后放置。`);
  renderGameRoster();
  updateHUD();
}

function initGame() {
  state.paused = false; state.speed = 1; state.wave = 0; state.waveTimer = 0; state.spawning = null; state.waveCooldown = 0;
  state.energy = currentLevel().essence; state.hp = state.maxHp; state.kills = 0; state.combo = 0; state.bestCombo = 0;
  state.towers = []; state.hand = []; state.selectedBeast = null; state.enemies = []; state.projectiles = []; state.particles = []; state.damageTexts = []; state.skillCooldown = 0; state.skillBond = null;
  showScreen('game'); refs.gameTerrain.textContent = currentLevel().name; refs.gameLevel.textContent = `第 ${state.stage + 1} 关`; addLog('点击“召唤妖灵”，随机获得 N 至 UR 妖灵。'); renderGameRoster(); renderGameBonds(); startWave(); updateHUD();
}

function startWave() {
  if (state.wave >= 21 || state.wave >= 8 + state.stage * 3) return;
  const groups = WAVES[state.wave];
  state.spawning = groups.map(([type, count, gap, delay, hpMul], index) => ({ type, count, gap, delay, hpMul, spawned: 0, timer: delay, route: index % pathInfo().length }));
  state.waveStarted = true; state.waveTimer = 0;
  refs.waveLabel.textContent = `${state.wave + 1} / ${8 + state.stage * 3}`;
  addLog(`第 ${state.wave + 1} 波：${groups.length > 1 ? '多组敌人交错出现' : '敌群进入道路'}`);
}

function spawnFromGroups(dt) {
  if (!state.spawning) {
    if (state.waveCooldown > 0) {
      state.waveCooldown -= dt;
      if (state.waveCooldown <= 0) startWave();
    }
    return;
  }
  let allDone = true;
  state.spawning.forEach((group) => {
    group.timer -= dt;
    if (group.spawned < group.count) {
      allDone = false;
      if (group.timer <= 0) { spawnEnemy(group.type, group.hpMul, group.route); group.spawned += 1; group.timer = group.gap; }
    }
  });
  if (allDone && state.enemies.length === 0) {
    state.spawning = null; state.wave += 1; state.waveCooldown = 2.4;
    if (state.wave >= 8 + state.stage * 3) { finishGame(true); }
  }
}

function spawnEnemy(type, hpMul, routeIndex = 0) {
  const def = ENEMIES[type]; const route = pathInfo()[routeIndex] || pathInfo()[0];
  const enemy = { type, def, x: route.sx, y: route.sy, d: 0, route: routeIndex, routePoints: route.points, routeLength: pathLength(route.points), hp: def.hp * currentLevel().hpMul * hpMul, maxHp: def.hp * currentLevel().hpMul * hpMul, speed: def.speed * currentLevel().spdMul, radius: def.radius, shield: def.shield || 0, armor: def.armor || 0, slow: 0, slowTimer: 0, burnTimer: 0, burnDps: 0, stealthTimer: def.stealth ? 2 : 0, revived: false, split: false, lastHitBy: null, hitCount: 0, hitTarget: null, skillTimer: 4 + Math.random() * 3 };
  state.enemies.push(enemy);
}

function incomingDamage(enemy) { return state.projectiles.reduce((sum, projectile) => projectile.target === enemy ? sum + projectile.amount : sum, 0); }

function bondsForTowers() {
  const totals = { power: 0, haste: 0, range: 0, cdr: 0, sunder: 0, enemySlow: 0 };
  const active = [];
  for (const bond of BOND_DEFS) {
    const members = state.towers.filter((tower) => bond.members.includes(tower.id));
    if (members.length < bond.need) continue;
    const formation = formationScore(bond.shape, members);
    const formed = formation >= .5;
    const contribution = bond.bonus + Math.max(0, members.length - bond.need) * bond.stepBonus;
    const adjusted = formed ? contribution : contribution * .5;
    totals[bond.stat] += adjusted;
    active.push({ ...bond, members, formation, formed, adjusted });
  }
  totals.power = Math.min(1.2, totals.power); totals.haste = Math.min(.7, totals.haste); totals.range = Math.min(.45, totals.range); totals.cdr = Math.min(.6, totals.cdr); totals.sunder = Math.min(.45, totals.sunder); totals.enemySlow = Math.min(.45, totals.enemySlow);
  state.skillBond = active.find((bond) => bond.ult && bond.formed && bond.members.length >= bond.need) || null;
  return { totals, active };
}

function formationScore(shape, members) {
  if (members.length < 2) return 0;
  const points = members.map((member) => ({ x: member.x, y: member.y }));
  const center = points.reduce((out, point) => ({ x: out.x + point.x / points.length, y: out.y + point.y / points.length }), { x: 0, y: 0 });
  const radii = points.map((point) => Math.hypot(point.x - center.x, point.y - center.y));
  const radius = radii.reduce((sum, value) => sum + value, 0) / radii.length;
  const spread = Math.max(...points.map((a) => Math.max(...points.map((b) => dist(a, b)))));
  if (shape === 'cluster') return spread < 50 ? 1 : spread > 210 ? 0 : clamp(1 - (spread - 50) / 160, 0, 1);
  if (shape === 'line') {
    const horizontal = Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x));
    const vertical = Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y));
    return Math.max(horizontal, vertical) < 60 ? 0 : clamp(1 - Math.min(horizontal, vertical) / 64, 0, 1);
  }
  if (shape === 'triangle') {
    if (members.length < 3 || radius < 45) return 0;
    const angular = points.map((point) => Math.atan2(point.y - center.y, point.x - center.x)).sort((a, b) => a - b);
    const gaps = angular.map((angle, index) => (angular[(index + 1) % angular.length] - angle + Math.PI * 2) % (Math.PI * 2));
    return clamp(Math.min(1 - (Math.max(...radii) - Math.min(...radii)) / 42, 1 - Math.abs(Math.max(...gaps) - Math.PI * 2 / 3) / 1.8), 0, 1);
  }
  if (shape === 'square') {
    if (members.length < 4 || radius < 45) return 0;
    const angular = points.map((point) => Math.atan2(point.y - center.y, point.x - center.x)).sort((a, b) => a - b);
    const gaps = angular.map((angle, index) => (angular[(index + 1) % angular.length] - angle + Math.PI * 2) % (Math.PI * 2));
    return clamp(Math.min(1 - (Math.max(...radii) - Math.min(...radii)) / 42, 1 - Math.abs(Math.max(...gaps) - Math.PI / 2) / 1.5), 0, 1);
  }
  return 1;
}

function updateTowers(dt) {
  const bondState = bondsForTowers();
  state.towers.forEach((tower) => {
    const def = beastDef(tower.id);
    tower.cd -= dt * state.speed * (1 + bondState.totals.haste);
    if (tower.cd > 0) return;
    const range = def.range * (1 + bondState.totals.range);
    let target = state.enemies.filter((enemy) => enemy.hp > 0 && enemy.stealthTimer <= 0 && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range && enemy.hp - incomingDamage(enemy) > 0).sort((a, b) => b.d - a.d)[0];
    if (!target) target = state.enemies.filter((enemy) => enemy.hp > 0 && enemy.stealthTimer <= 0 && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range).sort((a, b) => b.d - a.d)[0];
    if (!target) return;
    if (tower.hitTarget === target) tower.hitCount += 1; else { tower.hitTarget = target; tower.hitCount = 1; }
    const special = def.stunEvery && tower.hitCount % def.stunEvery === 0 ? -1 : def.breakAt && tower.hitCount % def.breakAt === 0 ? -2 : 0;
    const power = def.dmg * (1 + bondState.totals.power) * (1 + (tower.level - 1) * .26) * (1 + state.tier * .04);
    state.projectiles.push({ x: tower.x, y: tower.y, target, amount: power, speed: def.projSpeed, def, source: tower, life: special, trail: [] });
    tower.cd = def.interval / Math.max(.35, def.rate || 1);
  });
}

function targetDamage(enemy, amount, def, special, source) {
  let final = amount;
  if (def.dmgType === 'phy' && enemy.def.immunePhy) return 0;
  if (def.dmgType === 'mag' && enemy.def.immuneMag) return 0;
  if (enemy.shield > 0) {
    if (!def.counters.includes('breakShield')) return 0;
    enemy.shield = Math.max(0, enemy.shield - amount); burst(enemy.x, enemy.y, '#9bd2dd', 7); return 0;
  }
  final *= Math.max(.35, 1 - Math.max(0, enemy.armor - bondTotals().sunder * 40) / 100);
  if (special === -2) final *= 1.2;
  if (special === -1) enemy.stunned = Math.max(enemy.stunned || 0, 1.2);
  if (def.counters.includes('execute') && enemy.hp / enemy.maxHp < .25) final *= 1.6;
  enemy.lastHitBy = source;
  return final;
}

function bondTotals() { return bondsForTowers().totals; }

function damageEnemy(enemy, amount, def, special = 0, source = null) {
  if (!enemy || enemy.hp <= 0) return;
  const final = targetDamage(enemy, amount, def, special, source);
  if (final <= 0) { addDamageText(enemy.x, enemy.y, def.dmgType === 'true' ? '免疫' : '破免', '#b7b5aa'); return; }
  enemy.hp -= final; addDamageText(enemy.x, enemy.y, Math.round(final), def.color);
  if (def.burn) { enemy.burnTimer = Math.max(enemy.burnTimer, 4); enemy.burnDps = Math.max(enemy.burnDps, def.dmg * (def.burnDps || .22)); }
  if (def.slow) { enemy.slow = Math.max(enemy.slow, def.slow); enemy.slowTimer = Math.max(enemy.slowTimer, def.slowDur); }
  burst(enemy.x, enemy.y, def.color, 5);
  if (enemy.hp <= 0) killEnemy(enemy);
}

function applyProjectile(projectile) {
  const enemy = projectile.target; const def = projectile.def;
  if (!enemy || enemy.hp <= 0) return;
  damageEnemy(enemy, projectile.amount, def, projectile.life, projectile.source);
  if (def.splash) {
    state.enemies.filter((item) => item !== enemy && item.hp > 0 && Math.hypot(item.x - enemy.x, item.y - enemy.y) <= def.splash).forEach((item) => damageEnemy(item, projectile.amount * .7, def, 0, projectile.source));
  }
  if (def.chain) {
    let from = enemy; const visited = new Set([enemy]);
    for (let hop = 0; hop < def.chain; hop += 1) {
      const next = state.enemies.filter((item) => item.hp > 0 && !visited.has(item) && Math.hypot(item.x - from.x, item.y - from.y) <= 130).sort((a, b) => dist(from, a) - dist(from, b))[0];
      if (!next) break; visited.add(next); damageEnemy(next, projectile.amount * .65, def, 0, projectile.source); from = next;
    }
  }
}

function updateProjectiles(dt) {
  state.projectiles = state.projectiles.filter((projectile) => {
    if (!projectile.target || projectile.target.hp <= 0) return false;
    const dx = projectile.target.x - projectile.x; const dy = projectile.target.y - projectile.y; const distance = Math.hypot(dx, dy); const step = projectile.speed * dt * state.speed;
    projectile.x += dx / Math.max(distance, 1) * step; projectile.y += dy / Math.max(distance, 1) * step;
    projectile.trail.push({ x: projectile.x, y: projectile.y }); if (projectile.trail.length > 5) projectile.trail.shift();
    if (distance < step + projectile.target.radius) { applyProjectile(projectile); return false; }
    return true;
  });
}

function updateEnemies(dt) {
  const totals = bondTotals();
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    enemy.slowTimer -= dt; if (enemy.slowTimer <= 0) enemy.slow = 0;
    enemy.stealthTimer -= dt; enemy.stunned = Math.max(0, (enemy.stunned || 0) - dt);
    if (enemy.burnTimer > 0) { enemy.burnTimer -= dt; damageEnemy(enemy, enemy.burnDps * dt, { dmgType: 'true', counters: [], color: '#eb8d4f', burn: false }); }
    if (enemy.def.skill === 'heal') { enemy.skillTimer -= dt; if (enemy.skillTimer <= 0) { enemy.skillTimer = 7; const heal = enemy.maxHp * .08; enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal); addDamageText(enemy.x, enemy.y - 20, `+${Math.round(heal)}`, '#83c8a7'); } }
    if (enemy.stunned > 0) continue;
    const route = enemy.routePoints; const next = interpolatePath(route, enemy.d); enemy.x = next.x; enemy.y = next.y;
    enemy.d += enemy.speed * (1 - enemy.slow) * (1 - totals.enemySlow) * dt * state.speed;
    if (enemy.d >= enemy.routeLength) { enemy.hp = 0; state.hp -= enemy.def.boss ? 2 : 1; state.combo = 0; addLog(`${enemy.def.name}冲过了封印，完整度下降。`); }
  }
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
  if (state.hp <= 0) finishGame(false);
}

function killEnemy(enemy) {
  if (enemy.def.skill === 'revive' && !enemy.revived) { enemy.revived = true; enemy.hp = enemy.maxHp * .35; enemy.shield = 120; addLog(`${enemy.def.name}触发复活，获得临时护盾。`); return; }
  if (enemy.def.skill === 'split' && !enemy.split) {
    enemy.split = true;
    for (let i = 0; i < 2; i += 1) spawnEnemy('xingxing', .55, enemy.route);
  }
  state.kills += enemy.def.reward; state.combo += 1; state.bestCombo = Math.max(state.bestCombo, state.combo); state.energy = Math.min(140, state.energy + enemy.def.reward * 2); state.xp += enemy.def.reward; burst(enemy.x, enemy.y, enemy.def.color, enemy.def.boss ? 18 : 8);
}

function finishGame(won) {
  if (state.screen !== 'game') return;
  state.screen = 'finishing'; state.finishTimer = 0;
  if (won) { const unlock = ROSTER.find((beast) => !state.unlocked.has(beast.id) && beast.rarity <= Math.min(4, state.stage + 1)); if (unlock) state.unlocked.add(unlock.id); state.tier = Math.max(state.tier, 1 + Math.floor(state.xp / 30)); saveProgress(); }
  refs.resultTitle.textContent = won ? '封印守住了' : '封印被突破'; refs.resultStage.textContent = `${currentLevel().name} · 0${state.stage + 1}`; refs.resultKills.textContent = state.kills; refs.resultXp.textContent = won ? `+${currentLevel().essence}` : '+0'; refs.resultCombo.textContent = state.bestCombo; refs.resultCopy.textContent = won ? `你在${currentLevel().name}完成了 ${8 + state.stage * 3} 波防守。阵型、伤害类型和出怪口之间的取舍已经生效。` : '道路上仍有空缺。优先补上交叉火力，再处理护盾与隐匿敌人。'; showScreen('result');
}

function addDamageText(x, y, text, color) { state.damageTexts.push({ x, y, text, color, life: 1 }); }
function burst(x, y, color, count = 6) { for (let i = 0; i < count; i += 1) state.particles.push({ x, y, dx: (Math.random() - .5) * 80, dy: (Math.random() - .5) * 80, color, life: .55 + Math.random() * .35 }); }
function updateEffects(dt) { state.particles = state.particles.filter((item) => { item.life -= dt; item.x += item.dx * dt; item.y += item.dy * dt; return item.life > 0; }); state.damageTexts = state.damageTexts.filter((item) => { item.life -= dt; item.y -= dt * 18; return item.life > 0; }); }

function placeTower(x, y) {
  if (!state.selectedBeast) { addLog('请先点击“召唤妖灵”获得一张手牌。'); return; }
  if (state.towers.length >= state.maxPopulation) { addLog('人口已满，无法继续部署妖灵。'); return; }
  if (!canPlaceAt(x, y)) { addLog(distToPath(x, y) < arena.roadW * .5 + arena.plate * .5 ? '不能放在怪物行进的道路上。' : '此处不能安置。'); return; }
  const def = beastDef(state.selectedBeast);
  const handIndex = state.hand.indexOf(state.selectedBeast);
  if (handIndex < 0) { state.selectedBeast = null; renderGameRoster(); return; }
  state.towers.push({ id: state.selectedBeast, x, y, level: 1, cd: .15, hitTarget: null, hitCount: 0 });
  state.hand.splice(handIndex, 1);
  state.selectedBeast = state.hand[0] || null;
  addLog(`${def.name}已安置，注意与队友保持阵型间距。`); renderGameRoster(); renderGameBonds(); updateHUD();
}

function renderGameRoster() {
  refs.gameRoster.innerHTML = [...state.unlocked].map((id) => { const beast = beastDef(id); return `<button class="game-card rarity-${RARITIES[beast.rarity]} ${state.selectedBeast === id ? 'is-selected' : ''}" data-beast="${id}" type="button"><span class="portrait">${beast.name.slice(0, 1)}</span><span><strong>${beast.name}</strong><small>${beast.kindText}</small></span><em>${beast.cost}</em></button>`; }).join('');
  refs.gameRoster.querySelectorAll('[data-beast]').forEach((button) => button.addEventListener('click', () => { state.selectedBeast = button.dataset.beast; renderGameRoster(); }));
}

function renderGameBonds() {
  const { active } = bondsForTowers();
  refs.gameBonds.innerHTML = BOND_DEFS.map((bond) => { const current = active.find((item) => item.id === bond.id); const count = state.towers.filter((tower) => bond.members.includes(tower.id)).length; return `<div class="bond-row"><i class="bond-pill ${current ? 'active' : ''}" style="background:${bond.color}"></i><span>${bond.name}</span><strong>${count}/${bond.need}${current ? ` · ${Math.round(current.adjusted * 100)}%` : ''}</strong></div>`; }).join('');
  refs.skillLabel.textContent = state.skillBond ? (state.skillCooldown > 0 ? `${state.skillCooldown.toFixed(1)}s` : state.skillBond.ult) : '未就绪';
}

function updateHUD() {
  refs.hpLabel.textContent = `${Math.max(0, state.hp)} / ${state.maxHp}`; refs.hpMeter.style.width = `${clamp(state.hp / state.maxHp * 100, 0, 100)}%`; refs.essenceLabel.textContent = Math.floor(state.energy); refs.killLabel.textContent = state.kills; refs.waveLabel.textContent = `${Math.min(state.wave + 1, 8 + state.stage * 3)} / ${8 + state.stage * 3}`;
  refs.waveTrack.innerHTML = Array.from({ length: 8 + state.stage * 3 }, (_, index) => `<i class="${index < state.wave ? 'done' : index === state.wave ? 'current' : ''}"></i>`).join(''); refs.pauseGame.textContent = state.paused ? '继续' : '暂停'; refs.speedGame.textContent = `${state.speed}×`; refs.populationLabel.textContent = `${state.towers.length} / ${state.maxPopulation}`; refs.summonBeast.disabled = state.energy < SUMMON_COST || state.hand.length >= MAX_HAND; refs.summonBeast.textContent = `召唤妖灵 ${SUMMON_COST}`; renderGameBonds();
}

function useSkill() {
  if (!state.skillBond || state.skillCooldown > 0) return;
  const bond = state.skillBond; const source = state.towers[0] || { id: 'bond' }; const amount = 120 * bond.ultMul * (1 + bondTotals().power);
  state.enemies.forEach((enemy) => damageEnemy(enemy, amount, { dmgType: 'true', counters: ['execute', 'breakShield', 'purge'], color: bond.color }, 0, source)); state.skillCooldown = 18 * Math.max(.35, 1 - bondTotals().cdr); addLog(`${bond.ult}发动：全场真伤，${bond.name}完成联动。`); renderGameBonds();
}

function drawPath(route, level) {
  const roadTint = state.stage === 0 ? '#c7a56e' : level.tint; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(61, 45, 28, .82)'; ctx.lineWidth = arena.roadW + 12; ctx.beginPath(); route.points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.strokeStyle = roadTint; ctx.lineWidth = arena.roadW; ctx.beginPath(); route.points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.strokeStyle = 'rgba(255, 237, 190, .42)'; ctx.lineWidth = 2; ctx.setLineDash([7, 10]); ctx.beginPath(); route.points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.setLineDash([]);
}

function drawCanvas() {
  const level = currentLevel(); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#152124'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (biomeAtlas.complete && biomeAtlas.naturalWidth) { const panelW = biomeAtlas.naturalWidth / 5; ctx.globalAlpha = .22; ctx.drawImage(biomeAtlas, panelW * state.stage, 0, panelW, biomeAtlas.naturalHeight, 0, 0, canvas.width, canvas.height); ctx.globalAlpha = 1; }
  ctx.strokeStyle = 'rgba(241,236,223,.045)'; ctx.lineWidth = 1; for (let x = 20; x < canvas.width; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); } for (let y = 20; y < canvas.height; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
  pathInfo(level).forEach((route) => drawPath(route, level));
  ctx.fillStyle = '#d86c4e'; ctx.strokeStyle = '#e4b45d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(arena.sealX, arena.sealY, arena.wardR, 0, Math.PI * 2); ctx.fillStyle = 'rgba(216,108,78,.18)'; ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e4b45d'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('封印', arena.sealX, arena.sealY + 4);
  pathInfo(level).forEach((route) => { ctx.strokeStyle = '#d86c4e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(route.sx, route.sy, 21, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#d86c4e'; ctx.fillText('裂口', route.sx, route.sy + 4); });
  if (state.mouse.inside && state.selectedBeast) { const legal = canPlaceAt(state.mouse.x, state.mouse.y); ctx.strokeStyle = legal ? 'rgba(118,205,183,.65)' : 'rgba(216,108,78,.7)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(state.mouse.x, state.mouse.y, 39, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); for (let gy = -1; gy <= 1; gy += 1) for (let gx = -1; gx <= 1; gx += 1) { const hx = state.mouse.x + gx * arena.plate * 3.25; const hy = state.mouse.y + gy * arena.plate * 3.25; if (canPlaceAt(hx, hy)) { ctx.fillStyle = 'rgba(118,205,183,.38)'; ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2); ctx.fill(); } } }
  state.towers.forEach((tower) => drawTower(tower)); state.enemies.forEach((enemy) => drawEnemy(enemy)); state.projectiles.forEach((projectile) => drawProjectile(projectile)); state.particles.forEach((item) => { ctx.globalAlpha = clamp(item.life, 0, 1); ctx.fillStyle = item.color; ctx.beginPath(); ctx.arc(item.x, item.y, 2 + item.life * 3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }); state.damageTexts.forEach((item) => { ctx.globalAlpha = clamp(item.life, 0, 1); ctx.fillStyle = item.color; ctx.font = 'bold 12px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(item.text, item.x, item.y); ctx.globalAlpha = 1; });
}

function drawTower(tower) { const def = beastDef(tower.id); ctx.save(); ctx.translate(tower.x, tower.y); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 16, 21, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = def.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = `${def.color}35`; ctx.fill(); ctx.fillStyle = def.color; ctx.font = 'bold 18px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(def.name.slice(0, 1), 0, 6); ctx.fillStyle = '#f1ecdf'; ctx.font = '9px Segoe UI'; ctx.fillText(`L${tower.level}`, 0, 31); ctx.restore(); }
function drawEnemy(enemy) { ctx.save(); ctx.translate(enemy.x, enemy.y); ctx.globalAlpha = enemy.stealthTimer > 0 ? .3 : 1; ctx.fillStyle = enemy.def.color; ctx.beginPath(); ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = enemy.shield > 0 ? '#b5e8e6' : '#1c2829'; ctx.lineWidth = enemy.shield > 0 ? 3 : 1; ctx.stroke(); ctx.fillStyle = '#f1ecdf'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(enemy.def.name.slice(0, 1), 0, 3); ctx.fillStyle = '#2b3839'; ctx.fillRect(-enemy.radius, -enemy.radius - 9, enemy.radius * 2, 4); ctx.fillStyle = enemy.hp / enemy.maxHp < .25 ? '#e4b45d' : '#76c1a5'; ctx.fillRect(-enemy.radius, -enemy.radius - 9, enemy.radius * 2 * clamp(enemy.hp / enemy.maxHp, 0, 1), 4); ctx.restore(); }
function drawProjectile(projectile) { ctx.save(); ctx.strokeStyle = projectile.def.color; ctx.lineWidth = 2; ctx.globalAlpha = .5; if (projectile.trail.length > 1) { ctx.beginPath(); projectile.trail.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.stroke(); } ctx.globalAlpha = 1; ctx.fillStyle = projectile.def.color; ctx.beginPath(); ctx.arc(projectile.x, projectile.y, projectile.def.proj === 'quake' ? 5 : 3, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }

function renderSelect() {
  const selectionId = state.selectedBeast || STARTER_IDS[0];
  refs.stageList.innerHTML = LEVELS.map((level, index) => `<button class="stage-card ${index === state.stage ? 'is-selected' : ''}" data-stage="${index}" type="button"><span class="stage-number">0${index + 1}</span><span><strong>${level.name}</strong><small>${level.intro}</small></span><span class="stage-difficulty">${'+'.repeat(index + 1)}</span></button>`).join('');
  refs.stageList.querySelectorAll('[data-stage]').forEach((button) => button.addEventListener('click', () => { state.stage = Number(button.dataset.stage); renderSelect(); }));
  refs.rosterList.innerHTML = ROSTER.map((beast) => {
    const data = beastDef(beast.id); const locked = !state.unlocked.has(beast.id); const portraitX = beast.portraitIndex % 6; const portraitY = Math.floor(beast.portraitIndex / 6);
    return `<button class="roster-card rarity-${RARITIES[beast.rarity]} ${locked ? 'is-locked' : ''} ${selectionId === beast.id ? 'is-selected' : ''}" data-beast="${beast.id}" type="button" ${locked ? 'disabled' : ''}><span class="portrait portrait-image" style="--portrait-x:${portraitX};--portrait-y:${portraitY}"></span><strong>${beast.name}</strong><small>${RARITIES[beast.rarity]} · ${data.kindText}</small></button>`;
  }).join('');
  refs.rosterList.querySelectorAll('[data-beast]').forEach((button) => button.addEventListener('click', () => { state.selectedBeast = button.dataset.beast; renderSelect(); }));
  const chosen = beastDef(selectionId);
  refs.bondPreviewList.innerHTML = BOND_DEFS.map((bond) => `<div class="bond-row"><i class="bond-pill ${bond.members.includes(selectionId) ? 'active' : ''}" style="--bond:${bond.color}"></i><span>${bond.name}</span><strong>${bond.need} · ${bond.stat === 'power' ? '攻击' : bond.stat === 'haste' ? '攻速' : '范围'}</strong></div>`).join('');
  refs.codexCount.textContent = `${state.unlocked.size} / ${ROSTER.length}`;
  refs.cultivationSummary.textContent = `初始编制 · 全局战力 ×${(1 + state.tier * .04).toFixed(2)}`;
  refs.selectedStageLabel.textContent = `${LEVELS[state.stage].name} · 0${state.stage + 1} · ${chosen.name}待命`;
}

function renderGameRoster() {
  if (!state.hand.length) { refs.gameRoster.innerHTML = '<div class="summon-empty">暂无手牌，点击上方“召唤妖灵”</div>'; return; }
  refs.gameRoster.innerHTML = state.hand.map((id, index) => { const beast = beastDef(id); const portraitX = beast.portraitIndex % 6; const portraitY = Math.floor(beast.portraitIndex / 6); return `<button class="game-card rarity-${RARITIES[beast.rarity]} ${state.selectedBeast === id ? 'is-selected' : ''}" data-hand-index="${index}" type="button"><span class="portrait portrait-image" style="--portrait-x:${portraitX};--portrait-y:${portraitY}"></span><span><strong>${beast.name}</strong><small>${RARITIES[beast.rarity]} · ${beast.kindText}</small></span><em>${beast.cost}</em></button>`; }).join('');
  refs.gameRoster.querySelectorAll('[data-hand-index]').forEach((button) => button.addEventListener('click', () => { state.selectedBeast = state.hand[Number(button.dataset.handIndex)]; renderGameRoster(); }));
}

function drawCanvas() {
  const level = currentLevel(); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#152124'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const stageBackground = stageBackgrounds[state.stage];
  if (stageBackground?.complete && stageBackground.naturalWidth) { ctx.globalAlpha = .96; ctx.drawImage(stageBackground, 0, 0, stageBackground.naturalWidth, stageBackground.naturalHeight, 0, 0, canvas.width, canvas.height); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(111, 87, 48, .10)'; ctx.fillRect(0, 0, canvas.width, canvas.height); } else if (state.stage === 0 && caveBattlefield.complete && caveBattlefield.naturalWidth) { ctx.globalAlpha = .96; ctx.drawImage(caveBattlefield, 0, 0, caveBattlefield.naturalWidth, caveBattlefield.naturalHeight, 0, 0, canvas.width, canvas.height); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(111, 87, 48, .12)'; ctx.fillRect(0, 0, canvas.width, canvas.height); } else if (biomeAtlas.complete && biomeAtlas.naturalWidth) { const panelW = biomeAtlas.naturalWidth / 5; ctx.globalAlpha = .72; ctx.drawImage(biomeAtlas, panelW * state.stage, 0, panelW, biomeAtlas.naturalHeight, 0, 0, canvas.width, canvas.height); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(8, 17, 20, .12)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.strokeStyle = 'rgba(241,236,223,.045)'; ctx.lineWidth = 1; for (let x = 20; x < canvas.width; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); } for (let y = 20; y < canvas.height; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
  pathInfo(level).forEach((route) => drawPath(route, level));
  ctx.fillStyle = 'rgba(216,108,78,.28)'; ctx.strokeStyle = '#e4b45d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(arena.sealX, arena.sealY, arena.wardR, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e4b45d'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('封印', arena.sealX, arena.sealY + 4);
  pathInfo(level).forEach((route) => { ctx.strokeStyle = '#d86c4e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(route.sx, route.sy, 21, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#d86c4e'; ctx.fillText('裂口', route.sx, route.sy + 4); });
  if (state.mouse.inside && state.selectedBeast) { const legal = canPlaceAt(state.mouse.x, state.mouse.y); ctx.strokeStyle = legal ? 'rgba(118,205,183,.65)' : 'rgba(216,108,78,.7)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(state.mouse.x, state.mouse.y, 39, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); for (let gy = -1; gy <= 1; gy += 1) for (let gx = -1; gx <= 1; gx += 1) { const hx = state.mouse.x + gx * arena.plate * 3.25; const hy = state.mouse.y + gy * arena.plate * 3.25; if (canPlaceAt(hx, hy)) { ctx.fillStyle = 'rgba(118,205,183,.38)'; ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2); ctx.fill(); } } }
  state.towers.forEach((tower) => drawTower(tower)); state.enemies.forEach((enemy) => drawEnemy(enemy)); state.projectiles.forEach((projectile) => drawProjectile(projectile)); state.particles.forEach((item) => { ctx.globalAlpha = clamp(item.life, 0, 1); ctx.fillStyle = item.color; ctx.beginPath(); ctx.arc(item.x, item.y, 2 + item.life * 3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }); state.damageTexts.forEach((item) => { ctx.globalAlpha = clamp(item.life, 0, 1); ctx.fillStyle = item.color; ctx.font = 'bold 12px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(item.text, item.x, item.y); ctx.globalAlpha = 1; });
}

function drawTower(tower) {
  const def = beastDef(tower.id); ctx.save(); ctx.translate(tower.x, tower.y); ctx.fillStyle = 'rgba(0,0,0,.34)'; ctx.beginPath(); ctx.ellipse(0, 20, 27, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = def.color; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.stroke();
  if (beastAtlas.complete && beastAtlas.naturalWidth) { const cellW = beastAtlas.naturalWidth / 6; const cellH = beastAtlas.naturalHeight / 5; const sx = (def.portraitIndex % 6) * cellW; const sy = Math.floor(def.portraitIndex / 6) * cellH; ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 23, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(beastAtlas, sx, sy, cellW, cellH, -25, -25, 50, 50); ctx.restore(); } else { ctx.fillStyle = def.color; ctx.font = 'bold 18px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(def.name.slice(0, 1), 0, 6); }
  ctx.fillStyle = 'rgba(8,17,20,.78)'; ctx.fillRect(-14, 27, 28, 12); ctx.fillStyle = '#f1ecdf'; ctx.font = 'bold 9px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(`L${tower.level}`, 0, 36); ctx.restore();
}

function drawEnemy(enemy) {
  ctx.save(); ctx.translate(enemy.x, enemy.y); ctx.globalAlpha = enemy.stealthTimer > 0 ? .32 : 1; const radius = enemy.radius * 1.35;
  if (enemyAtlas.complete && enemyAtlas.naturalWidth) { const cellW = enemyAtlas.naturalWidth / 5; const cellH = enemyAtlas.naturalHeight / 2; const sx = (enemy.def.sprite % 5) * cellW; const sy = Math.floor(enemy.def.sprite / 5) * cellH; ctx.save(); ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(enemyAtlas, sx, sy, cellW, cellH, -radius, -radius, radius * 2, radius * 2); ctx.restore(); } else { ctx.fillStyle = enemy.def.color; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#f1ecdf'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(enemy.def.name.slice(0, 1), 0, 3); }
  ctx.globalAlpha = 1; ctx.strokeStyle = enemy.shield > 0 ? '#b5e8e6' : '#1c2829'; ctx.lineWidth = enemy.shield > 0 ? 3 : 1; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#2b3839'; ctx.fillRect(-radius, -radius - 10, radius * 2, 4); ctx.fillStyle = enemy.hp / enemy.maxHp < .25 ? '#e4b45d' : '#76c1a5'; ctx.fillRect(-radius, -radius - 10, radius * 2 * clamp(enemy.hp / enemy.maxHp, 0, 1), 4); ctx.restore();
}

function renderCodex() {
  const projectileNames = { ember: '焰火', splash: '溅射', wisp: '灵光', claw: '裂爪', quake: '地裂' };
  const counterNames = { purge: '破法', execute: '斩杀', breakShield: '破盾', splash: '溅射', insight: '洞察' };
  refs.codexDialogList.innerHTML = ROSTER.map((beast) => {
    const data = beastDef(beast.id); const effects = [data.burn ? '灼烧' : '', data.splash ? `溅射 ${data.splash}` : '', data.chain ? `连锁 ${data.chain}` : '', data.slow ? `减速 ${Math.round(data.slow * 100)}%` : '', data.stunEvery ? `每 ${data.stunEvery} 次眩晕` : '', data.breakAt ? `第 ${data.breakAt} 击破甲` : ''].filter(Boolean).join(' · ') || '基础攻击';
    return `<article class="codex-entry rarity-${RARITIES[beast.rarity]}"><span class="portrait portrait-image" style="--portrait-x:${beast.portraitIndex % 6};--portrait-y:${Math.floor(beast.portraitIndex / 6)}"></span><div class="codex-entry-head"><strong>${beast.name}</strong><em>${RARITIES[beast.rarity]}</em></div><small>${projectileNames[data.proj] || data.proj} · ${data.dmgType === 'mag' ? '法术' : data.dmgType === 'true' ? '真实' : '物理'} · ${counterNames[data.counters?.[0]] || '无克制'}</small><dl><div><dt>攻击</dt><dd>${data.dmg}</dd></div><div><dt>攻速</dt><dd>${data.interval.toFixed(2)}s</dd></div><div><dt>范围</dt><dd>${data.range}</dd></div><div><dt>召唤</dt><dd>${data.cost}</dd></div></dl><p>${effects}</p></article>`;
  }).join('');
}

function tick(timestamp) {
  const rawDt = Math.min(.05, (timestamp - state.lastTime) / 1000 || 0); state.lastTime = timestamp;
  if (state.screen === 'game' && !state.paused) {
    const dt = rawDt * state.speed; state.skillCooldown = Math.max(0, state.skillCooldown - dt); spawnFromGroups(dt); updateTowers(dt); updateProjectiles(dt); updateEnemies(dt); updateEffects(dt); updateHUD();
  }
  if (state.screen === 'game' || state.screen === 'finishing') drawCanvas(); requestAnimationFrame(tick);
}

function canvasPoint(event) { const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }; }
canvas.addEventListener('pointermove', (event) => { Object.assign(state.mouse, canvasPoint(event), { inside: true }); });
canvas.addEventListener('pointerleave', () => { state.mouse.inside = false; });
canvas.addEventListener('pointerdown', (event) => { if (state.screen !== 'game' || state.paused) return; const point = canvasPoint(event); placeTower(point.x, point.y); });
refs.startGame.addEventListener('click', initGame);
refs.summonBeast.addEventListener('click', summonBeast);
refs.codexOpen.addEventListener('click', () => { renderCodex(); refs.codexDialog.showModal(); });
refs.codexClose.addEventListener('click', () => refs.codexDialog.close());
refs.codexDialog.addEventListener('click', (event) => { if (event.target === refs.codexDialog) refs.codexDialog.close(); });
refs.backToSelect.addEventListener('click', () => { showScreen('select'); renderSelect(); });
refs.returnSelect.addEventListener('click', () => { showScreen('select'); renderSelect(); });
refs.replayGame.addEventListener('click', initGame);
refs.pauseGame.addEventListener('click', () => { state.paused = !state.paused; updateHUD(); });
refs.speedGame.addEventListener('click', () => { state.speed = state.speed === 1 ? 2 : 1; updateHUD(); });
refs.teamSkill.addEventListener('click', useSkill);
document.querySelector('#reset-save').addEventListener('click', () => { localStorage.removeItem(SAVE_KEY); loadSave(); renderSelect(); document.querySelector('#save-status').textContent = '存档已重置'; });

loadSave(); renderSelect(); showScreen('select'); requestAnimationFrame(tick);

window.__shanHaiDebug = { state, ROSTER, BEASTS, BOND_DEFS, LEVELS, WAVES, canPlaceAt, formationScore, pathInfo };
