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
  // Single stock pool — not per-dealer inventories.
  stock: {
    all: ['stock'] as const,
    list: (params: object) => [...queryKeys.stock.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.stock.all, 'detail', id] as const,
  },
  inquiries: {
    all: ['inquiries'] as const,
    unreadCount: () => [...queryKeys.inquiries.all, 'unread-count'] as const,
  },
} as const;
