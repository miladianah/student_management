import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BookOpen, FileText, Send, BarChart3 } from 'lucide-react';

export default function StudentHome() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/student/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const cards = [
    { label: 'Enrolled Classes', value: stats.total_classes || 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Assignments', value: stats.total_assignments || 0, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Submitted', value: stats.submitted || 0, icon: Send, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Results', value: stats.total_results || 0, icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Student Dashboard</h2>
        <p className="text-gray-500 mt-1">Track your progress and assignments</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${color}`} />
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
