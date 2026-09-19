# SteamPipe 本地模板

这些文件是无凭据、不可直接上传的模板。它们故意包含 `__STEAM_*__` 占位符；在没有 Steamworks 分配的 AppID/DepotID 前，禁止猜测数字或调用 SteamCMD。

## 前置条件

1. 发行方在 Steamworks 后台创建应用、Windows depot 和私有测试分支，并确认启动项为 `山海异兽志.exe`。
2. 从本仓库执行 `npm run dist:steam`，将 `dist/win-unpacked/` 作为候选内容目录；不要把 NSIS 安装器作为 depot 内容根目录。
3. SteamCMD/SDK、构建输出、实际 AppID/DepotID 配置和登录态只放在 `G:\Codex files\Steamworks\`，不要提交到仓库。

## 建议的本地准备流程

1. 复制两个模板到 `G:\Codex files\Steamworks\shan-hai-defense\`，分别重命名为 `app_build.vdf` 与 `depot_build_windows.vdf`。
2. 用后台分配的数字替换 AppID 和 DepotID，将两个 `ContentRoot` 替换为本轮已验收的 `dist/win-unpacked` 绝对路径，将 `BuildOutput` 指向 `G:\Codex files\Steamworks\output\`。
3. 保持 `setlive` 为空。私有测试分支由用户在后台明确操作，不允许脚本自动公开到默认分支。
4. 上传前运行：`npm run check:steampipe -- "G:\Codex files\Steamworks\shan-hai-defense\app_build.vdf"`。
5. 只有用户针对该次上传明确授权后，才运行 SteamCMD；上传后从 Steam 客户端安装并验证，而不是只检查命令返回码。

`npm run check:steampipe` 不带参数只检查仓库模板仍保持“不可上传”状态。传入具体本地 VDF 后会拒绝占位符、凭据、自动 SetLive、非数字 ID、缺失内容根目录或缺少 `山海异兽志.exe` 的候选包。
