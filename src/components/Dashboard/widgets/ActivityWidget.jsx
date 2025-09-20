import React from 'react';
import { useSelector } from 'react-redux';

export default function ActivityWidget() {
  const activity = useSelector(s => s.dashboard?.activity || []);
  return (
    <div className="widget card">
      <div className="widget-title">Recent Activity</div>
      <ul className="activity-list">
        {activity.map(a => (
          <li key={a.id} className="activity-item">
            <span className="act-type">{a.type}</span>
            <span className="act-meta">{a.meta?.title || ''}</span>
            <span className="act-time">{new Date(a.created_at).toLocaleTimeString()}</span>
          </li>
        ))}
        {activity.length===0 && <li className="empty-line">No recent events</li>}
      </ul>
    </div>
  );
}
