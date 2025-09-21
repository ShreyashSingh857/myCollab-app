#!/usr/bin/env node
/**
 * Migration Script: Supabase Postgres -> Firestore
 * Strategy: Export data from Supabase via REST or SQL (outside this script) into JSON files, then import here.
 * Expected input files (place in ./exports):
 *  - projects.json : [{id, name, description, owner_id, join_code, created_at, updated_at, is_archived}]
 *  - tasks.json    : [{id, project_id, title, description, status, priority, assignee_id, creator_id, due_date, created_at, updated_at, completed_at}]
 *  - project_members.json : [{project_id, user_id, role, created_at}]
 *  - activity_log.json (optional) : [{id, project_id, task_id, type, meta, created_at}]
 *
 * Firestore mapping (flat collections):
 *  projects -> projects
 *  tasks -> tasks
 *  project_members -> members (doc id: projectId_userId)
 *  activity_log -> activity
 *
 * Run:
 *   set GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json (PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS="..." )
 *   node scripts/migrateSupabaseToFirestore.mjs --dir ./exports --batch 300 --dryRun
 *   Remove --dryRun to execute.
 */

import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(msg, ...rest) { console.log(`[migrate] ${msg}`, ...rest); }
function err(msg, ...rest) { console.error(`[migrate:err] ${msg}`, ...rest); }

const args = process.argv.slice(2);
function getArg(flag, def = null) {
  const idx = args.indexOf(flag);
  if (idx === -1) return def;
  return args[idx + 1] ?? true;
}
const dir = getArg('--dir', path.join(__dirname, 'exports'));
const batchSize = parseInt(getArg('--batch', '400'), 10);
const dryRun = args.includes('--dryRun');
const skipActivity = args.includes('--skipActivity');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  err('GOOGLE_APPLICATION_CREDENTIALS not set');
  process.exit(1);
}

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

function readJson(name, required = true) {
  const fp = path.join(dir, name);
  if (!fs.existsSync(fp)) {
    if (required) { err(`Missing file: ${fp}`); process.exit(1); }
    return [];
  }
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

const projects = readJson('projects.json');
const tasks = readJson('tasks.json');
const members = readJson('project_members.json');
const activity = skipActivity ? [] : readJson('activity_log.json', false);

log(`Loaded: projects=${projects.length} tasks=${tasks.length} members=${members.length} activity=${activity.length}`);

// Helper to chunk arrays
function chunk(arr, size) { const out=[]; for (let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size)); return out; }

async function migrateProjects() {
  log('Migrating projects...');
  const chunks = chunk(projects, batchSize);
  let count = 0;
  for (const ch of chunks) {
    if (!dryRun) {
      const batch = db.batch();
      ch.forEach(p => {
        const ref = db.collection('projects').doc(p.id); // keep original id for referential integrity
        batch.set(ref, {
          name: p.name,
            description: p.description || '',
            owner_id: p.owner_id,
            join_code: p.join_code || null,
            status_counts: p.status_counts || { todo:0, in_progress:0, done:0 },
            created_at: p.created_at,
            updated_at: p.updated_at,
            is_archived: !!p.is_archived
        }, { merge: true });
      });
      await batch.commit();
    }
    count += ch.length;
    log(`Projects migrated: ${count}/${projects.length}`);
  }
}

async function migrateMembers() {
  log('Migrating members...');
  const chunks = chunk(members, batchSize);
  let count = 0;
  for (const ch of chunks) {
    if (!dryRun) {
      const batch = db.batch();
      ch.forEach(m => {
        const id = `${m.project_id}_${m.user_id}`;
        const ref = db.collection('members').doc(id);
        batch.set(ref, {
          project_id: m.project_id,
          user_id: m.user_id,
          role: m.role || 'collaborator',
          created_at: m.created_at || new Date().toISOString()
        }, { merge: true });
      });
      await batch.commit();
    }
    count += ch.length; log(`Members migrated: ${count}/${members.length}`);
  }
}

async function migrateTasks() {
  log('Migrating tasks...');
  const chunks = chunk(tasks, batchSize);
  let count = 0;
  for (const ch of chunks) {
    if (!dryRun) {
      const batch = db.batch();
      ch.forEach(t => {
        const ref = db.collection('tasks').doc(t.id);
        batch.set(ref, {
          project_id: t.project_id,
          title: t.title,
          description: t.description || '',
          status: t.status || 'todo',
          priority: t.priority || 'medium',
          assignee_id: t.assignee_id,
          creator_id: t.creator_id,
          due_date: t.due_date || null,
          created_at: t.created_at,
          updated_at: t.updated_at,
          completed_at: t.completed_at || (t.status === 'done' ? (t.completed_at || t.updated_at) : null)
        }, { merge: true });
      });
      await batch.commit();
    }
    count += ch.length; log(`Tasks migrated: ${count}/${tasks.length}`);
  }
}

async function migrateActivity() {
  if (!activity.length) { log('No activity to migrate (skipped or empty).'); return; }
  log('Migrating activity...');
  const chunks = chunk(activity, batchSize);
  let count = 0;
  for (const ch of chunks) {
    if (!dryRun) {
      const batch = db.batch();
      ch.forEach(a => {
        const ref = db.collection('activity').doc(a.id);
        batch.set(ref, {
          project_id: a.project_id,
          task_id: a.task_id || null,
          type: a.type || 'unknown',
          meta: a.meta || {},
          created_at: a.created_at
        }, { merge: true });
      });
      await batch.commit();
    }
    count += ch.length; log(`Activity migrated: ${count}/${activity.length}`);
  }
}

async function verifyCounts() {
  log('Verifying project task counts (sample)...');
  // Optionally, re-run aggregation or schedule function; here we just log diff for first few projects.
  for (const p of projects.slice(0,5)) {
    const snap = await db.collection('tasks').where('project_id','==',p.id).get();
    const total = snap.size;
    const done = snap.docs.filter(d => d.data().status === 'done').length;
    log(`Project ${p.id} total=${total} done=${done}`);
  }
}

(async () => {
  const start = Date.now();
  log(`Starting migration (dryRun=${dryRun}) using dir=${dir}`);
  await migrateProjects();
  await migrateMembers();
  await migrateTasks();
  await migrateActivity();
  if (!dryRun) await verifyCounts();
  log(`Migration complete in ${(Date.now()-start)/1000}s`);
})();
