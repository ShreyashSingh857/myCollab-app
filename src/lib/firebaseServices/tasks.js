import { db } from '../firebase';
import { collection, addDoc, getDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';

// Tasks stored as top-level collection for now (denormalized project_id field). Later may nest under project.
const TASKS = 'tasks';

export async function listUserTasks(userId, limitCount = 100) {
  const q = query(collection(db, TASKS), where('assignee_id', '==', userId), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createTaskDoc(data) {
  const now = new Date();
  const col = collection(db, TASKS);
  const docRef = await addDoc(col, {
    project_id: data.project_id,
    title: data.title,
    description: data.description || '',
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    assignee_id: data.assignee_id,
    creator_id: data.creator_id,
    due_date: data.due_date || null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    completed_at: null
  });
  const snap = await getDoc(docRef);
  return { id: docRef.id, ...snap.data() };
}

export async function updateTaskDoc(id, fields) {
  const ref = doc(db, TASKS, id);
  const updates = { ...fields, updated_at: new Date().toISOString() };
  if (fields.status === 'done' && !fields.completed_at) {
    updates.completed_at = new Date().toISOString();
  }
  await updateDoc(ref, updates);
  const snap = await getDoc(ref);
  return { id: snap.id, ...snap.data() };
}

export async function deleteTaskDoc(id) {
  await deleteDoc(doc(db, TASKS, id));
  return id;
}
