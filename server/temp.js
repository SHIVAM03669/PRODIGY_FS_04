const fs = require('fs');
const content = 'const express = require(\
express\);' + String.fromCharCode(10) + 'const router = express.Router();' + String.fromCharCode(10) + 'const authController = require(\../controllers/authController\);' + String.fromCharCode(10) + String.fromCharCode(10) + 'router.post(\/register\, authController.register);' + String.fromCharCode(10) + 'router.post(\/login\, authController.login);' + String.fromCharCode(10) + String.fromCharCode(10) + 'module.exports = router;';
