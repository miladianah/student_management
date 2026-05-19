# Tr Dave School Management System

## Stack
- **Backend**: Node.js + Express.js + MySQL
- **Frontend**: React.js + Vite + TailwindCSS
- **Auth**: JWT + Email Password Reset

## Setup Instructions

### 1. Database
```sql
-- Open MySQL and run:
source database.sql
```

### 2. Backend Setup
```bash
cd backend
# Edit .env with your MySQL credentials and Gmail app password
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm run dev
```

### 4. Generate Admin Password Hash
```bash
cd backend
node -e "const b=require('bcryptjs');b.hash('Admin@123',10).then(h=>console.log(h))"
```
Copy the output hash and update the INSERT in `database.sql`, then re-run it.

## Default Login
| Role    | Email               | Password  |
|---------|---------------------|-----------|
| Admin   | admin@trdave.com    | Admin@123 |

## .env Configuration (backend/.env)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=trdave_db
JWT_SECRET=trdave_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password   # Gmail > Security > App Passwords
CLIENT_URL=http://localhost:5173
```

## Features
- **Admin**: Manage users, view all classes, results, system stats, chat
- **Teacher**: Create classes, assignments, grade submissions, add results, notes, chat
- **Student**: Enroll in classes, submit assignments, view results, notes, chat
- **Auth**: Register, Login, Forgot Password (6-digit email code), Reset Password

## URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
