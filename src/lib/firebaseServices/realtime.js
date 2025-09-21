import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

// Subscribe to user's owned projects (simple owner-based subset)
export function subscribeProjects(userId, callback) {
  if (!userId) return () => {};
  const q = query(collection(db, 'projects'), where('owner_id', '==', userId), orderBy('created_at', 'desc'));
  const unsub = onSnapshot(q, snap => {
    const projects = snap.docs.map(d => ({ id: d.id, ...d.data(), total: d.data().status_counts?.todo + d.data().status_counts?.in_progress + d.data().status_counts?.done || 0, done: d.data().status_counts?.done || 0, progress: (()=>{const sc=d.data().status_counts; const total=(sc?.todo||0)+(sc?.in_progress||0)+(sc?.done||0); return total? (sc?.done||0)/total*100:0;})() }));
    callback(projects);
  });
  return unsub;
}

// Subscribe to tasks assigned to the user
export function subscribeMyTasks(userId, callback) {
  if (!userId) return () => {};
  const q = query(collection(db, 'tasks'), where('assignee_id', '==', userId), orderBy('created_at', 'desc'));
  const unsub = onSnapshot(q, snap => {
    const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(tasks);
  });
  return unsub;
}

// Subscribe to recent activity for projects the user is a member of
export function subscribeActivity(projectId, callback, limit = 50) {
  if (!projectId) return () => {};
  const q = query(collection(db, 'activity'), where('project_id', '==', projectId), orderBy('created_at', 'desc'));
  const unsub = onSnapshot(q, snap => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items.slice(0, limit));
  });
  return unsub;
}