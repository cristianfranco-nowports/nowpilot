import React, { useState, useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import QuickReplies from './QuickReplies';
import { ChatMessage, ChatState, DocumentAttachment } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';

interface ChatContainerProps {
  theme?: 'light' | 'dark';
}

interface QuickReplyOption {
  label: string;
  value: string;
  icon?: string;
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
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    loading: false,
    error: null,
    sessionId: null,
  });
  const [quickReplyOptions, setQuickReplyOptions] = useState<QuickReplyOption[]>([]);
  const [quoteForm, setQuoteForm] = useState<QuoteFormState>({
    active: false,
    step: 0
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
    const welcomeMessage: ChatMessage = {
      id: 'welcome-msg',
      content: 'Hello! I\'m the Nowports sales assistant. How can I help you with your logistics needs today?',
      role: 'assistant',
      timestamp: Date.now().toString(),
    };
    
    setChatState((prev) => ({
      ...prev,
      messages: [welcomeMessage],
    }));

    // Set initial quick reply options
    setQuickReplyOptions([
      { label: 'Cotizar envío', value: 'Quiero cotizar un envío', icon: '📦' },
      { label: 'Consultar envío', value: 'Quiero consultar el estado de un envío', icon: '🔍' },
      { label: 'Operaciones', value: 'Necesito ayuda con operaciones', icon: '🛠️' },
      { label: 'Rutas disponibles', value: 'Qué rutas tienen disponibles', icon: '🗺️' },
    ]);
  }, []);

  // Manejar la progresión del formulario de cotización
  const handleQuoteFormProgress = (userInput: string) => {
    setQuoteForm(prev => {
      const newForm = { ...prev };
      
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
    
    switch (quoteForm.step) {
      case 1:
        assistantMessage = {
          id: uuidv4(),
          content: "Para iniciar la cotización, necesito algunos datos. ¿Cuál es el origen de tu carga? (Ciudad y país)",
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
          content: `Origen: ${quoteForm.origin}. Ahora, ¿cuál es el destino de tu carga? (Ciudad y país)`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        options = [
          { label: 'Miami, EE.UU.', value: 'Miami, EE.UU.', icon: '📍' },
          { label: 'Rotterdam, Países Bajos', value: 'Rotterdam, Países Bajos', icon: '📍' },
          { label: 'Manzanillo, México', value: 'Manzanillo, México', icon: '📍' },
        ];
        break;
      case 3:
        assistantMessage = {
          id: uuidv4(),
          content: `Destino: ${quoteForm.destination}. ¿Qué modalidad de transporte prefieres?`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        options = [
          { label: 'Marítimo', value: 'Marítimo', icon: '🚢' },
          { label: 'Aéreo', value: 'Aéreo', icon: '✈️' },
          { label: 'Terrestre', value: 'Terrestre', icon: '🚚' },
        ];
        break;
      case 4:
        assistantMessage = {
          id: uuidv4(),
          content: `Modalidad: ${quoteForm.mode === 'maritime' ? 'Marítimo 🚢' : quoteForm.mode === 'air' ? 'Aéreo ✈️' : 'Terrestre 🚚'}. ¿Cuál es el peso total de la carga? (en kg)`,
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
          content: `Peso: ${quoteForm.weight}. ¿Cuál es la cantidad de bultos o contenedores?`,
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
          content: `Cantidad: ${quoteForm.quantity}. ¿Cuáles son las dimensiones? (largo x ancho x alto en cm)`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        options = [
          { label: 'Contenedor 20\'', value: 'Contenedor estándar de 20 pies', icon: '📏' },
          { label: 'Contenedor 40\'', value: 'Contenedor estándar de 40 pies', icon: '📏' },
          { label: 'Personalizado', value: 'Medidas personalizadas', icon: '📏' },
        ];
        break;
      case 7:
        assistantMessage = {
          id: uuidv4(),
          content: `Dimensiones: ${quoteForm.dimensions}. ¿Qué tipo de carga es y su código HS (si lo conoces)?`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        options = [
          { label: 'Electrónicos', value: 'Productos electrónicos', icon: '💻' },
          { label: 'Textiles', value: 'Productos textiles', icon: '👕' },
          { label: 'Alimentos', value: 'Productos alimenticios', icon: '🍎' },
        ];
        break;
      case 8:
        assistantMessage = {
          id: uuidv4(),
          content: `Tipo de carga: ${quoteForm.cargoType}. ¿Qué término de negociación (Incoterm) prefieres?`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        options = [
          { label: 'FOB', value: 'FOB (Free On Board)', icon: '📄' },
          { label: 'CIF', value: 'CIF (Cost, Insurance and Freight)', icon: '📄' },
          { label: 'EXW', value: 'EXW (Ex Works)', icon: '📄' },
        ];
        break;
      case 9:
        assistantMessage = {
          id: uuidv4(),
          content: `Incoterm: ${quoteForm.incoterm}. ¿Tienes alguna nota o requerimiento adicional?`,
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
          content: `¡Gracias! He recopilado todos los datos para tu cotización. Enviaré esta información a nuestro equipo y te contactaremos pronto con los detalles.`,
          role: 'assistant',
          timestamp: Date.now().toString(),
        };
        break;
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
        step: 1
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
      loading: true,
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
        loading: false,
        sessionId: data.sessionId,
      }));

      // Extraer y configurar opciones de respuesta rápida
      const options = extractQuickReplyOptions(responseContent);
      setQuickReplyOptions(options);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatState((prev) => ({
        ...prev,
        loading: false,
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
      loading: true,
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
        loading: false,
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
      <div className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} p-4 rounded-t-lg shadow`}>
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Nowports Sales Assistant</h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Ask me about logistics, shipping routes, and how Nowports can help your business
        </p>
      </div>
      
      <div 
        ref={chatContainerRef}
        className={`flex-1 p-4 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      >
        {chatState.messages.map((message) => (
          <ChatBubble key={message.id} message={message} theme={theme} />
        ))}
        
        {quickReplyOptions.length > 0 && !chatState.loading && (
          <QuickReplies 
            options={quickReplyOptions} 
            onSelect={handleQuickReplySelect} 
            theme={theme} 
          />
        )}
        
        {chatState.loading && (
          <div className={`flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} ml-2 mt-2`}>
            <div className="loading-dots flex space-x-1">
              <div className={`w-2 h-2 ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-400'} rounded-full animate-bounce delay-75`}></div>
              <div className={`w-2 h-2 ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-400'} rounded-full animate-bounce delay-100`}></div>
              <div className={`w-2 h-2 ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-400'} rounded-full animate-bounce delay-150`}></div>
            </div>
          </div>
        )}

        {chatState.error && (
          <div className={`text-red-500 text-sm my-2 p-2 ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'} rounded`}>
            {chatState.error}
          </div>
        )}
      </div>
      
      <div className={`p-4 ${theme === 'dark' ? 'border-t border-gray-700' : 'border-t'}`}>
        <ChatInput 
          onSendMessage={handleSendMessage} 
          onSendDocument={handleSendDocument}
          disabled={chatState.loading} 
          theme={theme}
        />
      </div>
    </div>
  );
};

export default ChatContainer; 