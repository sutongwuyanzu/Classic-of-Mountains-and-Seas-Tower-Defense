const ROSTER = [
  ['bifang','毕方',0,20,1.15,168,'mag'],['fuzhu','夫诸',0,15,.92,155,'mag'],['jiuwei','九尾狐',0,25,1.48,175,'mag'],['tiangou','天狗',0,17,.82,145,'phy'],['xuangui','旋龟',0,34,1.85,138,'phy'],
  ['shengsheng','狌狌',1,27,1.2,165,'phy'],['kaiming','开明兽',1,22,.98,155,'mag'],['bo','驳',1,31,1.55,170,'phy'],['zheng','狰',1,19,.74,150,'phy'],
  ['qiuniu','囚牛',2,21,1.12,174,'mag'],['yazi','睚眦',2,38,1.7,145,'phy'],['chaofeng','嘲风',2,18,.86,182,'mag'],['pulao','蒲牢',2,24,1.1,165,'mag'],['suanni','狻猊',2,29,1.38,154,'mag'],['bixi','霸下',2,44,2.1,132,'phy'],['bian','狴犴',2,20,.82,166,'phy'],['fuxi_long','负屭',2,32,1.35,178,'mag'],['chiwen','螭吻',2,23,.94,190,'mag'],
  ['dayu','大禹',3,40,1.7,184,'true'],['gonggong','共工',3,35,1.42,180,'true'],
  ['qinglong','青龙',4,50,1.55,206,'mag'],['baihu','白虎',4,66,1.9,160,'phy'],['zhuque','朱雀',4,45,1.22,194,'mag'],['xuanwu','玄武',4,32,.9,188,'true'],['huangdi','黄帝',4,41,1.3,190,'true'],['fuxi','伏羲',4,38,1.05,215,'mag'],['nuwa','女娲',4,36,1.15,200,'true'],
].map((item, portraitIndex) => ({ id:item[0], name:item[1], rarity:item[2], dmg:item[3], interval:item[4], range:item[5], dmgType:item[6], portraitIndex,
  splash:['xuangui','pulao','bixi','dayu','zhuque','nuwa'].includes(item[0]), splashRadius:{ xuangui:54, pulao:34, bixi:45, dayu:58, zhuque:52, nuwa:42 }[item[0]] || 0,
  slow:{ fuzhu:.28, zheng:.18, chaofeng:.22, chiwen:.2, dayu:.24, gonggong:.2, qinglong:.25, xuanwu:.36, nuwa:.24 }[item[0]] || 0, slowDur:{ fuzhu:2.5, zheng:2, chaofeng:2.8, chiwen:3, dayu:2, gonggong:2.5, qinglong:3, xuanwu:3.4, nuwa:2.6 }[item[0]] || 0,
  counters:{ bifang:['purge'], fuzhu:['insight'], jiuwei:['splash'], tiangou:['execute'], xuangui:['breakShield'], shengsheng:['execute'], kaiming:['purge'], bo:['breakShield'], zheng:['insight'], qiuniu:['splash'], yazi:['execute'], chaofeng:['insight'], pulao:['splash'], suanni:['purge'], bixi:['breakShield'], bian:['execute'], fuxi_long:['splash'], chiwen:['insight'], dayu:['breakShield','splash'], gonggong:['purge','insight'], qinglong:['insight','splash'], baihu:['execute','breakShield'], zhuque:['purge','splash'], xuanwu:['breakShield','insight'], huangdi:['purge','execute'], fuxi:['insight','splash'], nuwa:['breakShield','purge'] }[item[0]] || [],
  breakAt:{ xuangui:3, bo:2, bixi:2, yazi:2, baihu:2 }[item[0]] || 0, stunEvery:{ tiangou:4, bian:5 }[item[0]] || 0, chain:{ jiuwei:2, qiuniu:1, fuxi_long:2, gonggong:2, qinglong:3, fuxi:2 }[item[0]] || 0,
  burn:['bifang','kaiming','suanni','zhuque','huangdi'].includes(item[0]), burnDps:{ bifang:.22, kaiming:.18, suanni:.2, zhuque:.25, huangdi:.2 }[item[0]] || 0, breakShield:['bo','bixi','dayu','baihu','xuanwu','nuwa'].includes(item[0]), color:['#918b79','#5f9db5','#8c62b2','#d29637','#ca4938'][item[2]] }));

const LEVELS = [
  { name:'幽都洞窟', intro:'三层折返，交叉火力覆盖多段道路。', hp:1, speed:1, essence:56, background:'cave', boss:'taotie', routes:[[[884,438],[720,438],[650,360],[800,270],[660,185],[770,100],[530,100],[470,205],[300,205],[240,350],[130,280],[74,112]]] },
  { name:'北野草原', intro:'疾风敌群频繁出现，远射与控制更重要。', hp:1.12, speed:1.03, essence:62, background:'grass', boss:'baize', routes:[[[884,420],[690,420],[600,330],[760,240],[700,105],[480,105],[420,250],[250,250],[180,395],[74,395]]] },
  { name:'沧海之上', intro:'潮汐持续恢复，破甲与爆发必须配合。', hp:1.25, speed:1.06, essence:70, background:'sea', boss:'taotie', routes:[[[884,270],[760,440],[600,420],[520,300],[680,180],[530,80],[360,120],[300,300],[140,400],[74,152]]] },
  { name:'赤焰火山', intro:'两道裂口并行进攻，阵容需要分守。', hp:1.4, speed:1.09, essence:78, background:'volcano', boss:'baize', routes:[[[884,118],[760,118],[680,225],[520,105],[390,230],[250,104],[74,104]],[[884,422],[760,422],[680,315],[520,435],[390,310],[250,436],[74,436]]] },
  { name:'天庭云阶', intro:'双路汇流，护盾、免疫与复活轮换。', hp:1.58, speed:1.12, essence:86, background:'heaven', boss:'taotie', routes:[[[884,100],[730,100],[620,210],[480,145],[360,270],[220,270],[74,270]],[[884,440],[730,440],[620,330],[480,395],[360,270],[220,270],[74,270]]] },
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

const ACTIVE_SKILLS = {
  bifang:{name:'赤羽焚原',type:'area',mana:34,cooldown:15,mult:2.2,radius:105,burn:true}, fuzhu:{name:'霜泽漫行',type:'slow',mana:30,cooldown:14,radius:155,slow:.52,duration:4}, jiuwei:{name:'九影分袭',type:'multishot',mana:36,cooldown:16,count:4,mult:1.15}, tiangou:{name:'锁魂天啸',type:'targetStun',mana:30,cooldown:15,stun:3.2,mult:1.4,rangeMul:1.6}, xuangui:{name:'地脉玄震',type:'areaStun',mana:38,cooldown:18,radius:118,stun:1.8,mult:1.25},
  shengsheng:{name:'山影追猎',type:'split',mana:34,cooldown:16,shots:7,count:2,mult:.7}, kaiming:{name:'九门炎域',type:'area',mana:38,cooldown:17,mult:2.4,radius:112,burn:true}, bo:{name:'贯甲独角',type:'armorBreak',mana:34,cooldown:15,radius:145,armorBreak:14,duration:6,mult:1.2}, zheng:{name:'疾影连斩',type:'multishot',mana:36,cooldown:15,count:5,mult:.9}, qiuniu:{name:'镇魂龙曲',type:'areaStun',mana:42,cooldown:19,radius:135,stun:2.1,mult:1.35},
  yazi:{name:'血刃裂军',type:'split',mana:40,cooldown:17,shots:8,count:2,mult:.82}, chaofeng:{name:'御风缚地',type:'slow',mana:36,cooldown:16,radius:175,slow:.58,duration:4.5}, pulao:{name:'蒲牢洪钟',type:'areaStun',mana:44,cooldown:20,radius:145,stun:2.4,mult:1.5}, suanni:{name:'香火燎天',type:'area',mana:42,cooldown:18,mult:2.7,radius:125,burn:true}, bixi:{name:'负岳镇渊',type:'armorBreak',mana:42,cooldown:19,radius:155,armorBreak:18,duration:7,mult:1.5},
  bian:{name:'天牢裁决',type:'targetStun',mana:38,cooldown:17,stun:4,mult:1.8,rangeMul:1.65}, fuxi_long:{name:'龙吟裂波',type:'multishot',mana:44,cooldown:18,count:6,mult:1.05}, chiwen:{name:'吞潮回澜',type:'slow',mana:40,cooldown:17,radius:190,slow:.62,duration:5}, dayu:{name:'九州洪流',type:'area',mana:50,cooldown:21,mult:3.4,radius:155,slow:.45,duration:4}, gonggong:{name:'怒触不周',type:'areaStun',mana:52,cooldown:22,radius:175,stun:2.8,mult:2.4,armorBreak:10,duration:6},
  qinglong:{name:'苍龙万雷',type:'multishot',mana:58,cooldown:24,count:8,mult:1.35}, baihu:{name:'庚金断岳',type:'armorBreak',mana:56,cooldown:23,radius:185,armorBreak:24,duration:8,mult:2.8}, zhuque:{name:'涅槃天火',type:'area',mana:60,cooldown:25,mult:4.2,radius:175,burn:true}, xuanwu:{name:'玄冥封界',type:'areaStun',mana:58,cooldown:24,radius:190,stun:3.4,mult:2.2,slow:.65,duration:5}, huangdi:{name:'轩辕敕令',type:'multishot',mana:60,cooldown:24,count:9,mult:1.45}, fuxi:{name:'八卦定域',type:'targetStun',mana:54,cooldown:21,stun:6,mult:3,rangeMul:1.8}, nuwa:{name:'补天息壤',type:'area',mana:58,cooldown:23,mult:3.5,radius:180,slow:.5,duration:5},
};

const DIFFICULTIES = {
  easy:{name:'简单',hp:.82,speed:.92,armor:-3,count:.9,essence:1.16,power:1.08},
  normal:{name:'中等',hp:1.08,speed:1.05,armor:4,count:1.08,essence:1,power:1},
  hard:{name:'困难',hp:1.48,speed:1.18,armor:10,count:1.28,essence:.92,power:.96},
};

const SUPPORT_SKILLS = {
  bifang:['赤羽鼓舞','power',.08,165], fuzhu:['泽气延展','range',.1,180], jiuwei:['狐火回灵','manaRegen',.22,175], tiangou:['逐月迅击','haste',.1,160], xuangui:['玄甲蕴灵','manaRegen',.28,175],
  shengsheng:['群山战意','power',.09,165], kaiming:['九门威仪','power',.1,175], bo:['踏阵急袭','haste',.1,165], zheng:['疾风同猎','haste',.12,170],
  qiuniu:['余音回法','cdr',.12,185], yazi:['凶威共振','power',.12,170], chaofeng:['高台望远','range',.13,195], pulao:['钟鸣醒神','cdr',.14,185], suanni:['香云聚灵','manaRegen',.32,180], bixi:['负岳静息','manaRegen',.3,175], bian:['明察先机','cdr',.13,185], fuxi_long:['龙文远射','range',.14,195], chiwen:['潮汐续灵','manaRegen',.34,190],
  dayu:['九州调度','cdr',.18,205], gonggong:['怒潮回灵','manaRegen',.42,205], qinglong:['青霄迅捷','haste',.16,215], baihu:['白帝战意','power',.16,195], zhuque:['南明炽心','power',.15,210], xuanwu:['玄冥灵泉','manaRegen',.48,215], huangdi:['人皇号令','power',.14,215], fuxi:['河图拓界','range',.18,225], nuwa:['造化轮转','cdr',.2,220],
};

const BONDS = [
  {id:'wild',name:'山野同气',members:['bifang','fuzhu','jiuwei','tiangou','xuangui'],need:3,stat:'power',bonus:.14,stepBonus:.07,color:'#d98a67',ult:'焚野',skill:'fire',cooldown:22,ultMul:2.2},
  {id:'fierce',name:'山海猛兽',members:['zheng','kaiming','bo','shengsheng'],need:2,stat:'haste',bonus:.12,stepBonus:.06,color:'#e1ac65',ult:'猎潮',skill:'roar',cooldown:20,ultMul:2},
  {id:'dragon_sky',name:'龙子·凌霄',members:['qiuniu','yazi','chaofeng'],need:3,stat:'haste',bonus:.16,stepBonus:0,color:'#a984c5',ult:'凌霄龙吟',skill:'storm',cooldown:24,ultMul:2.5},
  {id:'dragon_earth',name:'龙子·镇岳',members:['pulao','suanni','bixi'],need:3,stat:'sunder',bonus:.2,stepBonus:0,color:'#cb9860',ult:'镇岳雷火',skill:'roar',cooldown:25,ultMul:2.8},
  {id:'dragon_tide',name:'龙子·碑潮',members:['bian','fuxi_long','chiwen'],need:3,stat:'range',bonus:.14,stepBonus:0,color:'#708fb2',ult:'碑潮裁决',skill:'tide',cooldown:24,ultMul:2.6},
  {id:'sishou',name:'四象归位',members:['qinglong','baihu','zhuque','xuanwu'],need:2,stat:'range',bonus:.1,stepBonus:.06,color:'#65b7af',ult:'四象天门',skill:'storm',cooldown:28,ultMul:3.4},
  {id:'renzu',name:'人祖开天',members:['huangdi','fuxi','nuwa'],need:2,stat:'cdr',bonus:.16,stepBonus:.1,color:'#d4a355',ult:'开天轮转',skill:'restore',cooldown:26,ultMul:3},
  {id:'zhishui',name:'治水之争',members:['dayu','gonggong'],need:2,stat:'sunder',bonus:.16,stepBonus:0,color:'#66a9c3',ult:'怒海分流',skill:'tide',cooldown:24,ultMul:2.8},
  {id:'yanhuo',name:'炎火同源',members:['bifang','suanni','zhuque','nuwa'],need:2,stat:'power',bonus:.1,stepBonus:.08,color:'#e66f55',ult:'炎脉共燃',skill:'fire',cooldown:22,ultMul:2.3},
  {id:'shuize',name:'水泽同流',members:['fuzhu','chiwen','xuanwu','gonggong'],need:2,stat:'enemySlow',bonus:.09,stepBonus:.06,color:'#5fa8b2',ult:'水泽天幕',skill:'tide',cooldown:21,ultMul:2.1},
  {id:'night_fire',name:'火羽照夜',members:['bifang','jiuwei','tiangou'],need:3,stat:'haste',bonus:.09,stepBonus:0,color:'#c9634f',ult:'夜火流星',skill:'fire',cooldown:21,ultMul:2.1},
  {id:'frost_shell',name:'霜甲回澜',members:['fuzhu','xuangui','zheng'],need:3,stat:'enemySlow',bonus:.08,stepBonus:0,color:'#6f9ca5',ult:'霜甲封川',skill:'tide',cooldown:22,ultMul:2.2},
  {id:'beast_hunt',name:'猛兽合围',members:['shengsheng','kaiming','bo','zheng'],need:4,stat:'range',bonus:.12,stepBonus:0,color:'#a4774f',ult:'万兽围猎',skill:'roar',cooldown:23,ultMul:2.4},
];

module.exports = { ROSTER, LEVELS, ENEMIES, WAVES, ACTIVE_SKILLS, SUPPORT_SKILLS, DIFFICULTIES, BONDS };
