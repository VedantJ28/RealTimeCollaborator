import express from "express";
import http from "http";
import { Server } from "socket.io";
import Redis from "ioredis";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Socket.IO server (CORS for local dev)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"]
  }
});

// Redis client (default localhost:6379)
// const redis = new Redis();

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("join-room", ({ roomId, name }) => {
    socket.join(roomId);
    // emit simple ack to room
    io.to(roomId).emit("user-joined", { id: socket.id, name });
  });

  socket.on("chat-message", ({ roomId, message, name }) => {
    // broadcast message to room
    io.to(roomId).emit("chat-message", { id: socket.id, name, message, ts: Date.now() });
  });

  socket.on("disconnecting", () => {
    // socket.rooms has rooms before leaving
    for (const room of socket.rooms) {
      if (room === socket.id) continue;
      io.to(room).emit("user-left", { id: socket.id });
    }
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
  });
});

// basic health route
app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});