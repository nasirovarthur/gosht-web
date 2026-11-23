import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
function load(path, imports = {}) {
  const code = ts.transpileModule(read(path), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const testModule = { exports: {} };
  new Function('require', 'module', 'exports', code)(
    id => id in imports ? imports[id] : require(id), testModule, testModule.exports,
  );
  return testModule.exports;
}
const venue = load('../lib/eventVenue.ts');

test('exact branch reference wins and keeps the selected language', () => {
  for (const lang of ['ru', 'uz', 'en']) {
    assert.equal(venue.getEventVenueTarget({ branchSlug: 'gosht-west', allBranches: true }, lang).href, `/${lang}/restaurants/gosht-west`);
    assert.equal(venue.getEventVenueTarget({ branchSlug: 'gosht-boulevard' }, lang).href, `/${lang}/restaurants/gosht-boulevard`);
  }
});

test('only an explicit all-branches venue opens the restaurant map', () => {
  for (const text of ['Все филиалы GŌSHT', 'All GŌSHT restaurants', 'Barcha GŌSHT filiallari']) {
    assert.equal(venue.isAllEventBranches({ ru: text }), true);
  }
  for (const text of ['GŌSHT WEST', 'Филиал уточняется', 'Не все филиалы GŌSHT']) {
    assert.equal(venue.isAllEventBranches({ ru: text }), false);
  }
  for (const lang of ['ru', 'uz', 'en']) {
    const target = venue.getEventVenueTarget({ allBranches: true }, lang);
    assert.equal(target.href, `/${lang}/restaurants?view=map`);
    assert.ok(target.label);
  }
  assert.equal(venue.getEventVenueTarget({ allBranches: true }, 'ru').label, 'Выбрать ближайший филиал');
  assert.equal(venue.getEventVenueTarget({}, 'ru'), null);
  assert.equal(venue.getEventVenueTarget({ branchSlug: '../admin', allBranches: true }, 'ru'), null);
});

test('the real event mapper preserves the CMS reference and distinguishes the coffee offer', async () => {
  const raw = [
    { _id: 'one', slug: 'night', branch: { ru: 'GŌSHT WEST' }, branchSlug: 'gosht-west', branchReferenceId: 'west', image: 'photo.png' },
    { _id: 'two', slug: 'coffee', branch: { ru: 'Все филиалы GŌSHT' }, branchSlug: null, branchReferenceId: null, image: 'photo.png' },
    { _id: 'three', slug: 'broken-reference', branch: { ru: 'Все филиалы GŌSHT' }, branchSlug: null, branchReferenceId: 'inactive', image: 'photo.png' },
  ];
  const loader = load('../lib/getEvents.ts', {
    '@/lib/eventVenue': venue,
    '@/lib/eventsData': { eventsData: [] },
    '@/lib/sanity': {
      client: { fetch: async query => {
        if (!query.includes('_type == "event"')) return null;
        assert.ok(query.includes('branchRef->slug.current'));
        return raw;
      } },
      urlFor: value => ({ url: () => value }),
    },
    '@/sanity/singletons': { singletonDocumentIds: {} },
    '@/lib/getHomePageSettings': {},
  });
  const events = await loader.getAllEvents();
  assert.equal(events.find(event => event.id === 'one').branchSlug, 'gosht-west');
  assert.equal(events.find(event => event.id === 'two').allBranches, true);
  assert.equal(events.find(event => event.id === 'three').allBranches, false);
});

test('the link is a single accessible action and unrelated venues remain plain text', () => {
  const component = load('../components/EventVenueLink.tsx', {
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
    '@/lib/eventVenue': venue,
    './EventVenueLink.module.css': { __esModule: true, default: {} },
  }).default;
  const html = renderToStaticMarkup(React.createElement(component, {
    event: { allBranches: true }, branch: 'Все филиалы GŌSHT', lang: 'ru',
  }));
  assert.match(html, /href="\/ru\/restaurants\?view=map"/);
  assert.match(html, /aria-label="Все филиалы GŌSHT: Выбрать ближайший филиал"/);
  assert.equal((html.match(/<a /g) || []).length, 1);
  const plain = renderToStaticMarkup(React.createElement(component, { event: {}, branch: 'Другое место', lang: 'ru' }));
  assert.doesNotMatch(plain, /<a |<svg/);
  const code = read('../components/EventVenueLink.tsx');
  assert.match(code, /role="tooltip"/);
  assert.match(code, /event.key === "Escape"/);
  assert.match(code, /onFocus=/);
});
