import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Import components
const ChatContainer = dynamic(() => import('../components/ChatContainer'), { ssr: false });

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Nowports - Asistente de Ventas</title>
        <meta name="description" content="Chat con el asistente de ventas de Nowports para obtener información sobre logística y envíos internacionales" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 shadow-md">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Nowports Assistant</h1>
              <p className="text-blue-100 mt-1">Su asistente de logística internacional</p>
            </div>
            <nav>
              <Link href="/widget">
                <a className="bg-white text-blue-700 hover:bg-blue-50 transition py-2 px-4 rounded-lg shadow font-medium">
                  Ver Widget
                </a>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[calc(100vh-12rem)] flex flex-col">
              {mounted && <ChatContainer />}
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Acerca de Nowports</h2>
              <p className="text-gray-600 mb-4">
                Nowports es una plataforma logística para comercio internacional que ofrece servicios de transporte marítimo, aéreo y terrestre.
              </p>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Nuestros servicios incluyen:</h3>
              <ul className="list-disc pl-5 text-gray-600 mb-4 space-y-1">
                <li>Transporte internacional (marítimo, aéreo, terrestre)</li>
                <li>Agenciamiento aduanal y gestión de documentos</li>
                <li>Seguro de carga internacional</li>
                <li>Financiamiento para importadores</li>
                <li>Tracking en tiempo real</li>
                <li>Almacenaje y distribución local</li>
              </ul>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">¿Cómo puedo ayudarte?</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Información sobre rutas y tiempos de tránsito</li>
                <li>Solicitar cotizaciones de envíos</li>
                <li>Conocer los documentos necesarios para importar/exportar</li>
                <li>Resolver dudas sobre Incoterms y trámites aduaneros</li>
                <li>Conectar con un ejecutivo de ventas</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-300">
                © {new Date().getFullYear()} Nowports. Todos los derechos reservados.
              </p>
            </div>
            <div className="text-sm text-gray-300 md:text-right">
              <p>Powered by Next.js and Tailwind CSS</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 