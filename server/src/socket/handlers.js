import * as roomService from '../services/roomServices.js';
import dotenv from 'dotenv';
dotenv.config();

const ROOM_TTL = Number(process.env.ROOM_TTL || 3600);

export default function registerSocketHandlers(io, socket) {
  // join-room
  socket.on('join-room', async ({ roomId, name }) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.name = name || 'Anonymous';

    try {
      await roomService.addUserToRoom(roomId, socket.id, socket.data.name);
      const users = await roomService.getUsersInRoom(roomId);
      const content = await roomService.getContent(roomId);
      const language = await roomService.getLanguage(roomId);
      const messages = await roomService.getRecentMessages(roomId, 50);

      socket.emit('room-state', { content, language, users, messages });
      socket.to(roomId).emit('user-joined', { id: socket.id, name: socket.data.name });
    } catch (err) {
      console.error('join-room error', err);
    }
  });

  socket.on('request-room-state', async ({ roomId }) => {
    if (!roomId) return;
    try {
      const users = await roomService.getUsersInRoom(roomId);
      const content = await roomService.getContent(roomId);
      const language = await roomService.getLanguage(roomId);
      const messages = await roomService.getRecentMessages(roomId, 50);
      socket.emit('room-state', { content, language, users, messages });
    } catch (err) {
      console.error('request-room-state error', err);
    }
  });

  socket.on('chat-message', async (payload) => {
    const { roomId, message, name, ts } = payload || {};
    if (!roomId || !message) return;
    const msg = { roomId, message, name: name || socket.data.name || 'Anonymous', ts: ts || Date.now() };
    try {
      await roomService.pushMessage(roomId, msg);
      io.to(roomId).emit('chat-message', msg);
    } catch (err) {
      console.error('chat-message error', err);
    }
  });

  socket.on('code-change', async (payload) => {
    const { roomId, content, language, ts } = payload || {};
    if (!roomId) return;
    try {
      if (typeof content === 'string') await roomService.saveContent(roomId, content);
      if (language) await roomService.saveLanguage(roomId, language);
      io.to(roomId).emit('code-change', { content, language, ts, from: socket.id });
    } catch (err) {
      console.error('code-change error', err);
    }
  });

  socket.on('disconnecting', async () => {
    try {
      const rooms = Array.from(socket.rooms);
      for (const roomId of rooms) {
        if (roomId === socket.id) continue;
        await roomService.removeUserFromRoom(roomId, socket.id);
        socket.to(roomId).emit('user-left', { id: socket.id, name: socket.data.name });

        const remaining = await roomService.roomUserCount(roomId);
        if (remaining === 0) {
          // set TTL to room keys
          await roomService.setRoomTTL(roomId, ROOM_TTL);
          // Optional immediate delete: await roomService.deleteRoom(roomId);
          console.log(`room ${roomId} became empty — set TTL ${ROOM_TTL}s`);
        }
      }
    } catch (err) {
      console.error('disconnecting error', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
}