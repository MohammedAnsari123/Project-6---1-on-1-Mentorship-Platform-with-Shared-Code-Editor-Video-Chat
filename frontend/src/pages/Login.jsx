import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video as VideoIcon } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] text-slate-900 p-4">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
               <VideoIcon size={28} className="text-white" />
            </div>
        </div>
        <h1 className="text-3xl font-black mb-2 text-center tracking-tight text-slate-900">Welcome Back</h1>
        <p className="text-center text-slate-400 text-sm mb-10">Sign in to continue to your workspace</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4.5 rounded-2xl transition-all active:scale-95 shadow-xl shadow-indigo-100 uppercase tracking-widest text-[11px]"
          >
            Sign In
          </button>
        </form>
        <p className="mt-10 text-center text-slate-400 text-sm font-medium">
          New here? <Link to="/register" className="text-indigo-600 hover:underline font-bold">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
