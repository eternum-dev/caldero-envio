# Skills - Caldero Envío

Skills available for this project. Activate based on the task at hand.

---

## Generic Skills

### Debugging

**When to use**: React errors, unexpected behavior, console errors, network failures.

**Approach**:
1. Identify the error type (compilation, runtime, network)
2. Check component hierarchy and state flow
3. Verify props and context values
4. Check network tab for API failures
5. Use console.log sparingly; prefer React DevTools

**Common issues in this stack**:
- Context state not updating: Check if provider wraps the component
- Mapbox not rendering: Verify `VITE_MAPBOX_ACCESS_TOKEN` is set
- Firebase errors: Check `.env` variables and Firebase console

---

### Code Review Checklist

**Before submitting changes, verify**:

**Logic**:
- [ ] State updates are correct (immutable patterns)
- [ ] useEffect dependencies are complete
- [ ] No unnecessary re-renders (memo/useCallback where needed)

**Components**:
- [ ] Follows atomic design structure (atoms → molecules → organisms)
- [ ] Uses existing design system (Tailwind classes from theme)
- [ ] Handles loading and error states

**Performance**:
- [ ] Lists use keys properly
- [ ] Heavy components are lazy-loaded
- [ ] No inline function definitions in JSX (except callbacks)

---

### Git Workflow

**Branch naming**:
```
feature/description
fix/description
refactor/description
docs/description
```

**Commit message format**:
```
<type>(<scope>): <description>

feat: new feature
fix: bug fix
docs: documentation
style: formatting (no logic change)
refactor: code restructure (no feature/fix)
test: adding tests
chore: maintenance
```

**Process**:
1. Create branch from `main`
2. Make small, focused commits
3. Push and create PR
4. Wait for review

---

### Refactoring Patterns

**Component extraction**:
- If JSX exceeds 150 lines, consider extracting
- Look for reusable UI patterns

**Context splitting**:
- If a context has >10 state variables, consider splitting
- Separate by domain (Auth vs Store vs Delivery)

**Hook extraction**:
- Business logic in hooks (`use*`)
- UI logic stays in components

---

## Stack-Specific Skills

### Mapbox GL

**When to use**: Map rendering, route display, markers, geocoding.

**Key operations**:
- Initialize map with access token
- Add markers for store/courier locations
- Draw routes between points
- Get static map images for previews

**Common patterns**:
```jsx
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

const map = new mapboxgl.Map({
  container: mapContainer,
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [lng, lat],
  zoom: 14
})
```

**Troubleshooting**:
- Map not showing: Check token validity
- Route not drawing: Verify GeoJSON format for source
- Markers offset: Use `anchor: 'center'` option

---

### Firebase

**When to use**: Authentication, data storage, user management.

**Auth patterns**:
```jsx
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../config/firebase'

signInWithEmailAndPassword(auth, email, password)
```

**Firestore patterns**:
```jsx
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'

// Add document
await addDoc(collection(db, 'stores'), data)

// Read documents
const snapshot = await getDocs(collection(db, 'stores'))
```

**Troubleshooting**:
- Auth errors: Check `VITE_FIREBASE_*` variables
- Firestore permission: Verify Firebase console rules
- App ID mismatch: Ensure Firebase project matches env vars

---

### React Performance

**When to use**: Slow renders, unnecessary re-renders, large component trees.

**Optimization techniques**:

**Memoization**:
```jsx
import { memo, useMemo, useCallback } from 'react'

const ExpensiveComponent = memo(({ data }) => {
  const processed = useMemo(() => data.map(item => item.id), [data])
  return <div>{processed}</div>
})
```

**Lazy loading**:
```jsx
import { lazy, Suspense } from 'react'

const HeavyPage = lazy(() => import('./pages/HeavyPage'))

<Suspense fallback={<Spinner />}>
  <HeavyPage />
</Suspense>
```

**useCallback for callbacks**:
```jsx
const handleClick = useCallback((id) => {
  doSomething(id)
}, [dependency])
```

**When NOT to memoize**:
- Simple components that render rarely
- Small static content
- Functions that don't depend on component state

---

### Vite Build Optimization

**When to use**: Build errors, slow builds, production deployment.

**Common optimizations**:
- Use `import.meta.env` for env variables (prefix `VITE_`)
- Lazy load routes with `React.lazy()`
- Split chunks for large dependencies

**Build commands**:
```bash
npm run build    # Production build
npm run preview  # Preview production build locally
```

**Environment variables**:
- Must start with `VITE_`
- Access via `import.meta.env.VITE_VAR_NAME`
- Cannot be dynamically constructed

---

### State Management (Context)

**When to use**: Sharing state across multiple components.

**Context patterns in this project**:

**DeliveryContext** (state + setters):
```jsx
const { delivery, setAddress, setCourier, setResult, reset } = useDelivery()
```

**AuthContext**:
```jsx
const { user, loading, login, logout } = useAuth()
```

**StoreContext**:
```jsx
const { stores, selectedStore, setSelectedStore } = useStore()
```

**Rule**: Single responsibility - each context handles one domain.

---

### Tailwind CSS

**When to use**: Styling components, responsive design, theme customization.

**Using design tokens**:
```jsx
// Colors from tailwind.config.js
<div className="bg-surface-container text-on_surface" />
<div className="bg-primary text-secondary" />

// Display typography
<h1 className="text-display-md">Title</h1>

// Shadows and borders
<div className="shadow-floating rounded-md" />
```

**Custom utilities**: Check `tailwind.config.js` for custom colors, fonts, and shadows.

---

## Activation Rules

| Task | Skill to Activate |
|------|-------------------|
| Component not rendering | Debugging + Tailwind |
| Map issues | Mapbox GL |
| Auth problems | Firebase + Debugging |
| Slow UI | React Performance |
| Build errors | Vite Build Optimization |
| Code quality | Code Review Checklist |
| Git/commits | Git Workflow |
| Refactoring | Refactoring Patterns |
| Styling | Tailwind CSS |