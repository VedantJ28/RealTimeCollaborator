import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const HomePage = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const handleCreateRoom = () => {
    if (!username.trim()) {
      alert("Please enter Username before creating a room");
      return;
    }
    const id = uuidv4();
    navigate(`/editor?roomId=${id}&username=${encodeURIComponent(username)}`);
  };

  const handleJoinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      alert("Please enter both Room ID and Username");
      return;
    }
    navigate(`/editor?roomId=${roomId}&username=${encodeURIComponent(username)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="text-4xl font-bold mb-8">Collaborative Code Editor</div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg w-full max-w-md">
        <label className="block mb-4">
          <span className="text-sm">Username</span>
          <input
            type="text"
            className="mt-1 w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Room ID (for joining)</span>
          <input
            type="text"
            className="mt-1 w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
            placeholder="Enter Room ID to join"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </label>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleJoinRoom}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            disabled={!username.trim() || !roomId.trim()}
          >
            Join Room
          </button>
          <button
            onClick={handleCreateRoom}
            className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!username.trim()}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;