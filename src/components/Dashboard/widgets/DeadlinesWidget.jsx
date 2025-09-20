import React from 'react';
import { useSelector } from 'react-redux';

export default function DeadlinesWidget() {
  const tasks = useSelector(s => s.tasks.tasks);
  const upcoming = tasks.filter(t => t.due_date && t.status !== 'done')
    .sort((a,b)=> new Date(a.due_date) - new Date(b.due_date))
    .slice(0,6);
  return (
    <div className="widget card">
      <div className="widget-title">Upcoming Deadlines</div>
      <ul className="deadlines-list">
        {upcoming.map(t => (
          <li key={t.id} className="deadline-item">
            <span className="d-title" title={t.title}>{t.title}</span>
            <span className="d-date">{new Date(t.due_date).toLocaleDateString()}</span>
          </li>
        ))}
        {upcoming.length===0 && <li className="empty-line">No deadlines soon</li>}
      </ul>
    </div>
  );
}
