# PhinFind Design System & Style Guide

Comprehensive documentation of PhinFind's dark, artisan coffeehouse visual language, layout structure, interaction models, and UI component standards.

---

## 1. Global Theme & Color Palette

The default experience is a rich dark theme inspired by artisanal Vietnamese coffee brewing (*phin* drip roasts and warm golden crema).

### Color Tokens
* **Main Background (`bg-dark-bg`)**: `#1A0F0A` — Deep espresso background base.
* **Surface & Card Base (`bg-dark-roast`)**: `#2C1810` — Warm dark roasted bean tone for cards, elevated surfaces, and inputs.
* **Card Gradient Midtones**: `#25140d` — Subtle gradient layer between dark roast and background.
* **Borders & Dividers (`border-dark-border`)**: `#3D2A1E` / `rgba(61, 42, 30, 0.8)` — Muted organic border separating panels.
* **Primary Text (`text-cream-white`)**: `#FAF7F2` — High-contrast cream tone for headings, titles, and active labels.
* **Secondary Text (`text-soft-beige`)**: `#D4C4B8` — Soft warm beige for descriptions, addresses, and secondary labels.
* **Muted / Inactive Text (`text-warm-gray`)**: `#9E8B7E` — Subdued warm gray for review counts, inactive tabs, and placeholders.
* **Brand Accent (`--color-amber-gold`)**: `#D4A057` — Warm golden highlight for active states, badges, stars, and interactive borders.
* **Brand Accent Hover (`--color-amber-gold-hover`)**: `#E0B26E` — Brightened gold on hover states.

---

## 2. Header Navigation

* **Typography & Fonts**: Sans-serif (Inter) with `font-medium` to `font-bold` sizing.
* **Active Navigation State**:
  * Text Color: Brand gold (`text-amber-gold` / `#D4A057`).
  * Background: `bg-white/10`.
  * Indicator: Subtle bottom underline / active highlight.
  * Icon: Highlighted gold accent.
* **Inactive Navigation State**:
  * Default: `text-soft-beige/80`, transparent background.
  * Hover: Text transitions to gold (`text-amber-gold`), background fills to `bg-white/5`, and inline Lucide icon turns gold with `transition-colors duration-200`.
* **Active Hover State**:
  * Icon and label brighten to `text-amber-gold-hover`.

---

## 3. Filter & Search Section

* **Layout**: Compact, sticky single-bar layout integrating search input, filter chips, and sorting dropdown.
* **Focus States**:
  * No harsh white outlines or oversized rings.
  * Subtle gold glow: `focus-visible:ring-1 focus-visible:ring-amber-gold/50 focus-visible:ring-offset-0`.
* **Filter Chips (Lucide Icons Only, No Emojis)**:
  * **Open Now**: `<Circle>` (10–12px) with pulsating dot indicator.
  * **Rating**: `<Star>` dropdown trigger with numeric label.
  * **Near Me / Distance**: `<MapPin>` or `<Navigation>`.
  * **Sort**: `<ArrowUpDown>` or `<Footprints>` inside trigger; plain text menu options inside dropdown.
* **Active "Open Now" State**: Soft pastel green chip (`bg-[#7CAE8E]/30 text-[#A3D9B1] border-[#7CAE8E]/40`).

---

## 4. Coffee Shop Cards & Bento Grid

### Predefined Grid Architecture
* Grid container: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 auto-rows-[255px] [grid-auto-flow:dense]`.
* Rounded corners: `rounded-3xl` (`1.5rem`) on all cards with `overflow-hidden`.
* Content safety: Generous internal padding and flexible spacing (`min-h-0`, `overflow-visible`) ensuring zero text clipping.

### Card Variants
1. **Small (`ShopCardSmall`)**:
   * Geometry: `col-span-1 row-span-1`.
   * Layout: Top image banner (`h-28`) + shop title, distance/rating badges, and quick actions.
2. **Medium (`ShopCardMedium`)**:
   * Geometry: `col-span-2 row-span-1`.
   * Layout: Horizontal split with 34–36% left 4:3 image + right stacked metadata and action row.
3. **Large (`ShopCardLarge`)**:
   * Geometry: `col-span-2 row-span-2`.
   * Layout: 2-column magazine-style image gallery + structured bottom content area.
4. **Featured (`ShopCardFeatured`)**:
   * Geometry: `col-span-2 md:col-span-3 row-span-2`.
   * Layout: 2-column magazine gallery with "Editor's Choice" badge + rich editorial metadata and CTA buttons.

### 2-Column Magazine Gallery Layout (Large & Featured)
* **Left Column (60% width)**: Primary image, filling 100% height of `h-56 sm:h-64` container with `object-fit: cover`.
* **Right Column (40% width)**: Stacked column split into two equal 50% height rows for secondary and detail photos.
* **"+N More" Overlay**: Semi-transparent dark backdrop (`bg-black/65`) with gold text (`text-amber-gold`) centered over the third thumbnail.
* **Fallbacks**: If fewer raw images are provided, seamlessly blend curated cafe photographs so the 3-image layout remains consistent.

### Interactive Micro-Animations & Glow Borders
* **Hover Lift & Shadow**: `hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(212,160,87,0.15)]`.
* **Subtle Perimeter Border Flow (`.card-glow-border`)**:
  * Pseudo-element `::before` at `inset: 0` with `border-radius: inherit` and dual-layer mask clipping (`mask-composite: exclude`).
  * Continuous rotating gradient stroke running along the perimeter on hover (`animation: border-travel 2.2s linear infinite`).
  * Non-intrusive: `pointer-events: none` and 0px layout shift.

---

## 5. Typography

* **Font Family**: Inter (sans-serif) exclusively across all headings, body text, and interactive buttons.
* **Visual Hierarchy**:
  * **Shop Names / Card Titles**: `font-bold text-lg sm:text-xl md:text-2xl text-cream-white tracking-tight`.
  * **Addresses & Locations**: `font-normal text-xs sm:text-sm text-soft-beige/90`.
  * **Atmosphere Taglines & Excerpts**: `font-normal text-xs sm:text-sm text-soft-beige/90 leading-relaxed`.
  * **Metadata & Badges**: `font-medium text-xs text-soft-beige`.

---

## 6. Status Indicators

* **Open Status**: Soft pastel sage green (`#7CAE8E` background tint with `#A3D9B1` text and animated pulsing dot).
* **Closed Status**: Soft pastel dusty rose (`#C97A7A` background tint with `#E8A5A5` text).
* *Note*: Neon greens and bright reds are strictly avoided to preserve the calm, high-end coffeehouse atmosphere.

---

## 7. Skeleton Loading Architecture

* **Backgrounds & Shimmer**: Skeletons use `bg-dark-roast/80` and `bg-dark-roast/90` with muted warm gold pulsing accents (`border border-dark-border/30 animate-pulse`). No bright white flashes.
* **Component Parity**:
  * `CardSkeleton`: Supports `small`, `medium`, `large`, and `featured` size variants matching actual card dimensions and 60/40 gallery headers.
  * `ListSkeleton`: Matches the exact Bento Grid layout (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[255px]`) with mixed card skeletons.
  * `LoadingSpinner`: Amber-gold spinner border (`border-amber-gold/20 border-t-amber-gold`) and cream typography for map and data transitions.
