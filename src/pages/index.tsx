import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import LanguageSelector from '../components/LanguageSelector';

// Import components
const ChatContainer = dynamic(() => import('../components/ChatContainer'), { ssr: false });

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { t } = useTranslation('common');

  // Ensure component only renders client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    // Check for system preference or saved preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme) {
        setTheme(savedTheme as 'light' | 'dark');
      } else if (prefersDark) {
        setTheme('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <Head>
        <title>Nowports - {t('welcome')}</title>
        <meta name="description" content={t('intro')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-800 to-blue-900' : 'bg-gradient-to-r from-blue-600 to-blue-800'} text-white py-6 shadow-md`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Nowports Assistant</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <LanguageSelector />
              <button 
                onClick={toggleTheme}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                aria-label={theme === 'dark' ? t('toggleLight') : t('toggleDark')}
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                )}
              </button>
              <Link href="/widget">
                <a className="bg-white text-blue-700 hover:bg-blue-50 transition py-2 px-4 rounded-lg shadow font-medium">
                  {t('viewWidget')}
                </a>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden h-[calc(100vh-12rem)] flex flex-col`}>
              {mounted && <ChatContainer theme={theme} />}
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>{t('aboutNowports')}</h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                {t('aboutDescription')}
              </p>
              
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>{t('ourServices')}</h3>
              <ul className={`list-disc pl-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 space-y-1`}>
                <li>{t('serviceTransport')}</li>
                <li>{t('serviceCustoms')}</li>
                <li>{t('serviceInsurance')}</li>
                <li>{t('serviceFinancing')}</li>
                <li>{t('serviceTracking')}</li>
                <li>{t('serviceStorage')}</li>
              </ul>
              
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>{t('help')}</h3>
              <ul className={`list-disc pl-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                <li>{t('routeInfo')}</li>
                <li>{t('quotes')}</li>
                <li>{t('documents')}</li>
                <li>{t('incotermsHelp')}</li>
                <li>{t('experts')}</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className={`${theme === 'dark' ? 'bg-gray-800 border-t border-gray-700' : 'bg-gray-800'} text-white py-6 mt-8`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-300">
                © {new Date().getFullYear()} Nowports. {t('allRightsReserved')}
              </p>
            </div>
            <div className="text-sm text-gray-300 md:text-right">
              <p>{t('poweredBy')}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'es', ['common'])),
    },
  };
}; 