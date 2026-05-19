const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. HITAMO KUGIRIRA CORS ITURUTSE KURI EXPRESS DIRECTLY (Siba ya cors package)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://imaginative-naiad-f52119.netlify.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Niba ari OPTIONS request (Preflight), hita uyisubiza ako kanya ntirindire kujya mu ma routes
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ama-routes yawe...
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/profile', require('./routes/profile'));

app.get('/', (req, res) => res.json({ message: 'Tr Dave System API Running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running perfectly on port ${PORT}`);
});