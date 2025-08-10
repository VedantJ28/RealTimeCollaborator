// ...existing code...
import React, { useState, useEffect, useRef } from 'react';
import useSocket from './useSocket';
import CodeEditor from './Editor';
import SidePanel from './SidePanel/SidePanel';
import logo from '../../assets/logo.png';

export default function EditorCore({ roomId, displayName, initialContent = '// Start coding...' }) {
  const [options, setOptions] = useState({
    language: 'C++',
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 2,
    lineNumbers: 'on',     // added
    wordWrap: 'off',       // added
    minimap: true          // added
  });
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

  const initials = (displayName || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || '?';

  const shortRoomId = roomId && roomId.length > 14
    ? `${roomId.slice(0,6)}…${roomId.slice(-4)}`
    : roomId;

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-800 text-white">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-5 min-w-0">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img
                      src={logo}
                      alt="CodeColab Logo"
                      className="w-8 h-8 drop-shadow-lg"
                      draggable="false"
                    />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">CodeColab</span>
          </a>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Room</span>
            <div className="flex items-center gap-1">
              <code
                title={roomId}
                className="px-2 py-0.5 rounded bg-gray-800 border border-gray-600 font-mono text-xs sm:text-[13px]">
                {shortRoomId}
              </code>
              {/* <button
                onClick={handleCopyRoom}
                className="px-2 py-0.5 text-xs rounded bg-gray-700 hover:bg-gray-600 border border-gray-600 transition"
                title="Copy Room ID">
                {copiedRoom ? 'Copied' : 'Copy'}
              </button> */}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-semibold text-sm select-none"
                title={displayName}>
                {initials}
              </div>
              <div className="leading-tight max-w-[140px] sm:max-w-xs truncate">
                <span className="text-sm font-medium truncate" title={displayName}>
                  {displayName}
                </span>
                <div className="text-[10px] uppercase tracking-wide text-gray-400 -mt-0.5">You</div>
              </div>
            </div>
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