import React from 'react';

interface QuickReplyOption {
  label: string;
  value: string;
  icon?: string;
}

interface QuickRepliesProps {
  options: QuickReplyOption[];
  onSelect: (value: string) => void;
  theme?: 'light' | 'dark';
}

const QuickReplies: React.FC<QuickRepliesProps> = ({ options, onSelect, theme = 'light' }) => {
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
    }
  };

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