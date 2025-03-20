// Types related to the chat functionality

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
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
} 