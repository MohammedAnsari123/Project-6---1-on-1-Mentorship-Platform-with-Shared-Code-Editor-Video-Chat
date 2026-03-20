import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import { Plus, Video as VideoIcon, LogOut, Copy, Check } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [joiningId, setJoiningId] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
    // Fetch user sessions would go here
  }, [user, navigate]);

  const handleCreateSession = async () => {
    try {
      const { data } = await api.post('/sessions/create');
      navigate(`/session/${data.sessionCode}`);
    } catch (err) {
      alert('Failed to create session');
    }
  };

  const handleJoinSession = async (e) => {
    e.preventDefault();
    if (!joiningId) return;
    try {
      const { data } = await api.post('/sessions/join', { code: joiningId });
      navigate(`/session/${data.sessionCode}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join session');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-8 selection:bg-indigo-100">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-16 pt-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
               <VideoIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                Mentorship<span className="text-indigo-600">.</span>Live
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5 uppercase">Welcome back, {user?.name}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 px-5 py-2.5 rounded-xl text-slate-500 hover:text-rose-600 transition-all border border-slate-200 shadow-sm text-xs font-bold"
          >
            <LogOut size={16} /> Logout
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center text-center group hover:border-indigo-200 transition-all duration-500">
            <div className="bg-indigo-50 p-6 rounded-3xl mb-8 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-500">
              <Plus size={40} className="text-indigo-600 group-hover:text-white" />
            </div>
            <h2 className="text-2xl font-black mb-4 tracking-tight uppercase text-slate-800">Host Meeting</h2>
            <p className="text-slate-400 mb-10 text-sm leading-relaxed max-w-[260px]">Create a secure collaborative workspace and share the code with your student.</p>
            <button
              onClick={handleCreateSession}
              className="w-full bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 text-white font-black py-4.5 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-[11px]"
            >
              Initialize Session
            </button>
          </div>

          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-all duration-500">
            <div className="bg-blue-50 p-6 rounded-3xl mb-8 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500">
              <VideoIcon size={40} className="text-blue-600 group-hover:text-white" />
            </div>
            <h2 className="text-2xl font-black mb-4 tracking-tight uppercase text-slate-800">Join Room</h2>
            <p className="text-slate-400 mb-10 text-sm leading-relaxed max-w-[260px]">Ready to learn? Enter the unique session code to enter the classroom.</p>
            <form onSubmit={handleJoinSession} className="w-full space-y-3">
              <input
                type="text"
                placeholder="Ex: abc-def-ghi"
                value={joiningId}
                onChange={(e) => setJoiningId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-center font-mono tracking-widest transition-all placeholder:text-slate-300"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 text-white font-black py-4.5 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-[11px]"
              >
                Connect Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
