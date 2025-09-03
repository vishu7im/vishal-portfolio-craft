import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Bot, MessageSquare, X } from "lucide-react";
import ChatBot from "./ChatBot";

export default function ChatBotTrigger() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAutoShown, setHasAutoShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAutoShown) {
        setIsVisible(true);
        setHasAutoShown(true);
      }
    }, 3000); // Increased delay to 5 seconds

    return () => clearTimeout(timer);
  }, [hasAutoShown]);

  const toggleChat = () => {
    setIsVisible((v) => !v);
    if (!hasAutoShown) setHasAutoShown(true);
  };

  return (
    <>
      {/* Toggle button with proper spacing from ThemeSwitcher */}
      <div className="fixed bottom-20 right-6 z-[80]">
        <Button
          onClick={toggleChat}
          size="icon"
          variant="outline"
          aria-label={isVisible ? "Close chat" : "Open chat"}
          className="h-12 w-12 rounded-full gradient-border bg-background/90 backdrop-blur-md  transition-all duration-300 group hover:scale-110"
        >
          {isVisible ? (
            <X size={20} className="text-primary transition-transform group-hover:rotate-90" />
          ) : (
            <Bot size={16} className="text-primary transition-transform group-hover:scale-110" />
            // <MessageSquare size={20} className="text-primary transition-transform group-hover:scale-110" />
          )}
        </Button>
      </div>

      <ChatBot isVisible={isVisible} onToggle={toggleChat} />
    </>
  );
}
