import { db } from '../firebase';
import { collection, addDoc, getDoc, doc, query, where, getDocs } from 'firebase/firestore';

// A simple members collection (flattened). Could also be per-project subcollection.
const MEMBERS = 'members';

export async function ensureOwnerMembership(projectId, userId) {
  const q = query(collection(db, MEMBERS), where('project_id', '==', projectId), where('user_id', '==', userId));
  const snap = await getDocs(q);
  if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  const col = collection(db, MEMBERS);
  const now = new Date().toISOString();
  const ref = await addDoc(col, { project_id: projectId, user_id: userId, role: 'owner', created_at: now });
  const docSnap = await getDoc(ref);
  return { id: ref.id, ...docSnap.data() };
}

export async function listProjectMembers(projectId) {
  const q = query(collection(db, MEMBERS), where('project_id', '==', projectId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
