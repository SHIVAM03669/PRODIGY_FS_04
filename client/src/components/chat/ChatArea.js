import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Divider,
  Alert,
  Button,
  Stack
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import Drawer from '@mui/material/Drawer';
import Switch from '@mui/material/Switch';
import Badge from '@mui/material/Badge';

const ChatArea = ({ room, user, socket, onRoomDeleted, onRoomLeft, onlineUsers = [] }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  // Fake online status (for demo)
  const isOnline = true;

  useEffect(() => {
    loadMessages();
    
    if (socket) {
      socket.on('newMessage', (message) => {
        console.log('Received newMessage:', message);
        setMessages(prev => [...prev, message]);
      });

      socket.on('userJoined', (data) => {
        console.log(`User ${data.userId} joined the room`);
      });

      socket.on('userLeft', (data) => {
        console.log(`User ${data.userId} left the room`);
      });
    }

    return () => {
      if (socket) {
        socket.off('newMessage');
        socket.off('userJoined');
        socket.off('userLeft');
      }
    };
  }, [room._id, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/messages/room/${room._id}`);
      setMessages(response.data);
    } catch (error) {
      setError('Failed to load messages');
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        room: room._id,
        sender: user.id,
        content: newMessage,
        type: 'text',
        createdAt: new Date().toISOString()
      };

      // Send via Socket.IO for real-time
      socket.emit('sendMessage', messageData);

      // Also save to database
      await axios.post('http://localhost:5000/api/messages/send', messageData);

      setNewMessage('');
    } catch (error) {
      setError('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const messageData = {
        room: room._id,
        sender: user.id,
        content: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        fileUrl: `http://localhost:5000${response.data.fileUrl}`,
        createdAt: new Date().toISOString()
      };

      socket.emit('sendMessage', messageData);
      await axios.post('http://localhost:5000/api/messages/send', messageData);
    } catch (error) {
      setError('Failed to upload file');
      console.error('Error uploading file:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message, idx) => {
    const isOwnMessage =
      (typeof message.sender === 'object' ? message.sender._id : message.sender) === user.id;
    const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
    const senderName = typeof message.sender === 'object' ? message.sender.username : (isOwnMessage ? 'You' : 'Unknown');
    const senderAvatar = typeof message.sender === 'object' && message.sender.avatar ? message.sender.avatar : undefined;
    const isSenderOnline = !isOwnMessage && onlineUsers.includes(senderId);
    return (
      <Box
        key={message._id || idx}
        sx={{
          display: 'flex',
          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          mb: 2,
          px: 2,
          gap: 1.5,
          animation: 'fadeIn 0.3s',
        }}
      >
        <Badge
          color="success"
          variant={isSenderOnline ? 'dot' : undefined}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Avatar src={senderAvatar} sx={{ width: 32, height: 32, bgcolor: isOwnMessage ? 'primary.main' : 'grey.400' }}>
            {senderName[0]}
          </Avatar>
        </Badge>
        <Box
          sx={{
            maxWidth: '70%',
            backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
            color: isOwnMessage ? 'white' : 'text.primary',
            borderRadius: 2,
            p: 2,
            position: 'relative',
            boxShadow: 2,
            alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
            borderTopRightRadius: isOwnMessage ? 0 : 16,
            borderTopLeftRadius: isOwnMessage ? 16 : 0,
            transition: 'background 0.2s',
          }}
        >
          {!isOwnMessage && (
            <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1, display: 'block', color: 'primary.main' }}>
              {senderName}
            </Typography>
          )}
          {message.type === 'image' ? (
            <img 
              src={message.fileUrl} 
              alt="Shared image" 
              style={{ maxWidth: '100%', borderRadius: 8 }}
            />
          ) : message.type === 'file' ? (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                📎 {message.content}
              </Typography>
              <a 
                href={message.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                Download File
              </a>
            </Box>
          ) : (
            <Typography variant="body1">
              {message.content}
            </Typography>
          )}
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mt: 1, 
              opacity: 0.7,
              textAlign: isOwnMessage ? 'right' : 'left'
            }}
          >
            {formatTime(message.createdAt)}
          </Typography>
        </Box>
      </Box>
    );
  };

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem('darkMode', !prev);
      return !prev;
    });
    // Optionally, trigger a theme change in the parent app
    window.location.reload(); // For demo, reload to apply theme
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background: (theme) => theme.palette.background.default }}>
      {/* Top bar with room name, member count, and action buttons */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0, display: 'flex', alignItems: 'center', gap: 2, mb: 1, background: (theme) => theme.palette.background.paper }}>
        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
          {room.name} <Typography component="span" variant="body2" color="text.secondary">({room.members ? room.members.length : 0} member{room.members && room.members.length !== 1 ? 's' : ''})</Typography>
        </Typography>
        {room.owner === user.id && (
          <Button variant="outlined" color="error" onClick={onRoomDeleted} sx={{ ml: 1 }}>
            Delete Room
          </Button>
        )}
        <Button variant="outlined" color="warning" onClick={onRoomLeft} sx={{ ml: 1 }}>
          Leave Room
        </Button>
      </Paper>
      {/* Chat messages */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2, px: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {loading ? (
          <Typography align="center" sx={{ mt: 4 }}>Loading...</Typography>
        ) : (
          messages.map((msg, idx) => renderMessage(msg, idx))
        )}
        <div ref={messagesEndRef} />
      </Box>
      {/* Fixed message input */}
      <Paper sx={{ p: 2, borderRadius: 0, position: 'sticky', bottom: 0, left: 0, right: 0, zIndex: 2, background: (theme) => theme.palette.background.paper, boxShadow: '0 -2px 8px rgba(0,0,0,0.04)' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton component="label">
            <AttachFileIcon />
            <input type="file" hidden onChange={handleFileUpload} />
          </IconButton>
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
            size="small"
            sx={{ borderRadius: 4, background: 'white' }}
          />
          <IconButton color="primary" onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <SendIcon />
          </IconButton>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ChatArea; 