const ROSTER = [
  ['bifang','毕方',0,20,1.15,168,'mag'],['fuzhu','夫诸',0,15,.92,155,'mag'],['jiuwei','九尾狐',0,25,1.48,175,'mag'],['tiangou','天狗',0,17,.82,145,'phy'],['xuangui','旋龟',0,34,1.85,138,'phy'],
  ['shengsheng','狌狌',1,27,1.2,165,'phy'],['kaiming','开明兽',1,38,1.62,155,'phy'],['bo','驳',1,29,1.08,160,'phy'],['zheng','狰',1,32,1.2,150,'phy'],
  ['qiuniu','囚牛',2,36,.98,182,'mag'],['yazi','睚眦',2,48,.9,145,'phy'],['chaofeng','嘲风',2,31,.68,195,'mag'],['pulao','蒲牢',2,45,1.35,174,'mag'],['suanni','狻猊',2,34,1.08,162,'mag'],['bixi','霸下',2,55,2.05,132,'phy'],['bian','狴犴',2,39,.88,155,'phy'],['fuxi_long','负屭',2,26,.75,210,'mag'],['chiwen','螭吻',2,44,1.52,166,'mag'],
  ['dayu','大禹',3,58,1.2,188,'true'],['gonggong','共工',3,72,1.72,170,'true'],
  ['qinglong','青龙',4,86,1.1,222,'mag'],['baihu','白虎',4,102,1.3,190,'phy'],['zhuque','朱雀',4,74,.78,218,'mag'],['xuanwu','玄武',4,92,1.9,178,'true'],['huangdi','黄帝',4,66,1.05,206,'true'],['fuxi','伏羲',4,58,.72,232,'mag'],['nuwa','女娲',4,52,.94,214,'true'],
].map((item, portraitIndex) => ({ id:item[0], name:item[1], rarity:item[2], dmg:item[3], interval:item[4], range:item[5], dmgType:item[6], portraitIndex,
  splash:['bifang','xuangui','pulao','bixi','dayu','zhuque','nuwa'].includes(item[0]), slow:['fuzhu','chaofeng','chiwen','dayu','gonggong','qinglong','xuanwu','nuwa'].includes(item[0]) ? .22 : 0,
  breakShield:['bo','bixi','dayu','baihu','xuanwu','nuwa'].includes(item[0]), color:['#918b79','#5f9db5','#8c62b2','#d29637','#ca4938'][item[2]] }));

const LEVELS = [
  { name:'幽都洞窟', intro:'三层折返，交叉火力覆盖多段道路。', hp:1, speed:1, essence:112, background:'cave', boss:'taotie', routes:[[[884,438],[720,438],[650,360],[800,270],[660,185],[770,100],[530,100],[470,205],[300,205],[240,350],[130,280],[74,112]]] },
  { name:'北野草原', intro:'疾风敌群频繁出现，远射与控制更重要。', hp:1.12, speed:1.03, essence:118, background:'grass', boss:'baize', routes:[[[884,420],[690,420],[600,330],[760,240],[700,105],[480,105],[420,250],[250,250],[180,395],[74,395]]] },
  { name:'沧海之上', intro:'潮汐持续恢复，破甲与爆发必须配合。', hp:1.25, speed:1.06, essence:124, background:'sea', boss:'taotie', routes:[[[884,270],[760,440],[600,420],[520,300],[680,180],[530,80],[360,120],[300,300],[140,400],[74,152]]] },
  { name:'赤焰火山', intro:'两道裂口并行进攻，阵容需要分守。', hp:1.4, speed:1.09, essence:132, background:'volcano', boss:'baize', routes:[[[884,118],[760,118],[680,225],[520,105],[390,230],[250,104],[74,104]],[[884,422],[760,422],[680,315],[520,435],[390,310],[250,436],[74,436]]] },
  { name:'天庭云阶', intro:'双路汇流，护盾、免疫与复活轮换。', hp:1.58, speed:1.12, essence:140, background:'heaven', boss:'taotie', routes:[[[884,100],[730,100],[620,210],[480,145],[360,270],[220,270],[74,270]],[[884,440],[730,440],[620,330],[480,395],[360,270],[220,270],[74,270]]] },
];

const ENEMIES = {
  xingxing:{name:'狌狌',hp:92,speed:45,radius:12,reward:1,sprite:0}, fei:{name:'飞廉',hp:135,speed:62,radius:13,reward:1,sprite:1},
  bashe:{name:'巴蛇',hp:360,speed:31,radius:18,reward:2,armor:8,sprite:2}, huali:{name:'化蛇',hp:230,speed:38,radius:15,reward:2,immuneMag:true,sprite:3},
  wangliang:{name:'魍魉',hp:180,speed:56,radius:13,reward:2,stealth:true,sprite:4}, zhuyan:{name:'朱厌',hp:420,speed:28,radius:20,reward:3,armor:16,shield:100,sprite:5},
  taotie:{name:'饕餮',hp:760,speed:22,radius:25,reward:5,armor:12,shield:220,heal:true,boss:true,sprite:6}, baize:{name:'白泽',hp:560,speed:25,radius:22,reward:5,revive:true,boss:true,sprite:7},
  shanxiao:{name:'山魈',hp:200,speed:50,radius:14,reward:2,split:true,sprite:8},
};

const WAVES = [
  [['xingxing',6,1.15,0,.82]],[['xingxing',7,1.05,0,.86],['fei',2,1.4,2.5,.82]],[['xingxing',7,1,0,.9],['bashe',1,0,4,.78]],[['fei',5,1.05,0,.9],['wangliang',2,1.5,2,.82]],
  [['xingxing',8,.86,0,.92],['zhuyan',1,0,5,.72,'miniBoss']],[['huali',3,1.15,0,.82],['xingxing',6,.9,1,.95]],[['fei',6,.9,0,.9],['shanxiao',2,1.35,2,.82]],[['bashe',2,1.35,0,.85],['xingxing',8,.8,1,.96]],
  [['huali',4,1,0,.86],['wangliang',3,1.15,2,.88]],[['shanxiao',4,1,0,.88],['baize',1,0,5,.64,'miniBoss']],[['xingxing',10,.68,0,1],['fei',5,.82,1,.94]],[['bashe',3,1.15,0,.9],['shanxiao',4,.95,2,.92]],
  [['huali',5,.88,0,.9],['wangliang',4,.92,2,.92]],[['fei',9,.62,0,1],['zhuyan',2,1.6,3,.8]],[['xingxing',10,.62,0,1],['huali',4,.9,1.5,.9],['shanxiao',3,1.05,3,.9]],
];

const DIFFICULTIES = {
  easy:{name:'简单',hp:.82,speed:.92,armor:-3,count:.9,essence:1.16,power:1.08},
  normal:{name:'中等',hp:1.08,speed:1.05,armor:4,count:1.08,essence:1,power:1},
  hard:{name:'困难',hp:1.48,speed:1.18,armor:10,count:1.28,essence:.92,power:.96},
};

const BONDS = [
  {name:'山野同气',members:['bifang','fuzhu','jiuwei','tiangou','xuangui'],need:3}, {name:'山海猛兽',members:['shengsheng','kaiming','bo','zheng'],need:2},
  {name:'龙子·凌霄',members:['qiuniu','yazi','chaofeng'],need:3}, {name:'龙子·镇岳',members:['pulao','suanni','bixi'],need:3}, {name:'龙子·碑潮',members:['bian','fuxi_long','chiwen'],need:3},
  {name:'治水之争',members:['dayu','gonggong'],need:2}, {name:'四象归位',members:['qinglong','baihu','zhuque','xuanwu'],need:2}, {name:'人祖开天',members:['huangdi','fuxi','nuwa'],need:2},
  {name:'火羽照夜',members:['bifang','jiuwei','tiangou'],need:3}, {name:'霜甲回澜',members:['fuzhu','xuangui','zheng'],need:3},
];

module.exports = { ROSTER, LEVELS, ENEMIES, WAVES, DIFFICULTIES, BONDS };
