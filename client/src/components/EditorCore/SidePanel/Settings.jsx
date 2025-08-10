import React from 'react';

export default function Settings({ options, setOptions }) {
  const change = (key, value) => setOptions((p) => ({ ...p, [key]: value }));

  return (
    <div className="p-2 space-y-3">
      <div>
        <label className="block text-sm">Language</label>
        <select value={options.language} onChange={(e) => change('language', e.target.value)} className="w-full mt-1 p-2 rounded bg-gray-900">
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <div>
        <label className="block text-sm">Theme</label>
        <select value={options.theme} onChange={(e) => change('theme', e.target.value)} className="w-full mt-1 p-2 rounded bg-gray-900">
          <option value="vs-dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      <div>
        <label className="block text-sm">Font Size: {options.fontSize}px</label>
        <input type="range" min={10} max={24} value={options.fontSize} onChange={(e) => change('fontSize', Number(e.target.value))} className="w-full mt-1" />
      </div>

      <div>
        <label className="block text-sm">Tab Size: {options.tabSize}</label>
        <input type="range" min={2} max={8} value={options.tabSize} onChange={(e) => change('tabSize', Number(e.target.value))} className="w-full mt-1" />
      </div>
    </div>
  );
}