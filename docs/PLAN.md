# ☕ PhinFind - Complete MVP Development Plan

A Progressive Web Application for discovering the best coffee shops wherever you are.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [User Stories](#user-stories)
- [Technical Stack](#technical-stack)
- [Database Schema](#database-schema)
- [API Architecture](#api-architecture)
- [UI/UX Design System](#uiux-design-system)
- [Development Roadmap](#development-roadmap)
- [Deployment Strategy](#deployment-strategy)
- [Testing Plan](#testing-plan)
- [Potential Challenges & Solutions](#potential-challenges--solutions)
- [Future Enhancements](#future-enhancements)
- [Monetization Opportunities](#monetization-opportunities)

---

## 🎯 Project Overview

### Problem Statement

Travelers and coffee enthusiasts struggle to find quality coffee shops when visiting unfamiliar areas. Existing solutions are either too generic, lack community-driven insights, or have poor mobile experiences.

### Solution

PhinFind provides an intuitive, location-aware PWA that helps users discover nearby coffee shops with relevant details, user ratings, and a seamless mobile experience.

### Target Users

- **Primary**: Urban travelers, digital nomads, and coffee enthusiasts aged 18-40
- **Secondary**: Local coffee shop owners looking for visibility
- **Tertiary**: Tourists exploring new cities

### Success Metrics

- Time to find nearest coffee shop < 30 seconds
- Daily active users > 500 (MVP phase)
- User retention rate > 40% after 30 days
- Average session duration > 3 minutes

---

## ✨ Core Features

### Phase 1: MVP Essentials (Launch)

| Feature                  | Description                                                        | Priority    |
| ------------------------ | ------------------------------------------------------------------ | ----------- |
| **Location Discovery**   | Auto-detect user location with option to manually enter a location | 🔴 Critical |
| **Interactive Map View** | Display coffee shops as markers with distance information          | 🔴 Critical |
| **List View**            | Sortable, filterable list of nearby coffee shops                   | 🔴 Critical |
| **Shop Details**         | Name, address, distance, opening hours, price range                | 🔴 Critical |
| **Get Directions**       | Link to Google/Apple Maps for navigation                           | 🔴 Critical |
| **Search**               | Search by coffee shop name or location                             | 🟡 High     |
| **Filter (Open Now)**    | Show only shops currently open                                     | 🟡 High     |
| **PWA Installation**     | Installable on mobile home screen                                  | 🟡 High     |
| **User Ratings**         | Display aggregated ratings from Google Places                      | 🟢 Medium   |

### Phase 2: Community Features (Post-MVP)

| Feature            | Description                                   | Priority  |
| ------------------ | --------------------------------------------- | --------- |
| **User Reviews**   | Allow users to write and read reviews         | 🔵 Future |
| **Photo Uploads**  | Share photos of coffee and shop ambiance      | 🔵 Future |
| **Favorites**      | Save favorite coffee shops for quick access   | 🔵 Future |
| **Social Sharing** | Share coffee shop experiences on social media | 🔵 Future |
| **Check-ins**      | Check-in and earn rewards/badges              | 🔵 Future |
| **Editor's Picks** | Curated lists of must-visit shops by city     | 🔵 Future |

---

## 👤 User Stories

### As a User...

1. **I want to** open the app and immediately see coffee shops near me **so that** I don't waste time searching.
2. **I want to** view shops on a map **so that** I can understand the geographic distribution and choose based on location.
3. **I want to** see a list of shops with distance, rating, and open status **so that** I can quickly compare options.
4. **I want to** tap a shop to see detailed information **so that** I can decide if it's worth visiting.
5. **I want to** get directions with one click **so that** I can navigate there easily.
6. **I want to** filter for open shops **so that** I don't waste time going to closed ones.
7. **I want to** install the app on my home screen **so that** I can access it like a native app.
8. **I want to** search for specific coffee shops **so that** I can find a particular shop I've heard about.

### As a Shop Owner (Future)...

1. **I want to** claim my coffee shop listing **so that** I can update my information.
2. **I want to** respond to reviews **so that** I can engage with customers.
3. **I want to** see analytics on views and check-ins **so that** I understand my reach.

---

## 🛠️ Technical Stack

### Frontend Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js 15 (App Router)           │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  TypeScript  │  │  Tailwind CSS│  │ shadcn/ui │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ React-Leaflet│  │    Framer    │  │ TanStack  │ │
│  │   + Leaflet  │  │   Motion    │  │   Query   │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
```

### Complete Stack Details

| Layer              | Technology            | Version | Purpose                                  |
| ------------------ | --------------------- | ------- | ---------------------------------------- |
| **Framework**      | Next.js               | 15.0+   | Full-stack React framework with SSR, ISR |
| **Language**       | TypeScript            | 5.0+    | Type-safe JavaScript                     |
| **Styling**        | Tailwind CSS          | 3.4+    | Utility-first CSS framework              |
| **UI Components**  | shadcn/ui             | Latest  | Accessible, customizable components      |
| **Icons**          | Lucide React          | Latest  | Consistent icon set                      |
| **Maps**           | Leaflet.js            | 1.9+    | Lightweight open-source mapping          |
| **React Maps**     | React-Leaflet         | 4.0+    | React bindings for Leaflet               |
| **State Mgmt**     | TanStack Query        | 5.0+    | Server-state management and caching      |
| **State Mgmt**     | Zustand               | 4.0+    | Client-side state management             |
| **Forms**          | React Hook Form       | 7.0+    | Form validation and handling             |
| **Validation**     | Zod                   | 3.0+    | Schema validation for forms and APIs     |
| **Auth**           | Supabase Auth         | Latest  | Email, Google, Magic Link auth           |
| **Database**       | Supabase (PostgreSQL) | 15.0+   | Managed PostgreSQL with realtime         |
| **API Client**     | Supabase JS Client    | Latest  | Type-safe database queries               |
| **POI API**        | Geoapify Places API   | v2      | Nearby places, geocoding, details        |
| **HTTP Client**    | Axios                 | 1.6+    | Promise-based HTTP requests              |
| **PWA**            | next-pwa              | 5.0+    | Web app manifest and service workers     |
| **Analytics**      | Vercel Analytics      | Latest  | Performance and usage tracking           |
| **Error Tracking** | Sentry                | Latest  | Error monitoring (optional)              |

### Environment Variables

```env
# Required
NEXT_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key  # Optional for directions

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

---

## 🗄️ Database Schema (Supabase PostgreSQL)

### Tables

#### `profiles`

Stores user profile information.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);
```

#### `saved_shops`

Users' favorite coffee shops.

```sql
CREATE TABLE saved_shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL, -- Google/Geoapify place ID
  name TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, place_id)
);

-- Indexes
CREATE INDEX idx_saved_shops_user_id ON saved_shops(user_id);
```

#### `visits`

Track user visits to coffee shops (future feature).

```sql
CREATE TABLE visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,

  INDEX idx_visits_user_id ON visits(user_id)
);
```

#### `shop_cache`

Cache shop details to reduce API calls (optional).

```sql
CREATE TABLE shop_cache (
  place_id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_shop_cache_expires ON shop_cache(expires_at);
```

### Row Level Security (RLS) Policies

```sql
-- Profiles: Users can read any profile but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Saved Shops: Users can only see and manage their own
ALTER TABLE saved_shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved shops" ON saved_shops
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved shops" ON saved_shops
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved shops" ON saved_shops
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 🔌 API Architecture

### Internal API Routes (Next.js)

| Endpoint                  | Method          | Description             |
| ------------------------- | --------------- | ----------------------- |
| `/api/auth/[...nextauth]` | ALL             | Authentication routes   |
| `/api/shops/nearby`       | GET             | Get nearby coffee shops |
| `/api/shops/details`      | GET             | Get detailed shop info  |
| `/api/shops/search`       | GET             | Search coffee shops     |
| `/api/user/favorites`     | GET/POST/DELETE | Manage favorites        |
| `/api/user/profile`       | GET/PUT         | User profile management |

### External API Integration: Geoapify

#### Get Nearby Places

```typescript
// GET /v2/places
const response = await axios.get('https://api.geoapify.com/v2/places', {
  params: {
    apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
    categories: 'catering.cafe,catering.coffee_shop',
    filter: `circle:${longitude},${latitude},${radius}`,
    limit: 100,
    features: ['details', 'distance', 'rating']
  }
});
```

#### Place Details

```typescript
// GET /v2/places/{place_id}
const response = await axios.get(`https://api.geoapify.com/v2/places/${placeId}`, {
  params: {
    apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
  }
});
```

#### Geocoding (Search)

```typescript
// GET /v1/geocode/search
const response = await axios.get('https://api.geoapify.com/v1/geocode/search', {
  params: {
    apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
    text: query,
    filter: `circle:${longitude},${latitude},${radius}`
  }
});
```

### API Response Types

```typescript
// src/types/shop.ts

export interface CoffeeShop {
  id: string;
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  distance: number; // in meters
  distance_text: string;
  rating: number; // 0-5
  total_ratings: number;
  opening_hours?: {
    open_now: boolean;
    periods: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
  };
  price_range?: '€' | '€€' | '€€€' | '€€€€';
  photos?: string[];
  website?: string;
  phone?: string;
  categories: string[];
}
```

---

## 🎨 UI/UX Design System

### Color Palette

```
Primary Colors:
  - Coffee Brown: #6F4E37 (Primary)
  - Warm Cream: #F5F0E8 (Background)
  - Espresso: #2C1810 (Dark text)
  - Caramel: #C68E5C (Accent)

Secondary Colors:
  - Light Cream: #FAF7F2 (Card bg)
  - Mocha: #8B6B4A (Secondary text)
  - Matcha Green: #7BA05B (Positive/Open)
  - Berry Red: #C75B5B (Closed/Negative)

Semantic Colors:
  - Success: #7BA05B
  - Warning: #E8A838
  - Error: #C75B5B
  - Info: #4A8DB7
```

### Typography

| Element  | Font  | Size    | Weight | Line Height |
| -------- | ----- | ------- | ------ | ----------- |
| Headings | Inter | 24-32px | 700    | 1.2         |
| Body     | Inter | 16px    | 400    | 1.6         |
| Labels   | Inter | 14px    | 500    | 1.4         |
| Captions | Inter | 12px    | 400    | 1.5         |

### Spacing System (Tailwind)

```
Space Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
Breakpoints: sm: 640px, md: 768px, lg: 1024px, xl: 1280px
```

### Component Patterns

#### Shop Card (List View)

```
┌──────────────────────────────────────────────┐
│  ☕ Brew & Bloom                             │
│  📍 2.3 km · ⭐ 4.8 (234 reviews)            │
│  🟢 Open Now · 💰 €€                         │
│  📱 123 Main St, San Francisco               │
│  [Directions] [Save]                         │
└──────────────────────────────────────────────┘
```

#### Shop Detail View

```
┌──────────────────────────────────────────────┐
│  ← Back                                      │
│  ☕ Brew & Bloom                             │
│  ⭐ 4.8 (234 reviews)  💰 €€                 │
│  🟢 Open · Closes at 10:00 PM               │
│  📍 123 Main St, San Francisco               │
│  📞 (555) 123-4567                          │
│  🌐 brewandbloom.com                        │
│                                              │
│  ┌──────────────────────────────┐            │
│  │  [Get Directions]  [Save]    │            │
│  └──────────────────────────────┘            │
│                                              │
│  About this place:                           │
│  Artisan coffee roaster with...             │
│                                              │
│  📸 Photos                                   │
│  [img] [img] [img]                          │
└──────────────────────────────────────────────┘
```

### Mobile-First Layout (Index Page)

```
┌──────────────────────────────────────────────┐
│  🔍 Search...               👤 Profile      │
│  [Map View] [List View]                     │
│  ┌─────────────────────────────────┐        │
│  │                                 │        │
│  │         MAP AREA                │        │
│  │                                 │        │
│  │    ☕  ☕   ☕                  │        │
│  │       ☕   ☕                   │        │
│  │                                 │        │
│  └─────────────────────────────────┘        │
│                                              │
│  ☕ Brew & Bloom  2.3 km  ⭐4.8  🟢        │
│  ☕ Coffee Haven  1.2 km  ⭐4.6  🟢        │
│  ☕ The Roast     3.1 km  ⭐4.4  🔴        │
│  ☕ Bean & Brew  0.8 km  ⭐4.9  🟢        │
│                                              │
│  [Bottom Navigation: Map | List | Favorites] │
└──────────────────────────────────────────────┘
```

---

## 🗺️ Development Roadmap

### Week 1: Foundation & Setup

**Day 1-2: Project Initialization**

```bash
# Create Next.js project
npx create-next-app@latest phinfind --typescript --tailwind --app

# Install core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install react-leaflet leaflet
npm install @tanstack/react-query axios
npm install next-pwa
npm install -D @types/leaflet

# Install UI dependencies
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input dialog dropdown-menu
```

**Day 3-4: Supabase Setup**

- Create Supabase project
- Set up authentication (email + Google)
- Create database tables with RLS policies
- Set up environment variables

**Day 5-6: PWA Configuration**

- Configure `next.config.js` with PWA
- Create manifest.json
- Add app icons and splash screen assets
- Test service worker functionality

**Day 7: Architecture Setup**

- Set up folder structure
- Configure TanStack Query
- Create API utility functions
- Set up Zustand store for UI state

### Week 2: Core Features

**Day 8-9: Location & Map**

- Implement geolocation API
- Integrate Leaflet map with custom markers
- Add user location marker with circle radius
- Implement map zoom and pan controls

**Day 10-11: Shop Discovery**

- Integrate Geoapify Places API
- Fetch nearby coffee shops
- Display shops on map as markers
- Popup info on marker click

**Day 12-13: List View & UI**

- Create list view with shop cards
- Implement sorting (distance, rating)
- Add "Open Now" filter
- Create skeleton loading states

**Day 14: Testing & Refinement**

- Test on multiple screen sizes
- Fix UI bugs
- Performance optimization

### Week 3: Shop Details & Navigation

**Day 15-16: Shop Details**

- Create detailed shop page
- Fetch and display shop details
- Add "Get Directions" functionality
- Show opening hours

**Day 17-18: Search & Advanced Filters**

- Implement search by name/address
- Add price filter
- Add rating filter
- Implement debounced search

**Day 19-20: User Features**

- User authentication flow
- Save favorites functionality
- User profile page
- Saved shops list

**Day 21: PWA Polish**

- Test PWA installation
- Add offline support
- Implement app shell
- Test splash screen

### Week 4: Polish & Launch

**Day 22-23: Performance**

- Implement image optimization
- Add lazy loading
- Code splitting
- Optimize bundle size

**Day 24-25: Testing**

- Cross-browser testing
- Mobile device testing
- Performance audit (Lighthouse)
- User acceptance testing

**Day 26-27: Deployment**

- Set up Vercel project
- Configure environment variables
- Deploy staging environment
- Test staging thoroughly
- Deploy to production

**Day 28: Launch & Monitor**

- Monitor Vercel analytics
- Set up error tracking
- Create launch announcement
- Gather user feedback

---

## 🚀 Deployment Strategy

### Vercel Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

### Environment Variables on Vercel

```env
# Production
NEXT_PUBLIC_GEOAPIFY_API_KEY=prod_key
NEXT_PUBLIC_SUPABASE_URL=prod_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=prod_google_key
NEXT_PUBLIC_APP_URL=https://phinfind.com

# Preview/Staging
NEXT_PUBLIC_APP_URL=https://staging.phinfind.com
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Domain Setup

1. Purchase domain (e.g., phinfind.com)
2. Point DNS to Vercel (CNAME to `cname.vercel-dns.com`)
3. Configure SSL (Vercel auto-provisions)
4. Set up custom domain in Vercel project settings

---

## 🧪 Testing Plan

### Unit Testing

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```typescript
// Example test: ShopCard component
import { render, screen } from '@testing-library/react';
import { ShopCard } from './ShopCard';

describe('ShopCard', () => {
  it('displays shop name and rating', () => {
    render(<ShopCard shop={mockShop} />);
    expect(screen.getByText('Brew & Bloom')).toBeInTheDocument();
    expect(screen.getByText('⭐ 4.8')).toBeInTheDocument();
  });
});
```

### Integration Testing

- Test API routes
- Test database queries
- Test authentication flow
- Test location detection

### E2E Testing (Optional)

```bash
npm install -D playwright
```

### Performance Testing

- **Lighthouse**: Target score > 90
- **Web Vitals**: CLS < 0.1, FID < 100ms, LCP < 2.5s
- **Bundle Analysis**: Use `@next/bundle-analyzer`

---

## ⚠️ Potential Challenges & Solutions

| Challenge                    | Solution                                                             |
| ---------------------------- | -------------------------------------------------------------------- |
| **Geoapify Rate Limits**     | Implement caching (Redis/Supabase); debounce search; use local cache |
| **PWA Caching Issues**       | Version assets; implement cache busting; test service worker updates |
| **Slow Map Rendering**       | Use map clustering; limit markers; implement virtual scrolling       |
| **User Location Permission** | Provide fallback input; clear UX explaining benefits                 |
| **API Costs Scaling**        | Monitor usage; implement request throttling; consider paid tier      |
| **Mobile Data Usage**        | Compress images; lazy load; cache static assets                      |
| **iOS PWA Limitations**      | Test extensively; implement fallbacks for unsupported features       |

---

## 🚀 Future Enhancements

### Phase 3: Social & Community

- **User Reviews & Photos**: Users can rate and review coffee shops
- **Social Features**: Follow friends, share favorites
- **Events**: Coffee shop events and promotions
- **Live Updates**: Real-time occupancy status

### Phase 4: Personalization

- **AI Recommendations**: Personalized shop recommendations
- **Coffee Preferences**: Filter by coffee type (espresso, pour-over, etc.)
- **Dietary Filters**: Vegan options, dairy-free milk, etc.
- **Smart Notifications**: Notify when near saved/favorite shops

### Phase 5: Monetization

- **Premium Features**: Advanced filters, offline maps, no ads
- **Shop Owner Dashboard**: Claim listings, analytics
- **Sponsored Listings**: Featured shops for local businesses
- **Partnerships**: Coffee subscription service, equipment sales

---

## 💰 Monetization Opportunities

### Free Tier

- Basic search and discovery
- Map and list views
- Essential shop information
- Limited favorites (5 shops)

### Premium Tier ($4.99/month or $49.99/year)

- Unlimited favorites
- Advanced filters (coffee type, vibe, etc.)
- Offline access to saved shops
- Remove ads
- Price alert notifications

### Business Tier (Contact for pricing)

- Claim and manage shop listing
- Analytics dashboard
- Respond to reviews
- Featured placement
- Promotional tools

### Alternative Monetization

- **Affiliate Marketing**: Coffee equipment, subscription boxes
- **Sponsored Content**: Featured guides, editor's picks
- **Data Insights**: Sell anonymized foot traffic data to businesses
- **White-label Solutions**: For coffee chains or tourism boards

---

## 📚 Resources & Documentation

### Tech Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Geoapify API Docs](https://apidocs.geoapify.com/)
- [Leaflet.js Docs](https://leafletjs.com/reference.html)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/docs)

### Design Resources

- [Figma Community - Coffee Shop Templates](https://www.figma.com/community)
- [Unsplash - Coffee Shop Photos](https://unsplash.com/s/photos/coffee-shop)
- [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)

### PWA Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://web.dev/learn/pwa/web-app-manifest/)

---

## 📊 Success Metrics & KPIs

### Pre-Launch

- [x] Complete technical setup
- [x] Pass Lighthouse audit (score > 90)
- [x] PWA installable on iOS and Android
- [x] All core features tested

### Post-Launch (30 days)

- **Users**: 500+ registered users
- **Sessions**: 2,000+ daily sessions
- **Retention**: 40% Day 7 retention
- **Performance**: Average page load < 2 seconds
- **Engagement**: Average session > 3 minutes

### Post-Launch (90 days)

- **Users**: 2,000+ registered users
- **Shops**: 1,000+ coffee shops discovered
- **Favorites**: 500+ saved shop actions
- **Reviews**: 100+ user reviews (if enabled)

---

## 🏁 Getting Started

### Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/phinfind.git
cd phinfind

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Add your API keys and Supabase credentials

# 4. Run development server
npm run dev

# 5. Build for production
npm run build
npm start
```

### Project Structure

```
phinfind/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Main map/list view
│   │   ├── shop/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── favorites/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── shops/
│   │   └── user/
│   └── layout.tsx
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── map/
│   │   ├── shop/
│   │   └── user/
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase/
│   │   └── geoapify/
│   ├── stores/
│   ├── types/
│   └── utils/
├── public/
│   ├── icons/
│   └── images/
├── styles/
│   └── globals.css
└── config/
    ├── next.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## 📝 Conclusion

This PhinFind MVP is designed to be:

- **Launch-ready**: Built with proven, production-grade technologies
- **Cost-effective**: Free-tier friendly for hosting and APIs
- **Scalable**: Architecture supports growth from 100 to 100,000 users
- **User-centered**: Mobile-first PWA delivers native-app experience
- **Feature-rich**: Covers discovery, search, favorites, and community

### Next Steps

1. **Week 1**: Set up project, Supabase, and PWA foundation
2. **Week 2**: Implement maps and shop discovery
3. **Week 3**: Build shop details and user features
4. **Week 4**: Polish, test, deploy, and launch

---

_Happy building! ☕ Let's make coffee discovery delightful for everyone._
