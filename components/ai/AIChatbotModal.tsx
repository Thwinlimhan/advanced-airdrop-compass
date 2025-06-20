import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { MessageSquare, Bot, User, Send, Loader2, AlertTriangle } from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { useToast } from '../../hooks/useToast';
import { AlertMessage } from '../ui/AlertMessage'; // Added import

interface AIChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'systemError';
  text: string;
  timestamp: Date;
}

export const AIChatbotModal: React.FC<AIChatbotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { addToast } = useToast();
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true);
      setError("API_KEY for AI Chatbot is not configured. This feature is unavailable.");
      setMessages([{
        id: crypto.randomUUID(),
        sender: 'systemError',
        text: "AI Chatbot is unavailable because the API_KEY is not configured.",
        timestamp: new Date()
      }]);
    } else {
      setIsApiKeyMissing(false);
      setError(null);
      // Only reset messages if API key becomes available and was previously missing
      if (messages.length === 1 && messages[0].sender === 'systemError' && messages[0].text.includes("API_KEY")) {
        setMessages([]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Check API key on mount

  useEffect(() => {
    if (isOpen && !isApiKeyMissing && (!chatInstance || messages.length === 0 || (messages.length === 1 && messages[0].sender === 'systemError'))) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const newChat = ai.chats.create({
          model: 'gemini-2.5-flash-preview-04-17',
          config: {
            systemInstruction: "You are 'Compass Guide', a friendly and helpful AI assistant for the Advanced Crypto Airdrop Compass application. Your primary role is to answer user questions about airdrop farming strategies, Sybil attack prevention, general cryptocurrency concepts, and how to use different features of this application. Be concise and encouraging. If you don't know something, say so. Do not provide financial advice or specific airdrop predictions. You cannot perform actions within the app for the user, but you can explain how they might perform them.",
          },
        });
        setChatInstance(newChat);
        if (messages.length === 0 || (messages.length === 1 && messages[0].sender === 'systemError' && messages[0].text.includes("API_KEY"))) {
             setMessages([{
                id: crypto.randomUUID(),
                sender: 'ai',
                text: "Hello! I'm Compass Guide. How can I help you with your airdrop journey today?",
                timestamp: new Date()
            }]);
        }
      } catch (e) {
        console.error("Failed to initialize chat:", e);
        setError("Failed to initialize AI Chat. Please try again later.");
        addToast("AI Chat initialization failed.", "error");
      }
    }
  }, [isOpen, isApiKeyMissing, chatInstance, addToast, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chatInstance || isApiKeyMissing) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: userInput,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response: GenerateContentResponse = await chatInstance.sendMessage({ message: userMsg.text });
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: response.text.trim(),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI Chat Error:", err);
      const errorText = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`AI chat error: ${errorText}`);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'systemError',
        text: `Sorry, I encountered an error: ${errorText}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      <div className="flex items-center">
        <MessageSquare size={20} className="mr-2 text-indigo-500" /> AI Chat Assistant
      </div>
    } size="lg">
      <div className="flex flex-col h-[60vh]">
        <div className="flex-grow overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-800 rounded-t-md">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-2.5 rounded-xl shadow-sm ${
                msg.sender === 'user' ? 'bg-primary-light dark:bg-primary-dark text-white rounded-br-none' :
                msg.sender === 'ai' ? 'bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark rounded-bl-none' :
                'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-bl-none' // systemError
              }`}>
                <div className="flex items-start gap-2 text-sm">
                  {msg.sender === 'ai' && <Bot size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />}
                  {msg.sender === 'user' && <User size={16} className="text-indigo-100 flex-shrink-0 mt-0.5" />}
                  {msg.sender === 'systemError' && <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />}
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                </div>
                <p className="text-xs opacity-60 mt-1 text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
         {(error && !isApiKeyMissing && messages.some(m => m.sender === 'systemError' && m.text === error)) && ( // only show if this error is the last one
             <div className="p-3 border-t border-gray-200 dark:border-gray-600">
                <AlertMessage type="error" title="Chat Error" message={error} onDismiss={() => setError(null)} />
             </div>
        )}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-600 flex items-center gap-2 bg-gray-100 dark:bg-gray-750 rounded-b-md">
          <Input
            id="chatbot-user-input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask Compass Guide..."
            className="h-10 text-sm"
            disabled={isLoading || isApiKeyMissing}
          />
          <Button type="submit" disabled={isLoading || !userInput.trim() || isApiKeyMissing} className="h-10 px-3">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </form>
      </div>
    </Modal>
  );
};