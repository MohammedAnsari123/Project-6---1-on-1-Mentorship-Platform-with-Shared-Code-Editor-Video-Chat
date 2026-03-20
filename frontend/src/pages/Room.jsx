import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import socket from '../lib/socket';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import { createPeerConnection } from '../lib/webrtc';
import { 
  LogOut, Users, MessageSquare, Video as VideoIcon, 
  Code, Mic, MicOff, VideoOff, Send, Copy, Settings, Share2
} from 'lucide-react';

const Room = () => {
  const { id: sessionId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // States
  const [session, setSession] = useState(null);
  const [code, setCode] = useState('// Start coding here...');
  const [language, setLanguage] = useState('javascript');
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // Refs
  const editorRef = useRef(null);
  const chatEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const init = async () => {
      let currentSession;
      try {
        const { data } = await api.get(`/sessions/${sessionId}`);
        setSession(data);
        currentSession = data;
      } catch (err) {
        alert('Session not found');
        navigate('/dashboard');
        return;
      }

      let localStream;
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(localStream);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }

      if (!socket.connected) socket.connect();
      socket.emit('join-room', { sessionId: currentSession.sessionCode });

      pcRef.current = createPeerConnection(
        (candidate) => {
          socket.emit('webrtc-ice-candidate', { sessionId: currentSession.sessionCode, candidate });
        },
        (remote) => {
          setRemoteStream(remote);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
        }
      );

      if (localStream) {
        localStream.getTracks().forEach((track) => pcRef.current.addTrack(track, localStream));
      }

      socket.on('peer-joined', async () => {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socket.emit('webrtc-offer', { sessionId: currentSession.sessionCode, sdp: offer });
      });

      const candidatesQueue = [];

      socket.on('webrtc-offer', async ({ sdp }) => {
        if (!pcRef.current) return;
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
          
          while (candidatesQueue.length > 0) {
            const cand = candidatesQueue.shift();
            await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
          }

          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          socket.emit('webrtc-answer', { sessionId: currentSession.sessionCode, sdp: answer });
        } catch (err) {
          console.error('Error handling offer:', err);
        }
      });

      socket.on('webrtc-answer', async ({ sdp }) => {
        if (!pcRef.current) return;
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
          
          while (candidatesQueue.length > 0) {
            const cand = candidatesQueue.shift();
            await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
          }
        } catch (err) {
          console.error('Error handling answer:', err);
        }
      });

      socket.on('webrtc-ice-candidate', async ({ candidate }) => {
        if (!pcRef.current) return;
        if (candidate) {
          try {
            if (pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              candidatesQueue.push(candidate);
            }
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        }
      });

      socket.on('language-update', (newLang) => setLanguage(newLang));
      socket.on('code-update', (newCode) => setCode(newCode));
      socket.on('receive-message', (message) => setMessages((prev) => [...prev, message]));

      try {
        const { data } = await api.get(`/sessions/${currentSession._id}/messages`);
        setMessages(data);
      } catch (err) {
        console.log('No history');
      }
    };

    init();

    return () => {
      socket.off('code-update');
      socket.off('language-update');
      socket.off('receive-message');
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-ice-candidate');
      if (pcRef.current) pcRef.current.close();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [sessionId, user, navigate]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEditorChange = (value) => {
    if (!session) return;
    setCode(value);
    socket.emit('code-change', { sessionId: session.sessionCode, code: value });
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socket.emit('language-change', { sessionId: session.sessionCode, language: newLang });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !session) return;

    const messageData = {
      sessionId: session.sessionCode,
      sessionDbId: session._id,
      senderId: user._id,
      senderName: user.name,
      message: messageInput,
      timestamp: new Date().toISOString(),
    };

    socket.emit('send-message', messageData);
    setMessages((prev) => [...prev, messageData]);
    setMessageInput('');
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  const handleCopyCode = () => {
    if (session) {
      navigator.clipboard.writeText(session.sessionCode);
      alert('Session code copied!');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f1f5f9] text-slate-900 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shadow-sm relative z-20">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Code size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Session Space</h2>
            <div className="flex items-center gap-2 group cursor-pointer" onClick={handleCopyCode}>
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
        {/* Editor Area (Left) */}
        <div className="flex-1 flex flex-col border-r border-slate-200 bg-white shadow-inner">
           <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-4">
                 <select 
                    value={language}
                    onChange={handleLanguageChange}
                    className="bg-transparent text-[11px] font-bold text-slate-600 focus:outline-none uppercase"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                  </select>
              </div>
              <div className="text-[10px] text-slate-400 font-mono italic">live_sync_active.v1</div>
           </div>
           <div className="flex-1 relative">
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
                padding: { top: 20 },
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 22,
              }}
            />
          </div>
        </div>

        {/* Sidebar (Right: Video at top, Chat taking rest) */}
        <div className="w-[380px] flex flex-col bg-white overflow-hidden">
          {/* Video Streams Section */}
          <div className="p-4 flex flex-col gap-3 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative bg-slate-200 rounded-2xl overflow-hidden aspect-video shadow-sm border border-white">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/80 backdrop-blur rounded text-[9px] font-bold text-slate-800">ME</div>
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <button onClick={toggleMic} className={`p-1.5 rounded-lg ${isMicOn ? 'bg-white/80' : 'bg-rose-500 text-white'}`}><Mic size={12} /></button>
                  <button onClick={toggleVideo} className={`p-1.5 rounded-lg ${isVideoOn ? 'bg-white/80' : 'bg-rose-500 text-white'}`}><VideoIcon size={12} /></button>
                </div>
              </div>

              <div className="relative bg-slate-200 rounded-2xl overflow-hidden aspect-video shadow-sm border border-white flex items-center justify-center">
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className={`w-full h-full object-cover ${remoteStream ? 'opacity-100' : 'opacity-0'}`}
                />
                {!remoteStream && <Users size={20} className="text-slate-400 animate-pulse" />}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 rounded text-[9px] font-bold text-white uppercase">Peer</div>
              </div>
            </div>
          </div>

          {/* Chat System (Expanded Space) */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Discussion</h3>
               <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                  <MessageSquare size={32} strokeWidth={1.5} className="mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No messages yet</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.senderId === user?._id ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-[13px] max-w-[85%] shadow-sm ${
                    msg.senderId === user?._id 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                  }`}>
                    {msg.message}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase px-1">
                    <span>{msg.senderName}</span>
                    <span className="text-[8px] opacity-60 font-normal">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="relative group">
                <input
                  type="text"
                  placeholder="Type message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all placeholder:text-slate-400"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all active:scale-90 disabled:opacity-20 shadow-md shadow-indigo-200"
                  disabled={!messageInput.trim()}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Room;
