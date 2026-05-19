import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LayoutDashboard, BookOpen, FileText, BarChart3, StickyNote, MessageSquare, UserCircle } from 'lucide-react';
import TeacherHome from './TeacherHome';
import TeacherClasses from './TeacherClasses';
import TeacherAssignments from './TeacherAssignments';
import TeacherResults from './TeacherResults';
import TeacherNotes from './TeacherNotes';
import TeacherChat from './TeacherChat';
import Profile from '../Profile';

const navItems = [
  { path: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/teacher/classes', label: 'My Classes', icon: BookOpen },
  { path: '/teacher/assignments', label: 'Assignments', icon: FileText },
  { path: '/teacher/results', label: 'Results', icon: BarChart3 },
  { path: '/teacher/notes', label: 'Notes', icon: StickyNote },
  { path: '/teacher/chat', label: 'Chat', icon: MessageSquare },
  { path: '/teacher/profile', label: 'Profile', icon: UserCircle },
];

export default function TeacherDashboard() {
  return (
    <Layout navItems={navItems} role="teacher">
      <Routes>
        <Route index element={<TeacherHome />} />
        <Route path="classes" element={<TeacherClasses />} />
        <Route path="assignments" element={<TeacherAssignments />} />
        <Route path="results" element={<TeacherResults />} />
        <Route path="notes" element={<TeacherNotes />} />
        <Route path="chat" element={<TeacherChat />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/teacher" />} />
      </Routes>
    </Layout>
  );
}
