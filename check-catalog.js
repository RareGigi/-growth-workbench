'use strict';

const fs = require('fs');
const store = new Map();

global.window = global;
global.localStorage = {
  getItem: (key) => store.get(key) || null,
  setItem: (key, value) => store.set(key, value)
};

require('./core.js');

const Core = global.GrowthCore;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const catalogs = { outfits: Core.OUTFITS, stickers: Core.STICKERS, badges: Core.BADGES, scenes: Core.SCENES };
const expected = { outfits: 16, stickers: 25, badges: 12, scenes: 20 };

Object.entries(catalogs).forEach(([name, items]) => {
  assert(items.length === expected[name], `${name}: expected ${expected[name]}, received ${items.length}`);
  items.forEach((item) => assert(fs.existsSync(item.image), `missing asset: ${item.image}`));
});

const app = fs.readFileSync('app.js', 'utf8');
const roomSource = app.slice(app.indexOf('const FOCUS_ROOMS'), app.indexOf('const FOCUS_AUDIO_TRACKS'));
const roomIds = [...roomSource.matchAll(/\{ id: '([^']+)'/g)].map((match) => match[1]);
assert(roomIds.length === 16, `focus rooms: expected 16, received ${roomIds.length}`);
roomIds.forEach((id) => assert(Core.FOCUS_SOUND_PRESETS[id], `missing soundscape preset: ${id}`));

const state = structuredClone(Core.state);
state.focusSessions = Array.from({ length: 10 }, (_, index) => ({ actualMinutes: index ? 5 : 25, date: '2026-09-14' }));
state.tasks = Array.from({ length: 30 }, (_, index) => ({ status: 'done', area: ['学习', '工作', '生活'][index % 3], minutes: 25, date: '2026-09-14' }));
state.growthRecords = ['学习', '工作', '生活', '写作'].map((area) => ({ area, amount: 1, date: '2026-09-14' }));
state.habits = [{ days: Object.fromEntries(Array.from({ length: 30 }, (_, index) => [String(index), true])) }];
state.notes = Array.from({ length: 10 }, () => ({ title: 'note' }));
state.journal = Object.fromEntries(Array.from({ length: 7 }, (_, index) => [String(index), 'entry']));
state.monthlyMemories = { one: {}, two: {}, three: {} };
state.planning.adoptedPlans = [{}];
Core.evaluateUnlocks(state);

['hourglass', 'umbrella', 'lantern', 'leaf-letter', 'shell', 'train-ticket', 'snowflake', 'ribbon']
  .forEach((id) => assert(state.collection.stickers.includes(id), `sticker did not unlock: ${id}`));
['first-plan', 'focus-25', 'task-30', 'habit-30', 'note-10', 'all-rounder']
  .forEach((id) => assert(state.collection.badges.includes(id), `badge did not unlock: ${id}`));

console.log('catalog check passed');
