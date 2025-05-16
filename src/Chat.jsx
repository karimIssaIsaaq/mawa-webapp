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
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import './ChatBox.css';

const theme = createTheme({
  palette: {
    primary: { main: '#4A90E2' },
    secondary: { main: '#50E3C2' },
    background: { default: '#F9FAFB' }
  },
  shape: { borderRadius: 20 },
  typography: { fontFamily: '"Inter", sans-serif' }
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: 'clamp(300px, 90vw, 600px)',
  height: 'clamp(400px, 85vh, 800px)',
  display: 'flex',
  flexDirection: 'column',
  margin: 'auto',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  backgroundColor: '#fff',
  [theme.breakpoints.down('sm')]: {
    width: '95vw',
    height: '95vh',
    margin: 'auto'
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

  const email =
    new URLSearchParams(window.location.search).get('email') || '';

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

    // 1) Ajout du message utilisateur
    setMessages((prev) => [...prev, { message: text, sender: 'user' }]);
    setTyping(true);

    // 2) Appel au back
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
    } catch (err) {
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
      <StyledPaper elevation={3}>
        {/* HEADER */}
        <Box component="header" className="chat-header">
          Mawaia Assistant
        </Box>

        {/* BODY */}
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

        {/* FOOTER / FORM */}
        <Box component="form" onSubmit={handleSubmit} className="chat-footer">
          <IconButton component="label" className="attach-btn">
            <input type="file" hidden />
            <AttachFileIcon />
          </IconButton>
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
            <SendIcon />
          </IconButton>
        </Box>
      </StyledPaper>
    </ThemeProvider>
  );
}
