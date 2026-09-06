import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';
import type {
  LoginRequest, MagicLinkRequest, MagicLinkVerifyRequest, RegisterRequest, TokenResponse, User,
} from '@/types/auth';

export const registerServer = async (data: RegisterRequest) =>
  unwrap(await serverApiClient.post<TokenResponse>(ENDPOINTS.AUTH.REGISTER, data));

export const loginServer = async (data: LoginRequest) =>
  unwrap(await serverApiClient.post<TokenResponse>(ENDPOINTS.AUTH.LOGIN, data));

export const refreshServer = async (refreshToken: string) =>
  unwrap(await serverApiClient.post<TokenResponse>(ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken }));

export const logoutServer = async (refreshToken: string) =>
  unwrap(await serverApiClient.post<{ message: string }>(ENDPOINTS.AUTH.LOGOUT, { refresh_token: refreshToken }));

export const requestMagicLinkServer = async (data: MagicLinkRequest) =>
  unwrap(await serverApiClient.post<{ message: string }>(ENDPOINTS.AUTH.MAGIC_LINK_REQUEST, data));

export const verifyMagicLinkServer = async (data: MagicLinkVerifyRequest) =>
  unwrap(await serverApiClient.post<TokenResponse>(ENDPOINTS.AUTH.MAGIC_LINK_VERIFY, data));

export const getCurrentUserServer = async (authToken: string) =>
  unwrap(await serverApiClient.get<User>(ENDPOINTS.AUTH.ME, authToken));
