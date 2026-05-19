import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, Pencil, Trash2, Check, X } from 'lucide-react';

// const API = 'http://localhost:5000';
const API = 'https://student-management-backend.onrender.com';

function Avatar({ user, size = 10 }) {
  const s = `w-${size} h-${size}`;
  const roleColors = { admin: 'bg-red-100 text-red-600', teacher: 'bg-blue-100 text-blue-600', student: 'bg-green-100 text-green-600' };
  if (user?.profile_picture) {
    return <img src={`${API}/uploads/${user.profile_picture}`} alt={user.full_name}
      className={`${s} rounded-full object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${s} rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm ${roleColors[user?.role] || 'bg-indigo-100 text-indigo-600'}`}>
      {user?.full_name?.charAt(0).toUpperCase()}
    </div>
  );
}

export default function ChatBox() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const { user } = useAuth();
  const bottomRef = useRef();
  const pollRef = useRef();
  const editRef = useRef();

  useEffect(() => {
    api.get('/chat/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    const load = () => api.get(`/chat/${selected.id}`).then(r => setMessages(r.data)).catch(() => {});
    load();
    pollRef.current = setInterval(load, 3000);
    return () => clearInterval(pollRef.current);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  const reload = () => api.get(`/chat/${selected.id}`).then(r => setMessages(r.data));

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    try {
      await api.post('/chat/send', { receiver_id: selected.id, message: text });
      setText('');
      reload();
    } catch {}
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditText(m.message);
  };

  const cancelEdit = () => { setEditingId(null); setEditText(''); };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      await api.put(`/chat/${id}`, { message: editText });
      setEditingId(null);
      reload();
    } catch {}
  };

  const deleteMsg = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api.delete(`/chat/${id}`);
      reload();
    } catch {}
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    student: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chat</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Message teachers and students</p>
      </div>
      <div className="flex gap-4 h-[calc(100vh-220px)]">
        {/* Contacts */}
        <div className="w-72 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Contacts</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {users.map(u => (
              <button key={u.id} onClick={() => setSelected(u)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700 ${selected?.id === u.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-l-indigo-600' : ''}`}>
                <Avatar user={u} size={10} />
                <div className="text-left min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{u.full_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${roleColors[u.role]}`}>{u.role}</span>
                </div>
              </button>
            ))}
            {!users.length && <p className="text-center text-gray-400 py-8 text-sm">No contacts available</p>}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
          {selected ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <Avatar user={selected} size={10} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{selected.full_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${roleColors[selected.role]}`}>{selected.role}</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map(m => {
                  const isMine = m.sender_id === user.id;
                  const isEditing = editingId === m.id;
                  return (
                    <div key={m.id}
                      className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                      onMouseEnter={() => setHoveredId(m.id)}
                      onMouseLeave={() => setHoveredId(null)}>

                      {!isMine && <Avatar user={selected} size={7} />}

                      <div className={`max-w-xs lg:max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                        {isEditing ? (
                          <div className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-indigo-300 rounded-2xl px-3 py-2 shadow-sm">
                            <input ref={editRef} className="text-sm bg-transparent outline-none text-gray-800 dark:text-gray-100 min-w-[160px]"
                              value={editText} onChange={e => setEditText(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveEdit(m.id); if (e.key === 'Escape') cancelEdit(); }} />
                            <button onClick={() => saveEdit(m.id)} className="text-green-600 hover:text-green-700"><Check size={15} /></button>
                            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600"><X size={15} /></button>
                          </div>
                        ) : (
                          <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'}`}>
                            <p className="whitespace-pre-wrap break-words">{m.message}</p>
                            <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <span className={`text-xs ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                                {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {m.is_edited === 1 && <span className={`text-xs italic ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>(edited)</span>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Edit/Delete buttons - only for own messages */}
                      {isMine && !isEditing && hoveredId === m.id && (
                        <div className="flex items-center gap-1 mb-1">
                          <button onClick={() => startEdit(m)}
                            className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteMsg(m.id)}
                            className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}

                      {isMine && <Avatar user={user} size={7} />}
                    </div>
                  );
                })}
                {!messages.length && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageSquare size={40} className="mb-2 opacity-50" />
                    <p>No messages yet. Say hello!</p>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                <input className="input-field flex-1" placeholder="Type a message..."
                  value={text} onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }} />
                <button type="submit" disabled={!text.trim()} className="btn-primary px-4 flex items-center gap-2">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare size={60} className="mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a contact to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
