import { supabase } from '../config/supabase.js';
import {AuthCredentials, AuthSuccess} from "../models/auth.model.js";

export class AuthServiceError extends Error {
  status: number;
  details?: string;
  constructor(message: string, status = 400, details?: string) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function signUp({ email, password, username }: AuthCredentials): Promise<AuthSuccess> {
  // Pass display_name metadata if username provided so DB trigger can populate profiles.display_name
  const options = username ? { data: { display_name: username } } : undefined;
  const { data, error } = await supabase.auth.signUp({ email, password, options });
  if (error) throw new AuthServiceError(error.message, 400);
  return { user: data.user };
}

export async function signIn({ email, password }: AuthCredentials): Promise<AuthSuccess> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new AuthServiceError(error.message, 400);
  return { user: data.user, session: data.session };
}

export async function getUserFromAccessToken(accessToken: string) {
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user) throw new AuthServiceError('Invalid or expired token', 401, error?.message);
  return data.user;
}
