import { supabase } from '../config/supabase.js';

export interface ConversationRow {
  id: string;
  title: string | null;
  is_group: boolean;
  created_by: string;
  created_at: string;
}

export class ConversationServiceError extends Error {
  status: number;
  details?: string;
  constructor(message: string, status = 400, details?: string) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function listConversationsForUser(userId: string): Promise<ConversationRow[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, is_group, created_by, created_at')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) throw new ConversationServiceError('Failed to fetch conversations', 500, error.message);
  return (data || []) as ConversationRow[];
}

