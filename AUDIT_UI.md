# UI Audit — Baseline (Step 1)

## Router
- **App Router**: `app/` directory with `layout.tsx` and route segments (`app/[lang]/*`).

## Global Styles / Source of Truth
- **Global CSS**: `app/globals.css`
  - Sets body background `#0D0D0D`, text color `#d1d1d1`, font weight 300, font smoothing.
- **Fonts**: `app/layout.tsx` loads local **Roboto Serif** via `next/font/local` and exposes `--font-roboto-serif`.
  - `tailwind.config.ts` maps `font-serif` → `var(--font-roboto-serif)`.
- **No CSS variables** for spacing/typography tokens today.

## Tailwind Config Summary
- **Screens**: default Tailwind breakpoints (no custom `screens` defined).
- **Theme Extend**:
  - `fontFamily.serif`
  - Custom animations/keyframes: `fade-up`, `progress`, `infinite-scroll`.
- **Spacing / typography scales**: default Tailwind scales, plus numerous **arbitrary values** in class strings.

## Tailwind vs CSS Modules Usage
- **CSS Modules not found** (`*.module.css` / `*.module.scss` absent).
- Styling is **primarily Tailwind classes**, with occasional **inline styles** and **styled-jsx** (e.g., `components/RestaurantsClient.tsx` for scrollbar hide).
- Internal rule (current state): Tailwind for layout/typography; inline styles for dynamic values and one-off behaviors.

## Repeating Layout Patterns (Observed)
- **Container padding**: `px-4 md:px-10` and variants (`px-6 sm:px-8 lg:px-12 xl:px-16`)
- **Section spacing**: `pt-16`, `pb-24`, `py-10/16`, `min-h-screen` / `h-screen`
- **Typography**:
  - Headlines: `font-serif`, uppercase, tracking-tight, large sizes (e.g. `text-[32px]` → `md:text-[70px]`)
  - Body: `text-white/70`, `font-light`, `leading-relaxed`
- **Buttons**:
  - Rounded full, thin border, subtle hover: `border-white/20`, `bg-white/5`, `tracking-[0.1em]` (e.g. `components/Header.tsx`, `components/HeroSliderClient.tsx`)
- **Cards**:
  - Image card with overlay gradient + logo in `components/RestaurantsClient.tsx`.

## Current Breakpoints in Use
- Tailwind defaults: `sm(640)`, `md(768)`, `lg(1024)`, `xl(1280)`, `2xl(1536)`.
- Custom sizing for `2xl` appears ad-hoc in `components/RestaurantDetail.tsx`.

## Spacing System (Current State)
- **Mixed scale**: Tailwind scale + many arbitrary pixel values (e.g. `h-[80px]`, `w-[120px]`, `gap-[120px]`, `px-[140px]`).
- Vertical rhythm varies between sections and pages (hero, running line, restaurants, detail page).

## Primary Pain Points (with files)
- **Inconsistent container padding** (multiple hard-coded sets) across pages/components:
  - `components/Header.tsx`, `components/HeroSliderClient.tsx`, `components/RestaurantsClient.tsx`, `components/RestaurantDetail.tsx`.
- **Typography sizes & line-heights vary without a shared scale**:
  - `components/HeroSliderClient.tsx`, `components/RestaurantsClient.tsx`, `components/Header.tsx`, `components/RestaurantDetail.tsx`.
- **Background color inconsistencies** (`#0D0D0D`, `#0c0c0c`, `#0F0F0F`) across sections.
- **Ad-hoc spacing/gap values** causing non-uniform vertical rhythm.
- **Inline styles used for layout** (scroll behaviors, transform) without tokens or abstraction.

---

Next: Step 2 — scan key pages/components for concrete high/medium/low issues and map to files.

## Step 2 — Issues & Priorities (Initial Audit)

### High Priority
- **Container/padding system is inconsistent** across primary sections, causing misaligned edges and uneven rhythm.
  - Files: `components/HeroSliderClient.tsx`, `components/RestaurantsClient.tsx`, `components/RestaurantDetail.tsx`, `components/Header.tsx`, `components/RunningLine.tsx`.
  - Recommendation: introduce a single horizontal container token (e.g., `px-4 md:px-10 xl:px-16 2xl:px-[140px]`) and reuse it; define a standard section vertical padding token.
- **Typography scale is ad-hoc** (headline/body sizes and line-heights vary without shared scale), creating inconsistent hierarchy.
  - Files: `components/HeroSliderClient.tsx`, `components/RestaurantsClient.tsx`, `components/RestaurantDetail.tsx`, `components/Header.tsx`.
  - Recommendation: define 3–4 text tokens (display/title/body/label) and align sizes/line-height/letter-spacing.
- **Background color drift** between sections (`#0D0D0D`, `#0c0c0c`, `#0F0F0F`) breaks visual consistency.
  - Files: `app/[lang]/page.tsx`, `components/RunningLine.tsx`, `components/HeroSliderClient.tsx`, `components/RestaurantsClient.tsx`.
  - Recommendation: normalize to a base background token (e.g., `bg-brand-black`) and use consistently.

### Medium Priority
- **Section vertical spacing varies** (e.g., hero content padding, running line `py-10/16`, restaurants `pt-16 pb-24`), producing uneven rhythm across scrolling.
  - Files: `components/HeroSliderClient.tsx`, `components/RunningLine.tsx`, `components/RestaurantsClient.tsx`.
- **Button styling duplicates** across components (rounded full, borders, uppercase tracking) without a shared helper.
  - Files: `components/Header.tsx`, `components/HeroSliderClient.tsx`, `components/SliderButton.tsx`.
- **Inline styles used for layout/behavior** (scroll behaviors, transforms) mixed with Tailwind, complicating consistency.
  - Files: `components/RestaurantDetail.tsx`, `components/HeroSliderClient.tsx`, `components/RestaurantsClient.tsx`.

### Low Priority
- **Language/provider duplication** (LanguageProvider wrapped in both `app/[lang]/layout.tsx` and `components/RootLayoutClient.tsx`) may complicate theming or global UI rules.
- **Mixed font weights** and tracking values are hard-coded; can be normalized after spacing/typography tokens are in place.

### Breakpoint Spots to Validate
- **375px**: hero text line breaks and button spacing; restaurant card width and snap spacing.
- **768px**: header height vs content offset; RunningLine type size jump.
- **1024px**: transition from stacked to multi-column grids in RestaurantDetail.
- **1440px+**: overall scale and rhythm (especially left/right padding and hero text block width).

## Step 3 — System Choice & Tokens (Implemented)

### Chosen Approach
- **Option B: CSS variables in `app/globals.css` + Tailwind utility classes**.
- Rationale: minimal code churn, keeps existing Tailwind usage, allows shared spacing/typography without heavy config edits.

### New Tokens (Source of Truth)
- **Colors**: `--color-bg`, `--color-bg-elev`, `--color-text`
- **Spacing**: `--page-x`, `--section-y-sm`, `--section-y`, `--section-y-lg`
- **Typography**:
  - `--fs-display`, `--fs-h1`, `--fs-title`, `--fs-title-sm`, `--fs-title-lg`, `--fs-body`, `--fs-body-lg`, `--fs-label`, `--fs-marquee`

### New Utilities (Global)
- Layout: `.page-x`, `.section-y-sm`, `.section-y`, `.section-y-lg`
- Typography: `.text-display`, `.text-h1`, `.text-title`, `.text-title-sm`, `.text-title-lg`, `.text-body`, `.text-body-lg`, `.text-label`, `.text-marquee`
- Surfaces: `.bg-base`, `.bg-surface`

## Step 4/5 — Applied Adjustments (Menu, Cards, Adaptives)

### Components Updated to Tokens
- `components/Header.tsx`
  - Menu + language controls → `text-ui`, nav items → `text-nav`, panel → `bg-panel`.
- `components/RestaurantsClient.tsx`
  - Card surface → `bg-card`, meta text → `text-meta`, empty state → `text-meta`.
- `components/HeroSliderClient.tsx`
  - CTA text → `text-ui` / `text-ui-wide`, slide counters → `text-counter` / `text-counter-sm`.
- `components/RestaurantDetail.tsx`
  - Large layout gap uses tokenized value; map fallback uses `bg-card`.

### Adaptive Token Adjustments
- Added token steps for **1024px** and **1440px** to smooth layout scaling:
  - `--page-x` and `--fs-h1` now progress at `1024`, `1280`, `1440`, `1536`.
