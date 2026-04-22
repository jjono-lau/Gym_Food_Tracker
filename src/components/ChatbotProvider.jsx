"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "@/components/icons";
import { buildAssistantReply, createStarterMessages } from "@/lib/chatResponder";

const ChatbotContext = createContext(null);

export function useChatbot() {
  const value = useContext(ChatbotContext);

  if (!value) {
    throw new Error("useChatbot must be used within ChatbotProvider");
  }

  return value;
}

function FloatingChatbot() {
  const { isOpen, openChat, closeChat } = useChatbot();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(() => createStarterMessages());
  const [isResponding, setIsResponding] = useState(false);
  const inputId = useId();
  const latestAssistantMessageRef = useRef(null);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.role !== "assistant") return;

    latestAssistantMessageRef.current?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  }, [messages]);

  const submitMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed || isResponding) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setDraft("");
    setIsResponding(true);

    window.setTimeout(() => {
      const reply = buildAssistantReply(trimmed, { history: conversation });
      if (process.env.NODE_ENV !== "production") {
        console.debug("[GlowUp chat trace]", reply.debug ?? {
          query: trimmed,
          intent: reply.intent,
          answerType: reply.answerType,
        });
      }
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: reply.text,
          intent: reply.intent,
          answerType: reply.answerType,
          facts: reply.facts,
          sources: reply.sources,
          debug: reply.debug,
        },
      ]);
      setIsResponding(false);
    }, 280);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-5 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-[28px] border border-white/70 bg-white/88 shadow-[0_24px_80px_rgba(43,27,45,0.18)] backdrop-blur-xl sm:bottom-6 sm:right-6"
          >
            <div className="relative overflow-hidden rounded-[28px]">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-pink/85 via-lavender/80 to-sage/75"
                aria-hidden
              />
              <div className="relative flex items-start justify-between gap-4 p-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-cream shadow-lg shadow-pink/30">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">GlowUp chat</p>
                    <p className="text-xs text-muted">WebLLM-ready assistant shell</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeChat}
                  className="rounded-full border border-white/70 bg-white/80 p-2 text-muted transition hover:text-ink"
                  aria-label="Close chat"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 px-4 pb-4">
                <div className="rounded-[24px] border border-white/70 bg-cream/90 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Local knowledge chat
                    </span>
                    <span className="text-[11px] font-medium text-muted">
                      pre-WebLLM mode
                    </span>
                  </div>

                  <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        ref={
                          message.role === "assistant" &&
                          message.id === messages[messages.length - 1]?.id
                            ? latestAssistantMessageRef
                            : null
                        }
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          message.role === "user"
                            ? "ml-auto bg-ink text-cream"
                            : "bg-white text-ink shadow-sm"
                        }`}
                      >
                        <span className="whitespace-pre-line">{message.text}</span>
                      </div>
                    ))}
                    {isResponding ? (
                      <div className="max-w-[88%] rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed text-ink shadow-sm">
                        Looking through your local knowledge...
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/70 bg-white/90 p-3">
                  <label htmlFor={inputId} className="sr-only">
                    Message the assistant
                  </label>
                  <textarea
                    id={inputId}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        submitMessage();
                      }
                    }}
                    rows={3}
                    placeholder="Ask about workouts, meals, or healthy habits..."
                    className="w-full resize-none rounded-2xl border border-ink/10 bg-cream/70 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-peach"
                  />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted">
                      Real local replies now. WebLLM can replace the reply engine later.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={closeChat}
                        className="rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:border-peach"
                      >
                        Hide
                      </button>
                      <button
                        type="button"
                        onClick={submitMessage}
                        className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!draft.trim() || isResponding}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
        
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            type="button"
            onClick={openChat}
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/92 text-left shadow-[0_18px_48px_rgba(43,27,45,0.14)] backdrop-blur sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:justify-start sm:gap-3 sm:px-4 sm:py-3"
            aria-label="Open chat"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink to-lavender text-ink">
              <Sparkles size={18} />
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-semibold text-ink">Need a nudge?</span>
              <span className="block text-xs text-muted">Open GlowUp chat</span>
            </span>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default function ChatbotProvider({ children }) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("glowup-chatbot-open") !== "false";
  });

  useEffect(() => {
    window.localStorage.setItem("glowup-chatbot-open", String(isOpen));
  }, [isOpen]);

  const value = useMemo(
    () => ({
      isOpen,
      openChat: () => setIsOpen(true),
      closeChat: () => setIsOpen(false),
    }),
    [isOpen],
  );

  return (
    <ChatbotContext.Provider value={value}>
      {children}
      <FloatingChatbot />
    </ChatbotContext.Provider>
  );
}
