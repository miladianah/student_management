import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Camera, User, Lock, Save } from 'lucide-react';

// const API = 'http://localhost:5000';
const API = 'https://student-management-backend.onrender.com';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [nameForm, setNameForm] = useState({ full_name: '' });
  const [passForm, setPassForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [uploading, setUploading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    const r = await api.get('/profile');
    setProfile(r.data);
    setNameForm({ full_name: r.data.full_name });
  };

  useEffect(() => { load(); }, []);

  const handlePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('profile_picture', file);
    try {
      const r = await api.post('/profile/picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      // Update AuthContext → triggers re-render in Layout + ChatBox instantly
      updateUser({ profile_picture: r.data.filename });
      toast.success('Profile picture updated!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await api.put('/profile', nameForm);
      updateUser({ full_name: nameForm.full_name });
      toast.success('Name updated!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error.');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm)
      return toast.error('New passwords do not match.');
    if (passForm.new_password.length < 6)
      return toast.error('Password must be at least 6 characters.');
    setSavingPass(true);
    try {
      await api.put('/profile/password', {
        current_password: passForm.current_password,
        new_password: passForm.new_password
      });
      toast.success('Password changed successfully!');
      setPassForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error.');
    } finally {
      setSavingPass(false);
    }
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    teacher: 'bg-blue-100 text-blue-700',
    student: 'bg-green-100 text-green-700'
  };

  if (!profile) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Picture */}
      <div className="card">
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center ring-4 ring-indigo-100 dark:ring-indigo-800">
              {user?.profile_picture ? (
                <img
                  src={`${API}/uploads/${user.profile_picture}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => fileRef.current.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-60">
              {uploading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Camera size={14} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePictureChange} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user?.full_name}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{profile.email}</p>
            <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${roleColors[profile.role]}`}>
              {profile.role}
            </span>
            <p className="text-xs text-gray-400 mt-1">
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
          <Camera size={12} /> Click the camera icon to change your profile picture
        </p>
      </div>

      {/* Personal Info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-indigo-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Personal Information</h3>
        </div>
        <form onSubmit={handleUpdateName} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input className="input-field" value={nameForm.full_name}
              onChange={e => setNameForm({ full_name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input className="input-field opacity-60 cursor-not-allowed" value={profile.email} disabled />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>
          <button type="submit" disabled={savingName} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {savingName ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-indigo-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Change Password</h3>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input type="password" className="input-field" placeholder="Enter current password"
              value={passForm.current_password}
              onChange={e => setPassForm({ ...passForm, current_password: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input type="password" className="input-field" placeholder="Min 6 characters"
              value={passForm.new_password}
              onChange={e => setPassForm({ ...passForm, new_password: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input type="password" className="input-field" placeholder="Repeat new password"
              value={passForm.confirm}
              onChange={e => setPassForm({ ...passForm, confirm: e.target.value })} required />
          </div>
          <button type="submit" disabled={savingPass} className="btn-primary flex items-center gap-2">
            <Lock size={16} /> {savingPass ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
