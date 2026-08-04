const ROSTER = [
  { id: 'bifang', name: '毕方', short: '毕', color: '#e77854', cost: 18, dmg: 20, interval: 1.15, range: 168, type: 'mag', burn: true },
  { id: 'fuzhu', name: '夫诸', short: '夫', color: '#80c7be', cost: 20, dmg: 15, interval: .92, range: 155, type: 'mag', slow: .28 },
  { id: 'jiuwei', name: '九尾狐', short: '九', color: '#b78ed5', cost: 24, dmg: 25, interval: 1.48, range: 175, type: 'mag', splash: true },
  { id: 'tiangou', name: '天狗', short: '天', color: '#dca85e', cost: 22, dmg: 17, interval: .82, range: 145, type: 'phy', stun: true },
  { id: 'xuangui', name: '旋龟', short: '旋', color: '#76a8c4', cost: 26, dmg: 34, interval: 1.85, range: 138, type: 'phy', splash: true, breakShield: true },
];

const LEVELS = [
  { name: '幽都洞窟', intro: '窄路回旋，先学会把火力交叉覆盖。', path: 'cave', difficulty: '◆' },
  { name: '北野草原', intro: '开阔地带，远程单位的范围开始变得重要。', path: 'grass', difficulty: '◆◆' },
  { name: '沧海之上', intro: '潮汐折返，减速和连锁能把敌群拖在射程内。', path: 'sea', difficulty: '◆◆◆' },
  { name: '赤焰火山', intro: '两道裂口同时喷涌，必须分散阵型。', path: 'volcano', difficulty: '◆◆◆◆' },
  { name: '天庭云阶', intro: '双路交汇，强敌拥有护盾与复活机制。', path: 'cloud', difficulty: '◆◆◆◆◆' },
];

const ENEMIES = {
  xingxing: { name: '狌狌', short: '狌', hp: 92, speed: 45, radius: 12, color: '#b78668', reward: 1 },
  fei: { name: '飞廉', short: '飞', hp: 135, speed: 62, radius: 13, color: '#8fb7b5', reward: 1 },
  bashe: { name: '巴蛇', short: '巴', hp: 360, speed: 31, radius: 18, color: '#8a985e', armor: 8, reward: 2 },
  huali: { name: '化蛇', short: '化', hp: 230, speed: 38, radius: 15, color: '#6e9ab0', immuneMag: true, reward: 2 },
  zhuyan: { name: '朱厌', short: '朱', hp: 420, speed: 28, radius: 20, color: '#bf6751', armor: 16, shield: 100, reward: 3 },
  taotie: { name: '饕餮', short: '饕', hp: 760, speed: 22, radius: 25, color: '#d28e54', shield: 220, armor: 12, boss: true, reward: 5 },
  baize: { name: '白泽', short: '泽', hp: 560, speed: 25, radius: 22, color: '#cfbc92', revive: true, boss: true, reward: 5 },
  shanxiao: { name: '山魈', short: '魈', hp: 200, speed: 50, radius: 14, color: '#9b6f59', split: true, reward: 2 },
};

const WAVES = [
  [['xingxing', 7, 1.1, 0, 1]], [['xingxing', 8, 1, 0, 1], ['fei', 2, 1.4, 3, 1]], [['xingxing', 8, .9, 0, 1], ['bashe', 1, 0, 5, 1]],
  [['fei', 6, 1, 0, 1], ['xingxing', 4, 1.5, 2, 1]], [['xingxing', 10, .72, 0, 1.1], ['bashe', 2, 1.3, 4, 1]], [['huali', 5, 1.1, 0, 1], ['fei', 5, .9, 1, 1]],
  [['zhuyan', 1, 0, 5, 1], ['xingxing', 10, .65, 0, 1.1]], [['shanxiao', 3, 1.2, 0, 1], ['huali', 6, .8, 2, 1]],
];

const ROUTES = {
  cave: [[74, 102], [240, 102], [330, 198], [530, 198], [644, 108], [884, 108]],
  grass: [[74, 402], [200, 402], [316, 315], [498, 315], [622, 408], [884, 408]],
  sea: [[74, 152], [220, 240], [348, 116], [522, 248], [680, 138], [884, 270]],
  volcano: [[[74, 104], [230, 104], [330, 270], [518, 270], [660, 270], [884, 270]], [[74, 436], [230, 436], [330, 270], [518, 270], [660, 270], [884, 270]]],
  cloud: [[[74, 88], [214, 88], [322, 190], [510, 190], [660, 270], [884, 270]], [[74, 452], [214, 452], [322, 350], [510, 350], [660, 270], [884, 270]]],
};

function distance(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
function routeLength(points) { return points.slice(1).reduce((sum, point, index) => sum + distance(points[index], point), 0); }
function pointAt(points, amount) {
  let remaining = amount;
  for (let index = 1; index < points.length; index += 1) {
    const length = distance(points[index - 1], points[index]);
    if (remaining <= length) {
      const ratio = length ? remaining / length : 0;
      return [points[index - 1][0] + (points[index][0] - points[index - 1][0]) * ratio, points[index - 1][1] + (points[index][1] - points[index - 1][1]) * ratio];
    }
    remaining -= length;
  }
  return points[points.length - 1];
}
function segmentDistance(x, y, a, b) {
  const vx = b[0] - a[0]; const vy = b[1] - a[1];
  const ratio = Math.max(0, Math.min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / Math.max(1, vx * vx + vy * vy)));
  return Math.hypot(x - (a[0] + vx * ratio), y - (a[1] + vy * ratio));
}

Page({
  data: {
    screen: 'select', levels: [], roster: [], selectedStage: 0, currentLevel: LEVELS[0], selectedBeast: 'bifang', selectedBeastName: '毕方',
    hp: 10, energy: 56, kills: 0, wave: 1, totalWaves: 8, waveDots: Array(8).fill(0), logs: ['选择一只妖灵，然后点击场地上的任意合法位置。'], paused: false, speed: 1, skillReady: false,
    result: { won: false, kills: 0, combo: 0, xp: 0, copy: '' },
  },

  onLoad() {
    const save = wx.getStorageSync('shan-hai-mini-save') || {};
    this.tier = Number(save.tier) || 1;
    this.prepareSelection();
  },

  onReady() { this.ensureCanvas(); },

  ensureCanvas() {
    if (this.canvas) return;
    wx.createSelectorQuery().select('#arena').fields({ node: true, size: true }).exec((result) => {
      if (!result[0]) return;
      const info = result[0]; const dpr = wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : wx.getSystemInfoSync().pixelRatio;
      this.canvas = info.node; this.ctx = this.canvas.getContext('2d'); this.canvasWidth = info.width; this.canvasHeight = info.height; this.dpr = dpr;
      this.canvas.width = Math.round(info.width * dpr); this.canvas.height = Math.round(info.height * dpr);
      this.ctx.setTransform(dpr * info.width / 960, 0, 0, dpr * info.height / 540, 0, 0);
      this.atlas = this.canvas.createImage(); this.atlas.onload = () => { this.atlasReady = true; }; this.atlas.src = '../../assets/biome-atlas.png';
      this.frameActive = true; this.lastFrame = Date.now(); this.frame();
    });
  },

  onHide() { this.frameActive = false; if (this.frameTimer) clearTimeout(this.frameTimer); },
  onShow() { if (this.data.screen === 'game' && !this.frameActive) { this.frameActive = true; this.lastFrame = Date.now(); this.frame(); } },

  prepareSelection(selectedStage = this.data.selectedStage, selectedBeast = this.data.selectedBeast) {
    const levels = LEVELS.map((level, index) => ({ ...level, selected: index === selectedStage }));
    const roster = ROSTER.map((beast) => ({ ...beast, selected: beast.id === selectedBeast }));
    this.setData({ levels, roster, currentLevel: LEVELS[selectedStage], selectedBeastName: ROSTER.find((item) => item.id === selectedBeast).name });
  },

  selectStage(event) {
    const selectedStage = Number(event.currentTarget.dataset.index); this.setData({ selectedStage }); this.prepareSelection(selectedStage);
  },

  selectBeast(event) {
    const selectedBeast = event.currentTarget.dataset.id; this.setData({ selectedBeast }); this.prepareSelection(this.data.selectedStage, selectedBeast);
  },

  selectBeastInGame(event) {
    const selectedBeast = event.currentTarget.dataset.id; this.setData({ selectedBeast, selectedBeastName: ROSTER.find((item) => item.id === selectedBeast).name, roster: ROSTER.map((item) => ({ ...item, selected: item.id === selectedBeast })) });
  },

  startGame() {
    this.selectedStage = this.data.selectedStage; this.totalWaves = 8 + this.selectedStage * 3; this.waveIndex = 0; this.waveCooldown = 0; this.groups = null; this.towers = []; this.enemies = []; this.projectiles = []; this.energy = 56 + this.selectedStage * 6; this.hp = 10; this.kills = 0; this.combo = 0; this.bestCombo = 0; this.skillReady = false; this.finished = false;
    this.setData({ screen: 'game', currentLevel: LEVELS[this.selectedStage], totalWaves: this.totalWaves, waveDots: Array(this.totalWaves).fill(0), wave: 1, energy: this.energy, hp: this.hp, kills: 0, paused: false, speed: 1, skillReady: false, logs: ['第 1 波：敌群进入道路，点击道路两侧安置妖灵。'] }, () => { this.ensureCanvas(); this.startWave(); this.syncGame(); });
  },

  startWave() {
    if (this.waveIndex >= this.totalWaves || this.finished) return;
    const template = WAVES[this.waveIndex % WAVES.length];
    this.groups = template.map((group, index) => ({ type: group[0], count: group[1] + Math.floor(this.selectedStage * index), gap: group[2], timer: group[3], hpMul: group[4] + this.selectedStage * .08, spawned: 0, route: index % this.routeList().length }));
    this.addLog(`第 ${this.waveIndex + 1} 波：${this.groups.length > 1 ? '多组敌人交错出现' : '敌群进入道路'}`);
  },

  routeList() {
    const route = ROUTES[LEVELS[this.selectedStage].path]; return Array.isArray(route[0][0]) ? route : [route];
  },

  spawnGroups(dt) {
    if (!this.groups) { if (this.waveCooldown > 0) { this.waveCooldown -= dt; if (this.waveCooldown <= 0) this.startWave(); } return; }
    let allDone = true;
    this.groups.forEach((group) => {
      group.timer -= dt;
      if (group.spawned < group.count) { allDone = false; if (group.timer <= 0) { this.spawnEnemy(group.type, group.hpMul, group.route); group.spawned += 1; group.timer = group.gap; } }
    });
    if (allDone && this.enemies.length === 0) { this.groups = null; this.waveIndex += 1; if (this.waveIndex >= this.totalWaves) this.finishGame(true); else this.waveCooldown = 2.2; }
  },

  spawnEnemy(type, hpMul, routeIndex) {
    const def = ENEMIES[type]; const route = this.routeList()[routeIndex] || this.routeList()[0];
    this.enemies.push({ type, def, route, routeLength: routeLength(route), d: 0, x: route[0][0], y: route[0][1], hp: def.hp * (1 + this.selectedStage * .3) * hpMul, maxHp: def.hp * (1 + this.selectedStage * .3) * hpMul, shield: def.shield || 0, armor: def.armor || 0, slow: 0, slowTimer: 0, revived: false, split: false, stunned: 0 });
  },

  update(dt) {
    this.spawnGroups(dt); this.updateTowers(dt); this.updateProjectiles(dt); this.updateEnemies(dt); if (this.hp <= 0) this.finishGame(false);
  },

  formationBonus() { return this.towers.length >= 3 ? 1.15 : this.towers.length === 2 ? 1.06 : 1; },

  updateTowers(dt) {
    this.towers.forEach((tower) => {
      const def = ROSTER.find((item) => item.id === tower.id); tower.cooldown -= dt * this.data.speed;
      if (tower.cooldown > 0) return;
      const target = this.enemies.filter((enemy) => enemy.hp > 0 && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= def.range).sort((a, b) => b.d - a.d)[0];
      if (!target) return;
      this.projectiles.push({ x: tower.x, y: tower.y, target, speed: 360, amount: def.dmg * this.formationBonus() * (1 + (this.tier - 1) * .04), def }); tower.cooldown = def.interval;
    });
  },

  updateProjectiles(dt) {
    this.projectiles = this.projectiles.filter((projectile) => {
      if (!projectile.target || projectile.target.hp <= 0) return false;
      const dx = projectile.target.x - projectile.x; const dy = projectile.target.y - projectile.y; const distance = Math.hypot(dx, dy); const step = projectile.speed * dt * this.data.speed;
      projectile.x += dx / Math.max(1, distance) * step; projectile.y += dy / Math.max(1, distance) * step;
      if (distance <= step + projectile.target.def.radius) { this.damageEnemy(projectile.target, projectile.amount, projectile.def); return false; }
      return true;
    });
  },

  damageEnemy(enemy, amount, source) {
    if (enemy.def.immuneMag && source.type === 'mag') { this.addLog(`${enemy.def.name}免疫术法伤害。`); return; }
    if (enemy.shield > 0 && !source.breakShield) { this.addLog(`${enemy.def.name}的护盾挡住了攻击。`); return; }
    if (enemy.shield > 0 && source.breakShield) { enemy.shield = Math.max(0, enemy.shield - amount); return; }
    enemy.hp -= amount * Math.max(.35, 1 - enemy.armor / 100);
    if (source.slow) { enemy.slow = source.slow; enemy.slowTimer = 2.5; }
    if (source.splash) this.enemies.filter((item) => item !== enemy && item.hp > 0 && Math.hypot(item.x - enemy.x, item.y - enemy.y) < 42).forEach((item) => { item.hp -= amount * .45; if (item.hp <= 0) this.killEnemy(item); });
    if (enemy.hp <= 0) this.killEnemy(enemy);
  },

  updateEnemies(dt) {
    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0 || enemy.stunned > 0) { enemy.stunned = Math.max(0, enemy.stunned - dt); return; }
      if (enemy.slowTimer > 0) enemy.slowTimer -= dt; else enemy.slow = 0;
      const point = pointAt(enemy.route, enemy.d); enemy.x = point[0]; enemy.y = point[1]; enemy.d += enemy.def.speed * (1 - enemy.slow) * dt * this.data.speed;
      if (enemy.d >= enemy.routeLength) { enemy.hp = 0; this.hp -= enemy.def.boss ? 2 : 1; this.combo = 0; this.addLog(`${enemy.def.name}冲过了封印，完整度下降。`); }
    });
    this.enemies = this.enemies.filter((enemy) => enemy.hp > 0);
  },

  killEnemy(enemy) {
    if (enemy.def.revive && !enemy.revived) { enemy.revived = true; enemy.hp = enemy.maxHp * .35; enemy.shield = 120; this.addLog(`${enemy.def.name}触发复活，获得临时护盾。`); return; }
    if (enemy.def.split && !enemy.split) { enemy.split = true; this.spawnEnemy('xingxing', .55, this.routeList().indexOf(enemy.route)); this.spawnEnemy('xingxing', .55, this.routeList().indexOf(enemy.route)); }
    this.kills += enemy.def.reward; this.energy = Math.min(140, this.energy + enemy.def.reward * 2); this.combo += 1; this.bestCombo = Math.max(this.bestCombo, this.combo);
  },

  validPlace(x, y) {
    if (x < 50 || x > 910 || y < 45 || y > 505) return false;
    if (this.routeList().some((route) => route.some((point, index) => index && segmentDistance(x, y, route[index - 1], point) < 48))) return false;
    if (Math.hypot(x - 884, y - 270) < 55) return false;
    return !this.towers.some((tower) => Math.hypot(tower.x - x, tower.y - y) < 78);
  },

  placeTower(x, y) {
    if (!this.validPlace(x, y)) { this.addLog('此处不能安置：避开道路、封印与已有妖灵。'); return; }
    const def = ROSTER.find((item) => item.id === this.data.selectedBeast);
    if (this.energy < def.cost) { this.addLog('灵蕴不足，先等敌人被击破。'); return; }
    this.energy -= def.cost; this.towers.push({ id: def.id, x, y, cooldown: .1 }); this.skillReady = this.towers.length >= 3; this.addLog(`${def.name}已安置，阵型强度提升。`); this.syncGame();
  },

  onTouchStart(event) {
    if (this.data.screen !== 'game' || this.data.paused || !this.canvasWidth) return;
    const touch = event.touches[0]; this.placeTower(touch.x / this.canvasWidth * 960, touch.y / this.canvasHeight * 540);
  },

  useSkill() {
    if (!this.skillReady) return;
    this.enemies.slice().forEach((enemy) => this.damageEnemy(enemy, 160 * this.formationBonus(), { type: 'true', breakShield: true, splash: false })); this.skillReady = false; this.addLog('羁绊技发动：全场真伤，封印获得喘息。'); this.setData({ skillReady: false });
  },

  finishGame(won) {
    if (this.finished) return; this.finished = true; const reward = won ? 30 + this.selectedStage * 12 : 0; if (won) { this.tier = Math.max(this.tier, 1 + Math.floor((this.kills + reward) / 30)); wx.setStorageSync('shan-hai-mini-save', { tier: this.tier }); }
    this.setData({ screen: 'result', result: { won, kills: this.kills, combo: this.bestCombo, xp: reward, copy: won ? `你在${LEVELS[this.selectedStage].name}完成了 ${this.totalWaves} 波防守。` : '优先补上交叉火力，再处理护盾与高速敌人。' } });
  },

  replayGame() { this.startGame(); },
  backToSelect() { this.finished = true; this.canvas = null; this.ctx = null; this.setData({ screen: 'select' }); this.prepareSelection(); },
  togglePause() { this.setData({ paused: !this.data.paused }); },
  toggleSpeed() { this.setData({ speed: this.data.speed === 1 ? 2 : 1 }); },

  addLog(message) { this.logs = [message, ...(this.logs || this.data.logs || [])].slice(0, 3); this.setData({ logs: this.logs }); },

  syncGame() {
    this.setData({ hp: Math.max(0, this.hp), energy: Math.floor(this.energy), kills: this.kills, wave: Math.min(this.waveIndex + 1, this.totalWaves), skillReady: this.skillReady, selectedBeastName: ROSTER.find((item) => item.id === this.data.selectedBeast).name });
  },

  frame() {
    if (!this.frameActive) return;
    const now = Date.now(); const dt = Math.min(.05, (now - this.lastFrame) / 1000 || 0); this.lastFrame = now;
    if (this.data.screen === 'game' && !this.data.paused && !this.finished) { this.update(dt); if ((this.frameCount = (this.frameCount || 0) + 1) % 2 === 0) this.syncGame(); }
    this.draw(); this.frameTimer = setTimeout(() => this.frame(), 33);
  },

  draw() {
    if (!this.ctx) return; const ctx = this.ctx; ctx.clearRect(0, 0, 960, 540); ctx.fillStyle = '#152124'; ctx.fillRect(0, 0, 960, 540);
    if (this.atlasReady) { const panelWidth = this.atlas.width / 5; ctx.globalAlpha = .2; ctx.drawImage(this.atlas, panelWidth * this.selectedStage, 0, panelWidth, this.atlas.height, 0, 0, 960, 540); ctx.globalAlpha = 1; }
    ctx.strokeStyle = 'rgba(241,236,223,.05)'; ctx.lineWidth = 1; for (let x = 20; x < 960; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 540); ctx.stroke(); } for (let y = 20; y < 540; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(960, y); ctx.stroke(); }
    this.routeList().forEach((route) => { ctx.beginPath(); route.forEach((point, index) => index ? ctx.lineTo(point[0], point[1]) : ctx.moveTo(point[0], point[1])); ctx.strokeStyle = '#0d1617'; ctx.lineWidth = 76; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.beginPath(); route.forEach((point, index) => index ? ctx.lineTo(point[0], point[1]) : ctx.moveTo(point[0], point[1])); ctx.strokeStyle = '#394d49'; ctx.lineWidth = 62; ctx.stroke(); ctx.lineCap = 'butt'; });
    ctx.fillStyle = 'rgba(228,180,93,.18)'; ctx.strokeStyle = '#e4b45d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(884, 270, 34, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e4b45d'; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.fillText('封印', 884, 274);
    this.routeList().forEach((route) => { ctx.strokeStyle = '#d86c4e'; ctx.beginPath(); ctx.arc(route[0][0], route[0][1], 21, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#d86c4e'; ctx.fillText('裂口', route[0][0], route[0][1] + 4); });
    this.towers.forEach((tower) => { const def = ROSTER.find((item) => item.id === tower.id); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(tower.x, tower.y + 17, 21, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = def.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(tower.x, tower.y, 19, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = def.color; ctx.font = 'bold 18px Arial'; ctx.fillText(def.short, tower.x, tower.y + 6); });
    this.enemies.forEach((enemy) => { ctx.fillStyle = enemy.def.color; ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.def.radius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = enemy.shield > 0 ? '#b5e8e6' : '#1c2829'; ctx.lineWidth = enemy.shield > 0 ? 3 : 1; ctx.stroke(); ctx.fillStyle = '#f1ecdf'; ctx.font = 'bold 10px Arial'; ctx.fillText(enemy.def.short, enemy.x, enemy.y + 3); ctx.fillStyle = '#293535'; ctx.fillRect(enemy.x - enemy.def.radius, enemy.y - enemy.def.radius - 9, enemy.def.radius * 2, 4); ctx.fillStyle = '#76c1a5'; ctx.fillRect(enemy.x - enemy.def.radius, enemy.y - enemy.def.radius - 9, enemy.def.radius * 2 * Math.max(0, enemy.hp / enemy.maxHp), 4); });
    this.projectiles.forEach((projectile) => { ctx.fillStyle = projectile.def.color; ctx.beginPath(); ctx.arc(projectile.x, projectile.y, 3, 0, Math.PI * 2); ctx.fill(); });
  },
});
