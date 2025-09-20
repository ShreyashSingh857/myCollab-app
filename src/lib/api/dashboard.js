import { supabase } from '../../lib/supabase';

export async function fetchDashboardSummary() {
  const { data, error } = await supabase.rpc('get_dashboard_summary');
  if (error) throw error;
  return data;
}

export async function fetchProjectsWithCounts() {
  // join projects with project_task_counts view (if exists) else fallback
  const query = supabase.from('projects')
    .select('id,name,description,is_archived,updated_at,owner_id, project_task_counts(total,done)')
    .neq('is_archived', true)
    .order('updated_at', { ascending: false })
    .limit(50);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(p => {
    const total = p.project_task_counts?.[0]?.total || 0;
    const done = p.project_task_counts?.[0]?.done || 0;
    return { ...p, total, done, progress: total ? (done / total) * 100 : 0 };
  });
}

export async function fetchMyTasks(userId) {
  if (!userId) return [];
  const { data, error } = await supabase.from('tasks')
    .select('id,title,status,priority,due_date,assignee_id,project_id')
    .eq('assignee_id', userId)
    .order('updated_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
}

export async function fetchRecentActivity() {
  // summary RPC already returns recent_activity; this is fallback if needed
  const { data, error } = await supabase
    .from('activity_log')
    .select('id,project_id,task_id,type,meta,created_at')
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data || [];
}

export async function createProject(payload) {
  const { data, error } = await supabase.from('projects').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function ensureOwnerMembership(projectId, userId) {
  // Insert ignore if membership already exists
  const { error } = await supabase.from('project_members').upsert({ project_id: projectId, user_id: userId, role: 'owner' }, { onConflict: 'project_id,user_id' });
  if (error) throw error;
}

export async function createTask(payload) {
  const { data, error } = await supabase.from('tasks').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateTaskFields(id, fields) {
  const { data, error } = await supabase.from('tasks').update(fields).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchMyRole(projectId, userId) {
  if (!projectId || !userId) return null;
  const { data, error } = await supabase.from('project_members').select('role').eq('project_id', projectId).eq('user_id', userId).single();
  if (error) return null;
  return data?.role || null;
}
