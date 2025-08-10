// ...existing code...
import React, { useState, useEffect, useRef } from 'react';
import useSocket from './useSocket';
import CodeEditor from './Editor';
import SidePanel from './SidePanel/SidePanel';

export default function EditorCore({ roomId, displayName, initialContent = '// Start coding...' }) {
  const [options, setOptions] = useState({ language: 'javascript', theme: 'vs-dark', fontSize: 14, tabSize: 2 });
  const { socketRef, connectedUsers, chatMessages, roomState, emitChat, emitCodeChange, copyRoomId, leaveRoom } = useSocket(roomId, displayName);
  const [initialCode, setInitialCode] = useState(initialContent);
  const mountedRef = useRef(false);
  const languageSkipRef = useRef(false); // prevent rebroadcast of remote language changes

  // apply initial room state once
  useEffect(() => {
    if (roomState?.content !== undefined) setInitialCode(roomState.content);
    if (roomState?.language) setOptions((p) => ({ ...p, language: roomState.language }));
  }, [roomState]);

  // broadcast language changes (after first mount & if not remote)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (languageSkipRef.current) {
      languageSkipRef.current = false;
      return;
    }
    emitCodeChange({ language: options.language });
  }, [options.language]);

  const onLocalChange = (payload) => emitCodeChange(payload);
  const onRemoteLanguageChange = (lang) => {
    if (!lang || lang === options.language) return;
    languageSkipRef.current = true;
    setOptions((p) => ({ ...p, language: lang }));
  };
  const onSendChat = (txt) => emitChat(txt);

  if (!roomId) return <div className="p-4 text-red-500">Missing room id.</div>;

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-800 text-white">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold">CE</div>
          <div className="font-semibold">Collab Editor</div>
          <div className="ml-4 text-sm text-gray-300">Room: {roomId}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-300">{displayName}</div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <SidePanel
            connectedUsers={connectedUsers}
            chatMessages={chatMessages}
            onSendChat={onSendChat}
            options={options}
            setOptions={setOptions}
            copyRoomId={copyRoomId}
            leaveRoom={() => { leaveRoom(); window.location.href = '/'; }}
        />
        <div className="flex-1">
          <CodeEditor
            initialCode={initialCode}
            language={options.language}
            options={options}
            onLocalChange={onLocalChange}
            onRemoteLanguageChange={onRemoteLanguageChange}
            socketRef={socketRef}
          />
        </div>
      </div>
    </div>
  );
}
// ...existing code...