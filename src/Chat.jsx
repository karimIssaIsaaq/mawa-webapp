// src/ChatBox.jsx
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";
import { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./ChatBox.css";

export default function ChatBox() {
  const [messages, setMessages] = useState([
    {
      message: "Salam 👋 Je suis ton assistant, là pour t'aider quand tu en as besoin. Dis-moi ce que je peux faire pour toi.",
      sender: "ChatGPT"
    }
  ]);
  const [typing, setTyping] = useState(false);

  const email = new URLSearchParams(window.location.search).get("email") || "";
  const handleSend = async (userMessage) => {
    if (!email) {
      setMessages((prev) => [
        ...prev,
        {
          message: "🔒 Tu dois être connecté à ton compte Shopify pour utiliser ce service.",
          sender: "ChatGPT"
        }
      ]);
      return;
    }

    const newMessage = {
      message: userMessage,
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);

    try {
      const response = await fetch("https://mawaia-back-production.up.railway.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          messages: newMessages.map((m) => ({
            role: m.sender === "ChatGPT" ? "assistant" : "user",
            content: m.message
          }))
        })
      });

      const data = await response.json();

      if (response.status === 429) {
        setMessages((prev) => [
          ...prev,
          { message: data.error || "⛔ Limite de messages atteinte.", sender: "ChatGPT" }
        ]);
      } else {
        setMessages([
          ...newMessages,
          { message: data.reply, sender: "ChatGPT" }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { message: "❌ Une erreur est survenue. Réessaie plus tard.", sender: "ChatGPT" }
      ]);
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="chatbox-wrapper">
      <div className="chatbox-container">
        <MainContainer>
          <ChatContainer>
            <MessageList
              typingIndicator={
                typing ? <TypingIndicator content="Mawa est en train d’écrire..." /> : null
              }
            >
              {messages.map((msg, i) => (
                <Message
                  key={i}
                  model={{
                    message: msg.message,
                    sentTime: "just now",
                    sender: msg.sender
                  }}
                />
              ))}
            </MessageList>
            <MessageInput placeholder="Pose ta question..." onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}
