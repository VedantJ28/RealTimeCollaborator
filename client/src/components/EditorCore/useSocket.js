// ...existing code...
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

// change base url if your server runs elsewhere
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export default function useSocket(roomId, displayName) {
  const socketRef = useRef(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [roomState, setRoomState] = useState(null);

  useEffect(() => {
    if (!roomId) return; // guard until we have a roomId
    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('socket connected', socket.id);
      socket.emit('join-room', { roomId, name: displayName });
      socket.emit('request-room-state', { roomId });
    });

    socket.on('room-state', (state) => {
      setRoomState(state);
      if (state?.users) setConnectedUsers(state.users);
      if (Array.isArray(state?.messages)) setChatMessages(state.messages);
    });

    socket.on('user-joined', ({ id, name }) => {
      setConnectedUsers((prev) => {
        if (prev.find((u) => u.id === id)) return prev;
        return [...prev, { id, name }];
      });
      setChatMessages((m) => [...m, { system: true, text: `${name} joined` }]);
    });

    socket.on('user-left', ({ id, name }) => {
      setConnectedUsers((prev) => prev.filter((u) => u.id !== id));
      setChatMessages((m) => [...m, { system: true, text: name ? `${name} left` : 'A user left' }]);
    });

    socket.on('chat-message', (m) => setChatMessages((c) => [...c, m]));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, displayName]);

  const emitChat = (text) => {
    if (!socketRef.current || !roomId) return;
    const msg = { roomId, message: text, name: displayName, ts: Date.now() };
    socketRef.current.emit('chat-message', msg);
    // setChatMessages((c) => [...c, { name: displayName, message: text }]);
  };

  const emitCodeChange = (payload) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('code-change', { roomId, ...payload });
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      return true;
    } catch {
      return false;
    }
  };

  const leaveRoom = () => {
    if (socketRef.current) socketRef.current.disconnect();
  };

  return {
    socketRef,
    connectedUsers,
    chatMessages,
    roomState,
    emitChat,
    emitCodeChange,
    copyRoomId,
    leaveRoom,
  };
}