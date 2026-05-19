import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, AlertCircle, X, Upload, Eye, Star } from 'lucide-react';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [submitModal, setSubmitModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [form, setForm] = useState({ submission_text: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/student/assignments').then(r => setAssignments(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.submission_text.trim() && !file) {
      return toast.error('Please write an answer or attach a file.');
    }
    setLoading(true);
    const fd = new FormData();
    fd.append('assignment_id', submitModal.id);
    fd.append('submission_text', form.submission_text);
    if (file) fd.append('file', file);
    try {
      await api.post('/student/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Assignment submitted successfully!');
      setSubmitModal(null);
      setForm({ submission_text: '' });
      setFile(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (due) => new Date() > new Date(due);

  const statusBadge = (a) => {
    if (a.submission_status === 'graded') return (
      <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
        <Star size={12} /> Graded: {a.score}/{a.max_score}
      </span>
    );
    if (a.submission_status === 'submitted' || a.submission_status === 'late') return (
      <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
        <CheckCircle size={12} /> {a.submission_status === 'late' ? 'Submitted (Late)' : 'Submitted'}
      </span>
    );
    if (isOverdue(a.due_date)) return (
      <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium">
        <AlertCircle size={12} /> Overdue
      </span>
    );
    return (
      <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs px-2.5 py-1 rounded-full font-medium">
        <Clock size={12} /> Pending
      </span>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
        <p className="text-gray-500 mt-1">Reba no kohereza assignments zawe</p>
      </div>

      <div className="space-y-4">
        {assignments.map(a => (
          <div key={a.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-lg">{a.title}</h3>
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">{a.class_name}</span>
                  {statusBadge(a)}
                </div>
                <p className="text-gray-600 text-sm mb-3">{a.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className={isOverdue(a.due_date) && !a.submission_id ? 'text-red-500' : ''} />
                    Due: {new Date(a.due_date).toLocaleString()}
                  </span>
                  <span className="font-medium">Max: {a.max_score} pts</span>
                  <span>Teacher: {a.teacher_name}</span>
                </div>
                {a.file_attachment && (
                  <a href={`http://localhost:5000/uploads/${a.file_attachment}`} target="_blank"
                    className="text-indigo-600 text-xs hover:underline mt-2 inline-block">
                    📎 View Assignment File
                  </a>
                )}

                {/* Score + Feedback iyo yarakosorwa */}
                {a.submission_status === 'graded' && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Star size={16} className="text-green-600" />
                      <span className="font-semibold text-green-800">
                        Score: {a.score} / {a.max_score} pts
                        <span className="ml-2 text-green-600">({Math.round((a.score / a.max_score) * 100)}%)</span>
                      </span>
                    </div>
                    {a.feedback && (
                      <p className="text-sm text-green-700 mt-1">
                        <span className="font-medium">Feedback:</span> {a.feedback}
                      </p>
                    )}
                  </div>
                )}

                {/* Submission yoherejwe ariko ntiyarakosorwa */}
                {(a.submission_status === 'submitted' || a.submission_status === 'late') && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <CheckCircle size={14} />
                      Submission sent — waiting for grading...
                    </p>
                    {a.submitted_at && (
                      <p className="text-xs text-blue-500 mt-1">
                        Submitted: {new Date(a.submitted_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {!a.submission_id ? (
                  <button
                    onClick={() => { setSubmitModal(a); setForm({ submission_text: '' }); setFile(null); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isOverdue(a.due_date)
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'btn-primary'
                    }`}>
                    <Upload size={15} />
                    {isOverdue(a.due_date) ? 'Submit (Late)' : 'Submit'}
                  </button>
                ) : (
                  <button
                    onClick={() => setViewModal(a)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">
                    <Eye size={15} /> View
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {!assignments.length && (
          <div className="text-center py-16">
            <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No assignments yet.</p>
            <p className="text-gray-400 text-sm mt-1">Enroll in a class to see your assignments.</p>
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold">Submit Assignment</h3>
                <p className="text-sm text-gray-500 mt-0.5">{submitModal.title}</p>
              </div>
              <button onClick={() => setSubmitModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {isOverdue(submitModal.due_date) && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700">
                  ⚠️ Due date has passed — your submission will be marked as "Late"
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your answer <span className="text-gray-400">(required if no file)</span>
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={6}
                  placeholder="Write your answer here..."
                  value={form.submission_text}
                  onChange={e => setForm({ ...form, submission_text: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Attachment <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="file"
                  className="input-field"
                  onChange={e => setFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.ppt,.pptx"
                />
                {file && <p className="text-xs text-green-600 mt-1">✓ {file.name}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSubmitModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Upload size={16} />
                  {loading ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Submission Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold">My Submission</h3>
                <p className="text-sm text-gray-500 mt-0.5">{viewModal.title}</p>
              </div>
              <button onClick={() => setViewModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                {statusBadge(viewModal)}
                {viewModal.submitted_at && (
                  <span className="text-xs text-gray-400">
                    {new Date(viewModal.submitted_at).toLocaleString()}
                  </span>
                )}
              </div>

              {viewModal.submission_text && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Your answer:</p>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
                    {viewModal.submission_text}
                  </div>
                </div>
              )}

              {viewModal.submission_status === 'graded' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-800 text-lg">
                    Score: {viewModal.score} / {viewModal.max_score}
                    <span className="text-base ml-2 font-normal text-green-600">
                      ({Math.round((viewModal.score / viewModal.max_score) * 100)}%)
                    </span>
                  </p>
                  {viewModal.feedback && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-green-700">Teacher Feedback:</p>
                      <p className="text-sm text-green-700 mt-1 italic">"{viewModal.feedback}"</p>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => setViewModal(null)} className="btn-secondary w-full">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
