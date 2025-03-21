import React, { useState } from 'react';
import { ChatMessage, DocumentAttachment, QuickReply, TrackingVisualization, CustomerAgentData, WhatsAppAlertData } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import QuickReplies from './QuickReplies';
import dynamic from 'next/dynamic';

// Dynamic import for ShipmentTracker to avoid server-side rendering issues
const ShipmentTracker = dynamic(() => import('./tracking/ShipmentTracker'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-blue-100 rounded-lg h-48 w-full"></div>
});

// Dynamic import for WhatsAppAlertModal
const WhatsAppAlertModal = dynamic(() => import('./WhatsAppAlertModal'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-green-100 rounded-lg h-48 w-full"></div>
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
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const isUser = message.role === 'user';
  
  // Clean any quickReplies format from the message content
  const cleanedContent = React.useMemo(() => {
    if (message.role === 'assistant' && typeof message.content === 'string') {
      const quickRepliesRegex = /\[quickReplies:\s*(.*?)\]/i;
      return message.content.replace(quickRepliesRegex, '').trim();
    }
    return message.content;
  }, [message.content, message.role]);
  
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
  
  // Get the WhatsApp Alert data if present
  const hasWhatsAppAlert = message.role === 'assistant' && message.whatsAppAlertData;
  
  // Check for tracking visualization
  const hasTracking = message.role === 'assistant' && message.trackingVisualization;
  
  // Check for customer agent info
  const hasCustomerAgent = message.role === 'assistant' && message.customerAgentData;
  
  // Check for document attachments
  const hasAttachments = message.attachments && message.attachments.length > 0;
  
  // Check for quick replies
  const hasQuickReplies = message.role === 'assistant' && message.quickReplies && message.quickReplies.length > 0;

  // Effect to show WhatsApp Modal automatically when the message with WhatsApp data arrives
  React.useEffect(() => {
    if (hasWhatsAppAlert) {
      setShowWhatsAppModal(true);
    }
  }, [hasWhatsAppAlert]);
  
  // WhatsApp Alert Modal
  if (hasWhatsAppAlert && showWhatsAppModal) {
    return (
      <>
        <div className={containerStyles}>
          {/* Message bubble */}
          <div className={`px-4 py-3 rounded-lg max-w-[80%] shadow-sm ${isUser ? themeStyles.user[theme] : themeStyles.assistant[theme]}`}>
            {/* Message content */}
            <div className="prose prose-sm" style={{ maxWidth: '100%' }}>
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                  a: ({ node, ...props }) => <a className={`underline ${isUser ? 'text-blue-100' : theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} {...props} target="_blank" rel="noopener noreferrer" />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
                  li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-base font-semibold my-2" {...props} />,
                  h4: ({ node, ...props }) => <h4 className="text-sm font-semibold my-1" {...props} />,
                  code: ({ node, ...props }) => <code className={`px-1 py-0.5 rounded ${isUser ? 'bg-blue-600 text-blue-50' : theme === 'dark' ? 'bg-gray-600 text-gray-100' : 'bg-gray-200 text-gray-800'}`} {...props} />,
                  pre: ({ node, ...props }) => <pre className={`p-2 rounded overflow-auto my-2 ${isUser ? 'bg-blue-600 text-blue-50' : theme === 'dark' ? 'bg-gray-600 text-gray-100' : 'bg-gray-200 text-gray-800'}`} {...props} />
                }}
              >
                {cleanedContent as string}
              </ReactMarkdown>
            </div>
            
            {/* Tracking visualization if available */}
            {hasTracking && message.trackingVisualization && (
              <div className="mt-3 animate-fadeIn">
                <ShipmentTracker data={message.trackingVisualization} theme={theme} />
              </div>
            )}
            
            {/* Customer agent contact info if available */}
            {hasCustomerAgent && message.customerAgentData && (
              <CustomerAgent data={message.customerAgentData} theme={theme} />
            )}
            
            {/* Document attachments if available */}
            {hasAttachments && message.attachments && (
              <div className={`mt-3 ${isUser ? 'border-t border-blue-500/30' : 'border-t border-gray-300/30'} pt-2 animate-fadeIn`}>
                <p className={`text-xs mb-2 ${isUser ? 'text-blue-200' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Documentos adjuntos:
                </p>
                {message.attachments.map((doc, idx) => (
                  <div key={doc.id} className="animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <DocumentPreview document={doc} theme={theme} />
                  </div>
                ))}
              </div>
            )}
            
            {/* Quick replies are hidden when WhatsApp modal is shown */}
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs ml-2 self-end ${themeStyles.time[theme]}`}>
            {formattedTime}
          </div>
        </div>
        
        {/* WhatsApp Alert Modal */}
        <WhatsAppAlertModal 
          data={message.whatsAppAlertData!} 
          theme={theme} 
          onClose={() => setShowWhatsAppModal(false)} 
        />
      </>
    );
  }
  
  return (
    <div className={containerStyles}>
      {/* Message bubble */}
      <div className={`px-4 py-3 rounded-lg max-w-[80%] shadow-sm ${isUser ? themeStyles.user[theme] : themeStyles.assistant[theme]}`}>
        {/* Message content */}
        <div className="prose prose-sm" style={{ maxWidth: '100%' }}>
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
              a: ({ node, ...props }) => <a className={`underline ${isUser ? 'text-blue-100' : theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} {...props} target="_blank" rel="noopener noreferrer" />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-base font-semibold my-2" {...props} />,
              h4: ({ node, ...props }) => <h4 className="text-sm font-semibold my-1" {...props} />,
              code: ({ node, ...props }) => <code className={`px-1 py-0.5 rounded ${isUser ? 'bg-blue-600 text-blue-50' : theme === 'dark' ? 'bg-gray-600 text-gray-100' : 'bg-gray-200 text-gray-800'}`} {...props} />,
              pre: ({ node, ...props }) => <pre className={`p-2 rounded overflow-auto my-2 ${isUser ? 'bg-blue-600 text-blue-50' : theme === 'dark' ? 'bg-gray-600 text-gray-100' : 'bg-gray-200 text-gray-800'}`} {...props} />
            }}
          >
            {cleanedContent as string}
          </ReactMarkdown>
        </div>
        
        {/* Tracking visualization if available */}
        {hasTracking && message.trackingVisualization && (
          <div className="mt-3 animate-fadeIn">
            <ShipmentTracker data={message.trackingVisualization} theme={theme} />
          </div>
        )}
        
        {/* Customer agent contact info if available */}
        {hasCustomerAgent && message.customerAgentData && (
          <CustomerAgent data={message.customerAgentData} theme={theme} />
        )}
        
        {/* Document attachments if available */}
        {hasAttachments && message.attachments && (
          <div className={`mt-3 ${isUser ? 'border-t border-blue-500/30' : 'border-t border-gray-300/30'} pt-2 animate-fadeIn`}>
            <p className={`text-xs mb-2 ${isUser ? 'text-blue-200' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Documentos adjuntos:
            </p>
            {message.attachments.map((doc, idx) => (
              <div key={doc.id} className="animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                <DocumentPreview document={doc} theme={theme} />
              </div>
            ))}
          </div>
        )}
        
        {/* Quick replies if available */}
        {hasQuickReplies && message.quickReplies && onQuickReplySelect && !hasWhatsAppAlert && (
          <div className="mt-2 w-full animate-fadeIn z-10" style={{ animationDelay: '0.2s' }}>
            <QuickReplies 
              options={message.quickReplies} 
              onSelect={onQuickReplySelect} 
              theme={theme}
              variant={message.quickRepliesVariant || 'default'}
              columns={message.quickRepliesColumns || 1}
            />
          </div>
        )}
        
        {/* WhatsApp Alert Button */}
        {hasWhatsAppAlert && !showWhatsAppModal && (
          <div className="mt-2 animate-fadeIn">
            <button 
              className={`w-full py-2 px-4 rounded-md flex items-center justify-center bg-green-500 hover:bg-green-600 text-white transition-colors`}
              onClick={() => setShowWhatsAppModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Ver alertas de WhatsApp
            </button>
          </div>
        )}
      </div>
      
      {/* Timestamp */}
      <div className={`text-xs ml-2 self-end ${themeStyles.time[theme]}`}>
        {formattedTime}
      </div>
      
      {/* WhatsApp Alert Modal */}
      {hasWhatsAppAlert && showWhatsAppModal && (
        <WhatsAppAlertModal 
          data={message.whatsAppAlertData!} 
          theme={theme} 
          onClose={() => setShowWhatsAppModal(false)} 
        />
      )}
    </div>
  );
};

export default ChatBubble; 