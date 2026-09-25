# PhinFind — Social & Content Enhancement Roadmap

> **Status:** Proposed
> **Owner:** TBD
> **Last updated:** 2026-09-22
> **Related features:** FEAT-07 (filters), FEAT-08 (edit suggestions), FEAT-04 (notifications), PERF-02 (nearby RPC)

---

## 1. Motivation

PhinFind today is a **directory with a map**. It excels at _finding_ coffee shops
(discovery, geospatial search, ratings, reviews) but is weak at the **social loop**:

- Users can review a shop, but cannot link a shop to its real-world social presence.
- There is no video content layer, even though Vietnamese coffee culture lives
  overwhelmingly on TikTok and YouTube Shorts.
- Sharing a shop produces a bare link — no branded OG card, no quick-share menu.
- Returning users have no reason to come back daily; there is no feed, no
  trending, no "new this week".

This roadmap closes those gaps in three tiers, ordered by **impact ÷ effort**.
Every item is designed to slot into the existing architecture (Supabase + Zod +
TanStack Query + shadcn) without introducing a new state layer or a new auth model.

### Non-goals (for this document)

- Building a real-time chat / DM system.
- Native mobile apps.
- Payments, bookings, or reservations.
- Anything requiring a proprietary ML model.

---

## 2. Current State Snapshot

| Concern             | Today                                  | Gap                                         |
| ------------------- | -------------------------------------- | ------------------------------------------- |
| Shop external links | `website`, `phone` only                | No Facebook / Instagram / TikTok / Zalo     |
| Video content       | None                                   | No TikTok / YouTube / Reels links or embeds |
| Sharing             | `navigator.share` → clipboard fallback | No explicit share targets (FB, X, Zalo)     |
| OG image for shop   | First shop photo, unbranded            | No branded 1200×630 card                    |
| Community signal    | Reviews + likes                        | No photo wall, no tags, no trending         |
| User profiles       | Bio + avatar                           | No social links on `profiles`               |
| Return loop         | None                                   | No feed, no recap, no "new this week"       |

### Key files that will be touched repeatedly

```

src/types/shop.ts # CoffeeShop interface
src/lib/validations/shop.ts # Zod schemas (create/update)
src/lib/supabase/shops.ts # mapDbShopToCoffeeShop
src/app/api/shops/create/route.ts # POST create
src/app/api/shops/update/route.ts # PUT update
src/app/api/shops/suggest-edit/route.ts # ALLOWED_FIELDS guardrail
src/app/api/admin/suggestions/route.ts # ALLOWED_FIELDS guardrail
src/components/shop/AddShopDialog/ContactStep.tsx # Add/Edit form section
src/components/shop/SuggestEditDialog.tsx # Community edit form
src/components/admin/AdminSuggestionCard.tsx # FIELD_LABELS map
src/components/shop/ShopDetailsContent/OverviewTab.tsx # Display
src/components/shop/ShopDetailsContent/TabBar.tsx # Add Videos tab
src/components/shop/ShopDetailsContent/index.tsx # Tab wiring
supabase/ # Migrations

```

> ⚠️ **Guardrail reminder:** every new mutable shop field MUST be added to
> `ALLOWED_FIELDS` in **both** `suggest-edit/route.ts` and
> `admin/suggestions/route.ts`, and MUST NOT be added to `DISALLOWED_FIELDS`.
> Missing this is the #1 source of "admin approved but nothing changed" bugs.

---

## 3. Tier 1 — Quick Wins

**Goal:** Ship 3 user-visible social improvements within ~1 week, zero new infra.

---

### 3.1 Shop Social Links

**Effort:** 1–2 days
**Impact:** ⭐⭐⭐⭐⭐
**Risk:** Low

#### 3.1.1 Database

Create `supabase/migration_add_shop_social.sql`:

```sql
-- ============================================================================
-- Migration: Add social media link columns to public.shops
-- Feature:   Social presence (Facebook, Instagram, TikTok, YouTube, Zalo)
-- Date:      2026-09-22
-- ============================================================================

ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS facebook_url  TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_url    TEXT,
  ADD COLUMN IF NOT EXISTS youtube_url   TEXT,
  ADD COLUMN IF NOT EXISTS zalo_url      TEXT;

-- Partial index: speeds up "which shops have any social presence" queries
CREATE INDEX IF NOT EXISTS idx_shops_social_present
  ON public.shops (
    (COALESCE(facebook_url, instagram_url, tiktok_url, youtube_url, zalo_url))
  )
  WHERE hidden = false;

NOTIFY pgrst, 'reload schema';

-- Rollback:
-- ALTER TABLE public.shops
--   DROP COLUMN IF EXISTS facebook_url,
--   DROP COLUMN IF EXISTS instagram_url,
--   DROP COLUMN IF EXISTS tiktok_url,
--   DROP COLUMN IF EXISTS youtube_url,
--   DROP COLUMN IF EXISTS zalo_url;
-- DROP INDEX IF EXISTS public.idx_shops_social_present;
-- NOTIFY pgrst, 'reload schema';
```

#### 3.1.2 Types

`src/types/shop.ts` — extend `CoffeeShop`:

```ts
export interface CoffeeShop {
  // ...existing fields
  facebook_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  youtube_url?: string | null;
  zalo_url?: string | null;
}
```

#### 3.1.3 Zod validation

`src/lib/validations/shop.ts` — add a reusable helper at the top, then extend
`createShopSchema`:

```ts
/** Optional URL restricted to a specific domain (rejects typos & phishing). */
function socialUrl(domain: RegExp, label: string) {
  return z
    .string()
    .trim()
    .url(`Link ${label} không hợp lệ`)
    .refine((u) => !u || domain.test(u), `Link ${label} phải thuộc ${domain.source}`)
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform((v) => (v && v.trim() ? v.trim() : null));
}

const facebookUrl = socialUrl(/^https?:\/\/(www\.|m\.|web\.)?(facebook|fb)\.com\//i, 'Facebook');
const instagramUrl = socialUrl(/^https?:\/\/(www\.)?instagram\.com\//i, 'Instagram');
const tiktokUrl = socialUrl(/^https?:\/\/(www\.|m\.)?tiktok\.com\//i, 'TikTok');
const youtubeUrl = socialUrl(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i, 'YouTube');
const zaloUrl = socialUrl(/^https?:\/\/(zalo\.me|zalo\.com)\//i, 'Zalo');

export const createShopSchema = z.object({
  // ...existing fields
  facebook_url: facebookUrl,
  instagram_url: instagramUrl,
  tiktok_url: tiktokUrl,
  youtube_url: youtubeUrl,
  zalo_url: zaloUrl
});
```

> `updateShopSchema` already extends `createShopSchema`, so it inherits these.

#### 3.1.4 API wiring

**`src/app/api/shops/create/route.ts`** — add to `insertPayload`:

```ts
const insertPayload = {
  // ...existing
  facebook_url: data.facebook_url,
  instagram_url: data.instagram_url,
  tiktok_url: data.tiktok_url,
  youtube_url: data.youtube_url,
  zalo_url: data.zalo_url
};
```

**`src/app/api/shops/update/route.ts`** — add to `updatePayload` (same keys).

**`src/app/api/shops/suggest-edit/route.ts`** — extend `ALLOWED_FIELDS`:

```ts
const ALLOWED_FIELDS = new Set([
  // ...existing
  'facebook_url',
  'instagram_url',
  'tiktok_url',
  'youtube_url',
  'zalo_url'
]);
```

**`src/app/api/admin/suggestions/route.ts`** — mirror the same set.

> Do NOT touch `DISALLOWED_FIELDS`. `place_id`, `created_by`, `verified`,
> `rating`, `total_ratings`, `hidden`, `created_at`, `updated_at` remain locked.

#### 3.1.5 DB → Domain mapper

`src/lib/supabase/shops.ts` — inside `mapDbShopToCoffeeShop`, add:

```ts
return {
  // ...existing
  facebook_url: row.facebook_url || null,
  instagram_url: row.instagram_url || null,
  tiktok_url: row.tiktok_url || null,
  youtube_url: row.youtube_url || null,
  zalo_url: row.zalo_url || null
};
```

#### 3.1.6 UI — AddShopDialog / ContactStep

`src/components/shop/AddShopDialog/ContactStep.tsx` — add a collapsible
"Mạng xã hội" section below the existing phone/website grid:

```tsx
<div className='space-y-1.5 pt-2'>
  <Label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
    <Share2 size={13} className='text-amber-gold' />
    <span>Mạng xã hội (tùy chọn)</span>
  </Label>
  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
    <SocialInput
      id='shop-facebook'
      icon={<Facebook size={14} className='text-[#1877F2]' />}
      placeholder='https://facebook.com/quancafe'
      {...register('facebook_url')}
      error={errors.facebook_url?.message}
    />
    <SocialInput
      id='shop-instagram'
      icon={<Instagram size={14} className='text-[#E4405F]' />}
      placeholder='https://instagram.com/quancafe'
      {...register('instagram_url')}
      error={errors.instagram_url?.message}
    />
    <SocialInput
      id='shop-tiktok'
      icon={<Music2 size={14} />}
      placeholder='https://tiktok.com/@quancafe'
      {...register('tiktok_url')}
      error={errors.tiktok_url?.message}
    />
    <SocialInput
      id='shop-youtube'
      icon={<Youtube size={14} className='text-[#FF0000]' />}
      placeholder='https://youtube.com/@quancafe'
      {...register('youtube_url')}
      error={errors.youtube_url?.message}
    />
    <SocialInput
      id='shop-zalo'
      icon={<MessageCircle size={14} className='text-[#0068FF]' />}
      placeholder='https://zalo.me/0901234567'
      {...register('zalo_url')}
      error={errors.zalo_url?.message}
    />
  </div>
</div>
```

`SocialInput` can be a small inline component in the same file:

```tsx
function SocialInput({
  icon,
  error,
  ...props
}: React.ComponentProps<typeof Input> & { icon: React.ReactNode; error?: string }) {
  return (
    <div className='space-y-1'>
      <div className='relative flex items-center'>
        <span className='absolute left-3 pointer-events-none'>{icon}</span>
        <Input
          {...props}
          className='h-11 md:h-9 pl-9 text-sm md:text-xs bg-secondary/50 border-border rounded-xl'
        />
      </div>
      {error && <p className='text-[11px] text-rose-500'>{error}</p>}
    </div>
  );
}
```

#### 3.1.7 UI — SuggestEditDialog

Add diff rows for each social field. Reuse the existing `DiffRow` component:

```tsx
<DiffRow
  label="Facebook"
  currentDisplay={shop.facebook_url || '(Chưa có)'}
  isChanged={Boolean(diffs.facebook_url)}
>
  <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} ... />
</DiffRow>
```

> ⚠️ Watch the `changedCount <= 3` guardrail — with 5 new fields users could
> hit the limit fast. Consider raising to **5 fields per suggestion** and updating
> the copy in `SuggestEditDialog` + `suggestEditSchema.refine`.

#### 3.1.8 UI — Display on shop detail

Add a `SocialLinksRow` component (`src/components/shop/ShopDetailsContent/SocialLinksRow.tsx`)
and render it in `OverviewTab.tsx` directly below the metrics/rating card:

```tsx
const SOCIAL_LINKS = [
  {
    key: 'facebook_url' as const,
    icon: Facebook,
    label: 'Facebook',
    cls: 'text-[#1877F2] hover:bg-[#1877F2]/10'
  },
  {
    key: 'instagram_url' as const,
    icon: Instagram,
    label: 'Instagram',
    cls: 'text-[#E4405F] hover:bg-[#E4405F]/10'
  },
  {
    key: 'tiktok_url' as const,
    icon: Music2,
    label: 'TikTok',
    cls: 'text-foreground hover:bg-foreground/10'
  },
  {
    key: 'youtube_url' as const,
    icon: Youtube,
    label: 'YouTube',
    cls: 'text-[#FF0000] hover:bg-[#FF0000]/10'
  },
  {
    key: 'zalo_url' as const,
    icon: MessageCircle,
    label: 'Zalo',
    cls: 'text-[#0068FF] hover:bg-[#0068FF]/10'
  }
];

export function SocialLinksRow({ shop }: { shop: CoffeeShop }) {
  const items = SOCIAL_LINKS.filter((s) => shop[s.key]);
  if (items.length === 0) return null;

  return (
    <div className='space-y-2'>
      <span className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider'>
        Kết nối với quán
      </span>
      <div className='flex flex-wrap gap-2'>
        {items.map((s) => {
          const Icon = s.icon;
          return (
            <a
              key={s.key}
              href={shop[s.key]!}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={`Mở ${s.label} của ${shop.name}`}
              className={cn(
                'inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-border/60',
                'bg-secondary/50 text-xs font-semibold transition-all active:scale-95',
                s.cls
              )}
            >
              <Icon size={15} />
              <span>{s.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
```

#### 3.1.9 Admin moderation

`src/components/admin/AdminSuggestionCard.tsx` — extend `FIELD_LABELS`:

```ts
facebook_url:  'Facebook',
instagram_url: 'Instagram',
tiktok_url:    'TikTok',
youtube_url:   'YouTube',
zalo_url:      'Zalo',
```

Otherwise the admin sees raw `facebook_url` in the diff list.

#### 3.1.10 Tests

- **Unit:** `src/lib/validations/__tests__/shop.test.ts` — reject `facebook_url: 'https://evil.com/x'`, accept valid.
- **E2E:** extend `e2e/shop-detail.spec.ts` — after seeding a shop with 3 social links, assert 3 anchor tags render with correct `target="_blank"` and `rel="noopener noreferrer"`.

---

### 3.2 Real Share Menu

**Effort:** 2 hours
**Impact:** ⭐⭐⭐⭐
**Risk:** Low

#### 3.2.1 New helper

`src/lib/utils/share.ts`:

```ts
export interface ShareTarget {
  id: 'facebook' | 'x' | 'zalo' | 'telegram' | 'copy';
  label: string;
  href?: string;
}

export function buildShareTargets(url: string, title: string): ShareTarget[] {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    {
      id: 'facebook',
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`
    },
    { id: 'x', label: 'X (Twitter)', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { id: 'zalo', label: 'Zalo', href: `https://zalo.me/share?u=${u}` },
    { id: 'telegram', label: 'Telegram', href: `https://t.me/share/url?url=${u}&text=${t}` },
    { id: 'copy', label: 'Sao chép liên kết' }
  ];
}
```

#### 3.2.2 Wiring

In `ShopDetailClient.tsx` and `ShopDrawer.tsx`, replace the inline `handleShare`
with a `ShareMenu` dropdown component. Keep `navigator.share` as the **primary**
path on mobile (`if (navigator.share) { ... }`), and expose the dropdown as a
"…" fallback on desktop or when `navigator.share` is unavailable.

`ShareMenu` lives at `src/components/shop/ShareMenu.tsx` and wraps the existing
`DropdownMenu` primitive.

> Zalo is non-negotiable for a Vietnamese product — it's the default messaging
> app for the majority of the target audience.

---

### 3.3 Video Links (MVP — link-out only)

**Effort:** 2–3 days
**Impact:** ⭐⭐⭐⭐⭐
**Risk:** Medium (needs URL parsing + optional oEmbed)

#### 3.3.1 Database

`supabase/migration_add_shop_videos.sql`:

```sql
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb;

-- GIN index for future "shops with videos" filters
CREATE INDEX IF NOT EXISTS idx_shops_videos_gin
  ON public.shops USING GIN (videos jsonb_path_ops)
  WHERE hidden = false;

NOTIFY pgrst, 'reload schema';
```

#### 3.3.2 Schema

```ts
export type VideoPlatform = 'tiktok' | 'youtube' | 'instagram' | 'facebook';

export interface ShopVideo {
  url: string;
  platform: VideoPlatform;
  video_id: string;
  title?: string;
  thumbnail_url?: string;
  added_at?: string; // ISO
}
```

Add `videos?: ShopVideo[]` to `CoffeeShop` in `src/types/shop.ts`.

#### 3.3.3 URL parser

`src/lib/utils/video.ts`:

```ts
import type { ShopVideo, VideoPlatform } from '@/types/shop';

const PATTERNS: Array<{ platform: VideoPlatform; re: RegExp; idIndex: number }> = [
  { platform: 'tiktok', re: /tiktok\.com\/@[^/]+\/video\/(\d+)/, idIndex: 1 },
  { platform: 'tiktok', re: /tiktok\.com\/t\/([\w-]+)/, idIndex: 1 },
  {
    platform: 'youtube',
    re: /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/,
    idIndex: 1
  },
  { platform: 'instagram', re: /instagram\.com\/(?:reel|p|tv)\/([\w-]+)/, idIndex: 1 },
  { platform: 'facebook', re: /facebook\.com\/.+\/videos\/(\d+)/, idIndex: 1 }
];

export function parseVideoUrl(url: string): ShopVideo | null {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;
  for (const { platform, re, idIndex } of PATTERNS) {
    const m = trimmed.match(re);
    if (m && m[idIndex]) {
      return { url: trimmed, platform, video_id: m[idIndex] };
    }
  }
  return null;
}
```

#### 3.3.4 Thumbnail resolution

Two strategies, both server-side:

**YouTube** — deterministic, no API call needed:

```ts
export function youtubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
```

**TikTok / Instagram / Facebook** — use oEmbed via a rate-limited API route:

`src/app/api/videos/resolve/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { checkRateLimit } from '@/lib/utils/rateLimit';
import { parseVideoUrl } from '@/lib/utils/video';

export const revalidate = 86400; // cache 24h

const OEMBED_ENDPOINTS: Record<string, string> = {
  tiktok: 'https://www.tiktok.com/oembed',
  instagram: 'https://graph.facebook.com/v18.0/instagram_oembed', // needs token
  facebook: 'https://graph.facebook.com/v18.0/oembed_video'
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url).searchParams.get('url') ?? '';
  const parsed = parseVideoUrl(url);
  if (!parsed) {
    return NextResponse.json({ error: 'URL không hợp lệ' }, { status: 400 });
  }

  const rl = checkRateLimit(`video-resolve:${req.ip ?? 'anon'}`, 30, 60 * 60 * 1000);
  if (!rl.success) {
    return NextResponse.json({ error: 'Quá nhiều yêu cầu' }, { status: 429 });
  }

  if (parsed.platform === 'youtube') {
    return NextResponse.json({
      ...parsed,
      thumbnail_url: `https://img.youtube.com/vi/${parsed.video_id}/hqdefault.jpg`
    });
  }

  const endpoint = OEMBED_ENDPOINTS[parsed.platform];
  if (!endpoint) return NextResponse.json(parsed);

  try {
    const { data } = await axios.get(endpoint, {
      params: {
        url,
        ...(process.env.FB_OEMBED_TOKEN ? { access_token: process.env.FB_OEMBED_TOKEN } : {})
      },
      timeout: 5000
    });
    return NextResponse.json({
      ...parsed,
      title: data.title,
      thumbnail_url: data.thumbnail_url
    });
  } catch {
    // Fail soft: return parsed without thumbnail; UI shows branded placeholder
    return NextResponse.json(parsed);
  }
}
```

> **Facebook/Instagram require an app access token.** If you don't want to
> manage that, skip thumbnails for those two platforms and render a branded
> placeholder in the UI. TikTok works unauthenticated.

#### 3.3.5 UI — Videos tab

Add a 5th tab in `TabBar.tsx`:

```tsx
<TabsTrigger value='videos' className='...'>
  Video
</TabsTrigger>
```

Create `src/components/shop/ShopDetailsContent/VideosTab.tsx`. Layout: 2-col
grid on mobile, 3-col on tablet, 4-col on desktop. Each card is 9:16 aspect
ratio (TikTok-native):

```tsx
<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
  {videos.map((v) => (
    <a
      key={v.url}
      href={v.url}
      target='_blank'
      rel='noopener noreferrer'
      className='group relative aspect-[9/16] rounded-2xl overflow-hidden border border-border/60 bg-muted'
    >
      {v.thumbnail_url ? (
        <ShopImage src={v.thumbnail_url} alt={v.title ?? 'Video'} imageClassName='object-cover' />
      ) : (
        <VideoPlaceholder platform={v.platform} />
      )}
      {/* Gradient + play overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent' />
      <PlayCircle className='absolute inset-0 m-auto h-12 w-12 text-white/90 group-hover:scale-110 transition-transform' />
      <PlatformBadge platform={v.platform} className='absolute top-2 left-2' />
      {v.title && (
        <p className='absolute bottom-2 left-2 right-2 text-[11px] font-semibold text-white line-clamp-2'>
          {v.title}
        </p>
      )}
    </a>
  ))}
</div>
```

Empty state: reuse `EmptyIllustration` with a new `no-videos` SVG.

#### 3.3.6 UI — AddShopDialog VideosStep

Add a new step (`src/components/shop/AddShopDialog/VideosStep.tsx`) between
`PhotosStep` and `LivePreviewCard`. UX:

1. Paste URL → click "Thêm video".
2. Client-side `parseVideoUrl` validates platform.
3. POST to `/api/videos/resolve` → get thumbnail + title.
4. Show a 9:16 preview chip with remove button.
5. Cap at **6 videos per shop**.

#### 3.3.7 Allow-list wiring

Add `'videos'` to `ALLOWED_FIELDS` in **both** admin routes.

Also update `suggestEditSchema` — videos are structured, so validating them
via the generic `changes` record requires a discriminated schema. Recommended
shape for the `to` value:

```ts
z.array(
  z.object({
    url: z.string().url(),
    platform: z.enum(['tiktok', 'youtube', 'instagram', 'facebook']),
    video_id: z.string(),
    title: z.string().optional(),
    thumbnail_url: z.string().url().optional()
  })
);
```

#### 3.3.8 Tests

- **Unit:** `src/lib/utils/__tests__/video.test.ts` — cover 5 platforms + malformed URLs.
- **API:** `/api/videos/resolve` returns 400 on bad URL, 200 with `thumbnail_url` for YouTube.
- **E2E:** add a video in AddShopDialog → assert it renders on the Videos tab → click opens `target="_blank"`.

---

### 3.4 Branded OG Images

**Effort:** 4 hours
**Impact:** ⭐⭐⭐⭐ (multiplies every share)
**Risk:** Low

Use Next's built-in `next/og` (`ImageResponse`). Create
`app/(main)/shop/[id]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og';
import { fetchShopForServer } from '@/lib/supabase/shop-detail';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const shop = await fetchShopForServer(params.id);
  const name = shop?.name ?? 'PhinFind';
  const rating = shop?.rating && shop.rating > 0 ? shop.rating.toFixed(1) : null;
  const address = shop?.address?.split(',').slice(0, 2).join(', ') ?? '';

  return new ImageResponse(
    <div
      style={
        {
          /* dark roast bg, amber-gold accents, logo, name, rating pill */
        }
      }
    >
      {/* ... brand layout ... */}
    </div>,
    size
  );
}
```

> Next automatically wires this as the OG image when `generateMetadata` does
> not explicitly set `openGraph.images`. Remove the manual `ogImages` from
> `generateMetadata` in `app/(main)/shop/[id]/page.tsx` so the generated one
> wins.

---

## 4. Tier 2 — Social Features

---

### 4.1 User Social Links on Public Profiles

**Effort:** 1 day
**Impact:** ⭐⭐⭐

Mirror the shop social columns onto `profiles`. Show them under the bio in
`PublicProfileHeader.tsx`. Gives reviewers a reason to identify themselves and
increases the value of `/u/[username]` as a shareable link.

Migration: `supabase/migration_add_profile_social.sql` (same pattern as shops).
Update `src/app/api/user/profile/route.ts` validation + `updateProfileSchema`.
Update `src/lib/supabase/profile-detail.ts` select projection.
Add `facebook_url` etc. to `PublicProfileData` in `src/hooks/useShops.ts`.

---

### 4.2 Community Photo Wall

**Effort:** 1 day
**Impact:** ⭐⭐⭐⭐

Below the gallery on the Photos tab (`PhotosTab.tsx`), add an
Instagram-style grid of **all** review photos (not just cover).

You already aggregate them in `buildGalleryPhotos()`. Extract the
`isCommunity === true` subset and render:

```tsx
<div className='grid grid-cols-3 gap-1.5'>
  {communityPhotos.map((p, i) => (
    <button onClick={() => openImagePreview(communityPhotos, i)} className='relative aspect-square'>
      <ShopImage src={p.url} alt={p.title} imageClassName='object-cover' />
      {/* tiny author avatar overlay bottom-left */}
    </button>
  ))}
</div>
```

Lightbox already works via `useUIStore.openImagePreview`.

---

### 4.3 Trending + "Mới được thêm" Sections

**Effort:** 2 days
**Impact:** ⭐⭐⭐⭐

Add two horizontal carousels above the bento grid in `DiscoverClient.tsx`.

**New RPC** (`supabase/migration_add_trending_rpc.sql`):

```sql
CREATE OR REPLACE FUNCTION public.trending_shops(
  days_back INT DEFAULT 7,
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  place_id TEXT, name TEXT, address TEXT, lat DOUBLE PRECISION, lon DOUBLE PRECISION,
  rating NUMERIC, total_ratings INT, photos TEXT[], categories TEXT[],
  amenities JSONB, custom_amenities JSONB, opening_hours JSONB,
  price_range TEXT, website TEXT, phone TEXT,
  created_by UUID, verified BOOLEAN, hidden BOOLEAN,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  review_count BIGINT
)
LANGUAGE sql STABLE AS $$
  SELECT s.*, COUNT(r.id) AS review_count
  FROM public.shops s
  LEFT JOIN public.reviews r
    ON r.shop_place_id = s.place_id
    AND r.created_at >= NOW() - (days_back || ' days')::interval
  WHERE s.hidden = false
  GROUP BY s.place_id
  HAVING COUNT(r.id) > 0
  ORDER BY review_count DESC, s.rating DESC
  LIMIT result_limit;
$$;

GRANT EXECUTE ON FUNCTION public.trending_shops(INT, INT) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
```

Wire into `src/lib/supabase/shops.ts` as `fetchTrendingShops()` and add hooks
`useTrendingShops()` / `useNewShops()` in `src/hooks/useShops.ts`.

Render as a `Carousel` (already available via `embla-carousel-react` in
`src/components/ui/carousel.tsx`).

---

### 4.4 Review Hashtags

**Effort:** 2–3 days
**Impact:** ⭐⭐⭐⭐

The cheapest way to generate social signal without a follow graph.

**DB:**

```sql
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_reviews_tags ON public.reviews USING GIN (tags);
```

**Preset tag vocabulary** — put in `src/lib/utils/constants.ts`:

```ts
export const REVIEW_TAGS = [
  { id: 'wifi-manh', label: 'Wi-Fi mạnh' },
  { id: 'yen-tinh', label: 'Yên tĩnh' },
  { id: 'view-dep', label: 'View đẹp' },
  { id: 'mo-khuya', label: 'Mở khuya' },
  { id: 'do-xe', label: 'Có chỗ đỗ xe' },
  { id: 'thu-cung', label: 'Thú cưng' },
  { id: 'lam-viec', label: 'Làm việc' },
  { id: 'hen-ho', label: 'Hẹn hò' }
] as const;
```

**UI surfaces:**

1. `ReviewModal` — multi-select chips below the comment textarea (max 3).
2. `ReviewCard` — render tag chips, each linking to `/?tags=wifi-manh`.
3. `ReviewsTab` — a filter row of tag chips.
4. `DiscoverClient` — read `?tags=` and pass to the filter pipeline
   (`applyShopFilters` extension: `requiredTagIds: string[]`).

This does require extending `ShopFilterState` in `src/types/shop.ts` and
adding a `requiredTagIds` predicate to `applyShopFilters`.

---

## 5. Tier 3 — Bigger Plays

These need explicit product buy-in. Each is 1–2 weeks and requires schema
changes, new RLS policies, and new empty-state UX.

### 5.1 Follow Graph + Activity Feed

- Table: `follows (follower_id UUID, followee_id UUID, created_at, PK(follower_id, followee_id))`.
- RLS: users can insert/delete their own follows; anyone can read.
- New route `/feed` (in `app/(main)/feed/`).
- Add a "Theo dõi" button on `PublicProfileHeader`.
- Notification trigger: `notify_new_follower()` mirroring `notify_review_liked()`.
- Empty state must onboard users: "Theo dõi 5 người để bắt đầu".

This is the single biggest lever for turning a directory into a social app.

### 5.2 Stories-style "Hôm nay"

- Table: `stories (id, user_id, shop_place_id, image_url, caption, expires_at)`.
- Circles row at top of Discover; tap opens a fullscreen carousel.
- **Requires:** moderation tools (report, hide, block) before shipping,
  otherwise it rots within weeks. Do NOT ship without a report flow.

### 5.3 PhinFind Recap

Monthly/yearly auto-generated shareable card: total shops visited, top
category, most-reviewed reviewer, longest streak.

- Pure client-side from `useUserVisits()` / `useUserReviews()` / `useUserFavorites()`.
- Render via `ImageResponse` at `/api/recap/[year]/image`.
- Share via the new `ShareMenu`.
- Highest ROI "big" feature for a Vietnamese coffee app — highly shareable on
  Facebook and Zalo during Tết.

---

## 6. Polish Checklist (do alongside Tier 1)

- [ ] Add `no-videos` SVG to `public/illustrations/`.
- [ ] Add a Videos placeholder block to `DetailSkeleton` in `LoadingSkeleton.tsx`.
- [ ] Add a tiny TikTok glyph badge to `ShopCardSmall` / `ShopCardFeaturedMobile`
      when `shop.tiktok_url` is present (cheap "active shop" signal).
- [ ] Raise `SuggestEditDialog` `changedCount` cap from 3 → 5 and update copy.
- [ ] Add the new fields to `AdminSuggestionCard.FIELD_LABELS`.
- [ ] Extend `robots.ts` — disallow `/feed` when built.
- [ ] Update `sitemap.ts` if you add `/feed` or public video pages.
- [ ] Add `zalo.me` and `tiktok.com` to `next.config.ts` `remotePatterns`
      (for thumbnail loading).
- [ ] Add `FB_OEMBED_TOKEN` (optional) to `.env.example` with a comment.
- [ ] Bump `ContactStep` mobile keyboard (`enterKeyHint="next"`) for new inputs.
- [ ] Add `aria-label` to every social anchor for a11y.
- [ ] Add `rel="noopener noreferrer"` to every external link.

---

## 7. Recommended Rollout Sequence

| #   | Feature                 | Tier | Effort | Ships   |
| --- | ----------------------- | ---- | ------ | ------- |
| 1   | Shop social links       | 1.1  | 1–2d   | Week 1  |
| 2   | Share menu              | 1.2  | 2h     | Week 1  |
| 3   | Branded OG image        | 1.4  | 4h     | Week 1  |
| 4   | Video links MVP         | 1.3  | 2–3d   | Week 2  |
| 5   | Community photo wall    | 2.2  | 1d     | Week 3  |
| 6   | Trending + New sections | 2.3  | 2d     | Week 3  |
| 7   | Review hashtags         | 2.4  | 2–3d   | Week 4  |
| 8   | User social links       | 2.1  | 1d     | Week 4  |
| 9   | Follow graph + feed     | 3.1  | 1–2w   | Month 2 |
| 10  | Recap                   | 3.3  | 1w     | Month 2 |
| 11  | Stories                 | 3.2  | 2w     | Month 3 |

**Ship order rationale:** #1–#3 are all low-risk and multiply each other
(social links make OG cards richer, OG cards make shares better, share menu
distributes both). #4 depends on #1 to avoid a second "Contact" refactor.

---

## 8. Cross-Cutting Concerns

### Review Uniqueness (Google Maps model)

- `public.reviews` enforces a database-level uniqueness constraint `UNIQUE(shop_place_id, user_id)` (`uniq_reviews_user_shop`).
- Each user may have at most one authoritative review per coffee shop. Multi-visit storytelling and repeat check-ins belong to `public.visits`.
- Rating aggregates (`refresh_shop_rating`), reviewer badge tiers (`useUserBadges`), and trending algorithms rely on this 1:1 invariant. Future roadmap features (Tier 2.4 review tags, Tier 3.3 annual recap) must assume reviews are deduped per user per shop.
- API `POST /api/reviews` pre-checks existing submissions and returns HTTP 409 prompting the user to edit their review; `PUT /api/reviews` is the exclusive update path.

### Security & moderation

- Every user-supplied URL is validated by a **domain allow-list**, not just
  `z.string().url()`. This prevents shops linking to phishing domains and
  keeps the "social" row trustworthy.
- New `ALLOWED_FIELDS` entries must never overlap `DISALLOWED_FIELDS`. Add a
  unit test asserting `ALLOWED_FIELDS ∩ DISALLOWED_FIELDS === ∅`.
- oEmbed route must be rate-limited (`checkRateLimit` already exists).

### Performance

- `videos` is JSONB with a GIN index — cheap to query, cheap to filter.
- `/api/videos/resolve` uses `revalidate = 86400` so repeated edits are cached.
- OG image generation runs at build/request time with Next's edge cache.

### Offline

The offline queue (`src/lib/offline/queue.ts`) only handles favorites, visits,
and reviews. Video add / social edit are **online-only** actions — no queue
change needed. Document this in the AddShopDialog submit error toast.

### i18n

All new copy is Vietnamese (matching the existing app). If English is ever
added, social platform labels ("Facebook", "TikTok") stay in Latin script.

### Analytics (future)

Recommended events once you add an analytics layer:

- `share_clicked { target, shop_id }`
- `video_opened { shop_id, platform }`
- `social_link_clicked { shop_id, platform }`

---

## 9. Definition of Done (per feature)

A feature is "done" when:

1. ✅ Migration committed with rollback block.
2. ✅ Zod schema accepts valid + rejects invalid (unit test).
3. ✅ `ALLOWED_FIELDS` updated in **both** admin routes (test asserting the set).
4. ✅ `mapDbShopToCoffeeShop` maps the new fields.
5. ✅ AddShopDialog + SuggestEditDialog + AdminSuggestionCard all surface the field.
6. ✅ Mobile (320px) and desktop (1280px) both render without horizontal scroll.
7. ✅ Tap targets on any new interactive element are ≥ 44px on mobile.
8. ✅ Playwright spec covers the golden path + one failure case.
9. ✅ `pnpm lint && pnpm tsc --noEmit && pnpm test` all green.
10. ✅ `CHANGELOG.md` (if it exists) updated.

---

## Appendix A — File Touch Matrix

| File                                       | 3.1 Social | 3.2 Share | 3.3 Videos | 3.4 OG | 4.4 Tags |
| ------------------------------------------ | :--------: | :-------: | :--------: | :----: | :------: |
| `src/types/shop.ts`                        |     ✅     |           |     ✅     |        |    ✅    |
| `src/lib/validations/shop.ts`              |     ✅     |           |     ✅     |        |          |
| `src/lib/supabase/shops.ts`                |     ✅     |           |     ✅     |        |          |
| `src/lib/utils/video.ts`                   |            |           |     ✅     |        |          |
| `src/lib/utils/share.ts`                   |            |    ✅     |            |        |          |
| `src/lib/utils/filters.ts`                 |            |           |            |        |    ✅    |
| `app/api/shops/create/route.ts`            |     ✅     |           |     ✅     |        |          |
| `app/api/shops/update/route.ts`            |     ✅     |           |     ✅     |        |          |
| `app/api/shops/suggest-edit/route.ts`      |     ✅     |           |     ✅     |        |          |
| `app/api/admin/suggestions/route.ts`       |     ✅     |           |     ✅     |        |          |
| `app/api/videos/resolve/route.ts`          |            |           |     ✅     |        |          |
| `app/(main)/shop/[id]/opengraph-image.tsx` |            |           |            |   ✅   |          |
| `AddShopDialog/ContactStep.tsx`            |     ✅     |           |            |        |          |
| `AddShopDialog/VideosStep.tsx`             |            |           |     ✅     |        |          |
| `SuggestEditDialog.tsx`                    |     ✅     |           |     ✅     |        |          |
| `AdminSuggestionCard.tsx`                  |     ✅     |           |     ✅     |        |          |
| `ShopDetailsContent/OverviewTab.tsx`       |     ✅     |           |            |        |          |
| `ShopDetailsContent/VideosTab.tsx`         |            |           |     ✅     |        |          |
| `ShopDetailsContent/TabBar.tsx`            |            |           |     ✅     |        |    ✅    |
| `ShopDetailClient.tsx`                     |            |    ✅     |            |        |          |
| `ShopDrawer.tsx`                           |            |    ✅     |            |        |          |
| `ReviewModal.tsx`                          |            |           |            |        |    ✅    |
| `ReviewCard.tsx`                           |            |           |            |        |    ✅    |

## Appendix B — Environment Variables

Add to `.env.example`:

```bash
# Optional: enables Instagram/Facebook oEmbed thumbnail resolution.
# Without this, those platforms fall back to a branded placeholder.
FB_OEMBED_TOKEN=your_facebook_app_access_token
```

## Appendix C — Reference Links

- TikTok oEmbed: https://developers.tiktok.com/doc/oembed/
- YouTube thumbnail URLs: `https://img.youtube.com/vi/{id}/hqdefault.jpg`
- Next.js OG images: https://nextjs.org/docs/app/api-reference/functions/image-response
- Zalo share: `https://zalo.me/share?u={encodedUrl}`
- lucide icons: `Facebook`, `Instagram`, `Youtube`, `MessageCircle`, `Music2`, `PlayCircle`
