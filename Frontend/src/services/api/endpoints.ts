// The only place an endpoint path string is allowed to exist.
export const ENDPOINTS = {
  STOCK: {
    LIST: '/stock',
    BY_SLUG: (slug: string) => `/stock/${slug}`,
    INSIGHTS: (slug: string) => `/stock/${slug}/insights`,
    COUNT: '/stock/count',
    FACETS: '/stock/facets',
    // Bounded batch lookup (backend caps at 50 ids) — preserves caller-supplied order.
    BY_IDS: '/stock/by-ids',
    // Staff-only — the only unit mutation the backend exposes.
    ADMIN_UPDATE_PRICE: (id: string) => `/admin/stock/${id}/price`,
  },
  SOURCING_REQUESTS: {
    CREATE: '/sourcing-requests',
  },
  QUOTE_REQUESTS: {
    CREATE: '/quote-requests',
    LIST: '/quote-requests',
    DETAIL: (id: string) => `/quote-requests/${id}`,
  },
  // Identity always comes from the auth cookie server-side — never a client-supplied id in the URL.
  FAVORITES: {
    LIST: '/favorites',
    ADD: '/favorites',
    REMOVE: (unitId: string) => `/favorites/${unitId}`,
  },
  SAVED_SEARCHES: {
    LIST: '/saved-searches',
    CREATE: '/saved-searches',
    UPDATE: (id: string) => `/saved-searches/${id}`,
    DELETE: (id: string) => `/saved-searches/${id}`,
  },
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    FULFILLMENT: (id: string) => `/orders/${id}/fulfillment-details`,
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    PREFERENCES: '/notifications/preferences',
  },
  REVIEWS: {
    LIST: '/reviews',
    CREATE: '/reviews',
    REPORT: (id: string) => `/reviews/${id}/report`,
  },
  UPLOADS: {
    CREATE: '/uploads',
  },
  DESTINATIONS: {
    LIST: '/destinations',
    INFO: (country: string) => `/destinations/${country}`,
  },
  AUTH: {
    ME: '/auth/me',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    MAGIC_LINK_REQUEST: '/auth/magic-link/request',
    MAGIC_LINK_VERIFY: '/auth/magic-link/verify',
    GOOGLE: '/auth/google',
  },
  BUYBACK_LEADS: {
    CREATE: '/buyback-leads',
  },
};
