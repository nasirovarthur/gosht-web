import 'server-only';
import { cache } from 'react';
import { applyAdminMenuVisibility } from './adminMenuVisibility';
import { getIikoDeliveryMenu, getIikoMainGoshtHints } from './iiko';

// The homepage and West menu must use the same prices and visibility policy.
export const getGoshtDeliveryMenu = cache(async () => applyAdminMenuVisibility(
  await getIikoDeliveryMenu(getIikoMainGoshtHints('Gosht West', 'Gosht')),
));
