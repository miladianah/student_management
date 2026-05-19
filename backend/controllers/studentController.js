const db = require('../config/db');

const getMyClasses = async (req, res) => {
  try {
    const [classes] = await db.query(`
      SELECT c.*, u.full_name as teacher_name
      FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE ce.student_id = ?
    `, [req.user.id]);
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const enrollClass = async (req, res) => {
  try {
    const { class_id } = req.body;
    const [existing] = await db.query('SELECT id FROM class_enrollments WHERE class_id=? AND student_id=?', [class_id, req.user.id]);
    if (existing.length) return res.status(409).json({ message: 'Already enrolled.' });
    await db.query('INSERT INTO class_enrollments (class_id, student_id) VALUES (?, ?)', [class_id, req.user.id]);
    res.status(201).json({ message: 'Enrolled successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getMyAssignments = async (req, res) => {
  try {
    const [assignments] = await db.query(`
      SELECT a.*, c.class_name, u.full_name as teacher_name,
      s.id as submission_id, s.status as submission_status, s.score, s.feedback, s.submitted_at, s.file_attachment as submission_file
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      JOIN users u ON a.teacher_id = u.id
      JOIN class_enrollments ce ON ce.class_id = a.class_id AND ce.student_id = ?
      LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?
      ORDER BY a.due_date ASC
    `, [req.user.id, req.user.id]);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const { assignment_id, submission_text } = req.body;
    const file = req.file ? req.file.filename : null;

    const [existing] = await db.query('SELECT id FROM submissions WHERE assignment_id=? AND student_id=?', [assignment_id, req.user.id]);
    if (existing.length) return res.status(409).json({ message: 'Already submitted.' });

    const [assignment] = await db.query('SELECT due_date FROM assignments WHERE id=?', [assignment_id]);
    const status = new Date() > new Date(assignment[0].due_date) ? 'late' : 'submitted';

    await db.query(
      'INSERT INTO submissions (assignment_id, student_id, submission_text, file_attachment, status) VALUES (?, ?, ?, ?, ?)',
      [assignment_id, req.user.id, submission_text, file, status]
    );
    res.status(201).json({ message: 'Assignment submitted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getMyResults = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT r.*, c.class_name, u.full_name as teacher_name
      FROM results r
      JOIN classes c ON r.class_id = c.id
      JOIN users u ON r.teacher_id = u.id
      WHERE r.student_id = ? ORDER BY r.created_at DESC
    `, [req.user.id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getMyNotes = async (req, res) => {
  try {
    const [notes] = await db.query(`
      SELECT n.*, c.class_name, u.full_name as teacher_name
      FROM notes n
      JOIN classes c ON n.class_id = c.id
      JOIN users u ON n.teacher_id = u.id
      JOIN class_enrollments ce ON ce.class_id = n.class_id AND ce.student_id = ?
      ORDER BY n.created_at DESC
    `, [req.user.id]);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [[{ total_classes }]] = await db.query('SELECT COUNT(*) as total_classes FROM class_enrollments WHERE student_id = ?', [req.user.id]);
    const [[{ total_assignments }]] = await db.query(`
      SELECT COUNT(*) as total_assignments FROM assignments a
      JOIN class_enrollments ce ON ce.class_id = a.class_id WHERE ce.student_id = ?
    `, [req.user.id]);
    const [[{ submitted }]] = await db.query('SELECT COUNT(*) as submitted FROM submissions WHERE student_id = ?', [req.user.id]);
    const [[{ total_results }]] = await db.query('SELECT COUNT(*) as total_results FROM results WHERE student_id = ?', [req.user.id]);
    res.json({ total_classes, total_assignments, submitted, total_results });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getMyClasses, enrollClass, getMyAssignments, submitAssignment, getMyResults, getMyNotes, getDashboardStats };
