# S06 Steamworks 绑定预研

最后核对：2026-09-19。范围是只读技术预研；未安装 SDK、未新增 npm 依赖、未创建 `steam_appid.txt`、未调用 Steam 客户端或 Steamworks 后台。

## 结论

**暂不选定或接入绑定。** 当前项目可作为不含 Steamworks 功能的 Windows 单机版继续准备发行；Steam 成就、Overlay 和 Cloud 保持未承诺状态。

理由不是“无法接入”，而是尚无证据证明任一候选能同时满足本项目的 Electron 38、Windows x64、ASAR 打包和安全隔离约束。先让真实 AppID、开发测试权限和可复现的目标构建到位，再做一个一次性的最小原型；原型不通过即移除，不把失败依赖留在正式包中。

## 已核对的项目事实

| 项目 | 结果 |
| --- | --- |
| Electron | `38.8.6` |
| 运行时 | Windows x64；当前 Node module ABI 为 `147`，N-API 为 `10` |
| 现有窗口安全配置 | `contextIsolation: true`、`nodeIntegration: false`、`sandbox: true` |
| 当前 `window.steamShell` | 仅 preload 暴露的本地存档和本地勋章 IPC；并未初始化 Steamworks |
| 当前风险点 | `src/main.js` 的 `isSteam()` 只检查 `steamShell.platform === 'steam'`，不能作为 SDK 初始化、登录或当前账号状态的依据 |
| 已安装 Steam 绑定 | 无；未修改 `package.json` 或锁文件 |

## 候选评估

| 候选 | 观察到的事实 | 当前决定 |
| --- | --- | --- |
| [`steamworks.js`](https://github.com/ceifa/steamworks.js/) | README 将其定义为 Electron/NW.js 原生模块，并要求生产包带入 redistributable 文件；npm 最新 `0.4.0` 发布于 2024-08。README 的 renderer 示例要求关闭隔离并开启 Node 集成，这与当前安全模型冲突。公开 issue 还存在 Overlay、打包与窗口行为问题。 | 不接入；只有在“主进程加载 + 维持当前隔离 + Electron 38 打包原型”全部通过后才可选。 |
| [`greenworks`](https://github.com/greenheartgames/greenworks) | 官方 README 明确是 best-effort 维护；其 Electron 指引要求 Steamworks SDK、与目标 Electron 匹配的原生二进制或本地重建，并需要将 DLL/原生模块放在可加载路径。没有确认的 Electron 38 Windows x64 预编译证据。 | 不接入；不能把历史 Electron 示例或旧预编译包用于 Electron 38。 |
| 其他 FFI/N-API 包 | 未完成来源、许可证、Electron 38、ASAR 解包规则和真实 AppID 验证，不应仅凭 npm 页面宣称可用。 | 不作为当前候选。 |

Valve 的 SDK 是上传内容的必需工具，但成就等 API 不是 Windows 首发的强制前置；因此不以 S06 阻塞 S01-S05、S08-S10 的本地准备。

## 未来最小原型门禁

仅在用户提供真实 Steamworks AppID、测试权限并明确授权“接入原型”后实施。SDK、测试 AppID 和临时工具全部放在 `G:\Codex files\Steamworks\`，不提交到仓库。

1. 在独立分支或隔离副本中安装一个候选，锁定精确版本和许可证；记录下载来源与 SHA-256。
2. 原生绑定仅在 Electron 主进程加载；preload 只暴露 `getStatus`、`unlockAchievement` 等明确白名单，renderer 不加载原生模块、不获得平台对象。
3. 保持 `contextIsolation: true`、`nodeIntegration: false` 和 `sandbox: true`。任何候选若只能通过降低这些设置才能运行，判为不适合本项目。
4. 配置 `asarUnpack` 与 Steam redistributable；正式候选包不带 `steam_appid.txt`。开发文件只放隔离测试目录。
5. 对真实目标 AppID 验证：Steam 未启动、无授权、离线、初始化失败、正常初始化、一次成就解锁、重启幂等和离线后补同步。
6. 单独验证 Overlay：反复 Shift+Tab、Alt+Tab、最小化和回到战斗后，游戏只按已有生命周期规则暂停/恢复，不出现幽灵窗口、无响应继续按钮或双重暂停。
7. 从打包目录而非开发服务器启动，核对 DLL、原生模块、ASAR 和错误日志；原型失败时完整移除依赖及打包规则。

## 后续代码边界

原型通过后才允许修改 `electron/main.cjs`、`electron/preload.cjs` 与 `src/main.js`。改动应把“桌面可保存”与“Steam 已初始化/账号可用”拆为不同状态，并把本地勋章、待同步、平台确认分层；不能将当前 `platform: 'steam'` 伪装成真实 Steam 状态。

## 参考

- [Valve Steamworks SDK](https://partner.steamgames.com/doc/sdk)
- [steamworks.js README](https://github.com/ceifa/steamworks.js/)
- [greenworks Electron 构建说明](https://github.com/greenheartgames/greenworks/blob/master/docs/build-instructions-electron.md)
