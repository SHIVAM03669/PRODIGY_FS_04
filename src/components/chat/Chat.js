import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import ChatArea from './ChatArea';
import { io } from 'socket.io-client';
import axios from 'axios';

const drawerWidth = 300;

const Chat = () => {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [socket, setSocket] = useState(null);
  const [openCreateRoom, setOpenCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Load user's rooms
    loadRooms();

    return () => {
      newSocket.close();
    };
  }, []);

  const loadRooms = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/rooms/user/${user.id}`);
      setRooms(response.data);
      if (response.data.length > 0 && !selectedRoom) {
        setSelectedRoom(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      const response = await axios.post('http://localhost:5000/api/rooms/create', {
        name: newRoomName,
        isPrivate: false,
        userId: user.id
      });
      
      setRooms([...rooms, response.data]);
      setSelectedRoom(response.data);
      setOpenCreateRoom(false);
      setNewRoomName('');
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create room');
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      await axios.post('http://localhost:5000/api/rooms/join', {
        roomId,
        userId: user.id
      });
      
      // Reload rooms to get updated list
      loadRooms();
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    if (socket) {
      socket.emit('joinRoom', { roomId: room._id, userId: user.id });
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Real-Time Chat
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.username}!
          </Typography>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px'
          },
        }}
      >
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth
            onClick={() => setOpenCreateRoom(true)}
            sx={{ mb: 2 }}
          >
            Create Room
          </Button>
          
          <Typography variant="h6" gutterBottom>
            Chat Rooms
          </Typography>
          
          <List>
            {rooms.map((room) => (
              <ListItem key={room._id} disablePadding>
                <ListItemButton
                  selected={selectedRoom?._id === room._id}
                  onClick={() => handleRoomSelect(room)}
                >
                  <ListItemText 
                    primary={room.name}
                    secondary={room.isPrivate ? 'Private' : 'Public'}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Chat Area */}
      <Box component="main" sx={{ flexGrow: 1, marginTop: '64px' }}>
        {selectedRoom ? (
          <ChatArea 
            room={selectedRoom} 
            user={user} 
            socket={socket}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h5" color="textSecondary">
              Select a room to start chatting
            </Typography>
          </Box>
        )}
      </Box>

      {/* Create Room Dialog */}
      <Dialog open={openCreateRoom} onClose={() => setOpenCreateRoom(false)}>
        <DialogTitle>Create New Room</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Room Name"
            fullWidth
            variant="outlined"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateRoom(false)}>Cancel</Button>
          <Button onClick={handleCreateRoom} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chat; 