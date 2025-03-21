import React from 'react';
import { WhatsAppAlertData } from '../types/chat';

interface WhatsAppAlertModalProps {
  data: WhatsAppAlertData;
  theme?: 'light' | 'dark';
  onClose: () => void;
}

const WhatsAppAlertModal: React.FC<WhatsAppAlertModalProps> = ({ data, theme = 'light', onClose }) => {
  const themeClasses = {
    overlay: {
      light: 'bg-black bg-opacity-50',
      dark: 'bg-black bg-opacity-70'
    },
    modal: {
      light: 'bg-white text-gray-800 border-gray-200',
      dark: 'bg-gray-800 text-gray-100 border-gray-700'
    },
    header: {
      light: 'bg-green-500 text-white',
      dark: 'bg-green-600 text-white'
    },
    button: {
      light: 'bg-green-500 hover:bg-green-600 text-white',
      dark: 'bg-green-600 hover:bg-green-700 text-white'
    },
    close: {
      light: 'text-gray-700 hover:bg-gray-200',
      dark: 'text-gray-300 hover:bg-gray-700'
    }
  };

  // Format phone number for display
  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '+$1 $2 $3 $4');
  };

  // Get icon based on notification type
  const getNotificationIcon = () => {
    switch (data.notificationType) {
      case 'status':
        return '🔄';
      case 'arrival':
        return '🚢';
      case 'delay':
        return '⏰';
      case 'documents':
        return '📄';
      default:
        return '📦';
    }
  };

  // Get background color based on notification type
  const getNotificationBackground = () => {
    const baseClass = theme === 'light' ? 'bg-opacity-10' : 'bg-opacity-25';
    
    switch (data.notificationType) {
      case 'status':
        return `bg-blue-500 ${baseClass}`;
      case 'arrival':
        return `bg-green-500 ${baseClass}`;
      case 'delay':
        return `bg-yellow-500 ${baseClass}`;
      case 'documents':
        return `bg-purple-500 ${baseClass}`;
      default:
        return `bg-gray-500 ${baseClass}`;
    }
  };

  // Create example message preview
  const getMessagePreview = () => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <div className={`rounded-lg p-4 ${getNotificationBackground()}`}>
        <div className="flex items-start mb-2">
          <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white mr-3 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm mb-1">Nowports</div>
            <div className="text-sm">{data.message}</div>
            <div className={`text-xs mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
              {date} · {time}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center">
            <span className="text-lg mr-2">{getNotificationIcon()}</span>
            <span className="text-sm font-medium">#{data.shipmentId}</span>
          </div>
          <div className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
            Notificación por WhatsApp
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center ${themeClasses.overlay[theme]}`} onClick={onClose}>
      <div 
        className={`w-full max-w-md rounded-lg shadow-xl overflow-hidden transition-all duration-300 transform animate-zoomIn ${themeClasses.modal[theme]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-4 py-3 flex items-center justify-between ${themeClasses.header[theme]}`}>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="font-semibold">{data.title}</h3>
          </div>
          <button 
            className={`rounded-full p-1 ${themeClasses.close[theme]}`}
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className={`mb-4 text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
            Has activado las notificaciones por WhatsApp para este embarque. Recibirás alertas cuando haya cambios en el estado del envío.
          </p>
          
          <div className="mb-4">
            <div className={`text-xs font-semibold mb-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
              TELÉFONO DE CONTACTO
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{formatPhone(data.phone)}</span>
            </div>
          </div>

          <div className="mb-4">
            <div className={`text-xs font-semibold mb-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
              EJEMPLO DE NOTIFICACIÓN
            </div>
            {getMessagePreview()}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
            <button 
              className={`px-4 py-2 rounded-md ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-700'}`}
              onClick={onClose}
            >
              Cerrar
            </button>
            <a 
              href={`https://wa.me/${data.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Quiero activar las notificaciones de WhatsApp para mi embarque')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-md flex items-center justify-center ${themeClasses.button[theme]}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Abrir WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppAlertModal; 