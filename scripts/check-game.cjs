const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.join(__dirname, '..');
const Core = require(path.join(root, 'shared', 'game-core.js'));
assert.equal(Core.SUMMON_RULES.normal.cost, 20);
assert.deepEqual(Core.SUMMON_RULES.normal.swaps, [8, 16]);
assert.equal(Core.SUMMON_RULES.normal.weights.reduce((sum, pair) => sum + pair[1], 0), 100);
assert.equal(Core.SUMMON_RULES.advanced.weights.reduce((sum, pair) => sum + pair[1], 0), 100);
assert.equal(Core.passiveBonus('qinglong', 0).targets, 0);
assert.equal(Core.passiveBonus('qinglong', 12).targets, 1);
assert.equal(Core.evolutionChoices(['bifang', 'dayu'], 7).length, 3);
assert(Core.medalAwards({ won:true, hp:10, maxHp:10, difficulty:'normal', urCount:0, maxRarity:1, activeBonds:3, requiredFielded:true, maxGrowthKills:20, clearedAll:false, clearedHardAll:false, mode:'standard', wave:15 }).includes('perfect_seal'));

const noop = () => {};
const context = new Proxy({}, { get(target, key) { if (!(key in target)) target[key] = noop; return target[key]; }, set(target, key, value) { target[key] = value; return true; } });
const fakeCanvas = { width:0, height:0, getContext:() => context, createImage:() => ({ loaded:false, width:600, height:500 }), requestAnimationFrame:noop };
global.wx = {
  createCanvas:() => fakeCanvas,
  getWindowInfo:() => ({ windowWidth:1280, windowHeight:720, pixelRatio:1 }),
  getStorageSync:() => ({}), setStorageSync:noop, onTouchStart:noop,
};
const miniGame = require(path.join(root, 'wechatgame', 'src', 'main.js'));
miniGame.startGame();
assert.equal(miniGame.state.screen, 'game');
assert.equal(miniGame.state.wave, 0);
assert.equal(miniGame.state.hp, 10);
assert.equal(miniGame.LEVELS.length, 5);
assert.equal(miniGame.WAVES.length, 15);
const startEnergy = miniGame.state.energy;
miniGame.openSummon('normal', 1);
assert.equal(miniGame.state.summonOffers.length, 2);
assert.equal(miniGame.state.energy, startEnergy - 20);
miniGame.swapOffers();
assert.equal(miniGame.state.summonSwap, 1);
assert.equal(miniGame.state.energy, startEnergy - 28);
miniGame.swapOffers();
assert.equal(miniGame.state.summonSwap, 2);
assert.equal(miniGame.state.energy, startEnergy - 44);
miniGame.receive(miniGame.state.summonOffers[0]);
assert.equal(miniGame.state.modal, '');
console.log('shared core and WeChat Mini Game smoke checks passed');
