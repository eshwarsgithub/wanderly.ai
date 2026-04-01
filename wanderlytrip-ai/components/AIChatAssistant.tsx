"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, User, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { refineTripAction } from "@/app/actions/generate-itinerary";
import type { GeneratedItinerary } from "@/lib/ai-agent";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatAssistantProps {
  itinerary: GeneratedItinerary;
  onItineraryUpdate: (updated: GeneratedItinerary) => void;
}

const SUGGESTIONS = [
  "Make Day 2 more foodie",
  "Add a spa day",
  "Find cheaper alternatives",
  "Make it more adventurous",
];

export default function AIChatAssistant({ itinerary, onItineraryUpdate }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `I've crafted your ${itinerary.destination} trip! Ask me to refine any part — change a day's vibe, swap activities, adjust for budget, or anything else. 🌍`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(text: string) {
    if (!text.trim() || isPending) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    startTransition(async () => {
      const result = await refineTripAction(itinerary, text);
      if (result.success) {
        onItineraryUpdate(result.itinerary);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: `Done! I've updated your itinerary based on your request. Check the timeline for the changes. ✨`,
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `Sorry, I couldn't update that: ${result.error}` },
        ]);
      }
    });
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl font-medium text-sm text-[#0a0a0a] teal-glow transition-all ${isOpen ? "opacity-0 pointer-events-none" : ""}`}
        style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}
      >
        <MessageCircle className="w-4 h-4" />
        Refine Trip
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-6 z-50 w-80 sm:w-96 glass rounded-3xl overflow-hidden teal-glow-sm flex flex-col"
            style={{ maxHeight: "480px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
                  <Sparkles className="w-4 h-4 text-[#0a0a0a]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">AI Assistant</p>
                  <p className="text-white/40 text-xs">Refine your itinerary</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: msg.role === "assistant"
                        ? "linear-gradient(135deg, #00f5d4, #00c4aa)"
                        : "rgba(255,255,255,0.1)",
                    }}
                  >
                    {msg.role === "assistant"
                      ? <Bot className="w-3.5 h-3.5 text-[#0a0a0a]" />
                      : <User className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div
                    className="flex-1 px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: msg.role === "assistant"
                        ? "rgba(0,245,212,0.08)"
                        : "rgba(255,255,255,0.08)",
                      color: msg.role === "assistant" ? "rgba(240,255,254,0.9)" : "rgba(240,255,254,0.8)",
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isPending && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
                    <Bot className="w-3.5 h-3.5 text-[#0a0a0a]" />
                  </div>
                  <div className="px-3 py-2 rounded-2xl bg-[#00f5d4]/10">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-[#00f5d4]"
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                          transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            <div className="px-4 pb-2 flex gap-2 flex-wrap flex-shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  disabled={isPending}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#00f5d4]/20 text-[#00f5d4]/70 hover:bg-[#00f5d4]/10 hover:text-[#00f5d4] transition-colors disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 pt-2 flex gap-2 flex-shrink-0">
              <Input
                placeholder="Ask AI to refine your trip..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                disabled={isPending}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00f5d4]/40 rounded-xl text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(input)}
                disabled={isPending || !input.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}
              >
                <Send className="w-4 h-4 text-[#0a0a0a]" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
