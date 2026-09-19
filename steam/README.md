# Steam 桌面构建

桌面版本使用 Electron 载入同一套本地游戏资源。构建 NSIS 安装包：

```bash
npm install
npm run dist:steam
```

生成单个 EXE 的临时便携构建：

```bash
npm run dist:portable
```

输出文件位于 `dist/山海异兽志-Portable-<version>-x64.exe`。首次运行时 Electron 会解压到系统临时目录，因此它适合本地试玩，不作为 Steam 内容包。

如需可直接检查的解包目录，执行：

```bash
npm run dist:unpacked
```

输出到 `release/ShanHaiDefense-win-unpacked/`。

构建完成后生成版本、大小和 SHA-256 清单：

```bash
npm run manifest:steam
```

清单输出到 `dist/steam-release-manifest-<version>.json`，包含构建号、产物 SHA-256、源码提交、工作区 dirty 状态与实际 Electron/electron-builder 版本。dirty 构建仅用于本地验收，不能标记为干净候选包。

安装包输出为 `dist/山海异兽志-Setup-<version>-x64.exe`。该安装包用于 Windows 本地分发和验收；Steam 发行应使用 SteamPipe 将 depot 内容目录上传到 Steamworks，而不是直接分发本安装包。正式上架前仍需要：

1. 在 Steamworks 后台创建 App ID。
2. 配置商店页、年龄分级、截图、胶囊图和发行地区。
3. 配置 SteamPipe depot 内容目录并上传测试分支。
4. 如需成就、云存档和 Steam Overlay，再接入 Steamworks SDK，并把 App ID 与密钥放在本地构建环境，不提交到仓库。

游戏存档目前使用 Electron 用户数据目录中的 `save-v2.json` 并保留浏览器本地回退，适合单机版本。未来若接入 Steam Cloud，不能同步整个 Electron 用户数据目录；仅在真实 AppID 和跨设备冲突验证通过后同步明确的进度文件。范围与迁移规则见 `steam/CLOUD_SCOPE.md`。
