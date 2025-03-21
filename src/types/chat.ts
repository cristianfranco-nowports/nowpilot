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

export interface CustomerAgentData {
  name: string;
  position: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export interface WhatsAppAlertData {
  title: string;
  phone: string;
  message: string;
  previewImage?: string;
  notificationType: 'status' | 'arrival' | 'delay' | 'documents';
  shipmentId: string;
}

export interface TrackingMilestone {
  name: string;
  date: string;
  status: 'completed' | 'inProgress' | 'upcoming';
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
}

export interface TrackingVisualization {
  shipmentId: string;
  origin: {
    lat: number;
    lng: number;
    name: string;
  };
  destination: {
    lat: number;
    lng: number;
    name: string;
  };
  currentLocation: {
    lat: number;
    lng: number;
    name: string;
  };
  estimatedArrival: string;
  milestones: TrackingMilestone[];
  carrier: string;
  vesselName?: string;
  containerNumbers?: string[];
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
  trackingVisualization?: TrackingVisualization;
  customerAgentData?: CustomerAgentData;
  whatsAppAlertData?: WhatsAppAlertData;
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