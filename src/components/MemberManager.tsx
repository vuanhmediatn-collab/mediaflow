import React, { useState, useEffect } from 'react';
import { LocalDB, User, Task } from '../db/localDb';
import { Plus, Users, Trash2, Key, X, Sparkles } from 'lucide-react';

export const MemberManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // User form fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [position, setPosition] = useState<string>('Editor');
  const [avatar, setAvatar] = useState('');
  const [password, setPassword] = useState('');

  // Password change fields
  const [newPassword, setNewPassword] = useState('');

  const loadData = async () => {
    setLoading(true);
    const allUsers = await LocalDB.getUsers();
    const allTasks = await LocalDB.getTasksSync();
    setUsers(allUsers);
    setTasks(allTasks);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenUserForm = (user: User | null) => {
    if (user) {
      setSelectedUser(user);
      setFullName(user.fullName);
      setUsername(user.username);
      setPosition(user.position || (user.role === 'admin' ? 'Giám đốc' : 'Editor'));
      setAvatar(user.avatar);
      setPassword(''); // Password cannot be edited from this form directly for existing users
    } else {
      setSelectedUser(null);
      setFullName('');
      setUsername('');
      setPosition('Editor');
      setAvatar('');
      setPassword('');
    }
    setIsFormOpen(true);
  };

  const handleCloseUserForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 1024 * 1024) {
      alert('Ảnh quá lớn, vui lòng chọn ảnh dưới 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setAvatar(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) return;

    // Check unique username for new users
    if (!selectedUser) {
      const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        alert('Tên đăng nhập này đã tồn tại trên hệ thống. Vui lòng chọn tên khác.');
        return;
      }
      if (!password.trim()) {
        alert('Vui lòng nhập mật khẩu khởi tạo cho nhân sự mới.');
        return;
      }
    }

    // Default premium avatars if empty
    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    ];
    const finalAvatar = avatar.trim() || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const payload: User = {
      id: selectedUser ? selectedUser.id : 'u-' + Math.random().toString(36).substr(2, 9),
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      role: selectedUser ? selectedUser.role : 'staff', // Retain admin role when editing
      position,
      avatar: finalAvatar,
      passwordHash: selectedUser 
        ? selectedUser.passwordHash 
        : LocalDB.hashPasswordPublic(password)
    };

    await LocalDB.saveUser(payload);
    handleCloseUserForm();
    loadData();
  };

  const handleOpenPasswordModal = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedUser(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || !selectedUser) return;

    const payload: User = {
      ...selectedUser,
      passwordHash: LocalDB.hashPasswordPublic(newPassword.trim())
    };

    await LocalDB.saveUser(payload);
    alert(`Đổi mật khẩu thành công cho nhân viên: ${selectedUser.fullName}`);
    handleClosePasswordModal();
  };

  const handleDeleteUser = async (user: User) => {
    if (user.role === 'admin') {
      alert('Không thể xóa tài khoản Quản trị viên (Admin) duy nhất của hệ thống.');
      return;
    }

    // Check if user has active tasks
    const activeTasks = tasks.filter(t => t.assigneeId === user.id && t.status !== 'Hoàn thành');
    if (activeTasks.length > 0) {
      alert(`Không thể xóa nhân sự này vì đang gánh vác ${activeTasks.length} công việc chưa hoàn thành. Vui lòng chuyển giao công việc trước.`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân sự "${user.fullName}" khỏi team Media?`)) {
      await LocalDB.deleteUser(user.id);
      loadData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-title-section">
        <div>
          <h2 className="page-title">QUẢN LÝ THÀNH VIÊN TEAM MEDIA</h2>
          <p className="page-subtitle">Thêm/bớt nhân sự, cập nhật chuyên môn, thiết lập mật khẩu hệ thống</p>
        </div>
        <button onClick={() => handleOpenUserForm(null)} className="glass-btn glass-btn-primary">
          <Plus size={16} />
          <span>THÊM THÀNH VIÊN MỚI</span>
        </button>
      </div>

      {loading ? (
        <div style={{ fontSize: '0.88rem', fontFamily: 'var(--font-tech)', color: 'var(--accent)' }}>LOADING MEMBERS CHANNELS...</div>
      ) : (
        <div className="member-grid">
          {users.map((user) => {
            const myTotalTasks = tasks.filter(t => t.assigneeId === user.id).length;
            const myCompleted = tasks.filter(t => t.assigneeId === user.id && t.status === 'Hoàn thành').length;

            return (
              <div key={user.id} className="liquid-glass member-card">
                <img src={user.avatar} alt={user.fullName} className="member-avatar" />
                
                <div>
                  <h3 className="member-name">{user.fullName}</h3>
                  <span className="member-position">
                    {user.role === 'admin' ? `🔥 ${user.position || 'Giám đốc (Admin)'}` : `🎬 ${user.position}`}
                  </span>
                </div>

                <div 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '4px', 
                    width: '100%', 
                    padding: '10px 14px', 
                    background: 'rgba(255, 255, 255, 0.25)', 
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tên đăng nhập:</span>
                    <strong style={{ fontFamily: 'var(--font-tech)' }}>{user.username}</strong>
                  </div>
                  {user.role !== 'admin' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Công việc gánh vác:</span>
                      <strong>{myCompleted}/{myTotalTasks} Hoàn thành</strong>
                    </div>
                  )}
                </div>

                <div className="member-actions">
                  <button 
                    onClick={() => handleOpenPasswordModal(user)} 
                    className="glass-btn" 
                    title="Đặt lại mật khẩu"
                    style={{ padding: '8px' }}
                  >
                    <Key size={14} />
                  </button>

                  <button 
                    onClick={() => handleOpenUserForm(user)} 
                    className="glass-btn"
                    style={{ padding: '8px 12px', flexGrow: 2, fontSize: '0.75rem' }}
                  >
                    Chỉnh sửa
                  </button>

                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => handleDeleteUser(user)} 
                      className="glass-btn glass-btn-danger"
                      style={{ padding: '8px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit User Form Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={handleCloseUserForm}>
          <div 
            className="liquid-glass modal-container hud-corner-ticks" 
            style={{ maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '20px 24px',
                borderBottom: '1px solid rgba(15, 23, 42, 0.05)'
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {selectedUser ? 'CẬP NHẬT THÔNG TIN' : 'THÊM THÀNH VIÊN'}
              </h3>
              <button 
                onClick={handleCloseUserForm} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Họ và tên nhân sự <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text" 
                  id="fullName" 
                  className="glass-input" 
                  placeholder="VD: Nguyễn Văn A..."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="uName">Tên đăng nhập <span style={{ color: 'red' }}>*</span></label>
                  <input 
                    type="text" 
                    id="uName" 
                    className="glass-input" 
                    placeholder="VD: nguyena..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!!selectedUser} // Username cannot be modified
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pos">Bộ phận chuyên môn / Chức vụ</label>
                  <select 
                    id="pos" 
                    className="glass-input glass-select"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    {selectedUser && selectedUser.role === 'admin' ? (
                      <>
                        <option value="Giám đốc">Giám đốc (Director)</option>
                        <option value="Quản lý">Quản lý (Manager)</option>
                        <option value="Tổng giám đốc">Tổng giám đốc (General Director)</option>
                        <option value="Founder">Founder (Sáng lập viên)</option>
                      </>
                    ) : (
                      <>
                        <option value="Editor">Editor (Dựng phim)</option>
                        <option value="Cameraman">Cameraman (Quay phim)</option>
                        <option value="TikTok">TikTok / Social Media</option>
                        <option value="Biên tập nội dung">Biên tập nội dung (Content)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {!selectedUser && (
                <div className="form-group">
                  <label className="form-label" htmlFor="pass">Mật khẩu khởi tạo <span style={{ color: 'red' }}>*</span></label>
                  <input 
                    type="password" 
                    id="pass" 
                    className="glass-input" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              {avatar && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <img 
                    src={avatar} 
                    alt="Preview" 
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }} 
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Xem trước ảnh đại diện</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="avatarUrl">Link ảnh đại diện (Tùy chọn)</label>
                <input 
                  type="url" 
                  id="avatarUrl" 
                  className="glass-input" 
                  placeholder="https://images.unsplash.com/..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginTop: '8px' }}>
                <label className="glass-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  📁 Tải ảnh từ máy
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '10px', 
                  borderTop: '1px solid rgba(15, 23, 42, 0.05)', 
                  paddingTop: '16px',
                  marginTop: '8px'
                }}
              >
                <button type="button" className="glass-btn" onClick={handleCloseUserForm}>
                  Hủy
                </button>
                <button type="submit" className="glass-btn glass-btn-primary">
                  {selectedUser ? 'Lưu thay đổi' : 'Khai sinh nhân sự'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isPasswordModalOpen && selectedUser && (
        <div className="modal-backdrop" onClick={handleClosePasswordModal}>
          <div 
            className="liquid-glass modal-container hud-corner-ticks" 
            style={{ maxWidth: '400px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '20px 24px',
                borderBottom: '1px solid rgba(15, 23, 42, 0.05)'
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                ĐẶT LẠI MẬT KHẨU
              </h3>
              <button 
                onClick={handleClosePasswordModal} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div 
                style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--text-muted)', 
                  background: 'rgba(2, 132, 199, 0.04)', 
                  border: '1px solid rgba(2, 132, 199, 0.12)', 
                  padding: '12px',
                  borderRadius: '8px'
                }}
              >
                Thiết lập lại mật khẩu mới cho tài khoản: <strong>{selectedUser.fullName}</strong>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newP">Mật khẩu mới <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="password" 
                  id="newP" 
                  className="glass-input" 
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '10px', 
                  borderTop: '1px solid rgba(15, 23, 42, 0.05)', 
                  paddingTop: '16px',
                  marginTop: '8px'
                }}
              >
                <button type="button" className="glass-btn" onClick={handleClosePasswordModal}>
                  Hủy
                </button>
                <button type="submit" className="glass-btn glass-btn-primary">
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
