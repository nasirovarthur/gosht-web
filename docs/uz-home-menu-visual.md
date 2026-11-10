# UZ Homepage Menu and Menu Visual Alignment

## Scope

2026-11-09: add a dish section to the Uzbekistan homepage and align the restaurant menu with the American site. The owner subsequently limited current work to visuals while arranging iiko credentials. No production deployment, environment update, restart, content import or database mutation was performed.

Existing uncommitted changes to `app/globals.css`, `next.config.ts`, the menu component and `design-qa.md` were retained. The US checkout, prices and restaurant facts were not copied into the UZ application. Its existing demo-cart behavior remains explicitly marked as a demo.

## Visual Direction

References inspected:

- https://www.novikovgroup.ru/novikov_international/detail/novikov-cafe-tashkent/
- https://novikovdelivery.ru/
- https://prichalrest.ru/
- https://www.gosht.com/restaurants/gosht-brooklyn/menu

The Novikov Tashkent page is primarily an editorial restaurant/gallery page, not a populated food catalog. The broader references demonstrate large food photography and straightforward access to menu categories. The implementation retains GOSHT's dark surfaces, Roboto Serif headings, existing page gutters and restrained separators rather than copying competitors' branding.

The homepage block sits after the hero. On 2026-11-10 the owner selected the third generated concept: an editorial gallery with one large photo left and two smaller photos stacked right, paging in groups of three. Below 768px it becomes a swipeable single-row lane. One/two-item groups have dedicated layouts. Controls reflect scroll boundaries, support keyboard focus and respect reduced motion. Cards link to their corresponding menu dish dialog. Following the latest feedback, captions contain the localized title and optional description only, without prices or per-dish arrows. Descriptions are whitespace-normalized and visually limited to two lines; absent descriptions do not get invented fallback text. Full descriptions and prices remain in the menu/dialog. The menu CTA and carousel controls reuse the existing branded SliderButton. Availability and photos come from the same loader and admin visibility policy as the menu. There is no hardcoded production dish or price list.

On missing menu data, the block uses the existing GOSHT kitchen image without fabricated prices or cards. Asset source: `steak_compressed.webp` in the public Sanity dataset, `https://cdn.sanity.io/images/90iua6vo/production/a7f2dea1ad117ce123e0d27c3c50cbe7bd7803c0-3840x2160.webp`.

The menu retains UZ contact details, sums, Cyrillic category recognition and demo cart, while aligning the logo/title, information grid, horizontal category rail, mixed-size dish grid, no-photo state and rounded order panel to the US composition. Modal keyboard focus, Tab containment and Escape dismissal are included. Default/unknown dish URLs do not open empty dialogs.

## Data Dependency

Initial read-only server diagnosis confirmed menu `43854`, `Gosht - Uzum`. iiko authentication returned HTTP 403 at `/api/1/access_token`, explicitly requiring `/api/v2/access_token`. At that check the server lacked `IIKO_APP_ID` and `IIKO_CLIENT_SECRET`. Official reference: https://api.iiko.help/docs/concepts/authorization/.

Local v2 support and runtime environment placeholders were prepared before the owner deferred credentials. Neither credentials nor authentication were changed in production. New auth uses `IIKO_API_KEY` or the existing `IIKO_API_LOGIN` as `apiKey`; both app credentials must be supplied together. The API key and secrets stay server-side. Admin backend synchronization is not certified by the website adapter change.

2026-11-10 update: the owner supplied working application credentials. Actual v2 authorization and version-4 menu retrieval now return 200 locally. The existing adapter maps 21 categories and 119 priced dishes, with 118 images and 117 descriptions. A separate real-data local runtime on port 3006 reads secrets into memory from the owner's files, without adding them to repository files. The ignored local menu selectors were corrected from 29036 to 43854 and the empty price-category configuration matches the live API. No production environment was changed.

Live release blocker: the production custom-admin public visibility endpoint currently returns 404. Its route exists in the local admin code, but active deployment/visibility integration needs a separate verified release. The real-data local preview follows the existing fail-open behavior for that optional policy API; it must not be described as verified admin hiding.

## Preview and QA

- Actual-data local preview: `http://127.0.0.1:3006/ru#menu`; now populated from real iiko data, not the TEST preload.
- Explicit local fixture: `http://127.0.0.1:3007/ru#menu`, with `[ТЕСТ]` in every synthetic dish name. Fixture prices are not restaurant prices.
- Fixture loader is outside the application repository: `/Users/arthurn/Desktop/about/output/uz-menu-qa/mock-iiko.cjs`. It requires `GOSHT_MENU_QA=local-fixture`, mocks only iiko requests, uses literal dummy credentials and is never part of the production image.
- Photos in the fixture are observed public menu images from GOSHT Brooklyn, solely for visual QA, not asserted to depict UZ dishes. Source: the US menu above, Toast menu-service media URLs recorded in the fixture.
- Browser viewport override did not change the rendered viewport in this session. A separate local QA wrapper (`http://127.0.0.1:3008`) therefore renders actual 390px, 1064px and 1920px iframe viewports. Their document widths and overflow are checked inside the frame. This wrapper is not part of the application.
- `node --test tests/menu.test.mjs`: 16 passing tests, including localized descriptions, missing/whitespace descriptions, safe text rendering and absence of homepage prices, plus the previous integration, link, ordering and menu tests.
- Final scoped ESLint and production build/TypeScript passed.
- Impeccable mechanical detector on the three changed UI files returned `[]`. This is not certification of live data recovery.
- Browser checks: homepage carousel navigation, exact-dish links, category selection and Escape dismissal passed. Actual iframe widths 390, 1064 and 1920px have no document overflow. Mobile dish content fits its dialog. The tablet header no longer overlaps the centered logo with the delivery link. Keyboard actions inside the QA iframe were unavailable in the browser tool; Escape dismissal was verified in the direct preview tab instead.
- Screenshots: `/Users/arthurn/Desktop/about/output/uz-menu-qa/screenshots/`, including `home-1280-fixture.png`, `home-390-fixture.png`, `menu-1064-fixture.png`, `menu-1920-fixture.png` and `dish-390-fixture.png`. All populated menu captures use explicitly synthetic fixture data.
- Final real-data preview shows the existing kitchen image and restaurant contact fallback without synthetic prices. Preview servers listen only on localhost. No production publication was performed.
- Editorial layout evidence and the source comparison are recorded separately in the appended homepage section of `design-qa.md` and `/Users/arthurn/Desktop/about/output/uz-menu-qa/editorial/`. The earlier screenshots describe the superseded equal-card homepage layout.
- Latest annotation fixes: `/Users/arthurn/Desktop/about/output/uz-menu-qa/annotation-fixes/`. Homepage restaurants are stably ordered West, other GOSHT restaurants, Doner, then other projects. The city switcher and controls use wrapping normal flow, with no intersection at 390 or 820px. Footer credit is SYNX in all locales and does not inherit an old agency URL from CMS. These changes remain local, with no CMS content mutation or production publication.
- Latest caption evidence: `/Users/arthurn/Desktop/about/output/uz-menu-qa/descriptions/desktop-1280.png` and `mobile-390.png`. The external QA preload now includes clearly illustrative descriptions for TEST dishes, one deliberately long description and one missing description. These are not verified recipes and are never part of the production source.
- Current real-data evidence: `/Users/arthurn/Desktop/about/output/uz-menu-qa/live/`; integration checks and restart instructions: `/Users/arthurn/Desktop/about/output/uz-menu-qa/live-integration-report.md`. The previous fixture captures are historical design QA, not current live-data evidence.

## Release Gate

Real local menu retrieval and visual rendering are verified. Before publication, provision secrets in the production secret store and restore/verify the admin visibility endpoint and synchronization without exposing hidden dishes. Publish only the approved UZ changes. Do not deploy local credential-file paths, the QA preload or wrapper; do not replace production data with fixtures; do not modify the US container.
