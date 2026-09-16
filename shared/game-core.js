(function initShanHaiCore(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ShanHaiCore = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createShanHaiCore() {
  'use strict';

  const CORE_VERSION = 3;
  const RARITIES = ['N', 'R', 'SR', 'SSR', 'UR'];
  const SUMMON_RULES = Object.freeze({
    normal: { cost: 20, choices: 2, swaps: [8, 16], weights: [[0, 58], [1, 34], [2, 7], [3, 1]] },
    advanced: { cost: 50, choices: 3, swaps: [20, 40], weights: [[2, 92], [3, 5], [4, 3]] },
  });

  const GROWTH_PASSIVES = Object.freeze({
    bifang: { name: '余烬噬魂', kind: 'power', every: 1, value: .008, cap: 30 },
    jiuwei: { name: '九影生枝', kind: 'targets', thresholds: [15, 35] },
    tiangou: { name: '逐月狂猎', kind: 'haste', every: 5, value: .02, cap: 10 },
    shengsheng: { name: '百战山魄', kind: 'power', every: 1, value: .009, cap: 30 },
    zheng: { name: '疾影磨锋', kind: 'haste', every: 5, value: .022, cap: 10 },
    yazi: { name: '睚眦血契', kind: 'power', every: 1, value: .011, cap: 30 },
    chaofeng: { name: '临风愈疾', kind: 'haste', every: 5, value: .02, cap: 10 },
    fuxi_long: { name: '碑文衍射', kind: 'targets', thresholds: [15, 35] },
    dayu: { name: '疏川积势', kind: 'power', every: 1, value: .008, cap: 30 },
    qinglong: { name: '万雷分霄', kind: 'targets', thresholds: [12, 30] },
    baihu: { name: '杀伐证道', kind: 'power', every: 1, value: .012, cap: 25 },
    huangdi: { name: '百战敕令', kind: 'haste', every: 5, value: .024, cap: 10 },
  });

  const EVOLUTION_PATHS = Object.freeze([
    { id: 'fury', name: '凶星淬体', copy: '攻击与主动技能伤害 +20%', bonus: { power: .2 } },
    { id: 'ritual', name: '灵台返照', copy: '主动技能冷却 -20%，法力消耗 -15%', bonus: { cdr: .2, manaCost: .15 } },
    { id: 'domain', name: '法域外拓', copy: '攻击射程 +15%，辅助范围与效果 +20%', bonus: { range: .15, support: .2 } },
  ]);

  const STAGE_MECHANICS = Object.freeze([
    { id: 'echo', name: '幽都回声', copy: '洞窟折返路段较长，分裂敌群会检验交叉火力。', waves: { 4: '朱厌护盾', 9: '白泽复生', 14: '饕餮吞灵' } },
    { id: 'gale', name: '北野疾风', copy: '飞廉与隐匿敌军更频繁，控制与远射更重要。', waves: { 4: '疾风突阵', 9: '隐匿猎群', 14: '白泽唤风' } },
    { id: 'tide', name: '沧海潮汐', copy: '敌军周期性获得恢复，破甲和爆发需要配合。', waves: { 4: '潮生护体', 9: '回澜复生', 14: '饕餮吞潮' } },
    { id: 'twin', name: '双裂并行', copy: '上下两路同时推进，局部火力过度集中会漏守。', waves: { 4: '双路重甲', 9: '双路复生', 14: '白泽分身' } },
    { id: 'heaven', name: '天门法则', copy: '护盾、免疫与复活轮换出现，阵容必须具备多种克制。', waves: { 4: '天门护阵', 9: '四象试炼', 14: '饕餮天劫' } },
  ]);

  const MEDALS = Object.freeze([
    { id: 'first_seal', name: '初镇山海', copy: '首次完成任意关卡。', group: '通关' },
    { id: 'five_realms', name: '五境巡守', copy: '任意难度完成全部五关。', group: '通关' },
    { id: 'hard_five', name: '山海无隙', copy: '困难难度完成全部五关。', group: '通关' },
    { id: 'perfect_seal', name: '十全封印', copy: '以10点封印完整度完成关卡。', group: '挑战' },
    { id: 'no_ur', name: '凡灵亦可镇天', copy: '不使用UR妖灵完成中等或困难关卡。', group: '阵容' },
    { id: 'low_rarity', name: '草木皆兵', copy: '仅使用N、R妖灵完成任意关卡。', group: '阵容' },
    { id: 'three_bonds', name: '三契同鸣', copy: '单局触发至少3组羁绊。', group: '阵容' },
    { id: 'required_guard', name: '天命入阵', copy: '上阵本局天命妖灵并完成守关。', group: '挑战' },
    { id: 'growth_20', name: '以战养灵', copy: '单局让一只成长型妖灵参与20次击破。', group: '妖灵' },
    { id: 'endless_20', name: '无尽初窥', copy: '无尽模式抵达第20波。', group: '无尽' },
    { id: 'endless_35', name: '长夜不息', copy: '无尽模式抵达第35波。', group: '无尽' },
    { id: 'endless_50', name: '山海同寿', copy: '无尽模式抵达第50波。', group: '无尽' },
  ]);

  function createSeededRng(seedValue) {
    let seed = (Number(seedValue) || 1) >>> 0;
    return function nextRandom() {
      seed += 0x6D2B79F5;
      let value = seed;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function passiveBonus(id, kills) {
    const passive = GROWTH_PASSIVES[id];
    const count = Math.max(0, Number(kills) || 0);
    if (!passive) return { power: 0, haste: 0, targets: 0, stacks: 0, text: '固定型' };
    if (passive.kind === 'targets') {
      const targets = passive.thresholds.filter((threshold) => count >= threshold).length;
      return { power: 0, haste: 0, targets, stacks: targets, text: `${passive.name} · 参与${count}次击破 · 额外目标 +${targets}` };
    }
    const stacks = Math.min(passive.cap, Math.floor(count / passive.every));
    const amount = stacks * passive.value;
    const label = passive.kind === 'power' ? '攻击' : '攻速';
    return { power: passive.kind === 'power' ? amount : 0, haste: passive.kind === 'haste' ? amount : 0, targets: 0, stacks, text: `${passive.name} · ${label} +${Math.round(amount * 100)}%` };
  }

  function passiveDescription(id) {
    const passive = GROWTH_PASSIVES[id];
    if (!passive) return '固定型 · 开局即发挥完整能力';
    if (passive.kind === 'targets') return `成长型 · 参与 ${passive.thresholds.join('/')} 次击破时增加同时攻击数量`;
    const label = passive.kind === 'power' ? '攻击力' : '攻击速度';
    return `成长型 · 每 ${passive.every} 次有效击破提升${label}，最多 ${passive.cap} 层`;
  }

  function outputGrade(beast, data) {
    const dps = (Number(data.dmg) || 0) / Math.max(.35, Number(data.interval) || 1) * (1 + (beast.rarity || 0) * .06);
    return dps >= 39 ? '高' : dps >= 23 ? '中' : '低';
  }

  function controlGrade(data, skill) {
    if (['areaStun', 'slow'].includes(skill.type)) return '群体控';
    if (skill.type === 'targetStun' || data.stunEvery || data.slow) return '单体控';
    return '无控制';
  }

  function bondPotential(beastId, ownedIds, bonds) {
    const owned = ownedIds instanceof Set ? ownedIds : new Set(ownedIds || []);
    let best = { grade: '低', bond: null, missing: Infinity };
    for (const bond of bonds || []) {
      if (!bond.members.includes(beastId)) continue;
      const count = bond.members.filter((id) => owned.has(id) || id === beastId).length;
      const missing = Math.max(0, bond.need - count);
      const grade = missing === 0 ? '高' : missing === 1 ? '中' : '低';
      if (missing < best.missing) best = { grade, bond, missing };
    }
    return best;
  }

  function describeBeast(beast, data, skill, bonds, ownedIds) {
    const damageTypes = { phy: '物理', mag: '法术', true: '真实' };
    const potential = bondPotential(beast.id, ownedIds, bonds);
    return {
      damageType: damageTypes[data.dmgType] || '物理',
      output: outputGrade(beast, data),
      control: controlGrade(data, skill),
      growth: GROWTH_PASSIVES[beast.id] ? '成长型' : '固定型',
      growthText: passiveDescription(beast.id),
      bondGrade: potential.grade,
      bondName: potential.bond ? potential.bond.name : '暂无近成羁绊',
    };
  }

  function evolutionChoices(towerIds, seed) {
    const ids = [...new Set(towerIds || [])];
    if (!ids.length) return [];
    const rng = createSeededRng(seed);
    const pool = [];
    ids.forEach((beastId) => EVOLUTION_PATHS.forEach((path) => pool.push({ ...path, beastId })));
    const choices = [];
    while (pool.length && choices.length < 3) {
      const index = Math.floor(rng() * pool.length);
      choices.push(pool.splice(index, 1)[0]);
    }
    return choices;
  }

  function endlessScale(waveIndex) {
    const cycle = Math.floor(Math.max(0, waveIndex) / 5);
    return { hp: 1 + cycle * .18, speed: Math.min(1.55, 1 + cycle * .025), armor: Math.min(32, cycle * 2), score: 1 + cycle * .12 };
  }

  function medalAwards(context) {
    const awards = [];
    if (context.won) awards.push('first_seal');
    if (context.clearedAll) awards.push('five_realms');
    if (context.clearedHardAll) awards.push('hard_five');
    if (context.won && context.hp === context.maxHp) awards.push('perfect_seal');
    if (context.won && context.difficulty !== 'easy' && context.urCount === 0) awards.push('no_ur');
    if (context.won && context.maxRarity <= 1) awards.push('low_rarity');
    if (context.won && context.activeBonds >= 3) awards.push('three_bonds');
    if (context.won && context.requiredFielded) awards.push('required_guard');
    if (context.maxGrowthKills >= 20) awards.push('growth_20');
    if (context.mode === 'endless' && context.wave >= 20) awards.push('endless_20');
    if (context.mode === 'endless' && context.wave >= 35) awards.push('endless_35');
    if (context.mode === 'endless' && context.wave >= 50) awards.push('endless_50');
    return awards;
  }

  return Object.freeze({ CORE_VERSION, RARITIES, SUMMON_RULES, GROWTH_PASSIVES, EVOLUTION_PATHS, STAGE_MECHANICS, MEDALS, createSeededRng, passiveBonus, passiveDescription, describeBeast, bondPotential, evolutionChoices, endlessScale, medalAwards });
}));
