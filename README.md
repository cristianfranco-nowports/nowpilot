# Nowports Assistant

## Descripción del Proyecto

Nowports Assistant es una solución interactiva de asistencia al cliente que utiliza tecnología de chat inteligente para facilitar la comunicación entre los usuarios de servicios logísticos y la plataforma Nowports. Este asistente permite a los clientes realizar consultas sobre envíos, obtener actualizaciones en tiempo real, gestionar documentación y conectarse con agentes humanos cuando sea necesario.

## Funcionalidades Principales

- **Chat Interactivo**: Interfaz conversacional intuitiva con soporte para markdown.
- **Seguimiento de Envíos**: Visualización gráfica del estado y ubicación de los envíos.
- **Notificaciones por WhatsApp**: Configuración de alertas para recibir actualizaciones en tiempo real.
- **Respuestas Rápidas**: Opciones predefinidas para facilitar la interacción del usuario.
- **Multilingüe**: Soporte para varios idiomas (español e inglés inicialmente).
- **Modo Oscuro/Claro**: Interfaz adaptable a las preferencias del usuario.
- **Integración con Ejecutivos**: Conexión directa con agentes humanos cuando se requiere atención personalizada.

## Tipos de Datos y Modelado

La aplicación utiliza una estructura de datos eficiente y escalable:

### Mensajes y Chat
- `ChatMessage`: Estructura principal para mensajes que incluye:
  - Contenido textual (con soporte Markdown)
  - Archivos adjuntos (documentos, imágenes)
  - Respuestas rápidas
  - Visualizaciones de seguimiento
  - Datos de agentes/ejecutivos
  - Información para alertas WhatsApp

### Seguimiento de Envíos
- `TrackingVisualization`: Representación visual del estado del envío:
  - Puntos de origen y destino (coordenadas y nombres)
  - Ubicación actual
  - Hitos del viaje con estados (completado/en progreso/pendiente)
  - Información del transportista y contenedores
  - Fechas estimadas de llegada

### Notificaciones
- `WhatsAppAlertData`: Configuración para notificaciones móviles:
  - Número de teléfono y mensaje personalizado
  - Tipo de notificación (estado, llegada, retraso, documentos)
  - ID de envío relacionado

### Interacción Asistida
- `QuickReply`: Opciones interactivas para respuesta rápida
- `CustomerAgentData`: Información del ejecutivo asignado 
- `DocumentAttachment`: Estructura para documentos adjuntos

## Capturas de Pantalla / Interfaces

### Vista Principal
```
+----------------------------------+
|         Nowports Assistant       |
+----------------------------------+
|                                  |
|  +------------------------------+|
|  |                              ||
|  |        Chat Interface        ||
|  |                              ||
|  +------------------------------+|
|                                  |
|  +------------------------------+|
|  |                              ||
|  |       Information Panel      ||
|  |                              ||
|  +------------------------------+|
|                                  |
+----------------------------------+
```

### Seguimiento de Envíos
```
+----------------------------------+
|      Shipment #MSKU7627321      |
+----------------------------------+
|                                  |
|  +-Origin--------Destination-+  |
|  |   O=====[SHIP]=======>O   |  |
|  +--------------------------+  |
|                                  |
|  +--------- Timeline ---------+  |
|  | ● Recogida     [Completado]|  |
|  | ● En tránsito  [En progreso]  |
|  | ○ Llegada      [Pendiente] |  |
|  | ○ Entrega      [Pendiente] |  |
|  +--------------------------+  |
|                                  |
+----------------------------------+
```

### Notificaciones WhatsApp
```
+----------------------------------+
|      Alertas por WhatsApp        |
+----------------------------------+
|                                  |
|  Teléfono: +52 123 4567 8901     |
|                                  |
|  [Ejemplo de Notificación]       |
|  +------------------------------+|
|  | Tu embarque MSKU7627321 ha   ||
|  | llegado al puerto de Long    ||
|  | Beach. Despacho aduanal en   ||
|  | las próximas 24 horas.       ||
|  +------------------------------+|
|                                  |
|  [ Cerrar ]    [ Abrir WhatsApp ]|
+----------------------------------+
```

## Factibilidad y Usabilidad

### Factibilidad Técnica
- **Implementación Frontend**: Construido con Next.js y TypeScript para garantizar robustez y tipado seguro.
- **Diseño Responsivo**: Funciona en dispositivos móviles y de escritorio gracias a Tailwind CSS.
- **Integración de Servicios**: Preparado para conectarse a APIs de tracking, notificaciones y gestión documental.
- **Escalabilidad**: Arquitectura modular que permite añadir nuevas funcionalidades sin afectar las existentes.

### Usabilidad
- **Diseño Intuitivo**: Interfaz conversacional natural que no requiere aprendizaje especial.
- **Respuestas Rápidas**: Minimiza la escritura del usuario al ofrecer opciones predefinidas contextualmente relevantes.
- **Visualizaciones Claras**: Representación gráfica del estado de envíos para mejor comprensión.
- **Accesibilidad**: Soporte para modo oscuro y traducción a múltiples idiomas.
- **Opciones de Contacto**: Transición fluida entre el asistente automatizado y la atención humana.

### Valor para el Negocio
- **Reducción de Carga**: Disminuye la necesidad de atención telefónica para consultas básicas.
- **Disponibilidad 24/7**: Ofrece asistencia continua a los clientes en cualquier zona horaria.
- **Personalización**: Adapta las respuestas según el contexto del cliente y su historial.
- **Notificaciones Proactivas**: Informa a los clientes sobre eventos importantes sin esperar a que consulten.

## Tecnologías Utilizadas

- **Frontend**: Next.js, React, TypeScript
- **Estilos**: Tailwind CSS
- **Internacionalización**: next-i18next
- **Visualización Markdown**: react-markdown

## Instalación y Uso

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en producción
npm start
```

## Próximos Pasos

- Integración con APIs reales de tracking de Nowports
- Implementación de autenticación de usuarios
- Expandir capacidades de IA para respuestas más complejas
- Añadir más idiomas y personalización regional
- Desarrollar widgets para integración en sitios de terceros

## Créditos y Herramientas

Este proyecto fue desarrollado con la asistencia de herramientas de Inteligencia Artificial, que facilitaron y aceleraron el proceso de creación.  Agradecemos especialmente a:

* **Google Gemini**:  Utilizado como modelo de lenguaje para la generación de respuestas inteligentes en el asistente de chat y para la iteración y mejora del diseño de la solución.
* **IDX (Google Cloud Workstations)**:  Entorno de desarrollo en la nube que proporcionó un ambiente de programación eficiente y accesible para la construcción de este proyecto.

El uso de estas herramientas de IA nos permitió enfocarnos en la lógica y la experiencia del usuario, optimizando el tiempo de desarrollo y explorando soluciones innovadoras.
