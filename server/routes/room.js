const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.post('/create', roomController.createRoom);
router.post('/join', roomController.joinRoom);
router.get('/user/:userId', roomController.getUserRooms);
router.delete('/:roomId', roomController.deleteRoom);
router.post('/leave', roomController.leaveRoom);
router.get('/public', roomController.getPublicRooms);

module.exports = router; 