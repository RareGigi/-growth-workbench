# 小小生长册

**Grow with You**

一本会奖励我的长期成长电子手账。

[正式预览](https://raregigi.github.io/-growth-workbench/)

## 这是什么

一个无需账号与后端的静态个人成长 App。它把今日任务、收集箱、项目、日历、专注、习惯、笔记、周复盘与月度纪念串成真实数据闭环，再用星星、金币、贴纸、徽章、场景和限定卡面提供轻量收藏反馈。今日支持一句话添加，也能按可用时间、状态与税务师 / 英语 / 播客 / CPA / 写作五个方向生成三套可直接采用的安排。

界面使用独立纸张、装订与 17 枚模切 SVG 贴纸素材形成克制的电子手账语言；贴纸只在真实行动解锁后进入固定收藏位。

初次打开不会填入虚构完成数据。四个默认项目只是空章节；所有统计都来自用户真实记录。

## 运行

仓库是原生 HTML / CSS / JavaScript，不需要安装依赖或构建。

```text
index.html
app.css
app.js
core.js
assets/
  ui/
  character/
  outfits/
  stickers/
  scenes/
  badges/
  journal/
```

使用任意静态文件服务打开仓库根目录即可。本项目的正式入口只有 `index.html`，样式只有 `app.css`，界面逻辑只有 `app.js`，状态与迁移只有 `core.js`。

## 数据

正式存储 key 为 `growth-journal-v1`。`core.js` 会在首次运行时尝试读取已知旧 key 并一次性迁移，之后只写正式 key。旧 key 不删除，以免破坏原始用户数据。

持久化范围包括任务、项目、收集箱、专注会话与运行中计时器、自习室房间、动态画面与声音偏好、习惯、心情、日记、成长记录、轨迹、笔记、周复盘、规划偏好与采用记录、金币、成长值、卡面、当前展示卡面、贴纸、徽章、场景、收藏与月度纪念。

长期个人使用时，可在「收藏 → 纪念 → 数据保管」导出完整 JSON 备份。恢复时会先展示文件内的任务、项目、专注、笔记、日记与月度纪念数量，确认后才替换当前设备的数据；损坏或无关 JSON 不会写入。备份中可能含有私人日记与笔记，应保存在自己的私密位置。

## 沉浸自习室

专注页提供窗叶听雨、深夜图书馆、雨晨咖啡厅、月灯书屋、云上天宫与山寺晨光六个写实房间。当前场景为高清 WebP，画面下缘可叠加一段静音手写动作；关闭动态、系统开启“减少动态效果”、设备开启省流量或视频失败时，都会保留完整静态场景。手机端把倒计时放进场景，房间选择为横向滑动，不挤压底部安全区。

声音分为环境声与轻音乐两路，均可独立开关、选曲和调节音量。环境声包含三种雨声，以及书库、咖啡厅、壁炉、云风和松风远钟；音乐保留五首低存在感曲目。所有音频都打包在仓库内并通过原生 `HTMLAudioElement` 播放，开始 / 继续在同一次用户点击中请求播放，暂停 / 结束 / 离开页面时平滑淡出。刷新运行中的计时器或从后台返回后，仍需再轻触一次声音按钮，这是浏览器的用户手势限制。

交互调研参考了 [Moodist](https://github.com/remvze/moodist) 的分层环境声与专注联动，但没有复制其代码或音频。轻音乐选自 [Open Lo-Fi](https://github.com/btahir/open-lofi) 的 CC0 曲库，并重新做了较低响度编码。咖啡厅底噪使用 Marble Toast 的 [Cafe ambiance](https://commons.wikimedia.org/wiki/File:Cafe_ambiance.ogg)（CC0）；叶间雨使用 Gravity Sound 的 [Rain on leaves](https://commons.wikimedia.org/wiki/File%3ARain_on_leaves_%28Gravity_Sound%29.wav)（[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)）；壁炉声使用 Glaneur de sons 的 [Campfire sound ambience](https://commons.wikimedia.org/wiki/File:Campfire_sound_ambience.ogg)（[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)）。以上环境声均按场景需要做了裁切、单声道混音、低通与响度处理。手写视频来自 Marta Nogueira 的 [Pexels 片段](https://www.pexels.com/video/close-up-of-woman-sitting-at-a-desk-in-the-office-and-writing-a-note-with-a-pen-in-a-notebook-selective-focus-technique-on-woman-s-hand-20422317/)，按 [Pexels License](https://www.pexels.com/license/) 裁切、调色、静音并压缩。书库、云风和松风远钟底层为本项目生成的低频环境层。

## 质量检查

```bash
node --check core.js
node --check app.js
npx --yes impeccable detect --json .
```

发布前还需在正式预览中检查桌面、768px iPad、430px iPhone 与 390px iPhone：导航抽屉、今日分段、溢出、点击热区、图片、空状态、滚动、弹层、浮动按钮与 Safari safe area。

产品范围与验收标准见 [PRODUCT.md](PRODUCT.md)，唯一视觉规范见 [DESIGN.md](DESIGN.md)。
