import React, { useEffect, useState } from 'react';
import { fetchRecentActivity } from '../../lib/api/dashboard';

export default function ActivityFeed({ projectId }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let mounted = true;
    if (!projectId) return;
    (async () => {
      try {
        const all = await fetchRecentActivity();
        if (!mounted) return;
        const filtered = (all || []).filter(a => a.project_id === projectId).slice(0,30);
        setItems(filtered);
      } catch (_) {}
    })();
    return () => { mounted = false };
  }, [projectId]);

  return (
    <div className="activity-feed">
      <h3>Recent activity</h3>
      <ul>
        {items.length === 0 && <li>No recent activity</li>}
        {items.map(it => (
          <li key={it.id}>
            <div><strong>{it.type}</strong> <span style={{color:'#666',fontSize:12}}>{new Date(it.created_at).toLocaleString()}</span></div>
            <div style={{fontSize:13,color:'#333'}}>{it.meta && JSON.stringify(it.meta)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
