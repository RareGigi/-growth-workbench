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

持久化范围包括任务、项目、收集箱、专注会话与运行中计时器、雨夜自习室声音偏好、习惯、心情、日记、成长记录、轨迹、笔记、周复盘、规划偏好与采用记录、金币、成长值、卡面、当前展示卡面、贴纸、徽章、场景、收藏与月度纪念。

长期个人使用时，可在「收藏 → 纪念 → 数据保管」导出完整 JSON 备份。恢复时会先展示文件内的任务、项目、专注、笔记、日记与月度纪念数量，确认后才替换当前设备的数据；损坏或无关 JSON 不会写入。备份中可能含有私人日记与笔记，应保存在自己的私密位置。

## 雨夜自习室

专注页使用现有高清夜间书桌场景叠加轻量 Canvas 雨幕；「窗雨」与「星雨琴音」使用仓库内两条原创生成 MP3，通过原生 `HTMLAudioElement` 播放，避免 iPhone Safari 的 Web Audio 解锁失效。两条声音可以独立开关与调节音量，开始 / 继续会在同一次用户点击中直接请求播放，暂停 / 结束 / 离开页面时平滑淡出。刷新运行中的计时器或从后台返回后，仍需再轻触一次声音按钮，这是浏览器的用户手势限制。

交互调研参考了 [Moodist](https://github.com/remvze/moodist) 的分层环境声与专注联动，以及 [Howler.js](https://github.com/goldfire/howler.js) 和 [Tone.js](https://github.com/Tonejs/Tone.js) 的移动浏览器音频兼容原则。正式实现保持原生、同源资源、零运行时依赖，没有复制这些项目的代码或音频素材。

## 质量检查

```bash
node --check core.js
node --check app.js
npx --yes impeccable detect --json .
```

发布前还需在正式预览中检查桌面、768px iPad、430px iPhone 与 390px iPhone：导航抽屉、今日分段、溢出、点击热区、图片、空状态、滚动、弹层、浮动按钮与 Safari safe area。

产品范围与验收标准见 [PRODUCT.md](PRODUCT.md)，唯一视觉规范见 [DESIGN.md](DESIGN.md)。
