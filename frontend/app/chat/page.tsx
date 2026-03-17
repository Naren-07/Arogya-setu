'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Namaste! 🙏 I am SwasthyaSaathi, your healthcare assistant.\n\nYou can ask me about:\n• 🤒 Symptoms — \"I have fever and headache\"\n• 💉 Vaccinations — \"What vaccines for a 6-month baby?\"\n• 🌿 Health Tips — \"Monsoon health tips\"\n• 🚨 Alerts — \"Any disease alerts?\"\n\nHow can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick suggestion buttons
  const suggestions = [
    { text: 'I have fever and cold', icon: '🤒' },
    { text: 'Child vaccination schedule', icon: '💉' },
    { text: 'Hygiene tips', icon: '🧼' },
    { text: 'Any disease alerts?', icon: '🚨' },
  ];

  const suggestionHi = [
    { text: 'मुझे बुखार है', icon: '🤒' },
    { text: 'बच्चे का टीका', icon: '💉' },
    { text: 'सफाई के सुझाव', icon: '🧼' },
    { text: 'बीमारी की चेतावनी', icon: '🚨' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check backend health on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/health`)
      .then((r) => r.ok ? setBackendStatus('online') : setBackendStatus('offline'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || 'Sorry, I could not process your request. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        intent: data.intent,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '🔌 Unable to connect to server. Please ensure the backend is running:\n\n```\ncd backend && npm install && npm run dev\n```\n\n⚠️ Disclaimer: This chatbot provides general guidance only. Please consult a doctor for medical advice.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const currentSuggestions = language === 'hi' ? suggestionHi : suggestions;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 h-[calc(100vh-140px)] flex flex-col">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3 p-3 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-lg shadow-md">
            🏥
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">SwasthyaSaathi</h2>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-green-500 animate-pulse' : backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
              <span className="text-xs text-gray-500">
                {backendStatus === 'online' ? 'Online' : backendStatus === 'offline' ? 'Offline' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="language-switcher" className="text-xs text-gray-500">🌐</label>
          <select
            id="language-switcher"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
          </select>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3 pr-1 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-md'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              {msg.intent && msg.sender === 'bot' && (
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 border border-primary-100">
                    {msg.intent === 'symptom' && '🤒 Symptom'}
                    {msg.intent === 'vaccination' && '💉 Vaccination'}
                    {msg.intent === 'tips' && '🌿 Health Tips'}
                    {msg.intent === 'alert' && '🚨 Alert'}
                    {msg.intent === 'emergency' && '🆘 Emergency'}
                    {msg.intent === 'general' && '💬 General'}
                  </span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              <p className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-primary-200' : 'text-gray-400'}`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-gray-400 ml-1">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions (shown only when few messages) */}
      {messages.length <= 2 && !isLoading && (
        <div className="flex gap-2 pb-3 overflow-x-auto">
          {currentSuggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s.text)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border border-primary-200 bg-primary-50 text-primary-700 text-xs font-medium hover:bg-primary-100 hover:border-primary-300 transition-all hover:shadow-sm"
            >
              <span>{s.icon}</span>
              <span>{s.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            language === 'hi' ? 'अपना सवाल पूछें...'
              : language === 'mr' ? 'तुमचा प्रश्न विचारा...'
                : 'Ask your health question...'
          }
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
          disabled={isLoading}
        />
        <button
          id="send-button"
          onClick={() => sendMessage()}
          disabled={isLoading || !input.trim()}
          className="px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          {isLoading ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
}
