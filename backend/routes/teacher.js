const express = require('express');
const router = express.Router();
const { authenticate, teacherOnly } = require('../middleware/auth');
const {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getStudents,
  getAssignments,
  createAssignment,
  getNotes,
  createNote,
  getResults,
  createResult,
  getDashboardStats,
} = require('../controllers/teacherController');

// All routes require authentication + teacher role
router.use(authenticate, teacherOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Classes
router.get('/classes', getClasses);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);
router.get('/classes/:id/students', getStudents);

// Assignments
router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);

// Notes
router.get('/notes', getNotes);
router.post('/notes', createNote);

// Results
router.get('/results', getResults);
router.post('/results', createResult);

module.exports = router;