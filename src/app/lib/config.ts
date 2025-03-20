// Configuration for the application

// Setting default values and checking for environment variables
export const config = {
  // Gemini API Key
  geminiApiKey: process.env.GEMINI_API_KEY || 'YOUR_API_KEY',
  
  // Server configuration
  serverPort: process.env.PORT || '3000',
  
  // Maximum response length
  maxResponseTokens: 1024,
  
  // Model temperature (0-1)
  modelTemperature: 0.7,
};

// Validate that we have the required API key
export const validateConfig = () => {
  if (config.geminiApiKey === 'YOUR_API_KEY') {
    console.warn(
      'Warning: Using placeholder API key. Please set the GEMINI_API_KEY environment variable.'
    );
  }
}; 