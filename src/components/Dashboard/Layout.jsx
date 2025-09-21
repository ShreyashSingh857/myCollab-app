import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from './Sidebar.jsx';
import HeaderBar from './HeaderBar.jsx';
import DashboardHome from './DashboardHome.jsx';
import ActivityFeed from '../Activity/ActivityFeed.jsx';
import ProjectModal from './ProjectModal.jsx';
import TaskModal from './TaskModal.jsx';
import { loadDashboard } from '../../store/dashboardSlice';
import { loadProjects, setProjects } from '../../store/projectSlice';
import { loadMyTasks, setTasks } from '../../store/taskSlice';
import { USE_FIREBASE } from '../../config';

export default function Layout() {
  const dispatch = useDispatch();
  const user = useSelector(s => s.auth.user);
  const [showProject, setShowProject] = React.useState(false);
  const [showTask, setShowTask] = React.useState(false);
  const projects = useSelector(s => s.projects.list || []);
  useEffect(() => {
    if (!user?.id) return;
    // Initial loads (useful fallback, also for non-Firebase mode)
    dispatch(loadDashboard());
    dispatch(loadProjects());
    dispatch(loadMyTasks());
    // Real-time subscriptions removed; we rely on initial loads via SQL (Supabase)
    return undefined;
  }, [dispatch, user?.id]);
  return (
    <div className="dash-shell">
      <Sidebar onNewProject={()=>setShowProject(true)} onNewTask={()=>setShowTask(true)} />
      <div className="dash-main">
        <HeaderBar />
        <div className="dash-content">
          <DashboardHome onNewTask={()=>setShowTask(true)} />
          {/* Activity feed for the first project (if available) */}
          {projects.length > 0 && <ActivityFeed projectId={projects[0].id} />}
        </div>
      </div>
      <ProjectModal open={showProject} onClose={()=>setShowProject(false)} />
      <TaskModal open={showTask} onClose={()=>setShowTask(false)} />
    </div>
  );
}
