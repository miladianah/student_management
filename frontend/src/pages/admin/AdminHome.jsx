import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, BookOpen, FileText, Send, TrendingUp } from 'lucide-react';

export default function AdminHome() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.total_students || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Total Teachers', value: stats.total_teachers || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { label: 'Total Classes', value: stats.total_classes || 0, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
    { label: 'Assignments', value: stats.total_assignments || 0, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
    { label: 'Submissions', value: stats.total_submissions || 0, icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-500 mt-1">System overview and statistics</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
