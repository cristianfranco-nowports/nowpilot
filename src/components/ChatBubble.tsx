import React from 'react';
import { ChatMessage, DocumentAttachment, QuickReply, TrackingVisualization, CustomerAgentData } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import QuickReplies from './QuickReplies';
import dynamic from 'next/dynamic';

// Dynamic import for ShipmentTracker to avoid server-side rendering issues
const ShipmentTracker = dynamic(() => import('./tracking/ShipmentTracker'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-blue-100 rounded-lg h-48 w-full"></div>
});

interface ChatBubbleProps {
  message: ChatMessage;
  theme?: 'light' | 'dark';
  onQuickReplySelect?: (value: string) => void;
}

const DocumentPreview: React.FC<{ document: DocumentAttachment; theme: 'light' | 'dark' }> = ({ document, theme }) => {
  const getIconByType = (type: string) => {
    if (type.includes('pdf')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (type.includes('doc')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
  };

  const themeClasses = {
    light: 'bg-white border-gray-200 text-gray-800',
    dark: 'bg-gray-700 border-gray-600 text-gray-100'
  };

  return (
    <div className={`border rounded-lg p-3 mt-2 flex items-center ${themeClasses[theme]}`}>
      <div className="mr-3 flex-shrink-0">
        {getIconByType(document.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{document.name}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{(document.size / 1024).toFixed(1)} KB</p>
      </div>
      <div className="ml-3">
        <a 
          href={document.url || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md ${
            theme === 'light' 
              ? 'text-blue-700 bg-blue-100 hover:bg-blue-200' 
              : 'text-blue-300 bg-blue-900/30 hover:bg-blue-800/50'
          } transition duration-150 ease-in-out`}
          onClick={(e) => {
            if (!document.url) {
              e.preventDefault();
              alert('En un escenario real, este enlace descargaría o abriría el documento.');
            }
          }}
        >
          Ver
        </a>
      </div>
    </div>
  );
};

const CustomerAgent: React.FC<{ data: CustomerAgentData; theme: 'light' | 'dark' }> = ({ data, theme }) => {
  const themeClasses = {
    light: 'bg-white border-gray-200 text-gray-800',
    dark: 'bg-gray-700 border-gray-600 text-gray-100'
  };

  return (
    <div className={`border rounded-lg p-4 mt-3 ${themeClasses[theme]} animate-fadeIn`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-blue-800 text-blue-200'}`}>
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt={data.name} className="h-12 w-12 rounded-full" />
            ) : (
              <span className="text-lg font-semibold">{data.name.charAt(0)}</span>
            )}
          </div>
        </div>
        <div className="ml-4">
          <h4 className="text-sm font-semibold">{data.name}</h4>
          <p className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>{data.position}</p>
          <div className="mt-2 flex space-x-3">
            <a 
              href={`tel:${data.phone}`} 
              className={`inline-flex items-center px-3 py-1 text-xs leading-4 font-medium rounded-md ${
                theme === 'light' 
                  ? 'text-green-700 bg-green-100 hover:bg-green-200' 
                  : 'text-green-300 bg-green-900/30 hover:bg-green-800/50'
              } transition duration-150 ease-in-out`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Llamar
            </a>
            <a 
              href={`https://wa.me/${data.phone.replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-flex items-center px-3 py-1 text-xs leading-4 font-medium rounded-md ${
                theme === 'light' 
                  ? 'text-blue-700 bg-blue-100 hover:bg-blue-200' 
                  : 'text-blue-300 bg-blue-900/30 hover:bg-blue-800/50'
              } transition duration-150 ease-in-out`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              WhatsApp
            </a>
            <a 
              href={`mailto:${data.email}`} 
              className={`inline-flex items-center px-3 py-1 text-xs leading-4 font-medium rounded-md ${
                theme === 'light' 
                  ? 'text-purple-700 bg-purple-100 hover:bg-purple-200' 
                  : 'text-purple-300 bg-purple-900/30 hover:bg-purple-800/50'
              } transition duration-150 ease-in-out`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, theme = 'light', onQuickReplySelect }) => {
  const isUser = message.role === 'user';
  
  // Format timestamp safely
  let formattedTime = '';
  try {
    const timestamp = Number(message.timestamp) || Date.parse(message.timestamp);
    if (!isNaN(timestamp)) {
      formattedTime = new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      formattedTime = 'Ahora';
    }
  } catch (e) {
    formattedTime = 'Ahora';
  }
  
  // Define theme styles
  const themeStyles = {
    user: {
      light: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
      dark: 'bg-gradient-to-br from-blue-600 to-blue-800 text-white'
    },
    assistant: {
      light: 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800',
      dark: 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-100'
    },
    time: {
      light: 'text-gray-600',
      dark: 'text-gray-400'
    }
  };

  // Define container styles based on sender
  const containerStyles = isUser
    ? `flex justify-end mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`
    : `flex justify-start mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`;

  // Define bubble styles based on sender and theme
  const bubbleStyles = isUser
    ? `max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2 ${themeStyles.user[theme]} shadow-md hover:shadow-lg transition-shadow duration-300`
    : `max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-2 ${themeStyles.assistant[theme]} shadow-md hover:shadow-lg transition-shadow duration-300`;

  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasQuickReplies = message.quickReplies && message.quickReplies.length > 0;
  const hasCustomerAgent = message.customerAgentData !== undefined;

  return (
    <div className={containerStyles}>
      <div className="flex flex-col">
        {/* Message sender indicator */}
        <div className={`text-xs mb-1 ${isUser ? 'text-right' : 'text-left'} ${themeStyles.time[theme]}`}>
          {isUser ? 'Tú' : 'Asistente'}
        </div>
        
        {/* Message bubble */}
        <div className={bubbleStyles}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown text-sm">
              <ReactMarkdown 
                components={{
                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props as React.HTMLAttributes<HTMLParagraphElement>} />,
                  ul: ({ node, ...props }) => <ul className="mb-2 list-disc pl-4" {...props as React.HTMLAttributes<HTMLUListElement>} />,
                  ol: ({ node, ...props }) => <ol className="mb-2 list-decimal pl-4" {...props as React.OlHTMLAttributes<HTMLOListElement>} />,
                  li: ({ node, ...props }) => <li className="mb-1" {...props as React.LiHTMLAttributes<HTMLLIElement>} />,
                  a: ({ node, ...props }) => (
                    <a 
                      className={`underline ${theme === 'dark' ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-800'} transition-colors duration-200`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      {...props as React.AnchorHTMLAttributes<HTMLAnchorElement>} 
                    />
                  ),
                  strong: ({ node, ...props }) => <strong className="font-bold" {...props as React.HTMLAttributes<HTMLElement>} />,
                  h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props as React.HTMLAttributes<HTMLHeadingElement>} />,
                  h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2" {...props as React.HTMLAttributes<HTMLHeadingElement>} />,
                  h3: ({ node, ...props }) => <h3 className="text-md font-bold mb-2" {...props as React.HTMLAttributes<HTMLHeadingElement>} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote 
                      className={`border-l-4 ${theme === 'dark' ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'} pl-4 py-1 my-2 animate-fadeLeft`} 
                      {...props as React.BlockquoteHTMLAttributes<HTMLQuoteElement>} 
                    />
                  ),
                  code: ({ node, className, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !className || !match;
                    
                    return isInline 
                      ? <code className={`px-1 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} transition-colors duration-200`} {...props as React.HTMLAttributes<HTMLElement>} />
                      : <code className={`block p-2 my-2 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'} overflow-x-auto ${className} transition-colors duration-200`} {...props as React.HTMLAttributes<HTMLElement>} />
                  },
                  pre: ({ node, ...props }) => <pre className="my-2 animate-fadeIn" {...props as React.HTMLAttributes<HTMLPreElement>} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          
          {/* Customer Agent Information */}
          {hasCustomerAgent && message.customerAgentData && (
            <CustomerAgent data={message.customerAgentData} theme={theme} />
          )}
          
          {/* Tracking visualization */}
          {message.trackingVisualization && (
            <div className="mt-4 animate-fadeIn">
              <ShipmentTracker data={message.trackingVisualization} />
            </div>
          )}
          
          {/* Documentos adjuntos */}
          {hasAttachments && (
            <div className={`mt-3 ${isUser ? 'border-t border-blue-500/30' : 'border-t border-gray-300/30'} pt-2 animate-fadeIn`}>
              <p className={`text-xs mb-2 ${isUser ? 'text-blue-200' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Documentos adjuntos:
              </p>
              {message.attachments?.map((doc, idx) => (
                <div key={doc.id} className="animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <DocumentPreview document={doc} theme={theme} />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Quick Replies */}
        {hasQuickReplies && onQuickReplySelect && (
          <div className="mt-2 w-full animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <QuickReplies 
              options={message.quickReplies || []} 
              onSelect={onQuickReplySelect} 
              theme={theme}
              variant={message.quickRepliesVariant || 'default'}
              columns={message.quickRepliesColumns || 1}
            />
          </div>
        )}
        
        {/* Timestamp */}
        <div className={`text-xs mt-1 ${isUser ? 'text-right' : 'text-left'} ${themeStyles.time[theme]}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble; 