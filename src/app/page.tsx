'use client';

import dynamic from 'next/dynamic';
import { validateConfig } from '../lib/config';

// Importación dinámica para evitar problemas de SSR
const ChatContainer = dynamic(() => import('../components/ChatContainer'), { ssr: false });

// Validate the configuration on the client side
validateConfig();

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl flex flex-col space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Nowports Sales Assistant</h1>
          <p className="text-gray-600">
            Powered by AI to help with your logistics needs
          </p>
        </div>
        
        <div className="flex-1 w-full border rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          <ChatContainer />
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>
            © 2023 Nowports - Your logistics partner in Latin America
          </p>
        </div>
      </div>
    </main>
  );
}
