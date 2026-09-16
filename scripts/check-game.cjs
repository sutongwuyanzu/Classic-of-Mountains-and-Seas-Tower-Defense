const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const preload = fs.readFileSync(path.join(root, 'electron', 'preload.cjs'), 'utf8');
const startServer = fs.readFileSync(path.join(root, 'scripts', 'start-dev-server.ps1'), 'utf8');
assert.match(packageJson.buildId, /^sol-[a-z0-9-]+$/);
assert.match(indexHtml, new RegExp(`shan-hai-build" content="${packageJson.buildId}"`));
assert.match(indexHtml, new RegExp(`src="\\./src/main.js\\?v=${packageJson.buildId}"`));
assert.match(indexHtml, new RegExp(`href="\\./styles.css\\?v=${packageJson.buildId}"`));
assert.match(indexHtml, /id="result-recap"/);
assert.match(indexHtml, /id="trial-start"/);
assert.match(indexHtml, /id="resume-game"/);
assert.match(indexHtml, /id="selected-unit-meta"/);
assert.match(styles, /@media \(max-width: 900px\) and \(max-height: 500px\) and \(orientation: landscape\)/);
assert.match(styles, /grid-template-columns: repeat\(2, 81px\)/);
assert.match(styles, /\.summon-dock \{\s*left: 176px;\s*bottom: 10px;\s*width: 924px;\s*height: 82px;/);
const desktopGame = fs.readFileSync(path.join(root, 'src', 'main.js'), 'utf8');
assert.match(desktopGame, /function combatRecap\(\)/);
assert.match(desktopGame, /runStats: \{ damageByBeast: \{\}, shieldByBeast: \{\}, breachesByRoute: \{\}, sealLost: 0, waves: \[\] \}/);
assert.match(desktopGame, /function gameRandom\(stream = 'draw'\)/);
assert.match(desktopGame, /function startTrialGame\(\)/);
assert.match(desktopGame, /function createWaveSnapshot\(\)/);
assert.match(desktopGame, /function resumeWaveGame\(\)/);
assert.match(desktopGame, /function counterEffectText\(def\)/);
assert.match(desktopGame, /function portraitMarkup\(beast, fullArt = false\)/);
assert.match(desktopGame, /function drawStageBackdrop\(\)/);
assert.match(desktopGame, /function updateHUD\(immediate = true\)/);
assert.match(desktopGame, /updateEffects\(simDt\); updateHUD\(false\);/);
assert.match(desktopGame, /成员：\$\{bond\.members/);
assert.match(desktopGame, /还需 \$\{Math\.max\(0, bond\.need - count\)\} 名/);
assert.match(desktopGame, /counter === 'breakShield' && def\?\.breakShield === true/);
assert.match(desktopGame, /function damageEnemy\(enemy, amount, def, special = 0, source = null\) \{\s*if \(!canSeeEnemy\(enemy, def\)\) return;/);
assert.match(preload, /buildId/);
assert.match(startServer, /package\.json/);
assert.equal(fs.readFileSync(path.join(root, 'shared', 'game-core.js'), 'utf8'), fs.readFileSync(path.join(root, 'wechatgame', 'shared', 'game-core.js'), 'utf8'));
const Core = require(path.join(root, 'shared', 'game-core.js'));
const miniData = require(path.join(root, 'wechatgame', 'src', 'data.js'));
assert.equal(Core.SUMMON_RULES.normal.cost, 20);
assert.deepEqual(Core.SUMMON_RULES.normal.swaps, [8, 16]);
assert.equal(Core.SUMMON_RULES.normal.weights.reduce((sum, pair) => sum + pair[1], 0), 100);
assert.equal(Core.SUMMON_RULES.advanced.weights.reduce((sum, pair) => sum + pair[1], 0), 100);
assert.equal(Core.passiveBonus('qinglong', 0).targets, 0);
assert.equal(Core.passiveBonus('qinglong', 12).targets, 1);
assert.equal(Core.evolutionChoices(['bifang', 'dayu'], 7).length, 3);
assert(Core.medalAwards({ won:true, hp:10, maxHp:10, difficulty:'normal', urCount:0, maxRarity:1, activeBonds:3, requiredFielded:true, maxGrowthKills:20, clearedAll:false, clearedHardAll:false, mode:'standard', wave:15 }).includes('perfect_seal'));
const canonicalCombatStats = {
  bifang:[20,1.15,168,'mag'], fuzhu:[15,.92,155,'mag'], jiuwei:[25,1.48,175,'mag'], tiangou:[17,.82,145,'phy'], xuangui:[34,1.85,138,'phy'],
  shengsheng:[27,1.2,165,'phy'], kaiming:[22,.98,155,'mag'], bo:[31,1.55,170,'phy'], zheng:[19,.74,150,'phy'],
  qiuniu:[21,1.12,174,'mag'], yazi:[38,1.7,145,'phy'], chaofeng:[18,.86,182,'mag'], pulao:[24,1.1,165,'mag'], suanni:[29,1.38,154,'mag'], bixi:[44,2.1,132,'phy'], bian:[20,.82,166,'phy'], fuxi_long:[32,1.35,178,'mag'], chiwen:[23,.94,190,'mag'],
  dayu:[40,1.7,184,'true'], gonggong:[35,1.42,180,'true'], qinglong:[50,1.55,206,'mag'], baihu:[66,1.9,160,'phy'], zhuque:[45,1.22,194,'mag'], xuanwu:[32,.9,188,'true'], huangdi:[41,1.3,190,'true'], fuxi:[38,1.05,215,'mag'], nuwa:[36,1.15,200,'true'],
};
assert.deepEqual(Object.fromEntries(miniData.ROSTER.map((item) => [item.id, [item.dmg, item.interval, item.range, item.dmgType]])), canonicalCombatStats);
assert.deepEqual(miniData.LEVELS.map((item) => item.essence), [56, 62, 70, 78, 86]);
assert.equal(miniData.ROSTER.find((item) => item.id === 'bifang').splash, false);
assert.equal(miniData.ROSTER.find((item) => item.id === 'jiuwei').chain, 2);
assert.equal(miniData.ROSTER.find((item) => item.id === 'zheng').slow, .18);
assert.match(fs.readFileSync(path.join(root, 'wechatgame', 'src', 'main.js'), 'utf8'), /const RARITY_POWER = \[1, 1\.03, 1\.08, 1\.16, 1\.3\]/);
assert.equal(miniData.BONDS.length, 13);
assert.deepEqual(miniData.BONDS.map((bond) => [bond.id, bond.stat, bond.bonus, bond.stepBonus]), [
  ['wild','power',.14,.07], ['fierce','haste',.12,.06], ['dragon_sky','haste',.16,0], ['dragon_earth','sunder',.2,0], ['dragon_tide','range',.14,0], ['sishou','range',.1,.06], ['renzu','cdr',.16,.1], ['zhishui','sunder',.16,0], ['yanhuo','power',.1,.08], ['shuize','enemySlow',.09,.06], ['night_fire','haste',.09,0], ['frost_shell','enemySlow',.08,0], ['beast_hunt','range',.12,0],
]);
assert(miniData.BONDS.every((bond) => bond.ult && bond.skill && bond.cooldown > 0 && bond.ultMul > 0));
assert.deepEqual(miniData.SUPPORT_SKILLS.fuxi, ['河图拓界','range',.18,225]);
assert.deepEqual(miniData.SUPPORT_SKILLS.xuanwu, ['玄冥灵泉','manaRegen',.48,215]);

const noop = () => {};
let onHideHandler = null;
let writtenSave = null;
const context = new Proxy({}, { get(target, key) { if (!(key in target)) target[key] = noop; return target[key]; }, set(target, key, value) { target[key] = value; return true; } });
const fakeCanvas = { width:0, height:0, getContext:() => context, createImage:() => ({ loaded:false, width:600, height:500 }), requestAnimationFrame:noop };
global.wx = {
  createCanvas:() => fakeCanvas,
  getWindowInfo:() => ({ windowWidth:1280, windowHeight:720, pixelRatio:1 }),
  getStorageSync:() => ({ completions: [0, '0:normal', '99:normal', '01:normal', '1:invalid', '1:normal'] }), setStorageSync:(_key, value) => { writtenSave = value; }, onTouchStart:noop, onHide:(handler) => { onHideHandler = handler; },
};
const miniGame = require(path.join(root, 'wechatgame', 'src', 'main.js'));
miniGame.startGame();
assert.equal(miniGame.state.screen, 'game');
assert.equal(miniGame.state.wave, 0);
assert.equal(miniGame.state.hp, 10);
assert.deepEqual([...miniGame.state.completions].sort(), ['0:normal', '1:normal']);
assert.deepEqual(writtenSave.completions, ['0:normal', '1:normal']);
assert.equal(typeof onHideHandler, 'function');
onHideHandler();
assert.equal(miniGame.state.paused, true);
miniGame.state.paused = false;
miniGame.startGame(true);
assert.equal(miniGame.state.tutorialMode, true);
assert.equal(miniGame.state.tutorialStep, 0);
assert.equal(miniGame.state.phase, 'tutorial');
miniGame.openSummon('normal', 1);
miniGame.receive(miniGame.state.summonOffers[0]);
assert.equal(miniGame.state.tutorialStep, 1);
const tutorialUnit = miniGame.state.backpack[0];
miniGame.selectBackpackUnit(tutorialUnit.uid);
assert.equal(miniGame.state.tutorialStep, 2);
miniGame.placeSelected(500, 500);
assert.equal(miniGame.state.tutorialMode, false);
assert.equal(miniGame.state.tutorialCompleted, true);
assert.equal(miniGame.state.phase, 'prep');
assert.equal(miniGame.state.cooldown, 3);
assert.equal(writtenSave.tutorialCompleted, true);
assert.equal(miniGame.LEVELS.length, 5);
assert.equal(miniGame.WAVES.length, 15);
miniGame.state.stage = 0;
assert.equal(miniGame.waveTemplate(6).at(-1)[0], 'shanxiao');
miniGame.state.stage = 1;
assert.equal(miniGame.waveTemplate(1).at(-1)[0], 'fei');
miniGame.state.stage = 2;
assert.equal(miniGame.waveTemplate(5).at(-1)[0], 'huali');
miniGame.state.energy = 100;
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
miniGame.state.stage = 3;
miniGame.startGame();
miniGame.state.wave = 1;
miniGame.startWave();
assert.equal(miniGame.state.groups.length, 3);
assert.equal(miniGame.state.groups[2].type, 'bashe');
assert.equal(miniGame.state.groups[2].route, 0);
miniGame.state.phase = 'rest';
miniGame.state.backpack = [
  { uid: 'auto-a', id: 'bifang', level: 1, cd: .1, skillCd: 0, mana: 100, growthKills: 0 },
  { uid: 'auto-b', id: 'fuzhu', level: 1, cd: .1, skillCd: 0, mana: 100, growthKills: 0 },
];
miniGame.autoDeploy();
assert.equal(miniGame.state.towers.length, 2);
const stageRoutes = miniGame.LEVELS[3].routes;
const routeDistance = (x, y, route) => Math.min(...route.slice(1).map((point, index) => {
  const a = route[index]; const b = point; const vx = b[0] - a[0]; const vy = b[1] - a[1];
  const ratio = Math.max(0, Math.min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / Math.max(1, vx * vx + vy * vy)));
  return Math.hypot(x - a[0] - vx * ratio, y - a[1] - vy * ratio);
}));
const coveredRoutes = (routes) => routes.map((route) => miniGame.state.towers.some((tower) => {
  const range = miniGame.ROSTER.find((item) => item.id === tower.id).range;
  return routeDistance(tower.x, tower.y, route) <= range;
}));
assert.deepEqual(coveredRoutes(stageRoutes), [true, true]);
miniGame.state.stage = 4;
miniGame.startGame();
miniGame.state.phase = 'rest';
miniGame.state.backpack = [
  { uid: 'merge-a', id: 'bifang', level: 1, cd: .1, skillCd: 0, mana: 100, growthKills: 0 },
];
miniGame.autoDeploy();
const mergedRoutes = miniGame.LEVELS[4].routes;
assert.deepEqual(coveredRoutes(mergedRoutes), [true, true]);
miniGame.state.phase = 'rest';
miniGame.state.cooldown = 10;
miniGame.state.modal = '';
const earlyEnergy = miniGame.state.energy;
miniGame.nextWave();
assert.equal(miniGame.state.energy, earlyEnergy + 3);
miniGame.state.towers = [];
miniGame.state.selectedTowerUid = null;
const maxUnit = { uid: 'check-max', id: 'bifang', level: 9, cd: .1, skillCd: 0, mana: 100, growthKills: 0 };
miniGame.state.energy = 0;
miniGame.state.backpack = [maxUnit];
miniGame.state.summonRemaining = 1;
miniGame.receive(miniGame.ROSTER.find((item) => item.id === 'bifang'));
assert.equal(miniGame.state.energy, 12);
miniGame.state.towers = [{ ...maxUnit, x: 300, y: 300 }];
miniGame.state.backpack = [];
miniGame.state.selectedTowerUid = maxUnit.uid;
miniGame.recallSelected();
assert.equal(miniGame.state.towers.length, 0);
assert.equal(miniGame.state.backpack[0].uid, maxUnit.uid);
const source = { uid: 'check-source' };
const immuneEnemy = miniGame.spawnEnemy('huali', 1, 0);
const magicDef = miniGame.ROSTER.find((item) => item.id === 'bifang');
const nonPurgeMagicDef = miniGame.ROSTER.find((item) => item.id === 'fuzhu');
const immuneHp = immuneEnemy.hp;
miniGame.damageEnemy(immuneEnemy, 100, source, nonPurgeMagicDef);
assert.equal(immuneEnemy.hp, immuneHp);
miniGame.damageEnemy(immuneEnemy, 100, source, magicDef);
assert(immuneEnemy.hp < immuneHp);
const shieldEnemy = miniGame.spawnEnemy('zhuyan', 1, 0);
const shieldHp = shieldEnemy.hp;
miniGame.damageEnemy(shieldEnemy, 100, source, magicDef);
assert.equal(shieldEnemy.hp, shieldHp);
assert.equal(shieldEnemy.shield, 70);
const breakerDef = miniGame.ROSTER.find((item) => item.id === 'bo');
const overflowEnemy = miniGame.spawnEnemy('zhuyan', 1, 0);
overflowEnemy.shield = 10;
const overflowHp = overflowEnemy.hp;
miniGame.damageEnemy(overflowEnemy, 100, source, breakerDef);
assert.equal(overflowEnemy.shield, 0);
assert(overflowEnemy.hp < overflowHp);
const legacyShieldEnemy = miniGame.spawnEnemy('zhuyan', 1, 0);
legacyShieldEnemy.shield = 10;
miniGame.damageEnemy(legacyShieldEnemy, 100, source, { ...breakerDef, counters: [], breakShield: true });
assert.equal(legacyShieldEnemy.shield, 0);
const stealthEnemy = miniGame.spawnEnemy('wangliang', 1, 0);
const stealthHp = stealthEnemy.hp;
miniGame.damageEnemy(stealthEnemy, 100, source, magicDef);
assert.equal(stealthEnemy.hp, stealthHp);
const insightDef = miniGame.ROSTER.find((item) => item.id === 'fuzhu');
miniGame.damageEnemy(stealthEnemy, 100, source, insightDef);
assert(stealthEnemy.hp < stealthHp);

function setupCombatTarget(towerId, enemyType, difficulty = 'normal') {
  miniGame.state.stage = 0;
  miniGame.state.difficulty = difficulty;
  miniGame.state.screen = 'game';
  miniGame.state.phase = 'combat';
  miniGame.state.wave = 0;
  miniGame.state.speed = 1;
  miniGame.state.hp = 10;
  miniGame.state.bossEscaped = false;
  miniGame.state.runKills = {};
  miniGame.state.runFielded = new Set();
  miniGame.state.runEvolutions = {};
  miniGame.state.growthSettled = false;
  miniGame.state.growthAwardedKills = {};
  miniGame.state.victoryGrowthAwarded = false;
  miniGame.state.resultBreakdown = null;
  miniGame.state.paused = false;
  miniGame.state.modal = '';
  miniGame.state.finished = false;
  miniGame.state.groups = null;
  miniGame.state.towers = [];
  miniGame.state.enemies = [];
  miniGame.state.projectiles = [];
  const enemy = miniGame.spawnEnemy(enemyType, 1, 0);
  const towerDef = miniGame.ROSTER.find((item) => item.id === towerId);
  const maxMana = 72 + towerDef.rarity * 11;
  const manaRegen = 2.7 + towerDef.rarity * .35;
  miniGame.state.towers = [{ uid: `contract-${towerId}-${enemyType}`, id: towerId, level: 1, cd: 0, skillCd: 0, mana: maxMana, maxMana, manaRegen, growthKills: 0, x: enemy.x - 100, y: enemy.y }];
  miniGame.state.selectedTowerUid = miniGame.state.towers[0].uid;
  return { enemy, tower: miniGame.state.towers[0] };
}

const immuneCombat = setupCombatTarget('fuzhu', 'huali');
miniGame.update(.01);
assert.equal(miniGame.state.projectiles.length, 0);
assert(immuneCombat.tower.cd <= 0);

const purgeCombat = setupCombatTarget('bifang', 'huali');
miniGame.update(.01);
assert.equal(miniGame.state.projectiles.length, 1);

const shieldChip = setupCombatTarget('fuzhu', 'xingxing');
shieldChip.enemy.shield = 100;
const shieldChipHp = shieldChip.enemy.hp;
miniGame.update(.01);
assert.equal(miniGame.state.projectiles.length, 1);
miniGame.update(.3);
assert(shieldChip.enemy.shield < 100);
assert.equal(shieldChip.enemy.hp, shieldChipHp);

const shieldBreak = setupCombatTarget('bo', 'xingxing');
shieldBreak.enemy.shield = 10;
const shieldBreakHp = shieldBreak.enemy.hp;
miniGame.update(.01);
miniGame.update(.3);
assert.equal(shieldBreak.enemy.shield, 0);
assert(shieldBreak.enemy.hp < shieldBreakHp);

const hiddenCombat = setupCombatTarget('bifang', 'wangliang');
miniGame.update(.01);
assert.equal(miniGame.state.projectiles.length, 0);

const insightCombat = setupCombatTarget('fuzhu', 'wangliang');
  miniGame.update(.01);
  assert.equal(miniGame.state.projectiles.length, 1);
insightCombat.enemy.stealthTimer = 0;
insightCombat.tower.cd = 1;
const insightHp = insightCombat.enemy.hp;
miniGame.update(.3);
assert(insightCombat.enemy.hp < insightHp);

const purgeSkill = setupCombatTarget('bifang', 'huali');
const skillMana = purgeSkill.tower.mana;
miniGame.castSkill();
assert(purgeSkill.tower.mana < skillMana);
assert(purgeSkill.tower.skillCd > 0);

const scaledSkill = setupCombatTarget('bifang', 'xingxing', 'easy');
miniGame.state.growth = { bifang:{ xp:0, appearances:0, kills:0 } };
miniGame.state.tier = 0;
scaledSkill.tower.level = 9;
scaledSkill.tower.growthKills = 30;
scaledSkill.enemy.hp = 10000;
scaledSkill.enemy.maxHp = 10000;
const scaledSkillHp = scaledSkill.enemy.hp;
miniGame.castSkill();
const scaledSkillExpected = 20 * 1.08 * 3.2 * (1 + Core.passiveBonus('bifang', 30).power) * (1 + 8 * .26) * 2.2;
assert(Math.abs(scaledSkillHp - scaledSkill.enemy.hp - scaledSkillExpected) < 1e-9);

const controlSkill = setupCombatTarget('fuxi', 'huali');
miniGame.castSkill();
assert.equal(controlSkill.enemy.stunned, 6);
assert.equal(controlSkill.tower.mana, 62);
assert.equal(controlSkill.tower.skillCd, 21);

const multiSkill = setupCombatTarget('jiuwei', 'xingxing');
miniGame.spawnEnemy('xingxing', 1, 0, 40);
miniGame.castSkill();
assert.equal(miniGame.state.projectiles.length, 2);
assert.equal(multiSkill.tower.mana, 36);
assert.equal(multiSkill.tower.skillCd, 16);

const slowSkill = setupCombatTarget('fuzhu', 'xingxing');
miniGame.castSkill();
assert.equal(slowSkill.enemy.slow, .52);
assert.equal(slowSkill.tower.mana, 42);

const armorSkill = setupCombatTarget('bo', 'bashe');
miniGame.castSkill();
assert.equal(armorSkill.enemy.armorBreak, 14);

const shieldCombat = setupCombatTarget('bo', 'zhuyan');
const shieldCombatHp = shieldCombat.enemy.hp;
miniGame.update(.01);
assert.equal(miniGame.state.projectiles.length, 1);
miniGame.update(.3);
assert(shieldCombat.enemy.shield < 100);
assert.equal(shieldCombat.enemy.hp, shieldCombatHp);

const easyMagic = setupCombatTarget('bifang', 'huali', 'easy');
miniGame.update(.01);
assert.equal(miniGame.state.projectiles.length, 1);

const hardPhysical = setupCombatTarget('bo', 'bashe', 'hard');
miniGame.update(.01);
assert.equal(miniGame.state.projectiles.length, 0);

const urCombat = setupCombatTarget('qinglong', 'xingxing');
miniGame.update(.01);
assert.equal(miniGame.state.projectiles.length, 1);
assert.equal(urCombat.tower.level, 1);
assert.equal(miniGame.state.projectiles[0].damage, 65);

miniGame.state.towers = [
  { uid:'bond-a', id:'bifang', x:300, y:300 }, { uid:'bond-b', id:'fuzhu', x:340, y:300 }, { uid:'bond-c', id:'jiuwei', x:380, y:300 }, { uid:'bond-d', id:'tiangou', x:420, y:300 },
];
assert(Math.abs(miniGame.bondState().totals.power - .21) < 1e-9);
assert.equal(miniGame.bondState().active.find((bond) => bond.id === 'wild')?.name, '山野同气');
miniGame.state.towers = [
  { uid:'support-source', id:'fuxi', x:300, y:300 }, { uid:'support-target', id:'bifang', x:500, y:300 },
];
assert.equal(miniGame.supportBonus(miniGame.state.towers[1]).range, .18);
assert(miniGame.effectiveTowerRange(miniGame.state.towers[1]) > miniGame.ROSTER.find((item) => item.id === 'bifang').range);
miniGame.state.towers[1].x = 600;
assert.equal(miniGame.supportBonus(miniGame.state.towers[1]).range, 0);

miniGame.state.screen = 'game';
miniGame.state.phase = 'combat';
miniGame.state.paused = false;
miniGame.state.modal = '';
miniGame.state.finished = false;
miniGame.state.stage = 0;
miniGame.state.difficulty = 'normal';
miniGame.state.bondCooldowns = {};
const wildEnemy = miniGame.spawnEnemy('xingxing', 1, 0);
miniGame.state.towers = [
  { uid:'wild-a', id:'bifang', x:wildEnemy.x, y:wildEnemy.y, cd:99 }, { uid:'wild-b', id:'fuzhu', x:wildEnemy.x + 20, y:wildEnemy.y, cd:99 }, { uid:'wild-c', id:'jiuwei', x:wildEnemy.x - 20, y:wildEnemy.y, cd:99 },
];
miniGame.state.selectedBondId = 'wild';
const wildHp = wildEnemy.hp;
assert.equal(miniGame.useBondSkill(), true);
assert(wildEnemy.hp < wildHp);
assert.equal(wildEnemy.burnTimer, 4);
assert.equal(miniGame.state.bondPulse.members.length, 3);
assert.equal(miniGame.state.bondCooldowns.wild, 22);
assert.equal(miniGame.useBondSkill(), false);
miniGame.update(1);
assert.equal(miniGame.state.bondCooldowns.wild, 21);
assert(Number.isFinite(wildEnemy.hp));

miniGame.state.enemies = [];
miniGame.state.runKills = {};
miniGame.state.bondCooldowns = {};
miniGame.state.towers.forEach((tower) => { tower.growthKills = 0; });
const creditedWildEnemy = miniGame.spawnEnemy('xingxing', .01, 0);
miniGame.state.selectedBondId = 'wild';
assert.equal(miniGame.useBondSkill(), true);
assert.equal(creditedWildEnemy.dead, true);
assert.deepEqual(miniGame.state.towers.map((tower) => tower.growthKills), [1, 1, 1]);
assert.equal(miniGame.state.runKills['bond:wild'], 1);

miniGame.state.bondCooldowns = {};
const tideEnemy = miniGame.spawnEnemy('xingxing', 1, 0);
miniGame.state.towers = [
  { uid:'tide-a', id:'dayu', x:tideEnemy.x, y:tideEnemy.y, cd:99 }, { uid:'tide-b', id:'gonggong', x:tideEnemy.x + 20, y:tideEnemy.y, cd:99 },
];
miniGame.state.selectedBondId = 'zhishui';
assert.equal(miniGame.useBondSkill(), true);
assert.equal(tideEnemy.slow, .6);
assert.equal(tideEnemy.slowTimer, 3.2);

miniGame.state.bondCooldowns = {};
miniGame.state.towers = [
  { uid:'restore-a', id:'huangdi', x:300, y:300, mana:20, maxMana:100, skillCd:12, cd:99 }, { uid:'restore-b', id:'fuxi', x:340, y:300, mana:40, maxMana:100, skillCd:12, cd:99 },
];
miniGame.state.selectedBondId = 'renzu';
assert.equal(miniGame.useBondSkill(), true);
assert.equal(miniGame.state.towers[0].mana, 65);
assert.equal(miniGame.state.towers[0].skillCd, 4);
assert(Math.abs(miniGame.state.bondCooldowns.renzu - 21.84) < 1e-9);

miniGame.state.stage = 4;
miniGame.state.difficulty = 'normal';
miniGame.startGame();
const stageMiniBoss = miniGame.spawnEnemy('zhuyan', 1, 0, 0, 'miniBoss');
const stageBoss = miniGame.spawnEnemy('taotie', 1, 0, 0, 'stageBoss');
assert.equal(stageMiniBoss.shield, 155);
assert.equal(stageBoss.shield, 380);

miniGame.state.stage = 0;
miniGame.state.difficulty = 'easy';
miniGame.startGame();
const easyRevive = miniGame.spawnEnemy('baize', 1, 0);
miniGame.damageEnemy(easyRevive, easyRevive.hp + 1, source, { dmgType: 'true', counters: [] });
assert.equal(easyRevive.shield, 70);
miniGame.state.difficulty = 'hard';
const hardRevive = miniGame.spawnEnemy('baize', 1, 0);
miniGame.damageEnemy(hardRevive, hardRevive.hp + 1, source, { dmgType: 'true', counters: [] });
assert.equal(hardRevive.shield, 180);

miniGame.state.difficulty = 'normal';
const armoredEnemy = miniGame.spawnEnemy('bashe', 1, 0);
miniGame.damageEnemy(armoredEnemy, 100, source, breakerDef, false, true, -2);
assert.equal(armoredEnemy.armorBreak, 12);
miniGame.state.stage = 4;
miniGame.startGame();
const finalBoss = miniGame.spawnEnemy(miniGame.LEVELS[4].boss, 1, 0, 0, 'stageBoss');
finalBoss.d = finalBoss.routeLength;
miniGame.update(.01);
assert.equal(miniGame.state.bossEscaped, true);
assert.equal(miniGame.state.finished, true);
assert.equal(miniGame.state.screen, 'result');
assert.deepEqual(miniGame.state.resultBreakdown, {
  combat: 0,
  reward: 0,
  kills: 0,
  hp: 1,
  energy: miniGame.state.resultBreakdown.energy,
  bonds: 0,
});
console.log('shared core and WeChat Mini Game smoke checks passed');
