# PhinFind — v2 Roadmap & Regression Plan

> **Status:** Planning
> **Owner:** _TBD_
> **Created:** 2026-09-10
> **Target Release:** v2.0.0
> **Baseline:** v1.0.0 (deployed on Vercel)

---

## Table of Contents

- [Overview](#overview)
- [Prioritization Framework](#prioritization-framework)
- [Tier 1 — Bugs & Broken Flows](#tier-1--bugs--broken-flows)
- [Tier 2 — High-Impact Features](#tier-2--high-impact-features)
- [Tier 3 — Technical Debt & Refactoring](#tier-3--technical-debt--refactoring)
- [Tier 4 — Performance & SEO](#tier-4--performance--seo)
- [Tier 5 — DevOps & Infrastructure](#tier-5--devops--infrastructure)
- [Milestones & Suggested Sprints](#milestones--suggested-sprints)
- [Regression Test Checklist](#regression-test-checklist)
- [Appendix](#appendix)

---

## Overview

PhinFind v1.0.0 is deployed and functional. This document captures the v2 work items identified from a full codebase review. Items are grouped into five tiers by priority and scope.

Each item contains:

- **ID** — stable reference (e.g., `BUG-01`) for commit messages and issue tracking
- **Priority** — P0 (blocker), P1 (important), P2 (nice-to-have)
- **Effort** — rough estimate
- **Files** — primary files to touch
- **Problem** — what's wrong or missing
- **Solution** — proposed approach
- **Acceptance Criteria** — how to verify the fix in regression

---

## Prioritization Framework

| Tier      | Category             | When to do                                  |
| --------- | -------------------- | ------------------------------------------- |
| 🔴 Tier 1 | Bugs & Broken Flows  | Immediately — users hit these in production |
| 🟡 Tier 2 | High-Impact Features | v2 sprint — moves the product forward       |
| 🟢 Tier 3 | Technical Debt       | Interleaved — unblocks future velocity      |
| 🔵 Tier 4 | Performance & SEO    | Before marketing push                       |
| ⚙️ Tier 5 | DevOps & Infra       | Ongoing — hardens the platform              |

Priority definitions:

- **P0** — user-facing broken behavior, must fix in v2
- **P1** — important improvement, strongly recommended
- **P2** — polish, defer if time is short

---

## Tier 1 — Bugs & Broken Flows

### [ ] BUG-01 — Shop ratings never update after reviews

| Field    | Value                                                     |
| -------- | --------------------------------------------------------- |
| Priority | **P0**                                                    |
| Effort   | 1–2 hours                                                 |
| Files    | `supabase/schema_reviews.sql`, `app/api/reviews/route.ts` |

**Problem**
Submitting a review inserts into `reviews` but never updates `shops.rating` or `shops.total_ratings`. Shop cards continue to show stale or "Mới" (new) forever.

**Solution**
Add a Postgres trigger that recalculates aggregates on review INSERT / UPDATE / DELETE.

```sql
CREATE OR REPLACE FUNCTION public.refresh_shop_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_place_id TEXT;
BEGIN
  target_place_id := COALESCE(NEW.shop_place_id, OLD.shop_place_id);

  UPDATE public.shops
  SET rating = COALESCE(
        (SELECT ROUND(AVG(rating)::numeric, 2)
         FROM public.reviews
         WHERE shop_place_id = target_place_id),
        0
      ),
      total_ratings = (
        SELECT COUNT(*) FROM public.reviews WHERE shop_place_id = target_place_id
      ),
      updated_at = NOW()
  WHERE place_id = target_place_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_refresh_shop_rating ON public.reviews;
CREATE TRIGGER trg_refresh_shop_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.refresh_shop_rating();
```

Also backfill existing shops once:

```sql
UPDATE public.shops s
SET rating = COALESCE((SELECT ROUND(AVG(r.rating)::numeric,2) FROM public.reviews r WHERE r.shop_place_id = s.place_id), 0),
    total_ratings = (SELECT COUNT(*) FROM public.reviews r WHERE r.shop_place_id = s.place_id);
```

**Acceptance Criteria**

- [ ] Submitting a new review updates the shop's `rating` and `total_ratings`
- [ ] Deleting a review recalculates both fields
- [ ] Editing a review recalculates both fields
- [ ] New shop with 0 reviews shows `rating = 0`, `total_ratings = 0`
- [ ] Trigger is SECURITY DEFINER (RLS bypass for the update)

---

### [ ] BUG-02 — Google Sign-In is a fake toast

| Field    | Value                                                                                       |
| -------- | ------------------------------------------------------------------------------------------- |
| Priority | **P0**                                                                                      |
| Effort   | 3–4 hours (mostly Supabase + Google Cloud config)                                           |
| Files    | `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, new `app/auth/callback/route.ts` |

**Problem**
`handleGoogleSignIn` in both auth pages only fires a toast: _"Tính năng Đăng nhập bằng Google sẽ sớm ra mắt!"_ — misleading to users.

**Solution**
Option A (implement):

1. Create Google OAuth credentials in Google Cloud Console
2. Enable Google provider in Supabase → Authentication → Providers
3. Add the callback route:

```ts
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${redirect}`);
  }
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
```

4. Wire button:

```ts
const handleGoogleSignIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`
    }
  });
  if (error) toast.error(error.message);
};
```

Option B (remove): Delete both Google buttons and simplify the auth pages.

**Acceptance Criteria**

- [ ] Google button triggers an OAuth flow (not a toast)
- [ ] On successful OAuth, user is redirected back and logged in
- [ ] Profile row is created via existing `handle_new_user` trigger
- [ ] Failed OAuth shows a friendly error
- [ ] Supabase Redirect URLs include `https://<prod-domain>/auth/callback` and `http://localhost:3000/auth/callback`

---

### [ ] BUG-03 — Password reset link is `href="#"`

| Field    | Value                                                                                                            |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| Priority | **P0**                                                                                                           |
| Effort   | 2 hours                                                                                                          |
| Files    | `app/(auth)/login/page.tsx`, new `app/(auth)/forgot-password/page.tsx`, new `app/(auth)/reset-password/page.tsx` |

**Problem**
Line ~98 of `login/page.tsx` renders `<a href="#">Quên mật khẩu?</a>`. Dead link.

**Solution**

1. New page `/forgot-password` with an email input that calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })`
2. New page `/reset-password` that Supabase redirects to with a token in the URL hash; call `supabase.auth.updateUser({ password })`
3. Update login link to `href="/forgot-password"`

**Acceptance Criteria**

- [ ] "Quên mật khẩu?" navigates to `/forgot-password`
- [ ] Submitting a valid email shows a success message
- [ ] Email link opens `/reset-password` and allows setting a new password
- [ ] User can then log in with the new password
- [ ] Invalid/expired token shows a friendly error
- [ ] Add `/reset-password` to Supabase Redirect URLs

---

### [ ] BUG-04 — No way to edit/delete a shop you created

| Field    | Value                                                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Priority | **P1**                                                                                                                                                                                            |
| Effort   | 4–6 hours                                                                                                                                                                                         |
| Files    | `app/api/shops/create/route.ts` (add PUT/DELETE), new `app/api/shops/update/route.ts`, `src/components/shop/AddShopDialog.tsx` (reuse in edit mode), `src/components/shop/ShopDetailsContent.tsx` |

**Problem**
Users can create custom shops via `/api/shops/create` but cannot edit or remove them. RLS policies already permit UPDATE/DELETE on own shops.

**Solution**

1. Add `PUT /api/shops/[placeId]` — validate `auth.uid() = created_by`
2. Add `DELETE /api/shops/[placeId]` — same check + cascade cleanup of favorites/reviews? (decide: soft delete vs hard delete)
3. Reuse `AddShopDialog` in "edit mode" (accept an optional `shop` prop, prefill form, different submit)
4. Show "Chỉnh sửa" / "Xóa" buttons in `ShopDetailsContent` if `shop.created_by === currentUser.id`
5. After delete, invalidate `['shops']` and redirect home

**Acceptance Criteria**

- [ ] Owner sees edit/delete actions on their own shops
- [ ] Non-owner does NOT see those actions
- [ ] Editing updates fields and re-marks `verified = false`
- [ ] Deleting removes the shop and cascades appropriately
- [ ] RLS blocks unauthorized UPDATE/DELETE attempts (verify via direct API call)
- [ ] Toast confirmations on success/failure

---

### [ ] BUG-05 — Visit notes exist in DB but no UI

| Field    | Value                                                                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Priority | **P1**                                                                                                                                              |
| Effort   | 2 hours                                                                                                                                             |
| Files    | `src/components/shop/ShopDrawer.tsx`, `src/components/shop/ShopSidebar.tsx`, new `src/components/shop/VisitNoteDialog.tsx`, `src/hooks/useShops.ts` |

**Problem**
`visits.note` column exists, `useToggleVisit` accepts a `note` param, but no component ever passes one. Feature is half-built.

**Solution**

1. New `VisitNoteDialog` — opens when toggling "Ghé thăm" with `note: null`
2. Optional textarea (max 200 chars) + "Bỏ qua" / "Lưu ghi chú"
3. If skipping, still create visit with `note = null`
4. Show existing note (if any) when editing
5. Wire into `ShopDrawer` and `ShopSidebar` bottom action bars

**Acceptance Criteria**

- [ ] Tapping "Ghé thăm" opens the dialog (not instant toggle)
- [ ] User can save with or without a note
- [ ] Note appears on the shop detail / profile "Đã ghé" card
- [ ] Editing a visit updates the note
- [ ] Un-marking a visit still works (no dialog)

---

### [ ] BUG-06 — Legacy `ShopCard` uses hardcoded `bg-white`

| Field    | Value                                                                    |
| -------- | ------------------------------------------------------------------------ |
| Priority | **P2**                                                                   |
| Effort   | 30 min                                                                   |
| Files    | `src/components/shop/ShopCard.tsx`, `src/components/common/ShopCard.tsx` |

**Problem**
`src/components/shop/ShopCard.tsx` uses `bg-white`, `text-phin-900`, `border-phin-100` — breaks in dark mode. It's re-exported by `src/components/common/ShopCard.tsx` but appears unused (the app uses `bento/*` and `FavoriteShopCard`).

**Solution**
Verify unused → delete both files. If still referenced, migrate to theme tokens (`bg-card`, `text-foreground`, `border-border`).

**Acceptance Criteria**

- [ ] No `import` of `ShopCard` from either path remains in the codebase (grep confirms)
- [ ] OR: file renders correctly in light AND dark mode
- [ ] Build passes

---

## Tier 2 — High-Impact Features

### [ ] FEAT-01 — Admin / Moderation panel

| Field    | Value                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------- |
| Priority | **P1**                                                                                                  |
| Effort   | 1–2 days                                                                                                |
| Files    | new `app/(main)/admin/page.tsx`, `supabase/migration_add_user_role.sql`, `app/api/admin/shops/route.ts` |

**Problem**
Shops created by users stay `verified = false` forever. Nobody can approve them. No report/flag mechanism either.

**Solution**

1. Add `role` column to `profiles` (`'user' | 'admin'`, default `'user'`)
2. New `/admin` route gated by `role === 'admin'`
3. Sections:
   - **Pending shops** — list with approve/reject
   - **Flagged content** — reviews with ≥3 reports
   - **Users** — promote/demote admins
4. Approve → `UPDATE shops SET verified = true`
5. Add `report` button on reviews/shops → `reports` table

**Acceptance Criteria**

- [ ] Non-admins cannot access `/admin` (redirect to home)
- [ ] Admin sees pending shops with full details
- [ ] Approving a shop sets `verified = true` and it appears in Discover without the "Chờ xác minh" badge
- [ ] Rejecting marks it `verified = false` AND hides it from public lists (add `hidden` flag)
- [ ] RLS policies updated to allow admin role

---

### [ ] FEAT-02 — Public user profiles

| Field    | Value                                                                                    |
| -------- | ---------------------------------------------------------------------------------------- |
| Priority | **P1**                                                                                   |
| Effort   | Half day                                                                                 |
| Files    | new `app/(main)/u/[username]/page.tsx`, `src/components/profile/PublicProfileHeader.tsx` |

**Problem**
No way to see another user's reviews. Feels antisocial.

**Solution**

1. Route `/u/[username]` → fetch profile by username, then their public reviews
2. Reuse card components from Profile page
3. Link author names in review cards to their profile
4. Handle `username IS NULL` (some users haven't set one)

**Acceptance Criteria**

- [ ] `/u/alice` loads Alice's public profile
- [ ] Shows avatar, name, bio, stats, review list
- [ ] Clicking a reviewer's name navigates there
- [ ] 404 for non-existent username
- [ ] Own profile redirects to `/profile`
- [ ] Works for logged-out users

---

### [ ] FEAT-03 — Review editing + likes / "Hữu ích" votes

| Field    | Value                                                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Priority | **P1**                                                                                                                                                            |
| Effort   | 1 day                                                                                                                                                             |
| Files    | new `supabase/schema_review_likes.sql`, `app/api/reviews/[id]/like/route.ts`, `src/components/shop/ReviewModal.tsx`, `src/components/shop/ShopDetailsContent.tsx` |

**Problem**
Reviews can be created and deleted, but not edited. No way to signal helpfulness.

**Solution**

1. **Edit** — add `reviewId` prop to `ReviewModal`, PUT to `/api/reviews?id=...` (API already supports it, add UI)
2. **Likes** — new table:

```sql
CREATE TABLE public.review_likes (
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);
```

3. Add `/api/reviews/[id]/like` POST/DELETE
4. Show `👍 Hữu ích (N)` button on each review card
5. Optimistic toggle

**Acceptance Criteria**

- [ ] Owner sees "Chỉnh sửa" on their review; opens prefilled modal
- [ ] Edited review re-marks `updated_at` and shows "đã chỉnh sửa"
- [ ] Any authenticated user can like/unlike a review
- [ ] Like count visible without auth
- [ ] Logged-out user gets login prompt on like
- [ ] RLS prevents liking your own review (optional policy)

---

### [ ] FEAT-04 — Notifications

| Field    | Value                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| Priority | **P2**                                                                                                                     |
| Effort   | 2–3 days                                                                                                                   |
| Files    | new `supabase/schema_notifications.sql`, new `src/components/layout/NotificationBell.tsx`, `src/hooks/useNotifications.ts` |

**Problem**
No way to know when someone likes your review, replies, or when an admin approves your shop.

**Solution**

1. `notifications` table (`user_id`, `type`, `payload JSONB`, `read_at`)
2. Triggers create rows on: review like, shop approved, new follower
3. Realtime subscription via Supabase channels
4. Bell icon in Header with unread count
5. Dropdown list, mark-all-read

**Acceptance Criteria**

- [ ] Bell shows unread count
- [ ] New likes appear without refresh
- [ ] Clicking a notification deep-links to relevant content
- [ ] Marking read decrements count
- [ ] No notifications for your own actions

---

### [ ] FEAT-05 — Badge / achievement system

| Field    | Value                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------ |
| Priority | **P2**                                                                                           |
| Effort   | 1–2 days                                                                                         |
| Files    | `src/lib/utils/badges.ts`, `src/components/profile/BadgeCard.tsx`, `app/(main)/profile/page.tsx` |

**Problem**
Profile shows hardcoded "Đồng" for badges. Gamification lever unused.

**Solution**
Define tiers by combined activity (reviews + visits + favorites):

- **Đồng** — 0–9 contributions
- **Bạc** — 10–49
- **Vàng** — 50–199
- **Kim Cương** — 200+

Add progress bar, unlock toast, and per-category badges (Reviewer, Explorer, Curator).

**Acceptance Criteria**

- [ ] Profile badge updates based on real counts
- [ ] Progress bar shows next tier threshold
- [ ] Unlock toast fires once when crossing a tier
- [ ] Tier logic in pure function + unit testable

---

### [ ] FEAT-06 — Offline queue for actions (PWA)

| Field    | Value                                                                            |
| -------- | -------------------------------------------------------------------------------- |
| Priority | **P2**                                                                           |
| Effort   | 2–3 days                                                                         |
| Files    | `src/lib/offline/queue.ts`, `public/sw.js` (regenerate), `src/hooks/useShops.ts` |

**Problem**
If the user favorites / reviews a shop while offline, the request fails silently. Real PWA differentiator for coffee discovery on-the-go.

**Solution**

1. IndexedDB queue for pending mutations
2. Intercept fetch failures in `useToggleFavorite`, `useToggleVisit`, review POST
3. Background Sync API (or periodic retry on `online` event)
4. UI indicator: "Đang chờ đồng bộ (N)"
5. Confirmation toast when sync completes

**Acceptance Criteria**

- [ ] Favoriting offline succeeds locally; request queued
- [ ] On reconnect, queue drains and DB is updated
- [ ] Failed syncs retry with backoff
- [ ] Indicator shows pending count
- [ ] No duplicate POSTs (idempotency)

---

### [ ] FEAT-07 — Filters v2

| Field    | Value                                                                                                                                                       |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Priority | **P1**                                                                                                                                                      |
| Effort   | 1 day                                                                                                                                                       |
| Files    | `src/stores/useUIStore.ts`, `src/components/bento/FilterChips.tsx`, `src/components/bento/FilterCard.tsx`, `app/(main)/page.tsx`, `app/(main)/map/page.tsx` |

**Problem**
Filters are limited to open-now, min-rating, and sort. Price range, amenities, and radius are ignored even though the DB has the data.

**Solution**
Extend `ShopFilterState`:

```ts
interface ShopFilterState {
  openNowOnly: boolean;
  minRating: number;
  sortBy: 'distance' | 'rating' | 'name';
  priceRanges: Array<'₫' | '₫₫' | '₫₫₫' | '₫₫₫₫'>;
  requiredAmenities: string[]; // amenity ids
  radiusKm: number; // 1..10
}
```

Apply client-side (small dataset) or server-side via query params. Add a filter sheet on Map and expand FilterCard on Discover.

**Acceptance Criteria**

- [ ] Price chips filter shops by `price_range`
- [ ] Amenity chips (Wi-Fi, Parking, Pet-friendly, etc.) filter by `amenities[].id`
- [ ] Radius slider changes search radius from 1–10 km
- [ ] Reset button clears all
- [ ] Filter state persists across Discover ↔ Map
- [ ] Active filter count badge accurate

---

### [x] FEAT-08 — Community edit suggestions

| Field      | Value                                                                                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Priority   | **P2**                                                                                                                                                                                                                                                             |
| Effort     | 3–4 days                                                                                                                                                                                                                                                           |
| Files      | new `supabase/schema_shop_edit_suggestions.sql`, new `app/api/shops/suggest-edit/route.ts`, new `app/api/admin/suggestions/route.ts`, new `src/components/shop/SuggestEditDialog.tsx`, `src/components/shop/ShopDetailsContent.tsx` (kebab menu entry point) |
| Blocked by | FEAT-01 (admin panel) — this item cannot ship before the admin queue exists                                                                                                                                                                                        |
| Depends on | BUG-04 (kebab menu must exist as the entry point before adding a second menu item)                                                                                                                                                                                 |

**Problem**
Owner-only editing (as shipped in BUG-04) traps shops with stale data when the creator becomes inactive, deletes their account, or simply stops using the app. Because `created_by` uses `ON DELETE SET NULL`, orphaned shops have no one who can correct wrong hours, wrong location, permanently-closed status, or wrong contact info. Community-suggested edits with admin moderation solve this by allowing any authenticated visitor to propose corrections that flow through the moderation queue.

**Solution**
A suggest-then-moderate workflow that empowers trusted visitors while maintaining data integrity:

1. Any authenticated user can propose a change from the shop kebab menu (the same menu added in BUG-04).
2. The dialog is diff-style: current values rendered read-only on one side, proposed values editable on the other. Only the fields being changed are editable; all other fields lock to their current value.
3. Submissions create a row in a new `shop_edit_suggestions` table with status `pending`.
4. Admin reviews suggestions in the same queue as unverified shops (FEAT-01).
5. On approve: apply the JSONB diff to `public.shops`, reset `verified` to `false` briefly, then re-verify; credit the suggester.
6. On reject: keep the suggestion row for audit purposes with status `rejected` and a review note.
7. Never allow suggestions to modify: `place_id`, `created_by`, `rating`, `total_ratings`, `verified`, `created_at`.

**Schema**

```sql
CREATE TABLE public.shop_edit_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_place_id TEXT NOT NULL REFERENCES public.shops(place_id) ON DELETE CASCADE,
  suggested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  changes JSONB NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies:
-- 1. INSERT: Authenticated users can insert with suggested_by = auth.uid()
-- 2. SELECT: Users can select their own suggestions (suggested_by = auth.uid())
-- 3. SELECT (admin): Admins can select all suggestions
-- 4. UPDATE (admin): Admins can update status, reviewed_by, reviewed_at, and review notes
```

> [!WARNING]
> **Schema Guardrail (REVIEWS-FK-AMBIGUITY):**
> Ensure `reviewed_by` belongs strictly to `public.shop_edit_suggestions`.
> Do NOT add `reviewed_by` or any other foreign key pointing to `public.profiles` on `public.reviews`.
> `public.reviews` already has `user_id REFERENCES public.profiles(id)`. Adding a second foreign key pointing to `profiles` on `reviews` breaks all PostgREST relationship embeds (`profiles(...)`) with:
> *"Could not embed because more than one relationship was found for 'reviews' and 'profiles'"*.

**Guardrails**

- Rate limit to 3 suggestions/day/user, reusing the Upstash limiter from OPS-03
- Reject diffs that change more than 3 fields at once
- Block self-review (a user cannot approve their own suggestion)
- Notify the shop owner when a suggestion is pending; if the owner is inactive, admin decides
- Enforce one pending suggestion per shop per user
- Field allowlist as described above
- Repeated rejections revoke suggestion privileges

**UX Signals**

- Users with a `visits` row for the shop see a "Bạn đã ghé quán này" hint inside the suggest dialog
- Users with reviews on the shop see a similar signal
- Admin queue sorts by suggester trust (combined visits + reviews count) so high-signal suggestions surface first

**Acceptance Criteria**

- [x] Authenticated non-owners see "Đề xuất chỉnh sửa" in the kebab menu
- [x] Owners do NOT see this option (they use "Chỉnh sửa quán" instead)
- [x] Suggestions land in the admin queue with a readable diff
- [x] Approving a suggestion applies only the changed fields
- [x] Rejecting preserves the audit trail
- [x] Field allowlist enforced server-side
- [x] Rate limit returns 429 with Retry-After
- [x] Owner receives an in-app notification when a suggestion is pending

---

## Tier 3 — Technical Debt & Refactoring

### [x] TD-01 — Split `AddShopDialog.tsx` (1,857 lines)

| Field    | Value                                            |
| -------- | ------------------------------------------------ |
| Priority | **P1**                                           |
| Effort   | 1 day                                            |
| Files    | `src/components/shop/AddShopDialog.tsx` → folder |

**Solution**
Extract into:

```
src/components/shop/AddShopDialog/
├── index.tsx              # Main dialog + reducer
├── BasicInfoStep.tsx
├── LocationStep.tsx
├── AmenitiesStep.tsx
├── HoursStep.tsx
├── PhotosStep.tsx
├── PreviewCard.tsx
└── useAddShopForm.ts      # Form state hook / reducer
```

**Acceptance Criteria**

- [x] Each file < 300 lines
- [x] No behavior change — feature parity verified manually
- [x] All imports updated
- [x] Build + lint pass

---

### [ ] TD-02 — Split `ShopDetailsContent.tsx` (1,600 lines)

| Field    | Value                                                 |
| -------- | ----------------------------------------------------- |
| Priority | **P1**                                                |
| Effort   | 1 day                                                 |
| Files    | `src/components/shop/ShopDetailsContent.tsx` → folder |

**Solution**

```
src/components/shop/ShopDetailsContent/
├── index.tsx              # Tabs shell
├── Gallery.tsx            # Hero collage
├── Header.tsx             # Title, address, metrics
├── OverviewTab.tsx
├── PhotosTab.tsx
├── ReviewsTab.tsx
├── AmenitiesTab.tsx
├── getShopSchedule.ts
└── types.ts
```

**Acceptance Criteria**

- [ ] Each file < 400 lines
- [ ] Public exports preserved (used by Drawer, Sidebar, standalone page)
- [ ] No visual regression
- [ ] Build passes

---

### [ ] TD-03 — Standardize on Next.js `<Image>`

| Field    | Value                                                                    |
| -------- | ------------------------------------------------------------------------ |
| Priority | **P1**                                                                   |
| Effort   | Half day                                                                 |
| Files    | new `src/components/common/ShopImage.tsx`, then sweep all `<img>` usages |

**Problem**
`next.config.ts` is configured with `remotePatterns` but almost every image uses raw `<img>`. Losing WebP/AVIF, srcset, and optimization.

**Solution**

1. Create `<ShopImage>` wrapper that:
   - Uses `<Image>` with `fill` or explicit sizes
   - Falls back to `ShopCardPlaceholder` on error
   - Handles Supabase/Unsplash/Geoapify hosts
2. Replace `<img>` in: `ShopCard*`, `FavoriteShopCard`, `ShopDetailsContent`, `ShopDrawer`, `Profile`, `ReviewModal`

**Acceptance Criteria**

- [ ] All shop/photo images use `<ShopImage>`
- [ ] LCP improved (verify in Lighthouse)
- [ ] Placeholder fallback still works on broken URLs
- [ ] No console errors for unconfigured hosts

---

### [ ] TD-04 — Dead code cleanup

| Field    | Value     |
| -------- | --------- |
| Priority | **P2**    |
| Effort   | 2–3 hours |

**Items to remove / consolidate**

- [ ] `src/lib/utils/cn.ts` — duplicate of `src/lib/utils.ts`
- [ ] `src/components/common/ShopCard.tsx` — pure re-export
- [ ] `src/components/shop/ShopDetailModal.tsx` — just wraps `ShopDrawer`
- [ ] One of the three search bars (`common/SearchBar`, `bento/SearchBar`, inline in Header/MapPage)
- [ ] `next-themes` from `package.json` (custom ThemeProvider in use)

**Acceptance Criteria**

- [ ] `grep -r` confirms no remaining imports
- [ ] Build + lint pass
- [ ] Bundle size reduced (check `next build` output)

---

### [ ] TD-05 — Dependency audit

| Field    | Value  |
| -------- | ------ |
| Priority | **P2** |
| Effort   | 1 hour |

**Action**
Run `npx depcheck` and remove/reassign:

- Likely unused: `@tanstack/react-virtual`, `react-virtuoso`, `embla-carousel-react`, `@radix-ui/react-checkbox`, `@radix-ui/react-navigation-menu`, `autoprefixer`
- Move to devDeps: `@types/leaflet.markercluster`, `dotenv`

**Acceptance Criteria**

- [ ] `pnpm install` clean
- [ ] Build passes
- [ ] No runtime errors from removed packages

---

### [ ] TD-06 — Fix non-standard `DialogContent`

| Field    | Value                          |
| -------- | ------------------------------ |
| Priority | **P2**                         |
| Effort   | 1–2 hours                      |
| Files    | `src/components/ui/dialog.tsx` |

**Problem**
Wraps `DialogPrimitive.Content` in an extra positioning `<div>` that breaks Radix's focus trap / portal assumptions.

**Solution**
Revert to the standard shadcn `DialogContent` pattern with animation classes handled via `data-[state]` attributes (already present in `globals.css`).

**Acceptance Criteria**

- [ ] Focus trap works (Tab cycles inside)
- [ ] Escape closes
- [ ] Animations still smooth
- [ ] No regressions in `AddShopDialog`, `ReviewModal`, `AddShopDialog`, edit-profile dialog

---

### [ ] TD-07 — Add error boundaries

| Field    | Value  |
| -------- | ------ |
| Priority | **P1** |
| Effort   | 1 hour |

**Files to add**

- `app/error.tsx`
- `app/global-error.tsx`
- `app/(main)/error.tsx`
- `app/(auth)/error.tsx`

**Acceptance Criteria**

- [ ] Throwing inside a route shows a friendly error page (not Next.js default)
- [ ] "Thử lại" button re-renders
- [ ] Error is logged (Sentry, when added)

---

### [ ] TD-08 — Add unit + e2e tests

| Field    | Value    |
| -------- | -------- |
| Priority | **P1**   |
| Effort   | 2–3 days |

**Solution**

- **Vitest** for pure functions:
  - `getShopSchedule` (opening hours logic)
  - `generateCardSizes` (bento layout)
  - `calculateDistanceMeters` / `formatDistanceText`
  - `cleanCategoryLabel` / `formatShopCategoryTagline`
  - `getShopPlaceholderIllustration`
- **Playwright** for critical path:
  1. Signup → verify profile created
  2. Search → open shop → favorite
  3. Write review with image
  4. Edit profile
  5. Delete review

**Acceptance Criteria**

- [ ] ≥ 80% coverage on `src/lib/utils/*`
- [ ] E2E suite runs against preview deploy in CI
- [ ] `pnpm test` and `pnpm test:e2e` scripts added to `package.json`

---

## Tier 4 — Performance & SEO

### [ ] PERF-01 — Server-side shop detail page

| Field    | Value                           |
| -------- | ------------------------------- |
| Priority | **P1**                          |
| Effort   | Half day                        |
| Files    | `app/(main)/shop/[id]/page.tsx` |

**Problem**
Detail page is `'use client'`, so:

- No `generateMetadata` → no OG tags for shares
- Shop HTML not in initial response → poor SEO
- Data fetched client-side

**Solution**

1. Convert to Server Component:

```tsx
export async function generateMetadata({ params }) {
  /* fetch shop, return OG */
}
export default async function Page({ params }) {
  const shop = await fetchShop(params.id); // direct Supabase call
  return <ShopDetailClient shop={shop} />;
}
```

2. Extract interactive bits to a `'use client'` child

**Acceptance Criteria**

- [ ] `view-source` shows shop name/address in HTML
- [ ] Sharing on Facebook/Zalo produces a rich card with photo
- [ ] Lighthouse SEO score ≥ 90
- [ ] Time-to-content improves vs. v1

---

### [ ] PERF-02 — Optimize `/api/shops/nearby` with earthdistance

| Field    | Value                                                        |
| -------- | ------------------------------------------------------------ |
| Priority | **P1**                                                       |
| Effort   | 2 hours                                                      |
| Files    | `app/api/shops/nearby/route.ts`, `supabase/schema_shops.sql` |

**Problem**
Selects all shops, transfers them, sorts client-side. O(n) transfer + memory.

**Solution**
Use Postgres `earthdistance` (already enabled). Add an RPC:

```sql
CREATE OR REPLACE FUNCTION public.nearby_shops(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  max_km DOUBLE PRECISION DEFAULT 10,
  page_limit INT DEFAULT 20,
  page_offset INT DEFAULT 0
)
RETURNS SETOF public.shops AS $$
  SELECT *
  FROM public.shops
  WHERE earth_box(ll_to_earth(user_lat, user_lon), max_km * 1000) @> ll_to_earth(lat, lon)
    AND earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(lat, lon)) <= max_km * 1000
  ORDER BY earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(lat, lon))
  LIMIT page_limit OFFSET page_offset;
$$ LANGUAGE sql STABLE;
```

Call via `supabase.rpc('nearby_shops', {...})`.

**Acceptance Criteria**

- [ ] Response time < 300ms with 1,000+ shops
- [ ] Only nearby rows transferred
- [ ] Works with `limit` and `offset` params
- [ ] Distance still correctly computed client-side

---

### [ ] PERF-03 — Paginate reviews

| Field    | Value                                                                                    |
| -------- | ---------------------------------------------------------------------------------------- |
| Priority | **P2**                                                                                   |
| Effort   | 2 hours                                                                                  |
| Files    | `app/api/reviews/route.ts`, `src/hooks/useShops.ts`, `ShopDetailsContent/ReviewsTab.tsx` |

**Solution**
Cursor-based pagination: `GET /api/reviews?placeId=...&cursor=<created_at>&limit=20`. "Tải thêm" button on ReviewsTab.

**Acceptance Criteria**

- [ ] Reviews load 20 at a time
- [ ] "Tải thêm" loads the next page
- [ ] Total count still accurate
- [ ] Review submission prepends to list

---

### [ ] PERF-04 — Reduce JS bundle

| Field    | Value  |
| -------- | ------ |
| Priority | **P2** |
| Effort   | 1 day  |

**Solution**

1. Add `@next/bundle-analyzer`
2. Consider replacing `framer-motion` with `motion` (v11+ lighter package)
3. Lazy-load heavy components: `AddShopDialog`, `ReviewModal`, `ImageOverlay`
4. `dynamic(() => import(...), { ssr: false })` where appropriate

**Acceptance Criteria**

- [ ] First-load JS < 150KB (gzipped)
- [ ] Lighthouse Performance ≥ 85 on mobile

---

## Tier 5 — DevOps & Infrastructure

### [ ] OPS-01 — GitHub Actions CI

| Field    | Value   |
| -------- | ------- |
| Priority | **P1**  |
| Effort   | 2 hours |

**File:** `.github/workflows/ci.yml`

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm tsc --noEmit
      - run: pnpm build
```

**Acceptance Criteria**

- [ ] Workflow runs on every PR
- [ ] Failing lint/typecheck/build blocks merge
- [ ] Branch protection enabled on `main`

---

### [ ] OPS-02 — Vercel Analytics + Sentry

| Field    | Value   |
| -------- | ------- |
| Priority | **P1**  |
| Effort   | 3 hours |

**Solution**

1. Enable Vercel Analytics in dashboard
2. Install `@sentry/nextjs`; run wizard; wrap `next.config.ts`
3. Capture user + shop context in error reports
4. Set `tracesSampleRate` to 0.1 in prod

**Acceptance Criteria**

- [ ] Page views visible in Vercel Analytics
- [ ] Test error appears in Sentry
- [ ] Source maps uploaded for readable stack traces

---

### [ ] OPS-03 — Rate limiting

| Field    | Value   |
| -------- | ------- |
| Priority | **P1**  |
| Effort   | 4 hours |

**Solution**
Upstash Redis + `@upstash/ratelimit`:

- `/api/reviews` POST — 5/hour/user
- `/api/shops/create` POST — 3/day/user
- `/api/shops/search` GET — 60/min/IP
- `/api/user/*` — 60/min/user

Return 429 with `Retry-After` header.

**Acceptance Criteria**

- [ ] Exceeding limits returns 429
- [ ] Limits per-key (user id or IP) not global
- [ ] Legitimate users unaffected

---

### [ ] OPS-04 — Backups & monitoring

| Field    | Value  |
| -------- | ------ |
| Priority | **P2** |
| Effort   | 1 hour |

**Actions**

- [ ] Confirm Supabase daily backups (paid plan)
- [ ] Set up Better Stack / UptimeRobot monitor on prod URL
- [ ] Alert channel (email/Slack)
- [ ] Document restore procedure in `docs/ops/`

---

## Milestones & Suggested Sprints

### Milestone A — "v2.0 Stable" (2 weeks)

**Week 1**

- BUG-01 (ratings trigger)
- BUG-02 (Google OAuth)
- BUG-03 (password reset)
- BUG-06 (dark mode card)
- PERF-01 (server-side detail page)
- PERF-02 (nearby RPC)
- TD-07 (error boundaries)
- OPS-01 (CI)

**Week 2**

- FEAT-01 (admin panel)
- FEAT-02 (public profiles)
- FEAT-03 (review edit + likes)
- FEAT-07 (filters v2)
- OPS-02 (analytics + Sentry)
- OPS-03 (rate limiting)

### Milestone B — "v2.1 Polish" (following sprint)

- TD-01 / TD-02 (split large files)
- TD-03 (Next Image)
- TD-04 / TD-05 (cleanup)
- TD-08 (tests)
- FEAT-05 (badges)
- PERF-03 / PERF-04

### Milestone C — "v2.2 Differentiators" (future)

- FEAT-04 (notifications)
- FEAT-06 (offline queue)
- BUG-04 (edit/delete shop)
- BUG-05 (visit notes)
- FEAT-08 (community edit suggestions)

### Weekend-Only Scope

If time-constrained, ship only:

1. BUG-01 (ratings)
2. BUG-03 (password reset)
3. BUG-06 (dark mode)
4. TD-07 (error boundaries)
5. OPS-01 (CI)

---

## Regression Test Checklist

Use this checklist before every release. Mark each item ✅ or ❌ and note issues.

### Auth

- [ ] Email/password signup creates profile row
- [ ] Email/password login works
- [ ] Google OAuth login works (BUG-02)
- [ ] Password reset flow completes (BUG-03)
- [ ] Sign-out clears session and redirects
- [ ] Protected routes redirect to login when logged out

### Discover

- [ ] Bento grid renders with mixed card sizes
- [ ] Search filters by name and address
- [ ] Filter chips (open now, rating, sort) work
- [ ] Filters v2 (price, amenities, radius) work (FEAT-07)
- [ ] Infinite scroll loads more shops
- [ ] Floating filter bar appears on scroll
- [ ] Shop card opens ShopDrawer with correct data
- [ ] Favorite toggle persists across reload

### Map

- [ ] Map loads with user location marker
- [ ] Shop markers cluster correctly
- [ ] Selecting a marker opens sidebar (desktop) / drawer (mobile)
- [ ] Search autocomplete dropdown works
- [ ] Filter sheet applies changes live
- [ ] Add-shop FAB opens dialog

### Shop Detail

- [ ] Gallery collage renders (1 / 2 / 3+ images)
- [ ] Tabs switch: Overview, Photos, Reviews, Amenities
- [ ] Opening hours display correct for today (BUG-01 dependents)
- [ ] Reviews list loads and paginates (PERF-03)
- [ ] Write review submits with images
- [ ] Edit review works (FEAT-03)
- [ ] Delete review removes it and updates rating (BUG-01)
- [ ] Like button increments/decrements (FEAT-03)
- [ ] Directions opens Google Maps

### Favorites & Visits

- [ ] Favorites list shows saved shops
- [ ] Removing a favorite updates state
- [ ] Visit toggle works
- [ ] Visit note saves (BUG-05)
- [ ] Empty states render correctly

### Profile

- [ ] Profile page loads with correct stats
- [ ] Edit profile saves changes (name, username, bio, avatar)
- [ ] Avatar upload works
- [ ] Tabs: Reviews / Saved / Visited all load
- [ ] Public profile `/u/[username]` works (FEAT-02)
- [ ] Badge tier displays correctly (FEAT-05)

### Admin (FEAT-01)

- [ ] Admin sees pending shops
- [ ] Approve sets `verified = true`
- [ ] Reject hides shop
- [ ] Non-admin redirected from `/admin`

### PWA

- [ ] Manifest served
- [ ] Service worker registers
- [ ] Install prompt appears on mobile
- [ ] Offline page loads (or graceful degradation)
- [ ] Offline action queue drains on reconnect (FEAT-06)

### Theme

- [ ] Light mode renders correctly on all pages
- [ ] Dark mode renders correctly on all pages
- [ ] Theme persists across reload
- [ ] System theme follows OS changes

### Performance

- [ ] Lighthouse Performance ≥ 85 (mobile)
- [ ] Lighthouse SEO ≥ 90 (PERF-01)
- [ ] First Contentful Paint < 2s
- [ ] No bundle regression > 10%

### Error Handling

- [ ] Error boundary shows on forced error (TD-07)
- [ ] Network failure shows friendly message
- [ ] Sentry captures production errors (OPS-02)

### Infra

- [ ] CI passes on PR (OPS-01)
- [ ] Rate limits return 429 (OPS-03)
- [ ] Uptime monitor green (OPS-04)

---

## Appendix

### A. Environment Variables

| Variable                               | Scope       | Where used                                    |
| -------------------------------------- | ----------- | --------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Public      | `lib/supabase/*`                              |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public      | `lib/supabase/*`                              |
| `SUPABASE_SECRET_KEY`                  | Server only | `lib/supabase/server.ts` (admin ops)          |
| `NEXT_PUBLIC_GEOAPIFY_API_KEY`         | Public      | `lib/geoapify/client.ts`, `useReverseGeocode` |
| `NEXT_PUBLIC_APP_URL`                  | Public      | Share links, OG metadata                      |
| `UPSTASH_REDIS_REST_URL`               | Server      | Rate limiting (OPS-03)                        |
| `UPSTASH_REDIS_REST_TOKEN`             | Server      | Rate limiting (OPS-03)                        |
| `SENTRY_DSN`                           | Server      | Error tracking (OPS-02)                       |

### B. Useful Commands

```bash
# Local dev
pnpm dev

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Build (production)
pnpm build

# Seed shops from Geoapify
pnpm seed

# Preview deploy
vercel

# Production deploy
vercel --prod

# Analyze bundle (after adding @next/bundle-analyzer)
ANALYZE=true pnpm build
```

### C. Database Migrations Checklist

Every schema change should ship as a file in `supabase/`:

- `migration_<feature>.sql` for ALTERs and new tables
- Include RLS policies
- Include indexes
- Document rollback SQL as a comment at the top

### D. Git Conventions

Commit messages should reference the item ID:

```
fix(BUG-01): recalculate shop rating on review insert

- Add refresh_shop_rating trigger
- Backfill existing shops
- Verify RLS bypass via SECURITY DEFINER
```

Branch naming: `feat/FEAT-01-admin-panel`, `fix/BUG-01-rating-trigger`, `chore/TD-04-dead-code`

### E. Definition of Done

An item is **Done** when:

1. Code merged to `main`
2. CI green (lint, typecheck, build)
3. Deployed to preview and manually verified
4. Acceptance criteria above all checked
5. Regression checklist items related to the change pass
6. Item checkbox in this document marked `[x]`
7. Commit message references the ID

### F. Open Questions

- [ ] Should delete-shop be hard delete or soft delete (`deleted_at`)?
- [ ] Notifications: in-app only, or also email/web push?
- [ ] Admin panel: single admin or role hierarchy?
- [ ] Public profiles: allow messaging/following, or read-only for now?
- [ ] Monetization direction: featured shop listings? Premium filters?

---

_Last updated: 2026-09-10_
