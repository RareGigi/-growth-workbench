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
  'focus-room-experience.js',
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
  const experience = read('focus-room-experience.js');
  const roomBlock = experience.match(/const ROOMS = Object\.freeze\(\[([\s\S]*?)\]\);\s*\n\s*const FILTERS/);
  assert(Boolean(roomBlock), '无法读取 focus-room-experience.js 的 ROOMS 配置');

  if (roomBlock) {
    const roomLines = roomBlock[1].split('\n').map((line) => line.trim()).filter((line) => line.startsWith('{ id:'));
    assert(roomLines.length === 14, `自习室应为 14 个，当前解析到 ${roomLines.length} 个`);
    const seen = new Set();
    const groups = new Set();
    const appTrackIds = new Set(
      [...app.matchAll(/(?:'([^']+)'|([A-Za-z0-9-]+)):\s*\{\s*src:\s*'assets\/scenes\/[^']+\.mp3'/g)]
        .map((match) => match[1] || match[2])
    );

    for (const line of roomLines) {
      const id = line.match(/id:\s*'([^']+)'/)?.[1];
      const image = line.match(/image:\s*'([^']+)'/)?.[1];
      const ambience = line.match(/ambience:\s*'([^']+)'/)?.[1];
      const music = line.match(/music:\s*'([^']+)'/)?.[1];
      const ambienceVolume = Number(line.match(/ambienceVolume:\s*([.\d]+)/)?.[1]);
      const musicVolume = Number(line.match(/musicVolume:\s*([.\d]+)/)?.[1]);
      const groupText = line.match(/groups:\s*\[([^\]]+)\]/)?.[1] || '';
      [...groupText.matchAll(/'([^']+)'/g)].forEach((match) => groups.add(match[1]));

      assert(Boolean(id), `房间配置缺少 id：${line.slice(0, 80)}`);
      assert(!seen.has(id), `房间 id 重复：${id}`);
      seen.add(id);
      assertFile(image, `房间 ${id} 场景图`);
      assert(appTrackIds.has(ambience), `房间 ${id} 使用了不存在的环境声：${ambience}`);
      assert(appTrackIds.has(music), `房间 ${id} 使用了不存在的音乐：${music}`);
      assert(Number.isFinite(ambienceVolume) && ambienceVolume >= 0 && ambienceVolume <= 1, `房间 ${id} 环境声音量无效`);
      assert(Number.isFinite(musicVolume) && musicVolume >= 0 && musicVolume <= 1, `房间 ${id} 音乐音量无效`);
      assert(musicVolume <= ambienceVolume, `房间 ${id} 默认音乐不应盖过环境声`);

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
  }

  const audioPaths = [...app.matchAll(/src:\s*'(assets\/scenes\/[^']+\.mp3)'/g)].map((match) => match[1]);
  [...new Set(audioPaths)].forEach((path) => assertFile(path, '专注音频'));

  const inventory = {
    OUTFITS: arrayCount(core, 'OUTFITS'),
    STICKERS: arrayCount(core, 'STICKERS'),
    BADGES: arrayCount(core, 'BADGES'),
    SCENES: arrayCount(core, 'SCENES')
  };
  assert(inventory.OUTFITS === 10, `卡面应为 10 套，当前 ${inventory.OUTFITS}`);
  assert(inventory.STICKERS === 17, `贴纸应为 17 枚，当前 ${inventory.STICKERS}`);
  assert(inventory.BADGES === 6, `徽章应为 6 枚，当前 ${inventory.BADGES}`);
  assert(Number.isInteger(inventory.SCENES) && inventory.SCENES >= 10, `收藏场景数量异常：${inventory.SCENES}`);
  assert(/tasks:\s*\[\]/.test(core), '默认状态不应预填已完成任务');
  assert(/focusSessions:\s*\[\]/.test(core), '默认状态不应预填专注会话');

  const assetSources = [
    'core.js', 'app.js', 'app.css', 'accessibility.css',
    'focus-immersive.css', 'focus-immersive.js', 'focus-room-experience.js'
  ];
  const assetRefs = new Set();
  for (const source of assetSources) {
    const text = read(source);
    for (const match of text.matchAll(/assets\/[A-Za-z0-9._/-]+/g)) assetRefs.add(match[0]);
  }
  [...assetRefs].forEach((path) => assertFile(path, '全站本地素材'));

  const tooSmall = [...experience.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)]
    .map((match) => Number(match[1]))
    .filter((value) => value < 12);
  assert(tooSmall.length === 0, `focus-room-experience.js 出现小于 12px 的正式文字：${tooSmall.join(', ')}`);

  info.push(`index 本地引用 ${localRefs.length} 项`);
  info.push(`全站本地素材引用 ${assetRefs.size} 项`);
  info.push(`专注音频 ${new Set(audioPaths).size} 个文件`);
  info.push(`收藏清单：卡面 ${inventory.OUTFITS} / 贴纸 ${inventory.STICKERS} / 徽章 ${inventory.BADGES} / 场景 ${inventory.SCENES}`);
  info.push('移动端表单字号、reduced-motion、焦点约束与 180/192/512 图标已检查');
}

if (errors.length) {
  console.error('\n静态发布检查失败：');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log('静态发布检查通过。');
info.forEach((message) => console.log(`- ${message}`));
