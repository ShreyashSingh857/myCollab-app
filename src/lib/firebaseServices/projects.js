import { db } from '../firebase';
import { collection, addDoc, getDoc, doc, updateDoc, deleteDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { collection as coll } from 'firebase/firestore';

const PROJECTS = 'projects';

export async function listUserProjects(userId) {
  // user is member or owner; membership subcollection path: projects/{projectId}/members/{userId}
  // Simpler initial approach: query projects where owner_id == userId; second query membership index (future optimization)
  const ownedQ = query(collection(db, PROJECTS), where('owner_id', '==', userId), orderBy('created_at', 'desc'));
  const ownedSnap = await getDocs(ownedQ);
  const owned = ownedSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  // For now return only owned; membership expansion later
  return owned;
}

export async function listUserProjectsWithCounts(userId) {
  const projects = await listUserProjects(userId);
  // For each project, count tasks (total & done)
  // NOTE: This is N+1 queries; acceptable for small project counts. Optimize later with indexed aggregated collection.
  const tasksCol = collection(db, 'tasks');
  const augmented = [];
  for (const p of projects) {
    let total = 0; let done = 0;
    try {
      const qAll = query(tasksCol, where('project_id', '==', p.id));
      const snap = await getDocs(qAll);
      total = snap.size;
      done = snap.docs.filter(d => d.data().status === 'done').length;
    } catch (_) {}
    augmented.push({ ...p, total, done, progress: total ? (done / total) * 100 : 0 });
  }
  return augmented;
}

export async function createProjectDoc(data) {
  const col = collection(db, PROJECTS);
  const now = new Date();
  const docRef = await addDoc(col, {
    name: data.name,
    owner_id: data.owner_id,
    description: data.description || '',
    join_code: data.join_code || null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    status_counts: { todo: 0, in_progress: 0, done: 0 }
  });
  const snap = await getDoc(docRef);
  return { id: docRef.id, ...snap.data() };
}

export async function updateProjectDoc(id, fields) {
  const ref = doc(db, PROJECTS, id);
  await updateDoc(ref, { ...fields, updated_at: new Date().toISOString() });
  const snap = await getDoc(ref);
  return { id: snap.id, ...snap.data() };
}

export async function deleteProjectDoc(id) {
  await deleteDoc(doc(db, PROJECTS, id));
  return id;
}
