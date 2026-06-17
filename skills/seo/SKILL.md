---
name: seo
description: >
  Use when adding SEO to a React SPA, choosing between static meta vs Helmet vs SSR,
  creating SEO components, generating robots.txt/sitemap.xml/manifest.json,
  adding JSON-LD structured data.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: 0.1.0
  allowed-tools:
    - edit
    - write
    - read
    - glob
    - grep
    - bash
---

# SEO for React SPA

## Critical Patterns

### React SPA SEO Decision Tree

**Choose the right approach based on crawler capability:**

1. **Static `<meta>` in `index.html`** — Universal fallback. ALL crawlers see this (Googlebot, Bingbot, social scrapers). Use for: site-wide title, description, OG/Twitter tags, WebSite JSON-LD, favicon, manifest. No JS required.

2. **`react-helmet-async` per-route overrides** — Dynamic tags for JS-enabled contexts. Googlebot renders JS and will pick these up. Use for: per-route titles, descriptions, canonical URLs, page-specific JSON-LD (e.g., SoftwareApplication on landing only). **Requires `<HelmetProvider>` wrapper.**

3. **Pre-render (e.g., vite-plugin-ssr, prerender-spa-plugin)** — For crawlers that don't execute JS (some social scrapers, older bots). Generates static HTML at build time. Use only if social sharing previews are critical and the SPA deploy target doesn't support SSR.

4. **Full SSR / Next.js** — Best SEO but highest complexity. Only choose if SEO is a PRIMARY business requirement and the team can support Node.js server rendering.

**What each crawler sees:**

| Crawler | Static `index.html` | `react-helmet-async` | Pre-render |
|---------|---------------------|----------------------|------------|
| Googlebot | ✅ Always | ✅ Renders JS | ✅ Redundant |
| Bingbot | ✅ Always | ⚠️ Partial JS | ✅ Recommended |
| Twitter/Facebook scrapers | ✅ Always | ❌ No JS | ✅ Required for previews |
| Browser (user) | ✅ Always | ✅ Full dynamic | ✅ Redundant |

### Helmet Rules

- **MUST** wrap the app with `<HelmetProvider>` as the OUTERMOST wrapper (before `<BrowserRouter>`).
- **MUST** wrap test renders that use `<SEO>` with `<HelmetProvider>` per-test (not global setup).
- `<Helmet>` renders children into `<head>` — do NOT nest it inside other `<Helmet>` calls.
- For JSON-LD: render `<script type="application/ld+json">{JSON.stringify(schema)}</script>` inside `<Helmet>`.

### `<SEO>` Component Pattern

Place in `src/ui/atoms/SEO.jsx` (Atomic Design — single-purpose, stateless atom):

```jsx
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://example.com';
const SITE_NAME = 'Your App';
const DEFAULT_TITLE = `${SITE_NAME} — Your tagline`;
const DEFAULT_DESC = 'Your default description for SEO.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  schema = null,
}) {
  const resolvedOgTitle = ogTitle || title;
  const resolvedOgDescription = ogDescription || description;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={resolvedOgTitle} />
      <meta property="og:description" content={resolvedOgDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedOgTitle} />
      <meta name="twitter:description" content={resolvedOgDescription} />
      <meta name="twitter:image" content={ogImage} />
      {noindex && <meta name="robots" content="noindex" />}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify({ '@context': 'https://schema.org', ...schema })}
        </script>
      )}
    </Helmet>
  );
}
```

### HelmetProvider Wrapping Pattern

**In `src/App.jsx`:**
```jsx
import { HelmetProvider } from 'react-helmet-async';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>...</BrowserRouter>
    </HelmetProvider>
  );
}
```

**In tests:**
```jsx
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';

function renderWithRouter(component) {
  return render(
    <HelmetProvider><MemoryRouter>{component}</MemoryRouter></HelmetProvider>
  );
}
```

### JSON-LD Templates

**WebSite (use in `index.html`):**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Your App",
  "url": "https://example.com",
  "description": "Your description.",
  "inLanguage": "es"
}
```

**SoftwareApplication (use on landing via `<SEO>`):**
```jsx
schema={{
  "@type": "SoftwareApplication",
  "name": "Your App",
  "operatingSystem": "Web",
  "applicationCategory": "BusinessApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}}
```

### Vite `public/` Assets

Files in `public/` are served at root. No webpack config needed:
- `public/robots.txt` → `/robots.txt`
- `public/sitemap.xml` → `/sitemap.xml`
- `public/manifest.json` → `/manifest.json`
- `public/favicon.svg` → `/favicon.svg`

## Commands

```bash
npm install react-helmet-async
```

## Resources

- [react-helmet-async Documentation](https://github.com/nickytonline/react-helmet-async)
- [Schema.org Structured Data](https://schema.org/SoftwareApplication)
- [Open Graph Protocol](https://ogp.me/)
- [Google Search Central — SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)