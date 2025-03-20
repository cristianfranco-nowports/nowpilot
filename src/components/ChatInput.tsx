import React, { useState, useRef, useEffect } from 'react';
import { DocumentAttachment } from '../types/chat';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendDocument?: (document: File) => void;
  isLoading?: boolean;
  disabled?: boolean;
  theme?: 'light' | 'dark';
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  onSendDocument,
  isLoading = false, 
  disabled = false,
  theme = 'light'
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    } else if (selectedFile && onSendDocument) {
      onSendDocument(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    },
    filePreview: {
      light: 'bg-blue-50 text-blue-700 border-blue-200',
      dark: 'bg-blue-900/30 text-blue-300 border-blue-800'
    }
  };

  const isDisabled = (isLoading || disabled) && !selectedFile;

  return (
    <div className={`${themeStyles.container[theme]}`}>
      {selectedFile && (
        <div className={`flex items-center justify-between p-2 mb-2 rounded-lg ${themeStyles.filePreview[theme]} border`}>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span className="text-sm truncate max-w-xs">{selectedFile.name}</span>
            <span className="text-xs ml-2">{(selectedFile.size / 1024).toFixed(1)} KB</span>
          </div>
          <button 
            type="button" 
            onClick={clearSelectedFile}
            className="text-sm ml-2 hover:text-red-500"
            aria-label="Eliminar archivo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={`flex items-end space-x-2`}>
        {/* Oculto input de archivo */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        />
        
        <button
          type="button"
          onClick={handleAttachClick}
          className={`p-2 rounded-lg ${theme === 'light' ? 'text-gray-500 hover:text-blue-600 hover:bg-gray-100' : 'text-gray-400 hover:text-blue-400 hover:bg-gray-800'}`}
          aria-label="Adjuntar archivo"
          disabled={isLoading || disabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        
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
          disabled={(!message.trim() && !selectedFile) || isDisabled}
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
    </div>
  );
};

export default ChatInput; 