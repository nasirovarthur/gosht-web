import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {test} from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
function load(path, imports) {
  const code = ts.transpileModule(read(path), {compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022}}).outputText;
  const loaded = {exports: {}};
  new Function('require', 'module', 'exports', code)(id => id in imports ? imports[id] : require(id), loaded, loaded.exports);
  return loaded.exports;
}
const settings = load('../lib/getHomePageSettings.ts', {
  '@/lib/sanity': {client: {}}, '@/sanity/singletons': {singletonDocumentIds: {}},
});
const text = value => ({ru: value, uz: value, en: value});
const raw = {
  _key: 'promotion', title: text('Coffee on us'), subtitle: text('Until 13:00'),
  description: text('One coffee with any dish'), imageSource: 'custom', customImage: 'clean-photo.png',
  buttonMode: 'event', event: {slug: 'coffee-on-us', image: 'poster-with-text.png'},
};

test('promotional hero uses the clean custom photo but links to the real event', () => {
  const slide = settings.normalizeHomeHeroSlide({...raw, showFirst: true, imagePosition: '75% 50%'});
  assert.equal(slide.image, 'clean-photo.png');
  assert.equal(slide.eventSlug, 'coffee-on-us');
  assert.equal(slide.buttonMode, 'event');
  assert.equal(slide.showButton, true);
  assert.equal(slide.showFirst, true);
  assert.equal(slide.imagePosition, '75% 50%');
});

test('legacy slides keep their original position and invalid image focus is ignored', () => {
  assert.equal(settings.normalizeHomeHeroSlide(raw).showFirst, false);
  for (const focus of ['101% 50%', '75% 50%; color:red', '', 'left']) {
    assert.equal(settings.normalizeHomeHeroSlide({...raw, imagePosition: focus}).imagePosition, undefined);
  }
});

test('promotions precede the unchanged opening and existing slides retain their order', async () => {
  const inputs = [{id: 'brand'}, {id: 'coffee', showFirst: true}, {id: 'bar'}, {id: 'burgers', showFirst: true}, {id: 'kids'}];
  const Hero = load('../components/HeroSlider.tsx', {
    './HeroSliderClient': {default: () => null},
    '@/lib/getHeroSlides': {getHeroSlides: async () => inputs},
    '@/lib/muqimiyOpeningSlide': {muqimiyOpeningSlide: lang => ({id: 'opening-' + lang})},
  }).default;
  assert.deepEqual((await Hero({lang: 'ru'})).props.slides.map(s => s.id), ['coffee', 'burgers', 'opening-ru', 'brand', 'bar', 'kids']);
  assert.deepEqual(inputs.map(s => s.id), ['brand', 'coffee', 'bar', 'burgers', 'kids']);
});

test('hero CTA and arrow controls remain localized and use native event links', () => {
  const source = read('../components/HeroSliderClient.tsx');
  assert.match(source, /\$\{lang\}\/events\/\$\{encodeURIComponent\(currentSlide.eventSlug\)\}/);
  assert.match(source, /aria-label=\{lang === "ru" \? "Следующий баннер"/);
  assert.match(source, /aria-label=\{lang === "ru" \? "Предыдущий баннер"/);
});
