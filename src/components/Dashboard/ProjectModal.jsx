import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewProject, setLoading } from '../../store/projectSlice';

export default function ProjectModal({ open, onClose }) {
  const dispatch = useDispatch();
  const loading = useSelector(s => s.projects.loading);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  React.useEffect(() => {
    if (open) {
      setSubmitting(false);
      setError(null);
    }
  }, [open]);
  if (!open) return null;
  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name required'); return; }
    setSubmitting(true);
    try {
      await dispatch(createNewProject({ name, description })).unwrap();
      setName(''); setDescription('');
      // close after success
      try { onClose(); } catch (_) {}
    } catch (e) { setError(e); }
    finally {
      setSubmitting(false);
      // Ensure loading flag is cleared in reducer too
      try { dispatch(setLoading(false)); } catch (_) {}
    }
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
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting? 'Saving...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
