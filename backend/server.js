const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. CONFIGURATION YA CORS (Ize hejuru y'ibindi byose)
app.use(cors({
  origin: 'https://imaginative-naiad-f52119.netlify.app', // Urubuga rwawe rwa Netlify gusa cyangwa ukahagumisha '*'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. GUFATA PREFLIGHT (OPTIONS) REQUESTS BURUNDU
// Ibi bihita bisubiza Browser mu masegonda 0 iyo ije kubaza niba amarembo afunguye
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ama-Routes aze munsi ya CORS n'ibindi byose
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/profile', require('./routes/profile'));

app.get('/', (req, res) => res.json({ message: 'Tr Dave System API Running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));