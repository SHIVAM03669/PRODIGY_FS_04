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
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import axios from 'axios';

const ChatArea = ({ room, user, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    
    if (socket) {
      socket.on('newMessage', (message) => {
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
        type: 'text'
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
        fileUrl: `http://localhost:5000${response.data.fileUrl}`
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

  const renderMessage = (message) => {
    const isOwnMessage = message.sender === user.id;
    
    return (
      <Box
        key={message._id}
        sx={{
          display: 'flex',
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
          mb: 2,
          px: 2
        }}
      >
        <Box
          sx={{
            maxWidth: '70%',
            backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
            color: isOwnMessage ? 'white' : 'text.primary',
            borderRadius: 2,
            p: 2,
            position: 'relative'
          }}
        >
          {!isOwnMessage && (
            <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
              {message.sender?.username || 'Unknown User'}
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

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Room Header */}
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <Typography variant="h6">
          {room.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {room.isPrivate ? 'Private Room' : 'Public Room'}
        </Typography>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          backgroundColor: 'grey.50',
          py: 2
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Loading messages...</Typography>
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography color="textSecondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          messages.map(renderMessage)
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <input
            accept="image/*,.pdf,.doc,.docx,.txt"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload">
            <IconButton component="span" color="primary">
              <AttachFileIcon />
            </IconButton>
          </label>
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            size="small"
          />
          
          <IconButton 
            color="primary" 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatArea; 