import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewProject } from '../../store/projectSlice';

export default function ProjectModal({ open, onClose }) {
  const dispatch = useDispatch();
  const loading = useSelector(s => s.projects.loading);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  if (!open) return null;
  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name required'); return; }
    try {
      await dispatch(createNewProject({ name, description })).unwrap();
      onClose();
      setName(''); setDescription('');
    } catch (e) { setError(e); }
  };
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <h3>Create Project</h3>
        <form onSubmit={submit} className="form-vert">
          <label>Name
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Project name" />
          </label>
          <label>Description
            <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Optional description" rows={3} />
          </label>
          {error && <div className="form-error">{String(error)}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading? 'Saving...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
