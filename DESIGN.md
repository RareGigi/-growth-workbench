# Design

<!-- impeccable design authority for 小小生长册 -->

## Visitor Mode

Operate.

The primary job is to plan, act, and review. Expressive illustration supports the work but never competes with task clarity.

## Visual World

A blue-violet illustrated personal study room at night: clear cool air, warm desk light, silver-blue moonlight, books, flowers, small celestial objects, and restrained journal ephemera. The character is part of the user's ritual rather than a separate game.

This replaces all abandoned pink-first, moon-garden, home-building, and Q-body worlds. Do not blend them back in.

## Palette

- Canvas: `#edf2fb`
- Canvas cool depth: `#dfe8f7`
- Paper: `#fbfcff`
- Ink: `#24345f`
- Muted ink: `#6678a5`
- Primary blue: `#617ed2`
- Periwinkle: `#8799e7`
- Violet: `#8f83d9`
- Cyan accent: `#58b5c0`
- Warm accent: `#e8ad72`
- Pink accent (rare): `#e69ab6`
- Sidebar: `#263d79` to `#334d8f`, not black.
- Borders: blue-tinted, never neutral gray.

Pink is an accent, not a surface color.

## Typography

Chinese UI uses a refined serif/sans pairing available from local/system fallbacks without downloading font files:
- Display/date/reflective journal moments: `STSong`, `Songti SC`, `Noto Serif CJK SC`, serif.
- UI/body: `PingFang SC`, `Hiragino Sans GB`, `Microsoft YaHei`, sans-serif.

Do not use giant display text. Keep mobile body text at least 14px and controls at least 44px touch height.

## Spatial Thesis

Primary path on desktop:
sidebar project context → today hero → today's tasks/next action → timeline/focus → supporting growth information → collection/review.

Primary path on mobile:
project drawer button → date/hero → today tasks → focus/next action → lightweight growth summary → bottom navigation.

Use a 4px spacing base with semantic steps: 4, 8, 12, 16, 24, 32, 48.

## Sidebar

Desktop sidebar is a stable vertical rail with:
- brand and collapse control;
- primary navigation;
- a real collapsible `项目` section;
- projects showing name, area, and progress;
- compact character/signature footer.

When collapsed, preserve recognizable navigation and project dots without text.

Mobile does not hide projects. A visible `项目` button in the top bar opens the same sidebar as an off-canvas drawer. The project group remains fully usable inside the drawer.

## Surfaces

### Today
Illustration-led hero plus a clear date card. Below it, use larger meaningful regions rather than many equal KPI cards:
- today tasks;
- timeline / next action;
- focus;
- growth summary;
- mood + one-line diary;
- habits/countdowns;
- weekly stickers / wardrobe / scenes as a quieter lower layer.

### Plans
Treat long-term plans as growth books, not kanban boards. Current project is prominent; other plans remain browsable.

### Focus
Quietest page. One task, timer, accumulated time, and character/scene.

### Review / Journal
Read like a beautiful weekly/monthly spread, not analytics software.

### Collection
Strong archive feeling. Character/wardrobe is one region; stickers, badges, scenes, and monthly memories are grouped by meaning.

## Components

- Cards are used only for meaningful surface groups; avoid cards inside cards.
- Corners: 16–22px on major surfaces, 10–14px on controls.
- Shadows: blue-tinted, soft, offset downward.
- Borders: 1px tinted blue.
- Icons: consistent authored SVG stroke/outline style. Do not use emoji as formal UI icons.
- Progress: slim linear bars, not decorative rings except the focus timer where the circle is functional.
- Inputs: visible focus ring in primary blue, no low-contrast placeholders.

## Illustration & Assets

- `assets/blue/hero.webp`: wide hero scene, at least roughly 1600px wide.
- `assets/blue/avatar.webp`: high-resolution character art, used consistently.
- `assets/blue/outfits.webp`: dedicated outfit strip, not screenshots cropped from unrelated UI.
- `assets/blue/scenes.webp`: dedicated scene strip.
- Use `object-fit` and fixed aspect boxes so images never stretch.
- Failure state must show a designed blue-violet placeholder, never a broken-image icon.

## Motion

One authored motion grammar only:
- sidebar/drawer: 180–220ms ease-out;
- page transition: subtle 140–180ms opacity + 4px translate;
- task completion: check/fill and reward text, no confetti modal;
- respect reduced-motion.

## Responsive

- Desktop ≥ 1024: persistent sidebar and multi-column content.
- Tablet 720–1023: narrower sidebar or compact rail, 2-column content.
- Mobile < 720: off-canvas project drawer, single-column reading order, bottom 5-item navigation.
- Avoid horizontal scrolling for core task surfaces.
- Safe-area padding on iPhone bottom navigation and drawer.

## Anti-patterns

Do not:
- reintroduce pink-first surfaces;
- nest cards;
- add glass blur just for decoration;
- use generic gray text on blue surfaces;
- use unicode/emoji as the main icon system;
- create more one-off override stylesheets;
- add a new visual system for one page;
- scale tiny source images to hero size;
- hide the project system on mobile.
