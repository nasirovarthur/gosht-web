"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowUpRightFromSquare,
  faCheck,
  faChevronDown,
  faListUl,
  faMap,
  faRotateLeft,
  faUtensils,
  faBagShopping,
} from "@fortawesome/free-solid-svg-icons";
import RestaurantsMap from "./restaurant/RestaurantsMap";
import type {
  RestaurantBranchItem,
  RestaurantProjectItem,
  RestaurantsDirectoryData,
} from "@/lib/getRestaurantBranches";
import type { RestaurantsPageSettingsData } from "@/lib/getRestaurantsPageSettings";
import {
  filterRestaurantProjects,
  formatRestaurantCount,
  groupRestaurantProject,
  hasDeliveryMenu,
  restaurantCuisine,
  restaurantFeatures,
} from "@/lib/restaurantDirectory";
import { pickLocalized } from "@/types/i18n";
import type { LangCode } from "@/types/i18n";
import styles from "./RestaurantsDirectory.module.css";

const copy = {
  ru: {
    title: "Рестораны",
    region: "Регион",
    list: "Списком",
    map: "На карте",
    view: "Вид ресторанов",
    cuisine: "Кухня",
    all: "Все кухни",
    banquet: "Банкетный зал",
    delivery: "Доставка",
    filters: "Фильтры ресторанов",
    reset: "Сбросить фильтры",
    empty: "По выбранным фильтрам ресторанов нет",
    details: "Подробнее",
    address: "Адрес",
    phone: "Телефон",
    hours: "Режим работы",
    average: "Средний чек",
    menu: "Открыть меню",
    deliveryMenu: "Меню доставки",
    branches: "Филиалы",
    found: "Найдено",
    places: "мест",
    openMap: "На карте",
  },
  en: {
    title: "Restaurants",
    region: "Region",
    list: "List",
    map: "Map",
    view: "Restaurant view",
    cuisine: "Cuisine",
    all: "All cuisines",
    banquet: "Banquet hall",
    delivery: "Delivery",
    filters: "Restaurant filters",
    reset: "Reset filters",
    empty: "No restaurants match these filters",
    details: "Explore",
    address: "Address",
    phone: "Phone",
    hours: "Opening hours",
    average: "Average check",
    menu: "Open menu",
    deliveryMenu: "Delivery menu",
    branches: "Locations",
    found: "Results",
    places: "locations",
    openMap: "On map",
  },
  uz: {
    title: "Restoranlar",
    region: "Hudud",
    list: "Ro‘yxat",
    map: "Xaritada",
    view: "Restoranlar ko‘rinishi",
    cuisine: "Oshxona",
    all: "Barcha oshxonalar",
    banquet: "Banket zali",
    delivery: "Yetkazish",
    filters: "Restoran filtrlari",
    reset: "Filtrlarni tozalash",
    empty: "Bu filtrlarga mos restoranlar yo‘q",
    details: "Batafsil",
    address: "Manzil",
    phone: "Telefon",
    hours: "Ish vaqti",
    average: "O‘rtacha hisob",
    menu: "Menyuni ochish",
    deliveryMenu: "Yetkazish menyusi",
    branches: "Filiallar",
    found: "Topildi",
    places: "joy",
    openMap: "Xaritada",
  },
};

function cityName(city: string, lang: LangCode) {
  return city === "new_york"
    ? { ru: "Нью-Йорк", en: "New York", uz: "Nyu-York" }[lang]
    : { ru: "Ташкент", en: "Tashkent", uz: "Toshkent" }[lang];
}

function branchHref(branch: RestaurantBranchItem, lang: LangCode) {
  return `/${lang}/${branch.slug ? `restaurants/${encodeURIComponent(branch.slug)}` : "restaurants"}`;
}

function BranchFacts({
  branch,
  lang,
  onMap,
}: {
  branch: RestaurantBranchItem;
  lang: LangCode;
  onMap?: (id: string) => void;
}) {
  const text = copy[lang];
  const address = pickLocalized(branch.address, lang);
  const hours = pickLocalized(branch.workingHours, lang);
  const average = pickLocalized(branch.averageCheck, lang);
  const features = restaurantFeatures(branch, lang);
  const menus = Array.from(
    new Set([...branch.menuUrls, ...(branch.menuUrl ? [branch.menuUrl] : [])]),
  );
  return (
    <div className={styles.facts}>
      {features.length > 0 && (
        <ul className={styles.features}>
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      )}
      <dl className={styles.contacts}>
        {address && (
          <div>
            <dt>{text.address}</dt>
            <dd>{address}</dd>
          </div>
        )}
        {branch.phone && (
          <div>
            <dt>{text.phone}</dt>
            <dd>
              <a href={`tel:${branch.phone}`}>{branch.phone}</a>
            </dd>
          </div>
        )}
        {hours && (
          <div>
            <dt>{text.hours}</dt>
            <dd>{hours}</dd>
          </div>
        )}
        {average && (
          <div>
            <dt>{text.average}</dt>
            <dd>{average}</dd>
          </div>
        )}
      </dl>
      <div className={styles.actions}>
        <Link href={branchHref(branch, lang)}>
          {text.details}
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
        {menus.map((href, index) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer">
            {text.menu}
            {menus.length > 1 ? ` ${index + 1}` : ""}
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          </a>
        ))}
        {hasDeliveryMenu(branch) && (
          <Link href={`${branchHref(branch, lang)}/menu`}>
            {text.deliveryMenu}
            <FontAwesomeIcon icon={faBagShopping} />
          </Link>
        )}
        {onMap && branch.mapCoordinates && (
          <button type="button" onClick={() => onMap(branch.id)}>
            {text.openMap}
            <FontAwesomeIcon icon={faMap} />
          </button>
        )}
        {!onMap && branch.mapLink && (
          <a href={branch.mapLink} target="_blank" rel="noopener noreferrer">
            {text.openMap}
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          </a>
        )}
      </div>
    </div>
  );
}

function RestaurantPhoto({
  branch,
  lang,
  project,
}: {
  branch: RestaurantBranchItem;
  lang: LangCode;
  project?: RestaurantProjectItem;
}) {
  const image = branch.cardImage || branch.gallery[0];
  const title = pickLocalized(project?.name || branch.branchName, lang);
  const logo = project?.logo || branch.projectLogo;
  return (
    <Link
      href={branchHref(branch, lang)}
      className={styles.photo}
      aria-label={title}
    >
      {image && (
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
          className={styles.image}
        />
      )}
      {logo && (
        <span className={styles.logo}>
          <Image
            src={logo}
            alt={pickLocalized(branch.projectName, lang)}
            fill
            sizes="104px"
            className={styles.logoImage}
          />
        </span>
      )}
    </Link>
  );
}

function RestaurantCard({
  branch,
  lang,
  onMap,
  single = false,
}: {
  branch: RestaurantBranchItem;
  lang: LangCode;
  onMap: (id: string) => void;
  single?: boolean;
}) {
  const cuisine = restaurantCuisine(branch, lang);
  return (
    <article
      className={`${styles.card} ${single ? styles.single : ""}`}
      data-restaurant-id={branch.id}
    >
      <RestaurantPhoto branch={branch} lang={lang} />
      <div className={styles.cardBody}>
        <h2>
          <Link href={branchHref(branch, lang)}>
            {pickLocalized(branch.branchName, lang)}
          </Link>
        </h2>
        {cuisine && <p className={styles.cuisine}>{cuisine}</p>}
        <BranchFacts branch={branch} lang={lang} onMap={onMap} />
      </div>
    </article>
  );
}

function RestaurantGroup({
  project,
  lang,
  onMap,
  reverse,
}: {
  project: RestaurantProjectItem;
  lang: LangCode;
  onMap: (id: string) => void;
  reverse: boolean;
}) {
  const first = project.branches[0];
  const description = pickLocalized(project.description, lang);
  return (
    <article
      className={styles.projectGroup}
      data-reverse={reverse || undefined}
    >
      <RestaurantPhoto branch={first} lang={lang} project={project} />
      <div className={styles.groupBody}>
        <h2>{pickLocalized(project.name, lang)}</h2>
        {description && (
          <p className={styles.projectDescription}>{description}</p>
        )}
        <div className={styles.branchList} aria-label={copy[lang].branches}>
          {project.branches.map((branch) => (
            <details
              key={branch.id}
              className={styles.branch}
              data-restaurant-id={branch.id}
            >
              <summary>
                <span>
                  <span className={styles.branchName}>
                    {pickLocalized(branch.branchName, lang)}
                  </span>
                  <span className={styles.branchAddress}>
                    {pickLocalized(branch.address, lang)}
                  </span>
                </span>
                <FontAwesomeIcon icon={faChevronDown} />
              </summary>
              <BranchFacts branch={branch} lang={lang} onMap={onMap} />
            </details>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function RestaurantsDirectoryPage({
  data,
  pageSettings,
  lang,
}: {
  data: RestaurantsDirectoryData;
  pageSettings?: RestaurantsPageSettingsData;
  lang: LangCode;
}) {
  const search = useSearchParams();
  const text = copy[lang];
  const cities = data.availableCities;
  const initialCity = cities.includes(search.get("city") || "")
    ? search.get("city")!
    : cities[0] || "";
  const [city, setCity] = useState(initialCity);
  const [view, setView] = useState<"list" | "map">(
    search.get("view") === "map" ? "map" : "list",
  );
  const [cuisine, setCuisine] = useState("all");
  const [banquet, setBanquet] = useState(false);
  const [delivery, setDelivery] = useState(search.get("delivery") === "1");
  const [selectedId, setSelectedId] = useState("");
  const headerRef = useRef<HTMLElement>(null);
  const cuisines = Array.from(
    new Set(
      data.branches
        .filter((branch) => branch.city === city)
        .map((branch) => restaurantCuisine(branch, lang))
        .filter(Boolean),
    ),
  );
  const projects = filterRestaurantProjects(
    data,
    { city, cuisine, banquet, delivery },
    lang,
  );
  const branches = projects.flatMap((project) => project.branches);
  const selected =
    branches.find((branch) => branch.id === selectedId) || branches[0];
  const filtered = cuisine !== "all" || banquet || delivery;
  const reset = () => {
    setCuisine("all");
    setBanquet(false);
    setDelivery(false);
  };
  const showMap = (id: string) => {
    setSelectedId(id);
    setView("map");
    headerRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  };
  const groupedIds = projects
    .filter(groupRestaurantProject)
    .map((project) => project.id);

  return (
    <main className={`page-x bg-base ${styles.page}`}>
      <h1 className={styles.srOnly}>
        {pickLocalized(pageSettings?.title, lang) || text.title}
      </h1>
      <header ref={headerRef} className={styles.header}>
        <div className={styles.region}>
          <span>{text.region}:</span>
          {cities.length > 1 ? (
            <label className={styles.citySelect}>
              <span className={styles.srOnly}>{text.region}</span>
              <select
                value={city}
                onChange={(event) => {
                  setCity(event.target.value);
                  reset();
                  setSelectedId("");
                }}
              >
                {cities.map((value) => (
                  <option key={value} value={value}>
                    {cityName(value, lang)}
                  </option>
                ))}
              </select>
              <FontAwesomeIcon icon={faChevronDown} />
            </label>
          ) : (
            <span>{cityName(city, lang)}</span>
          )}
        </div>
        <div className={styles.toolbar}>
          <div className={styles.views} role="group" aria-label={text.view}>
            <button
              type="button"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <FontAwesomeIcon icon={faListUl} />
              {text.list}
            </button>
            <button
              type="button"
              aria-pressed={view === "map"}
              onClick={() => setView("map")}
            >
              <FontAwesomeIcon icon={faMap} />
              {text.map}
            </button>
          </div>
          <fieldset className={styles.filters}>
            <legend className={styles.srOnly}>{text.filters}</legend>
            {cuisines.length > 1 && (
              <label className={styles.cuisineSelect}>
                <span>{text.cuisine}</span>
                <select
                  value={cuisine}
                  onChange={(event) => setCuisine(event.target.value)}
                >
                  <option value="all">{text.all}</option>
                  {cuisines.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className={styles.filter} data-active={banquet || undefined}>
              <input
                type="checkbox"
                checked={banquet}
                onChange={(event) => setBanquet(event.target.checked)}
              />
              <span className={styles.checkbox} aria-hidden="true">
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <FontAwesomeIcon icon={faUtensils} />
              <span>{text.banquet}</span>
            </label>
            <label
              className={styles.filter}
              data-active={delivery || undefined}
            >
              <input
                type="checkbox"
                checked={delivery}
                onChange={(event) => setDelivery(event.target.checked)}
              />
              <span className={styles.checkbox} aria-hidden="true">
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <FontAwesomeIcon icon={faBagShopping} />
              <span>{text.delivery}</span>
            </label>
          </fieldset>
        </div>
        <div className={styles.resultBar}>
          <p role="status" aria-live="polite">
            {text.found}: {formatRestaurantCount(branches.length, lang)}
          </p>
          {filtered && branches.length > 0 && (
            <button type="button" onClick={reset}>
              <FontAwesomeIcon icon={faRotateLeft} />
              {text.reset}
            </button>
          )}
        </div>
      </header>

      {!branches.length ? (
        <section className={styles.empty}>
          <h2>{text.empty}</h2>
          {filtered && (
            <button type="button" onClick={reset}>
              {text.reset}
              <FontAwesomeIcon icon={faRotateLeft} />
            </button>
          )}
        </section>
      ) : view === "list" ? (
        <section className={styles.restaurants} aria-label={text.title}>
          {projects.map((project) =>
            groupRestaurantProject(project) ? (
              <RestaurantGroup
                key={project.id}
                project={project}
                lang={lang}
                onMap={showMap}
                reverse={groupedIds.indexOf(project.id) % 2 === 1}
              />
            ) : (
              project.branches.map((branch) => (
                <RestaurantCard
                  key={branch.id}
                  branch={branch}
                  lang={lang}
                  onMap={showMap}
                  single={branches.length === 1}
                />
              ))
            ),
          )}
        </section>
      ) : (
        <section className={styles.mapLayout} aria-label={text.map}>
          <div className={styles.mapCanvas}>
            <RestaurantsMap
              branches={branches}
              activeBranchId={selected?.id}
              lang={lang}
              onSelectBranch={setSelectedId}
            />
          </div>
          <aside className={styles.mapList}>
            <ul>
              {branches.map((branch) => (
                <li key={branch.id} data-restaurant-id={branch.id}>
                  <button
                    type="button"
                    className={styles.mapChoice}
                    aria-pressed={branch.id === selected?.id}
                    onClick={() => setSelectedId(branch.id)}
                  >
                    <span>{pickLocalized(branch.branchName, lang)}</span>
                    <span>{pickLocalized(branch.address, lang)}</span>
                  </button>
                  {branch.id === selected?.id && (
                    <BranchFacts branch={branch} lang={lang} />
                  )}
                </li>
              ))}
            </ul>
          </aside>
        </section>
      )}
    </main>
  );
}
