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
    --blue-1:  #fdfdfe;
    --blue-2:  #f5f8ff;
    --blue-3:  #edf2fe;
    --blue-4:  #dce9ff;
    --blue-5:  #c9d9ff;
    --blue-6:  #b0c4f6;
    --blue-7:  #8daaed;
    --blue-8:  #5c8add;
    --blue-9:  #3e63dd;
    --blue-10: #3657c6;
    --blue-11: #3a5bc7;
    --blue-12: #1f2d5c;

    // ─── Radix Indigo (Light) ──────────────────────────────────────────────
    --indigo-1:  #fdfdfe;
    --indigo-2:  #f7f9ff;
    --indigo-3:  #edf2fe;
    --indigo-4:  #dde6ff;
    --indigo-5:  #ccd7ff;
    --indigo-6:  #b5c4f6;
    --indigo-7:  #93a8ee;
    --indigo-8:  #6481e4;
    --indigo-9:  #3e63dd;
    --indigo-10: #3657c6;
    --indigo-11: #3451b2;
    --indigo-12: #1f2d5c;

    // ─── Radix Slate (Neutrals) ────────────────────────────────────────────
    --slate-1:  #fbfcfd;
    --slate-2:  #f8f9fa;
    --slate-3:  #f1f3f5;
    --slate-4:  #eceef0;
    --slate-5:  #e6e8eb;
    --slate-6:  #dfe3e6;
    --slate-7:  #d7dbdf;
    --slate-8:  #c1c8cd;
    --slate-9:  #889096;
    --slate-10: #7e868c;
    --slate-11: #687076;
    --slate-12: #11181c;

    // ─── Semantic Tokens ───────────────────────────────────────────────────
    // Map raw palette steps to roles. Components use these, not the raw steps.
    --color-bg:           var(--slate-1);
    --color-surface:      var(--slate-2);
    --color-border:       var(--slate-6);
    --color-border-strong: var(--slate-7);
    --color-text:         var(--slate-12);
    --color-text-subtle:  var(--slate-11);
    --color-accent:       var(--blue-9);
    --color-accent-hover: var(--blue-10);
    --color-accent-subtle: var(--blue-3);
    --color-accent-text:  var(--blue-12);

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
      --blue-1:  #0d1520;
      --blue-2:  #111927;
      --blue-3:  #0d2847;
      --blue-4:  #003362;
      --blue-5:  #004074;
      --blue-6:  #104d87;
      --blue-7:  #205d9e;
      --blue-8:  #2f6cb2;
      --blue-9:  #3e63dd;
      --blue-10: #5373e7;
      --blue-11: #849dff;
      --blue-12: #eef1fd;

      // Radix Slate Dark
      --slate-1:  #111113;
      --slate-2:  #18191b;
      --slate-3:  #212225;
      --slate-4:  #272a2d;
      --slate-5:  #2e3135;
      --slate-6:  #363a3f;
      --slate-7:  #43484e;
      --slate-8:  #5a6169;
      --slate-9:  #696e77;
      --slate-10: #777b84;
      --slate-11: #b0b4ba;
      --slate-12: #edeef0;

      // Semantic tokens re-map automatically since they reference the raw steps above
    }
  }
}
```

> **Tip:** Regenerate the Utopia values for your own min/max viewport and base sizes at
> [utopia.fyi](https://utopia.fyi). Paste the output CSS variables directly into this block.

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
  // ─── Stack ─────────────────────────────────────────────────────────────
  // Vertical flow with controlled gap
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--stack-gap, var(--space-m));
  }

  // ─── Cluster ───────────────────────────────────────────────────────────
  // Horizontal group that wraps; gap on all sides
  .cluster {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cluster-gap, var(--space-s));
    align-items: var(--cluster-align, center);
  }

  // ─── Switcher ──────────────────────────────────────────────────────────
  // Side-by-side until threshold, then stack
  .switcher {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-m);

    > * {
      flex-grow: 1;
      flex-basis: calc((var(--switcher-threshold, 40rem) - 100%) * 999);
    }
  }

  // ─── Container ─────────────────────────────────────────────────────────
  // Centred with fluid inline padding
  .container {
    width: min(var(--container-max, 72rem), 100%);
    margin-inline: auto;
    padding-inline: var(--space-s-m);
  }

  .container--narrow {
    --container-max: 48rem;
  }

  .container--wide {
    --container-max: 90rem;
  }

  // ─── Sidebar ───────────────────────────────────────────────────────────
  // Holy-grail sidebar layout
  .with-sidebar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-m);

    > .sidebar {
      flex-basis: var(--sidebar-width, 16rem);
      flex-grow: 1;
    }

    > .main-content {
      flex-basis: 0;
      flex-grow: 999;
      min-width: min(var(--sidebar-threshold, 60%), 100%);
    }
  }

  // ─── Cover ─────────────────────────────────────────────────────────────
  // Full-height section centred on a primary element
  .cover {
    display: flex;
    flex-direction: column;
    min-height: var(--cover-min, 100dvh);
    padding: var(--space-m);

    > * { margin-block: auto; }
    > :first-child:not(.cover-center) { margin-block-start: 0; }
    > :last-child:not(.cover-center)  { margin-block-end: 0; }
    > .cover-center { margin-block: auto; }
  }
}
```

---

## Step 6 — `app/styles/utilities.scss`

Intentionally small — these are escape-hatch helpers, not a utility framework. Each does
exactly one thing and uses a custom property for its value so it can be controlled inline
via `style={{ '--gap': 'var(--space-l)' }}`.

```scss
@layer utilities {
  .sr-only {
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

  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .flow > * + * {
    margin-block-start: var(--flow-space, var(--space-m));
  }

  .not-prose a { text-decoration: none; }
}
```

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
so `className="container stack"` will still resolve to your layout classes from `layouts.scss`.

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
| A tiny utility helper class | `utilities.scss` |
| Styles for a React component | Colocated `ComponentName.module.scss` |
| A SCSS mixin shared across modules | `_shared.scss` + `additionalData` |
