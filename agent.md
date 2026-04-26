# Caldero Envío - Agent Configuration

## Who I Am

My name is **Tony**. I am the development agent for **Caldero Envío**, a delivery management application. I assist with coding, debugging, architecture decisions, and maintaining project conventions.

## Project Overview

**Caldero Envío** solves delivery logistics for local businesses:
- Calculate delivery routes and estimated times
- Manage couriers and store locations
- Generate pricing based on distance and courier
- Integration with WhatsApp for notifications

**Original problem**: Local restaurants had inconsistent delivery pricing and times because they relied on individual courier judgment.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS |
| **Routing** | React Router v6 |
| **Backend** | Firebase (Auth + Firestore) |
| **Maps** | Mapbox GL JS |
| **Package Manager** | npm |

### Directory Structure

```
src/
├── ui/                   # Atomic Design components
│   ├── atoms/             # Smallest UI components (Button, Badge, Label, Spinner, Price, Icon, Input)
│   ├── molecules/        # Composed components (SearchBox, FormField, CourierSelect, DistanceInfo, PriceTag, MapPreview, ActionButtons)
│   ├── organisms/        # Complex components (pending - need to be created)
│   ├── templates/         # Page layouts (AppLayout, AuthLayout, OnboardingLayout, SettingsLayout)
│   └── Header/            # Header component (variants: guest, minimal, auth, onboarding)
├── pages/                # Route pages (Landing, Login, Register, App, Settings, Onboarding, NotFound)
├── contexts/             # React contexts (AuthContext, StoreContext, DeliveryContext)
├── hooks/                # Custom hooks (useDeliveryCalculator, useDebounce)
├── services/             # Business logic (mapService, deliveryService, storeService, cacheService, whatsappService)
├── config/               # Third-party initialization (firebase.js, mapbox.js)
├── utils/                # Constants and helpers
└── router/              # AppRouter, ProtectedRoute, RedirectIfAuth
```

---

## Code Conventions

### Component Architecture
- **Atomic Design**: atoms → molecules → organisms → templates → pages
- Components are `.jsx` files with PascalCase names
- One component per file

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `PriceTag.jsx` |
| Hooks | camelCase with `use` prefix | `useDeliveryCalculator.js` |
| Services | camelCase | `mapService.js` |
| Contexts | PascalCase with `Context` suffix | `AuthContext.jsx` |
| Utils/Constants | camelCase | `constants.js` |
| CSS Classes | Tailwind utility classes | |
| Environment Variables | `VITE_*` prefix | `VITE_FIREBASE_API_KEY` |

### State Management
- **React Context** for global state (Auth, Store, Delivery)
- **Local useState** for component-specific state
- **Custom hooks** to encapsulate business logic

### Context Usage
```jsx
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { useDelivery } from '../contexts/DeliveryContext'
```

---

## Workflows

### Development Workflow

1. **Start**: Run `npm run dev` to start Vite dev server on port 5173
2. **Build**: Run `npm run build` for production build
3. **Preview**: Run `npm run preview` to preview production build
4. **Lint**: Run `npm run lint` for code quality checks
5. **Lint Fix**: Run `npm run lint:fix` for auto-fixable issues
6. **Format**: Run `npm run format` to format with Prettier

### Git Workflow

| Action | Command |
|--------|---------|
| Create feature branch | `git checkout -b feature/my-feature` |
| Commit changes | `git commit -m "description"` |
| Push changes | `git push -u origin feature/my-feature` |
| Create PR | Via GitHub UI |

### Commit Message Format
```
<type>(<scope>): <description>

types: feat | fix | docs | style | refactor | test | chore
```

---

## Environment Variables

Required in `.env` (in project root, not in `src/`):

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Mapbox
VITE_MAPBOX_ACCESS_TOKEN=
```

---

## Important Notes

- The app uses **React 18 strict mode** (check `main.jsx`)
- All Firebase config values come from environment variables with fallback to `'demo-*'` values for development
- Mapbox token is required for map rendering
- The app supports both authenticated and unauthenticated routes
- **Protected routes** are wrapped with `ProtectedRoute` component, which uses `useAuth()` and `useLocation()` to prevent redirect loops
- **Authentication routes** use `RedirectIfAuth` to prevent logged-in users from accessing login/register
- `.env` file must be in the **project root** (not in `src/`), Vite loads it from there

---

## Design System (Tailwind)

Custom theme extends Tailwind with:
- **Colors**: Surface palette (dark theme), Primary coffee tones, Secondary amber, Tertiary cream
- **Typography**: Display sizes (sm, md, lg), Label medium
- **Shadows**: floating, glass
- **Border Radius**: md (0.75rem), full (9999px)

---

## Pending Tasks

> Tony manages this section. Priority levels: Important | Relevant | Not Important

<!-- Tony: pending start -->
- [ ] **Important**: Fix geocoding - search address returns loading indefinitely
- [ ] **Important**: Dynamic country filter in Mapbox geocoding (from store config)
- [ ] **Important**: Fix Mapbox static map not displaying
- [ ] **Important**: Fix onboarding - replace store name input + lat/lng inputs with SearchBox + side map showing pin
- [ ] **Relevant**: SearchBox keyboard navigation - add arrow key support to navigate dropdown suggestions
- [ ] **Relevant**: SearchBox spinner color - make it darker (currently too light and barely visible)
- [x] **Relevant**: CourierSelect dropdown arrow icon - ✅ Done: replaced native arrow with chevronDown Icon in `on_surface_variant` color, added `appearance-none` and relative container (src/ui/molecules/CourierSelect.jsx)
- [ ] **Relevant**: CourierSelect placeholder text - make "Seleccionar repartidor" more visible (currently hard to read)
- [ ] **Relevant**: Create organisms - move code from other components into src/ui/organisms/
- [ ] **Relevant**: Evaluate Cloud Functions necessity for server-side logic
- [ ] **Relevant**: Plan data migration strategy for future structure changes
- [ ] **Not Important**: Define Firestore Security Rules structure
- [ ] **Not Important**: Add skeleton loaders for better UX
- [ ] **Not Important**: Implement empty states for components
<!-- Tony: pending end -->
