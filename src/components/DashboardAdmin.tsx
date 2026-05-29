import React, { useState, useEffect } from 'react';
import { LocalDB, Task, User, Project } from '../db/localDb';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Calendar,
  ChevronRight,
  Plus
} from 'lucide-react';

interface DashboardAdminProps {
  onViewTasks: () => void;
}

export const DashboardAdmin: React.FC<DashboardAdminProps> = ({ onViewTasks }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const allTasks = await LocalDB.getTasks();
      const allUsers = await LocalDB.getUsers();
      const allProjects = await LocalDB.getProjects();
      setTasks(allTasks);
      setUsers(allUsers);
      setProjects(allProjects);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ fontSize: '0.88rem', fontFamily: 'var(--font-tech)', color: 'var(--accent)' }}>LOADING TELEMETRY...</div>;
  }

  // Calculate statistics
  const totalTasks = tasks.length;
  const doingTasks = tasks.filter(t => t.status === 'Đang làm').length;
  const overdueTasks = tasks.filter(t => t.status === 'Trễ hạn').length;
  const pendingTasks = tasks.filter(t => t.status === 'Chờ duyệt').length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday = tasks.filter(t => 
    t.status === 'Hoàn thành' && 
    t.logs.some(l => l.text.includes('Hoàn thành') && l.createdAt.startsWith(todayStr))
  ).length;

  const completionRate = totalTasks > 0 
    ? Math.round((tasks.filter(t => t.status === 'Hoàn thành').length / totalTasks) * 100) 
    : 0;

  // Soon deadlines list (within 3 days, excluding completed)
  const soonDeadlines = tasks
    .filter(t => t.status !== 'Hoàn thành')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  // Dynamic user list with completion rates
  const staffPerformance = users.filter(u => u.role === 'staff').map(user => {
    const userTasks = tasks.filter(t => t.assigneeId === user.id);
    const completed = userTasks.filter(t => t.status === 'Hoàn thành').length;
    const total = userTasks.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      ...user,
      total,
      completed,
      percent
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header section */}
      <div>
        <div className="page-title-section">
          <div>
            <h2 className="page-title">SYSTEM DASHBOARD</h2>
            <p className="page-subtitle">Tổng quan vận hành và kiểm soát hiệu suất team Media</p>
          </div>
          <div className="hud-telemetry" style={{ border: 'none', padding: 0, margin: 0 }}>
            <span>ACTIVE PROJECT GROUPS: {projects.length}</span>
          </div>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="stats-grid">
        <div className="liquid-glass hud-corner-ticks stat-card">
          <div className="stat-icon"><CheckSquare size={48} /></div>
          <div>
            <span className="stat-label">Tổng công việc</span>
            <div className="stat-value">{totalTasks}</div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 650 }}>
            Tỉ lệ hoàn thành chung: <span style={{ color: 'var(--status-done)', fontWeight: 800 }}>{completionRate}%</span>
          </div>
        </div>

        <div className="liquid-glass hud-corner-ticks stat-card" style={{ borderColor: 'rgba(2, 132, 199, 0.2)' }}>
          <div className="stat-icon" style={{ color: 'var(--status-doing)' }}><TrendingUp size={48} /></div>
          <div>
            <span className="stat-label">Đang triển khai</span>
            <div className="stat-value" style={{ color: 'var(--status-doing)' }}>{doingTasks}</div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 650 }}>
            Đang sản xuất / viết content
          </div>
        </div>

        <div className="liquid-glass hud-corner-ticks stat-card" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
          <div className="stat-icon" style={{ color: 'var(--status-pending)' }}><Clock size={48} /></div>
          <div>
            <span className="stat-label">Đang chờ duyệt</span>
            <div className="stat-value" style={{ color: 'var(--status-pending)' }}>{pendingTasks}</div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 650 }}>
            Admin cần kiểm duyệt duyệt file
          </div>
        </div>

        <div className="liquid-glass hud-corner-ticks stat-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div className="stat-icon" style={{ color: 'var(--status-overdue)' }}><AlertTriangle size={48} /></div>
          <div>
            <span className="stat-label">Trễ deadline</span>
            <div className="stat-value" style={{ color: 'var(--status-overdue)' }}>{overdueTasks}</div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--priority-urgent)', marginTop: '8px', fontWeight: 800 }}>
            Cần thúc đẩy nhân sự ngay!
          </div>
        </div>

        <div className="liquid-glass hud-corner-ticks stat-card" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <div className="stat-icon" style={{ color: 'var(--status-done)' }}><CheckCircle2 size={48} /></div>
          <div>
            <span className="stat-label">Xong hôm nay</span>
            <div className="stat-value" style={{ color: 'var(--status-done)' }}>{completedToday}</div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 650 }}>
            Đã bàn giao sản phẩm thành công
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="layout-grid">
        {/* Left Side: SVGs Chart & Member lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Performance Area chart */}
          <div className="liquid-glass hud-corner-ticks" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.98rem', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
              Biểu đồ năng suất sản xuất Media (Hàng tuần)
            </h3>
            
            {/* SVG Telemetry Chart */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 500 180" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* HUD Gridlines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(2, 132, 199, 0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(2, 132, 199, 0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(2, 132, 199, 0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="170" x2="500" y2="170" stroke="rgba(2, 132, 199, 0.1)" />
                
                {/* Area path */}
                <path 
                  d="M0 170 C 50 160, 100 120, 150 110 C 200 100, 250 140, 300 80 C 350 40, 400 60, 450 30 C 475 15, 500 20, 500 20 L 500 170 Z" 
                  fill="url(#chartGlow)"
                />
                
                {/* Line path */}
                <path 
                  d="M0 170 C 50 160, 100 120, 150 110 C 200 100, 250 140, 300 80 C 350 40, 400 60, 450 30 C 475 15, 500 20, 500 20" 
                  fill="none" 
                  stroke="var(--accent-cyan)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />

                {/* Nodes with pulses */}
                <circle cx="150" cy="110" r="4" fill="#ffffff" stroke="var(--accent)" strokeWidth="2" />
                <circle cx="300" cy="80" r="4" fill="#ffffff" stroke="var(--accent)" strokeWidth="2" />
                <circle cx="450" cy="30" r="4" fill="#ffffff" stroke="var(--accent-cyan)" strokeWidth="2" />

                {/* Legend labels */}
                <text x="5" y="15" fill="var(--text-muted)" fontSize="8" fontFamily="var(--font-tech)">VELOCITY INDEX: 88.5</text>
                <text x="440" y="165" fill="var(--text-muted)" fontSize="8" fontFamily="var(--font-tech)">TUẦN NÀY</text>
                <text x="280" y="165" fill="var(--text-muted)" fontSize="8" fontFamily="var(--font-tech)">TUẦN TRƯỚC</text>
                <text x="130" y="165" fill="var(--text-muted)" fontSize="8" fontFamily="var(--font-tech)">2 TUẦN TRƯỚC</text>
              </svg>
            </div>
          </div>

          {/* Member performance lists */}
          <div className="liquid-glass hud-corner-ticks" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.98rem', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ color: 'var(--accent)' }} />
              Tiến độ & Hiệu suất theo vị trí
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {staffPerformance.map((user) => (
                <div key={user.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={user.avatar} 
                        alt={user.fullName} 
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                      <div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{user.fullName}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '8px', fontFamily: 'var(--font-tech)' }}>
                          ({user.position})
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-tech)', fontFamily: 'var(--font-tech)' }}>
                      {user.completed}/{user.total} TASKS ({user.percent}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(15, 23, 42, 0.04)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${user.percent}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-cyan) 100%)', 
                        borderRadius: '99px',
                        transition: 'width 0.8s ease-out'
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Soon Deadlines & Shortcuts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Deadlines list */}
          <div className="liquid-glass hud-corner-ticks" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.98rem', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} style={{ color: 'var(--priority-urgent)' }} />
              Hạn chót khẩn cấp sắp tới
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {soonDeadlines.length > 0 ? (
                soonDeadlines.map((task) => {
                  const today = new Date();
                  const deadline = new Date(task.deadline);
                  const diffTime = deadline.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const isOverdue = diffDays < 0 || task.status === 'Trễ hạn';
                  
                  return (
                    <div 
                      key={task.id} 
                      style={{ 
                        padding: '12px', 
                        background: 'rgba(255, 255, 255, 0.35)', 
                        border: '1px solid rgba(255, 255, 255, 0.5)', 
                        borderRadius: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, lineHeight: 1.3, color: 'var(--text)' }}>
                          {task.title}
                        </span>
                        <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span style={{ fontWeight: 650, fontFamily: 'var(--font-tech)' }}>
                          {task.position}
                        </span>
                        <span 
                          style={{ 
                            fontWeight: 800, 
                            fontFamily: 'var(--font-tech)', 
                            color: isOverdue ? 'var(--priority-urgent)' : 'var(--accent)'
                          }}
                        >
                          {isOverdue ? 'TRỄ HẠN' : `HẠN CÒN ${diffDays} NGÀY`} ({task.deadline})
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Không có công việc nào sắp hết hạn.
                </div>
              )}
            </div>

            <button 
              onClick={onViewTasks}
              className="glass-btn" 
              style={{ width: '100%', marginTop: '16px', fontSize: '0.8rem', padding: '8px' }}
            >
              <span>Xem tất cả công việc</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Quick Admin Actions Panel */}
          <div className="liquid-glass hud-corner-ticks" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.98rem', textTransform: 'uppercase', marginBottom: '16px' }}>
              Thao tác nhanh
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={onViewTasks}
                className="glass-btn glass-btn-primary" 
                style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
              >
                <Plus size={16} />
                <span>TẠO MỚI CÔNG VIỆC</span>
              </button>
              
              <div 
                style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)', 
                  lineHeight: 1.4, 
                  background: 'rgba(2, 132, 199, 0.04)', 
                  border: '1px dashed rgba(2, 132, 199, 0.15)', 
                  padding: '12px',
                  borderRadius: '12px',
                  marginTop: '6px'
                }}
              >
                <strong>💡 Chỉ dẫn:</strong> Hệ thống tự động quét và cập nhật trạng thái <strong>"Trễ hạn"</strong> mỗi lần tải lại trang dựa trên thực tế thời gian hệ thống và hạn chót.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
