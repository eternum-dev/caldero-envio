const fs = require('fs');
const path = require('path');

const coverageDir = path.join(__dirname, '..', 'coverage');
const baseCss = path.join(coverageDir, 'base.css');
const indexHtml = path.join(coverageDir, 'index.html');

// ── Custom dark theme CSS to inject ──

const customCss = `
/* ── Caldero Envío — Coverage Theme ── */

:root {
  --primary: #FFBF00;
  --primary-dim: #B8860B;
  --surface: #1C1B1A;
  --surface-low: #252423;
  --surface-medium: #2E2D2C;
  --surface-high: #363433;
  --on-surface: #E6E1DF;
  --on-surface-variant: #C4BFBD;
  --green: #4ADE80;
  --red: #F87171;
  --yellow: #FBBF24;
}

body {
  background: var(--surface) !important;
  color: var(--on-surface) !important;
  font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
}

h1, h2, h3, h4 {
  color: var(--primary) !important;
}

a {
  color: var(--primary) !important;
}

.pad1 {
  background: var(--surface-medium) !important;
  border-radius: 8px;
}

table {
  background: var(--surface-low) !important;
  border-radius: 8px;
  overflow: hidden;
}

thead th {
  background: var(--surface-medium) !important;
  color: var(--primary) !important;
  border-bottom: 2px solid var(--primary-dim) !important;
}

tbody tr:nth-child(even) {
  background: var(--surface-medium) !important;
}

tbody tr:nth-child(odd) {
  background: var(--surface-low) !important;
}

tbody tr:hover {
  background: var(--surface-high) !important;
}

td {
  border-color: var(--surface-high) !important;
  color: var(--on-surface) !important;
}

.cov-unit { color: var(--on-surface-variant) !important; }
.cov-0 strong { color: var(--red) !important; }
.cov-1 strong { color: var(--green) !important; }
.cov-2 strong { color: var(--yellow) !important; }

.strong { font-weight: 600 !important; }

.status-line { height: 12px !important; border-radius: 6px !important; }
.status-line.cov-done { background: var(--green) !important; }
.status-line.cov-no { background: var(--red) !important; }
.status-line.cov-branch { background: var(--yellow) !important; }

pre {
  background: var(--surface-low) !important;
  border: 1px solid var(--surface-high) !important;
  border-radius: 8px;
}

.c0 { color: var(--on-surface) !important; }
.c1 { color: var(--on-surface-variant) !important; }

/* ── ── */

.footer {
  color: var(--on-surface-variant) !important;
  border-top: 1px solid var(--surface-high);
}
`;

// ── Inject custom CSS ──

if (fs.existsSync(baseCss)) {
  const original = fs.readFileSync(baseCss, 'utf-8');
  const updated = original + '\n' + customCss;
  fs.writeFileSync(baseCss, updated);
  console.log('✅ Coverage theme applied');
} else {
  console.log('⚠️  base.css not found. Run "npm test -- --coverage" first.');
}
