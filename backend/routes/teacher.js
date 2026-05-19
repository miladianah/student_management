const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getMyClasses, createClass, getClassStudents, createAssignment, getMyAssignments, getSubmissions, gradeSubmission, getMyResults, createResult, createNote, getNotes, getDashboardStats } = require('../controllers/teacherController');

router.use(verifyToken, requireRole('teacher'));
router.get('/stats', getDashboardStats);
router.get('/classes', getMyClasses);
router.post('/classes', createClass);
router.get('/classes/:classId/students', getClassStudents);
router.get('/assignments', getMyAssignments);
router.post('/assignments', upload.single('file'), createAssignment);
router.get('/assignments/:assignmentId/submissions', getSubmissions);
router.put('/submissions/:submissionId/grade', gradeSubmission);
router.get('/results', getMyResults);
router.post('/results', createResult);
router.get('/notes', getNotes);
router.post('/notes', upload.single('file'), createNote);

module.exports = router;
