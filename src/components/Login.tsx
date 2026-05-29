import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Film, Video, Share2, FileText, Sparkles, Key } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    setError('');
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (!success) {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  const handleDemoLogin = async (roleName: string, pass: string) => {
    setError('');
    setLoading(true);
    const success = await login(roleName, pass);
    setLoading(false);
    if (!success) {
      setError('Lỗi đăng nhập tài khoản demo.');
    }
  };

  const demoAccounts = [
    {
      label: 'Admin (Director)',
      username: 'admin',
      pass: 'admin123',
      icon: <Shield size={14} />,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      label: 'Editor',
      username: 'editor',
      pass: 'editor123',
      icon: <Film size={14} />,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      label: 'Cameraman',
      username: 'cameraman',
      pass: 'cameraman123',
      icon: <Video size={14} />,
      avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80'
    },
    {
      label: 'TikTok / Social',
      username: 'tiktok',
      pass: 'tiktok123',
      icon: <Share2 size={14} />,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    {
      label: 'Biên tập nội dung',
      username: 'writer',
      pass: 'writer123',
      icon: <FileText size={14} />,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="login-wrapper">
      {/* Decorative background orbs */}
      <div className="ambient-glow ambient-blue" />
      <div className="ambient-glow ambient-cyan" style={{ bottom: '10%', right: '10%' }} />

      <div className="liquid-glass hud-corner-ticks login-card">
        <div className="login-header">
          <div className="hud-telemetry">
            <span>SYS STATUS: SECURE</span>
            <span>VŨ ANH MEDIA CORP</span>
          </div>
          <h2 className="login-title" style={{ background: 'linear-gradient(to right, var(--text) 20%, var(--accent) 55%, var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vũ Anh Media</h2>
          <p className="login-subtitle">HỆ THỐNG QUẢN TRỊ CÔNG VIỆC MEDIAFLOW</p>
        </div>

        {error && (
          <div 
            style={{ 
              background: 'rgba(239, 68, 68, 0.08)', 
              border: '1px solid rgba(239, 68, 68, 0.15)', 
              color: 'var(--priority-urgent)', 
              padding: '12px 16px', 
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              lineHeight: 1.4
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              className="glass-input"
              placeholder="VD: admin, editor..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              className="glass-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="glass-btn glass-btn-primary" 
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'ĐANG KẾT NỐI HỆ THỐNG...' : 'ĐĂNG NHẬP HỆ THỐNG'}
          </button>
        </form>

        <div className="demo-accounts">
          <div className="demo-title">
            <Sparkles size={12} style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline-block' }} />
            Tài khoản dùng thử (Click để vào nhanh)
          </div>
          <div className="demo-buttons-grid">
            {demoAccounts.map((acc, index) => (
              <button
                key={index}
                className="demo-btn"
                onClick={() => handleDemoLogin(acc.username, acc.pass)}
                disabled={loading}
                title={`Đăng nhập nhanh với vai trò ${acc.label}`}
                style={{ gridColumn: index === 0 ? 'span 2' : 'span 1' }}
              >
                <img src={acc.avatar} alt={acc.label} className="demo-avatar" />
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text)' }}>
                    {acc.label}
                  </span>
                  <span style={{ fontSize: '0.55rem', opacity: 0.7, fontFamily: 'var(--font-tech)' }}>
                    pass: {acc.pass}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
