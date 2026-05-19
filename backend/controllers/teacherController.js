const db = require('../config/db');

const getMyClasses = async (req, res) => {
  try {
    const [classes] = await db.query(`
      SELECT c.*, (SELECT COUNT(*) FROM class_enrollments WHERE class_id = c.id) as student_count
      FROM classes c WHERE c.teacher_id = ? ORDER BY c.created_at DESC
    `, [req.user.id]);
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const createClass = async (req, res) => {
  try {
    const { class_name, description } = req.body;
    await db.query('INSERT INTO classes (class_name, description, teacher_id) VALUES (?, ?, ?)', [class_name, description, req.user.id]);
    res.status(201).json({ message: 'Class created.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getClassStudents = async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT u.id, u.full_name, u.email, ce.enrolled_at
      FROM class_enrollments ce JOIN users u ON ce.student_id = u.id
      WHERE ce.class_id = ?
    `, [req.params.classId]);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { title, description, class_id, due_date, max_score } = req.body;
    const file = req.file ? req.file.filename : null;
    await db.query(
      'INSERT INTO assignments (title, description, class_id, teacher_id, due_date, max_score, file_attachment) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, class_id, req.user.id, due_date, max_score || 100, file]
    );
    res.status(201).json({ message: 'Assignment created.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getMyAssignments = async (req, res) => {
  try {
    const [assignments] = await db.query(`
      SELECT a.*, c.class_name,
      (SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id) as submission_count
      FROM assignments a JOIN classes c ON a.class_id = c.id
      WHERE a.teacher_id = ? ORDER BY a.created_at DESC
    `, [req.user.id]);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const [submissions] = await db.query(`
      SELECT s.*, u.full_name as student_name, u.email as student_email
      FROM submissions s JOIN users u ON s.student_id = u.id
      WHERE s.assignment_id = ? ORDER BY s.submitted_at DESC
    `, [req.params.assignmentId]);
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    await db.query(
      'UPDATE submissions SET score=?, feedback=?, status=?, graded_at=NOW() WHERE id=?',
      [score, feedback, 'graded', req.params.submissionId]
    );
    res.json({ message: 'Submission graded.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getMyResults = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT r.*, u.full_name as student_name, c.class_name
      FROM results r
      JOIN users u ON r.student_id = u.id
      JOIN classes c ON r.class_id = c.id
      WHERE r.teacher_id = ? ORDER BY r.created_at DESC
    `, [req.user.id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const createResult = async (req, res) => {
  try {
    const { student_id, class_id, subject, score, grade, term, academic_year, remarks } = req.body;
    await db.query(
      'INSERT INTO results (student_id, class_id, teacher_id, subject, score, grade, term, academic_year, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student_id, class_id, req.user.id, subject, score, grade, term, academic_year, remarks]
    );
    res.status(201).json({ message: 'Result added.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content, class_id } = req.body;
    const file = req.file ? req.file.filename : null;
    await db.query(
      'INSERT INTO notes (title, content, class_id, teacher_id, file_attachment) VALUES (?, ?, ?, ?, ?)',
      [title, content, class_id, req.user.id, file]
    );
    res.status(201).json({ message: 'Note created.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getNotes = async (req, res) => {
  try {
    const [notes] = await db.query(`
      SELECT n.*, c.class_name FROM notes n JOIN classes c ON n.class_id = c.id
      WHERE n.teacher_id = ? ORDER BY n.created_at DESC
    `, [req.user.id]);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [[{ total_classes }]] = await db.query('SELECT COUNT(*) as total_classes FROM classes WHERE teacher_id = ?', [req.user.id]);
    const [[{ total_assignments }]] = await db.query('SELECT COUNT(*) as total_assignments FROM assignments WHERE teacher_id = ?', [req.user.id]);
    const [[{ total_submissions }]] = await db.query(`
      SELECT COUNT(*) as total_submissions FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id WHERE a.teacher_id = ?
    `, [req.user.id]);
    const [[{ pending_grading }]] = await db.query(`
      SELECT COUNT(*) as pending_grading FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id WHERE a.teacher_id = ? AND s.status IN ('submitted', 'late')
    `, [req.user.id]);
    res.json({ total_classes, total_assignments, total_submissions, pending_grading });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getMyClasses, createClass, getClassStudents, createAssignment, getMyAssignments, getSubmissions, gradeSubmission, getMyResults, createResult, createNote, getNotes, getDashboardStats };
