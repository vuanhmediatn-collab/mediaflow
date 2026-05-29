import React, { useState, useEffect } from 'react';
import { LocalDB, Project, Task } from '../db/localDb';
import { Plus, Briefcase, Trash2, Calendar, FileText, X } from 'lucide-react';

export const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Completed' | 'OnHold'>('Active');

  const loadData = async () => {
    setLoading(true);
    const allProjects = await LocalDB.getProjects();
    const allTasks = await LocalDB.getTasksSync();
    setProjects(allProjects);
    setTasks(allTasks);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenForm = (proj: Project | null) => {
    if (proj) {
      setEditingProject(proj);
      setName(proj.name);
      setClient(proj.client);
      setDescription(proj.description);
      setStatus(proj.status);
    } else {
      setEditingProject(null);
      setName('');
      setClient('');
      setDescription('');
      setStatus('Active');
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !client.trim()) return;

    const payload: Project = {
      id: editingProject ? editingProject.id : 'p-' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      client: client.trim(),
      description: description.trim(),
      status,
      createdAt: editingProject ? editingProject.createdAt : new Date().toISOString().split('T')[0]
    };

    await LocalDB.saveProject(payload);
    handleCloseForm();
    loadData();
  };

  const handleDelete = async (id: string) => {
    // Check if there are tasks linked to this project
    const linkedTasks = tasks.filter(t => t.projectId === id);
    if (linkedTasks.length > 0) {
      alert(`Không thể xóa dự án này vì đang có ${linkedTasks.length} công việc thuộc dự án. Vui lòng di chuyển hoặc xóa các công việc trước.`);
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa dự án/khách hàng này?')) {
      await LocalDB.deleteProject(id);
      loadData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-title-section">
        <div>
          <h2 className="page-title">QUẢN LÝ DỰ ÁN & KHÁCH HÀNG</h2>
          <p className="page-subtitle">Quản lý chiến dịch, nhóm công việc, phân tích tiến độ theo khách hàng</p>
        </div>
        <button onClick={() => handleOpenForm(null)} className="glass-btn glass-btn-primary">
          <Plus size={16} />
          <span>TẠO DỰ ÁN MỚI</span>
        </button>
      </div>

      {loading ? (
        <div style={{ fontSize: '0.88rem', fontFamily: 'var(--font-tech)', color: 'var(--accent)' }}>LOADING PROJECTS ENGINE...</div>
      ) : (
        <div className="project-list-grid">
          {projects.map((proj) => {
            const projTasks = tasks.filter(t => t.projectId === proj.id);
            const total = projTasks.length;
            const completed = projTasks.filter(t => t.status === 'Hoàn thành').length;
            const doing = projTasks.filter(t => t.status === 'Đang làm').length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div key={proj.id} className="liquid-glass project-card">
                <div className="project-header">
                  <div>
                    <span className="project-client">{proj.client}</span>
                    <h3 className="project-title" style={{ marginTop: '4px' }}>{proj.name}</h3>
                  </div>
                  
                  <span 
                    className={`status-badge status-badge-${
                      proj.status === 'Active' ? 'doing' : 
                      proj.status === 'Completed' ? 'done' : 'none'
                    }`}
                  >
                    {proj.status === 'Active' ? 'Đang chạy' : proj.status === 'Completed' ? 'Hoàn thành' : 'Tạm dừng'}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4, flexGrow: 1 }}>
                  {proj.description || 'Không có mô tả chi tiết.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '8px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 650 }}>
                    <span>Tiến độ hoàn thành dự án</span>
                    <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-tech)' }}>{progress}%</span>
                  </div>
                  <div className="task-card-progress" style={{ height: '6px' }}>
                    <div className="task-card-progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="project-stats">
                  <div className="project-stat-box">
                    <div className="project-stat-val">{total}</div>
                    <div className="project-stat-lbl">Tasks</div>
                  </div>
                  <div className="project-stat-box">
                    <div className="project-stat-val" style={{ color: 'var(--status-doing)' }}>{doing}</div>
                    <div className="project-stat-lbl">Đang làm</div>
                  </div>
                </div>

                <div 
                  style={{ 
                    borderTop: '1px solid rgba(15, 23, 42, 0.04)', 
                    paddingTop: '14px', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <button 
                    onClick={() => handleDelete(proj.id)} 
                    style={{ background: 'none', border: 'none', color: 'var(--priority-urgent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    <Trash2 size={12} />
                    <span>Xóa</span>
                  </button>

                  <button 
                    onClick={() => handleOpenForm(proj)} 
                    className="glass-btn" 
                    style={{ fontSize: '0.75rem', padding: '6px 14px' }}
                  >
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={handleCloseForm}>
          <div 
            className="liquid-glass modal-container hud-corner-ticks" 
            style={{ background: 'rgba(255, 255, 255, 0.7)', maxWidth: '500px' }}
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
                {editingProject ? 'CHỈNH SỬA DỰ ÁN' : 'TẠO MỚI DỰ ÁN'}
              </h3>
              <button 
                onClick={handleCloseForm} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="projName">Tên dự án / Chiến dịch <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text" 
                  id="projName" 
                  className="glass-input" 
                  placeholder="VD: Royal Beauty Clinic, TikTok nội bộ..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="projClient">Khách hàng đại diện <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text" 
                  id="projClient" 
                  className="glass-input" 
                  placeholder="VD: Royal Beauty Group..."
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="projDesc">Mô tả mục tiêu chiến dịch</label>
                <textarea 
                  id="projDesc" 
                  className="glass-input" 
                  rows={3} 
                  placeholder="Mục tiêu quay chụp, KPI mong muốn..."
                  style={{ resize: 'none' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="projStatus">Trạng thái dự án</label>
                <select 
                  id="projStatus" 
                  className="glass-input glass-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Completed' | 'OnHold')}
                >
                  <option value="Active">Active (Đang hoạt động)</option>
                  <option value="Completed">Completed (Hoàn thành)</option>
                  <option value="OnHold">OnHold (Tạm dừng)</option>
                </select>
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
                <button type="button" className="glass-btn" onClick={handleCloseForm}>
                  Hủy bỏ
                </button>
                <button type="submit" className="glass-btn glass-btn-primary">
                  {editingProject ? 'Lưu thay đổi' : 'Tạo mới dự án'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
