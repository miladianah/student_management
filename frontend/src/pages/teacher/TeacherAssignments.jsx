import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Eye, X, CheckCircle, Clock, Star, AlertCircle, Users } from 'lucide-react';

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [modal, setModal] = useState(false);
  const [submissionsModal, setSubmissionsModal] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradeModal, setGradeModal] = useState(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });
  const [form, setForm] = useState({ title: '', description: '', class_id: '', due_date: '', max_score: 100 });
  const [file, setFile] = useState(null);
  const [gradeLoading, setGradeLoading] = useState(false);

  const load = () => api.get('/teacher/assignments').then(r => setAssignments(r.data));
  useEffect(() => { load(); api.get('/teacher/classes').then(r => setClasses(r.data)); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    try {
      await api.post('/teacher/assignments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Assignment created!');
      setModal(false);
      setForm({ title: '', description: '', class_id: '', due_date: '', max_score: 100 });
      setFile(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error.');
    }
  };

  const viewSubmissions = async (a) => {
    const r = await api.get(`/teacher/assignments/${a.id}/submissions`);
    setSubmissions(r.data);
    setSubmissionsModal(a);
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!gradeForm.score && gradeForm.score !== 0) return toast.error('Please enter a score.');
    setGradeLoading(true);
    try {
      await api.put(`/teacher/submissions/${gradeModal.id}/grade`, gradeForm);
      toast.success('Grade saved successfully!');
      setGradeModal(null);
      setGradeForm({ score: '', feedback: '' });
      viewSubmissions(submissionsModal);
      load();
    } catch {
      toast.error('An error occurred.')
    } finally {
      setGradeLoading(false);
    }
  };

  const statusBadge = (s) => {
    if (s.status === 'graded') return <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium"><Star size={11} /> Graded: {s.score}</span>;
    if (s.status === 'late') return <span className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-medium"><AlertCircle size={11} /> Late</span>;
    return <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium"><CheckCircle size={11} /> Submitted</span>;
  };

  const pendingCount = (a) => {
    // shown in assignment list
    return a.submission_count;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Assignment
        </button>
      </div>

      <div className="space-y-3">
        {assignments.map(a => (
          <div key={a.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-lg">{a.title}</h3>
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">{a.class_name}</span>
                </div>
                <p className="text-gray-500 text-sm mb-2">{a.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1"><Clock size={12} /> Due: {new Date(a.due_date).toLocaleString()}</span>
                  <span className="font-medium">Max: {a.max_score} pts</span>
                  <span className="flex items-center gap-1 text-indigo-600 font-medium">
                    <Users size={12} /> {a.submission_count} submission{a.submission_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <button
                onClick={() => viewSubmissions(a)}
                className="btn-secondary flex items-center gap-2 text-sm flex-shrink-0 relative">
                <Eye size={16} /> View Submissions
                {a.submission_count > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {a.submission_count}
                  </span>
                )}
              </button>
            </div>
          </div>
        ))}
        {!assignments.length && (
          <div className="text-center py-16">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No assignments yet.</p>
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Create Assignment</h3>
              <button onClick={() => setModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <input className="input-field" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <textarea className="input-field resize-none" rows={3} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              <select className="input-field" value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })} required>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
              </select>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="datetime-local" className="input-field" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} required />
              </div>
              <input type="number" className="input-field" placeholder="Max Score (default 100)" value={form.max_score} onChange={e => setForm({ ...form, max_score: e.target.value })} min={1} />
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

      {/* Submissions Modal */}
      {submissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold">Submissions</h3>
                <p className="text-sm text-gray-500 mt-0.5">{submissionsModal.title} — Max: {submissionsModal.max_score} pts</p>
              </div>
              <button onClick={() => setSubmissionsModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4">
              {submissions.map(s => (
                <div key={s.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {s.student_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{s.student_name}</p>
                        <p className="text-xs text-gray-400">{new Date(s.submitted_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(s)}
                      {s.status !== 'graded' && (
                        <button
                          onClick={() => { setGradeModal(s); setGradeForm({ score: '', feedback: '' }); }}
                          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                          <Star size={13} /> Grade
                        </button>
                      )}
                      {s.status === 'graded' && (
                        <button
                          onClick={() => { setGradeModal(s); setGradeForm({ score: s.score, feedback: s.feedback || '' }); }}
                          className="btn-secondary text-xs py-1.5 px-3">
                          Edit Grade
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submission Content */}
                  <div className="p-4 space-y-3">
                    {s.submission_text ? (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Answer</p>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {s.submission_text}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No text answer provided.</p>
                    )}

                    {s.file_attachment && (
                      <a href={`http://localhost:5000/uploads/${s.file_attachment}`} target="_blank"
                        className="inline-flex items-center gap-1 text-indigo-600 text-sm hover:underline font-medium">
                        📎 View Attached File
                      </a>
                    )}

                    {s.status === 'graded' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm font-semibold text-green-800">
                          Score: {s.score} / {submissionsModal.max_score}
                          <span className="ml-2 font-normal text-green-600">
                            ({Math.round((s.score / submissionsModal.max_score) * 100)}%)
                          </span>
                        </p>
                        {s.feedback && <p className="text-sm text-green-700 mt-1">Feedback: {s.feedback}</p>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {!submissions.length && (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400">No submissions yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {gradeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {gradeModal.status === 'graded' ? 'Edit Grade' : 'Grade Submission'}
              </h3>
              <button onClick={() => setGradeModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleGrade} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-600">Student: <strong>{gradeModal.student_name}</strong></p>
                {gradeModal.submission_text && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{gradeModal.submission_text}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score <span className="text-gray-400">(max {submissionsModal?.max_score})</span>
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder={`0 - ${submissionsModal?.max_score}`}
                  value={gradeForm.score}
                  onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })}
                  required min={0} max={submissionsModal?.max_score}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Write feedback for the student..."
                  value={gradeForm.feedback}
                  onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setGradeModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={gradeLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Star size={15} />
                  {gradeLoading ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
