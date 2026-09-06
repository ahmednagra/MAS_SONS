import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { BuybackLead, CreateBuybackLead } from '@/types/buyback-leads';

export const submitBuybackLeadServer = async (data: CreateBuybackLead) =>
  unwrap(await serverApiClient.post<BuybackLead>(ENDPOINTS.BUYBACK_LEADS.CREATE, data, null));
