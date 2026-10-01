import React, { useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { setAuthToken } from '../../utils/token';
import { Compass, Sparkles, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await apiClient.post('/auth/register', {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          targetRoles: [targetRole]
        });

        if (res.data?.token) {
          setAuthToken(res.data.token);
          onLoginSuccess(res.data.user);
        }
      } else {
        const res = await apiClient.post('/auth/login', {
          email: email.trim().toLowerCase(),
          password
        });

        if (res.data?.token) {
          setAuthToken(res.data.token);
          onLoginSuccess(res.data.user);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      // Try login first
      const loginRes = await apiClient.post('/auth/login', {
        email: 'elsa.mine1909@gmail.com',
        password: 'securepassword123'
      });

      if (loginRes.data?.token) {
        setAuthToken(loginRes.data.token);
        onLoginSuccess(loginRes.data.user);
        return;
      }
    } catch {
      // If user doesn't exist, register demo user
      try {
        const regRes = await apiClient.post('/auth/register', {
          name: 'Elsa Mine',
          email: 'elsa.mine1909@gmail.com',
          password: 'securepassword123',
          targetRoles: ['Full Stack Developer', 'Machine Learning Engineer']
        });
        if (regRes.data?.token) {
          setAuthToken(regRes.data.token);
          onLoginSuccess(regRes.data.user);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Demo login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md">
            <Compass className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">CareerLens AI</h1>
          <p className="text-xs text-slate-500 font-medium">
            Intelligent Career Profile Analysis, Resume NLP & Job Compatibility Platform
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMessage(null); }}
              className={`flex-1 pb-3 text-xs font-bold transition text-center cursor-pointer ${
                !isRegister
                  ? 'border-b-2 border-emerald-600 text-emerald-800'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMessage(null); }}
              className={`flex-1 pb-3 text-xs font-bold transition text-center cursor-pointer ${
                isRegister
                  ? 'border-b-2 border-emerald-600 text-emerald-800'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Primary Target Role
                </label>
                <select
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600"
                >
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                  <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="DevOps / Cloud Engineer">DevOps / Cloud Engineer</option>
                </select>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Create Profile & Continue' : 'Sign In to CareerLens'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quick Demo Sign In (Elsa Mine)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
