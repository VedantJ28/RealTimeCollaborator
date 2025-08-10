import { Server } from 'socket.io';
import registerSocketHandlers from './handlers.js';
import dotenv from 'dotenv';
dotenv.config();

export default function attachSocket(server, options = {}) {
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', methods: ['GET', 'POST'] },
    ...options,
  });

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    registerSocketHandlers(io, socket);
  });

  return io;
}