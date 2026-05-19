const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getProfile, updateProfile, updateProfilePicture, changePassword } = require('../controllers/profileController');

router.use(verifyToken);
router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/picture', upload.single('profile_picture'), updateProfilePicture);
router.put('/password', changePassword);

module.exports = router;
