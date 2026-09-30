(() => {
  const chapters = [
    {
      id: 'c01', stage: 0, title: '幽都·独守初印', place: '幽都洞窟', theme: '承担责任', backdrop: 'cave', art: './assets/story/c01-cave.jpg',
      intro: [
        { speaker: '卷中余音', text: '一印未熄，归路尚存。古印还在，裂隙外的生灵就还有屏障。' },
        { speaker: '白泽', text: '醒醒，守渊者。我是白泽，留在图谱中的这一缕意识，还能与你说话。' },
        { speaker: '白泽', text: '浊气正从裂隙外涌。图谱中的妖灵愿意借你一份力量，先守住古印。' },
      ],
      outro: [
        { speaker: '旁白', text: '浊气散开的一瞬，兽影停止了挣扎，望向洞外。古印渐稳，背面的纹路却仍有一处断裂。' },
        { speaker: '白泽', text: '它刚才像是认出了来路。也许事情不是我想的那样。' },
        { speaker: '白泽', text: '这道断纹指向北野。松动的不止幽都一印，我们得去看看。' },
      ],
      bossSubtitle: '侵蚀之形',
      cues: { summon: '它回应了你。现在，你不是独自守印了。', wave5: '裂隙更深了，守住古印。', boss: '饕餮·侵蚀之形。先击退它，不能让它冲破古印。' },
    },
    {
      id: 'c02', stage: 1, title: '北野·识影求归', place: '北野草原', theme: '建立信任', backdrop: 'grass', art: './assets/story/c02-grass.jpg', bound: true,
      intro: [
        { speaker: '卷中余音', text: '影逐浊流，心犹知返。外形虽然受控，本识仍在寻找归路。' },
        { speaker: '白泽', text: '那是从我身上剥离的识影。它受浊气操纵，可我还能听见它在求救。' },
        { speaker: '白泽', text: '守住北野古印，击散缠住它的浊气。别把受困的它，也当成灾祸。' },
      ],
      outro: [
        { speaker: '旁白', text: '墨痕断开，识影收回图谱。白泽的声音比先前清楚了些，北野古印也重新亮起。' },
        { speaker: '白泽', text: '我们不是在杀它。我们是在把它从浊气里拉回来。' },
        { speaker: '白泽', text: '识影记得浊气沿水脉而行。去沧海吧，找到它流来的地方。' },
      ],
      bossSubtitle: '缚识之影',
      cues: { wave5: '草间有影，莫只盯着眼前这一群。', boss: '白泽·缚识之影。那是受控的识影，不是它自己的意愿。', revive: '束缚还未断。再守住这一阵。' },
    },
    {
      id: 'c03', stage: 2, title: '沧海·浊流溯源', place: '沧海之上', theme: '理解灾源', backdrop: 'sea', art: './assets/story/c03-sea.jpg',
      intro: [
        { speaker: '卷中余音', text: '百川本相通，浊流何处结。沿着水脉，找出浊气为何无法散去。' },
        { speaker: '白泽', text: '这片潮流在反复打转。浊气到了这里，竟找不到流出的路。' },
        { speaker: '白泽', text: '先稳住海印。只要刻痕重新显露，我们就能看清哪里断了。' },
      ],
      outro: [
        { speaker: '旁白', text: '海印稳住，旧水脉重新显露。五道相接的印纹之间，数处早已淤塞。' },
        { speaker: '白泽', text: '五境古印不只是锁。它们本该彼此相应，让山海之息流转。如今联系断了，浊气才积成了灾。' },
        { speaker: '白泽', text: '水脉接向赤焰的两处阵眼。我的本体就困在那里。' },
      ],
      bossSubtitle: '浊潮之形',
      cues: { wave5: '浊潮仍在聚拢，守住它们经过的路段。', boss: '饕餮·浊潮之形。和幽都一样的侵蚀，已经沿水脉到了这里。' },
    },
    {
      id: 'c04', stage: 3, title: '赤焰·两岸同守', place: '赤焰火山', theme: '不舍同伴', backdrop: 'volcano', art: './assets/story/c04-volcano.jpg', bound: true,
      intro: [
        { speaker: '卷中余音', text: '两岸同明，一境可安。赤焰的一枚主印，要靠两处阵眼共同维系。' },
        { speaker: '白泽', text: '我的本体也受它操纵，正在向阵眼逼近。这一次，连我的形貌也不能让你分心。' },
        { speaker: '白泽', text: '两边都要有人守。若我的声音断了，照你的判断做。' },
      ],
      outro: [
        { speaker: '旁白', text: '浊气从白泽身上剥落，清醒意识与本体重合。两岸阵眼同明，赤焰主印恢复了联系。' },
        { speaker: '白泽', text: '你没有丢下我，也没有放弃两岸。多谢。' },
        { speaker: '白泽', text: '我已经回来了。还差云阶那一印，我们一起去，把它们的归路也接回来。' },
      ],
      bossSubtitle: '焚识之影',
      cues: { wave5: '两岸仍在相应，不要让一侧独自承受。', boss: '白泽·焚识之影。先守阵眼，别让我的本体冲破封印。', revive: '我还在。最后一道束缚尚未散去。' },
    },
    {
      id: 'c05', stage: 4, title: '云阶·山海归名', place: '天庭云阶', theme: '共同守护', backdrop: 'heaven', art: './assets/story/c05-cloud.jpg', outroArt: './assets/story/story-ending.jpg',
      intro: [
        { speaker: '卷中余音', text: '五境相应，万物有归。接通最后一印，让浊气重新流转、消解。' },
        { speaker: '白泽', text: '幽都、北野、沧海与赤焰已经相应。接回这里，五境才能重新流转。' },
        { speaker: '白泽', text: '守住两路汇合处。你与妖灵守过的每一程，都不会白费。' },
      ],
      outro: [
        { speaker: '旁白', text: '饕餮之形上的浊气散开，天印重新亮起。束缚其中的本识，终于各有归途。' },
        { speaker: '白泽', text: '云阶守住了。听，它们又能回应自己的名字了。' },
        { speaker: '白泽', text: '守住了。这一次，不只守住了人间，也守住了它们的归处。' },
      ],
      bossSubtitle: '聚浊之形',
      cues: { wave5: '来路不同，归处相同。守住它们汇合的地方。', boss: '饕餮·聚浊之形。守住天印，就能接回最后一环。' },
    },
  ];

  window.ShanHaiStory = Object.freeze({
    version: 1,
    title: '五境归名',
    chapters: Object.freeze(chapters.map((chapter) => Object.freeze({
      ...chapter,
      intro: Object.freeze(chapter.intro.map((line) => Object.freeze({ ...line }))),
      outro: Object.freeze(chapter.outro.map((line) => Object.freeze({ ...line }))),
      cues: Object.freeze({ ...chapter.cues }),
    }))),
  });
})();
