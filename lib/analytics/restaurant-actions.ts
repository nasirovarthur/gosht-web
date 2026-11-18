import type { LangCode } from '@/types/i18n';

export type RestaurantAnalyticsId = 'mirabad' | 'west' | 'boulevard' | 'muqimiy';
type ActionName = 'click_to_call' | 'get_directions' | 'view_menu' | 'generate_lead';

type ActionParameters = {
  restaurant_id: RestaurantAnalyticsId | 'not_selected';
  language: LangCode;
  cta_location: string;
  menu_format?: 'page' | 'pdf';
  form_id?: 'feedback';
  lead_type?: 'feedback';
};

type AnalyticsState = {
  pathname: string;
  menuPathname?: string;
  pendingMenu?: { pathname: string; location: string; createdAt: number };
  acceptedRequests: Set<string>;
  pendingActions: Array<{ event: ActionName; parameters: ActionParameters }>;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    __goshtAnalyticsOwner?: 'site-v1';
    __goshtMeasurementV1?: { page: () => void };
    __goshtSiteAnalytics?: AnalyticsState;
  }
}

const RESTAURANT_IDS = ['mirabad', 'west', 'boulevard', 'muqimiy'] as const;
const LEAD_STORAGE_KEY = 'gosht:accepted-feedback:v1';
const MAX_SAVED_REQUESTS = 100;

export function getRestaurantAnalyticsId(slug?: string): RestaurantAnalyticsId | undefined {
  const normalized = slug?.replace(/^\/+|\/+$/g, '').replace(/^gosht-/, '');
  return RESTAURANT_IDS.find((id) => id === normalized);
}

function state(): AnalyticsState {
  window.__goshtSiteAnalytics ??= { pathname: '', acceptedRequests: new Set(), pendingActions: [] };
  return window.__goshtSiteAnalytics;
}

function pushAction(event: ActionName, parameters: ActionParameters) {
  const hasSiteOwnership = window.__goshtAnalyticsOwner === 'site-v1' && !window.__goshtMeasurementV1;
  if (!hasSiteOwnership) {
    const pending = state().pendingActions;
    pending.push({ event, parameters });
    if (pending.length > 100) pending.shift();
  }
  try {
    window.dataLayer ??= [];
    window.dataLayer.push({
      event: hasSiteOwnership ? event : `gosht_site_${event}`,
      analytics_source: 'site-v1',
      restaurant_id: parameters.restaurant_id,
      language: parameters.language,
      cta_location: parameters.cta_location,
      menu_format: parameters.menu_format ?? null,
      form_id: parameters.form_id ?? null,
      lead_type: parameters.lead_type ?? null,
    });
  } catch {
    // Keep the server-accepted form state even if a third-party tag fails.
  }
}

export function flushPendingRestaurantActions() {
  if (window.__goshtAnalyticsOwner !== 'site-v1' || window.__goshtMeasurementV1) return;
  const pending = state().pendingActions.splice(0);
  pending.forEach(({ event, parameters }) => pushAction(event, parameters));
}

function getMenuDestination(href: string) {
  const url = new URL(href, window.location.href);
  const match = url.pathname.match(/^\/(ru|uz|en)\/restaurants\/([^/]+)\/menu\/?$/);
  const restaurantId = getRestaurantAnalyticsId(match?.[2]);
  return url.origin === window.location.origin && match && restaurantId
    ? { pathname: url.pathname, language: match[1] as LangCode, restaurantId }
    : undefined;
}

export function recordRestaurantAnalyticsPath(pathname: string) {
  const current = state();
  if (current.pathname !== pathname) {
    current.pathname = pathname;
    current.menuPathname = undefined;
  }
}

export function trackRestaurantLink(event: MouseEvent, language: LangCode) {
  const target = event.target instanceof Element ? event.target : event.target instanceof Node ? event.target.parentElement : null;
  const link = target?.closest<HTMLAnchorElement>('a[href]');
  if (!link || (event.type === 'auxclick' && event.button !== 1)) return;

  const destination = getMenuDestination(link.href);
  const ctaLocation = link.dataset.ctaLocation || (link.closest('header') ? 'header' : link.closest('footer') ? 'footer' : 'branch_page');

  // A menu page is counted when its content opens, including direct/SPA entry.
  if (destination) {
    state().pendingMenu = { pathname: destination.pathname, location: ctaLocation, createdAt: Date.now() };
    return;
  }

  const restaurantId = getRestaurantAnalyticsId(link.dataset.restaurantId);
  if (!restaurantId) return;
  const action = link.dataset.analyticsEvent;
  const parameters = { restaurant_id: restaurantId, language, cta_location: ctaLocation };
  if (action === 'click_to_call' && link.protocol === 'tel:') {
    pushAction(action, parameters);
  } else if (action === 'get_directions' && /^https?:$/.test(link.protocol)) {
    pushAction(action, parameters);
  } else if (action === 'view_menu' && link.dataset.menuFormat === 'pdf') {
    pushAction(action, { ...parameters, menu_format: 'pdf' });
  }
}

export function trackRestaurantMenuPage(pathname: string, language: LangCode) {
  const destination = getMenuDestination(pathname);
  if (!destination) return;
  recordRestaurantAnalyticsPath(pathname);
  const current = state();
  if (current.menuPathname === pathname) return;
  current.menuPathname = pathname;
  const pending = current.pendingMenu;
  const location = pending?.pathname === pathname && Date.now() - pending.createdAt < 30_000
    ? pending.location
    : 'menu_page';
  current.pendingMenu = undefined;
  pushAction('view_menu', {
    restaurant_id: destination.restaurantId,
    language,
    cta_location: location,
    menu_format: 'page',
  });
}

export function trackAcceptedFeedback({
  requestId,
  restaurantId,
  language,
}: {
  requestId: string;
  restaurantId?: string;
  language: LangCode;
}) {
  const current = state();
  if (current.acceptedRequests.has(requestId)) return;

  try {
    const saved: unknown = JSON.parse(window.sessionStorage.getItem(LEAD_STORAGE_KEY) || '[]');
    if (Array.isArray(saved)) {
      saved.filter((value): value is string => typeof value === 'string').forEach((id) => current.acceptedRequests.add(id));
    }
  } catch {
    // The in-memory guard also works when sessionStorage is unavailable.
  }
  if (current.acceptedRequests.has(requestId)) return;
  current.acceptedRequests.add(requestId);
  try {
    window.sessionStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify([...current.acceptedRequests].slice(-MAX_SAVED_REQUESTS)));
  } catch {
    // Analytics must never prevent a successful feedback submission.
  }

  pushAction('generate_lead', {
    restaurant_id: getRestaurantAnalyticsId(restaurantId) || 'not_selected',
    language,
    cta_location: 'feedback_drawer',
    form_id: 'feedback',
    lead_type: 'feedback',
  });
}
