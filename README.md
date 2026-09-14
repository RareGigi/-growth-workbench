# 小小生长册

**Grow with You**

一本会奖励我的长期成长电子手账。

[正式预览](https://raregigi.github.io/-growth-workbench/)

## 这是什么

一个无需账号与后端的静态个人成长 App。它把今日任务、收集箱、项目、日历、专注、习惯、笔记、周复盘与月度纪念串成真实数据闭环，再用星星、金币、贴纸、徽章、场景和限定卡面提供轻量收藏反馈。

今日支持一句话添加，也能按可用时间、状态与税务师 / 英语 / 播客 / CPA / 写作五个方向生成三套可直接采用的安排。初次打开不会填入虚构完成数据；所有统计都来自用户真实记录。

## 运行与文件结构

仓库是原生 HTML / CSS / JavaScript，不需要安装依赖或构建。正式入口仍为 `index.html`。

```text
index.html
app.css
app.js                  # 主界面与业务交互
core.js                 # 状态、迁移、修复、奖励与持久化
focus-immersive.css     # 沉浸专注布局
focus-immersive.js      # 沉浸层与声音面板
focus-room-experience.js# 扩展场景库、筛选、时段推荐与房间声景预设
assets/
  ui/
  character/
  outfits/
  stickers/
  scenes/
  badges/
  journal/
```

`app.js` / `core.js` 仍是产品主逻辑和正式状态来源；专注相关增强脚本只处理沉浸自习室的展示与交互，不另建任务、奖励或统计数据源。

## 数据

正式存储 key 为 `growth-journal-v1`。`core.js` 会在首次运行时尝试读取已知旧 key 并一次性迁移，之后只写正式 key。旧 key 不删除，以免破坏原始用户数据。

持久化范围包括任务、项目、收集箱、专注会话与运行中计时器、自习室声音偏好、扩展房间选择、习惯、心情、日记、成长记录、轨迹、笔记、周复盘、规划偏好与采用记录、金币、成长值、卡面、贴纸、徽章、场景、收藏与月度纪念。

扩展自习室使用 `ui.focusRoomV2` 保存当前房间主题；`repairState` 会保留 `ui` 中的前向兼容字段，因此刷新、重新打开和 JSON 备份恢复后仍能回到上次选择的扩展房间。声音仍写入正式 `focusSettings`，没有第二套本地数据库。

长期个人使用时，可在「收藏 → 纪念 → 数据保管」导出完整 JSON 备份。恢复时会先展示文件内的任务、项目、专注、笔记、日记与月度纪念数量，确认后才替换当前设备的数据。备份可能含有私人日记与笔记，应保存在自己的私密位置。

## 沉浸自习室

专注页现在提供 **14 个自习场景**，并按「写实 / 古风 / 玄幻 / 奇幻 / 雨景」筛选：

- 写实：窗叶听雨、深夜图书馆、雨晨咖啡厅、城市静夜、窗边午后、晨雾花园
- 古风：山寺晨光、江南雨阁、竹影书院
- 玄幻：云上天宫、云海仙台
- 奇幻：月灯书屋、星穹观测室、晶蓝秘藏馆

房间面板会根据本地时间给出一个「此刻推荐」，但不会自动替用户切换。当前房间主图优先加载，其余缩略图使用延迟加载；手机端关闭高成本模糊和不必要的卡片动画，并忽略计时器高频文本更新，避免 iPhone Safari 重复重建图像面板。

其中新增的江南雨阁、竹影书院、云海仙台、星穹观测室、晶蓝秘藏馆为本项目原创 SVG 场景；城市静夜、窗边午后、晨雾花园复用仓库已有高清场景资产，不额外引入外链图片。

### 房间声音

声音始终分为「环境声」和「轻音乐」两路，可分别开关、换曲和调节音量。每个房间都有推荐组合和默认音量；切换房间时会更新曲目与默认音量，但保留用户当前是否开启两条声道的选择。点「按当前房间应用推荐声景」时，才会同时开启两路并应用完整推荐组合。

环境声包括三种雨声，以及书库、咖啡厅、壁炉、云风和松风远钟；音乐保留五首低存在感曲目。新增场景全部复用这些已经随仓库部署、来源已记录的声音，不加入来源不明的音频。

所有音频通过原生 `HTMLAudioElement` 播放，暂停 / 结束 / 离开页面时会淡出。iPhone 刷新运行中的计时器或从后台返回后，若浏览器中断声音，需要再次轻触「开启」，这是移动 Safari 的用户手势限制。

## 素材与许可

交互调研参考了 [Moodist](https://github.com/remvze/moodist) 的分层环境声与专注联动，但没有复制其代码或音频。轻音乐选自 [Open Lo-Fi](https://github.com/btahir/open-lofi) 的 CC0 曲库并重新做较低响度编码。

咖啡厅底噪使用 Marble Toast 的 [Cafe ambiance](https://commons.wikimedia.org/wiki/File:Cafe_ambiance.ogg)（CC0）；叶间雨使用 Gravity Sound 的 [Rain on leaves](https://commons.wikimedia.org/wiki/File%3ARain_on_leaves_%28Gravity_Sound%29.wav)（CC BY 4.0）；壁炉声使用 Glaneur de sons 的 [Campfire sound ambience](https://commons.wikimedia.org/wiki/File:Campfire_sound_ambience.ogg)（CC BY 3.0）。书库、云风和松风远钟底层为本项目生成的低频环境层。

旧版手写视频素材来自 Marta Nogueira 的 Pexels 片段；当前沉浸层默认不再把同一段手写动作覆盖到所有房间，以免不同场景产生违和感。

## 质量检查

发布前至少执行：

```bash
node --check core.js
node --check app.js
node --check focus-immersive.js
node --check focus-room-experience.js
npx --yes impeccable detect --json .
```

并在正式预览中检查桌面、768px iPad、430px iPhone 与 390px iPhone：导航抽屉、今日分段、任务操作、日历、专注计时、房间筛选、环境声 / 音乐切换、备份恢复、弹层焦点、图片降级、滚动、safe area 与刷新后的状态恢复。

产品范围与验收标准见 [PRODUCT.md](PRODUCT.md)，视觉规范见 [DESIGN.md](DESIGN.md)。
