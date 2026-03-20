import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import socket from '../lib/socket';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import { useWebRTC } from '../hooks/useWebRTC';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { 
  LogOut, Users, MessageSquare, Video as VideoIcon, 
  Code, Mic, MicOff, VideoOff, Send, Share2,
  Play, Square, Terminal as TerminalIcon, X
} from 'lucide-react';

const Room = () => {
  const { id: sessionId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // Data States
  const [session, setSession] = useState(null);
  const [code, setCode] = useState('// Start coding here...');
  const [language, setLanguage] = useState('javascript');
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // Refs
  const chatEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Custom Hooks for Modular Logic
  const { remoteStream } = useWebRTC(session?.sessionCode, localStream, user);
  const { executionResult, isExecuting, runCode, setExecutionResult } = useCodeExecution(session?.sessionCode, language, code);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const initSession = async () => {
      try {
        const { data } = await api.get(`/sessions/${sessionId}`);
        setSession(data);
        
        // Get media
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // Socket Join
        if (!socket.connected) socket.connect();
        socket.emit('join-room', { sessionId: data.sessionCode });

        // Load Message History
        const msgRes = await api.get(`/sessions/${data._id}/messages`);
        setMessages(msgRes.data);
      } catch (err) {
        console.error('Session Init Error:', err);
        navigate('/dashboard');
      }
    };

    initSession();

    // Socket Listeners (General)
    socket.on('code-update', (newCode) => setCode(newCode));
    socket.on('language-update', (newLang) => setLanguage(newLang));
    socket.on('receive-message', (msg) => setMessages(prev => [...prev, msg]));

    return () => {
      socket.off('code-update');
      socket.off('language-update');
      socket.off('receive-message');
      if (localStream) localStream.getTracks().forEach(t => t.stop());
    };
  }, [sessionId, user, navigate]);

  // Sync Remote Stream to Video Element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handlers
  const handleEditorChange = (val) => {
    setCode(val);
    socket.emit('code-change', { sessionId: session?.sessionCode, code: val });
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socket.emit('language-change', { sessionId: session?.sessionCode, language: newLang });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !session) return;
    const msgData = {
      sessionId: session.sessionCode,
      sessionDbId: session._id,
      senderId: user._id,
      senderName: user.name,
      message: messageInput,
      timestamp: new Date().toISOString(),
    };
    socket.emit('send-message', msgData);
    setMessages(prev => [...prev, msgData]);
    setMessageInput('');
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shadow-sm relative z-20">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <VideoIcon size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Session Space</h2>
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { navigator.clipboard.writeText(session?.sessionCode); alert('Copied!'); }}>
              <span className="text-[10px] bg-slate-100 text-indigo-600 px-2 py-0.5 rounded border border-slate-200 font-mono font-bold tracking-widest uppercase">
                {session?.sessionCode || 'Loading...'}
              </span>
              <Share2 size={10} className="text-slate-400 group-hover:text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-rose-200"
          >
            <LogOut size={14} /> Leave Session
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col border-r border-slate-200 bg-white">
           <div className="flex items-center justify-between px-4 py-2 bg-slate-50/50 border-b border-slate-200">
              <div className="flex items-center gap-4">
                 <select value={language} onChange={handleLanguageChange} className="bg-transparent text-[11px] font-black text-slate-500 uppercase focus:outline-none">
                    {[
                      { value: 'javascript', label: 'JavaScript' },
                      { value: 'typescript', label: 'TypeScript' },
                      { value: 'python', label: 'Python' },
                      { value: 'java', label: 'Java' },
                      { value: 'cpp', label: 'C++' },
                      { value: 'c', label: 'C' },
                      { value: 'ruby', label: 'Ruby' },
                      { value: 'go', label: 'Go' },
                      { value: 'rust', label: 'Rust' },
                      { value: 'php', label: 'PHP' },
                      { value: 'swift', label: 'Swift' },
                      { value: 'kotlin', label: 'Kotlin' },
                      { value: 'csharp', label: 'C#' },
                      { value: 'bash', label: 'Bash' },
                    ].map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                  <button onClick={runCode} disabled={isExecuting} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${isExecuting ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}>
                    {isExecuting ? <Square size={10} className="animate-pulse" /> : <Play size={10} />}
                    {isExecuting ? 'Running...' : 'Run Code'}
                  </button>
              </div>
              <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-tighter opacity-50 italic">live_sync_v4.modular</div>
           </div>
           
           <div className="flex-1 flex flex-col relative overflow-hidden bg-[#fafafa]">
            <div className={executionResult ? 'h-[65%]' : 'flex-1'}>
              <Editor
                height="100%"
                theme="vs-light"
                language={language}
                value={code}
                onChange={handleEditorChange}
                options={{ 
                  fontSize: 14, 
                  minimap: { enabled: false }, 
                  automaticLayout: true, 
                  padding: { top: 24 }, 
                  fontFamily: "'JetBrains Mono', monospace", 
                  lineHeight: 22,
                  renderLineHighlight: 'all',
                }}
              />
            </div>

            {/* Terminal Output */}
            {executionResult && (
              <div className="h-[35%] bg-[#1e1e1e] border-t-2 border-indigo-500/30 flex flex-col">
                <div className="flex items-center justify-between px-5 py-2.5 bg-[#252526] border-b border-white/5 shrink-0">
                  <div className="flex items-center gap-2">
                    <TerminalIcon size={12} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Output Console</span>
                  </div>
                  <button onClick={() => setExecutionResult('')} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group">
                    <X size={14} className="text-slate-500 group-hover:text-white" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 font-mono text-[13px]">
                  <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed select-text">{executionResult}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[380px] flex flex-col bg-white overflow-hidden shadow-2xl relative z-10">
          {/* Video Section */}
          <div className="p-4 flex flex-col gap-3 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative bg-slate-200 rounded-2xl overflow-hidden aspect-video shadow-inner border border-white">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/80 backdrop-blur rounded text-[9px] font-bold text-slate-800">ME</div>
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <button onClick={toggleMic} className={`p-1.5 rounded-lg transition-all ${isMicOn ? 'bg-white/80' : 'bg-rose-500 text-white'}`}><Mic size={12} /></button>
                  <button onClick={toggleVideo} className={`p-1.5 rounded-lg transition-all ${isVideoOn ? 'bg-white/80' : 'bg-rose-500 text-white'}`}><VideoIcon size={12} /></button>
                </div>
              </div>

              <div className="relative bg-slate-200 rounded-2xl overflow-hidden aspect-video shadow-inner border border-white flex items-center justify-center">
                <video ref={remoteVideoRef} autoPlay playsInline className={`w-full h-full object-cover transition-opacity duration-500 ${remoteStream ? 'opacity-100' : 'opacity-0'}`} />
                {!remoteStream && <Users size={20} className="text-slate-400 animate-pulse" />}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 rounded text-[9px] font-bold text-white uppercase shadow-sm">Peer</div>
              </div>
            </div>
          </div>

          {/* Chat System */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Discussion</h3>
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-200">
                  <MessageSquare size={32} strokeWidth={1.5} className="mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Quiet Room</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.senderId === user?._id ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-[13px] max-w-[85%] shadow-sm ${msg.senderId === user?._id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'}`}>
                    {msg.message}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                    <span>{msg.senderName}</span>
                    <span className="opacity-40">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="relative flex gap-2">
                <input type="text" placeholder="Send a message..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all" />
                <button type="submit" disabled={!messageInput.trim()} className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"><Send size={16} /></button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Room;
