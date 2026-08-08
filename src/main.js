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
const ROAD_PALETTES = [
  ['#5b4630', '#bea06a', '#f1dca6'],
  ['#493b2b', '#b58e55', '#e5c98b'],
  ['#3d5554', '#91aaa4', '#d3e0d8'],
  ['#2c211d', '#594139', '#e08a4d'],
  ['#596364', '#b9c9c3', '#edf0da'],
];
const beastAtlas = document.createElement('img');
beastAtlas.src = './assets/beast-atlas.png';
const enemyAtlas = document.createElement('img');
enemyAtlas.src = './assets/enemy-atlas.png';
const combatSpriteSources = {
  bifang: './assets/sprites/bifang-3d.png',
  fuzhu: './assets/sprites/fuzhu-3d.png',
  jiuwei: './assets/sprites/jiuwei-3d.png',
  tiangou: './assets/sprites/tiangou-3d.png',
  xuangui: './assets/sprites/xuangui-3d.png',
  shengsheng: './assets/sprites/shengsheng-3d.png',
  kaiming: './assets/sprites/kaiming-3d.png',
  bo: './assets/sprites/bo-3d.png',
  zheng: './assets/sprites/zheng-3d.png',
  qiuniu: './assets/sprites/qiuniu-3d.png',
  yazi: './assets/sprites/yazi-3d.png',
  chaofeng: './assets/sprites/chaofeng-3d.png',
  pulao: './assets/sprites/pulao-3d.png',
  suanni: './assets/sprites/suanni-3d.png',
  bixi: './assets/sprites/bixi-3d.png',
  bian: './assets/sprites/bian-3d.png',
  fuxi_long: './assets/sprites/fuxi_long-3d.png',
  chiwen: './assets/sprites/chiwen-3d.png',
  dayu: './assets/sprites/dayu-3d.png',
  gonggong: './assets/sprites/gonggong-3d.png',
  qinglong: './assets/sprites/qinglong-3d.png',
  baihu: './assets/sprites/baihu-3d.png',
  zhuque: './assets/sprites/zhuque-3d.png',
  xuanwu: './assets/sprites/xuanwu-3d.png',
  huangdi: './assets/sprites/huangdi-3d.png',
  fuxi: './assets/sprites/fuxi-3d.png',
  nuwa: './assets/sprites/nuwa-3d.png',
  xingxing: './assets/sprites/xingxing-3d.png',
  fei: './assets/sprites/fei-3d.png',
  bashe: './assets/sprites/bashe-3d.png',
  huali: './assets/sprites/huali-3d.png',
  wangliang: './assets/sprites/wangliang-3d.png',
  zhuyan: './assets/sprites/zhuyan-3d.png',
  shanxiao: './assets/sprites/shanxiao-3d.png',
  taotie: './assets/sprites/taotie-3d.png',
  baize: './assets/sprites/baize-3d.png',
};
const combatSprites = Object.fromEntries(Object.entries(combatSpriteSources).map(([id, src]) => {
  const image = document.createElement('img');
  image.src = src;
  return [id, image];
}));
const fxSprites = Object.fromEntries(['summon-ritual', 'hit-spark', 'spawn-fissure', 'seal-monument'].map((id) => {
  const image = document.createElement('img');
  image.src = `./assets/fx/${id}.png`;
  return [id, image];
}));
const attackSprites = Object.fromEntries(['ember', 'wisp', 'claw', 'quake'].map((id) => {
  const image = document.createElement('img');
  image.src = `./assets/animations/attacks/${id}.png`;
  return [id, image];
}));

const ROSTER = [
  ['bifang', '毕方', 0], ['fuzhu', '夫诸', 0], ['jiuwei', '九尾狐', 0], ['tiangou', '天狗', 0], ['xuangui', '旋龟', 0],
  ['shengsheng', '狌狌', 1], ['kaiming', '开明兽', 1], ['bo', '驳', 1], ['zheng', '狰', 1],
  ['qiuniu', '囚牛', 2], ['yazi', '睚眦', 2], ['chaofeng', '嘲风', 2], ['pulao', '蒲牢', 2], ['suanni', '狻猊', 2], ['bixi', '霸下', 2], ['bian', '狴犴', 2], ['fuxi_long', '负屭', 2], ['chiwen', '螭吻', 2],
  ['dayu', '大禹', 3], ['gonggong', '共工', 3],
  ['qinglong', '青龙', 4], ['baihu', '白虎', 4], ['zhuque', '朱雀', 4], ['xuanwu', '玄武', 4], ['huangdi', '黄帝', 4], ['fuxi', '伏羲', 4], ['nuwa', '女娲', 4],
].map(([id, name, rarity], portraitIndex) => ({ id, name, rarity, portraitIndex }));

const STARTER_IDS = ['bifang', 'fuzhu', 'jiuwei', 'tiangou', 'xuangui'];
const SUMMON_COST = 20;
const SUMMON_FIVE_COST = SUMMON_COST * 5 * .8;
const ADVANCED_SUMMON_COST = 50;
const ADVANCED_FIVE_COST = ADVANCED_SUMMON_COST * 5 * .8;
const FORTUNE_COST = 30;
const MAX_BACKPACK = 12;
const SUMMON_WEIGHTS = [[0, 58], [1, 34], [2, 7], [3, 1]];
const ADVANCED_SUMMON_WEIGHTS = [[2, 65], [3, 28], [4, 7]];
const POPULATION_BY_RARITY = [1, 1, 2, 2, 3];
const CULTIVATION_STAGES = [
  { kills: 0, name: '初窥门径', power: 0, summonLevel: 1 },
  { kills: 30, name: '灵脉初开', power: .1, summonLevel: 1 },
  { kills: 120, name: '丹府凝形', power: .2, summonLevel: 2 },
  { kills: 320, name: '元神照野', power: .3, summonLevel: 2 },
  { kills: 700, name: '山海同寿', power: .4, summonLevel: 2 },
];
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
  { id: 'dragon_sky', name: '龙子·凌霄', members: ['qiuniu', 'yazi', 'chaofeng'], need: 3, stat: 'haste', bonus: .16, stepBonus: 0, shape: 'triangle', color: '#a984c5', ult: '凌霄龙吟', ultMul: 2.5 },
  { id: 'dragon_earth', name: '龙子·镇岳', members: ['pulao', 'suanni', 'bixi'], need: 3, stat: 'sunder', bonus: .2, stepBonus: 0, shape: 'line', color: '#cb9860', ult: '镇岳雷火', ultMul: 2.8 },
  { id: 'dragon_tide', name: '龙子·碑潮', members: ['bian', 'fuxi_long', 'chiwen'], need: 3, stat: 'range', bonus: .14, stepBonus: 0, shape: 'cluster', color: '#708fb2', ult: '碑潮裁决', ultMul: 2.6 },
  { id: 'sishou', name: '四象归位', members: ['qinglong', 'baihu', 'zhuque', 'xuanwu'], need: 2, stat: 'range', bonus: .1, stepBonus: .06, shape: 'square', color: '#65b7af', ult: '四象天门', ultMul: 3.4 },
  { id: 'renzu', name: '人祖开天', members: ['huangdi', 'fuxi', 'nuwa'], need: 2, stat: 'cdr', bonus: .16, stepBonus: .1, shape: 'triangle', color: '#d4a355', ult: '开天', ultMul: 3 },
  { id: 'zhishui', name: '治水之争', members: ['dayu', 'gonggong'], need: 2, stat: 'sunder', bonus: .16, stepBonus: 0, shape: 'line', color: '#66a9c3', ult: '怒海分流', ultMul: 2.8 },
  { id: 'yanhuo', name: '炎火同源', members: ['bifang', 'suanni', 'zhuque', 'nuwa'], need: 2, stat: 'power', bonus: .1, stepBonus: .08, shape: 'square', color: '#e66f55' },
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
  { name: '幽都洞窟', intro: '窄路回旋，先学会把火力交叉覆盖。', hpMul: 1, spdMul: 1, essence: 56, tint: '#647f78', accent: '#75c9c0', path: 'cave', spawnCount: 1, seals: [[74, 108]], spawnPoints: [[884, 430]], boss: 'taotie' },
  { name: '北野草原', intro: '开阔地带，远程单位的范围开始变得重要。', hpMul: 1.12, spdMul: 1.03, essence: 62, tint: '#7d9d81', accent: '#d8bc74', path: 'grass', spawnCount: 1, seals: [[74, 402]], spawnPoints: [[884, 402]], boss: 'baize' },
  { name: '沧海之上', intro: '潮汐折返，减速和连锁能把敌群拖在射程内。', hpMul: 1.25, spdMul: 1.06, essence: 70, tint: '#5b8e9c', accent: '#9ed6d0', path: 'sea', spawnCount: 1, seals: [[74, 152]], spawnPoints: [[884, 270]], boss: 'taotie' },
  { name: '赤焰火山', intro: '两道裂口同时喷涌，必须分散阵型。', hpMul: 1.4, spdMul: 1.09, essence: 78, tint: '#b56454', accent: '#f2b35e', path: 'volcano', spawnCount: 2, seals: [[74, 104], [74, 436]], spawnPoints: [[884, 118], [884, 422]], boss: 'baize' },
  { name: '天庭云阶', intro: '双路交汇，强敌拥有护盾与复活机制。', hpMul: 1.58, spdMul: 1.12, essence: 86, tint: '#8a82aa', accent: '#f0d39a', path: 'cloud', spawnCount: 2, seals: [[74, 88], [74, 452]], spawnPoints: [[884, 118], [884, 422]], boss: 'taotie' },
];

const WAVES = [
  [['xingxing', 6, 1.15, 0, .82]],
  [['xingxing', 7, 1.05, 0, .86], ['fei', 2, 1.4, 2.5, .82]],
  [['xingxing', 7, 1, 0, .9], ['bashe', 1, 0, 4, .78]],
  [['fei', 5, 1.05, 0, .9], ['wangliang', 2, 1.5, 2, .82]],
  [['xingxing', 8, .86, 0, .92], ['zhuyan', 1, 0, 5, .72, 'miniBoss']],
  [['huali', 3, 1.15, 0, .82], ['xingxing', 6, .9, 1, .95]],
  [['fei', 6, .9, 0, .9], ['shanxiao', 2, 1.35, 2, .82]],
  [['bashe', 2, 1.35, 0, .85], ['xingxing', 8, .8, 1, .96]],
  [['huali', 4, 1, 0, .86], ['wangliang', 3, 1.15, 2, .88]],
  [['shanxiao', 4, 1, 0, .88], ['baize', 1, 0, 5, .64, 'miniBoss']],
  [['xingxing', 10, .68, 0, 1], ['fei', 5, .82, 1, .94]],
  [['bashe', 3, 1.15, 0, .9], ['shanxiao', 4, .95, 2, .92]],
  [['huali', 5, .88, 0, .9], ['wangliang', 4, .92, 2, .92]],
  [['fei', 9, .62, 0, 1], ['zhuyan', 2, 1.6, 3, .8]],
  [['xingxing', 10, .62, 0, 1], ['huali', 4, .9, 1.5, .9], ['shanxiao', 3, 1.05, 3, .9]],
];

const WAVE_META = [
  [8, 18, '狌狌自裂口显形'], [8, 14, '飞廉开始高速突进'], [8, 12, '巴蛇披甲：准备破盾'], [8, 12, '魍魉隐匿：进入射程后显形'],
  [11, 20, '小首领朱厌随军压境'], [8, 14, '化蛇免疫法术：调配物理火力'], [8, 12, '飞廉与山魈混编'], [8, 12, '重甲敌军进入长路'],
  [8, 12, '化蛇与魍魉交错出现'], [12, 24, '小首领白泽会复活一次'], [8, 10, '快速敌群连续冲阵'], [8, 10, '重甲与分裂敌群夹攻'],
  [8, 10, '隐匿与免疫敌群同至'], [9, 10, '朱厌护住飞廉大军'], [0, 0, '终阵小怪来袭，清场后首领降临'],
].map(([rest, bonus, hint]) => ({ rest, bonus, hint }));

const refs = Object.fromEntries(['selectScreen', 'gameScreen', 'resultScreen', 'stageList', 'rosterList', 'bondPreviewList', 'selectedStageLabel', 'codexCount', 'cultivationSummary', 'startGame', 'backToSelect', 'pauseGame', 'speedGame', 'soundToggle', 'gameTerrain', 'gameLevel', 'requiredBeastLabel', 'hpLabel', 'hpMeter', 'waveLabel', 'waveTrack', 'combatLog', 'arenaHint', 'essenceLabel', 'killLabel', 'bestScoreLabel', 'populationLabel', 'backpackLabel', 'selectedUnitLabel', 'gameRoster', 'gameBonds', 'summonBeast', 'summonBeastFive', 'advancedSummon', 'advancedSummonFive', 'openBackpack', 'openBonds', 'autoDeploy', 'recallAll', 'fortuneSign', 'teamSkill', 'skillLabel', 'replayGame', 'returnSelect', 'resultTitle', 'resultStage', 'resultScoreStamp', 'resultScoreTotal', 'resultBonds', 'resultHp', 'resultEnergy', 'resultUr', 'resultRequired', 'resultKills', 'resultXp', 'resultCombo', 'resultCopy', 'codexOpen', 'codexClose', 'codexDialog', 'codexDialogList', 'summonDialog', 'summonOffers', 'summonTitle', 'summonSubtitle', 'summonClose', 'advancedDialog', 'advancedResults', 'advancedTitle', 'advancedSubtitle', 'advancedClaim', 'advancedClose', 'backpackDialog', 'backpackList', 'backpackClose', 'openFusion', 'fusionDialog', 'fusionList', 'fusionSelection', 'fuseBeasts', 'fusionClose', 'fortuneDialog', 'fortuneResult', 'fortuneClose', 'bondsDialog', 'bondDialogList', 'bondsClose', 'pauseDialog', 'pauseResume', 'pauseRetry', 'pauseExit'].map((key) => [key, document.querySelector(`#${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`)]));

const state = {
  screen: 'select', stage: 0, selectedBeast: 'bifang', selectedUnitId: null, backpack: [], nextUnitId: 1, maxPopulation: 18, unlocked: new Set(STARTER_IDS), xp: 0, tier: 0, soundEnabled: true,
  paused: false, resumeAfterDialog: false, draggingUnitId: null, draggingTowerIndex: -1, selectedTowerUid: null, speed: 1, lastTime: 0, wave: 0, waveTimer: 0, spawning: null, waveCooldown: 0, phase: 'prep', prepTimer: 15, battleTime: 0,
  energy: 0, maxHp: 10, hp: 10, kills: 0, score: 0, bestScore: 0, combo: 0, bestCombo: 0, waveStarted: false,
  towers: [], enemies: [], projectiles: [], particles: [], hitBursts: [], damageTexts: [], logs: [], mouse: { x: 480, y: 270, inside: false },
  skillCooldowns: {}, skillBond: null, finishTimer: 0, tutorialStep: -1, fusionSelection: [], signEffects: [], summonOffers: [], summonMode: 'normal', advancedBatch: [], advancedMode: 'normal', requiredBeastId: null, fortuneSpinning: false, finalScoreBreakdown: null, lastSign: null,
};

const arena = { left: 38, right: 922, top: 46, bot: 510, roadW: 66, sealX: 74, sealY: 108, spawnR: 30, wardR: 34, plate: 24 };
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const currentLevel = () => LEVELS[state.stage];
const totalWaves = () => WAVES.length;
const levelSeals = (level = currentLevel()) => level.seals || [[arena.sealX, arena.sealY]];
const levelSpawns = (level = currentLevel()) => level.spawnPoints || [[884, 270]];
const beastDef = (id) => ({ ...ROSTER.find((item) => item.id === id), ...BEASTS[id] });
const populationCostFor = (unitOrId) => POPULATION_BY_RARITY[beastDef(typeof unitOrId === 'string' ? unitOrId : unitOrId.id).rarity];
const usedPopulation = () => state.towers.reduce((sum, tower) => sum + populationCostFor(tower), 0);
const allOwnedUnits = () => state.towers.concat(state.backpack);
const cultivation = () => CULTIVATION_STAGES[state.tier] || CULTIVATION_STAGES[0];
const cultivationTierFor = (kills) => CULTIVATION_STAGES.reduce((tier, stage, index) => (kills >= stage.kills ? index : tier), 0);
const hasCombatSprite = (id) => Boolean(combatSpriteSources[id]);
let audioContext = null;

function playSound(kind) {
  if (!state.soundEnabled) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioContext ||= new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  const patterns = {
    summon: [[320, 520, .16], [470, 760, .2]], deploy: [[180, 330, .12]],
    skill: [[240, 820, .28], [360, 1100, .24]], breach: [[130, 54, .24]],
    fortune: [[260, 390, .15], [390, 590, .18]], victory: [[330, 520, .18], [520, 780, .24]],
  };
  const start = audioContext.currentTime;
  (patterns[kind] || []).forEach(([from, to, duration], index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const at = start + index * .055;
    oscillator.type = kind === 'breach' ? 'sawtooth' : 'sine';
    oscillator.frequency.setValueAtTime(from, at);
    oscillator.frequency.exponentialRampToValueAtTime(to, at + duration);
    gain.gain.setValueAtTime(.0001, at);
    gain.gain.exponentialRampToValueAtTime(kind === 'breach' ? .07 : .045, at + .015);
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(at); oscillator.stop(at + duration + .02);
  });
}

function portraitMarkup(beast) {
  const portraitX = beast.portraitIndex % 6;
  const portraitY = Math.floor(beast.portraitIndex / 6);
  const spriteStyle = hasCombatSprite(beast.id) ? `--spirit-sprite:url('./assets/sprites/${beast.id}-3d.png')` : '';
  return `<span class="portrait portrait-image ${hasCombatSprite(beast.id) ? 'portrait-spirit' : ''}" style="--portrait-x:${portraitX};--portrait-y:${portraitY};${spriteStyle}"></span>`;
}

function pathInfo(level = currentLevel()) {
  if (level.path === 'cave') return [{ sx: 884, sy: 430, points: [[884, 430], [220, 430], [220, 280], [884, 280], [884, 108], [74, 108]] }];
  if (level.path === 'grass') return [{ sx: 884, sy: 402, points: [[884, 402], [622, 402], [498, 315], [316, 315], [200, 402], [74, 402]] }];
  if (level.path === 'sea') return [{ sx: 884, sy: 270, points: [[884, 270], [680, 138], [522, 248], [348, 116], [220, 240], [74, 152]] }];
  if (level.path === 'volcano') return [{ sx: 884, sy: 118, points: [[884, 118], [690, 118], [555, 196], [370, 196], [230, 104], [74, 104]] }, { sx: 884, sy: 422, points: [[884, 422], [690, 422], [555, 344], [370, 344], [230, 436], [74, 436]] }];
  return [{ sx: 884, sy: 118, points: [[884, 118], [692, 118], [520, 180], [322, 180], [214, 88], [74, 88]] }, { sx: 884, sy: 422, points: [[884, 422], [692, 422], [520, 350], [322, 350], [214, 452], [74, 452]] }];
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
  if (levelSeals().some(([sealX, sealY]) => Math.hypot(x - sealX, y - sealY) < arena.wardR + arena.plate * .4)) return false;
  if (levelSpawns().some(([spawnX, spawnY]) => Math.hypot(x - spawnX, y - spawnY) < arena.spawnR + arena.plate * .4)) return false;
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
    state.bestScore = Number(saved.bestScore) || 0;
    state.tier = cultivationTierFor(state.xp);
    state.unlocked = new Set([...(saved.unlocked || STARTER_IDS), ...STARTER_IDS]);
  } catch {
    state.unlocked = new Set(STARTER_IDS);
  }
}

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ xp: state.xp, tier: state.tier, bestScore: state.bestScore, unlocked: [...state.unlocked] }));
  document.querySelector('#save-status').textContent = '本地存档已更新';
}

function showScreen(name) {
  state.screen = name;
  document.body.dataset.screen = name;
  refs.selectScreen.classList.toggle('is-hidden', name !== 'select');
  refs.gameScreen.classList.toggle('is-hidden', name !== 'game');
  refs.resultScreen.classList.toggle('is-hidden', name !== 'result');
}

function renderSelect() {
  refs.stageList.innerHTML = LEVELS.map((level, index) => `<button class="stage-card ${index === state.stage ? 'is-selected' : ''}" data-stage="${index}" type="button"><span class="stage-number">0${index + 1}</span><span><strong>${level.name}</strong><small>${level.intro}</small></span><span class="stage-difficulty">${'◆'.repeat(index + 1)}</span></button>`).join('');
  refs.stageList.querySelectorAll('[data-stage]').forEach((button) => button.addEventListener('click', () => { state.stage = Number(button.dataset.stage); renderSelect(); }));
  refs.rosterList.innerHTML = ROSTER.map((beast) => {
    const data = beastDef(beast.id); const locked = !state.unlocked.has(beast.id);
    return `<button class="roster-card rarity-${RARITIES[beast.rarity]} ${locked ? 'is-locked' : ''}" data-beast="${beast.id}" type="button" ${locked ? 'disabled' : ''}>${portraitMarkup(beast)}<strong>${beast.name}</strong><small>${RARITIES[beast.rarity]} · ${data.kindText}</small></button>`;
  }).join('');
  refs.rosterList.querySelectorAll('[data-beast]').forEach((button) => button.addEventListener('click', () => { state.selectedBeast = button.dataset.beast; renderSelect(); }));
  const chosen = beastDef(state.selectedBeast);
  refs.bondPreviewList.innerHTML = BOND_DEFS.map((bond) => `<div class="bond-row"><i class="bond-pill ${bond.members.includes(state.selectedBeast) ? 'active' : ''}" style="--bond:${bond.color}"></i><span>${bond.name}</span><strong>${bond.need}人 · ${bond.stat === 'power' ? '攻击' : bond.stat === 'haste' ? '攻速' : '范围'}</strong></div>`).join('');
  refs.codexCount.textContent = `${state.unlocked.size} / ${ROSTER.length}`;
  refs.cultivationSummary.textContent = `${cultivation().name} · 全局战力 ×${(1 + cultivation().power).toFixed(2)}`;
  refs.selectedStageLabel.textContent = `${LEVELS[state.stage].name} · 第 ${state.stage + 1} 关 · ${totalWaves(LEVELS[state.stage])} 波`;
}

function addLog(message) {
  state.logs.unshift(message); state.logs = state.logs.slice(0, 3);
  refs.combatLog.innerHTML = state.logs.map((item) => `<div>${item}</div>`).join('');
}

function randomFromWeights(weights) {
  let roll = Math.random() * weights.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [candidate, weight] of weights) {
    roll -= weight;
    if (roll < 0) return candidate;
  }
  return weights[weights.length - 1][0];
}

function randomBeastAtRarity(rarity) {
  const pool = ROSTER.filter((beast) => beast.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomSummon(weights = SUMMON_WEIGHTS) {
  return randomBeastAtRarity(randomFromWeights(weights));
}

function randomSummonChoices(weights, count) {
  const choices = [];
  while (choices.length < count) {
    const beast = randomSummon(weights);
    if (!choices.some((choice) => choice.id === beast.id)) choices.push(beast);
  }
  return choices;
}

function bondEffectText(bond) {
  const labels = { power: '攻击', haste: '攻速', range: '射程', cdr: '技能冷却', sunder: '破甲', enemySlow: '敌军减速' };
  return `${labels[bond.stat] || '战力'} +${Math.round(bond.bonus * 100)}%`;
}

function bondOpportunity(beastId) {
  const owned = new Set(allOwnedUnits().map((unit) => unit.id));
  if (owned.has(beastId)) return null;
  return BOND_DEFS.find((bond) => bond.members.includes(beastId) && bond.members.filter((id) => owned.has(id)).length === bond.need - 1) || null;
}

function createUnit(beast, level = cultivation().summonLevel) {
  return { uid: `spirit-${state.nextUnitId++}`, id: beast.id, level, cd: .15, hitTarget: null, hitCount: 0 };
}

function selectedUnit() {
  return state.backpack.find((unit) => unit.uid === state.selectedUnitId) || null;
}

function selectUnit(uid) {
  state.selectedUnitId = state.backpack.some((unit) => unit.uid === uid) ? uid : null;
  renderGameRoster();
  updateHUD();
}

function receiveSummonedUnit(unit) {
  const target = state.towers.concat(state.backpack).find((item) => item.id === unit.id);
  if (!target) { state.backpack.push(unit); return { unit, promotions: 0 }; }
  target.level = Math.min(9, target.level + 1);
  return { unit: target, promotions: 1 };
}

function showGameDialog(dialog) {
  if (!state.paused) { state.paused = true; state.resumeAfterDialog = true; }
  dialog.showModal();
  updateHUD();
}

function closeGameDialog(dialog) {
  dialog.close();
  if (state.resumeAfterDialog) { state.paused = false; state.resumeAfterDialog = false; }
  updateHUD();
}

function openPauseMenu() {
  if (state.screen !== 'game' || state.paused) return;
  state.paused = true;
  refs.pauseDialog.showModal();
  updateHUD();
}

function resumePauseMenu() {
  refs.pauseDialog.close();
  state.paused = false;
  updateHUD();
}

function unitCard(unit, attributes = '') {
  const beast = beastDef(unit.id);
  return `<button class="game-card rarity-${RARITIES[beast.rarity]} ${attributes}" data-unit-id="${unit.uid}" type="button">${portraitMarkup(beast)}<span><strong>${beast.name}</strong><small>${RARITIES[beast.rarity]} · Lv.${unit.level} · 人口 ${populationCostFor(unit)} · ${beast.kindText}</small></span><em>${RARITIES[beast.rarity]}</em></button>`;
}

function renderSummonOffers() {
  const advanced = state.summonMode === 'advanced';
  refs.summonTitle.textContent = `${advanced ? '高级三选一' : '普通二选一'} · 选中即入卷`;
  refs.summonSubtitle.textContent = advanced ? '高概率 SR，中概率 SSR，小概率 UR；未选卡牌不会获得。' : 'N、R 为主，小概率 SR，极小概率 SSR；未选卡牌不会获得。';
  refs.summonOffers.classList.toggle('is-triple', advanced);
  refs.summonOffers.innerHTML = state.summonOffers.map((beast, index) => {
    const data = beastDef(beast.id);
    const opportunity = bondOpportunity(beast.id);
    return `<button class="summon-offer rarity-${RARITIES[beast.rarity]}" data-offer-index="${index}" type="button">${portraitMarkup(beast)}<span><em>${RARITIES[beast.rarity]}</em><strong>${beast.name}</strong><small>人口 ${populationCostFor(beast.id)} · ${data.kindText}</small>${opportunity ? `<small class="summon-bond-hint">可组成「${opportunity.name}」<br>${bondEffectText(opportunity)}</small>` : ''}</span><b>选择此卡</b></button>`;
  }).join('');
  refs.summonOffers.querySelectorAll('[data-offer-index]').forEach((button) => button.addEventListener('click', () => claimSummonOffer(Number(button.dataset.offerIndex))));
}

function summonSingle(mode) {
  if (state.screen !== 'game') return;
  if (state.paused) { addLog('暂停中，继续战斗后才能召灵。'); return; }
  if (!state.summonOffers.length) {
    const cost = mode === 'advanced' ? ADVANCED_SUMMON_COST : SUMMON_COST;
    if (state.energy < cost) { addLog(`灵蕴不足，需要 ${cost} 点进行${mode === 'advanced' ? '高级' : '普通'}召灵。`); return; }
    if (state.backpack.length >= MAX_BACKPACK) { addLog('背包已满，请先部署、合成或遣返妖灵。'); return; }
    state.energy -= cost;
    state.summonMode = mode;
    const weights = mode === 'advanced' ? ADVANCED_SUMMON_WEIGHTS : SUMMON_WEIGHTS;
    const choiceCount = mode === 'advanced' ? 3 : 2;
    state.summonOffers = randomSummonChoices(weights, choiceCount);
  }
  renderSummonOffers();
  showGameDialog(refs.summonDialog);
}

function summonBeast() { summonSingle('normal'); }
function advancedSummon() { summonSingle('advanced'); }

function claimSummonOffer(index) {
  const beast = state.summonOffers[index];
  if (!beast || state.backpack.length >= MAX_BACKPACK) return;
  const result = receiveSummonedUnit(createUnit(beast));
  state.unlocked.add(beast.id);
  state.selectedUnitId = state.backpack.some((unit) => unit.uid === result.unit.uid) ? result.unit.uid : null;
  state.summonOffers = [];
  closeGameDialog(refs.summonDialog);
  playSound('summon');
  if (state.tutorialStep === 0 && !result.promotions) { state.tutorialStep = 1; refs.arenaHint.textContent = '妖灵已入阵：点击下方妖灵卡，再点击道路两侧的空地布阵。'; }
  addLog(result.promotions ? `${beast.name}同种同阶合成，升至 Lv.${result.unit.level}。` : `${beast.name}已入阵，拖动卡牌到路边，或直接点击战场布阵。`);
  renderGameRoster();
  updateHUD();
}

function renderAdvancedResults() {
  const advanced = state.advancedMode === 'advanced';
  refs.advancedTitle.textContent = `${advanced ? '高级' : '普通'}召灵 · 五连`;
  refs.advancedSubtitle.textContent = `五次结果全部入卷，消耗 ${advanced ? ADVANCED_FIVE_COST : SUMMON_FIVE_COST} 灵蕴；同种同级自动合成。`;
  refs.advancedResults.innerHTML = state.advancedBatch.map((unit) => unitCard(unit, 'is-result')).join('');
}

function summonFive(mode) {
  if (state.screen !== 'game' || state.paused) return;
  if (state.advancedBatch.length) { renderAdvancedResults(); showGameDialog(refs.advancedDialog); return; }
  const cost = mode === 'advanced' ? ADVANCED_FIVE_COST : SUMMON_FIVE_COST;
  if (state.energy < cost) { addLog(`灵蕴不足，需要 ${cost} 点进行${mode === 'advanced' ? '高级' : '普通'}五连。`); return; }
  if (state.backpack.length + 5 > MAX_BACKPACK) { addLog('背包至少需要留出 5 个位置，才能进行五连召灵。'); return; }
  state.energy -= cost;
  state.advancedMode = mode;
  const weights = mode === 'advanced' ? ADVANCED_SUMMON_WEIGHTS : SUMMON_WEIGHTS;
  state.advancedBatch = Array.from({ length: 5 }, () => createUnit(randomSummon(weights)));
  renderAdvancedResults();
  refs.advancedClaim.textContent = '入卷 · 自动合成';
  showGameDialog(refs.advancedDialog);
}

function summonBeastFive() { summonFive('normal'); }
function advancedSummonFive() { summonFive('advanced'); }

function fusionOutcome(rarity) {
  const roll = Math.random();
  if (roll < .15) return { rarity: Math.min(4, rarity + 1), label: '上跃' };
  if (roll < .50) return { rarity, label: '同级' };
  return { rarity: Math.max(0, rarity - 1), label: '降阶' };
}

function fuseUnits(first, second) {
  const firstBeast = beastDef(first.id);
  const outcome = fusionOutcome(firstBeast.rarity);
  const result = createUnit(randomBeastAtRarity(outcome.rarity), Math.max(first.level, second.level));
  state.backpack = state.backpack.filter((unit) => unit.uid !== first.uid && unit.uid !== second.uid);
  const received = receiveSummonedUnit(result);
  state.unlocked.add(result.id);
  addLog(`随机融合${outcome.label}：${received.promotions ? `${beastDef(result.id).name}同卡升级` : `获得 ${beastDef(result.id).name}`}（${RARITIES[outcome.rarity]}）。`);
  return outcome;
}

function claimAdvancedBatch() {
  if (!state.advancedBatch.length || state.backpack.length + state.advancedBatch.length > MAX_BACKPACK) return;
  let promotions = 0;
  state.advancedBatch.forEach((unit) => {
    const result = receiveSummonedUnit(unit);
    promotions += result.promotions;
    state.unlocked.add(unit.id);
  });
  state.selectedUnitId = state.backpack[0]?.uid || null;
  closeGameDialog(refs.advancedDialog);
  playSound('summon');
  addLog(`${state.advancedMode === 'advanced' ? '高级' : '普通'}五连入卷：${promotions ? `同种同阶升级 ${promotions} 次，` : ''}其余妖灵已入背包。`);
  state.advancedBatch = [];
  renderGameRoster();
  updateHUD();
}

function initGame() {
  state.paused = false; state.speed = 1; state.wave = 0; state.waveTimer = 0; state.spawning = null; state.waveCooldown = 0; state.phase = 'prep'; state.prepTimer = 15; state.battleTime = 0;
  state.energy = currentLevel().essence; state.hp = state.maxHp; state.kills = 0; state.score = 0; state.combo = 0; state.bestCombo = 0;
  state.towers = []; state.backpack = []; state.selectedUnitId = null; state.nextUnitId = 1; state.enemies = []; state.projectiles = []; state.particles = []; state.hitBursts = []; state.damageTexts = []; state.logs = []; state.skillCooldowns = {}; state.skillBond = null; state.tutorialStep = state.stage === 0 ? 0 : -1; state.fusionSelection = []; state.signEffects = []; state.summonOffers = []; state.summonMode = 'normal'; state.advancedBatch = []; state.advancedMode = 'normal'; state.requiredBeastId = ROSTER[Math.floor(Math.random() * ROSTER.length)].id; state.fortuneSpinning = false; state.finalScoreBreakdown = null; state.resumeAfterDialog = false; state.draggingUnitId = null; state.draggingTowerIndex = -1; state.selectedTowerUid = null;
  showScreen('game'); refs.gameTerrain.textContent = currentLevel().name; refs.gameLevel.textContent = `波次 1 / 整备`; refs.requiredBeastLabel.textContent = beastDef(state.requiredBeastId).name; refs.arenaHint.textContent = `本局必选「${beastDef(state.requiredBeastId).name}」；15 秒后${currentLevel().spawnCount > 1 ? '两道裂口' : '右侧裂口'}涌出敌军`; addLog(`整备 15 秒：本局随机必选妖灵为「${beastDef(state.requiredBeastId).name}」，结算时需在场。`); renderGameRoster(); renderGameBonds(); updateHUD();
}

function startWave() {
  if (state.wave >= totalWaves()) return;
  const groups = WAVES[state.wave];
  const meta = WAVE_META[state.wave];
  state.spawning = groups.map(([type, count, gap, delay, hpMul, role = 'normal'], index) => ({ type, count, gap, delay, hpMul, role, spawned: 0, timer: delay, route: index % pathInfo().length }));
  state.spawning.bossAfterClear = state.wave === totalWaves() - 1 ? currentLevel().boss : null;
  state.spawning.bossSpawned = false;
  state.phase = 'combat'; state.waveStarted = true; state.waveTimer = 0;
  refs.waveLabel.textContent = `${state.wave + 1} / ${totalWaves()}`;
  refs.arenaHint.textContent = `第 ${state.wave + 1} 波 · ${meta.hint}`;
  addLog(`第 ${state.wave + 1} 波：${meta.hint}`);
}

function spawnFromGroups(dt) {
  if (state.phase === 'prep') {
    state.prepTimer = Math.max(0, state.prepTimer - dt);
    if (state.prepTimer <= 0) startWave();
    return;
  }
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
      if (group.timer <= 0) { spawnEnemy(group.type, group.hpMul, (group.route + group.spawned) % pathInfo().length, 0, group.role); group.spawned += 1; group.timer = group.gap; }
    }
  });
  if (allDone && state.enemies.length === 0) {
    if (state.spawning.bossAfterClear && !state.spawning.bossSpawned) {
      const boss = spawnEnemy(state.spawning.bossAfterClear, .92 + state.stage * .04, 0, 0, 'stageBoss');
      state.spawning.bossSpawned = true;
      refs.arenaHint.textContent = `第 15 波 · 关卡首领「${boss.def.name}」降临`;
      addLog(`终阵小怪已清除，关卡首领「${boss.def.name}」现身。若其破封，将造成 9 点伤害。`);
      return;
    }
    const completedMeta = WAVE_META[state.wave];
    state.energy += completedMeta.bonus;
    state.spawning = null; state.wave += 1;
    if (state.wave >= totalWaves()) { finishGame(true); return; }
    state.phase = 'rest'; state.waveCooldown = completedMeta.rest;
    addLog(`下一波将在 ${state.waveCooldown} 秒后开始${completedMeta.bonus ? `，奖励 ${completedMeta.bonus} 灵蕴` : ''}。`);
  }
}

function activeSignEffect(type) {
  return state.signEffects.find((effect) => effect.type === type);
}

function refreshEnemyModifiers(enemy) {
  const enemyBlessing = activeSignEffect('enemyBuff');
  const enemyDebuff = activeSignEffect('enemyDebuff');
  enemy.speed = enemy.def.speed * currentLevel().spdMul * (enemyBlessing ? 1.16 : 1) * (enemyDebuff ? .72 : 1);
  enemy.armor = Math.max(0, (enemy.def.armor || 0) + (enemyBlessing ? 5 : 0) - (enemyDebuff ? 8 : 0));
}

function spawnEnemy(type, hpMul, routeIndex = 0, distanceAlong = 0, role = 'normal') {
  const def = ENEMIES[type]; const route = pathInfo()[routeIndex] || pathInfo()[0];
  const enemyBlessing = activeSignEffect('enemyBuff');
  const hp = def.hp * currentLevel().hpMul * hpMul * (enemyBlessing ? 1.18 : 1);
  const point = interpolatePath(route.points, distanceAlong);
  const enemy = { type, role, sealDamage: role === 'stageBoss' ? 9 : role === 'miniBoss' ? 5 : 1, def, x: point.x, y: point.y, d: distanceAlong, route: routeIndex, routePoints: route.points, routeLength: pathLength(route.points), hp, maxHp: hp, speed: def.speed, radius: def.radius, shield: def.shield || 0, armor: def.armor || 0, slow: 0, slowTimer: 0, burnTimer: 0, burnDps: 0, stealthTimer: def.stealth ? 2 : 0, revived: false, split: false, lastHitBy: null, hitCount: 0, hitTarget: null, skillTimer: 4 + Math.random() * 3 };
  refreshEnemyModifiers(enemy);
  state.enemies.push(enemy);
  return enemy;
}

function incomingDamage(enemy) { return state.projectiles.reduce((sum, projectile) => projectile.target === enemy ? sum + projectile.amount : sum, 0); }

function bondsForTowers() {
  const totals = { power: 0, haste: 0, range: 0, cdr: 0, sunder: 0, enemySlow: 0 };
  const active = [];
  for (const bond of BOND_DEFS) {
    const members = bond.members.map((id) => state.towers.find((tower) => tower.id === id)).filter(Boolean);
    if (members.length < bond.need) continue;
    const formationShape = members.length >= 4 ? 'polygon' : members.length === 3 ? 'triangle' : 'line';
    const formation = formationScore(formationShape, members);
    const formed = formation >= .5;
    const full = members.length >= bond.members.length;
    const contribution = bond.bonus + Math.max(0, members.length - bond.need) * bond.stepBonus;
    const adjusted = formed ? contribution : 0;
    totals[bond.stat] += adjusted;
    active.push({ ...bond, members, formation, formationShape, formed, full, ultReady: Boolean(bond.ult && full && formed), adjusted });
  }
  totals.power = Math.min(1.2, totals.power); totals.haste = Math.min(.7, totals.haste); totals.range = Math.min(.45, totals.range); totals.cdr = Math.min(.6, totals.cdr); totals.sunder = Math.min(.45, totals.sunder); totals.enemySlow = Math.min(.45, totals.enemySlow);
  const skillBonds = active.filter((bond) => bond.ultReady);
  state.skillBond = skillBonds.find((bond) => bond.id === state.skillBond?.id) || skillBonds[0] || null;
  return { totals, active };
}

function formationScore(shape, members) {
  if (members.length < 2) return 0;
  const points = members.map((member) => ({ x: member.x, y: member.y }));
  const spread = Math.max(...points.map((a) => Math.max(...points.map((b) => dist(a, b)))));
  if (shape === 'cluster') return spread < 50 ? 0 : clamp(1 - Math.max(0, spread - 210) / 210, 0, 1);
  if (shape === 'line') {
    const horizontal = Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x));
    const vertical = Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y));
    return horizontal < 60 ? 0 : clamp(1 - vertical / 64, 0, 1);
  }
  const count = points.length;
  const use = points;
  const center = use.reduce((out, point) => ({ x: out.x + point.x / count, y: out.y + point.y / count }), { x: 0, y: 0 });
  const radii = use.map((point) => Math.hypot(point.x - center.x, point.y - center.y));
  const radius = radii.reduce((sum, value) => sum + value, 0) / count;
  if (radius < 45) return 0;
  const radiusDeviation = Math.max(...radii.map((value) => Math.abs(value - radius) / radius));
  const angles = use.map((point) => Math.atan2(point.y - center.y, point.x - center.x)).sort((a, b) => a - b);
  const targetGap = Math.PI * 2 / count;
  const angularDeviation = Math.max(...angles.map((angle, index) => Math.abs(((angles[(index + 1) % count] - angle + Math.PI * 2) % (Math.PI * 2)) - targetGap) / targetGap));
  return clamp(Math.min(1 - radiusDeviation / .8, 1 - angularDeviation / .8), 0, 1);
}

function updateTowers(dt) {
  const bondState = bondsForTowers();
  const allyBlessing = activeSignEffect('allyBuff');
  state.towers.forEach((tower) => {
    const def = beastDef(tower.id);
    tower.cd -= dt * (1 + bondState.totals.haste + (allyBlessing ? .2 : 0));
    if (tower.cd > 0) return;
    const range = def.range * (1 + bondState.totals.range);
    let target = state.enemies.filter((enemy) => enemy.hp > 0 && enemy.stealthTimer <= 0 && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range && enemy.hp - incomingDamage(enemy) > 0).sort((a, b) => b.d - a.d)[0];
    if (!target) target = state.enemies.filter((enemy) => enemy.hp > 0 && enemy.stealthTimer <= 0 && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range).sort((a, b) => b.d - a.d)[0];
    if (!target) return;
    if (tower.hitTarget === target) tower.hitCount += 1; else { tower.hitTarget = target; tower.hitCount = 1; }
    const special = def.stunEvery && tower.hitCount % def.stunEvery === 0 ? -1 : def.breakAt && tower.hitCount % def.breakAt === 0 ? -2 : 0;
    const power = def.dmg * (1 + bondState.totals.power + (allyBlessing ? .22 : 0)) * (1 + (tower.level - 1) * .26) * (1 + cultivation().power);
    const seed = [...tower.id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    state.projectiles.push({ x: tower.x, y: tower.y, target, amount: power, speed: def.projSpeed, def, source: tower, life: special, seed, age: 0, trail: [] });
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
    projectile.age = (projectile.age || 0) + dt;
    const dx = projectile.target.x - projectile.x; const dy = projectile.target.y - projectile.y; const distance = Math.hypot(dx, dy); const step = projectile.speed * dt;
    const seed = projectile.seed || 0;
    const amplitude = projectile.def.proj === 'wisp' ? 0.2 : projectile.def.proj === 'ember' ? 0.11 : projectile.def.proj === 'quake' ? 0.05 : 0.025;
    const curve = Math.sin(state.battleTime * (5 + seed % 5) + seed * .17) * amplitude;
    const safeDistance = Math.max(distance, 1);
    projectile.x += (dx / safeDistance - dy / safeDistance * curve) * step;
    projectile.y += (dy / safeDistance + dx / safeDistance * curve) * step;
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
    if (enemy.hp <= 0) continue;
    if (enemy.def.skill === 'heal') { enemy.skillTimer -= dt; if (enemy.skillTimer <= 0) { enemy.skillTimer = 7; const heal = enemy.maxHp * .08; enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal); addDamageText(enemy.x, enemy.y - 20, `+${Math.round(heal)}`, '#83c8a7'); } }
    if (enemy.stunned > 0) continue;
    const route = enemy.routePoints; const next = interpolatePath(route, enemy.d); enemy.x = next.x; enemy.y = next.y;
    enemy.d += enemy.speed * (1 - enemy.slow) * (1 - totals.enemySlow) * dt;
    if (enemy.d >= enemy.routeLength) { enemy.hp = 0; state.hp -= enemy.sealDamage; state.combo = 0; playSound('breach'); addLog(`${enemy.def.name}冲过封印，造成 ${enemy.sealDamage} 点破封伤害。`); }
  }
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
  if (state.hp <= 0) finishGame(false);
}

function killEnemy(enemy) {
  if (enemy.def.skill === 'revive' && !enemy.revived) { enemy.revived = true; enemy.hp = enemy.maxHp * .35; enemy.shield = 120; addLog(`${enemy.def.name}触发复活，获得临时护盾。`); return; }
  if (enemy.def.skill === 'split' && !enemy.split) {
    enemy.split = true;
    for (let i = 0; i < 2; i += 1) spawnEnemy('xingxing', .55, enemy.route, enemy.d);
  }
  state.kills += enemy.def.reward; state.combo += 1; state.score += enemy.def.reward * 100 + Math.min(100, state.combo * 5); state.bestCombo = Math.max(state.bestCombo, state.combo); state.energy = Math.min(9999, state.energy + enemy.def.reward * 2); state.xp += enemy.def.reward; burst(enemy.x, enemy.y, enemy.def.color, enemy.role !== 'normal' || enemy.def.boss ? 18 : 8);
}

function finishGame(won) {
  if (state.screen !== 'game') return;
  state.screen = 'finishing'; state.finishTimer = 0;
  if (won) playSound('victory');
  if (won) { const unlock = ROSTER.find((beast) => !state.unlocked.has(beast.id) && beast.rarity <= Math.min(4, state.stage + 1)); if (unlock) state.unlocked.add(unlock.id); }
  const activeBonds = bondsForTowers().active.filter((bond) => bond.formed).length;
  const remainingHp = Math.max(0, state.hp);
  const remainingEnergy = Math.max(0, Math.floor(state.energy));
  const urCount = allOwnedUnits().filter((unit) => beastDef(unit.id).rarity === 4).length;
  const requiredFielded = state.towers.some((tower) => tower.id === state.requiredBeastId);
  const breakdown = {
    combat: state.score,
    victory: won ? 1200 : 0,
    bonds: activeBonds * 600,
    hp: remainingHp * 220,
    energy: Math.min(2400, remainingEnergy * 8),
    ur: urCount * 700,
    required: requiredFielded ? 1200 : 0,
  };
  breakdown.total = breakdown.combat + breakdown.victory + breakdown.bonds + breakdown.hp + breakdown.energy + breakdown.ur + breakdown.required;
  breakdown.grade = won ? (breakdown.total >= 9000 ? 'S' : breakdown.total >= 6500 ? 'A' : breakdown.total >= 4000 ? 'B' : 'C') : 'C';
  state.finalScoreBreakdown = breakdown;
  state.bestScore = Math.max(state.bestScore, breakdown.total);
  state.tier = cultivationTierFor(state.xp);
  saveProgress();
  refs.resultTitle.textContent = won ? '封印守住了' : '封印被突破';
  refs.resultStage.textContent = `${currentLevel().name} · 0${state.stage + 1}`;
  refs.resultScoreStamp.textContent = breakdown.grade;
  refs.resultScoreTotal.textContent = breakdown.total.toLocaleString('zh-CN');
  refs.resultBonds.textContent = `${activeBonds} · +${breakdown.bonds}`;
  refs.resultHp.textContent = `${remainingHp}/${state.maxHp} · +${breakdown.hp}`;
  refs.resultEnergy.textContent = `${remainingEnergy} · +${breakdown.energy}`;
  refs.resultUr.textContent = `${urCount} · +${breakdown.ur}`;
  refs.resultRequired.textContent = `${beastDef(state.requiredBeastId).name} · ${requiredFielded ? `+${breakdown.required}` : '+0'}`;
  refs.resultKills.textContent = state.kills; refs.resultXp.textContent = `+${state.kills}`; refs.resultCombo.textContent = state.bestCombo;
  refs.resultCopy.textContent = `${won ? '守关成功' : '守关失败'}，基础战绩 ${breakdown.combat}，${won ? `胜利加成 ${breakdown.victory}` : '无胜利加成'}。必选妖灵需在结算时仍在场上。`;
  showScreen('result');
}

function addDamageText(x, y, text, color) { state.damageTexts.push({ x, y, text, color, life: 1 }); }
function burst(x, y, color, count = 6) { state.hitBursts.push({ x, y, life: .24, size: 34 + Math.min(34, count * 2) }); for (let i = 0; i < count; i += 1) state.particles.push({ x, y, dx: (Math.random() - .5) * 80, dy: (Math.random() - .5) * 80, color, life: .55 + Math.random() * .35 }); }
function updateEffects(dt) { state.particles = state.particles.filter((item) => { item.life -= dt; item.x += item.dx * dt; item.y += item.dy * dt; return item.life > 0; }); state.hitBursts = state.hitBursts.filter((item) => { item.life -= dt; return item.life > 0; }); state.damageTexts = state.damageTexts.filter((item) => { item.life -= dt; item.y -= dt * 18; return item.life > 0; }); }

function placeTower(x, y) {
  const unit = selectedUnit();
  if (!unit) { addLog('请先召灵，再从背包选择一只妖灵。'); return; }
  if (state.towers.some((tower) => tower.id === unit.id)) { addLog(`${beastDef(unit.id).name}本局已经上场，每种妖灵只能部署一只。`); return; }
  const population = populationCostFor(unit);
  if (usedPopulation() + population > state.maxPopulation) { addLog(`${beastDef(unit.id).name}需要 ${population} 人口，当前人口不足。`); return; }
  if (!canPlaceAt(x, y)) { addLog(distToPath(x, y) < arena.roadW * .5 + arena.plate * .5 ? '不能放在怪物行进的道路上。' : '此处不能安置。'); return; }
  const def = beastDef(unit.id);
  state.towers.push({ ...unit, x, y, cd: .15, hitTarget: null, hitCount: 0 });
  state.selectedTowerUid = unit.uid;
  state.backpack = state.backpack.filter((item) => item.uid !== unit.uid);
  state.selectedUnitId = null;
  if (state.tutorialStep === 1) { state.tutorialStep = 2; refs.arenaHint.textContent = '布阵完成：妖灵会自动攻击。注意让攻击范围覆盖道路。'; }
  playSound('deploy'); addLog(`${def.name}已安置，注意与队友保持阵型间距。`); renderGameRoster(); renderGameBonds(); updateHUD();
}

function renderGameRoster() {
  refs.gameRoster.innerHTML = state.backpack.length
    ? state.backpack.map((unit) => unitCard(unit, state.selectedUnitId === unit.uid ? 'is-selected' : '')).join('')
    : '<div class="summon-empty">使用普通或高级召灵，请出 N 至 UR 妖灵</div>';
  refs.gameRoster.querySelectorAll('[data-unit-id]').forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      selectUnit(button.dataset.unitId);
      state.draggingUnitId = button.dataset.unitId;
    });
    button.addEventListener('click', () => selectUnit(button.dataset.unitId));
  });
}

function renderGameBonds() {
  const { active } = bondsForTowers();
  refs.gameBonds.innerHTML = BOND_DEFS.map((bond) => {
    const current = active.find((item) => item.id === bond.id);
    const count = new Set(state.towers.filter((tower) => bond.members.includes(tower.id)).map((tower) => tower.id)).size;
    const selectable = current?.ultReady;
    const tag = selectable ? 'button' : 'div';
    const attrs = selectable ? ` data-skill-bond="${bond.id}" type="button"` : '';
    return `<${tag} class="bond-row ${selectable ? 'bond-skill-choice' : ''} ${state.skillBond?.id === bond.id ? 'is-selected' : ''}"${attrs}><i class="bond-pill ${current?.formed ? 'active' : ''}" style="background:${bond.color}"></i><span>${bond.name}</span><strong>${count}/${bond.need}${current ? current.formed ? ` · ${Math.round(current.adjusted * 100)}%` : ' · 阵型无效' : ''}</strong></${tag}>`;
  }).join('');
  refs.gameBonds.querySelectorAll('[data-skill-bond]').forEach((button) => button.addEventListener('click', () => {
    const { active: current } = bondsForTowers();
    state.skillBond = current.find((bond) => bond.id === button.dataset.skillBond) || state.skillBond;
    updateHUD();
  }));
  const cooldown = state.skillBond ? (state.skillCooldowns[state.skillBond.id] || 0) : 0;
  refs.skillLabel.textContent = state.skillBond ? (cooldown > 0 ? `${cooldown.toFixed(1)}s` : state.skillBond.ult) : '未就绪';
}

function renderBondDialog() {
  const { active } = bondsForTowers();
  refs.bondDialogList.innerHTML = BOND_DEFS.map((bond) => {
    const current = active.find((item) => item.id === bond.id);
    const count = new Set(state.towers.filter((tower) => bond.members.includes(tower.id)).map((tower) => tower.id)).size;
    const status = current ? `${current.formed ? '成阵' : '散阵'} · ${Math.round(current.adjusted * 100)}%${current.ultReady ? ' · 技能就绪' : ''}` : '未触发';
    const tag = current?.ultReady ? 'button' : 'article';
    const attrs = current?.ultReady ? ` type="button" data-dialog-skill-bond="${bond.id}"` : '';
    const shapeLabel = current?.formationShape === 'polygon' ? '多边形' : current?.formationShape === 'triangle' ? '三角形' : count >= 4 ? '多边形' : count >= 3 ? '三角形' : '连线';
    return `<${tag} class="bond-detail"${attrs}><i style="background:${bond.color}"></i><div><strong>${bond.name}</strong><small>${count}/${bond.members.length} · ${bond.need}只触发 · ${shapeLabel}阵</small></div><b>${status}</b></${tag}>`;
  }).join('');
  refs.bondDialogList.querySelectorAll('[data-dialog-skill-bond]').forEach((button) => button.addEventListener('click', () => {
    state.skillBond = bondsForTowers().active.find((bond) => bond.id === button.dataset.dialogSkillBond) || state.skillBond;
    closeGameDialog(refs.bondsDialog);
    updateHUD();
  }));
}

function autoSpot() {
  let best = null;
  for (let y = 78; y <= 478; y += 22) for (let x = 94; x <= 866; x += 22) {
    if (!canPlaceAt(x, y)) continue;
    const road = distToPath(x, y);
    const neighbors = state.towers.reduce((sum, tower) => sum + Math.min(170, Math.hypot(tower.x - x, tower.y - y)), 0) / Math.max(state.towers.length, 1);
    const score = -Math.abs(road - 68) * 1.25 + neighbors * .24 + Math.abs(y - 270) * .08;
    if (!best || score > best.score) best = { x, y, score };
  }
  return best;
}

function formationOffsets(count, rotation = 0) {
  if (count === 2) return [-1, 1].map((side) => ({ x: Math.cos(rotation) * side * 58, y: Math.sin(rotation) * side * 58 }));
  const radius = count === 3 ? 76 : count === 4 ? 82 : 88;
  return Array.from({ length: count }, (_, index) => {
    const angle = rotation - Math.PI / 2 + index * Math.PI * 2 / count;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  });
}

function findFormationSpots(count) {
  let best = null;
  for (let cy = 140; cy <= 410; cy += 30) for (let cx = 150; cx <= 810; cx += 30) for (let turn = 0; turn < 4; turn += 1) {
    const spots = formationOffsets(count, turn * Math.PI / 8).map((offset) => ({ x: cx + offset.x, y: cy + offset.y }));
    if (!spots.every((spot) => canPlaceAt(spot.x, spot.y))) continue;
    const separated = spots.every((spot, index) => spots.slice(index + 1).every((other) => Math.hypot(spot.x - other.x, spot.y - other.y) >= arena.plate * 3.25));
    if (!separated) continue;
    const score = -spots.reduce((sum, spot) => sum + Math.abs(distToPath(spot.x, spot.y) - 72), 0);
    if (!best || score > best.score) best = { spots, score };
  }
  return best?.spots || null;
}

function deployBestBondFormation() {
  const unitsById = new Map(allOwnedUnits().map((unit) => [unit.id, unit]));
  const currentPopulation = usedPopulation();
  const candidates = BOND_DEFS.map((bond) => {
    const existing = bond.members.map((id) => state.towers.find((tower) => tower.id === id)).filter(Boolean);
    const selected = [...existing];
    let population = currentPopulation;
    bond.members.forEach((id) => {
      const unit = unitsById.get(id);
      if (!unit || selected.some((item) => item.id === id) || !state.backpack.some((item) => item.uid === unit.uid)) return;
      const cost = populationCostFor(unit);
      if (population + cost <= state.maxPopulation) { selected.push(unit); population += cost; }
    });
    return { bond, selected, score: selected.length * 100 + existing.length * 12 };
  }).filter((candidate) => candidate.selected.length >= candidate.bond.need).sort((a, b) => b.score - a.score)[0];
  if (!candidates) return null;

  const selectedUids = new Set(candidates.selected.map((unit) => unit.uid));
  const originalTowers = state.towers;
  const formationTowers = originalTowers.filter((tower) => selectedUids.has(tower.uid));
  state.towers = originalTowers.filter((tower) => !selectedUids.has(tower.uid));
  const spots = findFormationSpots(candidates.selected.length);
  if (!spots) { state.towers = originalTowers; return null; }

  const formationUnits = candidates.selected.map((unit) => formationTowers.find((tower) => tower.uid === unit.uid) || unit);
  state.backpack = state.backpack.filter((unit) => !selectedUids.has(unit.uid));
  formationUnits.forEach((unit, index) => state.towers.push({ ...unit, x: spots[index].x, y: spots[index].y, cd: unit.cd || .15, hitTarget: null, hitCount: 0 }));
  return { name: candidates.bond.name, placed: formationUnits.length - formationTowers.length };
}

function autoDeploy() {
  const formation = deployBestBondFormation();
  let placed = formation?.placed || 0;
  while (state.backpack.length && usedPopulation() < state.maxPopulation) {
    const unitIndex = state.backpack.findIndex((unit) => !state.towers.some((tower) => tower.id === unit.id) && usedPopulation() + populationCostFor(unit) <= state.maxPopulation);
    if (unitIndex < 0) break;
    const spot = autoSpot();
    if (!spot) break;
    const [unit] = state.backpack.splice(unitIndex, 1);
    state.towers.push({ ...unit, x: spot.x, y: spot.y, cd: .15, hitTarget: null, hitCount: 0 });
    placed += 1;
  }
  state.selectedUnitId = null;
  if (placed && state.tutorialStep === 1) { state.tutorialStep = 2; refs.arenaHint.textContent = '布阵完成：妖灵会自动攻击。注意让攻击范围覆盖道路。'; }
  if (placed || formation) playSound('deploy');
  addLog(formation ? `一键部署优先完成「${formation.name}」阵型，共新上场 ${placed} 只妖灵。` : placed ? `一键部署：${placed} 只不同名妖灵已在路边成阵。` : '没有可部署的妖灵、人口或合法位置。');
  renderGameRoster();
  renderBackpack();
  updateHUD();
}

function recallAll() {
  const room = MAX_BACKPACK - state.backpack.length;
  const returning = state.towers.splice(0, Math.max(0, room));
  state.backpack.push(...returning.map(({ x, y, ...unit }) => unit));
  state.selectedUnitId = state.backpack[0]?.uid || null;
  addLog(returning.length ? (state.towers.length ? `背包空间有限，已下场 ${returning.length} 只；仍有 ${state.towers.length} 只留在场上。` : `已下场 ${returning.length} 只妖灵，收入背包。`) : '背包已满，无法下场。');
  renderGameRoster();
  renderBackpack();
  updateHUD();
}

function renderBackpack() {
  if (!refs.backpackList) return;
  refs.backpackList.innerHTML = state.backpack.length ? state.backpack.map((unit) => unitCard(unit, `${state.selectedUnitId === unit.uid ? 'is-selected' : ''} ${state.fusionSelection.includes(unit.uid) ? 'is-fusing' : ''}`)).join('') : '<p class="dialog-empty">背包为空。普通、高级召灵均可单抽或八折五连。</p>';
  refs.backpackList.querySelectorAll('[data-unit-id]').forEach((button) => button.addEventListener('click', () => {
    const uid = button.dataset.unitId;
    if (refs.fusionDialog.open) toggleFusionUnit(uid); else { selectUnit(uid); closeGameDialog(refs.backpackDialog); }
  }));
}

function openFusion() {
  if (state.backpack.length < 2) { addLog('背包中至少需要两只妖灵才能合成。'); return false; }
  state.fusionSelection = [];
  renderFusion();
  showGameDialog(refs.fusionDialog);
  return true;
}

function toggleFusionUnit(uid) {
  const unit = state.backpack.find((item) => item.uid === uid);
  if (!unit) return;
  if (state.fusionSelection.includes(uid)) state.fusionSelection = state.fusionSelection.filter((item) => item !== uid);
  else if (state.fusionSelection.length < 2) state.fusionSelection.push(uid);
  renderFusion();
}

function renderFusion() {
  const selected = state.fusionSelection.map((uid) => state.backpack.find((unit) => unit.uid === uid)).filter(Boolean);
  refs.fusionList.innerHTML = state.backpack.map((unit) => unitCard(unit, state.fusionSelection.includes(unit.uid) ? 'is-fusing' : '')).join('');
  refs.fusionList.querySelectorAll('[data-unit-id]').forEach((button) => button.addEventListener('click', () => toggleFusionUnit(button.dataset.unitId)));
  refs.fusionSelection.textContent = selected.length === 2 ? `已选：${beastDef(selected[0].id).name} 与 ${beastDef(selected[1].id).name} · 消耗 18 灵蕴` : `选择两只同稀有度妖灵 · 15% 上跃 / 35% 同级 / 50% 降阶`;
  refs.fuseBeasts.disabled = selected.length !== 2 || beastDef(selected[0].id).rarity !== beastDef(selected[1].id).rarity || state.energy < 18;
}

function fuseSelected() {
  const units = state.fusionSelection.map((uid) => state.backpack.find((unit) => unit.uid === uid)).filter(Boolean);
  if (units.length !== 2 || beastDef(units[0].id).rarity !== beastDef(units[1].id).rarity || state.energy < 18) return;
  state.energy -= 18;
  const outcome = fuseUnits(units[0], units[1]);
  state.fusionSelection = [];
  closeGameDialog(refs.fusionDialog);
  addLog(`合成结果：${outcome.label}。`);
  renderGameRoster();
  renderBackpack();
  updateHUD();
}

function openFortuneSign() {
  drawFortune();
}

function addSignEffect(type, label) {
  state.signEffects = state.signEffects.filter((effect) => effect.type !== type);
  state.signEffects.push({ type, label });
}

function drawFortune() {
  if (state.fortuneSpinning) return;
  if (!state.towers.length) { addLog('至少上阵一只妖灵后才能摇签。'); return; }
  if (state.energy < FORTUNE_COST) { addLog(`转运签需要 ${FORTUNE_COST} 灵蕴。`); return; }
  state.fortuneSpinning = true;
  state.energy -= FORTUNE_COST;
  const outcome = randomFromWeights([
    ['ally', 25], ['enemy', 14], ['debuff', 22], ['half', 11], ['full', 11], ['double', 5], ['tenfold', 2], ['empty', 10],
  ]);
  let result;
  if (outcome === 'ally') {
    addSignEffect('allyBuff', '天佑：全军攻防加持');
    result = { name: '天佑', text: '本局全军攻击与攻速提升。', tone: 'good' };
  } else if (outcome === 'enemy') {
    const existed = Boolean(activeSignEffect('enemyBuff'));
    addSignEffect('enemyBuff', '凶煞：敌军受益');
    if (!existed) state.enemies.forEach((enemy) => { enemy.maxHp *= 1.18; enemy.hp *= 1.18; });
    state.enemies.forEach(refreshEnemyModifiers);
    result = { name: '凶煞', text: '本局敌军生命、移速与护甲提升。', tone: 'bad' };
  } else if (outcome === 'debuff') {
    addSignEffect('enemyDebuff', '破甲迟滞：敌军受制');
    state.enemies.forEach(refreshEnemyModifiers);
    result = { name: '破甲迟滞', text: '本局敌军减速并降低护甲。', tone: 'good' };
  } else {
    const refunds = { half: 15, full: 30, double: 60, tenfold: 300, empty: 0 };
    const labels = { half: '半签返蕴', full: '全额返还', double: '双倍返蕴', tenfold: '天命十返', empty: '谢谢惠顾' };
    const refund = refunds[outcome];
    state.energy += refund;
    result = { name: labels[outcome], text: refund ? `返还 ${refund} 灵蕴。` : '灵蕴未返还，本签落空。', tone: refund ? 'good' : 'bad' };
  }
  state.lastSign = result;
  const finalSymbols = result.tone === 'good' ? ['福', '灵', '吉'] : ['凶', '煞', '空'];
  const reel = (symbol) => `<div class="slot-reel"><div class="slot-track"><i>山</i><i>海</i><i>玄</i><i>运</i><i>${symbol}</i></div></div>`;
  refs.fortuneResult.classList.remove('is-revealed');
  refs.fortuneResult.innerHTML = `<div class="slot-machine">${finalSymbols.map(reel).join('')}</div><strong class="fortune-${result.tone}">${result.name}</strong><span>${result.text}</span>`;
  if (!refs.fortuneDialog.open) refs.fortuneDialog.showModal();
  playSound('fortune');
  addLog(`转运签：${result.name}。${result.text}`);
  updateHUD();
  window.setTimeout(() => refs.fortuneResult.classList.add('is-revealed'), 1580);
  window.setTimeout(() => {
    state.fortuneSpinning = false;
    if (refs.fortuneDialog.open) refs.fortuneDialog.close();
    updateHUD();
  }, 3000);
}

function updateHUD() {
  const waveCount = totalWaves();
  const phaseText = state.phase === 'prep' ? `整备 ${Math.ceil(state.prepTimer)}s` : state.phase === 'rest' ? `下一波 ${Math.ceil(state.waveCooldown)}s` : `余敌 ${state.enemies.length}`;
  const selected = selectedUnit();
  refs.hpLabel.textContent = `${Math.max(0, state.hp)} / ${state.maxHp}`; refs.hpMeter.style.width = `${clamp(state.hp / state.maxHp * 100, 0, 100)}%`; refs.essenceLabel.textContent = Math.floor(state.energy); refs.killLabel.textContent = state.score; refs.bestScoreLabel.textContent = Math.max(state.bestScore, state.score); refs.waveLabel.textContent = `波次 ${Math.min(state.wave + 1, waveCount)} / ${phaseText}`;
  refs.gameLevel.textContent = `波次 ${Math.min(state.wave + 1, waveCount)} / ${phaseText}`;
  const hpBlocks = document.querySelector('#hp-blocks');
  if (hpBlocks) hpBlocks.innerHTML = Array.from({ length: state.maxHp }, (_, index) => `<i class="${index >= state.hp ? 'is-empty' : ''}"></i>`).join('');
  refs.waveTrack.innerHTML = Array.from({ length: waveCount }, (_, index) => `<i class="${index < state.wave ? 'done' : index === state.wave ? 'current' : ''}"></i>`).join(''); refs.pauseGame.querySelector('strong').textContent = state.paused ? '继续' : '暂停'; refs.speedGame.querySelector('strong').textContent = `${state.speed}倍速`; refs.populationLabel.textContent = `${usedPopulation()} / ${state.maxPopulation}`;
  refs.backpackLabel.textContent = `${state.backpack.length}/${MAX_BACKPACK}`; refs.selectedUnitLabel.textContent = selected ? `${beastDef(selected.id).name} · ${RARITIES[beastDef(selected.id).rarity]} Lv.${selected.level} · 人口 ${populationCostFor(selected)} · ${beastDef(selected.id).kindText}` : state.selectedTowerUid ? `${beastDef(state.towers.find((tower) => tower.uid === state.selectedTowerUid)?.id || 'bifang').name} · 按住立绘可移动` : '点击召灵，随机请出 N 至 UR 妖灵';
  const hasSingle = state.summonOffers.length > 0;
  const hasFive = state.advancedBatch.length > 0;
  const pendingNormalSingle = hasSingle && state.summonMode === 'normal';
  const pendingAdvancedSingle = hasSingle && state.summonMode === 'advanced';
  const pendingNormalFive = hasFive && state.advancedMode === 'normal';
  const pendingAdvancedFive = hasFive && state.advancedMode === 'advanced';
  refs.summonBeast.disabled = state.paused || hasFive || (hasSingle && !pendingNormalSingle) || (!hasSingle && (state.energy < SUMMON_COST || state.backpack.length >= MAX_BACKPACK)); refs.summonBeast.querySelector('span').textContent = pendingNormalSingle ? '查看普通结果' : `普通单抽 ${SUMMON_COST}`;
  refs.summonBeastFive.disabled = state.paused || hasSingle || (hasFive && !pendingNormalFive) || (!hasFive && (state.energy < SUMMON_FIVE_COST || state.backpack.length + 5 > MAX_BACKPACK)); refs.summonBeastFive.querySelector('span').textContent = pendingNormalFive ? '领取普通五连' : `普通五连 ${SUMMON_FIVE_COST}`;
  refs.advancedSummon.disabled = state.paused || hasFive || (hasSingle && !pendingAdvancedSingle) || (!hasSingle && (state.energy < ADVANCED_SUMMON_COST || state.backpack.length >= MAX_BACKPACK)); refs.advancedSummon.querySelector('span').textContent = pendingAdvancedSingle ? '查看高级结果' : `高级单抽 ${ADVANCED_SUMMON_COST}`;
  refs.advancedSummonFive.disabled = state.paused || hasSingle || (hasFive && !pendingAdvancedFive) || (!hasFive && (state.energy < ADVANCED_FIVE_COST || state.backpack.length + 5 > MAX_BACKPACK)); refs.advancedSummonFive.querySelector('span').textContent = pendingAdvancedFive ? '领取高级五连' : `高级五连 ${ADVANCED_FIVE_COST}`;
  const hasFormationCandidate = BOND_DEFS.some((bond) => bond.members.filter((id) => allOwnedUnits().some((unit) => unit.id === id)).length >= bond.need);
  refs.autoDeploy.disabled = !hasFormationCandidate && !state.backpack.some((unit) => !state.towers.some((tower) => tower.id === unit.id) && usedPopulation() + populationCostFor(unit) <= state.maxPopulation); refs.recallAll.disabled = !state.towers.length || state.backpack.length >= MAX_BACKPACK;
  refs.fortuneSign.disabled = state.paused || state.fortuneSpinning || !state.towers.length || state.energy < FORTUNE_COST; refs.fortuneSign.querySelector('strong').textContent = state.fortuneSpinning ? '签轮转动中' : state.towers.length ? `转运签 ${FORTUNE_COST}` : '转运签 · 需上阵';
  refs.requiredBeastLabel.classList.toggle('is-complete', state.towers.some((tower) => tower.id === state.requiredBeastId));
  renderGameBonds();
}

function useSkill() {
  if (!state.skillBond || state.skillCooldowns[state.skillBond.id] > 0) return;
  playSound('skill');
  const bond = state.skillBond; const source = bond.members[0] || state.towers[0] || { id: 'bond' };
  const nearby = (radius) => state.enemies.filter((enemy) => enemy.hp > 0 && bond.members.some((member) => Math.hypot(member.x - enemy.x, member.y - enemy.y) <= radius));
  if (bond.skill === 'tide') {
    nearby(250).forEach((enemy) => { enemy.slow = Math.max(enemy.slow, .6); enemy.slowTimer = Math.max(enemy.slowTimer, 3.2); burst(enemy.x, enemy.y, bond.color, 6); });
    addLog(`${bond.ult}发动：范围内敌军减速 60%，持续 3.2 秒。`);
  } else if (bond.skill === 'roar') {
    nearby(235).forEach((enemy) => { enemy.stunned = Math.max(enemy.stunned || 0, 1.5); enemy.armor = Math.max(0, enemy.armor - 4); burst(enemy.x, enemy.y, bond.color, 7); });
    addLog(`${bond.ult}发动：范围内敌军眩晕 1.5 秒并降低 4 点护甲。`);
  } else if (bond.skill === 'fire') {
    const amount = bond.members.reduce((sum, member) => sum + beastDef(member.id).dmg, 0) / bond.members.length * 3.4 * (1 + bondTotals().power);
    nearby(215).forEach((enemy) => damageEnemy(enemy, amount, { dmgType: 'true', counters: ['execute', 'breakShield', 'purge'], color: bond.color, burn: true, burnDps: .22 }, 0, source));
    addLog(`${bond.ult}发动：范围内敌军承受 3.4 倍真伤并被灼烧。`);
  } else {
    const amount = 120 * bond.ultMul * (1 + bondTotals().power);
    state.enemies.forEach((enemy) => damageEnemy(enemy, amount, { dmgType: 'true', counters: ['execute', 'breakShield', 'purge'], color: bond.color }, 0, source));
    addLog(`${bond.ult}发动：全场真伤，${bond.name}完成联动。`);
  }
  state.skillCooldowns[bond.id] = (bond.cooldown || 18) * Math.max(.35, 1 - bondTotals().cdr);
  renderGameBonds();
}

function drawPath(route, level) {
  const [edge, road, light] = ROAD_PALETTES[state.stage];
  const trace = () => { ctx.beginPath(); route.points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(18, 14, 10, .36)'; ctx.lineWidth = arena.roadW + 20; trace();
  ctx.strokeStyle = edge; ctx.lineWidth = arena.roadW + 12; trace();
  ctx.strokeStyle = road; ctx.lineWidth = arena.roadW; trace();
  ctx.strokeStyle = light; ctx.globalAlpha = .34; ctx.lineWidth = arena.roadW - 13; trace();
  ctx.globalAlpha = .36; ctx.strokeStyle = '#fff2c5'; ctx.lineWidth = 2; ctx.setLineDash([9, 12]); ctx.lineDashOffset = -state.battleTime * 26; trace();
  ctx.restore();
}

function drawStageAtmosphere(level) {
  ctx.save();
  ctx.globalAlpha = .32;
  ctx.strokeStyle = level.accent;
  ctx.lineWidth = 1.2;
  if (level.path === 'cave') {
    for (let x = 90; x < 900; x += 120) { ctx.beginPath(); ctx.moveTo(x, 18); ctx.lineTo(x + 18, 46); ctx.lineTo(x + 7, 74); ctx.stroke(); }
  } else if (level.path === 'grass') {
    ctx.globalAlpha = .23;
    for (let x = 16; x < 940; x += 26) { const y = x % 52 ? 502 : 64; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y - 16); ctx.moveTo(x, y); ctx.lineTo(x + 7, y - 12); ctx.stroke(); }
  } else if (level.path === 'sea') {
    ctx.globalAlpha = .28;
    for (let i = 0; i < 5; i += 1) { const x = 150 + i * 172; const y = 76 + (i % 2) * 338; ctx.beginPath(); ctx.ellipse(x, y, 54, 11, 0, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.ellipse(x, y, 32, 6, 0, 0, Math.PI * 2); ctx.stroke(); }
  } else if (level.path === 'volcano') {
    ctx.globalAlpha = .4;
    for (let i = 0; i < 4; i += 1) { const x = 110 + i * 235; ctx.beginPath(); ctx.moveTo(x, 510); ctx.lineTo(x + 22, 476); ctx.lineTo(x + 8, 446); ctx.lineTo(x + 34, 414); ctx.stroke(); }
  } else {
    ctx.globalAlpha = .23;
    for (let i = 0; i < 4; i += 1) { const y = 72 + i * 118; ctx.beginPath(); ctx.arc(118 + i * 180, y, 72, Math.PI * .12, Math.PI * .82); ctx.stroke(); ctx.beginPath(); ctx.arc(208 + i * 160, y + 26, 52, Math.PI * 1.14, Math.PI * 1.85); ctx.stroke(); }
  }
  ctx.restore();
}

function drawSeal(x, y, level, index) {
  const pulse = 1 + Math.sin(state.battleTime * 2.2 + index) * .035;
  ctx.save(); ctx.translate(x, y); ctx.scale(pulse, pulse);
  ctx.fillStyle = 'rgba(213, 167, 70, .15)'; ctx.strokeStyle = '#d9b151'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, arena.wardR + 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(236, 199, 103, .48)'; ctx.beginPath(); ctx.arc(0, 0, arena.wardR + 2, 0, Math.PI * 2); ctx.stroke();
  const monument = fxSprites['seal-monument'];
  if (monument?.complete && monument.naturalWidth) ctx.drawImage(monument, -35, -48, 70, 78);
  else { ctx.fillStyle = '#776553'; ctx.fillRect(-15, -29, 30, 47); ctx.fillStyle = '#bb392c'; ctx.fillRect(-10, -24, 20, 36); }
  ctx.restore();
}

function drawSpawnFissure(x, y, level, index) {
  const pulse = Math.sin(state.battleTime * 2.4 + index) * 3;
  ctx.save(); ctx.translate(x, y);
  const fissure = fxSprites['spawn-fissure'];
  if (fissure?.complete && fissure.naturalWidth) { const size = 76 + pulse * 1.5; ctx.globalAlpha = .88; ctx.drawImage(fissure, -size * .5, -size * .5, size, size); }
  ctx.strokeStyle = state.stage === 3 ? '#ff714b' : '#c54b3d'; ctx.lineWidth = 2;
  ctx.globalAlpha = .32; ctx.beginPath(); ctx.arc(0, 0, 31 + pulse, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = .58; ctx.beginPath(); ctx.arc(0, 0, 22 - pulse * .25, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = .9; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-5, -19); ctx.lineTo(2, -8); ctx.lineTo(-4, 1); ctx.lineTo(5, 15); ctx.stroke();
  ctx.fillStyle = 'rgba(129, 25, 21, .28)'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function drawProjectile(projectile) {
  const color = projectile.def.color;
  const kind = projectile.def.proj;
  const dx = projectile.target.x - projectile.x;
  const dy = projectile.target.y - projectile.y;
  const angle = Math.atan2(dy, dx);
  const variant = projectile.seed || 0;
  const phase = state.battleTime * (7 + variant % 5) + variant * .13;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  if (projectile.trail.length > 1) {
    ctx.globalAlpha = kind === 'claw' ? .25 : .5;
    ctx.lineWidth = kind === 'quake' ? 3 : 2;
    ctx.beginPath();
    projectile.trail.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.stroke();
  }
  ctx.translate(projectile.x, projectile.y);
  ctx.rotate(angle);
  ctx.globalAlpha = 1;
  const attackSprite = attackSprites[kind];
  const attackFrame = Math.floor((projectile.age * 14 + variant * .07) % 4);
  const attackCellW = attackSprite?.naturalWidth ? attackSprite.naturalWidth / 2 : 0;
  const attackCellH = attackSprite?.naturalHeight ? attackSprite.naturalHeight / 2 : 0;
  const attackSize = kind === 'quake' ? 48 : kind === 'claw' ? 42 : kind === 'wisp' ? 34 : 30;
  const renderedAttackSprite = attackSprite?.complete && attackSprite.naturalWidth && attackCellW && attackCellH;
  if (renderedAttackSprite) {
    const sx = (attackFrame % 2) * attackCellW;
    const sy = Math.floor(attackFrame / 2) * attackCellH;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = .92;
    ctx.drawImage(attackSprite, sx, sy, attackCellW, attackCellH, -attackSize * .5, -attackSize * .5, attackSize, attackSize);
  } else if (kind === 'ember') {
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = color; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.quadraticCurveTo(-1, -7, -10, Math.sin(phase) * 3); ctx.quadraticCurveTo(-2, 7, 8, 0); ctx.fill();
    ctx.fillStyle = '#fff2a8'; ctx.beginPath(); ctx.arc(2, 0, 2.2, 0, Math.PI * 2); ctx.fill();
  } else if (kind === 'wisp') {
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = color; ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 5;
    for (let i = 0; i < 3; i += 1) { const orbit = phase + i * Math.PI * 2 / 3; ctx.beginPath(); ctx.arc(Math.cos(orbit) * 9, Math.sin(orbit) * 5, 1.5, 0, Math.PI * 2); ctx.fill(); }
  } else if (kind === 'claw') {
    ctx.lineWidth = 2.4; ctx.shadowColor = color; ctx.shadowBlur = 7;
    for (let i = -1; i <= 1; i += 1) { ctx.beginPath(); ctx.moveTo(-8, i * 5 - 3); ctx.quadraticCurveTo(0, i * 4 + 2, 9, i * 5); ctx.stroke(); }
  } else if (kind === 'quake') {
    ctx.rotate(phase * .35); ctx.shadowColor = color; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(7, 0); ctx.lineTo(0, 7); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = .55; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 10 + Math.sin(phase) * 2, 0, Math.PI * 2); ctx.stroke();
  } else {
    ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = color; ctx.shadowBlur = 11;
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .7; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 9 + Math.sin(phase) * 2, -.8, .8); ctx.stroke();
    ctx.beginPath(); ctx.arc(-2, 0, 13 + Math.cos(phase) * 2, -.55, .55); ctx.stroke();
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = variant % 2 ? '#f7dc9f' : color;
  ctx.globalAlpha = .45;
  const moteCount = 1 + variant % 4;
  const moteRadius = 7 + variant % 6;
  for (let i = 0; i < moteCount; i += 1) {
    const moteAngle = phase * .55 + i * Math.PI * 2 / moteCount;
    ctx.beginPath();
    ctx.arc(Math.cos(moteAngle) * moteRadius - 2, Math.sin(moteAngle) * moteRadius * .55, 1 + variant % 3 * .35, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCanvas() {
  const level = currentLevel(); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#152124'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const stageBackground = stageBackgrounds[state.stage];
  if (stageBackground?.complete && stageBackground.naturalWidth) { ctx.drawImage(stageBackground, 0, 0, stageBackground.naturalWidth, stageBackground.naturalHeight, 0, 0, canvas.width, canvas.height); ctx.fillStyle = state.stage === 3 ? 'rgba(36, 10, 8, .08)' : 'rgba(23, 36, 33, .08)'; ctx.fillRect(0, 0, canvas.width, canvas.height); } else if (state.stage === 0 && caveBattlefield.complete && caveBattlefield.naturalWidth) { ctx.drawImage(caveBattlefield, 0, 0, caveBattlefield.naturalWidth, caveBattlefield.naturalHeight, 0, 0, canvas.width, canvas.height); } else if (biomeAtlas.complete && biomeAtlas.naturalWidth) { const panelW = biomeAtlas.naturalWidth / 5; ctx.drawImage(biomeAtlas, panelW * state.stage, 0, panelW, biomeAtlas.naturalHeight, 0, 0, canvas.width, canvas.height); }
  drawStageAtmosphere(level);
  pathInfo(level).forEach((route) => drawPath(route, level));
  levelSeals(level).forEach(([x, y], index) => drawSeal(x, y, level, index));
  levelSpawns(level).forEach(([x, y], index) => drawSpawnFissure(x, y, level, index));
  const movingTower = state.draggingTowerIndex >= 0 ? state.towers[state.draggingTowerIndex] : null;
  const placingUnit = selectedUnit();
  if (state.mouse.inside && (placingUnit || movingTower)) {
    const ignore = movingTower ? state.draggingTowerIndex : -1;
    const legal = canPlaceAt(state.mouse.x, state.mouse.y, ignore);
    const previewDef = beastDef((placingUnit || movingTower).id);
    const ritual = fxSprites['summon-ritual'];
    if (ritual?.complete && ritual.naturalWidth) { const size = 86 + Math.sin(state.battleTime * 4) * 3; ctx.save(); ctx.globalAlpha = legal ? .72 : .24; ctx.drawImage(ritual, state.mouse.x - size * .5, state.mouse.y - size * .5, size, size); ctx.restore(); }
    ctx.save(); ctx.strokeStyle = legal ? 'rgba(93, 213, 180, .78)' : 'rgba(226, 74, 56, .86)'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.arc(state.mouse.x, state.mouse.y, previewDef.range, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    for (let gy = -1; gy <= 1; gy += 1) for (let gx = -1; gx <= 1; gx += 1) { const hx = state.mouse.x + gx * arena.plate * 3.25; const hy = state.mouse.y + gy * arena.plate * 3.25; if (canPlaceAt(hx, hy, ignore)) { ctx.fillStyle = 'rgba(102, 221, 188, .22)'; ctx.strokeStyle = 'rgba(151, 239, 210, .64)'; ctx.beginPath(); ctx.arc(hx, hy, 17, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); } }
    ctx.restore();
  }
  const selectedTower = state.towers.find((tower) => tower.uid === state.selectedTowerUid);
  if (selectedTower && !movingTower) { const def = beastDef(selectedTower.id); ctx.save(); ctx.strokeStyle = `${def.color}9a`; ctx.lineWidth = 1.5; ctx.setLineDash([7, 6]); ctx.beginPath(); ctx.arc(selectedTower.x, selectedTower.y, def.range, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  state.towers.forEach((tower) => drawTower(tower)); state.enemies.forEach((enemy) => drawEnemy(enemy)); state.projectiles.forEach((projectile) => drawProjectile(projectile)); state.particles.forEach((item) => { ctx.globalAlpha = clamp(item.life, 0, 1); ctx.fillStyle = item.color; ctx.beginPath(); ctx.arc(item.x, item.y, 2 + item.life * 3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; });
  const hitSpark = fxSprites['hit-spark'];
  if (hitSpark?.complete && hitSpark.naturalWidth) state.hitBursts.forEach((item) => { const progress = 1 - item.life / .24; const size = item.size * (.65 + progress * .65); ctx.globalAlpha = clamp(item.life / .2, 0, 1); ctx.drawImage(hitSpark, item.x - size * .5, item.y - size * .5, size, size); ctx.globalAlpha = 1; });
  state.damageTexts.forEach((item) => { ctx.globalAlpha = clamp(item.life, 0, 1); ctx.fillStyle = item.color; ctx.font = 'bold 12px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(item.text, item.x, item.y); ctx.globalAlpha = 1; });
}

function drawTower(tower) {
  const def = beastDef(tower.id); const sprite = combatSprites[tower.id]; const size = 82 + Math.min(18, (tower.level - 1) * 3);
  ctx.save(); ctx.translate(tower.x, tower.y);
  const bob = Math.sin(state.battleTime * 2.2 + tower.x * .01) * 1.3;
  ctx.fillStyle = 'rgba(36, 25, 17, .35)'; ctx.beginPath(); ctx.ellipse(0, 18, size * .34, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = def.color; ctx.globalAlpha = state.selectedTowerUid === tower.uid ? 1 : .7; ctx.lineWidth = state.selectedTowerUid === tower.uid ? 3 : 1.5; ctx.beginPath(); ctx.ellipse(0, 15, size * .29, 9, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  if (sprite?.complete && sprite.naturalWidth) {
    ctx.drawImage(sprite, -size * .5, 15 - size + bob, size, size);
  } else if (beastAtlas.complete && beastAtlas.naturalWidth) {
    const cellW = beastAtlas.naturalWidth / 6; const cellH = beastAtlas.naturalHeight / 5; const sx = (def.portraitIndex % 6) * cellW; const sy = Math.floor(def.portraitIndex / 6) * cellH;
    ctx.save(); ctx.beginPath(); ctx.roundRect(-34, -62 + bob, 68, 68, 9); ctx.clip(); ctx.drawImage(beastAtlas, sx, sy, cellW, cellH, -34, -62 + bob, 68, 68); ctx.restore(); ctx.strokeStyle = def.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(-34, -62 + bob, 68, 68, 9); ctx.stroke();
  } else { ctx.fillStyle = def.color; ctx.font = 'bold 18px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(def.name.slice(0, 1), 0, 2); }
  ctx.fillStyle = 'rgba(37, 29, 21, .86)'; ctx.fillRect(-18, 22, 36, 12); ctx.fillStyle = '#fff0bd'; ctx.font = 'bold 9px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(`Lv.${tower.level}`, 0, 31); ctx.restore();
}

function drawEnemy(enemy) {
  const isBoss = enemy.role !== 'normal' || enemy.def.boss;
  const sprite = combatSprites[enemy.type]; const radius = enemy.radius * 1.35; const size = radius * (isBoss ? 5.4 : 4.6);
  ctx.save(); ctx.translate(enemy.x, enemy.y); ctx.globalAlpha = enemy.stealthTimer > 0 ? .32 : 1;
  ctx.fillStyle = 'rgba(43, 31, 21, .24)'; ctx.beginPath(); ctx.ellipse(0, 11, size * .29, 5, 0, 0, Math.PI * 2); ctx.fill();
  if (isBoss) { ctx.strokeStyle = enemy.def.color; ctx.globalAlpha *= .38; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -size * .22, size * .34, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = enemy.stealthTimer > 0 ? .32 : 1; }
  if (sprite?.complete && sprite.naturalWidth) {
    ctx.drawImage(sprite, -size * .5, 12 - size, size, size);
  } else if (enemyAtlas.complete && enemyAtlas.naturalWidth) {
    const cellW = enemyAtlas.naturalWidth / 5; const cellH = enemyAtlas.naturalHeight / 2; const sx = (enemy.def.sprite % 5) * cellW; const sy = Math.floor(enemy.def.sprite / 5) * cellH;
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(enemyAtlas, sx, sy, cellW, cellH, -radius, -radius, radius * 2, radius * 2); ctx.restore();
  } else { ctx.fillStyle = enemy.def.color; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#f1ecdf'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(enemy.def.name.slice(0, 1), 0, 3); }
  ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(34, 27, 20, .82)'; ctx.fillRect(-radius * 1.2, -size * .52 - 6, radius * 2.4, 6); ctx.fillStyle = enemy.hp / enemy.maxHp < .25 ? '#d64b36' : '#58b093'; ctx.fillRect(-radius * 1.2, -size * .52 - 6, radius * 2.4 * clamp(enemy.hp / enemy.maxHp, 0, 1), 6);
  if (enemy.shield > 0) { ctx.strokeStyle = '#b5e8e6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, -size * .24, radius * 1.05, size * .42, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}

function renderCodex() {
  const projectileNames = { ember: '焰火', splash: '溅射', wisp: '灵光', claw: '裂爪', quake: '地裂' };
  const counterNames = { purge: '破法', execute: '斩杀', breakShield: '破盾', splash: '溅射', insight: '洞察' };
  refs.codexDialogList.innerHTML = ROSTER.map((beast) => {
    const data = beastDef(beast.id); const effects = [data.burn ? '灼烧' : '', data.splash ? `溅射 ${data.splash}` : '', data.chain ? `连锁 ${data.chain}` : '', data.slow ? `减速 ${Math.round(data.slow * 100)}%` : '', data.stunEvery ? `每 ${data.stunEvery} 次眩晕` : '', data.breakAt ? `第 ${data.breakAt} 击破甲` : ''].filter(Boolean).join(' · ') || '基础攻击';
    return `<article class="codex-entry rarity-${RARITIES[beast.rarity]}">${portraitMarkup(beast)}<div class="codex-entry-head"><strong>${beast.name}</strong><em>${RARITIES[beast.rarity]}</em></div><small>${projectileNames[data.proj] || data.proj} · ${data.dmgType === 'mag' ? '法术' : data.dmgType === 'true' ? '真实' : '物理'} · ${counterNames[data.counters?.[0]] || '无克制'}</small><dl><div><dt>攻击</dt><dd>${data.dmg}</dd></div><div><dt>攻速</dt><dd>${data.interval.toFixed(2)}s</dd></div><div><dt>范围</dt><dd>${data.range}</dd></div><div><dt>人口</dt><dd>${populationCostFor(beast.id)}</dd></div></dl><p>${effects}</p></article>`;
  }).join('');
}

function tick(timestamp) {
  const rawDt = Math.min(.05, (timestamp - state.lastTime) / 1000 || 0); state.lastTime = timestamp;
  if (state.screen === 'game' && !state.paused) {
    const simDt = rawDt * state.speed;
    state.battleTime += simDt;
    Object.keys(state.skillCooldowns).forEach((id) => { state.skillCooldowns[id] = Math.max(0, state.skillCooldowns[id] - simDt); });
    spawnFromGroups(simDt); updateTowers(simDt); updateProjectiles(simDt); updateEnemies(simDt); updateEffects(simDt); updateHUD();
  }
  if (state.screen === 'game' || state.screen === 'finishing') drawCanvas(); requestAnimationFrame(tick);
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  if (window.innerHeight > window.innerWidth) return { x: (event.clientY - rect.top) * canvas.width / rect.height, y: (rect.right - event.clientX) * canvas.height / rect.width };
  return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
}
canvas.addEventListener('pointermove', (event) => { Object.assign(state.mouse, canvasPoint(event), { inside: true }); });
canvas.addEventListener('pointerleave', () => { if (state.draggingTowerIndex < 0) state.mouse.inside = false; });
canvas.addEventListener('pointerdown', (event) => {
  if (state.screen !== 'game' || state.paused) return;
  const point = canvasPoint(event);
  Object.assign(state.mouse, point, { inside: true });
  if (selectedUnit()) { placeTower(point.x, point.y); return; }
  const index = state.towers.findLastIndex((tower) => Math.hypot(tower.x - point.x, tower.y - point.y) <= 38);
  if (index >= 0) {
    state.draggingTowerIndex = index;
    state.selectedTowerUid = state.towers[index].uid;
    canvas.setPointerCapture?.(event.pointerId);
    refs.arenaHint.textContent = `移动 ${beastDef(state.towers[index].id).name}：拖到光环标记的合法位置`;
    updateHUD();
  }
});
document.addEventListener('pointermove', (event) => {
  if (!state.draggingUnitId) return;
  const rect = canvas.getBoundingClientRect();
  const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  if (!inside) { state.mouse.inside = false; return; }
  Object.assign(state.mouse, canvasPoint(event), { inside: true });
});
document.addEventListener('pointerup', (event) => {
  if (state.draggingTowerIndex >= 0) {
    const index = state.draggingTowerIndex;
    state.draggingTowerIndex = -1;
    const rect = canvas.getBoundingClientRect();
    if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
      const point = canvasPoint(event);
      if (canPlaceAt(point.x, point.y, index)) {
        state.towers[index].x = point.x; state.towers[index].y = point.y;
        addLog(`${beastDef(state.towers[index].id).name}已移阵。`);
      } else addLog('落点不合法，妖灵返回原位。');
    }
    refs.arenaHint.textContent = '按住场上妖灵可移动，射程与九宫落点实时显示';
    renderGameBonds(); updateHUD();
    return;
  }
  const unitId = state.draggingUnitId;
  state.draggingUnitId = null;
  if (!unitId || state.screen !== 'game' || state.paused) return;
  const rect = canvas.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
  state.selectedUnitId = unitId;
  const point = canvasPoint(event);
  placeTower(point.x, point.y);
});
document.addEventListener('pointercancel', () => { state.draggingUnitId = null; state.draggingTowerIndex = -1; state.mouse.inside = false; });
refs.startGame.addEventListener('click', initGame);
refs.summonBeast.addEventListener('click', summonBeast);
refs.summonBeastFive.addEventListener('click', summonBeastFive);
refs.advancedSummon.addEventListener('click', advancedSummon);
refs.advancedSummonFive.addEventListener('click', advancedSummonFive);
refs.advancedClaim.addEventListener('click', claimAdvancedBatch);
refs.openBackpack.addEventListener('click', () => { renderBackpack(); showGameDialog(refs.backpackDialog); });
refs.openBonds.addEventListener('click', () => { renderBondDialog(); showGameDialog(refs.bondsDialog); });
refs.autoDeploy.addEventListener('click', autoDeploy);
refs.recallAll.addEventListener('click', recallAll);
refs.fortuneSign.addEventListener('click', openFortuneSign);
refs.openFusion.addEventListener('click', () => { if (state.backpack.length < 2) { addLog('背包中至少需要两只妖灵才能合成。'); return; } refs.backpackDialog.close(); openFusion(); });
refs.fuseBeasts.addEventListener('click', fuseSelected);
refs.summonClose.addEventListener('click', () => closeGameDialog(refs.summonDialog));
refs.advancedClose.addEventListener('click', () => closeGameDialog(refs.advancedDialog));
refs.backpackClose.addEventListener('click', () => closeGameDialog(refs.backpackDialog));
refs.fusionClose.addEventListener('click', () => closeGameDialog(refs.fusionDialog));
refs.fortuneClose.addEventListener('click', () => { if (refs.fortuneDialog.open) refs.fortuneDialog.close(); });
refs.bondsClose.addEventListener('click', () => closeGameDialog(refs.bondsDialog));
[
  refs.summonDialog, refs.advancedDialog, refs.backpackDialog, refs.fusionDialog, refs.bondsDialog,
].forEach((dialog) => dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeGameDialog(dialog); }));
refs.fortuneDialog.addEventListener('cancel', (event) => { event.preventDefault(); refs.fortuneDialog.close(); });
refs.pauseDialog.addEventListener('cancel', (event) => { event.preventDefault(); resumePauseMenu(); });
refs.codexOpen.addEventListener('click', () => { renderCodex(); refs.codexDialog.showModal(); });
refs.codexClose.addEventListener('click', () => refs.codexDialog.close());
refs.codexDialog.addEventListener('click', (event) => { if (event.target === refs.codexDialog) refs.codexDialog.close(); });
refs.backToSelect.addEventListener('click', () => { showScreen('select'); renderSelect(); });
refs.returnSelect.addEventListener('click', () => { showScreen('select'); renderSelect(); });
refs.replayGame.addEventListener('click', initGame);
refs.pauseGame.addEventListener('click', openPauseMenu);
refs.pauseResume.addEventListener('click', resumePauseMenu);
refs.pauseRetry.addEventListener('click', () => { refs.pauseDialog.close(); initGame(); });
refs.pauseExit.addEventListener('click', () => { refs.pauseDialog.close(); state.paused = false; showScreen('select'); renderSelect(); });
refs.speedGame.addEventListener('click', () => { state.speed = state.speed === 1 ? 3 : 1; updateHUD(); });
refs.soundToggle.addEventListener('click', () => { state.soundEnabled = !state.soundEnabled; refs.soundToggle.textContent = state.soundEnabled ? '♪' : '×'; if (state.soundEnabled) playSound('deploy'); });
refs.teamSkill.addEventListener('click', useSkill);
document.querySelector('#reset-save').addEventListener('click', () => { localStorage.removeItem(SAVE_KEY); loadSave(); renderSelect(); document.querySelector('#save-status').textContent = '存档已重置'; });
document.querySelector('[data-start-tutorial]').addEventListener('click', () => { state.stage = 0; initGame(); });

function fitAppToViewport() {
  const shell = document.querySelector('#app-shell');
  const portrait = window.innerHeight > window.innerWidth;
  const scale = portrait ? Math.min(window.innerWidth / 720, window.innerHeight / 1280) : Math.min(window.innerWidth / 1280, window.innerHeight / 720);
  shell.style.transform = portrait
    ? `translate(-50%, -50%) rotate(90deg) scale(${scale})`
    : `translate(-50%, -50%) scale(${scale})`;
  document.documentElement.style.setProperty('--ui-scale', scale);
}

window.addEventListener('resize', fitAppToViewport);
fitAppToViewport();

loadSave(); renderSelect(); showScreen('select'); requestAnimationFrame(tick);

window.__shanHaiDebug = { state, ROSTER, BEASTS, BOND_DEFS, LEVELS, WAVES, canPlaceAt, formationScore, pathInfo };
