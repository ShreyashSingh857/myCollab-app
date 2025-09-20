import React from 'react';
import StatusSnapshot from './widgets/StatusSnapshot.jsx';
import MyTasksWidget from './widgets/MyTasksWidget.jsx';
import ActivityWidget from './widgets/ActivityWidget.jsx';
import DeadlinesWidget from './widgets/DeadlinesWidget.jsx';

export default function DashboardHome({ onNewTask }) {
  return (
    <div className="dash-grid">
      <div className="grid-span-2"><StatusSnapshot /></div>
      <div className="grid-span-1"><DeadlinesWidget /></div>
      <div className="grid-span-2"><MyTasksWidget onNewTask={onNewTask} /></div>
      <div className="grid-span-1"><ActivityWidget /></div>
    </div>
  );
}
