import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import QuickReplies from './QuickReplies';
import { ChatMessage, ChatState, DocumentAttachment, TrackingVisualization } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';
import ShipmentTracker from './tracking/ShipmentTracker';

interface ChatContainerProps {
  theme?: 'light' | 'dark';
}

interface QuickReplyOption {
  label: string;
  value: string;
  icon?: string;
  description?: string;
}

// Estado para el formulario de cotización
interface QuoteFormState {
  active: boolean;
  step: number;
  origin?: string;
  destination?: string;
  mode?: 'maritime' | 'air' | 'ground';
  weight?: string;
  quantity?: string;
  dimensions?: string;
  cargoType?: string;
  hsCode?: string;
  incoterm?: string;
  notes?: string;
  history: number[]; // Para implementar navegación hacia atrás
}

// Documento simulado para el ejemplo
const SAMPLE_DOCUMENTS: { [key: string]: DocumentAttachment } = {
  bl: {
    id: 'doc-bl-1',
    name: 'Bill of Lading.pdf',
    type: 'application/pdf',
    size: 145000,
    content: 'Contenido simulado del Bill of Lading'
  },
  invoice: {
    id: 'doc-inv-1',
    name: 'Commercial_Invoice.pdf',
    type: 'application/pdf',
    size: 78000,
    content: 'Contenido simulado de la factura comercial'
  },
  packing: {
    id: 'doc-pack-1',
    name: 'Packing_List.pdf',
    type: 'application/pdf',
    size: 56000,
    content: 'Contenido simulado del packing list'
  },
  custom: {
    id: 'doc-customs-1',
    name: 'Customs_Declaration.pdf',
    type: 'application/pdf',
    size: 120000,
    content: 'Contenido simulado de la declaración aduanera'
  },
  certificate: {
    id: 'doc-cert-1',
    name: 'Certificate_of_Origin.pdf',
    type: 'application/pdf',
    size: 95000,
    content: 'Contenido simulado del certificado de origen'
  }
};

const ChatContainer: React.FC<ChatContainerProps> = ({ theme = 'light' }) => {
  const { t } = useTranslation('common');
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: null,
  });
  const [quickReplyOptions, setQuickReplyOptions] = useState<QuickReplyOption[]>([]);
  const [quoteForm, setQuoteForm] = useState<QuoteFormState>({
    active: false,
    step: 0,
    history: []
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatState.messages, quickReplyOptions]);

  // Add a welcome message when the component mounts
  useEffect(() => {
    initializeChat();
  }, []);

  // Initialize chat with welcome message
  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: uuidv4(),
      content: t('intro') + '\n\n' + t('howCanIHelp'),
      role: 'assistant',
      timestamp: new Date().toISOString(),
      quickReplies: [
        { 
          label: t('routeInfo'),
          value: t('requestRouteInfo', 'Necesito información sobre rutas y servicios'),
          icon: '🚢',
          description: t('routeInfoDesc', 'Tiempo de tránsito, salidas y puertos disponibles')
        },
        { 
          label: t('quotes'), 
          value: t('requestQuote', 'Quiero solicitar una cotización para transporte internacional'), 
          icon: '💰',
          description: t('quotesDesc', 'Obtenga una cotización preliminar para su carga')
        },
        { 
          label: t('tracking'), 
          value: t('requestTracking', 'Quiero hacer seguimiento a mi embarque'), 
          icon: '📦',
          description: t('trackingDesc', 'Status actualizado y ubicación de su carga')
        },
        { 
          label: t('documents'), 
          value: t('requestDocumentation', 'Cuáles son los requisitos documentales para importar'), 
          icon: '📄',
          description: t('documentsDesc', 'Documentos necesarios según origen/destino') 
        },
        { 
          label: t('experts'), 
          value: t('requestExpert', 'Necesito hablar con un especialista'), 
          icon: '👨‍💼',
          description: t('expertsDesc', 'Consultas especializadas y asistencia personalizada')
        }
      ],
      quickRepliesVariant: 'feature',
      quickRepliesColumns: 2
    };
    
    setChatState((prevState) => ({
      ...prevState,
      messages: [welcomeMessage],
    }));
  };

  // Manejar la progresión del formulario de cotización
  const handleQuoteFormProgress = (userInput: string) => {
    setQuoteForm(prev => {
      const newForm = { ...prev };
      
      // Guardar el paso actual en el historial para navegación hacia atrás
      newForm.history = [...prev.history, prev.step];
      
      // Manejar comandos especiales
      if (userInput.toLowerCase() === 'volver' || userInput.toLowerCase() === 'atrás') {
        if (newForm.history.length > 0) {
          // Ir al paso anterior
          const previousStep = newForm.history.pop();
          newForm.step = previousStep || 0;
          return newForm;
        }
        return prev; // Si no hay historial, mantenemos el estado actual
      }
      
      if (userInput.toLowerCase() === 'cancelar cotización' || userInput.toLowerCase() === 'cancelar') {
        // Añadir mensaje de cancelación
        const cancelMessage: ChatMessage = {
          id: uuidv4(),
          content: "Has cancelado la cotización. ¿En qué más puedo ayudarte?",
          role: 'assistant',
          timestamp: Date.now().toString(),
          quickReplies: [
            { label: 'Iniciar nueva cotización', value: 'Quiero iniciar una cotización', icon: '📋' },
            { label: 'Rastrear envío', value: 'Quiero rastrear mi envío', icon: '🔍' },
            { label: 'Requisitos documentales', value: 'Cuáles son los requisitos documentales', icon: '📄' }
          ]
        };
        
        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, cancelMessage]
        }));
        
        // Resetear el formulario
        return {
          active: false,
          step: 0,
          history: []
        };
      }
      
      // Actualizar el campo correspondiente según el paso actual
      switch (prev.step) {
        case 1: // Origen
          newForm.origin = userInput;
          break;
        case 2: // Destino
          newForm.destination = userInput;
          break;
        case 3: // Modalidad
          if (userInput.toLowerCase().includes('marítimo') || userInput.toLowerCase().includes('maritimo')) {
            newForm.mode = 'maritime';
          } else if (userInput.toLowerCase().includes('aéreo') || userInput.toLowerCase().includes('aereo')) {
            newForm.mode = 'air';
          } else if (userInput.toLowerCase().includes('terrestre')) {
            newForm.mode = 'ground';
          }
          break;
        case 4: // Peso
          newForm.weight = userInput;
          break;
        case 5: // Cantidad
          newForm.quantity = userInput;
          break;
        case 6: // Dimensiones
          newForm.dimensions = userInput;
          break;
        case 7: // Tipo de carga y HS code
          newForm.cargoType = userInput;
          // Intentar extraer HS code si existe
          const hsCodeMatch = userInput.match(/\b\d{6,10}\b/);
          if (hsCodeMatch) {
            newForm.hsCode = hsCodeMatch[0];
          }
          break;
        case 8: // Incoterm
          newForm.incoterm = userInput;
          break;
        case 9: // Notas
          newForm.notes = userInput;
          break;
      }
      
      // Avanzar al siguiente paso
      newForm.step += 1;
      
      // Si hemos completado todos los pasos, desactivar el formulario
      if (newForm.step > 10) {
        newForm.active = false;
        // Crear resumen de la cotización para enviar
        const quoteSummary = `Solicito cotización con los siguientes datos:
- Origen: ${newForm.origin}
- Destino: ${newForm.destination}
- Modalidad: ${newForm.mode === 'maritime' ? 'Marítimo' : newForm.mode === 'air' ? 'Aéreo' : 'Terrestre'}
- Peso: ${newForm.weight}
- Cantidad: ${newForm.quantity}
- Dimensiones: ${newForm.dimensions}
- Tipo de carga: ${newForm.cargoType}${newForm.hsCode ? `\n- HS Code: ${newForm.hsCode}` : ''}
- Incoterm: ${newForm.incoterm}${newForm.notes ? `\n- Notas adicionales: ${newForm.notes}` : ''}`;
        
        // Enviar este resumen como mensaje del usuario
        setTimeout(() => {
          handleSendMessage(quoteSummary);
        }, 500);
      }
      
      return newForm;
    });
    
    // Generar las siguientes opciones o preguntas basadas en el paso actual
    if (quoteForm.step < 10) {
      generateQuoteFormPrompt();
    }
  };

  // Generar mensajes y opciones para el formulario de cotización
  const generateQuoteFormPrompt = () => {
    let assistantMessage: ChatMessage | null = null;
    let options: QuickReplyOption[] = [];
    const totalSteps = 9;
    const currentStep = quoteForm.step;
    const progressText = `Paso ${currentStep} de ${totalSteps}`;
    
    // Opciones comunes para todos los pasos
    const commonOptions: QuickReplyOption[] = [
      { label: 'Volver atrás', value: 'volver', icon: '⬅️' },
      { label: 'Cancelar', value: 'cancelar cotización', icon: '❌' }
    ];
    
    switch (quoteForm.step) {
      case 1:
        assistantMessage = {
          id: uuidv4(),
          content: `${progressText}: Para iniciar la cotización, necesito algunos datos. ¿Cuál es el origen de tu carga? (Ciudad y país)`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        options = [
          { label: 'Ciudad de México, México', value: 'Ciudad de México, México', icon: '📍' },
          { label: 'Shanghái, China', value: 'Shanghái, China', icon: '📍' },
          { label: 'Los Ángeles, EE.UU.', value: 'Los Ángeles, EE.UU.', icon: '📍' },
        ];
        break;
      case 2:
        assistantMessage = {
          id: uuidv4(),
          content: `${progressText}: Origen: ${quoteForm.origin}. Ahora, ¿cuál es el destino de tu carga? (Ciudad y país)`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        // Mostrar opciones contextuales según el origen
        if (quoteForm.origin?.includes('México')) {
          options = [
            { label: 'Miami, EE.UU.', value: 'Miami, EE.UU.', icon: '📍' },
            { label: 'Los Ángeles, EE.UU.', value: 'Los Ángeles, EE.UU.', icon: '📍' },
            { label: 'Shanghái, China', value: 'Shanghái, China', icon: '📍' },
          ];
        } else if (quoteForm.origin?.includes('China')) {
          options = [
            { label: 'Ciudad de México, México', value: 'Ciudad de México, México', icon: '📍' },
            { label: 'Los Ángeles, EE.UU.', value: 'Los Ángeles, EE.UU.', icon: '📍' },
            { label: 'Rotterdam, Países Bajos', value: 'Rotterdam, Países Bajos', icon: '📍' },
          ];
        } else {
          options = [
            { label: 'Miami, EE.UU.', value: 'Miami, EE.UU.', icon: '📍' },
            { label: 'Rotterdam, Países Bajos', value: 'Rotterdam, Países Bajos', icon: '📍' },
            { label: 'Manzanillo, México', value: 'Manzanillo, México', icon: '📍' },
          ];
        }
        break;
      case 3:
        assistantMessage = {
          id: uuidv4(),
          content: `${progressText}: Destino: ${quoteForm.destination}. ¿Qué modalidad de transporte prefieres?`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        
        // Mostrar opciones relevantes según origen y destino
        const origDestSameContinente = 
          (quoteForm.origin?.includes('México') && quoteForm.destination?.includes('EE.UU.')) ||
          (quoteForm.origin?.includes('EE.UU.') && quoteForm.destination?.includes('México'));
        
        if (origDestSameContinente) {
          options = [
            { label: 'Terrestre', value: 'Terrestre', icon: '🚚', description: 'Opción recomendada para rutas continentales' },
            { label: 'Aéreo', value: 'Aéreo', icon: '✈️' },
            { label: 'Marítimo', value: 'Marítimo', icon: '🚢' },
          ];
        } else {
          options = [
            { label: 'Marítimo', value: 'Marítimo', icon: '🚢', description: 'Opción recomendada para rutas intercontinentales' },
            { label: 'Aéreo', value: 'Aéreo', icon: '✈️' },
            { label: 'Terrestre', value: 'Terrestre', icon: '🚚' },
          ];
        }
        break;
      case 4:
        assistantMessage = {
          id: uuidv4(),
          content: `${progressText}: Modalidad: ${quoteForm.mode === 'maritime' ? 'Marítimo 🚢' : quoteForm.mode === 'air' ? 'Aéreo ✈️' : 'Terrestre 🚚'}. ¿Cuál es el peso total de la carga? (en kg)`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        options = [
          { label: 'Menos de 100 kg', value: 'Menos de 100 kg', icon: '⚖️' },
          { label: '100-500 kg', value: '100-500 kg', icon: '⚖️' },
          { label: 'Más de 500 kg', value: 'Más de 500 kg', icon: '⚖️' },
        ];
        break;
      case 5:
        assistantMessage = {
          id: uuidv4(),
          content: `${progressText}: Peso: ${quoteForm.weight}. ¿Cuál es la cantidad de bultos o contenedores?`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        options = [
          { label: '1 contenedor', value: '1 contenedor', icon: '📦' },
          { label: '5 pallets', value: '5 pallets', icon: '📦' },
          { label: '10 cajas', value: '10 cajas', icon: '📦' },
        ];
        break;
      case 6:
        assistantMessage = {
          id: uuidv4(),
          content: `${progressText}: Cantidad: ${quoteForm.quantity}. ¿Cuáles son las dimensiones? (largo x ancho x alto en cm)`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        
        // Opciones contextuales según la cantidad seleccionada
        if (quoteForm.quantity?.includes('contenedor')) {
          options = [
            { label: 'Contenedor 20\'', value: 'Contenedor estándar de 20 pies', icon: '📏' },
            { label: 'Contenedor 40\'', value: 'Contenedor estándar de 40 pies', icon: '📏' },
            { label: 'Personalizado', value: 'Medidas personalizadas', icon: '📏' },
          ];
        } else {
          options = [
            { label: '120x80x100', value: '120x80x100 cm (pallet estándar)', icon: '📏' },
            { label: '60x40x30', value: '60x40x30 cm (caja mediana)', icon: '📏' },
            { label: 'Personalizado', value: 'Medidas personalizadas', icon: '📏' },
          ];
        }
        break;
      case 7:
        assistantMessage = {
          id: uuidv4(),
          content: `${progressText}: Dimensiones: ${quoteForm.dimensions}. ¿Qué tipo de carga es y su código HS (si lo conoces)?`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        options = [
          { label: 'Electrónicos', value: 'Productos electrónicos', icon: '💻' },
          { label: 'Textiles', value: 'Productos textiles', icon: '👕' },
          { label: 'Alimentos', value: 'Productos alimenticios', icon: '🍎' },
          { label: 'Información HS', value: 'Necesito ayuda con el código HS', icon: '❓', description: 'Te ayudaremos a identificar el código correcto' },
        ];
        break;
      case 8:
        assistantMessage = {
          id: uuidv4(),
          content: `${progressText}: Tipo de carga: ${quoteForm.cargoType}. ¿Qué término de negociación (Incoterm) prefieres?`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        options = [
          { label: 'FOB', value: 'FOB (Free On Board)', icon: '📄', description: 'Vendedor entrega en puerto de origen' },
          { label: 'CIF', value: 'CIF (Cost, Insurance and Freight)', icon: '📄', description: 'Vendedor paga flete y seguro' },
          { label: 'EXW', value: 'EXW (Ex Works)', icon: '📄', description: 'Comprador asume todos los costos' },
          { label: 'Información', value: 'Necesito información sobre Incoterms', icon: '❓' },
        ];
        break;
      case 9:
        assistantMessage = {
          id: uuidv4(),
          content: `${progressText}: Incoterm: ${quoteForm.incoterm}. ¿Tienes alguna nota o requerimiento adicional?`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        options = [
          { label: 'Carga peligrosa', value: 'La carga contiene materiales peligrosos que requieren manejo especial', icon: '⚠️' },
          { label: 'Carga refrigerada', value: 'Requiero transporte refrigerado', icon: '❄️' },
          { label: 'Ninguna', value: 'No tengo requerimientos adicionales', icon: '✅' },
        ];
        break;
      case 10:
        assistantMessage = {
          id: uuidv4(),
          content: `✅ Cotización completada. He recopilado todos los datos para tu cotización. Ahora te proporcionaré opciones personalizadas basadas en la información proporcionada.

Resumen de datos:
• Origen: ${quoteForm.origin}
• Destino: ${quoteForm.destination}
• Modalidad: ${quoteForm.mode === 'maritime' ? 'Marítimo 🚢' : quoteForm.mode === 'air' ? 'Aéreo ✈️' : 'Terrestre 🚚'}
• Peso: ${quoteForm.weight}
• Cantidad: ${quoteForm.quantity}
• Dimensiones: ${quoteForm.dimensions}
• Tipo de carga: ${quoteForm.cargoType}${quoteForm.hsCode ? `\n• HS Code: ${quoteForm.hsCode}` : ''}
• Incoterm: ${quoteForm.incoterm}${quoteForm.notes ? `\n• Notas adicionales: ${quoteForm.notes}` : ''}

Con esta información, te proporcionaré una cotización personalizada y te explicaré cómo Nowports puede optimizar tu cadena de suministro.`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        break;
    }
    
    // Añadir las opciones comunes excepto para el paso final
    if (quoteForm.step < 10 && quoteForm.step > 1) {
      options = [...options, ...commonOptions];
    }
    
    if (assistantMessage) {
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage!]
      }));
    }
    
    setQuickReplyOptions(options);
  };

  // Extraer opciones de respuesta rápida del mensaje del asistente
  const extractQuickReplyOptions = (content: string): QuickReplyOption[] => {
    const options: QuickReplyOption[] = [];
    
    // Detectar si es una respuesta a una consulta de envío específico (código de tracking)
    const trackingCodeRegex = /\b([A-Z]{3}\d{7})\b/;
    const hasTrackingCode = content.match(trackingCodeRegex);
    
    // Detectar si es una respuesta sobre una empresa específica
    const companyRegex = /(Olivera S\.C|cliente específico)/i;
    const hasCompany = content.match(companyRegex);
    
    // Detectar opciones para cotización
    if (content.toLowerCase().includes('cotización') || content.toLowerCase().includes('cotizar')) {
      options.push({ label: 'Iniciar cotización', value: 'Quiero iniciar una cotización', icon: '📋' });
    }
    
    // Detectar opciones para consulta de envío
    if (content.toLowerCase().includes('estado de') || content.toLowerCase().includes('tracking') || content.toLowerCase().includes('seguimiento')) {
      options.push({ label: 'Consultar envío', value: 'Quiero consultar un envío por código', icon: '🔍' });
    }
    
    // Opciones para empresas específicas si se mencionan
    if (hasCompany) {
      options.push({ label: 'Ver historial', value: `Ver historial de envíos de ${hasCompany[1]}`, icon: '📜' });
      options.push({ label: 'Contactar ejecutivo', value: `Contactar a mi ejecutivo asignado para ${hasCompany[1]}`, icon: '👨‍💼' });
    }
    
    // Opciones para envíos específicos si se mencionan
    if (hasTrackingCode) {
      options.push({ label: 'Ver detalles', value: `Ver detalles del envío ${hasTrackingCode[1]}`, icon: '📦' });
      options.push({ label: 'Documentos', value: `Ver documentos del envío ${hasTrackingCode[1]}`, icon: '📄' });
      options.push({ label: 'Actualizar estado', value: `Actualizar estado del envío ${hasTrackingCode[1]}`, icon: '🔄' });
    }

    // Buscar listas de opciones para servicios generales
    const transportRegex = /(?:transporte|transportes)(?:\s\w+)?:\s*¿([^?]+)\?/i;
    const tarifasRegex = /(?:tarifa|tarifas)(?:\s\w+)?:\s*¿([^?]+)\?/i;
    const rutasRegex = /(?:ruta|rutas)(?:\s\w+)?:\s*¿([^?]+)\?/i;
    const financiamientoRegex = /(?:financiamiento)(?:\s\w+)?:\s*¿([^?]+)\?/i;
    
    // Transporte
    const transportMatch = content.match(transportRegex);
    if (transportMatch && transportMatch[1]) {
      if (transportMatch[1].includes('marítimas') || transportMatch[1].includes('marítimo')) {
        options.push({ label: 'Marítimo', value: 'Quiero información sobre transporte marítimo', icon: '🚢' });
      }
      if (transportMatch[1].includes('aéreas') || transportMatch[1].includes('aéreo')) {
        options.push({ label: 'Aéreo', value: 'Quiero información sobre transporte aéreo', icon: '✈️' });
      }
      if (transportMatch[1].includes('terrestres') || transportMatch[1].includes('terrestre')) {
        options.push({ label: 'Terrestre', value: 'Quiero información sobre transporte terrestre', icon: '🚚' });
      }
    }

    // Tarifas
    const tarifasMatch = content.match(tarifasRegex);
    if (tarifasMatch && tarifasMatch[1]) {
      options.push({ label: 'Ver tarifas', value: 'Quiero conocer las tarifas disponibles', icon: '💰' });
    }

    // Rutas
    const rutasMatch = content.match(rutasRegex);
    if (rutasMatch && rutasMatch[1]) {
      options.push({ label: 'Ver rutas', value: 'Muéstrame las rutas disponibles', icon: '🗺️' });
    }

    // Financiamiento
    const financiamientoMatch = content.match(financiamientoRegex);
    if (financiamientoMatch && financiamientoMatch[1]) {
      options.push({ label: 'Financiamiento', value: 'Cuéntame sobre opciones de financiamiento', icon: '💼' });
    }

    // Detectar opciones de operaciones
    if (content.toLowerCase().includes('operaciones') || content.toLowerCase().includes('soporte')) {
      if (options.length === 0) {
        options.push({ label: 'Soporte general', value: 'Necesito soporte general', icon: '🛠️' });
        options.push({ label: 'Facturación', value: 'Tengo dudas sobre facturación', icon: '📝' });
        options.push({ label: 'Documentos', value: 'Necesito ayuda con documentos', icon: '📄' });
        options.push({ label: 'Liberación', value: 'Consulta sobre liberación', icon: '🔓' });
        options.push({ label: 'Reservas', value: 'Información sobre reservas', icon: '📅' });
      }
    }

    // Detectar importación/exportación
    if (content.toLowerCase().includes('importación') || content.toLowerCase().includes('importar')) {
      options.push({ label: 'Importación', value: 'Información sobre importación', icon: '📥' });
    }
    if (content.toLowerCase().includes('exportación') || content.toLowerCase().includes('exportar')) {
      options.push({ label: 'Exportación', value: 'Información sobre exportación', icon: '📤' });
    }

    // Si no encontramos opciones específicas pero hay menciones generales
    if (options.length === 0) {
      if (content.includes('transporte') || content.includes('transportes')) {
        options.push({ label: 'Transporte', value: 'Quiero información sobre opciones de transporte', icon: '🚢' });
      }
      if (content.includes('tarifa') || content.includes('tarifas') || content.includes('costo') || content.includes('costos')) {
        options.push({ label: 'Tarifas', value: 'Quiero conocer las tarifas', icon: '💰' });
      }
      if (content.includes('ruta') || content.includes('rutas')) {
        options.push({ label: 'Rutas', value: 'Muéstrame las rutas', icon: '🗺️' });
      }
      if (content.includes('financiamiento') || content.includes('financiar')) {
        options.push({ label: 'Financiamiento', value: 'Opciones de financiamiento', icon: '💼' });
      }
    }

    return options;
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Si estamos en modo formulario de cotización, manejarlo diferente
    if (quoteForm.active && quoteForm.step > 0 && quoteForm.step <= 10) {
      // Crear un nuevo mensaje del usuario
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content,
        role: 'user',
        timestamp: Date.now().toString(),
      };

      // Actualizar el estado del chat con el mensaje del usuario
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));

      // Procesar la respuesta del formulario
      handleQuoteFormProgress(content);
      return;
    }

    // Detectar comandos especiales
    if (content.toLowerCase() === 'quiero iniciar una cotización' || content.toLowerCase().includes('cotizar envío')) {
      setQuoteForm({
        active: true,
        step: 1,
        history: []
      });
      
      // Crear un nuevo mensaje del usuario
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content,
        role: 'user',
        timestamp: Date.now().toString(),
      };

      // Actualizar el estado del chat con el mensaje del usuario
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));

      // Iniciar el flujo del formulario
      generateQuoteFormPrompt();
      return;
    }

    // Detectar consulta de envío específico
    const trackingRegex = /\b([A-Z]{3}\d{7})\b/;
    const trackingMatch = content.match(trackingRegex);
    
    // Detectar empresa específica
    const companyRegex = /(Olivera S\.C)\b/i;
    const companyMatch = content.match(companyRegex);

    // Crear un nuevo mensaje del usuario
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: Date.now().toString(),
    };

    // Limpiar opciones de respuesta rápida cuando el usuario envía un mensaje
    setQuickReplyOptions([]);

    // Actualizar el estado del chat con el mensaje del usuario y mostrar carga
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      console.log('Sending message to API:', content);
      
      // Enviar el mensaje a la API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId: chatState.sessionId,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API error:', errorData);
        throw new Error(`API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Received response:', data);

      // Si hay una coincidencia de tracking code, dar formato especial a la respuesta
      let responseContent = data.response;
      if (trackingMatch && trackingMatch[1]) {
        // Simulamos información para el código de envío específico
        const trackingCode = trackingMatch[1];
        responseContent = `📦 **Información del envío ${trackingCode}**\n\n`;
        
        // Generar algunos datos de ejemplo basados en el código
        const isExport = trackingCode.startsWith('ECR');
        const isImport = trackingCode.startsWith('ICR');
        
        responseContent += `**Estado actual:** ${isExport ? 'En tránsito internacional' : isImport ? 'En aduana' : 'Programado'}\n`;
        responseContent += `**Tipo de operación:** ${isExport ? 'Exportación' : isImport ? 'Importación' : 'Nacional'}\n`;
        responseContent += `**Origen:** ${isExport ? 'Manzanillo, México' : 'Shanghái, China'}\n`;
        responseContent += `**Destino:** ${isExport ? 'Long Beach, EE.UU.' : 'Veracruz, México'}\n`;
        responseContent += `**Fecha estimada de llegada:** ${new Date(Date.now() + 15*24*60*60*1000).toLocaleDateString()}\n`;
        responseContent += `**Documentos disponibles:** [BL] [Factura Comercial] [Packing List]\n\n`;
        responseContent += `¿Necesitas más información sobre este envío? Puedo ayudarte con:\n`;
        responseContent += `- Actualización de estado\n`;
        responseContent += `- Documentación adicional\n`;
        responseContent += `- Comunicación con el agente asignado`;
      }
      
      // Si hay una coincidencia de empresa, dar formato especial a la respuesta
      if (companyMatch && companyMatch[1]) {
        const company = companyMatch[1];
        responseContent = `🏢 **Información de ${company}**\n\n`;
        responseContent += `**Cliente desde:** 2019\n`;
        responseContent += `**Ejecutivo asignado:** María González\n`;
        responseContent += `**Envíos activos:** 3\n`;
        responseContent += `**Envíos completados:** 27\n\n`;
        responseContent += `**Envíos recientes:**\n`;
        responseContent += `- ECR2503586: México a EE.UU. (En tránsito)\n`;
        responseContent += `- ICR1982375: China a México (En aduana)\n`;
        responseContent += `- ECR2437890: México a Canadá (Entregado el 15/04/2023)\n\n`;
        responseContent += `¿En qué puedo ayudarte con ${company} hoy?`;
      }

      // Crear mensaje del asistente desde la respuesta
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: responseContent,
        role: 'assistant',
        timestamp: Date.now().toString(),
      };

      // Actualizar el estado del chat con la respuesta del asistente
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
        sessionId: data.sessionId,
      }));

      // Extraer y configurar opciones de respuesta rápida
      const options = extractQuickReplyOptions(responseContent);
      setQuickReplyOptions(options);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get response. Please try again. Error: ' + (error instanceof Error ? error.message : String(error)),
      }));
    }
  };

  // Función para manejar el envío de documentos
  const handleSendDocument = (file: File) => {
    // Crear un documento adjunto para el mensaje
    const documentAttachment: DocumentAttachment = {
      id: uuidv4(),
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
    };

    // Crear un mensaje del usuario con el documento adjunto
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: `He enviado un documento: ${file.name}`,
      role: 'user',
      timestamp: Date.now().toString(),
      attachments: [documentAttachment]
    };

    // Limpiar opciones de respuesta rápida
    setQuickReplyOptions([]);

    // Actualizar el estado del chat con el mensaje del usuario y mostrar carga
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    // Simular la respuesta después de un breve retraso
    setTimeout(() => {
      let responseContent = '';
      let attachments: DocumentAttachment[] = [];

      // Determinar el tipo de respuesta basada en el tipo de archivo
      if (file.name.toLowerCase().includes('bl') || file.name.toLowerCase().includes('bill')) {
        responseContent = `He recibido tu Bill of Lading. Este documento está correctamente formateado. 

Como agente, puedo ayudarte con los siguientes pasos:
1. Verificar la información del transportista
2. Coordinar la liberación de la carga
3. Programar la entrega final

¿Te gustaría que te envíe un modelo actualizado de Bill of Lading para tus próximos envíos?`;
        attachments = [SAMPLE_DOCUMENTS.bl];
      } else if (file.name.toLowerCase().includes('invoice') || file.name.toLowerCase().includes('factura')) {
        responseContent = `Gracias por enviar la factura comercial. Hemos registrado los siguientes detalles:

- Monto total: $4,567.00 USD
- Términos de pago: 30 días
- Incoterm: CIF

Para completar el proceso de importación, necesitaremos también el Packing List y el Certificado de Origen. ¿Los tienes disponibles?`;
        attachments = [SAMPLE_DOCUMENTS.invoice];
      } else if (file.name.toLowerCase().includes('pack') || file.name.toLowerCase().includes('lista')) {
        responseContent = `He recibido el Packing List que enviaste. Este documento contiene la siguiente información:

- 12 pallets
- 240 cajas en total
- Peso bruto: 1,450 kg
- Dimensiones totales: 120 x 100 x 160 cm

¿Necesitas que coordine algún servicio especial para el manejo de esta carga?`;
        attachments = [SAMPLE_DOCUMENTS.packing];
      } else {
        responseContent = `He recibido tu documento "${file.name}". Lo he revisado y parece estar en orden.

Si necesitas alguna aclaración o tienes preguntas sobre este documento, por favor házmelo saber. ¿Hay algo más en lo que pueda ayudarte respecto a este documento?`;
      }

      // Crear mensaje del asistente
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: responseContent,
        role: 'assistant',
        timestamp: Date.now().toString(),
        attachments: attachments.length > 0 ? attachments : undefined
      };

      // Actualizar el estado del chat con la respuesta
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));

      // Generar opciones de respuesta rápida
      const options = extractQuickReplyOptions(responseContent);
      if (file.name.toLowerCase().includes('bl') || file.name.toLowerCase().includes('bill')) {
        options.push({ label: 'Ver modelo actualizado', value: 'Me gustaría ver el modelo actualizado de Bill of Lading', icon: '📄' });
      } else if (file.name.toLowerCase().includes('invoice') || file.name.toLowerCase().includes('factura')) {
        options.push({ label: 'Enviar Packing List', value: 'Enviaré el Packing List pronto', icon: '📦' });
        options.push({ label: 'Solicitar ayuda', value: 'Necesito ayuda para conseguir el Certificado de Origen', icon: '🆘' });
      }
      setQuickReplyOptions(options);
    }, 1500);
  };

  // Manejar la selección de una respuesta rápida
  const handleQuickReplySelect = (value: string) => {
    // Verificar si se trata de hacer seguimiento a un embarque
    if (value.toLowerCase().includes('hacer seguimiento') || value.toLowerCase().includes('seguimiento a mi embarque')) {
      // Crear un mensaje del usuario
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: value,
        role: 'user',
        timestamp: Date.now().toString(),
      };

      // Actualizar el chat con el mensaje del usuario
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true
      }));

      // Simular respuesta del asistente pidiendo el código de seguimiento
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          content: "Para poder mostrarte el estado de tu embarque, necesito que me proporciones el código de seguimiento. Los códigos suelen tener el formato ECRxxxxxxx para exportaciones o ICRxxxxxxx para importaciones.",
          role: 'assistant',
          timestamp: Date.now().toString(),
          quickReplies: [
            { label: 'ECR2503586', value: 'Mi código de seguimiento es ECR2503586', icon: '📦' },
            { label: 'ICR1982375', value: 'Mi código de seguimiento es ICR1982375', icon: '📦' },
            { label: 'No conozco mi código', value: 'No tengo mi código de seguimiento', icon: '❓' }
          ]
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false
        }));
      }, 1000);
      
      return;
    }
    
    // Verificar si es una solicitud con código de seguimiento
    const trackingCodeRegex = /(?:código de seguimiento|código|tracking|seguimiento) (?:es )?(ECR\d{7}|ICR\d{7})/i;
    const trackingMatch = value.match(trackingCodeRegex);
    
    if (trackingMatch && trackingMatch[1]) {
      const trackingCode = trackingMatch[1].toUpperCase();
      
      // Crear un mensaje del usuario
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: value,
        role: 'user',
        timestamp: Date.now().toString(),
      };

      // Actualizar el chat con el mensaje del usuario
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true
      }));

      // Simular respuesta del asistente con la visualización del tracking
      setTimeout(() => {
        const trackingData: TrackingVisualization = {
          shipmentId: trackingCode,
          origin: { 
            name: trackingCode.startsWith('ECR') ? 'Manzanillo, México' : 'Shanghai, China',
            lat: trackingCode.startsWith('ECR') ? 19.0495 : 31.2304,
            lng: trackingCode.startsWith('ECR') ? -104.3140 : 121.4737
          },
          destination: { 
            name: trackingCode.startsWith('ECR') ? 'Long Beach, EE.UU.' : 'Manzanillo, México',
            lat: trackingCode.startsWith('ECR') ? 33.7701 : 19.0495,
            lng: trackingCode.startsWith('ECR') ? -118.1937 : -104.3140
          },
          currentLocation: { 
            name: trackingCode.startsWith('ECR') ? 'Océano Pacífico' : 'Puerto de Shanghai',
            lat: trackingCode.startsWith('ECR') ? 24.5000 : 31.2304,
            lng: trackingCode.startsWith('ECR') ? -112.0000 : 121.4737
          },
          estimatedArrival: trackingCode.startsWith('ECR') ? '04/04/2025' : '15/05/2025',
          milestones: trackingCode.startsWith('ECR') ? [
            { name: 'Recogida', date: '15/11/2023', status: 'completed' },
            { name: 'Llegada a puerto de origen', date: '18/11/2023', status: 'completed' },
            { name: 'Carga en buque', date: '20/11/2023', status: 'completed' },
            { name: 'En tránsito marítimo', date: 'Actual', status: 'inProgress' },
            { name: 'Llegada a puerto destino', date: '04/04/2025', status: 'upcoming' },
            { name: 'Despacho aduanal', date: 'Pendiente', status: 'upcoming' },
            { name: 'Entrega final', date: 'Pendiente', status: 'upcoming' }
          ] : [
            { name: 'Booking confirmado', date: '10/02/2024', status: 'completed' },
            { name: 'Carga lista en almacén', date: '15/02/2024', status: 'completed' },
            { name: 'Documentación en proceso', date: 'Actual', status: 'inProgress' },
            { name: 'Embarque programado', date: '01/03/2024', status: 'upcoming' },
            { name: 'En tránsito marítimo', date: 'Pendiente', status: 'upcoming' },
            { name: 'Llegada a puerto destino', date: '15/05/2025', status: 'upcoming' },
            { name: 'Entrega final', date: 'Pendiente', status: 'upcoming' }
          ],
          carrier: trackingCode.startsWith('ECR') ? 'Maersk Line' : 'COSCO Shipping',
          vesselName: trackingCode.startsWith('ECR') ? 'Maersk Semarang' : 'COSCO Harmony',
          containerNumbers: trackingCode.startsWith('ECR') ? ['MSKU7627321'] : ['CSLU9876543']
        };

        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          content: `He encontrado la información de tu embarque con código ${trackingCode}:`,
          role: 'assistant',
          timestamp: Date.now().toString(),
          trackingVisualization: trackingData,
          quickReplies: [
            { label: 'Actualizar ubicación', value: `Actualizar ubicación de mi embarque ${trackingCode}`, icon: '🔄' },
            { label: 'Ver documentos', value: `Ver documentos del envío ${trackingCode}`, icon: '📄' },
            { label: 'Contactar ejecutivo', value: 'Contactar con mi agente asignado', icon: '👨‍💼' }
          ]
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false
        }));
      }, 1000);
      
      return;
    }
    
    // Verificar si el usuario no tiene su código de seguimiento
    if (value.toLowerCase().includes('no tengo mi código') || value.toLowerCase().includes('no conozco mi código')) {
      // Crear un mensaje del usuario
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: value,
        role: 'user',
        timestamp: Date.now().toString(),
      };

      // Actualizar el chat con el mensaje del usuario
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true
      }));

      // Simular respuesta del asistente
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          content: "No hay problema. También puedes consultar tus embarques de otras formas:\n\n1. Por nombre de tu empresa\n2. Por número de contenedor\n3. Por número de reserva\n\n¿Cuál de estas opciones prefieres utilizar?",
          role: 'assistant',
          timestamp: Date.now().toString(),
          quickReplies: [
            { label: 'Por empresa', value: 'Buscar por nombre de empresa', icon: '🏢' },
            { label: 'Por contenedor', value: 'Buscar por número de contenedor', icon: '📦' },
            { label: 'Por reserva', value: 'Buscar por número de reserva', icon: '🔖' },
            { label: 'Contactar ejecutivo', value: 'Necesito hablar con mi ejecutivo', icon: '👨‍💼' }
          ]
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false
        }));
      }, 1000);
      
      return;
    }
    
    // Verificar si es una solicitud para contactar con el agente asignado
    if (value.toLowerCase().includes('contactar con mi agente') || value.toLowerCase().includes('contactar agente')) {
      // Crear un mensaje del usuario
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: value,
        role: 'user',
        timestamp: Date.now().toString(),
      };

      // Actualizar el chat con el mensaje del usuario
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true
      }));

      // Simular respuesta del asistente después de un breve retraso
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          content: "Entendido. Para contactar a tu agente asignado, por favor proporciona tu número de cuenta Nowports o el nombre de tu empresa. Con esta información, podré localizar a tu agente y facilitar la comunicación de inmediato.",
          role: 'assistant',
          timestamp: Date.now().toString(),
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false
        }));
      }, 800);
      
      return;
    }
    
    // Verificar si quiere llamar, enviar WhatsApp o correo al agente
    const contactMethodRegex = /(?:Llamar|Enviar WhatsApp|Enviar correo) a (.+?)(?:\sal\s|\sa\s)?(.+)?/i;
    const contactMatch = value.match(contactMethodRegex);
    
    if (contactMatch) {
      const contactMethod = value.toLowerCase().includes("llamar") ? "llamada telefónica" : 
                           value.toLowerCase().includes("whatsapp") ? "WhatsApp" : "correo electrónico";
      const ejecutivo = contactMatch[1];
      
      // Crear un mensaje del usuario
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: value,
        role: 'user',
        timestamp: Date.now().toString(),
      };

      // Actualizar el chat con el mensaje del usuario
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true
      }));

      // Simular respuesta del asistente después de un breve retraso
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          content: `✅ **Contacto iniciado**\n\n` +
                   `Te he conectado con ${ejecutivo} vía ${contactMethod}.\n\n` +
                   (contactMethod === "llamada telefónica" ? 
                     `La llamada se iniciará en breve. Por favor, ten en cuenta que en un entorno real, esto abriría tu aplicación de teléfono con el número marcado.` : 
                    contactMethod === "WhatsApp" ? 
                     `He preparado un mensaje en WhatsApp. En un entorno real, esto abriría la aplicación de WhatsApp con un mensaje predefinido para tu ejecutivo.` :
                     `He preparado un correo electrónico. En un entorno real, esto abriría tu cliente de correo con un mensaje predefinido para tu ejecutivo.`),
          role: 'assistant',
          timestamp: Date.now().toString(),
          quickReplies: [
            { label: 'Ver estado de envíos', value: 'Ver estado de mis envíos activos', icon: '📦' },
            { label: 'Nueva cotización', value: 'Quiero iniciar una cotización', icon: '💰' },
            { label: 'Regresar al menú', value: 'Mostrar menú principal', icon: '🏠' }
          ]
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false
        }));
      }, 800);
      
      return;
    }
    
    // Verificar si es una solicitud para actualizar el estado de un envío
    const updateTrackingRegex = /actualizar estado del env(í|i)o ([A-Z]{3}\d{7})/i;
    const updateMatch = value.toLowerCase().match(updateTrackingRegex);
    
    if (updateMatch && updateMatch[2]) {
      const trackingCode = updateMatch[2].toUpperCase();
      
      // Crear un mensaje del usuario
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: value,
        role: 'user',
        timestamp: Date.now().toString(),
      };

      // Actualizar el chat con el mensaje del usuario
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true
      }));

      // Simular respuesta del asistente después de un breve retraso
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          content: `✅ **Estado actualizado para envío ${trackingCode}**\n\n` +
                  `He verificado los últimos datos de tu envío:\n\n` +
                  `**Actualización:** El envío ha pasado de "En tránsito internacional" a "En trámite aduanal"\n` +
                  `**Ubicación actual:** Terminal de Aduanas, Long Beach\n` +
                  `**Último evento:** Arribo a puerto de destino (${new Date().toLocaleDateString()})\n` +
                  `**Próximo paso:** Liberación aduanal\n` +
                  `**Tiempo estimado:** 2-3 días hábiles\n\n` +
                  `¿Deseas recibir notificaciones automáticas cuando haya cambios en el estado de este envío?`,
          role: 'assistant',
          timestamp: Date.now().toString(),
          quickReplies: [
            { label: 'Activar notificaciones', value: `Activar notificaciones para ${trackingCode}`, icon: '🔔' },
            { label: 'Ver documentos', value: `Ver documentos del envío ${trackingCode}`, icon: '📄' },
            { label: 'Contactar agente', value: 'Contactar con mi agente asignado', icon: '👨‍💼' }
          ]
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false
        }));
      }, 800);
      
      return;
    }
    
    // Verificar si es una solicitud para ver documentos de un envío
    const viewDocumentsRegex = /ver documentos del env(í|i)o ([A-Z]{3}\d{7})/i;
    const viewDocMatch = value.toLowerCase().match(viewDocumentsRegex);
    
    if (viewDocMatch && viewDocMatch[2]) {
      const trackingCode = viewDocMatch[2].toUpperCase();
      
      // Crear un mensaje del usuario
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: value,
        role: 'user',
        timestamp: Date.now().toString(),
      };

      // Actualizar el chat con el mensaje del usuario
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true
      }));

      // Simular respuesta del asistente después de un breve retraso
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          content: `📋 **Documentos disponibles para el envío ${trackingCode}**\n\n` +
                  `Aquí tienes los documentos asociados a este embarque:`,
          role: 'assistant',
          timestamp: Date.now().toString(),
          attachments: [
            SAMPLE_DOCUMENTS.bl,
            SAMPLE_DOCUMENTS.invoice,
            SAMPLE_DOCUMENTS.packing
          ],
          quickReplies: [
            { label: 'Actualizar estado', value: `Actualizar estado del envío ${trackingCode}`, icon: '🔄' },
            { label: 'Descargar todos', value: 'Descargar todos los documentos', icon: '📥' },
            { label: 'Solicitar adicionales', value: 'Necesito documentos adicionales', icon: '📋' }
          ]
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false
        }));
      }, 800);
      
      return;
    }
    
    // Verificar si la respuesta rápida es para consultar un envío
    if (value.toLowerCase().includes('consultar un envío') || value.toLowerCase().includes('consultar envío')) {
      // Crear un mensaje del usuario 
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: value,
        role: 'user',
        timestamp: Date.now().toString(),
      };

      // Actualizar el chat con el mensaje del usuario
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true
      }));

      // Simular respuesta del asistente después de un breve retraso
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          content: "Por favor ingresa el código de seguimiento de tu envío. Los códigos tienen el formato ECRxxxxxxx para exportaciones o ICRxxxxxxx para importaciones.",
          role: 'assistant',
          timestamp: Date.now().toString(),
          quickReplies: [
            { label: 'ECR2503586', value: 'Quiero consultar el envío ECR2503586', icon: '📦' },
            { label: 'ICR1982375', value: 'Quiero consultar el envío ICR1982375', icon: '📦' },
            { label: 'Cancelar', value: 'Cancelar consulta', icon: '❌' }
          ]
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false
        }));
      }, 800);
      
      return;
    }
    
    // Verificar si la respuesta rápida es para solicitar un documento
    if (value.toLowerCase().includes('modelo actualizado') || 
        value.toLowerCase().includes('documentos') || 
        value.toLowerCase().includes('certificado') ||
        value.toLowerCase().includes('declaración')) {
      
      let documentToSend: DocumentAttachment | null = null;
      
      if (value.toLowerCase().includes('bill of lading') || value.toLowerCase().includes('bl')) {
        documentToSend = SAMPLE_DOCUMENTS.bl;
      } else if (value.toLowerCase().includes('factura') || value.toLowerCase().includes('invoice')) {
        documentToSend = SAMPLE_DOCUMENTS.invoice;
      } else if (value.toLowerCase().includes('packing')) {
        documentToSend = SAMPLE_DOCUMENTS.packing;
      } else if (value.toLowerCase().includes('aduana') || value.toLowerCase().includes('customs')) {
        documentToSend = SAMPLE_DOCUMENTS.custom;
      } else if (value.toLowerCase().includes('certificado') || value.toLowerCase().includes('certificate')) {
        documentToSend = SAMPLE_DOCUMENTS.certificate;
      }
      
      if (documentToSend) {
        // Enviar el mensaje primero
        handleSendMessage(value);
        
        // Luego, después de un breve retraso, enviar la respuesta con el documento
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            id: uuidv4(),
            content: `Aquí tienes el documento solicitado. Por favor revísalo y avísame si necesitas alguna aclaración.`,
            role: 'assistant',
            timestamp: Date.now().toString(),
            attachments: [documentToSend!]
          };
          
          setChatState((prev) => ({
            ...prev,
            messages: [...prev.messages, assistantMessage],
          }));
        }, 1500);
        
        return;
      }
    }
    
    // Para el resto de casos, comportamiento normal
    handleSendMessage(value);
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-800 to-blue-900' : 'bg-gradient-to-r from-blue-500 to-blue-600'} p-4 rounded-t-lg shadow flex items-center justify-center`}>
        <div className="animate-pulse flex space-x-2">
          <div className={`h-2 w-2 rounded-full ${theme === 'dark' ? 'bg-blue-200' : 'bg-white'}`}></div>
          <div className={`h-2 w-2 rounded-full ${theme === 'dark' ? 'bg-blue-200' : 'bg-white'}`}></div>
          <div className={`h-2 w-2 rounded-full ${theme === 'dark' ? 'bg-blue-200' : 'bg-white'}`}></div>
        </div>
      </div>
      
      <div className={`flex-1 p-4 overflow-y-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} transition-all duration-300`} ref={chatContainerRef}>
        {chatState.messages.map((message, index) => (
          <div key={message.id} className="transition-all duration-500 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
            <ChatBubble 
              message={message} 
              theme={theme}
              onQuickReplySelect={handleQuickReplySelect}
            />
          </div>
        ))}

        {chatState.isLoading && (
          <div className={`flex items-center justify-center my-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="dot-typing"></div>
          </div>
        )}

        {chatState.error && (
          <div className={`text-red-500 text-sm my-2 p-2 ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'} rounded animate-shake`}>
            {chatState.error}
          </div>
        )}

        {/* Quick Reply options */}
        {quickReplyOptions.length > 0 && !chatState.isLoading && (
          <div className="mt-4 animate-slideUp">
            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Opciones rápidas:</p>
            <QuickReplies options={quickReplyOptions} onSelect={handleQuickReplySelect} theme={theme} />
          </div>
        )}
      </div>
      
      <div className={`p-4 ${theme === 'dark' ? 'border-t border-gray-700 bg-gray-800' : 'border-t bg-gray-50'} transition-all duration-300 rounded-b-lg`}>
        <ChatInput 
          onSendMessage={handleSendMessage} 
          onSendDocument={handleSendDocument}
          disabled={chatState.isLoading} 
          theme={theme}
        />
      </div>

      <style jsx global>{`
        /* Animación de puntos para indicar carga */
        .dot-typing {
          position: relative;
          width: 6px;
          height: 6px;
          border-radius: 5px;
          background-color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
          color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
          animation: dotTyping 1.5s infinite linear;
        }
        
        .dot-typing::before,
        .dot-typing::after {
          content: '';
          position: absolute;
          top: 0;
          width: 6px;
          height: 6px;
          border-radius: 5px;
          background-color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
          color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
          animation: dotTyping 1.5s infinite linear;
        }
        
        .dot-typing::before {
          left: -12px;
          animation-delay: 0s;
        }
        
        .dot-typing::after {
          left: 12px;
          animation-delay: 0.75s;
        }
        
        @keyframes dotTyping {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          25% {
            transform: scale(1.5);
            opacity: 1;
          }
          50% {
            transform: scale(1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ChatContainer; 