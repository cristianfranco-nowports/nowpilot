// Mock data for companies, routes, and tariffs for Nowports

export interface Company {
  id: string;
  name: string;
  description: string;
  industry: string;
  annualRevenue: string;
  location: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  needsImport: boolean;
  needsExport: boolean;
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  transitTime: string;
  mode: 'ocean' | 'air' | 'rail' | 'road';
  departureFrequency: string;
  carriers: string[];
  congestionLevel?: 'Bajo' | 'Medio' | 'Alto';
  recommendedLeadTime?: string;
}

export interface Tariff {
  id: string;
  routeId: string;
  containerType?: string;
  weightRange?: string;
  baseRate: number;
  currency: string;
  additionalFees: {
    name: string;
    amount: number;
  }[];
  specialDiscounts?: {
    description: string;
    percentage: number;
    minimumVolume?: string;
  }[];
  seasonalFactor?: number;
}

// Interfaces adicionales para datos extendidos
export interface PortInfo {
  id: string;
  name: string;
  country: string;
  region: 'Asia' | 'Europa' | 'Norteamérica' | 'Latinoamérica';
  congestionLevel: 'Bajo' | 'Medio' | 'Alto';
  specialRequirements: string;
  commonDelays: string;
  handlingFees: string;
  freeStorageDays: number;
  extraStorageCost: string;
}

export interface InsuranceOption {
  id: string;
  type: string;
  coverage: string;
  rate: string;
  minPrice: number;
  benefits: string[];
}

export interface CustomsRegulation {
  id: string;
  country: string;
  customsRequirements: string[];
  restrictions: string[];
  avgCustomsTime: string;
  additionalCosts: {
    name: string;
    cost: string;
  }[];
}

export interface FinancingOption {
  id: string;
  name: string;
  description: string;
  interestRate: string;
  term: string;
  requirements: string[];
  benefits: string[];
}

export interface ContainerType {
  id: string;
  type: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  capacity: string;
  maxWeight: string;
  bestFor: string[];
  specialFeatures?: string[];
  image?: string;
}

// Mock companies data
export const companies: Company[] = [
  {
    id: "comp-1",
    name: "TechGlobal Industries",
    description: "A leading technology manufacturer specializing in consumer electronics",
    industry: "Electronics Manufacturing",
    annualRevenue: "$120 million",
    location: "Mexico City, Mexico",
    contactInfo: {
      phone: "+52 55 1234 5678",
      email: "info@techglobalindustries.com",
      address: "Av. Reforma 222, Col. Juárez, 06600 Ciudad de México, CDMX"
    },
    needsImport: true,
    needsExport: true
  },
  {
    id: "comp-2",
    name: "FreshFarms Organic",
    description: "Organic produce exporter focusing on fruits and vegetables",
    industry: "Agriculture",
    annualRevenue: "$45 million",
    location: "Guadalajara, Mexico",
    contactInfo: {
      phone: "+52 33 9876 5432",
      email: "sales@freshfarmsorganic.com",
      address: "Calle López Mateos 5500, Zapopan, Jalisco, 45070"
    },
    needsImport: false,
    needsExport: true
  },
  {
    id: "comp-3",
    name: "AutoPartes Mexicanas",
    description: "Manufacturer and exporter of automotive parts and components",
    industry: "Automotive",
    annualRevenue: "$78 million",
    location: "Monterrey, Mexico",
    contactInfo: {
      phone: "+52 81 8765 4321",
      email: "info@autopartesmexicanas.com",
      address: "Av. Constitución 1500, Centro, 64000 Monterrey, N.L."
    },
    needsImport: true,
    needsExport: true
  },
  {
    id: "comp-4",
    name: "MexiTextiles",
    description: "Traditional and modern textile manufacturer and exporter",
    industry: "Textiles",
    annualRevenue: "$32 million",
    location: "Puebla, Mexico",
    contactInfo: {
      phone: "+52 22 2345 6789",
      email: "contact@mexitextiles.com",
      address: "Blvd. Hermanos Serdán 235, Centro, 72000 Puebla, Pue."
    },
    needsImport: true,
    needsExport: true
  },
  {
    id: "comp-5",
    name: "Farma Laboratories",
    description: "Pharmaceutical company specializing in generic medications",
    industry: "Pharmaceuticals",
    annualRevenue: "$95 million",
    location: "Querétaro, Mexico",
    contactInfo: {
      phone: "+52 44 2987 6543",
      email: "info@farmalabs.com",
      address: "Av. 5 de Febrero 1351, Jurica, 76100 Querétaro, Qro."
    },
    needsImport: true,
    needsExport: false
  }
];

// Mock routes data
export const routes: Route[] = [
  {
    id: "route-1",
    origin: "Manzanillo, Mexico",
    destination: "Shanghai, China",
    transitTime: "32-35 days",
    mode: "ocean",
    departureFrequency: "Twice per week (Tue, Fri)",
    carriers: ["Maersk", "COSCO", "MSC"],
    congestionLevel: "Alto",
    recommendedLeadTime: "45 días"
  },
  {
    id: "route-2",
    origin: "Veracruz, Mexico",
    destination: "Rotterdam, Netherlands",
    transitTime: "22-25 days",
    mode: "ocean",
    departureFrequency: "Weekly (Thu)",
    carriers: ["Hapag-Lloyd", "CMA CGM"],
    congestionLevel: "Medio",
    recommendedLeadTime: "35 días"
  },
  {
    id: "route-3",
    origin: "Mexico City, Mexico",
    destination: "Los Angeles, USA",
    transitTime: "3-4 days",
    mode: "air",
    departureFrequency: "Daily",
    carriers: ["Aeromexico Cargo", "FedEx Air Freight", "UPS Air Cargo"],
    congestionLevel: "Bajo",
    recommendedLeadTime: "5 días"
  },
  {
    id: "route-4",
    origin: "Monterrey, Mexico",
    destination: "Chicago, USA",
    transitTime: "5-7 days",
    mode: "rail",
    departureFrequency: "Three times per week (Mon, Wed, Fri)",
    carriers: ["Kansas City Southern de Mexico", "Union Pacific"],
    congestionLevel: "Bajo",
    recommendedLeadTime: "10 días"
  },
  {
    id: "route-5",
    origin: "Guadalajara, Mexico",
    destination: "Miami, USA",
    transitTime: "2-3 days",
    mode: "air",
    departureFrequency: "Daily except Sundays",
    carriers: ["American Airlines Cargo", "DHL Air"],
    congestionLevel: "Bajo",
    recommendedLeadTime: "4 días"
  },
  {
    id: "route-6",
    origin: "Tijuana, Mexico",
    destination: "San Diego, USA",
    transitTime: "1 day",
    mode: "road",
    departureFrequency: "Daily",
    carriers: ["Transportes Internacionales", "Border Xpress"],
    congestionLevel: "Medio",
    recommendedLeadTime: "3 días"
  },
  {
    id: "route-7",
    origin: "Altamira, Mexico",
    destination: "Hamburg, Germany",
    transitTime: "24-28 days",
    mode: "ocean",
    departureFrequency: "Every 10 days",
    carriers: ["Maersk", "Hamburg Süd"],
    congestionLevel: "Medio",
    recommendedLeadTime: "38 días"
  }
];

// Mock tariffs data
export const tariffs: Tariff[] = [
  {
    id: "tariff-1",
    routeId: "route-1",
    containerType: "20ft Standard",
    baseRate: 1850,
    currency: "USD",
    additionalFees: [
      { name: "Documentation Fee", amount: 150 },
      { name: "Terminal Handling", amount: 235 },
      { name: "Customs Clearance", amount: 120 }
    ],
    specialDiscounts: [
      { description: "Volume Discount", percentage: 7, minimumVolume: "5 containers per month" },
      { description: "Long-term Contract", percentage: 10, minimumVolume: "12-month commitment" }
    ],
    seasonalFactor: 1.2
  },
  {
    id: "tariff-2",
    routeId: "route-1",
    containerType: "40ft High Cube",
    baseRate: 2400,
    currency: "USD",
    additionalFees: [
      { name: "Documentation Fee", amount: 150 },
      { name: "Terminal Handling", amount: 295 },
      { name: "Customs Clearance", amount: 120 }
    ],
    specialDiscounts: [
      { description: "Volume Discount", percentage: 8, minimumVolume: "5 containers per month" },
      { description: "Long-term Contract", percentage: 12, minimumVolume: "12-month commitment" }
    ],
    seasonalFactor: 1.2
  },
  {
    id: "tariff-3",
    routeId: "route-2",
    containerType: "20ft Standard",
    baseRate: 1950,
    currency: "USD",
    additionalFees: [
      { name: "Documentation Fee", amount: 140 },
      { name: "Terminal Handling", amount: 225 },
      { name: "Customs Clearance", amount: 115 }
    ],
    specialDiscounts: [
      { description: "Volume Discount", percentage: 5, minimumVolume: "3 containers per month" }
    ],
    seasonalFactor: 1.1
  },
  {
    id: "tariff-4",
    routeId: "route-2",
    containerType: "40ft Standard",
    baseRate: 2350,
    currency: "USD",
    additionalFees: [
      { name: "Documentation Fee", amount: 140 },
      { name: "Terminal Handling", amount: 280 },
      { name: "Customs Clearance", amount: 115 }
    ],
    specialDiscounts: [
      { description: "Volume Discount", percentage: 5, minimumVolume: "3 containers per month" }
    ],
    seasonalFactor: 1.1
  },
  {
    id: "tariff-5",
    routeId: "route-3",
    weightRange: "100-500kg",
    baseRate: 4.75,
    currency: "USD/kg",
    additionalFees: [
      { name: "Fuel Surcharge", amount: 0.85 },
      { name: "Security Fee", amount: 0.25 },
      { name: "Terminal Handling", amount: 75 }
    ],
    seasonalFactor: 1.0
  },
  {
    id: "tariff-6",
    routeId: "route-3",
    weightRange: "500-1000kg",
    baseRate: 4.25,
    currency: "USD/kg",
    additionalFees: [
      { name: "Fuel Surcharge", amount: 0.85 },
      { name: "Security Fee", amount: 0.25 },
      { name: "Terminal Handling", amount: 95 }
    ],
    seasonalFactor: 1.0
  },
  {
    id: "tariff-7",
    routeId: "route-4",
    containerType: "Rail Container",
    baseRate: 1350,
    currency: "USD",
    additionalFees: [
      { name: "Documentation Fee", amount: 120 },
      { name: "Terminal Handling", amount: 195 },
      { name: "Customs Processing", amount: 110 }
    ],
    seasonalFactor: 1.05
  },
  {
    id: "tariff-8",
    routeId: "route-7",
    containerType: "20ft Refrigerated",
    baseRate: 2850,
    currency: "USD",
    additionalFees: [
      { name: "Documentation Fee", amount: 150 },
      { name: "Terminal Handling", amount: 285 },
      { name: "Customs Clearance", amount: 130 },
      { name: "Power Supply Surcharge", amount: 350 }
    ],
    specialDiscounts: [
      { description: "Volume Discount", percentage: 6, minimumVolume: "3 containers per month" }
    ],
    seasonalFactor: 1.15
  }
];

// Información de puertos
export const ports: PortInfo[] = [
  {
    id: "port-1",
    name: "Shanghai",
    country: "China",
    region: "Asia",
    congestionLevel: "Alto",
    specialRequirements: "Documentación completa en chino e inglés. Certificados de inspección pre-embarque.",
    commonDelays: "Congestión frecuente durante temporada alta (Oct-Dic). Inspecciones aleatorias pueden añadir 2-3 días.",
    handlingFees: "$150-300 por contenedor estándar",
    freeStorageDays: 7,
    extraStorageCost: "$50-75 por día adicional"
  },
  {
    id: "port-2",
    name: "Rotterdam",
    country: "Holanda",
    region: "Europa",
    congestionLevel: "Bajo",
    specialRequirements: "Cumplimiento de normativas EU. Documentos EUR1 para preferencias arancelarias.",
    commonDelays: "Mínimos. Ocasionalmente por condiciones climáticas en invierno.",
    handlingFees: "$180-250 por contenedor estándar",
    freeStorageDays: 10,
    extraStorageCost: "$40-60 por día adicional"
  },
  {
    id: "port-3",
    name: "Los Angeles",
    country: "Estados Unidos",
    region: "Norteamérica",
    congestionLevel: "Medio",
    specialRequirements: "ISF (10+2) obligatorio 24 horas antes del embarque. Cumplimiento CBP.",
    commonDelays: "Congestión periódica. Inspecciones de seguridad aleatorias pueden añadir 4-5 días.",
    handlingFees: "$200-350 por contenedor estándar",
    freeStorageDays: 4,
    extraStorageCost: "$100-150 por día adicional"
  },
  {
    id: "port-4",
    name: "Manzanillo",
    country: "México",
    region: "Latinoamérica",
    congestionLevel: "Medio",
    specialRequirements: "Previo al arribo: transmisión BL 24h antes. Pedimento registrado.",
    commonDelays: "Procesos aduaneros pueden extenderse 1-2 días adicionales. Inspecciones aleatorias.",
    handlingFees: "$150-230 por contenedor estándar",
    freeStorageDays: 7,
    extraStorageCost: "$35-60 por día adicional"
  },
  {
    id: "port-5",
    name: "Veracruz",
    country: "México",
    region: "Latinoamérica",
    congestionLevel: "Medio",
    specialRequirements: "Documentación completa 48h antes de arribo. Inspección de aduana común.",
    commonDelays: "Saturación en temporada agrícola. Procesos aduaneros pueden tomar 2-4 días extras.",
    handlingFees: "$140-220 por contenedor estándar",
    freeStorageDays: 7,
    extraStorageCost: "$30-55 por día adicional"
  }
];

// Opciones de seguro
export const insuranceOptions: InsuranceOption[] = [
  {
    id: "insurance-1",
    type: "Seguro Básico",
    coverage: "Cubre pérdida total por hundimiento, colisión o incendio",
    rate: "0.5% del valor de la mercancía",
    minPrice: 150,
    benefits: [
      "Cobertura básica para eventos catastróficos",
      "Proceso de reclamación simplificado",
      "Respuesta en máximo 15 días hábiles"
    ]
  },
  {
    id: "insurance-2",
    type: "Seguro Estándar",
    coverage: "Cubre pérdida total y parcial por diversos riesgos durante el transporte",
    rate: "0.8% del valor de la mercancía",
    minPrice: 250,
    benefits: [
      "Cobertura amplia para la mayoría de siniestros",
      "Cubre daños por manipulación y robo",
      "Asistencia especializada 24/7",
      "Respuesta en máximo 10 días hábiles"
    ]
  },
  {
    id: "insurance-3",
    type: "Seguro Premium",
    coverage: "Cobertura completa todo riesgo, incluyendo demoras y maniobras",
    rate: "1.2% del valor de la mercancía",
    minPrice: 400,
    benefits: [
      "Cobertura total para cualquier tipo de siniestro",
      "Cubre gastos adicionales por demoras",
      "Incluye cobertura para maniobras especiales",
      "Asesor dedicado para gestión de siniestros",
      "Respuesta en máximo 5 días hábiles"
    ]
  },
  {
    id: "insurance-4",
    type: "Seguro para Mercancías Especiales",
    coverage: "Diseñado para mercancías de alto valor, perecederos o equipo sensible",
    rate: "1.5-2.0% del valor de la mercancía, según evaluación",
    minPrice: 600,
    benefits: [
      "Cobertura especializada según tipo de mercancía",
      "Monitoreo en tiempo real de condiciones (temperatura, humedad)",
      "Respuesta inmediata ante alertas de condiciones",
      "Indemnización express por siniestros"
    ]
  }
];

// Requisitos aduaneros por país
export const customsRegulations: CustomsRegulation[] = [
  {
    id: "customs-1",
    country: "México",
    customsRequirements: [
      "Factura comercial",
      "Certificado de origen",
      "Pedimento de importación",
      "Lista de empaque",
      "Documento de transporte (BL para marítimo)"
    ],
    restrictions: ["Alimentos requieren certificado sanitario", "Productos textiles requieren etiquetado NOM"],
    avgCustomsTime: "3-5 días hábiles",
    additionalCosts: [
      { name: "DTA (Derecho de Trámite Aduanero)", cost: "8 al millar del valor en aduana" },
      { name: "Prevalidación electrónica", cost: "$350 MXN por pedimento" },
      { name: "Honorarios del agente aduanal", cost: "Entre 0.3% y 0.5% del valor de la mercancía" }
    ]
  },
  {
    id: "customs-2",
    country: "Estados Unidos",
    customsRequirements: [
      "Factura comercial",
      "Formulario CBP 7501 (Entrada de Aduana)",
      "Lista de empaque",
      "ISF (Importer Security Filing)",
      "Documento de transporte"
    ],
    restrictions: ["Productos agrícolas requieren permisos USDA", "Artículos electrónicos necesitan certificación FCC"],
    avgCustomsTime: "2-4 días hábiles",
    additionalCosts: [
      { name: "MPF (Merchandise Processing Fee)", cost: "0.3464% del valor (mín $27.23, máx $528.33)" },
      { name: "HMF (Harbor Maintenance Fee)", cost: "0.125% del valor para importaciones marítimas" },
      { name: "Honorarios de agente aduanal", cost: "$150-$250 por entrada" }
    ]
  },
  {
    id: "customs-3",
    country: "China",
    customsRequirements: [
      "Factura comercial",
      "Declaración de aduana para importación",
      "Lista de empaque",
      "Contrato de compraventa",
      "Certificado de inspección CIQ (para algunos productos)"
    ],
    restrictions: ["Productos usados tienen restricciones severas", "Productos alimenticios requieren licencia especial"],
    avgCustomsTime: "5-7 días hábiles",
    additionalCosts: [
      { name: "Aranceles de importación", cost: "Variable según producto (0-65%)" },
      { name: "IVA", cost: "13% para la mayoría de productos" },
      { name: "Tasas de inspección CIQ", cost: "0.5-3% del valor según producto" }
    ]
  }
];

// Opciones de financiamiento
export const financingOptions: FinancingOption[] = [
  {
    id: "financing-1",
    name: "Crédito Simple para Importación",
    description: "Préstamo directo para cubrir costos de importación incluyendo transporte, aranceles y manejo",
    interestRate: "8-12% anual",
    term: "30-90 días",
    requirements: [
      "Historial crediticio favorable",
      "6+ meses como cliente de Nowports",
      "Documentación completa de la importación"
    ],
    benefits: [
      "Aprobación rápida (24-48 horas)",
      "Sin garantías adicionales para montos menores a $30,000 USD",
      "Pagos flexibles adaptados al ciclo comercial"
    ]
  },
  {
    id: "financing-2",
    name: "Financiamiento de Exportaciones",
    description: "Adelanto de capital contra documentos de exportación confirmados",
    interestRate: "7-10% anual",
    term: "Hasta 120 días",
    requirements: [
      "Contratos de venta confirmados",
      "Historial comercial verificable",
      "Documentación completa de la exportación"
    ],
    benefits: [
      "Liquidez inmediata sin esperar el pago del comprador",
      "Posibilidad de ofrecer términos favorables a compradores",
      "Reduce riesgos de fluctuación cambiaria"
    ]
  },
  {
    id: "financing-3",
    name: "Supply Chain Financing",
    description: "Solución integral para financiar toda la cadena de suministro internacional",
    interestRate: "6-9% anual",
    term: "Personalizado según ciclo logístico (30-180 días)",
    requirements: [
      "Volumen mínimo de operaciones ($100,000+ USD anuales)",
      "Estados financieros auditados",
      "Historial comercial internacional verificable"
    ],
    benefits: [
      "Optimización completa del flujo de caja",
      "Plataforma digital para gestionar todos los financiamientos",
      "Descuentos en servicios logísticos de Nowports",
      "Asesoría financiera especializada incluida"
    ]
  }
];

// Tipos de contenedores
export const containerTypes: ContainerType[] = [
  {
    id: "container-1",
    type: "20ft Standard",
    dimensions: {
      length: "5.90m",
      width: "2.35m",
      height: "2.39m"
    },
    capacity: "33.2 m³",
    maxWeight: "28,200 kg",
    bestFor: [
      "Cargas pesadas",
      "Volúmenes medianos",
      "Commodities",
      "Materiales de construcción"
    ],
    image: "/images/container-20ft.jpg"
  },
  {
    id: "container-2",
    type: "40ft Standard",
    dimensions: {
      length: "12.03m",
      width: "2.35m",
      height: "2.39m"
    },
    capacity: "67.7 m³",
    maxWeight: "28,800 kg",
    bestFor: [
      "Cargas voluminosas",
      "Mobiliario",
      "Vehículos",
      "Maquinaria"
    ],
    image: "/images/container-40ft.jpg"
  },
  {
    id: "container-3",
    type: "40ft High Cube",
    dimensions: {
      length: "12.03m",
      width: "2.35m",
      height: "2.70m"
    },
    capacity: "76.4 m³",
    maxWeight: "28,500 kg",
    bestFor: [
      "Productos ligeros y voluminosos",
      "Ropa y textiles",
      "Muebles",
      "Electrónicos"
    ],
    image: "/images/container-40hc.jpg"
  },
  {
    id: "container-4",
    type: "20ft Refrigerated",
    dimensions: {
      length: "5.45m",
      width: "2.29m",
      height: "2.27m"
    },
    capacity: "28.3 m³",
    maxWeight: "27,700 kg",
    bestFor: [
      "Perecederos",
      "Productos farmacéuticos",
      "Flores",
      "Productos congelados"
    ],
    specialFeatures: [
      "Control de temperatura (-30°C a +30°C)",
      "Monitoreo remoto",
      "Alarmas automáticas"
    ],
    image: "/images/container-reefer.jpg"
  },
  {
    id: "container-5",
    type: "Open Top",
    dimensions: {
      length: "5.90m (20ft) / 12.03m (40ft)",
      width: "2.35m",
      height: "2.39m"
    },
    capacity: "32.6 m³ (20ft) / 66.7 m³ (40ft)",
    maxWeight: "28,120 kg (20ft) / 28,670 kg (40ft)",
    bestFor: [
      "Maquinaria pesada",
      "Carga sobredimensionada en altura",
      "Productos que requieren carga superior",
      "Materiales a granel"
    ],
    image: "/images/container-opentop.jpg"
  }
]; 