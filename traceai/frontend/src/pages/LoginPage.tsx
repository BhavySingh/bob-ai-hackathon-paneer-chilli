import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Please check your Officer ID and password.');
    }
  };

  const fillDemo = () => {
    setEmail('demo@nfsu.traceai');
    setPassword('TraceAI@123');
    setShowDemo(false);
  };

  return (
    <div className="min-h-screen bg-[#070d1a] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-slate-900 to-[#0d1f3c] relative overflow-hidden px-12">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[80px]" />
        <div className="relative text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">TRACE<span className="text-blue-400">AI</span></h1>
          <p className="text-slate-400 leading-relaxed max-w-sm">
            AI-Powered Missing Person Investigation Assistant.
            Correlate evidence, prioritize leads, generate reports.
          </p>
          <div className="mt-10 space-y-3 text-left">
            {['Case Management', 'AI Lead Correlation', 'Investigation Timeline', 'Public Appeal Generator'].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">TRACE<span className="text-blue-400">AI</span></span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back, Investigator.</h2>
          <p className="text-slate-400 text-sm mb-8">Sign in to access the investigation platform.</p>

          {error && (
            <div className="flex items-center gap-3 p-3 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email / Officer ID</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="officer@department.gov"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 accent-blue-500"
                />
                <span className="text-slate-400">Remember me</span>
              </label>
              <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : 'Login'}
            </button>
          </form>

          {/* Demo access */}
          <div className="mt-6 border-t border-slate-700/50 pt-6">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors w-full justify-center"
            >
              <Info className="w-3.5 h-3.5" />
              Demo access (Hackathon)
            </button>
            {showDemo && (
              <div className="mt-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg text-xs text-slate-400 space-y-1">
                <p>Officer ID: <code className="text-blue-400">demo@nfsu.traceai</code></p>
                <p>Password: <code className="text-blue-400">TraceAI@123</code></p>
                <button
                  onClick={fillDemo}
                  className="mt-2 text-blue-400 hover:text-blue-300 underline"
                >
                  Fill credentials
                </button>
              </div>
            )}
          </div>

          <p className="mt-8 text-xs text-slate-600 text-center">
            TRACEAI is a hackathon prototype. Not for operational law enforcement use.
          </p>
        </div>
      </div>
    </div>
  );
}
