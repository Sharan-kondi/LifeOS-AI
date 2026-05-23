"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, MessageSquare, Loader2, User, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { sendChatMessage } from "@/services/data";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your LifeOS AI assistant. I can analyze your spending, detect anomalies, forecast your finances, and help optimize your budget. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Pass the previous messages as history to maintain context
      const history = messages.filter(m => m.role !== "assistant" || m.content !== messages[0].content);
      const response = await sendChatMessage(userMessage.content, history);
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer || "Sorry, I couldn't process that." },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! The AI services are currently unavailable or still spinning up. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Your autonomous financial & productivity copilot
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-zinc-800 bg-card/50">
        {/* Chat Header / Info */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">LifeOS AI</h2>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge variant="secondary" className="text-[10px] h-4">LangChain</Badge>
                <Badge variant="secondary" className="text-[10px] h-4">Gemini</Badge>
                <Badge variant="secondary" className="text-[10px] h-4">Multi-Agent</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "user"
                    ? "bg-indigo-600/20"
                    : "bg-violet-600/20"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4 text-indigo-400" />
                ) : (
                  <Sparkles className="h-4 w-4 text-violet-400" />
                )}
              </div>
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-secondary/50 rounded-tl-sm text-foreground prose prose-sm dark:prose-invert"
                }`}
              >
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600/20">
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>
              <div className="rounded-2xl bg-secondary/50 rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </CardContent>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-background">
          <div className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              placeholder="Ask me anything about your finances..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={loading}
              className="h-12 w-full rounded-xl border border-input bg-secondary/30 pl-4 pr-12 text-sm text-foreground focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            AI agents can make mistakes. Consider verifying financial advice.
          </p>
        </div>
      </Card>
    </div>
  );
}
