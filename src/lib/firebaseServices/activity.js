import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

const ACTIVITY = 'activity';

export async function listRecentActivity(projectId, limitCount = 25) {
  // Basic recent activity for a project
  const q = query(
    collection(db, ACTIVITY),
    where('project_id', '==', projectId),
    orderBy('created_at', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.slice(0, limitCount).map(d => ({ id: d.id, ...d.data() }));
}

export async function logActivity(event) {
  const col = collection(db, ACTIVITY);
  const now = new Date();
  const ref = await addDoc(col, { ...event, created_at: now.toISOString() });
  return { id: ref.id, ...event, created_at: now.toISOString() };
}
