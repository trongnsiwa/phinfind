# ☕ PhinFind - Implementation Roadmap

_Phase-by-phase plan for building your Vietnamese coffee discovery app_

---

## 📋 Project Overview

| Detail            | Information                                 |
| ----------------- | ------------------------------------------- |
| **App Name**      | PhinFind                                    |
| **Type**          | Progressive Web App (PWA)                   |
| **Target Users**  | Vietnamese coffee lovers, travelers         |
| **Core Value**    | Find nearby coffee shops quickly and easily |
| **Launch Target** | 4-6 weeks                                   |

---

## 🗺️ Phase Roadmap

```
Phase 0: Foundation  →  Phase 1: Auth  →  Phase 2: Location & Map
     (3 days)              (3 days)          (5 days)

Phase 3: Discovery  →  Phase 4: Details  →  Phase 5: Polish & Launch
     (4 days)              (3 days)            (4 days)
```

---

# 🚀 Phase 0: Foundation & Setup

**Duration:** 3 Days | **Priority:** 🔴 Critical

## Goal

Set up the complete development environment with all core technologies integrated.

## Key Deliverables

- ✅ Working Next.js 15 project with TypeScript
- ✅ Supabase connected with database schema
- ✅ Geoapify API integrated
- ✅ PWA configuration ready
- ✅ Design system foundation (Tailwind + shadcn/ui)
- ✅ Development environment working

## Tasks

### Day 1: Project Initialization

- Create Next.js project with TypeScript and Tailwind
- Install core dependencies (Supabase, Leaflet, React Query, Axios)
- Set up shadcn/ui with required components
- Configure folder structure

### Day 2: Database & API Setup

- Create Supabase project
- Set up database tables (profiles, saved_shops)
- Configure Row Level Security (RLS) policies
- Set up Geoapify API client
- Configure environment variables

### Day 3: PWA & Design System

- Configure PWA with manifest and service worker
- Set up design system (colors, typography, spacing)
- Create base layout components (Header, Footer)
- Set up TanStack Query for data fetching
- Configure Zustand for state management

---

# 🔐 Phase 1: Authentication

**Duration:** 3 Days | **Priority:** 🔴 Critical

## Goal

Implement complete user authentication flow with email and social login.

## Key Deliverables

- ✅ Email/password sign-up and sign-in
- ✅ Google OAuth integration
- ✅ Magic link sign-in
- ✅ Protected routes
- ✅ User profile management
- ✅ Session persistence

## Tasks

### Day 4: Auth Core

- Set up Supabase Auth
- Create auth hooks (`useAuth`)
- Implement sign-up page
- Implement sign-in page
- Set up protected routes middleware

### Day 5: Social Login & Profile

- Configure Google OAuth
- Add "Sign in with Google" button
- Create user profile page
- Implement profile update functionality
- Set up avatar upload

### Day 6: Auth Polish

- Add "Forgot password" flow
- Implement magic link sign-in
- Add loading states and error handling
- Test all auth flows
- Add session persistence

## User Stories

- As a user, I want to sign up with email/password
- As a user, I want to sign in with Google
- As a user, I want to reset my password
- As a user, I want to see and edit my profile
- As a user, I want to stay signed in

---

# 📍 Phase 2: Location & Map

**Duration:** 5 Days | **Priority:** 🔴 Critical

## Goal

Implement location detection and interactive map with nearby coffee shop discovery.

## Key Deliverables

- ✅ User location detection (GPS + manual)
- ✅ Interactive Leaflet map
- ✅ Coffee shop markers on map
- ✅ Shop popups on marker click
- ✅ Map controls (zoom, current location)
- ✅ Map/list view toggle

## Tasks

### Day 7: Location Detection

- Implement browser geolocation API
- Add "Allow Location" permission flow
- Create `useLocation` hook
- Handle location errors gracefully
- Add manual location entry fallback

### Day 8: Map Integration

- Set up Leaflet map component
- Add user location marker with pulsing dot
- Create custom coffee shop markers
- Implement map zoom and pan controls
- Add "Center on my location" button

### Day 9: Shop Markers

- Fetch nearby coffee shops from Geoapify
- Display shops as markers on map
- Add marker click to show popup
- Display shop name and distance in popup
- Style markers with coffee theme

### Day 10: Map/List Toggle

- Create list view component
- Add map/list toggle button
- Implement smooth transition between views
- Sync selected shop between map and list
- Add horizontal shop list overlay on map

### Day 11: Map Polish

- Add map clustering for performance
- Implement zoom to fit all markers
- Add street view or satellite option
- Test on mobile and desktop
- Optimize map performance

## User Stories

- As a user, I want to see coffee shops near me on a map
- As a user, I want to tap a marker to see shop details
- As a user, I want to toggle between map and list views
- As a user, I want to zoom and pan the map
- As a user, I want to re-center the map on my location

---

# 🔍 Phase 3: Shop Discovery

**Duration:** 4 Days | **Priority:** 🔴 Critical

## Goal

Implement shop list view with search, filters, and sorting.

## Key Deliverables

- ✅ Shop list with cards
- ✅ Search by name/address
- ✅ Filter by "Open Now"
- ✅ Sort by distance/rating
- ✅ Skeleton loading states
- ✅ Infinite scroll or pagination

## Tasks

### Day 12: Shop List

- Create shop card component (name, distance, rating, status)
- Implement shop list from Geoapify data
- Add distance formatting (km/m)
- Add "Open Now" status badge
- Implement infinite scroll

### Day 13: Search

- Add search bar component
- Implement debounced search
- Search by shop name and address
- Clear search functionality
- Display search results

### Day 14: Filters & Sorting

- Add filter dropdown (Open Now, Price)
- Add sort options (Distance, Rating)
- Implement filter logic
- Persist filter state in URL
- Add active filter indicators

### Day 15: Loading & Empty States

- Create skeleton loading cards
- Add loading spinner for map
- Handle "No shops found" state
- Add error state with retry button
- Add location permission fallback

## User Stories

- As a user, I want to see shops in a scrollable list
- As a user, I want to search for a specific coffee shop
- As a user, I want to filter by shops that are open
- As a user, I want to sort shops by distance or rating
- As a user, I want to see loading states while data loads

---

# 📄 Phase 4: Shop Details

**Duration:** 3 Days | **Priority:** 🟡 High

## Goal

Create detailed shop pages with all information and actions.

## Key Deliverables

- ✅ Shop detail page with full info
- ✅ Opening hours display
- ✅ "Get Directions" button
- ✅ Save to favorites
- ✅ Share shop functionality
- ✅ Photo gallery

## Tasks

### Day 16: Detail Page Core

- Create shop detail route (`/shop/[id]`)
- Fetch full shop details from Geoapify
- Display shop name, address, rating
- Show price range and categories
- Add back navigation

### Day 17: Shop Information

- Display opening hours with current status
- Show phone number with call link
- Show website with external link
- Display photo gallery
- Add description/ambiance section

### Day 18: Actions & Features

- Implement "Get Directions" (Google Maps link)
- Add "Save to Favorites" (database)
- Add "Share Shop" functionality
- Add "View on Map" button
- Implement favorites list page

## User Stories

- As a user, I want to see detailed information about a shop
- As a user, I want to know if a shop is open
- As a user, I want to get directions with one tap
- As a user, I want to save favorite shops
- As a user, I want to share a shop with friends

---

# 🚀 Phase 5: Polish & Launch

**Duration:** 4 Days | **Priority:** 🟢 Medium

## Goal

Prepare the app for public launch with PWA, testing, and deployment.

## Key Deliverables

- ✅ PWA fully functional (installable)
- ✅ Performance optimization (Lighthouse > 90)
- ✅ Cross-browser testing
- ✅ Analytics set up
- ✅ Production deployment
- ✅ Launch announcement

## Tasks

### Day 19: PWA Polish

- Test PWA installation on iOS
- Test PWA installation on Android
- Add splash screen
- Add offline support
- Test service worker caching

### Day 20: Performance

- Optimize images (next/image)
- Implement lazy loading
- Analyze bundle size
- Add code splitting
- Achieve Lighthouse score > 90

### Day 21: Testing

- Cross-browser testing (Chrome, Safari, Firefox)
- Mobile device testing (iOS, Android)
- Test all auth flows
- Test all API integrations
- User acceptance testing

### Day 22: Deployment

- Set up Vercel project
- Configure production environment variables
- Deploy to staging
- Final testing on staging
- Deploy to production

## Success Metrics

- 🎯 Lighthouse score: 90+
- 🎯 Time to interactive: < 3 seconds
- 🎯 PWA installable on all devices
- 🎯 Zero critical bugs

---

## 📊 Phase Summary

| Phase              | Duration | Priority    | Key Technology               |
| ------------------ | -------- | ----------- | ---------------------------- |
| 0: Foundation      | 3 days   | 🔴 Critical | Next.js, Supabase, Tailwind  |
| 1: Authentication  | 3 days   | 🔴 Critical | Supabase Auth, OAuth         |
| 2: Location & Map  | 5 days   | 🔴 Critical | Leaflet, Geoapify API        |
| 3: Shop Discovery  | 4 days   | 🔴 Critical | Geoapify API, TanStack Query |
| 4: Shop Details    | 3 days   | 🟡 High     | Next.js App Router           |
| 5: Polish & Launch | 4 days   | 🟢 Medium   | PWA, Vercel                  |

---

## 🎯 MVP Features Checklist

| Feature                 | Phase | Status     |
| ----------------------- | ----- | ---------- |
| User sign-up/login      | 1     | ✅ Planned |
| Google sign-in          | 1     | ✅ Planned |
| User location detection | 2     | ✅ Planned |
| Interactive map         | 2     | ✅ Planned |
| Coffee shop markers     | 2     | ✅ Planned |
| Shop list view          | 3     | ✅ Planned |
| Search shops            | 3     | ✅ Planned |
| Filter by "Open Now"    | 3     | ✅ Planned |
| Sort by distance/rating | 3     | ✅ Planned |
| Shop detail page        | 4     | ✅ Planned |
| Opening hours           | 4     | ✅ Planned |
| Get directions          | 4     | ✅ Planned |
| Save favorites          | 4     | ✅ Planned |
| PWA installation        | 5     | ✅ Planned |

---

## 📅 Suggested Timeline

```
Week 1: Phase 0 + Phase 1
  └── Foundation + Authentication

Week 2: Phase 2
  └── Location + Map

Week 3: Phase 3
  └── Shop Discovery + Search

Week 4: Phase 4 + Phase 5
  └── Shop Details + Polish + Launch
```

---

## 🔗 Quick Links

- [Design System Guide](#)
- [Technical Stack Details](#)
- [Database Schema](#)
- [API Documentation](#)
- [Deployment Guide](#)

---

_Ready to build? Let's start with Phase 0 - Foundation & Setup! 🚀_
