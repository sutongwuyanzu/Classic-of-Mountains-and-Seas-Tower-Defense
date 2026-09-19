# Steam 性能基线

最后测试：2026-09-19。该文档记录实测，不以开发机配置直接充当 Steam 系统需求。

## 构建与场景

- 候选内容：S08 最终 `dist/win-unpacked/resources/app.asar` 的隔离解出副本。
- 测试窗口：可见 `1280×800` Electron 窗口，`backgroundThrottling: false`。
- 常规场景：首局进入后采样 60 帧。
- 压力场景：14 名 9 级妖灵、60 名高生命静止敌军，采样 90 帧；状态会产生投射物、粒子、命中与跳字，且不修改正式玩法数据。
- 目标：常规 p95 不高于 25 ms；压力 p95 不高于 33 ms。完整预算见 `steam/PERFORMANCE_BUDGET.md`。

## 当前环境

| 项目 | 观测值 |
| --- | --- |
| 系统 | Windows 11 家庭中文版，Build 26200 |
| CPU | Intel Core Ultra 9 285H，16 逻辑处理器 |
| 内存 | 63.4 GiB |
| 图形适配器 | ToDesk Virtual Display Adapter；同时检测到 Intel Arc 140T 与 NVIDIA GeForce RTX 5060 Laptop GPU |
| 显示器 | 当前会话 `3200×2000`；采样窗口为 `1280×800` |

该会话由 ToDesk 虚拟显示适配器驱动。两次可见测试都记录到 Chromium `GPU state invalid after WaitForGetOffsetInRange`，因此不能用本机结果填写玩家最低/推荐配置，也不能据此判断独显真实表现。

## 结果

| 运行 | 常规 p95 | 压力 p95 | 压力对象末态 | 结论 |
| --- | ---: | ---: | --- | --- |
| 1 | 24.3 ms | 60.6 ms | 14 塔、60 敌、202 粒子、10 特效、32 爆点、90 跳字 | 常规达标；压力未达标 |
| 2 | 24.2 ms | 66.7 ms | 14 塔、60 敌、213 粒子、14 特效、38 爆点、90 跳字 | 常规达标；压力未达标 |

原始数据：

- `G:\Codex files\steam-s05-performance\visible-profile-20260919-1018.json`
- `G:\Codex files\steam-s05-performance\visible-profile-20260919-1018-repeat.json`

两次都完成了全部采样帧，未超时，且对象数量未超过既有上限；此前隐藏窗口的帧回调被浏览器节流，仍不计入基线。

## 放行条件与下一步

1. 在非远程、物理显示器驱动的可见窗口上复跑同一脚本，记录实际使用的 GPU、分辨率、驱动和两次 p95。
2. 若该环境仍超过 33 ms，先用 Canvas 分段计时确认瓶颈位于背景、单位绘制、投射物、粒子或 HUD，再做只影响表现层的最小优化；不得通过降低敌人数量、伤害或随机结果来“通过”性能测试。
3. 完成目标设备复测并确认 60 分钟稳定性前，不填写 Steam 最低/推荐系统需求，也不将性能项标记为通过。
