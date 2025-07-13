const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/send', messageController.sendMessage);
router.get('/room/:roomId', messageController.getRoomMessages);
router.post('/upload', messageController.uploadMiddleware, messageController.uploadFile);

module.exports = router; 