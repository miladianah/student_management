const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getDashboardStats, getAllUsers, createUser, updateUser, deleteUser, getAllClasses, getAllResults } = require('../controllers/adminController');

router.use(verifyToken, requireRole('admin'));
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/classes', getAllClasses);
router.get('/results', getAllResults);

module.exports = router;
