// src/ChatBox.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Message, TypingIndicator } from '@chatscope/chat-ui-kit-react';
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
    primary: { main: '#6C63FF' },
    secondary: { main: '#3d84a8' },
    background: { default: '#f0f2f5' }
  },
  shape: { borderRadius: 16 },
  typography: { fontFamily: '"Roboto", sans-serif' }
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: 'clamp(280px, 90vw, 400px)',
  height: 'clamp(400px, 80vh, 700px)',
  margin: 'auto',                  // centré verticalement & horizontalement
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
  [theme.breakpoints.down('sm')]: {
    width: '90vw',
    height: '80vh'
  }
}));

export default function ChatBox() {
  const [messages, setMessages] = useState([
    {
      message: 'Salam 👋 Je suis ton assistant, là pour t’aider quand tu en as besoin.',
      sender: 'ChatGPT'
    }
  ]);
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef(null);

  // scroll automatique
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const email = new URLSearchParams(window.location.search).get('email') || '';

  const handleSend = async (text) => {
    if (!email) {
      setMessages(prev => [
        ...prev,
        { message: '🔒 Tu dois être connecté à ton compte Shopify pour utiliser ce service.', sender: 'ChatGPT' }
      ]);
      return;
    }
    setMessages(prev => [...prev, { message: text, sender: 'user' }]);
    setTyping(true);
    try {
      const res = await fetch('https://mawaia-back-production.up.railway.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          messages: [...messages, { message: text, sender: 'user' }].map(m => ({
            role: m.sender === 'ChatGPT' ? 'assistant' : 'user',
            content: m.message
          }))
        })
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        res.status === 429
          ? { message: data.error || '⛔ Limite atteinte.', sender: 'ChatGPT' }
          : { message: data.reply, sender: 'ChatGPT' }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { message: '❌ Erreur, réessaie plus tard.', sender: 'ChatGPT' }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleAttach = e => {
    const file = e.target.files[0];
    if (file) {
      console.log('Fichier attaché :', file);
      // TODO : uploader ou traiter le fichier
    }
  };

  const handleSubmit = e => {
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
        <Box
          component="header"
          sx={{
            p: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: '#fff',
            fontWeight: 600,
            letterSpacing: 0.5
          }}
        >
          Mawaia Assistant
        </Box>

        {/* BODY */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            bgcolor: '#fff',
            p: 2,
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {messages.map((m, i) => (
            <Message
              key={i}
              model={{
                message: m.message,
                sentTime: 'maintenant',
                sender: m.sender
              }}
            />
          ))}
          {typing && <TypingIndicator content="Mawa est en train d’écrire…" />}
          <div ref={bottomRef} />
        </Box>

        {/* FOOTER / FORM */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1.5,
            background: '#fafafa',
            borderTop: '1px solid #e0e0e0'
          }}
        >
          <IconButton component="label" sx={{ p: 1, bgcolor: '#fff', border: '1px solid #ddd', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }} aria-label="Attach file">
            <input type="file" hidden onChange={handleAttach} />
            <AttachFileIcon fontSize="small" />
          </IconButton>

          <TextField
            placeholder="Pose ta question…"
            variant="outlined"
            multiline
            maxRows={4}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            sx={{
              flex: 1,
              mx: 1,
              bgcolor: '#fff',
              borderRadius: theme.shape.borderRadius,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }
            }}
            InputProps={{ sx: { fontFamily: theme.typography.fontFamily, fontSize: '1rem' } }}
          />

          <IconButton type="submit" sx={{ p: 1, color: theme.palette.primary.main }} aria-label="Send">
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </StyledPaper>
    </ThemeProvider>
  );
}
