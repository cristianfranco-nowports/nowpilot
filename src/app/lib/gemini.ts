import { GoogleGenerativeAI, GenerativeModel, SafetySetting, HarmCategory, HarmBlockThreshold, ChatSession } from '@google/generative-ai';
import { companies, routes, tariffs, services, companyInfo, faqs } from './data';
import { config, validateConfig } from './config';

// Validate the configuration
validateConfig();

// Initialize the Gemini API client - This code only runs on the server
let genAI: GoogleGenerativeAI;

// Check if we're on the server side
if (typeof window === 'undefined') {
  genAI = new GoogleGenerativeAI(config.geminiApiKey);
} else {
  // For client-side, we'll handle the API call through the API routes
  genAI = new GoogleGenerativeAI('dummy-key');
}

// Create the sales assistant prompt with our data
const createSalesAssistantPrompt = () => {
  return `
You are a sales assistant for Nowports, a modern freight forwarding company in Latin America. 
You specialize in logistics, freight forwarding, and supply chain solutions.

Your goal is to assist potential customers with their logistics needs and convince them to use Nowports services.

Here is the company information:
${JSON.stringify(companyInfo, null, 2)}

These are the services we offer:
${JSON.stringify(services, null, 2)}

Here is data on companies that might need our services:
${JSON.stringify(companies, null, 2)}

Here are the routes we operate:
${JSON.stringify(routes, null, 2)}

Here are our tariffs and pricing:
${JSON.stringify(tariffs, null, 2)}

Here are some common questions and answers:
${JSON.stringify(faqs, null, 2)}

IMPORTANT GUIDELINES:
1. Be professional, friendly, and knowledgeable about logistics and freight forwarding.
2. If asked about pricing or routes, provide specific details from the data provided.
3. Emphasize Nowports' technology platform and financial solutions as key differentiators.
4. Always try to understand the customer's specific logistics needs before recommending solutions.
5. If you don't know something, be honest and offer to connect them with a specialist.
6. Use metrics and data when appropriate to support your recommendations.
7. Suggest next steps to help move the sales process forward.

The user will interact with you through chat messages.
`;
};

// Create a safety settings configuration
const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Create a model configuration
const generationConfig = {
  temperature: config.modelTemperature,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: config.maxResponseTokens,
};

// Initialize our Gemini model with the configuration
export const initializeGeminiModel = async (): Promise<GenerativeModel> => {
  try {
    // Initialize the model with the Gemini Pro model
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      safetySettings,
      generationConfig,
    });
    
    return model;
  } catch (error) {
    console.error('Error initializing Gemini model:', error);
    throw error;
  }
};

// Start a chat session with the sales assistant prompt
export const startChatSession = async (): Promise<ChatSession> => {
  try {
    const model = await initializeGeminiModel();
    
    // Create a chat session with our sales assistant prompt
    const chatSession = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: createSalesAssistantPrompt() }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand my role as a Nowports sales assistant. I\'m ready to help customers with their logistics needs. How can I assist you today?' }],
        },
      ],
    });
    
    return chatSession;
  } catch (error) {
    console.error('Error starting chat session:', error);
    throw error;
  }
};

// Function to generate a response based on user input
export const generateChatResponse = async (
  chatSession: ChatSession,
  userMessage: string
): Promise<string> => {
  try {
    const result = await chatSession.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.error('Error generating chat response:', error);
    return 'I apologize, but I encountered an error processing your request. Please try again later or contact our support team for assistance.';
  }
}; 