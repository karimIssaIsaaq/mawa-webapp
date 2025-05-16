// src/ChatBox.jsx
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";
import { useState, useRef, useEffect } from "react";
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
  const listRef = useRef(null);

  // Scroll auto vers le bas à chaque nouveau message
  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const email = new URLSearchParams(window.location.search).get("email") || "";

  const handleSend = async (userMessage) => {
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

    const newMsg = { message: userMessage, sender: "user" };
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
          { message: data.error || "⛔ Limite de messages atteinte.", sender: "ChatGPT" }
        ]);
      } else {
        setMessages([...updated, { message: data.reply, sender: "ChatGPT" }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { message: "❌ Une erreur est survenue. Réessaie plus tard.", sender: "ChatGPT" }
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="chatbox-wrapper">
      <div className="chatbox-container">
        <MainContainer className="main">
          <ChatContainer className="chat">
            <MessageList
              ref={listRef}
              className="messages"
              typingIndicator={
                typing && <TypingIndicator content="Mawa est en train d’écrire..." />
              }
            >
              {messages.map((msg, i) => (
                <Message
                  key={i}
                  model={{
                    message: msg.message,
                    sender: msg.sender,
                    sentTime: "just now"
                  }}
                />
              ))}
            </MessageList>
            <MessageInput placeholder="Pose ta question…" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}
