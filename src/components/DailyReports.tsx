import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LocalDB, Task, TaskReport, Project, User } from '../db/localDb';
import { ClipboardList, AlertCircle, Link as LinkIcon, Calendar, Search, Filter } from 'lucide-react';

export const DailyReports: React.FC = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters (Admin only)
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const loadData = async () => {
    setLoading(true);
    const allTasks = await LocalDB.getTasks();
    const allProjects = await LocalDB.getProjectsSync();
    const allUsers = await LocalDB.getUsersSync();
    
    setTasks(allTasks);
    setProjects(allProjects);
    setUsers(allUsers);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!currentUser) return null;

  // Extract all reports from tasks and augment with task/project context
  const allReports = tasks.flatMap(task => {
    const proj = projects.find(p => p.id === task.projectId);
    return task.reports.map(rep => ({
      ...rep,
      taskTitle: task.title,
      taskId: task.id,
      projectName: proj ? proj.name : 'N/A'
    }));
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter reports
  const filteredReports = allReports.filter(rep => {
    // If staff, only show their own reports
    if (currentUser.role !== 'admin' && rep.userId !== currentUser.id) {
      return false;
    }
    
    const matchesAssignee = selectedAssigneeId ? rep.userId === selectedAssigneeId : true;
    const matchesType = selectedType ? rep.type === selectedType : true;

    return matchesAssignee && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-title-section">
        <div>
          <h2 className="page-title">
            {currentUser.role === 'admin' ? 'BÁO CÁO CÔNG VIỆC TOÀN TEAM' : 'BÁO CÁO CỦA TÔI'}
          </h2>
          <p className="page-subtitle">Nhật ký tiến độ, sản phẩm bàn giao và sự cố phát sinh</p>
        </div>
      </div>

      {/* Filters (Admin only) */}
      {currentUser.role === 'admin' && (
        <div className="liquid-glass" style={{ padding: '18px 24px' }}>
          <div className="filter-bar">
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>BỘ LỌC BÁO CÁO:</span>
            
            <select 
              className="glass-input glass-select" 
              style={{ width: '200px' }}
              value={selectedAssigneeId}
              onChange={(e) => setSelectedAssigneeId(e.target.value)}
            >
              <option value="">Tất cả Nhân viên</option>
              {users.filter(u => u.role === 'staff').map(u => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.position})</option>
              ))}
            </select>

            <select 
              className="glass-input glass-select" 
              style={{ width: '180px' }}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">Tất cả Thể loại</option>
              <option value="progress">Báo cáo tiến độ</option>
              <option value="issue">Sự cố khẩn cấp ⚠️</option>
            </select>
          </div>
        </div>
      )}

      {/* Reports feed */}
      {loading ? (
        <div style={{ fontSize: '0.88rem', fontFamily: 'var(--font-tech)', color: 'var(--accent)' }}>RETRIEVING REPORT TRANSLATIONS...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredReports.length > 0 ? (
            filteredReports.map((rep) => {
              const reporter = users.find(u => u.id === rep.userId);
              return (
                <div 
                  key={rep.id} 
                  className="liquid-glass report-card"
                  style={{ 
                    borderLeft: `5px solid ${
                      rep.type === 'issue' 
                        ? 'var(--priority-urgent)' 
                        : 'var(--status-done)'
                    }` 
                  }}
                >
                  <div className="report-header">
                    <div className="report-meta">
                      <img 
                        src={reporter ? reporter.avatar : 'https://via.placeholder.com/150'} 
                        alt={rep.fullName} 
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="report-author">{rep.fullName}</span>
                          <span className="report-role">
                            {reporter ? reporter.position : 'Staff'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Thuộc dự án: <strong>{rep.projectName}</strong> | Task: <strong>{rep.taskTitle}</strong>
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className="report-time">
                        {rep.createdAt.split('T')[0]} {rep.createdAt.split('T')[1].slice(0, 5)}
                      </span>
                      <span 
                        style={{ 
                          fontSize: '0.62rem', 
                          fontWeight: 800, 
                          color: rep.type === 'issue' ? 'var(--priority-urgent)' : 'var(--status-done)',
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-tech)'
                        }}
                      >
                        {rep.type === 'issue' ? '⚠️ SỰ CỐ PHÁT SINH' : '✅ TIẾN ĐỘ'}
                      </span>
                    </div>
                  </div>

                  <p className="report-content" style={{ whiteSpace: 'pre-wrap' }}>
                    {rep.text}
                  </p>

                  {rep.fileUrl && (
                    <a 
                      href={rep.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="report-attachment"
                    >
                      <LinkIcon size={12} />
                      <span>Xem tệp bàn giao / link Driver liên quan</span>
                    </a>
                  )}
                </div>
              );
            })
          ) : (
            <div 
              className="liquid-glass" 
              style={{ 
                padding: '48px', 
                textAlign: 'center', 
                color: 'var(--text-muted)',
                fontSize: '0.9rem' 
              }}
            >
              <ClipboardList size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              Chưa có bản báo cáo công việc nào được gửi trong phạm vi lọc.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
