import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LocalDB, Task, Project, User, TaskStatus, TaskPriority, ChecklistItem } from '../db/localDb';
import { X, Plus, Trash2, ShieldAlert } from 'lucide-react';

interface TaskFormProps {
  task: Task | null; // Null means creating new task, otherwise editing
  onClose: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Chưa bắt đầu');
  const [deadline, setDeadline] = useState('');

  // Checklist builder
  const [checklistText, setChecklistText] = useState('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const loadFormData = async () => {
      const allProjects = await LocalDB.getProjects();
      const allUsers = await LocalDB.getUsers();
      setProjects(allProjects);
      setUsers(allUsers.filter(u => u.role === 'staff'));

      if (task) {
        // Edit Mode - seed values
        setTitle(task.title);
        setDescription(task.description);
        setProjectId(task.projectId);
        setAssigneeId(task.assigneeId);
        setPriority(task.priority);
        setStatus(task.status);
        setDeadline(task.deadline);
        setChecklistItems(task.checklist);
      } else {
        // Create Mode - set defaults
        if (allProjects.length > 0) setProjectId(allProjects[0].id);
        const staff = allUsers.filter(u => u.role === 'staff');
        if (staff.length > 0) setAssigneeId(staff[0].id);
        
        // Default deadline: 3 days from now
        const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        setDeadline(inThreeDays);
      }
      setLoading(false);
    };

    loadFormData();
  }, [task]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="modal-backdrop">
        <div className="liquid-glass modal-container" style={{ padding: '24px', textAlign: 'center', color: 'var(--priority-urgent)' }}>
          <ShieldAlert size={48} style={{ margin: '0 auto 12px' }} />
          <h3>CẢNH BÁO QUYỀN TRUY CẬP</h3>
          <p style={{ marginTop: '8px' }}>Chỉ có tài khoản quản lý (Admin) mới có quyền tạo hoặc sửa công việc.</p>
          <button className="glass-btn" onClick={onClose} style={{ marginTop: '16px' }}>Đóng cửa sổ</button>
        </div>
      </div>
    );
  }

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checklistText.trim()) return;

    const newItem: ChecklistItem = {
      id: 'c-' + Math.random().toString(36).substr(2, 9),
      text: checklistText.trim(),
      completed: false
    };

    setChecklistItems([...checklistItems, newItem]);
    setChecklistText('');
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== itemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId || !assigneeId || !deadline) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }

    // Find assignee to auto-extract department position
    const selectedUser = users.find(u => u.id === assigneeId);
    if (!selectedUser) {
      alert('Không tìm thấy nhân sự đã chọn.');
      return;
    }

    const taskPayload: Task = {
      id: task ? task.id : 't-' + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim(),
      assigneeId,
      position: selectedUser.position as 'Editor' | 'Cameraman' | 'TikTok' | 'Biên tập nội dung',
      projectId,
      deadline,
      priority,
      status,
      checklist: checklistItems,
      notes: task ? task.notes : [],
      files: task ? task.files : [],
      reports: task ? task.reports : [],
      logs: task ? task.logs : [],
      createdAt: task ? task.createdAt : new Date().toISOString()
    };

    await LocalDB.saveTask(taskPayload, currentUser.fullName);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="liquid-glass modal-container hud-corner-ticks" 
        style={{ maxWidth: '620px' }}
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            {task ? 'CẬP NHẬT CÔNG VIỆC' : 'TẠO CÔNG VIỆC MỚI'}
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'var(--font-tech)' }}>
            LOADING FORM RESOURCES...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className="form-group">
              <label className="form-label" htmlFor="title">Tên đầu việc <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                id="title" 
                className="glass-input" 
                placeholder="Nhập tên công việc..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Mô tả chi tiết</label>
              <textarea 
                id="description" 
                className="glass-input" 
                rows={3} 
                placeholder="Mô tả các cảnh quay, phong cách edit, phân cảnh chi tiết..."
                style={{ resize: 'none' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="project">Thuộc Dự án / Khách hàng <span style={{ color: 'red' }}>*</span></label>
                <select 
                  id="project" 
                  className="glass-input glass-select"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  required
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="assignee">Người phụ trách <span style={{ color: 'red' }}>*</span></label>
                <select 
                  id="assignee" 
                  className="glass-input glass-select"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  required
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.position})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="priority">Mức độ ưu tiên</label>
                <select 
                  id="priority" 
                  className="glass-input glass-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                >
                  <option value="Low">Low (Thấp)</option>
                  <option value="Medium">Medium (Trung bình)</option>
                  <option value="High">High (Cao)</option>
                  <option value="Urgent">Urgent (Gấp/Khẩn)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="deadline">Hạn chót (Deadline) <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="date" 
                  id="deadline" 
                  className="glass-input"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
            </div>

            {task && (
              <div className="form-group">
                <label className="form-label" htmlFor="status">Trạng thái công việc</label>
                <select 
                  id="status" 
                  className="glass-input glass-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                >
                  <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                  <option value="Đang làm">Đang làm</option>
                  <option value="Chờ duyệt">Chờ duyệt</option>
                  <option value="Cần sửa">Cần sửa</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Trễ hạn">Trễ hạn</option>
                </select>
              </div>
            )}

            {/* Checklist Builder */}
            <div style={{ borderTop: '1px solid rgba(15, 23, 42, 0.05)', paddingTop: '16px' }}>
              <label className="form-label">Tạo Checklist Phân Cảnh / Việc nhỏ</label>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="Nhập đầu việc nhỏ (VD: Lọc file, Cân màu da...)" 
                  style={{ fontSize: '0.82rem' }}
                  value={checklistText}
                  onChange={(e) => setChecklistText(e.target.value)}
                />
                <button 
                  type="button" 
                  className="glass-btn" 
                  style={{ padding: '8px 14px' }}
                  onClick={handleAddChecklistItem}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                {checklistItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '6px 12px', 
                      background: 'rgba(255, 255, 255, 0.4)', 
                      borderRadius: '8px',
                      border: '1px solid rgba(15, 23, 42, 0.02)'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>
                      {index + 1}. {item.text}
                    </span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--priority-urgent)', cursor: 'pointer', padding: '2px' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Footer */}
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
              <button type="button" className="glass-btn" onClick={onClose}>
                Hủy bỏ
              </button>
              <button type="submit" className="glass-btn glass-btn-primary">
                {task ? 'Cập nhật' : 'Khởi tạo công việc'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
