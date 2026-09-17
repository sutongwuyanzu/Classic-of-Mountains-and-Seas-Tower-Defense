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
assert.match(indexHtml, /id="audio-settings"/);
assert.match(indexHtml, /id="audio-dialog"/);
assert.match(indexHtml, /id="music-volume"/);
assert.match(indexHtml, /id="sfx-volume"/);
assert.match(indexHtml, /aria-labelledby="audio-title" aria-describedby="audio-copy"/);
assert.match(styles, /@media \(max-width: 900px\) and \(max-height: 500px\) and \(orientation: landscape\)/);
assert.match(styles, /grid-template-columns: repeat\(2, 100px\)/);
assert.match(styles, /\.command-rail \{\s*top: 104px;\s*right: 10px;\s*width: 206px;/);
assert.match(styles, /\.rail-command \{\s*width: 100px;\s*height: 100px;/);
assert.match(styles, /\.selected-spirit-bar \{\s*right: 218px;\s*bottom: 120px;\s*height: 110px;/);
assert.match(styles, /\.selected-recall \{ width: 100px; height: 100px;/);
assert.match(styles, /\.summon-dock \{\s*left: 176px;\s*bottom: 10px;\s*width: 924px;\s*height: 100px;/);
assert.match(styles, /\.sound-toggle \{ display: none; \}\.audio-settings \{ width: 100px; height: 100px;/);
assert.match(styles, /\.audio-controls label \{ min-height: 100px;/);
assert.match(styles, /\.arena-message \{[^}]*width: min\(760px, calc\(100% - 170px\)\);[^}]*max-height: 44px;[^}]*text-align: center;/);
assert.match(styles, /\.arena-message \{ width: min\(670px, calc\(100% - 240px\)\); max-height: 72px; font-size: 26px; \}/);
assert.match(styles, /\.wave-advance \{ top: 7px; right: 10px; min-width: 150px; height: 100px; font-size: 24px; \}/);
assert.match(styles, /\.combat-log \{ left: 20px; right: 230px; bottom: 142px; min-height: 54px; max-height: 54px; overflow: hidden; font-size: 23px;/);
assert.match(styles, /\.dock-command small \{ display: none; \}/);
const compactMobileScale = Math.min(568 / 1280, 320 / 720);
assert(100 * compactMobileScale >= 44, 'key landscape controls must remain at least 44px at 568x320');
assert(24 * compactMobileScale >= 10, 'key landscape command labels must remain at least 10px at 568x320');
const mobileLayout = { width: 1280, height: 720, headerHeight: 100, arenaTop: 104, railRight: 10, railWidth: 206, selectedRight: 218, selectedBottom: 120, selectedHeight: 110, summonBottom: 10, summonHeight: 100 };
assert(mobileLayout.headerHeight <= mobileLayout.arenaTop, 'mobile arena must start below the header');
assert(mobileLayout.width - mobileLayout.selectedRight <= mobileLayout.width - mobileLayout.railRight - mobileLayout.railWidth, 'selected roster must not overlap the command rail');
assert(mobileLayout.height - mobileLayout.selectedBottom <= mobileLayout.height - mobileLayout.summonBottom - mobileLayout.summonHeight, 'selected roster must not overlap the summon dock');
const mobileCombatLogBottom = 104 + 524 - 142;
const mobileSelectedBarTop = 720 - 120 - 110;
assert(mobileCombatLogBottom <= mobileSelectedBarTop, 'mobile combat log must sit above the selected spirit bar');
const mobileWaveAdvanceLeft = 995 - 10 - 150;
const mobileArenaMessageRight = (995 + 670) / 2;
assert(mobileArenaMessageRight <= mobileWaveAdvanceLeft, 'mobile arena message must not overlap the wave advance button');
const desktopGame = fs.readFileSync(path.join(root, 'src', 'main.js'), 'utf8');

function readLiteralConst(source, name, bindings = {}) {
  const marker = `const ${name} = `;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `missing desktop constant ${name}`);
  let end = start + marker.length;
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (; end < source.length; end += 1) {
    const character = source[end];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === "'" || character === '"' || character === '`') {
      quote = character;
      continue;
    }
    if (character === '{' || character === '[' || character === '(') depth += 1;
    if (character === '}' || character === ']' || character === ')') depth -= 1;
    if (character === ';' && depth === 0) break;
  }
  assert.notEqual(end, source.length, `unterminated desktop constant ${name}`);
  return Function(...Object.keys(bindings), `return (${source.slice(start + marker.length, end)});`)(...Object.values(bindings));
}

assert.match(desktopGame, /function combatRecap\(\)/);
assert.match(desktopGame, /runStats: \{ damageByBeast: \{\}, shieldByBeast: \{\}, breachesByRoute: \{\}, sealLost: 0, waves: \[\] \}/);
assert.match(desktopGame, /function gameRandom\(stream = 'draw'\)/);
assert.match(desktopGame, /function peekGameRandom\(stream = 'draw'\)/);
assert.match(desktopGame, /function waveRouteThreatText\(groups, routeOffset = null\)/);
assert.match(desktopGame, /const threatText = waveRouteThreatText\(groups, routeOffset\);/);
assert.match(desktopGame, /const nextThreatText = waveRouteThreatText\(waveTemplate\(state\.wave\)\);/);
assert.match(desktopGame, /function startTrialGame\(\)/);
assert.match(desktopGame, /const TRIAL_RULES = Object\.freeze\(/);
assert.match(desktopGame, /function trialRuleForSeed\(seed = trialSeed\(\), level = currentLevel\(\)\)/);
assert.match(desktopGame, /function summonWeights\(mode\)/);
assert.match(desktopGame, /function enforceTrialRuleBeforeWave\(\)/);
assert.match(desktopGame, /trialFailedReason/);
assert.match(desktopGame, /Core\.evolutionChoices\(state\.towers\.map\(\(tower\) => tower\.id\), state\.runSeed \+ completedWave \* 97, state\.runEvolutions\)/);
assert.match(desktopGame, /function createWaveSnapshot\(\)/);
assert.match(desktopGame, /function resumeWaveGame\(\)/);
assert.match(desktopGame, /function startAmbient\(\)/);
assert.match(desktopGame, /function updateAmbientState\(\)/);
assert.match(desktopGame, /musicVolume: \.28, sfxVolume: 1/);
assert.match(desktopGame, /musicVolume: state\.musicVolume, sfxVolume: state\.sfxVolume/);
assert.match(desktopGame, /refs\.audioSettings\.addEventListener\('click', \(\) => \{ renderAudioControls\(\); showGameDialog\(refs\.audioDialog\); \}\);/);
assert.match(desktopGame, /function pauseForBackground\(\)[\s\S]*?updateAmbientState\(\);/);
assert.match(desktopGame, /function finishGame\(won, abandoned = false\)[\s\S]*?stopAmbient\(\);/);
assert.match(desktopGame, /loadSave\(\);\s*updateAudioMix\(\);\s*renderAudioControls\(\);\s*renderSelect\(\);/);
assert.match(desktopGame, /function counterEffectText\(def\)/);
assert.match(desktopGame, /function enemySpecialTrait\(enemy\)/);
assert.match(desktopGame, /法免→物\/净/);
assert.match(desktopGame, /物免→法\/真/);
assert.match(desktopGame, /周期治疗/);
assert.match(desktopGame, /濒死复活/);
assert.match(desktopGame, /击杀分裂/);
assert.match(desktopGame, /function selectedEnemyMeta\(enemy\)/);
assert.match(desktopGame, /refs\.selectedUnitMeta\.textContent = selectedEnemyMeta\(selectedEnemy\)/);
assert.match(desktopGame, /const DISMISS_COMPENSATION = 6;/);
assert.match(desktopGame, /function dismissBackpackUnit\(uid\)/);
assert.match(desktopGame, /data-dismiss-unit=/);
assert.match(desktopGame, /function portraitMarkup\(beast, fullArt = false\)/);
assert.match(desktopGame, /function drawStageBackdrop\(\)/);
assert.match(desktopGame, /const stageBackgrounds = new Array\(stageBackgroundSources\.length\);/);
assert.match(desktopGame, /function stageBackgroundFor\(stage\)/);
assert.doesNotMatch(desktopGame, /const biomeAtlas = document\.createElement\('img'\);/);
assert.doesNotMatch(desktopGame, /const caveBattlefield = document\.createElement\('img'\);/);
assert.match(desktopGame, /function renderSelect\(\) \{\s*stageBackgroundFor\(state\.stage\);/);
assert.match(desktopGame, /function updateHUD\(immediate = true\)/);
assert.match(desktopGame, /updateEffects\(simDt\); updateHUD\(false\);/);
assert.match(desktopGame, /if \(state\.paused\) \{\s*if \(state\.backgroundPaused\) resumePauseMenu\(\);/);
assert.match(desktopGame, /window\.addEventListener\('blur', pauseForBackground\);/);
assert.match(desktopGame, /成员：\$\{bond\.members/);
assert.match(desktopGame, /还需 \$\{Math\.max\(0, bond\.need - count\)\} 名/);
assert.match(desktopGame, /counter === 'breakShield' && def\?\.breakShield === true/);
assert.match(desktopGame, /function damageEnemy\(enemy, amount, def, special = 0, source = null\) \{\s*if \(!canSeeEnemy\(enemy, def\)\) return;/);
assert.match(desktopGame, /const pendingDamage = new Map\(\);/);
assert.doesNotMatch(desktopGame, /function incomingDamage\(/);
assert.match(desktopGame, /let activeCombatBondTotals = null;/);
assert.match(desktopGame, /function updateTowers\(dt, bondState = bondsForTowers\(\)\)/);
assert.match(desktopGame, /function bondTotals\(\) \{ return activeCombatBondTotals \|\| bondsForTowers\(\)\.totals; \}/);
assert.match(desktopGame, /const frameBondState = bondsForTowers\(\);\s*activeCombatBondTotals = frameBondState\.totals;\s*try \{\s*spawnFromGroups\(simDt\); updateTowers\(simDt, frameBondState\);[\s\S]*?finally \{ activeCombatBondTotals = null; \}/);
assert.match(preload, /buildId/);
assert.match(startServer, /package\.json/);
assert.equal(fs.readFileSync(path.join(root, 'shared', 'game-core.js'), 'utf8'), fs.readFileSync(path.join(root, 'wechatgame', 'shared', 'game-core.js'), 'utf8'));
const Core = require(path.join(root, 'shared', 'game-core.js'));
const miniData = require(path.join(root, 'wechatgame', 'src', 'data.js'));
const runtimeSpriteDir = path.join(root, 'assets', 'sprites', 'runtime');
const runtimeSpriteIds = [...miniData.ROSTER.map((item) => item.id), ...Object.keys(miniData.ENEMIES)].sort();
const runtimeSpriteFiles = fs.readdirSync(runtimeSpriteDir).filter((file) => file.endsWith('.png')).sort();
assert.deepEqual(runtimeSpriteFiles, runtimeSpriteIds.map((id) => `${id}.png`));
assert.match(desktopGame, /assets\/sprites\/runtime\//);
let runtimeSpriteBytes = 0;
runtimeSpriteFiles.forEach((file) => {
  const sprite = fs.readFileSync(path.join(runtimeSpriteDir, file));
  assert.equal(sprite.subarray(1, 4).toString('ascii'), 'PNG');
  assert(sprite.readUInt32BE(16) <= 384 && sprite.readUInt32BE(20) <= 384, `${file} exceeds the runtime sprite budget`);
  runtimeSpriteBytes += sprite.length;
});
assert(runtimeSpriteBytes < 7 * 1024 * 1024, 'runtime sprites exceed the 7 MiB budget');
assert.equal(Core.SUMMON_RULES.normal.cost, 20);
assert.deepEqual(Core.SUMMON_RULES.normal.swaps, [8, 16]);
assert.equal(Core.SUMMON_RULES.normal.weights.reduce((sum, pair) => sum + pair[1], 0), 100);
assert.equal(Core.SUMMON_RULES.advanced.weights.reduce((sum, pair) => sum + pair[1], 0), 100);
assert.equal(Core.passiveBonus('qinglong', 0).targets, 0);
assert.equal(Core.passiveBonus('qinglong', 12).targets, 1);
assert.equal(Core.evolutionChoices(['bifang', 'dayu'], 7).length, 3);
const evolvedChoices = Core.evolutionChoices(['bifang', 'dayu'], 7, { bifang: ['fury'] });
assert.deepEqual(evolvedChoices, Core.evolutionChoices(['bifang', 'dayu'], 7, { bifang: ['fury'] }));
assert.equal(new Set(evolvedChoices.map((choice) => choice.id)).size, evolvedChoices.length);
assert(!evolvedChoices.some((choice) => choice.beastId === 'bifang' && choice.id === 'fury'));
assert.deepEqual(Core.evolutionChoices(['bifang'], 7, { bifang: ['fury', 'ritual', 'domain'] }), []);
assert(Core.medalAwards({ won:true, hp:10, maxHp:10, difficulty:'normal', urCount:0, maxRarity:1, activeBonds:3, requiredFielded:true, maxGrowthKills:20, clearedAll:false, clearedHardAll:false, mode:'standard', wave:15 }).includes('perfect_seal'));
const desktopBeasts = readLiteralConst(desktopGame, 'BEASTS');
const desktopEnemies = readLiteralConst(desktopGame, 'ENEMIES');
const desktopLevels = readLiteralConst(desktopGame, 'LEVELS');
const desktopWaves = readLiteralConst(desktopGame, 'WAVES');
const desktopSkills = readLiteralConst(desktopGame, 'ACTIVE_SKILLS');
const desktopSupportSkills = readLiteralConst(desktopGame, 'SUPPORT_SKILLS');
const desktopBonds = readLiteralConst(desktopGame, 'BOND_DEFS');
const desktopPopulation = readLiteralConst(desktopGame, 'POPULATION_BY_RARITY');
const desktopRarityPower = readLiteralConst(desktopGame, 'RARITY_POWER');
const desktopBasicArmorBreak = readLiteralConst(desktopGame, 'BASIC_ATTACK_ARMOR_BREAK');
const desktopBasicArmorBreakDuration = readLiteralConst(desktopGame, 'BASIC_ATTACK_ARMOR_BREAK_DURATION');
const desktopDifficulties = readLiteralConst(desktopGame, 'DIFFICULTIES', {
  SUMMON_WEIGHTS: Core.SUMMON_RULES.normal.weights,
  ADVANCED_SUMMON_WEIGHTS: Core.SUMMON_RULES.advanced.weights,
});
const combatContract = (def, miniGame = false) => ({
  dmg: def.dmg,
  interval: def.interval,
  range: def.range,
  dmgType: def.dmgType,
  splash: miniGame ? def.splashRadius : def.splash || 0,
  chain: def.chain || 0,
  burn: Boolean(def.burn),
  burnDps: def.burnDps || 0,
  slow: def.slow || 0,
  slowDur: def.slowDur || 0,
  breakAt: def.breakAt || 0,
  stunEvery: def.stunEvery || 0,
  counters: def.counters || [],
});
const enemyContract = (def) => ({
  name: def.name,
  hp: def.hp,
  speed: def.speed,
  radius: def.radius,
  reward: def.reward,
  armor: def.armor || 0,
  shield: def.shield || 0,
  immuneMag: Boolean(def.immuneMag),
  stealth: Boolean(def.stealth),
  boss: Boolean(def.boss),
  heal: def.skill === 'heal' || Boolean(def.heal),
  revive: def.skill === 'revive' || Boolean(def.revive),
  split: def.skill === 'split' || Boolean(def.split),
});
assert.deepEqual(miniData.ROSTER.map((item) => item.id), Object.keys(desktopBeasts));
assert.deepEqual(
  Object.fromEntries(miniData.ROSTER.map((item) => [item.id, combatContract(item, true)])),
  Object.fromEntries(Object.entries(desktopBeasts).map(([id, def]) => [id, combatContract(def)])),
);
assert.deepEqual(
  Object.fromEntries(Object.entries(miniData.ENEMIES).map(([id, def]) => [id, enemyContract(def)])),
  Object.fromEntries(Object.entries(desktopEnemies).map(([id, def]) => [id, enemyContract(def)])),
);
assert.deepEqual(miniData.WAVES, desktopWaves);
assert.deepEqual(
  miniData.LEVELS.map((item) => ({ name: item.name, hp: item.hp, speed: item.speed, essence: item.essence, boss: item.boss, routeCount: item.routes.length })),
  desktopLevels.map((item) => ({ name: item.name, hp: item.hpMul, speed: item.spdMul, essence: item.essence, boss: item.boss, routeCount: item.spawnCount })),
);
assert.deepEqual(miniData.ACTIVE_SKILLS, desktopSkills);
assert.deepEqual(miniData.SUPPORT_SKILLS, desktopSupportSkills);
assert.deepEqual(miniData.BONDS, desktopBonds);
const miniGameSource = fs.readFileSync(path.join(root, 'wechatgame', 'src', 'main.js'), 'utf8');
assert.deepEqual(readLiteralConst(miniGameSource, 'POPULATION'), desktopPopulation);
assert.deepEqual(readLiteralConst(miniGameSource, 'RARITY_POWER'), desktopRarityPower);
assert.equal(readLiteralConst(miniGameSource, 'BASIC_ATTACK_ARMOR_BREAK'), desktopBasicArmorBreak);
assert.equal(readLiteralConst(miniGameSource, 'BASIC_ATTACK_ARMOR_BREAK_DURATION'), desktopBasicArmorBreakDuration);
assert.deepEqual(
  miniData.DIFFICULTIES,
  Object.fromEntries(Object.entries(desktopDifficulties).map(([id, def]) => [id, { name: def.name, hp: def.hp, speed: def.speed, armor: def.armor, count: def.count, essence: def.startEssence, power: def.towerPower }])),
);
assert.equal(miniData.BONDS.length, 13);
assert(miniData.BONDS.every((bond) => bond.ult && bond.skill && bond.cooldown > 0 && bond.ultMul > 0));

const noop = () => {};
let onHideHandler = null;
let onShowHandler = null;
let writtenSave = null;
const context = new Proxy({}, { get(target, key) { if (!(key in target)) target[key] = noop; return target[key]; }, set(target, key, value) { target[key] = value; return true; } });
const fakeCanvas = { width:0, height:0, getContext:() => context, createImage:() => ({ loaded:false, width:600, height:500 }), requestAnimationFrame:noop };
global.wx = {
  createCanvas:() => fakeCanvas,
  getWindowInfo:() => ({ windowWidth:1280, windowHeight:720, pixelRatio:1 }),
  getStorageSync:() => ({ completions: [0, '0:normal', '99:normal', '01:normal', '1:invalid', '1:normal'] }), setStorageSync:(_key, value) => { writtenSave = value; }, onTouchStart:noop, onHide:(handler) => { onHideHandler = handler; }, onShow:(handler) => { onShowHandler = handler; },
};
const miniGame = require(path.join(root, 'wechatgame', 'src', 'main.js'));
miniGame.startGame();
assert.equal(miniGame.state.screen, 'game');
assert.equal(miniGame.state.wave, 0);
assert.equal(miniGame.state.hp, 10);
assert.deepEqual([...miniGame.state.completions].sort(), ['0:normal', '1:normal']);
assert.deepEqual(writtenSave.completions, ['0:normal', '1:normal']);
assert.equal(typeof onHideHandler, 'function');
assert.equal(typeof onShowHandler, 'function');
onHideHandler();
assert.equal(miniGame.state.paused, true);
assert.equal(miniGame.state.backgroundPaused, true);
onShowHandler();
assert.equal(miniGame.state.paused, true);
assert.equal(miniGame.state.backgroundPaused, true);
miniGame.togglePause();
assert.equal(miniGame.state.paused, false);
assert.equal(miniGame.state.backgroundPaused, false);
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
assert.equal(miniGame.enemyCounterHint(immuneEnemy), '法免：物/净');
assert.equal(miniGame.enemyCounterHint(stealthEnemy), '隐身：需洞察');
const healerInfo = miniGame.enemyPanelLines(miniGame.spawnEnemy('taotie', 1, 0, 0, 'stageBoss'));
assert.equal(healerInfo.counter, '护盾：破盾更快');
assert.equal(healerInfo.threat, '周期治疗 · 破封 9');
const splitInfo = miniGame.enemyPanelLines(miniGame.spawnEnemy('shanxiao', 1, 0));
assert.equal(splitInfo.threat, '击杀分裂 · 破封 1');
miniGame.state.stage = 0;
miniGame.state.difficulty = 'normal';
miniGame.state.towers = [];
miniGame.state.enemies = [];
const splashPrimary = miniGame.spawnEnemy('bashe', 1, 0);
const splashNeighbor = miniGame.spawnEnemy('xingxing', 1, 0);
splashNeighbor.x = splashPrimary.x + 1; splashNeighbor.y = splashPrimary.y + 1;
const splashNeighborHp = splashNeighbor.hp;
miniGame.damageEnemy(splashPrimary, 100, source, { ...breakerDef, counters: [], splash: true, splashRadius: 200 });
assert.equal(Math.round(splashNeighborHp - splashNeighbor.hp), Math.round(70 * Math.max(.35, 1 - splashNeighbor.armor / 100)), 'splash should use the impact damage before the primary target armor calculation');
miniGame.state.enemies = [];
const splashMagicPrimary = miniGame.spawnEnemy('xingxing', 1, 0);
const splashMagicImmune = miniGame.spawnEnemy('huali', 1, 0);
splashMagicImmune.x = splashMagicPrimary.x + 1; splashMagicImmune.y = splashMagicPrimary.y + 1;
const splashMagicImmuneHp = splashMagicImmune.hp;
miniGame.damageEnemy(splashMagicPrimary, 100, source, { ...nonPurgeMagicDef, splash: true, splashRadius: 200 });
assert.equal(splashMagicImmune.hp, splashMagicImmuneHp, 'splash must not bypass magic immunity');

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

for (const [difficultyId, interval, rate] of [['easy', 9, .05], ['normal', 7, .08], ['hard', 5, .12]]) {
  miniGame.state.stage = 0;
  miniGame.state.difficulty = difficultyId;
  miniGame.startGame();
  const healer = miniGame.spawnEnemy('taotie', 1, 0);
  assert.equal(healer.healInterval, interval);
  assert.equal(healer.healRate, rate);
  assert.equal(healer.healTimer, interval);
  healer.hp = healer.maxHp * .5;
  healer.healTimer = .001;
  miniGame.update(.01);
  assert(Math.abs(healer.hp - healer.maxHp * (.5 + rate)) < 1e-9, `${difficultyId} healing must match the desktop rule contract`);
  assert.equal(healer.healTimer, interval);
}

miniGame.state.stage = 0;
miniGame.state.difficulty = 'normal';
miniGame.startGame();
const splitter = miniGame.spawnEnemy('shanxiao', 1, 0, 123);
miniGame.damageEnemy(splitter, splitter.hp + 1, { id: 'split-contract' }, { dmgType: 'true', counters: [] });
const splitChildren = miniGame.state.enemies.filter((enemy) => enemy.type === 'xingxing' && !enemy.dead);
assert.equal(splitChildren.length, 2);
assert(splitChildren.every((enemy) => enemy.routeIndex === splitter.routeIndex && enemy.d === splitter.d));
const expectedSplitHp = miniData.ENEMIES.xingxing.hp * miniData.LEVELS[0].hp * miniData.DIFFICULTIES.normal.hp * .55;
assert(splitChildren.every((enemy) => Math.abs(enemy.maxHp - expectedSplitHp) < 1e-9));

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
