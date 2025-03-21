import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { companies, routes, tariffs } from '../../lib/data';
import { Route, Tariff, Company } from '../../lib/data';
import { getGeminiResponse, getSpecialRouteInfo } from '../../lib/gemini';

// Define a simple session type
interface Session {
  id: string;
  lastActivity: number;
  messages: { role: string; content: string }[];
  context: {
    lastIntention?: string;
    lastRoute?: { origin: string; destination: string };
    lastQuery?: string;
    awaitingResponse?: boolean;
  };
}

// Define ChatContext type
interface ChatContext {
  routes: Route[];
  tariffs: Tariff[];
  companies: Company[];
}

// In-memory session storage
const sessions: Map<string, Session> = new Map();

// Session cleanup (remove sessions older than 1 hour)
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActivity > 3600000) {
      sessions.delete(id);
    }
  }
}, 1800000); // Run every 30 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create session ID
    const currentSessionId = sessionId || uuidv4();

    // Check if session exists, create if not
    if (!sessions.has(currentSessionId)) {
      // Create new session
      sessions.set(currentSessionId, {
        id: currentSessionId,
        lastActivity: Date.now(),
        messages: [], // Track message history
        context: {} // Initialize context tracking
      });
    }

    // Update last accessed time
    const session = sessions.get(currentSessionId)!;
    session.lastActivity = Date.now();
    
    // Add user message to history
    session.messages.push({
      role: 'user',
      content: message
    });

    // Create context with data
    const context: ChatContext = {
      routes,
      tariffs,
      companies
    };

    try {
      // Generate a response based on the message
      const response = await generateResponse(message, context, currentSessionId, session, history);
      console.log('Generated response:', response);

      // Add response to message history
      session.messages.push({
        role: 'assistant',
        content: response
      });

      // Return the response
      res.status(200).json({
        response: response,
        sessionId: currentSessionId
      });
    } catch (error) {
      console.error('Error generating response:', error);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Generate a response based on the message and context
 */
async function generateResponse(
  message: string, 
  context: ChatContext, 
  sessionId: string, 
  session: Session,
  clientHistory?: { role: string; content: string }[]
): Promise<string> {
  // Convert to lowercase for case-insensitive matching
  const messageLower = message.toLowerCase();
  console.log('Processing message (lowercase):', messageLower);
  
  // Check if user is responding to a previous query
  if (session.context.awaitingResponse && 
      (messageLower === 'sí' || messageLower === 'si' || 
       messageLower === 'yes' || messageLower.includes('quiero') || 
       messageLower.includes('claro') || messageLower.includes('por supuesto'))) {
    
    console.log('Detected affirmative response to previous query:', session.context.lastIntention);
    
    // Handle based on previous intention
    if (session.context.lastIntention === 'quote_request') {
      // If last intention was requesting a quote
      let origin = session.context.lastRoute?.origin || '';
      let destination = session.context.lastRoute?.destination || '';
      
      if (origin && destination) {
        // Reset awaiting status but keep the route info
        session.context.awaitingResponse = false;
        
        return `¡Excelente! Para preparar su cotización personalizada para la ruta de ${origin} a ${destination}, necesito algunos detalles adicionales:

1. 📦 **Tipo de carga:** ¿Qué producto está transportando? (general, peligrosa, refrigerada)
2. 📏 **Volumen aproximado:** ¿Cuántos contenedores o kg/m³ necesita transportar?
3. 📅 **Fecha estimada:** ¿Cuándo necesitaría realizar este envío?
4. 📋 **Servicios adicionales:** ¿Requiere seguro de carga, almacenaje o despacho aduanal?

Con esta información, uno de nuestros ejecutivos preparará una cotización detallada en las próximas 24 horas. 
¿Puede proporcionarme estos detalles?`;
      }
    } else if (session.context.lastIntention === 'route_info') {
      // If last intention was providing route information
      session.context.awaitingResponse = false;
      
      // Use route information if available, or generic placeholders
      const origin = session.context.lastRoute?.origin || '';
      const destination = session.context.lastRoute?.destination || '';
      
      return `Para la ruta solicitada entre ${origin || 'origen'} y ${destination || 'destino'}, puedo ofrecerle la siguiente información:

🚢 **Opciones de transporte disponibles:**
• Transporte marítimo: Tiempo de tránsito estimado de 25-35 días
• Transporte aéreo: Tiempo de tránsito de 3-5 días
• Opciones multimodales disponibles según necesidades específicas

📅 **Frecuencia de salidas:**
• Salidas marítimas: Semanales desde principales puertos
• Salidas aéreas: Diarias desde aeropuertos principales
• Conexiones terrestres: Según programación

💰 **Información de tarifas:**
• Contenedor 20': $1,800-3,200 USD según temporada y disponibilidad
• Contenedor 40': $2,500-4,500 USD según temporada y disponibilidad
• Carga aérea: Desde $4.50/kg según volumen y urgencia

📋 **Documentación requerida:**
• Factura comercial
• Packing list
• Bill of Lading / Airway Bill
• Certificado de origen (según tipo de mercancía)

¿Necesita información más específica sobre algún aspecto de esta ruta? También puedo ayudarle con una cotización personalizada si me proporciona detalles de su carga.`;
    } else if (session.context.lastIntention === 'service_info') {
      // If last intention was providing service information  
      session.context.awaitingResponse = false;
      
      return `¡Excelente! Estamos listos para ayudarle con nuestros servicios. Para proceder, me gustaría conocer qué tipo de servicio específico le interesa más:

1. 🚢 **Transporte internacional** (marítimo/aéreo/terrestre)
2. 📝 **Servicios aduanales** (importación/exportación)
3. 💰 **Financiamiento** para importadores
4. 📦 **Almacenaje y distribución**
5. 🔍 **Consultoría** en comercio exterior

¿Cuál de estos servicios se alinea mejor con sus necesidades actuales?`;
    }
  }

  // Extract potential origin and destination locations
  const possibleLocations = extractLocations(messageLower);
  
  // Check for route information requests
  if (possibleLocations.length >= 2 || 
      (messageLower.includes('ruta') || messageLower.includes('envío') || 
       messageLower.includes('enviar') || messageLower.includes('transportar') || 
       messageLower.includes('envio') || messageLower.includes('transporte'))) {
    
    console.log('Detected route request');
    
    // Try to identify origin and destination
    let origin = '';
    let destination = '';
    
    // If we have explicit locations, use them
    if (possibleLocations.length >= 2) {
      // Try to determine which is origin and which is destination based on prepositions
      // This is a simple heuristic and might need improvement
      const messageWords = messageLower.split(' ');
      for (let i = 0; i < messageWords.length; i++) {
        if ((messageWords[i] === 'de' || messageWords[i] === 'desde') && i + 1 < messageWords.length) {
          // Look for a location after "de" or "desde"
          for (const loc of possibleLocations) {
            if (messageWords.slice(i + 1, i + 5).join(' ').includes(loc.toLowerCase())) {
              origin = loc;
              break;
            }
          }
        } else if ((messageWords[i] === 'a' || messageWords[i] === 'hacia' || messageWords[i] === 'para') && i + 1 < messageWords.length) {
          // Look for a location after "a", "hacia" or "para"
          for (const loc of possibleLocations) {
            if (messageWords.slice(i + 1, i + 5).join(' ').includes(loc.toLowerCase())) {
              destination = loc;
              break;
            }
          }
        }
      }
      
      // If we couldn't determine using prepositions, just use the first two locations
      if (!origin && !destination && possibleLocations.length >= 2) {
        origin = possibleLocations[0];
        destination = possibleLocations[1];
      } else if (origin && !destination && possibleLocations.length >= 2) {
        // If we have origin but no destination, find a location that's not the origin
        for (const loc of possibleLocations) {
          if (loc !== origin) {
            destination = loc;
            break;
          }
        }
      } else if (!origin && destination && possibleLocations.length >= 2) {
        // If we have destination but no origin, find a location that's not the destination
        for (const loc of possibleLocations) {
          if (loc !== destination) {
            origin = loc;
            break;
          }
        }
      }
    }
    
    // Save context about this route query
    session.context.lastIntention = 'quote_request';
    if (origin && destination) {
      session.context.lastRoute = { origin, destination };
    }
    session.context.awaitingResponse = true;

    // Provide multimodal options for any route
    // Format: Generate options based on origin and destination or provide generic options
    if (origin && destination) {
      return generateMultimodalOptions(origin, destination);
    } else {
      // If we couldn't determine specific locations, ask for clarification but provide general info
      return `Entiendo que está interesado en servicios de transporte. Para proporcionarle opciones específicas de rutas y tarifas, necesito conocer el origen y destino de su carga.

Ofrecemos soluciones multimodales que combinan:

1. 🚚 **Transporte terrestre** - Para movimientos locales o conexiones con puertos
2. 🚢 **Transporte marítimo** - FCL (contenedor completo) o LCL (carga consolidada)
3. ✈️ **Transporte aéreo** - Para envíos urgentes o de alto valor
4. 🚂 **Transporte ferroviario** - Para rutas específicas con alta eficiencia

¿Podría indicarme el origen y destino específicos de su carga para ofrecerle opciones más detalladas?`;
    }
  }

  // Check for Medellín in the query which is not in our routes
  if (messageLower.includes('medellín') || messageLower.includes('medellin')) {
    console.log('Found Medellín in query');
    if (messageLower.includes('shanghai') || messageLower.includes('china')) {
      // Save context about this route query
      session.context.lastIntention = 'quote_request';
      session.context.lastRoute = { 
        origin: messageLower.includes('shanghai') ? 'Shanghai' : 'China',
        destination: 'Medellín'
      };
      session.context.awaitingResponse = true;
      
      return `Para el envío entre Shanghai y Medellín, le recomendamos:

1. Ruta marítima con trasbordo:
   - Shanghai → Buenaventura (27-32 días)
   - Desembarque en Buenaventura y transporte terrestre a Medellín (2 días)
   - Costo aproximado: $2,800-3,500 USD por contenedor de 20 pies
   - Operadores principales: COSCO, Maersk, MSC

2. Ruta aérea más rápida:
   - Shanghai Pudong (PVG) → Bogotá (BOG) → Medellín (MDE)
   - Tiempo de tránsito: 2-3 días
   - Costo aproximado: $6.50-8.00 USD por kg
   - Operadores principales: Emirates SkyCargo, Qatar Airways Cargo

3. Documentos requeridos para Colombia:
   - Factura comercial
   - Packing list
   - Certificado de origen
   - Documento de transporte (BL o AWB)
   - Declaración de importación

¿Qué tipo de mercancía planea transportar? Podría requerir permisos especiales en aduana colombiana.`;
    }
  }

  // Save the current query for context
  session.context.lastQuery = message;
  
  // Default: Use Gemini API for all responses to create more fluid conversations
  try {
    console.log('Using Gemini API for response');
    
    // Preparar los mensajes para el historial
    let chatHistory = [];
    
    // Si hay historial del cliente, usarlo (dar prioridad)
    if (clientHistory && clientHistory.length > 0) {
      console.log('Using client-provided message history');
      // Convertir el formato del cliente al formato esperado por Gemini
      chatHistory = clientHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }]
      }));
    } else {
      // Si no hay historial del cliente, usar el historial de la sesión
      console.log('Using server session message history');
      // Extract previous messages for context (up to last 10 messages)
      chatHistory = session.messages
        .slice(-10)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: msg.content }]
        }));
    }
    
    // Get response from Gemini
    const geminiResponse = await getGeminiResponse(message, context, chatHistory);
    
    // Analyze the response to set appropriate context
    if (geminiResponse.toLowerCase().includes('cotización') || 
        geminiResponse.toLowerCase().includes('precio') ||
        geminiResponse.toLowerCase().includes('tarifa')) {
      session.context.lastIntention = 'quote_request';
      session.context.awaitingResponse = true;
    } else if (geminiResponse.toLowerCase().includes('ruta') || 
               geminiResponse.toLowerCase().includes('envío') ||
               geminiResponse.toLowerCase().includes('transporte')) {
      session.context.lastIntention = 'route_info';
      session.context.awaitingResponse = true;
    } else if (geminiResponse.toLowerCase().includes('servicio') ||
               geminiResponse.toLowerCase().includes('aduanal') ||
               geminiResponse.toLowerCase().includes('asesoría')) {
      session.context.lastIntention = 'service_info';
      session.context.awaitingResponse = true;
    }
    
    return geminiResponse;
  } catch (error) {
    console.error('Error in Gemini processing:', error);
    // Fallback to simple response system only if Gemini fails
    const simpleResponse = generateSimpleResponse(messageLower, context);
    
    // Analyze the response to set appropriate context
    if (simpleResponse.toLowerCase().includes('cotización') || 
        simpleResponse.toLowerCase().includes('precio')) {
      session.context.lastIntention = 'quote_request';
      session.context.awaitingResponse = true;
    } else if (simpleResponse.toLowerCase().includes('ruta') || 
               simpleResponse.toLowerCase().includes('transporte')) {
      session.context.lastIntention = 'route_info';
      session.context.awaitingResponse = true;
    }
    
    return simpleResponse;
  }
}

// Helper function to extract potential locations from a message
function extractLocations(message: string): string[] {
  const commonLocations = [
    'shanghai', 'manzanillo', 'veracruz', 'rotterdam', 'los angeles',
    'medellin', 'bogota', 'monterrey', 'mexico', 'miami', 'new york',
    'buenaventura', 'callao', 'valparaiso', 'santos', 'buenos aires',
    'shenzhen', 'hong kong', 'singapore', 'tokyo', 'hamburg', 'amberes',
    'barcelona', 'valencia', 'cartagena', 'barranquilla', 'guayaquil'
  ];
  
  return commonLocations.filter(location => message.includes(location));
}

// Helper function to determine if a query is complex
function isComplexQuery(message: string): boolean {
  // Queries that might need more complex processing
  const complexPatterns = [
    // Questions about regulations, requirements, restrictions
    /regulaci[oó]n|requisitos|restricciones|permit|licencia|certification/,
    // Questions comparing multiple options
    /comparar|comparación|mejor opci[oó]n|más económico|más rápido/,
    // Questions about special cargo
    /peligroso|hazardous|refrigerado|oversized|sobredimensionado|pesado|líquido|fragil/,
    // Questions about market conditions
    /mercado|tendencia|pronóstico|forecast|availability|disponibilidad/,
    // Queries with multiple questions
    /.*\?.*\?/,
    // Very long queries (likely complex)
    /.{150,}/
  ];
  
  return complexPatterns.some(pattern => pattern.test(message));
}

// A simple function to generate responses based on keywords
function generateSimpleResponse(message: string, context: ChatContext): string {
  // Shipping/route keywords in English and Spanish - check these first as they're more specific
  const routeKeywords = ['route', 'shipping', 'ruta', 'envío', 'envio', 'transporte', 'destino', 'origen', 'ship', 'shanghai', 'manzanillo', 'cotizar'];
  if (containsAny(message, routeKeywords)) {
    console.log('Matched route keyword');
    
    let matchedRoute = null;
    
    // Try to match both origin and destination if provided
    for (const route of context.routes) {
      const routeOrigin = route.origin.toLowerCase();
      const routeDest = route.destination.toLowerCase();
      
      if (message.includes(routeOrigin.toLowerCase()) && message.includes(routeDest.toLowerCase())) {
        matchedRoute = route;
        break;
      }
    }
    
    // If no exact match found, try to match just the destination or origin
    if (!matchedRoute) {
      for (const route of context.routes) {
        if (message.includes(route.destination.toLowerCase()) || 
            message.includes(route.origin.toLowerCase())) {
          matchedRoute = route;
          break;
        }
      }
    }
    
    if (matchedRoute) {
      // Get tariff for this route if available
      const routeTariffs = context.tariffs.filter(tariff => tariff.routeId === matchedRoute?.id);
      const baseTariff = routeTariffs.length > 0 ? routeTariffs[0].baseRate : 0;
      
      // Enhanced response with more context
      if (matchedRoute.mode === 'ocean') {
        return `Para el envío de ${matchedRoute.origin} a ${matchedRoute.destination}:

• Transporte marítimo con tiempo de tránsito de ${matchedRoute.transitTime}
• Tarifa base desde $${baseTariff} USD por contenedor
• Frecuencia de salida: ${matchedRoute.departureFrequency}
• Navieras disponibles: ${matchedRoute.carriers.join(', ')}

Información de mercado actual:
- Congestión portuaria: ${matchedRoute.congestionLevel || 'Moderada'}
- Tendencia de precios: Estable con ligero aumento por temporada
- Disponibilidad de contenedores: Normal (reservar con ${matchedRoute.recommendedLeadTime || '2 semanas'} de anticipación)

¿Desea conocer más detalles sobre documentación aduanal, seguros o financiamiento para esta ruta?`;
      } else if (matchedRoute.mode === 'air') {
        return `Para el envío de ${matchedRoute.origin} a ${matchedRoute.destination}:

• Transporte aéreo con tiempo de tránsito de ${matchedRoute.transitTime}
• Tarifa base desde $${baseTariff} USD 
• Frecuencia de salida: ${matchedRoute.departureFrequency}
• Aerolíneas de carga: ${matchedRoute.carriers.join(', ')}

Información de mercado actual:
- Capacidad disponible: Buena, sin restricciones significativas
- Tendencia de precios: Tarifas competitivas con ligera variación según peso
- Tiempo de entrega puerta a puerta: ${matchedRoute.transitTime} + 1-2 días para trámites

¿Qué tipo de mercancía planea transportar? Las restricciones y requisitos pueden variar.`;
      } else {
        return `Para el envío de ${matchedRoute.origin} a ${matchedRoute.destination}:

• Transporte ${matchedRoute.mode} con tiempo de tránsito de ${matchedRoute.transitTime}
• Tarifa base desde $${baseTariff} USD
• Frecuencia de salida: ${matchedRoute.departureFrequency}
• Operadores: ${matchedRoute.carriers.join(', ')}

Además, ofrecemos:
- Seguimiento en tiempo real de su carga
- Gestión aduanal integrada
- Seguro de carga con cobertura amplia
- Opciones de financiamiento para importadores

¿Necesita una cotización personalizada para su carga específica?`;
      }
    }
    
    const routeInfo = context.routes
      .map((route) => `- ${route.origin} a ${route.destination} (transporte ${route.mode}, ${route.transitTime})`)
      .join('\n');
    
    return `Estas son algunas de nuestras rutas de envío disponibles:\n\n${routeInfo}\n\n¿Hay alguna ruta específica sobre la que necesite más información?

También podemos crear rutas personalizadas con transbordos para destinos no listados. ¿Tiene un origen y destino específico en mente?`;
  }
  
  // Price/cost keywords in English and Spanish
  const priceKeywords = ['price', 'cost', 'tariff', 'precio', 'costo', 'tarifa', 'cuánto', 'cuanto', 'cobro', 'fee', 'charge'];
  if (containsAny(message, priceKeywords)) {
    console.log('Matched price keyword');
    
    // Check if a specific route or container type is mentioned
    let specificRoute = null;
    let containerType = null;
    
    // Check for route mentions
    for (const route of context.routes) {
      if (message.includes(route.origin.toLowerCase()) || 
          message.includes(route.destination.toLowerCase())) {
        specificRoute = route;
        break;
      }
    }
    
    // Check for container type mentions
    const containerKeywords = {
      '20ft': '20ft Standard',
      '40ft': '40ft Standard',
      'reefer': 'Reefer',
      'refriger': 'Reefer',
      'high cube': '40ft High Cube',
      'high-cube': '40ft High Cube'
    };
    
    for (const [keyword, type] of Object.entries(containerKeywords)) {
      if (message.includes(keyword)) {
        containerType = type;
        break;
      }
    }
    
    // If both route and container type are mentioned
    if (specificRoute && containerType) {
      const routeTariffs = context.tariffs.filter(tariff => 
        tariff.routeId === specificRoute.id && 
        tariff.containerType === containerType
      );
      
      if (routeTariffs.length > 0) {
        const tariff = routeTariffs[0];
        const additionalFees = tariff.additionalFees
          .map(fee => `- ${fee.name}: $${fee.amount} ${tariff.currency}`)
          .join('\n');
        
        // Enhanced response with market insights
        return `Para el envío en contenedor ${containerType} de ${specificRoute.origin} a ${specificRoute.destination}:

✅ Tarifa base: $${tariff.baseRate} ${tariff.currency}
✅ Cargos adicionales:
${additionalFees}

Total estimado: $${tariff.baseRate + tariff.additionalFees.reduce((sum, fee) => sum + fee.amount, 0)} ${tariff.currency}

📊 Análisis de mercado:
• Las tarifas están actualmente un 5% por debajo del promedio trimestral
• Previsión: Aumento probable de 8-10% en los próximos 30 días debido a temporada alta
• Disponibilidad de equipos: ${containerType === 'Reefer' ? 'Limitada (reservar con 3 semanas de anticipación)' : 'Normal (1-2 semanas)'}

💡 Recomendación: Asegurar esta tarifa dentro de los próximos 7 días aprovechando nuestro programa de bloqueo de precios.

¿Desea proceder con una cotización formal? Podemos mantener este precio garantizado por 15 días.`;
      }
    }
    
    // If only route is mentioned
    else if (specificRoute) {
      const routeTariffs = context.tariffs.filter(tariff => tariff.routeId === specificRoute.id);
      
      if (routeTariffs.length > 0) {
        const tariffOptions = routeTariffs
          .map(tariff => `- ${tariff.containerType || 'Carga general'}: $${tariff.baseRate} ${tariff.currency}`)
          .join('\n');
        
        return `Para la ruta de ${specificRoute.origin} a ${specificRoute.destination}, ofrecemos las siguientes opciones:

${tariffOptions}

Estos precios incluyen:
• Flete internacional base
• Manejo en terminal de origen y destino
• Documentación básica

No incluyen (costos aproximados):
• Despacho aduanal ($120-250 USD)
• Seguro de carga (0.3-0.5% del valor)
• Entregas en destino final ($150-500 USD dependiendo de la distancia)

¿Qué tipo de contenedor necesita para su carga? También podemos ofrecer opciones de carga fraccionada (LCL) si no requiere un contenedor completo.`;
      }
    }
    
    // If only container type is mentioned
    else if (containerType) {
      const containerTariffs = context.tariffs.filter(tariff => tariff.containerType === containerType);
      
      if (containerTariffs.length > 0) {
        const routeOptions = containerTariffs
          .map(tariff => {
            const route = context.routes.find(r => r.id === tariff.routeId);
            return route ? `- ${route.origin} a ${route.destination}: $${tariff.baseRate} ${tariff.currency}` : '';
          })
          .filter(option => option !== '')
          .join('\n');
        
        return `Para contenedores tipo ${containerType}, estas son nuestras tarifas por ruta:

${routeOptions}

Información adicional para contenedores ${containerType}:
• Peso máximo permitido: ${containerType.includes('20ft') ? '24,000 kg' : '30,480 kg'}
• Volumen aproximado: ${containerType.includes('20ft') ? '33 m³' : containerType.includes('High Cube') ? '76 m³' : '67 m³'}
• Dimensiones internas: ${containerType.includes('20ft') ? '5.90 x 2.35 x 2.39 m' : '12.03 x 2.35 x 2.39 m'}
• Tiempo de tránsito promedio: Varía según ruta (consultar detalles específicos)

¿Cuál es su ruta de interés? Podemos proporcionar un desglose completo de costos para esa opción.`;
      }
    }
    
    // General tariff information
    const tariffRanges = context.tariffs.reduce((acc, tariff) => {
      const route = context.routes.find(r => r.id === tariff.routeId);
      if (route) {
        const key = `${route.origin} - ${route.destination}`;
        if (!acc[key]) {
          acc[key] = {
            min: tariff.baseRate,
            max: tariff.baseRate,
            currency: tariff.currency,
            mode: route.mode
          };
        } else {
          acc[key].min = Math.min(acc[key].min, tariff.baseRate);
          acc[key].max = Math.max(acc[key].max, tariff.baseRate);
        }
      }
      return acc;
    }, {} as Record<string, {min: number, max: number, currency: string, mode: string}>);
    
    const tariffInfo = Object.entries(tariffRanges)
      .map(([route, range]) => `- ${route} (${range.mode}): $${range.min} - $${range.max} ${range.currency}`)
      .join('\n');
    
    return `📊 Tarifas actualizadas (última actualización: ${new Date().toLocaleDateString()}):

${tariffInfo}

Estos rangos de precios varían según:
• Tipo y tamaño de contenedor
• Temporada y disponibilidad
• Volumen de carga
• Requisitos especiales (ej. mercancía peligrosa, temperatura controlada)

Consideraciones de mercado actuales:
• Alta demanda en rutas desde Asia a América Latina (+10-15% sobre tarifa base)
• Reducción en costos para rutas desde México a EE.UU. (-5-8% por nuevos acuerdos)
• Congestiones menores en puertos del Pacífico que pueden afectar tiempos de tránsito

¿Para qué ruta específica necesita información de tarifas? Podemos proporcionar un desglose detallado y recomendaciones para optimizar costos.`;
  }
  
  // Company/business keywords in English and Spanish
  const companyKeywords = ['company', 'business', 'empresa', 'compañía', 'compania', 'negocio', 'about', 'sobre', 'nowports'];
  if (containsAny(message, companyKeywords)) {
    console.log('Matched company keyword');
    return `🚢 Nowports es un transitario digital líder en América Latina que está revolucionando el comercio global a través de tecnología innovadora.

Fundada en 2018, Nowports ha crecido rápidamente con presencia en:
• México (Monterrey, Ciudad de México, Guadalajara)
• Colombia (Bogotá, Medellín)
• Chile (Santiago, Valparaíso)
• Perú (Lima, Callao)
• Brasil (São Paulo, Santos)
• Uruguay (Montevideo)

Nuestras soluciones incluyen:
✅ Transporte internacional (marítimo, aéreo y terrestre)
✅ Despacho aduanal y cumplimiento regulatorio
✅ Seguro de carga con cobertura integral
✅ Visibilidad en tiempo real de toda la cadena logística
✅ Financiamiento para importadores y exportadores
✅ Plataforma digital para gestión centralizada de embarques

Somos reconocidos por nuestro servicio personalizado y tecnología que simplifica la logística internacional para más de 1,000 empresas en América Latina.

¿Cómo podemos ayudar a su empresa con el envío internacional?`;
  }
  
  // Contact keywords in English and Spanish
  const contactKeywords = ['contact', 'speak', 'representative', 'contacto', 'hablar', 'representante', 'call', 'llamada', 'email', 'correo'];
  if (containsAny(message, contactKeywords)) {
    console.log('Matched contact keyword');
    return `Me encantaría conectarle con uno de nuestros expertos en logística. Para agilizar el proceso, podemos proceder de estas formas:

1️⃣ Proporcione la siguiente información y un representante se pondrá en contacto en menos de 24 horas:
   • Nombre completo y empresa
   • Correo electrónico y teléfono
   • Mejor horario para contactarle
   • Breve descripción de sus necesidades logísticas

2️⃣ Comuníquese directamente con nuestro equipo:
   • Correo: sales@nowports.com
   • Teléfono: +52 81 8625 5000 (México, oficina central)
   • WhatsApp Business: +52 81 1234 5678

3️⃣ Visite nuestras oficinas:
   • Headquarters: Torre KOI, Piso 24, Av. David Alfaro Siqueiros 106, Valle Oriente, San Pedro Garza García, N.L., México

¿Cuál opción prefiere? También puedo agendar una llamada o videoconferencia con uno de nuestros especialistas.`;
  }
  
  // Check if the message is a question about services
  const serviceKeywords = ['service', 'help', 'offer', 'provide', 'servicio', 'ayuda', 'ofrece', 'provee', 'can you', 'puedes'];
  if (containsAny(message, serviceKeywords)) {
    console.log('Matched service keyword');
    return `Nowports ofrece una plataforma integral de servicios logísticos diseñados para optimizar su cadena de suministro:

🚢 Transporte Internacional
• Marítimo: FCL (contenedor completo) y LCL (carga consolidada)
• Aéreo: servicio estándar, express y chárter para cargas urgentes
• Terrestre: servicios cross-border entre México, EE.UU. y Canadá
• Servicios multimodales para rutas optimizadas

📋 Servicios Aduanales
• Clasificación arancelaria
• Preparación de documentos de importación/exportación
• Gestión de permisos y certificaciones
• Cumplimiento regulatorio y asesoría

💰 Financiamiento
• Supply Chain Financing con tasas preferenciales
• Pago de aranceles e impuestos
• Factoraje para exportadores
• Líneas de crédito para importadores

📱 Plataforma Digital
• Visibilidad end-to-end de sus embarques
• Gestión documental centralizada
• Análisis y reportes personalizados
• Integración API con su ERP

🛡️ Seguros y Protección
• Cobertura puerta a puerta
• Seguro para mercancías especiales
• Reclamaciones simplificadas

¿En qué servicio específico está interesado? Puedo proporcionarle información más detallada.`;
  }
  
  // Check if it's about container types
  const containerKeywords = ['container', 'box', 'contenedor', 'caja', '20ft', '40ft', 'refrigerated', 'refrigerado', 'reefer'];
  if (containsAny(message, containerKeywords)) {
    console.log('Matched container keyword');
    return `En Nowports gestionamos todos los tipos estándar de contenedores, cada uno adaptado a necesidades específicas:

📦 Contenedores Dry (Secos):
• 20' Standard: 33m³, ideal para cargas pesadas (max. 28 tons)
• 40' Standard: 67m³, óptimo para volumen
• 40' High Cube: 76m³, altura adicional (2.70m vs 2.40m)

🧊 Contenedores Refrigerados (Reefer):
• 20' Reefer: Rango de temperatura -30°C a +30°C
• 40' Reefer: Mayor capacidad, mismo rango de temperatura
• Monitoreo constante de temperatura y humedad

📐 Contenedores Especiales:
• Flat Rack: Para cargas sobredimensionadas
• Open Top: Carga superior para mercancías altas
• Tank Container: Para líquidos a granel
• Flexi-tank: Solución económica para líquidos no peligrosos

Cada tipo tiene especificaciones precisas de carga máxima, dimensiones y restricciones.

¿Qué tipo de mercancía está planeando transportar? Podemos recomendarle la opción más adecuada y costo-eficiente.`;
  }
  
  // Data request keywords
  const dataKeywords = ['datos', 'información', 'detalles', 'necesito', 'data', 'information', 'details', 'need'];
  if (containsAny(message, dataKeywords)) {
    console.log('Matched data request keyword');
    return `Para ofrecerle una cotización precisa y optimizada, necesitamos conocer:

📍 Información de Ruta:
• Origen exacto (ciudad/puerto/aeropuerto)
• Destino final (incluyendo dirección si requiere entrega)
• Fecha estimada de disponibilidad de la carga
• Incoterm preferido (FOB, CIF, DDP, etc.)

📦 Detalles de la Carga:
• Naturaleza de la mercancía (descripción general)
• Clasificación HS Code (si la conoce)
• Dimensiones y peso total
• Valor comercial aproximado
• Mercancía peligrosa (sí/no, clase IMO si aplica)

🚢 Preferencias de Servicio:
• Tipo de contenedor o modalidad (FCL/LCL/aéreo)
• Cantidad de contenedores (si aplica)
• Servicios adicionales requeridos (despacho aduanal, seguro, etc.)
• Requisitos especiales (temperatura controlada, permisos específicos)

👤 Información de Contacto:
• Nombre de empresa y persona de contacto
• Correo electrónico y teléfono
• Mejor horario para comunicarnos

Puede proporcionarnos esta información ahora o completarla posteriormente con uno de nuestros ejecutivos. ¿Le gustaría proceder con una cotización personalizada?`;
  }
  
  // Greeting keywords in English and Spanish - check these last as they're more general
  const greetingKeywords = ['hello', 'hi', 'hey', 'hola', 'saludos', 'buenos días', 'buenas'];
  if (containsAny(message, greetingKeywords) && message.length < 20) {
    console.log('Matched greeting keyword');
    return `¡Hola! Soy el asistente virtual de Nowports, especializado en soluciones logísticas internacionales.

Puedo ayudarle con:
• Información sobre rutas y servicios
• Cotizaciones preliminares
• Seguimiento de embarques
• Requisitos documentales
• Conectarle con nuestros expertos

¿Cómo puedo asistirle hoy con sus necesidades logísticas?`;
  }
  
  console.log('No keywords matched, using default response');
  // Default response
  return `Gracias por su mensaje. Como su asistente logístico, estoy aquí para:

• Proporcionarle información sobre nuestras rutas de envío
• Ofrecer cotizaciones preliminares
• Explicarle nuestros servicios de transporte internacional
• Compartir detalles sobre procesos aduaneros
• Conectarle con especialistas para casos complejos

Nowports simplifica la logística internacional con tecnología y servicio personalizado. 

¿Podría proporcionarme más detalles sobre su consulta? Mientras más específica sea su pregunta, mejor podré asistirle.`;
}

// Helper function to check if message contains any of the keywords
function containsAny(message: string, keywords: string[]): boolean {
  return keywords.some(keyword => message.includes(keyword));
}

/**
 * Generates multimodal transportation options for a given origin and destination
 */
function generateMultimodalOptions(origin: string, destination: string): string {
  // Check if we have special route information first
  const specialRouteInfo = getSpecialRouteInfo(origin, destination);
  if (specialRouteInfo) {
    return specialRouteInfo;
  }
  
  // Generic multimodal options based on the origin and destination
  let options = `Para su envío de **${origin}** a **${destination}**, le ofrecemos las siguientes opciones multimodales:

## Opción 1: Solución Estándar
**Ruta:** ${origin} → ${destination}
- **Tiempo de tránsito estimado:** 15-20 días
- **Costo aproximado:** $1,800-2,400 USD (contenedor de 20')
- **Incluye:** Transporte terrestre en origen y destino + transporte marítimo principal
- **Incoterm recomendado:** CIF o FOB
- **Documentación:** BL, factura comercial, packing list, certificado de origen

## Opción 2: Solución Express
**Ruta:** ${origin} → ${destination} (vía aérea)
- **Tiempo de tránsito estimado:** 4-6 días
- **Costo aproximado:** $4.50-6.00 USD por kg
- **Incluye:** Pick-up en origen, transporte aéreo, entrega en destino
- **Incoterm recomendado:** DDP o DAP
- **Documentación:** AWB, factura comercial, packing list

## Opción 3: Solución Multimodal Optimizada
**Ruta:** 
1. ${origin} → [Puerto/Aeropuerto cercano] (terrestre)
2. [Puerto/Aeropuerto cercano] → [Puerto/Aeropuerto destino] (marítimo/aéreo)
3. [Puerto/Aeropuerto destino] → ${destination} (terrestre)
- **Tiempo de tránsito estimado:** 12-18 días
- **Costo aproximado:** $2,100-2,800 USD (contenedor de 20')
- **Incluye:** Gestión aduanal en origen y destino, seguro de carga
- **Incoterm recomendado:** DDP (entrega con derechos pagados)

### Servicios adicionales disponibles:
- 🔒 Seguro de carga integral (0.35% - 0.5% del valor declarado)
- 📦 Almacenaje temporal en origen o destino
- 📋 Gestión documental completa
- 🛃 Despacho aduanal prioritario
- 📱 Tracking en tiempo real

¿Cuál de estas opciones se ajusta mejor a sus necesidades? ¿O prefiere que elaboremos una solución más personalizada para su caso específico?`;

  return options;
} 