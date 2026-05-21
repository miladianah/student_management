const db = require('../config/db');

// ==================== CLASSES ====================

const getClasses = async (req, res) => {
  try {
    const [classes] = await db.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM class_enrollments WHERE class_id = c.id) as student_count
      FROM classes c
      WHERE c.teacher_id = ?
      ORDER BY c.created_at DESC
    `, [req.user.id]);
    res.json(classes);
  } catch (err) {
    console.error('getClasses error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const createClass = async (req, res) => {
  try {
    const { class_name, level, description } = req.body;
    if (!class_name || !level) {
      return res.status(400).json({ message: 'Class name and level are required.' });
    }
    await db.query(
      'INSERT INTO classes (class_name, level, description, teacher_id) VALUES (?, ?, ?, ?)',
      [class_name, level, description || null, req.user.id]
    );
    res.status(201).json({ message: 'Class created successfully.' });
  } catch (err) {
    console.error('createClass error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_name, level, description } = req.body;
    if (!class_name || !level) {
      return res.status(400).json({ message: 'Class name and level are required.' });
    }
    const [existing] = await db.query(
      'SELECT id FROM classes WHERE id = ? AND teacher_id = ?',
      [id, req.user.id]
    );
    if (!existing.length) {
      return res.status(404).json({ message: 'Class not found.' });
    }
    await db.query(
      'UPDATE classes SET class_name = ?, level = ?, description = ? WHERE id = ? AND teacher_id = ?',
      [class_name, level, description || null, id, req.user.id]
    );
    res.json({ message: 'Class updated successfully.' });
  } catch (err) {
    console.error('updateClass error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query(
      'SELECT id FROM classes WHERE id = ? AND teacher_id = ?',
      [id, req.user.id]
    );
    if (!existing.length) {
      return res.status(404).json({ message: 'Class not found.' });
    }

    // Delete in correct order to respect foreign keys
    // 1. Delete submissions linked to assignments in this class
    await db.query(`
      DELETE s FROM submissions s
      INNER JOIN assignments a ON s.assignment_id = a.id
      WHERE a.class_id = ?
    `, [id]);

    // 2. Delete assignments in this class
    await db.query('DELETE FROM assignments WHERE class_id = ?', [id]);

    // 3. Delete notes in this class
    await db.query('DELETE FROM notes WHERE class_id = ?', [id]);

    // 4. Delete results in this class
    await db.query('DELETE FROM results WHERE class_id = ?', [id]);

    // 5. Delete enrollments
    await db.query('DELETE FROM class_enrollments WHERE class_id = ?', [id]);

    // 6. Finally delete the class
    await db.query('DELETE FROM classes WHERE id = ? AND teacher_id = ?', [id, req.user.id]);

    res.json({ message: 'Class deleted successfully.' });
  } catch (err) {
    console.error('deleteClass error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const [students] = await db.query(`
      SELECT u.id, u.full_name, u.email, ce.enrolled_at
      FROM class_enrollments ce
      JOIN users u ON ce.student_id = u.id
      WHERE ce.class_id = ?
      ORDER BY u.full_name
    `, [id]);
    res.json(students);
  } catch (err) {
    console.error('getStudents error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ==================== ASSIGNMENTS ====================

const getAssignments = async (req, res) => {
  try {
    const [assignments] = await db.query(`
      SELECT a.*, c.class_name, c.level,
        (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.id) as submission_count
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      WHERE a.teacher_id = ?
      ORDER BY a.due_date DESC
    `, [req.user.id]);
    res.json(assignments);
  } catch (err) {
    console.error('getAssignments error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { class_id, title, description, due_date } = req.body;
    const file = req.file ? req.file.filename : null;
    if (!class_id || !title || !due_date) {
      return res.status(400).json({ message: 'Class, title, and due date are required.' });
    }
    await db.query(
      'INSERT INTO assignments (class_id, teacher_id, title, description, due_date, file_attachment) VALUES (?, ?, ?, ?, ?, ?)',
      [class_id, req.user.id, title, description || null, due_date, file]
    );
    res.status(201).json({ message: 'Assignment created successfully.' });
  } catch (err) {
    console.error('createAssignment error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ==================== NOTES ====================

const getNotes = async (req, res) => {
  try {
    const [notes] = await db.query(`
      SELECT n.*, c.class_name, c.level
      FROM notes n
      JOIN classes c ON n.class_id = c.id
      WHERE n.teacher_id = ?
      ORDER BY n.created_at DESC
    `, [req.user.id]);
    res.json(notes);
  } catch (err) {
    console.error('getNotes error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const createNote = async (req, res) => {
  try {
    const { class_id, title, content } = req.body;
    const file = req.file ? req.file.filename : null;
    if (!class_id || !title || !content) {
      return res.status(400).json({ message: 'Class, title, and content are required.' });
    }
    await db.query(
      'INSERT INTO notes (class_id, teacher_id, title, content, file_attachment) VALUES (?, ?, ?, ?, ?)',
      [class_id, req.user.id, title, content, file]
    );
    res.status(201).json({ message: 'Note created successfully.' });
  } catch (err) {
    console.error('createNote error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ==================== RESULTS ====================

const getResults = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT r.*, c.class_name, c.level, u.full_name as student_name
      FROM results r
      JOIN classes c ON r.class_id = c.id
      JOIN users u ON r.student_id = u.id
      WHERE r.teacher_id = ?
      ORDER BY r.created_at DESC
    `, [req.user.id]);
    res.json(results);
  } catch (err) {
    console.error('getResults error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const createResult = async (req, res) => {
  try {
    const { class_id, student_id, score, grade, remarks } = req.body;
    if (!class_id || !student_id || score === undefined || !grade) {
      return res.status(400).json({ message: 'Class, student, score, and grade are required.' });
    }
    await db.query(
      'INSERT INTO results (class_id, student_id, teacher_id, score, grade, remarks) VALUES (?, ?, ?, ?, ?, ?)',
      [class_id, student_id, req.user.id, score, grade, remarks || null]
    );
    res.status(201).json({ message: 'Result created successfully.' });
  } catch (err) {
    console.error('createResult error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ==================== DASHBOARD ====================

const getDashboardStats = async (req, res) => {
  try {
    const [[{ total_classes }]] = await db.query(
      'SELECT COUNT(*) as total_classes FROM classes WHERE teacher_id = ?',
      [req.user.id]
    );
    const [[{ total_students }]] = await db.query(`
      SELECT COUNT(DISTINCT ce.student_id) as total_students
      FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      WHERE c.teacher_id = ?
    `, [req.user.id]);
    const [[{ total_assignments }]] = await db.query(
      'SELECT COUNT(*) as total_assignments FROM assignments WHERE teacher_id = ?',
      [req.user.id]
    );
    const [[{ pending_submissions }]] = await db.query(`
      SELECT COUNT(*) as pending_submissions FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE a.teacher_id = ? AND s.status IN ('submitted', 'late')
    `, [req.user.id]);
    res.json({ total_classes, total_students, total_assignments, pending_submissions });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
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
};