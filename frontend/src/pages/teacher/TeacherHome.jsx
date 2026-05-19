import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BookOpen, FileText, Send, CheckCircle } from 'lucide-react';

export default function TeacherHome() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/teacher/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const graded = (stats.total_submissions || 0);

  const cards = [
    { label: 'My Classes', value: stats.total_classes || 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Assignments', value: stats.total_assignments || 0, icon: FileText, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
    { label: 'Total Submissions', value: stats.total_submissions || 0, icon: Send, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { label: 'Graded', value: graded, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your classes and students</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
