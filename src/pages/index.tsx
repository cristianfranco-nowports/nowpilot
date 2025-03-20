import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

// Define interface for chat messages
interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting when component mounts
  useEffect(() => {
    setMessages([
      { 
        text: '¡Hola! Soy el asistente de ventas de Nowports. ¿Cómo puedo ayudarle con sus necesidades logísticas hoy?', 
        isUser: false, 
        timestamp: new Date() 
      }
    ]);
  }, []);

  // Scroll to bottom of chat whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');
    
    try {
      console.log('Sending request to API with message:', input);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId,
        }),
      });
      
      console.log('Response status:', response.status);
      
      // Intenta obtener el texto de la respuesta primero para depuración
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      // Convierte el texto a JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed data:', data);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error(`Failed to parse JSON: ${responseText}`);
      }
      
      if (response.ok) {
        // Save session ID if we got one
        if (data.sessionId) {
          setSessionId(data.sessionId);
        }
        
        // Add assistant message to chat
        const assistantMessage: ChatMessage = {
          text: data.response,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error('API returned error:', data);
        // Handle error with more details
        setMessages(prev => [...prev, {
          text: `Error del servidor: ${data.error || 'Desconocido'}. Por favor, inténtelo de nuevo.`,
          isUser: false,
          timestamp: new Date()
        }]);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        text: `Error de conexión: ${error.message}. Por favor, compruebe su conexión e inténtelo de nuevo.`,
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  function formatTimestamp(date: Date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Nowports Sales Assistant</title>
        <meta name="description" content="Powered by AI to help with your logistics needs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Nowports Sales Assistant</h1>
        <p className={styles.description}>
          Powered by AI to help with your logistics needs
        </p>

        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <h2>Nowports Sales Assistant</h2>
            <p>Ask me about logistics, shipping routes, and how Nowports can help your business</p>
          </div>

          <div className={styles.messagesContainer}>
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`${styles.messageWrapper} ${message.isUser ? styles.userMessageWrapper : styles.assistantMessageWrapper}`}
              >
                <div 
                  className={`${styles.message} ${message.isUser ? styles.userMessage : styles.assistantMessage}`}
                >
                  {message.text?.split('\n').map((text, i) => (
                    <p key={i}>{text}</p>
                  ))}
                  <span className={styles.timestamp}>{formatTimestamp(message.timestamp)}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className={`${styles.messageWrapper} ${styles.assistantMessageWrapper}`}>
                <div className={`${styles.message} ${styles.assistantMessage}`}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className={styles.inputContainer}>
            <textarea
              className={styles.chatInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escriba su mensaje aquí..."
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button 
              type="submit" 
              className={styles.sendButton}
              disabled={loading || !input.trim()}
            >
              Enviar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
} 