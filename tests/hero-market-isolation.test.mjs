import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {test} from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(path, imports = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const loaded = {exports:{}};
  new Function('require','module','exports',code)(id => id in imports ? imports[id] : require(id),loaded,loaded.exports);
  return loaded.exports;
}
const singletons = load('../sanity/singletons.ts');

test('Uzbekistan hero has a dedicated CMS identity, not the shared American document', () => {
  assert.equal(singletons.singletonDocumentIds.homeHeroSliderSettings, 'home-hero-slider-settings-uz');
  assert.notEqual(singletons.singletonDocumentIds.homeHeroSliderSettings, 'home-hero-slider-settings');
});

test('actual hero loader only requests the UZ document and never falls back across markets', async () => {
  const calls = [];
  let result = {slides:[{_key:'uz-only'}]};
  const settings = load('../lib/getHomePageSettings.ts', {
    '@/lib/sanity':{client:{fetch:async(query,params)=>{calls.push({query,params});return result;}}},
    '@/sanity/singletons':singletons,
  });
  assert.deepEqual(await settings.getHomeHeroSliderSettingsDocument(), result);
  result = null;
  assert.equal(await settings.getHomeHeroSliderSettingsDocument(), null);
  assert.equal(calls.length, 2);
  for (const call of calls) {
    assert.deepEqual(call.params,{documentId:'home-hero-slider-settings-uz'});
    assert.match(call.query, /_id == \$documentId/);
  }
});
