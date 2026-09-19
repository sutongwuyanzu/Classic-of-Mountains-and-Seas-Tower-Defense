# 素材来源与 AI 内容披露台账

最后核对：2026-09-19

本文件用于 Steam Content Survey 和发布前版权复核。它不是对 Steamworks 的提交，也不替代发行方对权利链的确认。

## 当前构建范围

- 游戏运行时不会请求图像生成、文本生成或其他在线 AI 服务；游戏资源随安装包预先交付。
- `electron-builder.yml` 排除任意目录下的 `*-source.png` 和 `*.prompt.txt`。这些文件只作为仓库内的生成与审计记录，不能进入 Steam depot。
- 攻击动画的 `assets/animations/attacks/*-qc/` 是离线质检中间产物，运行时代码没有引用；发行包同样排除。
- 运行时构建仍包含 `assets/` 中实际被程序引用的背景、妖灵、敌人、攻击动画与特效。

## AI 内容分类

| 类别 | 当前判定 | Steam 调查填写方向 |
| --- | --- | --- |
| 妖灵、敌人、攻击动画、特效与背景中的预先生成素材 | 可能由开发阶段的生成式图像工具辅助产出；以每个资源的审计记录为准 | Pre-Generated AI content |
| 运行时动态生成内容 | 未实现 | 不填写 Live-Generated AI content |

Steam 要求披露玩家会消费的、在开发阶段由 AI 工具协助生成的内容；若游戏运行时生成内容，还需要说明防护措施。因此实际填写 Content Survey 前，发行方必须逐项复核本表和资产权利。

## 证据位置

| 资源组 | 审计证据 | 发布包处理 |
| --- | --- | --- |
| 妖灵立绘 | `assets/sprites/<id>-source.png` 与 `assets/sprites/<id>.prompt.txt`（存在时） | 仅打包 `assets/sprites/<id>.png` |
| 战斗攻击动画 | `assets/animations/attacks/<id>-source.png` 与 `assets/animations/attacks/<id>.prompt.txt` | 仅打包运行时贴图；不打包 `*-qc/` 中间产物 |
| 战斗特效 | `assets/fx/<id>-source.png` 与 `assets/fx/<id>.prompt.txt` | 仅打包 `<id>.png` |
| 商店胶囊图草稿 | `steam/store/drafts/capsule-keyart-background-v1.png`、`capsule-keyart-vertical-v1.png` 与各自同名 `.prompt.txt` | 不在游戏运行时包内；仅供发行方审阅，未获确认前不得上传 |
| 未配对的背景或旧素材 | 目前没有完整逐文件提示词记录 | 发布前由发行方补充来源、授权或重做记录 |

## 发布前人工确认清单

1. 核对每个可见素材的来源、商业使用权、人物/商标/第三方 IP 风险及是否与商店页描述一致。
2. 对没有 `source`/`prompt` 配对记录的可见素材补充书面来源；无法确认权利时替换，不要仅依赖本台账。
3. 用 `npm run dist:steam` 构建后，扫描 `dist/win-unpacked/resources/app.asar`，确认没有 `*-source.png` 或 `*.prompt.txt`。
4. 在 Steamworks Content Survey 中如实声明预生成 AI 辅助内容；本项目当前没有 Live-Generated AI 功能，除非后续新增联网/本地生成能力。
5. Steam 审核前冻结本台账，并将最终的构建版本、哈希和 Survey 答案一起归档。
6. Electron/Chromium 的随包许可证与新增依赖核对见 `steam/THIRD_PARTY_NOTICES.md`；该文件不替代本台账中的素材商业使用权确认。

## 本次打包验证

- 2026-09-19 执行 `npm run dist:steam` 后，`dist/win-unpacked/resources/app.asar` 中 `*-source.png`、`*.prompt.txt` 和 `assets/animations/attacks/*-qc/` 均为 0 个条目。
- 对应 NSIS 安装包：`dist/山海异兽志-Setup-0.1.0-x64.exe`，254,767,907 bytes，SHA-256 `9DA3FE01CB8D63578279DBBB40B3171A12E31953B476CF4E906C96A198D7E59D`。
- 实际 EXE 启动 5 秒后窗口标题为“山海异兽志”；从同一 ASAR 临时解出后的首局渲染检查无 JavaScript 控制台错误。截图：`G:\Codex files\steam-s08-assets\release-battle-1280x800.png`。
