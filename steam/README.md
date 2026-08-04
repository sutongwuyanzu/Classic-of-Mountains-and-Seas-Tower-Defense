# Steam 发行

桌面版本使用 Electron 载入同一套本地游戏资源，构建命令：

```bash
npm install
npm run dist:steam
```

如果 Electron Builder 下载 Windows 安装器工具受限，可以先生成无需安装的便携版：

```bash
npm run dist:portable
```

输出目录是 `release/ShanHaiDefense-win-unpacked/`，其中的 `ShanHaiDefense.exe` 可以直接启动并用于本地验收或 SteamPipe 测试。

安装包会输出到 `dist/`。当前工程已经具备 Steam 可上传的桌面包结构，但正式上架前仍需要：

1. 在 Steamworks 后台创建 App ID。
2. 配置商店页、年龄分级、截图、胶囊图和发行地区。
3. 使用 SteamPipe 上传 `dist/` 中的安装包或解包文件。
4. 如需成就、云存档和 Steam Overlay，再接入 Steamworks SDK，并把 App ID 与密钥放在本地构建环境，不提交到仓库。

游戏存档目前使用 Electron 用户数据目录中的浏览器本地存储，适合单机版本；Steam 云存档可以在接入 SDK 时将该目录同步到 Steam Cloud。
