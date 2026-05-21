const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret');
    req.user = decoded; // { id, role, ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

const teacherOnly = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied.' });
  }
  next();
};

const studentOnly = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied.' });
  }
  next();
};

module.exports = { authenticate, teacherOnly, studentOnly };