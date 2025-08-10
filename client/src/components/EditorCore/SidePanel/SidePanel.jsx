import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FiMessageSquare, FiUsers, FiSettings, FiCopy, FiLogOut, FiSidebar } from 'react-icons/fi';
import Chat from './Chat';
import ConnectedUsers from './ConnectedUsers';
import Settings from './Settings';

const tabs = [
  { id: 'chat', label: 'Chat', icon: <FiMessageSquare size={18} /> },
  { id: 'users', label: 'Users', icon: <FiUsers size={18} /> },
  { id: 'settings', label: 'Settings', icon: <FiSettings size={18} /> },
];

export default function SidePanel({
  connectedUsers,
  chatMessages,
  onSendChat,
  options,
  setOptions,
  copyRoomId,
  leaveRoom,
}) {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState('chat');

  // Resizable width
  const DEFAULT_WIDTH = 350;
  const MIN_WIDTH = 220;
  const MAX_WIDTH = 520;
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(panelWidth);

  const toggleOpen = useCallback(() => setOpen(s => !s), []);

  // Helper: ensure panel opens before running action if currently collapsed
  const withAutoExpand = useCallback(
    (fn) => {
      return (...args) => {
        if (!open) setOpen(true);
        fn && fn(...args);
      };
    },
    [open]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (!e.altKey) return;
      if (e.key === '1') setActive('chat');
      if (e.key === '2') setActive('users');
      if (e.key === '3') setActive('settings');
      if (e.key.toLowerCase() === 'b') toggleOpen();
      if (e.key.toLowerCase() === '0') setPanelWidth(DEFAULT_WIDTH);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleOpen]);

  const onResizeStart = (e) => {
    if (!open) return;
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = panelWidth;
    document.addEventListener('mousemove', onResizing);
    document.addEventListener('mouseup', onResizeEnd);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  const onResizing = (e) => {
    if (!resizingRef.current) return;
    const delta = e.clientX - startXRef.current;
    let next = startWidthRef.current + delta;
    if (next < MIN_WIDTH) next = MIN_WIDTH;
    if (next > MAX_WIDTH) next = MAX_WIDTH;
    setPanelWidth(next);
  };

  const onResizeEnd = () => {
    resizingRef.current = false;
    document.removeEventListener('mousemove', onResizing);
    document.removeEventListener('mouseup', onResizeEnd);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };

  const resetWidth = () => setPanelWidth(DEFAULT_WIDTH);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onResizing);
      document.removeEventListener('mouseup', onResizeEnd);
    };
  }, []);

  const renderContent = () => {
    switch (active) {
      case 'chat': return <Chat messages={chatMessages} onSend={onSendChat} />;
      case 'users': return <ConnectedUsers users={connectedUsers} />;
      case 'settings': return <Settings options={options} setOptions={setOptions} />;
      default: return null;
    }
  };

    const handleLeaveRoom = withAutoExpand(() => {
    if (window.confirm('Are you sure you want to leave this room? You will be disconnected.')) {
      leaveRoom();
    }
  });

  return (
    <div className="flex h-full">
      {/* Icon rail */}
      <div
        className="relative z-20 flex flex-col items-center bg-[#0f1115] p-2 gap-1 border-r border-gray-800 shadow-[0_0_0_1px_#1e2230_inset]"
        style={{ width: 56 }}
      >
        <RailButton
          // onClick={withAutoExpand(toggleOpen)}
          onClick={toggleOpen}
          label={open ? 'Collapse' : 'Expand'}
          shortcut="Alt+B"
        >
          <FiSidebar size={18} />
        </RailButton>

        <div className="h-px w-7 bg-gray-700/60 my-1" />

        {tabs.map((t, idx) => (
          <RailButton
            key={t.id}
            onClick={withAutoExpand(() => setActive(t.id))}
            label={t.label}
            active={active === t.id}
            shortcut={`Alt+${idx + 1}`}
          >
            {t.icon}
          </RailButton>
        ))}

        <div className="flex-1" />

        <RailButton onClick={withAutoExpand(copyRoomId)} label="Copy Room ID">
          <FiCopy size={17} />
        </RailButton>
        <RailButton onClick={handleLeaveRoom} label="Leave Room" danger>
          <FiLogOut size={17} />
        </RailButton>
      </div>

      {/* Sliding / resizable panel */}
      <div
        className="relative z-10 overflow-hidden transition-[width] duration-300 ease-out"
        style={{ width: open ? panelWidth : 0 }}
      >
        <div
          className={[
            'h-full flex flex-col',
            'bg-[#12161d] border-r border-gray-800/70',
            'transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0 pointer-events-none',
          ].join(' ')}
          style={{ width: '100%' }}
        >
          <HeaderBar
            title={tabs.find(t => t.id === active)?.label || ''}
            count={active === 'users' ? connectedUsers?.length : undefined}
          />
          <div className="flex-1 overflow-y-auto custom-scroll px-3 pb-3 pt-2">
            {open && renderContent()}
          </div>
        </div>

        {/* Resize handle (only when open) */}
        {open && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize side panel"
            title="Drag to resize (Double-click to reset)"
            onMouseDown={onResizeStart}
            onDoubleClick={resetWidth}
            className="absolute top-0 right-0 h-full w-[5px] cursor-col-resize group"
          >
            <div className="w-[3px] mx-auto h-full opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="h-full w-full bg-gradient-to-b from-indigo-600/50 via-indigo-500/40 to-indigo-600/50 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HeaderBar({ title, count }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/70 bg-[#141a22]">
      <h2 className="text-[11px] font-semibold tracking-[0.08em] text-gray-200 flex items-center gap-2">
        <span className="uppercase">{title}</span>
        {typeof count === 'number' && (
          <span className="text-[10px] leading-none px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-200 border border-indigo-500/40">
            {count}
          </span>
        )}
      </h2>
      <span className="text-[10px] text-gray-500 select-none font-medium">ALT+1..3</span>
    </div>
  );
}

function RailButton({
  children,
  onClick,
  label,
  active,
  danger,
  shortcut,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        'group relative w-10 h-10 rounded-lg flex items-center justify-center select-none',
        'outline-none transition-colors duration-160',
        'text-gray-300',
        active
          ? 'bg-gradient-to-br from-indigo-600/20 to-indigo-500/10 text-indigo-200 ring-1 ring-indigo-500/40'
          : 'hover:text-white hover:bg-gray-700/40',
        danger
          ? 'hover:bg-red-600/30 text-red-300 hover:text-red-200'
          : '',
        'focus-visible:ring-2 focus-visible:ring-indigo-500/60',
        '[&_svg]:!stroke-1 [&_svg]:drop-shadow-[0_0_2px_rgba(0,0,0,0.4)]',
      ].join(' ')}
    >
      <span className="text-base flex items-center">{children}</span>
      <span
        className="z-30 pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2
          whitespace-nowrap rounded-md bg-[#1b232c] px-2 py-1 text-[10px] font-medium text-gray-200
          opacity-0 translate-x-1 shadow-lg shadow-black/40 border border-gray-700/70
          transition-all duration-150
          group-hover:opacity-100 group-hover:translate-x-0"
      >
        {label}
        {shortcut && shortcut.length > 0 && (
          <span className="ml-1 text-[9px] text-gray-400">{shortcut}</span>
        )}
      </span>
      {danger && (
        <span className="absolute -right-[3px] top-[3px] w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
      )}
    </button>
  );
}