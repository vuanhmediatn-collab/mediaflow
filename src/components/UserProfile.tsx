import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LocalDB, User, Task } from '../db/localDb';
import { User as UserIcon, Shield, Film, Video, Share2, FileText, Key, CheckCircle, Save } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
      const allTasks = LocalDB.getTasksSync();
      if (currentUser.role === 'admin') {
        setTasks(allTasks); // Admin sees system stats
      } else {
        setTasks(allTasks.filter(t => t.assigneeId === currentUser.id)); // Staff sees personal stats
      }
    }
  }, [currentUser]);

  if (!currentUser) return null;

  // Personal statistics
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Hoàn thành').length;
  const overdue = tasks.filter(t => t.status === 'Trễ hạn').length;
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên.');
      return;
    }

    if (password.trim() && password !== confirmPassword) {
      setErrorMsg('Mật khẩu mới và xác nhận mật khẩu không khớp nhau.');
      return;
    }

    setLoading(true);
    try {
      const users = LocalDB.getUsersSync();
      const freshUser = users.find(u => u.id === currentUser.id);

      if (freshUser) {
        const updatedUser: User = {
          ...freshUser,
          fullName: fullName.trim()
        };

        if (password.trim()) {
          updatedUser.passwordHash = LocalDB.hashPasswordPublic(password.trim());
        }

        await LocalDB.saveUser(updatedUser);
        refreshUser(); // Update context session
        setSuccessMsg('Cập nhật thông tin tài khoản thành công!');
        setPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg('Lỗi đồng bộ tài khoản hệ thống.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Đã xảy ra lỗi trong quá trình ghi dữ liệu.');
    }
    setLoading(false);
  };

  const getPositionIcon = () => {
    switch (currentUser.position) {
      case 'Editor': return <Film size={20} style={{ color: 'var(--accent)' }} />;
      case 'Cameraman': return <Video size={20} style={{ color: 'var(--accent-cyan)' }} />;
      case 'TikTok': return <Share2 size={20} style={{ color: 'var(--accent-purple)' }} />;
      case 'Biên tập nội dung': return <FileText size={20} style={{ color: 'var(--accent-pink)' }} />;
      default: return <Shield size={20} style={{ color: 'var(--accent)' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-title-section">
        <div>
          <h2 className="page-title">CẤU HÌNH TRANG CÁ NHÂN</h2>
          <p className="page-subtitle">Quản lý thông tin hồ sơ cá nhân và cập nhật mật khẩu đăng nhập</p>
        </div>
      </div>

      <div className="layout-grid">
        {/* Left Side: Profile Details Form */}
        <div className="liquid-glass hud-corner-ticks" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={16} style={{ color: 'var(--accent)' }} />
            Chỉnh sửa thông tin tài khoản
          </h3>

          {successMsg && (
            <div 
              style={{ 
                background: 'rgba(16, 185, 129, 0.08)', 
                border: '1px solid rgba(16, 185, 129, 0.15)', 
                color: 'var(--status-done)', 
                padding: '12px 16px', 
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '16px'
              }}
            >
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div 
              style={{ 
                background: 'rgba(239, 68, 68, 0.08)', 
                border: '1px solid rgba(239, 68, 68, 0.15)', 
                color: 'var(--priority-urgent)', 
                padding: '12px 16px', 
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '16px'
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="pUsername">Tên đăng nhập hệ thống</label>
              <input 
                type="text" 
                id="pUsername" 
                className="glass-input" 
                value={currentUser.username} 
                disabled 
                style={{ cursor: 'not-allowed', opacity: 0.7 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pName">Họ và tên hiển thị <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                id="pName" 
                className="glass-input" 
                placeholder="Nhập họ tên hiển thị..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="pPass">Mật khẩu mới (Bỏ trống nếu không đổi)</label>
                <input 
                  type="password" 
                  id="pPass" 
                  className="glass-input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pConfirm">Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  id="pConfirm" 
                  className="glass-input" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="glass-btn glass-btn-primary" 
              style={{ alignSelf: 'flex-start', marginTop: '8px', display: 'flex', gap: '6px' }}
              disabled={loading}
            >
              <Save size={16} />
              <span>{loading ? 'ĐANG LƯU...' : 'LƯU THÔNG TIN HỒ SƠ'}</span>
            </button>
          </form>
        </div>

        {/* Right Side: High-Tech Avatar Card & Telemetry Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="liquid-glass hud-corner-ticks" style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
            <img 
              src={currentUser.avatar} 
              alt={currentUser.fullName} 
              style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3.5px solid var(--accent)', boxShadow: '0 6px 20px var(--glow-blue)' }} 
            />

            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{currentUser.fullName}</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px' }}>
                {getPositionIcon()}
                <span 
                  style={{ 
                    fontFamily: 'var(--font-tech)', 
                    color: 'var(--accent)', 
                    fontWeight: 'bold', 
                    fontSize: '0.8rem', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em' 
                  }}
                >
                  {currentUser.role === 'admin' ? 'SYSTEM DIRECTOR / ADMIN' : currentUser.position}
                </span>
              </div>
            </div>
          </div>

          {/* Performance scorecard */}
          <div className="liquid-glass hud-corner-ticks" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '14px', color: 'var(--text-muted)' }}>
              {currentUser.role === 'admin' ? 'THỐNG KÊ TOÀN TEAM' : 'HIỆU SUẤT CỦA TÔI'}
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tổng công việc:</span>
                <strong style={{ fontFamily: 'var(--font-tech)' }}>{total} tasks</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Đã hoàn thành:</span>
                <strong style={{ color: 'var(--status-done)', fontFamily: 'var(--font-tech)' }}>{completed} tasks</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Trễ deadline:</span>
                <strong style={{ color: 'var(--status-overdue)', fontFamily: 'var(--font-tech)' }}>{overdue} tasks</strong>
              </div>

              <div style={{ borderTop: '1px dashed rgba(2, 132, 199, 0.12)', paddingTop: '12px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 800 }}>
                  <span>Năng suất thực hiện:</span>
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-tech)' }}>{successRate}%</span>
                </div>
                <div className="task-card-progress" style={{ height: '6px', marginTop: '6px' }}>
                  <div className="task-card-progress-bar" style={{ width: `${successRate}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
