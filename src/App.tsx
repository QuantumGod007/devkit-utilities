import { useState } from 'react';
import { tools } from './tools/registry';
import type { Tool } from './types';

function ToolPanel({ tool }: { tool: Tool }) {
  const [input, setInput] = useState(tool.sample);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  return <section className="workbench" aria-labelledby="tool-title">
    <div className="panel-heading"><div><span className="eyebrow">{tool.category}</span><h2 id="tool-title">{tool.name}</h2><p>{tool.description}</p></div><span className="local-badge">● Runs locally</span></div>
    <div className="editor-grid"><div className="editor"><div className="editor-label"><label htmlFor="tool-input">{tool.inputLabel || 'Input'}</label><button onClick={() => { setInput(tool.sample); setError(''); }}>Load example</button></div><textarea id="tool-input" value={input} onChange={event => setInput(event.target.value)} spellCheck={false} autoCapitalize="off" aria-describedby={error ? 'tool-error' : undefined} /></div>
    <div className="editor"><div className="editor-label"><label htmlFor="tool-output">Output</label></div><textarea id="tool-output" value={output} readOnly placeholder="Your result will appear here." spellCheck={false} /></div></div>
    <div className="actions">{tool.actions.map(action => <button className="primary" key={action.label} onClick={() => { try { setOutput(action.run(input)); setError(''); } catch (failure) { setOutput(''); setError(failure instanceof Error ? failure.message : 'Something went wrong. Please try again.'); } }}>{action.label}<span aria-hidden="true">↗</span></button>)}</div>
    {error && <p id="tool-error" className="error" role="alert">{error}</p>}
    <div className="panel-footer"><span>PRIVATE BY DESIGN</span><p>Your input stays on this device. No uploads. No accounts.</p></div>
  </section>;
}
export function App() {
  const [selected, setSelected] = useState('json');
  const active = tools.find(tool => tool.id === selected) || tools[0];
  return <div className="app-shell"><aside className="sidebar"><a className="brand" href="/" aria-label="Devkit home"><span className="brand-mark">⌘</span>devkit<span className="brand-dot">.</span></a><p className="sidebar-caption">LESS FRICTION. MORE FLOW.</p><nav aria-label="Developer utilities"><span className="nav-label">YOUR TOOLBOX</span>{tools.map((tool, index) => <button key={tool.id} aria-current={active?.id === tool.id ? 'page' : undefined} onClick={() => setSelected(tool.id)}><span className="tool-number">{String(index + 1).padStart(2, '0')}</span>{tool.name}<span className="nav-arrow" aria-hidden="true">↗</span></button>)}</nav><div className="sidebar-note"><span className="status-dot"/>Built for your browser.<p>Small tools. A little more headspace.</p></div></aside><main id="main-content"><header className="topbar"><span>THE DEVELOPER’S EVERYDAY CARRY</span><span className="version">V 1.0 / WEB</span></header><div className="page-content"><div className="intro"><span className="eyebrow"><span className="tiny-star">✳</span> A LITTLE UTILITY GOES A LONG WAY</span><h1>Good tools.<br/><em>Clear head.</em></h1><p>The small things that keep your work moving.<br/>Fast, focused, and right here when you need them.</p><div className="intro-meta"><span>⌘ {tools.length} focused utilities</span><span>○ Zero server processing</span></div></div>{active ? <ToolPanel key={active.id} tool={active}/> : <section className="workbench"><h2>Your workspace is ready.</h2><p>Developer utilities are coming next.</p></section>}<footer className="page-footer"><span>Made for the details.</span><span>DEVKIT / THINK LESS. BUILD MORE.</span></footer></div></main></div>;
}
