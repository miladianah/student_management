import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LayoutDashboard, Users, BookOpen, BarChart3, MessageSquare, UserCircle } from 'lucide-react';
import AdminHome from './AdminHome';
import AdminUsers from './AdminUsers';
import AdminClasses from './AdminClasses';
import AdminResults from './AdminResults';
import AdminChat from './AdminChat';
import Profile from '../Profile';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/classes', label: 'Classes', icon: BookOpen },
  { path: '/admin/results', label: 'Results', icon: BarChart3 },
  { path: '/admin/chat', label: 'Chat', icon: MessageSquare },
  { path: '/admin/profile', label: 'Profile', icon: UserCircle },
];

export default function AdminDashboard() {
  return (
    <Layout navItems={navItems} role="admin">
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="classes" element={<AdminClasses />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="chat" element={<AdminChat />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    </Layout>
  );
}
