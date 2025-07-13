import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  AccountCircle,
  KeyboardArrowDown,
  Person,
  Delete,
  Logout
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await axios.delete('http://localhost:5000/api/auth/delete', {
        data: { userId: user.id }
      });
      logout();
      window.location.href = '/login';
    } catch (error) {
      alert('Failed to delete account.');
    }
    handleClose();
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#1976d2',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left side - empty for balance */}
        <Box sx={{ width: 120 }} />
        
        {/* Center - App name */}
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            textAlign: 'center',
            fontWeight: 700,
            letterSpacing: '0.5px',
            color: 'white'
          }}
        >
          Whisper
        </Typography>
        
        {/* Right side - Profile section */}
        <Box sx={{ display: 'flex', alignItems: 'center', width: 120, justifyContent: 'flex-end' }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              borderRadius: 2,
              px: 1,
              py: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
            onClick={handleProfileClick}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <KeyboardArrowDown 
              sx={{ 
                ml: 0.5, 
                color: 'white',
                transition: 'transform 0.2s',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </Box>
        </Box>
      </Toolbar>

      {/* Profile Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: 2
          }
        }}
      >
        {/* Account Info Section */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {user?.username || 'User'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {user?.email || 'user@example.com'}
          </Typography>
        </Box>

        {/* Menu Items */}
        <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Account Info</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>

        <MenuItem 
          onClick={handleDeleteAccount} 
          sx={{ 
            py: 1.5,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.contrastText'
            }
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText>Delete Account</ListItemText>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Navbar; 