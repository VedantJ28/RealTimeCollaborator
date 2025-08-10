import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FiCopy } from 'react-icons/fi';

export default function Chat({ messages = [], onSend, currentUser }) {
  const scrollRef = useRef();
  const [autoScroll, setAutoScroll] = useState(true);

  // Detect if user manually scrolled up
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAutoScroll(distanceFromBottom < 80); // re-enable when close to bottom
  };

  // Scroll on new messages only if near bottom previously
  useEffect(() => {
    if (!autoScroll) return;
    const el = scrollRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, autoScroll]);

  const normalizeMessage = (m) => {
    const isSystem = !!m.system;
    const base = !isSystem ? m.message : m.text;
    let text = base;
    if (base && typeof base === 'object') {
      if (typeof base.message === 'string') {
        text = base.message;
      } else if (base.message) {
        text = JSON.stringify(base.message);
      } else {
        text = JSON.stringify(base);
      }
    }
    const attachments = base?.attachments || m.attachments || [];
    return { isSystem, text: text ?? '', name: m.name || (isSystem ? 'System' : 'User'), attachments, raw: m };
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto px-2 py-3 space-y-3 custom-scroll"
      >
        {messages.map((m, i) => {
          const { isSystem, text, name, attachments } = normalizeMessage(m);
            // Determine side (only if a currentUser provided)
          const isMe = currentUser && name === currentUser && !isSystem;
          return (
            <MessageBubble
              key={i}
              isSystem={isSystem}
              isMe={isMe}
              name={name}
              text={text}
              attachments={attachments}
              timestamp={m.timestamp || m.time || Date.now()}
            />
          );
        })}
      </div>
      <ChatInput onSend={onSend} />
    </div>
  );
}

function MessageBubble({ isSystem, isMe, name, text, attachments, timestamp }) {
  const time = new Date(timestamp);
  const timeStr = !isNaN(time.getTime())
    ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  if (isSystem) {
    return (
      <div className="text-[11px] text-gray-400 italic flex items-center gap-2 justify-center select-none">
        <span className="px-2 py-1 bg-gray-700/40 rounded-full">{String(text)}</span>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={[
          'group max-w-[78%] relative rounded-lg px-3 py-2 shadow-md',
          isMe
            ? 'bg-indigo-600/70 text-indigo-50 rounded-tr-sm'
            : 'bg-gray-800/80 text-gray-100 rounded-tl-sm',
          'backdrop-blur-sm border border-gray-700/40',
        ].join(' ')}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={[
              'text-[10px] font-semibold tracking-wide uppercase',
              isMe ? 'text-indigo-100/70' : 'text-gray-300/70',
            ].join(' ')}
          >
            {name}
          </span>
          <span className="text-[9px] text-gray-400">{timeStr}</span>
          <CopyButton text={typeof text === 'string' ? text : JSON.stringify(text)} />
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {renderRichText(text)}
        </div>
        {Array.isArray(attachments) && attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {attachments.map((att, idx) => (
              <AttachmentBadge key={idx} attachment={att} />
            ))}
          </div>
        )}
        <div
          className={[
            'absolute w-2 h-2 -bottom-1',
            isMe
              ? 'right-2 bg-indigo-600/70 rotate-45'
              : 'left-2 bg-gray-800/80 rotate-45',
            'border-b border-r border-gray-700/40',
          ].join(' ')}
        />
      </div>
    </div>
  );
}

function renderRichText(text) {
  if (typeof text !== 'string') return <span>{JSON.stringify(text)}</span>;

  // Parse fenced code blocks ```lang\ncode```
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  const parts = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', lang: match[1] || '', value: match[2] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  if (parts.length === 1 && parts[0].type === 'text') {
    return <span>{parts[0].value}</span>;
  }

  return parts.map((p, i) =>
    p.type === 'code' ? (
      <pre
        key={i}
        className="mt-2 mb-1 text-xs leading-snug bg-black/40 border border-gray-700/60 rounded-md p-2 overflow-auto"
      >
        <code className="font-mono select-text">
          {p.lang && <span className="text-[10px] text-indigo-300 block mb-1">{p.lang}</span>}
          {p.value}
        </code>
      </pre>
    ) : (
      <span key={i}>{p.value}</span>
    )
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      // ignore
    }
  }, [text]);
  return (
    <button
      onClick={copy}
      title="Copy message"
      className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-700/60 hover:bg-gray-600 text-gray-300"
    >
      <FiCopy size={12} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function AttachmentBadge({ attachment }) {
  if (!attachment) return null;
  const { url, name, filename } = attachment;
  const label = name || filename || 'attachment';
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-[10px] px-2 py-1 rounded bg-gray-700/60 hover:bg-gray-600 text-indigo-300 hover:text-indigo-200 underline-offset-2"
    >
      {label}
    </a>
  );
}

function ChatInput({ onSend }) {
  const [value, setValue] = useState('');
  const pendingRef = useRef(false);

  const send = () => {
    const txt = value.trim();
    if (!txt || pendingRef.current) return;
    onSend(txt);
    setValue('');
  };

  const onKey = (e) => {
    if ((e.key === 'Enter' && !e.shiftKey) || (e.key === 'Enter' && e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="p-2 pt-0 flex flex-col gap-2 border-t border-gray-800/60 bg-[#14181f]">
      <div className="flex gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
          placeholder="Message (Enter to send, Shift+Enter newline)"
          rows={2}
          className="flex-1 resize-none p-2 rounded bg-gray-900 border border-gray-700/60 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm leading-snug"
        />
        <button
          onClick={send}
          disabled={!value.trim()}
          className="px-4 py-2 bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500 rounded text-sm font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}