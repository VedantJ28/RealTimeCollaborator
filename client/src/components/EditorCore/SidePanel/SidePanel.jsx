import React, { useState } from 'react';
import Chat from './Chat';
import ConnectedUsers from './ConnectedUsers';
import Settings from './Settings';

export default function SidePanel({ connectedUsers, chatMessages, onSendChat, options, setOptions, copyRoomId, leaveRoom }) {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState('chat');

  return (
    <div className="flex h-full">
      {/* icons column */}
      <div className="flex flex-col items-center bg-gray-900 p-2" style={{ width: 48 }}>
        <button onClick={() => setOpen((s) => !s)} className="mb-2 p-2 rounded hover:bg-gray-800">≡</button>
        <button onClick={() => setActive('chat')} className={`mb-2 p-2 rounded hover:bg-gray-800 ${active==='chat'?'bg-gray-800':''}`}>💬</button>
        <button onClick={() => setActive('users')} className={`mb-2 p-2 rounded hover:bg-gray-800 ${active==='users'?'bg-gray-800':''}`}>👥</button>
        <button onClick={() => setActive('settings')} className={`mb-2 p-2 rounded hover:bg-gray-800 ${active==='settings'?'bg-gray-800':''}`}>⚙️</button>

        <div className="flex-1" />

        <button onClick={copyRoomId} title="Copy Room ID" className="mb-2 p-2 rounded hover:bg-gray-800">📋</button>
        <button onClick={leaveRoom} title="Leave Room" className="mb-2 p-2 rounded hover:bg-red-700">🚪</button>
      </div>

      {open && (
        <div className="w-80 bg-gray-850 p-3">
          {active === 'chat' && <Chat messages={chatMessages} onSend={onSendChat} />}
          {active === 'users' && <ConnectedUsers users={connectedUsers} />}
          {active === 'settings' && <Settings options={options} setOptions={setOptions} />}
        </div>
      )}
    </div>
  );
}