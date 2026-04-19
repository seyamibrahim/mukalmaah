import React, { useState, useEffect, useRef } from "react";
import { ArrowUp, Loader2, Menu } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import useChatStore from "../store/useChatStore";
import MessageBubble from "./MessageBubble";
import logo from "../assets/logo-removebg-preview.png";
import useUIStore from "../store/useUIStore";

const ChatArea = () => {
  const [prompt, setPrompt] = useState("");
  const { currentChat, sendMessage, isSending, isLoading } = useChatStore();
  const { toggleSidebar } = useUIStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const logoStyle = {
    filter:
      "brightness(0) saturate(100%) invert(71%) sepia(59%) saturate(1106%) hue-rotate(357deg) brightness(96%) contrast(92%) drop-shadow(0 8px 18px rgba(219, 155, 52, 0.25))",
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, isSending]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isSending) return;

    const currentPrompt = prompt;
    setPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const newChatId = await sendMessage(currentPrompt, id);
    if (!id && newChatId) {
      navigate(`/c/${newChatId}`);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="relative h-14 bg-background/80 backdrop-blur-md border-b border-custom px-4 md:px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors"
            title="Open menu"
          >
            <Menu className="w-5 h-5 text-text" />
          </button>
          <h2 className="font-semibold text-text truncate">
            {currentChat?.title || "New Guidance Session"}
          </h2>
        </div>
        <img
          src={logo}
          alt="Mukalmah logo"
          className="absolute left-1/2 top-1/2 h-16 w-auto max-w-60 -translate-x-1/2 -translate-y-1/2 object-contain"
          style={{
            filter: "brightness(0) saturate(100%) invert(100%) contrast(200%)",
            opacity: 0.95,
            WebkitFilter:
              "brightness(0) saturate(100%) invert(100%) contrast(200%)",
          }}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {isLoading && !currentChat ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !currentChat?.messages?.length ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <h2
              className="text-3xl md:text-4xl font-arabic text-[#db9b34]"
              dir="rtl"
            >
              بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </h2>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text">
              Find{" "}
              <span className="text-[#db9b34] italic font-serif">
                divine guidance
              </span>
            </h1>
            <p className="text-[#66b2a3] text-lg max-w-md">
              Share what's on your heart. We'll guide you through Quran &
              Hadith.
            </p>
          </div>
        ) : (
          currentChat.messages.map((msg, idx) => (
            <MessageBubble key={msg._id || idx} message={msg} />
          ))
        )}

        {isSending && (
          <div className="flex items-center gap-3 text-muted p-4 bg-surface rounded-2xl max-w-[80%] border border-custom glass-panel animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Reflecting on your words...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 lg:p-6 bg-background border-t border-custom">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              // Reset first so it can shrink, then grow to content
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 200) + "px";
            }}
            placeholder="Share what's on your heart..."
            style={{ minHeight: "48px", height: "auto" }}
            className="w-full bg-surface border border-custom rounded-2xl py-3 md:py-4 pl-4 md:pl-6 pr-12 md:pr-14 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none max-h-50 text-sm md:text-base"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (e.shiftKey) {
                  // Native shift+enter newline
                  setTimeout(() => {
                    if (textareaRef.current) {
                      textareaRef.current.style.height = "60px";
                      textareaRef.current.style.height =
                        Math.min(textareaRef.current.scrollHeight, 200) + "px";
                    }
                  }, 0);
                  return;
                } else {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }
            }}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isSending}
            className="absolute right-2 md:right-3 bottom-2 md:bottom-3 w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-primary hover:bg-primary-hover disabled:opacity-40 text-white rounded-xl transition-colors shadow-sm"
          >
            <ArrowUp className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
