// src/ChatBox.jsx
import React, { useState } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  TypingIndicator,
  MessageInput
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
    // Ajout du message utilisateur
    setMessages((prev) => [...prev, { message: text, sender: "user" }]);
    setTyping(true);
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
    <div className="chat-wrapper">
      <MainContainer>
        <ChatContainer>
          <MessageList
            typingIndicator={
              typing ? <TypingIndicator content="Mawa écrit…" /> : null
            }
          >
            {messages.map((m, i) => (
              <Message
                key={i}
                model={{
                  message: m.message,
                  sentTime: "maintenant",
                  sender: m.sender
                }}
              />
            ))}
          </MessageList>
          <MessageInput
            placeholder="Pose ta question…"
            onSend={handleSend}
            attachButton
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
