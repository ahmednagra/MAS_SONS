import { nextjsApiClient } from '@/lib/nextjs-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { SavedSearch, SavedSearchCreate, SavedSearchUpdate } from '@/types/saved-searches';

export const getSavedSearches = async () =>
  unwrap(await nextjsApiClient.get<SavedSearch[]>(`/api/v0${ENDPOINTS.SAVED_SEARCHES.LIST}`));

export const createSavedSearch = async (data: SavedSearchCreate) =>
  unwrap(await nextjsApiClient.post<SavedSearch>(`/api/v0${ENDPOINTS.SAVED_SEARCHES.CREATE}`, data));

export const updateSavedSearch = async (id: number, data: SavedSearchUpdate) =>
  unwrap(await nextjsApiClient.patch<SavedSearch>(`/api/v0${ENDPOINTS.SAVED_SEARCHES.UPDATE(String(id))}`, data));

export const deleteSavedSearch = async (id: number) =>
  unwrap(await nextjsApiClient.delete<{ message: string }>(`/api/v0${ENDPOINTS.SAVED_SEARCHES.DELETE(String(id))}`));
