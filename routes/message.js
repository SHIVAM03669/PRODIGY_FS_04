const express = require('express');
const router = express.Router();
const messageController = require('./controllers/messageController');

router.post('/send', messageController.sendMessage);
router.get('/room/:roomId', messageController.getRoomMessages);

module.exports = router; 