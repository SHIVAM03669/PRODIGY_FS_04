const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

router.post('/file', uploadController.uploadFile, uploadController.handleFileUpload);

module.exports = router; 