import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(path, imports = {}, env = {}, fetcher = fetch) {
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const testModule = { exports: {} };
  new Function('require', 'module', 'exports', 'process', 'fetch', code)(id => id in imports ? imports[id] : require(id), testModule, testModule.exports, { env }, fetcher);
  return testModule.exports;
}
const auth = load('../lib/iikoAuth.ts');
const presentation = load('../lib/menuPresentation.ts');
const localized = value => ({ ru: value, uz: value, en: value });
const image = 'https://cdn.sanity.io/images/90iua6vo/production/a7f2dea1ad117ce123e0d27c3c50cbe7bd7803c0-3840x2160.webp';
const dish = (id, categoryId = 'grill', overrides = {}) => ({ id, title: localized(`Test ${id}`), price: 120000, categoryId, categoryLabel: localized(categoryId), image, isAvailable: true, ...overrides });
const linkStub = { __esModule: true, default: ({ children, href, ...props }) => React.createElement('a', { href, ...props }, children) };
const sliderButton = load('../components/SliderButton.tsx', { 'next/link': linkStub }).default;

test('homepage dish names share the approved US serif scale and marquee spacing', () => {
  const css = require('postcss').parse(readFileSync(new URL('../components/HomeMenuSection.module.css', import.meta.url), 'utf8'));
  const declarations = selector => Object.fromEntries(css.nodes.find(node => node.type === 'rule' && node.selector === selector).nodes.filter(node => node.type === 'decl').map(node => [node.prop, node.value]));
  const shared = require('postcss').parse(readFileSync(new URL('../components/HomeFeatureGrid.module.css', import.meta.url), 'utf8'));
  const title = Object.fromEntries(shared.nodes.find(node => node.selector === '.title').nodes.filter(node => node.type === 'decl').map(node => [node.prop, node.value]));
  assert.equal(title['font-family'], 'var(--font-roboto-serif), serif');
  assert.equal(title['text-transform'], 'uppercase');
  assert.equal(title['letter-spacing'], '0');
  assert.equal(title['font-size'], '24px');
  assert.equal(declarations('.featured .title')['font-size'], '32px');
  const tablet = css.nodes.find(node => node.type === 'atrule' && node.params === '(max-width: 1199px) and (min-width: 768px)');
  assert.equal(tablet.nodes.find(node => node.selector === '.featured .title').nodes.find(node => node.prop === 'font-size').value, '28px');
  assert.equal(declarations('.body')['padding-top'], '32px');
  assert.equal(declarations('.description')['text-transform'], undefined);
});

test('dish captions use natural heights and food framing does not stretch with text', () => {
  const css = require('postcss').parse(readFileSync(new URL('../components/HomeMenuSection.module.css', import.meta.url), 'utf8'));
  const declarations = selector => Object.fromEntries(css.nodes.find(node => node.type === 'rule' && node.selector === selector).nodes.filter(node => node.type === 'decl').map(node => [node.prop, node.value]));
  assert.equal(declarations('.dish')['grid-template-rows'], 'auto auto');
  assert.equal(declarations('.dish')['align-content'], 'start');
  assert.equal(declarations('.featured .photo')['aspect-ratio'], '16 / 9');
  assert.match(declarations('.dishHeading').composes, /^caption from/);
  const shared = readFileSync(new URL('../components/HomeFeatureGrid.module.css', import.meta.url), 'utf8');
  assert.match(shared, /\.caption \{ padding-top: 16px; \}/);
  assert.match(shared, /\.caption \{ padding-top: 12px; \}/);
  const mobile = css.nodes.find(node => node.type === 'atrule' && node.params === '(max-width: 767px)');
  assert.equal(mobile.nodes.find(node => node.selector === '.photo, .featured .photo').nodes.find(node => node.prop === 'aspect-ratio').value, '4 / 3');
  assert.doesNotMatch(css.toString(), /aspect-ratio: auto|grid-template-rows: repeat\(2/);
});

test('new iiko credentials use v2 and the existing API key', () => {
  assert.deepEqual(auth.getIikoAuthRequest({ IIKO_API_LOGIN: 'legacy-key', IIKO_APP_ID: 'app', IIKO_CLIENT_SECRET: 'secret' }), {
    endpoint: '/api/v2/access_token', body: { appId: 'app', clientSecret: 'secret', apiKey: 'legacy-key' },
  });
  assert.equal(auth.getIikoAuthRequest({ IIKO_API_LOGIN: 'old', IIKO_API_KEY: 'new', IIKO_APP_ID: 'app', IIKO_CLIENT_SECRET: 'secret' }).body.apiKey, 'new');
});
test('legacy auth remains compatible; partial v2 configuration never silently downgrades', () => {
  assert.deepEqual(auth.getIikoAuthRequest({ IIKO_API_LOGIN: 'key' }), { endpoint: '/api/1/access_token', body: { apiLogin: 'key' } });
  assert.equal(auth.getIikoAuthRequest({}), null);
  assert.throws(() => auth.getIikoAuthRequest({ IIKO_API_LOGIN: 'key', IIKO_APP_ID: 'app' }), /INCOMPLETE/);
  assert.throws(() => auth.getIikoAuthRequest({ IIKO_API_LOGIN: 'key', IIKO_CLIENT_SECRET: 'secret' }), /INCOMPLETE/);
});
test('home selection preserves current prices, availability and category variety without inventing dishes', () => {
  const source = [dish('one'), dish('two'), dish('three', 'burgers'), dish('four', 'salads'), dish('hidden', 'grill', { isAvailable: false }), dish('no-price', 'grill', { price: 0 }), dish('no-photo', 'grill', { image: undefined }), dish('sauce', 'Соусы')];
  const result = presentation.selectHomeDishes(source, 3);
  assert.deepEqual(result.map(dish => dish.id), ['one', 'three', 'four']);
  assert.ok(result.every(dish => source.includes(dish)));
  assert.deepEqual(presentation.selectHomeDishes([]), []);
  assert.equal(presentation.selectHomeDishes([dish('one'), dish('one')]).length, 1);
});
test('prices remain UZS in all three locales', () => {
  assert.match(presentation.formatMenuPrice(125000, 'ru'), /125.*000 сум/);
  assert.match(presentation.formatMenuPrice(125000, 'uz'), /so'm$/);
  assert.match(presentation.formatMenuPrice(125000, 'en'), /UZS$/);
});
test('v2 menu loading still requests Gosht - Uzum and maps actual dish prices and images', async () => {
  const calls = [];
  const iiko = load('../lib/iiko.ts', { 'server-only': {}, './iikoAuth': auth }, {
    IIKO_API_LOGIN: 'fixture-key', IIKO_APP_ID: 'app', IIKO_CLIENT_SECRET: 'secret',
    IIKO_ORGANIZATION_ID: 'org', IIKO_EXTERNAL_MENU_ID: '43854', IIKO_EXTERNAL_MENU_NAME: 'Gosht - Uzum',
  }, async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body), headers: init.headers });
    if (url.endsWith('/api/v2/access_token')) return Response.json({ token: 'fixture-token' });
    if (url.endsWith('/api/2/menu')) return Response.json({ externalMenus: [{ id: '43854', name: 'Gosht - Uzum' }] });
    if (url.endsWith('/api/2/menu/by_id')) return Response.json({ itemGroups: [{ id: 'grill', name: 'Стейки', items: [{ itemId: 'dish-1', name: 'Стейк', type: 'Dish', itemSizes: [{ isDefault: true, buttonImageUrl: image, prices: [{ organizations: ['org'], price: 125000 }] }] }] }] });
    throw new Error(`Unexpected fixture URL ${url}`);
  });
  const menu = await iiko.getIikoDeliveryMenu();
  assert.equal(calls[0].url, 'https://api-ru.iiko.services/api/v2/access_token');
  assert.equal(menu.externalMenuId, '43854');
  assert.equal(menu.dishes[0].price, 125000);
  assert.equal(menu.dishes[0].image, image);
  assert.equal(menu.currencyCode, 'UZS');
  assert.equal(calls.find(call => call.url.endsWith('/api/2/menu/by_id')).body.externalMenuId, '43854');
  assert.equal(calls.at(-1).headers.Authorization, 'Bearer fixture-token');
});
test('homepage and menu share the same hidden category and dish policy', async () => {
  let input;
  const hidden = load('../lib/adminMenuVisibility.ts', { 'server-only': {} }, { GOSHT_ADMIN_API_URL: 'https://admin.example.test' }, async url => {
    input = url; return Response.json({ hiddenCategoryIds: ['hidden'], hiddenItemIds: ['blocked'] });
  });
  const menu = await hidden.applyAdminMenuVisibility({ externalMenuId: '43854', categories: ['grill', 'hidden'].map(id => ({ id, label: localized(id), order: 0 })), dishes: [dish('one'), dish('blocked'), dish('two', 'hidden')] });
  assert.deepEqual(menu.dishes.map(dish => dish.id), ['one']);
  assert.deepEqual(presentation.selectHomeDishes(menu.dishes).map(dish => dish.id), ['one']);
  assert.equal(input.searchParams.get('market'), 'UZ');
});
function renderHome(dishes, lang) {
  const marquee = load('../components/HomeMenuMarquee.tsx', {
    '@/context/LanguageContext': { useLanguage: () => ({ lang }) },
    '@fortawesome/react-fontawesome': { FontAwesomeIcon: () => React.createElement('svg', { 'aria-hidden': true }) },
    './HomeMenuMarquee.module.css': {},
  }).default;
  const component = load('../components/HomeMenuSection.tsx', {
    'next/image': { __esModule: true, default: ({ src, alt }) => React.createElement('img', { src, alt }) },
    'next/link': linkStub,
    './SliderButton': { __esModule: true, default: sliderButton },
    './HomeMenuMarquee': { __esModule: true, default: marquee },
    '@/context/LanguageContext': { useLanguage: () => ({ lang }) },
    '@/lib/menuPresentation': presentation,
    '@/types/i18n': { pickLocalized: (value, language) => value?.[language] || '' },
    './HomeMenuSection.module.css': {},
  }).default;
  return renderToStaticMarkup(React.createElement(component, { dishes }));
}
test('home dishes show localized names and descriptions, link to exact details and omit prices', () => {
  for (const lang of ['ru', 'uz', 'en']) {
    const descriptions = { ru: 'Стейк на гриле', uz: 'Grilda tayyorlangan steyk', en: 'Grilled steak' };
    const html = renderHome([dish('a&b', 'grill', { description: descriptions })], lang);
    assert.match(html, new RegExp(`href="/${lang}/restaurants/gosht-west/menu\\?dish=a%26b"`));
    assert.match(html, /<h3>Test a&amp;b<\/h3>/);
    assert.doesNotMatch(html, /TOAST|USD|\$/);
    assert.match(html, new RegExp(`href="/${lang}/restaurants/gosht-west/menu"`));
    assert.ok(html.includes(descriptions[lang]));
    assert.doesNotMatch(html, /120.*000|fa-arrow/);
  }
});
test('missing or whitespace-only descriptions have no blank caption or invented replacement', () => {
  for (const description of [undefined, localized('  \n  ')]) {
    const html = renderHome([dish('plain', 'grill', { description })], 'ru');
    assert.match(html, /<h3>Test plain<\/h3>/);
    assert.doesNotMatch(html, /<p>\s*<\/p>|120.*000|Подробнее о блюде/);
  }
  const html = renderHome([dish('text', 'grill', { description: localized('  Говядина\n с  овощами <script>  ') })], 'ru');
  assert.match(html, /Говядина с овощами &lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
test('editorial spreads preserve dish order and handle one, two and incomplete groups', () => {
  for (const count of [1, 2, 3, 4, 5, 6, 7]) {
    const dishes = Array.from({ length: count }, (_, index) => dish(`dish-${index}`));
    const html = renderHome(dishes, 'ru');
    assert.equal((html.match(/data-menu-spread="true"/g) || []).length, Math.ceil(count / 3));
    assert.equal((html.match(/<h3>/g) || []).length, count);
    assert.match(html, new RegExp(`data-count="${count % 3 || 3}"`));
    for (let index = 1; index < count; index++) {
      assert.ok(html.indexOf(`Test dish-${index - 1}`) < html.indexOf(`Test dish-${index}`));
    }
    assert.doesNotMatch(html, /120.*000/);
    assert.equal(html.includes('Следующие блюда'), count > 1);
  }
});
test('the shared branded control supports one native CTA link without changing button behavior', () => {
  const cta = renderToStaticMarkup(React.createElement(sliderButton, { href: '/ru/restaurants/gosht-west/menu' }, 'Смотреть меню'));
  assert.match(cta, /<a href="\/ru\/restaurants\/gosht-west\/menu"/);
  assert.doesNotMatch(cta, /<button/);
  const button = renderToStaticMarkup(React.createElement(sliderButton, { disabled: true, ariaLabel: 'Предыдущие рестораны' }));
  assert.match(button, /<button type="button" disabled=""/);
  assert.match(button, /aria-label="Предыдущие рестораны"/);
  assert.doesNotMatch(button, /<a /);
});
test('homepage restaurant priority is West, GOSHT restaurants, Doner, then other projects without mutation', () => {
  const { prioritizeHomeRestaurants } = load('../lib/restaurantPresentation.ts');
  const source = ['bsb-riviera', 'gosht-doner-riviera', 'gosht-mirabad', 'mahalla-by-gosht', 'gosht-west', 'gosht-boulevard', 'topor-mirabad', 'bsb-other'].map(slug => ({ slug, projectType: slug.startsWith('topor') ? 'barbershop' : 'restaurant' }));
  const previous = [...source];
  assert.deepEqual(prioritizeHomeRestaurants(source).map(item => item.slug), ['gosht-west', 'gosht-mirabad', 'gosht-boulevard', 'gosht-doner-riviera', 'bsb-riviera', 'mahalla-by-gosht', 'topor-mirabad', 'bsb-other']);
  assert.deepEqual(source, previous);
  assert.deepEqual(prioritizeHomeRestaurants([]), []);
});
test('approved SYNX footer credit replaces stale CMS text and its former agency destination', async () => {
  for (const raw of [null, { madeByLabel: localized('Реализовано Art Contrast.'), madeByLink: { linkType: 'external', externalUrl: 'https://old-agency.example', openInNewTab: true } }]) {
    const footer = load('../lib/getFooterSettings.ts', { '@/lib/sanity': { client: { fetch: async () => raw } }, '@/sanity/singletons': { singletonDocumentIds: { footerSettings: 'footer' } } });
    const settings = await footer.getFooterSettings();
    assert.equal(settings.madeByLabel.ru, 'Реализовано SYNX');
    assert.ok(Object.values(settings.madeByLabel).every(label => label.includes('SYNX')));
    assert.equal(settings.madeByHref, null);
    assert.equal(settings.madeByOpenInNewTab, false);
  }
});
test('an unavailable API shows an existing kitchen photo, not invented dish cards or prices', () => {
  const html = renderHome([], 'ru');
  assert.match(html, /Цены и наличие/);
  assert.match(html, /Стейк на гриле/);
  assert.doesNotMatch(html, /<h3>|120.*000/);
});

function renderMenu(dishes, props = {}) {
  const component = load('../components/RestaurantDeliveryMenuPage.tsx', {
    'next/image': { __esModule: true, default: ({ src, alt }) => React.createElement('img', { src, alt }) },
    'next/link': { __esModule: true, default: ({ children, href, ...props }) => React.createElement('a', { href, ...props }, children) },
    '@/context/LanguageContext': { useLanguage: () => ({ lang: 'ru' }) },
    '@/lib/useBodyScrollLock': { useBodyScrollLock: () => {} },
    './RestaurantDeliveryMenuPage.module.css': { dishTitleContainer: 'dish-title-container', dishTitle: 'dish-title' },
    '@/types/i18n': { pickLocalized: (value, language) => value?.[language] || '', translations: { restaurantDetail: { workingHours: localized('Режим работы'), openFullMenu: localized('Открыть меню') } } },
  }).default;
  return renderToStaticMarkup(React.createElement(component, {
    restaurant: { name: 'Gosht', branchName: 'Gosht West', address: 'Tashkent', phone: '+998995168800', workingHours: '10:00 - 23:00', menuFiles: [], gallery: [] },
    backHref: '/ru/restaurants/gosht-west', dishes, ...props,
  }));
}
test('Cyrillic steak categories match grill and category links select the correct dishes', () => {
  const html = renderMenu([dish('steak', 'steak', { categoryLabel: localized('Стейки') }), dish('burger', 'burgers', { categoryLabel: localized('Бургеры') })], { initialGroupId: 'grill' });
  assert.match(html, /МЯСО \/ ГРИЛЬ/);
  assert.match(html, /Открыть блюдо: Test steak/);
  assert.doesNotMatch(html, /Открыть блюдо: Test burger/);
});
test('home dish links open the corresponding dialog; unknown dish IDs do not open a blank dialog', () => {
  assert.match(renderMenu([dish('one')], { initialDishId: 'one' }), /role="dialog" aria-modal="true" aria-label="Test one"/);
  assert.doesNotMatch(renderMenu([dish('one')], { initialDishId: 'unknown' }), /role="dialog"/);
});
test('dish dialogs preserve long names and reserve separate space for their close control', () => {
  for (const title of ['Средиземноморский Завтрак', 'Grilled Mediterranean Breakfast', 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ']) {
    const html = renderMenu([dish('long', 'breakfast', { title: localized(title) })], { initialDishId: 'long' });
    assert(html.includes(`aria-label="${title}"`));
    assert(html.includes(`class="dish-title mt-3 font-serif uppercase text-primary">${title}</h2>`));
    assert.match(html, /class="dish-title-container"/);
    assert.match(html, /class="absolute right-5 top-5 inline-flex h-10 w-10/);
    assert.match(html, /flex min-h-0 min-w-0 shrink-0 flex-col md:shrink/);
    assert.match(html, /overflow-y-auto rounded-\[28px\].*md:overflow-hidden/);
  }
  const css = require('postcss').parse(readFileSync(new URL('../components/RestaurantDeliveryMenuPage.module.css', import.meta.url), 'utf8'));
  const declarations = selector => Object.fromEntries(css.nodes.find(node => node.selector === selector).nodes.filter(node => node.type === 'decl').map(node => [node.prop, node.value]));
  assert.equal(declarations('.dishTitleContainer')['container-type'], 'inline-size');
  assert.equal(declarations('.dishTitle')['overflow-wrap'], 'anywhere');
  assert.equal(declarations('.dishTitle')['font-size'], 'clamp(20px, 7.5cqw, 32px)');
  assert.equal(declarations('.dishTitle')['line-height'], '1.12');
});
test('non-delivery PDF menus never acquire a demo order panel', () => {
  assert.doesNotMatch(renderMenu([]), /id="menu-contact"/);
  assert.match(renderMenu([], { requireApiDishes: true }), /id="menu-contact"/);
});
