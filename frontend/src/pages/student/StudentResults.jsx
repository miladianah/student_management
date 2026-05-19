import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function StudentResults() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.get('/student/results').then(r => setResults(r.data)).catch(() => {});
  }, []);

  const gradeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-blue-100 text-blue-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const avg = results.length ? (results.reduce((s, r) => s + parseFloat(r.score), 0) / results.length).toFixed(1) : 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Results</h2>
        <p className="text-gray-500 mt-1">Your academic performance</p>
      </div>

      {results.length > 0 && (
        <div className="card mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <p className="text-indigo-100 text-sm font-medium">Overall Average</p>
          <p className="text-4xl font-bold mt-1">{avg}%</p>
          <p className="text-indigo-200 text-sm mt-1">{results.length} subjects recorded</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map(r => (
          <div key={r.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{r.subject}</h3>
                <p className="text-sm text-gray-500">{r.class_name}</p>
              </div>
              <span className={`text-lg font-bold px-3 py-1 rounded-xl ${gradeColor(r.score)}`}>{r.score}%</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {r.grade && <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">Grade: {r.grade}</span>}
              {r.term && <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">{r.term}</span>}
              {r.academic_year && <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">{r.academic_year}</span>}
            </div>
            {r.remarks && <p className="text-sm text-gray-500 mt-2 italic">"{r.remarks}"</p>}
            <p className="text-xs text-gray-400 mt-2">By: {r.teacher_name}</p>
          </div>
        ))}
        {!results.length && <p className="text-gray-400 col-span-2 text-center py-12">No results yet.</p>}
      </div>
    </div>
  );
}
