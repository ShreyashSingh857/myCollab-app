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
  console.log('[projects.createProjectDoc] called with', data);
  try {
    const docRef = await addDoc(col, {
      name: data.name,
      owner_id: data.owner_id,
      description: data.description || '',
      join_code: data.join_code || null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      status_counts: { todo: 0, in_progress: 0, done: 0 }
    });
    console.log('[projects.createProjectDoc] addDoc done, id=', docRef.id);
    const snap = await getDoc(docRef);
    console.log('[projects.createProjectDoc] getDoc done');
    return { id: docRef.id, ...snap.data() };
  } catch (e) {
    console.error('[projects.createProjectDoc] Firestore error', e);
    // Surface a clearer, actionable message for the UI
    throw new Error('Failed to write to Firestore. The project\'s Firestore database may not be created or available for this Firebase project. If you want to use Firestore in production you must enable Firestore for the project (may require enabling billing).');
  }
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
