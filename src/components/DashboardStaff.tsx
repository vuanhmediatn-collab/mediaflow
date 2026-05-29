import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LocalDB, Task, Project } from '../db/localDb';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ClipboardList
} from 'lucide-react';

interface DashboardStaffProps {
  onViewTasks: () => void;
  onViewReports: () => void;
}

export const DashboardStaff: React.FC<DashboardStaffProps> = ({ onViewTasks, onViewReports }) => {
  const { currentUser } = useAuth();
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        const allTasks = await LocalDB.getTasks();
        const filtered = allTasks.filter(t => t.assigneeId === currentUser.id);
        const allProjects = await LocalDB.getProjects();
        setMyTasks(filtered);
        setProjects(allProjects);
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  if (!currentUser) return null;

  if (loading) {
    return <div style={{ fontSize: '0.88rem', fontFamily: 'var(--font-tech)', color: 'var(--accent)' }}>LOADING ACCOUNT TELEMETRY...</div>;
  }

  // Calculate statistics
  const total = myTasks.length;
  const doing = myTasks.filter(t => t.status === 'Đang làm').length;
  const pending = myTasks.filter(t => t.status === 'Chờ duyệt').length;
  const overdue = myTasks.filter(t => t.status === 'Trễ hạn').length;
  const completed = myTasks.filter(t => t.status === 'Hoàn thành').length;

  const urgentTasks = myTasks
    .filter(t => t.status !== 'Hoàn thành' && (t.priority === 'Urgent' || t.priority === 'High'))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  // Creative media professional quotes
  const quotes = [
    "Một sản phẩm media xuất sắc cần sự tỉ mỉ trong từng khung hình và chiều sâu trong từng câu chữ.",
    "Sáng tạo không có giới hạn, hãy biến những ý tưởng điên rồ nhất thành sản phẩm viral!",
    "Đồng bộ góc quay và nhịp dựng chính là chìa khóa tạo nên nhịp điệu hoàn hảo cho video.",
    "SEO TikTok không chỉ là hashtag, đó là nghệ thuật thấu hiểu hành vi người xem trong 3 giây đầu tiên."
  ];
  
  // Pick quote based on position or random
  const userQuote = quotes[currentUser.position === 'Editor' ? 2 : currentUser.position === 'TikTok' ? 3 : currentUser.position === 'Cameraman' ? 2 : 0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner */}
      <div 
        className="liquid-glass hud-corner-ticks" 
        style={{ 
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.05) 0%, rgba(6, 182, 212, 0.03) 100%)',
          borderColor: 'rgba(2, 132, 199, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <img 
            src={currentUser.avatar} 
            alt={currentUser.fullName} 
            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--accent)' }} 
          />
          <div style={{ flexGrow: 1 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Xin chào, {currentUser.fullName}!
              <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} />
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 550, maxWidth: '640px', lineHeight: 1.5 }}>
              "{userQuote}"
            </p>
          </div>
        </div>
      </div>

      {/* Stats KPI Cards */}
      <div className="stats-grid">
        <div className="liquid-glass hud-corner-ticks stat-card">
          <div className="stat-icon"><CheckSquare size={48} /></div>
          <div>
            <span className="stat-label">Tổng việc được giao</span>
            <div className="stat-value">{total}</div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 650 }}>
            Tỉ lệ hoàn thành: <span style={{ color: 'var(--status-done)', fontWeight: 800 }}>{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
          </div>
        </div>

        <div className="liquid-glass hud-corner-ticks stat-card" style={{ borderColor: 'rgba(2, 132, 199, 0.2)' }}>
          <div className="stat-icon" style={{ color: 'var(--status-doing)' }}><Sparkles size={48} /></div>
          <div>
            <span className="stat-label">Đang làm việc</span>
            <div className="stat-value" style={{ color: 'var(--status-doing)' }}>{doing}</div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 650 }}>
            Đầu việc đang thực thi
          </div>
        </div>

        <div className="liquid-glass hud-corner-ticks stat-card" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
          <div className="stat-icon" style={{ color: 'var(--status-pending)' }}><Clock size={48} /></div>
          <div>
            <span className="stat-label">Đang chờ duyệt</span>
            <div className="stat-value" style={{ color: 'var(--status-pending)' }}>{pending}</div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 650 }}>
            Đang đợi sếp Thế Anh đánh giá
          </div>
        </div>

        <div className="liquid-glass hud-corner-ticks stat-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div className="stat-icon" style={{ color: 'var(--status-overdue)' }}><AlertTriangle size={48} /></div>
          <div>
            <span className="stat-label">Việc bị trễ hạn</span>
            <div className="stat-value" style={{ color: 'var(--status-overdue)' }}>{overdue}</div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--priority-urgent)', marginTop: '8px', fontWeight: 800 }}>
            Cần ưu tiên xử lý gấp!
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="layout-grid">
        {/* Left Side: Tasks need attention */}
        <div className="liquid-glass hud-corner-ticks" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '0.98rem', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} style={{ color: 'var(--priority-urgent)' }} />
            Việc khẩn cấp cần chú ý
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {urgentTasks.length > 0 ? (
              urgentTasks.map((task) => {
                const proj = projects.find(p => p.id === task.projectId);
                return (
                  <div 
                    key={task.id} 
                    style={{ 
                      padding: '16px', 
                      background: 'rgba(255, 255, 255, 0.35)', 
                      border: '1px solid rgba(255, 255, 255, 0.5)', 
                      borderRadius: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '75%' }}>
                      <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-tech)', color: 'var(--accent)', fontWeight: 'bold' }}>
                        DỰ ÁN: {proj ? proj.name.toUpperCase() : 'N/A'}
                      </span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text)' }}>
                        {task.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 550 }}>
                        Hạn chót: <strong style={{ color: 'var(--priority-urgent)' }}>{task.deadline}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                      <span className={`status-badge status-badge-${task.status === 'Đang làm' ? 'doing' : task.status === 'Cần sửa' ? 'repair' : 'none'}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                🎉 Tuyệt vời! Không có công việc khẩn cấp nào đang chờ xử lý.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick shortcuts */}
        <div className="liquid-glass hud-corner-ticks" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '0.98rem', textTransform: 'uppercase', marginBottom: '20px' }}>
            Lối tắt hành động
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={onViewTasks}
              className="glass-btn glass-btn-primary" 
              style={{ width: '100%', padding: '12px 16px', justifyContent: 'space-between' }}
            >
              <span>Xem Bảng Công Việc Của Tôi</span>
              <ArrowRight size={16} />
            </button>

            <button 
              onClick={onViewReports}
              className="glass-btn" 
              style={{ width: '100%', padding: '12px 16px', justifyContent: 'space-between' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={16} style={{ color: 'var(--accent)' }} />
                Gửi Báo Cáo Ngày / Vấn Đề
              </span>
              <ArrowRight size={16} />
            </button>
            
            <div 
              style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-muted)', 
                lineHeight: 1.4, 
                background: 'rgba(6, 182, 212, 0.04)', 
                border: '1px dashed rgba(6, 182, 212, 0.15)', 
                padding: '12px',
                borderRadius: '12px',
                marginTop: '10px'
              }}
            >
              <strong>💡 Hướng dẫn nhanh:</strong> Click vào <strong>"Công việc được giao"</strong> trên Sidebar để mở bảng Kanban, nhấn vào từng task để cập nhật checklist, thêm ghi chú hoặc đính kèm link sản phẩm (Drive/NAS) bàn giao cho Admin.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
