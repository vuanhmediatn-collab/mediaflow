import React, { useState, useEffect } from 'react';
import { LocalDB, Task, Project, User } from '../db/localDb';
import { BarChart3, TrendingUp, Sparkles, PieChart, Calendar, Award } from 'lucide-react';

export const StatsView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const allTasks = await LocalDB.getTasks();
      const allProjects = await LocalDB.getProjects();
      const allUsers = await LocalDB.getUsers();
      setTasks(allTasks);
      setProjects(allProjects);
      setUsers(allUsers);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return <div style={{ fontSize: '0.88rem', fontFamily: 'var(--font-tech)', color: 'var(--accent)' }}>EXTRACTING PERFORMANCE TELEMETRY...</div>;
  }

  // Statistics
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Hoàn thành').length;
  const overdue = tasks.filter(t => t.status === 'Trễ hạn').length;
  const active = total - completed - overdue;

  // Department counts
  const depts = {
    'Editor': tasks.filter(t => t.position === 'Editor').length,
    'Cameraman': tasks.filter(t => t.position === 'Cameraman').length,
    'TikTok': tasks.filter(t => t.position === 'TikTok').length,
    'Biên tập nội dung': tasks.filter(t => t.position === 'Biên tập nội dung').length
  };

  // Priority counts
  const priorities = {
    'Low': tasks.filter(t => t.priority === 'Low').length,
    'Medium': tasks.filter(t => t.priority === 'Medium').length,
    'High': tasks.filter(t => t.priority === 'High').length,
    'Urgent': tasks.filter(t => t.priority === 'Urgent').length
  };

  // Best staff performer (most completed tasks)
  const staffStats = users.filter(u => u.role === 'staff').map(u => {
    const count = tasks.filter(t => t.assigneeId === u.id && t.status === 'Hoàn thành').length;
    return { name: u.fullName, count, avatar: u.avatar, position: u.position };
  }).sort((a, b) => b.count - a.count);

  const starPerformer = staffStats[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-title-section">
        <div>
          <h2 className="page-title">THỐNG KÊ HIỆU SUẤT TRUYỀN THÔNG</h2>
          <p className="page-subtitle">Phân tích năng suất, phân bổ tài nguyên và tỷ lệ trễ hạn của các bộ phận</p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="liquid-glass hud-corner-ticks stat-card">
          <span className="stat-label">Tỉ lệ hoàn thành (Success)</span>
          <div className="stat-value" style={{ color: 'var(--status-done)' }}>
            {total > 0 ? Math.round((completed / total) * 100) : 0}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Mục tiêu tối thiểu: <strong>85%</strong>
          </div>
        </div>

        <div className="liquid-glass hud-corner-ticks stat-card">
          <span className="stat-label">Tỉ lệ trễ hạn (Delay Rate)</span>
          <div className="stat-value" style={{ color: 'var(--status-overdue)' }}>
            {total > 0 ? Math.round((overdue / total) * 100) : 0}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Hạn chế dưới <strong>10%</strong>
          </div>
        </div>

        {starPerformer && starPerformer.count > 0 && (
          <div 
            className="liquid-glass hud-corner-ticks stat-card" 
            style={{ 
              gridColumn: 'span 2', 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.04) 0%, rgba(236, 72, 153, 0.03) 100%)',
              borderColor: 'rgba(139, 92, 246, 0.15)'
            }}
          >
            <div className="stat-icon" style={{ color: 'var(--accent-purple)' }}><Award size={48} /></div>
            <div>
              <span className="stat-label" style={{ color: 'var(--accent-purple)' }}>Ngôi sao năng suất tuần</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                <img 
                  src={starPerformer.avatar} 
                  alt={starPerformer.name} 
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-purple)' }} 
                />
                <div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{starPerformer.name}</span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 650 }}>
                    Vị trí: <strong>{starPerformer.position}</strong> | Đã hoàn thành <strong>{starPerformer.count} công việc lớn</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SVG Charts split grid */}
      <div className="layout-grid">
        {/* Left Side: Department Allocation Pie chart */}
        <div className="liquid-glass hud-corner-ticks" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '0.98rem', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={16} style={{ color: 'var(--accent-cyan)' }} />
            Phân bổ khối lượng công việc theo bộ phận
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '32px' }}>
            {/* SVG Donut Circle */}
            <svg width="180" height="180" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(15, 23, 42, 0.03)" strokeWidth="4" />
              
              {/* Editor slice */}
              <circle 
                cx="21" cy="21" r="15.915" 
                fill="transparent" 
                stroke="var(--accent)" 
                strokeWidth="4.2" 
                strokeDasharray={`${total > 0 ? (depts['Editor'] / total) * 100 : 0} ${total > 0 ? 100 - (depts['Editor'] / total) * 100 : 100}`} 
                strokeDashoffset="0"
              />

              {/* Cameraman slice */}
              <circle 
                cx="21" cy="21" r="15.915" 
                fill="transparent" 
                stroke="var(--accent-cyan)" 
                strokeWidth="4.2" 
                strokeDasharray={`${total > 0 ? (depts['Cameraman'] / total) * 100 : 0} ${total > 0 ? 100 - (depts['Cameraman'] / total) * 100 : 100}`} 
                strokeDashoffset={`-${total > 0 ? (depts['Editor'] / total) * 100 : 0}`}
              />

              {/* TikTok slice */}
              <circle 
                cx="21" cy="21" r="15.915" 
                fill="transparent" 
                stroke="var(--accent-purple)" 
                strokeWidth="4.2" 
                strokeDasharray={`${total > 0 ? (depts['TikTok'] / total) * 100 : 0} ${total > 0 ? 100 - (depts['TikTok'] / total) * 100 : 100}`} 
                strokeDashoffset={`-${total > 0 ? ((depts['Editor'] + depts['Cameraman']) / total) * 100 : 0}`}
              />

              {/* Writer slice */}
              <circle 
                cx="21" cy="21" r="15.915" 
                fill="transparent" 
                stroke="var(--accent-pink)" 
                strokeWidth="4.2" 
                strokeDasharray={`${total > 0 ? (depts['Biên tập nội dung'] / total) * 100 : 0} ${total > 0 ? 100 - (depts['Biên tập nội dung'] / total) * 100 : 100}`} 
                strokeDashoffset={`-${total > 0 ? ((depts['Editor'] + depts['Cameraman'] + depts['TikTok']) / total) * 100 : 0}`}
              />
            </svg>

            {/* Labels legends */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '180px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }} />
                  <strong>Editor:</strong>
                </span>
                <span>{depts['Editor']} tasks ({total > 0 ? Math.round((depts['Editor'] / total) * 100) : 0}%)</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                  <strong>Cameraman:</strong>
                </span>
                <span>{depts['Cameraman']} tasks ({total > 0 ? Math.round((depts['Cameraman'] / total) * 100) : 0}%)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-purple)' }} />
                  <strong>TikTok / Social:</strong>
                </span>
                <span>{depts['TikTok']} tasks ({total > 0 ? Math.round((depts['TikTok'] / total) * 100) : 0}%)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-pink)' }} />
                  <strong>Biên tập nội dung:</strong>
                </span>
                <span>{depts['Biên tập nội dung']} tasks ({total > 0 ? Math.round((depts['Biên tập nội dung'] / total) * 100) : 0}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Priority distribution Bar graph */}
        <div className="liquid-glass hud-corner-ticks" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '0.98rem', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={16} style={{ color: 'var(--accent-pink)' }} />
            Mức độ khẩn cấp của công việc
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Low */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 650 }}>
                <span>Ưu tiên thấp (Low)</span>
                <span>{priorities['Low']} tasks</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(15, 23, 42, 0.03)', borderRadius: '6px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${total > 0 ? (priorities['Low'] / total) * 100 : 0}%`, 
                    height: '100%', 
                    background: 'var(--priority-low)', 
                    borderRadius: '6px' 
                  }} 
                />
              </div>
            </div>

            {/* Medium */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 650 }}>
                <span>Ưu tiên trung bình (Medium)</span>
                <span>{priorities['Medium']} tasks</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(15, 23, 42, 0.03)', borderRadius: '6px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${total > 0 ? (priorities['Medium'] / total) * 100 : 0}%`, 
                    height: '100%', 
                    background: 'var(--priority-medium)', 
                    borderRadius: '6px' 
                  }} 
                />
              </div>
            </div>

            {/* High */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 650 }}>
                <span>Ưu tiên cao (High)</span>
                <span>{priorities['High']} tasks</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(15, 23, 42, 0.03)', borderRadius: '6px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${total > 0 ? (priorities['High'] / total) * 100 : 0}%`, 
                    height: '100%', 
                    background: 'var(--priority-high)', 
                    borderRadius: '6px' 
                  }} 
                />
              </div>
            </div>

            {/* Urgent */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 650, color: 'var(--priority-urgent)' }}>
                <span>Khẩn cấp / Gấp (Urgent)</span>
                <span>{priorities['Urgent']} tasks</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(15, 23, 42, 0.03)', borderRadius: '6px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${total > 0 ? (priorities['Urgent'] / total) * 100 : 0}%`, 
                    height: '100%', 
                    background: 'var(--priority-urgent)', 
                    borderRadius: '6px' 
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
