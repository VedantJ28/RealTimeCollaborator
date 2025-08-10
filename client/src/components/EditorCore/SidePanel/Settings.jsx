import React from 'react';

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'shell', label: 'Shell' }
];

const Toggle = ({ label, value, onChange, description }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition
      ${value ? 'border-emerald-500 bg-emerald-600/20 text-emerald-200' : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-400'}`}
    aria-pressed={value}
  >
    <span className="text-left">
      <span className="block font-medium">{label}</span>
      {description && <span className="block text-xs opacity-70">{description}</span>}
    </span>
    <span
      className={`inline-block h-5 w-10 rounded-full p-0.5 transition ${
        value ? 'bg-emerald-500' : 'bg-gray-600'
      }`}
    >
      <span
        className={`block h-4 w-4 rounded-full bg-white transition ${
          value ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </span>
  </button>
);


export default function Settings({ options, setOptions }) {
  const change = (key, value) => setOptions((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-6 p-3 text-sm">
      <header className="pb-2 border-b border-gray-700">
        <h2 className="text-lg font-semibold tracking-wide">Editor Settings</h2>
        <p className="text-xs text-gray-400">Adjust preferences for the code editor.</p>
      </header>

      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-wide text-gray-400">Basics</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Language</label>
            <div className="relative">
              <select
                value={options.language}
                onChange={(e) => change('language', e.target.value)}
                className="w-full appearance-none rounded-md bg-gray-900/80 border border-gray-700 px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                ▼
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Theme</label>
            <div className="flex gap-2">
              {[
                { v: 'vs-dark', l: 'Dark' },
                { v: 'light', l: 'Light' },
                { v: 'hc-black', l: 'High Contrast' }
              ].map((t) => (
                <button
                  key={t.v}
                  onClick={() => change('theme', t.v)}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition
                    ${
                      options.theme === t.v
                        ? 'border-emerald-500 bg-emerald-600/20 text-emerald-200'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                >
                  {t.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h3 className="text-xs uppercase tracking-wide text-gray-400">Typography</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-medium">Font Size</label>
              <span className="text-xs text-gray-400">{options.fontSize}px</span>
            </div>
            <input
              type="range"
              min={10}
              max={24}
              value={options.fontSize}
              onChange={(e) => change('fontSize', Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium">Tab Size</label>
                <span className="text-xs text-gray-400">{options.tabSize}</span>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                value={options.tabSize}
                onChange={(e) => change('tabSize', Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-wide text-gray-400">Display</h3>
        <div className="space-y-2">
          <Toggle
            label="Line Numbers"
            value={options.lineNumbers === 'on'}
            onChange={(v) => change('lineNumbers', v ? 'on' : 'off')}
            description="Show line indices beside code."
          />
          <Toggle
            label="Word Wrap"
            value={options.wordWrap === 'on'}
            onChange={(v) => change('wordWrap', v ? 'on' : 'off')}
            description="Wrap long lines."
          />
          <Toggle
            label="Minimap"
            value={options.minimap !== false}
            onChange={(v) => change('minimap', v)}
            description="Show code overview minimap."
          />
        </div>
      </section>

      <section>
        <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-2">Preview</h3>
        <div className="rounded-md border border-gray-700 bg-gray-900/60 p-3 text-xs font-mono leading-relaxed">
          <div className="text-gray-500 select-none">/* Preview */</div>
          <div className="text-emerald-400">function</div>
          <span className="text-sky-300"> greet</span>
          <span className="text-gray-300">() {'{'}</span>
          <br />
          <span className="pl-4 text-gray-300">console.log(</span>
          <span className="text-amber-300">'Hello'</span>
          <span className="text-gray-300">);</span>
          <br />
          <span className="text-gray-300">{'}'}</span>
        </div>
      </section>
    </div>
  );
}