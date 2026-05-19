import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    api.get('/admin/classes').then(r => setClasses(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Classes</h2>
        <p className="text-gray-500 mt-1">Overview of all classes in the system</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(c => (
          <div key={c.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-lg">{c.class_name}</h3>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">{c.student_count} students</span>
            </div>
            <p className="text-gray-500 text-sm mb-3">{c.description || 'No description'}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Teacher:</span> {c.teacher_name}</p>
          </div>
        ))}
        {!classes.length && <p className="text-gray-400 col-span-3 text-center py-12">No classes found.</p>}
      </div>
    </div>
  );
}
