// Types related to the chat functionality

export type MessageRole = 'user' | 'assistant' | 'system';

export interface QuickReply {
  label: string;
  value: string;
  icon?: string;
  description?: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string; // Para simulación, en un entorno real sería una URL a un servicio de almacenamiento
  content?: string; // Para simulación, en un entorno real no se incluiría el contenido en el objeto
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  attachments?: DocumentAttachment[];
  quickReplies?: QuickReply[];
  quickRepliesVariant?: 'default' | 'feature';
  quickRepliesColumns?: 1 | 2 | 3;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  attachments?: DocumentAttachment[];
} 