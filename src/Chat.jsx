import React, { useState, useEffect, useRef } from 'react';
import {
  Message,
  TypingIndicator
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import './ChatBox.css';

const theme = createTheme({
  palette: {
    primary: { main: '#1f2937' },
    secondary: { main: '#3b82f6' },
    background: { default: '#f3f4f6' }
  },
  shape: { borderRadius: 24 },
  typography: { fontFamily: '"Inter", sans-serif' }
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: 'clamp(320px, 60vw, 600px)',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 12px 48px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    width: '100vw',
    height: '100vh',
    margin: 0,
    borderRadius: 0
  }
}));

export default function ChatBox() {
  const [messages, setMessages] = useState([
    {
      message:
        'Salam 👋 Je suis ton assistant, là pour t’aider quand tu en as besoin.',
      sender: 'assistant'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const email = new URLSearchParams(window.location.search).get('email') || '';

  const handleSend = async (text) => {
    if (!email) {
      setMessages((prev) => [
        ...prev,
        {
          message:
            '🔒 Tu dois être connecté à ton compte Shopify pour utiliser ce service.',
          sender: 'assistant'
        }
      ]);
      return;
    }
    setMessages((prev) => [...prev, { message: text, sender: 'user' }]);
    setTyping(true);
    try {
      const res = await fetch(
        'https://mawaia-back-production.up.railway.app/api/chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            messages: [...messages, { message: text, sender: 'user' }].map(
              (m) => ({
                role: m.sender === 'assistant' ? 'assistant' : 'user',
                content: m.message
              })
            )
          })
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { message: data.reply, sender: 'assistant' }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            message: data.error || 'Une erreur est survenue.',
            sender: 'assistant'
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { message: '❌ Erreur réseau, réessaie plus tard.', sender: 'assistant' }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    handleSend(text);
    setInputValue('');
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledPaper elevation={4}>
        {/* HEADER */}
        <Box component="header" className="chat-header">
          Mawaia Assistant
        </Box>

        {/* MESSAGES */}
        <Box className="chat-body">
          {messages.map((m, i) => (
            <Message
              key={i}
              model={{
                message: m.message,
                sender: m.sender,
                sentTime: 'maintenant'
              }}
            />
          ))}
          {typing && <TypingIndicator content="L’assistant écrit…" />}
          <div ref={bottomRef} />
        </Box>

        {/* INPUT */}
        <Box component="form" onSubmit={handleSubmit} className="chat-footer">
          <TextField
            className="chat-input-field"
            placeholder="Pose ta question…"
            variant="outlined"
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            InputProps={{ className: 'chat-textarea' }}
          />
          <IconButton
            type="submit"
            className="send-btn"
            disabled={!inputValue.trim()}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </StyledPaper>
    </ThemeProvider>
  );
}
