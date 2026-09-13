# PhinFind Responsive Refactor Plan (Mobile & Tablet Polish)

**Document version:** 1.0
**Scope:** Refactor PhinFind to be pixel-polished across mobile (320–639px), tablet portrait (640–1023px), and tablet landscape (1024–1279px), without regressing the current desktop experience (≥1280px).
**Non-goals:** Redesigning visuals, changing business logic, altering API contracts, or migrating away from Tailwind v4 / shadcn.

---

## 1. Executive Summary

PhinFind already contains partial responsive classes (`sm:`, `md:`, `lg:`, `xs:` custom). However, the codebase suffers from:

1. **Breakpoint gaps** — Most components jump from mobile directly to `lg`/desktop, leaving the tablet range (640–1023px) underspecified.
2. **Touch-target violations** — Many interactive elements are `h-6`/`h-7`/`h-8` (24–32px), below the WCAG 2.5.5 minimum of 44×44px.
3. **Fixed heights on media** — Card images use hard-coded `h-24`, `h-32`, `h-36` that don't scale with viewport width.
4. **Safe-area omissions** — `env(safe-area-inset-bottom)` is only applied in the shop drawer / standalone detail view, not globally.
5. **Drawer/Sheet sizing** — Bottom sheets use `max-w-lg`/`max-w-2xl` without tablet-aware caps; on tablet portrait, they occupy awkward mid-widths.
6. **Orientation blindness** — No `orientation:` variants or landscape-specific handling.
7. **Typography density** — Heavy reliance on `text-[10px]`/`text-[11px]` in mobile which becomes unreadable at 320px and unnecessarily tiny on tablets.

The refactor will introduce a **consistent 4-tier breakpoint contract**, apply **touch-target normalization**, and audit **each interactive surface** for mobile/tablet parity.

---

## 2. Breakpoint Contract

We adopt a **4-tier responsive contract** layered on top of Tailwind's defaults:

| Tier                                     | Range       | Tailwind prefix            | Primary target           |
| ---------------------------------------- | ----------- | -------------------------- | ------------------------ |
| **XS (compact)**                         | 320–359px   | _(base)_                   | Small phones (iPhone SE) |
| **SM (mobile)**                          | 360–639px   | `xs:` _(custom, existing)_ | Standard phones          |
| **TB (tablet portrait)**                 | 640–1023px  | `sm:` and `md:`            | iPad Mini, iPad portrait |
| **TL (tablet landscape / small laptop)** | 1024–1279px | `lg:`                      | iPad landscape, Surface  |
| **DSK (desktop)**                        | ≥1280px     | `xl:`/`2xl:`               | Full desktop             |

### Rules

1. **Every multi-column layout must declare behavior at `sm:` and `md:` separately** — do not skip from base → `lg`.
2. **No interactive element below 44×44px effective tap area** on `< md`. Use `min-h-[44px] min-w-[44px]` or padding-based expansion if visual size must stay small.
3. **Media (images/video) must use aspect-ratio or viewport-relative heights**, never fixed px heights, unless the aspect is intrinsic.
4. **All bottom-anchored fixed UI must include `env(safe-area-inset-bottom)`**.
5. **`md:` is the "tablet-first" workhorse prefix**, not `lg:`.

---

## 3. Global Foundations (Apply First)

### 3.1 Viewport & Meta

- **File:** `app/layout.tsx`
- **Action:** Confirm `viewport` export contains `viewportFit: 'cover'` so `env(safe-area-inset-*)` resolves on notched devices.

```ts
export const viewport: Viewport = {
  themeColor: '#F9F6F0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover' // ADD
};
```

### 3.2 Global CSS Additions

- **File:** `app/globals.css`
- **Actions:**
  1. Register utility classes:
     ```css
     .safe-bottom {
       padding-bottom: max(env(safe-area-inset-bottom), 0.75rem);
     }
     .safe-top {
       padding-top: max(env(safe-area-inset-top), 0);
     }
     .tap-target {
       min-height: 44px;
       min-width: 44px;
     }
     ```
  2. Add orientation-aware typography scale variable (optional).
  3. Prevent horizontal overflow globally:
     ```css
     html,
     body {
       overflow-x: clip;
     }
     ```
  4. Disable `scroll-behavior: smooth` on `prefers-reduced-motion` (accessibility).

### 3.3 Touch-Target Normalization

- **Pattern to replace** (throughout `src/components/ui/*` and feature components):
  - `h-6`, `h-6.5`, `h-7`, `h-7.5`, `h-8`, `h-8.5` on `<Button size="sm|icon">` → wrap or bump to `h-9 min-w-9` at base, `md:h-8` if density requires.
- **Specific offenders identified:**
  - `FilterChips`: `h-7` chips (7 instances) → keep visual size but add `py-1` + `min-h-[36px]` on mobile, then `md:h-7`.
  - `FloatingFilterBar`: `h-8` controls → `min-h-[40px]` base.
  - `NotificationItem` delete: `p-1` → expand tap zone with `p-2` and negative margin.
  - `ShopCardSmall/Medium/Large/Featured` favorite buttons: `h-7 w-7` → `h-8 w-8 md:h-7 md:w-7`.
  - `Header` icon buttons: already `h-9 w-9` — OK.
  - `ReviewCard` "Sửa/Xóa": `text-[11px]` inline buttons → give `py-1.5 px-1` tap padding.
  - `TabBar` in `ShopDetailsContent`: `text-xs` tabs with `pb-2 pt-1` — expand to `min-h-[44px]` on mobile.

### 3.4 Safe-Area Audit Checklist

Apply `safe-bottom` (or inline `pb-[max(...)]`) to:

- [ ] `BottomNav` (`src/components/layout/BottomNav.tsx`) — **currently missing**
- [x] `ShopDrawer` bottom bar — already present
- [x] `ShopDetailClient` bottom bar — already present
- [ ] `SyncIndicator` (`bottom-20 md:bottom-6`) — offset must account for safe area
- [ ] `FloatingFilterBar` (`bottom-16 md:bottom-4`) — verify no overlap with BottomNav + safe area
- [ ] `DiscoverClient` FAB (`bottom-20 sm:bottom-8` / `bottom-32 sm:bottom-16`)
- [ ] `MapClient` FAB (`bottom-5 right-4 sm:bottom-6 sm:right-6 max-md:bottom-20`)

---

## 4. Component-by-Component Refactor Plan

### 4.1 Layout Shell

#### `src/components/layout/Header.tsx`

**Current issues:**

- Search field width: `w-32 xs:w-48 sm:w-64 min-w-[120px] max-w-[calc(100vw-180px)]` — breaks under 360px when keyboard is open.
- Desktop nav appears at `md:flex` (tablet portrait sees desktop nav — good), but hamburger is `md:hidden`, so no tablet nav fallback exists for overflow.
- Autocomplete dropdown: `w-[calc(100vw-6rem)] xs:w-72 sm:w-80 md:w-96` — on tablet portrait it's capped at `sm:w-80` (320px), leaving dead space.

**Refactor:**

- Search field: use `w-full max-w-[min(20rem,calc(100vw-8rem))]`.
- Autocomplete: `w-full sm:w-[22rem] md:w-[26rem] lg:w-[28rem] max-w-[calc(100vw-1.5rem)]`, right-aligned.
- Nav: keep `md:flex` but add `lg:gap-3` (currently `gap-1.5`).
- Ensure header height stays `h-14` on all tiers (documented contract for `MapClient` `top-14` offset).

#### `src/components/layout/BottomNav.tsx`

**Current issues:**

- Only 4 items, `md:hidden` — hidden on tablet portrait but there's no tablet-specific nav affordance.
- No safe-area padding.
- Icons `h-5 w-5` — fine; label `text-[10px]` — too small at 320px.

**Refactor:**

- Add `safe-bottom` class and `pb-[max(0.375rem,env(safe-area-inset-bottom))]`.
- Keep `md:hidden` (tablet uses Header nav).
- Label: `text-[11px] xs:text-xs`.
- Add `aria-current="page"` when active.

#### `src/components/layout/MainContent.tsx`

**Current issues:**

- `pb-20 md:pb-8` — on tablet portrait (md), bottom padding drops to 32px while BottomNav is hidden — OK, but SyncIndicator sits at `bottom-20 md:bottom-6` and could be clipped.
- No tablet-specific max-width — content stretches to `max-w-7xl` (80rem / 1280px) at tablet, which is too wide for reading.

**Refactor:**

- `max-w-7xl` → `max-w-3xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto`.
- `p-4 sm:p-6 pb-20 md:pb-8` → `px-4 sm:px-6 md:px-8 pb-24 md:pb-10`.

---

### 4.2 Discover Page (Bento Grid)

#### `src/components/bento/BentoGrid.tsx`

**Current:**

```
grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[260px]
```

**Issues:** No tablet-portrait-specific column count; `auto-rows-[260px]` fixed.

**Refactor:**

```
grid grid-cols-2
     sm:grid-cols-2
     md:grid-cols-3
     lg:grid-cols-4
     gap-3 sm:gap-4
     auto-rows-[minmax(220px,auto)] md:auto-rows-[260px]
```

Rationale: tablet portrait (640–767) → 2 cols with wider cards; tablet landscape (768–1023) → 3 cols.

#### `src/components/bento/ShopCard{Small,Medium,Large,Featured}.tsx`

**Issues:**

- Fixed image heights `h-24 sm:h-28`, `h-32 sm:h-36` don't scale at tablet width.
- Text truncation with `text-[10px]`/`text-[11px]` — unreadable on small phones.
- Favorite buttons `h-7 w-7` — below 44px tap target.

**Refactor (all four cards):**

- Replace fixed image heights with `aspect-[16/10]` or `aspect-video` where possible.
- Bump smallest text to `text-[11px]` base, `sm:text-xs`, `md:text-sm`.
- Favorite button: `h-8 w-8 md:h-7 md:w-7` with `min-h-[44px]` invisible hit zone via padding wrapper.
- Card padding: `p-2.5 sm:p-3 md:p-3.5 lg:p-4`.
- CTA buttons: `h-7` → `h-8 md:h-7`.

#### `src/components/bento/FilterChips.tsx`

**Issues:**

- Chips `h-7` — 28px, below minimum.
- Horizontal scroll container is fine but no scroll-snap.
- Popover content `w-56`/`w-64`/`w-72` — table portrait OK.

**Refactor:**

- Chip height: `h-9 md:h-7` with `px-3 md:px-2.5`.
- Add `scroll-snap-type: x proximity` + `scroll-snap-align: start` on children.
- Popover trigger: verify `aria-pressed` semantics (already correct).

#### `src/components/bento/FloatingFilterBar.tsx`

**Issues:**

- Positioned `bottom-16 md:bottom-4` — overlaps BottomNav on mobile unless offset ≥ 64px + safe area.
- Controls `h-8` — below tap target.
- Search input `h-8 pl-8 pr-7` — too small on mobile.

**Refactor:**

- Position: `bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-4`.
- Controls: `h-9 md:h-8`, `min-h-[44px]` on mobile (via padding or `py-2`).
- Search input: `h-10 md:h-9`.
- Badge `{shopCount} quán` — keep hidden on `< sm`, show on `sm:inline-flex`.

#### `src/components/bento/SearchBar.tsx`

**Issues:**

- Input `h-9` — OK.
- Placeholder text is long; truncates on 320px.

**Refactor:**

- Add `text-ellipsis` (implicit) and use shorter mobile placeholder via JS: `"Tìm quán..."` for `window.innerWidth < 640`. Or use CSS: two spans with `hidden sm:inline`. **Recommend CSS approach** to avoid layout thrash.

#### `src/components/bento/InfiniteScroll.tsx`

- `col-span-full` — fine.
- Text `text-xs` — bump to `text-sm md:text-xs`.

#### `app/(main)/DiscoverClient.tsx`

- Top filter card: `p-3.5 sm:p-4` — fine.
- Results row: `flex-col sm:flex-row` — verify tablet portrait stacks cleanly; add `md:flex-row`.
- Empty state button `text-xs px-4 py-2` — bump `min-h-[44px]`.
- FAB: add `safe-bottom` offset.

---

### 4.3 Map Page

#### `app/(main)/map/MapClient.tsx`

**Issues:**

1. Header: `h-14 fixed top-0` — fine.
2. Location pill: `max-w-[170px] xs:max-w-[220px] sm:max-w-xs` — tablet has huge dead space between pill and right controls; consider centering with `mx-auto` on `md:`.
3. Filter bottom sheet: `max-w-lg mx-auto` — on tablet portrait, a 512px sheet centered looks fine, but on `md:` should widen to `max-w-2xl` or become a right-side sheet.
4. FAB: `bottom-5 right-4 sm:bottom-6 sm:right-6 max-md:bottom-20` — **`max-md:bottom-20` is a workaround**; keep but add `env(safe-area-inset-bottom)`.
5. Filter sheet grid `grid-cols-3` (rating) / `grid-cols-4` (price) — fine.
6. Search dropdown `max-h-72 overflow-y-auto` — fine.

**Refactor:**

- **Filter sheet layout:**
  - Mobile: bottom sheet (current).
  - Tablet portrait (`sm:` to `md:`): bottom sheet, `max-w-2xl mx-auto`.
  - Tablet landscape (`lg:`): convert to **right-side `Sheet side="right"`** for better ergonomics. This requires conditional `side` prop based on `useMediaQuery('(min-width: 1024px)')`.
- **Add Shop FAB:** `bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6`.
- **Sidebar offset FAB:** when `selectedShop && isDesktop`, offset is `lg:right-[460px]` — for tablet landscape (1024–1279), the sidebar is `lg:w-[440px]`, so FAB offset `lg:right-[460px]` is correct but `xl:`/`2xl:` offsets diverge from sidebar widths (`460`/`480`). Verify alignment.

#### `src/components/map/LeafletMapInner.tsx`

**Issues:**

- `MapFloatingControls`: `bottom-20 sm:bottom-20 max-md:bottom-36 right-4 sm:right-6` — messy; `max-md:bottom-36` (144px) leaves huge gap.
- Zoom controls `h-10 sm:h-11` — fine.
- Attribution `text-[9px]` — too small; bump to `text-[10px] md:text-[9px]`.

**Refactor:**

- `MapFloatingControls` position: `bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-24 lg:bottom-20 right-3 sm:right-5 md:right-6`.
- Attribution: `text-[10px] md:text-[9px]`.

#### `src/components/shop/ShopSidebar.tsx`

**Issues:**

- `w-full sm:w-[440px] lg:w-[440px] xl:w-[460px] 2xl:w-[480px]` — the `sm:w-[440px]` is problematic: on a 640px tablet, a 440px sidebar covers 68% of screen; on a 1023px tablet, it's 43% — inconsistent.
- Bottom action bar has `grid-cols-4` — fine.
- Only mounted when `isDesktop` (from `MapClient`) — `isDesktop = useMediaQuery('(min-width: 1024px)')` — so sidebar only shows on `lg:`. **However, tablet portrait (640–1023) will get `ShopDrawer` (bottom sheet)** — verify that drawer's `max-w-2xl` is centered correctly.

**Refactor:**

- Since sidebar only shows on `lg:`, simplify width: `lg:w-[440px] xl:w-[460px] 2xl:w-[480px]`.
- Ensure bottom bar uses `safe-bottom`.

#### `src/components/shop/ShopDrawer.tsx`

**Issues:**

- `max-w-2xl mx-auto` — on tablet portrait (640–1023), a 672px sheet centered leaves ~30px gutters at 768px — OK, but at 1024px it's exactly viewport width minus gutters.
- No `md:` widening.
- Bottom bar `pb-[max(0.75rem,env(safe-area-inset-bottom))]` — good.

**Refactor:**

- `max-w-2xl lg:max-w-3xl` — but note it's hidden on `lg:` (sidebar shows instead), so widen to `md:max-w-3xl`.
- Actually, since `ShopSidebar` only mounts on `lg:`, `ShopDrawer` should be the tablet experience. Set `max-w-2xl md:max-w-3xl`.

---

### 4.4 Shop Details

#### `src/components/shop/ShopDetailsContent/TabBar.tsx`

**Issues:**

- Tabs `text-xs pb-2 pt-1` — tap target ~28px.

**Refactor:**

- `min-h-[44px] md:min-h-[40px]`.
- Active tab underline stays.

#### `src/components/shop/ShopDetailsContent/Gallery.tsx`

**Issues:**

- `h-36 sm:h-44` — fixed heights.
- Multi-image layout uses `flex-[3]`/`flex-[2]` — works but at 320px, images become very narrow.

**Refactor:**

- `aspect-[16/9] sm:aspect-[16/8]` or `h-40 sm:h-48 md:h-56`.
- Consider stacking to single image at `< 360px` (edge case).

#### `src/components/shop/ShopDetailsContent/Header.tsx`

- Metrics badges wrap fine.
- `text-[11px]` badges → `text-[11px] sm:text-xs`.

#### `src/components/shop/ShopDetailsContent/OverviewTab.tsx`

- Address grid `grid-cols-2` — fine at tablet.
- Directions button `h-12` — good.

#### `src/components/shop/ShopDetailsContent/ReviewsTab.tsx`

- Score card `grid-cols-[110px_1fr]` — fine.
- Review skeleton `w-7 h-7` avatar — fine.
- "Viết đánh giá" `h-8.5` — bump `h-9 md:h-8.5`.

#### `src/components/shop/ShopDetailsContent/PhotosTab.tsx`

- `grid-cols-3 gap-2.5` — on tablet portrait, consider `grid-cols-3 md:grid-cols-4`.

#### `src/components/shop/ReviewModal.tsx`

- `max-w-md` — on tablet portrait, fine. On mobile at 320px, `w-full` via dialog default.
- Star buttons `p-1` + `size={24}` → effective 32px — bump to `p-1.5` for 36px, and add invisible wrapper for 44px.
- Textarea `rows={4}` — fine.

#### `src/components/shop/ShopDetailClient.tsx` (standalone page)

- Bottom bar `grid-cols-5` — on 320px, 5 buttons at ~56px each — tight but workable. **Consider `grid-cols-3 sm:grid-cols-5`** for 320–374px, or hide labels on smallest.
- Labels use `hidden sm:inline` — good.

---

### 4.5 Profile & Settings

#### `app/(main)/profile/ProfileClient.tsx`

- Stats grid `grid-cols-3` — fine.
- Tabs `gap-6 sm:gap-8` — verify no overflow at 320px (labels: "Đánh giá của tôi" is long). **Add `overflow-x-auto no-scrollbar`.**
- Saved grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — add `md:grid-cols-3` so tablet portrait gets 3 cols? No — 2 cols at tablet portrait is more readable. Keep `sm:grid-cols-2 md:grid-cols-3`.
- Visited grid: same.
- Edit button `h-8 sm:h-9` — fine.

#### `app/(main)/settings/SettingsClient.tsx`

- `max-w-2xl mx-auto` — fine for tablet.
- Rows `flex justify-between` — verify label + control don't collide at 320px (e.g., "Chế độ tối (Dark Mode)" + switch). Add `gap-3` and `min-w-0 truncate` on labels.
- Select `w-36` — on 320px with label, might overflow. Consider `w-28 sm:w-36`.

#### `src/components/profile/BadgeCard.tsx`

- Category badges `grid-cols-1 sm:grid-cols-3` — fine.

#### `src/components/profile/EditProfileDialog.tsx`

- Avatar `w-20 h-20 sm:w-24 sm:h-24` — fine.
- Dialog `max-w-md` — fine.

---

### 4.6 Auth Pages

#### `app/(auth)/layout.tsx`

- `md:grid-cols-2` — tablet portrait (768–1023) gets 2-column with hero panel — good, but verify hero panel isn't too cramped. Consider `lg:grid-cols-2` instead (single column at tablet portrait).
- Hero illustration `w-16 h-16` — fine.

**Refactor:** Change `md:grid-cols-2` → `lg:grid-cols-2`. Tablet portrait uses single column centered form.

#### `app/(auth)/login/page.tsx`, `signup`, `forgot-password`, `reset-password`

- Inputs `h-11` — good.
- Buttons `h-11` — good.
- Google button — fine.

---

### 4.7 Admin

#### `app/(main)/admin/page.tsx`

- Tabs `gap-4 sm:gap-6` — verify no overflow at 320px. **Add `overflow-x-auto no-scrollbar`.**
- Cards `p-3.5 sm:p-4` — fine.
- Reject dialog textarea — fine.

#### `src/components/admin/AdminSuggestionCard.tsx`

- Diff rows `flex flex-wrap items-center gap-2` — verify at 320px (label + from + arrow + to).
- Approve/Reject buttons `h-8 px-3.5` — bump `h-9 md:h-8`.

#### `src/components/admin/AdminShopCard.tsx`

- Thumbnail `w-20 h-20` — fine.
- Bottom row: `flex-wrap` already present — good.

---

### 4.8 Common / UI Primitives

#### `src/components/ui/dialog.tsx`

- Default `max-w-lg` — fine.
- Add responsive padding: `p-6` → `p-4 sm:p-6`.

#### `src/components/ui/sheet.tsx`

- `side="bottom"` content: add `max-h-[85vh]` default and `safe-bottom`.
- `side="right"` content: `w-3/4 sm:max-w-sm` — tablet portrait at 768px → 576px wide panel = 75%. Consider `sm:w-96 sm:max-w-md`.

#### `src/components/ui/alert-dialog.tsx`

- `max-w-lg` — fine.
- Padding responsive.

#### `src/components/common/LoadingSkeleton.tsx`

- `CardSkeleton` uses same grid classes as BentoGrid — **must mirror BentoGrid changes** so skeletons don't jump.
- `DetailSkeleton` bottom bar `grid-cols-4` — mirrors ShopDetailClient's `grid-cols-5`? **Mismatch!** Detail skeleton shows 4 buttons, actual shows 5. Fix to match.

#### `src/components/common/EmptyState.tsx`

- `p-8` — reduce to `p-6 sm:p-8`.
- Illustration `size={150}` — make responsive via CSS.

#### `src/components/common/ImageOverlayModal.tsx`

- Image `max-h-[76vh] max-w-[92vw]` — good.
- Thumbnail strip `h-12 w-12` — fine.
- Close button `h-11 w-11` — good.

#### `src/components/common/SyncIndicator.tsx`

- Position `bottom-20 md:bottom-6 left-4` — add safe-area offset for mobile.

---

### 4.9 Notification

#### `src/components/layout/NotificationBell.tsx`

- Dropdown `w-80 sm:w-96 max-w-[calc(100vw-2rem)]` — good.

#### `src/components/layout/NotificationItem.tsx`

- Delete button `p-1` — expand tap zone.
- Text `text-xs`/`text-[11px]` — bump.

---

## 5. Page-Level QA Matrix

| Page            | Mobile (320–639)                              | Tablet Portrait (640–1023)                                 | Tablet Landscape (1024–1279)      |
| --------------- | --------------------------------------------- | ---------------------------------------------------------- | --------------------------------- |
| `/` Discover    | 2-col bento, floating filter above bottom nav | 2-col (640–767) → 3-col (768–1023), floating filter docked | 4-col bento, filter bar sticky    |
| `/map`          | Bottom sheet filter + drawer                  | Bottom sheet, wider drawer                                 | Right sidebar + persistent filter |
| `/shop/[id]`    | Full-bleed, bottom bar 3–5 btns               | Centered max-w-3xl                                         | Centered max-w-4xl                |
| `/favorites`    | 1-col list                                    | 2-col grid                                                 | 3-col grid                        |
| `/profile`      | 1-col tabs, 1-col cards                       | 3-col stats, 2-col cards                                   | 3-col cards                       |
| `/settings`     | 1-col cards                                   | max-w-2xl centered                                         | max-w-2xl centered                |
| `/login` etc.   | Single form                                   | Single form (after refactor)                               | 2-col hero + form                 |
| `/admin`        | 1-col cards, scrollable tabs                  | 2-col cards                                                | 2-col cards                       |
| `/u/[username]` | 1-col                                         | 2-col reviews                                              | 2-col reviews                     |

---

## 6. Implementation Phases

### Phase 0 — Foundations (½ day)

1. Update `viewport` (`viewportFit: 'cover'`).
2. Add `.safe-bottom`, `.safe-top`, `.tap-target` to `globals.css`.
3. Add `overflow-x: clip` globally.
4. Audit & fix `MainContent` max-width ladder.

### Phase 1 — Shell & Navigation (1 day)

1. `Header` search field + autocomplete responsive widths.
2. `BottomNav` safe-area + label sizing.
3. `SyncIndicator` positioning.
4. `LoadingSkeleton` grid parity with `BentoGrid` + fix DetailSkeleton button count.

### Phase 2 — Discover & Bento (1.5 days)

1. `BentoGrid` column ladder.
2. All four `ShopCard*` — media aspect ratios, touch targets, text sizes.
3. `FilterChips` + `FloatingFilterBar` tap targets.
4. `SearchBar` responsive placeholder.
5. `DiscoverClient` FAB safe-area, empty-state button size.

### Phase 3 — Map (1.5 days)

1. `MapClient` filter sheet → conditional `side` by breakpoint.
2. FAB offsets with safe-area.
3. `LeafletMapInner` controls reposition.
4. `ShopSidebar` width ladder.
5. `ShopDrawer` max-width ladder.

### Phase 4 — Shop Details (1 day)

1. `TabBar` tap targets.
2. `Gallery` aspect ratios.
3. `OverviewTab`, `ReviewsTab`, `PhotosTab`, `AmenitiesTab` responsive grids.
4. `ReviewModal` star targets.
5. `ShopDetailClient` bottom bar → `grid-cols-3 sm:grid-cols-5`.
6. `VisitNoteDialog`, `SuggestEditDialog`, `DeleteShopDialog` responsive widths.

### Phase 5 — Profile, Settings, Auth, Admin (1 day)

1. `ProfileClient` tabs scroll + grid ladders.
2. `SettingsClient` row layout.
3. Auth `layout.tsx` → `lg:grid-cols-2`.
4. Admin tabs scroll + card padding.

### Phase 6 — Verification (1 day)

1. Manual QA on device emulators (Chrome DevTools: iPhone SE, iPhone 14, iPad Mini, iPad Pro portrait/landscape).
2. Playwright viewport matrix additions.
3. Lighthouse mobile audit.
4. Fix regressions.

---

## 7. Testing & QA

### 7.1 Automated

Extend Playwright config with viewport projects:

```ts
projects: [
  { name: 'mobile-320', use: { ...devices['iPhone SE'] } },
  { name: 'mobile-390', use: { ...devices['iPhone 14'] } },
  { name: 'tablet-768', use: { ...devices['iPad Mini'] } },
  { name: 'tablet-1024', use: { ...devices['iPad Pro 11'] } },
  { name: 'desktop', use: { ...devices['Desktop Chrome'] } }
];
```

Add assertions to key specs:

- No horizontal scroll: `expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewportWidth)`.
- Tap targets: assert `getBoundingClientRect().height >= 44` on primary CTAs at `< md`.
- Bottom nav not overlapping FAB: check bounding boxes.

### 7.2 Manual Checklist (per page)

- [ ] No horizontal overflow at 320/375/414/768/1024.
- [ ] All interactive elements ≥ 44px tap area on mobile.
- [ ] Bottom sheets respect safe-area and don't cover essential controls.
- [ ] Text ≥ 12px effective on mobile (no `text-[10px]` below `sm:`).
- [ ] Orientation change doesn't break layout.
- [ ] Sticky/floating elements don't stack on top of each other.
- [ ] Keyboard-open state doesn't hide inputs (mobile).
- [ ] Images maintain aspect ratio without stretching.

### 7.3 Accessibility

- WCAG 2.5.5 (Target Size) — 44×44px.
- WCAG 2.5.8 (Target Size Minimum) — 24×24px absolute floor.
- Contrast on `text-[10px]` elements under all themes.
- `prefers-reduced-motion` disables animations.

---

## 8. Acceptance Criteria

1. **No horizontal scroll** on any page at 320px width.
2. **All tap targets ≥ 44×44px** on `< md` breakpoint (verified via automated test).
3. **Tablet portrait (768px)** renders every page without dead zones or awkward mid-widths.
4. **Tablet landscape (1024px)** renders map sidebar, not bottom drawer.
5. **Safe-area insets** respected on iPhone 14 Pro / notched devices — BottomNav, FABs, drawers.
6. **Text minimum** `text-xs` (12px) on mobile for all readable content (no `text-[10px]`).
7. **Skeleton grids match** the actual grid column counts at every breakpoint (no layout shift on load).
8. **Lighthouse mobile** Performance ≥ 90, Accessibility ≥ 95.
9. **No regressions** on desktop ≥ 1280px (existing Playwright desktop suite passes).
10. **CI green**: lint + tsc + vitest + e2e all pass on the expanded viewport matrix.

---

## 9. Risks & Rollback

| Risk                                                                               | Mitigation                                                                                   |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Changing `md:` semantics affects both tablet portrait and small laptop             | Restrict changes to specific components; run desktop visual regression first                 |
| `BentoGrid` column change alters card sizing probabilities                         | `generateCardSizes` is independent of columns — verify layout-balancing still holds visually |
| `viewportFit: 'cover'` may alter existing layout on non-notched devices            | Test on both; `env()` returns 0 when no notch, so fallback `max(...)` handles it             |
| Converting filter bottom sheet to right sheet at `lg:` may confuse returning users | Gate behind `useMediaQuery` with a `// RESPONSIVE:` comment; keep behavior toggle-able       |
| Tap-target expansion may cause visual density loss on desktop                      | Use `md:` overrides to restore compact sizes on ≥ md                                         |

**Rollback:** All changes are presentational. Revert via `git revert` per-phase. No DB migrations, no API changes.

---

## 10. File Touch List (Quick Reference)

**Foundations**

- `app/layout.tsx`
- `app/globals.css`

**Layout**

- `src/components/layout/Header.tsx`
- `src/components/layout/BottomNav.tsx`
- `src/components/layout/MainContent.tsx`
- `src/components/layout/NotificationBell.tsx`
- `src/components/layout/NotificationItem.tsx`

**Discover**

- `src/components/bento/BentoGrid.tsx`
- `src/components/bento/ShopCardSmall.tsx`
- `src/components/bento/ShopCardMedium.tsx`
- `src/components/bento/ShopCardLarge.tsx`
- `src/components/bento/ShopCardFeatured.tsx`
- `src/components/bento/FilterChips.tsx`
- `src/components/bento/FloatingFilterBar.tsx`
- `src/components/bento/SearchBar.tsx`
- `src/components/bento/InfiniteScroll.tsx`
- `app/(main)/DiscoverClient.tsx`

**Map**

- `app/(main)/map/MapClient.tsx`
- `src/components/map/LeafletMapInner.tsx`
- `src/components/shop/ShopSidebar.tsx`
- `src/components/shop/ShopDrawer.tsx`

**Shop Details**

- `src/components/shop/ShopDetailsContent/*` (TabBar, Gallery, Header, OverviewTab, ReviewsTab, PhotosTab, AmenitiesTab, ReviewCard, SchedulePanel)
- `src/components/shop/ReviewModal.tsx`
- `src/components/shop/VisitNoteDialog.tsx`
- `src/components/shop/SuggestEditDialog.tsx`
- `src/components/shop/ShopDetailsContent/DeleteShopDialog.tsx`
- `app/(main)/shop/[id]/ShopDetailClient.tsx`
- `src/components/shop/FavoriteShopCard.tsx`
- `src/components/shop/AddShopDialog/*`

**Profile / Settings / Auth / Admin**

- `app/(main)/profile/ProfileClient.tsx`
- `app/(main)/settings/SettingsClient.tsx`
- `src/components/profile/*`
- `app/(auth)/layout.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/reset-password/page.tsx`
- `app/(main)/admin/page.tsx`
- `src/components/admin/AdminShopCard.tsx`
- `src/components/admin/AdminSuggestionCard.tsx`
- `src/components/admin/AdminSkeletonList.tsx`

**Common / UI**

- `src/components/ui/dialog.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/sonner.tsx`
- `src/components/common/LoadingSkeleton.tsx`
- `src/components/common/EmptyState.tsx`
- `src/components/common/ImageOverlayModal.tsx`
- `src/components/common/SyncIndicator.tsx`

**Tests**

- `playwright.config.ts`
- `e2e/*.spec.ts` (add viewport projects + assertions)

---

## 11. Effort Estimate

| Phase                           | Effort | Cumulative |
| ------------------------------- | ------ | ---------- |
| 0 — Foundations                 | 0.5 d  | 0.5 d      |
| 1 — Shell                       | 1 d    | 1.5 d      |
| 2 — Discover                    | 1.5 d  | 3 d        |
| 3 — Map                         | 1.5 d  | 4.5 d      |
| 4 — Shop Details                | 1 d    | 5.5 d      |
| 5 — Profile/Settings/Auth/Admin | 1 d    | 6.5 d      |
| 6 — Verification                | 1 d    | 7.5 d      |

**Total:** ~7.5 engineering days for a single developer. Parallelizable across two developers (front-half / back-half) to ~4.5 days.

---

Ready to proceed with implementation. Recommend starting with **Phase 0 + Phase 1** as a single PR to lock foundations before touching feature components.
