import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/analytics/restaurant-actions.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function setup(storage = new Map()) {
  const window = {
    location: new URL('https://gosht.uz/ru/restaurants/gosht-west'),
    dataLayer: [],
    sessionStorage: {
      getItem: key => storage.get(key),
      setItem: (key, value) => storage.set(key, value),
    },
  };
  const testModule = { exports: {} };
  new Function('module', 'exports', 'window', code)(testModule, testModule.exports, window);
  return { actions: testModule.exports, window };
}

test('the legacy GTM tracker and the website never own canonical events together', () => {
  const { actions, window } = setup();
  actions.trackRestaurantMenuPage('/ru/restaurants/gosht-west/menu', 'ru');
  assert.deepEqual(window.dataLayer.map(event => event.event), ['gosht_site_view_menu']);

  window.__goshtAnalyticsOwner = 'site-v1';
  window.__goshtMeasurementV1 = { page() {} };
  actions.flushPendingRestaurantActions();
  assert.equal(window.dataLayer.length, 1);

  delete window.__goshtMeasurementV1;
  actions.flushPendingRestaurantActions();
  actions.flushPendingRestaurantActions();
  assert.deepEqual(window.dataLayer.map(event => event.event), ['gosht_site_view_menu', 'view_menu']);
  assert.equal(window.dataLayer[1].restaurant_id, 'west');
});

test('a menu route counts once per opening and uses the destination branch', () => {
  const { actions, window } = setup();
  window.__goshtAnalyticsOwner = 'site-v1';
  const menu = '/en/restaurants/gosht-boulevard/menu';
  actions.trackRestaurantMenuPage(menu, 'en');
  actions.trackRestaurantMenuPage(menu, 'en');
  actions.recordRestaurantAnalyticsPath('/en/restaurants');
  actions.trackRestaurantMenuPage(menu, 'en');
  assert.equal(window.dataLayer.length, 2);
  assert.ok(window.dataLayer.every(event =>
    event.event === 'view_menu' && event.menu_format === 'page' &&
    event.restaurant_id === 'boulevard' && event.language === 'en'
  ));
});

test('a repeated accepted receipt never double counts within the same tab', () => {
  const storage = new Map();
  const { actions, window } = setup(storage);
  window.__goshtAnalyticsOwner = 'site-v1';
  const receipt = { requestId: 'qa-receipt', language: 'uz' };
  actions.trackAcceptedFeedback(receipt);
  actions.trackAcceptedFeedback(receipt);
  assert.deepEqual(window.dataLayer, [{
    event: 'generate_lead',
    analytics_source: 'site-v1',
    restaurant_id: 'not_selected',
    language: 'uz',
    cta_location: 'feedback_drawer',
    menu_format: null,
    form_id: 'feedback',
    lead_type: 'feedback',
  }]);

  const reloaded = setup(storage);
  reloaded.window.__goshtAnalyticsOwner = 'site-v1';
  reloaded.actions.trackAcceptedFeedback(receipt);
  assert.equal(reloaded.window.dataLayer.length, 0);
});
