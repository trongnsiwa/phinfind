# ☕ PhinFind - Complete Design System Guide

_A Progressive Web Application for discovering the best coffee shops wherever you are_

---

## 📋 Table of Contents

- [Design Philosophy](#design-philosophy)
- [Brand Identity](#brand-identity)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Iconography](#iconography)
- [Component Library](#component-library)
- [Page Templates](#page-templates)
- [UI Patterns & Interactions](#ui-patterns--interactions)
- [Micro-interactions & Motion](#micro-interactions--motion)
- [Responsive Breakpoints](#responsive-breakpoints)
- [Accessibility](#accessibility)
- [Design Assets](#design-assets)
- [Implementation Guidelines](#implementation-guidelines)

---

## 🎯 Design Philosophy

### The PhinFind Ethos

**"Authentic Discovery, Vietnamese Soul"**

PhinFind bridges the gap between modern convenience and Vietnamese coffee culture. The design should feel:

| Quality                 | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| **Warm & Inviting**     | Like stepping into a cozy neighborhood café                  |
| **Culturally Rooted**   | Celebrating Vietnamese coffee traditions (the _phin_ filter) |
| **Effortlessly Modern** | Clean, minimal, and built for mobile-first experiences       |
| **Trustworthy**         | A reliable guide for coffee explorers                        |
| **Delightful**          | Small moments of joy in every interaction                    |

### Design Principles

1. **Mobile-First, Always**
   - Design for the smallest screen first
   - Thumb-friendly interactions
   - Offline-first where possible

2. **Clarity Over Cleverness**
   - Users should never wonder "What do I do?"
   - Information hierarchy is paramount
   - Every element serves a purpose

3. **Authentic Connection**
   - Use warm, earthy tones inspired by Vietnamese coffee
   - Incorporate subtle nods to local culture
   - Make users feel like they're in good hands

4. **Performance as a Feature**
   - Every animation serves a purpose
   - Optimize for speed and smoothness
   - Progressive enhancement

---

## 🏷️ Brand Identity

### Logo

The PhinFind logo combines the iconic Vietnamese _phin_ filter with the concept of discovery.

```
┌─────────────────────────────────────────────────┐
│  ☕  PhinFind                                   │
│     Discover Vietnamese Coffee                 │
└─────────────────────────────────────────────────┘

Logo Variations:
┌─────────────────────────────────────────────────┐
│  ☕  PhinFind  (Full Logo - Primary)           │
│  ☕  (Icon-only - For favicon, app icon)       │
│  PhinFind  (Wordmark - For headers)           │
└─────────────────────────────────────────────────┘
```

### Logo Components

| Element       | Description                                  | Usage                        |
| ------------- | -------------------------------------------- | ---------------------------- |
| **Phin Icon** | Stylized Vietnamese coffee filter silhouette | Primary icon, favicon        |
| **Wordmark**  | Custom lettering with warm, rounded feel     | Headers, navigation          |
| **Tagline**   | "Discover Vietnamese Coffee"                 | Hero sections, splash screen |

### Brand Voice

| Attribute         | Description                          |
| ----------------- | ------------------------------------ |
| **Warm**          | Like a friendly barista greeting you |
| **Knowledgeable** | Trustworthy guide to coffee culture  |
| **Playful**       | Not too serious, never corporate     |
| **Authentic**     | Genuine love for Vietnamese coffee   |
| **Helpful**       | Always focused on user needs         |

### Tagline Options

- _"Discover Vietnamese Coffee"_
- _"Tìm Cà Phê Việt"_
- _"Your Guide to Vietnamese Coffee"_
- _"Khám Phá Cà Phê Việt"_

---

## 🎨 Color System

### Primary Palette

PhinFind's colors are inspired by the rich, warm tones of Vietnamese coffee culture.

```
Primary Colors:

🟤 Coffee Brown
HEX: #6F4E37
RGB: 111, 78, 55
HSL: 25°, 34%, 33%
Usage: Primary buttons, headers, key elements

🟠 Caramel
HEX: #D48B5C
RGB: 212, 139, 92
HSL: 25°, 58%, 60%
Usage: Accent elements, highlights, hover states

🟡 Golden Milk
HEX: #F5E6D3
RGB: 245, 230, 211
HSL: 34°, 63%, 89%
Usage: Backgrounds, cards, soft surfaces

⬜ Cream
HEX: #FAF7F2
RGB: 250, 247, 242
HSL: 38°, 44%, 96%
Usage: Main background, light surfaces

🟤 Dark Roast
HEX: #2C1810
RGB: 44, 24, 16
HSL: 17°, 47%, 12%
Usage: Dark text, dark mode elements
```

### Semantic Palette

```
Success (Open Now):
HEX: #7BA05B
RGB: 123, 160, 91
HSL: 96°, 27%, 49%

Warning (Closing Soon):
HEX: #E8A838
RGB: 232, 168, 56
HSL: 38°, 79%, 56%

Error (Closed):
HEX: #C75B5B
RGB: 199, 91, 91
HSL: 0°, 49%, 57%

Info (Directions/Help):
HEX: #4A8DB7
RGB: 74, 141, 183
HSL: 203°, 43%, 50%
```

### Surface Colors

```
Background: #FAF7F2 (Cream)
Card Background: #FFFFFF (White)
Card Border: #F5E6D3 (Golden Milk)
Hover State: #F5E6D3 (Golden Milk)
Active State: #D48B5C (Caramel)
```

### Color Usage Guidelines

| Element            | Color                  | Notes                      |
| ------------------ | ---------------------- | -------------------------- |
| **Primary CTAs**   | Coffee Brown (#6F4E37) | High contrast, warm        |
| **Secondary CTAs** | Caramel (#D48B5C)      | For less important actions |
| **Links**          | Coffee Brown (#6F4E37) | Underline on hover         |
| **Headings**       | Dark Roast (#2C1810)   | Maximum readability        |
| **Body Text**      | Dark Roast (#2C1810)   | 90% opacity for comfort    |
| **Subtle Text**    | #6F4E37                | 60% opacity                |
| **Success Text**   | #7BA05B                | Open status                |
| **Error Text**     | #C75B5B                | Closed status              |
| **Cards**          | White (#FFFFFF)        | On cream background        |

---

## ✍️ Typography

### Font Family

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-display: 'Playfair Display', Georgia, serif;
```

| Font                 | Use Case                           | Weight             |
| -------------------- | ---------------------------------- | ------------------ |
| **Inter**            | Body text, UI elements, navigation | 400, 500, 600, 700 |
| **Playfair Display** | Headings, logo, hero text          | 700, 900           |

### Type Scale

```
Desktop (Base 16px):
──────────────────────────────────────────────
Display 1:    48px / 3rem   Playfair 900
Display 2:    36px / 2.25rem Playfair 700
Display 3:    30px / 1.875rem Playfair 700

Heading 1:    28px / 1.75rem Inter 700
Heading 2:    24px / 1.5rem  Inter 600
Heading 3:    20px / 1.25rem Inter 600
Heading 4:    18px / 1.125rem Inter 600

Body Large:   16px / 1rem   Inter 400
Body:         14px / 0.875rem Inter 400
Small:        12px / 0.75rem Inter 400
Caption:      11px / 0.6875rem Inter 500

Mobile (Base 14px):
──────────────────────────────────────────────
Display 1:    32px / 2rem   Playfair 900
Display 2:    28px / 1.75rem Playfair 700
Heading 1:    24px / 1.5rem  Inter 700
Heading 2:    20px / 1.25rem Inter 600
Heading 3:    18px / 1.125rem Inter 600
Body:         14px / 0.875rem Inter 400
Small:        12px / 0.75rem Inter 400
```

### Type Styles

```css
/* Headings */
.heading-display-1 {
  font-family: 'Playfair Display', serif;
  font-size: 48px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.heading-display-2 {
  font-family: 'Playfair Display', serif;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.3;
}

/* Body */
.body-large {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
}

.body {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
}

.body-small {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
}

/* Labels */
.label {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.caption {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
```

### Responsive Typography

```css
/* Mobile First */
html {
  font-size: 14px;
}

/* Tablet */
@media (min-width: 768px) {
  html {
    font-size: 15px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  html {
    font-size: 16px;
  }
}
```

---

## 📐 Spacing & Layout

### Spacing Scale

```
Based on 4px grid:
──────────────────────────────────────────────
--space-1:  4px   (0.25rem)
--space-2:  8px   (0.5rem)
--space-3:  12px  (0.75rem)
--space-4:  16px  (1rem)
--space-5:  24px  (1.5rem)
--space-6:  32px  (2rem)
--space-7:  48px  (3rem)
--space-8:  64px  (4rem)
--space-9:  96px  (6rem)
```

### Layout Grid

```
Mobile (320px - 767px):
┌─────────────────────────────────┐
│  16px padding                   │
│  ┌─────────────────────────┐   │
│  │   Content Area          │   │
│  │   (Full width - 32px)   │   │
│  └─────────────────────────┘   │
│  16px padding                   │
└─────────────────────────────────┘

Tablet (768px - 1023px):
┌─────────────────────────────────┐
│  24px padding                   │
│  ┌─────────────────────────┐   │
│  │   Content Area          │   │
│  │   (Max: 704px)          │   │
│  └─────────────────────────┘   │
│  24px padding                   │
└─────────────────────────────────┘

Desktop (1024px+):
┌─────────────────────────────────┐
│  32px padding                   │
│  ┌─────────────────────────┐   │
│  │   Content Area          │   │
│  │   (Max: 1200px)         │   │
│  └─────────────────────────┘   │
│  32px padding                   │
└─────────────────────────────────┘
```

### Component Spacing

| Component      | Padding | Margin | Gap  |
| -------------- | ------- | ------ | ---- |
| **Card**       | 16-24px | 12px   | -    |
| **Button**     | 8-12px  | 4px    | -    |
| **Section**    | 24-32px | -      | -    |
| **List**       | -       | -      | 12px |
| **Form Group** | -       | -      | 8px  |
| **Grid**       | -       | -      | 16px |

---

## 🎨 Iconography

### Icon Library

Primary icon set: **Lucide React**

```
Core Icons:
──────────────────────────────────────────────
📍 Map Pin        ☕ Coffee
🔍 Search         ⭐ Star
📋 List           💰 Price
🧭 Compass        🕐 Clock
👤 User           ❤️ Heart (Favorite)
📱 Phone          🌐 Globe
📧 Email          🔒 Lock
📌 Pin            🏷️ Tag
🔔 Bell           ⚙️ Settings
➡️ Arrow          📍 Location
🚪 Door           📸 Camera
🍴 Fork           🥤 Drink
📊 Chart          📈 Trending
```

### Custom Icons

PhinFind-specific icons:

```
☕ Phin Icon (Custom):
Stylized Vietnamese coffee filter

📍 Coffee Shop Marker:
Coffee cup icon with location dot

🏠 Home Marker:
House with coffee cup

⭐ Verified Badge:
Star with checkmark

🟢 Open Indicator:
Green circle with checkmark

🔴 Closed Indicator:
Red circle with X
```

### Icon Sizes

```
Small:  16px (16×16)  - Inline with text
Medium: 24px (24×24)  - Buttons, navigation
Large:  32px (32×32)  - Feature icons
XLarge: 48px (48×48)  - Hero icons
```

### Icon Usage Guidelines

- Maintain consistent stroke width (2px)
- Use rounded corners for friendly feel
- Color should match text context or be semantic
- Always include accessible labels

---

## 🧩 Component Library

### 1. Buttons

```html
<!-- Primary Button -->
<button class="btn btn-primary">Find Coffee Near Me</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Save to Favorites</button>

<!-- Ghost Button -->
<button class="btn btn-ghost">Learn More</button>

<!-- Icon Button -->
<button class="btn btn-icon">
  <Heart size="{20}" />
</button>

<!-- Loading State -->
<button class="btn btn-primary" disabled><Spinner /> Loading...</button>
```

#### Button States

| State        | Primary | Secondary | Ghost       |
| ------------ | ------- | --------- | ----------- |
| **Default**  | #6F4E37 | #D48B5C   | Transparent |
| **Hover**    | #5A3E2E | #C47A4A   | #F5E6D3     |
| **Active**   | #4D3427 | #B86B3F   | #E8D5C0     |
| **Disabled** | #A8988E | #D4C4B8   | Transparent |

### 2. Cards

```html
<!-- Shop Card -->
<div class="card card-shop">
  <div class="card-image">
    <img src="shop-photo.jpg" alt="Coffee shop" />
    <span class="card-badge">Open Now</span>
  </div>
  <div class="card-content">
    <h3 class="card-title">Brew & Bloom</h3>
    <p class="card-subtitle">📍 2.3 km · ⭐ 4.8 (234 reviews)</p>
    <p class="card-description">Artisan coffee roaster...</p>
    <div class="card-actions">
      <button class="btn btn-primary btn-sm">Directions</button>
      <button class="btn btn-ghost btn-sm">Save</button>
    </div>
  </div>
</div>
```

### 3. Input Fields

```html
<!-- Text Input -->
<div class="form-group">
  <label class="form-label">Search for coffee</label>
  <input type="text" class="form-input" placeholder="e.g., Brew & Bloom" />
  <p class="form-hint">Find by name, location, or style</p>
</div>

<!-- Search Input -->
<div class="search-bar">
  <search size="{20}" />
  <input type="text" placeholder="Search coffee shops..." />
  <button class="btn btn-primary">Search</button>
</div>

<!-- Select -->
<div class="form-group">
  <label class="form-label">Filter by</label>
  <select class="form-select">
    <option>Distance</option>
    <option>Rating</option>
    <option>Price</option>
  </select>
</div>
```

### 4. Navigation

```html
<!-- Bottom Navigation (Mobile) -->
<nav class="bottom-nav">
  <a href="/" class="nav-item active">
    <map size="{24}" />
    <span>Discover</span>
  </a>
  <a href="/favorites" class="nav-item">
    <Heart size="{24}" />
    <span>Saved</span>
  </a>
  <a href="/profile" class="nav-item">
    <User size="{24}" />
    <span>Profile</span>
  </a>
</nav>

<!-- Top Navigation (Desktop) -->
<header class="top-nav">
  <div class="nav-left">
    <h1 class="logo">☕ PhinFind</h1>
  </div>
  <div class="nav-center">
    <input type="text" placeholder="Search..." />
  </div>
  <div class="nav-right">
    <button class="btn btn-ghost">Sign In</button>
    <button class="btn btn-primary">Sign Up</button>
  </div>
</header>
```

### 5. Shop Detail Components

```html
<!-- Shop Header -->
<div class="shop-header">
  <div class="shop-header-image">
    <img src="shop-cover.jpg" alt="Shop" />
    <button class="btn btn-ghost btn-back">←</button>
    <button class="btn btn-icon btn-favorite">❤️</button>
  </div>
  <div class="shop-header-content">
    <h1>Brew & Bloom</h1>
    <div class="shop-meta">
      <span class="badge badge-open">🟢 Open Now</span>
      <span class="price">💰 €€</span>
      <span class="rating">⭐ 4.8 (234)</span>
    </div>
  </div>
</div>

<!-- Shop Info -->
<div class="shop-info">
  <div class="info-item">
    <MapPin size="{20}" />
    <span>123 Main St, San Francisco</span>
  </div>
  <div class="info-item">
    <Phone size="{20}" />
    <span>(555) 123-4567</span>
  </div>
  <div class="info-item">
    <Globe size="{20}" />
    <a href="#">brewandbloom.com</a>
  </div>
  <div class="info-item">
    <Clock size="{20}" />
    <div>
      <span>Mon-Fri: 7:00 AM - 10:00 PM</span>
      <span>Sat-Sun: 8:00 AM - 9:00 PM</span>
    </div>
  </div>
</div>

<!-- Action Buttons -->
<div class="shop-actions">
  <button class="btn btn-primary btn-block">📍 Get Directions</button>
  <button class="btn btn-secondary btn-block">❤️ Save to Favorites</button>
</div>
```

### 6. Loading States

```html
<!-- Skeleton Loader -->
<div class="skeleton-loader">
  <div class="skeleton-image"></div>
  <div class="skeleton-title"></div>
  <div class="skeleton-text"></div>
  <div class="skeleton-text"></div>
</div>

<!-- Spinner -->
<div class="spinner-container">
  <div class="spinner"></div>
  <p>Finding coffee shops near you...</p>
</div>

<!-- Page Loader -->
<div class="page-loader">
  <div class="coffee-bean-loader">☕</div>
  <p>Brewing your results...</p>
</div>
```

### 7. Toasts & Notifications

```html
<!-- Success Toast -->
<div class="toast toast-success">
  <CheckCircle size="{20}" />
  <span>Shop saved to favorites!</span>
  <button class="btn btn-ghost btn-sm">View</button>
</div>

<!-- Error Toast -->
<div class="toast toast-error">
  <AlertCircle size="{20}" />
  <span>Unable to load shops. Please try again.</span>
  <button class="btn btn-ghost btn-sm">Retry</button>
</div>

<!-- Info Toast -->
<div class="toast toast-info">
  <Info size="{20}" />
  <span>Location permission required for best experience.</span>
  <button class="btn btn-primary btn-sm">Enable</button>
</div>
```

### 8. Modals

```html
<!-- Location Permission Modal -->
<div class="modal">
  <div class="modal-content">
    <div class="modal-icon">📍</div>
    <h2>Enable Location</h2>
    <p>PhinFind uses your location to find coffee shops near you.</p>
    <div class="modal-actions">
      <button class="btn btn-primary">Allow Location</button>
      <button class="btn btn-ghost">Skip for now</button>
    </div>
  </div>
</div>
```

---

## 📄 Page Templates

### 1. Home / Discover Page

```
┌─────────────────────────────────────────────────┐
│  ☕ PhinFind                                    │
│  Discover Vietnamese Coffee                    │
│                                                 │
│  ┌─────────────────────────────────┐          │
│  │  🔍 Search coffee shops...      │          │
│  └─────────────────────────────────┘          │
│                                                 │
│  [Map View] [List View]                        │
│                                                 │
│  ┌─────────────────────────────────┐          │
│  │  🗺️  MAP AREA                   │          │
│  │                                 │          │
│  │  ☕  ☕  ☕                     │          │
│  │     ☕   ☕                     │          │
│  │                                 │          │
│  └─────────────────────────────────┘          │
│                                                 │
│  ┌─────────────────────────────────┐          │
│  │  ☕ Brew & Bloom   ⭐ 4.8 🟢   │          │
│  │  📍 2.3 km · 123 Main St      │          │
│  │  [Directions] [Save]           │          │
│  └─────────────────────────────────┘          │
│  ┌─────────────────────────────────┐          │
│  │  ☕ Coffee Haven   ⭐ 4.6 🟢   │          │
│  │  📍 1.2 km · 456 Oak Ave      │          │
│  │  [Directions] [Save]           │          │
│  └─────────────────────────────────┘          │
│                                                 │
│  [Bottom Navigation: Discover | Saved | Profile]│
└─────────────────────────────────────────────────┘
```

### 2. Shop Detail Page

```
┌─────────────────────────────────────────────────┐
│  ← Back         ❤️ Save                        │
│  ┌─────────────────────────────────┐          │
│  │  📸 SHOP COVER PHOTO            │          │
│  └─────────────────────────────────┘          │
│                                                 │
│  ☕ Brew & Bloom                                │
│  🟢 Open Now · 💰 €€ · ⭐ 4.8 (234)          │
│                                                 │
│  📍 123 Main St, San Francisco                 │
│  📞 (555) 123-4567                            │
│  🌐 brewandbloom.com                          │
│  🕐 Mon-Fri: 7AM - 10PM                      │
│  🕐 Sat-Sun: 8AM - 9PM                       │
│                                                 │
│  ┌─────────────────────────────────┐          │
│  │  📍 Get Directions              │          │
│  └─────────────────────────────────┘          │
│  ┌─────────────────────────────────┐          │
│  │  ❤️ Save to Favorites           │          │
│  └─────────────────────────────────┘          │
│                                                 │
│  About this place:                             │
│  Artisan coffee roaster serving specialty...  │
│                                                 │
│  📸 Photos                                      │
│  [img] [img] [img] [img]                      │
└─────────────────────────────────────────────────┘
```

### 3. Favorites Page

```
┌─────────────────────────────────────────────────┐
│  ❤️ My Favorites                               │
│                                                 │
│  ┌─────────────────────────────────┐          │
│  │  ☕ Brew & Bloom   ⭐ 4.8 🟢   │          │
│  │  📍 2.3 km · 123 Main St      │          │
│  │  [Remove] [Directions]         │          │
│  └─────────────────────────────────┘          │
│  ┌─────────────────────────────────┐          │
│  │  ☕ Coffee Haven   ⭐ 4.6 🟢   │          │
│  │  📍 1.2 km · 456 Oak Ave      │          │
│  │  [Remove] [Directions]         │          │
│  └─────────────────────────────────┘          │
│                                                 │
│  [Bottom Navigation: Discover | Saved | Profile]│
└─────────────────────────────────────────────────┘
```

---

## 🎭 UI Patterns & Interactions

### 1. Map Interactions

| Interaction          | Behavior                | Feedback                   |
| -------------------- | ----------------------- | -------------------------- |
| **Tap/Pan Map**      | Move around the map     | Smooth pan animation       |
| **Tap Marker**       | Show shop popup         | Bounce animation + popup   |
| **Tap Popup**        | Navigate to shop detail | Slide transition           |
| **Zoom In/Out**      | Zoom map view           | Smooth zoom animation      |
| **Current Location** | Center map on user      | Pulsing blue dot animation |

### 2. List Interactions

| Interaction        | Behavior             | Feedback                       |
| ------------------ | -------------------- | ------------------------------ |
| **Scroll**         | Scroll through list  | Smooth scroll with inertia     |
| **Tap Card**       | Navigate to detail   | Press state + slide transition |
| **Swipe (Mobile)** | Toggle map/list view | Slide transition               |
| **Long Press**     | Quick actions menu   | Haptic feedback (mobile)       |

### 3. Search & Filter

| Interaction      | Behavior            | Feedback                       |
| ---------------- | ------------------- | ------------------------------ |
| **Type Search**  | Real-time filtering | Debounced results              |
| **Apply Filter** | Update results      | Loading skeleton + new results |
| **Clear Search** | Reset results       | Smooth transition              |

### 4. Favorites

| Interaction         | Behavior         | Feedback                        |
| ------------------- | ---------------- | ------------------------------- |
| **Tap Heart**       | Save/unsave shop | Heart animation (scale + color) |
| **View Favorites**  | Navigate to list | Slide transition                |
| **Remove Favorite** | Remove from list | Fade out animation              |

---

## 🎬 Micro-interactions & Motion

### Animation Principles

1. **Purposeful**: Every animation has a reason
2. **Subtle**: 200-400ms, never distracting
3. **Responsive**: Fast and snappy
4. **Consistent**: Same timing across similar interactions

### Animation Specifications

```css
/* Duration */
--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 400ms;

/* Easing */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Common Animations

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Slide Up */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Heart Pop */
@keyframes heartPop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
}

/* Loading Pulse */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Map Marker Bounce */
@keyframes markerBounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
```

### Micro-interaction Examples

```html
<!-- Heart Toggle Animation -->
<button class="favorite-btn" onclick="toggleHeart()">
  <Heart class="heart-icon" />
</button>

<style>
  .heart-icon {
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .heart-icon.active {
    transform: scale(1.2);
    fill: #c75b5b;
    color: #c75b5b;
  }
</style>

<!-- Card Hover Animation -->
<style>
  .card {
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(111, 78, 55, 0.12);
  }
</style>

<!-- Page Transition -->
<style>
  .page-enter {
    animation: slideUp 0.3s ease-out;
  }
</style>
```

---

## 📱 Responsive Breakpoints

### Device Breakpoints

```
Mobile:     320px - 767px   (Thumb-friendly, single column)
Tablet:     768px - 1023px  (Two-column layout)
Desktop:    1024px - 1279px (Three-column layout)
Large:      1280px+         (Four-column layout)
```

### Responsive Design Patterns

| Element        | Mobile                  | Tablet         | Desktop       |
| -------------- | ----------------------- | -------------- | ------------- |
| **Layout**     | Single column           | Two columns    | Three columns |
| **Navigation** | Bottom tabs             | Top nav + side | Full header   |
| **Map**        | Full width (50% height) | 60/40 split    | 70/30 split   |
| **Card Size**  | Full width              | 2 per row      | 3 per row     |
| **Font Size**  | 14px base               | 15px base      | 16px base     |
| **Padding**    | 16px                    | 24px           | 32px          |
| **Search**     | Icon only               | Expanded       | Full width    |

### Mobile-Specific Considerations

```
Thumb Zone (Right-handed):
──────────────────────────────────────────────
┌─────────────────────────────────────────┐
│  [Hard to reach]   [Hard to reach]     │
│  [Hard to reach]   [Hard to reach]     │
│  [Easy to reach]   [Easy to reach]     │
│  [Easy to reach]   [Easy to reach]     │
│  [Easy to reach]   [Easy to reach]     │
└─────────────────────────────────────────┘

Key Principles:
- Primary actions in bottom 50% of screen
- Minimum touch target: 44px × 44px
- Maximum touch target: 56px × 56px
```

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance

| Principle          | Implementation                              |
| ------------------ | ------------------------------------------- |
| **Perceivable**    | Alt text for images, proper contrast ratios |
| **Operable**       | Keyboard navigation, focus indicators       |
| **Understandable** | Clear labels, consistent navigation         |
| **Robust**         | Semantic HTML, ARIA labels                  |

### Color Contrast

```
All color combinations must meet WCAG AA:
──────────────────────────────────────────────
Text on Background: 4.5:1 minimum
Large Text: 3:1 minimum
UI Components: 3:1 minimum
```

| Combination                               | Contrast | Status                         |
| ----------------------------------------- | -------- | ------------------------------ |
| Coffee Brown (#6F4E37) on Cream (#FAF7F2) | 7.2:1    | ✅ Pass                        |
| Coffee Brown (#6F4E37) on White (#FFFFFF) | 8.5:1    | ✅ Pass                        |
| Dark Roast (#2C1810) on Cream (#FAF7F2)   | 14.1:1   | ✅ Pass                        |
| Caramel (#D48B5C) on White (#FFFFFF)      | 2.8:1    | ❌ Fail (use for accents only) |

### ARIA Labels

```html
<!-- Icon button with aria-label -->
<button aria-label="Save to favorites" class="btn btn-icon">
  <Heart />
</button>

<!-- Shop card with landmarks -->
<article role="article" aria-labelledby="shop-title">
  <h2 id="shop-title">Brew & Bloom</h2>
</article>

<!-- Loading state -->
<div role="status" aria-live="polite">Loading coffee shops...</div>

<!-- Error message -->
<div role="alert">Unable to load shops. Please try again.</div>
```

### Keyboard Navigation

```
Focus order should be logical and intuitive:

1. Skip to main content link
2. Navigation links
3. Search bar
4. Map or list content
5. Shop cards
6. Action buttons

Focus indicators must be visible:
- Outline: 2px solid #6F4E37
- Offset: 2px
- Border radius: 4px
```

### Screen Reader Support

```html
<!-- Hidden labels for screen readers -->
<span class="sr-only">Search for coffee shops</span>

<!-- Live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true">{{ searchResults }}</div>

<!-- Landmarks -->
<header role="banner">...</header>
<nav role="navigation">...</nav>
<main role="main">...</main>
<footer role="contentinfo">...</footer>
```

---

## 🎨 Design Assets

### Logo Assets

```
📁 assets/
  📁 logo/
    ├── phinfind-logo.svg          (Full logo, vector)
    ├── phinfind-icon.svg          (Icon only)
    ├── phinfind-wordmark.svg      (Wordmark only)
    ├── phinfind-logo-dark.svg     (Dark background version)
    ├── phinfind-logo-light.svg    (Light background version)
    └── phinfind-logo-preview.png  (Preview image)
```

### App Icons

```
📁 assets/
  📁 icons/
    ├── icon-192x192.png
    ├── icon-512x512.png
    ├── icon-maskable-192x192.png
    ├── icon-maskable-512x512.png
    ├── favicon.ico
    ├── apple-touch-icon.png
    └── splash-screen.png
```

### Marketing Assets

```
📁 assets/
  📁 marketing/
    ├── app-store-screenshot-1.png
    ├── app-store-screenshot-2.png
    ├── app-store-screenshot-3.png
    ├── play-store-screenshot-1.png
    ├── play-store-screenshot-2.png
    ├── play-store-screenshot-3.png
    ├── social-preview-1200x630.png
    ├── twitter-card.png
    └── google-play-badge.png
```

---

## 🛠️ Implementation Guidelines

### CSS Variables

```css
:root {
  /* Colors */
  --color-primary: #6f4e37;
  --color-primary-hover: #5a3e2e;
  --color-primary-active: #4d3427;
  --color-secondary: #d48b5c;
  --color-secondary-hover: #c47a4a;
  --color-background: #faf7f2;
  --color-surface: #ffffff;
  --color-surface-alt: #f5e6d3;
  --color-text: #2c1810;
  --color-text-secondary: #6f4e37;
  --color-text-subtle: #a8988e;

  --color-success: #7ba05b;
  --color-warning: #e8a838;
  --color-error: #c75b5b;
  --color-info: #4a8db7;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;

  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Playfair Display', Georgia, serif;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(111, 78, 55, 0.1);
  --shadow-lg: 0 8px 24px rgba(111, 78, 55, 0.15);
  --shadow-xl: 0 16px 48px rgba(111, 78, 55, 0.2);

  /* Transitions */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        phin: {
          50: '#FAF7F2',
          100: '#F5E6D3',
          200: '#E8D5C0',
          300: '#D4B8A0',
          400: '#C49A7A',
          500: '#D48B5C',
          600: '#B86B3F',
          700: '#8B5A3A',
          800: '#6F4E37',
          900: '#4D3427',
          950: '#2C1810'
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif']
      },
      borderRadius: {
        lg: '12px',
        xl: '16px'
      },
      boxShadow: {
        card: '0 2px 8px rgba(111, 78, 55, 0.08)',
        'card-hover': '0 8px 24px rgba(111, 78, 55, 0.12)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'heart-pop': 'heartPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-subtle': 'pulse 2s ease-in-out infinite',
        'marker-bounce': 'markerBounce 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        heartPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.4)' },
          '100%': { transform: 'scale(1)' }
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        },
        markerBounce: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' }
        }
      }
    }
  },
  plugins: []
};
```

### Component Structure (React/Next.js)

```typescript
// components/ui/Button.tsx
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-phin-800 text-white hover:bg-phin-900 active:bg-phin-950',
      secondary: 'bg-phin-500 text-white hover:bg-phin-600 active:bg-phin-700',
      ghost: 'hover:bg-phin-100 text-phin-800',
      danger: 'bg-error text-white hover:bg-error/90',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'rounded-xl font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-phin-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

### Utility Classes

```css
/* utilities.css */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .text-pretty {
    text-wrap: pretty;
  }

  .safe-top {
    padding-top: env(safe-area-inset-top);
  }

  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .no-tap-highlight {
    -webkit-tap-highlight-color: transparent;
  }

  .touch-manipulation {
    touch-action: manipulation;
  }
}
```

---

## 📚 Design Resources

### Figma Components

```
📁 Figma File: PhinFind Design System
  📁 Components
    ├── Buttons
    ├── Cards
    ├── Inputs
    ├── Navigation
    ├── Modals
    └── Icons
  📁 Pages
    ├── Home
    ├── Shop Detail
    ├── Favorites
    └── Profile
  📁 Styles
    ├── Colors
    ├── Typography
    └── Effects
```

### Design Tokens

```json
{
  "colors": {
    "primary": "#6F4E37",
    "secondary": "#D48B5C",
    "background": "#FAF7F2"
  },
  "typography": {
    "fontFamily": "Inter",
    "heading": "Playfair Display"
  },
  "spacing": {
    "base": 16,
    "scale": [4, 8, 12, 16, 24, 32, 48, 64]
  }
}
```

---

## 🚀 Launch Checklist

### Pre-Launch

- [ ] Design system fully implemented
- [ ] All components accessible (WCAG AA)
- [ ] Responsive testing on all devices
- [ ] Performance audit (Lighthouse ≥ 90)
- [ ] PWA installation works
- [ ] Error states and loading states implemented
- [ ] Analytics tracking set up
- [ ] SEO meta tags configured
- [ ] Social sharing images prepared

### Post-Launch

- [ ] Monitor user feedback
- [ ] Track key metrics
- [ ] A/B test key UI elements
- [ ] Iterate based on data
- [ ] Maintain design system documentation

---

_Happy designing! ☕ Let's make coffee discovery beautiful and intuitive._
