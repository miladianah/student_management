import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FileText } from 'lucide-react';

export default function StudentNotes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    api.get('/student/notes').then(r => setNotes(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Notes & Resources</h2>
        <p className="text-gray-500 mt-1">Study materials from your teachers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(n => (
          <div key={n.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{n.title}</h3>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{n.class_name}</span>
                  <span className="text-xs text-gray-500">by {n.teacher_name}</span>
                </div>
              </div>
            </div>
            {n.content && <p className="text-gray-500 text-sm mb-3 line-clamp-3">{n.content}</p>}
            {n.file_attachment && (
              <a href={`http://localhost:5000/uploads/${n.file_attachment}`} target="_blank"
                className="inline-flex items-center gap-1 text-indigo-600 text-sm hover:underline font-medium">
                <FileText size={14} /> Download File
              </a>
            )}
            <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {!notes.length && <p className="text-gray-400 col-span-3 text-center py-12">No notes available yet.</p>}
      </div>
    </div>
  );
}
