import { existsSync, readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const root = process.cwd();
const errors = [];
const info = [];
const file = (path) => resolve(root, path);
const read = (path) => readFileSync(file(path), 'utf8');
const assert = (condition, message) => { if (!condition) errors.push(message); };
const assertFile = (path, label = path) => assert(Boolean(path) && existsSync(file(path)), `缺少文件：${label} (${path || 'empty'})`);

const requiredRootFiles = [
  'index.html',
  'app.css',
  'accessibility.css',
  'app.js',
  'core.js',
  'focus-immersive.css',
  'focus-immersive.js',
  'focus-overlay-a11y.js',
  'manifest.webmanifest',
  'icon.svg',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png'
];
requiredRootFiles.forEach((path) => assertFile(path));

const arrayCount = (source, name) => {
  const block = source.match(new RegExp(`const ${name} = Object\\.freeze\\(\\[([\\s\\S]*?)\\]\\);`));
  if (!block) return null;
  return block[1].split('\n').map((line) => line.trim()).filter((line) => line.startsWith('{ id:')).length;
};

const validatePng = (path, size) => {
  const image = readFileSync(file(path));
  assert(image.length > 24 && image.toString('ascii', 1, 4) === 'PNG', `${path} 不是有效 PNG`);
  if (image.length > 24) {
    assert(image.readUInt32BE(16) === size && image.readUInt32BE(20) === size, `${path} 必须为 ${size}×${size}`);
  }
};

if (!errors.length) {
  const index = read('index.html');
  const localRefs = [...index.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)]
    .map((match) => match[1])
    .filter((path) => !/^(?:https?:|data:|#)/.test(path));
  localRefs.forEach((path) => assertFile(path, `index.html 引用`));
  assert(index.includes('accessibility.css'), 'index.html 未加载 accessibility.css');
  assert(index.includes('focus-immersive.js'), 'index.html 未加载统一自习室体验层');
  assert(!index.includes('focus-room-experience.js'), 'index.html 仍加载会覆盖房间列表的旧体验层');
  assert(index.includes('focus-overlay-a11y.js'), 'index.html 未加载 focus-overlay-a11y.js');
  assert(/rel="apple-touch-icon"[^>]+icon-180\.png/.test(index), 'index.html 未使用 180px Apple Touch Icon');
  assert(!index.includes('focus-preset-sync.js'), 'index.html 仍引用已合并的 focus-preset-sync.js');
  assert(!index.includes('focus-room-discovery.js'), 'index.html 仍引用已合并的 focus-room-discovery.js');

  validatePng('icon-180.png', 180);
  validatePng('icon-192.png', 192);
  validatePng('icon-512.png', 512);

  try {
    const manifest = JSON.parse(read('manifest.webmanifest'));
    assert(manifest.name && manifest.short_name, 'manifest 缺少 name / short_name');
    assert(manifest.start_url === './', 'manifest start_url 应保持为 ./');
    const manifestIcons = manifest.icons || [];
    manifestIcons.forEach((icon) => assertFile(icon.src, 'manifest 图标'));
    assert(manifestIcons.some((icon) => icon.src === 'icon-192.png' && icon.sizes === '192x192'), 'manifest 缺少 192×192 PNG 图标');
    assert(manifestIcons.some((icon) => icon.src === 'icon-512.png' && icon.sizes === '512x512'), 'manifest 缺少 512×512 PNG 图标');
  } catch (error) {
    errors.push(`manifest.webmanifest 不是有效 JSON：${error.message}`);
  }

  const accessibility = read('accessibility.css');
  assert(/@media\s*\(max-width:\s*900px\)/.test(accessibility), 'accessibility.css 缺少移动端规则');
  assert(/font-size:\s*16px\s*!important/.test(accessibility), 'accessibility.css 未防止 iOS 小字号表单缩放');
  assert(/prefers-reduced-motion:\s*reduce/.test(accessibility), 'accessibility.css 缺少 reduced-motion 兜底');

  const overlayA11y = read('focus-overlay-a11y.js');
  assert(/aria-modal/.test(overlayA11y), 'focus overlay 未声明 aria-modal');
  assert(/event\.key !== 'Tab'/.test(overlayA11y), 'focus overlay 缺少 Tab 焦点约束');
  assert(/lastOpener/.test(overlayA11y), 'focus overlay 缺少关闭后的焦点恢复');
  assert(/mutationNeedsSync/.test(overlayA11y), 'focus overlay 观察器未过滤无关 DOM 更新');

  const app = read('app.js');
  const core = read('core.js');
  const immersive = read('focus-immersive.js');
  const immersiveCss = read('focus-immersive.css');
  const roomBlock = immersive.match(/const ROOMS = \[([\s\S]*?)\];\s*\n\s*const FILTERS/);
  assert(Boolean(roomBlock), '无法读取 focus-immersive.js 的 ROOMS 配置');

  if (roomBlock) {
    const roomLines = roomBlock[1].split('\n').map((line) => line.trim()).filter((line) => line.startsWith('{ id:'));
    assert(roomLines.length === 16, `自习室应为 16 个，当前解析到 ${roomLines.length} 个`);
    const seen = new Set();
    const soundPairs = new Set();
    const groups = new Set();
    const corePresets = new Map(
      [...core.matchAll(/^\s{4}(?:'([^']+)'|([A-Za-z0-9-]+)):\s*Object\.freeze\(\{ ambienceId: '([^']+)', musicId: '([^']+)', ambienceVolume: ([.\d]+), musicVolume: ([.\d]+) \}\),?$/gm)]
        .map((match) => [match[1] || match[2], { ambience: match[3], music: match[4], ambienceVolume: Number(match[5]), musicVolume: Number(match[6]) }])
    );
    const appTrackIds = new Set(
      [...app.matchAll(/(?:'([^']+)'|([A-Za-z0-9-]+)):\s*\{\s*src:\s*'assets\/scenes\/[^']+\.mp3'/g)]
        .map((match) => match[1] || match[2])
    );

    for (const line of roomLines) {
      const id = line.match(/id:\s*'([^']+)'/)?.[1];
      const image = line.match(/image:\s*'([^']+)'/)?.[1];
      const motion = line.match(/motion:\s*'([^']+)'/)?.[1];
      const groupText = line.match(/groups:\s*\[([^\]]+)\]/)?.[1] || '';
      [...groupText.matchAll(/'([^']+)'/g)].forEach((match) => groups.add(match[1]));

      assert(Boolean(id), `房间配置缺少 id：${line.slice(0, 80)}`);
      assert(!seen.has(id), `房间 id 重复：${id}`);
      seen.add(id);
      assertFile(image, `房间 ${id} 场景图`);
      assert(Boolean(motion), `房间 ${id} 缺少逐场景动态`);
      assert(new RegExp(`data-motion="${motion}"`).test(immersiveCss), `房间 ${id} 的动态 ${motion} 没有样式实现`);
      const preset = corePresets.get(id);
      assert(Boolean(preset), `core.js 缺少房间 ${id} 的正式声景预设`);
      if (preset) {
        assert(appTrackIds.has(preset.ambience), `房间 ${id} 使用了不存在的环境声：${preset.ambience}`);
        assert(appTrackIds.has(preset.music), `房间 ${id} 使用了不存在的音乐：${preset.music}`);
        assert(preset.ambienceVolume >= 0 && preset.ambienceVolume <= 1, `房间 ${id} 环境声音量无效`);
        assert(preset.musicVolume >= 0 && preset.musicVolume <= 1, `房间 ${id} 音乐音量无效`);
        assert(preset.musicVolume <= preset.ambienceVolume, `房间 ${id} 默认音乐不应盖过环境声`);
        const soundPair = `${preset.ambience}+${preset.music}`;
        assert(!soundPairs.has(soundPair), `房间 ${id} 与其他房间重复使用完整声景组合：${soundPair}`);
        soundPairs.add(soundPair);
      }

      if (image && extname(image) === '.svg' && existsSync(file(image))) {
        const svg = read(image);
        assert(/<svg\b/.test(svg), `房间 ${id} SVG 缺少根节点`);
        assert(/viewBox="0 0 1672 941"/.test(svg), `房间 ${id} SVG 画布不是 1672×941`);
        assert(!/<text\b/i.test(svg), `房间 ${id} 场景图不应烤入文字`);
        assert(!/(?:href|src)="https?:/i.test(svg), `房间 ${id} SVG 不应依赖远程资源`);
      }
    }

    ['real', 'ancient', 'xuanhuan', 'fantasy', 'rain'].forEach((group) => {
      assert(groups.has(group), `房间库缺少分组：${group}`);
    });
    assert(/touch-action:\s*pan-y/.test(immersive), '手机房间列表没有明确启用纵向触控滚动');
    assert(/overflow-y:\s*auto/.test(immersive), '房间网格没有独立纵向滚动');
    assert(/grid-auto-rows:\s*max-content/.test(immersive), '房间卡片行仍可能被压缩而无法形成滚动内容');
    assert(/align-content:\s*start/.test(immersive), '房间卡片没有从网格顶部自然展开');
    assert(/data-focus-v2-action="filter"/.test(immersive), '房间风格筛选未接线');
  }

  assert(!/沉浸场景册/.test(app), '收藏页仍包含沉浸场景册');
  assert(!/data-tab="scenes"/.test(app), '收藏页仍暴露场景页签');
  assert(!/scene-enter/.test(app), '收藏场景进入专注的旧操作仍然存在');
  assert(!/unlocked\.scenes\.map/.test(app), '不可见的收藏场景仍会显示解锁提醒');
  assert(/data-action="focus-pick-task"/.test(app), '专注页缺少“替我选”快捷功能');
  assert(/data-action="focus-quick-start"/.test(app), '专注页缺少“五分钟开工”快捷功能');
  assert(/data-action="focus-resume-last"/.test(app), '专注页缺少“接着上次”快捷功能');
  assert(/\[5,'先开始'\].*\[15,'短冲刺'\].*\[25,'一小轮'\].*\[45,'沉浸'\].*\[60,'长读'\]/.test(app), '专注时长没有按 5 / 15 / 25 / 45 / 60 排列');

  const audioPaths = [...app.matchAll(/src:\s*'(assets\/scenes\/[^']+\.mp3)'/g)].map((match) => match[1]);
  [...new Set(audioPaths)].forEach((path) => assertFile(path, '专注音频'));

  const inventory = {
    FOCUS_ROOMS: arrayCount(app, 'FOCUS_ROOMS'),
    OUTFITS: arrayCount(core, 'OUTFITS'),
    STICKERS: arrayCount(core, 'STICKERS'),
    BADGES: arrayCount(core, 'BADGES'),
    SCENES: arrayCount(core, 'SCENES')
  };
  assert(inventory.FOCUS_ROOMS === 16, `主界面自习室应为 16 个，当前 ${inventory.FOCUS_ROOMS}`);
  assert(inventory.OUTFITS === 16, `卡面应为 16 套，当前 ${inventory.OUTFITS}`);
  assert(inventory.STICKERS === 25, `贴纸应为 25 枚，当前 ${inventory.STICKERS}`);
  assert(inventory.BADGES === 12, `徽章应为 12 枚，当前 ${inventory.BADGES}`);
  assert(inventory.SCENES === 20, `兼容场景素材应为 20 个，当前 ${inventory.SCENES}`);
  assertFile('assets/journal/ephemera-cluster.svg', '贴纸册复杂手账拼贴');
  assert(/tasks:\s*\[\]/.test(core), '默认状态不应预填已完成任务');
  assert(/focusSessions:\s*\[\]/.test(core), '默认状态不应预填专注会话');

  const assetSources = [
    'core.js', 'app.js', 'app.css', 'accessibility.css',
    'focus-immersive.css', 'focus-immersive.js'
  ];
  const assetRefs = new Set();
  for (const source of assetSources) {
    const text = read(source);
    for (const match of text.matchAll(/assets\/[A-Za-z0-9._/-]+/g)) assetRefs.add(match[0]);
  }
  [...assetRefs].forEach((path) => assertFile(path, '全站本地素材'));

  const tooSmall = [...immersive.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)]
    .map((match) => Number(match[1]))
    .filter((value) => value < 12);
  assert(tooSmall.length === 0, `focus-immersive.js 出现小于 12px 的正式文字：${tooSmall.join(', ')}`);

  info.push(`index 本地引用 ${localRefs.length} 项`);
  info.push(`全站本地素材引用 ${assetRefs.size} 项`);
  info.push(`专注音频 ${new Set(audioPaths).size} 个文件`);
  info.push(`收藏清单：卡面 ${inventory.OUTFITS} / 贴纸 ${inventory.STICKERS} / 徽章 ${inventory.BADGES}；兼容场景素材 ${inventory.SCENES}`);
  info.push('移动端表单字号、reduced-motion、焦点约束与 180/192/512 图标已检查');
}

if (errors.length) {
  console.error('\n静态发布检查失败：');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log('静态发布检查通过。');
info.forEach((message) => console.log(`- ${message}`));
