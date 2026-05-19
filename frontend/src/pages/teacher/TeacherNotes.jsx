import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, FileText } from 'lucide-react';

export default function TeacherNotes() {
  const [notes, setNotes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', class_id: '' });
  const [file, setFile] = useState(null);

  const load = () => api.get('/teacher/notes').then(r => setNotes(r.data));
  useEffect(() => {
    load();
    api.get('/teacher/classes').then(r => setClasses(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    try {
      await api.post('/teacher/notes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Note created!');
      setModal(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Notes & Resources</h2>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Note</button>
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
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{n.class_name}</span>
              </div>
            </div>
            {n.content && <p className="text-gray-500 text-sm mb-3 line-clamp-3">{n.content}</p>}
            {n.file_attachment && (
              <a href={`http://localhost:5000/uploads/${n.file_attachment}`} target="_blank" className="text-indigo-600 text-sm hover:underline">Download Attachment</a>
            )}
            <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {!notes.length && <p className="text-gray-400 col-span-3 text-center py-12">No notes yet.</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Create Note</h3>
              <button onClick={() => setModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input className="input-field" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <select className="input-field" value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })} required>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
              </select>
              <textarea className="input-field resize-none" rows={4} placeholder="Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Attachment (optional)</label>
                <input type="file" className="input-field" onChange={e => setFile(e.target.files[0])} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
