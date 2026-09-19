# Steam Performance Budget

最后更新：2026-09-19

## 采样原则

性能结论只接受可见桌面窗口或目标硬件上的实际帧时间采样。隐藏 Electron 窗口会被 Chromium 节流，即使设置 `backgroundThrottling: false`，也不能用其 `requestAnimationFrame` 频率判断成品性能。

## 发行前目标

| 场景 | 目标 | 验证方式 |
| --- | --- | --- |
| 常规局（8 塔 / 30 敌人） | 95 分位帧时间不高于 25 ms | 可见窗口连续采样 60 秒。 |
| 压力局（14 塔 / 60 敌人） | 95 分位帧时间不高于 33 ms，不能连续掉帧超过 1 秒 | 可见窗口连续采样 60 秒，记录帧时间、CPU、内存。 |
| 长局 | 无持续内存增长 | 完成 15 波后回到选关，记录进程私有内存。 |

## 当前代码预算护栏

| 项目 | 上限 / 策略 | 位置 |
| --- | --- | --- |
| 视觉特效 | 120（低功耗设备按质量系数收缩） | `src/main.js` 的 `EFFECT_LIMITS.visual`。 |
| 粒子 | 280（低功耗设备按质量系数收缩） | `EFFECT_LIMITS.particles`。 |
| 命中爆点 | 72 | `EFFECT_LIMITS.bursts`。 |
| 跳字 | 90 | `EFFECT_LIMITS.damage`。 |
| 死亡残影 | 24 | `EFFECT_LIMITS.defeated`。 |
| HUD 更新 | 最多每 100 ms 一次 | `updateHUD(false)`。 |
| 绘制队列 | 每帧复用 `renderQueue`，按深度排序 | `drawCanvas()`。 |
| 低功耗策略 | CPU 核心数/设备内存较低或移动设备降低特效质量 | `lowPowerEffects` 与 `effectQuality`。 |

## 当前采样状态

已执行隐藏窗口的 14 塔 / 60 敌人对象压力装配；对象数量保持在上表上限内，但隐藏窗口帧回调被约 1 秒节流，结果无效，不纳入 FPS 基线。原始输出保留于 `G:\Codex files\steam-s05-performance\profile-result.json`。

2026-09-19 已改用可见窗口进行两次采样：常规 p95 为 24.3 / 24.2 ms，压力 p95 为 60.6 / 66.7 ms。压力场景未通过 33 ms 预算，且环境使用 ToDesk 虚拟显示适配器并两次报告 Chromium GPU IPC 警告。完整环境、原始数据和放行条件见 `steam/PERFORMANCE.md`；在物理显示器复测前，S05 维持部分完成。

待用户可见桌面窗口验收时补充：Windows 设备型号、显示分辨率、是否独显、常规局/压力局 60 秒帧时间和任务管理器内存快照。
