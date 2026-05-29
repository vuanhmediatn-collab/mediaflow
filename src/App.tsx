import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { LocalDB } from './db/localDb';

// Import all screens (we will create these next)
import { DashboardAdmin } from './components/DashboardAdmin';
import { DashboardStaff } from './components/DashboardStaff';
import { TaskBoard } from './components/TaskBoard';
import { ProjectManager } from './components/ProjectManager';
import { MemberManager } from './components/MemberManager';
import { DailyReports } from './components/DailyReports';
import { StatsView } from './components/StatsView';
import { UserProfile } from './components/UserProfile';

const MainAppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Initialize DB on boot
  useEffect(() => {
    LocalDB.init();
  }, []);

  // Secure tab routing for staff
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      const staffAllowedTabs = ['dashboard', 'tasks', 'reports', 'profile'];
      if (!staffAllowedTabs.includes(currentTab)) {
        setCurrentTab('dashboard');
      }
    }
  }, [currentUser, currentTab]);

  if (loading) {
    return (
      <div 
        style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexDirection: 'column',
          gap: '16px',
          fontFamily: 'var(--font-tech)',
          color: 'var(--accent)'
        }}
      >
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px dashed var(--accent)', animation: 'spin 1.5s linear infinite' }} />
        <span>BOOTING MEDIAFLOW SYSTEM...</span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  // Render correct tab component
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return currentUser.role === 'admin' 
          ? <DashboardAdmin onViewTasks={() => setCurrentTab('tasks')} /> 
          : <DashboardStaff onViewTasks={() => setCurrentTab('tasks')} onViewReports={() => setCurrentTab('reports')} />;
      case 'tasks':
        return <TaskBoard />;
      case 'projects':
        return currentUser.role === 'admin' ? <ProjectManager /> : null;
      case 'members':
        return currentUser.role === 'admin' ? <MemberManager /> : null;
      case 'reports':
        return <DailyReports />;
      case 'stats':
        return currentUser.role === 'admin' ? <StatsView /> : null;
      case 'profile':
        return <UserProfile />;
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="app-container" style={{ padding: '16px', gap: '16px' }}>
      {/* Decorative ambient orbs */}
      <div className="ambient-glow ambient-blue" />
      <div className="ambient-glow ambient-cyan" style={{ bottom: '-10%', right: '-10%' }} />

      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <main className="main-content">
        {renderTabContent()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
