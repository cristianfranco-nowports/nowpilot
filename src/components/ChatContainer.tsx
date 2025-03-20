import React, { useState, useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import QuickReplies from './QuickReplies';
import { ChatMessage, ChatState } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';

interface ChatContainerProps {
  theme?: 'light' | 'dark';
}

interface QuickReplyOption {
  label: string;
  value: string;
  icon?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ theme = 'light' }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    loading: false,
    error: null,
    sessionId: null,
  });
  const [quickReplyOptions, setQuickReplyOptions] = useState<QuickReplyOption[]>([]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatState.messages, quickReplyOptions]);

  // Add a welcome message when the component mounts
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome-msg',
      content: 'Hello! I\'m the Nowports sales assistant. How can I help you with your logistics needs today?',
      role: 'assistant',
      timestamp: Date.now().toString(),
    };
    
    setChatState((prev) => ({
      ...prev,
      messages: [welcomeMessage],
    }));

    // Set initial quick reply options
    setQuickReplyOptions([
      { label: 'Transporte internacional', value: 'Quiero información sobre opciones de transporte internacional', icon: '🚢' },
      { label: 'Tarifas', value: 'Necesito conocer tarifas para envíos', icon: '💰' },
      { label: 'Rutas disponibles', value: 'Qué rutas tienen disponibles', icon: '🗺️' },
      { label: 'Financiamiento', value: 'Opciones de financiamiento para importaciones', icon: '💼' },
    ]);
  }, []);

  // Extraer opciones de respuesta rápida del mensaje del asistente
  const extractQuickReplyOptions = (content: string): QuickReplyOption[] => {
    // Buscar listas de opciones
    const transportRegex = /(?:transporte|transportes)(?:\s\w+)?:\s*¿([^?]+)\?/i;
    const tarifasRegex = /(?:tarifa|tarifas)(?:\s\w+)?:\s*¿([^?]+)\?/i;
    const rutasRegex = /(?:ruta|rutas)(?:\s\w+)?:\s*¿([^?]+)\?/i;
    const financiamientoRegex = /(?:financiamiento)(?:\s\w+)?:\s*¿([^?]+)\?/i;

    const options: QuickReplyOption[] = [];
    
    // Transporte
    const transportMatch = content.match(transportRegex);
    if (transportMatch && transportMatch[1]) {
      if (transportMatch[1].includes('marítimas') || transportMatch[1].includes('marítimo')) {
        options.push({ label: 'Marítimo', value: 'Quiero información sobre transporte marítimo', icon: '🚢' });
      }
      if (transportMatch[1].includes('aéreas') || transportMatch[1].includes('aéreo')) {
        options.push({ label: 'Aéreo', value: 'Quiero información sobre transporte aéreo', icon: '✈️' });
      }
      if (transportMatch[1].includes('terrestres') || transportMatch[1].includes('terrestre')) {
        options.push({ label: 'Terrestre', value: 'Quiero información sobre transporte terrestre', icon: '🚚' });
      }
    }

    // Tarifas
    const tarifasMatch = content.match(tarifasRegex);
    if (tarifasMatch && tarifasMatch[1]) {
      options.push({ label: 'Ver tarifas', value: 'Quiero conocer las tarifas disponibles', icon: '💰' });
    }

    // Rutas
    const rutasMatch = content.match(rutasRegex);
    if (rutasMatch && rutasMatch[1]) {
      options.push({ label: 'Ver rutas', value: 'Muéstrame las rutas disponibles', icon: '🗺️' });
    }

    // Financiamiento
    const financiamientoMatch = content.match(financiamientoRegex);
    if (financiamientoMatch && financiamientoMatch[1]) {
      options.push({ label: 'Financiamiento', value: 'Cuéntame sobre opciones de financiamiento', icon: '💼' });
    }

    // Si no encontramos opciones específicas pero hay menciones generales
    if (options.length === 0) {
      if (content.includes('transporte') || content.includes('transportes')) {
        options.push({ label: 'Transporte', value: 'Quiero información sobre opciones de transporte', icon: '🚢' });
      }
      if (content.includes('tarifa') || content.includes('tarifas') || content.includes('costo') || content.includes('costos')) {
        options.push({ label: 'Tarifas', value: 'Quiero conocer las tarifas', icon: '💰' });
      }
      if (content.includes('ruta') || content.includes('rutas')) {
        options.push({ label: 'Rutas', value: 'Muéstrame las rutas', icon: '🗺️' });
      }
      if (content.includes('financiamiento') || content.includes('financiar')) {
        options.push({ label: 'Financiamiento', value: 'Opciones de financiamiento', icon: '💼' });
      }
    }

    return options;
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Crear un nuevo mensaje del usuario
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: Date.now().toString(),
    };

    // Limpiar opciones de respuesta rápida cuando el usuario envía un mensaje
    setQuickReplyOptions([]);

    // Actualizar el estado del chat con el mensaje del usuario y mostrar carga
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      loading: true,
      error: null,
    }));

    try {
      console.log('Sending message to API:', content);
      
      // Enviar el mensaje a la API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId: chatState.sessionId,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API error:', errorData);
        throw new Error(`API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Received response:', data);

      // Crear mensaje del asistente desde la respuesta
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: data.response,
        role: 'assistant',
        timestamp: Date.now().toString(),
      };

      // Actualizar el estado del chat con la respuesta del asistente
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        loading: false,
        sessionId: data.sessionId,
      }));

      // Extraer y configurar opciones de respuesta rápida
      const options = extractQuickReplyOptions(data.response);
      setQuickReplyOptions(options);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to get response. Please try again. Error: ' + (error instanceof Error ? error.message : String(error)),
      }));
    }
  };

  // Manejar la selección de una respuesta rápida
  const handleQuickReplySelect = (value: string) => {
    handleSendMessage(value);
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} p-4 rounded-t-lg shadow`}>
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Nowports Sales Assistant</h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Ask me about logistics, shipping routes, and how Nowports can help your business
        </p>
      </div>
      
      <div 
        ref={chatContainerRef}
        className={`flex-1 p-4 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      >
        {chatState.messages.map((message) => (
          <ChatBubble key={message.id} message={message} theme={theme} />
        ))}
        
        {quickReplyOptions.length > 0 && !chatState.loading && (
          <QuickReplies 
            options={quickReplyOptions} 
            onSelect={handleQuickReplySelect} 
            theme={theme} 
          />
        )}
        
        {chatState.loading && (
          <div className={`flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} ml-2 mt-2`}>
            <div className="loading-dots flex space-x-1">
              <div className={`w-2 h-2 ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-400'} rounded-full animate-bounce delay-75`}></div>
              <div className={`w-2 h-2 ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-400'} rounded-full animate-bounce delay-100`}></div>
              <div className={`w-2 h-2 ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-400'} rounded-full animate-bounce delay-150`}></div>
            </div>
          </div>
        )}

        {chatState.error && (
          <div className={`text-red-500 text-sm my-2 p-2 ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'} rounded`}>
            {chatState.error}
          </div>
        )}
      </div>
      
      <div className={`p-4 ${theme === 'dark' ? 'border-t border-gray-700' : 'border-t'}`}>
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={chatState.loading} 
          theme={theme}
        />
      </div>
    </div>
  );
};

export default ChatContainer; 