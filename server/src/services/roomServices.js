import redis from '../lib/redisClient.js';
import { roomContentKey, roomLangKey, roomUsersKey, roomMessagesKey } from '../utils/keys.js';

const ROOM_MESSAGES_LIMIT = 200;

export async function addUserToRoom(roomId, socketId, name) {
  await redis.hset(roomUsersKey(roomId), socketId, name);
  await redis.persist(roomUsersKey(roomId));
}

export async function removeUserFromRoom(roomId, socketId) {
  await redis.hdel(roomUsersKey(roomId), socketId);
}

export async function getUsersInRoom(roomId) {
  const usersHash = await redis.hgetall(roomUsersKey(roomId));
  return Object.entries(usersHash).map(([id, name]) => ({ id, name }));
}

export async function saveContent(roomId, content) {
  await redis.set(roomContentKey(roomId), content);
}

export async function getContent(roomId) {
  return (await redis.get(roomContentKey(roomId))) || '';
}

export async function saveLanguage(roomId, language) {
  if (language) await redis.set(roomLangKey(roomId), language);
}

export async function getLanguage(roomId) {
  return (await redis.get(roomLangKey(roomId))) || 'javascript';
}

export async function pushMessage(roomId, msg) {
  await redis.lpush(roomMessagesKey(roomId), JSON.stringify(msg));
  await redis.ltrim(roomMessagesKey(roomId), 0, ROOM_MESSAGES_LIMIT - 1);
}

export async function getRecentMessages(roomId, limit = 50) {
  const raw = await redis.lrange(roomMessagesKey(roomId), 0, limit - 1);
  return raw.reverse().map((m) => JSON.parse(m));
}

export async function roomUserCount(roomId) {
  return await redis.hlen(roomUsersKey(roomId));
}

export async function setRoomTTL(roomId, ttlSeconds) {
  await redis.expire(roomContentKey(roomId), ttlSeconds);
  await redis.expire(roomLangKey(roomId), ttlSeconds);
  await redis.expire(roomMessagesKey(roomId), ttlSeconds);
  await redis.expire(roomUsersKey(roomId), ttlSeconds);
}

export async function deleteRoom(roomId) {
  await redis.del(roomContentKey(roomId), roomLangKey(roomId), roomMessagesKey(roomId), roomUsersKey(roomId));
}