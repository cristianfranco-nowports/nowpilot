// Types related to the chat functionality

export type MessageRole = 'user' | 'assistant' | 'system';

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
}

export interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sessionId: string | null;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  attachments?: DocumentAttachment[];
} 