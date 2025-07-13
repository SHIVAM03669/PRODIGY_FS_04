import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Alert,
  IconButton,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import ChatArea from './ChatArea';
import Navbar from '../Navbar';
import { io } from 'socket.io-client';
import axios from 'axios';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const drawerWidth = 300;

const Chat = () => {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [socket, setSocket] = useState(null);
  const [openCreateRoom, setOpenCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [error, setError] = useState('');
  const [openDiscover, setOpenDiscover] = useState(false);
  const [publicRooms, setPublicRooms] = useState([]);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket.IO connected:', newSocket.id);
      if (user?.id) {
        newSocket.emit('userOnline', user.id);
      }
    });
    newSocket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
    });
    newSocket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    // Load user's rooms
    loadRooms();

    return () => {
      newSocket.close();
    };
  }, [user?.id]);

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

  const loadPublicRooms = async () => {
    setLoadingPublic(true);
    try {
      const response = await axios.get('http://localhost:5000/api/rooms/public');
      // Exclude rooms the user is already a member of
      const notJoined = response.data.filter(r => !rooms.some(myRoom => myRoom._id === r._id));
      setPublicRooms(notJoined);
    } catch (error) {
      setPublicRooms([]);
    } finally {
      setLoadingPublic(false);
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
      // Emit joinRoom for the creator
      if (socket) {
        socket.emit('joinRoom', { roomId: response.data._id, userId: user.id });
      }
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
      await loadRooms();
      // Find the joined room and select it
      const joinedRoom = rooms.find(r => r._id === roomId) || (await axios.get(`http://localhost:5000/api/rooms/user/${user.id}`)).data.find(r => r._id === roomId);
      if (joinedRoom) {
        setSelectedRoom(joinedRoom);
        if (socket) {
          socket.emit('joinRoom', { roomId, userId: user.id });
        }
      }
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

  // Handler for when a room is deleted
  const handleRoomDeleted = (roomId) => {
    setRooms(prev => prev.filter(r => r._id !== roomId));
    setSelectedRoom(null);
  };

  // Handler for when a user leaves a room
  const handleRoomLeft = (roomId) => {
    setRooms(prev => prev.filter(r => r._id !== roomId));
    setSelectedRoom(null);
  };

  const handleOpenDiscover = () => {
    setOpenDiscover(true);
    loadPublicRooms();
  };
  const handleCloseDiscover = () => setOpenDiscover(false);

  // Helper to get last message preview
  const getLastMessage = (room) => {
    if (!room.messages || room.messages.length === 0) return '';
    const last = room.messages[room.messages.length - 1];
    return last.type === 'text' ? last.content : (last.type === 'image' ? '📷 Image' : '📎 File');
  };

  // Helper to get unread count (placeholder, implement logic as needed)
  const getUnreadCount = (room) => 0;

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Navbar */}
      <Navbar />

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px',
            background: (theme) => theme.palette.background.default,
            borderRight: '1px solid #e0e0e0',
          },
        }}
      >
        <Box sx={{ overflow: 'auto', p: 2, position: 'relative', height: '100%' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth
            onClick={() => setOpenCreateRoom(true)}
            sx={{ mb: 2, display: { xs: 'none', md: 'flex' } }}
          >
            Create Room
          </Button>
          <IconButton
            color="primary"
            sx={{ position: 'absolute', bottom: 24, right: 24, zIndex: 2, display: { xs: 'flex', md: 'none' } }}
            onClick={() => setOpenCreateRoom(true)}
          >
            <AddCircleIcon sx={{ fontSize: 48 }} />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            fullWidth
            onClick={handleOpenDiscover}
            sx={{ mb: 2 }}
          >
            Discover Public Rooms
          </Button>
          <Typography variant="h6" gutterBottom>
            Chats
          </Typography>
          <List sx={{ p: 0 }}>
            {rooms.map((room) => (
              <ListItem key={room._id} disablePadding sx={{ mb: 1, borderRadius: 2, background: selectedRoom?._id === room._id ? 'rgba(25, 118, 210, 0.08)' : 'transparent', transition: 'background 0.2s' }}>
                <ListItemButton
                  selected={selectedRoom?._id === room._id}
                  onClick={() => handleRoomSelect(room)}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  <Badge
                    color="success"
                    variant={room.members && room.members.some(m => onlineUsers.includes(typeof m === 'object' ? m._id : m) && (typeof m === 'object' ? m._id : m) !== user.id) ? 'dot' : undefined}
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <Avatar sx={{ mr: 2 }} src={room.avatar || undefined}>
                      {room.name[0]}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }} noWrap>{room.name}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {getLastMessage(room)}
                    </Typography>
                  </Box>
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
            onRoomDeleted={handleRoomDeleted}
            onRoomLeft={handleRoomLeft}
            onlineUsers={onlineUsers}
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

      {/* Discover Public Rooms Dialog */}
      <Dialog open={openDiscover} onClose={handleCloseDiscover} fullWidth maxWidth="sm">
        <DialogTitle>Discover Public Rooms</DialogTitle>
        <DialogContent>
          {loadingPublic ? (
            <Typography>Loading...</Typography>
          ) : publicRooms.length === 0 ? (
            <Typography>No public rooms available.</Typography>
          ) : (
            <List>
              {publicRooms.map(room => (
                <ListItem key={room._id} secondaryAction={
                  <Button
                    variant="contained"
                    onClick={async () => {
                      await handleJoinRoom(room._id);
                      handleCloseDiscover();
                    }}
                  >
                    Join
                  </Button>
                }>
                  <ListItemText primary={room.name} secondary={room.isPrivate ? 'Private' : 'Public'} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDiscover}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chat; 