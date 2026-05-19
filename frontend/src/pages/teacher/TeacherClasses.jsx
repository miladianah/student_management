import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Users, X } from 'lucide-react';

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ class_name: '', description: '' });
  const [studentsModal, setStudentsModal] = useState(null);
  const [students, setStudents] = useState([]);

  const load = () => api.get('/teacher/classes').then(r => setClasses(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teacher/classes', form);
      toast.success('Class created!');
      setModal(false); setForm({ class_name: '', description: '' }); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error.');
    }
  };

  const viewStudents = async (cls) => {
    const r = await api.get(`/teacher/classes/${cls.id}/students`);
    setStudents(r.data); setStudentsModal(cls);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Classes</h2>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Class</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(c => (
          <div key={c.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-lg">{c.class_name}</h3>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">{c.student_count} students</span>
            </div>
            <p className="text-gray-500 text-sm mb-4">{c.description || 'No description'}</p>
            <button onClick={() => viewStudents(c)} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
              <Users size={16} /> View Students
            </button>
          </div>
        ))}
        {!classes.length && <p className="text-gray-400 col-span-3 text-center py-12">No classes yet. Create your first class!</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Create New Class</h3>
              <button onClick={() => setModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input className="input-field" placeholder="Class Name" value={form.class_name} onChange={e => setForm({ ...form, class_name: e.target.value })} required />
              <textarea className="input-field resize-none" rows={3} placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {studentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Students - {studentsModal.class_name}</h3>
              <button onClick={() => setStudentsModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-3">
              {students.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">{s.full_name.charAt(0)}</div>
                  <div>
                    <p className="font-medium text-gray-900">{s.full_name}</p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </div>
                </div>
              ))}
              {!students.length && <p className="text-center text-gray-400 py-4">No students enrolled.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
