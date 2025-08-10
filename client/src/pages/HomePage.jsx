import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import logo from "../assets/logo.png"; // Adjust path if needed
// ...existing code...
const HomePage = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);

  const validateUsername = () => {
    if (!username.trim()) {
      setError("Username is required.");
      return false;
    }
    return true;
  };

  const handleCreateRoom = () => {
    if (!validateUsername()) return;
    setError(null);
    const id = uuidv4();
    navigate(`/editor?roomId=${id}&username=${encodeURIComponent(username.trim())}`);
  };

  const handleJoinRoom = () => {
    if (!username.trim() && !roomId.trim()) {
      setError("Please enter both Username and Room ID.");
      return;
    }
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }
    if (!roomId.trim()) {
      setError("Room ID is required to join an existing room.");
      return;
    }
    setError(null);
    navigate(`/editor?roomId=${roomId.trim()}&username=${encodeURIComponent(username.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (roomId.trim()) {
        handleJoinRoom();
      } else {
        handleCreateRoom();
      }
    }
  };

  const clearErrorOnChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen font-body bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col items-center px-4 py-10 text-white">
      <header className="flex items-center gap-3 mb-10">
        <img
          src={logo}
          alt="CodeColab Logo"
          className="w-14 h-14 drop-shadow-lg"
          draggable="false"
        />
        <h1 className="text-4xl font-extrabold tracking-tight font-display">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            CodeColab
          </span>
        </h1>
      </header>

      <div className="w-full max-w-md rounded-xl border border-gray-800/60 bg-gray-900/70 backdrop-blur shadow-2xl shadow-emerald-500/5 p-7">
        <h2 className="text-lg font-semibold mb-4 text-gray-200 font-heading tracking-wide">
          Start or Join a Collaborative Session
        </h2>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-md border border-red-500/50 bg-red-600/15 px-3 py-2 text-sm text-red-200 font-sansAlt">
            <span className="font-medium">Error:</span>
            <span className="flex-1">{error}</span>
            <button
              type="button"
              className="ml-1 px-1 rounded hover:bg-red-500/20"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <label className="block mb-5">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-sansAlt">Username</span>
          <input
            type="text"
            className="mt-1 w-full px-3 py-2 rounded-md bg-gray-800/70 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition text-sm font-body placeholder:text-gray-500"
            placeholder="e.g. alice_dev"
            value={username}
            onChange={clearErrorOnChange(setUsername)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        <label className="block mb-6">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-sansAlt">
            Room ID (leave empty to create new)
          </span>
          <input
            type="text"
            className="mt-1 w-full px-3 py-2 rounded-md bg-gray-800/70 border border-gray-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none transition text-sm font-codeAlt tracking-tight placeholder:text-gray-500"
            placeholder="Paste an existing Room ID"
            value={roomId}
            onChange={clearErrorOnChange(setRoomId)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        <div className="flex gap-4">
          <button
            onClick={handleJoinRoom}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800/40 disabled:text-cyan-300/40 px-4 py-2.5 rounded-md font-medium text-sm tracking-wide transition shadow hover:shadow-cyan-600/30 disabled:shadow-none font-sansAlt"
            disabled={!username.trim() || !roomId.trim()}
          >
            Join Room
          </button>
          <button
            onClick={handleCreateRoom}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/40 disabled:text-emerald-300/40 px-4 py-2.5 rounded-md font-medium text-sm tracking-wide transition shadow hover:shadow-emerald-600/30 disabled:shadow-none font-sansAlt"
            disabled={!username.trim()}
          >
            Create New
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500 text-center font-mono">
          Press Enter to quick start: Join if Room ID present, else Create.
        </p>
      </div>

      <footer className="mt-10 text-xs text-gray-600 font-serif">
        © {new Date().getFullYear()} CodeColab. Collaborative coding made simple.
      </footer>
    </div>
  );
};

export default HomePage;