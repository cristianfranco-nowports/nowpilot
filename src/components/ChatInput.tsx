import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  theme?: 'light' | 'dark';
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading = false, 
  disabled = false,
  theme = 'light'
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Auto-resize the textarea based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message);
      setMessage('');
      
      // Reset height after sending
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const themeStyles = {
    container: {
      light: 'bg-white',
      dark: 'bg-gray-900',
    },
    input: {
      light: 'bg-gray-100 border-gray-200 placeholder-gray-500 text-gray-800 focus:border-blue-500',
      dark: 'bg-gray-800 border-gray-700 placeholder-gray-400 text-white focus:border-blue-400'
    },
    button: {
      light: 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400',
      dark: 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-500/50'
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-end space-x-2 ${themeStyles.container[theme]}`}>
      <div className={`relative flex-1 ${isFocused ? 'z-10' : ''}`}>
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full resize-none py-2 px-3 rounded-lg border ${themeStyles.input[theme]} transition-colors duration-200 outline-none overflow-auto`}
          placeholder="Escribe tu mensaje..."
          rows={1}
          disabled={isLoading || disabled}
          style={{ maxHeight: '120px' }}
        />
        {message.length > 0 && (
          <div className={`absolute right-2 bottom-2 text-xs ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
            {message.length} / 1000
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={!message.trim() || isLoading || disabled}
        className={`${themeStyles.button[theme]} px-3 py-2 rounded-lg flex-shrink-0 transition-colors duration-200 disabled:cursor-not-allowed`}
        aria-label="Enviar mensaje"
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </form>
  );
};

export default ChatInput; 