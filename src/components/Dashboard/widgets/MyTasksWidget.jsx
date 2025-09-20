import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { patchTask, deleteTask as removeTask } from '../../../store/taskSlice';
import { deleteTask as apiDeleteTask } from '../../../lib/api/dashboard';

export default function MyTasksWidget({ onNewTask }) {
  const dispatch = useDispatch();
  const user = useSelector(s => s.auth.user);
  const tasks = useSelector(s => s.tasks.tasks).filter(t => t.assignee_id === user?.id).slice(0,8);
  const cycle = (t) => {
    const order = ['todo','in_progress','blocked','done'];
    const next = order[(order.indexOf(t.status)+1)%order.length];
    dispatch(patchTask({ id: t.id, fields: { status: next } }));
  };
  const del = async (t) => {
    if (!window.confirm('Delete this task?')) return;
    try { await apiDeleteTask(t.id); dispatch(removeTask(t.id)); } catch(e){ alert(e.message); }
  };
  return (
    <div className="widget card">
      <div className="widget-title flex-between">
        <span>My Tasks</span>
        <button className="btn-xs" onClick={onNewTask}>+ Task</button>
      </div>
      <ul className="task-mini-list">
          {tasks.map(t => (
          <li key={t.id} className={`task-mini status-${t.status}`} title="Click status or delete">
            <span className="t-title" title={t.title} onClick={()=>cycle(t)}>{t.title}</span>
            <span className="t-status" onClick={()=>cycle(t)}>{t.status}</span>
            <button className="btn-xs" onClick={()=>del(t)} aria-label="Delete task">×</button>
          </li>
        ))}
        {tasks.length===0 && <li className="empty-line">No tasks assigned</li>}
      </ul>
    </div>
  );
}
