import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LocalDB, Task, Project, User, TaskStatus, TaskPriority, ChecklistItem } from '../db/localDb';
import { 
  X, 
  Calendar, 
  User as UserIcon, 
  Briefcase, 
  AlertCircle,
  FileText,
  Plus,
  Send,
  Link,
  MessageSquare,
  AlertTriangle,
  History,
  CheckCircle,
  Trash2
} from 'lucide-react';

interface TaskModalProps {
  taskId: string;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
  const { currentUser } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [assignee, setAssignee] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Notes state
  const [noteText, setNoteText] = useState('');
  
  // File submission state
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  // Progress/Issue report state
  const [reportText, setReportText] = useState('');
  const [reportType, setReportType] = useState<'progress' | 'issue'>('progress');
  const [reportFileUrl, setReportFileUrl] = useState('');

  const loadTaskDetails = async () => {
    const foundTask = await LocalDB.getTaskById(taskId);
    if (foundTask) {
      setTask(foundTask);
      
      const allProjects = await LocalDB.getProjectsSync();
      const proj = allProjects.find(p => p.id === foundTask.projectId);
      setProject(proj || null);

      const allUsers = await LocalDB.getUsersSync();
      setUsers(allUsers);
      const user = allUsers.find(u => u.id === foundTask.assigneeId);
      setAssignee(user || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="modal-backdrop">
        <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-tech)' }}>CONNECTING DECK...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="liquid-glass modal-container" style={{ padding: '24px', textAlign: 'center' }}>
          <h4>Không tìm thấy công việc</h4>
          <button className="glass-btn" onClick={onClose} style={{ marginTop: '12px' }}>Đóng</button>
        </div>
      </div>
    );
  }

  // --- ACTIONS ---

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    const updated = { ...task, status: newStatus };
    const saved = await LocalDB.saveTask(updated, currentUser.fullName);
    setTask(saved);
  };

  // Toggle checklist completed
  const handleToggleChecklist = async (itemId: string) => {
    if (!task) return;
    const updatedChecklist = task.checklist.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const updated = { ...task, checklist: updatedChecklist };
    const saved = await LocalDB.saveTask(updated, currentUser.fullName);
    setTask(saved);
  };

  // Post notes
  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !task) return;

    const newNote = {
      id: 'n-' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      fullName: currentUser.fullName,
      text: noteText,
      createdAt: new Date().toISOString()
    };

    const updated = { 
      ...task, 
      notes: [...task.notes, newNote],
      logs: [...task.logs, {
        id: 'l-' + Math.random().toString(36).substr(2, 9),
        text: `Đã thêm một ghi chú nội bộ`,
        createdAt: new Date().toISOString()
      }]
    };
    
    const saved = await LocalDB.saveTask(updated, currentUser.fullName);
    setTask(saved);
    setNoteText('');
  };

  // Post reports
  const handlePostReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim() || !task) return;

    const newReport = {
      id: 'r-' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      fullName: currentUser.fullName,
      text: reportText,
      type: reportType,
      fileUrl: reportFileUrl.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    // If report is an issue, we can also auto log it
    const logText = reportType === 'issue' 
      ? `⚠️ Báo cáo vấn đề phát sinh: "${reportText.slice(0, 30)}..."`
      : `📝 Cập nhật báo cáo tiến độ`;

    const updated = {
      ...task,
      reports: [...task.reports, newReport],
      logs: [...task.logs, {
        id: 'l-' + Math.random().toString(36).substr(2, 9),
        text: logText,
        createdAt: new Date().toISOString()
      }]
    };

    const saved = await LocalDB.saveTask(updated, currentUser.fullName);
    setTask(saved);
    setReportText('');
    setReportFileUrl('');
  };

  // Attach link/file
  const handleAttachLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !fileUrl.trim() || !task) return;

    const newFile = {
      name: fileName,
      url: fileUrl
    };

    const updated = {
      ...task,
      files: [...task.files, newFile],
      logs: [...task.logs, {
        id: 'l-' + Math.random().toString(36).substr(2, 9),
        text: `Đính kèm tệp tin bàn giao: ${fileName}`,
        createdAt: new Date().toISOString()
      }]
    };

    const saved = await LocalDB.saveTask(updated, currentUser.fullName);
    setTask(saved);
    setFileName('');
    setFileUrl('');
  };

  // Delete task (Admin only)
  const handleDeleteTask = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn công việc này khỏi hệ thống?')) {
      await LocalDB.deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="liquid-glass modal-container hud-corner-ticks" 
        style={{ background: 'rgba(255, 255, 255, 0.65)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            padding: '24px 28px',
            borderBottom: '1px solid rgba(15, 23, 42, 0.05)'
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-tech)', color: 'var(--accent)', fontWeight: 'bold' }}>
              PROJECT: {project ? project.name.toUpperCase() : 'N/A'}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', lineHeight: 1.35 }}>
              {task.title}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Metadata Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.35)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Người phụ trách</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <img 
                  src={assignee ? assignee.avatar : 'https://via.placeholder.com/150'} 
                  alt={assignee ? assignee.fullName : 'None'} 
                  style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 750 }}>{assignee ? assignee.fullName : 'Chưa giao'}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.35)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Hạn chót</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.8rem', fontWeight: 750, fontFamily: 'var(--font-tech)' }}>
                <Calendar size={14} style={{ color: 'var(--priority-urgent)' }} />
                <span>{task.deadline}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.35)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Ưu tiên</span>
              <div style={{ marginTop: '6px' }}>
                <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.35)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Trạng thái</span>
              <div style={{ marginTop: '4px' }}>
                <span className={`status-badge status-badge-${
                  task.status === 'Chưa bắt đầu' ? 'none' : 
                  task.status === 'Đang làm' ? 'doing' : 
                  task.status === 'Chờ duyệt' ? 'pending' : 
                  task.status === 'Cần sửa' ? 'repair' : 
                  task.status === 'Hoàn thành' ? 'done' : 'overdue'
                }`}>
                  {task.status}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '0.88rem', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>Mô tả công việc</h4>
            <div 
              style={{ 
                background: 'rgba(255, 255, 255, 0.45)', 
                padding: '16px', 
                borderRadius: '14px', 
                border: '1px solid rgba(255, 255, 255, 0.5)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap'
              }}
            >
              {task.description || 'Không có mô tả chi tiết.'}
            </div>
          </div>

          {/* Quick status state transitions */}
          <div>
            <h4 style={{ fontSize: '0.88rem', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>Cập nhật trạng thái nhanh</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {currentUser.role === 'admin' ? (
                // Admin has power to set everything
                <>
                  <button onClick={() => handleStatusChange('Đang làm')} className="glass-btn" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>Đang làm</button>
                  <button onClick={() => handleStatusChange('Cần sửa')} className="glass-btn" style={{ fontSize: '0.78rem', padding: '6px 12px', color: 'var(--status-repair)' }}>Cần sửa</button>
                  <button onClick={() => handleStatusChange('Hoàn thành')} className="glass-btn" style={{ fontSize: '0.78rem', padding: '6px 12px', color: 'var(--status-done)' }}>Hoàn thành (Duyệt)</button>
                  <button onClick={() => handleStatusChange('Trễ hạn')} className="glass-btn" style={{ fontSize: '0.78rem', padding: '6px 12px', color: 'var(--status-overdue)' }}>Trễ hạn</button>
                </>
              ) : (
                // Staff has power to transition between workflow steps
                <>
                  {task.status === 'Chưa bắt đầu' && (
                    <button onClick={() => handleStatusChange('Đang làm')} className="glass-btn glass-btn-primary" style={{ fontSize: '0.78rem', padding: '8px 14px' }}>
                      Bắt đầu làm việc (Đang làm)
                    </button>
                  )}
                  {(task.status === 'Đang làm' || task.status === 'Cần sửa') && (
                    <button onClick={() => handleStatusChange('Chờ duyệt')} className="glass-btn glass-btn-primary" style={{ fontSize: '0.78rem', padding: '8px 14px', background: 'var(--accent)' }}>
                      Gửi duyệt (Chờ duyệt)
                    </button>
                  )}
                  {task.status === 'Chờ duyệt' && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Đang chờ Admin duyệt sản phẩm...
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Checklist Area */}
          {task.checklist.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.88rem', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>Checklist phân cảnh / đầu việc</h4>
              <div className="checklist-container">
                {task.checklist.map((item) => (
                  <div 
                    key={item.id} 
                    className={`checklist-item ${item.completed ? 'completed' : ''}`}
                    onClick={() => handleToggleChecklist(item.id)}
                  >
                    <div className={`checklist-checkbox ${item.completed ? 'checked' : ''}`}>
                      {item.completed && <CheckCircle size={12} />}
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files/Links attachments */}
          <div>
            <h4 style={{ fontSize: '0.88rem', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>Tệp đính kèm & Sản phẩm (Drive/NAS/Figma)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {task.files.length > 0 ? (
                task.files.map((f, i) => (
                  <a 
                    key={i} 
                    href={f.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="report-attachment"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <Link size={12} />
                    <span>{f.name}</span>
                  </a>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Chưa có tệp đính kèm nào được đăng tải.</div>
              )}
            </div>

            {/* Quick attach form */}
            <form onSubmit={handleAttachLink} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Tên tệp (VD: Video nháp 1, Kịch bản...)" 
                className="glass-input"
                style={{ flex: 1, minWidth: '150px', fontSize: '0.8rem', padding: '6px 10px' }}
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                required
              />
              <input 
                type="url" 
                placeholder="Đường dẫn Drive/NAS..." 
                className="glass-input"
                style={{ flex: 2, minWidth: '200px', fontSize: '0.8rem', padding: '6px 10px' }}
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                required
              />
              <button type="submit" className="glass-btn" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                Đính kèm
              </button>
            </form>
          </div>

          {/* Reports and Issues Section */}
          <div style={{ borderTop: '1px solid rgba(15, 23, 42, 0.05)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '0.88rem', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} style={{ color: 'var(--accent)' }} />
              Báo cáo tiến độ & Sự cố phát sinh
            </h4>

            {/* Existing reports list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
              {task.reports.length > 0 ? (
                task.reports.map((rep) => (
                  <div 
                    key={rep.id} 
                    style={{ 
                      padding: '12px', 
                      background: rep.type === 'issue' ? 'rgba(239, 68, 68, 0.04)' : 'rgba(16, 185, 129, 0.03)',
                      border: `1px solid ${rep.type === 'issue' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)'}`,
                      borderRadius: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 800 }}>{rep.fullName}</span>
                      <span style={{ fontFamily: 'var(--font-tech)', opacity: 0.8 }}>
                        {rep.createdAt.split('T')[0]} {rep.createdAt.split('T')[1].slice(0, 5)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', lineHeight: 1.4, color: 'var(--text)' }}>
                      {rep.type === 'issue' && <strong style={{ color: 'var(--priority-urgent)' }}>[SỰ CỐ] </strong>}
                      {rep.text}
                    </p>
                    {rep.fileUrl && (
                      <a 
                        href={rep.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--accent)', marginTop: '6px', fontWeight: 'bold', textDecoration: 'none' }}
                      >
                        <Link size={10} /> Link đi kèm
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Chưa có báo cáo nào được gửi.</div>
              )}
            </div>

            {/* Add report form */}
            <form onSubmit={handlePostReport} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="reportType" 
                    checked={reportType === 'progress'} 
                    onChange={() => setReportType('progress')} 
                  />
                  <span>Báo cáo tiến độ</span>
                </label>
                <label style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--priority-urgent)', fontWeight: 'bold' }}>
                  <input 
                    type="radio" 
                    name="reportType" 
                    checked={reportType === 'issue'} 
                    onChange={() => setReportType('issue')} 
                  />
                  <span>Báo sự cố khẩn cấp</span>
                </label>
              </div>

              <textarea 
                className="glass-input" 
                rows={2} 
                placeholder={reportType === 'issue' ? "Mô tả chi tiết sự cố phát sinh (Lỗi thiết bị, chậm file, kịch bản thay đổi...)" : "Nhập nội dung báo cáo tiến độ mới..."}
                style={{ resize: 'none', fontSize: '0.85rem' }}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                required
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="url" 
                  className="glass-input" 
                  placeholder="Link file đính kèm nếu có..." 
                  style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                  value={reportFileUrl}
                  onChange={(e) => setReportFileUrl(e.target.value)}
                />
                <button type="submit" className="glass-btn glass-btn-primary" style={{ fontSize: '0.8rem', padding: '6px 16px', display: 'flex', gap: '6px' }}>
                  <Send size={12} />
                  <span>Gửi</span>
                </button>
              </div>
            </form>
          </div>

          {/* Internal Notes & Comments */}
          <div style={{ borderTop: '1px solid rgba(15, 23, 42, 0.05)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '0.88rem', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={16} style={{ color: 'var(--accent)' }} />
              Ghi chú nội bộ / Thảo luận
            </h4>

            {/* Notes list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
              {task.notes.length > 0 ? (
                task.notes.map((note) => (
                  <div key={note.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div 
                      style={{ 
                        flexGrow: 1, 
                        background: 'rgba(255, 255, 255, 0.5)', 
                        padding: '10px 14px', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(15, 23, 42, 0.03)' 
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 650 }}>
                        <span>{note.fullName}</span>
                        <span>{note.createdAt.split('T')[0]} {note.createdAt.split('T')[1].slice(0, 5)}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', lineHeight: 1.4, color: 'var(--text)' }}>{note.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Chưa có ghi chú nội bộ.</div>
              )}
            </div>

            {/* Note form */}
            <form onSubmit={handlePostNote} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Thêm ghi chú/thảo luận mới cho task này..." 
                style={{ fontSize: '0.82rem' }}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                required
              />
              <button type="submit" className="glass-btn" style={{ padding: '8px 14px' }}>
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Audit Logs */}
          <div style={{ borderTop: '1px solid rgba(15, 23, 42, 0.05)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '0.88rem', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <History size={16} />
              Lịch sử thay đổi hệ thống (Audit Logs)
            </h4>
            <div className="log-timeline" style={{ maxHeight: '120px', overflowY: 'auto' }}>
              {task.logs.slice().reverse().map((log) => (
                <div key={log.id} className="log-item">
                  <span>{log.text}</span>
                  <span className="log-time">
                    {log.createdAt.split('T')[0].split('-').slice(1).join('/')} {log.createdAt.split('T')[1].slice(0, 5)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div 
          style={{ 
            padding: '16px 28px', 
            borderTop: '1px solid rgba(15, 23, 42, 0.05)', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {currentUser.role === 'admin' ? (
            <button 
              onClick={handleDeleteTask} 
              className="glass-btn glass-btn-danger" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px' }}
            >
              <Trash2 size={14} />
              Xóa công việc
            </button>
          ) : (
            <div />
          )}

          <button className="glass-btn glass-btn-primary" onClick={onClose} style={{ fontSize: '0.8rem', padding: '8px 20px' }}>
            Đóng bảng
          </button>
        </div>
      </div>
    </div>
  );
};
