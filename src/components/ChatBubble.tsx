import React from 'react';
import { ChatMessage } from '../types/chat';
import ReactMarkdown from 'react-markdown';

interface ChatBubbleProps {
  message: ChatMessage;
  theme?: 'light' | 'dark';
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, theme = 'light' }) => {
  const isUser = message.role === 'user';
  
  // Format timestamp
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  
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
                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                  ul: ({ node, ...props }) => <ul className="mb-2 list-disc pl-4" {...props} />,
                  ol: ({ node, ...props }) => <ol className="mb-2 list-decimal pl-4" {...props} />,
                  li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                  a: ({ node, ...props }) => (
                    <a 
                      className={`underline ${theme === 'dark' ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-800'}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      {...props} 
                    />
                  ),
                  strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                  h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-md font-bold mb-2" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote 
                      className={`border-l-4 ${theme === 'dark' ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'} pl-4 py-1 my-2`} 
                      {...props} 
                    />
                  ),
                  code: ({ node, className, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !className || !match;
                    
                    return isInline 
                      ? <code className={`px-1 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} {...props} />
                      : <code className={`block p-2 my-2 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'} overflow-x-auto ${className}`} {...props} />
                  },
                  pre: ({ node, ...props }) => <pre className="my-2" {...props} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
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