# ☕ PhinFind

> **Discover Vietnamese Coffee - Find the best coffee shops near you**  
> *Tìm Cà Phê Việt*

PhinFind is a Progressive Web Application (PWA) designed to help coffee lovers, travelers, and digital nomads discover authentic Vietnamese coffee shops wherever they are. Built with Next.js 15, Leaflet interactive maps, Supabase, and Geoapify Places API.

---

## ✨ Features

- 🔐 **Authentication**: Email/Password, Google OAuth, and Magic Link sign-in options via Supabase Auth
- 📍 **Interactive Map**: Location-aware OpenStreetMap integration powered by React Leaflet
- ☕ **Coffee Discovery**: Instant detection of nearby coffee shops with real-time distance calculation
- ➕ **Add New Shop**: Authenticated users can submit new coffee shops with interactive Leaflet location pin picking, category tags, pricing, and photo previews
- 🛡️ **Verification Workflow**: User-submitted shops track ownership (`created_by`) and default to pending verification (`verified: false`)
- 🔍 **Search & Filter**: Search by shop name or location with "Open Now" status filtering
- ❤️ **Save Favorites**: Bookmark your favorite coffee spots for quick access anytime
- 📱 **Installable PWA**: Installable directly on mobile and desktop home screens with offline support
- 🧭 **Get Directions**: Direct one-tap navigation via Google Maps or Apple Maps


---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Database & Auth**: Supabase (PostgreSQL + Auth + RLS)
- **POI & Geocoding**: Geoapify Places API v2
- **Mapping**: Leaflet.js + React-Leaflet
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: Zustand
- **PWA**: `@ducanh2912/next-pwa`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm` or `pnpm` / `yarn`

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/phinfind.git
   cd phinfind
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to create your local environment file:
   ```bash
   cp .env.example .env.local
   ```

4. **Populate `.env.local`** with your Supabase and Geoapify credentials.

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```

6. **Open Web Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to explore the application.

---

## 🔑 Environment Variables

The following environment variables are required in `.env.local`:

| Variable | Description | Default / Example |
| -------- | ----------- | ----------------- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable API key | `sb_publishable_...` |
| `SUPABASE_SECRET_KEY` | Supabase secret key (server / seeding) | `sb_secret_...` |
| `NEXT_PUBLIC_GEOAPIFY_API_KEY` | Geoapify Places API key for map data | `your_geoapify_key` |
| `NEXT_PUBLIC_APP_URL` | Application root URL | `http://localhost:3000` |

---

## 🔌 API Endpoints

| Method | Endpoint | Auth Required | Description |
| ------ | -------- | ------------- | ----------- |
| `GET` | `/api/shops/nearby` | No | Fetch nearby coffee shops with pagination and sorting |
| `GET` | `/api/shops/details` | No | Fetch single coffee shop details by `placeId` |
| `GET` | `/api/shops/search` | No | Search coffee shops by name or keyword query `q` |
| `POST` | `/api/shops/create` | **Yes** | Create a new coffee shop (`name`, `address`, `lat`, `lon`, `photos`, etc.) |
| `GET` | `/api/reviews` | No | Fetch customer reviews for a given `placeId` |
| `POST` | `/api/reviews` | **Yes** | Post a new review and star rating |
| `GET` | `/api/user/favorites` | **Yes** | Fetch current user's bookmarked coffee shops |
| `POST` | `/api/user/favorites` | **Yes** | Save or remove a coffee shop favorite |

---

## 📁 Project Structure


```
phinfind/
├── app/                      # Next.js 15 App Router pages & API routes
│   ├── (auth)/               # Login & Signup routes
│   ├── (main)/               # Main application pages (Discover, Details, Favorites, Profile)
│   ├── api/                  # Serverless API endpoints (shops, user)
│   ├── globals.css           # Design tokens & global CSS
│   └── layout.tsx            # Root layout provider wrapper
├── public/                   # Static assets & PWA manifest
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── components/           # Reusable UI, map, shop, & layout components
│   ├── hooks/                # Custom React hooks (useAuth, useLocation, useShops)
│   ├── lib/                  # Client SDK instances (Supabase, Geoapify) & utilities
│   ├── stores/               # Zustand stores (useUIStore, useShopStore)
│   └── types/                # TypeScript type definitions
├── supabase/
│   └── schema.sql            # PostgreSQL schema, RLS policies, & triggers
├── tailwind.config.ts        # Design system colors & tokens
└── next.config.ts            # PWA & image optimization settings
```

---

## 📜 Development Commands

| Command | Action |
| ------- | ------ |
| `npm run dev` | Starts local development server at `localhost:3000` |
| `npm run build` | Builds optimized production bundle |
| `npm run start` | Runs production server |
| `npm run lint` | Runs ESLint syntax and code quality checks |

---

## 🌐 Deployment

### Deploying to Vercel

The easiest way to deploy PhinFind is using the Vercel Platform:

1. Push your repository to GitHub / GitLab.
2. Import your repository into [Vercel](https://vercel.com/new).
3. Add the required environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_GEOAPIFY_API_KEY`).
4. Click **Deploy**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/phinfind)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for backend authentication and PostgreSQL database.
- [Geoapify](https://www.geoapify.com) for location data and POI services.
- [Leaflet](https://leafletjs.com) and [OpenStreetMap](https://www.openstreetmap.org) for open-source mapping.
- [shadcn/ui](https://ui.shadcn.com) and [Tailwind CSS](https://tailwindcss.com) for design components.

---

<p center align="center">
  Built with ❤️ in Vietnam
</p>
