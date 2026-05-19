import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'student' });
  const [editId, setEditId] = useState(null);

  const load = () => api.get(`/admin/users${filter ? `?role=${filter}` : ''}`).then(r => setUsers(r.data));
  useEffect(() => { load(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/admin/users/${editId}`, form);
        toast.success('User updated.');
      } else {
        await api.post('/admin/users', form);
        toast.success('User created.');
      }
      setModal(false); setEditId(null); setForm({ full_name: '', email: '', password: '', role: 'student' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${id}`);
    toast.success('User deleted.'); load();
  };

  const openEdit = (u) => {
    setForm({ full_name: u.full_name, email: u.email, password: '', role: u.role, is_active: u.is_active });
    setEditId(u.id); setModal(true);
  };

  const roleColors = { admin: 'bg-red-100 text-red-700', teacher: 'bg-blue-100 text-blue-700', student: 'bg-green-100 text-green-700' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
        <button onClick={() => { setModal(true); setEditId(null); setForm({ full_name: '', email: '', password: '', role: 'student' }); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="card mb-4">
        <div className="flex gap-2 flex-wrap">
          {['', 'admin', 'teacher', 'student'].map(r => (
            <button key={r} onClick={() => setFilter(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {r ? r.charAt(0).toUpperCase() + r.slice(1) + 's' : 'All Users'}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {u.full_name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleColors[u.role]}`}>{u.role}</span></td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && <p className="text-center text-gray-400 py-12">No users found.</p>}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editId ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input className="input-field" placeholder="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
              <input type="email" className="input-field" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              {!editId && <input type="password" className="input-field" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />}
              <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
              {editId && (
                <select className="input-field" value={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.value })}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
