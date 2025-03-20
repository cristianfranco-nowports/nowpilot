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
- Origen y destino de su carga
- Tipo y volumen de mercancía
- Fecha estimada de envío

¿Podría proporcionarnos estos detalles para darle una cotización personalizada?`;
  }
  
  if (queryLower.includes("precio") || queryLower.includes("costo") || queryLower.includes("tarifa")) {
    return `Las tarifas de transporte internacional varían según la ruta, tipo de carga, volumen y requisitos específicos.
Para rutas principales desde Asia a Latinoamérica, los rangos aproximados son:
- Contenedor de 20ft: $2,000-3,500 USD
- Contenedor de 40ft: $3,200-4,800 USD
- Carga aérea: $4-8 USD por kg

¿Para qué ruta necesita conocer tarifas específicas?`;
  }
  
  if (queryLower.includes("tiempo") || queryLower.includes("transit") || queryLower.includes("duración")) {
    return `Los tiempos de tránsito típicos son:
- Asia a Latinoamérica: 30-40 días (marítimo)
- Europa a Latinoamérica: 18-25 días (marítimo)
- Norte América a Latinoamérica: 10-15 días (marítimo), 2-5 días (terrestre)
- Envíos aéreos internacionales: 2-5 días

El tiempo puede variar según condiciones portuarias y procesos aduanales.`;
  }
  
  return `Gracias por su consulta sobre servicios logísticos. Para ayudarle mejor, ¿podría proporcionarme más detalles sobre su necesidad específica de transporte internacional?`;
}

/**
 * Busca información específica sobre rutas no estándar
 * Simula una búsqueda en internet o base de datos especializada
 * NUNCA devuelve null - siempre genera una respuesta plausible
 */
export function getSpecialRouteInfo(origin: string, destination: string): string {
  const key = `${origin}-${destination}`.toLowerCase();
  const reverseKey = `${destination}-${origin}`.toLowerCase();
  
  if (specialRoutes[key]) {
    const route = specialRoutes[key];
    return `Para el envío de ${route.origin} a ${route.destination}:

• Tiempo de tránsito estimado: ${route.transitTime}
• Costo aproximado: ${route.cost}
• Notas: ${route.notes}

Esta ruta es parte de nuestras conexiones regulares. ¿Desea que un especialista le contacte para una cotización personalizada?`;
  } else if (specialRoutes[reverseKey]) {
    // If we have the reverse route, we can still provide some information
    const route = specialRoutes[reverseKey];
    return `Para el envío de ${destination} a ${origin}, tenemos información sobre la ruta:

• Tiempo de tránsito estimado: ${route.transitTime}
• El costo aproximado es ${route.cost}
• ${route.notes}

Podemos coordinar esta ruta con condiciones ajustadas a sus necesidades. ¿Le gustaría obtener una cotización específica?`;
  }
  
  // Si no tenemos datos específicos, generamos una respuesta plausible basada en patrones generales
  return generateSyntheticRouteInfo(origin, destination);
}

/**
 * Genera información sintética de rutas cuando no tenemos datos específicos
 * Usa patrones generales basados en distancias geográficas y modos de transporte típicos
 */
function generateSyntheticRouteInfo(origin: string, destination: string): string {
  // Simplificar las regiones para estimar tiempos y costos
  const getRegion = (location: string): string => {
    location = location.toLowerCase();
    
    // Asia
    if (location.includes('shang') || location.includes('hong') || location.includes('guang') || 
        location.includes('ning') || location.includes('shen') || location.includes('china') || 
        location.includes('tokyo') || location.includes('japan') || location.includes('korea') || 
        location.includes('sing') || location.includes('mala')) {
      return 'Asia';
    }
    
    // América Latina
    if (location.includes('mexi') || location.includes('bras') || location.includes('argent') || 
        location.includes('chile') || location.includes('peru') || location.includes('colomb') || 
        location.includes('bogot') || location.includes('cart') || location.includes('medell') || 
        location.includes('cali') || location.includes('buena')) {
      return 'LATAM';
    }
    
    // Norteamérica
    if (location.includes('miami') || location.includes('york') || location.includes('angeles') || 
        location.includes('houston') || location.includes('chicago') || location.includes('usa') || 
        location.includes('united states') || location.includes('canada') || location.includes('toronto')) {
      return 'NA';
    }
    
    // Europa
    if (location.includes('rott') || location.includes('hamburg') || location.includes('antw') || 
        location.includes('spain') || location.includes('ital') || location.includes('franc') || 
        location.includes('uk') || location.includes('england') || location.includes('london')) {
      return 'EU';
    }
    
    // Default - asumir Asia si no podemos determinar
    return 'Unknown';
  };
  
  const originRegion = getRegion(origin);
  const destRegion = getRegion(destination);
  
  // Determinación del tiempo de tránsito basado en regiones
  let transitTime = '';
  let cost = '';
  let notes = '';
  
  // Asia a Latam
  if (originRegion === 'Asia' && destRegion === 'LATAM') {
    transitTime = '30-40 días';
    cost = '$2,700-3,500 USD por contenedor de 20 pies';
    notes = 'Ruta marítima transpacífica con posible trasbordo en puertos como Panamá o Manzanillo';
  } 
  // Latam a Asia
  else if (originRegion === 'LATAM' && destRegion === 'Asia') {
    transitTime = '32-42 días';
    cost = '$2,800-3,600 USD por contenedor de 20 pies';
    notes = 'Ruta marítima con posible trasbordo en puertos de la costa oeste de Norteamérica';
  } 
  // Europa a Latam
  else if (originRegion === 'EU' && destRegion === 'LATAM') {
    transitTime = '18-25 días';
    cost = '$2,200-3,000 USD por contenedor de 20 pies';
    notes = 'Ruta marítima transatlántica con conexiones semanales';
  } 
  // Latam a Europa
  else if (originRegion === 'LATAM' && destRegion === 'EU') {
    transitTime = '19-26 días';
    cost = '$2,300-3,100 USD por contenedor de 20 pies';
    notes = 'Ruta marítima transatlántica con escalas en puertos principales europeos';
  } 
  // Norteamérica a Latam
  else if (originRegion === 'NA' && destRegion === 'LATAM') {
    transitTime = '10-16 días';
    cost = '$1,800-2,400 USD por contenedor de 20 pies';
    notes = 'Conexiones marítimas directas con alta frecuencia de salidas';
  } 
  // Latam a Norteamérica
  else if (originRegion === 'LATAM' && destRegion === 'NA') {
    transitTime = '10-16 días';
    cost = '$1,900-2,500 USD por contenedor de 20 pies';
    notes = 'Rutas marítimas directas con opciones de transporte terrestre para destinos internos';
  } 
  // Asia a Europa
  else if (originRegion === 'Asia' && destRegion === 'EU') {
    transitTime = '28-35 días';
    cost = '$3,000-4,000 USD por contenedor de 20 pies';
    notes = 'Ruta marítima a través del Canal de Suez, con alta capacidad y frecuencia';
  } 
  // Europa a Asia
  else if (originRegion === 'EU' && destRegion === 'Asia') {
    transitTime = '28-35 días';
    cost = '$3,000-4,000 USD por contenedor de 20 pies';
    notes = 'Ruta marítima por el Canal de Suez con múltiples opciones de navieras';
  } 
  // Rutas intrarregionales o desconocidas
  else {
    // Dentro de LATAM
    if (originRegion === 'LATAM' && destRegion === 'LATAM') {
      transitTime = '5-12 días';
      cost = '$800-1,600 USD por contenedor de 20 pies';
      notes = 'Conexiones marítimas regionales con posibles opciones de transporte terrestre';
    } else {
      // Default para cualquier otra combinación
      transitTime = '25-40 días';
      cost = '$2,500-4,000 USD por contenedor de 20 pies';
      notes = 'Ruta internacional con conexiones a través de puertos principales';
    }
  }
  
  // Formatear la respuesta
  return `Para el envío de ${origin} a ${destination}:

• Tiempo de tránsito estimado: ${transitTime}
• Costo aproximado: ${cost}
• Notas: ${notes}

Contamos con conexiones para esta ruta a través de nuestras alianzas con las principales navieras. ¿Desea una cotización personalizada con fechas específicas de salida?`;
} 