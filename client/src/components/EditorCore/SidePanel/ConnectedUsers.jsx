import React from 'react';

export default function ConnectedUsers({ users = [] }) {
  return (
    <div className="p-2">
      <h4 className="font-semibold mb-2">Connected ({users.length})</h4>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="p-2 bg-gray-800 rounded flex items-center justify-between">
            <div>{u.name}</div>
            <div className="text-xs text-gray-400">{u.id?.slice(0,6)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}