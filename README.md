<div align="center">

# 🎓 MentorConnect

### **1-on-1 Mentorship Platform**

*Real-time collaborative coding with video calling, chat, and multi-language code execution*

---

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Enabled-333333?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org/)

</div>

---

## 📖 Project Description

**MentorConnect** is a full-stack, real-time 1-on-1 mentorship platform that brings together **video calling**, **live collaborative coding**, **instant messaging**, and **multi-language code execution** — all within a single browser-based session.

### The Problem It Solves

Traditional mentorship platforms either provide video calling OR code sharing — never both seamlessly. Developers need a unified workspace where a mentor can:
- **See** the student's face and read their expressions
- **Watch** them code in real-time, character by character
- **Run** their code instantly to demonstrate outputs
- **Chat** to share links, snippets, and notes — all persisted

### Who It's For

| Role | Use Case |
|------|----------|
| **Mentors** | Conduct live coding sessions, review code, teach concepts interactively |
| **Students** | Get hands-on guidance, pair program, and learn in real-time |
| **Teams** | Quick pair programming sessions, code reviews, technical interviews |

### What Makes It Different

- **Zero setup** — No downloads, no plugins. Works entirely in the browser
- **14 programming languages** — Execute JavaScript, Python, Java, C++, Rust, Go, and more
- **Perfect Negotiation** — Industry-standard WebRTC pattern for stable video connections
- **Persistent chat** — Messages are saved to the database and restored when you rejoin
- **Session-based architecture** — Unique shareable codes like `abc-def-ghi` for instant access

---

## 🚀 Features

### Core Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JWT-based register/login with bcrypt password hashing |
| 📋 **Session Management** | Create sessions with unique codes, join via code, track active/ended status |
| 🎥 **Video Calling** | Peer-to-peer WebRTC video/audio with mic and camera toggle controls |
| 💻 **Live Code Editor** | Monaco Editor (VS Code engine) with real-time character-by-character sync |
| 💬 **Chat System** | Real-time messaging with persistent history stored in MongoDB |
| ⚡ **Code Execution** | Run code in 14 languages via server-side Piston API proxy |
| 🔄 **Real-time Sync** | Code changes, language switches, and execution results sync across peers |

### Advanced Features

| Feature | Description |
|---------|-------------|
| 🧩 **Modular Hook Architecture** | Custom React hooks (`useWebRTC`, `useCodeExecution`) for clean separation of concerns |
| 📦 **Lazy Loading** | Route-level code splitting with React.lazy and Suspense for fast initial loads |
| 🛡️ **Perfect Negotiation** | WebRTC signaling pattern that handles offer collisions gracefully |
| 🔁 **ICE Candidate Queuing** | Candidates are queued until remote description is set, preventing race conditions |
| 🌐 **Backend Execution Proxy** | Server-side proxy to Piston API avoids browser CORS/auth issues |
| 🔒 **Protected Routes** | JWT middleware guards all API endpoints and frontend routes |

### Supported Languages (14 — All Tested & Verified)

```
 JavaScript    TypeScript    Python    Java      C++      C       Ruby
 Go            Rust          PHP       Swift     Kotlin   C#      Bash
```

---

## 🧠 Tech Stack

```
┌──────────────────────────────────────────────────────────────────────┐
│                         TECH STACK                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Frontend:                    Backend:                                │
│  ├── React 19                 ├── Node.js                            │
│  ├── Vite 8                   ├── Express.js 5                       │
│  ├── Tailwind CSS 4           ├── Socket.IO 4.8                      │
│  ├── Monaco Editor            ├── Mongoose (MongoDB ODM)             │
│  ├── Zustand (State)          ├── JWT (jsonwebtoken)                 │
│  ├── Axios (HTTP Client)      ├── Bcrypt (Password Hashing)          │
│  ├── Lucide React (Icons)     └── Axios (Piston API Proxy)           │
│  └── Socket.IO Client                                                │
│                                                                      │
│  Database:                    Real-time:                              │
│  └── MongoDB Atlas            ├── WebSockets (Socket.IO)             │
│                               ├── WebRTC (Peer-to-Peer Video)        │
│  Code Execution:              └── STUN Servers (Google)              │
│  └── Piston API V1                                                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────┐  ┌────────────────┐   │
│  │  React App  │  │ Monaco Editor│  │  Video   │  │   Chat Panel   │   │
│  │  (Vite)     │  │  (Code Sync) │  │ (WebRTC) │  │  (Socket.IO)   │   │
│  └──────┬──────┘  └──────┬───────┘  └────┬─────┘  └───────┬────────┘   │
│         │                │               │                 │            │
│         │    ┌───────────┴───────────────┴─────────────────┘            │
│         │    │           Socket.IO Client                               │
│         │    └───────────────────┬──────────────────────────            │
└─────────┼────────────────────────┼──────────────────────────────────────┘
          │ HTTP/REST              │ WebSocket
          │ (Axios)               │ (Socket.IO)
          ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SERVER (Node.js)                              │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────────────┐    │
│  │   Express    │  │   Socket.IO      │  │   Piston Proxy         │    │
│  │   REST API   │  │   Event Handler  │  │   /api/execute         │    │
│  │              │  │                  │  │                        │    │
│  │  /api/auth/* │  │  join-room       │  │  POST → emkc.org       │    │
│  │  /api/sess/* │  │  code-change     │  │  (V1 API)              │    │
│  │  /api/exec   │  │  send-message    │  └────────────────────────┘    │
│  └──────┬───────┘  │  webrtc-offer    │                                │
│         │          │  webrtc-answer    │                                │
│         │          │  webrtc-ice-cand  │                                │
│         │          └──────────────────┘                                 │
│         ▼                                                               │
│  ┌──────────────┐                                                       │
│  │  MongoDB     │  Collections: users, sessions, messages               │
│  │  Atlas       │                                                       │
│  └──────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────┐
                    │   WebRTC Peer-to-Peer   │
                    │   (Direct Video/Audio)  │
                    │                         │
                    │  Browser A ◄──────────► Browser B
                    │        (via STUN Servers)│
                    └─────────────────────────┘
```

### Key Architectural Decisions

1. **WebRTC for Video** — Peer-to-peer connections reduce server load; video/audio never touches the server
2. **Socket.IO for Signaling** — Used as both the WebRTC signaling channel AND the real-time data sync layer
3. **Server-Side Execution Proxy** — Code is not executed in the browser; it's sent to the backend which proxies to Piston API, eliminating CORS and credential leakage issues
4. **Zustand for State** — Lightweight alternative to Redux for auth state management with localStorage persistence
5. **Monaco Editor** — The same editor engine that powers VS Code, providing IntelliSense and syntax highlighting

---

## 🔄 Application Flow

### Mentor Flow

```
1. Register/Login
   └──► Dashboard
        └──► Click "Create Session"
             └──► Unique code generated (e.g., abc-def-ghi)
                  └──► Share code with student
                       └──► Wait for student to join
                            └──► Session starts (Video + Code + Chat)
```

### Student Flow

```
1. Register/Login
   └──► Dashboard
        └──► Enter session code
             └──► Click "Join Session"
                  └──► Redirected to room
                       └──► Session starts (Video + Code + Chat)
```

### Inside a Session

```
┌──────────────────────────────────────────────────────────┐
│                    SESSION ROOM                          │
│                                                          │
│  ┌────────────────────────┐  ┌────────────────────────┐  │
│  │                        │  │  📹 Local    📹 Remote │  │
│  │    Monaco Code Editor  │  │  Video       Video     │  │
│  │    (Live Synced)       │  │                        │  │
│  │                        │  ├────────────────────────┤  │
│  │  [Language ▼] [▶ Run]  │  │                        │  │
│  │                        │  │   💬 Chat Messages     │  │
│  ├────────────────────────┤  │   (Persistent)         │  │
│  │  ⬛ Output Console     │  │                        │  │
│  │  (Execution Results)   │  │  [Send a message... ▶] │  │
│  └────────────────────────┘  └────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**What Syncs in Real-Time:**
- ✅ Code changes (character-by-character)
- ✅ Language selection changes
- ✅ Code execution results
- ✅ Chat messages
- ✅ Video and audio streams

---

## 🗄️ Database Schema

### Collections Overview

```
MongoDB Atlas
├── users          – Registered user accounts
├── sessions       – Mentorship session records
└── messages       – Chat message history
```

### `users` Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated unique identifier |
| `name` | String | User's display name (required) |
| `email` | String | Unique email address (required) |
| `password` | String | Bcrypt-hashed password (required) |
| `role` | String | `"mentor"` \| `"student"` \| `"user"` (default: `"user"`) |
| `createdAt` | Date | Account creation timestamp |

**Security:** Passwords are hashed with bcrypt (salt rounds: 10) via a Mongoose `pre('save')` middleware. Raw passwords are **never stored**.

### `sessions` Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated unique identifier |
| `mentorId` | ObjectId → User | Reference to the session creator (required) |
| `sessionCode` | String | Unique shareable code like `abc-def-ghi` (required, unique) |
| `studentId` | ObjectId → User | Reference to the joining student (default: `null`) |
| `status` | String | `"active"` \| `"ended"` (default: `"active"`) |
| `createdAt` | Date | Session creation timestamp |

**Session Code Format:** 9-character alphanumeric code in the pattern `xxx-xxx-xxx`, generated using `crypto`-based random selection.

### `messages` Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated unique identifier |
| `sessionId` | ObjectId → Session | Reference to the parent session (required) |
| `senderId` | ObjectId → User | Reference to the message sender (required) |
| `message` | String | Message content (required) |
| `timestamp` | Date | When the message was sent |

### Entity Relationship

```
┌──────────┐       1:N       ┌──────────────┐       1:N       ┌──────────────┐
│  users   │ ◄──────────────►│   sessions   │ ◄──────────────►│   messages   │
│          │  mentorId        │              │  sessionId       │              │
│  _id     │  studentId       │  _id         │                 │  _id         │
│  name    │                  │  mentorId    │                 │  sessionId   │
│  email   │                  │  studentId   │                 │  senderId    │
│  password│                  │  sessionCode │                 │  message     │
│  role    │                  │  status      │                 │  timestamp   │
└──────────┘                  └──────────────┘                 └──────────────┘
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate and receive JWT token |

#### `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "Mohammed Ansari",
  "email": "mohammed@example.com",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "name": "Mohammed Ansari",
  "email": "mohammed@example.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "mohammed@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):** Same structure as register response.

---

### Sessions

All session endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/sessions/create` | Private | Create a new mentorship session |
| `POST` | `/api/sessions/join` | Private | Join a session using a session code |
| `GET` | `/api/sessions/:id` | Private | Get session details by ID or code |

#### `POST /api/sessions/create`

**Success Response (201):**
```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c0e",
  "mentorId": "665f1a2b3c4d5e6f7a8b9c0d",
  "sessionCode": "abc-def-ghi",
  "studentId": null,
  "status": "active",
  "createdAt": "2026-03-20T10:30:00.000Z"
}
```

#### `POST /api/sessions/join`

**Request Body:**
```json
{
  "code": "abc-def-ghi"
}
```

---

### Code Execution

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/execute` | Public | Execute code in any supported language |

#### `POST /api/execute`

**Request Body:**
```json
{
  "language": "python",
  "version": "3.10.0",
  "files": [{ "content": "print('Hello, World!')" }]
}
```

**Success Response (200):**
```json
{
  "run": {
    "output": "Hello, World!\n",
    "stderr": ""
  },
  "language": "python3",
  "version": "3.10.0"
}
```

---

### Messages

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/sessions/:id/messages` | Public | Get chat history for a session |

---

## ⚡ Socket Events

### Room Management

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join-room` | Client → Server | `{ sessionId }` | Join a session room |
| `peer-joined` | Server → Client | `{ userId }` | Notify others a peer joined |
| `disconnect` | Automatic | — | Socket disconnection handling |

### Code Editor Sync

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `code-change` | Client → Server | `{ sessionId, code }` | Send code changes |
| `code-update` | Server → Client | `code` (string) | Receive code changes |
| `language-change` | Client → Server | `{ sessionId, language }` | Send language switch |
| `language-update` | Server → Client | `language` (string) | Receive language switch |
| `code-execution-result` | Client → Server | `{ sessionId, result }` | Share execution output |
| `execution-update` | Server → Client | `result` (string) | Receive execution output |

### Chat System

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `send-message` | Client → Server | `{ sessionId, sessionDbId, senderId, senderName, message, timestamp }` | Send a message |
| `receive-message` | Server → Client | Same as above | Receive a message |

### WebRTC Signaling

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `webrtc-offer` | Bidirectional | `{ sessionId, sdp }` | Send/receive SDP offer |
| `webrtc-answer` | Bidirectional | `{ sessionId, sdp }` | Send/receive SDP answer |
| `webrtc-ice-candidate` | Bidirectional | `{ sessionId, candidate }` | Exchange ICE candidates |

---

## 🎥 WebRTC Implementation

This is the most technically complex part of the system. Here's how peer-to-peer video calling works:

### Overview

WebRTC enables direct browser-to-browser video and audio communication **without** sending media through the server. The server is only used for **signaling** (exchanging connection metadata).

### Step-by-Step Flow

```
        Browser A (Mentor)                    Server (Socket.IO)                Browser B (Student)
              │                                      │                                │
              │  1. getUserMedia()                    │                                │
              │  (Camera + Mic access)                │                                │
              │                                      │                                │
              │  2. join-room ────────────────►       │                                │
              │                                      │   ◄──────────── join-room  3.   │
              │                                      │                                │
              │   ◄──────────── peer-joined ─────────│─────── peer-joined ──────►     │
              │                                      │                                │
              │  4. createOffer()                     │                                │
              │  setLocalDescription(offer)           │                                │
              │  webrtc-offer ────────────────►       │ ───── webrtc-offer ──────►     │
              │                                      │                                │
              │                                      │   5. setRemoteDescription(offer)│
              │                                      │      createAnswer()             │
              │                                      │      setLocalDescription(answer)│
              │   ◄──────── webrtc-answer ───────────│──── webrtc-answer ◄────────    │
              │                                      │                                │
              │  6. setRemoteDescription(answer)      │                                │
              │                                      │                                │
              │  7. ICE Candidates ◄──────────────────┼────────────────────►           │
              │     (Exchanged via Socket.IO)         │                                │
              │                                      │                                │
              │  8. ◄═══════════ DIRECT P2P VIDEO/AUDIO ═══════════════►              │
              │     (Media flows directly,            │                                │
              │      bypasses the server)             │                                │
```

### Key Implementation Details

#### 1. Media Access (`getUserMedia`)
```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});
```

#### 2. RTCPeerConnection Setup
```javascript
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
});
```

**STUN servers** are used to discover the public IP address and port of each peer, enabling them to communicate through NATs and firewalls.

#### 3. Perfect Negotiation Pattern

Instead of a naive "create offer → set answer" flow (which fails when both peers try to negotiate simultaneously), we implement the **Perfect Negotiation** pattern:

```javascript
// On negotiation needed (automatic when tracks are added)
pc.onnegotiationneeded = async () => {
  makingOffer = true;
  await pc.setLocalDescription();  // Implicit offer creation
  socket.emit('webrtc-offer', { sessionId, sdp: pc.localDescription });
  makingOffer = false;
};

// On receiving an offer
socket.on('webrtc-offer', async ({ sdp }) => {
  const offerCollision = (sdp.type === 'offer') &&
    (makingOffer || pc.signalingState !== 'stable');

  // "Polite" peer yields to the other's offer during collision
  if (ignoreOffer) return;

  await pc.setRemoteDescription(sdp);
  if (sdp.type === 'offer') {
    await pc.setLocalDescription(); // Implicit answer creation
    socket.emit('webrtc-answer', { sessionId, sdp: pc.localDescription });
  }
});
```

#### 4. ICE Candidate Queuing

ICE candidates may arrive before the remote description is set. We queue them and flush after `setRemoteDescription`:

```javascript
// Queue if remote description not yet set
if (pc.remoteDescription?.type) {
  await pc.addIceCandidate(candidate);
} else {
  candidatesQueue.push(candidate);
}

// Flush queue after setRemoteDescription
while (candidatesQueue.length > 0) {
  await pc.addIceCandidate(candidatesQueue.shift());
}
```

#### 5. Connection Recovery

```javascript
pc.onconnectionstatechange = () => {
  if (pc.connectionState === 'failed') {
    pc.restartIce(); // Automatic ICE restart
  }
};
```

---

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB Atlas** account (free tier works)
- **Git**

### Clone the Repository

```bash
git clone https://github.com/MohammedAnsari123/Project-6---1-on-1-Mentorship-Platform-with-Shared-Code-Editor-Video-Chat.git
cd "Project 6 - 1-on-1 Mentorship Platform with Shared Code Editor + Video + Chat"
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
```

Start the backend server:
```bash
npm run dev
# or
nodemon server.js
```

### Frontend Setup

```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `PORT` | Backend `.env` | Server port (default: 5000) |
| `MONGO_URI` | Backend `.env` | MongoDB Atlas connection string |
| `JWT_SECRET` | Backend `.env` | Secret key for JWT token signing |

---

## 📁 Project Structure

```
📦 Project Root
├── 📂 backend/
│   ├── 📂 config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── generateToken.js       # JWT token generation
│   ├── 📂 controllers/
│   │   ├── authController.js      # Register & Login logic
│   │   └── sessionController.js   # Create, Join, Get sessions
│   ├── 📂 middleware/
│   │   └── authMiddleware.js      # JWT verification guard
│   ├── 📂 models/
│   │   ├── userModel.js           # User schema + bcrypt hooks
│   │   ├── sessionModel.js        # Session schema
│   │   └── messageModel.js        # Message schema
│   ├── 📂 routes/
│   │   ├── authRoutes.js          # /api/auth/* endpoints
│   │   └── sessionRoutes.js       # /api/sessions/* endpoints
│   ├── 📂 utils/
│   │   └── generateCode.js        # Session code generator (xxx-xxx-xxx)
│   ├── server.js                  # Entry point: Express + Socket.IO + Piston Proxy
│   ├── package.json
│   └── .env                       # Environment variables (not committed)
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 hooks/
│   │   │   ├── useWebRTC.js       # WebRTC Perfect Negotiation hook
│   │   │   └── useCodeExecution.js # Piston API execution hook
│   │   ├── 📂 lib/
│   │   │   ├── api.js             # Axios instance + JWT interceptor
│   │   │   ├── socket.js          # Socket.IO client configuration
│   │   │   └── webrtc.js          # RTCPeerConnection factory
│   │   ├── 📂 pages/
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Register.jsx       # Registration page
│   │   │   ├── Dashboard.jsx      # Session create/join dashboard
│   │   │   └── Room.jsx           # Main session room (Editor + Video + Chat)
│   │   ├── 📂 store/
│   │   │   └── useAuthStore.js    # Zustand auth state management
│   │   ├── App.jsx                # Router + Lazy loading + Protected routes
│   │   └── main.jsx               # React DOM entry point
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🌐 Deployment

### Frontend — Vercel

```bash
cd frontend
npm run build
# Deploy the `dist/` folder to Vercel
```

Set environment variables on Vercel:
- `VITE_API_URL` → Your deployed backend URL

### Backend — Render / Railway

```bash
cd backend
# Push to GitHub → Connect to Render/Railway
# Set build command: npm install
# Set start command: node server.js
```

Set environment variables on Render/Railway:
- `PORT` → 5000 (or auto-assigned)
- `MONGO_URI` → Your MongoDB Atlas connection string
- `JWT_SECRET` → Your secret key

---

## 📸 Screenshots

### Login Page
> Clean authentication interface with role selection

### Dashboard
> Session management — create new sessions or join existing ones via code

### Session Room
> The full coding environment with split-screen layout:
> - **Left:** Monaco code editor with language selector and run button
> - **Right:** Video feeds (local + remote) and persistent chat
> - **Bottom:** Terminal output console for code execution results

---

## ⚠️ Known Limitations

| Limitation | Reason |
|-----------|--------|
| **1-on-1 only** | Architecture designed for two participants per session |
| **No screen sharing** | WebRTC `getDisplayMedia` not yet implemented |
| **No session recording** | Media streams are peer-to-peer and not captured server-side |
| **No file uploads** | Code is typed directly in the editor, no file import/export |
| **Rate-limited execution** | Piston V1 API limits to ~2 requests/second |
| **STUN servers only** | No TURN server fallback for restrictive network environments |

---

## 🧪 Future Improvements

- [ ] **AI Code Assistant** — Integrate LLM-powered code suggestions and explanations
- [ ] **Screen Sharing** — Add `getDisplayMedia` support for screen sharing alongside camera
- [ ] **Session Recording** — Record and replay mentorship sessions
- [ ] **Multi-User Sessions** — Extend to group coding sessions (3+ participants)
- [ ] **TURN Server** — Add TURN relay for users behind strict firewalls/NATs
- [ ] **Code Snapshots** — Save and restore code snapshots within a session
- [ ] **File System** — Multi-file editor with file tree navigation
- [ ] **Drawing Whiteboard** — Shared whiteboard for diagrams and explanations
- [ ] **Dark Mode** — Toggle between light and dark editor/UI themes
- [ ] **Mobile Responsive** — Optimize layout for tablet and mobile screens

---

## 📚 Learning Outcomes

Building this project provided deep hands-on experience with:

| Area | What Was Learned |
|------|-----------------|
| **WebRTC** | Peer-to-peer connections, SDP offer/answer exchange, ICE candidate negotiation, Perfect Negotiation pattern, STUN servers |
| **Real-time Systems** | Socket.IO event architecture, room-based broadcasting, real-time state synchronization across clients |
| **Authentication** | JWT token generation and verification, bcrypt password hashing, protected route middleware patterns |
| **State Management** | Zustand stores with localStorage persistence, React hooks for complex async state (useWebRTC, useCodeExecution) |
| **Code Architecture** | Custom hook patterns, separation of concerns, modular component design, lazy loading for performance |
| **External APIs** | Piston V1 API integration, server-side proxy patterns to avoid CORS, multi-language code execution |
| **Database Design** | MongoDB schema design with Mongoose, document references (ObjectId), indexing with unique constraints |

---

## 👨‍💻 Author

<div align="center">

**Mohammed Ansari**

*Full-Stack Developer*

[![GitHub](https://img.shields.io/badge/GitHub-MohammedAnsari123-181717?style=for-the-badge&logo=github)](https://github.com/MohammedAnsari123)

</div>

---

## 📄 License

```
MIT License

Copyright (c) 2026 Mohammed Ansari

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**Built with ❤️ by Mohammed Ansari**

*If you found this project helpful, please ⭐ this repository!*

</div>
