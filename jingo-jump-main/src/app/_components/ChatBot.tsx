"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2, User, Bot } from "lucide-react";

const mockMessages = [
  {
    id: 1,
    text: "Hello! Welcome to JingoJump Wholesale. I'm here to help you find the perfect commercial inflatables for your business. How can I assist you today?",
    sender: "bot",
    timestamp: new Date(),
  },
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user" as const,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Mock bot response after a delay
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: "Thank you for your inquiry! Our wholesale team will provide detailed information about pricing, bulk discounts, and availability. For immediate assistance, please call us at 1-800-JINGO-JUMP or email wholesale@jingojump.com",
        sender: "bot" as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (message: string) => {
    setInputValue(message);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[600px] w-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-6">
          {/* Header */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[primary-500]">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Wholesale Support
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-xs font-medium text-slate-300">
                      Online Now
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    message.sender === "user"
                      ? "bg-slate-700"
                      : "bg-[primary-500]"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className="flex max-w-[75%] flex-col">
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-slate-700 text-white"
                        : "bg-white border border-slate-200 text-slate-900"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  <p
                    className={`mt-1 px-1 text-xs text-slate-400 ${
                      message.sender === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[primary-500]">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-white border border-slate-200 px-4 py-3">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="border-t border-slate-200 bg-white px-6 py-4">
            <p className="mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickAction("What are your bulk pricing options?")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all hover:border-[primary-500] hover:bg-primary-50 hover:text-[primary-500]"
              >
                💰 Bulk Pricing
              </button>
              <button
                onClick={() => handleQuickAction("Tell me about your warranty")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all hover:border-[primary-500] hover:bg-primary-50 hover:text-[primary-500]"
              >
                🛡️ Warranty Info
              </button>
              <button
                onClick={() => handleQuickAction("What products are in stock?")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all hover:border-[primary-500] hover:bg-primary-50 hover:text-[primary-500]"
              >
                📦 In Stock
              </button>
              <button
                onClick={() => handleQuickAction("How do I place an order?")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all hover:border-[primary-500] hover:bg-primary-50 hover:text-[primary-500]"
              >
                🚀 Place Order
              </button>
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t border-slate-200 bg-white p-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-[primary-500] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[primary-500]/20"
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-lg bg-[primary-500] px-5 py-3 text-white shadow-sm transition-all hover:bg-primary-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!inputValue.trim()}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-all duration-200 hover:bg-blue-600 hover:scale-110 hover:shadow-xl active:scale-95"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <Minimize2 className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            {/* Notification Dot */}
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 border-2 border-white">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          </>
        )}
      </button>
    </>
  );
}
