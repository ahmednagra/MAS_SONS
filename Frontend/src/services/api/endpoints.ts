// The only place an endpoint path string is allowed to exist.
export const ENDPOINTS = {
  STOCK: {
    LIST: '/stock',
    DETAIL: (id: string) => `/stock/${id}`,
    BY_SLUG: (slug: string) => `/stock/slug/${slug}`,
    UPDATE: (id: string) => `/stock/${id}`,
  },
  QUOTE_REQUESTS: {
    CREATE: '/quote-requests',
    LIST: '/quote-requests',
    DETAIL: (id: string) => `/quote-requests/${id}`,
  },
  FAVORITES: {
    LIST: (userId: string) => `/favorites/${userId}`,
    ADD: '/favorites',
    REMOVE: (unitId: string) => `/favorites/${unitId}`,
  },
  SAVED_SEARCHES: {
    LIST: (userId: string) => `/saved-searches/${userId}`,
    CREATE: '/saved-searches',
  },
  DESTINATIONS: {
    INFO: (country: string) => `/destinations/${country}`,
  },
  AUTH: {
    ME: '/auth/me',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  BUYBACK_LEADS: {
    CREATE: '/buyback-leads',
  },
};
