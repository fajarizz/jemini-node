import { supabase } from '../config/supabase.js';
import { geminiClient, DEFAULT_GEMINI_MODEL } from '../config/gemini.js';

export interface ChatRequestOptions {
  userId: string;
  prompt: string;
  conversationId?: string;
  title?: string;
  model?: string;
  system?: string;
}

export interface ChatResponseData {
  conversationId: string;
  userMessageId: string;
  assistantMessageId?: string;
  assistantContent?: string;
  modelUsed?: string;
  aiUnavailable?: boolean;
  metadata?: any;
}

export class ChatServiceError extends Error {
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
    const { data, error } = await supabase
      .from('conversations')
      .select('id, created_by')
      .eq('id', conversationId)
      .single();
    if (error || !data) throw new ChatServiceError('Conversation not found', 404);
    if (data.created_by !== userId) throw new ChatServiceError('Forbidden', 403);
    return data.id as string;
  }
  const convTitle = title || 'Chat: ' + new Date().toISOString().substring(0, 10);
  const { data, error } = await supabase
    .from('conversations')
    .insert({ title: convTitle, created_by: userId })
    .select('id')
    .single();
  if (error || !data) throw new ChatServiceError('Failed to create conversation', 500, error?.message);
  return data.id as string;
}

async function insertMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system' | 'tool',
  content: string,
  senderId: string | null,
  metadata: any = {}
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content, sender_id: senderId, metadata })
    .select('id')
    .single();
  if (error || !data) throw new ChatServiceError('Failed to insert message', 500, error?.message);
  return data.id as string;
}

export async function chatWithGemini(opts: ChatRequestOptions): Promise<ChatResponseData> {
  if (!opts.prompt?.trim()) throw new ChatServiceError('Prompt required', 400);

  const conversationId = await ensureConversation(opts.conversationId, opts.userId, opts.title);

  const userMessageId = await insertMessage(conversationId, 'user', opts.prompt, opts.userId);

  if (!geminiClient) {
    console.warn('[chat] Gemini client unavailable (missing GEMINI_API_KEY?)');
    return { conversationId, userMessageId, aiUnavailable: true };
  }

  const { data: msgRows, error: msgErr } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(20);
  if (msgErr) throw new ChatServiceError('Failed to load history', 500, msgErr.message);

  const modelName = opts.model || DEFAULT_GEMINI_MODEL;
  const model = geminiClient.getGenerativeModel({ model: modelName });

  const parts = ((msgRows as any[]) || []).map((m: any) => `${String(m.role).toUpperCase()}: ${m.content}`);
  parts.push(`USER: ${opts.prompt}`);

  let assistantText = '';
  const metadata: any = { model: modelName };
  let assistantMessageId: string | undefined;

  try {
    const result = await model.generateContent(parts.join('\n'));
    const text = result.response?.text?.() as string | undefined;
    assistantText = (text || '').trim();

    const candidates: any[] | undefined = (result as any)?.response?.candidates;
    const first = candidates?.[0];
    metadata.finishReason = first?.finishReason;
    metadata.safety = first?.safetyRatings;

    if (!assistantText) {
      assistantText = '[No content returned by model]' + (first?.finishReason ? ` (finishReason: ${first.finishReason})` : '');
      console.warn('[chat] Empty assistant text from Gemini', { finishReason: first?.finishReason, safety: first?.safetyRatings });
    }

    assistantMessageId = await insertMessage(conversationId, 'assistant', assistantText, null, { model: modelName, ...metadata });
  } catch (e: any) {
    console.error('[chat] Gemini generation error', e);
    throw new ChatServiceError('AI generation failed', 502, e?.message);
  }

  return {
    conversationId,
    userMessageId,
    assistantMessageId,
    assistantContent: assistantText,
    modelUsed: modelName,
    metadata,
  };
}
