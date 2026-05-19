import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { LogOut, Menu, X, BookOpen, Sun, Moon } from 'lucide-react';

const API = 'http://localhost:5000';

function UserAvatar({ user, size = 9 }) {
  const s = `w-${size} h-${size}`;
  if (user?.profile_picture) {
    return <img src={`${API}/uploads/${user.profile_picture}`} alt={user.full_name} className={`${s} rounded-full object-cover`} />;
  }
  return (
    <div className={`${s} bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm`}>
      {user?.full_name?.charAt(0).toUpperCase()}
    </div>
  );
}

export default function Layout({ children, navItems, role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    student: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-lg">Tr Dave</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleColors[role]}`}>{role}</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  location.pathname === path
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}>
                <Icon size={20} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3 px-2">
              <UserAvatar user={user} size={9} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl font-medium transition-all">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 hidden lg:block">
              {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {dark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>

            <UserAvatar user={user} size={9} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
