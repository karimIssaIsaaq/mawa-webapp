import React, { useState } from "react";
import {
  Message,
  MessageInput,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";
import { Virtuoso } from "react-virtuoso";
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
    const newMsg = { message: text, sender: "user" };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setTyping(true);

    try {
      const res = await fetch(
        "https://mawaia-back-production.up.railway.app/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            messages: updated.map((m) => ({
              role: m.sender === "ChatGPT" ? "assistant" : "user",
              content: m.message
            }))
          })
        }
      );
      const data = await res.json();
      if (res.status === 429) {
        setMessages((prev) => [
          ...prev,
          { message: data.error || "⛔ Limite atteinte.", sender: "ChatGPT" }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { message: data.reply, sender: "ChatGPT" }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { message: "❌ Erreur, réessaie plus tard.", sender: "ChatGPT" }
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="chatbox-wrapper">
      <div className="chatbox-container">
        {/* Virtual List pour les messages */}
        <Virtuoso
          className="message-list"
          data={messages}
          followOutput="smooth"
          components={{
            Footer: () =>
              typing ? (
                <TypingIndicator content="Mawa est en train d’écrire..." />
              ) : null
          }}
          itemContent={(index, msg) => (
            <Message
              key={index}
              model={{
                message: msg.message,
                sender: msg.sender,
                sentTime: "just now"
              }}
            />
          )}
        />

        {/* Input collé en bas */}
        <div className="input-area">
          <MessageInput onSend={handleSend} placeholder="Pose ta question…" />
        </div>
      </div>
    </div>
  );
}
