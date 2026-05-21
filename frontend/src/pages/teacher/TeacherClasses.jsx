import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Users, X, Pencil, Trash2, AlertTriangle, GraduationCap } from 'lucide-react';

const LEVELS = ['S4', 'S5', 'S6'];

const LEVEL_COLORS = {
  S4: 'bg-emerald-100 text-emerald-700',
  S5: 'bg-amber-100 text-amber-700',
  S6: 'bg-rose-100 text-rose-700',
};

const emptyForm = { class_name: '', level: '', description: '' };

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [modal, setModal] = useState(false);           // create / edit modal
  const [editTarget, setEditTarget] = useState(null);   // null = create, object = edit
  const [form, setForm] = useState(emptyForm);
  const [studentsModal, setStudentsModal] = useState(null);
  const [students, setStudents] = useState([]);
  const [deleteModal, setDeleteModal] = useState(null);  // class pending delete
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get('/teacher/classes').then(r => setClasses(r.data));
  useEffect(() => { load(); }, []);

  /* ---------- Create / Edit ---------- */
  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (cls) => {
    setEditTarget(cls);
    setForm({ class_name: cls.class_name, level: cls.level, description: cls.description || '' });
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditTarget(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.class_name.trim() || !form.level) {
      toast.error('Class name and level are required.');
      return;
    }
    setSubmitting(true);
    try {
      if (editTarget) {
        await api.put(`/teacher/classes/${editTarget.id}`, form);
        toast.success('Class updated!');
      } else {
        await api.post('/teacher/classes', form);
        toast.success('Class created!');
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Delete ---------- */
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/teacher/classes/${deleteModal.id}`);
      toast.success('Class deleted.');
      setDeleteModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting class.');
    } finally {
      setDeleting(false);
    }
  };

  /* ---------- View Students ---------- */
  const viewStudents = async (cls) => {
    const r = await api.get(`/teacher/classes/${cls.id}/students`);
    setStudents(r.data);
    setStudentsModal(cls);
  };

  /* ---------- Derived display name ---------- */
  const displayName = (cls) => `${cls.class_name} ${cls.level}`;

  return (
    <div>
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Classes</h2>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Class
        </button>
      </div>

      {/* ===== Class Grid ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(c => (
          <div key={c.id} className="card hover:shadow-md transition-shadow group">
            {/* Top row */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg truncate">{displayName(c)}</h3>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ml-2 shrink-0 ${LEVEL_COLORS[c.level] || 'bg-gray-100 text-gray-700'}`}>
                {c.level}
              </span>
            </div>

            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{c.description || 'No description'}</p>

            <div className="flex items-center gap-2 mb-4">
              <span className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                <Users size={12} /> {c.student_count} students
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button onClick={() => viewStudents(c)} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
                <Users size={15} /> Students
              </button>
              <button onClick={() => openEdit(c)} className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-amber-50 hover:border-amber-300 text-amber-600 transition-colors" title="Edit">
                <Pencil size={15} />
              </button>
              <button onClick={() => setDeleteModal(c)} className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-300 text-red-500 transition-colors" title="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}

        {!classes.length && (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-gray-400">
            <GraduationCap size={48} className="mb-3 opacity-40" />
            <p className="text-lg">No classes yet. Create your first class!</p>
          </div>
        )}
      </div>

      {/* ===== Create / Edit Modal ===== */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editTarget ? 'Edit Class' : 'Create New Class'}</h3>
              <button onClick={closeModal}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Class Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. Physics, Mathematics"
                  value={form.class_name}
                  onChange={e => setForm({ ...form, class_name: e.target.value })}
                  required
                />
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  className="input-field"
                  value={form.level}
                  onChange={e => setForm({ ...form, level: e.target.value })}
                  required
                >
                  <option value="" disabled>Select level</option>
                  {LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              {form.class_name && form.level && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex items-center gap-2">
                  <GraduationCap size={18} className="text-indigo-500 shrink-0" />
                  <span className="text-sm text-indigo-700 font-medium">
                    Preview: {form.class_name} {form.level}
                  </span>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(optional)</span></label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Brief description of the class..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
                  {submitting ? 'Saving...' : editTarget ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Delete Confirmation Modal ===== */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle size={28} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Class</h3>
              <p className="text-gray-500 text-sm mb-1">
                Are you sure you want to delete
              </p>
              <p className="font-semibold text-gray-900 mb-1">
                {deleteModal.class_name} {deleteModal.level}?
              </p>
              <p className="text-red-500 text-xs mb-6">
                This will also remove all student enrollments. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal(null)} className="btn-secondary flex-1" disabled={deleting}>Cancel</button>
                <button onClick={confirmDelete} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Students Modal ===== */}
      {studentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold">Students</h3>
                <p className="text-sm text-gray-500">{studentsModal.class_name} {studentsModal.level}</p>
              </div>
              <button onClick={() => setStudentsModal(null)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-3">
              {students.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {s.full_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{s.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{s.email}</p>
                  </div>
                </div>
              ))}
              {!students.length && (
                <div className="text-center text-gray-400 py-8">
                  <Users size={32} className="mx-auto mb-2 opacity-40" />
                  <p>No students enrolled yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}