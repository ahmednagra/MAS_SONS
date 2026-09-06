// Mirrors app/Schemas/auth.py — snake_case, no case-mapping layer.
export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  user_type: 'buyer' | 'staff';
  staff_role?: 'admin' | 'stock_manager' | 'sales' | null;
  status: string;
  created_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface MagicLinkRequest {
  email: string;
}

export interface MagicLinkVerifyRequest {
  token: string;
}
