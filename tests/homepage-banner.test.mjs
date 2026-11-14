import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(new URL("../lib/getAdminHomepageBanner.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;

function load(fetch) {
  const exports = {};
  new Function("require", "exports", "process", "fetch", source)(
    () => ({}), exports,
    { env: { GOSHT_ADMIN_API_URL: "https://admin.example/api/" } },
    fetch,
  );
  return exports.getAdminHomepageBanner;
}

const copy = { uz: "Muqimiy", ru: "Мукими", en: "Muqimiy" };
const banner = {
  id: "cms-id", subtitle: copy, title: copy, description: copy, buttonText: copy,
  customButtonUrl: "/restaurants/gosht-muqimiy", imageFocus: 23,
  image: "/media/uploads/events/" + "a".repeat(64) + ".jpg",
};

test("reads the CMS at request time and keeps the approved focus and gradient", async () => {
  const get = load(async (url, options) => {
    assert.equal(url, "https://admin.example/api/public/homepage-banner");
    assert.equal(options.cache, "no-store");
    return Response.json({ banner });
  });
  for (const lang of ["uz", "ru", "en"]) {
    const slide = await get(lang);
    assert.equal(slide.buttonUrl, `/${lang}${banner.customButtonUrl}`);
    assert.equal(slide.image, "https://admin.gosht.uz" + banner.image);
    assert.equal(slide.imagePosition, "23% center");
    assert.match(slide.imageOverlay, /rgb\(0 0 0 \/ 30%\) 67%/);
  }
});

test("does not show a hard-coded fallback when hidden or the API is unavailable", async () => {
  assert.equal(await load(async () => Response.json({ banner: null }))("ru"), null);
  assert.equal(await load(async () => new Response(null, { status: 503 }))("ru"), null);
  assert.equal(await load(async () => { throw new Error("timeout"); })("ru"), null);
});

test("rejects invalid URLs or focus without disturbing other slides", async () => {
  for (const patch of [{ image: "//other.test/photo.jpg" }, { customButtonUrl: "//other.test" }, { imageFocus: 150 }]) {
    assert.equal(await load(async () => Response.json({ banner: { ...banner, ...patch } }))("ru"), null);
  }
});
