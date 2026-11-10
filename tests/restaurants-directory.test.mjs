import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
function load(path, imports = {}) {
  const code = ts.transpileModule(
    readFileSync(new URL(path, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    },
  ).outputText;
  const result = { exports: {} };
  new Function("require", "module", "exports", code)(
    (id) =>
      id in imports ? { __esModule: true, ...imports[id] } : require(id),
    result,
    result.exports,
  );
  return result.exports;
}
const localized = (value) => ({ ru: value, uz: value, en: value });
const i18n = load("../types/i18n.ts");
const logic = load("../lib/restaurantDirectory.ts", { "../types/i18n": i18n });
let params = new URLSearchParams();
const paths = {
  getLocalizedPath: (lang, path) =>
    `${lang === "en" ? "" : `/${lang}`}/${path}`,
};
const Page = load("../components/RestaurantsDirectoryPage.tsx", {
  "next/image": {
    default: ({ alt, src }) => React.createElement("img", { alt, src }),
  },
  "next/link": {
    default: ({ children, ...props }) =>
      React.createElement("a", props, children),
  },
  "next/navigation": { useSearchParams: () => params },
  "@fortawesome/react-fontawesome": { FontAwesomeIcon: () => null },
  "./restaurant/RestaurantsMap": {
    default: ({ activeBranchId, branches }) =>
      React.createElement("div", {
        "data-map-selection": activeBranchId,
        "data-map-count": branches.length,
      }),
  },
  "@/lib/restaurantDirectory": logic,
  "@/lib/localePaths": paths,
  "@/types/i18n": i18n,
  "./RestaurantsDirectory.module.css": {
    default: new Proxy({}, { get: (_, key) => key }),
  },
}).default;
const branch = (id, overrides = {}) => ({
  id,
  slug: id,
  projectId: "gosht",
  projectName: localized("GŌSHT"),
  branchName: localized(id),
  city: "tashkent",
  projectType: "restaurant",
  address: localized(`Address ${id}`),
  phone: `+998-${id}`,
  workingHours: localized(`Hours ${id}`),
  averageCheck: localized(`Average ${id}`),
  projectPrimaryInfo: localized("Grill"),
  gallery: ["https://cdn.sanity.io/photo.jpg"],
  menuUrls: [
    `https://cdn.sanity.io/${id}-menu.pdf`,
    `https://cdn.sanity.io/${id}-drinks.pdf`,
  ],
  hasBanquet: false,
  hasPlayground: true,
  hasVipRoom: false,
  hasKidsHaircut: false,
  mapCoordinates: [41, 69],
  ...overrides,
});
const west = branch("gosht-west", { hasBanquet: true });
const boulevard = branch("gosht-boulevard");
const ny = branch("gosht-brooklyn", { city: "new_york" });
const barber = branch("topor", {
  projectId: "topor",
  projectName: localized("Topor"),
  projectType: "barbershop",
  hasVipRoom: true,
  hasKidsHaircut: true,
});
const bsb = [
  branch("bsb-one", {
    projectId: "bsb",
    projectName: localized("Black Star Burger"),
  }),
  branch("bsb-two", {
    projectId: "bsb",
    projectName: localized("Black Star Burger"),
  }),
];
function directory(branches) {
  const projects = new Map();
  for (const item of branches) {
    if (!projects.has(item.projectId))
      projects.set(item.projectId, {
        id: item.projectId,
        name: item.projectName,
        branches: [],
      });
    projects.get(item.projectId).branches.push(item);
  }
  return {
    branches,
    projects: [...projects.values()],
    availableCities: [...new Set(branches.map((item) => item.city))],
  };
}
const data = directory([boulevard, west, ny, ...bsb, barber]);
const filters = {
  city: "tashkent",
  cuisine: "all",
  banquet: false,
  delivery: false,
};
const ids = (projects) =>
  projects.flatMap((project) => project.branches.map((branch) => branch.id));
function render(data, query = "", lang = "ru") {
  params = new URLSearchParams(query);
  return renderToStaticMarkup(React.createElement(Page, { data, lang }));
}

test("unfiltered directory preserves every branch and original field without mutating source data", () => {
  const before = JSON.stringify(data);
  const result = logic.filterRestaurantProjects(data, filters, "ru");
  assert.deepEqual(
    new Set(ids(result)),
    new Set(
      data.branches
        .filter((branch) => branch.city === "tashkent")
        .map((branch) => branch.id),
    ),
  );
  assert.equal(ids(result)[0], "gosht-west");
  assert.equal(JSON.stringify(data), before);
  for (const item of result.flatMap((project) => project.branches))
    assert.equal(
      item,
      data.branches.find((branch) => branch.id === item.id),
    );
});
test("banquet and delivery filters work independently and together using AND", () => {
  assert.deepEqual(
    ids(
      logic.filterRestaurantProjects(data, { ...filters, banquet: true }, "ru"),
    ),
    [west.id],
  );
  assert.deepEqual(
    ids(
      logic.filterRestaurantProjects(
        data,
        { ...filters, delivery: true },
        "ru",
      ),
    ),
    [west.id],
  );
  assert.deepEqual(
    ids(
      logic.filterRestaurantProjects(
        data,
        { ...filters, banquet: true, delivery: true },
        "ru",
      ),
    ),
    [west.id],
  );
  assert.deepEqual(
    ids(
      logic.filterRestaurantProjects(
        data,
        { ...filters, city: "new_york", banquet: true, delivery: true },
        "ru",
      ),
    ),
    [],
  );
});
test("delivery is not inferred for every restaurant or barbershop", () => {
  assert.equal(logic.hasDeliveryMenu(west), true);
  assert.equal(logic.hasDeliveryMenu(ny), true);
  assert.equal(logic.hasDeliveryMenu(boulevard), false);
  assert.equal(logic.hasDeliveryMenu({ ...west, city: "new_york" }), false);
  assert.equal(
    logic.hasDeliveryMenu({ ...west, projectType: "barbershop" }),
    false,
  );
});
test("result counts use the correct singular and plural forms", () => {
  assert.equal(logic.formatRestaurantCount(1, "en"), "1 location");
  assert.equal(logic.formatRestaurantCount(2, "en"), "2 locations");
  assert.equal(logic.formatRestaurantCount(1, "ru"), "1 место");
  assert.equal(logic.formatRestaurantCount(2, "ru"), "2 места");
  assert.equal(logic.formatRestaurantCount(19, "ru"), "19 мест");
});
test("cuisine and city filters never mix the two markets", () => {
  assert.deepEqual(
    ids(
      logic.filterRestaurantProjects(
        data,
        { ...filters, cuisine: "Missing" },
        "en",
      ),
    ),
    [],
  );
  assert.deepEqual(
    ids(
      logic.filterRestaurantProjects(
        data,
        { ...filters, city: "new_york" },
        "en",
      ),
    ),
    [ny.id],
  );
});
test("all venue features survive, including playground, VIP and children haircuts", () => {
  assert.deepEqual(logic.restaurantFeatures(west, "en"), [
    "Banquet hall",
    "Kids playground",
    "Delivery",
  ]);
  assert.deepEqual(logic.restaurantFeatures(barber, "en"), [
    "VIP room",
    "Kids haircut",
  ]);
});
test("block layout retains every branch, address, phone, hours, average check and every PDF", () => {
  const html = render(data);
  for (const item of data.branches.filter(
    (branch) => branch.city === "tashkent",
  )) {
    for (const value of [
      item.id,
      item.address.ru,
      item.phone,
      item.workingHours.ru,
      item.averageCheck.ru,
      ...item.menuUrls,
    ])
      assert.ok(html.includes(value), `Missing ${value}`);
    assert.ok(html.includes(`data-restaurant-id="${item.id}"`));
  }
  assert.ok(html.includes("<details"));
  assert.ok(html.includes("Black Star Burger"));
  assert.ok(!html.includes('data-restaurant-id="gosht-brooklyn"'));
  assert.equal((html.match(/data-restaurant-id=/g) || []).length, 5);
});
test("filter labels are native named checkboxes rather than ambiguous text buttons in every locale", () => {
  for (const lang of ["ru", "en", "uz"]) {
    const html = render(directory([ny]), "", lang);
    assert.equal((html.match(/type="checkbox"/g) || []).length, 2);
    assert.equal((html.match(/aria-pressed=/g) || []).length, 2);
    assert.match(html, /aria-live="polite"/);
    assert.ok(html.includes("gosht-brooklyn"));
  }
});
test("delivery entry query preselects its checkbox and does not lose the venue", () => {
  const html = render(directory([ny]), "delivery=1", "en");
  assert.match(html, /type="checkbox" checked=""/);
  assert.ok(html.includes('data-active="true"'));
  assert.equal((html.match(/data-restaurant-id=/g) || []).length, 1);
});
test("map view starts with the filtered branch and retains its contact and menu actions", () => {
  const html = render(directory([ny]), "view=map", "en");
  assert.match(html, /data-map-selection="gosht-brooklyn"/);
  for (const value of [
    ny.address.en,
    ny.phone,
    ny.workingHours.en,
    ...ny.menuUrls,
  ])
    assert.ok(html.includes(value));
});
test("missing photos fall back to gallery and missing optional fields do not create dummy values", () => {
  const html = render(
    directory([
      branch("minimal", {
        address: undefined,
        phone: undefined,
        workingHours: undefined,
        averageCheck: undefined,
        menuUrls: [],
      }),
    ]),
  );
  assert.ok(html.includes("https://cdn.sanity.io/photo.jpg"));
  assert.ok(!html.includes("tel:undefined"));
  assert.ok(!html.includes("Average minimal"));
});
