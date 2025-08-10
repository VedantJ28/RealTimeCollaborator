import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default function App() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    socket.on("connect", () => setLogs((l) => [...l, `connected ${socket.id}`]));
    socket.on("user-joined", (data) => setLogs((l) => [...l, `joined: ${data.name}`]));
    socket.on("chat-message", (m) => setLogs((l) => [...l, `${m.name}: ${m.message}`]));

    return () => {
      socket.off("connect");
      socket.off("user-joined");
      socket.off("chat-message");
    };
  }, []);

  const joinRoom = () => {
    socket.emit("join-room", { roomId: "test-room", name: "Vedant" });
  };

  const sendMsg = () => {
    socket.emit("chat-message", { roomId: "test-room", message: "hello from client", name: "Vedant" });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Collab Editor — Demo</h1>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={joinRoom}>Join room</button>
      <button className="ml-2 px-4 py-2 bg-green-600 text-white rounded" onClick={sendMsg}>Send</button>
      <div className="mt-4 space-y-1">
        {logs.map((l, i) => <div key={i} className="text-sm">{l}</div>)}
      </div>
    </div>
  );
}
