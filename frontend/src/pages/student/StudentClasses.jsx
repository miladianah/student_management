import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, BookOpen } from 'lucide-react';

export default function StudentClasses() {
  const [classes, setClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [modal, setModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [enrolledIds, setEnrolledIds] = useState([]);

  const load = async () => {
    const r = await api.get('/student/classes');
    setClasses(r.data);
    setEnrolledIds(r.data.map(c => c.id));
  };

  const loadAll = async () => {
    const r = await api.get('/student/all-classes');
    setAllClasses(r.data);
  };

  useEffect(() => { load(); }, []);

  const openModal = () => { loadAll(); setModal(true); };

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      await api.post('/student/enroll', { class_id: selectedClass });
      toast.success('Enrolled successfully!');
      setModal(false);
      setSelectedClass('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Classes</h2>
        <button onClick={openModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Enroll in Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(c => (
          <div key={c.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{c.class_name}</h3>
                <p className="text-sm text-gray-500">Teacher: {c.teacher_name}</p>
              </div>
            </div>
            {c.description && <p className="text-gray-500 text-sm">{c.description}</p>}
          </div>
        ))}
        {!classes.length && (
          <div className="col-span-3 text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Not enrolled in any class yet.</p>
            <p className="text-gray-400 text-sm mt-1">Click "Enroll in Class" to get started.</p>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Enroll in a Class</h3>
              <button onClick={() => setModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleEnroll} className="p-6 space-y-4">
              <select className="input-field" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} required>
                <option value="">Select a Class</option>
                {allClasses
                  .filter(c => !enrolledIds.includes(c.id))
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.class_name} — {c.teacher_name}
                    </option>
                  ))}
              </select>
              {allClasses.filter(c => !enrolledIds.includes(c.id)).length === 0 && (
                <p className="text-sm text-gray-500 text-center">You are enrolled in all available classes.</p>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Enroll</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
