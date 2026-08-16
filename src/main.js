const Core = window.ShanHaiCore;
if (!Core) throw new Error('ShanHaiCore shared rules failed to load');
const RARITIES = Core.RARITIES;
const SAVE_KEY = 'shan-hai-rebuild-v2';
const LEGACY_SAVE_KEY = 'shan-hai-rebuild-v1';
const PROGRESSION_VERSION = 3;
const SCORING_VERSION = 2;
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
const SUMMON_WEIGHTS = Core.SUMMON_RULES.normal.weights;
const ADVANCED_SUMMON_WEIGHTS = Core.SUMMON_RULES.advanced.weights;
const POPULATION_BY_RARITY = [1, 1, 2, 2, 3];
const RARITY_POWER = [1, 1.03, 1.08, 1.16, 1.3];
const DIFFICULTY_ORDER = ['easy', 'normal', 'hard'];
const DIFFICULTIES = {
  easy: { name: '简单', hp: .82, armor: -3, speed: .92, count: .9, gap: 1.08, startEssence: 1.16, towerPower: 1.08, score: .9, grades: { s: 10500, a: 7500, b: 4500 }, normalWeights: SUMMON_WEIGHTS, advancedWeights: ADVANCED_SUMMON_WEIGHTS },
  normal: { name: '中等', hp: 1.08, armor: 4, speed: 1.05, count: 1.08, gap: .92, startEssence: 1, towerPower: 1, score: 1.15, grades: { s: 13500, a: 9500, b: 5500 }, normalWeights: SUMMON_WEIGHTS, advancedWeights: ADVANCED_SUMMON_WEIGHTS },
  hard: { name: '困难', hp: 1.48, armor: 10, speed: 1.18, count: 1.28, gap: .8, startEssence: .92, towerPower: .96, score: 1.6, grades: { s: 18000, a: 12500, b: 7500 }, normalWeights: SUMMON_WEIGHTS, advancedWeights: ADVANCED_SUMMON_WEIGHTS },
};
const BASE_UNLOCK_IDS = [...STARTER_IDS, 'shengsheng', 'kaiming', 'bo', 'zheng', 'qiuniu', 'yazi', 'chaofeng', 'dayu', 'qinglong'];
const STAGE_UNLOCKS = [
  ['pulao', 'suanni'],
  ['bixi', 'bian'],
  ['fuxi_long', 'chiwen'],
  ['gonggong'],
  ['baihu', 'zhuque', 'xuanwu'],
];
const BEAST_MAX_LEVEL = 20;
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

const ACTIVE_SKILLS = {
  bifang: { name: '赤羽焚原', type: 'area', mana: 34, cooldown: 15, mult: 2.2, radius: 105, burn: true },
  fuzhu: { name: '霜泽漫行', type: 'slow', mana: 30, cooldown: 14, radius: 155, slow: .52, duration: 4 },
  jiuwei: { name: '九影分袭', type: 'multishot', mana: 36, cooldown: 16, count: 4, mult: 1.15 },
  tiangou: { name: '锁魂天啸', type: 'targetStun', mana: 30, cooldown: 15, stun: 3.2, mult: 1.4, rangeMul: 1.6 },
  xuangui: { name: '地脉玄震', type: 'areaStun', mana: 38, cooldown: 18, radius: 118, stun: 1.8, mult: 1.25 },
  shengsheng: { name: '山影追猎', type: 'split', mana: 34, cooldown: 16, shots: 7, count: 2, mult: .7 },
  kaiming: { name: '九门炎域', type: 'area', mana: 38, cooldown: 17, mult: 2.4, radius: 112, burn: true },
  bo: { name: '贯甲独角', type: 'armorBreak', mana: 34, cooldown: 15, radius: 145, armorBreak: 14, duration: 6, mult: 1.2 },
  zheng: { name: '疾影连斩', type: 'multishot', mana: 36, cooldown: 15, count: 5, mult: .9 },
  qiuniu: { name: '镇魂龙曲', type: 'areaStun', mana: 42, cooldown: 19, radius: 135, stun: 2.1, mult: 1.35 },
  yazi: { name: '血刃裂军', type: 'split', mana: 40, cooldown: 17, shots: 8, count: 2, mult: .82 },
  chaofeng: { name: '御风缚地', type: 'slow', mana: 36, cooldown: 16, radius: 175, slow: .58, duration: 4.5 },
  pulao: { name: '蒲牢洪钟', type: 'areaStun', mana: 44, cooldown: 20, radius: 145, stun: 2.4, mult: 1.5 },
  suanni: { name: '香火燎天', type: 'area', mana: 42, cooldown: 18, mult: 2.7, radius: 125, burn: true },
  bixi: { name: '负岳镇渊', type: 'armorBreak', mana: 42, cooldown: 19, radius: 155, armorBreak: 18, duration: 7, mult: 1.5 },
  bian: { name: '天牢裁决', type: 'targetStun', mana: 38, cooldown: 17, stun: 4, mult: 1.8, rangeMul: 1.65 },
  fuxi_long: { name: '龙吟裂波', type: 'multishot', mana: 44, cooldown: 18, count: 6, mult: 1.05 },
  chiwen: { name: '吞潮回澜', type: 'slow', mana: 40, cooldown: 17, radius: 190, slow: .62, duration: 5 },
  dayu: { name: '九州洪流', type: 'area', mana: 50, cooldown: 21, mult: 3.4, radius: 155, slow: .45, duration: 4 },
  gonggong: { name: '怒触不周', type: 'areaStun', mana: 52, cooldown: 22, radius: 175, stun: 2.8, mult: 2.4, armorBreak: 10, duration: 6 },
  qinglong: { name: '苍龙万雷', type: 'multishot', mana: 58, cooldown: 24, count: 8, mult: 1.35 },
  baihu: { name: '庚金断岳', type: 'armorBreak', mana: 56, cooldown: 23, radius: 185, armorBreak: 24, duration: 8, mult: 2.8 },
  zhuque: { name: '涅槃天火', type: 'area', mana: 60, cooldown: 25, mult: 4.2, radius: 175, burn: true },
  xuanwu: { name: '玄冥封界', type: 'areaStun', mana: 58, cooldown: 24, radius: 190, stun: 3.4, mult: 2.2, slow: .65, duration: 5 },
  huangdi: { name: '轩辕敕令', type: 'multishot', mana: 60, cooldown: 24, count: 9, mult: 1.45 },
  fuxi: { name: '八卦定域', type: 'targetStun', mana: 54, cooldown: 21, stun: 6, mult: 3, rangeMul: 1.8 },
  nuwa: { name: '补天息壤', type: 'area', mana: 58, cooldown: 23, mult: 3.5, radius: 180, slow: .5, duration: 5 },
};

const SUPPORT_SKILLS = {
  bifang: ['赤羽鼓舞', 'power', .08, 165], fuzhu: ['泽气延展', 'range', .1, 180], jiuwei: ['狐火回灵', 'manaRegen', .22, 175], tiangou: ['逐月迅击', 'haste', .1, 160], xuangui: ['玄甲蕴灵', 'manaRegen', .28, 175],
  shengsheng: ['群山战意', 'power', .09, 165], kaiming: ['九门威仪', 'power', .1, 175], bo: ['踏阵急袭', 'haste', .1, 165], zheng: ['疾风同猎', 'haste', .12, 170],
  qiuniu: ['余音回法', 'cdr', .12, 185], yazi: ['凶威共振', 'power', .12, 170], chaofeng: ['高台望远', 'range', .13, 195], pulao: ['钟鸣醒神', 'cdr', .14, 185], suanni: ['香云聚灵', 'manaRegen', .32, 180], bixi: ['负岳静息', 'manaRegen', .3, 175], bian: ['明察先机', 'cdr', .13, 185], fuxi_long: ['龙文远射', 'range', .14, 195], chiwen: ['潮汐续灵', 'manaRegen', .34, 190],
  dayu: ['九州调度', 'cdr', .18, 205], gonggong: ['怒潮回灵', 'manaRegen', .42, 205], qinglong: ['青霄迅捷', 'haste', .16, 215], baihu: ['白帝战意', 'power', .16, 195], zhuque: ['南明炽心', 'power', .15, 210], xuanwu: ['玄冥灵泉', 'manaRegen', .48, 215], huangdi: ['人皇号令', 'power', .14, 215], fuxi: ['河图拓界', 'range', .18, 225], nuwa: ['造化轮转', 'cdr', .2, 220],
};

const BOND_DEFS = [
  { id: 'wild', name: '山野同气', members: ['bifang', 'fuzhu', 'jiuwei', 'tiangou', 'xuangui'], need: 3, stat: 'power', bonus: .14, stepBonus: .07, color: '#d98a67', ult: '焚野', skill: 'fire', cooldown: 22, ultMul: 2.2 },
  { id: 'fierce', name: '山海猛兽', members: ['zheng', 'kaiming', 'bo', 'shengsheng'], need: 2, stat: 'haste', bonus: .12, stepBonus: .06, color: '#e1ac65', ult: '猎潮', skill: 'roar', cooldown: 20, ultMul: 2 },
  { id: 'dragon_sky', name: '龙子·凌霄', members: ['qiuniu', 'yazi', 'chaofeng'], need: 3, stat: 'haste', bonus: .16, stepBonus: 0, color: '#a984c5', ult: '凌霄龙吟', skill: 'storm', cooldown: 24, ultMul: 2.5 },
  { id: 'dragon_earth', name: '龙子·镇岳', members: ['pulao', 'suanni', 'bixi'], need: 3, stat: 'sunder', bonus: .2, stepBonus: 0, color: '#cb9860', ult: '镇岳雷火', skill: 'roar', cooldown: 25, ultMul: 2.8 },
  { id: 'dragon_tide', name: '龙子·碑潮', members: ['bian', 'fuxi_long', 'chiwen'], need: 3, stat: 'range', bonus: .14, stepBonus: 0, color: '#708fb2', ult: '碑潮裁决', skill: 'tide', cooldown: 24, ultMul: 2.6 },
  { id: 'sishou', name: '四象归位', members: ['qinglong', 'baihu', 'zhuque', 'xuanwu'], need: 2, stat: 'range', bonus: .1, stepBonus: .06, color: '#65b7af', ult: '四象天门', skill: 'storm', cooldown: 28, ultMul: 3.4 },
  { id: 'renzu', name: '人祖开天', members: ['huangdi', 'fuxi', 'nuwa'], need: 2, stat: 'cdr', bonus: .16, stepBonus: .1, color: '#d4a355', ult: '开天轮转', skill: 'restore', cooldown: 26, ultMul: 3 },
  { id: 'zhishui', name: '治水之争', members: ['dayu', 'gonggong'], need: 2, stat: 'sunder', bonus: .16, stepBonus: 0, color: '#66a9c3', ult: '怒海分流', skill: 'tide', cooldown: 24, ultMul: 2.8 },
  { id: 'yanhuo', name: '炎火同源', members: ['bifang', 'suanni', 'zhuque', 'nuwa'], need: 2, stat: 'power', bonus: .1, stepBonus: .08, color: '#e66f55', ult: '炎脉共燃', skill: 'fire', cooldown: 22, ultMul: 2.3 },
  { id: 'shuize', name: '水泽同流', members: ['fuzhu', 'chiwen', 'xuanwu', 'gonggong'], need: 2, stat: 'enemySlow', bonus: .09, stepBonus: .06, color: '#5fa8b2', ult: '水泽天幕', skill: 'tide', cooldown: 21, ultMul: 2.1 },
  { id: 'night_fire', name: '火羽照夜', members: ['bifang', 'jiuwei', 'tiangou'], need: 3, stat: 'haste', bonus: .09, stepBonus: 0, color: '#c9634f', ult: '夜火流星', skill: 'fire', cooldown: 21, ultMul: 2.1 },
  { id: 'frost_shell', name: '霜甲回澜', members: ['fuzhu', 'xuangui', 'zheng'], need: 3, stat: 'enemySlow', bonus: .08, stepBonus: 0, color: '#6f9ca5', ult: '霜甲封川', skill: 'tide', cooldown: 22, ultMul: 2.2 },
  { id: 'beast_hunt', name: '猛兽合围', members: ['shengsheng', 'kaiming', 'bo', 'zheng'], need: 4, stat: 'range', bonus: .12, stepBonus: 0, color: '#a4774f', ult: '万兽围猎', skill: 'roar', cooldown: 23, ultMul: 2.4 },
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
  { name: '幽都洞窟', intro: '三层折返贯穿洞窟，交叉火力比单点堆叠更重要。', hpMul: 1, spdMul: 1, essence: 56, tint: '#647f78', accent: '#75c9c0', path: 'cave', spawnCount: 1, seals: [[74, 112]], spawnPoints: [[884, 438]], boss: 'taotie' },
  { name: '北野草原', intro: '长弧穿越整片草原，射程与转火效率决定防线。', hpMul: 1.12, spdMul: 1.03, essence: 62, tint: '#7d9d81', accent: '#d8bc74', path: 'grass', spawnCount: 1, seals: [[74, 395]], spawnPoints: [[884, 420]], boss: 'baize' },
  { name: '沧海之上', intro: '潮汐折返，减速和连锁能把敌群拖在射程内。', hpMul: 1.25, spdMul: 1.06, essence: 70, tint: '#5b8e9c', accent: '#9ed6d0', path: 'sea', spawnCount: 1, seals: [[74, 152]], spawnPoints: [[884, 270]], boss: 'taotie' },
  { name: '赤焰火山', intro: '两道裂口同时喷涌，必须分守双线。', hpMul: 1.4, spdMul: 1.09, essence: 78, tint: '#b56454', accent: '#f2b35e', path: 'volcano', spawnCount: 2, seals: [[74, 104], [74, 436]], spawnPoints: [[884, 118], [884, 422]], boss: 'baize' },
  { name: '天庭云阶', intro: '上下云阶汇入同一封印，后段火力必须兼顾双线。', hpMul: 1.58, spdMul: 1.12, essence: 86, tint: '#8a82aa', accent: '#f0d39a', path: 'cloud', spawnCount: 2, seals: [[74, 270]], spawnPoints: [[884, 100], [884, 440]], boss: 'taotie' },
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

const refs = Object.fromEntries(['selectScreen', 'gameScreen', 'resultScreen', 'stageList', 'difficultySelect', 'rosterList', 'bondPreviewList', 'selectedStageLabel', 'codexCount', 'cultivationSummary', 'startGame', 'endlessStart', 'medalsOpen', 'medalCount', 'backToSelect', 'pauseGame', 'speedGame', 'soundToggle', 'gameTerrain', 'gameDifficulty', 'gameLevel', 'requiredBeastLabel', 'hpLabel', 'hpMeter', 'waveLabel', 'waveTrack', 'combatLog', 'arenaHint', 'essenceLabel', 'killLabel', 'bestScoreLabel', 'populationLabel', 'backpackLabel', 'selectedUnitLabel', 'gameRoster', 'gameBonds', 'summonBeast', 'summonBeastFive', 'advancedSummon', 'advancedSummonFive', 'openBackpack', 'openBonds', 'autoDeploy', 'recallAll', 'fortuneSign', 'spiritSkill', 'spiritSkillLabel', 'teamSkill', 'skillLabel', 'replayGame', 'returnSelect', 'resultTitle', 'resultStage', 'resultScoreStamp', 'resultScoreTotal', 'resultBonds', 'resultHp', 'resultEnergy', 'resultUr', 'resultRequired', 'resultKills', 'resultXp', 'resultCombo', 'resultCopy', 'codexOpen', 'codexClose', 'codexDialog', 'codexDialogList', 'summonDialog', 'summonOffers', 'summonTitle', 'summonSubtitle', 'summonSwap', 'summonSwapNote', 'summonClose', 'advancedDialog', 'advancedResults', 'advancedTitle', 'advancedSubtitle', 'advancedClaim', 'advancedClose', 'backpackDialog', 'backpackList', 'backpackClose', 'openFusion', 'fusionDialog', 'fusionList', 'fusionSelection', 'fuseBeasts', 'fusionClose', 'fortuneDialog', 'fortuneResult', 'fortuneClose', 'bondsDialog', 'bondDialogList', 'bondsClose', 'evolutionDialog', 'evolutionChoices', 'medalsDialog', 'medalsList', 'medalsClose', 'pauseDialog', 'pauseResume', 'pauseRetry', 'pauseExit'].map((key) => [key, document.querySelector(`#${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`)]));

const state = {
  screen: 'select', mode: 'standard', stage: 0, difficulty: 'normal', selectedBeast: 'bifang', selectedUnitId: null, backpack: [], nextUnitId: 1, maxPopulation: 18, unlocked: new Set(BASE_UNLOCK_IDS), completions: new Set(), beastGrowth: {}, medals: new Set(), xp: 0, tier: 0, soundEnabled: true,
  paused: false, resumeAfterDialog: false, draggingUnitId: null, draggingTowerIndex: -1, selectedTowerUid: null, speed: 1, lastTime: 0, wave: 0, waveTimer: 0, spawning: null, waveCooldown: 0, phase: 'prep', prepTimer: 15, battleTime: 0,
  energy: 0, maxHp: 10, hp: 10, kills: 0, score: 0, bestScores: {}, combo: 0, bestCombo: 0, waveStarted: false,
  towers: [], enemies: [], projectiles: [], particles: [], hitBursts: [], damageTexts: [], logs: [], mouse: { x: 480, y: 270, inside: false },
  skillCooldowns: {}, skillBond: null, pendingTargetSkillUid: null, finishTimer: 0, tutorialStep: -1, fusionSelection: [], signEffects: [], summonOffers: [], summonMode: 'normal', summonSwapCount: 0, summonAttempts: 0, requiredOffered: false, advancedBatch: [], advancedMode: 'normal', requiredBeastId: null, fortuneSpinning: false, finalScoreBreakdown: null, lastSign: null, runFielded: new Set(), runBeastKills: {}, runEvolutions: {}, runSeed: 1, waveStartedAt: 0,
};

const arena = { left: 38, right: 922, top: 46, bot: 510, roadW: 66, sealX: 74, sealY: 108, spawnR: 30, wardR: 34, plate: 24 };
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const currentLevel = () => LEVELS[state.stage];
const currentDifficulty = () => DIFFICULTIES[state.difficulty];
const isEndless = () => state.mode === 'endless';
const totalWaves = () => isEndless() ? Math.max(15, state.wave + 5) : WAVES.length;
const isBossWave = (waveIndex) => [4, 9, 14].includes(waveIndex % WAVES.length);
const waveTemplate = (waveIndex) => WAVES[waveIndex % WAVES.length];
const waveMeta = (waveIndex) => WAVE_META[waveIndex % WAVE_META.length];
const levelSeals = (level = currentLevel()) => level.seals || [[arena.sealX, arena.sealY]];
const levelSpawns = (level = currentLevel()) => level.spawnPoints || [[884, 270]];
const beastDef = (id) => ({ ...ROSTER.find((item) => item.id === id), ...BEASTS[id] });
const populationCostFor = (unitOrId) => POPULATION_BY_RARITY[beastDef(typeof unitOrId === 'string' ? unitOrId : unitOrId.id).rarity];
const usedPopulation = () => state.towers.reduce((sum, tower) => sum + populationCostFor(tower), 0);
const allOwnedUnits = () => state.towers.concat(state.backpack);
const cultivation = () => CULTIVATION_STAGES[state.tier] || CULTIVATION_STAGES[0];
const cultivationTierFor = (kills) => CULTIVATION_STAGES.reduce((tier, stage, index) => (kills >= stage.kills ? index : tier), 0);
const hasCombatSprite = (id) => Boolean(combatSpriteSources[id]);
const completionKey = (stage, difficulty) => `${stage}:${difficulty}`;
const clearedStage = (stage) => DIFFICULTY_ORDER.some((difficulty) => state.completions.has(completionKey(stage, difficulty)));
const clearedAllStages = (difficulty = null) => LEVELS.every((_, stage) => difficulty ? state.completions.has(completionKey(stage, difficulty)) : clearedStage(stage));
const threeSpeedUnlocked = () => clearedAllStages();
const isSteam = () => window.steamShell?.platform === 'steam';
const endlessUnlocked = () => [...state.completions].length > 0;

function evolutionBonusesFor(id) {
  return (state.runEvolutions[id] || []).reduce((totals, pathId) => {
    const path = Core.EVOLUTION_PATHS.find((item) => item.id === pathId);
    if (path) Object.entries(path.bonus).forEach(([key, value]) => { totals[key] = (totals[key] || 0) + value; });
    return totals;
  }, { power: 0, cdr: 0, manaCost: 0, range: 0, support: 0 });
}

function effectiveSkillStats(tower, skill = activeSkillFor(tower.id)) {
  const evolution = evolutionBonusesFor(tower.id);
  return {
    mana: Math.max(1, Math.round(skill.mana * (1 - evolution.manaCost))),
    cooldown: Math.max(1, skill.cooldown * (1 - evolution.cdr)),
  };
}

function supportSkillForSource(source) {
  const support = supportSkillFor(source.id);
  const evolution = evolutionBonusesFor(source.id);
  return { ...support, value: support.value * (1 + evolution.support), radius: support.radius * (1 + evolution.support) };
}

function orderedBackpackUnits() {
  const units = [...state.backpack];
  const ownedIds = new Set(allOwnedUnits().map((unit) => unit.id));
  const groups = BOND_DEFS.map((bond, index) => {
    const ownedCount = bond.members.filter((id) => ownedIds.has(id)).length;
    const backpackCount = bond.members.filter((id) => units.some((unit) => unit.id === id)).length;
    return { bond, index, ownedCount, backpackCount, formed: ownedCount >= bond.need };
  }).filter((group) => group.backpackCount >= 2).sort((a, b) =>
    Number(b.formed) - Number(a.formed)
    || b.ownedCount / b.bond.need - a.ownedCount / a.bond.need
    || b.backpackCount - a.backpackCount
    || a.index - b.index);

  const ordered = [];
  const used = new Set();
  groups.forEach(({ bond }) => bond.members.forEach((id) => {
    units.filter((unit) => unit.id === id && !used.has(unit.uid)).forEach((unit) => { used.add(unit.uid); ordered.push(unit); });
  }));
  const remaining = units.filter((unit) => !used.has(unit.uid)).sort((a, b) =>
    beastDef(b.id).rarity - beastDef(a.id).rarity
    || beastDef(a.id).name.localeCompare(beastDef(b.id).name, 'zh-CN'));
  return ordered.concat(remaining);
}

function growthFor(id) {
  const saved = state.beastGrowth[id] || {};
  const growth = {
    xp: Math.max(0, Number(saved.xp) || 0),
    appearances: Math.max(0, Number(saved.appearances) || 0),
    kills: Math.max(0, Number(saved.kills) || 0),
  };
  const level = Math.min(BEAST_MAX_LEVEL, 1 + Math.floor(Math.sqrt(Math.max(0, growth.xp) / 25)));
  const currentFloor = 25 * (level - 1) ** 2;
  const nextFloor = level >= BEAST_MAX_LEVEL ? currentFloor : 25 * level ** 2;
  return { ...growth, level, currentFloor, nextFloor, attack: 1 + (level - 1) * .025, haste: 1 + (level - 1) * .012, range: 1 + (level - 1) * .01 };
}

function applyProgressUnlocks() {
  STAGE_UNLOCKS.forEach((ids, stage) => { if (clearedStage(stage)) ids.forEach((id) => state.unlocked.add(id)); });
  if (clearedAllStages()) state.unlocked.add('huangdi');
  if (clearedAllStages('normal')) state.unlocked.add('fuxi');
  if (clearedAllStages('hard')) state.unlocked.add('nuwa');
}

function unlockHint(id) {
  const stage = STAGE_UNLOCKS.findIndex((ids) => ids.includes(id));
  if (stage >= 0) return `通关第 ${stage + 1} 关后解锁`;
  if (id === 'huangdi') return '任意难度通关全部关卡';
  if (id === 'fuxi') return '中等难度通关全部关卡';
  if (id === 'nuwa') return '困难难度通关全部关卡';
  return '尚未解锁';
}
let audioContext = null;
let audioMaster = null;
let audioNoiseBuffer = null;
const soundTimestamps = {};

function ensureAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return false;
  if (!audioContext) {
    audioContext = new AudioContext();
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -20; compressor.knee.value = 16; compressor.ratio.value = 7; compressor.attack.value = .004; compressor.release.value = .22;
    audioMaster = audioContext.createGain(); audioMaster.gain.value = .42;
    audioMaster.connect(compressor).connect(audioContext.destination);
    audioNoiseBuffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * .5), audioContext.sampleRate);
    const noise = audioNoiseBuffer.getChannelData(0);
    for (let i = 0; i < noise.length; i += 1) noise[i] = Math.random() * 2 - 1;
  }
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  return true;
}

function soundTone(at, from, to, duration, gainValue = .08, type = 'sine', pan = 0) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const panner = audioContext.createStereoPanner?.();
  oscillator.type = type; oscillator.frequency.setValueAtTime(Math.max(20, from), at); oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, to), at + duration);
  gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(gainValue, at + Math.min(.018, duration * .25)); gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
  if (panner) { panner.pan.value = pan; oscillator.connect(gain).connect(panner).connect(audioMaster); } else oscillator.connect(gain).connect(audioMaster);
  oscillator.start(at); oscillator.stop(at + duration + .03);
}

function soundNoise(at, duration, gainValue, frequency = 900) {
  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  source.buffer = audioNoiseBuffer; filter.type = 'lowpass'; filter.frequency.setValueAtTime(frequency, at); filter.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * .25), at + duration);
  gain.gain.setValueAtTime(gainValue, at); gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
  source.connect(filter).connect(gain).connect(audioMaster); source.start(at); source.stop(at + duration);
}

function playSound(kind) {
  if (!state.soundEnabled || !ensureAudio()) return;
  const now = performance.now();
  const cooldown = { kill: 75, deploy: 50, wave: 400, warning: 800 }[kind] || 0;
  if (now - (soundTimestamps[kind] || 0) < cooldown) return;
  soundTimestamps[kind] = now;
  const at = audioContext.currentTime + .006;
  if (kind === 'summon') {
    soundNoise(at, .28, .045, 1800); [330, 440, 660].forEach((note, index) => soundTone(at + index * .065, note, note * 1.035, .24, .055, 'sine', index * .35 - .35));
  } else if (kind === 'deploy') {
    soundTone(at, 190, 120, .11, .09, 'triangle'); soundNoise(at, .08, .028, 620);
  } else if (kind === 'wave') {
    soundTone(at, 92, 72, .2, .11, 'sine'); soundTone(at + .1, 138, 110, .18, .075, 'triangle');
  } else if (kind === 'warning') {
    soundTone(at, 110, 82, .34, .12, 'sawtooth'); soundTone(at + .24, 110, 72, .42, .11, 'sawtooth'); soundNoise(at, .18, .035, 420);
  } else if (kind === 'skill') {
    soundTone(at, 120, 64, .42, .12, 'sine'); soundNoise(at + .02, .32, .05, 2200); [420, 630, 945].forEach((note, index) => soundTone(at + .05 + index * .045, note, note * 1.45, .3, .05, 'triangle', index - 1));
  } else if (kind === 'breach') {
    soundTone(at, 135, 42, .36, .16, 'sawtooth'); soundNoise(at, .3, .09, 700);
  } else if (kind === 'kill') {
    soundTone(at, 240, 150, .07, .035, 'square', (Math.random() - .5) * .8);
  } else if (kind === 'bossDown') {
    soundNoise(at, .46, .1, 1000); [196, 147, 98].forEach((note, index) => soundTone(at + index * .09, note, note * .72, .3, .11, 'sawtooth'));
  } else if (kind === 'fortune') {
    [294, 440, 587].forEach((note, index) => soundTone(at + index * .08, note, note * 1.04, .24, .06, 'sine', index * .35 - .35));
  } else if (kind === 'victory') {
    [262, 330, 392, 523, 659].forEach((note, index) => soundTone(at + index * .1, note, note * 1.015, .5, .075, index < 3 ? 'triangle' : 'sine', index % 2 ? .35 : -.35));
  }
}

function playAttackSound(projectileType, x) {
  if (!state.soundEnabled || !ensureAudio()) return;
  const now = performance.now();
  if (now - (soundTimestamps.attack || 0) < 85) return;
  soundTimestamps.attack = now;
  const at = audioContext.currentTime + .004;
  const pan = clamp((x - 480) / 440, -1, 1);
  if (projectileType === 'ember') {
    soundNoise(at, .055, .012, 1800); soundTone(at, 460, 300, .075, .018, 'triangle', pan);
  } else if (projectileType === 'splash') {
    soundTone(at, 165, 92, .11, .025, 'sine', pan); soundNoise(at, .08, .012, 520);
  } else if (projectileType === 'wisp') {
    soundTone(at, 620, 840, .12, .018, 'sine', pan);
  } else if (projectileType === 'claw') {
    soundNoise(at, .05, .014, 2400); soundTone(at, 340, 210, .065, .016, 'square', pan);
  } else {
    soundTone(at, 105, 68, .1, .026, 'triangle', pan);
  }
}

function portraitMarkup(beast) {
  const portraitX = beast.portraitIndex % 6;
  const portraitY = Math.floor(beast.portraitIndex / 6);
  const spriteStyle = hasCombatSprite(beast.id) ? `--spirit-sprite:url('./assets/sprites/${beast.id}-3d.png')` : '';
  return `<span class="portrait portrait-image ${hasCombatSprite(beast.id) ? 'portrait-spirit' : ''}" style="--portrait-x:${portraitX};--portrait-y:${portraitY};${spriteStyle}"></span>`;
}

function pathInfo(level = currentLevel()) {
  if (level.path === 'cave') return [{ sx: 884, sy: 438, points: [[884, 438], [720, 438], [650, 360], [800, 270], [660, 185], [770, 100], [530, 100], [470, 205], [300, 205], [240, 350], [130, 280], [74, 112]] }];
  if (level.path === 'grass') return [{ sx: 884, sy: 420, points: [[884, 420], [690, 420], [600, 330], [760, 240], [700, 105], [480, 105], [420, 250], [250, 250], [180, 395], [74, 395]] }];
  if (level.path === 'sea') return [{ sx: 884, sy: 270, points: [[884, 270], [760, 440], [600, 420], [520, 300], [680, 180], [530, 80], [360, 120], [300, 300], [140, 400], [74, 152]] }];
  if (level.path === 'volcano') return [{ sx: 884, sy: 118, points: [[884, 118], [760, 118], [680, 225], [520, 105], [390, 230], [250, 104], [74, 104]] }, { sx: 884, sy: 422, points: [[884, 422], [760, 422], [680, 315], [520, 435], [390, 310], [250, 436], [74, 436]] }];
  return [{ sx: 884, sy: 100, points: [[884, 100], [730, 100], [620, 210], [480, 145], [360, 270], [220, 270], [74, 270]] }, { sx: 884, sy: 440, points: [[884, 440], [730, 440], [620, 330], [480, 395], [360, 270], [220, 270], [74, 270]] }];
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
    const desktopSave = window.steamShell?.loadSave?.();
    const localSave = localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY) || '{}';
    let saved;
    try { saved = desktopSave ? JSON.parse(desktopSave) : null; } catch { saved = null; }
    if (!saved || typeof saved !== 'object') saved = JSON.parse(localSave);
    state.xp = Number(saved.xp) || 0;
    state.bestScores = saved.scoringVersion === SCORING_VERSION && saved.bestScores && typeof saved.bestScores === 'object' && !Array.isArray(saved.bestScores) ? saved.bestScores : {};
    state.tier = cultivationTierFor(state.xp);
    state.difficulty = DIFFICULTIES[saved.difficulty] ? saved.difficulty : 'normal';
    state.completions = new Set(Array.isArray(saved.completions) ? saved.completions : []);
    state.medals = new Set(Array.isArray(saved.medals) ? saved.medals : []);
    state.beastGrowth = saved.beastGrowth && typeof saved.beastGrowth === 'object' ? saved.beastGrowth : {};
    state.soundEnabled = saved.soundEnabled !== false;
    const migratedUnlocks = saved.progressionVersion === PROGRESSION_VERSION && Array.isArray(saved.unlocked) ? saved.unlocked : BASE_UNLOCK_IDS;
    state.unlocked = new Set([...migratedUnlocks, ...BASE_UNLOCK_IDS]);
    applyProgressUnlocks();
  } catch {
    state.unlocked = new Set(BASE_UNLOCK_IDS);
    state.completions = new Set();
    state.medals = new Set();
    state.beastGrowth = {};
    state.bestScores = {};
  }
}

function saveProgress() {
  const payload = JSON.stringify({ progressionVersion: PROGRESSION_VERSION, scoringVersion: SCORING_VERSION, xp: state.xp, tier: state.tier, bestScores: state.bestScores, difficulty: state.difficulty, unlocked: [...state.unlocked], completions: [...state.completions], medals: [...state.medals], beastGrowth: state.beastGrowth, soundEnabled: state.soundEnabled });
  localStorage.setItem(SAVE_KEY, payload);
  window.steamShell?.writeSave?.(payload);
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
  refs.stageList.innerHTML = LEVELS.map((level, index) => {
    const seals = DIFFICULTY_ORDER.map((difficulty) => `<i class="${state.completions.has(completionKey(index, difficulty)) ? 'is-cleared' : ''}" title="${DIFFICULTIES[difficulty].name}">${DIFFICULTIES[difficulty].name.slice(0, 1)}</i>`).join('');
    return `<button class="stage-card ${index === state.stage ? 'is-selected' : ''}" data-stage="${index}" type="button"><span class="stage-number">0${index + 1}</span><span><strong>${level.name}</strong><small>${level.intro}</small></span><span class="stage-clears">${seals}</span></button>`;
  }).join('');
  refs.stageList.querySelectorAll('[data-stage]').forEach((button) => button.addEventListener('click', () => { state.stage = Number(button.dataset.stage); renderSelect(); }));
  refs.difficultySelect.querySelectorAll('[data-difficulty]').forEach((button) => button.classList.toggle('is-selected', button.dataset.difficulty === state.difficulty));
  refs.rosterList.innerHTML = ROSTER.map((beast) => {
    const data = beastDef(beast.id); const locked = !state.unlocked.has(beast.id); const growth = growthFor(beast.id);
    return `<button class="roster-card rarity-${RARITIES[beast.rarity]} ${locked ? 'is-locked' : ''}" data-beast="${beast.id}" type="button" ${locked ? 'disabled' : ''}>${portraitMarkup(beast)}<strong>${beast.name}</strong><small>${locked ? unlockHint(beast.id) : `${RARITIES[beast.rarity]} · 灵阶 ${growth.level}`}</small></button>`;
  }).join('');
  refs.rosterList.querySelectorAll('[data-beast]').forEach((button) => button.addEventListener('click', () => { state.selectedBeast = button.dataset.beast; renderSelect(); }));
  const chosen = beastDef(state.selectedBeast);
  refs.bondPreviewList.innerHTML = BOND_DEFS.map((bond) => `<div class="bond-row"><i class="bond-pill ${bond.members.includes(state.selectedBeast) ? 'active' : ''}" style="--bond:${bond.color}"></i><span>${bond.name}</span><strong>${bond.need}人 · ${bondEffectText(bond)}</strong></div>`).join('');
  refs.codexCount.textContent = `${state.unlocked.size} / ${ROSTER.length}`;
  refs.medalCount.textContent = `${state.medals.size} / ${Core.MEDALS.length}`;
  refs.cultivationSummary.textContent = `${cultivation().name} · ${state.unlocked.size}/${ROSTER.length} 妖灵 · ${threeSpeedUnlocked() ? '3倍速已解锁' : '通关五关解锁3倍速'}`;
  refs.selectedStageLabel.textContent = `${LEVELS[state.stage].name} · ${currentDifficulty().name} · 15 波 · ${Core.STAGE_MECHANICS[state.stage].name}`;
  refs.endlessStart.hidden = !isSteam();
  refs.endlessStart.disabled = !endlessUnlocked();
  refs.endlessStart.title = endlessUnlocked() ? '进入持续增强的无尽封印' : '先完成任意标准关卡解锁';
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

function randomBeastAtRarity(rarity, excludedIds = new Set()) {
  const available = ROSTER.filter((beast) => state.unlocked.has(beast.id) && !excludedIds.has(beast.id));
  let pool = available.filter((beast) => beast.rarity === rarity);
  if (!pool.length) {
    const availableRarities = [...new Set(available.map((beast) => beast.rarity))].sort((a, b) => Math.abs(a - rarity) - Math.abs(b - rarity));
    pool = available.filter((beast) => beast.rarity === availableRarities[0]);
  }
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

function summonOddsText(weights) {
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
  return weights.map(([rarity, weight]) => `${RARITIES[rarity]} ${Number((weight / total * 100).toFixed(1))}%`).join(' · ');
}

function bossWarningFor(waveIndex) {
  const cycleWave = waveIndex % WAVES.length;
  if (cycleWave === 4) return '首领预警：朱厌携带重甲与护盾，破盾攻击最有效；破封造成 5 点伤害';
  if (cycleWave === 9) return '首领预警：白泽死亡后会复活一次并获得护盾；破封造成 5 点伤害';
  if (cycleWave === 14) {
    const boss = ENEMIES[currentLevel().boss];
    const trait = boss.skill === 'heal' ? '会周期性快速回血并携带厚重护盾' : '死亡后会复活一次并重新获得护盾';
    return `终局预警：${boss.name}${trait}；清除小怪后降临，破封造成 9 点伤害`;
  }
  return '';
}

function randomSummon(weights = SUMMON_WEIGHTS) {
  return randomBeastAtRarity(randomFromWeights(weights));
}

function randomSummonChoices(weights, count) {
  const choices = [];
  const available = ROSTER.filter((beast) => state.unlocked.has(beast.id));
  const targetCount = Math.min(count, available.length);
  const usedIds = new Set();
  while (choices.length < targetCount) {
    const rarity = randomFromWeights(weights);
    const beast = randomBeastAtRarity(rarity, usedIds);
    if (!beast) break;
    choices.push(beast);
    usedIds.add(beast.id);
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

function activeSkillFor(id) { return ACTIVE_SKILLS[id]; }

function supportSkillFor(id) {
  const [name, stat, value, radius] = SUPPORT_SKILLS[id] || ['无', 'power', 0, 0];
  return { name, stat, value, radius };
}

function unitManaStats(beast) {
  return { maxMana: 72 + beast.rarity * 11, manaRegen: 2.7 + beast.rarity * .35 };
}

function createUnit(beast, level = cultivation().summonLevel) {
  const manaStats = unitManaStats(beast);
  return { uid: `spirit-${state.nextUnitId++}`, id: beast.id, level, cd: .15, skillCd: 0, mana: manaStats.maxMana, maxMana: manaStats.maxMana, manaRegen: manaStats.manaRegen, skillShots: 0, hitTarget: null, hitCount: 0, growthKills: 0 };
}

function selectedUnit() {
  return state.backpack.find((unit) => unit.uid === state.selectedUnitId) || null;
}

function selectUnit(uid) {
  state.selectedUnitId = state.backpack.some((unit) => unit.uid === uid) ? uid : null;
  if (state.selectedUnitId) { state.selectedTowerUid = null; state.pendingTargetSkillUid = null; }
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
  return `<button class="game-card rarity-${RARITIES[beast.rarity]} ${attributes}" data-unit-id="${unit.uid}" type="button">${portraitMarkup(beast)}<span><strong>${beast.name}</strong><small>${RARITIES[beast.rarity]} · Lv.${unit.level} · 人口 ${populationCostFor(unit)} · ${activeSkillFor(unit.id).name}</small></span><em>${RARITIES[beast.rarity]}</em></button>`;
}

function renderSummonOffers() {
  const advanced = state.summonMode === 'advanced';
  const rule = Core.SUMMON_RULES[state.summonMode];
  const weights = rule.weights;
  refs.summonTitle.textContent = `${advanced ? '高级三选一' : '普通二选一'} · 选中即入卷`;
  refs.summonSubtitle.textContent = `固定概率 ${summonOddsText(weights)}；候选不重复。天命妖灵属于当前召灵池时，前三次内必定出现。`;
  refs.summonOffers.classList.toggle('is-triple', advanced);
  refs.summonOffers.innerHTML = state.summonOffers.map((beast, index) => {
    const data = beastDef(beast.id);
    const opportunity = bondOpportunity(beast.id);
    const profile = Core.describeBeast(beast, data, activeSkillFor(beast.id), BOND_DEFS, new Set(allOwnedUnits().map((unit) => unit.id)));
    return `<button class="summon-offer rarity-${RARITIES[beast.rarity]}" data-offer-index="${index}" type="button">${portraitMarkup(beast)}<span><em>${RARITIES[beast.rarity]}</em><strong>${beast.name}</strong><small>人口 ${populationCostFor(beast.id)} · 主动「${activeSkillFor(beast.id).name}」</small><span class="summon-profile"><i>${profile.damageType}</i><i>${profile.output}伤害</i><i>${profile.control}</i><i>${profile.growth}</i><i>羁绊潜力${profile.bondGrade}</i></span><small class="summon-growth">${profile.growthText}</small>${opportunity ? `<small class="summon-bond-hint">可组成「${opportunity.name}」 · ${bondEffectText(opportunity)}</small>` : ''}</span><b>选择此卡</b></button>`;
  }).join('');
  const nextCost = rule.swaps[state.summonSwapCount];
  refs.summonSwap.disabled = nextCost == null || state.energy < nextCost;
  refs.summonSwap.textContent = nextCost == null ? '本次置换已用完' : `置换全部候选 ${nextCost}`;
  refs.summonSwapNote.textContent = `已置换 ${state.summonSwapCount}/2 次${state.summonOffers.some((beast) => beast.id === state.requiredBeastId) ? ' · 当前含天命妖灵' : ''}`;
  refs.summonOffers.querySelectorAll('[data-offer-index]').forEach((button) => button.addEventListener('click', () => claimSummonOffer(Number(button.dataset.offerIndex))));
}

function ensureRequiredOffer(choices) {
  const required = ROSTER.find((beast) => beast.id === state.requiredBeastId);
  if (!required || state.requiredOffered || allOwnedUnits().some((unit) => unit.id === required.id)) return choices;
  if (!Core.SUMMON_RULES[state.summonMode].weights.some(([rarity]) => rarity === required.rarity)) return choices;
  if (state.summonAttempts < 3) return choices;
  const guaranteed = [required, ...choices.filter((beast) => beast.id !== required.id)].slice(0, choices.length);
  state.requiredOffered = true;
  return guaranteed;
}

function swapSummonOffers() {
  if (!state.summonOffers.length || state.summonSwapCount >= 2) return;
  const rule = Core.SUMMON_RULES[state.summonMode];
  const cost = rule.swaps[state.summonSwapCount];
  if (state.energy < cost) { addLog(`置换需要 ${cost} 灵蕴。`); return; }
  state.energy -= cost;
  state.summonSwapCount += 1;
  state.summonOffers = ensureRequiredOffer(randomSummonChoices(rule.weights, rule.choices));
  if (state.summonOffers.some((beast) => beast.id === state.requiredBeastId)) state.requiredOffered = true;
  playSound('summon');
  renderSummonOffers();
  updateHUD();
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
    const rule = Core.SUMMON_RULES[mode];
    state.summonAttempts += 1;
    state.summonSwapCount = 0;
    state.summonOffers = ensureRequiredOffer(randomSummonChoices(rule.weights, rule.choices));
    if (state.summonOffers.some((beast) => beast.id === state.requiredBeastId)) state.requiredOffered = true;
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
  state.summonSwapCount = 0;
  closeGameDialog(refs.summonDialog);
  playSound('summon');
  if (state.tutorialStep === 0 && !result.promotions) { state.tutorialStep = 1; refs.arenaHint.textContent = '妖灵已入阵：点击下方妖灵卡，再点击道路两侧的空地布阵。'; }
  addLog(result.promotions ? `${beast.name}同种同阶合成，升至 Lv.${result.unit.level}。` : `${beast.name}已入阵，拖动卡牌到路边，或直接点击战场布阵。`);
  renderGameRoster();
  updateHUD();
}

function renderAdvancedResults() {
  const advanced = state.advancedMode === 'advanced';
  const rule = Core.SUMMON_RULES[state.advancedMode];
  const weights = rule.weights;
  refs.advancedTitle.textContent = `${advanced ? '高级' : '普通'}召灵 · 五连`;
  refs.advancedSubtitle.textContent = `固定概率 ${summonOddsText(weights)}；领取前可置换其中一张，整组最多两次。`;
  refs.advancedResults.innerHTML = state.advancedBatch.map((unit, index) => {
    const beast = beastDef(unit.id);
    const profile = Core.describeBeast(beast, beast, activeSkillFor(unit.id), BOND_DEFS, new Set(allOwnedUnits().map((item) => item.id)));
    const swapCost = rule.swaps[state.summonSwapCount];
    return `<div class="advanced-result-wrap">${unitCard(unit, 'is-result')}<small>${profile.damageType} · ${profile.output}伤害 · ${profile.control} · ${profile.growth}</small><button type="button" data-batch-swap="${index}" ${swapCost == null || state.energy < swapCost ? 'disabled' : ''}>${swapCost == null ? '置换已用完' : `置换 ${swapCost}`}</button></div>`;
  }).join('');
  refs.advancedResults.querySelectorAll('[data-batch-swap]').forEach((button) => button.addEventListener('click', () => swapAdvancedResult(Number(button.dataset.batchSwap))));
}

function swapAdvancedResult(index) {
  if (!state.advancedBatch[index] || state.summonSwapCount >= 2) return;
  const rule = Core.SUMMON_RULES[state.advancedMode];
  const cost = rule.swaps[state.summonSwapCount];
  if (state.energy < cost) return;
  state.energy -= cost;
  state.summonSwapCount += 1;
  const beast = randomSummon(rule.weights);
  if (beast) state.advancedBatch[index] = createUnit(beast);
  renderAdvancedResults();
  updateHUD();
}

function summonFive(mode) {
  if (state.screen !== 'game' || state.paused) return;
  if (state.advancedBatch.length) { renderAdvancedResults(); showGameDialog(refs.advancedDialog); return; }
  const cost = mode === 'advanced' ? ADVANCED_FIVE_COST : SUMMON_FIVE_COST;
  if (state.energy < cost) { addLog(`灵蕴不足，需要 ${cost} 点进行${mode === 'advanced' ? '高级' : '普通'}五连。`); return; }
  if (state.backpack.length + 5 > MAX_BACKPACK) { addLog('背包至少需要留出 5 个位置，才能进行五连召灵。'); return; }
  state.energy -= cost;
  state.advancedMode = mode;
  const weights = Core.SUMMON_RULES[mode].weights;
  state.summonSwapCount = 0;
  const required = ROSTER.find((beast) => beast.id === state.requiredBeastId);
  const requiredInPool = required && weights.some(([rarity]) => rarity === required.rarity);
  const batchBeasts = Array.from({ length: 5 }, () => {
    state.summonAttempts += 1;
    if (state.summonAttempts === 3 && requiredInPool && !state.requiredOffered && !allOwnedUnits().some((unit) => unit.id === required.id)) { state.requiredOffered = true; return required; }
    const drawn = randomSummon(weights);
    if (drawn?.id === state.requiredBeastId) state.requiredOffered = true;
    return drawn;
  });
  state.advancedBatch = batchBeasts.map((beast) => createUnit(beast));
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
  state.summonSwapCount = 0;
  renderGameRoster();
  updateHUD();
}

function initGame() {
  state.paused = false; state.speed = 1; state.wave = 0; state.waveTimer = 0; state.spawning = null; state.waveCooldown = 0; state.phase = 'prep'; state.prepTimer = 15; state.battleTime = 0;
  state.energy = Math.round(currentLevel().essence * currentDifficulty().startEssence); state.hp = state.maxHp; state.kills = 0; state.score = 0; state.combo = 0; state.bestCombo = 0;
  const eligibleRequired = ROSTER.filter((beast) => state.unlocked.has(beast.id));
  state.towers = []; state.backpack = []; state.selectedUnitId = null; state.nextUnitId = 1; state.enemies = []; state.projectiles = []; state.particles = []; state.hitBursts = []; state.damageTexts = []; state.logs = []; state.skillCooldowns = {}; state.skillBond = null; state.pendingTargetSkillUid = null; state.tutorialStep = state.stage === 0 && !isEndless() ? 0 : -1; state.fusionSelection = []; state.signEffects = []; state.summonOffers = []; state.summonMode = 'normal'; state.summonSwapCount = 0; state.summonAttempts = 0; state.requiredOffered = false; state.advancedBatch = []; state.advancedMode = 'normal'; state.requiredBeastId = eligibleRequired[Math.floor(Math.random() * eligibleRequired.length)].id; state.fortuneSpinning = false; state.finalScoreBreakdown = null; state.resumeAfterDialog = false; state.draggingUnitId = null; state.draggingTowerIndex = -1; state.selectedTowerUid = null; state.runFielded = new Set(); state.runBeastKills = {}; state.runEvolutions = {}; state.runSeed = (Date.now() ^ (state.stage + 1) * 2654435761) >>> 0; state.waveStartedAt = 0;
  if (state.soundEnabled) ensureAudio();
  const mechanic = Core.STAGE_MECHANICS[state.stage];
  showScreen('game'); refs.gameTerrain.textContent = currentLevel().name; refs.gameDifficulty.textContent = isEndless() ? '无尽' : currentDifficulty().name; refs.gameLevel.textContent = `波次 1 / 整备`; refs.requiredBeastLabel.textContent = beastDef(state.requiredBeastId).name; refs.arenaHint.textContent = `本局必选「${beastDef(state.requiredBeastId).name}」；${mechanic.name}：${mechanic.copy}`; addLog(`${isEndless() ? '无尽封印' : `${currentDifficulty().name}难度`} · ${mechanic.name}：${mechanic.copy}`); renderGameRoster(); renderGameBonds(); updateHUD();
}

function startStandardGame() { state.mode = 'standard'; initGame(); }
function startEndlessGame() {
  if (!isSteam() || !endlessUnlocked()) return;
  state.mode = 'endless';
  state.difficulty = 'normal';
  initGame();
}

function startWave() {
  if (!isEndless() && state.wave >= totalWaves()) return;
  const groups = waveTemplate(state.wave);
  const meta = waveMeta(state.wave);
  const difficulty = currentDifficulty();
  const endless = isEndless() ? Core.endlessScale(state.wave) : { hp: 1, speed: 1, armor: 0 };
  const routeCount = pathInfo().length;
  const routeOffset = routeCount > 1 ? Math.floor(Math.random() * routeCount) : 0;
  state.spawning = groups.map(([type, count, gap, delay, hpMul, role = 'normal'], index) => ({ type, count: Math.max(1, Math.round(count * difficulty.count)), gap: gap * difficulty.gap / endless.speed, delay, hpMul: hpMul * endless.hp, role, spawned: 0, timer: delay, route: (index + routeOffset) % routeCount }));
  state.spawning.bossAfterClear = (!isEndless() && state.wave === WAVES.length - 1) || (isEndless() && (state.wave + 1) % WAVES.length === 0) ? currentLevel().boss : null;
  state.spawning.bossSpawned = false;
  state.phase = 'combat'; state.waveStarted = true; state.waveTimer = 0; state.waveStartedAt = state.battleTime;
  playSound('wave');
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
      const routeCount = pathInfo().length;
      const bossRoute = routeCount > 1 ? Math.floor(Math.random() * routeCount) : 0;
      const bossScale = isEndless() ? Core.endlessScale(state.wave).hp : 1;
      const boss = spawnEnemy(state.spawning.bossAfterClear, (.92 + state.stage * .04) * bossScale, bossRoute, 0, 'stageBoss');
      const routeLabel = routeCount > 1 ? `${bossRoute === 0 ? '上' : '下'}路` : '主路';
      state.spawning.bossSpawned = true;
      playSound('warning');
      refs.arenaHint.textContent = `第 ${state.wave + 1} 波 · 关卡首领「${boss.def.name}」从${routeLabel}降临`;
      addLog(`终阵小怪已清除，关卡首领「${boss.def.name}」从${routeLabel}现身。若其破封，将造成 9 点伤害。`);
      return;
    }
    const completedWave = state.wave;
    const completedMeta = waveMeta(completedWave);
    state.energy += completedMeta.bonus;
    state.spawning = null; state.wave += 1;
    if (!isEndless() && state.wave >= WAVES.length) { finishGame(true); return; }
    const bossWarning = bossWarningFor(state.wave);
    state.phase = 'rest'; state.waveCooldown = isBossWave(state.wave) ? 12 : 7;
    refs.arenaHint.textContent = bossWarning || `第 ${state.wave + 1} 波将在 7 秒后开始`;
    if (bossWarning) playSound('warning');
    addLog(`${bossWarning || '下一波将在 7 秒后开始'}${completedMeta.bonus ? `，奖励 ${completedMeta.bonus} 灵蕴` : ''}。`);
    if ((completedWave + 1) % 5 === 0 && state.towers.length) openEvolutionChoice(completedWave);
  }
}

function activeSignEffect(type) {
  return state.signEffects.find((effect) => effect.type === type);
}

function refreshEnemyModifiers(enemy) {
  const enemyBlessing = activeSignEffect('enemyBuff');
  const enemyDebuff = activeSignEffect('enemyDebuff');
  const routePace = clamp(enemy.routeLength / 1250, .75, 1.45);
  const endless = isEndless() ? Core.endlessScale(state.wave) : { speed: 1, armor: 0 };
  const gale = state.stage === 1 && ['fei', 'wangliang'].includes(enemy.type) ? 1.08 : 1;
  enemy.speed = enemy.def.speed * routePace * currentLevel().spdMul * currentDifficulty().speed * endless.speed * gale * (enemyBlessing ? 1.16 : 1) * (enemyDebuff ? .72 : 1);
  enemy.armor = Math.max(0, (enemy.def.armor || 0) + currentDifficulty().armor + endless.armor + (enemyBlessing ? 5 : 0) - (enemyDebuff ? 8 : 0));
}

function spawnEnemy(type, hpMul, routeIndex = 0, distanceAlong = 0, role = 'normal') {
  const def = ENEMIES[type]; const route = pathInfo()[routeIndex] || pathInfo()[0];
  const enemyBlessing = activeSignEffect('enemyBuff');
  const difficulty = currentDifficulty();
  const hp = def.hp * currentLevel().hpMul * difficulty.hp * hpMul * (enemyBlessing ? 1.18 : 1);
  const point = interpolatePath(route.points, distanceAlong);
  const hard = state.difficulty === 'hard'; const easy = state.difficulty === 'easy';
  const heavenShield = state.stage === 4 && role !== 'normal' ? (role === 'stageBoss' ? 160 : 55) : 0;
  const enemy = { type, role, sealDamage: role === 'stageBoss' ? 9 : role === 'miniBoss' ? 5 : 1, def, x: point.x, y: point.y, d: distanceAlong, route: routeIndex, routePoints: route.points, routeLength: pathLength(route.points), hp, maxHp: hp, speed: def.speed, radius: def.radius, shield: (def.shield || 0) * (hard ? 1.35 : easy ? .7 : 1) + heavenShield, armor: def.armor || 0, immuneMag: Boolean(def.immuneMag && !easy), immunePhy: Boolean(def.immunePhy || (hard && type === 'bashe')), resistMag: easy && def.immuneMag ? .45 : 0, slow: 0, slowTimer: 0, burnTimer: 0, burnDps: 0, burnSource: null, stealthTimer: def.stealth ? (hard ? 3.5 : easy ? 1 : 2) : 0, revived: false, reviveRatio: hard ? .55 : easy ? .25 : .35, split: false, lastHitBy: null, contributors: new Set(), hitCount: 0, hitTarget: null, healRate: hard ? .12 : easy ? .05 : .08, healInterval: hard ? 5 : easy ? 9 : 7, skillTimer: 4 + Math.random() * 3, tideTimer: 6 };
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
    const full = members.length >= bond.members.length;
    const contribution = bond.bonus + Math.max(0, members.length - bond.need) * bond.stepBonus;
    totals[bond.stat] += contribution;
    active.push({ ...bond, members, formed: true, full, ultReady: Boolean(bond.ult), adjusted: contribution });
  }
  totals.power = Math.min(1.2, totals.power); totals.haste = Math.min(.7, totals.haste); totals.range = Math.min(.45, totals.range); totals.cdr = Math.min(.6, totals.cdr); totals.sunder = Math.min(.45, totals.sunder); totals.enemySlow = Math.min(.45, totals.enemySlow);
  const skillBonds = active.filter((bond) => bond.ultReady);
  state.skillBond = skillBonds.find((bond) => bond.id === state.skillBond?.id) || skillBonds[0] || null;
  return { totals, active };
}

function supportBonusesFor(tower) {
  const totals = { power: 0, haste: 0, range: 0, cdr: 0, manaRegen: 0 };
  state.towers.forEach((source) => {
    if (source.uid === tower.uid) return;
    const support = supportSkillForSource(source);
    if (!support.value || Math.hypot(source.x - tower.x, source.y - tower.y) > support.radius) return;
    totals[support.stat] += support.value;
  });
  totals.power = Math.min(.42, totals.power); totals.haste = Math.min(.38, totals.haste); totals.range = Math.min(.32, totals.range); totals.cdr = Math.min(.48, totals.cdr); totals.manaRegen = Math.min(1, totals.manaRegen);
  return totals;
}

function updateTowers(dt) {
  const bondState = bondsForTowers();
  const allyBlessing = activeSignEffect('allyBuff');
  state.towers.forEach((tower) => {
    const def = beastDef(tower.id);
    const growth = growthFor(tower.id);
    const runPassive = Core.passiveBonus(tower.id, tower.growthKills || 0);
    const evolution = evolutionBonusesFor(tower.id);
    const support = supportBonusesFor(tower);
    const manaStats = unitManaStats(def);
    tower.maxMana ||= manaStats.maxMana; tower.manaRegen ||= manaStats.manaRegen; tower.mana ??= tower.maxMana; tower.skillCd ??= 0; tower.skillShots ??= 0;
    tower.mana = Math.min(tower.maxMana, tower.mana + tower.manaRegen * (1 + support.manaRegen) * dt);
    tower.skillCd = Math.max(0, tower.skillCd - dt * (1 + support.cdr + bondState.totals.cdr));
    tower.cd -= dt * growth.haste * (1 + runPassive.haste) * (1 + bondState.totals.haste + support.haste + (allyBlessing ? .2 : 0));
    if (tower.cd > 0) return;
    const range = def.range * growth.range * (1 + evolution.range) * (1 + bondState.totals.range + support.range);
    let target = state.enemies.filter((enemy) => enemy.hp > 0 && enemy.stealthTimer <= 0 && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range && enemy.hp - incomingDamage(enemy) > 0).sort((a, b) => b.d - a.d)[0];
    if (!target) target = state.enemies.filter((enemy) => enemy.hp > 0 && enemy.stealthTimer <= 0 && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range).sort((a, b) => b.d - a.d)[0];
    if (!target) return;
    if (tower.hitTarget === target) tower.hitCount += 1; else { tower.hitTarget = target; tower.hitCount = 1; }
    const special = def.stunEvery && tower.hitCount % def.stunEvery === 0 ? -1 : def.breakAt && tower.hitCount % def.breakAt === 0 ? -2 : 0;
    const power = def.dmg * RARITY_POWER[def.rarity] * growth.attack * currentDifficulty().towerPower * (1 + runPassive.power + evolution.power) * (1 + bondState.totals.power + support.power + (allyBlessing ? .22 : 0)) * (1 + (tower.level - 1) * .26) * (1 + cultivation().power);
    const seed = [...tower.id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    state.projectiles.push({ x: tower.x, y: tower.y, target, amount: power, speed: def.projSpeed, def, source: tower, life: special, seed, age: 0, trail: [] });
    if (runPassive.targets > 0) {
      state.enemies.filter((enemy) => enemy !== target && enemy.hp > 0 && enemy.stealthTimer <= 0 && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range).sort((a, b) => b.d - a.d).slice(0, runPassive.targets).forEach((enemy, index) => {
        state.projectiles.push({ x: tower.x, y: tower.y, target: enemy, amount: power * .65, speed: def.projSpeed, def, source: tower, life: 0, seed: seed + 20 + index, age: 0, trail: [] });
      });
    }
    if (tower.skillShots > 0) {
      const skill = activeSkillFor(tower.id);
      const extraTargets = state.enemies.filter((enemy) => enemy !== target && enemy.hp > 0 && enemy.stealthTimer <= 0 && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range).sort((a, b) => b.d - a.d).slice(0, Math.max(1, (skill.count || 2) - 1));
      extraTargets.forEach((enemy, index) => state.projectiles.push({ x: tower.x, y: tower.y, target: enemy, amount: power * (skill.mult || .7), speed: def.projSpeed, def, source: tower, life: 0, seed: seed + index + 1, age: 0, trail: [] }));
      tower.skillShots -= 1;
    }
    playAttackSound(def.proj, tower.x);
    tower.cd = def.interval / Math.max(.35, def.rate || 1);
  });
}

function targetDamage(enemy, amount, def, special, source) {
  let final = amount;
  if (def.dmgType === 'phy' && enemy.immunePhy) return 0;
  if (def.dmgType === 'mag' && enemy.immuneMag) return 0;
  if (def.dmgType === 'phy' && enemy.resistPhy) final *= 1 - enemy.resistPhy;
  if (def.dmgType === 'mag' && enemy.resistMag) final *= 1 - enemy.resistMag;
  if (enemy.shield > 0) {
    if (!def.counters.includes('breakShield')) return 0;
    enemy.shield = Math.max(0, enemy.shield - amount); burst(enemy.x, enemy.y, '#9bd2dd', 7); return 0;
  }
  final *= Math.max(.35, 1 - Math.max(0, enemy.armor - (enemy.armorBreak || 0) - bondTotals().sunder * 40) / 100);
  if (special === -2) final *= 1.2;
  if (special === -1) enemy.stunned = Math.max(enemy.stunned || 0, 1.2);
  if (def.counters.includes('execute') && enemy.hp / enemy.maxHp < .25) final *= 1.6;
  if (source) enemy.lastHitBy = source;
  return final;
}

function bondTotals() { return bondsForTowers().totals; }

function damageEnemy(enemy, amount, def, special = 0, source = null) {
  if (!enemy || enemy.hp <= 0) return;
  const final = targetDamage(enemy, amount, def, special, source);
  if (final <= 0) { addDamageText(enemy.x, enemy.y, def.dmgType === 'true' ? '免疫' : '破免', '#b7b5aa'); return; }
  if (source?.uid) enemy.contributors?.add(source.uid);
  enemy.hp -= final; addDamageText(enemy.x, enemy.y, Math.round(final), def.color);
  if (def.burn) {
    const burnDps = def.dmg * (def.burnDps || .22);
    enemy.burnTimer = Math.max(enemy.burnTimer, 4);
    if (burnDps >= enemy.burnDps) { enemy.burnDps = burnDps; enemy.burnSource = source; }
  }
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
    enemy.armorBreakTimer = Math.max(0, (enemy.armorBreakTimer || 0) - dt); if (enemy.armorBreakTimer <= 0) enemy.armorBreak = 0;
    if (enemy.burnTimer > 0) { enemy.burnTimer -= dt; damageEnemy(enemy, enemy.burnDps * dt, { dmgType: 'true', counters: [], color: '#eb8d4f', burn: false }, 0, enemy.burnSource); }
    if (enemy.hp <= 0) continue;
    if (enemy.def.skill === 'heal') { enemy.skillTimer -= dt; if (enemy.skillTimer <= 0) { enemy.skillTimer = enemy.healInterval; const heal = enemy.maxHp * enemy.healRate; enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal); addDamageText(enemy.x, enemy.y - 20, `+${Math.round(heal)}`, '#83c8a7'); } }
    if (state.stage === 2) {
      enemy.tideTimer -= dt;
      if (enemy.tideTimer <= 0) { enemy.tideTimer = 6; const heal = enemy.maxHp * .012; enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal); addDamageText(enemy.x, enemy.y - 20, `潮 +${Math.round(heal)}`, '#78c9c6'); }
    }
    if (enemy.stunned > 0) continue;
    const route = enemy.routePoints; const next = interpolatePath(route, enemy.d); enemy.x = next.x; enemy.y = next.y;
    enemy.d += enemy.speed * (1 - enemy.slow) * (1 - totals.enemySlow) * dt;
    if (enemy.d >= enemy.routeLength) { enemy.hp = 0; state.hp -= enemy.sealDamage; state.combo = 0; playSound('breach'); addLog(`${enemy.def.name}冲过封印，造成 ${enemy.sealDamage} 点破封伤害。`); }
  }
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
  if (state.hp <= 0) finishGame(false);
}

function killEnemy(enemy) {
  if (enemy.def.skill === 'revive' && !enemy.revived) { enemy.revived = true; enemy.hp = enemy.maxHp * enemy.reviveRatio; enemy.shield = state.difficulty === 'hard' ? 180 : state.difficulty === 'easy' ? 70 : 120; addLog(`${enemy.def.name}触发复活，获得临时护盾。`); return; }
  if (enemy.def.skill === 'split' && !enemy.split) {
    enemy.split = true;
    for (let i = 0; i < 2; i += 1) spawnEnemy('xingxing', .55, enemy.route, enemy.d);
  }
  const killerId = enemy.lastHitBy?.id;
  if (killerId) state.runBeastKills[killerId] = (state.runBeastKills[killerId] || 0) + 1;
  enemy.contributors?.forEach((uid) => {
    const tower = state.towers.find((item) => item.uid === uid);
    if (tower) tower.growthKills = (tower.growthKills || 0) + 1;
  });
  playSound(enemy.role !== 'normal' || enemy.def.boss ? 'bossDown' : 'kill');
  state.kills += enemy.def.reward; state.combo += 1; state.score += enemy.def.reward * 100 + Math.min(100, state.combo * 5); state.bestCombo = Math.max(state.bestCombo, state.combo); state.energy = Math.min(9999, state.energy + enemy.def.reward * 2); state.xp += enemy.def.reward; burst(enemy.x, enemy.y, enemy.def.color, enemy.role !== 'normal' || enemy.def.boss ? 18 : 8);
}

function awardBeastGrowth(won) {
  const summaries = [];
  state.runFielded.forEach((id) => {
    const previous = growthFor(id);
    const kills = state.runBeastKills[id] || 0;
    const gainedXp = 12 + kills * 5 + (won ? 8 : 0);
    state.beastGrowth[id] = { xp: previous.xp + gainedXp, appearances: previous.appearances + 1, kills: previous.kills + kills };
    const next = growthFor(id);
    summaries.push(`${beastDef(id).name} +${gainedXp}经验${next.level > previous.level ? `（升至灵阶${next.level}）` : ''}`);
  });
  return summaries;
}

function resultGrade(total, won, integrity, requiredFielded, activeBonds, difficulty = currentDifficulty()) {
  const gradeOrder = ['C', 'B', 'A', 'S'];
  const scoreGrade = won ? (total >= difficulty.grades.s ? 'S' : total >= difficulty.grades.a ? 'A' : total >= difficulty.grades.b ? 'B' : 'C') : 'C';
  const integrityCap = integrity >= .8 ? 'S' : integrity >= .5 ? 'A' : integrity >= .3 ? 'B' : 'C';
  const objectiveCap = requiredFielded && activeBonds > 0 ? 'S' : 'A';
  const grade = gradeOrder[Math.min(gradeOrder.indexOf(scoreGrade), gradeOrder.indexOf(integrityCap), gradeOrder.indexOf(objectiveCap))];
  return { grade, scoreGrade, integrityCap, objectiveCap };
}

function awardMedals(context) {
  const newIds = Core.medalAwards(context).filter((id) => !state.medals.has(id));
  newIds.forEach((id) => {
    state.medals.add(id);
    window.steamShell?.unlockAchievement?.(id);
  });
  return newIds;
}

function renderMedals() {
  refs.medalsList.innerHTML = Core.MEDALS.map((medal) => `<article class="medal-entry ${state.medals.has(medal.id) ? 'is-unlocked' : ''}"><span>${state.medals.has(medal.id) ? '印' : '隐'}</span><div><strong>${medal.name}</strong><small>${medal.group} · ${medal.copy}</small></div></article>`).join('');
}

function finishGame(won, abandoned = false) {
  if (state.screen !== 'game') return;
  state.screen = 'finishing'; state.finishTimer = 0;
  if (won) playSound('victory');
  const unlockedBefore = new Set(state.unlocked);
  if (won && !isEndless()) state.completions.add(completionKey(state.stage, state.difficulty));
  applyProgressUnlocks();
  const newUnlocks = [...state.unlocked].filter((id) => !unlockedBefore.has(id));
  const growthSummaries = awardBeastGrowth(won);
  const activeBonds = bondsForTowers().active.filter((bond) => bond.formed).length;
  const remainingHp = Math.max(0, state.hp);
  const remainingEnergy = Math.max(0, Math.floor(state.energy));
  const urCount = allOwnedUnits().filter((unit) => beastDef(unit.id).rarity === 4).length;
  const requiredFielded = state.towers.some((tower) => tower.id === state.requiredBeastId);
  const integrity = remainingHp / state.maxHp;
  const breakdown = {
    combat: Math.min(6000, Math.round(state.score * .35)),
    victory: won ? 1500 : 0,
    bonds: Math.min(2200, activeBonds * 550),
    hp: Math.round(4500 * integrity ** 2),
    energy: Math.min(1600, remainingEnergy * 6),
    ur: Math.min(1200, urCount * 400),
    required: requiredFielded ? 1200 : 0,
  };
  ['combat', 'victory', 'bonds', 'hp', 'energy', 'ur', 'required'].forEach((key) => { breakdown[key] = Math.round(breakdown[key] * currentDifficulty().score); });
  breakdown.total = breakdown.combat + breakdown.victory + breakdown.bonds + breakdown.hp + breakdown.energy + breakdown.ur + breakdown.required;
  const gradeResult = resultGrade(breakdown.total, won, integrity, requiredFielded, activeBonds);
  breakdown.grade = gradeResult.grade;
  breakdown.scoreGrade = gradeResult.scoreGrade;
  breakdown.integrityCap = gradeResult.integrityCap;
  state.finalScoreBreakdown = breakdown;
  const scoreKey = isEndless() ? `endless:${state.stage}` : completionKey(state.stage, state.difficulty);
  state.bestScores[scoreKey] = Math.max(Number(state.bestScores[scoreKey]) || 0, breakdown.total);
  const fieldedUrCount = [...state.runFielded].filter((id) => beastDef(id).rarity === 4).length;
  const newMedals = awardMedals({
    won, mode: state.mode, wave: state.wave + 1, hp: remainingHp, maxHp: state.maxHp, difficulty: state.difficulty,
    urCount: fieldedUrCount, maxRarity: Math.max(0, ...[...state.runFielded].map((id) => beastDef(id).rarity)), activeBonds, requiredFielded,
    maxGrowthKills: Math.max(0, ...allOwnedUnits().map((unit) => unit.growthKills || 0)), clearedAll: clearedAllStages(), clearedHardAll: clearedAllStages('hard'),
  });
  state.tier = cultivationTierFor(state.xp);
  saveProgress();
  refs.resultTitle.textContent = isEndless() ? `无尽封印止于第 ${state.wave + 1} 波` : won ? '封印守住了' : abandoned ? '守阵主动撤离' : '封印被突破';
  refs.resultStage.textContent = `${currentLevel().name} · 0${state.stage + 1} · ${isEndless() ? '无尽模式' : currentDifficulty().name}`;
  refs.resultScoreStamp.textContent = breakdown.grade;
  refs.resultScoreTotal.textContent = breakdown.total.toLocaleString('zh-CN');
  refs.resultBonds.textContent = `${activeBonds} · +${breakdown.bonds}`;
  refs.resultHp.textContent = `${remainingHp}/${state.maxHp} · +${breakdown.hp}`;
  refs.resultEnergy.textContent = `${remainingEnergy} · +${breakdown.energy}`;
  refs.resultUr.textContent = `${urCount} · +${breakdown.ur}`;
  refs.resultRequired.textContent = `${beastDef(state.requiredBeastId).name} · ${requiredFielded ? `+${breakdown.required}` : '+0'}`;
  refs.resultKills.textContent = state.kills; refs.resultXp.textContent = `+${state.kills}`; refs.resultCombo.textContent = state.bestCombo;
  const unlockCopy = newUnlocks.length ? ` 新解锁：${newUnlocks.map((id) => beastDef(id).name).join('、')}。` : '';
  const growthCopy = growthSummaries.length ? ` ${growthSummaries.join('，')}。` : '';
  const medalCopy = newMedals.length ? ` 新勋章：${newMedals.map((id) => Core.MEDALS.find((medal) => medal.id === id)?.name).filter(Boolean).join('、')}。` : '';
  const capReasons = [gradeResult.integrityCap !== 'S' ? `封印完整度 ${Math.round(integrity * 100)}%，评级上限 ${gradeResult.integrityCap}` : '', !requiredFielded ? '未上阵必选妖灵，评级上限 A' : '', activeBonds === 0 ? '未触发羁绊，评级上限 A' : ''].filter(Boolean);
  refs.resultCopy.textContent = `${isEndless() ? `无尽模式抵达第 ${state.wave + 1} 波` : won ? '守关成功' : abandoned ? '主动撤守并结算本局成长' : '守关失败'}，${currentDifficulty().name}难度倍率 ×${currentDifficulty().score.toFixed(2)}，总分评级 ${gradeResult.scoreGrade}${capReasons.length ? `；${capReasons.join('；')}` : ''}。${unlockCopy}${growthCopy}${medalCopy}`;
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
  state.runFielded.add(unit.id);
  state.selectedTowerUid = unit.uid;
  state.backpack = state.backpack.filter((item) => item.uid !== unit.uid);
  state.selectedUnitId = null;
  if (state.tutorialStep === 1) { state.tutorialStep = 2; refs.arenaHint.textContent = '布阵完成：妖灵会自动攻击。注意让攻击范围覆盖道路。'; }
  playSound('deploy'); addLog(`${def.name}已安置；主动技「${activeSkillFor(unit.id).name}」法力已满。`); renderGameRoster(); renderGameBonds(); updateHUD();
}

function renderGameRoster() {
  refs.gameRoster.innerHTML = state.backpack.length
    ? orderedBackpackUnits().map((unit) => unitCard(unit, state.selectedUnitId === unit.uid ? 'is-selected' : '')).join('')
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
    return `<${tag} class="bond-row ${selectable ? 'bond-skill-choice' : ''} ${state.skillBond?.id === bond.id ? 'is-selected' : ''}"${attrs}><i class="bond-pill ${current ? 'active' : ''}" style="background:${bond.color}"></i><span>${bond.name}</span><strong>${count}/${bond.need}${current ? ` · 已触发 ${Math.round(current.adjusted * 100)}%` : ''}</strong></${tag}>`;
  }).join('');
  refs.gameBonds.querySelectorAll('[data-skill-bond]').forEach((button) => button.addEventListener('click', () => {
    const { active: current } = bondsForTowers();
    state.skillBond = current.find((bond) => bond.id === button.dataset.skillBond) || state.skillBond;
    updateHUD();
  }));
  const cooldown = state.skillBond ? (state.skillCooldowns[state.skillBond.id] || 0) : 0;
  refs.skillLabel.textContent = state.skillBond ? (cooldown > 0 ? `${cooldown.toFixed(1)}s` : state.skillBond.ult) : '未就绪';
  refs.teamSkill.disabled = state.paused || !state.skillBond || cooldown > 0;
  refs.teamSkill.title = state.skillBond ? `${state.skillBond.name} · ${state.skillBond.ult} · CD ${state.skillBond.cooldown} 秒` : '上场满足数量的羁绊成员后解锁';
}

function renderBondDialog() {
  const { active } = bondsForTowers();
  refs.bondDialogList.innerHTML = BOND_DEFS.map((bond) => {
    const current = active.find((item) => item.id === bond.id);
    const count = new Set(state.towers.filter((tower) => bond.members.includes(tower.id)).map((tower) => tower.id)).size;
    const cooldown = current ? state.skillCooldowns[current.id] || 0 : 0;
    const status = current ? `上场触发 · ${Math.round(current.adjusted * 100)}% · ${cooldown > 0 ? `${cooldown.toFixed(1)}s` : '技能就绪'}` : '未触发';
    const tag = current?.ultReady ? 'button' : 'article';
    const attrs = current?.ultReady ? ` type="button" data-dialog-skill-bond="${bond.id}"` : '';
    return `<${tag} class="bond-detail"${attrs}><i style="background:${bond.color}"></i><div><strong>${bond.name}</strong><small>${count}/${bond.members.length} · ${bond.need}只上场即触发 · ${bond.ult}</small></div><b>${status}</b></${tag}>`;
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
    const nearestAlly = state.towers.length ? Math.min(...state.towers.map((tower) => Math.hypot(tower.x - x, tower.y - y))) : 120;
    const supportSpacing = -Math.abs(nearestAlly - 118) * .32;
    const score = -Math.abs(road - 68) * 1.25 + supportSpacing + Math.abs(y - 270) * .03;
    if (!best || score > best.score) best = { x, y, score };
  }
  return best;
}

function deployBestBondGroup() {
  const candidate = BOND_DEFS.map((bond) => {
    const existing = bond.members.filter((id) => state.towers.some((tower) => tower.id === id)).length;
    const available = bond.members.map((id) => state.backpack.find((unit) => unit.id === id)).filter(Boolean);
    return { bond, existing, available, score: (existing + available.length >= bond.need ? 1000 : 0) + existing * 100 + available.length * 20 };
  }).filter((item) => item.existing + item.available.length >= item.bond.need && item.available.length).sort((a, b) => b.score - a.score)[0];
  if (!candidate) return null;
  let placed = 0;
  for (const unit of candidate.available) {
    if (usedPopulation() + populationCostFor(unit) > state.maxPopulation) continue;
    const spot = autoSpot(); if (!spot) break;
    state.backpack = state.backpack.filter((item) => item.uid !== unit.uid);
    state.towers.push({ ...unit, x: spot.x, y: spot.y, cd: unit.cd || .15, hitTarget: null, hitCount: 0 });
    state.runFielded.add(unit.id); placed += 1;
  }
  return { name: candidate.bond.name, placed };
}

function autoDeploy() {
  const bondGroup = deployBestBondGroup();
  let placed = bondGroup?.placed || 0;
  while (state.backpack.length && usedPopulation() < state.maxPopulation) {
    const unitIndex = state.backpack.findIndex((unit) => !state.towers.some((tower) => tower.id === unit.id) && usedPopulation() + populationCostFor(unit) <= state.maxPopulation);
    if (unitIndex < 0) break;
    const spot = autoSpot();
    if (!spot) break;
    const [unit] = state.backpack.splice(unitIndex, 1);
    state.towers.push({ ...unit, x: spot.x, y: spot.y, cd: .15, hitTarget: null, hitCount: 0 });
    state.runFielded.add(unit.id);
    placed += 1;
  }
  state.selectedUnitId = null;
  if (placed && state.tutorialStep === 1) { state.tutorialStep = 2; refs.arenaHint.textContent = '布阵完成：妖灵会自动攻击。注意让攻击范围覆盖道路。'; }
  if (placed || bondGroup) playSound('deploy');
  addLog(bondGroup ? `一键部署优先凑成「${bondGroup.name}」，成员上场即生效；共新上场 ${placed} 只妖灵。` : placed ? `一键部署：${placed} 只不同名妖灵已部署到辅助范围内。` : '没有可部署的妖灵、人口或合法位置。');
  renderGameRoster();
  renderBackpack();
  updateHUD();
}

function recallAll() {
  const room = MAX_BACKPACK - state.backpack.length;
  const returning = state.towers.splice(0, Math.max(0, room));
  state.backpack.push(...returning.map(({ x, y, ...unit }) => unit));
  state.selectedUnitId = state.backpack[0]?.uid || null;
  state.selectedTowerUid = state.towers[0]?.uid || null; state.pendingTargetSkillUid = null;
  addLog(returning.length ? (state.towers.length ? `背包空间有限，已下场 ${returning.length} 只；仍有 ${state.towers.length} 只留在场上。` : `已下场 ${returning.length} 只妖灵，收入背包。`) : '背包已满，无法下场。');
  renderGameRoster();
  renderBackpack();
  updateHUD();
}

function renderBackpack() {
  if (!refs.backpackList) return;
  refs.backpackList.innerHTML = state.backpack.length ? orderedBackpackUnits().map((unit) => unitCard(unit, `${state.selectedUnitId === unit.uid ? 'is-selected' : ''} ${state.fusionSelection.includes(unit.uid) ? 'is-fusing' : ''}`)).join('') : '<p class="dialog-empty">背包为空。普通、高级召灵均可单抽或八折五连。</p>';
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

function openEvolutionChoice(completedWave) {
  const choices = Core.evolutionChoices(state.towers.map((tower) => tower.id), state.runSeed + completedWave * 97);
  if (!choices.length) return;
  refs.evolutionChoices.innerHTML = choices.map((choice, index) => {
    const beast = beastDef(choice.beastId);
    return `<button type="button" data-evolution-index="${index}" class="evolution-choice rarity-${RARITIES[beast.rarity]}">${portraitMarkup(beast)}<span><em>${beast.name}</em><strong>${choice.name}</strong><small>${choice.copy}</small></span></button>`;
  }).join('');
  refs.evolutionChoices.querySelectorAll('[data-evolution-index]').forEach((button) => button.addEventListener('click', () => {
    const choice = choices[Number(button.dataset.evolutionIndex)];
    if (!choice) return;
    state.runEvolutions[choice.beastId] ||= [];
    state.runEvolutions[choice.beastId].push(choice.id);
    addLog(`${beastDef(choice.beastId).name}完成「${choice.name}」进化：${choice.copy}。`);
    closeGameDialog(refs.evolutionDialog);
    updateHUD();
  }));
  showGameDialog(refs.evolutionDialog);
}

function skillEffectText(skill) {
  if (skill.type === 'area') return `范围伤害${skill.burn ? '并灼烧' : skill.slow ? '并减速' : ''}`;
  if (skill.type === 'areaStun') return `范围伤害并眩晕 ${skill.stun} 秒`;
  if (skill.type === 'targetStun') return `指定目标眩晕 ${skill.stun} 秒`;
  if (skill.type === 'split') return `后续 ${skill.shots} 次攻击分裂`;
  if (skill.type === 'multishot') return `同时攻击 ${skill.count} 个目标`;
  if (skill.type === 'slow') return `范围减速 ${Math.round(skill.slow * 100)}%`;
  return `范围破甲 ${skill.armorBreak}`;
}

function supportEffectText(support) {
  const labels = { power: '攻击', haste: '攻速', range: '射程', cdr: '技能恢复', manaRegen: '法力恢复' };
  return `周围友军${labels[support.stat]} +${Math.round(support.value * 100)}%`;
}

function spiritSkillPower(tower) {
  const def = beastDef(tower.id); const growth = growthFor(tower.id); const bondState = bondsForTowers(); const support = supportBonusesFor(tower);
  const passive = Core.passiveBonus(tower.id, tower.growthKills || 0); const evolution = evolutionBonusesFor(tower.id);
  return def.dmg * RARITY_POWER[def.rarity] * growth.attack * currentDifficulty().towerPower * (1 + passive.power + evolution.power) * (1 + bondState.totals.power + support.power) * (1 + (tower.level - 1) * .26) * (1 + cultivation().power);
}

function finishSpiritSkill(tower, skill) {
  const effective = effectiveSkillStats(tower, skill);
  tower.mana = Math.max(0, tower.mana - effective.mana);
  tower.skillCd = effective.cooldown;
  state.pendingTargetSkillUid = null;
  playSound('skill'); burst(tower.x, tower.y, beastDef(tower.id).color, 12);
  addLog(`${beastDef(tower.id).name}发动「${skill.name}」：${skillEffectText(skill)}。`);
  updateHUD();
}

function castSpiritSkill(tower, explicitTarget = null) {
  const skill = activeSkillFor(tower?.id);
  if (!tower || !skill) return false;
  const effective = effectiveSkillStats(tower, skill);
  if (tower.skillCd > 0 || tower.mana < effective.mana) return false;
  const def = beastDef(tower.id); const support = supportBonusesFor(tower); const bonds = bondTotals();
  const evolution = evolutionBonusesFor(tower.id);
  const range = def.range * growthFor(tower.id).range * (1 + evolution.range) * (1 + bonds.range + support.range) * (skill.rangeMul || 1.2);
  const visible = state.enemies.filter((enemy) => enemy.hp > 0 && enemy.stealthTimer <= 0);
  const inRange = visible.filter((enemy) => Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range).sort((a, b) => b.d - a.d);
  const target = explicitTarget || inRange[0] || null;
  const power = spiritSkillPower(tower);
  const skillDef = { ...def, splash: 0, chain: 0, slow: 0, slowDur: 0, stunEvery: 0, breakAt: 0, dmgType: def.dmgType, counters: [...new Set([...def.counters, ...(skill.type === 'armorBreak' ? ['breakShield'] : [])])], burn: Boolean(skill.burn), burnDps: def.burnDps || .22, color: def.color };
  if (skill.type === 'split') {
    if (!inRange.length) { addLog(`${skill.name}需要射程内存在敌军。`); return false; }
    tower.skillShots = Math.max(tower.skillShots || 0, skill.shots);
  } else if (skill.type === 'multishot') {
    if (!inRange.length) { addLog(`${skill.name}当前没有射程内目标。`); return false; }
    inRange.slice(0, skill.count).forEach((enemy, index) => state.projectiles.push({ x: tower.x, y: tower.y, target: enemy, amount: power * skill.mult, speed: def.projSpeed * 1.15, def: skillDef, source: tower, life: 0, seed: index + tower.id.length * 7, age: 0, trail: [] }));
  } else if (skill.type === 'targetStun') {
    if (!target || Math.hypot(target.x - tower.x, target.y - tower.y) > range) { addLog('指定目标不在技能射程内。'); return false; }
    target.stunned = Math.max(target.stunned || 0, skill.stun); damageEnemy(target, power * skill.mult, skillDef, 0, tower); burst(target.x, target.y, def.color, 10);
  } else {
    if (!target && skill.type === 'area') { addLog(`${skill.name}当前没有可攻击目标。`); return false; }
    const center = skill.type === 'area' ? target : tower;
    const targets = visible.filter((enemy) => Math.hypot(enemy.x - center.x, enemy.y - center.y) <= skill.radius * (1 + evolution.range));
    if (!targets.length) { addLog(`${skill.name}范围内没有敌军。`); return false; }
    targets.forEach((enemy) => {
      if (skill.mult) damageEnemy(enemy, power * skill.mult, skillDef, 0, tower);
      if (skill.stun) enemy.stunned = Math.max(enemy.stunned || 0, skill.stun);
      if (skill.slow) { enemy.slow = Math.max(enemy.slow, skill.slow); enemy.slowTimer = Math.max(enemy.slowTimer, skill.duration); }
      if (skill.armorBreak) { enemy.armorBreak = Math.max(enemy.armorBreak || 0, skill.armorBreak); enemy.armorBreakTimer = Math.max(enemy.armorBreakTimer || 0, skill.duration); }
      burst(enemy.x, enemy.y, def.color, 7);
    });
  }
  finishSpiritSkill(tower, skill);
  return true;
}

function useSpiritSkill() {
  const tower = state.towers.find((item) => item.uid === state.selectedTowerUid);
  if (!tower) { addLog('先点击场上的妖灵，再发动主动技能。'); return; }
  const skill = activeSkillFor(tower.id);
  const effective = effectiveSkillStats(tower, skill);
  if (state.pendingTargetSkillUid === tower.uid) { state.pendingTargetSkillUid = null; refs.arenaHint.textContent = '已取消指定技能目标。'; updateHUD(); return; }
  if (tower.skillCd > 0) { addLog(`${skill.name}尚需 ${tower.skillCd.toFixed(1)} 秒恢复。`); return; }
  if (tower.mana < effective.mana) { addLog(`${skill.name}需要 ${effective.mana} 法力，当前 ${Math.floor(tower.mana)}。`); return; }
  if (skill.type === 'targetStun') {
    state.pendingTargetSkillUid = tower.uid;
    refs.arenaHint.textContent = `${skill.name}：点击射程内一名敌军作为目标`;
    updateHUD();
    return;
  }
  castSpiritSkill(tower);
}

function updateHUD() {
  const waveCount = totalWaves();
  const phaseText = state.phase === 'prep' ? `整备 ${Math.ceil(state.prepTimer)}s` : state.phase === 'rest' ? `${isBossWave(state.wave) ? '首领警戒' : '下一波'} ${Math.ceil(state.waveCooldown)}s` : `余敌 ${state.enemies.length}`;
  const selected = selectedUnit();
  const currentBest = Number(state.bestScores[completionKey(state.stage, state.difficulty)]) || 0;
  const waveNumber = state.wave + 1;
  refs.hpLabel.textContent = `${Math.max(0, state.hp)} / ${state.maxHp}`; refs.hpMeter.style.width = `${clamp(state.hp / state.maxHp * 100, 0, 100)}%`; refs.essenceLabel.textContent = Math.floor(state.energy); refs.killLabel.textContent = state.score; refs.bestScoreLabel.textContent = Math.max(currentBest, Math.round(state.score * currentDifficulty().score)); refs.waveLabel.textContent = `波次 ${waveNumber} / ${phaseText}`;
  refs.gameLevel.textContent = `${isEndless() ? '无尽' : '波次'} ${waveNumber}${isEndless() ? '' : ` / ${waveCount}`} · ${phaseText}`;
  const hpBlocks = document.querySelector('#hp-blocks');
  if (hpBlocks) hpBlocks.innerHTML = Array.from({ length: state.maxHp }, (_, index) => `<i class="${index >= state.hp ? 'is-empty' : ''}"></i>`).join('');
  const cycleWave = state.wave % WAVES.length;
  refs.waveTrack.innerHTML = Array.from({ length: WAVES.length }, (_, index) => `<i class="${index < cycleWave ? 'done' : index === cycleWave ? 'current' : ''}"></i>`).join(''); refs.pauseGame.querySelector('strong').textContent = state.paused ? '继续' : '暂停'; refs.speedGame.querySelector('strong').textContent = `${state.speed}倍速`; refs.speedGame.title = threeSpeedUnlocked() ? '切换 1 / 2 / 3 倍速' : '切换 1 / 2 倍速；任意难度通关五关后解锁 3 倍速'; refs.populationLabel.textContent = `${usedPopulation()} / ${state.maxPopulation}`;
  refs.backpackLabel.textContent = `${state.backpack.length}/${MAX_BACKPACK}`; refs.selectedUnitLabel.textContent = selected ? `${beastDef(selected.id).name} · ${RARITIES[beastDef(selected.id).rarity]} 局内Lv.${selected.level} · 灵阶${growthFor(selected.id).level} · 人口 ${populationCostFor(selected)}` : state.selectedTowerUid ? `${beastDef(state.towers.find((tower) => tower.uid === state.selectedTowerUid)?.id || 'bifang').name} · 按住立绘可移动` : '点击召灵，随机请出已解锁妖灵';
  const selectedTower = state.towers.find((tower) => tower.uid === state.selectedTowerUid);
  const selectedSkill = selectedTower ? activeSkillFor(selectedTower.id) : null;
  const effectiveSkill = selectedTower && selectedSkill ? effectiveSkillStats(selectedTower, selectedSkill) : null;
  if (selectedTower && selectedSkill) refs.selectedUnitLabel.textContent = `${beastDef(selectedTower.id).name} · 法力 ${Math.floor(selectedTower.mana)}/${selectedTower.maxMana} · ${Core.passiveBonus(selectedTower.id, selectedTower.growthKills || 0).text}${(state.runEvolutions[selectedTower.id] || []).length ? ` · 已进化${state.runEvolutions[selectedTower.id].length}次` : ''}`;
  refs.spiritSkill.disabled = state.paused || !selectedTower || !selectedSkill || selectedTower.skillCd > 0 || selectedTower.mana < effectiveSkill.mana;
  refs.spiritSkillLabel.textContent = state.pendingTargetSkillUid ? '点击目标' : !selectedSkill ? '选择妖灵' : selectedTower.skillCd > 0 ? `${selectedTower.skillCd.toFixed(1)}s` : selectedTower.mana < effectiveSkill.mana ? `法力 ${Math.floor(selectedTower.mana)}` : selectedSkill.name;
  refs.spiritSkill.title = selectedSkill ? `${selectedSkill.name} · ${skillEffectText(selectedSkill)} · 消耗 ${effectiveSkill.mana} 法力 · CD ${effectiveSkill.cooldown.toFixed(1)} 秒` : '选择场上妖灵后发动主动技能';
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
  const hasBondCandidate = BOND_DEFS.some((bond) => bond.members.filter((id) => allOwnedUnits().some((unit) => unit.id === id)).length >= bond.need);
  refs.autoDeploy.disabled = !hasBondCandidate && !state.backpack.some((unit) => !state.towers.some((tower) => tower.id === unit.id) && usedPopulation() + populationCostFor(unit) <= state.maxPopulation); refs.recallAll.disabled = !state.towers.length || state.backpack.length >= MAX_BACKPACK;
  refs.fortuneSign.disabled = state.paused || state.fortuneSpinning || !state.towers.length || state.energy < FORTUNE_COST; refs.fortuneSign.querySelector('strong').textContent = state.fortuneSpinning ? '签轮转动中' : state.towers.length ? `转运签 ${FORTUNE_COST}` : '转运签 · 需上阵';
  refs.requiredBeastLabel.classList.toggle('is-complete', state.towers.some((tower) => tower.id === state.requiredBeastId));
  renderGameBonds();
}

function useSkill() {
  if (!state.skillBond || state.skillCooldowns[state.skillBond.id] > 0) return;
  const bond = state.skillBond; const source = bond.members[0] || state.towers[0] || { id: 'bond' };
  if (bond.skill !== 'restore' && !state.enemies.some((enemy) => enemy.hp > 0)) { addLog(`${bond.ult}需要敌军进入战场后才能发动。`); return; }
  const memberScale = 1 + Math.max(0, bond.members.length - bond.need) * .25;
  const nearby = (radius) => state.enemies.filter((enemy) => enemy.hp > 0 && bond.members.some((member) => Math.hypot(member.x - enemy.x, member.y - enemy.y) <= radius));
  const localRadius = { tide: 250, roar: 235, fire: 215 }[bond.skill];
  const localTargets = localRadius ? nearby(localRadius) : null;
  if (localTargets && !localTargets.length) { addLog(`${bond.ult}范围内没有敌军，技能未进入冷却。`); return; }
  playSound('skill');
  if (bond.skill === 'tide') {
    localTargets.forEach((enemy) => { enemy.slow = Math.max(enemy.slow, .6); enemy.slowTimer = Math.max(enemy.slowTimer, 3.2); burst(enemy.x, enemy.y, bond.color, 6); });
    addLog(`${bond.ult}发动：范围内敌军减速 60%，持续 3.2 秒。`);
  } else if (bond.skill === 'roar') {
    localTargets.forEach((enemy) => { enemy.stunned = Math.max(enemy.stunned || 0, 1.5); enemy.armorBreak = Math.max(enemy.armorBreak || 0, 8); enemy.armorBreakTimer = Math.max(enemy.armorBreakTimer || 0, 6); burst(enemy.x, enemy.y, bond.color, 7); });
    addLog(`${bond.ult}发动：范围内敌军眩晕 1.5 秒并破甲 8，持续 6 秒。`);
  } else if (bond.skill === 'fire') {
    const amount = bond.members.reduce((sum, member) => sum + beastDef(member.id).dmg, 0) / bond.members.length * 3.4 * memberScale * (1 + bondTotals().power);
    localTargets.forEach((enemy) => damageEnemy(enemy, amount, { dmg: amount, dmgType: 'true', counters: ['execute', 'breakShield', 'purge'], color: bond.color, burn: true, burnDps: .22 }, 0, source));
    addLog(`${bond.ult}发动：范围内敌军承受 3.4 倍真伤并被灼烧。`);
  } else if (bond.skill === 'storm') {
    const amount = 95 * bond.ultMul * memberScale * (1 + bondTotals().power);
    state.enemies.forEach((enemy) => { damageEnemy(enemy, amount, { dmgType: 'true', counters: ['execute', 'breakShield', 'purge'], color: bond.color }, 0, source); enemy.stunned = Math.max(enemy.stunned || 0, .8); burst(enemy.x, enemy.y, bond.color, 8); });
    addLog(`${bond.ult}发动：全场雷击并短暂眩晕敌军。`);
  } else if (bond.skill === 'restore') {
    state.towers.forEach((tower) => { tower.mana = Math.min(tower.maxMana, tower.mana + tower.maxMana * .45); tower.skillCd = Math.max(0, tower.skillCd - 8); burst(tower.x, tower.y, bond.color, 5); });
    Object.keys(state.skillCooldowns).forEach((id) => { if (id !== bond.id) state.skillCooldowns[id] = Math.max(0, state.skillCooldowns[id] - 6); });
    addLog(`${bond.ult}发动：全军回复 45% 法力，妖灵技能恢复 8 秒。`);
  } else {
    const amount = 120 * bond.ultMul * memberScale * (1 + bondTotals().power);
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
  if (selectedTower && !movingTower) { const def = beastDef(selectedTower.id); const range = def.range * growthFor(selectedTower.id).range * (1 + bondsForTowers().totals.range + supportBonusesFor(selectedTower).range); const support = supportSkillFor(selectedTower.id); ctx.save(); ctx.strokeStyle = `${def.color}9a`; ctx.lineWidth = 1.5; ctx.setLineDash([7, 6]); ctx.beginPath(); ctx.arc(selectedTower.x, selectedTower.y, range, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = 'rgba(111, 214, 181, .62)'; ctx.setLineDash([3, 8]); ctx.beginPath(); ctx.arc(selectedTower.x, selectedTower.y, support.radius, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
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
  ctx.fillStyle = 'rgba(37, 29, 21, .86)'; ctx.fillRect(-18, 22, 36, 12); ctx.fillStyle = '#fff0bd'; ctx.font = 'bold 9px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(`Lv.${tower.level}`, 0, 31);
  ctx.fillStyle = 'rgba(25, 25, 34, .82)'; ctx.fillRect(-22, 37, 44, 5); ctx.fillStyle = tower.skillCd > 0 ? '#8d82a6' : '#58a9c5'; ctx.fillRect(-22, 37, 44 * clamp((tower.mana || 0) / Math.max(1, tower.maxMana || 1), 0, 1), 5);
  ctx.restore();
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
    const data = beastDef(beast.id); const growth = growthFor(beast.id); const locked = !state.unlocked.has(beast.id); const skill = activeSkillFor(beast.id); const support = supportSkillFor(beast.id); const effects = [data.burn ? '灼烧' : '', data.splash ? `溅射 ${data.splash}` : '', data.chain ? `连锁 ${data.chain}` : '', data.slow ? `减速 ${Math.round(data.slow * 100)}%` : '', data.stunEvery ? `每 ${data.stunEvery} 次眩晕` : '', data.breakAt ? `第 ${data.breakAt} 击破甲` : ''].filter(Boolean).join(' · ') || '基础攻击';
    const nextXp = growth.level >= BEAST_MAX_LEVEL ? '已满阶' : `${growth.xp - growth.currentFloor}/${growth.nextFloor - growth.currentFloor} XP`;
    return `<article class="codex-entry rarity-${RARITIES[beast.rarity]} ${locked ? 'is-locked' : ''}">${portraitMarkup(beast)}<div class="codex-entry-head"><strong>${beast.name}</strong><em>${locked ? '未解锁' : RARITIES[beast.rarity]}</em></div><small>${locked ? unlockHint(beast.id) : `${projectileNames[data.proj] || data.proj} · ${data.dmgType === 'mag' ? '法术' : data.dmgType === 'true' ? '真实' : '物理'} · ${counterNames[data.counters?.[0]] || '无克制'}`}</small><dl><div><dt>攻击</dt><dd>${Math.round(data.dmg * RARITY_POWER[data.rarity] * growth.attack)}</dd></div><div><dt>攻速</dt><dd>${(1 / (data.interval / growth.haste)).toFixed(2)}/s</dd></div><div><dt>范围</dt><dd>${Math.round(data.range * growth.range)}</dd></div><div><dt>人口</dt><dd>${populationCostFor(beast.id)}</dd></div></dl><p>${locked ? '通关解锁后进入召灵池' : `灵阶 ${growth.level} · ${nextXp} · 上场 ${growth.appearances} · 击杀 ${growth.kills}<br>${effects}<br>主动「${skill.name}」：${skillEffectText(skill)} · ${skill.mana} 法力 / ${skill.cooldown}s<br>辅助「${support.name}」：${supportEffectText(support)}`}</p></article>`;
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
  if (state.pendingTargetSkillUid) {
    const tower = state.towers.find((item) => item.uid === state.pendingTargetSkillUid);
    const target = state.enemies.filter((enemy) => enemy.hp > 0 && enemy.stealthTimer <= 0).sort((a, b) => Math.hypot(a.x - point.x, a.y - point.y) - Math.hypot(b.x - point.x, b.y - point.y))[0];
    if (!tower || !target || Math.hypot(target.x - point.x, target.y - point.y) > 70) addLog('请点击敌军立绘指定技能目标。');
    else castSpiritSkill(tower, target);
    return;
  }
  if (selectedUnit()) { placeTower(point.x, point.y); return; }
  const index = state.towers.findLastIndex((tower) => Math.hypot(tower.x - point.x, tower.y - point.y) <= 38);
  if (index >= 0) {
    state.draggingTowerIndex = index;
    state.selectedTowerUid = state.towers[index].uid;
    state.selectedUnitId = null;
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
refs.startGame.addEventListener('click', startStandardGame);
refs.endlessStart.addEventListener('click', startEndlessGame);
refs.difficultySelect.addEventListener('click', (event) => {
  const button = event.target.closest('[data-difficulty]');
  if (!button) return;
  state.difficulty = button.dataset.difficulty;
  saveProgress();
  renderSelect();
});
refs.summonBeast.addEventListener('click', summonBeast);
refs.summonBeastFive.addEventListener('click', summonBeastFive);
refs.advancedSummon.addEventListener('click', advancedSummon);
refs.advancedSummonFive.addEventListener('click', advancedSummonFive);
refs.advancedClaim.addEventListener('click', claimAdvancedBatch);
refs.summonSwap.addEventListener('click', swapSummonOffers);
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
refs.medalsOpen.addEventListener('click', () => { renderMedals(); refs.medalsDialog.showModal(); });
refs.medalsClose.addEventListener('click', () => refs.medalsDialog.close());
[
  refs.summonDialog, refs.advancedDialog, refs.backpackDialog, refs.fusionDialog, refs.bondsDialog,
].forEach((dialog) => dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeGameDialog(dialog); }));
refs.evolutionDialog.addEventListener('cancel', (event) => event.preventDefault());
refs.medalsDialog.addEventListener('cancel', (event) => { event.preventDefault(); refs.medalsDialog.close(); });
refs.fortuneDialog.addEventListener('cancel', (event) => { event.preventDefault(); refs.fortuneDialog.close(); });
refs.pauseDialog.addEventListener('cancel', (event) => { event.preventDefault(); resumePauseMenu(); });
refs.codexOpen.addEventListener('click', () => { renderCodex(); refs.codexDialog.showModal(); });
refs.codexClose.addEventListener('click', () => refs.codexDialog.close());
refs.codexDialog.addEventListener('click', (event) => { if (event.target === refs.codexDialog) refs.codexDialog.close(); });
refs.backToSelect.addEventListener('click', () => finishGame(false, true));
refs.returnSelect.addEventListener('click', () => { showScreen('select'); renderSelect(); });
refs.replayGame.addEventListener('click', initGame);
refs.pauseGame.addEventListener('click', openPauseMenu);
refs.pauseResume.addEventListener('click', resumePauseMenu);
refs.pauseRetry.addEventListener('click', () => { refs.pauseDialog.close(); initGame(); });
refs.pauseExit.addEventListener('click', () => { refs.pauseDialog.close(); state.paused = false; finishGame(false, true); });
refs.speedGame.addEventListener('click', () => {
  const speeds = threeSpeedUnlocked() ? [1, 2, 3] : [1, 2];
  state.speed = speeds[(speeds.indexOf(state.speed) + 1) % speeds.length];
  if (!threeSpeedUnlocked() && state.speed === 2) addLog('3倍速将在任意难度通关全部五关后永久解锁。');
  updateHUD();
});
refs.soundToggle.addEventListener('click', () => { state.soundEnabled = !state.soundEnabled; refs.soundToggle.textContent = state.soundEnabled ? '♪' : '×'; refs.soundToggle.setAttribute('aria-pressed', String(state.soundEnabled)); saveProgress(); if (state.soundEnabled) playSound('deploy'); });
refs.spiritSkill.addEventListener('click', useSpiritSkill);
refs.teamSkill.addEventListener('click', useSkill);
document.querySelector('#reset-save').addEventListener('click', () => { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(LEGACY_SAVE_KEY); window.steamShell?.writeSave?.('{}'); loadSave(); renderSelect(); document.querySelector('#save-status').textContent = '存档已重置'; });
document.querySelector('[data-start-tutorial]').addEventListener('click', () => { state.mode = 'standard'; state.stage = 0; state.difficulty = 'easy'; initGame(); });

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

loadSave();
refs.soundToggle.textContent = state.soundEnabled ? '♪' : '×';
refs.soundToggle.setAttribute('aria-pressed', String(state.soundEnabled));
renderSelect(); showScreen('select'); requestAnimationFrame(tick);

window.__shanHaiDebug = { state, ROSTER, BEASTS, ACTIVE_SKILLS, SUPPORT_SKILLS, BOND_DEFS, LEVELS, WAVES, DIFFICULTIES, growthFor, applyProgressUnlocks, resultGrade, canPlaceAt, pathInfo, castSpiritSkill, bondsForTowers, supportBonusesFor };
