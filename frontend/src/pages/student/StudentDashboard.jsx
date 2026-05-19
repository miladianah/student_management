import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LayoutDashboard, BookOpen, FileText, BarChart3, StickyNote, MessageSquare, UserCircle } from 'lucide-react';
import StudentHome from './StudentHome';
import StudentClasses from './StudentClasses';
import StudentAssignments from './StudentAssignments';
import StudentResults from './StudentResults';
import StudentNotes from './StudentNotes';
import StudentChat from './StudentChat';
import Profile from '../Profile';

const navItems = [
  { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/classes', label: 'My Classes', icon: BookOpen },
  { path: '/student/assignments', label: 'Assignments', icon: FileText },
  { path: '/student/results', label: 'My Results', icon: BarChart3 },
  { path: '/student/notes', label: 'Notes', icon: StickyNote },
  { path: '/student/chat', label: 'Chat', icon: MessageSquare },
  { path: '/student/profile', label: 'Profile', icon: UserCircle },
];

export default function StudentDashboard() {
  return (
    <Layout navItems={navItems} role="student">
      <Routes>
        <Route index element={<StudentHome />} />
        <Route path="classes" element={<StudentClasses />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="notes" element={<StudentNotes />} />
        <Route path="chat" element={<StudentChat />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/student" />} />
      </Routes>
    </Layout>
  );
}
