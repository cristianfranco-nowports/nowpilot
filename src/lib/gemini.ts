/**
 * Servicio de integración con Google Gemini para respuestas más inteligentes
 */

import { config } from './config';

// URL base de la API de Gemini
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Obtiene la API key del entorno
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

/**
 * Interfaz para el historial de mensajes de chat
 */
interface ChatMessage {
  role: "user" | "model";
  parts: {
    text: string;
  }[];
}

// Type for special route information that's not in our standard routes
export interface SpecialRoute {
  origin: string;
  destination: string;
  transitTime: string;
  cost: string;
  notes: string;
}

// Cache for special routes that we know about but aren't in our standard routes data
const specialRoutes: Record<string, SpecialRoute> = {
  'shanghai-medellin': {
    origin: 'Shanghai',
    destination: 'Medellín',
    transitTime: '29-34 días',
    cost: '$2,800-3,500 USD por contenedor de 20 pies',
    notes: 'Ruta marítima con trasbordo en Buenaventura y transporte terrestre a Medellín'
  },
  'medellin-shanghai': {
    origin: 'Medellín',
    destination: 'Shanghai',
    transitTime: '32-36 días',
    cost: '$3,000-3,800 USD por contenedor de 20 pies',
    notes: 'Ruta marítima con trasbordo en Buenaventura y procesamiento en aduanas de China'
  },
  'buenaventura-medellin': {
    origin: 'Buenaventura',
    destination: 'Medellín',
    transitTime: '2 días',
    cost: '$600-800 USD por contenedor',
    notes: 'Transporte terrestre a través de la Cordillera Occidental'
  },
  'shanghai-cartagena': {
    origin: 'Shanghai',
    destination: 'Cartagena',
    transitTime: '30-35 días',
    cost: '$2,600-3,400 USD por contenedor de 20 pies',
    notes: 'Ruta marítima directa con principales navieras como Maersk, MSC y CMA CGM'
  },
  'miami-bogota': {
    origin: 'Miami',
    destination: 'Bogotá',
    transitTime: '8-12 días',
    cost: '$1,800-2,400 USD por contenedor de 20 pies',
    notes: 'Ruta marítima hasta Cartagena o Barranquilla y transporte terrestre a Bogotá'
  },
  'rotterdam-buenos-aires': {
    origin: 'Rotterdam',
    destination: 'Buenos Aires',
    transitTime: '22-28 días',
    cost: '$2,500-3,300 USD por contenedor de 20 pies',
    notes: 'Ruta marítima directa con principales navieras europeas'
  }
};

/**
 * Genera una respuesta usando Gemini para una consulta de logística
 */
export async function getGeminiResponse(
  query: string,
  context: any,
  chatHistory: ChatMessage[] = []
): Promise<string> {
  try {
    // Si no hay API key, fallback a respuesta local
    if (!GEMINI_API_KEY) {
      console.warn("No Gemini API key found. Using fallback response.");
      return getFallbackResponse(query, context);
    }
    
    // Crear un resumen de datos de rutas y tarifas del contexto
    const routeSummary = context.routes.map((route: any) => 
      `- Ruta ${route.origin} a ${route.destination}: ${route.mode}, ${route.transitTime}, carriers: ${route.carriers.join(', ')}`
    ).join('\n');
    
    const tariffSummary = context.tariffs.map((tariff: any) => {
      const route = context.routes.find((r: any) => r.id === tariff.routeId);
      return route ? 
        `- Tarifa para ${route.origin} a ${route.destination}, ${tariff.containerType || 'general'}: $${tariff.baseRate} ${tariff.currency}` : '';
    }).filter((t: string) => t !== '').join('\n');
    
    // Información de los principales Incoterms
    const incotermsInfo = `
Incoterms principales:
- EXW (Ex Works): El vendedor pone la mercancía a disposición del comprador en sus instalaciones
- FOB (Free On Board): El vendedor entrega la mercancía a bordo del buque designado por el comprador
- CIF (Cost, Insurance and Freight): El vendedor paga el flete y seguro hasta el puerto de destino
- DDP (Delivered Duty Paid): El vendedor asume todos los costos y riesgos hasta el lugar de destino
`;

    // Información sobre contenedores
    const containersInfo = `
Tipos de contenedores principales:
- Dry Container 20ft: 33m³, capacidad 28 tons
- Dry Container 40ft: 67m³, capacidad 30 tons
- High Cube 40ft: 76m³, mayor altura (2.70m)
- Reefer: Para mercancías con temperatura controlada
- Flat Rack: Para cargas sobredimensionadas
- Open Top: Techo abierto para cargas altas
- Tank Container: Para líquidos a granel
`;

    // Información sobre cadena logística y modalidades
    const logisticsInfo = `
Modalidades de transporte:
- FCL (Full Container Load): Contenedor completo para un solo cliente
- LCL (Less than Container Load): Carga consolidada de varios clientes
- Air Freight: Carga aérea, más rápida pero más costosa
- Break Bulk: Cargas no contenedorizadas
- RoRo: Roll-on/Roll-off para vehículos

Cadena de suministro:
- Factory: Inicio de la cadena, donde se produce la mercancía
- First Carrier: Primer transporte, normalmente terrestre hasta puerto o aeropuerto
- Origin Port: Puerto o aeropuerto de salida
- Main Carrier: Transporte principal internacional (buque/avión)
- Destination Port: Puerto o aeropuerto de llegada
- Last Mile: Entrega final al destino del cliente
`;

    // Construir el prompt con contexto de Nowports y toda la información adicional
    const systemPrompt = `Eres un asistente virtual especializado en ventas de Nowports, una plataforma logística para comercio internacional.
Tu objetivo es proporcionar información precisa, directa y útil sobre rutas marítimas, tarifas, tiempos de tránsito y servicios logísticos.

INFORMACIÓN SOBRE NOWPORTS:
- Nowports es un transitario digital que facilita el comercio internacional con tecnología innovadora
- Ofrece servicios de transporte marítimo, aéreo y terrestre
- Proporciona despacho aduanal y servicios de financiamiento
- Opera principalmente en América Latina con oficinas en México, Colombia, Chile, Brasil, Perú y Uruguay
- Tiene conexiones con los principales puertos del mundo
- Especializado en rutas entre Asia, Europa, Norteamérica y Latinoamérica

DATOS DE RUTAS Y TARIFAS DISPONIBLES:
${routeSummary}

INFORMACIÓN DE TARIFAS:
${tariffSummary}

${incotermsInfo}

${containersInfo}

${logisticsInfo}

SERVICIOS NOWPORTS:
- Transporte internacional (marítimo, aéreo, terrestre)
- Agenciamiento aduanal y gestión de documentos
- Seguro de carga internacional
- Financiamiento para importadores
- Tracking en tiempo real
- Almacenaje y distribución local
- Consultoría en comercio exterior

REGLAS IMPORTANTES:
1. Sé directo y conciso. Proporciona información específica sin divagar.
2. Usa listas con viñetas y formatos claros para presentar datos.
3. Incluye siempre números concretos: costos, tiempos, dimensiones o capacidades.
4. Cuando no tengas información específica, usa los rangos de datos proporcionados como referencia.
5. Personaliza la información según la consulta específica del usuario.
6. Mantén un tono profesional, usando emojis solo para organizar visualmente la información.
7. Evita frases vacías y genéricas.
8. Usa la información de las rutas y tarifas proporcionadas cuando sea relevante para la consulta.
9. Explica términos técnicos si es apropiado, pero mantén un nivel profesional.
10. Siempre ofrece próximos pasos claros para el usuario.

CONSULTA DEL USUARIO:
"${query}"

Ahora responde a la consulta del usuario de manera directa, precisa y orientada a ventas, utilizando la información proporcionada.`;

    // Preparar el prompt con toda la información
    const promptText = `${systemPrompt}\n\nUsuario: ${query}`;

    // Llamada a la API de Gemini usando el nuevo formato
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extraer la respuesta de Gemini para el nuevo formato de respuesta
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0]
    ) {
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error("Formato de respuesta no esperado de Gemini");
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return getFallbackResponse(query, context);
  }
}

/**
 * Proporciona una respuesta local en caso de que Gemini no esté disponible
 */
function getFallbackResponse(query: string, context: any): string {
  // Lógica simple para generar una respuesta basada en palabras clave
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes("ruta") || queryLower.includes("enviar") || queryLower.includes("shipping")) {
    return `Ofrecemos múltiples rutas de transporte internacional adaptadas a sus necesidades. 
Para proporcionarle información específica sobre tarifas y tiempos de tránsito, necesitaríamos conocer:

1. 🚚 Origen de su carga
2. 📦 Destino de entrega
3. 📏 Volumen aproximado (contenedor completo o carga parcial)
4. 📅 Fecha estimada de embarque

¿Podría proporcionarme estos datos para ofrecerle opciones más precisas?`;
  }
  
  if (queryLower.includes("precio") || queryLower.includes("costo") || queryLower.includes("tarifa")) {
    return `Las tarifas de transporte internacional varían según varios factores:

- Ruta (origen y destino)
- Volumen de carga
- Tipo de mercancía
- Temporada
- Servicios adicionales requeridos

Actualmente, nuestras tarifas para contenedores de 20 pies en rutas principales oscilan entre $1,800 y $3,500 USD.

Para proporcionarle una cotización precisa, necesitaríamos más detalles sobre su envío específico. ¿Podría indicarme la ruta y el tipo de carga que desea transportar?`;
  }
  
  if (queryLower.includes("tiempo") || queryLower.includes("duración") || queryLower.includes("tránsito")) {
    return `Los tiempos de tránsito dependen de la ruta específica y el modo de transporte:

🚢 Marítimo:
- Asia a Latinoamérica: 25-40 días
- Europa a Latinoamérica: 18-30 días
- EEUU a Latinoamérica: 8-15 días

✈️ Aéreo:
- Intercontinental: 2-5 días
- Regional: 1-3 días

Para obtener un tiempo de tránsito exacto para su ruta, necesitaríamos conocer el origen y destino específicos. ¿Podría proporcionarme esta información?`;
  }
  
  if (queryLower.includes("servicio") || queryLower.includes("ofrecen")) {
    return `En Nowports ofrecemos una gama completa de servicios logísticos:

1. 🚢 **Transporte internacional** - Marítimo, aéreo y terrestre
2. 📝 **Agenciamiento aduanal** - Gestión de documentos y trámites
3. 💰 **Financiamiento** - Capital de trabajo para importadores
4. 🔍 **Visibilidad** - Seguimiento en tiempo real de su carga
5. 🏭 **Almacenaje** - Servicios de depósito y distribución

¿Hay algún servicio específico sobre el que le gustaría obtener más información?`;
  }
  
  // Respuesta genérica
  return `¡Gracias por contactar a Nowports! Estamos aquí para ayudarle con sus necesidades logísticas.

¿Cómo podemos asistirle hoy?
- ¿Busca información sobre rutas y tarifas?
- ¿Necesita asesoría sobre opciones de transporte?
- ¿Requiere un servicio específico como despacho aduanal o financiamiento?

Por favor, proporciónenos más detalles y con gusto le asistiremos.`;
}

/**
 * Obtiene información sobre rutas especiales que no están en nuestros datos estándar
 */
export function getSpecialRouteInfo(origin: string, destination: string): string {
  // Normalizar origen y destino a minúsculas
  const originLower = origin.toLowerCase();
  const destinationLower = destination.toLowerCase();
  
  // Buscar en ambas direcciones
  const key1 = `${originLower}-${destinationLower}`;
  const key2 = `${destinationLower}-${originLower}`;
  
  // Obtener la ruta especial si existe
  let route = specialRoutes[key1];
  
  // Si no existe en una dirección, verificar en la otra
  if (!route) {
    route = specialRoutes[key2];
    // Si existe en la dirección inversa, indicarlo
    if (route) {
      return `Para la ruta de ${destination} a ${origin} (ruta inversa):

• Tiempo de tránsito: ${route.transitTime}
• Costo aproximado: ${route.cost}
• Nota: ${route.notes}

Para la ruta específica de ${origin} a ${destination}, le sugerimos contactar a nuestro equipo para una cotización personalizada, ya que las tarifas y tiempos pueden variar.`;
    }
  } else {
    return `Para la ruta de ${origin} a ${destination}:

• Tiempo de tránsito: ${route.transitTime}
• Costo aproximado: ${route.cost}
• Nota: ${route.notes}

¿Desea obtener más detalles o una cotización personalizada para esta ruta?`;
  }
  
  // Si no existe en ninguna dirección, generar información sintética
  return generateSyntheticRouteInfo(origin, destination);
}

/**
 * Genera información sintética para rutas que no tenemos en nuestros datos
 */
function generateSyntheticRouteInfo(origin: string, destination: string): string {
  const getRegion = (location: string): string => {
    const locationLower = location.toLowerCase();
    
    // Asia
    if (locationLower.includes('shanghai') || locationLower.includes('shenzhen') || 
        locationLower.includes('hong kong') || locationLower.includes('busan') || 
        locationLower.includes('tokyo') || locationLower.includes('ningbo') || 
        locationLower.includes('singapore')) {
      return 'Asia';
    }
    
    // Europa
    if (locationLower.includes('rotterdam') || locationLower.includes('hamburg') || 
        locationLower.includes('antwerp') || locationLower.includes('valencia') || 
        locationLower.includes('barcelona') || locationLower.includes('genoa') || 
        locationLower.includes('marseille')) {
      return 'Europa';
    }
    
    // Norteamérica
    if (locationLower.includes('los angeles') || locationLower.includes('new york') || 
        locationLower.includes('miami') || locationLower.includes('houston') || 
        locationLower.includes('vancouver') || locationLower.includes('montreal')) {
      return 'Norteamérica';
    }
    
    // Latinoamérica
    if (locationLower.includes('manzanillo') || locationLower.includes('veracruz') || 
        locationLower.includes('santos') || locationLower.includes('buenos aires') || 
        locationLower.includes('valparaiso') || locationLower.includes('callao') || 
        locationLower.includes('cartagena') || locationLower.includes('medellin') || 
        locationLower.includes('ciudad de panama') || locationLower.includes('guayaquil')) {
      return 'Latinoamérica';
    }
    
    // Por defecto
    return 'Otra región';
  };
  
  const originRegion = getRegion(origin);
  const destinationRegion = getRegion(destination);
  
  // Estimar tiempo de tránsito basado en regiones
  let transitTime = '25-30 días';
  let cost = '$2,500-3,500 USD por contenedor de 20 pies';
  let frequency = 'semanal';
  
  if (originRegion === 'Latinoamérica' && destinationRegion === 'Latinoamérica') {
    transitTime = '7-15 días';
    cost = '$1,500-2,200 USD por contenedor de 20 pies';
    frequency = 'cada 3-4 días';
  } else if ((originRegion === 'Latinoamérica' && destinationRegion === 'Norteamérica') || 
             (originRegion === 'Norteamérica' && destinationRegion === 'Latinoamérica')) {
    transitTime = '8-18 días';
    cost = '$1,800-2,400 USD por contenedor de 20 pies';
    frequency = 'semanal';
  } else if ((originRegion === 'Latinoamérica' && destinationRegion === 'Europa') || 
             (originRegion === 'Europa' && destinationRegion === 'Latinoamérica')) {
    transitTime = '18-28 días';
    cost = '$2,200-3,200 USD por contenedor de 20 pies';
    frequency = 'semanal';
  } else if ((originRegion === 'Latinoamérica' && destinationRegion === 'Asia') || 
             (originRegion === 'Asia' && destinationRegion === 'Latinoamérica')) {
    transitTime = '30-45 días';
    cost = '$2,800-3,800 USD por contenedor de 20 pies';
    frequency = 'cada 10-15 días';
  } else if ((originRegion === 'Norteamérica' && destinationRegion === 'Europa') || 
             (originRegion === 'Europa' && destinationRegion === 'Norteamérica')) {
    transitTime = '12-20 días';
    cost = '$2,000-2,800 USD por contenedor de 20 pies';
    frequency = 'cada 3-4 días';
  } else if ((originRegion === 'Norteamérica' && destinationRegion === 'Asia') || 
             (originRegion === 'Asia' && destinationRegion === 'Norteamérica')) {
    transitTime = '20-35 días';
    cost = '$2,500-3,500 USD por contenedor de 20 pies';
    frequency = 'semanal';
  } else if ((originRegion === 'Europa' && destinationRegion === 'Asia') || 
             (originRegion === 'Asia' && destinationRegion === 'Europa')) {
    transitTime = '28-40 días';
    cost = '$2,400-3,400 USD por contenedor de 20 pies';
    frequency = 'semanal';
  }
  
  return `Para la ruta de ${origin} a ${destination}:

• Estimación de tiempo de tránsito: ${transitTime}
• Tarifa aproximada: ${cost}
• Frecuencia de salidas: ${frequency}
• Nota: Esta es una estimación basada en rutas similares. Para una cotización exacta, necesitaríamos más detalles sobre su carga.

¿Le gustaría recibir una cotización personalizada para esta ruta?`;
} 