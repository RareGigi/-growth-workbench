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

## 雨夜自习室

专注页使用现有高清夜间书桌场景叠加轻量 Canvas 雨幕；雨声与「星雨琴音」由浏览器 Web Audio 实时生成，不下载、打包或复制第三方音乐文件。两条声音可以独立开关与调节音量，开始 / 继续时尝试播放，暂停 / 结束 / 离开页面时平滑淡出。浏览器会遵守 iPhone 的用户手势音频限制，因此刷新运行中的计时器后需要再轻触一次声音按钮。

交互调研参考了 [Moodist](https://github.com/remvze/moodist) 的分层环境声与专注联动，以及 [Howler.js](https://github.com/goldfire/howler.js) 和 [Tone.js](https://github.com/Tonejs/Tone.js) 的移动浏览器音频兼容原则。正式实现保持原生、离线、零运行时依赖，没有复制这些项目的代码或音频素材。

## 质量检查

```bash
node --check core.js
node --check app.js
npx --yes impeccable detect --json .
```

发布前还需在正式预览中检查桌面、768px iPad、430px iPhone 与 390px iPhone：导航抽屉、今日分段、溢出、点击热区、图片、空状态、滚动、弹层、浮动按钮与 Safari safe area。

产品范围与验收标准见 [PRODUCT.md](PRODUCT.md)，唯一视觉规范见 [DESIGN.md](DESIGN.md)。
