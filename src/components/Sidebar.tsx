import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Briefcase, 
  Users, 
  ClipboardList, 
  BarChart3, 
  User, 
  LogOut,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  const menuItems = currentUser.role === 'admin' 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'tasks', label: 'Công việc', icon: <CheckSquare size={18} /> },
        { id: 'projects', label: 'Dự án / Khách', icon: <Briefcase size={18} /> },
        { id: 'members', label: 'Thành viên', icon: <Users size={18} /> },
        { id: 'reports', label: 'Báo cáo ngày', icon: <ClipboardList size={18} /> },
        { id: 'stats', label: 'Thống kê tiến độ', icon: <BarChart3 size={18} /> },
        { id: 'profile', label: 'Trang cá nhân', icon: <User size={18} /> },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard của tôi', icon: <LayoutDashboard size={18} /> },
        { id: 'tasks', label: 'Công việc được giao', icon: <CheckSquare size={18} /> },
        { id: 'reports', label: 'Gửi báo cáo ngày', icon: <ClipboardList size={18} /> },
        { id: 'profile', label: 'Trang cá nhân', icon: <User size={18} /> },
      ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header Menu Trigger */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--surface-border)',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)'
        }}
        className="mobile-header"
      >
        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={18} style={{ color: 'var(--accent)' }} />
          Vũ Anh Media
        </span>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div 
        className={`liquid-glass hud-corner-ticks sidebar-container ${isOpen ? 'open' : ''}`}
        style={{
          width: '260px',
          height: 'calc(100vh - 32px)',
          position: 'sticky',
          top: '16px',
          left: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 16px',
          zIndex: 1001,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Logo Brand area */}
          <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px dashed rgba(2, 132, 199, 0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles style={{ color: 'var(--accent-cyan)' }} size={20} />
              <h1 style={{ fontSize: '1.35rem', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '-0.02em', background: 'linear-gradient(to right, var(--text), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Vũ Anh Media
              </h1>
            </div>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-tech)' }}>
              MEDIAFLOW WORKFLOW HUB
            </span>
          </div>

          {/* User profile capsule */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '12px', 
              background: 'rgba(255, 255, 255, 0.35)', 
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.5)'
            }}
          >
            <img 
              src={currentUser.avatar} 
              alt={currentUser.fullName} 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent)' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.fullName}
              </span>
              <span 
                style={{ 
                  fontSize: '0.65rem', 
                  fontFamily: 'var(--font-tech)', 
                  color: 'var(--accent)', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase' 
                }}
              >
                {currentUser.role === 'admin' ? 'DIRECTOR / ADMIN' : currentUser.position}
              </span>
            </div>
          </div>

          {/* Navigation items list */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {menuItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    background: active ? 'var(--text)' : 'transparent',
                    color: active ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    textAlign: 'left',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: active ? '0 8px 24px rgba(15, 23, 42, 0.15)' : 'none'
                  }}
                  className={active ? '' : 'sidebar-btn-hover'}
                >
                  <span style={{ color: active ? 'var(--accent-cyan)' : 'inherit', display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="hud-telemetry" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
            <span>UPTIME: 100%</span>
            <span>SEC_LOC: ON</span>
          </div>
          <button
            onClick={logout}
            className="glass-btn"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              padding: '10px 16px',
              color: 'var(--priority-urgent)',
              background: 'rgba(239, 68, 68, 0.03)',
              borderColor: 'rgba(239, 68, 68, 0.08)'
            }}
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Embedded CSS specific to layout container */}
      <style>{`
        @media (max-width: 1024px) {
          .sidebar-container {
            position: fixed !important;
            top: 60px !important;
            left: 0 !important;
            bottom: 0 !important;
            height: calc(100vh - 60px) !important;
            border-radius: 0 !important;
            width: 260px !important;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
            box-shadow: 16px 0 48px rgba(15, 23, 42, 0.08) !important;
            background: rgba(255, 255, 255, 0.75) !important;
            backdrop-filter: blur(28px) saturate(1.2) !important;
            border: none !important;
            border-right: 1px solid var(--surface-border) !important;
          }
          
          .sidebar-container.open {
            transform: translateX(0);
          }
          
          .mobile-header {
            display: flex !important;
          }
          
          .app-container {
            padding-top: 60px !important;
          }
        }
        
        .sidebar-btn-hover:hover {
          background: rgba(2, 132, 199, 0.05) !important;
          color: var(--accent) !important;
          border-color: rgba(2, 132, 199, 0.12) !important;
          transform: translateX(4px);
        }
      `}</style>
    </>
  );
};
