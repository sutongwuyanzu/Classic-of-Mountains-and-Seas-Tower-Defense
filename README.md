# 山海异兽志 · Classic of Mountains and Seas Tower Defense

这是一个独立重建的山海经主题塔防游戏，不是从 MakePlay 导出的原始工程。原项目的内部源码和素材没有开放下载，因此本项目使用可维护的数据驱动战斗逻辑、Canvas 绘制和原创地貌素材来重建玩法。

## 运行

需要 Python 3：

```bash
npm run dev
```

然后打开 `http://localhost:4173`。也可以直接双击 `index.html`；Windows 用户也可以双击 `start-game.cmd` 自动启动服务器并打开游戏。

## 发行目标

- Steam 桌面版：`npm install` 后执行 `npm run dist:portable` 生成便携版；`npm run dist:steam` 用 Electron Builder 生成安装包。
- 微信小程序：使用微信开发者工具打开 `miniprogram/`，这是不依赖网页服务器的原生 Canvas 版本。

## 已实现

- 五个关卡的独立路径：洞窟、草原、沧海、火山、云阶；第四和第五关为双出怪口汇流
- 每关递增波次结构，清空当前波次后自动进入下一波
- 自由坐标放置，避开道路、封印、裂隙和已有妖灵
- 27 只妖灵的数据表与 5 只初始可用妖灵
- 三角、正方形、横列、聚拢四种阵型评分
- 8 个羁绊的成员检测、松散阵型半额加成和羁绊技
- 光环、索敌、追踪弹道、免疫、护甲、燃烧、减速、溅射、连锁
- 复活和分裂敌人、击杀归属、局外修为本地存档
- 使用原创 GPT Image 2 五地貌图集作为关卡背景素材

## 说明

这是玩法重建版本。MakePlay 原项目的原始 TypeScript 文件、完整素材和内部编辑工程仍然不在本仓库中。
