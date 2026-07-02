# finalSTREAm — Live Interactive Streaming Platform

## Project Structure

```
finalSTREAm/
│
├── index.html              # Entry HTML file (title, fonts, meta tags)
├── vite.config.ts          # Vite build config
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript root config
├── tsconfig.app.json       # TypeScript app config
├── tsconfig.node.json      # TypeScript node config
├── eslint.config.js        # Linting rules
├── vercel.json             # Vercel deploy config + env vars
├── .env                    # Local environment variables (placeholders)
│
├── src/                    # ─── FRONTEND (React app) ───
│   ├── main.tsx            # App entry point
│   ├── App.tsx             # Router setup (all page routes)
│   ├── index.css           # Global styles + Tailwind + background effects
│   │
│   ├── pages/              # Page components (one per route)
│   │   ├── EntryPage.tsx         # Role selector (viewer / streamer)
│   │   ├── LandingPage.tsx       # Homepage (role-based)
│   │   ├── ViewerLanding.tsx     # Viewer landing wrapper
│   │   ├── StreamerLanding.tsx   # Streamer landing wrapper
│   │   ├── LoginPage.tsx         # Sign in / Sign up / Demo login
│   │   ├── DashboardPage.tsx     # User dashboard (not protected)
│   │   ├── CreateRoomPage.tsx    # Create a room (not protected)
│   │   ├── JoinRoomPage.tsx      # Join a room by code
│   │   ├── LiveRoomPage.tsx      # Live room (viewer + streamer)
│   │   ├── StreamerStudio.tsx    # Full streamer control panel
│   │   ├── OverlayPage.tsx       # OBS overlay (events + QR)
│   │   ├── AudioDock.tsx         # Audio capture for OBS
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
│   │   ├── InteractionHub.tsx    # Chat + Super Chat + TTS
│   │   ├── FanDropRoom.tsx       # Fan drop submissions (text/emoji/image/video)
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
│   │   └── LivePlayerContext.tsx  # Global PiP video state
│   │
│   ├── context/            # Additional contexts
│   │   └── AppContext.tsx        # App state (profile, toasts, language)
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useScrollPosition.ts       # Track scroll position (RAF)
│   │   ├── useIsMobile.ts             # Responsive media query
│   │   └── useIntersectionObserver.ts # Element visibility observer
│   │
│   └── lib/                # Utility / library files
│       ├── supabase.ts          # Supabase client init
│       └── googleAuth.ts        # Google OAuth flow
│
├── api/                    # ─── BACKEND (Vercel serverless) ───
│   ├── db-client.js        # Supabase admin client (service role)
│   ├── db-wake.js          # Auto-restore DB on 500 errors
│   ├── auth-callback.js    # Create profile after signup
│   ├── rooms.js            # CRUD live rooms
│   ├── profiles.js         # GET/PUT user profiles
│   ├── queue.js            # CRUD queue entries
│   ├── chat.js             # Chat messages + super chat
│   ├── games.js            # Game scores + leaderboard update
│   ├── leaderboard.js      # Ranked leaderboard
│   ├── art.js              # Art submissions CRUD
│   └── upload.js           # File upload to Supabase Storage
│
├── public/                 # Public static files
│   ├── favicon.svg
│   ├── vite.svg
│   └── art/                # Landing page showcase images
│       ├── showcase-1.png
│       └── showcase-2.png
│
└── node_modules/           # Dependencies (auto-installed)
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
| Hosting | Vercel | Free tier (100GB) |
| API Functions | Vercel Serverless | Free tier |

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Check code quality

## Key Notes

- **Mobile-first**: All UI is designed for mobile users first
- **API routes**: Backend endpoints at `/api/*` run as Vercel serverless functions
- **Env vars**: Real keys in `vercel.json`, local placeholders in `.env`
