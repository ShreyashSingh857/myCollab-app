import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Trigger: maintain project task status counts
export const onTaskWrite = functions.firestore
  .document('tasks/{taskId}')
  .onWrite(async (change, context) => {
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;
    const projectId = after?.project_id || before?.project_id;
    if (!projectId) return;

    // Recompute counts (simple version) - can optimize with incremental logic
    const snap = await db.collection('tasks').where('project_id', '==', projectId).get();
    let todo = 0, in_progress = 0, done = 0;
    snap.forEach(doc => {
      const s = doc.data().status;
      if (s === 'todo') todo++; else if (s === 'in_progress') in_progress++; else if (s === 'done') done++;
    });
    await db.collection('projects').doc(projectId).update({
      status_counts: { todo, in_progress, done },
      updated_at: new Date().toISOString()
    });

    // If newly completed, ensure completed_at set (server authoritative)
    if (after && after.status === 'done' && !after.completed_at) {
      await change.after.ref.update({ completed_at: new Date().toISOString() });
    }
  });

// Trigger: log activity for task create/update/delete
export const logTaskActivity = functions.firestore
  .document('tasks/{taskId}')
  .onWrite(async (change, context) => {
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;
    let type = 'unknown';
    if (!before && after) type = 'task_created';
    else if (before && after) {
      if (before.status !== after.status) type = 'task_status_changed';
      else type = 'task_updated';
    } else if (before && !after) type = 'task_deleted';

    const base = after || before;
    if (!base) return;

    await db.collection('activity').add({
      project_id: base.project_id,
      task_id: context.params.taskId,
      type,
      meta: {},
      created_at: new Date().toISOString()
    });
  });

// Callable to join project via join_code
export const joinProject = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in required');
  const { join_code } = data;
  if (!join_code) throw new functions.https.HttpsError('invalid-argument', 'join_code required');
  // Find project with code
  const projSnap = await db.collection('projects').where('join_code', '==', join_code).limit(1).get();
  if (projSnap.empty) throw new functions.https.HttpsError('not-found', 'Invalid code');
  const projDoc = projSnap.docs[0];
  const projectId = projDoc.id;
  const userId = context.auth.uid;
  // Upsert membership document (flattened id = project_user)
  const memberId = projectId + '_' + userId;
  await db.collection('members').doc(memberId).set({ project_id: projectId, user_id: userId, role: 'collaborator', created_at: new Date().toISOString() }, { merge: true });
  return { projectId };
});
