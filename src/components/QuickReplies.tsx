import React from 'react';

interface QuickReplyOption {
  label: string;
  value: string;
  icon?: string;
  description?: string;
}

interface QuickRepliesProps {
  options: QuickReplyOption[];
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

  const themeClasses = {
    container: {
      light: 'bg-white',
      dark: 'bg-gray-800'
    },
    button: {
      light: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200',
      dark: 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
    },
    featureCard: {
      light: 'bg-white hover:bg-blue-50 text-gray-800 border-gray-200 shadow-sm hover:border-blue-300',
      dark: 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600 hover:border-blue-400'
    }
  };

  const getGridClasses = () => {
    switch(columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-3';
      default: return 'grid-cols-1';
    }
  };

  if (variant === 'feature') {
    return (
      <div className={`my-4 grid ${getGridClasses()} gap-3 ${themeClasses.container[theme]}`}>
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option.value)}
            className={`p-4 rounded-lg text-left transition-all border ${themeClasses.featureCard[theme]} flex flex-col hover:scale-105`}
          >
            {option.icon && (
              <span className="text-xl mb-2 inline-block">{option.icon}</span>
            )}
            <span className="font-medium text-base mb-1">{option.label}</span>
            {option.description && (
              <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                {option.description}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`my-3 flex flex-wrap gap-2 ${themeClasses.container[theme]}`}>
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => onSelect(option.value)}
          className={`px-3 py-2 rounded-full text-sm font-medium transition-colors border ${themeClasses.button[theme]} flex items-center`}
        >
          {option.icon && <span className="mr-1">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default QuickReplies; 