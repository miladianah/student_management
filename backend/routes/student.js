const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getMyClasses, enrollClass, getMyAssignments, submitAssignment, getMyResults, getMyNotes, getDashboardStats } = require('../controllers/studentController');
const db = require('../config/db');

// Accessible by any logged-in user (student needs to see all classes to enroll)
router.get('/all-classes', verifyToken, async (req, res) => {
  try {
    const [classes] = await db.query(`
      SELECT c.*, u.full_name as teacher_name,
      (SELECT COUNT(*) FROM class_enrollments WHERE class_id = c.id) as student_count
      FROM classes c JOIN users u ON c.teacher_id = u.id ORDER BY c.created_at DESC
    `);
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Student-only routes
router.use(verifyToken, requireRole('student'));
router.get('/stats', getDashboardStats);
router.get('/classes', getMyClasses);
router.post('/enroll', enrollClass);
router.get('/assignments', getMyAssignments);
router.post('/submit', upload.single('file'), submitAssignment);
router.get('/results', getMyResults);
router.get('/notes', getMyNotes);

module.exports = router;
