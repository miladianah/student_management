const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, verifyResetCode, resetPassword, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
