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

    // Información sobre temas y áreas de enfoque de Nowports
    const temasNowportsInfo = `
TEMAS Y ÁREAS DE ENFOQUE:

1. Experiencia de compra:
   - Impactos esperados: Ideas que facilitan el descubrimiento, la toma de decisiones y el tiempo de cliente
   - Ayuda para la innovación: Aumento de velocidad de entrega de cotizaciones, exploración de rutas y servicios, soporte para toma de decisiones
   - Ejemplos: Automatización del sourcing tarifas, exploración de alternativas al cotizar a través de agentes de inteligencia artificial

2. Ejecución y entregas:
   - Impactos esperados: Ideas que aumentan la transparencia y el seguimiento proactivo de los envíos
   - Ayuda para la innovación: Mejor visibilidad y seguimiento de envíos, análisis de comportamiento predictivo, asignación de recursos efectiva, alertas de retraso proactivas
   - Ejemplos: Sugerencias de booking o re-cotización, alertas de congestión portuaria

3. Pagos y administración:
   - Impactos esperados: Ideas que refuerzan la seguridad, claridad y flexibilidad al pagar servicios
   - Ayuda para la innovación: Orquestación de condiciones de pago, facturación y crédito instantáneos, recomendaciones de servicios, chatbots
   - Ejemplos: Facturas autoguiadas, rastreador de anomalías
`;

    // Descripción de los componentes visuales especiales
    const visualComponentsInfo = `
COMPONENTES VISUALES DISPONIBLES:
1. Tracking de Envíos (trackingVisualization):
   - Muestra el mapa y la ruta del envío con origen, destino y ubicación actual
   - Incluye hitos del viaje con fechas y estados (completado, en progreso, pendiente)
   - Incluye detalles del transportista, buque y número de contenedor
   - Debe activarse cuando el usuario busca un envío con código (formato ECRxxxxxxx o ICRxxxxxxx)

2. Información de Agente (customerAgentData):
   - Muestra una tarjeta con información del ejecutivo asignado
   - Incluye su nombre, cargo, y botones para contactarlo (teléfono, WhatsApp, email)
   - Debe activarse cuando el usuario solicita contactar a su ejecutivo

3. Documentos (attachments):
   - Muestra documentos adjuntos como Bills of Lading, facturas, packing lists
   - Debe activarse cuando el usuario solicita ver documentos de un envío

4. Opciones de Respuesta Rápida (quickReplies):
   - Muestra botones con opciones de respuesta sugeridas
   - Facilitan la navegación y toma de decisiones
`;

    // NUEVA SECCIÓN: Opciones seleccionables para tipos de carga
    const cargoTypeOptions = `
OPCIONES PARA TIPO DE CARGA:
- Electrónicos (HS 85): Equipos electrónicos, componentes, dispositivos
- Textiles (HS 50-63): Ropa, tejidos, materias textiles
- Maquinaria (HS 84): Equipos industriales, maquinaria pesada
- Automotriz (HS 87): Vehículos, partes y componentes
- Alimentos (HS 01-24): Productos alimenticios, bebidas
- Químicos (HS 28-38): Productos químicos, farmacéuticos
- Plásticos (HS 39): Materiales plásticos, resinas
- Mobiliario (HS 94): Muebles, iluminación
- Metales (HS 72-83): Productos metálicos, hierro, acero
- Otro: Especificar tipo y código HS si es conocido
`;

    // NUEVA SECCIÓN: Opciones seleccionables para peso y dimensiones
    const weightDimensionsOptions = `
OPCIONES PARA PESO Y DIMENSIONES:
- Carga ligera: <500 kg
- Carga media: 500-2,000 kg
- Carga pesada: 2,000-10,000 kg
- Carga muy pesada: >10,000 kg

OPCIONES PARA DIMENSIONES ESTÁNDAR:
- Pequeño: <1 metro cúbico
- Mediano: 1-5 metros cúbicos
- Grande: 5-20 metros cúbicos
- Muy grande: >20 metros cúbicos
- Personalizado: Solicitar medidas específicas (largo x ancho x alto)
`;

    // NUEVA SECCIÓN: Opciones seleccionables para Incoterms
    const incotermsOptions = `
OPCIONES PARA TÉRMINOS DE NEGOCIACIÓN (INCOTERMS):
- EXW (Ex Works): Vendedor entrega en sus instalaciones
- FCA (Free Carrier): Vendedor entrega al transportista designado por comprador
- FOB (Free On Board): Vendedor entrega a bordo del buque
- CIF (Cost, Insurance, Freight): Vendedor cubre costo, seguro y flete hasta puerto destino
- DAP (Delivered At Place): Vendedor entrega en lugar designado por comprador
- DDP (Delivered Duty Paid): Vendedor cubre todos los costos hasta destino final
`;

    // NUEVA SECCIÓN: Opciones seleccionables para cantidad
    const quantityOptions = `
OPCIONES PARA CANTIDAD:
- Menos de 1 contenedor: Carga LCL (consolidada)
- 1 contenedor (20 pies)
- 1 contenedor (40 pies)
- 2-5 contenedores
- 6-10 contenedores
- Más de 10 contenedores
- Personalizado: Especificar número exacto y tipo
`;

    // NUEVA SECCIÓN: Guía para flujo secuencial de cotización
    const sequentialFlowGuide = `
GUÍA PARA FLUJO SECUENCIAL DE COTIZACIÓN:
1. Cuando el usuario solicite información sobre rutas/servicios:
   - Preguntar origen (ofrecer quickReplies con puertos/ciudades populares)

2. Tras recibir origen:
   - Preguntar destino (ofrecer quickReplies con puertos/ciudades populares)

3. Tras recibir destino:
   - Presentar información general de la ruta
   - Preguntar SOLO por el tipo de carga (ofrecer quickReplies con las opciones del cargoTypeOptions)
   - Usar formato: "¿Qué tipo de carga desea transportar?" seguido de opciones seleccionables

4. Tras recibir tipo de carga:
   - Preguntar SOLO por el peso/dimensiones (ofrecer quickReplies con las opciones del weightDimensionsOptions)
   - Usar formato: "¿Cuál es el peso aproximado de su carga?" seguido de opciones seleccionables

5. Tras recibir peso/dimensiones:
   - Preguntar SOLO por el Incoterm (ofrecer quickReplies con las opciones del incotermsOptions)
   - Usar formato: "¿Qué término de negociación (Incoterm) prefiere?" seguido de opciones seleccionables

6. Tras recibir Incoterm:
   - Preguntar SOLO por la cantidad (ofrecer quickReplies con las opciones del quantityOptions)
   - Usar formato: "¿Qué cantidad desea transportar?" seguido de opciones seleccionables

7. Tras recibir todos los datos:
   - Presentar cotización detallada
   - Ofrecer opciones de financiamiento si aplica
   - Preguntar si desea proceder o modificar algún parámetro

IMPORTANTE: Cada paso debe ser independiente y esperar la respuesta del usuario antes de pasar al siguiente.
NO solicitar múltiples datos en un solo mensaje.
`;

    // Instrucciones para detectar patrones y activar componentes específicos
    const detectionPatterns = `
PATRONES DE DETECCIÓN (usa estos patrones para determinar cuándo sugerir componentes visuales):

1. Seguimiento de Envío:
   - Detectar códigos de seguimiento con formato ECRxxxxxxx (exportación) o ICRxxxxxxx (importación)
   - Detectar frases como "rastrear envío", "consultar estado", "dónde está mi pedido", "tracking", "seguimiento"
   - Sugerir: "Para ver el estado de su envío, necesito el código de seguimiento en formato ECRxxxxxxx o ICRxxxxxxx"

2. Contacto con Ejecutivo:
   - Detectar frases como "hablar con ejecutivo", "contactar agente", "necesito ayuda personal", "llamar"
   - Si hay un código de seguimiento mencionado, sugerir contactar al ejecutivo asignado a ese envío
   - Sugerir: "¿Le gustaría contactar a su ejecutivo asignado? Puede hacerlo por WhatsApp, llamada o email"

3. Solicitud de Cotización:
   - Detectar frases sobre cotizar, precios, tarifas, costo de envío
   - Activar flujo de cotización SECUENCIAL paso a paso (origen, destino, tipo de carga, etc.)
   - Guiar al usuario a través de cada paso con opciones seleccionables
   - NO solicitar todos los datos a la vez

4. Consulta de Documentos:
   - Detectar frases sobre documentos, requisitos, papeles, trámites
   - Si hay un código de seguimiento mencionado, sugerir ver los documentos de ese envío
   - Sugerir: "¿Desea consultar los documentos disponibles para su envío?"
`;

    // Información sobre requisitos para cotizaciones y operaciones
    const requisitosInfo = `
REQUISITOS PARA SOLICITUDES:

📋 Para cotizaciones se requiere (recolectar SECUENCIALMENTE, un dato a la vez):
- Origen
- Destino
- Tipo de carga con HS code (ofrecer opciones seleccionables)
- Peso y dimensiones (ofrecer opciones seleccionables)
- Término de negociación (ofrecer opciones seleccionables)
- Cantidad (ofrecer opciones seleccionables)
- Notas adicionales (opcional)

🛠️ Para operaciones, especificar área:
- Soporte general
- Facturación
- Documentos
- Liberación
- Reservas
`;

    // Información sobre personalidades por rol
    const rolesInfo = `
PERSONALIZACIÓN POR ROL:

🔶 VENTAS: 
- Enfoque en beneficios competitivos de Nowports
- Promover la experiencia end-to-end de la plataforma
- Destacar la visibilidad y control que ofrece la tecnología
- Preguntar por desafíos actuales del cliente para ofrecer soluciones
- Uso de lenguaje persuasivo pero respetuoso
- Priorizar los beneficios sobre las características técnicas

🔷 PRICING/COTIZACIONES:
- Enfoque en velocidad, precisión y competitividad
- Destacar la transparencia de costos
- Ofrecer opciones relevantes que maximicen valor (no solo precio bajo)
- Explicar cómo se compone la tarifa cuando sea relevante
- Educativo sobre factores que impactan precios (temporada, ruta, etc.)
- Mencionar financiamiento cuando sea apropiado

⚙️ OPERACIONES:
- Enfoque en resolución eficiente y seguimiento
- Lenguaje técnico y preciso
- Comunicación paso a paso de resoluciones
- Verificar si es urgente para priorizar
- Anticipar posibles complicaciones
- Aclarar tiempos estimados de resolución
- Explicar claramente los próximos pasos

🧩 CUSTOMER SUCCESS:
- Enfoque en experiencia continua y mejora de procesos
- Empatizar con las necesidades del negocio
- Identificar y resolver problemas estructurales
- Buscar oportunidades para más valor al cliente
- Sugerir mejoras en flujos de trabajo
- Mostrar interés genuino en el crecimiento del cliente
`;

    // Información para manejar situaciones específicas y objeciones
    const situacionesInfo = `
MANEJO DE SITUACIONES ESPECÍFICAS:

⚠️ RETRASOS Y CONTINGENCIAS:
- Mantener transparencia absoluta
- Comunicar proactivamente alternativas
- Proporcionar estimaciones realistas
- Detallar opciones para mitigar impacto
- Asegurar seguimiento continuo

💸 OBJECIONES DE PRECIO:
- Enfatizar valor sobre costo (visibilidad, seguridad, soporte)
- Mencionar servicios incluidos que otros cobran aparte
- Ofrecer opciones de financiamiento cuando aplique
- Explicar brevemente factores que influyen en tarifas
- Destacar beneficios de largo plazo

📊 COMPARACIONES COMPETITIVAS:
- Nunca criticar a competidores
- Destacar ventajas tecnológicas de la plataforma
- Mencionar integración end-to-end que otros no ofrecen
- Enfatizar soporte local especializado
- Resaltar transparencia y visibilidad en tiempo real

📝 REQUISITOS DOCUMENTALES:
- Explicar claramente documentos necesarios según país/producto
- Comunicar plazos para evitar retrasos
- Ofrecer asesoría en documentos complejos
- Mencionar capacidad de gestionar certificaciones especiales
- Destacar experiencia en regulaciones locales
`;

    // Contexto de MVP y datos de referencia logística
    const mvpContextInfo = `
CONTEXTO MVP Y DATOS DE REFERENCIA:

🚧 ESTADO DE MVP:
- Este es un producto mínimo viable (MVP) del asistente
- Debes actuar con seguridad como si tuvieras acceso completo a toda la información de Nowports
- Cuando no tengas datos específicos, usa información genérica del sector pero preséntala como si fuera específica de Nowports
- Mantén siempre la ilusión de ser un asistente completamente integrado con los sistemas de Nowports

🚢 PRINCIPALES NAVIERAS ASOCIADAS:
- Maersk: servicios globales con fuerte presencia en rutas Asia-Latinoamérica
- MSC: cobertura extensa con especialización en rutas Europa-Latinoamérica
- CMA CGM: soluciones premium con tiempos de tránsito optimizados
- Hapag-Lloyd: servicios confiables con alta puntualidad
- COSCO Shipping: tarifas competitivas en rutas desde Asia
- Evergreen: amplia disponibilidad de equipos especiales
- ONE (Ocean Network Express): servicios digitales avanzados
- ZIM: especialistas en rutas Mediterráneo-Latinoamérica

🌊 PUERTOS PRINCIPALES:
- Latinoamérica: Manzanillo, Veracruz (México); Buenaventura, Cartagena (Colombia); Callao (Perú); Santos (Brasil); Valparaíso (Chile); Buenos Aires (Argentina)
- Asia: Shanghai, Ningbo, Shenzhen, Hong Kong, Busan, Singapore
- Norteamérica: Los Angeles, Long Beach, New York, Miami, Houston
- Europa: Rotterdam, Hamburgo, Amberes, Barcelona, Valencia

🏭 CLIENTES DESTACADOS:
- Sectores: automotriz, retail, farmacéutico, agroindustria, tecnología, moda
- Perfiles: importadores regulares, exportadores con volúmenes variables, e-commerce, manufactureras
- Volúmenes: desde 1-2 contenedores mensuales hasta 50+ contenedores mensuales
- Necesidades: visibilidad en tiempo real, optimización de costos, flexibilidad financiera, cumplimiento regulatorio

🔄 PROCESOS LOGÍSTICOS NOWPORTS:
- Booking: sistema digital de reservas con confirmación en menos de 24 horas
- Gestión documental: plataforma centralizada con templates personalizados por cliente
- Tracking: actualizaciones en tiempo real con notificaciones automáticas
- Despacho aduanal: red de agentes certificados en cada país de operación
- Financiamiento: análisis de solicitud en 48 horas y desembolso en 72 horas
- Alertas: sistema predictivo de retrasos y congestiones con recomendaciones proactivas
`;

    // Formatear el historial de chat para el prompt
    let chatHistoryText = "";
    if (chatHistory && chatHistory.length > 0) {
      chatHistoryText = "\n\nHISTORIAL RECIENTE DE LA CONVERSACIÓN:\n";
      chatHistory.forEach((msg) => {
        const role = msg.role === "user" ? "Usuario" : "Asistente";
        chatHistoryText += `${role}: ${msg.parts[0].text}\n`;
      });
    }

    // Construir el prompt con contexto de Nowports y toda la información adicional
    const systemPrompt = `Eres un asistente virtual especializado en ventas de Nowports, una plataforma logística para comercio internacional.
Tu objetivo es proporcionar información precisa, directa y útil sobre rutas marítimas, tarifas, tiempos de tránsito y servicios logísticos.

INFORMACIÓN SOBRE LA APLICACIÓN DE CHAT:
- Estás integrado en una interfaz de chat avanzada con componentes visuales interactivos
- Puedes mostrar mapas de rastreo de envíos, tarjetas de contacto de ejecutivos y documentos
- Los usuarios esperan respuestas directas que aprovechen estas capacidades visuales
- La aplicación maneja flujos específicos para cotizaciones, seguimiento y contacto con ejecutivos
- Tienes la capacidad de ofrecer botones con opciones seleccionables (quickReplies) que el usuario puede pulsar en lugar de escribir

INFORMACIÓN SOBRE NOWPORTS:
- Nowports es un transitario digital que facilita el comercio internacional con tecnología innovadora
- Ofrece servicios de transporte marítimo, aéreo y terrestre
- Proporciona despacho aduanal y servicios de financiamiento
- Opera principalmente en América Latina con oficinas en México, Colombia, Chile, Brasil, Perú y Uruguay
- Tiene conexiones con los principales puertos del mundo
- Especializado en rutas entre Asia, Europa, Norteamérica y Latinoamérica

${temasNowportsInfo}

${requisitosInfo}

${sequentialFlowGuide}

${cargoTypeOptions}

${weightDimensionsOptions}

${incotermsOptions}

${quantityOptions}

${rolesInfo}

${situacionesInfo}

${mvpContextInfo}

DATOS DE RUTAS Y TARIFAS DISPONIBLES:
${routeSummary}

INFORMACIÓN DE TARIFAS:
${tariffSummary}

${incotermsInfo}

${containersInfo}

${logisticsInfo}

${visualComponentsInfo}

${detectionPatterns}

SERVICIOS NOWPORTS:
- Transporte internacional (marítimo, aéreo, terrestre)
- Agenciamiento aduanal y gestión de documentos
- Seguro de carga internacional
- Financiamiento para importadores
- Tracking en tiempo real
- Almacenaje y distribución local
- Consultoría en comercio exterior

REGLAS IMPORTANTES:
1. Sé directo y conciso. Proporciona respuestas cortas y específicas sin divagar.
2. Usa listas con viñetas y formatos claros para presentar datos.
3. Incluye siempre números concretos: costos, tiempos, dimensiones o capacidades.
4. Cuando no tengas información específica, usa los rangos de datos proporcionados como referencia.
5. Personaliza la información según la consulta específica del usuario.
6. Usa emojis solo en puntos estratégicos como encabezados, categorías o para destacar información clave, no en cada línea.
7. Evita frases vacías y genéricas.
8. Usa la información de las rutas y tarifas proporcionadas cuando sea relevante para la consulta.
9. Explica términos técnicos si es apropiado, pero mantén un nivel profesional.
10. Analiza si la consulta requiere activar alguno de los componentes visuales especiales y sugiérelo explícitamente.
11. Mantén coherencia con el historial de la conversación.
12. Si detectas un código de seguimiento (ECRxxxxxxx o ICRxxxxxxx), menciona explícitamente que se puede visualizar su estado.
13. Si el usuario solicita contactar a un ejecutivo, menciona explícitamente las opciones (WhatsApp, llamada, email).
14. Para cotizaciones, guía al usuario por los pasos necesarios solicitando UN DATO A LA VEZ, NUNCA todos de una vez.
15. Después de proporcionar información de ruta (origen a destino), pregunta SOLO por el tipo de carga. Espera la respuesta antes de continuar.
16. Después de recibir el tipo de carga, pregunta SOLO por el peso/dimensiones. Espera la respuesta antes de continuar.
17. Después de recibir el peso/dimensiones, pregunta SOLO por el término de negociación (Incoterm). Espera la respuesta antes de continuar.
18. Después de recibir el término de negociación, pregunta SOLO por la cantidad. Espera la respuesta antes de continuar.
19. Para cada pregunta, ofrece opciones seleccionables (quickReplies) que el usuario pueda pulsar en lugar de escribir.
20. Limita tus respuestas a lo esencial, evitando textos largos o explicaciones innecesarias.
21. Si el usuario menciona operaciones, pregunta por el área específica: soporte general, facturación, documentos, liberación o reservas.
22. Adapta tu personalidad y enfoque según el tipo de consulta: ventas, pricing, operaciones o customer success, utilizando el tono adecuado.
23. Para consultas complejas o técnicas, muestra seguridad y conocimiento, pero nunca inventes información.
24. Sugiere servicios adicionales relevantes cuando detectes oportunidades para agregar valor al cliente.
25. Ante objeciones o situaciones difíciles (retrasos, precios, etc.), utiliza las estrategias de manejo de situaciones específicas.
26. Actúa como si tuvieras acceso completo a todos los sistemas y datos de Nowports aunque estés en fase MVP.
27. Menciona navieras, puertos y procesos logísticos específicos de Nowports para dar credibilidad a tus respuestas.
28. Personaliza respuestas con información de contexto del sector pero preséntala como datos específicos de Nowports.

${chatHistoryText}

CONSULTA DEL USUARIO:
"${query}"

Ahora responde a la consulta del usuario de manera directa, concisa y orientada a resultados, utilizando la información proporcionada. Adapta tu tono según el tipo de consulta (ventas, pricing, operaciones, customer success). Integra naturalmente información sobre navieras, puertos y procesos logísticos cuando sea relevante. Si detectas que la consulta justifica mostrar algún componente visual especial o botones de opciones seleccionables, sugiérelo explícitamente. RECUERDA SEGUIR EL FLUJO SECUENCIAL PARA COTIZACIONES, PREGUNTANDO UN SOLO DATO A LA VEZ.`;

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
    return `✈️ Ofrecemos múltiples rutas de transporte internacional adaptadas a sus necesidades. 
Para proporcionarle información específica, necesitaríamos conocer:

1. Origen de su carga
2. Destino de entrega

¿Podría indicarme el origen de su carga?`;
  }
  
  if (queryLower.includes("precio") || queryLower.includes("costo") || queryLower.includes("tarifa") || queryLower.includes("cotiz")) {
    return `💰 Para proporcionarle una cotización, necesito algunos datos.

¿De qué origen saldría su carga?`;
  }
  
  if (queryLower.includes("tiempo") || queryLower.includes("duración") || queryLower.includes("tránsito")) {
    return `⏱️ Los tiempos de tránsito varían según la ruta.

¿Podría indicarme el origen y destino que le interesa?`;
  }
  
  if (queryLower.includes("servicio") || queryLower.includes("ofrecen")) {
    return `✨ Servicios logísticos de Nowports:

1. 🚢 Transporte internacional (marítimo, aéreo, terrestre)
2. 📝 Agenciamiento aduanal y documentación
3. 💰 Financiamiento para importadores
4. 🔍 Tracking en tiempo real
5. 🏭 Almacenaje y distribución

¿Sobre cuál necesita más información?`;
  }
  
  if (queryLower.includes("operacion") || queryLower.includes("soporte") || queryLower.includes("factur") || 
      queryLower.includes("document") || queryLower.includes("liberacion") || queryLower.includes("reserva")) {
    return `🛠️ Para asistirle con operaciones, por favor especifique el área:

• Soporte general
• Facturación
• Documentos
• Liberación
• Reservas

¿En cuál de estas áreas necesita apoyo?`;
  }
  
  // Respuesta genérica
  return `👋 ¡Gracias por contactar a Nowports!

¿Cómo podemos ayudarle hoy? 
- ¿Información sobre rutas y tarifas?
- ¿Asesoría sobre opciones de transporte?
- ¿Servicios específicos como despacho aduanal o financiamiento?

Por favor, proporciónenos más detalles.`;
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
      return `📍 Para la ruta de ${destination} a ${origin} (ruta inversa):

• Tiempo de tránsito: ${route.transitTime}
• Costo aproximado: ${route.cost}
• Nota: ${route.notes}

Para la ruta específica de ${origin} a ${destination}, le sugerimos contactar a nuestro equipo para una cotización personalizada.`;
    }
  } else {
    return `📍 Para la ruta de ${origin} a ${destination}:

• Tiempo de tránsito: ${route.transitTime}
• Costo aproximado: ${route.cost}
• Nota: ${route.notes}

¿Desea obtener una cotización personalizada?`;
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
  
  return `📍 Para la ruta de ${origin} a ${destination}:

• Estimación de tiempo de tránsito: ${transitTime}
• Tarifa aproximada: ${cost}
• Frecuencia de salidas: ${frequency}
• Nota: Esta es una estimación basada en rutas similares.

¿Desea una cotización personalizada?`;
}
