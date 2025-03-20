import React from 'react';
import { ChatMessage, DocumentAttachment } from '../types/chat';
import ReactMarkdown from 'react-markdown';

interface ChatBubbleProps {
  message: ChatMessage;
  theme?: 'light' | 'dark';
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

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, theme = 'light' }) => {
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
      light: 'bg-blue-600 text-white',
      dark: 'bg-blue-700 text-white'
    },
    assistant: {
      light: 'bg-gray-100 text-gray-800',
      dark: 'bg-gray-800 text-gray-100'
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
    ? `max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2 ${themeStyles.user[theme]} shadow-sm`
    : `max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-2 ${themeStyles.assistant[theme]} shadow-sm`;

  const hasAttachments = message.attachments && message.attachments.length > 0;

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
                      className={`underline ${theme === 'dark' ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-800'}`} 
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
                      className={`border-l-4 ${theme === 'dark' ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'} pl-4 py-1 my-2`} 
                      {...props as React.BlockquoteHTMLAttributes<HTMLQuoteElement>} 
                    />
                  ),
                  code: ({ node, className, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !className || !match;
                    
                    return isInline 
                      ? <code className={`px-1 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} {...props as React.HTMLAttributes<HTMLElement>} />
                      : <code className={`block p-2 my-2 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'} overflow-x-auto ${className}`} {...props as React.HTMLAttributes<HTMLElement>} />
                  },
                  pre: ({ node, ...props }) => <pre className="my-2" {...props as React.HTMLAttributes<HTMLPreElement>} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          
          {/* Documentos adjuntos */}
          {hasAttachments && (
            <div className={`mt-3 ${isUser ? 'border-t border-blue-500' : 'border-t border-gray-300'} pt-2`}>
              <p className={`text-xs mb-2 ${isUser ? 'text-blue-200' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Documentos adjuntos:
              </p>
              {message.attachments?.map((doc) => (
                <DocumentPreview key={doc.id} document={doc} theme={theme} />
              ))}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs mt-1 ${isUser ? 'text-right' : 'text-left'} ${themeStyles.time[theme]}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble; 