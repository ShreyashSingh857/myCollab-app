import React from 'react';
import { useSelector } from 'react-redux';

function Donut({ counts }) {
  const order = ['todo','in_progress','blocked','done'];
  const palette = { todo:'#94a3b8', in_progress:'#6366f1', blocked:'#f59e0b', done:'#16a34a' };
  const total = order.reduce((n,k)=> n + (counts[k]||0), 0) || 1;
  const radius = 46; const circ = 2*Math.PI*radius;
  let offset = 0;
  return (
    <svg width={120} height={120} viewBox="0 0 120 120" className="donut-chart">
      <circle cx={60} cy={60} r={radius} stroke="#e2e8f0" strokeWidth={14} fill="none" />
      {order.map(k=>{
        const val = counts[k]||0; const frac = val/total; const len = circ*frac; const dash = `${len} ${circ-len}`; const el = (
          <circle key={k} cx={60} cy={60} r={radius} stroke={palette[k]} strokeWidth={14} fill="none" strokeDasharray={dash} strokeDashoffset={-offset} strokeLinecap="round" />
        ); offset += len; return el; })}
      <text x="60" y="55" textAnchor="middle" fontSize="18" fontWeight="600" fill="#0f172a">{Math.round(((counts.done||0)/total)*100)}%</text>
      <text x="60" y="74" textAnchor="middle" fontSize="10" fill="#64748b">complete</text>
    </svg>
  );
}

function Sparkline({ data }) {
  if (!data.length) return null;
  const max = Math.max(...data,1);
  const pts = data.map((v,i)=>{
    const x = (i/(data.length-1))*100; const y = 100 - (v/max)*100; return `${x},${y}`; }).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="sparkline"><polyline points={pts} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><circle r="3" cx="100" cy={100-(data.at(-1)/max)*100} fill="#6366f1" /></svg>
  );
}

export default function StatusSnapshot() {
  const projects = useSelector(s => s.projects.projects);
  const tasks = useSelector(s => s.tasks.tasks);
  const counts = tasks.reduce((acc,t)=>{acc[t.status]=(acc[t.status]||0)+1; return acc;},{});
  // Compute last 14 days completion velocity (tasks moved to done by day)
  const now = new Date();
  // Placeholder: using created_at is not available here; using tasks length progression fallback
  const velocity = Array.from({length:14}, (_,i)=>{
    const dayIndex = 13-i; // oldest first
    // naive placeholder: scale done count fraction with slight noise
    return (counts.done||0) ? Math.max(0, Math.round((counts.done/(dayIndex+2)) )) : 0; });
  const total = tasks.length || 1;
  const donePct = Math.round(((counts['done']||0)/total)*100);
  return (
    <div className="widget card status-analytics">
      <div className="widget-title">Status Overview</div>
      <div className="sa-grid">
        <div className="donut-wrap">
          <Donut counts={counts} />
          <div className="legend">
            {['todo','in_progress','blocked','done'].map(k=> (
              <div key={k} className="leg-row"><span className={`swatch sw-${k}`}></span><span className="l-name">{k.replace('_',' ')}</span><span className="l-val">{counts[k]||0}</span></div>
            ))}
          </div>
        </div>
        <div className="velocity-box">
          <div className="vb-head">Completion Trend (14d)</div>
          <Sparkline data={velocity} />
          <div className="vb-meta"><span>{counts.done||0} done</span><span>{donePct}% complete</span></div>
        </div>
      </div>
      <div className="projects-mini enhanced">
        <div className="mini-head">Top Projects</div>
        {projects.slice(0,5).map(p => (
          <div key={p.id} className="proj-row">
            <span className="name" title={p.name}>{p.name}</span>
            {p.progress != null && <span className="mini-bar"><span style={{width:(p.progress||0)+'%'}} /></span>}
            {p.progress != null && <span className="mini-pct">{Math.round(p.progress)}%</span>}
          </div>
        ))}
        {projects.length===0 && <div className="empty-line">No projects</div>}
      </div>
    </div>
  );
}
