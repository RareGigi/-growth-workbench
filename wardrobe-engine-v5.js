/*
 * 星轨成长舱 v5 分层衣橱引擎
 * Architecture inspired by Lil'DressUp (WTFPL-2.0) and paperbuddy (MIT).
 * This implementation is original and keeps artwork independent from code.
 */
(function () {
  const SLOT_ORDER = [
    'backEffect', 'backAccessory', 'hairBack', 'base', 'socks', 'shoes',
    'bottom', 'top', 'dress', 'coat', 'neck', 'hairFront', 'headwear',
    'earring', 'handheld', 'frontEffect'
  ];

  const SLOT_META = {
    hairBack: { label: '后发', group: 'hair' },
    base: { label: '基础内搭', permanent: true },
    socks: { label: '袜子', group: 'clothes' },
    shoes: { label: '鞋子', group: 'clothes' },
    bottom: { label: '下装', group: 'clothes' },
    top: { label: '上装', group: 'clothes' },
    dress: { label: '连衣装', group: 'clothes', excludes: ['top', 'bottom'] },
    coat: { label: '外套', group: 'clothes' },
    neck: { label: '颈饰', group: 'accessory' },
    hairFront: { label: '前发', group: 'hair', linked: ['hairBack'] },
    headwear: { label: '头饰', group: 'accessory' },
    earring: { label: '耳饰', group: 'accessory' },
    handheld: { label: '手持', group: 'special' },
    backAccessory: { label: '背饰', group: 'special' },
    backEffect: { label: '后景特效', group: 'effect' },
    frontEffect: { label: '前景特效', group: 'effect' }
  };

  class LayeredWardrobe {
    constructor(options = {}) {
      this.width = options.width || 1254;
      this.height = options.height || 1254;
      this.mount = options.mount || null;
      this.catalog = options.catalog || {};
      this.selection = Object.fromEntries(SLOT_ORDER.map(slot => [slot, null]));
      this.layers = new Map();
      this.imageCache = new Map();
    }

    async preload(url) {
      if (!url) return null;
      if (this.imageCache.has(url)) return this.imageCache.get(url);
      const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
      this.imageCache.set(url, promise);
      return promise;
    }

    create() {
      if (!this.mount) throw new Error('LayeredWardrobe requires a mount element');
      this.mount.replaceChildren();
      this.mount.style.setProperty('--avatar-ratio', `${this.width}/${this.height}`);
      SLOT_ORDER.forEach((slot, z) => {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.className = 'avatar-layer';
        canvas.dataset.slot = slot;
        canvas.style.zIndex = String(z + 1);
        this.mount.append(canvas);
        this.layers.set(slot, canvas.getContext('2d'));
      });
      return this;
    }

    getItem(slot, id) {
      return (this.catalog[slot] || []).find(item => item.id === id) || null;
    }

    async equip(slot, id, { silent = false } = {}) {
      const meta = SLOT_META[slot];
      if (!meta) throw new Error(`Unknown wardrobe slot: ${slot}`);
      const item = id ? this.getItem(slot, id) : null;
      if (id && !item) throw new Error(`Unknown wardrobe item: ${slot}/${id}`);

      if (item && meta.excludes) {
        for (const target of meta.excludes) await this.equip(target, null, { silent: true });
      }
      if (item && (slot === 'top' || slot === 'bottom')) {
        await this.equip('dress', null, { silent: true });
      }

      this.selection[slot] = id || null;
      await this.paint(slot, item);

      if (item?.linked) {
        for (const [linkedSlot, linkedId] of Object.entries(item.linked)) {
          await this.equip(linkedSlot, linkedId, { silent: true });
        }
      }
      if (!silent) this.emitChange();
    }

    async paint(slot, item) {
      const ctx = this.layers.get(slot);
      if (!ctx) return;
      ctx.clearRect(0, 0, this.width, this.height);
      if (!item?.src) return;
      const image = await this.preload(item.src);
      ctx.drawImage(image, 0, 0, this.width, this.height);
    }

    async restore(selection = {}) {
      for (const slot of SLOT_ORDER) {
        await this.equip(slot, selection[slot] || null, { silent: true });
      }
      this.emitChange();
    }

    snapshot() {
      return { version: 5, slots: { ...this.selection } };
    }

    exportPng() {
      const output = document.createElement('canvas');
      output.width = this.width;
      output.height = this.height;
      const ctx = output.getContext('2d');
      SLOT_ORDER.forEach(slot => {
        const layer = this.layers.get(slot)?.canvas;
        if (layer) ctx.drawImage(layer, 0, 0);
      });
      return output.toDataURL('image/png');
    }

    emitChange() {
      this.mount?.dispatchEvent(new CustomEvent('wardrobechange', {
        detail: this.snapshot(), bubbles: true
      }));
    }
  }

  window.StarlightWardrobe = Object.freeze({
    LayeredWardrobe,
    SLOT_ORDER,
    SLOT_META
  });
})();
