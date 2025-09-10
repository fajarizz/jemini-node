import type { User } from '@supabase/supabase-js';

export interface AuthUserModel {
  id: string;
  email: string | null;
  createdAt: string | null;
}

export function mapUser(user: User): AuthUserModel {
  return {
    id: user.id,
    email: user.email ?? null,
    createdAt: user.created_at ?? null
  };
}

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface AuthSuccess {
    user: any; // Could refine with Supabase types
    session?: any;
}

export interface AuthError {
    error: string;
    details?: string;
}

