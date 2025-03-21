import React, { useState, useRef, useEffect } from 'react';
import { DocumentAttachment } from '../types/chat';
import { useTranslation } from 'next-i18next';

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
  const { t } = useTranslation('common');
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
    
    // Trim message to remove trailing whitespace
    const trimmedMessage = message.trim();
    
    // Handle document submission regardless of message content
    if (selectedFile && onSendDocument) {
      onSendDocument(selectedFile);
      setSelectedFile(null);
    }
    
    // Handle message submission
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
    
    // Reset input height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };
  
  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Handle Enter key to submit, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !disabled && (message.trim() || selectedFile)) {
        handleSubmit(e);
      }
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
  const canSend = (message.trim() || selectedFile) && !isLoading && !disabled;

  return (
    <div className={`${themeStyles.container[theme]} rounded-b-lg shadow-sm`}>
      {selectedFile && (
        <div className={`${themeStyles.filePreview[theme]} rounded-lg p-2 mb-2 flex items-center border`}>
          <div className="flex-1 min-w-0">
            <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`}>
              {selectedFile.name}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-500'}`}>
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <button 
            type="button" 
            onClick={handleRemoveFile}
            className={`ml-2 p-1 rounded-full ${theme === 'dark' ? 'bg-gray-500 text-gray-200 hover:bg-gray-400' : 'bg-blue-100 text-blue-500 hover:bg-blue-200'}`}
            aria-label="Remove file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={`flex items-end space-x-2 p-2`}>
        <button
          type="button"
          onClick={handleFileClick}
          className={`${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600'} p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
          disabled={isLoading || disabled}
          title={t('uploadDoc')}
          aria-label="Attach file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
          />
        </button>
        
        <div className={`flex-1 relative ${isFocused ? (theme === 'dark' ? 'ring-2 ring-blue-500' : 'ring-2 ring-blue-400') : ''}`}>
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('type')}
            rows={1}
            className={`block w-full py-3 px-4 resize-none ${theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200'} rounded-2xl border focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all`}
            disabled={isLoading || disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>
        
        <button
          type="submit"
          className={`p-3 rounded-full ${
            canSend 
              ? `${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white` 
              : `${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`
          } ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''} 
          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
          disabled={!canSend}
          title={t('send')}
          aria-label="Send message"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput; 