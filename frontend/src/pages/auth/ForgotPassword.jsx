import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { BookOpen, ArrowLeft, Sun, Moon } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      // If email service is down, dev_code is returned directly
      if (res.data.dev_code) {
        const digits = res.data.dev_code.toString().split('');
        setCode(digits);
        toast.success('Code yashyizwe mu boxes (email service ntikora - dev mode)');
      } else {
        toast.success('Reset code sent to your email!');
      }
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) document.getElementById(`code-${index + 1}`)?.focus();
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) return toast.error('Enter the 6-digit code.');
    setLoading(true);
    try {
      await api.post('/auth/verify-reset-code', { email, code: fullCode });
      toast.success('Code verified!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, code: code.join(''), new_password: newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <button onClick={toggle} className="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform">
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-2 w-12 rounded-full transition-all ${step >= s ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            ))}
          </div>
        </div>

        <div className="card shadow-xl">
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">Enter your email</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">We'll send a 6-digit code to reset your password.</p>
                <input type="email" className="input-field" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">Enter the code</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Check your email <strong>{email}</strong> for the 6-digit code.</p>
                <div className="flex gap-2 justify-center">
                  {code.map((digit, i) => (
                    <input key={i} id={`code-${i}`} type="text" maxLength={1}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={digit} onChange={e => handleCodeChange(i, e.target.value)}
                      onKeyDown={e => e.key === 'Backspace' && !digit && i > 0 && document.getElementById(`code-${i - 1}`)?.focus()} />
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary w-full flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Back
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">New Password</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter your new password below.</p>
                <input type="password" className="input-field" placeholder="Min 6 characters"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-center gap-1">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
