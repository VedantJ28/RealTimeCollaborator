import React, { useRef, useEffect } from 'react';

export default function Chat({ messages = [], onSend }) {
  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div ref={ref} className="flex-1 overflow-auto p-2 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.system ? 'text-sm text-gray-400 italic' : 'bg-gray-800 p-2 rounded'}>
            {m.system ? m.text : (<><strong>{m.name}: </strong>{m.message}</>)}
          </div>
        ))}
      </div>
      <ChatInput onSend={onSend} />
    </div>
  );
}

function ChatInput({ onSend }) {
  const inputRef = useRef();
  const send = () => {
    const txt = inputRef.current.value.trim();
    if (!txt) return;
    onSend(txt);
    inputRef.current.value = '';
  };
  return (
    <div className="p-2 flex gap-2">
      <input ref={inputRef} placeholder="Type a message..." className="flex-1 p-2 rounded bg-gray-900" />
      <button onClick={send} className="px-4 py-2 bg-indigo-600 rounded">Send</button>
    </div>
  );
}