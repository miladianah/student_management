const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getConversations, getMessages, sendMessage, getChatUsers, editMessage, deleteMessage } = require('../controllers/chatController');

router.use(verifyToken);
router.get('/users', getChatUsers);
router.get('/conversations', getConversations);
router.get('/:userId', getMessages);
router.post('/send', sendMessage);
router.put('/:id', editMessage);
router.delete('/:id', deleteMessage);

module.exports = router;
