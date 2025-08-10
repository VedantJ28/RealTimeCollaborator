import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

// Simple code editor component handling local and remote updates
export default function CodeEditor({ initialCode, language, options, onLocalChange, onRemoteLanguageChange, socketRef }) {
  const [code, setCode] = useState(initialCode || '');
  const skipRef = useRef(false); // prevent echo loops

  // update when initialCode changes (first room state load)
  useEffect(() => {
    setCode((prev) => (prev === '' || prev != '// Start Coding...' ? initialCode : prev));
  }, [initialCode]);

  // listen for remote code-change events
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    const handler = ({ content, language: _lang, from }) => {
      if (from === socket.id) return; // ignore own echoes
      if (typeof content === 'string') {
        skipRef.current = true;
        setCode(content);
      }
      if (_lang) {
        onRemoteLanguageChange?.(_lang);
      }
    };
    socket.on('code-change', handler);
    return () => socket.off('code-change', handler);
  }, [socketRef?.current, onRemoteLanguageChange]);

  const handleChange = (value) => {
    setCode(value);
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    onLocalChange({ content: value, language });
  };

  return (
    <Editor
      height="100%"
      theme={options.theme}
      language={language}
      value={code}
      onChange={handleChange}
      options={{
        fontSize: options.fontSize,
        tabSize: options.tabSize,
        lineNumbers: options.lineNumbers ?? 'on',
        wordWrap: options.wordWrap ?? 'off',
        minimap: { enabled: options.minimap !== false },
        automaticLayout: true,
        // optional extras:
        scrollBeyondLastLine: false,
        smoothScrolling: true
      }}
    />
  );
}