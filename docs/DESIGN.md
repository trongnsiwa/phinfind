# ☕ PhinFind - Complete Design System Guide (v2.0)

_A Progressive Web Application for discovering the best coffee shops wherever you are_

---

## 📋 Table of Contents

- [Design Philosophy](#-design-philosophy)
- [Brand Identity](#-brand-identity)
- [Color System](#-color-system)
- [Typography](#-typography)
- [Spacing & Bento Layout](#-spacing--bento-layout)
- [Iconography](#-iconography)
- [Component Library](#-component-library)
- [Page Templates](#-page-templates)
- [UI Patterns & Interactions](#-ui-patterns--interactions)
- [Micro-interactions & Motion](#-micro-interactions--motion)
- [Responsive Breakpoints](#-responsive-breakpoints)
- [Accessibility](#-accessibility)
- [Implementation Guidelines](#-implementation-guidelines)

---

## 🎯 Design Philosophy

### The PhinFind Ethos

**"Authentic Discovery, Vietnamese Soul, Modern Precision"**

PhinFind bridges the gap between modern convenience and Vietnamese coffee culture. Version 2.0 introduces a dark roast glassmorphism header, Warm Amber Gold (`#D4A057`) accents, and an artistic pure coffee Bento Grid layout with top horizontal filter bars.

| Quality                 | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| **Warm & Inviting**     | Like stepping into a cozy neighborhood café                  |
| **Modern & Premium**    | Clean dark roast aesthetics with warm gold highlights       |
| **Artistic Bento Grid** | Curated coffee shop discovery with varied card sizing        |
| **Culturally Rooted**   | Celebrating Vietnamese coffee traditions (the _phin_ filter) |
| **Effortlessly Fast**   | Mobile-first, infinite scrolling, debounced live search      |

### Core Design Principles

1. **Mobile-First & PWA First**
   - Built for thumb navigation and mobile responsiveness.
   - Fixed bottom navigation bar (`Discover`, `Map`, `Saved`, `Profile`).

2. **Clean Horizontal Filter Separation**
   - Filter controls reside in a cohesive horizontal bar **above** the grid.
   - The Bento Grid strictly contains coffee shop cards (no clutter inside the grid).

3. **Inter Sans-Serif Typography System**
   - **Inter ONLY** across the entire application for a sleek, technical finish.
   - Complete removal of Playfair Display serif fonts.

4. **Warm Amber Gold Accent System**
   - `#D4A057` used consistently for active navigation links, indicators, avatar borders, and search triggers.
   - Zero yellow colors used (`#FFD700` and `#F5C842` excluded).

---

## 🏷️ Brand Identity

### Logo & Brand Assets

```
┌─────────────────────────────────────────────────┐
│  ☕  PhinFind                                   │
│     Discover Vietnamese Coffee                 │
└─────────────────────────────────────────────────┘
```

| Element       | Description                                  | Usage                        |
| ------------- | -------------------------------------------- | ---------------------------- |
| **Phin Icon** | Stylized Vietnamese coffee filter silhouette | Primary icon, favicon, app badge |
| **Wordmark**  | Inter bold lettering with warm amber accents | Header, navigation           |
| **Tagline**   | "Discover Vietnamese Coffee"                 | Hero banner, splash screens  |

---

## 🎨 Color System

### Primary & Dark Theme Palette

PhinFind v2.0 introduces a premium dark roast header palette combined with warm coffee tones.

```
Primary Accent:
🟨 Warm Amber Gold
HEX: #D4A057
RGB: 212, 160, 87
Usage: Active navigation links, underline indicators, search triggers, avatar borders

Hover Accent:
🟨 Brighter Amber
HEX: #E8B86D
Usage: Hover states for links and buttons

Dark Theme Palette (Header & Surfaces):
⬛ Dark Roast Background
HEX: #1A0F0A
Usage: Header background, dark sheet modals, mobile nav

🟤 Dark Roast Border
HEX: #2C1810
Usage: Header bottom border, card separation lines

⬜ Cream White Text
HEX: #FAF7F2
Usage: Primary text on dark surfaces

🌫️ Soft Beige & Warm Gray
HEX: #D4C4B8 / #A8988E
Usage: Secondary & muted text on dark surfaces
```

### Coffee Brand Palette (Phin Tokens)

```
phin-50:  #FAF7F2  (Background cream)
phin-100: #F5E6D3  (Light golden surface)
phin-200: #E8D5C0  (Card borders)
phin-300: #D48B5C  (Accent caramel)
phin-400: #C68E5C  (Muted saffron)
phin-500: #8B6B4A  (Coffee roast)
phin-600: #6F4E37  (Medium roast)
phin-700: #5A3E2E  (Dark roast)
phin-800: #4D3427  (Deep roast)
phin-900: #2C1810  (Darkest roast)
phin-950: #1A0E0A  (Black roast)
```

---

## ✍️ Typography

### Inter Sans-Serif System (Inter ONLY)

PhinFind uses **Inter** as its single, unified font family across all headings, body text, badges, and navigation.

```css
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Typography Scale & Hierarchy

| Scale         | Size (px) | Weight | Tracking   | Class Name           | Usage                       |
| ------------- | --------- | ------ | ---------- | -------------------- | --------------------------- |
| **Display**   | 48px      | 700    | `-0.02em`  | `.text-display`      | Hero headline               |
| **Title**     | 32px      | 700    | `-0.02em`  | `.text-title`        | Section titles              |
| **Heading**   | 24px      | 600    | `-0.01em`  | `.text-heading`      | Shop titles, card headers   |
| **Subheading**| 20px      | 600    | `normal`   | `.text-subheading`   | Sub-sections, modal headers |
| **Body Large**| 16px      | 400    | `normal`   | `.text-body-large`   | Featured shop descriptions  |
| **Body**      | 14px      | 400    | `normal`   | `.text-body`         | Standard copy text          |
| **Small**     | 12px      | 400    | `normal`   | `.text-small`        | Distances, review counts    |
| **Caption**   | 11px      | 500    | `+0.02em`  | `.text-caption`      | Badges, status labels       |
| **Navigation**| 14px      | 500    | `normal`   | `.text-nav`          | Header & bottom nav links   |

---

## 📐 Spacing & Bento Layout

### Bento Grid System & Card Assignment Logic

The homepage uses a responsive CSS Grid with `auto-flow: dense` and `gap: 12px`.

```
Responsive Grid Columns:
- Mobile (<640px): 2 columns
- Tablet (640px - 1024px): 3 columns
- Desktop (>1024px): 4 columns
```

#### Card Sizing Rules (By Array Index)

| Card Variation | Dimensions | Assignment Rule | Features |
| -------------- | ---------- | --------------- | -------- |
| **Small Card** | 1 col × 1 row | Default for rest | Circular image, name, rating, walking distance, heart action |
| **Medium Card**| 2 cols × 1 row| Every 5th card | Horizontal layout, side image (40%), open status badge, nav link |
| **Large Card** | 2 cols × 2 rows| Every 10th card| Hero photo background, gradient overlay, tagline quote, action buttons |
| **Featured Card**| 3 cols × 2 rows| Every 15th card| Full-width Editor's Pick banner, description, full details, premium gold border |

---

## 🧩 Component Library

### 1. Header (`Header.tsx`)
- **Dark Glassmorphism**: `bg-[#1A0F0A]/90 backdrop-blur-md border-b border-[#2C1810] text-[#FAF7F2]`
- **Left Side**: App logo ("☕ PhinFind") + `Discover` (`/`) and `Map` (`/map`) navigation links with Warm Amber Gold text (`#D4A057`) and 2px underline indicators when active.
- **Right Side**: Search button (with tooltip and `Cmd+K` keyboard listener) + User Avatar with `#D4A057` border and `DropdownMenu` (Profile, Favorites, Settings, Logout).
- **Mobile Navigation**: Hamburger menu opening a navigation sheet.

### 2. Horizontal Filter Bar
- **Position**: Top of homepage above the Bento Grid.
- **Row 1**: Full-width SearchBar with instant live debouncing and clear action.
- **Row 2**: Scrollable `FilterChips` row (`🟢 Open Now`, `⭐ Rating`, `📍 Near Me`).
- **Row 3**: Results count ("X shops nearby") + Sort selector dropdown (`Distance`, `Rating`, `Name`).

### 3. Bottom Navigation (`BottomNav.tsx`)
- Fixed bottom bar on mobile (`Discover`, `Map`, `Saved`, `Profile`).
- Dark glass container with active tab dot indicator in Warm Amber Gold (`#D4A057`).

---

## 🎭 UI Patterns & Micro-interactions

1. **Card Entrance Animation**
   - Staggered fade-in and slide-up transition as cards load or scroll into view.

2. **Card Hover Effects**
   - Smooth `translateY(-4px)` lift, subtle shadow elevation, and photo scale (`1.05`).

3. **Heart Favorite Action**
   - Heart beat pulse keyframe animation (`@keyframes heart-beat`) on toggle.

4. **Infinite Scroll Sentinel**
   - Intersection Observer sentinel at bottom of grid triggering continuous paginated loading.

---

## ♿ Accessibility & Performance

- **WCAG AA Color Contrast**: All text on dark `#1A0F0A` and cream `#FAF7F2` backgrounds meets strict contrast guidelines.
- **Keyboard Shortcuts**: `Cmd+K` / `Ctrl+K` global hotkey to open the search modal sheet.
- **Accessible Touch Targets**: All buttons, chips, and menu items maintain a minimum height of 44px.
- **Verification Standards**: Implementation verified with `rtk pnpm lint`, `rtk pnpm exec tsc --noEmit`, and `rtk pnpm build`.
