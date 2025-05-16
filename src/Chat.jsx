import React, { useState, useEffect, useRef } from "react";
import {
  Message,
  MessageInput,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./ChatBox.css";

export default function ChatBox() {
  const [messages, setMessages] = useState([
    {
      message:
        "Salam 👋 Je suis ton assistant, là pour t'aider quand tu en as besoin.",
      sender: "ChatGPT"
    }
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  // scroll page vers le bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const email = new URLSearchParams(window.location.search).get("email") || "";

  const handleSend = async (text) => {
    if (!email) {
      setMessages((prev) => [
        ...prev,
        {
          message:
            "🔒 Tu dois être connecté à ton compte Shopify pour utiliser ce service.",
          sender: "ChatGPT"
        }
      ]);
      return;
    }

    // 1) on ajoute le msg user
    setMessages((prev) => [...prev, { message: text, sender: "user" }]);
    setTyping(true);

    // 2) on appelle l'API
    try {
      const res = await fetch(
        "https://mawaia-back-production.up.railway.app/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            messages: [...messages, { message: text, sender: "user" }].map(
              (m) => ({
                role: m.sender === "ChatGPT" ? "assistant" : "user",
                content: m.message
              })
            )
          })
        }
      );
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        res.status === 429
          ? { message: data.error || "⛔ Limite atteinte.", sender: "ChatGPT" }
          : { message: data.reply, sender: "ChatGPT" }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { message: "❌ Erreur, réessaie plus tard.", sender: "ChatGPT" }
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <div className="chatbox-wrapper">
        <div className="chatbox-container">
          <div className="messages-container">
            {messages.map((m, i) => (
              <Message
                key={i}
                model={{
                  message: m.message,
                  sender: m.sender,
                  sentTime: "just now"
                }}
              />
            ))}

            {typing && (
              <TypingIndicator className="typing-indicator">
                Mawa est en train d’écrire…
              </TypingIndicator>
            )}

            {/* Ancre pour scrollIntoView */}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* Input fixé en bas du viewport */}
      <div className="input-fixed">
        <MessageInput placeholder="Pose ta question…" onSend={handleSend} />
      </div>
    </>
  );
}
