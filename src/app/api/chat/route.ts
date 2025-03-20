import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Route, Tariff, Company } from '@/lib/data';
import { companies, routes, tariffs } from '@/lib/data';

// Define a simple session type
interface Session {
  lastAccessed: number;
}

// Store chat sessions in memory (would use a database in production)
const sessions: Record<string, Session> = {};

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();
    
    // Validate request
    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    // Generate a new session ID if one doesn't exist
    const currentSessionId = sessionId || uuidv4();

    // Update or create session
    sessions[currentSessionId] = {
      lastAccessed: Date.now()
    };

    // Prepare the context for the AI assistant
    const context = {
      companies,
      routes,
      tariffs
    };

    // In a real application, you would call the AI API here
    // For now, we'll create a simple response based on the message
    const response = generateSimpleResponse(message, context);

    // Return the response
    return NextResponse.json({
      response,
      sessionId: currentSessionId,
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

interface ChatContext {
  companies: Company[];
  routes: Route[];
  tariffs: Tariff[];
}

// A simple function to generate responses based on keywords
function generateSimpleResponse(message: string, context: ChatContext): string {
  const messageLower = message.toLowerCase();
  
  // Check for different types of queries
  if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('hey')) {
    return 'Hello! I\'m the Nowports sales assistant. How can I help you with your logistics needs today?';
  }
  
  if (messageLower.includes('route') || messageLower.includes('shipping')) {
    const routeInfo = context.routes
      .map((route) => `- ${route.origin} to ${route.destination} (${route.mode} transport, ${route.transitTime})`)
      .join('\n');
    return `Here are some of our available shipping routes:\n\n${routeInfo}\n\nIs there a specific route you'd like more information about?`;
  }
  
  if (messageLower.includes('price') || messageLower.includes('cost') || messageLower.includes('tariff')) {
    return 'Our pricing depends on the specific route, container type, and volume of shipments. I\'d be happy to provide a detailed quote for your specific needs. Could you tell me more about your shipment requirements?';
  }
  
  if (messageLower.includes('company') || messageLower.includes('business')) {
    return 'Nowports is a digital freight forwarder that simplifies global trade through technology. We offer comprehensive logistics solutions including ocean, air, and land freight, customs clearance, cargo insurance, and financing. How can we help your business with international shipping?';
  }
  
  if (messageLower.includes('contact') || messageLower.includes('speak') || messageLower.includes('representative')) {
    return 'I\'d be happy to connect you with one of our logistics experts. Please provide your email and a brief description of your needs, and a representative will contact you within 24 hours.';
  }
  
  // Default response
  return 'Thank you for your message. I\'m here to help with any questions about logistics, shipping routes, or how Nowports can help your business. Could you provide more details about what you\'re looking for?';
}

// Clean up expired sessions (would be handled by a cron job in production)
const SESSION_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

// Simple cleanup function
export async function GET() {
  const now = Date.now();
  let expiredCount = 0;
  
  // Find and remove expired sessions
  Object.keys(sessions).forEach(sessionId => {
    const session = sessions[sessionId];
    if (now - session.lastAccessed > SESSION_EXPIRY) {
      delete sessions[sessionId];
      expiredCount++;
    }
  });
  
  return NextResponse.json({
    message: `Cleaned up ${expiredCount} expired sessions. ${Object.keys(sessions).length} active sessions remaining.`,
  });
} 