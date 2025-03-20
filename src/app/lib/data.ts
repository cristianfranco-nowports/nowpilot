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
      address: "Calle 5 de Mayo 125, Centro, 72000 Puebla, Pue."
    },
    needsImport: true,
    needsExport: true
  },
  {
    id: "comp-5",
    name: "Caribbean Seafood Exports",
    description: "Supplier of premium seafood and fish products",
    industry: "Food Processing",
    annualRevenue: "$18 million",
    location: "Cancún, Mexico",
    contactInfo: {
      phone: "+52 998 123 4567",
      email: "sales@caribbeanseafood.com",
      address: "Blvd. Kukulcán km 12.5, Zona Hotelera, 77500 Cancún, Q.R."
    },
    needsImport: false,
    needsExport: true
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
    departureFrequency: "Weekly (Thursdays)",
    carriers: ["COSCO", "Maersk", "MSC"]
  },
  {
    id: "route-2",
    origin: "Veracruz, Mexico",
    destination: "Rotterdam, Netherlands",
    transitTime: "22-25 days",
    mode: "ocean",
    departureFrequency: "Bi-weekly (Mondays and Thursdays)",
    carriers: ["Hapag-Lloyd", "CMA CGM"]
  },
  {
    id: "route-3",
    origin: "Mexico City, Mexico",
    destination: "Los Angeles, USA",
    transitTime: "3-4 days",
    mode: "air",
    departureFrequency: "Daily",
    carriers: ["Aeromexico Cargo", "FedEx Air Freight", "UPS Air Cargo"]
  },
  {
    id: "route-4",
    origin: "Monterrey, Mexico",
    destination: "Chicago, USA",
    transitTime: "5-7 days",
    mode: "rail",
    departureFrequency: "Three times per week (Mon, Wed, Fri)",
    carriers: ["Kansas City Southern de Mexico", "Union Pacific"]
  },
  {
    id: "route-5",
    origin: "Guadalajara, Mexico",
    destination: "Miami, USA",
    transitTime: "2-3 days",
    mode: "air",
    departureFrequency: "Daily except Sundays",
    carriers: ["American Airlines Cargo", "DHL Air"]
  },
  {
    id: "route-6",
    origin: "Tijuana, Mexico",
    destination: "San Diego, USA",
    transitTime: "1 day",
    mode: "road",
    departureFrequency: "Daily",
    carriers: ["Transportes Internacionales", "Border Xpress"]
  },
  {
    id: "route-7",
    origin: "Altamira, Mexico",
    destination: "Hamburg, Germany",
    transitTime: "24-28 days",
    mode: "ocean",
    departureFrequency: "Every 10 days",
    carriers: ["Maersk", "Hamburg Süd"]
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
    ]
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
    ]
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
    ]
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
      { description: "Volume Discount", percentage: 6, minimumVolume: "3 containers per month" }
    ]
  },
  {
    id: "tariff-5",
    routeId: "route-3",
    weightRange: "Up to 100 kg",
    baseRate: 4.25,
    currency: "USD/kg",
    additionalFees: [
      { name: "Fuel Surcharge", amount: 0.75 },
      { name: "Security Fee", amount: 0.15 },
      { name: "Airport Handling", amount: 75 }
    ]
  },
  {
    id: "tariff-6",
    routeId: "route-3",
    weightRange: "101-500 kg",
    baseRate: 3.80,
    currency: "USD/kg",
    additionalFees: [
      { name: "Fuel Surcharge", amount: 0.75 },
      { name: "Security Fee", amount: 0.15 },
      { name: "Airport Handling", amount: 120 }
    ],
    specialDiscounts: [
      { description: "Regular Shipper", percentage: 5 }
    ]
  },
  {
    id: "tariff-7",
    routeId: "route-4",
    containerType: "53ft Intermodal",
    baseRate: 2100,
    currency: "USD",
    additionalFees: [
      { name: "Documentation Fee", amount: 85 },
      { name: "Intermodal Transfer", amount: 220 },
      { name: "Customs Brokerage", amount: 135 }
    ]
  },
  {
    id: "tariff-8",
    routeId: "route-5",
    weightRange: "Up to 500 kg",
    baseRate: 3.95,
    currency: "USD/kg",
    additionalFees: [
      { name: "Fuel Surcharge", amount: 0.80 },
      { name: "Security Screening", amount: 0.20 },
      { name: "Airport Fee", amount: 95 }
    ]
  },
  {
    id: "tariff-9",
    routeId: "route-6",
    containerType: "Full Truckload",
    baseRate: 950,
    currency: "USD",
    additionalFees: [
      { name: "Border Crossing Fee", amount: 125 },
      { name: "Documentation", amount: 75 }
    ]
  },
  {
    id: "tariff-10",
    routeId: "route-7",
    containerType: "20ft Refrigerated",
    baseRate: 3200,
    currency: "USD",
    additionalFees: [
      { name: "Documentation Fee", amount: 145 },
      { name: "Terminal Handling", amount: 310 },
      { name: "Power Supply", amount: 250 },
      { name: "Customs Clearance", amount: 130 }
    ],
    specialDiscounts: [
      { description: "Seasonal Contract", percentage: 8, minimumVolume: "3-month commitment" }
    ]
  }
];

// Service options that Nowports offers
export const services = [
  "Freight Forwarding",
  "Customs Brokerage",
  "Cargo Insurance",
  "Warehousing",
  "Distribution",
  "Supply Chain Consulting",
  "Trade Finance",
  "Inventory Management",
  "Tracking & Visibility",
  "Compliance & Documentation Support"
];

// Company achievements and differentiators
export const companyInfo = {
  name: "Nowports",
  founded: 2018,
  headquarters: "Mexico",
  offices: ["Mexico", "Chile", "Colombia", "Panama", "Uruguay", "Peru", "Brazil"],
  achievements: [
    "First LogTech unicorn in Latin America",
    "Series C funding of $150 million (2022)",
    "Over 100,000 containers shipped annually",
    "Proprietary technology platform for end-to-end visibility",
    "Strong relationships with major global carriers",
    "Digital infrastructure for trade finance solutions"
  ],
  valueProp: "Nowports is modernizing the freight forwarding industry in Latin America by combining traditional logistics services with cutting-edge technology and financial solutions. We help businesses optimize their supply chains, increase transparency, reduce costs, and access working capital when needed."
};

// Frequently asked questions for reference
export const faqs = [
  {
    question: "What makes Nowports different from traditional freight forwarders?",
    answer: "Nowports combines traditional freight forwarding services with modern technology and financial solutions. Our digital platform provides real-time tracking, transparent pricing, and streamlined documentation. We also offer trade finance options to help with working capital challenges."
  },
  {
    question: "How long does shipping typically take from Mexico to Asia?",
    answer: "Ocean freight from Mexico to major Asian ports typically takes 30-40 days depending on the specific origin and destination ports, carrier schedules, and potential transshipments. Air freight is considerably faster at 2-4 days but comes at a higher cost."
  },
  {
    question: "Can Nowports help with customs clearance?",
    answer: "Yes, Nowports provides comprehensive customs brokerage services in all countries where we operate. Our customs experts ensure compliance with local regulations, prepare all necessary documentation, classify goods correctly, and work to expedite the clearance process."
  },
  {
    question: "What tracking capabilities does Nowports offer?",
    answer: "Our digital platform provides real-time visibility into your shipments. You can track container location, view estimated arrival times, access documentation, and receive automated notifications about important milestones or exceptions throughout the shipping process."
  },
  {
    question: "Does Nowports offer financing options?",
    answer: "Yes, Nowports offers trade finance solutions including inventory financing and supply chain financing. We can advance payment to suppliers while extending payment terms for importers, helping to improve cash flow management for your business."
  }
]; 