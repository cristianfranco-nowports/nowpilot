import React, { useState, useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { ChatMessage, ChatState } from '../types/chat';

const ChatContainer: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    loading: false,
    error: null,
    sessionId: null,
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatState.messages]);

  // Add a welcome message when the component mounts
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      content: 'Hello! I\'m the Nowports sales assistant. How can I help you with your logistics needs today?',
      role: 'assistant',
      timestamp: Date.now(),
    };
    
    setChatState((prev) => ({
      ...prev,
      messages: [welcomeMessage],
    }));
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Create a new user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: Date.now(),
    };

    // Update chat state with user message and show loading
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      loading: true,
      error: null,
    }));

    try {
      console.log('Sending message to API:', content);
      
      // Send the message to the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId: chatState.sessionId,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API error:', errorData);
        throw new Error(`API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Received response:', data);

      // Create assistant message from the response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        content: data.response,
        role: 'assistant',
        timestamp: Date.now(),
      };

      // Update chat state with assistant response
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        loading: false,
        sessionId: data.sessionId,
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setChatState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to get response. Please try again. Error: ' + (error instanceof Error ? error.message : String(error)),
      }));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 p-4 rounded-t-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800">Nowports Sales Assistant</h2>
        <p className="text-sm text-gray-600">
          Ask me about logistics, shipping routes, and how Nowports can help your business
        </p>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-white"
      >
        {chatState.messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        
        {chatState.loading && (
          <div className="flex items-center text-gray-500 ml-2 mt-2">
            <div className="loading-dots flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}

        {chatState.error && (
          <div className="text-red-500 text-sm my-2 p-2 bg-red-50 rounded">
            {chatState.error}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={chatState.loading} 
        />
      </div>
    </div>
  );
};

export default ChatContainer; 