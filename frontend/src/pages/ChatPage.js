import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Send, ArrowLeft, Bot, User } from 'lucide-react';
import { sendChatMessage, getChatHistory } from '@/services/api';
import { toast } from 'sonner';

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory(sessionId);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(userMessage, sessionId);
      setMessages([...messages, response]);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="glass-morphism sticky top-0 z-50 border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-button"
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              size="sm"
              className="rounded-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" fill="currentColor" />
              <span className="text-xl font-heading font-bold text-primary">AI Health Chat</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="rounded-2xl border-stone-200 shadow-card h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="border-b border-stone-200">
            <CardTitle className="font-heading flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Chat with Your AI Health Assistant
            </CardTitle>
            <p className="text-sm text-muted-foreground">Ask me anything about health, wellness, or medical concerns</p>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="chat-messages-container">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Start a conversation! Ask me about symptoms, medications, or health tips.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="chat-bubble chat-bubble-user flex items-start gap-3 max-w-[80%]">
                    <div className="flex-1">
                      <p className="text-sm" data-testid={`user-message-${msg.id}`}>{msg.message}</p>
                    </div>
                    <User className="w-5 h-5 flex-shrink-0" />
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="chat-bubble chat-bubble-ai flex items-start gap-3 max-w-[80%]">
                    <Bot className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap" data-testid={`ai-response-${msg.id}`}>{msg.response}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="chat-bubble chat-bubble-ai flex items-center gap-3">
                  <Bot className="w-5 h-5 text-primary" />
                  <div className="loading-dots flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="border-t border-stone-200 p-4">
            <div className="flex gap-2">
              <Input
                data-testid="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your health question..."
                disabled={loading}
                className="flex-1 rounded-full h-12 bg-secondary border-stone-300 focus:border-primary"
              />
              <Button
                data-testid="send-message-button"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 h-12"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;