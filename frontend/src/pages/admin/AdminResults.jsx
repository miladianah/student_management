import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminResults() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.get('/admin/results').then(r => setResults(r.data)).catch(() => {});
  }, []);

  const gradeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-blue-100 text-blue-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Results</h2>
        <p className="text-gray-500 mt-1">Student results across all classes</p>
      </div>
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>{['Student', 'Class', 'Subject', 'Score', 'Grade', 'Teacher', 'Term'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.student_name}</td>
                  <td className="px-6 py-4 text-gray-600">{r.class_name}</td>
                  <td className="px-6 py-4 text-gray-600">{r.subject}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${gradeColor(r.score)}`}>{r.score}%</span></td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{r.grade}</td>
                  <td className="px-6 py-4 text-gray-600">{r.teacher_name}</td>
                  <td className="px-6 py-4 text-gray-600">{r.term}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!results.length && <p className="text-center text-gray-400 py-12">No results found.</p>}
        </div>
      </div>
    </div>
  );
}
