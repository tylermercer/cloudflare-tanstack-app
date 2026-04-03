# Layered SCSS Architecture Spec — TanStack Start

> Implementing a Logwise-style layered SCSS system with Utopia fluid scales, Radix UI colors,
> and CSS Modules.

---

## The Layers System

This architecture is built around the CSS `@layer` cascade, which lets you explicitly declare
the order in which style rules compete — independent of where they appear in the file or how
specific their selectors are. The design has five layers, listed here from **lowest to highest
specificity**:

| # | Layer | Source | Scope |
|---|---|---|---|
| 1 | `theme` | `theme.scss` | Custom properties on `:root` |
| 2 | `base` | `base.scss` | Raw element selectors (`p`, `h1`, `a`, …) |
| 3 | `layouts` | `layouts.scss` | Layout classes, prefixed `l-` |
| 4 | `utilities` | `utilities.scss` | Single-purpose classes, prefixed `u-` |
| 5 | *(unlayered)* | `*.module.scss` | Component-scoped CSS Modules |

The first four layers are **named** — they are declared in `styles.scss` with an explicit
`@layer theme, base, layouts, utilities;` statement. CSS treats rules in a later-declared
named layer as more specific than rules in an earlier one, regardless of selector weight.
A bare `a` selector in `base` will never beat a `.l-container` rule in `layouts`, even though
`a` has no class selector and `.l-container` has one.

The fifth layer — component styles — is **deliberately unlayered**. CSS Modules are imported
as regular stylesheets by the build tool, so their rules sit outside the `@layer` system
entirely. The CSS cascade treats unlayered rules as more specific than *any* named layer. This
means a `.card` rule in `Card.module.scss` will always win over a conflicting utility or layout
class, without needing `!important` or artificially high selector specificity.

### Why this ordering makes sense in practice

The layers reflect the natural blast radius of a style rule:

- **Theme** holds no selectors at all — only custom property declarations on `:root`. It has
  the lowest specificity because it defines values, not rules. Every other layer reads from it.
- **Base** applies global element defaults. These are intentionally soft and should be easy to
  override — they're the "sensible starting point", not the final word.
- **Layouts** provides structural primitives (`l-stack`, `l-container`, `l-sidebar`, …) that
  determine how chunks of the page are arranged. They need to beat base styles but should be
  overridable by utility tweaks.
- **Utilities** are escape-hatch helpers (`u-sr-only`, `u-truncate`, …). They sit above layouts
  because when you reach for a utility, you generally mean it.
- **Component styles** are the most specific by design. A component owns its own visual
  identity and shouldn't be accidentally clobbered by a layout or utility class that happens
  to share a name.

### The prefix contract

The `l-` and `u-` prefixes on layout and utility classes are a readability convention, not a
technical requirement. They make it immediately clear in JSX which layer a class belongs to:

```tsx
// The intent of each class is legible at a glance
<div className="l-container l-stack u-truncate">
```

Component module classes have no prefix because they're scoped by the CSS Modules hash — name
collisions with globals are impossible by construction.

### How `@layer` is declared

The layer order is set once, at the top of the entry point, before any imports:

```scss
// styles.scss
@layer theme, base, layouts, utilities;
// Imports follow — the declaration above governs all of them
```

The order of the `@layer` declaration line is what matters, not the order of the imports.
Even if `utilities.scss` were somehow loaded before `base.scss`, the declared order would
still give `utilities` higher specificity. In practice the imports follow the same order for
clarity, but the safety net is there.

---

## Step 0 — Remove Tailwind

This step removes Tailwind as a dependency and from the build pipeline, but **does not touch
any `className` attributes in components**. Existing Tailwind classes will stop rendering
during this step — that's expected and will be resolved incrementally as components are
migrated to CSS Modules.

### 1. Remove packages

```bash
pnpm remove tailwindcss @tailwindcss/vite @tailwindcss/typography autoprefixer postcss
```

### 2. Delete config files

```bash
rm -f tailwind.config.ts tailwind.config.js postcss.config.js postcss.config.ts
```

### 3. Remove the Vite plugin from `app.config.ts`

```diff
- import tailwindcss from '@tailwindcss/vite'
  export default defineConfig({
    vite: {
      plugins: [
-       tailwindcss(),
        cloudflare({ viteEnvironment: { name: 'ssr' } }),
      ],
    },
  })
```

### 4. Remove Tailwind CSS imports

Find and delete any lines that import Tailwind's CSS entry point:

```bash
grep -r "tailwind" app/ --include="*.ts" --include="*.tsx" --include="*.css" -l
# Usually found in: app/styles/globals.css, app/root.tsx, or app/__root.tsx
```

Delete or clear `app/styles/globals.css` if it only contained `@tailwind` directives.

---

## Step 1 — Install Dependencies

```bash
pnpm add -D sass vite-plugin-css-auto-import
```

- **`sass`** — Vite has built-in SCSS support; it just needs the preprocessor itself installed.
  No extra Vite plugin required.
- **`vite-plugin-css-auto-import`** — Automatically detects a colocated `.module.scss` file
  for each `.tsx` component and rewrites bare `className="foo"` strings into the hashed module
  class name. This replaces the `import styles from './Button.module.scss'` + `className={styles.foo}`
  pattern entirely.

---

## Step 2 — Create the `app/styles/` Directory Structure

```
app/
└── styles/
    ├── styles.scss       ← Entry point — import this in __root.tsx
    ├── theme.scss        ← Design tokens: Utopia scales + Radix palette
    ├── base.scss         ← Reset + element defaults
    ├── layouts.scss      ← Page-level layout primitives
    └── utilities.scss    ← Functional single-purpose helpers
```

---

## Step 3 — `app/styles/theme.scss`

Holds all design tokens inside `@layer theme`. Nothing here renders styles — it only declares
custom properties on `:root`.

```scss
@layer theme {
  :root {
    // ─── Fluid Type Scale (Utopia) ─────────────────────────────────────────
    // Generated at: https://utopia.fyi/type/calculator
    // Min: 375px @ 16px base │ Max: 1280px @ 20px base │ Scale: 1.25 (Major Third)
    --step--2: clamp(0.64rem, 0.6rem + 0.2vw, 0.8rem);
    --step--1: clamp(0.8rem, 0.74rem + 0.29vw, 1rem);
    --step-0:  clamp(1rem, 0.93rem + 0.37vw, 1.25rem);
    --step-1:  clamp(1.25rem, 1.16rem + 0.47vw, 1.563rem);
    --step-2:  clamp(1.563rem, 1.44rem + 0.6vw, 1.953rem);
    --step-3:  clamp(1.953rem, 1.8rem + 0.75vw, 2.441rem);
    --step-4:  clamp(2.441rem, 2.25rem + 0.94vw, 3.052rem);

    // ─── Fluid Space Scale (Utopia) ────────────────────────────────────────
    // Generated at: https://utopia.fyi/space/calculator
    --space-3xs: clamp(0.25rem, 0.23rem + 0.09vw, 0.3125rem);
    --space-2xs: clamp(0.5rem, 0.46rem + 0.18vw, 0.625rem);
    --space-xs:  clamp(0.75rem, 0.7rem + 0.27vw, 0.9375rem);
    --space-s:   clamp(1rem, 0.93rem + 0.37vw, 1.25rem);
    --space-m:   clamp(1.5rem, 1.39rem + 0.55vw, 1.875rem);
    --space-l:   clamp(2rem, 1.85rem + 0.73vw, 2.5rem);
    --space-xl:  clamp(3rem, 2.78rem + 1.1vw, 3.75rem);
    --space-2xl: clamp(4rem, 3.7rem + 1.46vw, 5rem);
    --space-3xl: clamp(6rem, 5.56rem + 2.2vw, 7.5rem);
    // One-up pairs
    --space-s-m: clamp(1rem, 0.76rem + 1.1vw, 1.875rem);
    --space-m-l: clamp(1.5rem, 1.2rem + 1.46vw, 2.5rem);
    --space-l-xl: clamp(2rem, 1.57rem + 2.2vw, 3.75rem);

    // ─── Radix Blue (Light) ────────────────────────────────────────────────
    --primary-1:  #fdfdfe;
    --primary-2:  #f5f8ff;
    --primary-3:  #edf2fe;
    --primary-4:  #dce9ff;
    --primary-5:  #c9d9ff;
    --primary-6:  #b0c4f6;
    --primary-7:  #8daaed;
    --primary-8:  #5c8add;
    --primary-9:  #3e63dd;
    --primary-10: #3657c6;
    --primary-11: #3a5bc7;
    --primary-12: #1f2d5c;

    // ─── Radix Slate (Neutrals) ────────────────────────────────────────────
    --gray-1:  #fbfcfd;
    --gray-2:  #f8f9fa;
    --gray-3:  #f1f3f5;
    --gray-4:  #eceef0;
    --gray-5:  #e6e8eb;
    --gray-6:  #dfe3e6;
    --gray-7:  #d7dbdf;
    --gray-8:  #c1c8cd;
    --gray-9:  #889096;
    --gray-10: #7e868c;
    --gray-11: #687076;
    --gray-12: #11181c;

    // ─── Semantic Tokens ───────────────────────────────────────────────────
    // Map raw palette steps to roles. Components use these, not the raw steps.
    --color-bg:           var(--gray-1);
    --color-surface:      var(--gray-2);
    --color-border:       var(--gray-6);
    --color-border-strong: var(--gray-7);
    --color-text:         var(--gray-12);
    --color-text-subtle:  var(--gray-11);
    --color-accent:       var(--primary-9);
    --color-accent-hover: var(--primary-10);
    --color-accent-subtle: var(--primary-3);
    --color-accent-text:  var(--primary-12);

    // ─── Typography ────────────────────────────────────────────────────────
    --font-body: system-ui, -apple-system, sans-serif;
    --font-mono: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
    --font-size-base: var(--step-0);
    --line-height-body: 1.6;
    --line-height-heading: 1.2;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-bold:   700;

    // ─── Radii & Shadows ───────────────────────────────────────────────────
    --radius-s: 4px;
    --radius-m: 8px;
    --radius-l: 12px;
    --radius-full: 9999px;

    --shadow-s: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-m: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
    --shadow-l: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05);

    // ─── Transitions ───────────────────────────────────────────────────────
    --transition-fast: 100ms ease;
    --transition-base: 200ms ease;
    --transition-slow: 300ms ease;
  }

  // ─── Dark Mode ───────────────────────────────────────────────────────────
  // Swap in Radix dark-mode alpha steps. Only semantic tokens need to change.
  @media (prefers-color-scheme: dark) {
    :root {
      // Radix Blue Dark (P3 not required — these are sRGB equivalents)
      --primary-1:  #0d1520;
      --primary-2:  #111927;
      --primary-3:  #0d2847;
      --primary-4:  #003362;
      --primary-5:  #004074;
      --primary-6:  #104d87;
      --primary-7:  #205d9e;
      --primary-8:  #2f6cb2;
      --primary-9:  #3e63dd;
      --primary-10: #5373e7;
      --primary-11: #849dff;
      --primary-12: #eef1fd;

      // Radix Slate Dark
      --gray-1:  #111113;
      --gray-2:  #18191b;
      --gray-3:  #212225;
      --gray-4:  #272a2d;
      --gray-5:  #2e3135;
      --gray-6:  #363a3f;
      --gray-7:  #43484e;
      --gray-8:  #5a6169;
      --gray-9:  #696e77;
      --gray-10: #777b84;
      --gray-11: #b0b4ba;
      --gray-12: #edeef0;

      // Semantic tokens re-map automatically since they reference the raw steps above
    }
  }
}
```

---

## Step 4 — `app/styles/base.scss`

Element-level defaults. No classes — only tag selectors and pseudo-selectors.

```scss
@layer base {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    font-size: 100%; // Respect user browser font size preference
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    background-color: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-body);
    font-size: var(--font-size-base);
    line-height: var(--line-height-body);
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    line-height: var(--line-height-heading);
    font-weight: var(--font-weight-bold);
  }

  h1 { font-size: var(--step-4); }
  h2 { font-size: var(--step-3); }
  h3 { font-size: var(--step-2); }
  h4 { font-size: var(--step-1); }
  h5 { font-size: var(--step-0); }
  h6 { font-size: var(--step--1); }

  p {
    margin: 0;
  }

  a {
    color: var(--color-accent);
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color var(--transition-fast);

    &:hover {
      color: var(--color-accent-hover);
    }
  }

  img, video, svg {
    display: block;
    max-width: 100%;
  }

  button, input, select, textarea {
    font: inherit;
  }

  code, pre, kbd {
    font-family: var(--font-mono);
    font-size: 0.9em;
  }

  pre {
    overflow-x: auto;
  }

  ul, ol {
    padding-inline-start: var(--space-m);
  }

  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-radius: var(--radius-s);
  }
}
```

---

## Step 5 — `app/styles/layouts.scss`

Page-level layout primitives — the composable containers your routes snap into.

```scss
@layer layouts {
  // ─── Switcher ──────────────────────────────────────────────────────────
  // Side-by-side until threshold, then stack vertically.
  // --l-switcher-threshold controls the breakpoint.
  .l-switcher {
    display: flex;
    flex-wrap: wrap;
    --l-switcher-threshold: 50rem;
    --l-switcher-modifier: calc(var(--l-switcher-threshold) - 100%);
    gap: var(--l-space, var(--space-m));

    > * {
      flex-grow: 1;
      flex-basis: calc(var(--l-switcher-modifier) * 999);
    }
  }

  // ─── Prose ─────────────────────────────────────────────────────────────
  // Flow container for rich text. Adds vertical margin between children
  // using `margin-top` (rather than gap) so it works with inline elements.
  .l-prose {
    display: block;

    > * {
      margin-top: 1em;
      margin-bottom: 0;
    }

    > :first-child {
      margin-top: 0;
    }
  }

  // ─── Row ───────────────────────────────────────────────────────────────
  // Horizontal wrapping row. Gap controlled by --l-space modifier classes.
  .l-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--l-space, var(--space-xs));
  }

  // ─── Cluster ───────────────────────────────────────────────────────────
  // Horizontal wrapping group, left- or right-aligned.
  .l-cluster-r,
  .l-cluster-l {
    display: flex;
    flex-wrap: wrap;
    gap: var(--l-space, var(--space-xs));
  }

  .l-cluster-r { justify-content: end; }
  .l-cluster-l { justify-content: start; }

  // ─── Column ────────────────────────────────────────────────────────────
  // Vertical stack. Gap controlled by --l-space modifier classes.
  .l-column {
    display: flex;
    gap: var(--l-space, var(--space-xs));
    flex-direction: column;
    align-items: stretch;
  }

  // ─── Space modifiers ───────────────────────────────────────────────────
  // Set --l-space on a layout primitive to control its gap.
  // Compose like: <div className="l-column l-space-m">
  .l-space-none  { --l-space: 0; }
  .l-space-3xs   { --l-space: var(--space-3xs); }
  .l-space-2xs   { --l-space: var(--space-2xs); }
  .l-space-xs    { --l-space: var(--space-xs); }
  .l-space-s     { --l-space: var(--space-s); }
  .l-space-m     { --l-space: var(--space-m); }
  .l-space-l     { --l-space: var(--space-l); }
  .l-space-xl    { --l-space: var(--space-xl); }
  .l-space-3xl   { --l-space: var(--space-3xl); }

  // Fluid one-up pairs
  .l-space-3xs-2xs { --l-space: var(--space-3xs-2xs); }
  .l-space-2xs-xs  { --l-space: var(--space-2xs-xs); }
  .l-space-xs-s    { --l-space: var(--space-xs-s); }
  .l-space-s-m     { --l-space: var(--space-s-m); }
  .l-space-m-l     { --l-space: var(--space-m-l); }
  .l-space-l-xl    { --l-space: var(--space-l-xl); }
  .l-space-xl-2xl  { --l-space: var(--space-xl-2xl); }
  .l-space-2xl-3xl { --l-space: var(--space-2xl-3xl); }
}
```

> **The `--l-space` pattern:** Every layout primitive reads its gap from `var(--l-space, <default>)`.
> The `l-space-*` modifier classes set `--l-space` on the same element, which the primitive then
> inherits. This means gap control is purely additive — no modifier variants to maintain on each
> primitive, and no specificity fights. Example: `<div className="l-column l-space-l">` gives the
> column a large gap without touching the `l-column` rule itself.

---

## Step 6 — `app/styles/utilities.scss`

Intentionally small — these are escape-hatch helpers, not a utility framework. Each does
exactly one thing and uses a custom property for its value so it can be controlled inline
via `style={{ '--gap': 'var(--space-l)' }}`.

```scss
@layer utilities {
  // ─── Layout helpers ────────────────────────────────────────────────────
  .u-guttered {
    padding: var(--space-m);
    margin-inline: auto;
    max-inline-size: 60ch;
  }

  .u-guttered-lg {
    padding: var(--space-m);
    margin-inline: auto;
    max-inline-size: 90ch;
  }

  // ─── Typography ────────────────────────────────────────────────────────
  .u-slub {
    text-transform: uppercase;
    font-weight: bold;
    font-size: var(--step--1);
    color: var(--gray-11); // Logwise: --gray-11
  }

  .u-break-words {
    overflow-wrap: break-words;
  }

  .u-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // ─── Links ─────────────────────────────────────────────────────────────
  a.u-link-block {
    display: block;
    height: 100%;
    color: unset;

    &:link {
      text-decoration: none;
    }
  }

  // ─── Navigation ────────────────────────────────────────────────────────
  // Logwise: --primary-* maps to your --primary-* tokens
  .u-item-link,
  .u-nav-link {
    display: flex;
    text-decoration: none;
    background-color: transparent;
    padding: var(--space-xs);
    padding-left: var(--space-m);
    font-size: var(--step-0);
    align-items: center;

    &:hover, &:focus {
      background-color: var(--primary-4); // Logwise: --primary-4
    }
  }

  .u-nav-link {
    color: var(--primary-11); // Logwise: --primary-11

    &:hover, &:focus {
      color: var(--primary-12); // Logwise: --primary-12
    }
  }

  .u-item-link {
    color: var(--gray-12); // Logwise: --gray-12
  }

  // ─── Feedback states ───────────────────────────────────────────────────
  .u-error {
    background-color: #ffa5a5;
    color: darkred;
    padding: var(--space-s);
    border-radius: 4px;

    & a:link {
      color: inherit;
    }
  }

  .u-success {
    background-color: lightgreen;
    color: darkgreen;
    padding: 0.5em;
  }

  .u-danger {
    color: var(--danger); // Define --danger in theme.scss if needed
  }

  // ─── Backgrounds ───────────────────────────────────────────────────────
  // Set --u-cascading-bg on a parent to propagate a background downward
  .u-cascading-bg {
    background-color: var(--u-cascading-bg);
  }

  // ─── Icon button groups ────────────────────────────────────────────────
  .u-icon-button-group-right {
    margin-right: calc(var(--space-xs) * -1);
  }

  // ─── Responsive visibility ─────────────────────────────────────────────
  @media (max-width: 512px) {
    .u-desktop-only { display: none; }
  }

  @media (min-width: 513px) {
    .u-mobile-only { display: none; }
  }

  // ─── Scrollbars ────────────────────────────────────────────────────────
  @media (min-width: 513px) {
    .u-desktop-scrollbars-y {
      overflow-y: auto;
    }

    .u-styled-scrollbars {
      --u-styled-scrollbars-fg: var(--primary-4); // Logwise: --primary-4
      --u-styled-scrollbars-bg: var(--primary-2); // Logwise: --primary-2
      scrollbar-color: var(--u-styled-scrollbars-fg) var(--u-styled-scrollbars-bg);
      scrollbar-width: thin;

      &::-webkit-scrollbar {
        width: 0.5rem;
        height: 0.5rem;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--u-styled-scrollbars-fg);
      }

      &::-webkit-scrollbar-track {
        background: var(--u-styled-scrollbars-bg);
      }
    }
  }

  // ─── Accessibility ─────────────────────────────────────────────────────
  .u-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}
```

> **Token mapping:** Several utilities reference Logwise-specific tokens (`--primary-*`, `--gray-*`,
> `--danger`) that have been mapped to the equivalent `--primary-*` and `--gray-*` steps from
> `theme.scss`. Comments on each line indicate the original Logwise token. If you define semantic
> aliases in `theme.scss` (e.g. `--primary-4: var(--primary-4)`), you can update these to use those
> aliases for easier future palette swaps.

---

## Step 7 — `app/styles/styles.scss` (The Entry Point)

This file does two things: declares the layer order (which controls specificity) and imports
all global stylesheets. **The `@layer` declaration must be the very first line.**

```scss
// 1. Declare layer order — earlier = lower specificity
//    CSS Modules (anonymous layer) will always beat these named layers.
@layer theme, base, layouts, utilities;

// 2. Import in the same order
@use './theme.scss';
@use './base.scss';
@use './layouts.scss';
@use './utilities.scss';
```

> **Why `@use` instead of `@import`?**  
> Sass `@import` is deprecated. `@use` loads each file only once, even if referenced by
> multiple files, preventing duplicate CSS output. Because these files only define
> `@layer` blocks (not SCSS variables or mixins that need to be used across files),
> `@use` is correct here with no namespace needed.

> **Layer specificity cascade:**  
> `theme` < `base` < `layouts` < `utilities` < *CSS Module classes (unlayered)*  
> This means a `.card` class from a CSS Module will always beat any global utility or layout rule —
> exactly what you want for component encapsulation.

---

## Step 8 — Configure `app.config.ts`

```typescript
import { defineConfig } from '@tanstack/react-start-config'
import { cloudflare } from '@cloudflare/vite-plugin'
import cssAutoImport from 'vite-plugin-css-auto-import'

export default defineConfig({
  vite: {
    plugins: [
      // Must come before other transform plugins
      cssAutoImport({
        // Only match .module.scss files (not plain .scss globals)
        styleExtensions: ['.module.scss'],
        // Match component file name exactly: Button.tsx → Button.module.scss
        matchComponentName: true,
      }),
      cloudflare({ viteEnvironment: { name: 'ssr' } }),
    ],
    css: {
      modules: {
        // Allows className="myButton" instead of className="my-button"
        localsConvention: 'camelCaseOnly',
        // Scoped class name pattern — include the file name for debuggability
        generateScopedName: '[name]__[local]__[hash:5]',
      },
      preprocessorOptions: {
        scss: {
          // Make your design tokens silently available in every module
          // without polluting the output (no CSS emitted from this file)
          silentImports: true,
        },
      },
    },
  },
})
```

---

## Step 9 — Wire Up the Entry Stylesheet

In `app/routes/__root.tsx` (or wherever your root layout lives), import `styles.scss` once:

```tsx
import '../styles/styles.scss'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

This is the **only** place you import global styles. Everything else is CSS Modules.

---

## Step 10 — Authoring Component CSS Modules

### File structure (colocation)

```
app/components/
├── Button.tsx
├── Button.module.scss    ← auto-imported by vite-plugin-css-auto-import
├── Card.tsx
└── Card.module.scss
```

### In the TSX — no import needed

```tsx
// app/components/Button.tsx
// No `import styles from './Button.module.scss'` required!

type ButtonProps = {
  variant?: 'primary' | 'ghost'
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button
      className={`button ${variant}`}  // bare strings — plugin hashes them at build time
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### In the module SCSS

```scss
// app/components/Button.module.scss

.button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-m);
  border-radius: var(--radius-m);
  font-size: var(--step-0);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    border-color var(--transition-fast);

  &:focus-visible {
    // Inherits global :focus-visible from base.scss — nothing needed here
  }
}

.primary {
  background-color: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);

  &:hover {
    background-color: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
  }
}

.ghost {
  background-color: transparent;
  color: var(--color-accent);
  border-color: var(--color-border);

  &:hover {
    background-color: var(--color-accent-subtle);
  }
}
```

### What the plugin does under the hood

At build time, `vite-plugin-css-auto-import` transforms:

```tsx
// Source
<button className={`button ${variant}`}>

// After plugin transform (approximately)
<button className={`Button__button__a3f1k ${variant === 'primary' ? 'Button__primary__b2c9d' : 'Button__ghost__d7e4f'}`}>
```

Any class name not found in the colocated module is left as-is (treated as a global class),
so `className="l-container l-stack"` will still resolve to your layout classes from `layouts.scss`.

---

## Appendix — Sharing SCSS Variables Across Modules (Optional)

If you need SCSS variables or mixins available in every module (e.g., a `breakpoints` mixin),
create a `_shared.scss` partial:

```scss
// app/styles/_shared.scss

// Breakpoint mixin — wraps design tokens in a media query helper.
// These emit NO CSS on their own; they're only used when called.
@mixin above($bp) {
  @if $bp == sm { @media (min-width: 40rem) { @content; } }
  @else if $bp == md { @media (min-width: 60rem) { @content; } }
  @else if $bp == lg { @media (min-width: 80rem) { @content; } }
}
```

Then add it to `preprocessorOptions` in `app.config.ts`:

```typescript
preprocessorOptions: {
  scss: {
    additionalData: `@use 'app/styles/_shared' as *;`,
  },
},
```

Now every `.module.scss` file can use `@include above(md) { ... }` without an explicit import.

---

## Appendix — `generateScopedName` for Production vs Development

The default hash can make debugging harder. Consider splitting by environment:

```typescript
// app.config.ts
const isDev = process.env.NODE_ENV !== 'production'

css: {
  modules: {
    generateScopedName: isDev
      ? '[name]__[local]'           // "Button__primary" — readable in DevTools
      : '[hash:base64:6]',          // "a3f1k2" — compact in production
  },
},
```

---

## Quick Reference — What Goes Where

| Need | File |
|---|---|
| A new color token | `theme.scss` → `:root` block |
| Dark mode token override | `theme.scss` → `@media (prefers-color-scheme: dark)` |
| Style a raw HTML element globally | `base.scss` |
| A new page layout pattern | `layouts.scss` |
| Control gap on a layout primitive | Add `l-space-*` modifier class alongside it |
| A tiny utility helper class | `utilities.scss` |
| Styles for a React component | Colocated `ComponentName.module.scss` |
| A SCSS mixin shared across modules | `_shared.scss` + `additionalData` |
