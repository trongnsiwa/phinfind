# PhinFind SEO Implementation Plan

**Document Version:** 1.0
**Target Codebase:** PhinFind (Next.js 16 App Router + Supabase)
**Created:** 2026-09-12
**Purpose:** Full SEO remediation plan for regression testing reference

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Audit](#2-current-state-audit)
3. [Implementation Phases](#3-implementation-phases)
4. [Phase 1 — Critical (P0)](#phase-1--critical-p0)
5. [Phase 2 — High Priority (P1)](#phase-2--high-priority-p1)
6. [Phase 3 — Medium Priority (P2)](#phase-3--medium-priority-p2)
7. [Phase 4 — Enhancements (P3)](#phase-4--enhancements-p3)
8. [Verification & Testing](#8-verification--testing)
9. [Rollback Plan](#9-rollback-plan)
10. [Regression Checklist](#10-regression-checklist)
11. [Appendix — Reference Code](#11-appendix--reference-code)

---

## 1. Executive Summary

### Objective

Improve PhinFind's search engine visibility, crawlability, and rich-result eligibility for Google and other search engines.

### Scope

- **In scope:** Sitemap, robots.txt, structured data (JSON-LD), per-page metadata, server/client component split, PWA cache strategy review
- **Out of scope:** Content strategy, backlink building, paid search, analytics integration

### Success Metrics

| Metric                                | Baseline               | Target             |
| ------------------------------------- | ---------------------- | ------------------ |
| Pages indexed by Google               | Unknown (no sitemap)   | All public pages   |
| Rich results (CafeOrCoffeeShop)       | 0                      | 100% of shop pages |
| Duplicate `<title>` tags              | ~6 pages share 1 title | 0                  |
| Lighthouse SEO score                  | Not measured           | ≥ 95               |
| Google Search Console coverage errors | Unknown                | 0 critical         |

### Effort Estimate

| Phase        | Est. Hours    | Risk   |
| ------------ | ------------- | ------ |
| Phase 1 (P0) | 6–8 hrs       | Low    |
| Phase 2 (P1) | 4–6 hrs       | Medium |
| Phase 3 (P2) | 3–4 hrs       | Low    |
| Phase 4 (P3) | 2–3 hrs       | Low    |
| **Total**    | **15–21 hrs** | —      |

---

## 2. Current State Audit

### 2.1 What Exists

| Item                                | Location                                          | Status     |
| ----------------------------------- | ------------------------------------------------- | ---------- |
| Root metadata                       | `app/layout.tsx`                                  | ✅ Present |
| Shop detail dynamic metadata        | `app/(main)/shop/[id]/page.tsx`                   | ✅ Present |
| Canonical URL (shop detail only)    | `app/(main)/shop/[id]/page.tsx`                   | ✅ Present |
| PWA manifest                        | `public/manifest.json`, `public/site.webmanifest` | ✅ Present |
| OG/Twitter cards (shop detail only) | `app/(main)/shop/[id]/page.tsx`                   | ✅ Present |
| Server-side shop fetch (`cache()`)  | `src/lib/supabase/shop-detail.ts`                 | ✅ Present |
| `not-found.tsx` for shop            | `app/(main)/shop/[id]/not-found.tsx`              | ✅ Present |

### 2.2 What's Missing

| Item                                                        | Impact                                    | Severity    |
| ----------------------------------------------------------- | ----------------------------------------- | ----------- |
| `app/sitemap.ts`                                            | Google must discover pages via links only | 🔴 Critical |
| `app/robots.ts`                                             | No crawl guidance; `/api/` may be crawled | 🔴 Critical |
| JSON-LD structured data                                     | No rich results (stars, location, price)  | 🔴 Critical |
| Per-page metadata (home, map, favorites, profile, settings) | Duplicate titles/descriptions             | 🟡 High     |
| `'use client'` on home page                                 | Content rendered client-side only         | 🟡 High     |
| PWA SW page caching                                         | Potential stale HTML served to crawlers   | 🟡 Medium   |
| `keywords` metadata                                         | Weak topical signals                      | 🟢 Low      |
| Twitter card (root)                                         | No social preview for non-shop pages      | 🟢 Low      |
| `userScalable: false`                                       | Accessibility concern                     | 🟢 Low      |

### 2.3 Architecture Notes

**Rendering model per route:**

```
app/
├── layout.tsx                    [Server, root metadata]
├── (auth)/
│   ├── layout.tsx                [Server]
│   ├── login/page.tsx            ['use client'] — CSR
│   ├── signup/page.tsx           ['use client'] — CSR
│   ├── forgot-password/page.tsx  ['use client'] — CSR
│   └── reset-password/page.tsx   ['use client'] — CSR
└── (main)/
    ├── layout.tsx                [Server]
    ├── page.tsx                  ['use client'] — CSR ⚠️
    ├── map/page.tsx              ['use client'] — CSR
    ├── favorites/page.tsx        ['use client'] — CSR
    ├── profile/page.tsx          ['use client'] — CSR
    ├── settings/page.tsx         ['use client'] — CSR
    ├── admin/page.tsx            ['use client'] — CSR (should stay noindex)
    ├── u/[username]/page.tsx     ['use client'] — CSR
    └── shop/[id]/
        ├── page.tsx              [Server] — SSR ✅
        ├── loading.tsx           [Server]
        └── not-found.tsx         [Server]
```

**Key insight:** Only shop detail pages are server-rendered. All other public pages are CSR, meaning Googlebot must execute JS to see content.

---

## 3. Implementation Phases

```
Phase 1 (P0) ─┬─> 1.1 Create app/sitemap.ts
              ├─> 1.2 Create app/robots.ts
              └─> 1.3 Add JSON-LD to shop detail page

Phase 2 (P1) ─┬─> 2.1 Add metadata to home page
              ├─> 2.2 Add metadata to map page
              ├─> 2.3 Add metadata to favorites page
              ├─> 2.4 Add metadata to profile + public profile
              └─> 2.5 Split home page into server + client

Phase 3 (P2) ─┬─> 3.1 Review PWA service worker caching
              └─> 3.2 Configure workbox runtime caching

Phase 4 (P3) ─┬─> 4.1 Add keywords + Twitter card (root)
              ├─> 4.2 Enable viewport user scaling
              └─> 4.3 Add JSON-LD for public profiles
```

**Dependency graph:**

- Phase 1.1 depends on 2.1–2.4 (metadata must exist before sitemap references pages)
- Phase 2.5 is independent
- Phase 3 is independent
- Phase 4.3 depends on 1.3 (JSON-LD pattern established)

---

## Phase 1 — Critical (P0)

### Task 1.1 — Create `app/sitemap.ts`

**Priority:** 🔴 P0
**Est. Time:** 2–3 hrs
**Risk:** Low

#### Rationale

Without a sitemap, Googlebot discovers pages only via internal links. New shop pages created via `AddShopDialog` may take weeks to be discovered.

#### Implementation Steps

**Step 1.1.1** — Create `app/sitemap.ts`

```typescript
import type { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://phinfind.com';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${BASE_URL}/map`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9
    }
  ];

  // Dynamic shop routes
  let shopRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createPublicClient();
    const { data: shops, error } = await supabase
      .from('shops')
      .select('place_id, updated_at, created_at')
      .neq('hidden', true)
      .order('updated_at', { ascending: false })
      .limit(50000); // Google's hard limit per sitemap

    if (error) {
      console.error('[sitemap] Failed to fetch shops:', error);
    } else if (shops) {
      shopRoutes = shops.map((shop) => ({
        url: `${BASE_URL}/shop/${shop.place_id}`,
        lastModified: new Date(shop.updated_at || shop.created_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8
      }));
    }
  } catch (err) {
    console.error('[sitemap] Unexpected error:', err);
  }

  // Dynamic public profile routes (only users with usernames)
  let profileRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createPublicClient();
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .not('username', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(10000);

    if (!error && profiles) {
      profileRoutes = profiles
        .filter((p) => p.username)
        .map((p) => ({
          url: `${BASE_URL}/u/${encodeURIComponent(p.username!)}`,
          lastModified: new Date(p.updated_at || Date.now()),
          changeFrequency: 'monthly' as const,
          priority: 0.5
        }));
    }
  } catch (err) {
    console.error('[sitemap] Profile fetch error:', err);
  }

  return [...staticRoutes, ...shopRoutes, ...profileRoutes];
}
```

**Step 1.1.2** — Add sitemap reference to `next.config.ts` (optional, Next.js auto-detects)

No change needed — Next.js automatically serves `/sitemap.xml` when `app/sitemap.ts` exists.

#### Acceptance Criteria

- [ ] `GET /sitemap.xml` returns valid XML
- [ ] All non-hidden shops appear as `<url>` entries
- [ ] Response time < 3 seconds for 1000 shops
- [ ] `revalidate = 3600` is set (ISR caching)

#### Edge Cases

| Case                          | Handling                                                  |
| ----------------------------- | --------------------------------------------------------- |
| 0 shops in DB                 | Static routes only; valid sitemap                         |
| > 50,000 shops                | Truncate to 50,000 (Google limit) — future: sitemap index |
| Supabase down                 | Static routes still returned; errors logged               |
| Missing `NEXT_PUBLIC_APP_URL` | Falls back to `https://phinfind.com`                      |

#### Testing

```bash
# Local
curl http://localhost:3000/sitemap.xml | head -50

# Validate XML structure
curl -s http://localhost:3000/sitemap.xml | xmllint --noout -

# Count entries
curl -s http://localhost:3000/sitemap.xml | grep -c "<url>"
```

---

### Task 1.2 — Create `app/robots.ts`

**Priority:** 🔴 P0
**Est. Time:** 1 hr
**Risk:** Low

#### Rationale

Without `robots.txt`, Googlebot may crawl `/api/` routes (wasting crawl budget), admin pages, and settings. It also won't discover the sitemap automatically.

#### Implementation Steps

**Step 1.2.1** — Create `app/robots.ts`

```typescript
import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://phinfind.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/settings/',
          '/favorites/',
          '/profile/',
          '/auth/',
          '/_next/',
          '/*?*shop=', // Drawer query params
          '/*?*redirect='
        ]
      },
      {
        userAgent: 'GPTBot',
        disallow: '/' // Block AI training crawlers (adjust per policy)
      }
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL
  };
}
```

**Step 1.2.2** — Add `<meta name="robots">` for admin page

In `app/(main)/admin/page.tsx`, add metadata export (requires server component split — see Task 2.5):

```typescript
// For now, add a <head> tag or use next/head pattern
// Better: split admin into server wrapper with metadata:
export const metadata = {
  robots: { index: false, follow: false }
};
```

> **Note:** `admin/page.tsx` currently has `'use client'`. To add `metadata`, you must either:
>
> - (a) Convert to server component + client child, OR
> - (b) Leave as-is and rely on `robots.txt` disallow
>
> **Recommendation:** Do (b) initially, revisit in Phase 2.

#### Acceptance Criteria

- [ ] `GET /robots.txt` returns plain text
- [ ] Sitemap URL is declared
- [ ] `/api/` is disallowed
- [ ] `/admin/` is disallowed

#### Testing

```bash
curl http://localhost:3000/robots.txt
# Expected output:
# User-Agent: *
# Allow: /
# Disallow: /api/
# ...
# Sitemap: https://phinfind.com/sitemap.xml
```

---

### Task 1.3 — Add JSON-LD Structured Data to Shop Detail Page

**Priority:** 🔴 P0
**Est. Time:** 3–4 hrs
**Risk:** Low

#### Rationale

Structured data enables rich results (star ratings, price, location) in Google Search. This is the single highest-impact change for click-through rate.

#### Implementation Steps

**Step 1.3.1** — Create reusable JSON-LD helper

Create `src/lib/seo/jsonLd.ts`:

```typescript
import type { CoffeeShop } from '@/types/shop';

export interface JsonLdScriptProps {
  data: Record<string, unknown>;
}

export function buildShopJsonLd(shop: CoffeeShop, baseUrl: string) {
  const url = `${baseUrl}/shop/${shop.place_id || shop.id}`;
  const images = (shop.photos || []).slice(0, 5); // Schema allows multiple images

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    '@id': url,
    name: shop.name,
    url,
    address: shop.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: shop.address,
          addressCountry: 'VN'
        }
      : undefined,
    geo:
      typeof shop.lat === 'number' && typeof shop.lon === 'number'
        ? {
            '@type': 'GeoCoordinates',
            latitude: shop.lat,
            longitude: shop.lon
          }
        : undefined,
    telephone: shop.phone || undefined,
    sameAs: shop.website ? [shop.website] : undefined,
    image: images.length > 0 ? images : undefined,
    priceRange: shop.price_range || undefined,
    servesCuisine: 'Coffee',
    openingHoursSpecification: shop.opening_hours?.periods?.map((p) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: mapDayToSchema(p.open.day),
      opens: p.open.time,
      closes: p.close.time
    })),
    aggregateRating:
      shop.rating && shop.total_ratings && shop.total_ratings > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: shop.rating.toFixed(1),
            reviewCount: shop.total_ratings,
            bestRating: 5,
            worstRating: 1
          }
        : undefined
  };

  // Strip undefined keys (Google validator dislikes them)
  return JSON.parse(JSON.stringify(jsonLd));
}

function mapDayToSchema(day: number): string {
  const map: Record<number, string> = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
  };
  return map[day] || 'Monday';
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url
    }))
  };
}
```

**Step 1.3.2** — Create `<JsonLd />` component

Create `src/components/seo/JsonLd.tsx`:

```tsx
import React from 'react';

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type='application/ld+json'
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c')
      }}
    />
  );
}
```

> **Security note:** The `.replace(/</g, '\\u003c')` escapes `<` to prevent XSS via shop name/address content.

**Step 1.3.3** — Inject into shop detail page

Modify `app/(main)/shop/[id]/page.tsx`:

```tsx
import { JsonLd } from '@/components/seo/JsonLd';
import { buildShopJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo/jsonLd';

// ... existing imports

export default async function ShopDetailPage({ params }: PageProps) {
  const { id } = await params;
  const shop = await fetchShopForServer(id);
  if (!shop) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://phinfind.com';
  const shopJsonLd = buildShopJsonLd(shop, baseUrl);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Trang chủ', url: baseUrl },
    { name: 'Bản đồ', url: `${baseUrl}/map` },
    { name: shop.name, url: `${baseUrl}/shop/${shop.place_id || id}` }
  ]);

  return (
    <>
      <JsonLd data={[shopJsonLd, breadcrumbJsonLd]} />
      <ShopDetailClient shop={shop} />
    </>
  );
}
```

**Step 1.3.4** — Add review structured data (when reviews exist)

Extend `buildShopJsonLd` to include `review` array (optional, capped at 10):

```typescript
// Inside buildShopJsonLd, add optional reviews param
export function buildShopJsonLd(
  shop: CoffeeShop,
  baseUrl: string,
  reviews?: Array<{ author: string; rating: number; comment: string; created_at: string }>
) {
  // ... existing
  const reviewItems = (reviews || []).slice(0, 10).map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.author },
    datePublished: r.created_at,
    reviewBody: r.comment,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: r.rating,
      bestRating: 5,
      worstRating: 1
    }
  }));

  return {
    // ... existing fields
    review: reviewItems.length > 0 ? reviewItems : undefined
  };
}
```

> **Note:** Fetching reviews server-side requires a new function in `src/lib/supabase/shop-detail.ts` — defer to Phase 2 if scope is tight.

#### Acceptance Criteria

- [ ] Google Rich Results Test passes: https://search.google.com/test/rich-results
- [ ] `CafeOrCoffeeShop` type detected
- [ ] `AggregateRating` appears when shop has reviews
- [ ] `OpeningHoursSpecification` maps all 7 days correctly
- [ ] No `<` characters leak into HTML (XSS check)

#### Edge Cases

| Case                          | Handling                              |
| ----------------------------- | ------------------------------------- |
| Shop has no photos            | `image` omitted                       |
| Shop has no rating            | `aggregateRating` omitted             |
| Shop has no hours             | `openingHoursSpecification` omitted   |
| Shop has 100 reviews          | Only first 10 included (Google limit) |
| Shop name contains `<script>` | Escaped via `\\u003c`                 |

#### Testing

```bash
# Local
curl -s http://localhost:3000/shop/{placeId} | grep -o 'application/ld+json'

# Extract JSON-LD
curl -s http://localhost:3000/shop/{placeId} \
  | grep -oP '(?<=application/ld\+json">).*?(?=</script>)' \
  | python3 -m json.tool

# Rich Results Test (paste URL into)
# https://search.google.com/test/rich-results
```

---

## Phase 2 — High Priority (P1)

### Task 2.1 — Add Metadata to Home Page

**Priority:** 🟡 P1
**Est. Time:** 2 hrs
**Risk:** Medium (requires server/client split)

#### Implementation Steps

**Step 2.1.1** — Create `app/(main)/DiscoverClient.tsx`

Move all existing content from `app/(main)/page.tsx` to a new file with `'use client'`:

```tsx
'use client';
// ... all existing imports and the DiscoverPage component
export function DiscoverClient() {
  // ... existing body
  return ( /* existing JSX */ );
}
```

**Step 2.1.2** — Convert `app/(main)/page.tsx` to server component

```tsx
import type { Metadata } from 'next';
import { DiscoverClient } from './DiscoverClient';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://phinfind.com';

export const metadata: Metadata = {
  title: 'PhinFind - Bản đồ Cà phê Việt | Khám phá quán cà phê gần bạn',
  description:
    'Khám phá hàng trăm quán cà phê gần bạn với bản đồ tương tác, đánh giá thực tế từ cộng đồng và chỉ đường nhanh chóng. Lưu quán yêu thích, ghé thăm và chia sẻ trải nghiệm.',
  keywords: [
    'quán cà phê',
    'cà phê Việt',
    'bản đồ cà phê',
    'tìm quán cà phê gần đây',
    'coffee shop Vietnam',
    'PhinFind'
  ],
  alternates: { canonical: `${BASE_URL}/` },
  openGraph: {
    title: 'PhinFind - Bản đồ Cà phê Việt',
    description: 'Khám phá quán cà phê gần bạn với bản đồ tương tác',
    url: BASE_URL,
    siteName: 'PhinFind',
    locale: 'vi_VN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhinFind - Bản đồ Cà phê Việt',
    description: 'Khám phá quán cà phê gần bạn'
  }
};

export default function DiscoverPage() {
  return <DiscoverClient />;
}
```

#### Acceptance Criteria

- [ ] Page still renders and hydrates without errors
- [ ] `<title>` in HTML source (not just DOM)
- [ ] `curl /` shows content in initial HTML
- [ ] No React hydration mismatch warnings

---

### Task 2.2 — Add Metadata to Map Page

**Priority:** 🟡 P1
**Est. Time:** 1 hr
**Risk:** Medium

**Follow same pattern as 2.1:**

**Step 2.2.1** — Extract client content to `app/(main)/map/MapClient.tsx`
**Step 2.2.2** — Convert `app/(main)/map/page.tsx` to server component with metadata:

```tsx
export const metadata: Metadata = {
  title: 'Bản đồ Quán Cà phê - PhinFind',
  description:
    'Xem bản đồ tương tác với tất cả quán cà phê gần bạn. Lọc theo đánh giá, tiện ích, mức giá và khoảng cách.',
  alternates: { canonical: `${BASE_URL}/map` },
  openGraph: {
    /* ... */
  }
};
```

---

### Task 2.3 — Add Metadata to Favorites Page

**Priority:** 🟡 P1
**Est. Time:** 1 hr
**Risk:** Medium

**Note:** Favorites is auth-gated. Even so, its `<title>` should be unique.

```tsx
export const metadata: Metadata = {
  title: 'Quán Cà phê Đã Lưu - PhinFind',
  description: 'Danh sách các quán cà phê yêu thích bạn đã lưu trên PhinFind.',
  robots: { index: false, follow: true }, // Don't index per-user pages
  alternates: { canonical: `${BASE_URL}/favorites` }
};
```

> **Rationale for `robots: noindex`:** The favorites page content is user-specific and provides no value to search engines. It should not compete with the home page in SERPs.

---

### Task 2.4 — Add Metadata to Profile + Public Profile

**Priority:** 🟡 P1
**Est. Time:** 2 hrs
**Risk:** Medium

**Step 2.4.1** — Private profile (`app/(main)/profile/page.tsx`)

```tsx
export const metadata: Metadata = {
  title: 'Hồ sơ của tôi - PhinFind',
  description: 'Quản lý hồ sơ, đánh giá, quán đã lưu và huy hiệu của bạn trên PhinFind.',
  robots: { index: false, follow: false }, // Private page
  alternates: { canonical: `${BASE_URL}/profile` }
};
```

**Step 2.4.2** — Public profile (`app/(main)/u/[username]/page.tsx`)

This one _should_ be indexed. Convert to server component wrapper with `generateMetadata`:

```tsx
// app/(main)/u/[username]/page.tsx
import type { Metadata } from 'next';
import { PublicProfileClient } from './PublicProfileClient';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  // Fetch profile server-side via createPublicClient
  // ... implement fetchPublicProfileForServer in src/lib/supabase/
  const profile = await fetchPublicProfileForServer(username);

  if (!profile) {
    return { title: 'Không tìm thấy người dùng | PhinFind' };
  }

  const title = `${profile.full_name || profile.username} (@${profile.username}) - PhinFind`;
  const description = profile.bio
    ? `${profile.bio.slice(0, 155)}`
    : `Xem đánh giá cà phê và hoạt động của ${profile.full_name || profile.username} trên PhinFind.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/u/${profile.username}` },
    openGraph: {
      title,
      description,
      type: 'profile',
      images: profile.avatar_url ? [profile.avatar_url] : []
    }
  };
}

export default function PublicProfilePage({ params }: PageProps) {
  return <PublicProfileClient params={params} />;
}
```

> **New file needed:** `fetchPublicProfileForServer` in `src/lib/supabase/shop-detail.ts` (or new `profile-detail.ts`)

---

### Task 2.5 — Server/Client Component Split Checklist

For each of these pages, perform the split:

| Page                               | New Client File           | Metadata Export      |
| ---------------------------------- | ------------------------- | -------------------- |
| `app/(main)/page.tsx`              | `DiscoverClient.tsx`      | ✅ index, follow     |
| `app/(main)/map/page.tsx`          | `MapClient.tsx`           | ✅ index, follow     |
| `app/(main)/favorites/page.tsx`    | `FavoritesClient.tsx`     | ❌ noindex, follow   |
| `app/(main)/profile/page.tsx`      | `ProfileClient.tsx`       | ❌ noindex, nofollow |
| `app/(main)/settings/page.tsx`     | `SettingsClient.tsx`      | ❌ noindex, nofollow |
| `app/(main)/u/[username]/page.tsx` | `PublicProfileClient.tsx` | ✅ index, follow     |

**Import checklist for each split:**

- [ ] `'use client'` directive moved to client file
- [ ] All hooks (`useState`, `useEffect`, `useQuery`, etc.) stay in client file
- [ ] `useRouter`, `useSearchParams`, `usePathname` stay in client file
- [ ] `dynamic()` imports stay in client file
- [ ] Server-only imports (`createPublicClient`, `cache`) must NOT leak into client file
- [ ] Page component receives any server-fetched props as arguments

---

## Phase 3 — Medium Priority (P2)

### Task 3.1 — Review PWA Service Worker Caching

**Priority:** 🟡 P2
**Est. Time:** 2 hrs
**Risk:** Medium

#### Problem

`public/sw.js` registers a `NetworkFirst` route for all pages:

```js
e.registerRoute(
  ({ url: { pathname: e }, sameOrigin: s }) => s && !e.startsWith('/api/'),
  new e.NetworkFirst({
    cacheName: 'pages',
    plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
  }),
  'GET'
);
```

**Risk:** If the service worker is installed and cached, Googlebot may receive a cached HTML shell that differs from fresh server HTML. Google has documented issues with SW caching affecting indexing.

#### Options

**Option A — Disable SW entirely for crawlers (Recommended)**

Googlebot ignores service workers, but the SW may still interfere with the initial HTML response. The safest fix:

```typescript
// next.config.ts
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  workboxOptions: {
    // Never cache HTML navigation requests
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'NetworkOnly' // Always fresh HTML
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 }
        }
      }
    ]
  }
});
```

**Option B — Keep current config; verify no stale HTML in practice**

Document in this plan that regression testing must include:

- Clear SW in browser → reload → confirm HTML matches server output
- Test with `curl` (SW not active) — this reflects what Googlebot sees

**Recommendation:** Implement Option A.

#### Acceptance Criteria

- [ ] Navigating the site still works offline for cached assets
- [ ] HTML pages are never served from SW cache (verify via DevTools → Application → Cache Storage)
- [ ] `curl` output matches browser-rendered HTML (first load)

---

## Phase 4 — Enhancements (P3)

### Task 4.1 — Add Keywords + Twitter Card to Root Metadata

**Priority:** 🟢 P3
**Est. Time:** 30 min
**Risk:** Low

Modify `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'PhinFind - Khám phá Cà phê Việt',
    template: '%s | PhinFind' // Pages set just their title
  },
  description: '...',
  keywords: ['quán cà phê', 'cà phê Việt', 'bản đồ cà phê', 'PhinFind'],
  twitter: {
    card: 'summary_large_image',
    title: 'PhinFind - Khám phá Cà phê Việt',
    description: 'Khám phá những quán cà phê tuyệt vời nhất gần bạn',
    images: ['/logo-512.png']
  }
  // ... existing
};
```

> **Note:** The `title.template` field lets pages set just `title: 'Bản đồ'` and get `Bản đồ | PhinFind` automatically.

---

### Task 4.2 — Enable Viewport User Scaling

**Priority:** 🟢 P3
**Est. Time:** 15 min
**Risk:** Low

Modify `app/layout.tsx`:

```tsx
export const viewport: Viewport = {
  themeColor: '#F9F6F0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // was: 1
  userScalable: true // was: false
};
```

> **Accessibility rationale:** WCAG 1.4.4 requires users to be able to zoom up to 200%. `userScalable: false` fails this. Google may devalue pages with accessibility failures.

---

### Task 4.3 — Add JSON-LD for Public Profiles

**Priority:** 🟢 P3
**Est. Time:** 1 hr
**Risk:** Low

In `app/(main)/u/[username]/page.tsx`:

```tsx
const profileJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.full_name || profile.username,
  alternateName: `@${profile.username}`,
  url: `${BASE_URL}/u/${profile.username}`,
  image: profile.avatar_url,
  description: profile.bio
};

return (
  <>
    <JsonLd data={profileJsonLd} />
    <PublicProfileClient params={params} />
  </>
);
```

---

## 8. Verification & Testing

### 8.1 Automated Tests (Add to CI)

Create `src/lib/seo/__tests__/jsonLd.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildShopJsonLd, buildBreadcrumbJsonLd } from '../jsonLd';

describe('JSON-LD Builders', () => {
  it('builds valid CafeOrCoffeeShop JSON-LD', () => {
    const shop = {
      id: 'p1',
      place_id: 'p1',
      name: 'Test Cafe',
      address: '123 Test St',
      lat: 21.03,
      lon: 105.85,
      distance: 0,
      distance_text: '0 m',
      rating: 4.5,
      total_ratings: 10,
      categories: []
    };
    const jsonLd = buildShopJsonLd(shop as any, 'https://phinfind.com');
    expect(jsonLd['@type']).toBe('CafeOrCoffeeShop');
    expect(jsonLd.aggregateRating).toBeDefined();
    expect(jsonLd.aggregateRating.ratingValue).toBe('4.5');
  });

  it('omits aggregateRating when no reviews', () => {
    const shop = {
      /* rating: 0, total_ratings: 0 */
    };
    const jsonLd = buildShopJsonLd(shop as any, 'https://phinfind.com');
    expect(jsonLd.aggregateRating).toBeUndefined();
  });

  it('escapes XSS in shop name', () => {
    const shop = { name: '<script>alert(1)</script>' };
    const jsonLd = buildShopJsonLd(shop as any, 'https://phinfind.com');
    expect(jsonLd.name).toBe('<script>alert(1)</script>'); // data is clean
    // Escaping happens in <JsonLd /> component
  });

  it('maps all 7 days correctly', () => {
    // ... test each day
  });
});
```

### 8.2 Manual Verification Checklist

| #   | Test                    | Command/Action                                 | Expected                              |
| --- | ----------------------- | ---------------------------------------------- | ------------------------------------- |
| 1   | Sitemap accessible      | `curl /sitemap.xml`                            | Valid XML, contains shop URLs         |
| 2   | Robots accessible       | `curl /robots.txt`                             | Disallows `/api/`, references sitemap |
| 3   | Shop JSON-LD present    | `curl /shop/{id}`                              | `application/ld+json` present         |
| 4   | Home title unique       | `curl /` + `curl /map`                         | Different `<title>` tags              |
| 5   | Server-rendered content | Disable JS in browser                          | Content visible                       |
| 6   | Rich Results Test       | https://search.google.com/test/rich-results    | No errors                             |
| 7   | Mobile-friendly         | https://search.google.com/test/mobile-friendly | Pass                                  |
| 8   | Lighthouse SEO          | Chrome DevTools → Lighthouse                   | ≥ 95                                  |
| 9   | PageSpeed Insights      | https://pagespeed.web.dev/                     | Core Web Vitals pass                  |
| 10  | Sitemap in GSC          | Submit to Google Search Console                | Accepted                              |

### 8.3 Post-Deploy Monitoring (Week 1–4)

| Day    | Action                                  |
| ------ | --------------------------------------- |
| Day 1  | Submit sitemap to Google Search Console |
| Day 3  | Check GSC → Pages → Indexed count       |
| Day 7  | Check GSC → Enhancements → Rich Results |
| Day 14 | Review GSC → Coverage → Errors          |
| Day 28 | Compare CTR before/after via GSC        |

---

## 9. Rollback Plan

Each phase is independently revertible via git revert of its commits.

### 9.1 Rollback Procedures

| Phase     | Rollback Action                                 | Impact                            |
| --------- | ----------------------------------------------- | --------------------------------- |
| Phase 1.1 | Delete `app/sitemap.ts`                         | Sitemap URL 404s                  |
| Phase 1.2 | Delete `app/robots.ts`                          | Robots.txt 404s                   |
| Phase 1.3 | Remove `<JsonLd>` from shop page                | Rich results disappear (no error) |
| Phase 2.x | Restore `'use client'` on page + inline content | Reverts to CSR                    |
| Phase 3.1 | Restore `next.config.ts` PWA block              | Reverts cache strategy            |
| Phase 4.x | Revert `app/layout.tsx` changes                 | Metadata reverts                  |

### 9.2 Emergency Rollback Trigger

Rollback if ANY of:

- Site returns 5xx for > 5 minutes post-deploy
- Google Search Console reports "Sitemap could not be read" for > 24 hours
- Rich Results Test reports critical errors
- Core Web Vitals regress by > 20%

---

## 10. Regression Checklist

**Use this checklist before each deploy that touches SEO-related code.**

### 10.1 Pre-Deploy

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes (including new SEO tests)
- [ ] `pnpm build` succeeds
- [ ] All Phase 1 tasks completed and verified locally

### 10.2 Post-Deploy

- [ ] `curl https://prod/sitemap.xml` returns 200 + valid XML
- [ ] `curl https://prod/robots.txt` returns 200
- [ ] Shop detail page has JSON-LD
- [ ] Rich Results Test passes for a sample shop
- [ ] No console errors on home, map, favorites, profile, shop detail
- [ ] Lighthouse SEO ≥ 95 on home + shop detail
- [ ] Sitemap submitted to GSC (if changed)
- [ ] GSC → URL Inspection → Test Live URL for home + 1 shop

### 10.3 Weekly SEO Health Check

- [ ] GSC → Coverage → No new errors
- [ ] GSC → Enhancements → Rich results valid
- [ ] GSC → Sitemaps → Success, no warnings
- [ ] PageSpeed Insights → No regressions
- [ ] Search Console query report → Impressions trending up

---

## 11. Appendix — Reference Code

### 11.1 File Change Matrix

| File                                              | Phase    | Change Type     |
| ------------------------------------------------- | -------- | --------------- |
| `app/sitemap.ts`                                  | 1.1      | **Create**      |
| `app/robots.ts`                                   | 1.2      | **Create**      |
| `src/lib/seo/jsonLd.ts`                           | 1.3      | **Create**      |
| `src/components/seo/JsonLd.tsx`                   | 1.3      | **Create**      |
| `app/(main)/shop/[id]/page.tsx`                   | 1.3      | Modify          |
| `app/(main)/DiscoverClient.tsx`                   | 2.1      | **Create**      |
| `app/(main)/page.tsx`                             | 2.1      | Modify (server) |
| `app/(main)/map/MapClient.tsx`                    | 2.2      | **Create**      |
| `app/(main)/map/page.tsx`                         | 2.2      | Modify (server) |
| `app/(main)/favorites/FavoritesClient.tsx`        | 2.3      | **Create**      |
| `app/(main)/favorites/page.tsx`                   | 2.3      | Modify (server) |
| `app/(main)/profile/ProfileClient.tsx`            | 2.4      | **Create**      |
| `app/(main)/profile/page.tsx`                     | 2.4      | Modify (server) |
| `app/(main)/settings/SettingsClient.tsx`          | 2.4      | **Create**      |
| `app/(main)/settings/page.tsx`                    | 2.4      | Modify (server) |
| `app/(main)/u/[username]/PublicProfileClient.tsx` | 2.4      | **Create**      |
| `app/(main)/u/[username]/page.tsx`                | 2.4      | Modify (server) |
| `src/lib/supabase/profile-detail.ts`              | 2.4      | **Create**      |
| `next.config.ts`                                  | 3.1      | Modify          |
| `app/layout.tsx`                                  | 4.1, 4.2 | Modify          |
| `src/lib/seo/__tests__/jsonLd.test.ts`            | 8.1      | **Create**      |

### 11.2 Environment Variables Required

```bash
# .env.example additions (if not present)
NEXT_PUBLIC_APP_URL=https://phinfind.com  # Required for canonical URLs
```

### 11.3 GSC Setup Checklist

- [ ] Verify domain ownership in Google Search Console
- [ ] Submit `https://phinfind.com/sitemap.xml`
- [ ] Request indexing for home page
- [ ] Request indexing for 5 sample shop pages
- [ ] Enable email alerts for coverage errors
- [ ] Link GSC to Google Analytics (if using)

### 11.4 Reference Links

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js Sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js Robots](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Schema.org CafeOrCoffeeShop](https://schema.org/CafeOrCoffeeShop)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google Search Central — Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

---

**End of Document**

_Last updated: 2026-09-12_
_Next review: after Phase 1 deployment_
