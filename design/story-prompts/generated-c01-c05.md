# 五境归名：已生成剧情美术

生成日期：2026-09-21 至 2026-09-22。运行底图导出为 `assets/story/*.jpg`，均为 1280x720 JPEG；无文字或 UI。母版原图保留在 `G:\Codex files\shanhai-story-masters\`。

| 资源 | 母版 | 运行图 | 实际提示词摘要 |
| --- | --- | --- | --- |
| C01 幽都 | `c01-cave-source.png` | `c01-cave.jpg` | 墨青洞窟、黑水、左侧断连古印、远处裂隙与村灯；无兽。 |
| C02 北野 | `c02-grass-source.png` | `c02-grass.jpg` | 冷色草原、左侧古印、浅溪水脉、右侧白泽合成留白；无白泽。 |
| C03 沧海 | `c03-sea-source.png` | `c03-sea.jpg` | 海潮环印、沉没石阶、水脉淤塞与前景石脊；无首领。 |
| C04 赤焰 | `c04-volcano-source.png` | `c04-volcano.jpg` | 隔熔河相望的两处同纹阵眼；无第三封印、无白泽。 |
| C05 云阶 | `c05-cloud-source.png` | `c05-cloud.jpg` | 双石阶汇向唯一云中天印，保留首领叠层空间；无首领。 |
| A01 五境长卷 | `story-map-source.png` | `story-map.jpg` | 连续山海地理：洞窟、草原、沧海、赤焰双阵眼与云阶相连；节点状态由 UI 叠加。 |
| A07 归途结局 | `story-ending-source.png` | `story-ending.jpg` | 村灯、山海与归途；白泽回首、异兽各归其处，不作加冕。 |
| 墨痕束缚 | `ink-bindings-source.png` | `ink-bindings.png` | 透明叠层，仅在第二、四章引子覆盖既有白泽立绘；结语撤去。 |
| 五境印记 | `seal-impressions-source.png` | `seal-impressions.png` | 透明印记图集，作为故事地图与古印的装饰层，不改变完成状态。 |

全部提示词使用同一通用约束：古卷岩彩与工笔细节、可信体积与自然光照、16:9、四边 6% 安全区、下方 22% 字幕安全区；禁止文字、字幕、UI、标志、水印、角色、怪物、血腥、现代机械及无意义粒子。完整的逐张场景约束见 `design/STORY_CAMPAIGN_DESIGN.md` 第 6.5 节。
