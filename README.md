# StreamArena — Live Interactive Streaming Platform

## Project Structure

```
finalSTREAm/
│
├── index.html              # Entry HTML file
├── vite.config.ts          # Vite build config
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript root config
├── tsconfig.app.json       # TypeScript app config
├── tsconfig.node.json      # TypeScript node config
├── eslint.config.js        # Linting rules
├── .env                    # Local environment variables
│
├── src/                    # ─── FRONTEND (React app) ───
│   ├── main.tsx            # App entry point
│   ├── App.tsx             # Router setup (all page routes)
│   ├── index.css           # Global styles + Tailwind
│   │
│   ├── pages/              # Page components (one per route)
│   │   ├── EntryPage.tsx         # Role selector (viewer / streamer)
│   │   ├── LandingPage.tsx       # Homepage (role-based, used internally)
│   │   ├── ViewerLanding.tsx     # Viewer landing wrapper
│   │   ├── StreamerLanding.tsx   # Streamer landing wrapper
│   │   ├── LoginPage.tsx         # Sign in / Sign up / Demo login
│   │   ├── CreateRoomPage.tsx    # Create a room
│   │   ├── JoinRoomPage.tsx      # Join a room by code
│   │   ├── LiveRoomPage.tsx      # Live room (viewer + streamer)
│   │   ├── StreamerStudio.tsx    # Full streamer control panel
│   │   ├── OverlayPage.tsx       # OBS overlay (events + QR)
│   │   ├── AudioDock.tsx         # Audio capture for OBS
│   │   ├── FanGalleryPage.tsx    # Fan art gallery
│   │   ├── LeaderboardPage.tsx   # Global leaderboard
│   │   ├── SettingsPage.tsx      # User settings
│   │   ├── ResetPasswordPage.tsx # Password reset
│   │   ├── VerifyEmailPage.tsx   # Email verification
│   │   ├── AboutPage.tsx         # About page
│   │   ├── PrivacyPage.tsx       # Privacy policy
│   │   ├── TermsPage.tsx         # Terms of service
│   │   └── ContactPage.tsx       # Contact info
│   │
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.tsx            # Top navigation bar
│   │   ├── MobileHeader.tsx      # Mobile top bar
│   │   ├── MobileNav.tsx         # Mobile bottom navigation
│   │   ├── ErrorBoundary.tsx     # React error boundary
│   │   ├── Toast.tsx             # Toast notifications
│   │   ├── LanguageSelector.tsx  # Language switcher
│   │   ├── MoltenBackground.tsx  # Animated lava background
│   │   ├── YouTubePlayer.tsx     # Embedded YouTube player + PiP
│   │   ├── QueuePanel.tsx        # Room queue UI
│   │   ├── Leaderboard.tsx       # Ranked leaderboard
│   │   ├── GameArena.tsx         # Mini-games area
│   │   ├── FanDropRoom.tsx       # Fan drop submissions
│   │   ├── FloatingAssistant.tsx # Floating CTA button
│   │   └── GlobalFloatingPlayer.tsx # Global PiP overlay
│   │
│   │   └── studio/              # Streamer Studio sub-components
│   │       ├── StudioTopBar.tsx       # Top bar (QR, viewers, coins)
│   │       ├── StudioLivePreview.tsx  # Live preview + YouTube URL
│   │       ├── StudioRoomSetup.tsx    # Room title, YT URL, language
│   │       ├── SelectionArena.tsx     # Game selection + 8 methods
│   │       ├── PlayerLobby.tsx        # Player cards with skill stats
│   │       ├── LiveFeed.tsx           # Unified event feed
│   │       ├── StudioFanDropPanel.tsx # Fan drop settings
│   │       ├── StudioSoundControl.tsx # Sound + Smart Sound
│   │       ├── StudioAIHost.tsx       # AI voice + moderation
│   │       ├── StudioMobileView.tsx   # Mobile studio layout
│   │       └── CollapsibleSection.tsx # Reusable collapsible
│   │
│   ├── mobile/             # Mobile landing page components
│   │   ├── MobileLandingPage.tsx # Mobile-specific landing layout
│   │   ├── MobileHeader.tsx      # Mobile header with safe area
│   │   ├── MobileHero.tsx        # Hero section with room code input
│   │   ├── FeatureCarousel.tsx   # Swipeable feature cards
│   │   ├── SocialProofBar.tsx    # Stats/metrics bar
│   │   ├── HowItWorks.tsx        # Steps section
│   │   ├── StreamerTeaser.tsx    # Streamer CTA section
│   │   └── MobileFooter.tsx      # Mobile footer
│   │
│   ├── contexts/           # React context providers
│   │   ├── AuthContext.tsx       # Auth state (Supabase + demo fallback)
│   │   ├── AppContext.tsx        # App state (profile, toasts, language)
│   │   └── LivePlayerContext.tsx  # Global PiP video state
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useScrollPosition.ts       # Track scroll position (RAF)
│   │   ├── useIsMobile.ts             # Responsive media query
│   │   └── useIntersectionObserver.ts # Element visibility observer
│   │
│   └── lib/                # Utility / library files
│       ├── supabase.ts          # Supabase client init
│       └── api.ts               # All Supabase CRUD operations
│
├── functions/              # ─── BACKEND (Cloudflare Functions) ───
│   └── api/
│       └── tts.ts               # TTS proxy (Google Translate)
│
├── public/                 # Public static files
│   ├── favicon.svg
│   ├── manifest.json
│   ├── sw.js                   # Service worker (PWA)
│   └── art/                    # Landing page showcase images
│       ├── showcase-1.png
│       └── showcase-2.png
│
└── supabase-full-migration.sql  # Consolidated DB schema + RLS + triggers
```

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS 4 | Free |
| Animations | Framer Motion | Free |
| Icons | Lucide React | Free |
| Database | Supabase PostgreSQL | Free tier (500MB) |
| Auth | Supabase Auth | Free tier (50k users) |
| Storage | Supabase Storage | Free tier (2GB) |
| Hosting | Cloudflare Pages | Free tier |
| TTS Proxy | Cloudflare Pages Function | Free tier |

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Check code quality
- `npm run test` — Run tests
- `npm run deploy:cf` — Deploy to Cloudflare Pages (preview)
- `npm run deploy:cf:prod` — Deploy to Cloudflare Pages (production)

## Key Notes

- **Mobile-first**: All UI is designed for mobile users first
- **Database**: All CRUD runs client-side via Supabase JS SDK with RLS. Run `supabase-full-migration.sql` in Supabase SQL Editor to set up the schema.
- **TTS endpoint**: `/api/tts` (POST) runs as a Cloudflare Pages Function
- **Env vars**: Required — `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
