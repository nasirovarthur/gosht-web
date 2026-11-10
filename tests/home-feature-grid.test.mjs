import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {test} from 'node:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
function load(path,imports){
  const code=ts.transpileModule(read(path),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const loaded={exports:{}};
  new Function('require','module','exports',code)(id=>id in imports?imports[id]:require(id),loaded,loaded.exports);
  return loaded.exports;
}
const css={__esModule:true,default:new Proxy({},{get:(_t,k)=>String(k)})};
let lang='ru';
const language={useLanguage:()=>({lang})};
const Events=load('../components/EventsSection.tsx',{
  '@/context/LanguageContext':language,
  '@/types/i18n':{pickLocalized:(value,locale)=>value[locale]},
  '@/components/SliderButton':{__esModule:true,default:({href,children,...props})=>React.createElement('a',{href,...props},children)},
  'next/link':{__esModule:true,default:({children,...props})=>React.createElement('a',props,children)},
  'next/image':{__esModule:true,default:({src,alt})=>React.createElement('img',{src,alt})},
  './HomeFeatureGrid.module.css':css,'./EventsSection.module.css':css,
}).default;
const labels={heading:{ru:'События',uz:'Voqealar',en:'Events'},allEventsLabel:{ru:'Все события',uz:'Barcha voqealar',en:'All events'}};
const localized=value=>({ru:value,uz:value,en:value});
const event=index=>({id:'fixture-'+index,slug:'fixture-'+index,category:'kids',title:localized('Мастер-класс с длинным названием '+index),date:localized('15 ноября 2026'),time:localized('16:00–17:00'),branch:localized('GŌSHT WEST'),image:'https://example.com/poster-'+index+'.png',description:[]});

test('shared grid and event styles are identical to the approved Gosht.com release',()=>{
  for(const [file,hash]of [
    ['HomeFeatureGrid.module.css','1cd19af51e27cc0df9450d6cc168ef8630c5ec87da1d36b7ea1cbcd8d0632a63'],
    ['EventsSection.module.css','ce7c87c293fd75af797172eb65055c736bbbf254c70500be0d4931b5089a329a'],
  ])assert.equal(createHash('sha256').update(read('../components/'+file)).digest('hex'),hash,file);
});
test('events keep UZ locale paths and a single native all-events action in every language',()=>{
  for(lang of ['ru','uz','en']){
    const html=renderToStaticMarkup(React.createElement(Events,{featuredEvent:event(1),sideEvents:[event(2),event(3)],labels}));
    assert.equal((html.match(/<img\b/g)||[]).length,3);
    assert.equal((html.match(/<h3\b/g)||[]).length,3);
    assert.equal((html.match(/<a\b/g)||[]).length,4);
    assert(html.includes(`href="/${lang}/events"`));
    for(const index of [1,2,3])assert(html.includes(`href="/${lang}/events/fixture-${index}"`));
    assert.doesNotMatch(html,/<button\b|gosht-brooklyn|gosht\.com/);
  }
});
test('no events means no invented homepage event content',()=>{
  assert.equal(renderToStaticMarkup(React.createElement(Events,{featuredEvent:null,sideEvents:[],labels})), '');
});
test('posters never crop or zoom and menu still uses real West dish deep links',()=>{
  const source=read('../components/EventsSection.tsx');
  assert.doesNotMatch(source,/object-cover|group-hover:scale|lg:h-\[/);
  assert.match(read('../components/EventsSection.module.css'),/object-fit: contain/);
  const menu=read('../components/HomeMenuSection.tsx');
  assert.match(menu,/restaurants\/gosht-west\/menu/);
  assert.match(menu,/\?dish=\$\{encodeURIComponent\(dish.id\)\}/);
  assert.match(menu,/portraitImages/);
});
test('menu marquee is one semantic heading with pause, focus and reduced-motion states',()=>{
  const source=read('../components/HomeMenuMarquee.tsx');
  const style=read('../components/HomeMenuMarquee.module.css');
  assert.match(source,/<h2 id="home-menu-title" className="sr-only">/);
  assert.match(source,/МЕНЮ РЕСТОРАНА/);
  assert.match(source,/setPaused\(value => !value\)/);
  assert.match(style,/animation-play-state: paused/);
  assert.match(style,/:focus-visible/);
  assert.match(style,/prefers-reduced-motion: reduce.*animation: none/);
  assert.match(read('../app/[lang]/page.tsx'),/<RunningLine text=\{runningLineData\?\.text\} \/>/);
});
