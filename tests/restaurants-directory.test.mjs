import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(path, imports = {}) {
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const result = { exports: {} };
  new Function('require', 'module', 'exports', code)(id => id in imports ? { __esModule: true, ...imports[id] } : require(id), result, result.exports);
  return result.exports;
}
const source = readFileSync(new URL('../components/RestaurantsConceptPage.tsx', import.meta.url), 'utf8');
let searchParams = new URLSearchParams();
const Page = load('../components/RestaurantsConceptPage.tsx', {
  'next/image': { default: ({ src, alt }) => React.createElement('img', { src, alt }) },
  'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
  'next/navigation': { useSearchParams: () => searchParams },
  '@/components/restaurant/RestaurantsMap': { default: ({ activeBranchId }) => React.createElement('div', { 'data-map-selection': activeBranchId }) },
  '@/types/i18n': load('../types/i18n.ts'),
  '@/lib/localePaths': { getLocalizedPath: (lang, path) => `${lang === 'en' ? '' : `/${lang}`}/${path}` },
}).default;
const localized = value => ({ ru: value, en: value, uz: value });
const branch = (id, overrides = {}) => ({
  id, slug: id, city: 'tashkent', projectId: 'gosht', projectType: 'restaurant', projectName: localized('GŌSHT'), branchName: localized(id),
  projectPrimaryInfo: localized('Grill'), cardImage: 'https://cdn.sanity.io/photo.jpg', gallery: [],
  hasBanquet: true, hasPlayground: true, hasVipRoom: false, hasKidsHaircut: false,
  address: localized('Existing address'), phone: '+998123456789', workingHours: localized('Existing hours'), menuUrls: ['https://cdn.sanity.io/menu.pdf'],
  ...overrides,
});
const west = branch('gosht-west');
const boulevard = branch('gosht-boulevard');
const ny = branch('gosht-brooklyn', { city: 'new_york' });
const bsb = ['bsb-one', 'bsb-two'].map(id => branch(id, { projectId: 'bsb', projectName: localized('Black Star Burger') }));
function directory(branches) {
  const projects = new Map();
  for (const item of branches) {
    if (!projects.has(item.projectId)) projects.set(item.projectId, { id: item.projectId, name: item.projectName, branches: [] });
    projects.get(item.projectId).branches.push(item);
  }
  return { branches, projects: [...projects.values()], availableCities: [...new Set(branches.map(item => item.city))] };
}
function render(branches, query = '', lang = 'ru') {
  searchParams = new URLSearchParams(query);
  return renderToStaticMarkup(React.createElement(Page, { data: directory(branches), lang }));
}

test('regular and grouped restaurant blocks retain every approved layout class', () => {
  const approved = JSON.parse(readFileSync(new URL('./fixtures/restaurants-approved-layout.json', import.meta.url), 'utf8'));
  const file = ts.createSourceFile('concept.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const [name, expected] of Object.entries(approved)) {
    const fn = file.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
    const classes = [];
    function visit(node) {
      if (ts.isJsxAttribute(node) && node.name.text === 'className') classes.push(node.initializer.getText(file));
      ts.forEachChild(node, visit);
    }
    visit(fn);
    assert.deepEqual(classes, expected, name + ' must match the approved concept');
  }
});
test('main directory uses the approved concept directly, not a separate redesign', () => {
  const route = readFileSync(new URL('../components/RestaurantsDirectoryPage.tsx', import.meta.url), 'utf8');
  assert.match(route, /<RestaurantsConceptPage data=\{data\} lang=\{lang\}/);
  assert.doesNotMatch(route, /BranchFacts|RestaurantGroup|styles\.single|<details/);
});
test('Brooklyn keeps the same card/grid composition as every other venue', () => {
  const html = render([ny], '', 'en');
  assert.match(html, /md:grid-cols-2[^"]*lg:grid-cols-3/);
  assert.match(html, /aspect-\[1\.9\/1\]/);
  assert.doesNotMatch(html, /<details|Opening hours|Average check|Existing address/);
  assert.ok(html.includes('gosht-brooklyn'));
});
test('all unfiltered branches remain reachable without changing any input data', () => {
  const data = [boulevard, west, ...bsb];
  const before = JSON.stringify(data);
  const html = render(data);
  for (const item of data) assert.ok(html.includes(`restaurants/${item.slug}`), item.slug);
  assert.equal((html.match(/data-restaurant-id=/g) || []).length, data.length);
  assert.equal(JSON.stringify(data), before);
  assert.ok(html.indexOf('data-restaurant-id="gosht-west"') < html.indexOf('data-restaurant-id="gosht-boulevard"'));
});
test('network locations remain ordinary links rather than new accordions', () => {
  const html = render(bsb);
  assert.ok(html.includes('Филиалы'));
  assert.ok(!html.includes('Другие филиалы'));
  assert.ok(html.includes('restaurants/bsb-one'));
  assert.ok(html.includes('restaurants/bsb-two'));
  assert.doesNotMatch(html, /<details|<summary/);
});
test('both filters are named native checkboxes in every language', () => {
  for (const lang of ['ru', 'en', 'uz']) {
    const html = render([ny], '', lang);
    assert.equal((html.match(/type="checkbox"/g) || []).length, 2);
    assert.equal((html.match(/aria-label=/g) || []).length, 2);
    assert.equal((html.match(/aria-pressed=/g) || []).length, 2);
  }
});
test('group photo, visible caption and complete location list name the same destination', () => {
  for (const [projectId, projectName, slug, title] of [
    ['doner', 'GŌSHT DONER', 'gosht-doner-ekobazar', 'GŌSHT DONER ЭКОБАЗАР'],
    ['bsb', 'BLACK STAR BURGER', 'bsb-riviera', 'BSB RIVIERA'],
  ]) {
    const first = branch(slug, { projectId, projectName: localized(projectName), branchName: localized(title) });
    const second = branch(`${projectId}-second`, { projectId, projectName: localized(projectName) });
    const html = render([first, second]);
    assert.ok(html.includes(`data-restaurant-photo="${slug}" aria-label="${title}"`));
    assert.ok(html.includes(`alt="${title}"`));
    assert.equal(html.split(`href="/ru/restaurants/${slug}"`).length - 1, 3, 'photo, caption and list must all link to this venue');
    assert.equal((html.match(/data-restaurant-id=/g) || []).length, 2, 'both locations must be in the list');
    const caption = html.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/)?.[1];
    assert.ok(caption?.includes(title));
    assert.ok(caption?.includes(`href="/ru/restaurants/${slug}"`));
  }
});
test('photo captions follow the displayed branch rather than hard-coding Ekobazar or Riviera', () => {
  const html = render([...bsb].reverse());
  const caption = html.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/)?.[1];
  assert.ok(caption?.includes('bsb-two'));
  assert.equal((html.match(/data-restaurant-id=/g) || []).length, 2);
});
test('delivery entry preselects the checkbox and only includes the connected venue', () => {
  const html = render([west, boulevard], 'delivery=1');
  assert.match(html, /type="checkbox"[^>]*checked=""/);
  assert.ok(html.includes('data-restaurant-id="gosht-west"'));
  assert.ok(!html.includes('data-restaurant-id="gosht-boulevard"'));
});
test('map entry keeps the original map and sidebar layout', () => {
  const html = render([ny], 'view=map', 'en');
  assert.match(html, /data-map-selection="gosht-brooklyn"/);
  assert.match(html, /lg:grid-cols-\[minmax\(0,1fr\)_380px\]/);
});

let detailLang = 'ru';
const Detail = load('../components/RestaurantDetail.tsx', {
  react: { ...React, useEffect: () => {} },
  'next/image': { default: ({ src, alt }) => React.createElement('img', { src, alt }) },
  'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
  './ImageSlider': { default: () => null },
  './restaurant/YandexMap': { default: () => null },
  './Reveal': { default: ({ as = 'div', children }) => React.createElement(as, null, children) },
  '@/hooks/useHorizontalScroll': { useHorizontalScroll: () => ({ current: null }) },
  '@/context/LanguageContext': { useLanguage: () => ({ lang: detailLang }) },
  '@/types/i18n': load('../types/i18n.ts'),
}).default;
const westDetail = {
  name: 'Gōsht', slug: 'gosht-west', branchName: 'GŌSHT WEST', address: 'Existing address',
  phone: '+998995168800', workingHours: 'Existing hours', averageCheck: '200 000 - 300 000 сум',
  description: 'Existing description', menuFiles: [], gallery: [], mapLink: 'https://yandex.uz/maps', deliveryMenuEnabled: true,
};

test('West retains its prominent delivery menu without a booking control or PDF attachment', () => {
  for (const lang of ['ru', 'uz', 'en']) {
    detailLang = lang;
    const html = renderToStaticMarkup(React.createElement(Detail, { restaurant: westDetail }));
    const actions = html.split('data-testid="restaurant-actions"')[1];
    assert.ok(actions, lang);
    assert.ok(actions.includes(`href="/${lang}/restaurants/gosht-west/menu"`));
    const labels = load('../types/i18n.ts').translations.restaurantDetail;
    assert.ok(actions.includes(labels.deliveryMenu[lang]));
    assert.ok(!actions.includes('<button'));
    assert.match(html, /pb-24/);
  }
});
test('branches without connected delivery do not gain West actions or lose attached PDFs', () => {
  detailLang = 'ru';
  const restaurant = { ...westDetail, slug: 'gosht-muqimiy', deliveryMenuEnabled: false, menuFiles: ['https://cdn.sanity.io/existing-menu.pdf'] };
  const html = renderToStaticMarkup(React.createElement(Detail, { restaurant }));
  assert.ok(!html.includes('data-testid="restaurant-actions"'));
  assert.ok(html.includes('href="https://cdn.sanity.io/existing-menu.pdf"'));
  assert.match(html, /pb-24/);
});
