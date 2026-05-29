import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LocalDB, Task, Project, User, TaskStatus, TaskPriority } from '../db/localDb';
import { 
  Plus, 
  Search, 
  Filter, 
  SlidersHorizontal,
  Calendar,
  CheckCircle,
  Clock,
  User as UserIcon,
  Briefcase
} from 'lucide-react';
import { TaskModal } from './TaskModal';
import { TaskForm } from './TaskForm';

export const TaskBoard: React.FC = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    const allTasks = await LocalDB.getTasks();
    const allProjects = await LocalDB.getProjects();
    const allUsers = await LocalDB.getUsers();
    
    // Staff should only see their own tasks
    if (currentUser && currentUser.role !== 'admin') {
      setTasks(allTasks.filter(t => t.assigneeId === currentUser.id));
    } else {
      setTasks(allTasks);
    }
    
    setProjects(allProjects);
    setUsers(allUsers);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [currentUser]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    fetchAllData(); // Refresh to catch any updates inside the modal
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card modal
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    fetchAllData(); // Refresh database changes
  };

  const handleQuickStatusUpdate = async (task: Task, newStatus: TaskStatus, e: React.MouseEvent) => {
    if (!currentUser) return;
    e.stopPropagation(); // Avoid opening task modal
    const updated = { ...task, status: newStatus };
    await LocalDB.saveTask(updated, currentUser.fullName);
    fetchAllData();
  };

  if (!currentUser) return null;

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesProject = selectedProjectId ? task.projectId === selectedProjectId : true;
    const matchesAssignee = selectedAssigneeId ? task.assigneeId === selectedAssigneeId : true;
    const matchesPriority = selectedPriority ? task.priority === selectedPriority : true;

    return matchesSearch && matchesProject && matchesAssignee && matchesPriority;
  });

  // Kanban Columns
  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'Chưa bắt đầu', label: 'Chưa bắt đầu', color: '--status-none' },
    { status: 'Đang làm', label: 'Đang làm', color: '--status-doing' },
    { status: 'Chờ duyệt', label: 'Chờ duyệt', color: '--status-pending' },
    { status: 'Cần sửa', label: 'Cần sửa', color: '--status-repair' },
    { status: 'Hoàn thành', label: 'Hoàn thành', color: '--status-done' },
    { status: 'Trễ hạn', label: 'Trễ hạn', color: '--status-overdue' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title area */}
      <div className="page-title-section">
        <div>
          <h2 className="page-title">
            {currentUser.role === 'admin' ? 'BẢNG QUẢN LÝ CÔNG VIỆC' : 'CÔNG VIỆC ĐƯỢC GIAO CỦA TÔI'}
          </h2>
          <p className="page-subtitle">Theo dõi, điều phối và phản hồi báo cáo tiến độ thời gian thực</p>
        </div>
        {currentUser.role === 'admin' && (
          <button onClick={handleCreateTask} className="glass-btn glass-btn-primary">
            <Plus size={16} />
            <span>TẠO CÔNG VIỆC MỚI</span>
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="liquid-glass" style={{ padding: '18px 24px' }}>
        <div className="filter-bar">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              className="glass-input search-input" 
              placeholder="Tìm kiếm công việc bằng từ khóa..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
            
            <select 
              className="glass-input glass-select" 
              style={{ width: '150px' }}
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">Tất cả Dự án</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {currentUser.role === 'admin' && (
              <select 
                className="glass-input glass-select" 
                style={{ width: '150px' }}
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
              >
                <option value="">Tất cả Nhân sự</option>
                {users.filter(u => u.role === 'staff').map(u => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            )}

            <select 
              className="glass-input glass-select" 
              style={{ width: '140px' }}
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="">Tất cả Ưu tiên</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board columns wrapper */}
      {loading ? (
        <div style={{ fontSize: '0.88rem', fontFamily: 'var(--font-tech)', color: 'var(--accent)' }}>LOADING TELEMETRY CHANNELS...</div>
      ) : (
        <div className="kanban-board">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter(t => t.status === col.status);
            return (
              <div key={col.status} className="kanban-column">
                <div className="kanban-column-header">
                  <div className="kanban-column-title">
                    <span 
                      style={{ 
                        display: 'inline-block', 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: `var(${col.color})` 
                      }} 
                    />
                    <span>{col.label}</span>
                  </div>
                  <span className="kanban-column-count">{colTasks.length}</span>
                </div>

                <div 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px', 
                    overflowY: 'auto', 
                    maxHeight: '680px', 
                    padding: '4px' 
                  }}
                >
                  {colTasks.map((task) => {
                    const assignee = users.find(u => u.id === task.assigneeId);
                    const proj = projects.find(p => p.id === task.projectId);
                    
                    // Calculate checklist completion
                    const totalCheck = task.checklist.length;
                    const doneCheck = task.checklist.filter(c => c.completed).length;
                    const percentCheck = totalCheck > 0 ? Math.round((doneCheck / totalCheck) * 100) : 0;

                    // Check if deadline is today or overdue
                    const todayStr = new Date().toISOString().split('T')[0];
                    const isOverdue = task.deadline < todayStr && task.status !== 'Hoàn thành';

                    return (
                      <div 
                        key={task.id} 
                        className="task-card"
                        onClick={() => handleTaskClick(task)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <span className="task-card-project">
                            {proj ? proj.name : 'N/A'}
                          </span>
                          <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                        </div>

                        <h4 className="task-card-title">{task.title}</h4>

                        {totalCheck > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              <span>Checklist</span>
                              <span>{doneCheck}/{totalCheck} ({percentCheck}%)</span>
                            </div>
                            <div className="task-card-progress">
                              <div className="task-card-progress-bar" style={{ width: `${percentCheck}%` }} />
                            </div>
                          </div>
                        )}

                        <div className="task-card-meta">
                          <div className="task-card-assignee">
                            <img 
                              src={assignee ? assignee.avatar : 'https://via.placeholder.com/150'} 
                              alt={assignee ? assignee.fullName : 'None'} 
                              className="task-card-avatar"
                            />
                            <span style={{ fontSize: '0.72rem', fontWeight: 650 }}>{assignee ? assignee.fullName.split(' ').pop() : 'Chưa giao'}</span>
                          </div>

                          <div className={`task-card-deadline ${isOverdue ? 'near-due' : ''}`}>
                            <Calendar size={12} />
                            <span>{task.deadline.split('-').slice(1).join('/')}</span>
                          </div>
                        </div>

                        {/* Quick action buttons for Staff */}
                        {currentUser.role === 'staff' && (
                          <div 
                            style={{ 
                              borderTop: '1px solid rgba(15, 23, 42, 0.04)', 
                              paddingTop: '10px', 
                              marginTop: '4px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            {task.status === 'Chưa bắt đầu' && (
                              <button
                                onClick={(e) => handleQuickStatusUpdate(task, 'Đang làm', e)}
                                className="glass-btn glass-btn-primary"
                                style={{ fontSize: '0.72rem', padding: '6px 10px', width: '100%', justifyContent: 'center' }}
                              >
                                ▶ Bắt đầu làm ngay
                              </button>
                            )}
                            {(task.status === 'Đang làm' || task.status === 'Cần sửa') && (
                              <button
                                onClick={(e) => handleQuickStatusUpdate(task, 'Chờ duyệt', e)}
                                className="glass-btn glass-btn-primary"
                                style={{ fontSize: '0.72rem', padding: '6px 10px', width: '100%', justifyContent: 'center', background: 'var(--accent)' }}
                              >
                                📤 Gửi sếp Thế Anh duyệt
                              </button>
                            )}
                            {task.status === 'Chờ duyệt' && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--status-pending)', fontWeight: 'bold', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px', background: 'rgba(245, 158, 11, 0.04)', borderRadius: '8px', border: '1px dashed rgba(245, 158, 11, 0.15)' }}>
                                <span>⏳ Đang chờ sếp duyệt file</span>
                              </div>
                            )}
                            {task.status === 'Hoàn thành' && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--status-done)', fontWeight: 'bold', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px', background: 'rgba(16, 185, 129, 0.04)', borderRadius: '8px', border: '1px dashed rgba(16, 185, 129, 0.15)' }}>
                                <span>✅ Đã hoàn thành xuất sắc</span>
                              </div>
                            )}
                            {task.status === 'Trễ hạn' && (
                              <button
                                onClick={(e) => handleQuickStatusUpdate(task, 'Đang làm', e)}
                                className="glass-btn glass-btn-danger"
                                style={{ fontSize: '0.72rem', padding: '6px 10px', width: '100%', justifyContent: 'center' }}
                              >
                                ⚠️ Trễ hạn - Khắc phục ngay
                              </button>
                            )}
                          </div>
                        )}

                        {currentUser.role === 'admin' && (
                          <div 
                            style={{ 
                              borderTop: '1px solid rgba(15, 23, 42, 0.02)', 
                              paddingTop: '8px', 
                              marginTop: '2px', 
                              display: 'flex', 
                              justifyContent: 'flex-end' 
                            }}
                          >
                            <button
                              onClick={(e) => handleEditTask(task, e)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-tech)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Sửa Task
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div 
                      style={{ 
                        border: '1.5px dashed rgba(15, 23, 42, 0.03)', 
                        borderRadius: '12px', 
                        padding: '24px 10px', 
                        textAlign: 'center', 
                        color: 'var(--text-muted)',
                        fontSize: '0.78rem'
                      }}
                    >
                      Trống
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskModal 
          taskId={selectedTask.id} 
          onClose={handleCloseModal} 
        />
      )}

      {/* Task Create / Edit Modal Form */}
      {isFormOpen && (
        <TaskForm 
          task={editingTask} 
          onClose={handleCloseForm} 
        />
      )}
    </div>
  );
};
