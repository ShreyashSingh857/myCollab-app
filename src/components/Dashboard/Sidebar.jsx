import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteProject as apiDeleteProject, fetchMyRole } from '../../lib/api/dashboard';
import { deleteProject } from '../../store/projectSlice';

export default function Sidebar({ onNewProject, onNewTask }) {
  const projects = useSelector(s => s.projects.projects);
  const user = useSelector(s => s.auth.user);
  const dispatch = useDispatch();
  const handleDelete = async (p) => {
    if (!window.confirm(`Delete project "${p.name}"? This cannot be undone.`)) return;
    try { await apiDeleteProject(p.id); dispatch(deleteProject(p.id)); } catch(e){ alert(e.message); }
  };
  return (
    <aside className="dash-sidebar">
      <div className="sidebar-header">
        <h1 className="app-logo">MyCollab</h1>
      </div>
      <div className="sidebar-section">
        <div className="sidebar-section-title">Projects</div>
        <ul className="project-list">
          {projects.map(p => (
            <li key={p.id} className="project-item">
              <span className="project-name" title={p.name}>{p.name}</span>
              {p.progress != null && <span className="project-progress">{Math.round(p.progress)}%</span>}
              {user?.id === p.owner_id && <button className="btn-xs" onClick={()=>handleDelete(p)} title="Delete project">×</button>}
            </li>
          ))}
          {projects.length === 0 && <li className="empty-item">No projects yet</li>}
        </ul>
        <button className="primary-btn w-full" style={{marginTop:12}} onClick={onNewProject}>+ New Project</button>
        <button className="secondary-btn w-full" style={{marginTop:8}} onClick={onNewTask}>+ New Task</button>
      </div>
    </aside>
  );
}
