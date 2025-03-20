import React, { useState, useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { ChatMessage, ChatState } from '../types/chat';

interface ChatWidgetProps {
  initialMessage?: string;
  title?: string;
  subtitle?: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark';
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  initialMessage = "¡Hola! Soy el asistente de Nowports. ¿En qué puedo ayudarte hoy?",
  title = "Nowports Assistant",
  subtitle = "Pregúntame sobre logística y envíos",
  position = 'bottom-right',
  theme = 'light',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    loading: false,
    error: null,
    sessionId: Math.random().toString(36).substring(2, 15)
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showingInitialMessage, setShowingInitialMessage] = useState(false);
  const [showMessageIndicator, setShowMessageIndicator] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isButtonAnimated, setIsButtonAnimated] = useState(false);

  // Animate button initially
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsButtonAnimated(true);
      
      // Show the new message indicator
      setTimeout(() => {
        setShowMessageIndicator(true);
      }, 1000);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Add welcome message after widget is opened for the first time
  useEffect(() => {
    if (isOpen && !showingInitialMessage && chatState.messages.length === 0) {
      setShowingInitialMessage(true);
      
      // Delay the welcome message for a more natural feel
      setTimeout(() => {
        const welcomeMessage: ChatMessage = {
          id: '1',
          role: 'assistant',
          content: initialMessage,
          timestamp: new Date().toISOString()
        };
        
        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, welcomeMessage]
        }));
      }, 800);
    }
  }, [isOpen, showingInitialMessage, initialMessage, chatState.messages.length]);

  useEffect(() => {
    // Scroll to bottom of messages
    if (messagesEndRef.current && chatState.messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatState.messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsButtonAnimated(false);
      setShowMessageIndicator(false);
    }
  };

  const expandWidget = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      loading: true
    }));
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: chatState.sessionId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al comunicarse con el asistente');
      }
      
      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };
      
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        loading: false
      }));
      
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        loading: false,
        error: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.'
      }));
    }
  };

  // Determine the position styles based on the position prop
  const positionStyles = {
    'bottom-right': 'right-5 bottom-5',
    'bottom-left': 'left-5 bottom-5'
  };
  
  // Determine theme styles
  const themeStyles = {
    button: {
      light: 'bg-blue-600 hover:bg-blue-700',
      dark: 'bg-blue-700 hover:bg-blue-800'
    },
    header: {
      light: 'bg-blue-600 text-white',
      dark: 'bg-gray-800 text-white'
    },
    container: {
      light: 'bg-white border-gray-200 text-gray-800',
      dark: 'bg-gray-900 border-gray-700 text-white'
    },
    input: {
      light: 'bg-gray-100 border-gray-300 focus:border-blue-500',
      dark: 'bg-gray-800 border-gray-600 text-white focus:border-blue-400'
    }
  };

  return (
    <div className={`fixed z-50 ${positionStyles[position]}`}>
      {/* Chat button (visible when chat is closed) */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className={`${themeStyles.button[theme]} text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center 
                     transform transition-all duration-300 hover:scale-110 ${isButtonAnimated ? 'animate-bounce' : ''}`}
          aria-label="Abrir chat"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          
          {/* New message indicator */}
          {showMessageIndicator && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full animate-ping"></span>
          )}
        </button>
      )}

      {/* Chat container (visible when chat is open) */}
      {isOpen && (
        <div 
          className={`
            ${themeStyles.container[theme]} rounded-lg shadow-2xl border overflow-hidden 
            flex flex-col transform transition-all duration-300 ease-in-out
            ${isExpanded ? 'w-96 h-[32rem]' : 'w-80 h-96'}
            animate-slideIn
          `}
          style={{ maxHeight: 'calc(100vh - 40px)' }}
        >
          {/* Chat header */}
          <div className={`${themeStyles.header[theme]} p-4 flex justify-between items-center`}>
            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="text-sm opacity-90">{subtitle}</p>
            </div>
            <div className="flex items-center space-x-1.5">
              <button 
                onClick={expandWidget}
                className="text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label={isExpanded ? "Reducir" : "Expandir"}
              >
                {isExpanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <button 
                onClick={toggleChat}
                className="text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Cerrar chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages container */}
          <div className={`flex-1 p-4 overflow-y-auto ${theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'}`}>
            {chatState.messages.length === 0 && !showingInitialMessage && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  ¡Envía un mensaje para iniciar la conversación!
                </p>
              </div>
            )}
            
            {chatState.messages.map((message, index) => (
              <div 
                key={message.id} 
                className={`animate-message mb-4 ${index === chatState.messages.length - 1 ? 'fade-in' : ''}`}
              >
                <ChatBubble 
                  message={message} 
                  theme={theme}
                />
              </div>
            ))}
            
            {/* Loading indicator */}
            {chatState.loading && (
              <div className="flex space-x-2 p-3 max-w-[80%] rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
                <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce"></div>
                <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
            
            {/* Error message */}
            {chatState.error && (
              <div className="p-3 text-red-500 text-sm bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-lg mt-2 mb-2">
                {chatState.error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <ChatInput 
              onSendMessage={handleSendMessage} 
              isLoading={chatState.loading}
              theme={theme}
            />
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx global>{`
        .scrollbar-light::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-light::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }
        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: #999;
        }
        
        .scrollbar-dark::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-dark::-webkit-scrollbar-track {
          background: #2d3748;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 3px;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-message {
          transition: all 0.3s ease;
          transition-delay: 0.1s;
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ChatWidget; 