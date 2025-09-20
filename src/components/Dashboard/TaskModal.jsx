import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewTask } from '../../store/taskSlice';

export default function TaskModal({ open, onClose }) {
  const dispatch = useDispatch();
  const user = useSelector(s => s.auth.user);
  const projects = useSelector(s => s.projects.projects);
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);
  if (!open) return null;
  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !projectId) { setError('Title & project required'); return; }
    try {
      await dispatch(createNewTask({ title, project_id: projectId, status, priority, assignee_id: user.id, due_date: dueDate || null })).unwrap();
      onClose();
      setTitle(''); setProjectId(''); setDueDate(''); setStatus('todo'); setPriority('medium');
    } catch (e) { setError(e); }
  };
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <h3>Create Task</h3>
        <form onSubmit={submit} className="form-vert">
          <label>Title
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task title" />
          </label>
          <label>Project
            <select value={projectId} onChange={e=>setProjectId(e.target.value)}>
              <option value="">Select project</option>
              {projects.map(p=> <option key={p.id} value={p.id}>{p.name}</option> )}
            </select>
          </label>
          <label>Status
            <select value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
          </label>
          <label>Priority
            <select value={priority} onChange={e=>setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
          <label>Due Date
            <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
          </label>
          {error && <div className="form-error">{String(error)}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
