# Steam Release Execution Status

最后更新：2026-09-19 19:43 +08:00

## 当前基线

- 实际仓库：`C:\Users\WangMeng\Documents\瞎几把鼓捣`
- 分支：`main`（跟踪 `origin/main`）
- 基线提交：`982392e0a97efd0a9e8e273e242f20d01a7a7fce`
- 基线工作区：运行时代码无已修改的已跟踪文件；仅有本 Steam 计划文档为未跟踪文件。该文档不进入 Electron 打包清单。
- Steam App ID：未提供；尚未接入真实 Steamworks SDK。
- 外部操作：未提交、未推送、未上传 SteamPipe、未提交商店审核、未发布。

## S00：基线与证据

状态：已完成。

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| Windows 免安装构建 | 通过 | `npm run dist:unpacked` 于 2026-09-19 执行成功，输出 `release/ShanHaiDefense-win-unpacked/`。 |
| 实际发行 EXE 启动 | 通过 | `ShanHaiDefense.exe` 以隔离参数 `--user-data-dir=G:\Codex files\steam-s00-baseline\electron-user-data` 启动 5 秒后仍存活，窗口标题为“山海异兽志”。测试 PID 已结束。 |
| 首局关键流程自动化 | 通过 | `G:\Codex files\electron-checks\capture-release.cjs` 对打包的 `resources/app` 运行首局流程，产物截图为 `G:\Codex files\steam-s00-baseline\release-battle-1280x800.png`。流程覆盖加载、选关、开始、暂停、恢复、窗口失焦与恢复。 |
| 运行截图人工检查 | 通过 | 截图显示第 1 关准备态、地图、HUD、召灵面板和操作侧栏均已绘制。 |
| 打包内容卫生 | 通过 | `resources/app` 共 171 个文件，未包含 `*-source.png` 或 `*.prompt.txt`。 |
| 静态回归 | 通过 | `npm run check`：`shared core and WeChat Mini Game smoke checks passed`。 |
| 补丁空白字符检查 | 通过 | `git diff --check` 无输出。 |

### 构建指纹

- `ShanHaiDefense.exe`：210,149,888 bytes
- `ShanHaiDefense.exe` SHA-256：`62C62D170A95AA4A3EB3DF05F0D56A3654AB4344F7452E21DEA1334AFED7100F`
- 首局截图 SHA-256：`5184E83B3CBDFE93E6789BA173C7A0AABF0DDCEA79D86A84A47154241EAE3F9A`

## 后续阶段

| 阶段 | 状态 | 下一步 |
| --- | --- | --- |
| S01 Windows 发行构建 | 已完成 | NSIS 安装包、临时便携 EXE 和解包目录均已实际启动验证；发行清单可重复生成。 |
| S02 存档与可靠性 | 已完成 | 桌面 JSON 存档改为落盘临时文件、有效备份和原子替换，并有损坏恢复回归。 |
| S03 桌面输入与显示 | 已完成 | 键盘快捷键、鼠标既有操作、全屏、失焦恢复与最小窗口布局均已回归。 |
| S04 内容与首局循环 | 已完成（功能审计） | 五图、序章、胜负结算、无尽和试炼入口的打包资源功能审计通过；真实玩家首局与平衡验收待按 `PLAYTEST_SCRIPT.md` 执行。 |
| S05 性能预算 | 部分完成 | 可见窗口已得到两次压力未达标基线；当前远程虚拟显示栈有 GPU IPC 警告，需物理显示器复测后再优化或放行。 |
| S06-S07 Steamworks 与云存档 | 阻塞 | S06 已完成只读绑定预研，结论为暂不选库；S07 已限定第一版只同步 `save-v2.json`，详见 `STEAMWORKS_SPIKE.md`、`CLOUD_SCOPE.md`。仍需要真实 AppID、测试权限、目标 Electron 38 原生模块原型和跨设备验收。 |
| S08 素材与 AI 内容披露 | 已完成 | 已建立来源台账与第三方 notices 核对；NSIS 构建扫描确认源图、提示词和质检中间产物不进入包，实际 EXE 与首局渲染回归通过。发行方仍须确认玩家可见素材的商业权利链并填写 Survey。 |
| S09 商店材料 | 部分完成 | 已建立只含已验收功能的中文文案、截图清单、胶囊图规范、两张无文字构图草稿与实机预告分镜；候选资源 QA 已覆盖五种镜头并通过 1920×1080 输出检查，但正式截图/胶囊图仍须从正常流程制作，且待发行方确认商业资料。 |
| S10 SteamPipe 候选包 | 部分完成 | 已准备不可上传的 VDF 模板与本地校验，且覆盖占位拒绝和具体配置通过；真实 AppID/DepotID、后台权限、SteamCMD 与实际私测仍阻塞。 |
| S11 审核与发售 | 阻塞 | 已新增 `RELEASE_GATES.md` 固化本地发售门禁；仍需要物理显示性能证据、正式商店素材、Steamworks 后台私测及用户针对送审/发布的明确授权。 |

## S01：Windows 发行构建

状态：已完成。

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| NSIS 安装包构建 | 通过 | `npm run dist:steam` 生成 `dist/山海异兽志-Setup-0.1.0-x64.exe`。 |
| NSIS 静默安装与启动 | 通过 | 安装到 `G:\Codex files\steam-s01-nsis-20260919-0055\install`，安装退出码 0；安装后的 EXE 启动 5 秒后存活，窗口标题为“山海异兽志”。 |
| 临时便携 EXE 构建与启动 | 通过 | `npm run dist:portable` 生成 `dist/山海异兽志-Portable-0.1.0-x64.exe`；实际启动后产生的 Electron 子进程显示窗口标题“山海异兽志”，测试子进程已清理。 |
| 解包目录构建与启动 | 通过 | S00 的 `npm run dist:unpacked` 与实际 EXE 启动验证。 |
| 可重复发行清单 | 通过 | `npm run manifest:steam` 输出版本号、构建号、文件大小、SHA-256、源码提交、dirty 状态和实际构建依赖版本；dirty 构建明确不能冒充干净候选包。 |
| 构建说明对齐 | 通过 | `README.md` 和 `steam/README.md` 已区分 NSIS、临时便携 EXE 和解包目录，并明确 SteamPipe 上传 depot 内容。 |

### S01 当前构建指纹

- NSIS：`山海异兽志-Setup-0.1.0-x64.exe`，254,767,907 bytes，SHA-256 `9DA3FE01CB8D63578279DBBB40B3171A12E31953B476CF4E906C96A198D7E59D`（2026-09-19 本地候选构建；由 `npm run manifest:steam` 重新生成清单确认）
- 临时便携版：`山海异兽志-Portable-0.1.0-x64.exe`，254,689,728 bytes，SHA-256 `847732C975A79B39DD7E8EA18C2364D629EC6C2955D5985F2B1EDC53A8C69A5F`
- 最新清单运行于 `982392e0a97efd0a9e8e273e242f20d01a7a7fce`，并明确标记 `dirty: true`；它仅证明本地验收产物的可追溯性，不能作为干净发布候选。

## S02：存档与可靠性

状态：已完成。

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| 旧实现风险 | 已修复 | 原实现会在替换前显式删除主存档；现在 `renameSync` 直接覆盖同目录目标，避免该空窗。 |
| 写入完整性 | 通过 | 新增 `electron/save-store.cjs`：先校验 JSON、写入唯一临时文件、`fsync`，仅备份有效旧 JSON，最后原子替换。 |
| 损坏主文件恢复 | 通过 | `npm run check` 注入损坏 `save-v2.json`，确认读取 `.bak`。 |
| 损坏文件后的再次保存 | 通过 | 回归确认不会用损坏主文件覆盖有效 `.bak`；后续有效保存可恢复主文件。 |
| 无效写入保护 | 通过 | 回归确认无效 JSON 抛错且不改动现有有效主文件，不遗留临时文件。 |
| 主进程接线 | 通过 | `save:load`、`save:write` 和本地成就记录均改为使用共享存档模块；新 `release/ShanHaiDefense-win-unpacked/resources/app/electron/save-store.cjs` 已存在。 |

已知边界：当前存档仍是单机 Electron 用户目录加浏览器本地回退；Steam Cloud 冲突策略属于 S07，需真实 Steamworks 接入后验证。现有截图工具为隔离渲染测试，使用自建 IPC，因此不把它当作主进程磁盘写入的证据。

## S03：桌面输入与显示

状态：已完成。

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| 鼠标操作 | 既有且通过 | 打包资源自动流程覆盖选关、开始、暂停、恢复、全屏按钮与失焦恢复。 |
| 键盘暂停和恢复 | 通过 | 新增 `P` / 空格；解包桌面资源 DOM 验证确认 `P` 打开暂停、空格关闭暂停并恢复。 |
| 键盘提前开波 | 通过 | 新增 `N`；整备期验证冷却从 6 归零且灵蕴由 20 增至 22。 |
| 弹窗误触发防护 | 通过 | 音频弹窗打开后发送 `N`，波次冷却保持 6。 |
| 键盘全屏 | 已接线 | 新增 `F`，复用既有全屏函数；该函数已由打包资源自动流程的进入/退出全屏按钮路径验证。 |
| 辅助技术元数据 | 通过 | 暂停、提前开波、全屏按钮分别增加 `aria-keyshortcuts`。 |
| 最小窗口布局 | 通过 | `960×640` 打包资源截图：`G:\Codex files\steam-s03-layout\battle-960x640.png`。 |
| 常见宽屏布局 | 通过 | `1366×768` 打包资源截图：`G:\Codex files\steam-s03-layout\battle-1366x768.png`。 |

快捷键仅在游戏战场中生效；有普通弹窗、输入元素、组合键或输入法组合状态时会被忽略。`Escape` 保持浏览器原生 dialog 取消语义，未额外覆盖。

## S04：内容与首局循环

状态：已完成（功能审计）。

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| 五张关卡可选与可开局 | 通过 | 解包资源测试按顺序进入 5 张地图，`state.stage` 与选项一致。 |
| 路线结构 | 通过 | 1-3 关各 1 路；第 4、5 关各 2 路，实际 `pathInfo()` 路数与关卡 `spawnCount` 一致。 |
| 波次和首领 | 通过 | 每关 15 波；第 5、10 波含小首领；终局首领按图在饕餮和白泽之间切换。 |
| 序章 | 通过 | 从“序章”进入第 1 关，状态为 `tutorial`、步骤 0。 |
| 胜利与失败 | 通过 | 以战场状态驱动终局结算，分别到达“封印守住了”和“封印被突破”结果页。 |
| 主动结束后返回选关 | 通过 | 五图循环中均可主动结束并返回选关，未阻断后续开局。 |
| 无尽和试炼 | 通过 | 满足全图通关前置后无尽模式进入普通难度；试炼模式生成有效试炼规则。 |

测试结果：`G:\Codex files\steam-s04-content\content-result.json`。本阶段覆盖功能连通性，不替代真实玩家对难度、经济与长期留存的试玩评估。

## S08：素材与 AI 内容披露

状态：已完成。

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| 素材来源与披露台账 | 已建立 | `steam/ASSET_PROVENANCE.md` 记录可见素材类别、审计记录位置、Steam Content Survey 填写方向与人工确认事项。 |
| 生成源图与提示词不进发行包 | 通过 | 2026-09-19 的 `npm run dist:steam` 后，`dist/win-unpacked/resources/app.asar` 扫描到 0 个 `*-source.png` / `*.prompt.txt`。 |
| 质检中间产物不进发行包 | 通过 | 攻击动画四个 `*-qc/` 目录共约 10.2 MiB，运行时代码无引用；最终 `app.asar` 扫描为 0 个条目。 |
| 打包资源运行回归 | 通过 | 真实 `dist/win-unpacked/山海异兽志.exe` 启动正常；从同一 ASAR 解出的首局自动化无控制台错误、5 张关卡可见且可暂停恢复。 |

Steam Content Survey 要求对开发期由生成式 AI 辅助、且会被玩家消费的预生成内容进行披露；运行时生成内容另需说明防护措施。当前运行时代码未发现联网或运行时生成内容调用。实际提交前仍须由发行方确认素材权利链并如实填写 Survey。

## S10：SteamPipe 候选包模板

状态：部分完成（仅本地准备）。

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| 无凭据 VDF 模板 | 通过 | `steam/build/app_build_template.vdf` 与 `steam/build/depot_build_windows_template.vdf` 使用显式 AppID、DepotID、内容根目录与构建输出占位符。 |
| 不自动公开 | 通过 | App VDF 的 `setlive` 固定为空；说明文档要求由后台显式选择私有测试分支。 |
| 占位模板上传防护 | 通过 | `npm run check:steampipe` 验证模板结构；将模板作为具体上传配置传入时以“配置仍含占位符”失败。 |
| 本地具体配置校验 | 通过 | 对照 SteamPipe 官方 VDF 示例后，模板顶层键修正为 `AppBuild` / `DepotBuild`；隔离目录 `G:\Codex files\steam-s10-validation\canonical-vdf-20260919-160309` 使用虚拟数字 ID、候选 `dist/win-unpacked` 和本地输出目录通过校验；未调用 SteamCMD。 |
| Steam 客户端下载、更新、回退 | 阻塞 | 未提供真实 AppID、DepotID、后台权限、SteamCMD 和上传授权。 |

实际上传前必须在 `G:\Codex files\Steamworks\` 保存具体配置和工具，执行 `npm run check:steampipe -- "<app_build.vdf>"` 后，由用户针对该次私有测试分支上传单独授权。当前仓库不保存凭据或真实 Steamworks ID。
