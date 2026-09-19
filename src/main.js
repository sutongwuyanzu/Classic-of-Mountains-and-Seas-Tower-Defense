const Core = window.ShanHaiCore;
if (!Core) throw new Error('ShanHaiCore shared rules failed to load');
const RARITIES = Core.RARITIES;
const SAVE_KEY = 'shan-hai-rebuild-v2';
const LEGACY_SAVE_KEY = 'shan-hai-rebuild-v1';
const PROGRESSION_VERSION = 3;
const SCORING_VERSION = 2;
const BUILD_ID = document.querySelector('meta[name="shan-hai-build"]')?.content || 'unknown';
const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
const groundShadowTexture = document.createElement('canvas');
groundShadowTexture.width = 160; groundShadowTexture.height = 48;
const groundShadowCtx = groundShadowTexture.getContext('2d');
const groundShadowGradient = groundShadowCtx.createRadialGradient(80, 24, 2, 80, 24, 76);
groundShadowGradient.addColorStop(0, 'rgba(20,13,9,.72)'); groundShadowGradient.addColorStop(.58, 'rgba(24,16,11,.38)'); groundShadowGradient.addColorStop(1, 'rgba(0,0,0,0)');
groundShadowCtx.fillStyle = groundShadowGradient; groundShadowCtx.fillRect(0, 0, 160, 48);
const vignetteTexture = document.createElement('canvas');
vignetteTexture.width = canvas.width; vignetteTexture.height = canvas.height;
const vignetteCtx = vignetteTexture.getContext('2d');
const vignetteGradient = vignetteCtx.createRadialGradient(canvas.width * .5, canvas.height * .46, canvas.width * .18, canvas.width * .5, canvas.height * .48, canvas.width * .7);
vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)'); vignetteGradient.addColorStop(.72, 'rgba(15,12,10,.03)'); vignetteGradient.addColorStop(1, 'rgba(12,10,9,.30)'); vignetteCtx.fillStyle = vignetteGradient; vignetteCtx.fillRect(0, 0, canvas.width, canvas.height);
const stageBackgroundSources = [
  './assets/background-cave.png',
  './assets/background-grass.png',
  './assets/background-sea.png',
  './assets/background-volcano.png',
  './assets/background-heaven.png',
];
const stageBackgrounds = new Array(stageBackgroundSources.length);
function stageBackgroundFor(stage) {
  if (!stageBackgrounds[stage]) {
    const image = document.createElement('img');
    image.decoding = 'async';
    image.src = stageBackgroundSources[stage];
    stageBackgrounds[stage] = image;
  }
  return stageBackgrounds[stage];
}
const stageBackdrop = document.createElement('canvas');
const stageBackdropCtx = stageBackdrop.getContext('2d');
let stageBackdropKey = '';
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
  bifang: './assets/sprites/runtime/bifang.png',
  fuzhu: './assets/sprites/runtime/fuzhu.png',
  jiuwei: './assets/sprites/runtime/jiuwei.png',
  tiangou: './assets/sprites/runtime/tiangou.png',
  xuangui: './assets/sprites/runtime/xuangui.png',
  shengsheng: './assets/sprites/runtime/shengsheng.png',
  kaiming: './assets/sprites/runtime/kaiming.png',
  bo: './assets/sprites/runtime/bo.png',
  zheng: './assets/sprites/runtime/zheng.png',
  qiuniu: './assets/sprites/runtime/qiuniu.png',
  yazi: './assets/sprites/runtime/yazi.png',
  chaofeng: './assets/sprites/runtime/chaofeng.png',
  pulao: './assets/sprites/runtime/pulao.png',
  suanni: './assets/sprites/runtime/suanni.png',
  bixi: './assets/sprites/runtime/bixi.png',
  bian: './assets/sprites/runtime/bian.png',
  fuxi_long: './assets/sprites/runtime/fuxi_long.png',
  chiwen: './assets/sprites/runtime/chiwen.png',
  dayu: './assets/sprites/runtime/dayu.png',
  gonggong: './assets/sprites/runtime/gonggong.png',
  qinglong: './assets/sprites/runtime/qinglong.png',
  baihu: './assets/sprites/runtime/baihu.png',
  zhuque: './assets/sprites/runtime/zhuque.png',
  xuanwu: './assets/sprites/runtime/xuanwu.png',
  huangdi: './assets/sprites/runtime/huangdi.png',
  fuxi: './assets/sprites/runtime/fuxi.png',
  nuwa: './assets/sprites/runtime/nuwa.png',
  xingxing: './assets/sprites/runtime/xingxing.png',
  fei: './assets/sprites/runtime/fei.png',
  bashe: './assets/sprites/runtime/bashe.png',
  huali: './assets/sprites/runtime/huali.png',
  wangliang: './assets/sprites/runtime/wangliang.png',
  zhuyan: './assets/sprites/runtime/zhuyan.png',
  shanxiao: './assets/sprites/runtime/shanxiao.png',
  taotie: './assets/sprites/runtime/taotie.png',
  baize: './assets/sprites/runtime/baize.png',
};
const combatSprites = Object.fromEntries(Object.keys(combatSpriteSources).map((id) => [id, null]));
function combatSpriteFor(id) {
  if (!combatSpriteSources[id]) return null;
  if (!combatSprites[id]) {
    const image = document.createElement('img');
    image.decoding = 'async';
    image.src = combatSpriteSources[id];
    combatSprites[id] = image;
  }
  return combatSprites[id];
}

function drawStageBackdrop() {
  const stageBackground = stageBackgroundFor(state.stage);
  const key = [state.stage, stageBackground?.complete ? stageBackground.naturalWidth : 0, canvas.width, canvas.height].join(':');
  if (key !== stageBackdropKey) {
    stageBackdropKey = key;
    stageBackdrop.width = canvas.width; stageBackdrop.height = canvas.height;
    stageBackdropCtx.clearRect(0, 0, canvas.width, canvas.height);
    stageBackdropCtx.fillStyle = '#152124'; stageBackdropCtx.fillRect(0, 0, canvas.width, canvas.height);
    if (stageBackground?.complete && stageBackground.naturalWidth) {
      stageBackdropCtx.drawImage(stageBackground, 0, 0, stageBackground.naturalWidth, stageBackground.naturalHeight, 0, 0, canvas.width, canvas.height);
      stageBackdropCtx.fillStyle = state.stage === 3 ? 'rgba(36, 10, 8, .08)' : 'rgba(23, 36, 33, .08)'; stageBackdropCtx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
  ctx.drawImage(stageBackdrop, 0, 0);
}
const fxSprites = Object.fromEntries(['summon-ritual', 'hit-spark', 'spawn-fissure', 'seal-monument'].map((id) => {
  const image = document.createElement('img');
  image.src = `./assets/fx/${id}.png`;
  return [id, image];
}));
const attackSprites = Object.fromEntries(['ember', 'wisp', 'claw', 'quake', 'splash'].map((id) => {
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
const MAX_UNIT_LEVEL = 9;
const DUPLICATE_COMPENSATION = 12;
const DISMISS_COMPENSATION = 6;
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
const BASIC_ATTACK_ARMOR_BREAK = 12;
const BASIC_ATTACK_ARMOR_BREAK_DURATION = 3;
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
  chiwen: { dmg: 23, interval: .94, range: 190, projSpeed: 430, proj: 'splash', slow: .2, slowDur: 3, dmgType: 'mag', counters: ['insight'], color: '#72b3b1', kindText: '吞潮', cost: 32 },
  dayu: { dmg: 40, interval: 1.7, range: 184, projSpeed: 300, proj: 'splash', splash: 58, slow: .24, slowDur: 2, dmgType: 'true', counters: ['breakShield', 'splash'], color: '#7eb0c3', kindText: '真伤 · 治水', cost: 38 },
  gonggong: { dmg: 35, interval: 1.42, range: 180, projSpeed: 350, proj: 'splash', chain: 2, slow: .2, slowDur: 2.5, dmgType: 'true', counters: ['purge', 'insight'], color: '#5595a6', kindText: '潮汐 · 真伤', cost: 40 },
  qinglong: { dmg: 50, interval: 1.55, range: 206, projSpeed: 440, proj: 'wisp', chain: 3, slow: .25, slowDur: 3, dmgType: 'mag', counters: ['insight', 'splash'], color: '#5eb7ad', kindText: '四象 · 连锁', cost: 48 },
  baihu: { dmg: 66, interval: 1.9, range: 160, projSpeed: 470, proj: 'claw', breakAt: 2, dmgType: 'phy', counters: ['execute', 'breakShield'], color: '#d6c6b5', kindText: '四象 · 破甲', cost: 50 },
  zhuque: { dmg: 45, interval: 1.22, range: 194, projSpeed: 390, proj: 'ember', splash: 52, burn: true, burnDps: .25, dmgType: 'mag', counters: ['purge', 'splash'], color: '#ea7257', kindText: '四象 · 炎域', cost: 50 },
  xuanwu: { dmg: 32, interval: .9, range: 188, projSpeed: 420, proj: 'splash', slow: .36, slowDur: 3.4, dmgType: 'true', counters: ['breakShield', 'insight'], color: '#7594ae', kindText: '四象 · 玄水', cost: 52 },
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

const TRIAL_RULES = Object.freeze([
  { id: 'low-rarity', name: '草木守印', short: '仅 N/R', copy: '普通召灵仅会出现 N、R 妖灵；高级召灵不可用。', rarityCap: 1 },
  { id: 'perfect-seal', name: '十全封印', short: '无漏怪', copy: '任意敌军冲过封印，立刻判定试炼失败。', noLeak: true },
  { id: 'dual-coverage', name: '双路均衡', short: '双路覆盖', copy: '从第 3 波起，上下两路都必须有妖灵射程覆盖。', requiresDualCoverage: true },
]);

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

const refs = Object.fromEntries(['selectScreen', 'gameScreen', 'resultScreen', 'stageList', 'difficultySelect', 'rosterList', 'bondPreviewList', 'selectedStageLabel', 'codexCount', 'cultivationSummary', 'startGame', 'endlessStart', 'trialStart', 'resumeGame', 'medalsOpen', 'medalCount', 'backToSelect', 'pauseGame', 'speedGame', 'soundToggle', 'audioSettings', 'audioDialog', 'audioClose', 'audioEnabled', 'musicVolume', 'musicVolumeValue', 'sfxVolume', 'sfxVolumeValue', 'gameTerrain', 'gameDifficulty', 'gameLevel', 'requiredBeastLabel', 'hpLabel', 'hpMeter', 'waveLabel', 'waveTrack', 'combatLog', 'arenaHint', 'nextWave', 'essenceLabel', 'killLabel', 'bestScoreLabel', 'populationLabel', 'backpackLabel', 'selectedUnitLabel', 'gameRoster', 'gameBonds', 'summonBeast', 'summonBeastFive', 'advancedSummon', 'advancedSummonFive', 'openBackpack', 'openBonds', 'autoDeploy', 'recallAll', 'fortuneSign', 'spiritSkill', 'spiritSkillLabel', 'teamSkill', 'skillLabel', 'replayGame', 'returnSelect', 'resultTitle', 'resultStage', 'resultScoreStamp', 'resultScoreTotal', 'resultBonds', 'resultHp', 'resultEnergy', 'resultUr', 'resultRequired', 'resultKills', 'resultXp', 'resultCombo', 'resultRecap', 'resultCopy', 'codexOpen', 'codexClose', 'codexDialog', 'codexDialogList', 'summonDialog', 'summonOffers', 'summonTitle', 'summonSubtitle', 'summonSwap', 'summonSwapNote', 'summonClose', 'advancedDialog', 'advancedResults', 'advancedTitle', 'advancedSubtitle', 'advancedClaim', 'advancedClose', 'backpackDialog', 'backpackList', 'backpackClose', 'openBackpack', 'openFusion', 'fusionDialog', 'fusionList', 'fusionSelection', 'fuseBeasts', 'fusionClose', 'fortuneDialog', 'fortuneResult', 'fortuneClose', 'bondsDialog', 'bondDialogList', 'bondsClose', 'evolutionDialog', 'evolutionChoices', 'medalsDialog', 'medalsList', 'medalsClose', 'pauseDialog', 'pauseResume', 'pauseRetry', 'pauseExit'].map((key) => [key, document.querySelector(`#${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`)]));

refs.recallSelected = document.querySelector('#recall-selected');
refs.fullscreenToggle = document.querySelector('#fullscreen-toggle');
refs.selectedUnitMeta = document.querySelector('#selected-unit-meta');
refs.resultCombatScore = document.querySelector('#result-combat-score');
refs.resultVictoryScore = document.querySelector('#result-victory-score');
const state = {
  screen: 'select', mode: 'standard', stage: 0, difficulty: 'normal', selectedBeast: 'bifang', selectedUnitId: null, backpack: [], nextUnitId: 1, maxPopulation: 18, unlocked: new Set(BASE_UNLOCK_IDS), completions: new Set(), beastGrowth: {}, medals: new Set(), xp: 0, tier: 0, soundEnabled: true, musicVolume: .28, sfxVolume: 1,
  paused: false, backgroundPaused: false, resumeAfterDialog: false, tutorialMode: false, draggingUnitId: null, draggingTowerIndex: -1, draggingTowerOffset: { x: 0, y: 0 }, selectedTowerUid: null, selectedEnemy: null, speed: 1, lastTime: 0, wave: 0, waveTimer: 0, spawning: null, waveCooldown: 0, phase: 'prep', prepTimer: 15, battleTime: 0,
  energy: 0, maxHp: 10, hp: 10, kills: 0, score: 0, bestScores: {}, combo: 0, bestCombo: 0, waveStarted: false,
  towers: [], enemies: [], projectiles: [], particles: [], hitBursts: [], damageTexts: [], visualEffects: [], defeated: [], logs: [], mouse: { x: 480, y: 270, inside: false },
  screenShake: 0, screenFlash: 0,
  skillCooldowns: {}, skillBond: null, pendingTargetSkillUid: null, finishTimer: 0, tutorialStep: -1, fusionSelection: [], signEffects: [], summonOffers: [], summonMode: 'normal', summonSwapCount: 0, summonAttempts: 0, requiredOffered: false, advancedBatch: [], advancedMode: 'normal', requiredBeastId: null, fortuneSpinning: false, fortuneTimers: [], runId: 0, finalScoreBreakdown: null, lastSign: null, resultGrowthXp: 0, bossEscaped: false, pendingResume: null, runFielded: new Set(), runBeastKills: {}, runEvolutions: {}, runStats: { damageByBeast: {}, shieldByBeast: {}, breachesByRoute: {}, sealLost: 0, waves: [] }, trialRuleId: null, trialFailedReason: '', runSeed: 1, randomStates: { draw: 1, route: 1, enemy: 1 }, waveStartedAt: 0,
};
let desktopSaveQueue = Promise.resolve(true);
let activeCombatBondTotals = null;

const arena = { left: 38, right: 922, top: 46, bot: 510, roadW: 66, sealX: 74, sealY: 108, spawnR: 30, wardR: 34, plate: 24 };
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
const lowPowerEffects = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || navigator.userAgentData?.mobile === true || /Android|iPhone|iPad/i.test(navigator.userAgent);
const effectQuality = lowPowerEffects ? .68 : 1;
const EFFECT_LIMITS = { visual: Math.round(120 * effectQuality), particles: Math.round(280 * effectQuality), bursts: Math.round(72 * effectQuality), damage: Math.round(90 * effectQuality), defeated: 24 };
const renderQueue = [];
const renderDepth = { defeated: 0, tower: 1, enemy: 2, projectile: 3, effect: 4 };
const minBeastSpacing = arena.plate * 4.5;
const depthScaleAt = (y) => .91 + y / canvas.height * .13;
const towerVisualSize = (tower) => 100 + beastDef(tower.id).rarity * 5 + Math.min(12, (tower.level - 1) * 2.5);
const enemyVisualSize = (enemy) => enemy.radius * (enemy.role !== 'normal' || enemy.def.boss ? 6.9 : 5.8);

function effectiveTowerRange(tower, bondTotals = bondsForTowers().totals, support = supportBonusesFor(tower), evolution = evolutionBonusesFor(tower.id)) {
  const def = beastDef(tower.id); const growth = growthFor(tower.id);
  return def.range * growth.range * (1 + evolution.range) * (1 + bondTotals.range + support.range);
}

function previewRangeFor(unit, x = null, y = null) {
  const previewTower = { ...unit, x, y };
  const bonds = bondsForTowers([...state.towers, previewTower]).totals;
  const support = Number.isFinite(x) && Number.isFinite(y) ? supportBonusesFor(previewTower) : { power: 0, haste: 0, range: 0, cdr: 0, manaRegen: 0 };
  return effectiveTowerRange(previewTower, bonds, support, evolutionBonusesFor(unit.id));
}

function enemyThreatLabel(type, role = 'normal') {
  const def = ENEMIES[type]; const tags = [];
  if (def.shield) tags.push('护盾');
  if (def.immuneMag && state.difficulty !== 'easy') tags.push('法免');
  if (def.immunePhy || (state.difficulty === 'hard' && type === 'bashe')) tags.push('物免');
  if (def.stealth) tags.push('隐身');
  if (def.skill === 'heal') tags.push('治疗');
  if (role !== 'normal' || def.boss) tags.push('首领');
  return `${def.name}${tags.length ? `（${tags.join('·')}）` : ''}`;
}

function waveThreatText(groups) {
  return groups.map(([type, count, gap, delay, hpMul, role = 'normal']) => `${enemyThreatLabel(type, role)}×${Math.max(1, Math.round(count * currentDifficulty().count))}`).join('、');
}

function routeLabel(routeIndex, routeCount = pathInfo().length) {
  if (routeCount < 2) return '主路';
  return ['上路', '下路'][routeIndex] || `第${routeIndex + 1}路`;
}

function waveRouteThreatText(groups, routeOffset = null) {
  const routeCount = pathInfo().length;
  if (routeCount < 2) return waveThreatText(groups);
  const offset = routeOffset == null ? Math.floor(peekGameRandom('route') * routeCount) : routeOffset;
  const lanes = Array.from({ length: routeCount }, () => []);
  groups.forEach(([type, count, gap, delay, hpMul, role = 'normal'], groupIndex) => {
    const actualCount = Math.max(1, Math.round(count * currentDifficulty().count));
    for (let spawnIndex = 0; spawnIndex < actualCount; spawnIndex += 1) {
      const lane = lanes[(groupIndex + offset + spawnIndex) % routeCount];
      const entry = lane.find((item) => item.type === type && item.role === role);
      if (entry) entry.count += 1;
      else lane.push({ type, role, count: 1 });
    }
  });
  return lanes.map((lane, index) => `${routeLabel(index, routeCount)} ${lane.map((item) => `${enemyThreatLabel(item.type, item.role)}×${item.count}`).join('、')}`).join('；');
}

function enemySpecialTrait(enemy) {
  if (enemy.def.skill === 'heal') return '周期治疗';
  if (enemy.def.skill === 'revive') return enemy.revived ? '已复活' : '濒死复活';
  if (enemy.def.skill === 'split') return '击杀分裂';
  return '';
}

function selectedEnemyText(enemy) {
  const status = [
    enemy.shield > 0 ? `护盾 ${Math.ceil(enemy.shield)}` : '',
    enemy.immuneMag ? '法免→物/净' : '',
    enemy.immunePhy ? '物免→法/真' : '',
    enemy.stealthTimer > 0 ? `隐身 ${enemy.stealthTimer.toFixed(1)}s` : '',
    enemy.armor > 0 ? `护甲 ${Math.round(enemy.armor)}` : '',
    enemySpecialTrait(enemy),
  ].filter(Boolean).join(' · ');
  return `${enemy.def.name} · HP ${Math.ceil(Math.max(0, enemy.hp))}/${Math.ceil(enemy.maxHp)}${status ? ` · ${status}` : ''} · 破封 ${enemy.sealDamage}`;
}

function selectedEnemyMeta(enemy) {
  const status = [
    enemy.shield > 0 ? `护盾 ${Math.ceil(enemy.shield)}` : '',
    enemy.immuneMag ? '法免→物/净' : '',
    enemy.immunePhy ? '物免→法/真' : '',
    enemy.stealthTimer > 0 ? `隐身 ${enemy.stealthTimer.toFixed(1)}s` : '',
    enemy.armor > 0 ? `护甲 ${Math.round(enemy.armor)}` : '',
    enemy.armorBreak > 0 ? `破甲 -${Math.round(enemy.armorBreak)}` : '',
    enemySpecialTrait(enemy),
  ].filter(Boolean);
  return `${status.length ? status.join(' · ') : '无特殊防御'} · 破封 ${enemy.sealDamage}`;
}

function towerContainsPoint(tower, point) {
  const size = towerVisualSize(tower); const depth = depthScaleAt(tower.y);
  return Math.abs(point.x - tower.x) <= size * depth * .45 && point.y >= tower.y - size * depth + 8 && point.y <= tower.y + 28;
}

function enemyContainsPoint(enemy, point) {
  const size = enemyVisualSize(enemy); const depth = .88 + enemy.y / canvas.height * .17;
  return Math.abs(point.x - enemy.x) <= size * depth * .45 && point.y >= enemy.y - size * depth + 6 && point.y <= enemy.y + 22;
}
const currentLevel = () => LEVELS[state.stage];
const currentDifficulty = () => DIFFICULTIES[state.difficulty];
const isEndless = () => state.mode === 'endless';
const isTrial = () => state.mode === 'trial';
const totalWaves = () => isEndless() ? Math.max(15, state.wave + 5) : WAVES.length;
const isBossWave = (waveIndex) => [4, 9, 14].includes(waveIndex % WAVES.length);
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
let audioSfxBus = null;
let audioMusicBus = null;
let audioNoiseBuffer = null;
let audioAmbient = null;
const soundTimestamps = {};

function updateAudioMix() {
  if (!audioContext || !audioMaster || !audioSfxBus || !audioMusicBus) return;
  const at = audioContext.currentTime;
  audioMaster.gain.setTargetAtTime(state.soundEnabled ? .42 : .0001, at, .03);
  audioSfxBus.gain.setTargetAtTime(state.sfxVolume, at, .03);
  audioMusicBus.gain.setTargetAtTime(state.musicVolume * .16, at, .08);
}

function updateAmbientState() {
  if (!audioContext || !audioAmbient) return;
  const active = state.soundEnabled && state.screen === 'game' && !state.paused && !state.backgroundPaused;
  audioAmbient.gain.gain.setTargetAtTime(active ? 1 : .0001, audioContext.currentTime, active ? .38 : .12);
}

function stopAmbient() {
  if (!audioContext || !audioAmbient) return;
  const { gain, nodes } = audioAmbient;
  const at = audioContext.currentTime;
  gain.gain.setTargetAtTime(.0001, at, .08);
  nodes.forEach((node) => node.stop(at + .42));
  audioAmbient = null;
}

function startAmbient() {
  if (!state.soundEnabled || !ensureAudio()) return;
  if (audioAmbient?.stage === state.stage) { updateAmbientState(); return; }
  stopAmbient();
  const root = [73.42, 82.41, 98, 65.41, 110][state.stage] || 73.42;
  const gain = audioContext.createGain();
  gain.gain.value = .0001;
  gain.connect(audioMusicBus);
  const nodes = [[root, 'sine', .25], [root * 1.5, 'triangle', .045]].map(([frequency, type, level]) => {
    const oscillator = audioContext.createOscillator();
    const voiceGain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    voiceGain.gain.value = level;
    oscillator.connect(voiceGain).connect(gain);
    oscillator.start();
    return oscillator;
  });
  audioAmbient = { stage: state.stage, gain, nodes };
  updateAmbientState();
}

function renderAudioControls() {
  const music = Math.round(state.musicVolume * 100);
  const sfx = Math.round(state.sfxVolume * 100);
  refs.soundToggle.textContent = state.soundEnabled ? '♪' : '×';
  refs.soundToggle.title = state.soundEnabled ? '静音' : '恢复音频';
  refs.soundToggle.setAttribute('aria-label', refs.soundToggle.title);
  refs.soundToggle.setAttribute('aria-pressed', String(state.soundEnabled));
  refs.audioEnabled.checked = state.soundEnabled;
  refs.audioEnabled.nextElementSibling.textContent = state.soundEnabled ? '开启' : '静音';
  refs.musicVolume.value = music;
  refs.musicVolumeValue.textContent = `${music}%`;
  refs.sfxVolume.value = sfx;
  refs.sfxVolumeValue.textContent = `${sfx}%`;
}

function setSoundEnabled(enabled, audibleConfirmation = false) {
  state.soundEnabled = enabled;
  if (enabled) {
    ensureAudio();
    startAmbient();
  }
  updateAudioMix();
  updateAmbientState();
  renderAudioControls();
  saveProgress();
  if (enabled && audibleConfirmation) playSound('deploy');
}

function ensureAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return false;
  if (!audioContext) {
    audioContext = new AudioContext();
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -20; compressor.knee.value = 16; compressor.ratio.value = 7; compressor.attack.value = .004; compressor.release.value = .22;
    audioMaster = audioContext.createGain();
    audioSfxBus = audioContext.createGain();
    audioMusicBus = audioContext.createGain();
    audioSfxBus.connect(audioMaster);
    audioMusicBus.connect(audioMaster);
    audioMaster.connect(compressor).connect(audioContext.destination);
    audioNoiseBuffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * .5), audioContext.sampleRate);
    const noise = audioNoiseBuffer.getChannelData(0);
    for (let i = 0; i < noise.length; i += 1) noise[i] = Math.random() * 2 - 1;
  }
  updateAudioMix();
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  return true;
}

function soundTone(at, from, to, duration, gainValue = .08, type = 'sine', pan = 0) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const panner = audioContext.createStereoPanner?.();
  oscillator.type = type; oscillator.frequency.setValueAtTime(Math.max(20, from), at); oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, to), at + duration);
  gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(gainValue, at + Math.min(.018, duration * .25)); gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
  if (panner) { panner.pan.value = pan; oscillator.connect(gain).connect(panner).connect(audioSfxBus); } else oscillator.connect(gain).connect(audioSfxBus);
  oscillator.start(at); oscillator.stop(at + duration + .03);
}

function soundNoise(at, duration, gainValue, frequency = 900) {
  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  source.buffer = audioNoiseBuffer; filter.type = 'lowpass'; filter.frequency.setValueAtTime(frequency, at); filter.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * .25), at + duration);
  gain.gain.setValueAtTime(gainValue, at); gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
  source.connect(filter).connect(gain).connect(audioSfxBus); source.start(at); source.stop(at + duration);
}

function playSound(kind) {
  if (!state.soundEnabled || state.sfxVolume <= 0 || !ensureAudio()) return;
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
  if (!state.soundEnabled || state.sfxVolume <= 0 || !ensureAudio()) return;
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

function portraitMarkup(beast, fullArt = false) {
  const portraitX = beast.portraitIndex % 6;
  const portraitY = Math.floor(beast.portraitIndex / 6);
  const useFullArt = fullArt && hasCombatSprite(beast.id);
  const spriteStyle = useFullArt ? `--spirit-sprite:url('./assets/sprites/runtime/${beast.id}.png')` : '';
  return `<span class="portrait portrait-image ${useFullArt ? 'portrait-spirit' : ''}" style="--portrait-x:${portraitX};--portrait-y:${portraitY};${spriteStyle}"></span>`;
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
  return Math.min(...pathInfo(level).map((route) => distanceToRoute(x, y, route)));
}

function distanceToRoute(x, y, route) {
  let nearest = Infinity;
  for (let i = 0; i < route.points.length - 1; i += 1) {
    const a = { x: route.points[i][0], y: route.points[i][1] };
    const b = { x: route.points[i + 1][0], y: route.points[i + 1][1] };
    const vx = b.x - a.x; const vy = b.y - a.y;
    const t = clamp(((x - a.x) * vx + (y - a.y) * vy) / (vx * vx + vy * vy), 0, 1);
    nearest = Math.min(nearest, Math.hypot(x - (a.x + vx * t), y - (a.y + vy * t)));
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
    if (Math.hypot(state.towers[i].x - x, state.towers[i].y - y) < minBeastSpacing) return false;
  }
  return true;
}

function loadSave() {
  try {
    let desktopRaw = '';
    let localRaw = '';
    try { desktopRaw = window.steamShell?.loadSave?.() || ''; } catch {}
    try { localRaw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY) || ''; } catch {}
    const parseCandidate = (raw, source) => {
      try {
        const value = raw ? JSON.parse(raw) : null;
        if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
        return { value, source, savedAt: Number(value.savedAt) || 0 };
      } catch { return null; }
    };
    const candidates = [parseCandidate(desktopRaw, 'desktop'), parseCandidate(localRaw, 'local')].filter(Boolean);
    const saved = candidates.sort((a, b) => b.savedAt - a.savedAt || (a.source === 'desktop' ? -1 : 1))[0]?.value || {};
    state.xp = Number(saved.xp) || 0;
    state.bestScores = saved.scoringVersion === SCORING_VERSION && saved.bestScores && typeof saved.bestScores === 'object' && !Array.isArray(saved.bestScores) ? saved.bestScores : {};
    state.tier = cultivationTierFor(state.xp);
    state.difficulty = DIFFICULTIES[saved.difficulty] ? saved.difficulty : 'normal';
    state.completions = new Set(Array.isArray(saved.completions) ? saved.completions : []);
    state.medals = new Set(Array.isArray(saved.medals) ? saved.medals : []);
    state.beastGrowth = saved.beastGrowth && typeof saved.beastGrowth === 'object' ? saved.beastGrowth : {};
    state.soundEnabled = saved.soundEnabled !== false;
    state.musicVolume = clamp(typeof saved.musicVolume === 'number' ? saved.musicVolume : .28, 0, 1);
    state.sfxVolume = clamp(typeof saved.sfxVolume === 'number' ? saved.sfxVolume : 1, 0, 1);
    state.pendingResume = validWaveSnapshot(saved.waveSnapshot) ? saved.waveSnapshot : null;
    const migratedUnlocks = saved.progressionVersion === PROGRESSION_VERSION && Array.isArray(saved.unlocked) ? saved.unlocked : BASE_UNLOCK_IDS;
    state.unlocked = new Set([...migratedUnlocks, ...BASE_UNLOCK_IDS]);
    applyProgressUnlocks();
  } catch {
    state.unlocked = new Set(BASE_UNLOCK_IDS);
    state.completions = new Set();
    state.medals = new Set();
    state.beastGrowth = {};
    state.bestScores = {};
    state.pendingResume = null;
  }
}

function validWaveSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || !['standard', 'endless', 'trial'].includes(snapshot.mode) || !Number.isInteger(snapshot.stage) || snapshot.stage < 0 || snapshot.stage >= LEVELS.length || !DIFFICULTIES[snapshot.difficulty] || !Number.isInteger(snapshot.wave) || snapshot.wave < 1 || !Array.isArray(snapshot.towers) || !Array.isArray(snapshot.backpack)) return false;
  return snapshot.mode === 'endless' || snapshot.wave < WAVES.length;
}

function createWaveSnapshot() {
  if (state.screen !== 'game' || state.phase !== 'rest' || state.paused || state.fortuneSpinning) return null;
  return {
    mode: state.mode, stage: state.stage, difficulty: state.difficulty, wave: state.wave, energy: state.energy, hp: state.hp, kills: state.kills, score: state.score, combo: state.combo, bestCombo: state.bestCombo,
    towers: state.towers, backpack: state.backpack, nextUnitId: state.nextUnitId, maxPopulation: state.maxPopulation, requiredBeastId: state.requiredBeastId, skillCooldowns: state.skillCooldowns,
    runFielded: [...state.runFielded], runBeastKills: state.runBeastKills, runEvolutions: state.runEvolutions, runStats: state.runStats, trialRuleId: state.trialRuleId, runSeed: state.runSeed, randomStates: state.randomStates,
  };
}

async function saveProgress() {
  let payload;
  try {
    payload = JSON.stringify({ savedAt: Date.now(), progressionVersion: PROGRESSION_VERSION, scoringVersion: SCORING_VERSION, xp: state.xp, tier: state.tier, bestScores: state.bestScores, difficulty: state.difficulty, unlocked: [...state.unlocked], completions: [...state.completions], medals: [...state.medals], beastGrowth: state.beastGrowth, soundEnabled: state.soundEnabled, musicVolume: state.musicVolume, sfxVolume: state.sfxVolume, waveSnapshot: createWaveSnapshot() });
  } catch (error) {
    document.querySelector('#save-status').textContent = '存档暂未更新，请重试';
    return { local: false, desktop: false, message: error.message };
  }
  let local = true;
  let desktop = true;
  try { localStorage.setItem(SAVE_KEY, payload); } catch { local = false; }
  desktop = await queueDesktopSave(payload);
  const status = local && desktop ? '本地存档已更新' : local ? '浏览器存档已更新，桌面存档失败' : desktop ? '桌面存档已更新，浏览器存档失败' : '存档暂未更新，请重试';
  document.querySelector('#save-status').textContent = status;
  return { local, desktop, message: status };
}

function queueDesktopSave(payload) {
  const writeDesktop = window.steamShell?.writeSave;
  if (typeof writeDesktop !== 'function') return Promise.resolve(true);
  const write = async () => {
    try { return (await writeDesktop(payload))?.ok === true; } catch { return false; }
  };
  desktopSaveQueue = desktopSaveQueue.then(write, write);
  return desktopSaveQueue;
}

function showScreen(name) {
  state.screen = name;
  document.body.dataset.screen = name;
  refs.selectScreen.classList.toggle('is-hidden', name !== 'select');
  refs.gameScreen.classList.toggle('is-hidden', name !== 'game');
  refs.resultScreen.classList.toggle('is-hidden', name !== 'result');
  if (name !== 'game') stopAmbient(); else updateAmbientState();
}

function renderSelect() {
  stageBackgroundFor(state.stage);
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
  refs.endlessStart.hidden = false;
  refs.endlessStart.disabled = !endlessUnlocked();
  refs.endlessStart.title = endlessUnlocked() ? '进入持续增强的无尽封印' : '先完成任意标准关卡解锁';
  const previewTrialRule = trialRuleForSeed();
  refs.trialStart.hidden = false;
  refs.trialStart.querySelector('strong').textContent = previewTrialRule.short;
  refs.trialStart.title = `今日固定种子 ${trialSeed()}；试炼「${previewTrialRule.name}」：${previewTrialRule.copy}`;
  refs.resumeGame.hidden = !state.pendingResume;
  if (state.pendingResume) refs.resumeGame.textContent = `续守第 ${state.pendingResume.wave + 1} 波`;
}

function addLog(message) {
  state.logs.unshift(message); state.logs = state.logs.slice(0, 3);
  refs.combatLog.innerHTML = state.logs.map((item) => `<div>${item}</div>`).join('');
}

function trialSeed() {
  const now = new Date();
  return (Math.imul(now.getFullYear() * 372 + (now.getMonth() + 1) * 31 + now.getDate(), 2654435761) ^ (state.stage + 1) * 2246822519 ^ (DIFFICULTY_ORDER.indexOf(state.difficulty) + 1) * 3266489917) >>> 0;
}

function trialRuleForSeed(seed = trialSeed(), level = currentLevel()) {
  const candidates = level.spawnCount > 1 ? TRIAL_RULES : TRIAL_RULES.filter((rule) => !rule.requiresDualCoverage);
  return candidates[(seed >>> 0) % candidates.length];
}

function currentTrialRule() {
  if (!isTrial()) return null;
  return TRIAL_RULES.find((rule) => rule.id === state.trialRuleId) || trialRuleForSeed(state.runSeed || trialSeed());
}

function trialRarityCap() {
  return currentTrialRule()?.rarityCap ?? RARITIES.length - 1;
}

function summonWeights(mode) {
  const rule = Core.SUMMON_RULES[mode];
  return rule ? rule.weights.filter(([rarity]) => rarity <= trialRarityCap()) : [];
}

function resetRunRandom(seed) {
  state.runSeed = seed >>> 0 || 1;
  state.randomStates = {
    draw: (state.runSeed ^ 0x9e3779b9) >>> 0 || 1,
    route: (state.runSeed ^ 0x85ebca6b) >>> 0 || 1,
    enemy: (state.runSeed ^ 0xc2b2ae35) >>> 0 || 1,
  };
}

function nextRandomState(seed) { return (Math.imul(seed >>> 0 || 1, 1664525) + 1013904223) >>> 0; }

function peekGameRandom(stream = 'draw') {
  return nextRandomState(state.randomStates[stream]) / 0x100000000;
}

function gameRandom(stream = 'draw') {
  const next = nextRandomState(state.randomStates[stream]);
  state.randomStates[stream] = next;
  return next / 0x100000000;
}

function randomFromWeights(weights) {
  let roll = gameRandom('draw') * weights.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [candidate, weight] of weights) {
    roll -= weight;
    if (roll < 0) return candidate;
  }
  return weights[weights.length - 1][0];
}

function randomBeastAtRarity(rarity, excludedIds = new Set()) {
  const available = ROSTER.filter((beast) => state.unlocked.has(beast.id) && beast.rarity <= trialRarityCap() && !excludedIds.has(beast.id));
  let pool = available.filter((beast) => beast.rarity === rarity);
  if (!pool.length) {
    const availableRarities = [...new Set(available.map((beast) => beast.rarity))].sort((a, b) => Math.abs(a - rarity) - Math.abs(b - rarity));
    pool = available.filter((beast) => beast.rarity === availableRarities[0]);
  }
  return pool.length ? pool[Math.floor(gameRandom('draw') * pool.length)] : null;
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
  const available = ROSTER.filter((beast) => state.unlocked.has(beast.id) && beast.rarity <= trialRarityCap());
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

function counterEffectText(def) {
  const labels = { purge: '破法：可伤法免', execute: '斩杀：残血增伤', breakShield: '破盾：削盾 150%', splash: '溅射：范围伤害', insight: '洞察：可见隐身' };
  return (def?.counters || []).map((counter) => labels[counter] || counter).join(' · ') || '无特殊克制';
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
  if (state.selectedUnitId) { state.selectedTowerUid = null; state.selectedEnemy = null; state.pendingTargetSkillUid = null; }
  if (state.selectedUnitId && state.tutorialStep === 1) { state.tutorialStep = 2; refs.arenaHint.textContent = '已选中妖灵：点击道路两侧的空地，避开道路和封印周围的禁区。'; }
  renderGameRoster();
  updateHUD();
}

function receiveSummonedUnit(unit) {
  const target = state.towers.concat(state.backpack).find((item) => item.id === unit.id);
  if (!target) { state.backpack.push(unit); return { unit, promotions: 0 }; }
  if (target.level >= MAX_UNIT_LEVEL) {
    state.energy += DUPLICATE_COMPENSATION;
    return { unit: target, promotions: 0, duplicate: true, compensation: DUPLICATE_COMPENSATION };
  }
  target.level = Math.min(MAX_UNIT_LEVEL, target.level + 1);
  return { unit: target, promotions: 1 };
}

function showGameDialog(dialog) {
  if (!state.paused) { state.paused = true; state.resumeAfterDialog = true; }
  dialog.showModal();
  updateAmbientState();
  updateHUD();
}

function closeGameDialog(dialog) {
  dialog.close();
  if (state.resumeAfterDialog) { state.paused = false; state.resumeAfterDialog = false; }
  updateAmbientState();
  updateHUD();
}

function clearFortuneTimers() {
  state.fortuneTimers.forEach((timer) => window.clearTimeout(timer));
  state.fortuneTimers = [];
  state.fortuneSpinning = false;
}

function closeFortuneDialog() {
  clearFortuneTimers();
  if (refs.fortuneDialog.open) refs.fortuneDialog.close();
  if (state.resumeAfterDialog) { state.paused = false; state.resumeAfterDialog = false; }
  updateHUD();
}

function openPauseMenu() {
  if (state.screen !== 'game') return;
  if (state.paused) {
    if (state.backgroundPaused) resumePauseMenu();
    return;
  }
  state.paused = true;
  state.backgroundPaused = false;
  refs.pauseDialog.showModal();
  updateAmbientState();
  updateHUD();
}

function resumePauseMenu() {
  if (refs.pauseDialog.open) refs.pauseDialog.close();
  state.paused = false;
  state.backgroundPaused = false;
  updateAmbientState();
  updateHUD();
}

function unitCard(unit, attributes = '') {
  const beast = beastDef(unit.id);
  return `<button class="game-card rarity-${RARITIES[beast.rarity]} ${attributes}" data-unit-id="${unit.uid}" type="button">${portraitMarkup(beast)}<span><strong>${beast.name}</strong><small>${RARITIES[beast.rarity]} · Lv.${unit.level} · 人口 ${populationCostFor(unit)} · ${activeSkillFor(unit.id).name}</small></span><em>${RARITIES[beast.rarity]}</em></button>`;
}

function renderSummonOffers() {
  const advanced = state.summonMode === 'advanced';
  const rule = Core.SUMMON_RULES[state.summonMode];
  const weights = summonWeights(state.summonMode);
  refs.summonTitle.textContent = `${advanced ? '高级三选一' : '普通二选一'} · 选中即入卷`;
  refs.summonSubtitle.textContent = `固定概率 ${summonOddsText(weights)}；候选不重复。天命妖灵属于当前召灵池时，前三次内必定出现。`;
  refs.summonOffers.classList.toggle('is-triple', advanced);
  refs.summonOffers.innerHTML = state.summonOffers.map((beast, index) => {
    const data = beastDef(beast.id);
    const opportunity = bondOpportunity(beast.id);
    const profile = Core.describeBeast(beast, data, activeSkillFor(beast.id), BOND_DEFS, new Set(allOwnedUnits().map((unit) => unit.id)));
    return `<button class="summon-offer rarity-${RARITIES[beast.rarity]}" data-offer-index="${index}" type="button">${portraitMarkup(beast, true)}<span><em>${RARITIES[beast.rarity]}</em><strong>${beast.name}</strong><small>人口 ${populationCostFor(beast.id)} · 主动「${activeSkillFor(beast.id).name}」</small><span class="summon-profile"><i>${profile.damageType}</i><i>${profile.output}伤害</i><i>${profile.control}</i><i>${profile.growth}</i><i>羁绊潜力${profile.bondGrade}</i></span><small class="summon-growth">${counterEffectText(data)} · ${profile.growthText}</small>${opportunity ? `<small class="summon-bond-hint">可组成「${opportunity.name}」 · ${bondEffectText(opportunity)}</small>` : ''}</span><b>选择此卡</b></button>`;
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
  if (!summonWeights(state.summonMode).some(([rarity]) => rarity === required.rarity)) return choices;
  if (state.summonAttempts < 3) return choices;
  const guaranteed = [required, ...choices.filter((beast) => beast.id !== required.id)].slice(0, choices.length);
  state.requiredOffered = true;
  return guaranteed;
}

function swapSummonOffers() {
  if (!state.summonOffers.length || state.summonSwapCount >= 2) return;
  const rule = Core.SUMMON_RULES[state.summonMode];
  const weights = summonWeights(state.summonMode);
  if (!weights.length) { addLog(`${currentTrialRule()?.name || '当前规则'}中不可置换该召灵池。`); return; }
  const cost = rule.swaps[state.summonSwapCount];
  if (state.energy < cost) { addLog(`置换需要 ${cost} 灵蕴。`); return; }
  state.energy -= cost;
  state.summonSwapCount += 1;
  state.summonOffers = ensureRequiredOffer(randomSummonChoices(weights, rule.choices));
  if (state.summonOffers.some((beast) => beast.id === state.requiredBeastId)) state.requiredOffered = true;
  playSound('summon');
  renderSummonOffers();
  updateHUD();
}

function summonSingle(mode) {
  if (state.screen !== 'game') return;
  if (state.paused) { addLog('暂停中，继续战斗后才能召灵。'); return; }
  if (!state.summonOffers.length) {
    const weights = summonWeights(mode);
    if (!weights.length) { addLog(`${currentTrialRule()?.name || '当前规则'}中禁用高级召灵。`); return; }
    const cost = mode === 'advanced' ? ADVANCED_SUMMON_COST : SUMMON_COST;
    if (state.energy < cost) { addLog(`灵蕴不足，需要 ${cost} 点进行${mode === 'advanced' ? '高级' : '普通'}召灵。`); return; }
    if (state.backpack.length >= MAX_BACKPACK) { addLog('背包已满，请先部署、合成或遣返妖灵。'); return; }
    state.energy -= cost;
    state.summonMode = mode;
    const rule = Core.SUMMON_RULES[mode];
    state.summonAttempts += 1;
    state.summonSwapCount = 0;
    state.summonOffers = ensureRequiredOffer(randomSummonChoices(weights, rule.choices));
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
  const tutorialSummon = state.tutorialStep === 0;
  const result = receiveSummonedUnit(createUnit(beast));
  state.unlocked.add(beast.id);
  state.selectedUnitId = tutorialSummon ? null : state.backpack.some((unit) => unit.uid === result.unit.uid) ? result.unit.uid : null;
  state.summonOffers = [];
  state.summonSwapCount = 0;
  closeGameDialog(refs.summonDialog);
  playSound('summon');
  if (tutorialSummon && !result.promotions) { state.tutorialStep = 1; refs.arenaHint.textContent = '召灵完成：点击下方妖灵卡，先选中一只要上场的妖灵。'; }
  addLog(result.duplicate ? `${beast.name}已满 Lv.${MAX_UNIT_LEVEL}，重复召灵返还 ${result.compensation} 灵蕴。` : result.promotions ? `${beast.name}同种同阶合成，升至 Lv.${result.unit.level}。` : `${beast.name}已入阵，拖动卡牌到路边，或直接点击战场布阵。`);
  renderGameRoster();
  updateHUD();
}

function renderAdvancedResults() {
  const advanced = state.advancedMode === 'advanced';
  const rule = Core.SUMMON_RULES[state.advancedMode];
  const weights = summonWeights(state.advancedMode);
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
  const weights = summonWeights(state.advancedMode);
  if (!weights.length) return;
  const cost = rule.swaps[state.summonSwapCount];
  if (state.energy < cost) return;
  state.energy -= cost;
  state.summonSwapCount += 1;
  const beast = randomSummon(weights);
  if (beast) state.advancedBatch[index] = createUnit(beast);
  renderAdvancedResults();
  updateHUD();
}

function summonFive(mode) {
  if (state.screen !== 'game' || state.paused) return;
  if (state.advancedBatch.length) { renderAdvancedResults(); showGameDialog(refs.advancedDialog); return; }
  const weights = summonWeights(mode);
  if (!weights.length) { addLog(`${currentTrialRule()?.name || '当前规则'}中禁用高级召灵。`); return; }
  const cost = mode === 'advanced' ? ADVANCED_FIVE_COST : SUMMON_FIVE_COST;
  if (state.energy < cost) { addLog(`灵蕴不足，需要 ${cost} 点进行${mode === 'advanced' ? '高级' : '普通'}五连。`); return; }
  if (state.backpack.length + 5 > MAX_BACKPACK) { addLog('背包至少需要留出 5 个位置，才能进行五连召灵。'); return; }
  state.energy -= cost;
  state.advancedMode = mode;
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
  const roll = gameRandom('draw');
  if (roll < .15) {
    const nextRarity = Math.min(trialRarityCap(), 4, rarity + 1);
    return { rarity: nextRarity, label: nextRarity > rarity ? '上跃' : '封阶' };
  }
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
  addLog(`随机融合${outcome.label}：${received.duplicate ? `满级重复返还 ${received.compensation} 灵蕴` : received.promotions ? `${beastDef(result.id).name}同卡升级` : `获得 ${beastDef(result.id).name}`}（${RARITIES[outcome.rarity]}）。`);
  return outcome;
}

function claimAdvancedBatch() {
  if (!state.advancedBatch.length || state.backpack.length + state.advancedBatch.length > MAX_BACKPACK) return;
  let promotions = 0;
  let duplicateCompensation = 0;
  state.advancedBatch.forEach((unit) => {
    const result = receiveSummonedUnit(unit);
    promotions += result.promotions;
    duplicateCompensation += result.compensation || 0;
    state.unlocked.add(unit.id);
  });
  state.selectedUnitId = state.backpack[0]?.uid || null;
  closeGameDialog(refs.advancedDialog);
  playSound('summon');
  const compensationCopy = duplicateCompensation ? `满级重复返还 ${duplicateCompensation} 灵蕴，` : '';
  addLog(`${state.advancedMode === 'advanced' ? '高级' : '普通'}五连入卷：${promotions ? `同种同阶升级 ${promotions} 次，` : ''}${compensationCopy}其余妖灵已入背包。`);
  state.advancedBatch = [];
  state.summonSwapCount = 0;
  renderGameRoster();
  updateHUD();
}

function initGame() {
  state.runId += 1;
  clearFortuneTimers();
  if (refs.fortuneDialog.open) refs.fortuneDialog.close();
  state.paused = false; state.backgroundPaused = false; state.speed = 1; state.wave = 0; state.waveTimer = 0; state.spawning = null; state.waveCooldown = 0; state.phase = 'prep'; state.prepTimer = 15; state.battleTime = 0;
  state.energy = Math.round(currentLevel().essence * currentDifficulty().startEssence); state.hp = state.maxHp; state.kills = 0; state.score = 0; state.combo = 0; state.bestCombo = 0;
  const initialSeed = isTrial() ? trialSeed() : (Date.now() ^ (state.stage + 1) * 2654435761) >>> 0;
  resetRunRandom(initialSeed);
  const trialRule = isTrial() ? trialRuleForSeed(initialSeed) : null;
  const eligibleRequired = ROSTER.filter((beast) => state.unlocked.has(beast.id) && beast.rarity <= (trialRule?.rarityCap ?? RARITIES.length - 1));
  state.towers = []; state.backpack = []; state.selectedUnitId = null; state.nextUnitId = 1; state.enemies = []; state.projectiles = []; state.particles = []; state.hitBursts = []; state.damageTexts = []; state.visualEffects = []; state.defeated = []; state.screenShake = 0; state.screenFlash = 0; state.logs = []; state.skillCooldowns = {}; state.skillBond = null; state.pendingTargetSkillUid = null; state.selectedEnemy = null; state.tutorialStep = state.tutorialMode && state.stage === 0 && !isEndless() ? 0 : -1; state.fusionSelection = []; state.signEffects = []; state.summonOffers = []; state.summonMode = 'normal'; state.summonSwapCount = 0; state.summonAttempts = 0; state.requiredOffered = false; state.advancedBatch = []; state.advancedMode = 'normal'; state.requiredBeastId = eligibleRequired[Math.floor(gameRandom('draw') * eligibleRequired.length)].id; state.fortuneSpinning = false; state.finalScoreBreakdown = null; state.resultGrowthXp = 0; state.bossEscaped = false; state.resumeAfterDialog = false; state.draggingUnitId = null; state.draggingTowerIndex = -1; state.draggingTowerOffset = { x: 0, y: 0 }; state.selectedTowerUid = null; state.runFielded = new Set(); state.runBeastKills = {}; state.runEvolutions = {}; state.runStats = { damageByBeast: {}, shieldByBeast: {}, breachesByRoute: {}, sealLost: 0, waves: [] }; state.trialRuleId = trialRule?.id || null; state.trialFailedReason = ''; state.runSeed = initialSeed; state.waveStartedAt = 0;
  if (state.tutorialStep === 0) { state.phase = 'tutorial'; state.prepTimer = 0; }
  if (state.soundEnabled) ensureAudio();
  const mechanic = Core.STAGE_MECHANICS[state.stage];
  showScreen('game'); startAmbient(); refs.gameTerrain.textContent = currentLevel().name; refs.gameDifficulty.textContent = isEndless() ? '无尽' : isTrial() ? `试炼·${trialRule.short}` : currentDifficulty().name; refs.gameLevel.textContent = `波次 1 / 整备`; refs.requiredBeastLabel.textContent = beastDef(state.requiredBeastId).name; refs.arenaHint.textContent = `本局必选「${beastDef(state.requiredBeastId).name}」；${mechanic.name}：${mechanic.copy}${isTrial() ? ` · 试炼「${trialRule.name}」：${trialRule.copy} · 种子 ${state.runSeed}` : ''}`; addLog(`${isEndless() ? '无尽封印' : isTrial() ? `固定种子试炼 ${state.runSeed} · ${trialRule.name}：${trialRule.copy}` : `${currentDifficulty().name}难度`} · ${mechanic.name}：${mechanic.copy}`); renderGameRoster(); renderGameBonds(); updateHUD();
}

function discardPendingResume() { state.pendingResume = null; saveProgress(); }
function startStandardGame() { discardPendingResume(); state.mode = 'standard'; state.tutorialMode = false; initGame(); }
function startEndlessGame() {
  if (!endlessUnlocked()) return;
  discardPendingResume();
  state.mode = 'endless';
  state.tutorialMode = false;
  state.difficulty = 'normal';
  initGame();
}
function startTrialGame() { discardPendingResume(); state.mode = 'trial'; state.tutorialMode = false; initGame(); }

function enforceTrialRuleBeforeWave() {
  const rule = currentTrialRule();
  if (!rule?.requiresDualCoverage || state.wave < 2) return true;
  const uncoveredRoutes = pathInfo().map((route, index) => ({ route, index })).filter(({ route }) => !state.towers.some((tower) => distanceToRoute(tower.x, tower.y, route) <= effectiveTowerRange(tower)));
  if (!uncoveredRoutes.length) return true;
  const routeNames = uncoveredRoutes.map(({ index }) => index === 0 ? '上路' : '下路').join('、');
  state.trialFailedReason = `双路均衡：${routeNames}尚无覆盖火力`;
  addLog(`试炼失败：${state.trialFailedReason}。`);
  finishGame(false);
  return false;
}

function resumeWaveGame() {
  const snapshot = state.pendingResume;
  if (!validWaveSnapshot(snapshot)) { state.pendingResume = null; renderSelect(); return; }
  state.mode = snapshot.mode; state.stage = snapshot.stage; state.difficulty = snapshot.difficulty; state.tutorialMode = false;
  initGame();
  state.wave = snapshot.wave; state.energy = snapshot.energy; state.hp = snapshot.hp; state.kills = snapshot.kills; state.score = snapshot.score; state.combo = snapshot.combo; state.bestCombo = snapshot.bestCombo;
  state.towers = snapshot.towers; state.backpack = snapshot.backpack; state.nextUnitId = Number(snapshot.nextUnitId) || 1; state.maxPopulation = Number(snapshot.maxPopulation) || 18; state.requiredBeastId = ROSTER.some((beast) => beast.id === snapshot.requiredBeastId) ? snapshot.requiredBeastId : state.requiredBeastId;
  state.skillCooldowns = snapshot.skillCooldowns && typeof snapshot.skillCooldowns === 'object' ? snapshot.skillCooldowns : {}; state.runFielded = new Set(Array.isArray(snapshot.runFielded) ? snapshot.runFielded : []); state.runBeastKills = snapshot.runBeastKills && typeof snapshot.runBeastKills === 'object' ? snapshot.runBeastKills : {}; state.runEvolutions = snapshot.runEvolutions && typeof snapshot.runEvolutions === 'object' ? snapshot.runEvolutions : {};
  state.runStats = snapshot.runStats && typeof snapshot.runStats === 'object' && snapshot.runStats.damageByBeast && snapshot.runStats.shieldByBeast && snapshot.runStats.breachesByRoute && Array.isArray(snapshot.runStats.waves) ? snapshot.runStats : { damageByBeast: {}, shieldByBeast: {}, breachesByRoute: {}, sealLost: 0, waves: [] };
  state.runSeed = Number(snapshot.runSeed) || 1; state.randomStates = snapshot.randomStates && typeof snapshot.randomStates === 'object' ? snapshot.randomStates : { draw: 1, route: 1, enemy: 1 }; state.trialRuleId = isTrial() && TRIAL_RULES.some((rule) => rule.id === snapshot.trialRuleId) ? snapshot.trialRuleId : state.trialRuleId; state.trialFailedReason = ''; state.phase = 'rest'; state.waveCooldown = isBossWave(state.wave) ? 12 : 7; state.spawning = null; state.pendingResume = null;
  const resumedTrialRule = currentTrialRule();
  refs.gameDifficulty.textContent = isEndless() ? '无尽' : isTrial() ? `试炼·${resumedTrialRule.short}` : currentDifficulty().name;
  refs.arenaHint.textContent = `已续守至第 ${state.wave + 1} 波，敌军将在 ${state.waveCooldown} 秒后出现 · ${waveRouteThreatText(waveTemplate(state.wave))}${resumedTrialRule ? ` · 试炼「${resumedTrialRule.name}」：${resumedTrialRule.copy}` : ''}`;
  addLog(`已从第 ${state.wave} 波结算后恢复，下一波即将来袭。`); renderGameRoster(); renderGameBonds(); updateHUD(); saveProgress();
}

function startWave() {
  if (!isEndless() && state.wave >= totalWaves()) return;
  if (!enforceTrialRuleBeforeWave()) return;
  const groups = waveTemplate(state.wave);
  const meta = waveMeta(state.wave);
  const difficulty = currentDifficulty();
  const endless = isEndless() ? Core.endlessScale(state.wave) : { hp: 1, speed: 1, armor: 0 };
  const routeCount = pathInfo().length;
  const routeOffset = routeCount > 1 ? Math.floor(gameRandom('route') * routeCount) : 0;
  const threatText = waveRouteThreatText(groups, routeOffset);
  state.spawning = groups.map(([type, count, gap, delay, hpMul, role = 'normal'], index) => ({ type, count: Math.max(1, Math.round(count * difficulty.count)), gap: gap * difficulty.gap / endless.speed, delay, hpMul: hpMul * endless.hp, role, spawned: 0, timer: delay, route: (index + routeOffset) % routeCount }));
  state.spawning.bossAfterClear = (!isEndless() && state.wave === WAVES.length - 1) || (isEndless() && (state.wave + 1) % WAVES.length === 0) ? currentLevel().boss : null;
  state.spawning.bossSpawned = false;
  if (state.tutorialStep === 3) state.tutorialStep = 4;
  state.phase = 'combat'; state.waveStarted = true; state.waveTimer = 0; state.waveStartedAt = state.battleTime;
  playSound('wave');
  refs.waveLabel.textContent = `${state.wave + 1} / ${totalWaves()}`;
  refs.arenaHint.textContent = `第 ${state.wave + 1} 波 · ${meta.hint} · ${threatText}`;
  addLog(`第 ${state.wave + 1} 波：${meta.hint}`);
}

function startNextWaveEarly() {
  if (state.screen !== 'game' || state.paused || state.phase !== 'rest' || state.waveCooldown <= 0) return;
  const reward = Math.max(1, Math.floor(state.waveCooldown * .35));
  state.energy += reward;
  state.waveCooldown = 0;
  addLog(`提前开波，获得 ${reward} 灵蕴。`);
  startWave();
  updateHUD();
}

function spawnFromGroups(dt) {
  if (state.phase === 'tutorial') return;
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
      const bossRoute = routeCount > 1 ? Math.floor(gameRandom('route') * routeCount) : 0;
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
    state.runStats.waves.push({ wave: completedWave + 1, seconds: Math.round(Math.max(0, state.battleTime - state.waveStartedAt) * 10) / 10 });
    state.energy += completedMeta.bonus;
    state.spawning = null; state.wave += 1;
    if (!isEndless() && state.wave >= WAVES.length) { finishGame(true); return; }
    const bossWarning = bossWarningFor(state.wave);
    const nextThreatText = waveRouteThreatText(waveTemplate(state.wave));
    state.phase = 'rest'; state.waveCooldown = isBossWave(state.wave) ? 12 : 7;
    saveProgress();
    refs.arenaHint.textContent = bossWarning || `第 ${state.wave + 1} 波将在 7 秒后开始 · ${nextThreatText}`;
    if (bossWarning) playSound('warning');
    addLog(`${bossWarning || `下一波将在 7 秒后开始 · ${nextThreatText}`}${completedMeta.bonus ? `，奖励 ${completedMeta.bonus} 灵蕴` : ''}。`);
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
  const enemy = { type, role, sealDamage: role === 'stageBoss' ? 9 : role === 'miniBoss' ? 5 : 1, def, x: point.x, y: point.y, d: distanceAlong, route: routeIndex, routePoints: route.points, routeLength: pathLength(route.points), hp, maxHp: hp, speed: def.speed, radius: def.radius, shield: (def.shield || 0) * (hard ? 1.35 : easy ? .7 : 1) + heavenShield, armor: def.armor || 0, immuneMag: Boolean(def.immuneMag && !easy), immunePhy: Boolean(def.immunePhy || (hard && type === 'bashe')), resistMag: easy && def.immuneMag ? .45 : 0, slow: 0, slowTimer: 0, burnTimer: 0, burnDps: 0, burnSource: null, stealthTimer: def.stealth ? (hard ? 3.5 : easy ? 1 : 2) : 0, revived: false, reviveRatio: hard ? .55 : easy ? .25 : .35, split: false, lastHitBy: null, contributors: new Set(), hitCount: 0, hitTarget: null, healRate: hard ? .12 : easy ? .05 : .08, healInterval: hard ? 5 : easy ? 9 : 7, skillTimer: 4 + gameRandom('enemy') * 3, tideTimer: 6, facing: -1, walkPhase: gameRandom('enemy') * Math.PI * 2, hitFlash: 0, hitKick: 0, spawnScale: 0 };
  refreshEnemyModifiers(enemy);
  state.enemies.push(enemy);
  addVisualEffect('spawn', enemy.x, enemy.y, def.color, { size: role === 'stageBoss' ? 104 : role === 'miniBoss' ? 82 : 58, ttl: role === 'normal' ? .52 : .9 });
  state.screenShake = Math.max(state.screenShake, role === 'stageBoss' ? 8 : role === 'miniBoss' ? 4 : 0);
  return enemy;
}

function bondsForTowers(towers = state.towers) {
  const totals = { power: 0, haste: 0, range: 0, cdr: 0, sunder: 0, enemySlow: 0 };
  const active = [];
  for (const bond of BOND_DEFS) {
    const members = bond.members.map((id) => towers.find((tower) => tower.id === id)).filter(Boolean);
    if (members.length < bond.need) continue;
    const full = members.length >= bond.members.length;
    const contribution = bond.bonus + Math.max(0, members.length - bond.need) * bond.stepBonus;
    totals[bond.stat] += contribution;
    active.push({ ...bond, members, formed: true, full, ultReady: Boolean(bond.ult), adjusted: contribution });
  }
  totals.power = Math.min(1.2, totals.power); totals.haste = Math.min(.7, totals.haste); totals.range = Math.min(.45, totals.range); totals.cdr = Math.min(.6, totals.cdr); totals.sunder = Math.min(.45, totals.sunder); totals.enemySlow = Math.min(.45, totals.enemySlow);
  const skillBonds = active.filter((bond) => bond.ultReady);
  if (towers === state.towers) state.skillBond = skillBonds.find((bond) => bond.id === state.skillBond?.id) || skillBonds[0] || null;
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

function hasCounter(def, counter) { return (def?.counters || []).includes(counter) || (counter === 'breakShield' && def?.breakShield === true); }

function canSeeEnemy(enemy, def) {
  if (!enemy || enemy.hp <= 0) return false;
  return (enemy.stealthTimer || 0) <= 0 || hasCounter(def, 'insight');
}

function canDamageEnemy(enemy, def) {
  if (!canSeeEnemy(enemy, def)) return false;
  if (def?.dmgType === 'phy' && enemy.immunePhy) return false;
  if (def?.dmgType === 'mag' && enemy.immuneMag && !hasCounter(def, 'purge')) return false;
  return true;
}

function canControlEnemy(enemy, def) { return canSeeEnemy(enemy, def); }

function updateTowers(dt, bondState = bondsForTowers()) {
  const allyBlessing = activeSignEffect('allyBuff');
  const pendingDamage = new Map();
  state.projectiles.forEach((projectile) => {
    if (!projectile.target || projectile.target.hp <= 0) return;
    pendingDamage.set(projectile.target, (pendingDamage.get(projectile.target) || 0) + projectile.amount);
  });
  const queueProjectile = (projectile) => {
    state.projectiles.push(projectile);
    pendingDamage.set(projectile.target, (pendingDamage.get(projectile.target) || 0) + projectile.amount);
  };
  state.towers.forEach((tower) => {
    const def = beastDef(tower.id);
    tower.recoil = Math.max(0, (tower.recoil || 0) - dt * 6.5);
    tower.attackFlash = Math.max(0, (tower.attackFlash || 0) - dt * 7.5);
    tower.castPulse = Math.max(0, (tower.castPulse || 0) - dt * 2.4);
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
    const range = effectiveTowerRange(tower, bondState.totals, support, evolution);
    const rangeSquared = range * range;
    let target = null;
    let fallbackTarget = null;
    state.enemies.forEach((enemy) => {
      if (!canDamageEnemy(enemy, def)) return;
      const dx = enemy.x - tower.x;
      const dy = enemy.y - tower.y;
      if (dx * dx + dy * dy > rangeSquared) return;
      if (!fallbackTarget || enemy.d > fallbackTarget.d) fallbackTarget = enemy;
      if (enemy.hp - (pendingDamage.get(enemy) || 0) > 0 && (!target || enemy.d > target.d)) target = enemy;
    });
    target ||= fallbackTarget;
    if (!target) return;
    if (tower.hitTarget === target) tower.hitCount += 1; else { tower.hitTarget = target; tower.hitCount = 1; }
    const special = def.stunEvery && tower.hitCount % def.stunEvery === 0 ? -1 : def.breakAt && tower.hitCount % def.breakAt === 0 ? -2 : 0;
    const power = def.dmg * RARITY_POWER[def.rarity] * growth.attack * currentDifficulty().towerPower * (1 + runPassive.power + evolution.power) * (1 + bondState.totals.power + support.power + (allyBlessing ? .22 : 0)) * (1 + (tower.level - 1) * .26) * (1 + cultivation().power);
    const seed = [...tower.id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    tower.attackAngle = Math.atan2(target.y - tower.y, target.x - tower.x);
    tower.recoil = 1;
    tower.attackFlash = 1;
    addVisualEffect('muzzle', tower.x + Math.cos(tower.attackAngle) * 16, tower.y - 28 + Math.sin(tower.attackAngle) * 10, def.color, { angle: tower.attackAngle, size: 34 + def.rarity * 3, ttl: .18, proj: def.proj, depthY: tower.y });
    queueProjectile({ x: tower.x, y: tower.y - 34, target, amount: power, speed: def.projSpeed, def, source: tower, life: special, seed, age: 0, trail: [] });
    if (runPassive.targets > 0) {
      state.enemies.filter((enemy) => enemy !== target && canDamageEnemy(enemy, def) && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range).sort((a, b) => b.d - a.d).slice(0, runPassive.targets).forEach((enemy, index) => {
        queueProjectile({ x: tower.x, y: tower.y - 34, target: enemy, amount: power * .65, speed: def.projSpeed, def, source: tower, life: 0, seed: seed + 20 + index, age: 0, trail: [] });
      });
    }
    if (tower.skillShots > 0) {
      const skill = activeSkillFor(tower.id);
      const extraTargets = state.enemies.filter((enemy) => enemy !== target && canDamageEnemy(enemy, def) && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range).sort((a, b) => b.d - a.d).slice(0, Math.max(1, (skill.count || 2) - 1));
      extraTargets.forEach((enemy, index) => queueProjectile({ x: tower.x, y: tower.y - 34, target: enemy, amount: power * (skill.mult || .7), speed: def.projSpeed, def, source: tower, life: 0, seed: seed + index + 1, age: 0, trail: [] }));
      tower.skillShots -= 1;
    }
    playAttackSound(def.proj, tower.x);
    tower.cd = def.interval / Math.max(.35, def.rate || 1);
  });
}

function targetDamage(enemy, amount, def, special, source) {
  let final = amount;
  if (def.dmgType === 'phy' && enemy.immunePhy) { enemy.damageBlockedBy = 'immune'; return 0; }
  if (def.dmgType === 'mag' && enemy.immuneMag && !hasCounter(def, 'purge')) { enemy.damageBlockedBy = 'immune'; return 0; }
  if (def.dmgType === 'phy' && enemy.resistPhy) final *= 1 - enemy.resistPhy;
  if (def.dmgType === 'mag' && enemy.resistMag) final *= 1 - enemy.resistMag;
  if (special === -2) {
    enemy.armorBreak = Math.max(enemy.armorBreak || 0, BASIC_ATTACK_ARMOR_BREAK);
    enemy.armorBreakTimer = Math.max(enemy.armorBreakTimer || 0, BASIC_ATTACK_ARMOR_BREAK_DURATION);
    final *= 1.2;
  }
  if (enemy.shield > 0) {
    const shieldMultiplier = hasCounter(def, 'breakShield') ? 1.5 : .3;
    const shieldDamage = final * shieldMultiplier;
    const absorbed = Math.min(enemy.shield, shieldDamage);
    recordRunCombat(source, 'shieldByBeast', absorbed);
    enemy.shield = Math.max(0, enemy.shield - shieldDamage);
    burst(enemy.x, enemy.y, '#9bd2dd', 7);
    addVisualEffect('shield', enemy.x, enemy.y - 16, '#9bd2dd', { size: 62, ttl: .34, depthY: enemy.y });
    if (enemy.shield > 0) { enemy.damageBlockedBy = hasCounter(def, 'breakShield') ? 'shieldBreak' : 'shieldChip'; return 0; }
    final = Math.max(0, final - absorbed / shieldMultiplier);
  }
  if (def.dmgType !== 'true') final *= Math.max(.35, 1 - Math.max(0, enemy.armor - (enemy.armorBreak || 0) - bondTotals().sunder * 40) / 100);
  if (special === -1) enemy.stunned = Math.max(enemy.stunned || 0, 1.2);
  if (hasCounter(def, 'execute') && enemy.hp / enemy.maxHp < .25) final *= 1.6;
  if (source) enemy.lastHitBy = source;
  return final;
}

function bondTotals() { return activeCombatBondTotals || bondsForTowers().totals; }

function recordRunCombat(source, field, amount) {
  const id = source?.combatStatsId || source?.id;
  if (!id || !Number.isFinite(amount) || amount <= 0) return;
  const entries = state.runStats[field];
  entries[id] = (entries[id] || 0) + amount;
}

function damageEnemy(enemy, amount, def, special = 0, source = null) {
  if (!canSeeEnemy(enemy, def)) return;
  const final = targetDamage(enemy, amount, def, special, source);
  if (final <= 0) {
    const blockedBy = enemy.damageBlockedBy;
    enemy.damageBlockedBy = null;
    addDamageText(enemy.x, enemy.y, blockedBy === 'shieldChip' ? '削盾' : blockedBy === 'shieldBreak' ? '破盾' : '免疫', '#b7b5aa');
    return;
  }
  if (source?.uid) enemy.contributors?.add(source.uid);
  recordRunCombat(source, 'damageByBeast', Math.min(enemy.hp, final));
  enemy.hp -= final;
  if (!def.silentImpact) {
    addDamageText(enemy.x, enemy.y, Math.round(final), def.color, final > enemy.maxHp * .12 ? 1.25 : 1);
    enemy.hitFlash = .18;
    enemy.hitKick = source ? clamp((enemy.x - source.x) / 34, -1, 1) : 0;
  }
  if (def.burn) {
    const burnDps = def.dmg * (def.burnDps || .22);
    enemy.burnTimer = Math.max(enemy.burnTimer, 4);
    if (burnDps >= enemy.burnDps) { enemy.burnDps = burnDps; enemy.burnSource = source; }
  }
  if (def.slow) { enemy.slow = Math.max(enemy.slow, def.slow); enemy.slowTimer = Math.max(enemy.slowTimer, def.slowDur); }
  if (!def.silentImpact) burst(enemy.x, enemy.y, def.color, 5);
  if (enemy.hp <= 0) killEnemy(enemy);
}

function applyProjectile(projectile) {
  const enemy = projectile.target; const def = projectile.def;
  if (!enemy || enemy.hp <= 0) return;
  const impactKind = def.proj === 'quake' ? 'quakeImpact' : def.proj === 'claw' ? 'slashImpact' : def.proj === 'splash' ? 'waterImpact' : 'impact';
  addVisualEffect(impactKind, enemy.x, enemy.y - enemy.radius * .7, def.color, { size: def.splash ? Math.max(58, def.splash * 1.35) : def.proj === 'quake' ? 72 : 46, ttl: def.proj === 'quake' || def.proj === 'splash' ? .5 : .28, depthY: enemy.y });
  const impactShake = def.proj === 'quake' ? 3.4 : def.splash ? 2.2 : projectile.life === -2 ? 1.8 : 0;
  state.screenShake = Math.max(state.screenShake, impactShake);
  damageEnemy(enemy, projectile.amount, def, projectile.life, projectile.source);
  if (def.splash) {
    state.enemies.filter((item) => item !== enemy && canDamageEnemy(item, def) && Math.hypot(item.x - enemy.x, item.y - enemy.y) <= def.splash).forEach((item) => damageEnemy(item, projectile.amount * .7, def, 0, projectile.source));
  }
  if (def.chain) {
    let from = enemy; const visited = new Set([enemy]);
    for (let hop = 0; hop < def.chain; hop += 1) {
      const next = state.enemies.filter((item) => canDamageEnemy(item, def) && !visited.has(item) && Math.hypot(item.x - from.x, item.y - from.y) <= 130).sort((a, b) => dist(from, a) - dist(from, b))[0];
      if (!next) break;
      addVisualEffect('arc', from.x, from.y - from.radius, def.color, { x2: next.x, y2: next.y - next.radius, size: 3.5, ttl: .22, seed: projectile.seed + hop * 17, depthY: Math.max(from.y, next.y) });
      visited.add(next); damageEnemy(next, projectile.amount * .65, def, 0, projectile.source); from = next;
    }
  }
}

function updateProjectiles(dt) {
  state.projectiles = state.projectiles.filter((projectile) => {
    if (!projectile.target || projectile.target.hp <= 0) return false;
    projectile.age = (projectile.age || 0) + dt;
    const targetY = projectile.target.y - projectile.target.radius * 1.15;
    const dx = projectile.target.x - projectile.x; const dy = targetY - projectile.y; const distance = Math.hypot(dx, dy); const step = projectile.speed * dt;
    const seed = projectile.seed || 0;
    const amplitude = projectile.def.proj === 'wisp' ? .2 : projectile.def.proj === 'splash' ? .15 : projectile.def.proj === 'ember' ? .11 : projectile.def.proj === 'quake' ? .05 : .025;
    const curve = Math.sin(state.battleTime * (5 + seed % 5) + seed * .17) * amplitude;
    const safeDistance = Math.max(distance, 1);
    projectile.x += (dx / safeDistance - dy / safeDistance * curve) * step;
    projectile.y += (dy / safeDistance + dx / safeDistance * curve) * step;
    projectile.trail.push({ x: projectile.x, y: projectile.y }); if (projectile.trail.length > (projectile.def.proj === 'claw' ? 5 : 8)) projectile.trail.shift();
    if (distance < step + projectile.target.radius) { applyProjectile(projectile); return false; }
    return true;
  });
}

function updateEnemies(dt) {
  const totals = bondTotals();
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    enemy.spawnScale = Math.min(1, (enemy.spawnScale || 0) + dt * 4.5);
    enemy.hitFlash = Math.max(0, (enemy.hitFlash || 0) - dt);
    enemy.slowTimer -= dt; if (enemy.slowTimer <= 0) enemy.slow = 0;
    enemy.stealthTimer -= dt; enemy.stunned = Math.max(0, (enemy.stunned || 0) - dt);
    enemy.armorBreakTimer = Math.max(0, (enemy.armorBreakTimer || 0) - dt); if (enemy.armorBreakTimer <= 0) enemy.armorBreak = 0;
    if (enemy.burnTimer > 0) { enemy.burnTimer -= dt; damageEnemy(enemy, enemy.burnDps * dt, { dmgType: 'true', counters: [], color: '#eb8d4f', burn: false, silentImpact: true }, 0, enemy.burnSource); }
    if (enemy.hp <= 0) continue;
    if (enemy.def.skill === 'heal') { enemy.skillTimer -= dt; if (enemy.skillTimer <= 0) { enemy.skillTimer = enemy.healInterval; const heal = enemy.maxHp * enemy.healRate; enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal); addDamageText(enemy.x, enemy.y - 28, `+${Math.round(heal)}`, '#83c8a7'); addVisualEffect('heal', enemy.x, enemy.y - 22, '#83c8a7', { size: 72, ttl: .65 }); } }
    if (state.stage === 2) {
      enemy.tideTimer -= dt;
      if (enemy.tideTimer <= 0) { enemy.tideTimer = 6; const heal = enemy.maxHp * .012; enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal); addDamageText(enemy.x, enemy.y - 20, `潮 +${Math.round(heal)}`, '#78c9c6'); }
    }
    if (enemy.stunned > 0) continue;
    const route = enemy.routePoints; const next = interpolatePath(route, enemy.d); const ahead = interpolatePath(route, Math.min(enemy.routeLength, enemy.d + 8));
    const moveX = ahead.x - next.x;
    if (Math.abs(moveX) > .2) enemy.facing = Math.sign(moveX);
    enemy.walkPhase += dt * enemy.speed * .12;
    enemy.x = next.x; enemy.y = next.y;
    enemy.d += enemy.speed * (1 - enemy.slow) * (1 - totals.enemySlow) * dt;
    if (enemy.d >= enemy.routeLength) { const actualSealLoss = Math.min(Math.max(0, state.hp), enemy.sealDamage); enemy.hp = 0; state.hp -= enemy.sealDamage; state.runStats.breachesByRoute[enemy.route] = (state.runStats.breachesByRoute[enemy.route] || 0) + 1; state.runStats.sealLost += actualSealLoss; state.bossEscaped ||= enemy.role === 'stageBoss'; if (currentTrialRule()?.noLeak) state.trialFailedReason = '十全封印：敌军漏过封印'; state.combo = 0; state.screenShake = Math.max(state.screenShake, 7); state.screenFlash = Math.max(state.screenFlash, .36); addVisualEffect('breach', enemy.x, enemy.y, '#d64031', { size: enemy.role === 'stageBoss' ? 120 : 76, ttl: .7 }); playSound('breach'); addLog(`${enemy.def.name}冲过封印，造成 ${enemy.sealDamage} 点破封伤害。${enemy.role === 'stageBoss' ? '终局首领破封，守关失败。' : ''}`); }
  }
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
  if (state.hp <= 0 || state.bossEscaped || state.trialFailedReason) finishGame(false);
}

function killEnemy(enemy) {
  if (enemy.def.skill === 'revive' && !enemy.revived) { enemy.revived = true; enemy.hp = enemy.maxHp * enemy.reviveRatio; enemy.shield = state.difficulty === 'hard' ? 180 : state.difficulty === 'easy' ? 70 : 120; enemy.spawnScale = 0; addVisualEffect('revive', enemy.x, enemy.y - 18, '#d9ca96', { size: 104, ttl: 1 }); state.screenFlash = Math.max(state.screenFlash, .18); addLog(`${enemy.def.name}触发复活，获得临时护盾。`); return; }
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
  const bossDown = enemy.role !== 'normal' || enemy.def.boss;
  if (state.defeated.length >= EFFECT_LIMITS.defeated) state.defeated.shift();
  state.defeated.push({ type: enemy.type, x: enemy.x, y: enemy.y, facing: enemy.facing, role: enemy.role, life: bossDown ? 1.15 : .62, maxLife: bossDown ? 1.15 : .62, size: enemy.radius * (bossDown ? 6.6 : 5.8) });
  addVisualEffect('death', enemy.x, enemy.y - enemy.radius, enemy.def.color, { size: bossDown ? 126 : 68, ttl: bossDown ? .9 : .48, depthY: enemy.y });
  state.screenShake = Math.max(state.screenShake, bossDown ? 9 : 0);
  if (bossDown) state.screenFlash = Math.max(state.screenFlash, .26);
  state.kills += enemy.def.reward; state.combo += 1; state.score += enemy.def.reward * 100 + Math.min(100, state.combo * 5); state.bestCombo = Math.max(state.bestCombo, state.combo); state.energy = Math.min(9999, state.energy + enemy.def.reward * 2); state.xp += enemy.def.reward; burst(enemy.x, enemy.y, enemy.def.color, enemy.role !== 'normal' || enemy.def.boss ? 18 : 8);
}

function awardBeastGrowth(won, abandoned = false) {
  const summaries = [];
  state.resultGrowthXp = 0;
  state.runFielded.forEach((id) => {
    const previous = growthFor(id);
    const kills = state.runBeastKills[id] || 0;
    const earnedDeploymentBonus = !abandoned && (won || state.wave > 0 || kills > 0);
    const gainedXp = (earnedDeploymentBonus ? 12 : 0) + kills * 5 + (won ? 8 : 0);
    if (!gainedXp) return;
    state.resultGrowthXp += gainedXp;
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

function combatRecap() {
  const { damageByBeast, shieldByBeast, breachesByRoute, sealLost, waves } = state.runStats;
  const contributors = [...new Set([...Object.keys(damageByBeast), ...Object.keys(shieldByBeast)])]
    .map((id) => ({ id, damage: damageByBeast[id] || 0, shield: shieldByBeast[id] || 0 }))
    .sort((a, b) => b.damage + b.shield - a.damage - a.shield)
    .slice(0, 2);
  const sourceName = (id) => id.startsWith('bond:') ? `羁绊·${BOND_DEFS.find((bond) => bond.id === id.slice(5))?.name || '联动'}` : beastDef(id).name;
  const contributionCopy = contributors.length ? `主力：${contributors.map(({ id, damage, shield }) => `${sourceName(id)} ${Math.round(damage).toLocaleString('zh-CN')}伤${shield ? ` / ${Math.round(shield).toLocaleString('zh-CN')}破盾` : ''}`).join('、')}` : '主力：尚未造成有效伤害';
  const routeCount = pathInfo().length;
  const routeName = (route) => routeCount === 1 ? '主路' : route === 0 ? '上路' : route === 1 ? '下路' : `第${route + 1}路`;
  const breaches = Object.entries(breachesByRoute).filter(([, count]) => count > 0);
  const breachCopy = breaches.length ? `漏怪：${breaches.map(([route, count]) => `${routeName(Number(route))} ${count}只`).join('、')}，损失 ${sealLost} 封印` : '漏怪：无';
  const paceCopy = waves.length ? `战斗时长：完成 ${waves.length} 波，平均 ${((waves.reduce((sum, wave) => sum + wave.seconds, 0) / waves.length) || 0).toFixed(1)} 秒/波（战场计时）` : '战斗时长：尚未完成波次';
  return `${contributionCopy}；${breachCopy}；${paceCopy}`;
}

function finishGame(won, abandoned = false) {
  if (state.screen !== 'game') return;
  state.runId += 1;
  clearFortuneTimers();
  if (refs.fortuneDialog.open) refs.fortuneDialog.close();
  state.resumeAfterDialog = false;
  state.paused = false;
  state.backgroundPaused = false;
  stopAmbient();
  state.screen = 'finishing'; state.finishTimer = 0;
  if (won) playSound('victory');
  const unlockedBefore = new Set(state.unlocked);
  if (won && !isEndless()) state.completions.add(completionKey(state.stage, state.difficulty));
  applyProgressUnlocks();
  const newUnlocks = [...state.unlocked].filter((id) => !unlockedBefore.has(id));
  const growthSummaries = awardBeastGrowth(won, abandoned);
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
  const savePromise = saveProgress();
  refs.resultTitle.textContent = isEndless() ? `无尽封印止于第 ${state.wave + 1} 波` : won ? '封印守住了' : abandoned ? '守阵主动撤离' : '封印被突破';
  const trialRule = currentTrialRule();
  refs.resultStage.textContent = `${currentLevel().name} · 0${state.stage + 1} · ${isEndless() ? '无尽模式' : isTrial() ? `固定种子 ${state.runSeed} · ${trialRule.name}` : currentDifficulty().name}`;
  refs.resultScoreStamp.textContent = breakdown.grade;
  refs.resultScoreTotal.textContent = breakdown.total.toLocaleString('zh-CN');
  refs.resultCombatScore.textContent = `+${breakdown.combat.toLocaleString('zh-CN')}`;
  refs.resultVictoryScore.textContent = `+${breakdown.victory.toLocaleString('zh-CN')}`;
  refs.resultBonds.textContent = `${activeBonds} · +${breakdown.bonds}`;
  refs.resultHp.textContent = `${remainingHp}/${state.maxHp} · +${breakdown.hp}`;
  refs.resultEnergy.textContent = `${remainingEnergy} · +${breakdown.energy}`;
  refs.resultUr.textContent = `${urCount} · +${breakdown.ur}`;
  refs.resultRequired.textContent = `${beastDef(state.requiredBeastId).name} · ${requiredFielded ? `+${breakdown.required}` : '+0'}`;
  refs.resultKills.textContent = state.kills; refs.resultXp.textContent = `+${state.resultGrowthXp}`; refs.resultCombo.textContent = state.bestCombo; refs.resultRecap.textContent = combatRecap();
  const unlockCopy = newUnlocks.length ? ` 新解锁：${newUnlocks.map((id) => beastDef(id).name).join('、')}。` : '';
  const growthCopy = growthSummaries.length ? ` ${growthSummaries.join('，')}。` : '';
  const medalCopy = newMedals.length ? ` 新勋章：${newMedals.map((id) => Core.MEDALS.find((medal) => medal.id === id)?.name).filter(Boolean).join('、')}。` : '';
  const capReasons = [gradeResult.integrityCap !== 'S' ? `封印完整度 ${Math.round(integrity * 100)}%，评级上限 ${gradeResult.integrityCap}` : '', !requiredFielded ? '未上阵必选妖灵，评级上限 A' : '', activeBonds === 0 ? '未触发羁绊，评级上限 A' : ''].filter(Boolean);
  const outcomeReason = abandoned ? '主动撤守' : state.trialFailedReason || (state.bossEscaped ? '终局首领已破封' : !won && remainingHp <= 0 ? '封印完整度归零' : '');
  const trialCopy = trialRule ? ` 试炼「${trialRule.name}」${won ? '达成' : '未达成'}。` : '';
  const resultCopy = `${isEndless() ? `无尽模式抵达第 ${state.wave + 1} 波` : won ? '守关成功' : '守关失败'}${outcomeReason ? `（${outcomeReason}）` : ''}，${currentDifficulty().name}难度倍率 ×${currentDifficulty().score.toFixed(2)}，总分评级 ${gradeResult.scoreGrade}${capReasons.length ? `；${capReasons.join('；')}` : ''}。${trialCopy}${unlockCopy}${growthCopy}${medalCopy}`;
  refs.resultCopy.textContent = `${resultCopy} 存档更新中……`;
  showScreen('result');
  savePromise.then((saveResult) => {
    if (state.screen !== 'result' || state.finalScoreBreakdown !== breakdown) return;
    const saveWarning = saveResult.local && saveResult.desktop ? '' : ` 存档提示：${saveResult.message}。`;
    refs.resultCopy.textContent = `${resultCopy}${saveWarning}`;
  });
}

function addVisualEffect(kind, x, y, color, options = {}) {
  const maxLife = options.ttl || .4;
  if (state.visualEffects.length >= EFFECT_LIMITS.visual) state.visualEffects.shift();
  state.visualEffects.push({ kind, x, y, depthY: options.depthY ?? y, color, maxLife, life: maxLife, seed: Math.random() * 1000, ...options });
}

function addDamageText(x, y, text, color, scale = 1) {
  if (state.damageTexts.length >= EFFECT_LIMITS.damage) state.damageTexts.shift();
  state.damageTexts.push({ x: x + (Math.random() - .5) * 8, y, text, color, scale, life: 1, maxLife: 1 });
}

function burst(x, y, color, count = 6) {
  const burstLife = .3;
  if (state.hitBursts.length >= EFFECT_LIMITS.bursts) state.hitBursts.shift();
  state.hitBursts.push({ x, y, life: burstLife, maxLife: burstLife, size: 34 + Math.min(38, count * 2) });
  const available = Math.max(0, EFFECT_LIMITS.particles - state.particles.length);
  const particleCount = Math.min(available, Math.max(2, Math.round(count * effectQuality)));
  for (let i = 0; i < particleCount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 36 + Math.random() * 86;
    const maxLife = .42 + Math.random() * .48;
    state.particles.push({ x, y, dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed - 18, color, life: maxLife, maxLife, size: 1.4 + Math.random() * 2.6, gravity: 46 + Math.random() * 30 });
  }
}

function updateEffects(dt) {
  state.particles = state.particles.filter((item) => { item.life -= dt; item.x += item.dx * dt; item.y += item.dy * dt; item.dy += item.gravity * dt; item.dx *= Math.pow(.2, dt); return item.life > 0; });
  state.hitBursts = state.hitBursts.filter((item) => { item.life -= dt; return item.life > 0; });
  state.damageTexts = state.damageTexts.filter((item) => { item.life -= dt; item.y -= dt * 24; return item.life > 0; });
  state.visualEffects = state.visualEffects.filter((item) => { item.life -= dt; return item.life > 0; });
  state.defeated = state.defeated.filter((item) => { item.life -= dt; item.y -= dt * 4; return item.life > 0; });
  state.screenShake = Math.max(0, state.screenShake - dt * 20);
  state.screenFlash = Math.max(0, state.screenFlash - dt * 1.9);
}

function beginTutorialBattle() {
  if (state.tutorialStep !== 2) return;
  state.tutorialStep = 3;
  state.tutorialMode = false;
  state.phase = 'prep';
  state.prepTimer = 3;
  refs.arenaHint.textContent = '布阵完成，3 秒后开始第一波。观察敌人路线和攻击范围。';
  addLog('教学布阵完成，第一波将在 3 秒后开始。');
  updateHUD();
}

function placeTower(x, y) {
  const unit = selectedUnit();
  if (!unit) { addLog('请先召灵，再从背包选择一只妖灵。'); return; }
  if (beastDef(unit.id).rarity > trialRarityCap()) { addLog(`${currentTrialRule()?.name || '当前规则'}中只能部署 ${RARITIES[trialRarityCap()]} 及以下妖灵。`); return; }
  if (state.towers.some((tower) => tower.id === unit.id)) { addLog(`${beastDef(unit.id).name}本局已经上场，每种妖灵只能部署一只。`); return; }
  const population = populationCostFor(unit);
  if (usedPopulation() + population > state.maxPopulation) { addLog(`${beastDef(unit.id).name}需要 ${population} 人口，当前人口不足。`); return; }
  if (!canPlaceAt(x, y)) { addLog(distToPath(x, y) < arena.roadW * .5 + arena.plate * .5 ? '不能放在怪物行进的道路上。' : '此处不能安置。'); return; }
  const def = beastDef(unit.id);
  state.towers.push({ ...unit, x, y, cd: .15, hitTarget: null, hitCount: 0, recoil: 0, attackFlash: 0, castPulse: 1, attackAngle: Math.PI });
  addVisualEffect('deploy', x, y, def.color, { size: 96 + def.rarity * 8, ttl: .72 });
  state.runFielded.add(unit.id);
  state.selectedTowerUid = unit.uid;
  state.backpack = state.backpack.filter((item) => item.uid !== unit.uid);
  state.selectedUnitId = null;
  if (state.tutorialStep === 2) beginTutorialBattle();
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
    const fieldedIds = new Set(state.towers.filter((tower) => bond.members.includes(tower.id)).map((tower) => tower.id));
    const count = fieldedIds.size;
    const fieldedNames = bond.members.filter((id) => fieldedIds.has(id)).map((id) => beastDef(id).name);
    const missingNames = bond.members.filter((id) => !fieldedIds.has(id)).map((id) => beastDef(id).name);
    const cooldown = current ? state.skillCooldowns[current.id] || 0 : 0;
    const actualEffect = bondEffectText({ ...bond, bonus: current?.adjusted ?? bond.bonus });
    const status = current ? `已触发 · ${actualEffect} · ${cooldown > 0 ? `${cooldown.toFixed(1)}s` : '技能就绪'}` : `还需 ${Math.max(0, bond.need - count)} 名：${missingNames.slice(0, Math.max(0, bond.need - count)).join('、') || '已满足'}`;
    const tag = current?.ultReady ? 'button' : 'article';
    const attrs = current?.ultReady ? ` type="button" data-dialog-skill-bond="${bond.id}"` : '';
    return `<${tag} class="bond-detail"${attrs}><i style="background:${bond.color}"></i><div><strong>${bond.name}</strong><small>成员：${bond.members.map((id) => beastDef(id).name).join('、')} · ${bond.need} 名上场即触发</small><small>${fieldedNames.length ? `已上阵：${fieldedNames.join('、')}` : '已上阵：暂无'} · ${current ? `羁绊技「${bond.ult}」` : `触发效果：${bondEffectText(bond)}`}</small></div><b>${status}</b></${tag}>`;
  }).join('');
  refs.bondDialogList.querySelectorAll('[data-dialog-skill-bond]').forEach((button) => button.addEventListener('click', () => {
    state.skillBond = bondsForTowers().active.find((bond) => bond.id === button.dataset.dialogSkillBond) || state.skillBond;
    closeGameDialog(refs.bondsDialog);
    updateHUD();
  }));
}

function autoSpot(unit = null) {
  let best = null;
  const routes = pathInfo();
  const routeCoverage = routes.map((route) => state.towers.reduce((count, tower) => count + (distanceToRoute(tower.x, tower.y, route) <= effectiveTowerRange(tower) ? 1 : 0), 0));
  const weakestCoverage = routes.length > 1 ? Math.min(...routeCoverage) : -1;
  const range = unit ? previewRangeFor(unit) : 175;
  const candidates = [];
  for (let y = 78; y <= 478; y += 22) for (let x = 94; x <= 866; x += 22) {
    if (!canPlaceAt(x, y)) continue;
    const road = distToPath(x, y);
    const nearestAlly = state.towers.length ? Math.min(...state.towers.map((tower) => Math.hypot(tower.x - x, tower.y - y))) : 120;
    const supportSpacing = -Math.abs(nearestAlly - 118) * .32;
    const routeDistances = routes.map((route) => distanceToRoute(x, y, route));
    const routeIndex = routeDistances.indexOf(Math.min(...routeDistances));
    const routeDistance = routeDistances[routeIndex];
    const coverageGain = routeDistances.reduce((count, distance, index) => count + (routeCoverage[index] === 0 && distance <= range ? 1 : 0), 0);
    const routeUncovered = routeCoverage[routeIndex] === 0 ? 720 : 0;
    const routeDeficit = routeCoverage[routeIndex] === weakestCoverage ? 280 : 0;
    const routeFit = Math.max(0, range - routeDistance) * .18;
    const score = coverageGain * 1000 + routeUncovered + routeDeficit + routeFit - Math.abs(road - 68) * 1.25 + supportSpacing + Math.abs(y - 270) * .03;
    candidates.push({ x, y, score, routeIndex, routeDistances });
  }
  candidates.forEach((candidate) => { if (!best || candidate.score > best.score) best = candidate; });
  return best;
}

function autoDeployRouteCoverage() {
  return pathInfo().map((route) => state.towers.reduce((count, tower) => count + (distanceToRoute(tower.x, tower.y, route) <= effectiveTowerRange(tower) ? 1 : 0), 0));
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
    const spot = autoSpot(unit); if (!spot) break;
    state.backpack = state.backpack.filter((item) => item.uid !== unit.uid);
    state.towers.push({ ...unit, x: spot.x, y: spot.y, cd: unit.cd || .15, hitTarget: null, hitCount: 0 });
    state.runFielded.add(unit.id); placed += 1;
  }
  return { name: candidate.bond.name, placed };
}

function autoDeploy() {
  if (state.tutorialStep >= 0 && state.tutorialStep < 4) { addLog('教学关请先手动选择妖灵，再点击道路两侧的合法位置。'); return; }
  const bondGroup = deployBestBondGroup();
  let placed = bondGroup?.placed || 0;
  while (state.backpack.length && usedPopulation() < state.maxPopulation) {
    const unitIndex = state.backpack.findIndex((unit) => !state.towers.some((tower) => tower.id === unit.id) && usedPopulation() + populationCostFor(unit) <= state.maxPopulation);
    if (unitIndex < 0) break;
    const unit = state.backpack[unitIndex];
    const spot = autoSpot(unit);
    if (!spot) break;
    state.backpack.splice(unitIndex, 1);
    state.towers.push({ ...unit, x: spot.x, y: spot.y, cd: .15, hitTarget: null, hitCount: 0 });
    state.runFielded.add(unit.id);
    placed += 1;
  }
  state.selectedUnitId = null;
  if (placed && state.tutorialStep === 2) beginTutorialBattle();
  if (placed || bondGroup) playSound('deploy');
  const uncoveredRoutes = autoDeployRouteCoverage().map((coverage, index) => coverage ? null : index + 1).filter(Boolean);
  const coverageNote = uncoveredRoutes.length ? `第 ${uncoveredRoutes.join('、')} 路尚无火力覆盖，请手动补位。` : (pathInfo().length > 1 && placed ? '双路均已有火力覆盖。' : '');
  addLog(`${bondGroup ? `一键部署优先凑成「${bondGroup.name}」，成员上场即生效；共新上场 ${placed} 只妖灵。` : placed ? `一键部署：${placed} 只不同名妖灵已部署到辅助范围内。` : '没有可部署的妖灵、人口或合法位置。'}${coverageNote ? ` ${coverageNote}` : ''}`);
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
  refs.backpackList.innerHTML = state.backpack.length ? orderedBackpackUnits().map((unit) => `<div class="backpack-entry">${unitCard(unit, `${state.selectedUnitId === unit.uid ? 'is-selected' : ''} ${state.fusionSelection.includes(unit.uid) ? 'is-fusing' : ''}`)}<button type="button" class="dismiss-unit" data-dismiss-unit="${unit.uid}" title="遣返并返还 ${DISMISS_COMPENSATION} 灵蕴">遣返 +${DISMISS_COMPENSATION}</button></div>`).join('') : '<p class="dialog-empty">背包为空。普通、高级召灵均可单抽或八折五连。</p>';
  refs.backpackList.querySelectorAll('[data-unit-id]').forEach((button) => button.addEventListener('click', () => {
    const uid = button.dataset.unitId;
    if (refs.fusionDialog.open) toggleFusionUnit(uid); else { selectUnit(uid); closeGameDialog(refs.backpackDialog); }
  }));
  refs.backpackList.querySelectorAll('[data-dismiss-unit]').forEach((button) => button.addEventListener('click', () => dismissBackpackUnit(button.dataset.dismissUnit)));
}

function dismissBackpackUnit(uid) {
  const unit = state.backpack.find((item) => item.uid === uid);
  if (!unit) return;
  const beast = beastDef(unit.id);
  if (!window.confirm(`确定遣返 ${beast.name} 吗？将返还 ${DISMISS_COMPENSATION} 灵蕴。`)) return;
  state.backpack = state.backpack.filter((item) => item.uid !== uid);
  if (state.selectedUnitId === uid) state.selectedUnitId = null;
  state.energy += DISMISS_COMPENSATION;
  addLog(`${beast.name}已遣返，返还 ${DISMISS_COMPENSATION} 灵蕴。`);
  renderGameRoster();
  renderBackpack();
  updateHUD();
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
  const runId = state.runId;
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
  showGameDialog(refs.fortuneDialog);
  playSound('fortune');
  addLog(`转运签：${result.name}。${result.text}`);
  updateHUD();
  state.fortuneTimers = [
    window.setTimeout(() => {
      if (runId !== state.runId || !state.fortuneSpinning) return;
      refs.fortuneResult.classList.add('is-revealed');
    }, 1580),
    window.setTimeout(() => {
      if (runId !== state.runId || !state.fortuneSpinning) return;
      closeFortuneDialog();
    }, 3000),
  ];
}

function openEvolutionChoice(completedWave) {
  const choices = Core.evolutionChoices(state.towers.map((tower) => tower.id), state.runSeed + completedWave * 97, state.runEvolutions);
  if (!choices.length) return;
  refs.evolutionChoices.innerHTML = choices.map((choice, index) => {
    const beast = beastDef(choice.beastId);
    return `<button type="button" data-evolution-index="${index}" class="evolution-choice rarity-${RARITIES[beast.rarity]}">${portraitMarkup(beast, true)}<span><em>${beast.name}</em><strong>${choice.name}</strong><small>${choice.copy}</small></span></button>`;
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
  tower.castPulse = 1;
  state.pendingTargetSkillUid = null;
  addVisualEffect('skillCast', tower.x, tower.y - 24, beastDef(tower.id).color, { size: 118 + beastDef(tower.id).rarity * 9, ttl: .78 });
  state.screenShake = Math.max(state.screenShake, 4.5);
  state.screenFlash = Math.max(state.screenFlash, .12);
  playSound('skill'); burst(tower.x, tower.y, beastDef(tower.id).color, 12);
  addLog(`${beastDef(tower.id).name}发动「${skill.name}」：${skillEffectText(skill)}。`);
  updateHUD();
}

function recallSelected() {
  const index = state.towers.findIndex((tower) => tower.uid === state.selectedTowerUid);
  if (index < 0) { addLog('请先点击场上的妖灵，再将其单独下场。'); return; }
  if (state.backpack.length >= MAX_BACKPACK) { addLog('背包已满，无法将这只妖灵下场。'); return; }
  const [tower] = state.towers.splice(index, 1);
  const { x, y, ...unit } = tower;
  state.backpack.push(unit);
  state.selectedTowerUid = null;
  state.selectedUnitId = unit.uid;
  state.selectedEnemy = null;
  state.pendingTargetSkillUid = null;
  addLog(`${beastDef(unit.id).name}已单独下场，收入背包。`);
  renderGameRoster();
  renderBackpack();
  renderGameBonds();
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
  const skillDef = { ...def, splash: 0, chain: 0, slow: 0, slowDur: 0, stunEvery: 0, breakAt: 0, dmgType: def.dmgType, counters: [...new Set([...(def.counters || []), ...(skill.type === 'armorBreak' ? ['breakShield'] : [])])], burn: Boolean(skill.burn), burnDps: def.burnDps || .22, color: def.color };
  const visible = state.enemies.filter((enemy) => canSeeEnemy(enemy, skillDef));
  const inRange = visible.filter((enemy) => Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= range).sort((a, b) => b.d - a.d);
  const damageableInRange = inRange.filter((enemy) => canDamageEnemy(enemy, skillDef));
  const target = canControlEnemy(explicitTarget, skillDef) ? explicitTarget : inRange[0] || null;
  const power = spiritSkillPower(tower);
  if (skill.type === 'split') {
    if (!damageableInRange.length) { addLog(`${skill.name}需要射程内存在可伤害敌军。`); return false; }
    tower.skillShots = Math.max(tower.skillShots || 0, skill.shots);
  } else if (skill.type === 'multishot') {
    if (!damageableInRange.length) { addLog(`${skill.name}当前没有可伤害目标。`); return false; }
    damageableInRange.slice(0, skill.count).forEach((enemy, index) => state.projectiles.push({ x: tower.x, y: tower.y - 38, target: enemy, amount: power * skill.mult, speed: def.projSpeed * 1.15, def: skillDef, source: tower, life: 0, seed: index + tower.id.length * 7, age: 0, trail: [] }));
  } else if (skill.type === 'targetStun') {
    if (!target || Math.hypot(target.x - tower.x, target.y - tower.y) > range) { addLog('指定目标不在技能射程内。'); return false; }
    target.stunned = Math.max(target.stunned || 0, skill.stun); damageEnemy(target, power * skill.mult, skillDef, 0, tower); addVisualEffect('arc', tower.x, tower.y - 40, def.color, { x2: target.x, y2: target.y - target.radius, size: 5, ttl: .4, seed: tower.uid.length * 29, depthY: Math.max(tower.y, target.y) }); addVisualEffect('rune', target.x, target.y - 10, def.color, { size: 86, ttl: .68 }); burst(target.x, target.y, def.color, 10);
  } else {
    if (!target && skill.type === 'area') { addLog(`${skill.name}当前没有可攻击目标。`); return false; }
    if (skill.type === 'area' && !skill.slow && !damageableInRange.length) { addLog(`${skill.name}当前没有可伤害目标。`); return false; }
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
    addVisualEffect(skill.type === 'area' ? (def.proj === 'quake' ? 'quakeImpact' : ['wisp', 'splash'].includes(def.proj) ? 'waterImpact' : 'skillImpact') : 'rune', center.x, center.y - 8, def.color, { size: Math.max(94, skill.radius * 1.45), ttl: .82, depthY: center.y });
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

let lastHudRenderAt = -Infinity;
function updateHUD(immediate = true) {
  const now = performance.now();
  if (!immediate && now - lastHudRenderAt < 100) return;
  lastHudRenderAt = now;
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
  refs.nextWave.hidden = state.phase !== 'rest' || state.waveCooldown <= 0;
  refs.nextWave.disabled = state.paused || state.phase !== 'rest' || state.waveCooldown <= 0;
  if (state.selectedEnemy?.hp <= 0 || !state.enemies.includes(state.selectedEnemy)) state.selectedEnemy = null;
  const selectedTower = state.towers.find((tower) => tower.uid === state.selectedTowerUid);
  const selectedEnemy = state.selectedEnemy;
  refs.backpackLabel.textContent = `${state.backpack.length}/${MAX_BACKPACK}`; refs.selectedUnitLabel.title = ''; refs.selectedUnitMeta.textContent = ''; refs.selectedUnitLabel.textContent = selected ? `${beastDef(selected.id).name} · ${RARITIES[beastDef(selected.id).rarity]} 局内Lv.${selected.level} · 人口 ${populationCostFor(selected)}` : selectedTower ? `${beastDef(selectedTower.id).name} · 按住立绘可移动` : selectedEnemy ? `${selectedEnemy.def.name} · HP ${Math.ceil(Math.max(0, selectedEnemy.hp))}/${Math.ceil(selectedEnemy.maxHp)}` : '点击召灵，随机请出已解锁妖灵';
  if (selected) refs.selectedUnitMeta.textContent = `${beastDef(selected.id).dmgType === 'mag' ? '法术' : beastDef(selected.id).dmgType === 'true' ? '真实' : '物理'} · ${counterEffectText(beastDef(selected.id))}`;
  refs.recallSelected.hidden = !state.selectedTowerUid;
  refs.recallSelected.disabled = state.backpack.length >= MAX_BACKPACK;
  if (selectedEnemy) { refs.selectedUnitLabel.title = selectedEnemyText(selectedEnemy); refs.selectedUnitMeta.textContent = selectedEnemyMeta(selectedEnemy); }
  const selectedSkill = selectedTower ? activeSkillFor(selectedTower.id) : null;
  const effectiveSkill = selectedTower && selectedSkill ? effectiveSkillStats(selectedTower, selectedSkill) : null;
  if (selectedTower && selectedSkill) {
    const towerDef = beastDef(selectedTower.id); const towerGrowth = growthFor(selectedTower.id); const damageType = towerDef.dmgType === 'mag' ? '法' : towerDef.dmgType === 'true' ? '真' : '物'; const attack = Math.round(towerDef.dmg * RARITY_POWER[towerDef.rarity] * towerGrowth.attack); const attacksPerSecond = towerGrowth.haste * (towerDef.rate || 1) / towerDef.interval; const detail = `${towerDef.name} · ${damageType}${attack}伤 · ${attacksPerSecond.toFixed(2)}/s`;
    refs.selectedUnitLabel.textContent = detail; refs.selectedUnitMeta.textContent = `射程 ${Math.round(effectiveTowerRange(selectedTower))} · ${counterEffectText(towerDef)} · 主动「${selectedSkill.name}」`; refs.selectedUnitLabel.title = `${detail} · 射程 ${Math.round(effectiveTowerRange(selectedTower))} · 法力 ${Math.floor(selectedTower.mana)}/${selectedTower.maxMana} · ${towerDef.kindText || ''}`;
  }
  refs.spiritSkill.disabled = state.paused || !selectedTower || !selectedSkill || selectedTower.skillCd > 0 || selectedTower.mana < effectiveSkill.mana;
  refs.spiritSkillLabel.textContent = state.pendingTargetSkillUid ? '点击目标' : !selectedSkill ? '选择妖灵' : selectedTower.skillCd > 0 ? `${selectedTower.skillCd.toFixed(1)}s` : selectedTower.mana < effectiveSkill.mana ? `法力 ${Math.floor(selectedTower.mana)}` : selectedSkill.name;
  refs.spiritSkill.title = selectedSkill ? `${selectedSkill.name} · ${skillEffectText(selectedSkill)} · 消耗 ${effectiveSkill.mana} 法力 · CD ${effectiveSkill.cooldown.toFixed(1)} 秒` : '选择场上妖灵后发动主动技能';
  const hasSingle = state.summonOffers.length > 0;
  const hasFive = state.advancedBatch.length > 0;
  const pendingNormalSingle = hasSingle && state.summonMode === 'normal';
  const pendingAdvancedSingle = hasSingle && state.summonMode === 'advanced';
  const pendingNormalFive = hasFive && state.advancedMode === 'normal';
  const pendingAdvancedFive = hasFive && state.advancedMode === 'advanced';
  const advancedAvailable = summonWeights('advanced').length > 0;
  refs.summonBeast.disabled = state.paused || hasFive || (hasSingle && !pendingNormalSingle) || (!hasSingle && (state.energy < SUMMON_COST || state.backpack.length >= MAX_BACKPACK)); refs.summonBeast.querySelector('span').textContent = pendingNormalSingle ? '查看普通结果' : `普通单抽 ${SUMMON_COST}`;
  refs.summonBeastFive.disabled = state.paused || state.tutorialStep === 0 || hasSingle || (hasFive && !pendingNormalFive) || (!hasFive && (state.energy < SUMMON_FIVE_COST || state.backpack.length + 5 > MAX_BACKPACK)); refs.summonBeastFive.querySelector('span').textContent = pendingNormalFive ? '领取普通五连' : `普通五连 ${SUMMON_FIVE_COST}`;
  refs.advancedSummon.disabled = !advancedAvailable || state.paused || state.tutorialStep === 0 || hasFive || (hasSingle && !pendingAdvancedSingle) || (!hasSingle && (state.energy < ADVANCED_SUMMON_COST || state.backpack.length >= MAX_BACKPACK)); refs.advancedSummon.querySelector('span').textContent = pendingAdvancedSingle ? '查看高级结果' : advancedAvailable ? `高级单抽 ${ADVANCED_SUMMON_COST}` : '试炼禁用'; refs.advancedSummon.title = advancedAvailable ? `高级单抽 ${ADVANCED_SUMMON_COST}` : `${currentTrialRule()?.name || '当前规则'}中禁用高级召灵`;
  refs.advancedSummonFive.disabled = !advancedAvailable || state.paused || state.tutorialStep === 0 || hasSingle || (hasFive && !pendingAdvancedFive) || (!hasFive && (state.energy < ADVANCED_FIVE_COST || state.backpack.length + 5 > MAX_BACKPACK)); refs.advancedSummonFive.querySelector('span').textContent = pendingAdvancedFive ? '领取高级五连' : advancedAvailable ? `高级五连 ${ADVANCED_FIVE_COST}` : '试炼禁用'; refs.advancedSummonFive.title = advancedAvailable ? `高级五连 ${ADVANCED_FIVE_COST}` : `${currentTrialRule()?.name || '当前规则'}中禁用高级召灵`;
  const hasBondCandidate = BOND_DEFS.some((bond) => bond.members.filter((id) => allOwnedUnits().some((unit) => unit.id === id)).length >= bond.need);
  refs.autoDeploy.disabled = (state.tutorialStep >= 0 && state.tutorialStep < 4) || (!hasBondCandidate && !state.backpack.some((unit) => !state.towers.some((tower) => tower.id === unit.id) && usedPopulation() + populationCostFor(unit) <= state.maxPopulation)); refs.recallAll.disabled = !state.towers.length || state.backpack.length >= MAX_BACKPACK;
  refs.fortuneSign.disabled = state.paused || state.fortuneSpinning || !state.towers.length || state.energy < FORTUNE_COST; refs.fortuneSign.querySelector('strong').textContent = state.fortuneSpinning ? '签轮转动中' : state.towers.length ? `转运签 ${FORTUNE_COST}` : '转运签 · 需上阵';
  refs.requiredBeastLabel.classList.toggle('is-complete', state.towers.some((tower) => tower.id === state.requiredBeastId));
  renderGameBonds();
}

function useSkill() {
  if (!state.skillBond || state.skillCooldowns[state.skillBond.id] > 0) return;
  const bond = state.skillBond; const source = { ...(bond.members[0] || state.towers[0] || { id: 'bond' }), combatStatsId: `bond:${bond.id}` };
  if (bond.skill !== 'restore' && !state.enemies.some((enemy) => enemy.hp > 0)) { addLog(`${bond.ult}需要敌军进入战场后才能发动。`); return; }
  const memberScale = 1 + Math.max(0, bond.members.length - bond.need) * .25;
  const nearby = (radius) => state.enemies.filter((enemy) => enemy.hp > 0 && bond.members.some((member) => Math.hypot(member.x - enemy.x, member.y - enemy.y) <= radius));
  const localRadius = { tide: 250, roar: 235, fire: 215 }[bond.skill];
  const localTargets = localRadius ? nearby(localRadius) : null;
  if (localTargets && !localTargets.length) { addLog(`${bond.ult}范围内没有敌军，技能未进入冷却。`); return; }
  playSound('skill');
  bond.members.forEach((member, index) => { member.castPulse = 1; addVisualEffect('skillCast', member.x, member.y - 24, bond.color, { size: 92 + index * 4, ttl: .72 }); });
  state.screenShake = Math.max(state.screenShake, 6.5);
  state.screenFlash = Math.max(state.screenFlash, .2);
  if (bond.skill === 'tide') {
    localTargets.forEach((enemy) => { enemy.slow = Math.max(enemy.slow, .6); enemy.slowTimer = Math.max(enemy.slowTimer, 3.2); burst(enemy.x, enemy.y, bond.color, 6); });
    localTargets.forEach((enemy) => addVisualEffect('waterImpact', enemy.x, enemy.y - 10, bond.color, { size: 68, ttl: .62, depthY: enemy.y }));
    addLog(`${bond.ult}发动：范围内敌军减速 60%，持续 3.2 秒。`);
  } else if (bond.skill === 'roar') {
    localTargets.forEach((enemy) => { enemy.stunned = Math.max(enemy.stunned || 0, 1.5); enemy.armorBreak = Math.max(enemy.armorBreak || 0, 8); enemy.armorBreakTimer = Math.max(enemy.armorBreakTimer || 0, 6); burst(enemy.x, enemy.y, bond.color, 7); });
    bond.members.forEach((member) => addVisualEffect('quakeImpact', member.x, member.y, bond.color, { size: 188, ttl: .75 }));
    addLog(`${bond.ult}发动：范围内敌军眩晕 1.5 秒并破甲 8，持续 6 秒。`);
  } else if (bond.skill === 'fire') {
    const amount = bond.members.reduce((sum, member) => sum + beastDef(member.id).dmg, 0) / bond.members.length * 3.4 * memberScale * (1 + bondTotals().power);
    localTargets.forEach((enemy) => damageEnemy(enemy, amount, { dmg: amount, dmgType: 'true', counters: ['execute', 'breakShield', 'purge'], color: bond.color, burn: true, burnDps: .22 }, 0, source));
    localTargets.forEach((enemy) => addVisualEffect('skillImpact', enemy.x, enemy.y - enemy.radius, bond.color, { size: 82, ttl: .65, depthY: enemy.y }));
    addLog(`${bond.ult}发动：范围内敌军承受 3.4 倍真伤并被灼烧。`);
  } else if (bond.skill === 'storm') {
    const amount = 95 * bond.ultMul * memberScale * (1 + bondTotals().power);
    state.enemies.forEach((enemy) => { damageEnemy(enemy, amount, { dmgType: 'true', counters: ['execute', 'breakShield', 'purge'], color: bond.color }, 0, source); enemy.stunned = Math.max(enemy.stunned || 0, .8); burst(enemy.x, enemy.y, bond.color, 8); });
    state.enemies.forEach((enemy, index) => addVisualEffect('arc', source.x || canvas.width * .5, (source.y || 50) - 36, bond.color, { x2: enemy.x, y2: enemy.y - enemy.radius, size: 4.5, ttl: .42, seed: index * 31, depthY: Math.max(source.y || 50, enemy.y) }));
    addLog(`${bond.ult}发动：全场雷击并短暂眩晕敌军。`);
  } else if (bond.skill === 'restore') {
    state.towers.forEach((tower) => { tower.mana = Math.min(tower.maxMana, tower.mana + tower.maxMana * .45); tower.skillCd = Math.max(0, tower.skillCd - 8); addVisualEffect('heal', tower.x, tower.y - 28, bond.color, { size: 88, ttl: .8 }); burst(tower.x, tower.y, bond.color, 5); });
    Object.keys(state.skillCooldowns).forEach((id) => { if (id !== bond.id) state.skillCooldowns[id] = Math.max(0, state.skillCooldowns[id] - 6); });
    addLog(`${bond.ult}发动：全军回复 45% 法力，妖灵技能恢复 8 秒。`);
  } else {
    const amount = 120 * bond.ultMul * memberScale * (1 + bondTotals().power);
    state.enemies.forEach((enemy) => damageEnemy(enemy, amount, { dmgType: 'true', counters: ['execute', 'breakShield', 'purge'], color: bond.color }, 0, source));
    state.enemies.forEach((enemy) => addVisualEffect('skillImpact', enemy.x, enemy.y - enemy.radius, bond.color, { size: 76, ttl: .55, depthY: enemy.y }));
    addLog(`${bond.ult}发动：全场真伤，${bond.name}完成联动。`);
  }
  state.skillCooldowns[bond.id] = (bond.cooldown || 18) * Math.max(.35, 1 - bondTotals().cdr);
  renderGameBonds();
}

function drawPath(route, level) {
  const [edge, road, light] = ROAD_PALETTES[state.stage];
  const trace = () => { ctx.beginPath(); route.points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(18, 14, 10, .42)'; ctx.shadowColor = 'rgba(10,7,5,.55)'; ctx.shadowBlur = 10; ctx.lineWidth = arena.roadW + 22; trace(); ctx.shadowBlur = 0;
  ctx.strokeStyle = edge; ctx.lineWidth = arena.roadW + 12; trace();
  const surface = ctx.createLinearGradient(0, 0, canvas.width, canvas.height); surface.addColorStop(0, road); surface.addColorStop(.52, light); surface.addColorStop(1, road); ctx.strokeStyle = surface; ctx.lineWidth = arena.roadW; trace();
  ctx.strokeStyle = light; ctx.globalAlpha = .2; ctx.lineWidth = arena.roadW - 11; trace();
  ctx.globalAlpha = .3; ctx.strokeStyle = '#fff2c5'; ctx.lineWidth = 2.2; ctx.setLineDash([10, 13]); ctx.lineDashOffset = -state.battleTime * 26; trace();
  ctx.globalAlpha = .13; ctx.lineWidth = arena.roadW - 22; ctx.setLineDash([2, 15]); ctx.lineDashOffset = state.battleTime * 13; trace();
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

const BACK_EFFECTS = new Set(['spawn', 'deploy', 'revive', 'rune', 'quakeImpact', 'skillCast', 'heal']);

function drawAttackFrame(image, frame, size, alpha = 1) {
  if (!image?.complete || !image.naturalWidth) return false;
  const cellW = image.naturalWidth / 2; const cellH = image.naturalHeight / 2;
  const sx = (frame % 2) * cellW; const sy = Math.floor(frame / 2) * cellH;
  ctx.globalAlpha *= alpha;
  ctx.drawImage(image, sx, sy, cellW, cellH, -size * .5, -size * .5, size, size);
  return true;
}

function drawVisualEffect(effect, layer = 'front') {
  const isBack = BACK_EFFECTS.has(effect.kind);
  if ((layer === 'back') !== isBack) return;
  const progress = 1 - effect.life / effect.maxLife;
  const fade = clamp(effect.life / Math.min(effect.maxLife, .28), 0, 1);
  const size = effect.size || 64;
  ctx.save();
  ctx.translate(effect.x, effect.y);
  ctx.globalAlpha = fade;
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = effect.color;
  ctx.fillStyle = effect.color;
  ctx.shadowColor = effect.color;

  if (effect.kind === 'arc') {
    const dx = effect.x2 - effect.x; const dy = effect.y2 - effect.y; const length = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / length; const ny = dx / length; const segments = Math.max(6, Math.ceil(length / 24));
    const trace = (offset = 0) => {
      ctx.beginPath();
      for (let index = 0; index <= segments; index += 1) {
        const t = index / segments;
        const envelope = Math.sin(t * Math.PI);
        const jitter = Math.sin(index * 8.73 + effect.seed + progress * 18) * 7 * envelope + offset;
        const x = dx * t + nx * jitter; const y = dy * t + ny * jitter;
        if (index) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.stroke();
    };
    ctx.shadowBlur = 15; ctx.lineWidth = effect.size || 4; trace();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#f5ffff'; ctx.globalAlpha *= .82; ctx.lineWidth = Math.max(1, (effect.size || 4) * .32); trace(1.2);
  } else if (effect.kind === 'muzzle') {
    ctx.rotate(effect.angle || 0); ctx.shadowBlur = 18;
    const radius = size * (.48 + progress * .4);
    ctx.beginPath(); ctx.arc(0, 0, radius * .34, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha *= .72; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-radius * .55, 0); ctx.lineTo(radius, 0); ctx.stroke();
    for (let index = -1; index <= 1; index += 1) { ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(radius * .6, index * radius * .28); ctx.stroke(); }
  } else if (effect.kind === 'slashImpact') {
    ctx.rotate(-.65 + progress * .35); ctx.shadowBlur = 12; ctx.lineWidth = 3.5;
    for (let index = -1; index <= 1; index += 1) { ctx.beginPath(); ctx.arc(index * 5, 0, size * (.28 + progress * .26), -1.05, .72); ctx.stroke(); }
  } else if (effect.kind === 'quakeImpact') {
    ctx.globalAlpha *= 1 - progress * .68; ctx.shadowBlur = 8;
    for (let ring = 0; ring < 3; ring += 1) { const radius = size * (.16 + progress * .42 + ring * .09); ctx.lineWidth = Math.max(1, 5 - ring); ctx.beginPath(); ctx.ellipse(0, 12, radius, radius * .28, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.lineWidth = 2;
    for (let index = 0; index < 6; index += 1) { const angle = index * Math.PI / 3 + effect.seed; ctx.beginPath(); ctx.moveTo(Math.cos(angle) * 8, 12 + Math.sin(angle) * 3); ctx.lineTo(Math.cos(angle) * size * .42, 12 + Math.sin(angle) * size * .14); ctx.stroke(); }
  } else if (effect.kind === 'waterImpact') {
    const frame = Math.min(3, Math.floor(progress * 4));
    ctx.rotate(progress * .12);
    ctx.shadowBlur = 18;
    if (!drawAttackFrame(attackSprites.splash, frame, size * (1 + progress * .25), .9)) { ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, size * progress * .5, 0, Math.PI * 2); ctx.stroke(); }
  } else if (effect.kind === 'shield') {
    ctx.globalAlpha *= 1 - progress; ctx.shadowBlur = 20; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(0, 0, size * .52, size * .38, 0, -.25, Math.PI * 1.25); ctx.stroke();
    ctx.strokeStyle = '#f3ffff'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.ellipse(0, 0, size * .46, size * .33, 0, -.25, Math.PI * 1.25); ctx.stroke();
  } else if (effect.kind === 'spawn' || effect.kind === 'deploy' || effect.kind === 'revive' || effect.kind === 'skillCast' || effect.kind === 'rune' || effect.kind === 'heal') {
    const open = Math.sin(Math.min(1, progress * 1.6) * Math.PI * .5);
    ctx.rotate(effect.seed + progress * (effect.kind === 'skillCast' ? 1.4 : .7));
    ctx.globalAlpha *= effect.kind === 'heal' ? .72 : .88;
    ctx.shadowBlur = effect.kind === 'skillCast' ? 22 : 12;
    for (let ring = 0; ring < 2; ring += 1) { const radius = size * (.22 + ring * .12 + progress * .13) * open; ctx.lineWidth = ring ? 1.5 : 3; ctx.beginPath(); ctx.arc(0, 9, radius, ring ? .5 : 0, ring ? Math.PI * 1.85 : Math.PI * 2); ctx.stroke(); }
    ctx.lineWidth = 2;
    for (let index = 0; index < 8; index += 1) { const angle = index * Math.PI / 4; const inner = size * .28 * open; const outer = size * (.36 + (index % 2) * .08) * open; ctx.beginPath(); ctx.moveTo(Math.cos(angle) * inner, 9 + Math.sin(angle) * inner); ctx.lineTo(Math.cos(angle) * outer, 9 + Math.sin(angle) * outer); ctx.stroke(); }
    if (effect.kind === 'revive' || effect.kind === 'heal') { ctx.globalAlpha *= .55; ctx.fillStyle = '#effff3'; for (let index = 0; index < 7; index += 1) { const angle = effect.seed + index * 2.1; const rise = progress * size * .55; ctx.beginPath(); ctx.arc(Math.sin(angle) * size * .3, 14 - rise + (index % 3) * 13, 2.4, 0, Math.PI * 2); ctx.fill(); } }
  } else if (effect.kind === 'death' || effect.kind === 'breach' || effect.kind === 'skillImpact' || effect.kind === 'impact') {
    const radius = size * (.12 + progress * .48);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, radius));
    glow.addColorStop(0, '#ffffff'); glow.addColorStop(.18, effect.color); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha *= 1 - progress * .72; ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = effect.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, radius * 1.05, 0, Math.PI * 2); ctx.stroke();
    if (effect.kind === 'death' || effect.kind === 'breach') { for (let index = 0; index < 8; index += 1) { const angle = index * Math.PI / 4 + effect.seed; ctx.beginPath(); ctx.moveTo(Math.cos(angle) * radius * .25, Math.sin(angle) * radius * .25); ctx.lineTo(Math.cos(angle) * radius * 1.3, Math.sin(angle) * radius * 1.3); ctx.stroke(); } }
  }
  ctx.restore();
}

function drawDefeated(defeated) {
  const sprite = combatSpriteFor(defeated.type);
  if (!sprite?.complete || !sprite.naturalWidth) return;
  const progress = 1 - defeated.life / defeated.maxLife;
  const depth = .9 + defeated.y / canvas.height * .13;
  const spriteWidth = defeated.size * (sprite.naturalWidth / Math.max(1, sprite.naturalHeight));
  ctx.save(); ctx.translate(defeated.x, defeated.y);
  ctx.globalAlpha = clamp(defeated.life / defeated.maxLife, 0, 1) * .72;
  ctx.rotate((defeated.facing > 0 ? 1 : -1) * progress * .18);
  ctx.scale((defeated.facing > 0 ? -1 : 1) * depth * (1 + progress * .08), depth * (1 - progress * .32));
  ctx.filter = lowPowerEffects ? 'none' : `grayscale(${Math.round(progress * 70)}%) brightness(${1 + progress * .35}) drop-shadow(0 8px 7px rgba(20,12,8,.45))`;
  ctx.drawImage(sprite, -spriteWidth * .5, 12 - defeated.size, spriteWidth, defeated.size);
  ctx.restore();
}

function drawParticle(particle) {
  const alpha = clamp(particle.life / particle.maxLife, 0, 1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha; ctx.fillStyle = particle.color; ctx.shadowColor = particle.color; ctx.shadowBlur = lowPowerEffects ? 0 : 7;
  ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.size * (.55 + alpha * .65), 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawProjectile(projectile) {
  const color = projectile.def.color;
  const kind = projectile.def.proj;
  const dx = projectile.target.x - projectile.x;
  const dy = projectile.target.y - projectile.target.radius * 1.15 - projectile.y;
  const angle = Math.atan2(dy, dx);
  const variant = projectile.seed || 0;
  const phase = state.battleTime * (7 + variant % 5) + variant * .13;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  if (projectile.trail.length > 1) {
    ctx.globalAlpha = kind === 'claw' ? .42 : .68;
    ctx.strokeStyle = color;
    ctx.shadowColor = color; ctx.shadowBlur = 10;
    ctx.lineWidth = kind === 'quake' ? 5 : kind === 'splash' ? 4 : 3;
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
  const attackSize = kind === 'quake' ? 66 : kind === 'claw' ? 56 : kind === 'splash' ? 60 : kind === 'wisp' ? 48 : 46;
  const renderedAttackSprite = attackSprite?.complete && attackSprite.naturalWidth && attackCellW && attackCellH;
  if (renderedAttackSprite) {
    const sx = (attackFrame % 2) * attackCellW;
    const sy = Math.floor(attackFrame / 2) * attackCellH;
    ctx.globalCompositeOperation = 'lighter';
    if (!lowPowerEffects) { ctx.save(); ctx.globalAlpha = .32; ctx.filter = 'blur(6px)'; ctx.drawImage(attackSprite, sx, sy, attackCellW, attackCellH, -attackSize * .62, -attackSize * .62, attackSize * 1.24, attackSize * 1.24); ctx.restore(); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .96; ctx.filter = lowPowerEffects ? 'none' : 'drop-shadow(0 2px 3px rgba(0,0,0,.35))';
    ctx.drawImage(attackSprite, sx, sy, attackCellW, attackCellH, -attackSize * .5, -attackSize * .5, attackSize, attackSize);
    ctx.filter = 'none';
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
  ctx.globalAlpha = .62;
  const moteCount = 1 + variant % 4;
  const moteRadius = 7 + variant % 6;
  for (let i = 0; i < moteCount; i += 1) {
    const moteAngle = phase * .55 + i * Math.PI * 2 / moteCount;
    ctx.beginPath();
    ctx.arc(Math.cos(moteAngle) * moteRadius - 2, Math.sin(moteAngle) * moteRadius * .55, 1 + variant % 3 * .35, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = color; ctx.globalAlpha = .28; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(-2, 0, attackSize * .56, attackSize * .22, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function drawCanvas() {
  const level = currentLevel(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); drawStageBackdrop();
  const shake = reducedMotion ? 0 : state.screenShake;
  ctx.save(); ctx.translate(Math.sin(state.battleTime * 57) * shake * .55, Math.cos(state.battleTime * 71) * shake * .34);
  drawStageAtmosphere(level);
  pathInfo(level).forEach((route) => drawPath(route, level));
  levelSeals(level).forEach(([x, y], index) => drawSeal(x, y, level, index));
  levelSpawns(level).forEach(([x, y], index) => drawSpawnFissure(x, y, level, index));
  const movingTower = state.draggingTowerIndex >= 0 ? state.towers[state.draggingTowerIndex] : null;
  const placingUnit = selectedUnit();
  if (state.mouse.inside && (placingUnit || movingTower)) {
    const ignore = movingTower ? state.draggingTowerIndex : -1;
    const previewX = state.mouse.x + (movingTower ? state.draggingTowerOffset.x : 0); const previewY = state.mouse.y + (movingTower ? state.draggingTowerOffset.y : 0);
    const legal = canPlaceAt(previewX, previewY, ignore);
    const previewDef = beastDef((placingUnit || movingTower).id);
    const previewRange = movingTower ? effectiveTowerRange(movingTower) : previewRangeFor(placingUnit, previewX, previewY);
    const ritual = fxSprites['summon-ritual'];
    if (ritual?.complete && ritual.naturalWidth) { const size = 86 + Math.sin(state.battleTime * 4) * 3; ctx.save(); ctx.globalAlpha = legal ? .72 : .24; ctx.drawImage(ritual, previewX - size * .5, previewY - size * .5, size, size); ctx.restore(); }
    ctx.save(); ctx.strokeStyle = legal ? 'rgba(93, 213, 180, .78)' : 'rgba(226, 74, 56, .86)'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.arc(previewX, previewY, previewRange, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    for (let gy = -1; gy <= 1; gy += 1) for (let gx = -1; gx <= 1; gx += 1) { const hx = previewX + gx * minBeastSpacing; const hy = previewY + gy * minBeastSpacing; if (canPlaceAt(hx, hy, ignore)) { ctx.fillStyle = 'rgba(102, 221, 188, .22)'; ctx.strokeStyle = 'rgba(151, 239, 210, .64)'; ctx.beginPath(); ctx.arc(hx, hy, 17, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); } }
    ctx.restore();
  }
  const selectedTower = state.towers.find((tower) => tower.uid === state.selectedTowerUid);
  if (selectedTower && !movingTower) { const def = beastDef(selectedTower.id); const range = effectiveTowerRange(selectedTower); const support = supportSkillFor(selectedTower.id); ctx.save(); ctx.strokeStyle = `${def.color}9a`; ctx.lineWidth = 1.5; ctx.setLineDash([7, 6]); ctx.beginPath(); ctx.arc(selectedTower.x, selectedTower.y, range, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = 'rgba(111, 214, 181, .62)'; ctx.setLineDash([3, 8]); ctx.beginPath(); ctx.arc(selectedTower.x, selectedTower.y, support.radius, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  state.visualEffects.forEach((effect) => drawVisualEffect(effect, 'back'));
  renderQueue.length = 0;
  state.towers.forEach((item) => { item.renderType = 'tower'; renderQueue.push(item); });
  state.enemies.forEach((item) => { item.renderType = 'enemy'; renderQueue.push(item); });
  state.defeated.forEach((item) => { item.renderType = 'defeated'; renderQueue.push(item); });
  state.projectiles.forEach((item) => { item.renderType = 'projectile'; renderQueue.push(item); });
  state.visualEffects.forEach((item) => { if (!BACK_EFFECTS.has(item.kind)) { item.renderType = 'effect'; renderQueue.push(item); } });
  renderQueue.sort((a, b) => (a.depthY ?? a.y) - (b.depthY ?? b.y) || renderDepth[a.renderType] - renderDepth[b.renderType]);
  renderQueue.forEach((item) => { if (item.renderType === 'tower') drawTower(item); else if (item.renderType === 'enemy') drawEnemy(item); else if (item.renderType === 'defeated') drawDefeated(item); else if (item.renderType === 'projectile') drawProjectile(item); else drawVisualEffect(item, 'front'); });
  state.particles.forEach(drawParticle);
  const hitSpark = fxSprites['hit-spark'];
  if (hitSpark?.complete && hitSpark.naturalWidth) state.hitBursts.forEach((item) => { const progress = 1 - item.life / item.maxLife; const size = item.size * (.72 + progress * .72); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = clamp(item.life / .2, 0, 1); ctx.filter = 'drop-shadow(0 0 8px rgba(255,240,190,.8))'; ctx.drawImage(hitSpark, item.x - size * .5, item.y - size * .5, size, size); ctx.restore(); });
  state.damageTexts.forEach((item) => { const alpha = clamp(item.life / item.maxLife, 0, 1); ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = item.color; ctx.strokeStyle = 'rgba(29,20,14,.82)'; ctx.lineWidth = 3; ctx.font = `900 ${Math.round(13 * item.scale)}px Segoe UI`; ctx.textAlign = 'center'; ctx.strokeText(item.text, item.x, item.y); ctx.fillText(item.text, item.x, item.y); ctx.restore(); });
  ctx.restore();
  ctx.drawImage(vignetteTexture, 0, 0);
  if (state.screenFlash > 0) { ctx.fillStyle = `rgba(255,239,192,${state.screenFlash * .34})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
}

function drawTower(tower) {
  const def = beastDef(tower.id); const sprite = combatSpriteFor(tower.id); const size = towerVisualSize(tower);
  const depth = depthScaleAt(tower.y);
  const selected = state.selectedTowerUid === tower.uid;
  const bob = reducedMotion ? 0 : Math.sin(state.battleTime * 2.45 + tower.x * .013) * 2.1;
  const pulse = .5 + Math.sin(state.battleTime * 3.2 + tower.y * .02) * .5;
  const recoil = reducedMotion ? 0 : tower.recoil || 0;
  const attackAngle = tower.attackAngle ?? Math.PI;
  const attackPulse = reducedMotion ? 0 : Math.sin(clamp((tower.attackFlash || 0), 0, 1) * Math.PI);
  const attackStyle = def.proj === 'claw' ? 'lunge' : def.proj === 'quake' ? 'heavy' : 'cast';
  ctx.save(); ctx.translate(tower.x, tower.y);
  ctx.globalAlpha = .82; ctx.drawImage(groundShadowTexture, -size * .46 * depth, 7, size * .92 * depth, 23 * depth); ctx.globalAlpha = 1;
  if (selected || tower.castPulse > 0 || tower.attackFlash > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = def.color; ctx.shadowColor = def.color; ctx.shadowBlur = 12 + tower.castPulse * 16; ctx.globalAlpha = selected ? .82 : .3 + tower.castPulse * .48 + tower.attackFlash * .3; ctx.lineWidth = selected ? 3 : 2;
    ctx.beginPath(); ctx.ellipse(0, 14, size * (.31 + pulse * .015 + tower.castPulse * .08), 10 + tower.castPulse * 6, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  ctx.fillStyle = 'rgba(46,35,24,.62)'; ctx.strokeStyle = def.color; ctx.lineWidth = selected ? 2.8 : 1.35; ctx.globalAlpha = selected ? 1 : .78;
  ctx.beginPath(); ctx.ellipse(0, 15, size * .3, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
  if (sprite?.complete && sprite.naturalWidth) {
    const facingRight = Math.cos(attackAngle) > 0;
    const motionX = attackStyle === 'lunge' ? Math.cos(attackAngle) * attackPulse * 14 : 0;
    const motionY = attackStyle === 'heavy' ? attackPulse * 5 : attackStyle === 'cast' ? -attackPulse * 2 : attackPulse;
    const motionRotation = attackStyle === 'lunge' ? Math.sin(attackAngle) * attackPulse * .12 : attackStyle === 'heavy' ? attackPulse * .04 : -attackPulse * .03;
    const stretchX = attackStyle === 'heavy' ? 1 + attackPulse * .08 : 1 + attackPulse * .025;
    const stretchY = attackStyle === 'heavy' ? 1 - attackPulse * .08 : attackStyle === 'lunge' ? 1 + attackPulse * .045 : 1 + attackPulse * .03;
    const spriteWidth = size * (sprite.naturalWidth / Math.max(1, sprite.naturalHeight));
    ctx.save(); ctx.translate(-Math.cos(attackAngle) * recoil * 5 + motionX, -recoil * 3 + motionY); ctx.rotate(Math.sin(state.battleTime * 1.8 + tower.x) * .008 - Math.sin(attackAngle) * recoil * .025 + motionRotation); ctx.scale((facingRight ? -1 : 1) * depth * stretchX, depth * stretchY);
    ctx.filter = lowPowerEffects ? (tower.attackFlash > 0 ? `brightness(${1 + tower.attackFlash * .45})` : 'none') : `brightness(${1 + tower.attackFlash * .36 + tower.castPulse * .18}) saturate(${1.06 + tower.castPulse * .22}) drop-shadow(0 7px 6px rgba(24,14,9,.48)) drop-shadow(0 0 ${4 + tower.attackFlash * 12}px ${def.color})`;
    ctx.drawImage(sprite, -spriteWidth * .5, 15 - size + bob, spriteWidth, size);
    ctx.restore();
  } else if (beastAtlas.complete && beastAtlas.naturalWidth) {
    const cellW = beastAtlas.naturalWidth / 6; const cellH = beastAtlas.naturalHeight / 5; const sx = (def.portraitIndex % 6) * cellW; const sy = Math.floor(def.portraitIndex / 6) * cellH;
    ctx.save(); ctx.beginPath(); ctx.roundRect(-34, -62 + bob, 68, 68, 9); ctx.clip(); ctx.drawImage(beastAtlas, sx, sy, cellW, cellH, -34, -62 + bob, 68, 68); ctx.restore(); ctx.strokeStyle = def.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(-34, -62 + bob, 68, 68, 9); ctx.stroke();
  } else { ctx.fillStyle = def.color; ctx.font = 'bold 18px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(def.name.slice(0, 1), 0, 2); }
  ctx.fillStyle = 'rgba(37,29,21,.9)'; ctx.strokeStyle = 'rgba(233,204,139,.48)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(-20, 23, 40, 14, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff0bd'; ctx.font = '900 9px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(`Lv.${tower.level}`, 0, 33);
  ctx.fillStyle = 'rgba(18,20,29,.88)'; ctx.beginPath(); ctx.roundRect(-25, 40, 50, 6, 3); ctx.fill(); const mana = clamp((tower.mana || 0) / Math.max(1, tower.maxMana || 1), 0, 1); ctx.fillStyle = tower.skillCd > 0 ? '#8c76ad' : '#61bdce'; ctx.beginPath(); ctx.roundRect(-25, 40, 50 * mana, 6, 3); ctx.fill();
  ctx.restore();
}

function drawEnemy(enemy) {
  const isBoss = enemy.role !== 'normal' || enemy.def.boss;
  const sprite = combatSpriteFor(enemy.type); const radius = enemy.radius * 1.35; const size = enemyVisualSize(enemy); const depth = .88 + enemy.y / canvas.height * .17;
  const spawn = .3 + (enemy.spawnScale || 0) * .7; const visibility = enemy.stealthTimer > 0 ? .32 : 1; const walk = reducedMotion ? 0 : Math.sin(enemy.walkPhase || 0); const hit = clamp((enemy.hitFlash || 0) / .18, 0, 1);
  ctx.save(); ctx.translate(enemy.x, enemy.y); ctx.globalAlpha = visibility;
  if (state.selectedEnemy === enemy) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#f0c968'; ctx.shadowColor = '#f0c968'; ctx.shadowBlur = 12; ctx.lineWidth = 2.5; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.ellipse(0, 8, size * .48, size * .2, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  ctx.globalAlpha = visibility * spawn * .74; ctx.drawImage(groundShadowTexture, -size * .4 * depth * spawn, 5, size * .8 * depth * spawn, 21 * depth * spawn); ctx.globalAlpha = visibility;
  if (isBoss) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = enemy.def.color; ctx.shadowColor = enemy.def.color; ctx.shadowBlur = 18; ctx.globalAlpha *= .24 + Math.sin(state.battleTime * 3.2) * .06; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, 9, size * (.37 + Math.sin(state.battleTime * 2.1) * .018), size * .12, 0, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -size * .36, size * .42, state.battleTime * .3, state.battleTime * .3 + Math.PI * 1.55); ctx.stroke(); ctx.restore(); }
  if (sprite?.complete && sprite.naturalWidth) {
    const facingRight = enemy.facing > 0;
    const spriteWidth = size * (sprite.naturalWidth / Math.max(1, sprite.naturalHeight));
    ctx.save(); ctx.translate(enemy.hitKick * hit * 7, -Math.abs(walk) * 1.7); ctx.rotate(walk * .012 + enemy.hitKick * hit * .035); ctx.scale((facingRight ? -1 : 1) * depth * spawn * (1 - hit * .025), depth * spawn * (1 + hit * .045 + walk * .012));
    ctx.filter = lowPowerEffects ? (hit > 0 ? `brightness(${1.2 + hit * 1.1})` : 'none') : hit > 0 ? `brightness(${1.2 + hit * 1.2}) saturate(${1 + hit * .55}) drop-shadow(0 8px 7px rgba(22,13,9,.5)) drop-shadow(0 0 ${Math.round(hit * 12)}px ${enemy.def.color})` : 'drop-shadow(0 8px 7px rgba(22,13,9,.5))';
    ctx.drawImage(sprite, -spriteWidth * .5, 12 - size, spriteWidth, size);
    ctx.restore();
  } else if (enemyAtlas.complete && enemyAtlas.naturalWidth) {
    const cellW = enemyAtlas.naturalWidth / 5; const cellH = enemyAtlas.naturalHeight / 2; const sx = (enemy.def.sprite % 5) * cellW; const sy = Math.floor(enemy.def.sprite / 5) * cellH;
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(enemyAtlas, sx, sy, cellW, cellH, -radius, -radius, radius * 2, radius * 2); ctx.restore();
  } else { ctx.fillStyle = enemy.def.color; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#f1ecdf'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(enemy.def.name.slice(0, 1), 0, 3); }
  ctx.globalAlpha = 1; const barWidth = Math.min(92, Math.max(42, radius * (isBoss ? 3.7 : 2.8))); const rawTop = 8 - size * depth - (isBoss ? 8 : 2); const top = Math.max((isBoss ? 24 : 10) - enemy.y, rawTop);
  if (isBoss) { ctx.fillStyle = '#f4e2b0'; ctx.strokeStyle = 'rgba(31,22,16,.8)'; ctx.lineWidth = 3; ctx.font = '900 11px STKaiti, KaiTi, serif'; ctx.textAlign = 'center'; ctx.strokeText(enemy.def.name, 0, top - 7); ctx.fillText(enemy.def.name, 0, top - 7); }
  ctx.fillStyle = 'rgba(27,20,16,.9)'; ctx.beginPath(); ctx.roundRect(-barWidth * .5, top, barWidth, isBoss ? 8 : 6, 3); ctx.fill(); const hpRatio = clamp(enemy.hp / enemy.maxHp, 0, 1); ctx.fillStyle = hpRatio < .25 ? '#df5542' : '#58b693'; ctx.beginPath(); ctx.roundRect(-barWidth * .5, top, barWidth * hpRatio, isBoss ? 8 : 6, 3); ctx.fill();
  if (enemy.shield > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#a9e8ed'; ctx.shadowColor = '#84dce8'; ctx.shadowBlur = 12; ctx.globalAlpha = .52 + Math.sin(state.battleTime * 4) * .12; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -size * depth * .34, size * depth * .42, size * depth * .48, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  if (enemy.stunned > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#f0d46f'; ctx.lineWidth = 2; ctx.globalAlpha = .8; ctx.beginPath(); ctx.ellipse(0, top - 14, 15, 5, state.battleTime * 2, 0, Math.PI * 2); ctx.stroke(); for (let index = 0; index < 3; index += 1) { const angle = state.battleTime * 3 + index * Math.PI * 2 / 3; ctx.fillStyle = '#fff1a8'; ctx.beginPath(); ctx.arc(Math.cos(angle) * 14, top - 14 + Math.sin(angle) * 5, 2, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
  ctx.restore();
}

function renderCodex() {
  const projectileNames = { ember: '焰火', splash: '溅射', wisp: '灵光', claw: '裂爪', quake: '地裂' };
  refs.codexDialogList.innerHTML = ROSTER.map((beast) => {
    const data = beastDef(beast.id); const growth = growthFor(beast.id); const locked = !state.unlocked.has(beast.id); const skill = activeSkillFor(beast.id); const support = supportSkillFor(beast.id); const effects = [data.burn ? '灼烧' : '', data.splash ? `溅射 ${data.splash}` : '', data.chain ? `连锁 ${data.chain}` : '', data.slow ? `减速 ${Math.round(data.slow * 100)}%` : '', data.stunEvery ? `每 ${data.stunEvery} 次眩晕` : '', data.breakAt ? `第 ${data.breakAt} 击破甲` : ''].filter(Boolean).join(' · ') || '基础攻击';
    const nextXp = growth.level >= BEAST_MAX_LEVEL ? '已满阶' : `${growth.xp - growth.currentFloor}/${growth.nextFloor - growth.currentFloor} XP`;
    return `<article class="codex-entry rarity-${RARITIES[beast.rarity]} ${locked ? 'is-locked' : ''}">${portraitMarkup(beast, true)}<div class="codex-entry-head"><strong>${beast.name}</strong><em>${locked ? '未解锁' : RARITIES[beast.rarity]}</em></div><small>${locked ? unlockHint(beast.id) : `${projectileNames[data.proj] || data.proj} · ${data.dmgType === 'mag' ? '法术' : data.dmgType === 'true' ? '真实' : '物理'} · ${counterEffectText(data)}`}</small><dl><div><dt>攻击</dt><dd>${Math.round(data.dmg * RARITY_POWER[data.rarity] * growth.attack)}</dd></div><div><dt>攻速</dt><dd>${(1 / (data.interval / growth.haste)).toFixed(2)}/s</dd></div><div><dt>范围</dt><dd>${Math.round(data.range * growth.range)}</dd></div><div><dt>人口</dt><dd>${populationCostFor(beast.id)}</dd></div></dl><p>${locked ? '通关解锁后进入召灵池' : `灵阶 ${growth.level} · ${nextXp} · 上场 ${growth.appearances} · 击杀 ${growth.kills}<br>${effects}<br>主动「${skill.name}」：${skillEffectText(skill)} · ${skill.mana} 法力 / ${skill.cooldown}s<br>辅助「${support.name}」：${supportEffectText(support)}`}</p></article>`;
  }).join('');
}

function tick(timestamp) {
  const rawDt = Math.min(.05, (timestamp - state.lastTime) / 1000 || 0); state.lastTime = timestamp;
  if (state.screen === 'game' && !state.paused) {
    const simDt = rawDt * state.speed;
    state.battleTime += simDt;
    Object.keys(state.skillCooldowns).forEach((id) => { state.skillCooldowns[id] = Math.max(0, state.skillCooldowns[id] - simDt); });
    const frameBondState = bondsForTowers();
    activeCombatBondTotals = frameBondState.totals;
    try {
      spawnFromGroups(simDt); updateTowers(simDt, frameBondState); updateProjectiles(simDt); updateEnemies(simDt); updateEffects(simDt); updateHUD(false);
    } finally { activeCombatBondTotals = null; }
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
    const target = state.enemies.filter((enemy) => canControlEnemy(enemy, tower ? beastDef(tower.id) : null) && enemyContainsPoint(enemy, point)).sort((a, b) => b.y - a.y)[0];
    if (!tower || !target) addLog('请点击敌军立绘指定技能目标。');
    else castSpiritSkill(tower, target);
    return;
  }
  const clickedEnemy = state.enemies.filter((enemy) => enemy.hp > 0 && enemyContainsPoint(enemy, point)).sort((a, b) => b.y - a.y)[0];
  if (clickedEnemy) {
    state.selectedEnemy = clickedEnemy;
    state.selectedTowerUid = null;
    state.selectedUnitId = null;
    refs.arenaHint.textContent = selectedEnemyText(clickedEnemy);
    updateHUD();
    return;
  }
  if (selectedUnit()) { placeTower(point.x, point.y); return; }
  let index = -1; let frontY = -Infinity;
  state.towers.forEach((tower, towerIndex) => { if (tower.y >= frontY && towerContainsPoint(tower, point)) { index = towerIndex; frontY = tower.y; } });
  if (index >= 0) {
    state.draggingTowerIndex = index;
    state.draggingTowerOffset = { x: state.towers[index].x - point.x, y: state.towers[index].y - point.y };
    state.selectedTowerUid = state.towers[index].uid;
    state.selectedEnemy = null;
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
      const dropX = point.x + state.draggingTowerOffset.x; const dropY = point.y + state.draggingTowerOffset.y;
      const moved = Math.hypot(dropX - state.towers[index].x, dropY - state.towers[index].y) > 3;
      if (!moved) {
        state.mouse.inside = true;
      } else if (canPlaceAt(dropX, dropY, index)) {
        state.towers[index].x = dropX; state.towers[index].y = dropY;
        addLog(`${beastDef(state.towers[index].id).name}已移阵。`);
      } else addLog('落点不合法，妖灵返回原位。');
    }
    state.draggingTowerOffset = { x: 0, y: 0 };
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
document.addEventListener('pointercancel', () => { state.draggingUnitId = null; state.draggingTowerIndex = -1; state.draggingTowerOffset = { x: 0, y: 0 }; state.mouse.inside = false; });
refs.startGame.addEventListener('click', startStandardGame);
refs.endlessStart.addEventListener('click', startEndlessGame);
refs.trialStart.addEventListener('click', startTrialGame);
refs.resumeGame.addEventListener('click', resumeWaveGame);
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
refs.nextWave.addEventListener('click', startNextWaveEarly);
refs.recallAll.addEventListener('click', recallAll);
refs.recallSelected.addEventListener('click', recallSelected);
refs.fortuneSign.addEventListener('click', openFortuneSign);
refs.openFusion.addEventListener('click', () => { if (state.backpack.length < 2) { addLog('背包中至少需要两只妖灵才能合成。'); return; } refs.backpackDialog.close(); openFusion(); });
refs.fuseBeasts.addEventListener('click', fuseSelected);
refs.summonClose.addEventListener('click', () => closeGameDialog(refs.summonDialog));
refs.advancedClose.addEventListener('click', () => closeGameDialog(refs.advancedDialog));
refs.backpackClose.addEventListener('click', () => closeGameDialog(refs.backpackDialog));
refs.fusionClose.addEventListener('click', () => closeGameDialog(refs.fusionDialog));
refs.fortuneClose.addEventListener('click', closeFortuneDialog);
refs.bondsClose.addEventListener('click', () => closeGameDialog(refs.bondsDialog));
refs.medalsOpen.addEventListener('click', () => { renderMedals(); refs.medalsDialog.showModal(); });
refs.medalsClose.addEventListener('click', () => refs.medalsDialog.close());
refs.audioSettings.addEventListener('click', () => { renderAudioControls(); showGameDialog(refs.audioDialog); });
refs.audioClose.addEventListener('click', () => closeGameDialog(refs.audioDialog));
[
  refs.summonDialog, refs.advancedDialog, refs.backpackDialog, refs.fusionDialog, refs.bondsDialog, refs.audioDialog,
].forEach((dialog) => dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeGameDialog(dialog); }));
refs.evolutionDialog.addEventListener('cancel', (event) => event.preventDefault());
refs.medalsDialog.addEventListener('cancel', (event) => { event.preventDefault(); refs.medalsDialog.close(); });
refs.fortuneDialog.addEventListener('cancel', (event) => { event.preventDefault(); closeFortuneDialog(); });
refs.pauseDialog.addEventListener('cancel', (event) => { event.preventDefault(); resumePauseMenu(); });
refs.codexOpen.addEventListener('click', () => { renderCodex(); refs.codexDialog.showModal(); });
refs.codexClose.addEventListener('click', () => refs.codexDialog.close());
refs.codexDialog.addEventListener('click', (event) => { if (event.target === refs.codexDialog) refs.codexDialog.close(); });
function confirmAbandonGame() {
  return state.screen === 'game' && window.confirm('确定放弃本局并返回关卡吗？本局不会获得出场保底经验。');
}
function abandonGame() {
  if (!confirmAbandonGame()) return;
  finishGame(false, true);
}
refs.backToSelect.addEventListener('click', abandonGame);
refs.returnSelect.addEventListener('click', () => { showScreen('select'); renderSelect(); });
refs.replayGame.addEventListener('click', initGame);
refs.pauseGame.addEventListener('click', openPauseMenu);
refs.pauseResume.addEventListener('click', resumePauseMenu);
refs.pauseRetry.addEventListener('click', () => { refs.pauseDialog.close(); initGame(); });
refs.pauseExit.addEventListener('click', () => { if (!confirmAbandonGame()) return; refs.pauseDialog.close(); state.paused = false; finishGame(false, true); });
refs.speedGame.addEventListener('click', () => {
  const speeds = threeSpeedUnlocked() ? [1, 2, 3] : [1, 2];
  state.speed = speeds[(speeds.indexOf(state.speed) + 1) % speeds.length];
  if (!threeSpeedUnlocked() && state.speed === 2) addLog('3倍速将在任意难度通关全部五关后永久解锁。');
  updateHUD();
});
refs.soundToggle.addEventListener('click', () => setSoundEnabled(!state.soundEnabled, true));
refs.fullscreenToggle.addEventListener('click', toggleFullscreen);
refs.audioEnabled.addEventListener('change', () => setSoundEnabled(refs.audioEnabled.checked, true));
refs.musicVolume.addEventListener('input', () => {
  state.musicVolume = clamp(Number(refs.musicVolume.value) / 100, 0, 1);
  updateAudioMix();
  renderAudioControls();
});
refs.musicVolume.addEventListener('change', saveProgress);
refs.sfxVolume.addEventListener('input', () => {
  state.sfxVolume = clamp(Number(refs.sfxVolume.value) / 100, 0, 1);
  updateAudioMix();
  renderAudioControls();
});
refs.sfxVolume.addEventListener('change', saveProgress);
refs.spiritSkill.addEventListener('click', useSpiritSkill);
refs.teamSkill.addEventListener('click', useSkill);
async function resetSave() {
  if (!window.confirm('确定重置全部局外进度吗？此操作不可撤销。')) return;
  const resetPayload = JSON.stringify({ savedAt: Date.now(), progressionVersion: PROGRESSION_VERSION, scoringVersion: SCORING_VERSION, xp: 0, tier: 0, bestScores: {}, difficulty: 'normal', unlocked: [...BASE_UNLOCK_IDS], completions: [], medals: [], beastGrowth: {}, soundEnabled: true, musicVolume: .28, sfxVolume: 1 });
  let local = true;
  let desktop = true;
  try {
    localStorage.removeItem(LEGACY_SAVE_KEY);
    localStorage.setItem(SAVE_KEY, resetPayload);
  } catch { local = false; }
  try {
    desktop = await queueDesktopSave(resetPayload);
  } catch { desktop = false; }
  loadSave();
  updateAudioMix();
  renderAudioControls();
  renderSelect();
  document.querySelector('#save-status').textContent = local && desktop ? '存档已重置' : local ? '浏览器存档已重置，桌面存档失败' : desktop ? '桌面存档已重置，浏览器存档失败' : '存档重置失败，请重试';
}
document.querySelector('#reset-save').addEventListener('click', resetSave);
document.querySelector('[data-start-tutorial]').addEventListener('click', () => { state.mode = 'standard'; state.tutorialMode = true; state.stage = 0; state.difficulty = 'easy'; initGame(); });

function acceptsDesktopShortcut(event) {
  const target = event.target;
  return !event.defaultPrevented && !event.repeat && !event.altKey && !event.ctrlKey && !event.metaKey && !event.isComposing && !(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement) && !target?.isContentEditable;
}

document.addEventListener('keydown', (event) => {
  if (!acceptsDesktopShortcut(event)) return;
  const openDialog = document.querySelector('dialog[open]');
  if (event.code === 'KeyF' && !openDialog) {
    event.preventDefault();
    toggleFullscreen();
    return;
  }
  if (state.screen !== 'game' || (openDialog && openDialog !== refs.pauseDialog)) return;
  if (event.code === 'Space' || event.code === 'KeyP') {
    event.preventDefault();
    if (state.paused) resumePauseMenu(); else openPauseMenu();
    return;
  }
  if (event.code === 'KeyN' && !state.paused && state.phase === 'rest') {
    event.preventDefault();
    startNextWaveEarly();
  }
});

function fitAppToViewport() {
  const shell = document.querySelector('#app-shell');
  const portrait = window.innerHeight > window.innerWidth;
  const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
  shell.style.transform = `translate(-50%, -50%) scale(${scale})`;
  document.body.classList.toggle('is-portrait', portrait);
  document.documentElement.style.setProperty('--ui-scale', scale);
}

function supportsFullscreen() {
  return typeof document.querySelector('#app-shell')?.requestFullscreen === 'function';
}

function syncFullscreenToggle() {
  const supported = supportsFullscreen();
  refs.fullscreenToggle.hidden = !supported;
  if (!supported) return;
  const active = document.fullscreenElement === document.querySelector('#app-shell');
  const label = active ? '退出全屏' : '进入全屏';
  refs.fullscreenToggle.classList.toggle('is-active', active);
  refs.fullscreenToggle.title = label;
  refs.fullscreenToggle.setAttribute('aria-label', label);
  refs.fullscreenToggle.setAttribute('aria-pressed', String(active));
}

async function toggleFullscreen() {
  if (!supportsFullscreen()) {
    addLog('当前浏览器不支持全屏，已保持横屏适配。');
    return;
  }
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.querySelector('#app-shell').requestFullscreen();
  } catch {
    addLog('浏览器未允许进入全屏，已保持横屏适配。');
  }
  syncFullscreenToggle();
}

function pauseForBackground() {
  if (state.screen !== 'game' || state.paused) return;
  state.paused = true;
  state.backgroundPaused = true;
  updateAmbientState();
  addLog('窗口已切到后台，战局自动暂停；回到游戏后点击继续守关。');
  updateHUD();
}

document.addEventListener('visibilitychange', () => { if (document.hidden) pauseForBackground(); });
window.addEventListener('blur', pauseForBackground);

window.addEventListener('resize', fitAppToViewport);
document.addEventListener('fullscreenchange', () => {
  syncFullscreenToggle();
  requestAnimationFrame(fitAppToViewport);
});
document.addEventListener('fullscreenerror', () => {
  syncFullscreenToggle();
});
fitAppToViewport();

document.querySelector('#build-label')?.replaceChildren(BUILD_ID);
loadSave();
renderAudioControls();
syncFullscreenToggle();
renderSelect(); showScreen('select'); requestAnimationFrame(tick);

window.__shanHaiDebug = { state, ROSTER, BEASTS, ACTIVE_SKILLS, SUPPORT_SKILLS, BOND_DEFS, LEVELS, WAVES, DIFFICULTIES, growthFor, applyProgressUnlocks, resultGrade, canPlaceAt, pathInfo, castSpiritSkill, bondsForTowers, supportBonusesFor };
