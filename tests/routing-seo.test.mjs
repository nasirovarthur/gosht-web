import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server');

function load(path, imports = {}, env = {}) {
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const testModule = { exports: {} };
  new Function('require', 'module', 'exports', 'process', code)(id => id in imports ? imports[id] : require(id), testModule, testModule.exports, { env });
  return testModule.exports;
}

const { proxy } = load('../proxy.ts');
const site = load('../lib/seo/site.ts');
const metadata = load('../lib/seo/metadata.ts', { '@/lib/seo/site': site });
const restaurantMenu = load('../lib/restaurantMenu.ts');
const i18n = { pickLocalized: (value, lang) => value?.[lang] || value?.uz || value?.ru || value?.en || '' };

const trackingQuery = '?utm_source=ig&utm_medium=social&utm_campaign=gosht_always_on&utm_content=a%2Bb&utm_term=%D0%B4%D0%B5%D1%82%D0%B8&gclid=test-gclid&gbraid=test-gbraid&wbraid=test-wbraid&custom=first&custom=second';

test('language redirects retain the entire query and the selected branch path', () => {
  for (const path of ['/', '/restaurants/gosht-mirabad', '/restaurants/gosht-west/menu']) {
    const request = new NextRequest(`https://gosht.uz${path}${trackingQuery}`);
    const response = proxy(request);
    const expectedPath = path === '/' ? '/uz' : `/uz${path}`;
    assert.equal(response.headers.get('location'), `https://gosht.uz${expectedPath}${trackingQuery}`);
    assert.equal(response.status, 307);
  }
});

test('preferred language and referer redirect to the same branch without losing query', () => {
  const cookieRequest = new NextRequest(`http://localhost:3000/restaurants/gosht-muqimiy${trackingQuery}`, { headers: { cookie: 'preferredLanguage=en' } });
  assert.equal(proxy(cookieRequest).headers.get('location'), `http://localhost:3000/en/restaurants/gosht-muqimiy${trackingQuery}`);
  const refererRequest = new NextRequest(`https://gosht.uz/restaurants/gosht-west${trackingQuery}`, { headers: { referer: 'https://gosht.uz/ru/restaurants', cookie: 'preferredLanguage=en' } });
  assert.equal(proxy(refererRequest).headers.get('location'), `https://gosht.uz/ru/restaurants/gosht-west${trackingQuery}`);
});

test('HTTPS and www redirects retain localized paths and all tracking values', () => {
  const request = new NextRequest(`http://www.gosht.uz/ru/restaurants/gosht-west/menu${trackingQuery}`);
  const response = proxy(request);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('location'), `https://gosht.uz/ru/restaurants/gosht-west/menu${trackingQuery}`);
});

test('forwarded production host controls redirects behind the standalone server', () => {
  const request = new NextRequest(`http://localhost:3000/${trackingQuery}`, { headers: { host: 'gosht-web:3000', 'x-forwarded-host': 'gosht.uz', 'x-forwarded-proto': 'https' } });
  assert.equal(proxy(request).headers.get('location'), `https://gosht.uz/uz${trackingQuery}`);
  const wwwRequest = new NextRequest(`http://localhost:3000/ru/restaurants/gosht-mirabad${trackingQuery}`, { headers: { host: 'www.gosht.uz', 'x-forwarded-proto': 'https' } });
  assert.equal(proxy(wwwRequest).headers.get('location'), `https://gosht.uz/ru/restaurants/gosht-mirabad${trackingQuery}`);
});

test('localized local and alternate deployment requests stay on their host', () => {
  for (const origin of ['http://localhost:3000', 'https://preview.vercel.app', 'https://gosht.ru']) {
    const response = proxy(new NextRequest(`${origin}/en/restaurants/gosht-west${trackingQuery}`));
    assert.equal(response.headers.get('location'), null);
    assert.equal(response.headers.get('x-middleware-request-x-gosht-language'), 'en');
  }
  assert.equal(proxy(new NextRequest('http://localhost:3000/api/feedback')).headers.get('location'), null);
  assert.equal(proxy(new NextRequest('http://localhost:3000/sitemap.xml')).headers.get('location'), null);
});

test('SSR language header follows the route and overrides incoming header values', () => {
  const response = proxy(new NextRequest('https://gosht.uz/ru/restaurants/gosht-muqimiy', { headers: { 'x-gosht-language': 'en' } }));
  assert.equal(response.headers.get('x-middleware-request-x-gosht-language'), 'ru');
});

test('canonical URLs use the branded domain, remove queries, and respect explicit alternate sites', () => {
  assert.equal(site.getSiteUrl(), 'https://gosht.uz');
  assert.equal(site.getCanonicalUrl('ru', '/restaurants/gosht-west/menu/?utm_source=ig#food'), 'https://gosht.uz/ru/restaurants/gosht-west/menu');
  const alternateSite = load('../lib/seo/site.ts', {}, { NEXT_PUBLIC_SITE_URL: 'https://gosht.ru/' });
  assert.equal(alternateSite.getCanonicalUrl('en', 'restaurants'), 'https://gosht.ru/en/restaurants');
  const page = metadata.createPageMetadata({ lang: 'ru', pathname: 'restaurants/gosht-west/menu', title: 'Menu', description: 'Menu', languages: ['ru', 'en'] });
  assert.equal(page.alternates.canonical, 'https://gosht.uz/ru/restaurants/gosht-west/menu');
  assert.deepEqual(Object.keys(page.alternates.languages), ['ru', 'en']);
});

test('sitemap includes existing menu translations and excludes duplicate or empty menus', async () => {
  const branchRecords = [
    { slug: '/gosht-mirabad', menuFiles: [{ language: 'ru', url: 'https://example.com/mirabad.pdf' }] },
    { slug: 'gosht-west', city: 'tashkent', projectType: 'restaurant', name: { ru: 'GŌSHT', uz: 'GŌSHT', en: 'GŌSHT' } },
    { slug: 'gosht-muqimiy', defaultMenu: 'https://example.com/shared.pdf' },
    { slug: 'without-menu' },
  ].map(record => ({ ...record, _type: 'restaurantBranch' }));
  const legacyRecords = [{ _type: 'restaurants', slug: 'gosht-mirabad', menu: 'https://example.com/legacy.pdf' }];
  const client = { fetch: async query => query.includes('_type == "restaurantBranch"') ? branchRecords : query.includes('_type == "restaurants"') ? legacyRecords : [{ slug: 'test-event' }] };
  const sitemap = load('../app/sitemap.ts', { '@/lib/sanity': { client }, '@/lib/seo/site': site, '@/lib/restaurantMenu': restaurantMenu, '@/types/i18n': i18n }).default;
  const entries = await sitemap();
  const urls = entries.map(entry => entry.url);
  assert.equal(urls.length, new Set(urls).size);
  assert.ok(urls.includes('https://gosht.uz/ru/restaurants/gosht-mirabad/menu'));
  assert.ok(!urls.includes('https://gosht.uz/en/restaurants/gosht-mirabad/menu'));
  assert.ok(!urls.some(url => url.includes('/without-menu/menu')));
  for (const lang of ['ru', 'uz', 'en']) {
    assert.ok(urls.includes(`https://gosht.uz/${lang}/restaurants/gosht-west/menu`));
    assert.ok(urls.includes(`https://gosht.uz/${lang}/restaurants/gosht-muqimiy/menu`));
  }
  assert.deepEqual(entries.find(entry => entry.url.endsWith('/ru/restaurants/gosht-mirabad/menu')).alternates.languages, { ru: 'https://gosht.uz/ru/restaurants/gosht-mirabad/menu' });
});

test('menu metadata uses restaurant copy and only real PDF language alternates', async () => {
  const localized = value => ({ ru: value, uz: value, en: value });
  const restaurant = {
    city: 'tashkent',
    branchName: localized('GŌSHT Мирабад'),
    menuFiles: ['https://example.com/mirabad.pdf'],
    menuLanguages: ['ru'],
    project: { projectType: 'restaurant', name: localized('GŌSHT') },
  };
  const menuPage = load('../app/[lang]/restaurants/[slug]/menu/page.tsx', {
    '@/components/RestaurantDeliveryMenuPage': { default: () => null },
    '@/lib/getGoshtDeliveryMenu': { getGoshtDeliveryMenu: async () => null },
    '@/lib/restaurantMenu': restaurantMenu,
    '@/lib/seo/metadata': metadata,
    '@/lib/seo/site': site,
    '@/lib/sanity': { client: { fetch: async () => restaurant } },
    '@/types/i18n': { pickLocalized: (value, lang) => value?.[lang] || value?.uz || value?.ru || value?.en || '' },
  });
  const result = await menuPage.generateMetadata({ params: Promise.resolve({ lang: 'ru', slug: 'gosht-mirabad' }) });
  assert.match(result.title, /меню ресторана/);
  assert.doesNotMatch(result.description, /демонстрацион|корзин/);
  assert.deepEqual(result.alternates.languages, { ru: 'https://gosht.uz/ru/restaurants/gosht-mirabad/menu' });
  assert.equal(result.robots.index, true);
  const unavailableTranslation = await menuPage.generateMetadata({ params: Promise.resolve({ lang: 'en', slug: 'gosht-mirabad' }) });
  assert.equal(unavailableTranslation.robots.index, false);
  assert.deepEqual(unavailableTranslation.alternates.languages, { ru: 'https://gosht.uz/ru/restaurants/gosht-mirabad/menu' });
  restaurant.branchName = localized('GŌSHT West');
  const westResult = await menuPage.generateMetadata({ params: Promise.resolve({ lang: 'en', slug: 'gosht-west' }) });
  assert.match(westResult.title, /delivery menu/);
  assert.equal(westResult.robots.index, true);
  assert.deepEqual(Object.keys(westResult.alternates.languages), ['uz', 'ru', 'en']);
});

test('unknown forwarded hosts cannot override a recognized public host', () => {
  const request = new NextRequest('http://localhost:3000/?utm_source=test', { headers: { host: 'gosht.uz', 'x-forwarded-host': 'untrusted.example', 'x-forwarded-proto': 'https' } });
  assert.equal(proxy(request).headers.get('location'), 'https://gosht.uz/uz?utm_source=test');
  const alternateRequest = new NextRequest('https://preview.vercel.app/?utm_source=test', { headers: { 'x-forwarded-host': 'gosht.uz', 'x-forwarded-proto': 'https' } });
  assert.equal(proxy(alternateRequest).headers.get('location'), 'https://preview.vercel.app/uz?utm_source=test');
});

test('sitemap and the actual menu predicate agree for branch and legacy West records', async () => {
  const localized = value => ({ ru: value, uz: value, en: value });
  const cases = [
    { record: { _type: 'restaurantBranch', city: 'tashkent', projectType: 'restaurant', name: localized('GŌSHT') }, expected: true },
    { record: { _type: 'restaurantBranch', projectType: 'restaurant', name: localized('GŌSHT') }, expected: false },
    { record: { _type: 'restaurantBranch', city: 'tashkent', projectType: 'barbershop', name: localized('GŌSHT') }, expected: false },
    { record: { _type: 'restaurantBranch', city: 'tashkent', projectType: 'restaurant', name: localized('GŌSHT Kids') }, expected: false },
    { record: { _type: 'restaurants', name: localized('GŌSHT') }, expected: true },
    { record: { _type: 'restaurants', name: localized('Other') }, expected: false },
  ];
  for (const { record, expected } of cases) {
    const venue = { ...record, slug: 'gosht-west' };
    const client = { fetch: async query => query.includes(`_type == "${venue._type}"`) ? [venue] : [] };
    const sitemap = load('../app/sitemap.ts', { '@/lib/sanity': { client }, '@/lib/seo/site': site, '@/lib/restaurantMenu': restaurantMenu, '@/types/i18n': i18n }).default;
    const menuEntries = (await sitemap()).filter(entry => entry.url.endsWith('/gosht-west/menu'));
    assert.equal(menuEntries.length, expected ? 3 : 0, JSON.stringify(record));
    assert.equal(restaurantMenu.hasGoshtDeliveryMenu({ slug: venue.slug, source: venue._type === 'restaurantBranch' ? 'branch' : 'legacy', city: venue.city, projectType: venue.projectType, names: [i18n.pickLocalized(venue.name, 'ru')] }), expected);
  }
});
