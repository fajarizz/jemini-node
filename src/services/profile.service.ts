import { supabase } from '../config/supabase.js';
import { mapProfileRow, type Profile } from '../models/profile.model.js';

export class ProfileServiceError extends Error {
  status: number;
  details?: string;
  constructor(message: string, status = 400, details?: string) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function getProfileById(id: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) throw new ProfileServiceError('Profile not found', 404, error.message);
  return mapProfileRow(data);
}

interface UpdateProfileInput { displayName?: string; avatarUrl?: string; }

export async function updateProfile(id: string, { displayName, avatarUrl }: UpdateProfileInput): Promise<Profile> {
  const update: Record<string, any> = {};
  if (typeof displayName === 'string') update.display_name = displayName;
  if (typeof avatarUrl === 'string') update.avatar_url = avatarUrl;
  if (!Object.keys(update).length) throw new ProfileServiceError('No valid fields to update', 400);
  const { data, error } = await supabase.from('profiles').update(update).eq('id', id).select('*').single();
  if (error) throw new ProfileServiceError('Failed to update profile', 400, error.message);
  return mapProfileRow(data);
}
