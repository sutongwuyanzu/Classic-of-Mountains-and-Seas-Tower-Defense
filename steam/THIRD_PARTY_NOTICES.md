# 第三方许可证与发行包声明核对

最后核对：2026-09-19。本文记录当前 Windows 候选包中已发现的第三方运行时声明；不是对项目美术、商标、音乐或第三方内容的权利保证。

## 已验证的候选包声明

以 `dist/win-unpacked/` 的当前 Windows x64 候选包为准：

| 组件 | 当前版本/证据 | 许可证或通知处理 |
| --- | --- | --- |
| Electron | 项目锁定 `38.8.6`；候选包根目录含 `LICENSE.electron.txt`（1,096 bytes） | MIT 文本已随候选包提供 |
| Chromium 及其依赖声明 | 候选包根目录含 `LICENSES.chromium.html`（15,168,645 bytes） | 完整 notices 已随候选包提供 |
| electron-builder | 项目锁定 `26.15.3`，MIT；仅参与构建 | 不作为游戏运行时模块装入 `app.asar`；保留构建依赖记录即可 |
| 游戏运行时代码 | `app.asar` 按 `electron-builder.yml` 仅包含 HTML、CSS、`src`、`shared`、`assets`、`electron` 与 `package.json` | 未发现第三方 npm 运行时目录；后续新增依赖必须重新核对 |

## 已核对的资源边界

- `assets/` 当前为图片、GIF、JSON 和生成审计文本；未发现随包的 `ttf`、`otf`、`woff`、`mp3`、`ogg` 或 `wav` 文件。
- 游戏音效与氛围声由 Web Audio 在运行时合成；这不替代将来新增外部音频时的来源和许可证核对。
- 妖灵、敌人、背景、特效与商店胶囊草稿的 AI 辅助生成和权利链，仍只以 `ASSET_PROVENANCE.md` 的人工复核为准；Electron/Chromium notices 不涵盖它们。

## 发售前复核

1. 每次重新打包后确认 `LICENSE.electron.txt` 与 `LICENSES.chromium.html` 仍位于 depot 内容根目录，未被构建规则排除。
2. 新增 npm 运行时依赖、字体、音频、外部代码、商标或 SDK 后，补充组件、版本、许可证文本位置与署名要求。
3. 不将 `package.json` 的作者字段、GitHub 仓库公开状态或生成工具提示词当作商业使用许可。
4. 发行方逐项确认 `ASSET_PROVENANCE.md` 中所有玩家可见素材后，再提交 Steam Content Survey；无法确认的内容必须替换或从最终包中移除。
