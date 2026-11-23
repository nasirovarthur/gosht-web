import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {test} from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const source = read('../lib/eventsData.ts');
const code = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText;
const loaded = {exports: {}};
new Function('require', 'module', 'exports', code)(require, loaded, loaded.exports);
const {getEventImage} = loaded.exports;

test('localized event posters fall back to the original image', () => {
  const event = {image: 'original.png', localizedImages: {ru: 'ru.png', uz: 'uz.png'}};
  assert.equal(getEventImage(event, 'ru'), 'ru.png');
  assert.equal(getEventImage(event, 'uz'), 'uz.png');
  assert.equal(getEventImage(event, 'en'), 'original.png');
  assert.equal(getEventImage({image: 'legacy.png'}, 'ru'), 'legacy.png');
  assert.equal(getEventImage({...event, localizedImages: {ru: ''}}, 'ru'), 'original.png');
});

test('event posters keep the complete 1200:628 artwork in listings and detail pages', () => {
  for (const path of ['../components/EventsListingPage.tsx', '../components/EventDetailPage.tsx']) {
    const text = read(path);
    assert.match(text, /aspect-\[1200\/628\]/);
    assert.doesNotMatch(text, /object-cover|group-hover:scale/);
    assert.match(text, /src=\{getEventImage\(/);
  }
  assert.match(read('../components/EventsSection.tsx'), /src=\{getEventImage\(item, lang\)\}/);
});

test('translated posters are selected for metadata as well as page content', () => {
  const page = read('../app/[lang]/events/[slug]/page.tsx');
  assert.match(page, /localizedImages\.uz\.asset->url/);
  assert.equal((page.match(/image: getEventImage\(/g) || []).length, 2);
  assert.match(read('../lib/getEvents.ts'), /localizedImages,/);
});
