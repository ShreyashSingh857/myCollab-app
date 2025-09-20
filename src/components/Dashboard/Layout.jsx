import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from './Sidebar.jsx';
import HeaderBar from './HeaderBar.jsx';
import DashboardHome from './DashboardHome.jsx';
import ProjectModal from './ProjectModal.jsx';
import TaskModal from './TaskModal.jsx';
import { loadDashboard } from '../../store/dashboardSlice';
import { loadProjects } from '../../store/projectSlice';
import { loadMyTasks } from '../../store/taskSlice';

export default function Layout() {
  const dispatch = useDispatch();
  const user = useSelector(s => s.auth.user);
  const [showProject, setShowProject] = React.useState(false);
  const [showTask, setShowTask] = React.useState(false);
  useEffect(() => {
    if (user?.id) {
      dispatch(loadDashboard());
      dispatch(loadProjects());
      dispatch(loadMyTasks());
    }
  }, [dispatch, user?.id]);
  return (
    <div className="dash-shell">
      <Sidebar onNewProject={()=>setShowProject(true)} onNewTask={()=>setShowTask(true)} />
      <div className="dash-main">
        <HeaderBar />
        <div className="dash-content">
          <DashboardHome onNewTask={()=>setShowTask(true)} />
        </div>
      </div>
      <ProjectModal open={showProject} onClose={()=>setShowProject(false)} />
      <TaskModal open={showTask} onClose={()=>setShowTask(false)} />
    </div>
  );
}
