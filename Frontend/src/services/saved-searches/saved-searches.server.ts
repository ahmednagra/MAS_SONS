import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { SavedSearch, SavedSearchCreate, SavedSearchUpdate } from '@/types/saved-searches';

export const getSavedSearchesServer = async (authToken: string) =>
  unwrap(await serverApiClient.get<SavedSearch[]>(ENDPOINTS.SAVED_SEARCHES.LIST, authToken));

export const createSavedSearchServer = async (data: SavedSearchCreate, authToken: string) =>
  unwrap(await serverApiClient.post<SavedSearch>(ENDPOINTS.SAVED_SEARCHES.CREATE, data, authToken));

export const updateSavedSearchServer = async (id: number, data: SavedSearchUpdate, authToken: string) =>
  unwrap(await serverApiClient.patch<SavedSearch>(ENDPOINTS.SAVED_SEARCHES.UPDATE(String(id)), data, authToken));

export const deleteSavedSearchServer = async (id: number, authToken: string) =>
  unwrap(await serverApiClient.delete<{ message: string }>(ENDPOINTS.SAVED_SEARCHES.DELETE(String(id)), authToken));
