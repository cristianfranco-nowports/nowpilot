import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import ChatWidget from '../components/ChatWidget';
import LanguageSelector from '../components/LanguageSelector';

const WidgetDemo: React.FC = () => {
  const { t } = useTranslation('common');
  
  // Widget configuration state
  const [widgetPosition, setWidgetPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>('light');
  const [initialMessage, setInitialMessage] = useState(t('initialMessage', "¡Hola! Soy el asistente de Nowports. ¿En qué puedo ayudarte hoy?"));
  const [widgetTitle, setWidgetTitle] = useState(t('widgetTitle', "Nowports Assistant"));
  const [widgetSubtitle, setWidgetSubtitle] = useState(t('widgetSubtitle', "Pregúntame sobre logística y envíos"));
  
  // Actualizar textos cuando cambia el idioma
  const { i18n } = useTranslation();
  useEffect(() => {
    setInitialMessage(t('initialMessage', "¡Hola! Soy el asistente de Nowports. ¿En qué puedo ayudarte hoy?"));
    setWidgetTitle(t('widgetTitle', "Nowports Assistant"));
    setWidgetSubtitle(t('widgetSubtitle', "Pregúntame sobre logística y envíos"));
  }, [i18n.language, t]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'appearance' | 'content' | 'code'>('appearance');
  const [copied, setCopied] = useState(false);

  // Light/dark site theme for preview
  const [siteTheme, setSiteTheme] = useState<'light' | 'dark'>('light');
  
  // Fade in animation on load
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, []);

  // Handle copy to clipboard
  const copyToClipboard = () => {
    const code = `
<ChatWidget
  position="${widgetPosition}"
  theme="${widgetTheme}"
  initialMessage="${initialMessage}"
  title="${widgetTitle}"
  subtitle="${widgetSubtitle}"
/>`;
    
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${siteTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Head>
        <title>Widget Studio - Nowports</title>
        <meta name="description" content={t('widgetDescription', "Personaliza y configura tu widget de chat para Nowports")} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background gradient elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full ${siteTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-400'} opacity-10 blur-3xl transform rotate-12`}></div>
        <div className={`absolute top-1/3 -left-20 w-72 h-72 rounded-full ${siteTheme === 'dark' ? 'bg-purple-700' : 'bg-purple-500'} opacity-10 blur-3xl`}></div>
        <div className={`absolute -bottom-40 right-1/4 w-80 h-80 rounded-full ${siteTheme === 'dark' ? 'bg-teal-600' : 'bg-teal-400'} opacity-10 blur-3xl`}></div>
      </div>

      {/* Header */}
      <header className={`transition-colors duration-300 ${siteTheme === 'dark' ? 'bg-gradient-to-r from-blue-800 to-blue-900' : 'bg-gradient-to-r from-blue-600 to-blue-800'} text-white shadow-sm sticky top-0 z-30`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="mr-4">
                <div className="h-10 w-10 bg-white text-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">N</div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Widget Studio</h1>
                <p className="text-sm text-blue-100">{t('customizeAssistant', "Personaliza tu asistente virtual")}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="mr-2">
                <LanguageSelector />
              </div>
              <button 
                onClick={() => setSiteTheme(theme => theme === 'light' ? 'dark' : 'light')}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                aria-label="Toggle site theme"
              >
                {siteTheme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                )}
              </button>
              <Link href="/">
                <a className="bg-white text-blue-700 hover:bg-blue-50 transition py-2 px-4 rounded-lg shadow font-medium">
                  {t('backToMainChat', "Volver al chat principal")}
                </a>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className={`container mx-auto px-4 py-8 flex-grow ${loaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'} transition-all duration-500`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Configuration panel */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className={`rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${siteTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
              {/* Tab navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  className={`flex-1 py-4 px-4 text-center font-medium ${activeTab === 'appearance' 
                    ? (siteTheme === 'dark' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600') 
                    : (siteTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
                  onClick={() => setActiveTab('appearance')}
                >
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" />
                    </svg>
                    {t('appearance', "Apariencia")}
                  </span>
                </button>
                <button
                  className={`flex-1 py-4 px-4 text-center font-medium ${activeTab === 'content' 
                    ? (siteTheme === 'dark' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600') 
                    : (siteTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
                  onClick={() => setActiveTab('content')}
                >
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    {t('content', "Contenido")}
                  </span>
                </button>
                <button
                  className={`flex-1 py-4 px-4 text-center font-medium ${activeTab === 'code' 
                    ? (siteTheme === 'dark' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600') 
                    : (siteTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
                  onClick={() => setActiveTab('code')}
                >
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {t('code', "Código")}
                  </span>
                </button>
              </div>
              
              {/* Tab content */}
              <div className="p-6">
                {/* Appearance tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className={`font-medium mb-2 ${siteTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{t('position', 'Posición')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                          className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            widgetPosition === 'bottom-right' 
                              ? (siteTheme === 'dark' ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50') 
                              : (siteTheme === 'dark' ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50')
                          }`}
                          onClick={() => setWidgetPosition('bottom-right')}
                        >
                          <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-lg relative">
                            <div className="absolute bottom-2 right-2 h-4 w-4 bg-blue-500 rounded-full"></div>
                          </div>
                          <div className="ml-4">
                            <h4 className={`font-medium ${siteTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('bottomRight', "Inferior Derecha")}</h4>
                            <p className={`text-sm ${siteTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('standardPosition', "Posición estándar")}</p>
                          </div>
                        </div>
                        <div 
                          className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            widgetPosition === 'bottom-left' 
                              ? (siteTheme === 'dark' ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50') 
                              : (siteTheme === 'dark' ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50')
                          }`}
                          onClick={() => setWidgetPosition('bottom-left')}
                        >
                          <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-lg relative">
                            <div className="absolute bottom-2 left-2 h-4 w-4 bg-blue-500 rounded-full"></div>
                          </div>
                          <div className="ml-4">
                            <h4 className={`font-medium ${siteTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('bottomLeft', "Inferior Izquierda")}</h4>
                            <p className={`text-sm ${siteTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('alternative', "Alternativo")}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className={`font-medium mb-2 ${siteTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{t('widgetTheme', 'Tema del Widget')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                          className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            widgetTheme === 'light' 
                              ? (siteTheme === 'dark' ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50') 
                              : (siteTheme === 'dark' ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50')
                          }`}
                          onClick={() => setWidgetTheme('light')}
                        >
                          <div className="h-16 w-full bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="h-3 w-full bg-blue-500 rounded-t-lg"></div>
                          </div>
                          <div className="ml-4">
                            <h4 className={`font-medium ${siteTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('light', "Claro")}</h4>
                            <p className={`text-sm ${siteTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('whiteBackground', "Fondo blanco")}</p>
                          </div>
                        </div>
                        <div 
                          className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            widgetTheme === 'dark' 
                              ? (siteTheme === 'dark' ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50') 
                              : (siteTheme === 'dark' ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50')
                          }`}
                          onClick={() => setWidgetTheme('dark')}
                        >
                          <div className="h-16 w-full bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
                            <div className="h-3 w-full bg-blue-500 rounded-t-lg"></div>
                          </div>
                          <div className="ml-4">
                            <h4 className={`font-medium ${siteTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{t('dark', "Oscuro")}</h4>
                            <p className={`text-sm ${siteTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('darkBackground', "Fondo oscuro")}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Content tab */}
                {activeTab === 'content' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className={`font-medium mb-2 ${siteTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{t('title', 'Título')}</h3>
                      <input
                        type="text"
                        className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                          siteTheme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } border`}
                        value={widgetTitle}
                        onChange={(e) => setWidgetTitle(e.target.value)}
                        placeholder="Título del widget"
                      />
                    </div>
                    
                    <div>
                      <h3 className={`font-medium mb-2 ${siteTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{t('subtitle', 'Subtítulo')}</h3>
                      <input
                        type="text"
                        className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                          siteTheme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } border`}
                        value={widgetSubtitle}
                        onChange={(e) => setWidgetSubtitle(e.target.value)}
                        placeholder="Subtítulo del widget"
                      />
                    </div>
                    
                    <div>
                      <h3 className={`font-medium mb-2 ${siteTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{t('initialMessageLabel', 'Mensaje Inicial')}</h3>
                      <textarea
                        className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                          siteTheme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } border`}
                        rows={3}
                        value={initialMessage}
                        onChange={(e) => setInitialMessage(e.target.value)}
                        placeholder="Mensaje inicial del asistente"
                      />
                    </div>
                  </div>
                )}
                
                {/* Code tab */}
                {activeTab === 'code' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className={`font-medium mb-2 ${siteTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{t('implementationCode', "Código de Implementación")}</h3>
                      <p className={`text-sm mb-3 ${siteTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('integrationInstructions', "Para integrar este widget en tu sitio web, copia y pega el siguiente código:")}
                      </p>
                      
                      <div className="relative">
                        <div className="absolute top-4 right-4 z-10">
                          <button
                            onClick={copyToClipboard}
                            className={`p-2 rounded-md text-sm font-medium transition-colors ${
                              copied
                                ? (siteTheme === 'dark' ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-700')
                                : (siteTheme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                            }`}
                          >
                            {copied ? (
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Copiado
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 010 2h-2v-2z" />
                                </svg>
                                {t('copy', 'Copiar')}
                              </span>
                            )}
                          </button>
                        </div>
                        
                        <div className={`bg-gray-900 text-gray-100 p-4 rounded-lg shadow-inner overflow-x-auto font-mono text-sm`}>
<pre><code>{`// React JSX
<ChatWidget
  position="${widgetPosition}"
  theme="${widgetTheme}"
  initialMessage="${initialMessage}"
  title="${widgetTitle}"
  subtitle="${widgetSubtitle}"
/>`}</code></pre>
                        </div>
                      </div>
                      
                      <p className={`mt-6 ${siteTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="block font-medium mb-2">{t('installationInstructions', 'Instrucciones de instalación')}:</span>
                        <ol className="list-decimal list-inside space-y-2">
                          <li>{t('importComponent', 'Importa el componente ChatWidget en tu archivo React')}</li>
                          <li>{t('addComponent', 'Añade el componente en tu layout o página donde desees mostrarlo')}</li>
                          <li>{t('configureProps', 'Configura las propiedades según tus necesidades')}</li>
                          <li>{t('ensureAPIAccess', 'Asegúrate de que tu aplicación tiene acceso a la API de chat')}</li>
                        </ol>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Widget preview */}
          <div className="lg:col-span-5 order-1 lg:order-2 mb-8 lg:mb-0">
            <div className={`${siteTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 h-[36rem] md:sticky md:top-20 overflow-hidden transition-colors duration-300 border ${siteTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col h-full">
                <h3 className="text-lg font-semibold mb-2">{t('preview', "Vista Previa")}</h3>
                <div className="inline-flex items-center px-3 py-1 mb-3 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  <svg className="mr-1.5 h-2 w-2 text-blue-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  {t('viewingRealTime', "Viendo en tiempo real")}
                </div>
                <div className="w-full flex-1 relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  {/* Barra de navegador simulada */}
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 flex items-center px-3 space-x-2">
                    <div className="flex space-x-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 h-5 rounded-md mx-16 bg-white dark:bg-gray-700"></div>
                  </div>
                  
                  {/* Contenido de la web simulada */}
                  <div className="relative h-[calc(100%-2rem)] min-h-[20rem] overflow-auto">
                    {/* Posicionamos el widget según la configuración */}
                    <div className={`absolute ${widgetPosition === 'bottom-right' ? 'right-3 bottom-3' : 'left-3 bottom-3'}`}>
                      <div className={`${widgetTheme === 'light' ? 'bg-white text-gray-800 border border-gray-200' : 'bg-gray-800 text-white border border-gray-700'} rounded-lg shadow-xl overflow-hidden`} style={{width: '250px', height: '320px'}}>
                        {/* Header del widget */}
                        <div className={`${widgetTheme === 'light' ? 'bg-blue-600' : 'bg-gray-900'} p-3 flex flex-col`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-white font-bold text-sm">{widgetTitle}</h4>
                              <p className="text-white/80 text-xs">{widgetSubtitle}</p>
                            </div>
                            <div className="flex space-x-1">
                              <button className="p-1 rounded-full text-white/80 hover:bg-white/10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Cuerpo del widget (simulado) */}
                          <div className={`p-2 ${widgetTheme === 'light' ? 'bg-gray-100' : 'bg-gray-800'} h-[270px] overflow-y-auto`}>
                            <div className={`p-2 rounded-lg mb-2 ${widgetTheme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-gray-700 text-white'} max-w-[80%] text-sm`}>
                              {initialMessage}
                            </div>
                          </div>
                          
                          {/* Input del widget (simulado) */}
                          <div className={`p-2 border-t ${widgetTheme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
                            <div className={`flex rounded-full p-2 ${widgetTheme === 'light' ? 'bg-gray-100' : 'bg-gray-700'}`}>
                              <input type="text" readOnly className={`flex-1 text-sm border-none bg-transparent ${widgetTheme === 'light' ? 'text-gray-800' : 'text-white'} focus:ring-0 focus:outline-none`} placeholder={t('type', "Escribe un mensaje...")} />
                              <button className={`p-1 rounded-full ${widgetTheme === 'light' ? 'bg-blue-600' : 'bg-blue-600'} text-white`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Configuración actual */}
                <div className="mt-4">
                  <h4 className={`font-medium text-sm mb-2 ${siteTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('currentConfig', "Configuración actual")}</h4>
                  <div className={`rounded-lg overflow-hidden border ${siteTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <dl className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                      <div className={`px-3 py-2 grid grid-cols-3 gap-4 ${siteTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <dt className={`font-medium ${siteTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{t('position', "Posición")}</dt>
                        <dd className={`font-medium col-span-2 ${siteTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {widgetPosition === 'bottom-right' ? t('bottomRight', "Inferior Derecha") : t('bottomLeft', "Inferior Izquierda")}
                        </dd>
                      </div>
                      <div className={`px-3 py-2 grid grid-cols-3 gap-4`}>
                        <dt className={`font-medium ${siteTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{t('theme', "Tema")}</dt>
                        <dd className={`font-medium col-span-2 ${siteTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {widgetTheme === 'light' ? t('light', "Claro") : t('dark', "Oscuro")}
                        </dd>
                      </div>
                      <div className={`px-3 py-2 grid grid-cols-3 gap-4 ${siteTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <dt className={`font-medium ${siteTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{t('title', "Título")}</dt>
                        <dd className={`font-medium col-span-2 truncate ${siteTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {widgetTitle}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className={`py-6 transition-colors duration-300 ${siteTheme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-800 text-gray-300'}`}>
        <div className="container mx-auto px-4 text-center">
          <p>{t('copyright', '© 2025 Nowports. Todos los derechos reservados.')}</p>
        </div>
      </footer>
      
      {/* Widget de Chat */}
      <ChatWidget
        position={widgetPosition}
        theme={widgetTheme}
        initialMessage={initialMessage}
        title={widgetTitle}
        subtitle={widgetSubtitle}
      />

      {/* Add some supporting CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'es', ['common'])),
    },
  };
};

export default WidgetDemo; 