import React from 'react';
import { QuickReply } from '../types/chat';

interface QuickRepliesProps {
  options: QuickReply[];
  onSelect: (value: string) => void;
  theme?: 'light' | 'dark';
  variant?: 'default' | 'feature';
  columns?: 1 | 2 | 3;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({ 
  options, 
  onSelect, 
  theme = 'light',
  variant = 'default',
  columns = 1
}) => {
  if (!options || options.length === 0) {
    return null;
  }
  
  const getColumnClass = () => {
    switch (columns) {
      case 1:
        return '';
      case 2:
        return 'grid grid-cols-1 sm:grid-cols-2 gap-2';
      case 3:
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2';
      default:
        return '';
    }
  };
  
  // Para el variante 'feature' usamos un grid especial
  if (variant === 'feature') {
    return (
      <div className={`${getColumnClass()} relative z-20`}>
        {options.map((option, index) => (
          <button
            key={index}
            className={`mb-2 ${columns > 1 ? '' : 'mr-2'} px-4 py-3 rounded-lg transition-colors duration-200 group ${
              theme === 'light'
                ? 'bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 shadow-sm'
                : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => onSelect(option.value)}
          >
            <div className="flex items-center">
              {option.icon && (
                <span className="text-xl mr-3">{option.icon}</span>
              )}
              <div className="text-left">
                <div className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>{option.label}</div>
                {option.description && (
                  <div className={`text-xs mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{option.description}</div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  // Variant default (botones de texto simple)
  return (
    <div className={`flex flex-wrap relative z-20`}>
      {options.map((option, index) => (
        <button
          key={index}
          className={`mb-2 mr-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
            theme === 'light'
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600'
          }`}
          onClick={() => onSelect(option.value)}
        >
          <div className="flex items-center">
            {option.icon && (
              <span className="mr-2">{option.icon}</span>
            )}
            <span>{option.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default QuickReplies; 