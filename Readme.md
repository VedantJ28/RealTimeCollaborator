# CodeColab

Real‑time collaborative code editing platform with multi-user chat, language synchronization, and ephemeral room lifecycle backed by Redis.

> NOTE: Remove any real credentials (e.g. the committed Redis URL in `server/.env`) before publishing this repository publicly.

---

## Contents

- [Description](#description)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Architecture Overview](#architecture-overview)
- [Directory Structure](#directory-structure)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Development Scripts](#development-scripts)
- [Server Endpoints & Socket Events](#server-endpoints--socket-events)
- [Data Persistence (Redis Keys)](#data-persistence-redis-keys)
- [Code References](#code-references)
- [Security / Production Notes](#security--production-notes)
- [Roadmap](#roadmap)
- [License](#license)

---

## Description

CodeColab lets users:
1. Create or join a room via a sharable Room ID.
2. Collaboratively edit code in real time (Monaco Editor).
3. Chat with participants.
4. See connected users & adjust per-user editor settings.
5. Persist code, language choice, and recent chat history in Redis while rooms are active; automatically expire empty rooms.

---

## Tech Stack

**Client**
- React (Vite)
- React Router
- Monaco Editor (`@monaco-editor/react`)
- Tailwind CSS
- Socket.IO Client

**Server**
- Node.js / Express
- Socket.IO
- Redis (via `ioredis`)
- Dotenv

**Infrastructure**
- Redis (remote or local)
- Optional deployment targets: Vercel (client), Render/Fly.io/EC2 (server), Redis Cloud.

---

## Key Features

- Real-time code sync (broadcast differential state via events).
- Multi-user chat with system join/leave notifications.
- Language synchronization across clients.
- Editor customization (theme, font size, tab size, minimap, wrap, line numbers).
- Resizable / collapsible side panel with keyboard shortcuts.
- Clipboard copy for Room ID & message content.
- Room lifecycle:
  - Users tracked per room.
  - Auto TTL applied when last user leaves (`ROOM_TTL`).
- Recent chat message retention (FIFO capped list).
- Graceful reconnect state restoration (`request-room-state`).

---

## Architecture Overview

```
Client (React) ---- Socket.IO ----> Server (Express + Socket.IO) ----> Redis
     |                                                          (state: code, users, lang, chat)
     └---- REST (health) -------------------------------------->
```

Flow:
1. Client generates or inputs `roomId`, sends `join-room`.
2. Server adds user (hash), replies with `room-state`.
3. Code & chat changes emit events that persist to Redis and rebroadcast.
4. On disconnect, user removed; empty rooms get TTL.

---

## Directory Structure

```
client/
  src/
    pages/ (HomePage, EditorPage)
    components/EditorCore/
      useSocket.js
      Editor.jsx
      SidePanel/ (Chat, Users, Settings)
server/
  src/
    app.js
    index.js
    socket/ (index.js, handlers.js)
    services/ (roomServices.js)
    utils/ (keys.js)
    lib/ (redisClient.js)
```

---

## Environment Variables

### Server (`server/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP server port | 4000 |
| `REDIS_URL` | Redis connection string | `redis://127.0.0.1:6379` |
| `ROOM_TTL` | Seconds to keep room data after last user leaves | 3600 |
| `FRONTEND_ORIGIN` | Allowed CORS origin for Socket.IO | `http://localhost:5173` |

### Client (`client/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SERVER_URL` | Base URL of the Socket.IO server | `http://localhost:4000` |

---

## Installation & Setup

### Prerequisites
- Node.js (>= 18 recommended)
- Redis instance (local or cloud)

### 1. Clone
```bash
git clone <repo-url>
cd CodeColab
```

### 2. Setup Server
```bash
cd server
cp .env.example .env   # (create one if not present)
npm install
npm run dev
```

### 3. Setup Client
```bash
cd ../client
cp .env.example .env   # (create one if not present)
npm install
npm run dev
```

Open: http://localhost:5173

### 4. Redis (local)
```bash
redis-server
```
Ensure `REDIS_URL` matches your environment.

---

## Development Scripts

| Location | Script | Purpose |
|----------|--------|---------|
| `server` | `npm run dev` | Start server with nodemon |
| `server` | `npm start` | Start server (production mode) |
| `client` | `npm run dev` | Vite dev server |
| `client` | `npm run build` | Production build |
| `client` | `npm run preview` | Preview production bundle |

---

## Server Endpoints & Socket Events

### REST
- `GET /health` → `{ ok: true }`
- `GET /` → simple text response.

### Socket Events (Client ⇄ Server)
| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join-room` | emit | `{ roomId, name }` | Join a room, register user |
| `request-room-state` | emit | `{ roomId }` | Re-fetch current state |
| `room-state` | receive | `{ content, language, users, messages }` | Initial sync snapshot |
| `user-joined` | receive | `{ id, name }` | New participant joined |
| `user-left` | receive | `{ id, name }` | A participant left |
| `chat-message` | both | `{ roomId, message, name, ts }` | Chat message broadcast |
| `code-change` | both | `{ roomId, content?, language?, ts?, from? }` | Code or language update |

See implementation: [`registerSocketHandlers`](server/src/socket/handlers.js)

---

## Data Persistence (Redis Keys)

Defined in [`roomContentKey`](server/src/utils/keys.js), [`roomLangKey`](server/src/utils/keys.js), [`roomUsersKey`](server/src/utils/keys.js), [`roomMessagesKey`](server/src/utils/keys.js):

| Key Pattern | Type | Contents |
|-------------|------|----------|
| `room:{id}:content` | string | Latest code text |
| `room:{id}:language` | string | Active language |
| `room:{id}:users` | hash | `socketId -> name` |
| `room:{id}:messages` | list | JSON messages (LPUSH, capped) |

Room TTL applied via [`setRoomTTL`](server/src/services/roomServices.js) once last user disconnects.

---

## Code References

Core server logic:
- Socket init: [`attachSocket`](server/src/socket/index.js)
- Event handlers: [`registerSocketHandlers`](server/src/socket/handlers.js)
- Redis service API: [`addUserToRoom`](server/src/services/roomServices.js), [`getContent`](server/src/services/roomServices.js), [`saveLanguage`](server/src/services/roomServices.js), [`pushMessage`](server/src/services/roomServices.js)

Client side:
- Socket hook: [`useSocket`](client/src/components/EditorCore/useSocket.js)
- Main editor wrapper: [`EditorCore`](client/src/components/EditorCore/index.jsx)
- Code editor: [`CodeEditor`](client/src/components/EditorCore/Editor.jsx)
- Side panel tabs: [`SidePanel`](client/src/components/EditorCore/SidePanel/SidePanel.jsx)
- Chat UI: [`Chat`](client/src/components/EditorCore/SidePanel/Chat.jsx)
- Settings: [`Settings`](client/src/components/EditorCore/SidePanel/Settings.jsx)

---

## Security / Production Notes

- Do not commit real secrets to VCS (`REDIS_URL`, tokens).
- Restrict CORS / Socket.IO origins (`FRONTEND_ORIGIN`).
- Consider rate limiting message & code events (spam / abuse prevention).
- Add authentication layer (JWT or session) before exposing publicly.
- Validate & sanitize user-sent text (avoid injection in future features).
- Use Redis ACLs or network isolation for production Redis.

---

## Roadmap

- Presence indicators (cursor positions & selections).
- Operational transforms or CRDT for granular conflict resolution.
- File system (multi-file projects).
- Syntax-aware formatting & lint diagnostics sharing.
- Execution sandbox / runner per selected language.
- Theming + user profiles.
- Persistent (non-TTL) rooms with explicit deletion.

---

## License

Specify a license (e.g. MIT) in this section.

---

## Quick Start (TL;DR)

```bash
# Terminal 1
cd server && npm i && npm run dev

# Terminal 2
cd client && npm i && npm run dev

# Visit
http://localhost:5173
```

Create a room (leave Room ID empty), share the generated ID, and start collaborating.

---

Happy Collaborating !!!