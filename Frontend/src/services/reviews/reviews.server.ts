import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { toQueryString } from '@/lib/query-string';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { Review, ReviewCreate } from '@/types/reviews';

export const listApprovedReviewsServer = async (params: { country?: string; cursor?: number; limit?: number } = {}) =>
  unwrap(await serverApiClient.get<Review[]>(`${ENDPOINTS.REVIEWS.LIST}${toQueryString(params)}`));

// Guest-allowed at the route level, but callers here always have a signed-in buyer (a
// review is gated on owning the quote request), so authToken is required rather than
// optional — see account/reviews/new/actions.ts.
export const createReviewServer = async (data: ReviewCreate, authToken: string) =>
  unwrap(await serverApiClient.post<Review>(ENDPOINTS.REVIEWS.CREATE, data, authToken));
