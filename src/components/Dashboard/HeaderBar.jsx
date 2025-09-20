import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { setUser } from '../../store/authSlice';

export default function HeaderBar() {
  const user = useSelector(s => s.auth.user);
  const dispatch = useDispatch();
  const logout = async () => {
    try { await signOut(auth); } finally { dispatch(setUser(null)); window.location.href='/login'; }
  };
  return (
    <header className="dash-header">
      <div className="dash-search">
        <input type="text" placeholder="Search (coming soon)" />
      </div>
      <div className="dash-user">
        <button className="btn-xs" onClick={logout} aria-label="Logout">Logout</button>
        <span className="user-email">{user?.email}</span>
        <div className="user-avatar" aria-label="User avatar">{user?.email?.[0]?.toUpperCase()}</div>
      </div>
    </header>
  );
}
