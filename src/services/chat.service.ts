import { supabase } from '../config/supabase.js';
import { geminiClient, DEFAULT_GEMINI_MODEL } from '../config/gemini.js';

export interface ChatRequestOptions {
  userId: string;
  prompt: string;
  conversationId?: string;
  title?: string;
  model?: string;
  system?: string; // future: add system instruction support
}

export interface ChatResponseData {
  conversationId: string;
  userMessageId: string;
  assistantMessageId?: string;
  assistantContent?: string;
  modelUsed?: string;
}

class ChatServiceError extends Error {
  status: number;
  details?: string;
  constructor(message: string, status = 400, details?: string) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function ensureConversation(conversationId: string | undefined, userId: string, title?: string): Promise<string> {
  if (conversationId) {
    // Validate ownership or participation (simplified: creator only for now)
    const { data, error } = await supabase.from('conversations').select('id, created_by').eq('id', conversationId).single();
    if (error || !data) throw new ChatServiceError('Conversation not found', 404);
    if (data.created_by !== userId) throw new ChatServiceError('Forbidden', 403);
    return data.id;
  }
  const convTitle = title || 'Chat: ' + new Date().toISOString().substring(0, 10);
  const { data, error } = await supabase.from('conversations').insert({ title: convTitle, created_by: userId }).select('id').single();
  if (error || !data) throw new ChatServiceError('Failed to create conversation', 500, error?.message);
  return data.id;
}

async function insertMessage(conversationId: string, role: 'user' | 'assistant' | 'system' | 'tool', content: string, senderId: string | null, metadata: any = {}) {
  const { data, error } = await supabase.from('messages').insert({ conversation_id: conversationId, role, content, sender_id: senderId, metadata }).select('id').single();
  if (error || !data) throw new ChatServiceError('Failed to insert message', 500, error?.message);
  return data.id as string;
}

export async function chatWithGemini(opts: ChatRequestOptions): Promise<ChatResponseData> {
  if (!opts.prompt?.trim()) throw new ChatServiceError('Prompt required', 400);
  const conversationId = await ensureConversation(opts.conversationId, opts.userId, opts.title);

  // Save user message first
  const userMessageId = await insertMessage(conversationId, 'user', opts.prompt, opts.userId);

  if (!geminiClient) {
    return { conversationId, userMessageId }; // no assistant reply (service unavailable)
  }

  // Collect recent history (last 10 messages) for context
  const { data: history, error: historyErr } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(10);
  if (historyErr) throw new ChatServiceError('Failed to load history', 500, historyErr.message);

  const modelName = opts.model || DEFAULT_GEMINI_MODEL;
  const model = geminiClient.getGenerativeModel({ model: modelName });

  // Prepare prompt parts: oldest to newest
  const ordered = [...(history || [])].reverse();
  const parts = ordered.map(m => `${m.role.toUpperCase()}: ${m.content}`);
  parts.push(`USER: ${opts.prompt}`);

  let assistantText: string | undefined;
  try {
    const result = await model.generateContent(parts.join('\n'));
    assistantText = result.response.text();
  } catch (e: any) {
    // Still return user message (assistant optional)
    throw new ChatServiceError('AI generation failed', 502, e?.message);
  }

  let assistantMessageId: string | undefined;
  if (assistantText) {
    assistantMessageId = await insertMessage(conversationId, 'assistant', assistantText, null, { model: modelName });
  }

  return { conversationId, userMessageId, assistantMessageId, assistantContent: assistantText, modelUsed: modelName };
}

