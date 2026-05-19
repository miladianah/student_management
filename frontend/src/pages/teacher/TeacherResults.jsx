import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, Trash2 } from 'lucide-react';

export default function TeacherResults() {
  const [results, setResults] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ student_id: '', class_id: '', subject: '', score: '', grade: '', term: '', academic_year: '', remarks: '' });

  const load = () => api.get('/teacher/results').then(r => setResults(r.data)).catch(() => {});

  useEffect(() => {
    load();
    api.get('/teacher/classes').then(r => setClasses(r.data));
  }, []);

  const loadStudents = async (classId) => {
    if (!classId) return setStudents([]);
    const r = await api.get(`/teacher/classes/${classId}/students`);
    setStudents(r.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teacher/results', form);
      toast.success('Result added!');
      setModal(false);
      setForm({ student_id: '', class_id: '', subject: '', score: '', grade: '', term: '', academic_year: '', remarks: '' });
      setStudents([]);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error.');
    }
  };

  const gradeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-blue-100 text-blue-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Results</h2>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Result</button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>{['Student', 'Class', 'Subject', 'Score', 'Grade', 'Term', 'Year', 'Remarks'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.student_name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.class_name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.subject}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${gradeColor(r.score)}`}>{r.score}%</span></td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{r.grade || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.term || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.academic_year || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm italic">{r.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!results.length && <p className="text-center text-gray-400 py-12">Nta results zirabaho. Kanda "Add Result" kugirango wongerere.</p>}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Add Student Result</h3>
              <button onClick={() => setModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <select className="input-field" value={form.class_id} onChange={e => { setForm({ ...form, class_id: e.target.value, student_id: '' }); loadStudents(e.target.value); }} required>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
              </select>
              <select className="input-field" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} required>
                <option value="">Select Student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
              <input className="input-field" placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="input-field" placeholder="Score (%)" value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} required min={0} max={100} />
                <input className="input-field" placeholder="Grade (A, B, C...)" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="input-field" placeholder="Term (e.g. Term 1)" value={form.term} onChange={e => setForm({ ...form, term: e.target.value })} />
                <input className="input-field" placeholder="Academic Year" value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })} />
              </div>
              <textarea className="input-field resize-none" rows={2} placeholder="Remarks (optional)" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Add Result</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
