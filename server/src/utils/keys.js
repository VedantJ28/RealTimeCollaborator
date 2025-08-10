export const roomContentKey = (roomId) => `room:${roomId}:content`;
export const roomLangKey = (roomId) => `room:${roomId}:language`;
export const roomUsersKey = (roomId) => `room:${roomId}:users`; // hash: socketId -> name
export const roomMessagesKey = (roomId) => `room:${roomId}:messages`;