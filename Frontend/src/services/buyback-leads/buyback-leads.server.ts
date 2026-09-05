import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { CreateBuybackLead } from '@/types/buyback-leads';

export const submitBuybackLeadServer = async (data: CreateBuybackLead) =>
  unwrap(await serverApiClient.post<{ id: string }>(ENDPOINTS.BUYBACK_LEADS.CREATE, data, null));
