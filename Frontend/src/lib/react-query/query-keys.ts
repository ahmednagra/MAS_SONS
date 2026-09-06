export const queryKeys = {
  favorites: {
    all: ['favorites'] as const,
    list: (userId: string) => [...queryKeys.favorites.all, 'list', userId] as const,
  },
  savedSearches: {
    all: ['saved-searches'] as const,
    list: (userId: string) => [...queryKeys.savedSearches.all, 'list', userId] as const,
  },
  quoteRequests: {
    all: ['quote-requests'] as const,
    list: (userId: string) => [...queryKeys.quoteRequests.all, 'list', userId] as const,
    detail: (id: string) => [...queryKeys.quoteRequests.all, 'detail', id] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: (userId: string) => [...queryKeys.orders.all, 'list', userId] as const,
    detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (userId: string) => [...queryKeys.notifications.all, 'list', userId] as const,
    preferences: (userId: string) => [...queryKeys.notifications.all, 'preferences', userId] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    approved: (country?: string) => [...queryKeys.reviews.all, 'approved', country ?? 'all'] as const,
  },
  // Single stock pool — not per-dealer inventories.
  stock: {
    all: ['stock'] as const,
    list: (params: object) => [...queryKeys.stock.all, 'list', params] as const,
    facets: (params: object) => [...queryKeys.stock.all, 'facets', params] as const,
    detail: (id: string) => [...queryKeys.stock.all, 'detail', id] as const,
  },
  inquiries: {
    all: ['inquiries'] as const,
    unreadCount: () => [...queryKeys.inquiries.all, 'unread-count'] as const,
  },
} as const;
