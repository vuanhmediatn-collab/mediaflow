import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'staff';
  position: 'Editor' | 'Cameraman' | 'TikTok' | 'Biên tập nội dung' | '';
  avatar: string;
  passwordHash: string; // Base64 simple representation for presentation
}

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  status: 'Active' | 'Completed' | 'OnHold';
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskNote {
  id: string;
  userId: string;
  fullName: string;
  text: string;
  createdAt: string;
}

export interface TaskFile {
  name: string;
  url: string;
}

export interface TaskReport {
  id: string;
  userId: string;
  fullName: string;
  text: string;
  type: 'progress' | 'issue';
  fileUrl?: string;
  createdAt: string;
}

export interface TaskLog {
  id: string;
  text: string;
  createdAt: string;
}

export type TaskStatus = 'Chưa bắt đầu' | 'Đang làm' | 'Chờ duyệt' | 'Cần sửa' | 'Hoàn thành' | 'Trễ hạn';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string; // User ID
  position: 'Editor' | 'Cameraman' | 'TikTok' | 'Biên tập nội dung';
  projectId: string; // Project ID
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  checklist: ChecklistItem[];
  notes: TaskNote[];
  files: TaskFile[];
  reports: TaskReport[];
  logs: TaskLog[];
  createdAt: string;
}

const STORAGE_KEYS = {
  USERS: 'mediaflow_users',
  PROJECTS: 'mediaflow_projects',
  TASKS: 'mediaflow_tasks'
};

// Simple hashing function for storage
const hashPassword = (password: string): string => {
  return btoa(password + '_mediaflow_salt');
};

// Initial Seed Data
const DEFAULT_USERS: User[] = [
  {
    id: 'u-1',
    username: 'admin',
    fullName: 'Vũ Thế Anh (Director)',
    role: 'admin',
    position: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    passwordHash: hashPassword('admin123')
  },
  {
    id: 'u-2',
    username: 'editor',
    fullName: 'Nguyễn Văn Editor',
    role: 'staff',
    position: 'Editor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    passwordHash: hashPassword('editor123')
  },
  {
    id: 'u-3',
    username: 'cameraman',
    fullName: 'Trần Văn Quay Phim',
    role: 'staff',
    position: 'Cameraman',
    avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
    passwordHash: hashPassword('cameraman123')
  },
  {
    id: 'u-4',
    username: 'tiktok',
    fullName: 'Lê Thị TikToker',
    role: 'staff',
    position: 'TikTok',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    passwordHash: hashPassword('tiktok123')
  },
  {
    id: 'u-5',
    username: 'writer',
    fullName: 'Phạm Biên Tập Nội Dung',
    role: 'staff',
    position: 'Biên tập nội dung',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    passwordHash: hashPassword('writer123')
  }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'p-1',
    name: 'Royal Beauty Clinic',
    client: 'Royal Beauty Group',
    description: 'Chiến dịch truyền thông phủ sóng thương hiệu cơ sở thẩm mỹ viện Royal Beauty Clinic dịp hè.',
    status: 'Active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'p-2',
    name: 'Nha khoa Quốc tế',
    client: 'Nha khoa Việt Mỹ',
    description: 'Sản xuất loạt video giới thiệu tay nghề bác sĩ và quy trình bọc răng sứ thẩm mỹ.',
    status: 'Active',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'p-3',
    name: 'Dự án TikTok nội bộ',
    client: 'Vũ Anh Media',
    description: 'Xây dựng thương hiệu cá nhân của team Vũ Anh Media trên kênh TikTok đạt 100k followers.',
    status: 'Active',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'p-4',
    name: 'Video giới thiệu doanh nghiệp',
    client: 'TechCorp Việt Nam',
    description: 'Phim tự giới thiệu doanh nghiệp kỉ niệm 10 năm thành lập TechCorp Việt Nam.',
    status: 'Active',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Lên kịch bản video review Royal Beauty Clinic',
    description: 'Viết kịch bản chi tiết 3 phút giới thiệu trải nghiệm làm đẹp của khách hàng KOLS tại Clinic. Tập trung vào không gian sang trọng và công nghệ laser cao cấp.',
    assigneeId: 'u-5', // Content Writer
    position: 'Biên tập nội dung',
    projectId: 'p-1',
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
    priority: 'High',
    status: 'Hoàn thành',
    checklist: [
      { id: 'c-1', text: 'Nghiên cứu USP công nghệ laser mới', completed: true },
      { id: 'c-2', text: 'Viết kịch bản phân cảnh chi tiết', completed: true },
      { id: 'c-3', text: 'Duyệt kịch bản với đạo diễn hình ảnh', completed: true }
    ],
    notes: [
      { id: 'n-1', userId: 'u-1', fullName: 'Vũ Thế Anh (Director)', text: 'Kịch bản tốt, đã duyệt để Cameraman tiến hành quay.', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    files: [
      { name: 'Kich_ban_Royal_Laser.docx', url: 'https://docs.google.com/document/d/demo1' }
    ],
    reports: [
      { id: 'r-1', userId: 'u-5', fullName: 'Phạm Biên Tập Nội Dung', text: 'Đã hoàn thành kịch bản phân cảnh và lấy feedback đạo diễn.', type: 'progress', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    logs: [
      { id: 'l-1', text: 'Task được tạo bởi Vũ Thế Anh', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'l-2', text: 'Trạng thái chuyển sang Đang làm bởi Phạm Biên Tập Nội Dung', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'l-3', text: 'Trạng thái chuyển sang Chờ duyệt bởi Phạm Biên Tập Nội Dung', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'l-4', text: 'Trạng thái chuyển sang Hoàn thành bởi Vũ Thế Anh', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-2',
    title: 'Quay phim tại Nha khoa Quốc tế',
    description: 'Đến trực tiếp cơ sở Nha khoa Việt Mỹ để ghi hình quy trình làm răng sứ. Quay cận cảnh công nghệ scan hàm 3D và phỏng vấn bác sĩ trưởng khoa.',
    assigneeId: 'u-3', // Cameraman
    position: 'Cameraman',
    projectId: 'p-2',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    priority: 'Urgent',
    status: 'Đang làm',
    checklist: [
      { id: 'c-4', text: 'Chuẩn bị thiết bị: Sony A7SIII, Gimbal, Mic không dây', completed: true },
      { id: 'c-5', text: 'Liên hệ bác sĩ trưởng khoa hẹn giờ phỏng vấn', completed: true },
      { id: 'c-6', text: 'Quay beauty-shots không gian phòng khám', completed: false },
      { id: 'c-7', text: 'Quay quy trình làm răng trực tiếp', completed: false }
    ],
    notes: [
      { id: 'n-2', userId: 'u-3', fullName: 'Trần Văn Quay Phim', text: 'Đã chuẩn bị đầy đủ thiết bị, chiều nay 2h bắt đầu bấm máy.', createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    files: [
      { name: 'Shotlist_Nhakhoa.xlsx', url: 'https://docs.google.com/spreadsheets/d/demo2' }
    ],
    reports: [
      { id: 'r-2', userId: 'u-3', fullName: 'Trần Văn Quay Phim', text: 'Đã hoàn thành quay shot không gian, đang đợi bác sĩ rảnh để quay phỏng vấn.', type: 'progress', createdAt: new Date().toISOString() }
    ],
    logs: [
      { id: 'l-5', text: 'Task được tạo bởi Vũ Thế Anh', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'l-6', text: 'Trạng thái chuyển sang Đang làm bởi Trần Văn Quay Phim', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-3',
    title: 'Edit video giới thiệu doanh nghiệp TechCorp',
    description: 'Dựng bản thô (First Cut) thời lượng 5 phút cho phim tự giới thiệu TechCorp. Cần đồng bộ voice-off với hình ảnh tư liệu văn phòng, chèn nhạc nền công nghệ hiện đại.',
    assigneeId: 'u-2', // Editor
    position: 'Editor',
    projectId: 'p-4',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days later
    priority: 'High',
    status: 'Chờ duyệt',
    checklist: [
      { id: 'c-8', text: 'Lọc source hình và đồng bộ âm thanh voice-off', completed: true },
      { id: 'c-9', text: 'Dựng khung sườn phân cảnh theo kịch bản', completed: true },
      { id: 'c-10', text: 'Chèn text subtitle và làm hiệu ứng title 3D', completed: true },
      { id: 'c-11', text: 'Cân màu cơ bản (Color grading)', completed: true }
    ],
    notes: [
      { id: 'n-3', userId: 'u-2', fullName: 'Nguyễn Văn Editor', text: 'Đã xuất bản nháp 1 chất lượng 1080p, gửi sếp duyệt giúp.', createdAt: new Date().toISOString() }
    ],
    files: [
      { name: 'TechCorp_Promo_Draft1.mp4', url: 'https://drive.google.com/file/d/demo3' }
    ],
    reports: [
      { id: 'r-3', userId: 'u-2', fullName: 'Nguyễn Văn Editor', text: 'Đã hoàn thành toàn bộ checklist dựng thô và gửi link Drive bản nháp 1.', type: 'progress', createdAt: new Date().toISOString() }
    ],
    logs: [
      { id: 'l-7', text: 'Task được tạo bởi Vũ Thế Anh', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'l-8', text: 'Trạng thái chuyển sang Đang làm bởi Nguyễn Văn Editor', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'l-9', text: 'Trạng thái chuyển sang Chờ duyệt bởi Nguyễn Văn Editor', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-4',
    title: 'Lên ý tưởng video TikTok nội bộ tuần này',
    description: 'Nghiên cứu các hot trend TikTok liên quan đến hậu trường làm phim hoặc tình huống hài hước văn phòng media để biên soạn 5 ý tưởng sơ bộ cho kênh Vũ Anh Media.',
    assigneeId: 'u-4', // TikTok
    position: 'TikTok',
    projectId: 'p-3',
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'Medium',
    status: 'Chưa bắt đầu',
    checklist: [
      { id: 'c-12', text: 'Phân tích 5 kênh TikTok media đối thủ', completed: false },
      { id: 'c-13', text: 'Lên 5 concept tình huống hài hước hậu trường', completed: false },
      { id: 'c-14', text: 'Họp team chốt 3 ý tưởng xuất sắc nhất', completed: false }
    ],
    notes: [],
    files: [],
    reports: [],
    logs: [
      { id: 'l-10', text: 'Task được tạo bởi Vũ Thế Anh', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 't-5',
    title: 'Dựng video nháp số 1 cho Royal Beauty Clinic',
    description: 'Ghép nối các source quay của ngày 28/05. Chú ý làm mịn da cho KOL và chèn các hiệu ứng transition dạng liquid/glow lấp lánh như phong cách Vũ Anh Media.',
    assigneeId: 'u-2', // Editor
    position: 'Editor',
    projectId: 'p-1',
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago (overdue)
    priority: 'High',
    status: 'Cần sửa',
    checklist: [
      { id: 'c-15', text: 'Đồng bộ voice và dựng thô cảnh trải nghiệm', completed: true },
      { id: 'c-16', text: 'Cân chỉnh màu da mặt KOL (Skin tone correction)', completed: true },
      { id: 'c-17', text: 'Lồng nhạc nền nhẹ nhàng sang trọng', completed: true },
      { id: 'c-18', text: 'Duyệt bản nháp 1 với khách hàng', completed: true }
    ],
    notes: [
      { id: 'n-4', userId: 'u-1', fullName: 'Vũ Thế Anh (Director)', text: 'Khách hàng feedback nhạc nền hơi buồn ngủ, và màu da KOL cần sáng hồng lên một chút. Tiến hành sửa gấp trong hôm nay.', createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() }
    ],
    files: [
      { name: 'Royal_Draft1_LinkDrive.txt', url: 'https://drive.google.com/file/d/demo5' }
    ],
    reports: [
      { id: 'r-4', userId: 'u-2', fullName: 'Nguyễn Văn Editor', text: 'Gặp vấn đề: Máy tính render bị sập nguồn liên tục do lỗi card màn hình, em đang cài lại Premiere để xử lý gấp, có thể trễ hạn bàn giao 1 chút.', type: 'issue', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    logs: [
      { id: 'l-11', text: 'Task được tạo bởi Vũ Thế Anh', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'l-12', text: 'Trạng thái chuyển sang Đang làm bởi Nguyễn Văn Editor', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'l-13', text: 'Trạng thái chuyển sang Chờ duyệt bởi Nguyễn Văn Editor', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'l-14', text: 'Trạng thái chuyển sang Cần sửa bởi Vũ Thế Anh', createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-6',
    title: 'Chụp ảnh profile bác sĩ Nha khoa',
    description: 'Chụp ảnh chân dung (Studio profile) cho 5 bác sĩ trưởng khoa tại Nha khoa Việt Mỹ. Chuẩn bị phông nền xám khói di động và 2 đèn softbox.',
    assigneeId: 'u-3', // Cameraman
    position: 'Cameraman',
    projectId: 'p-2',
    deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Completed in the past
    priority: 'Low',
    status: 'Hoàn thành',
    checklist: [
      { id: 'c-19', text: 'Chuẩn bị phông nền di động và hệ thống đèn flash', completed: true },
      { id: 'c-20', text: 'Chụp ảnh tạo dáng cho từng bác sĩ (mỗi người 15-20 shots)', completed: true },
      { id: 'c-21', text: 'Lọc ra 3 file ảnh đẹp nhất mỗi bác sĩ bàn giao', completed: true }
    ],
    notes: [],
    files: [
      { name: 'Anh_Profile_Bác_Sĩ_Final.zip', url: 'https://drive.google.com/file/d/demo6' }
    ],
    reports: [],
    logs: [
      { id: 'l-15', text: 'Task được tạo bởi Vũ Thế Anh', createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'l-16', text: 'Trạng thái chuyển sang Đang làm bởi Trần Văn Quay Phim', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'l-17', text: 'Trạng thái chuyển sang Hoàn thành bởi Trần Văn Quay Phim', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-7',
    title: 'Đăng tải và tối ưu SEO video TikTok Nha khoa',
    description: 'Đăng tải video đã hoàn thiện lên kênh TikTok Nha khoa Việt Mỹ. Nghiên cứu hashtag phù hợp, viết caption hấp dẫn thu hút người xem và cài đặt khung giờ vàng (19h-20h).',
    assigneeId: 'u-4', // TikTok
    position: 'TikTok',
    projectId: 'p-2',
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago (overdue)
    priority: 'High',
    status: 'Trễ hạn',
    checklist: [
      { id: 'c-22', text: 'Nghiên cứu 10 hashtags thịnh hành về răng sứ', completed: true },
      { id: 'c-23', text: 'Viết caption khơi gợi sự tò mò (Call to action)', completed: true },
      { id: 'c-24', text: 'Lập lịch đăng tải vào khung giờ 19h30 tối', completed: false }
    ],
    notes: [],
    files: [],
    reports: [
      { id: 'r-5', userId: 'u-4', fullName: 'Lê Thị TikToker', text: 'Chưa có file video hoàn thiện được duyệt từ Editor nên em chưa thể lên lịch đăng được ạ.', type: 'issue', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    logs: [
      { id: 'l-18', text: 'Task được tạo bởi Vũ Thế Anh', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'l-19', text: 'Trạng thái chuyển sang Đang làm bởi Lê Thị TikToker', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'l-20', text: 'Hệ thống tự động phát hiện trễ deadline - Đổi trạng thái sang Trễ hạn', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-8',
    title: 'Viết kịch bản 5 video TikTok nội bộ',
    description: 'Biên soạn chi tiết kịch bản thời lượng 30s-45s cho 5 video TikTok hài hước về đời sống văn phòng sản xuất truyền thông. Yêu cầu kịch bản ngắn gọn, lời thoại dí dỏm.',
    assigneeId: 'u-5', // Content Writer
    position: 'Biên tập nội dung',
    projectId: 'p-3',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'Medium',
    status: 'Đang làm',
    checklist: [
      { id: 'c-25', text: 'Viết kịch bản video 1: Trùm camera bắt bẻ', completed: true },
      { id: 'c-26', text: 'Viết kịch bản video 2: Khi Editor đòi file gốc', completed: true },
      { id: 'c-27', text: 'Viết kịch bản video 3: Nỗi lòng TikToker chạy KPI', completed: false },
      { id: 'c-28', text: 'Viết kịch bản video 4: Khách hàng yêu cầu đổi nhạc 10 lần', completed: false },
      { id: 'c-29', text: 'Viết kịch bản video 5: Ngày phát lương của team Media', completed: false }
    ],
    notes: [],
    files: [],
    reports: [],
    logs: [
      { id: 'l-21', text: 'Task được tạo bởi Vũ Thế Anh', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'l-22', text: 'Trạng thái chuyển sang Đang làm bởi Phạm Biên Tập Nội Dung', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export class LocalDB {
  static init() {
    if (!isSupabaseConfigured) {
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
      }
      this.checkAndUpdateOverdueTasks();
    }
  }

  private static checkAndUpdateOverdueTasks() {
    const tasks: Task[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    const today = new Date().toISOString().split('T')[0];
    let changed = false;

    const updatedTasks = tasks.map(task => {
      if (
        task.status !== 'Hoàn thành' &&
        task.status !== 'Trễ hạn' &&
        task.deadline < today
      ) {
        changed = true;
        const systemLog: TaskLog = {
          id: 'l-sys-' + Math.random().toString(36).substr(2, 9),
          text: `Hệ thống tự động phát hiện trễ deadline - Đổi trạng thái từ ${task.status} sang Trễ hạn`,
          createdAt: new Date().toISOString()
        };
        return {
          ...task,
          status: 'Trễ hạn' as TaskStatus,
          logs: [...task.logs, systemLog]
        };
      }
      return task;
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
    }
  }

  // --- USERS CRUD ---
  static getUsersSync(): User[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  static async getUsers(): Promise<User[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        return data as User[];
      } catch (err) {
        console.error('Supabase getUsers error:', err);
        return this.getUsersSync();
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getUsersSync());
      }, 150);
    });
  }

  static async saveUser(user: User): Promise<User> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('users').upsert(user);
        if (error) throw error;
        return user;
      } catch (err) {
        console.error('Supabase saveUser error:', err);
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = this.getUsersSync();
        const existingIndex = users.findIndex(u => u.id === user.id);
        if (existingIndex > -1) {
          users[existingIndex] = user;
        } else {
          users.push(user);
        }
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        resolve(user);
      }, 200);
    });
  }

  static async deleteUser(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Supabase deleteUser error:', err);
        return false;
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = this.getUsersSync();
        const filtered = users.filter(u => u.id !== id);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
        resolve(true);
      }, 200);
    });
  }

  // --- PROJECTS CRUD ---
  static getProjectsSync(): Project[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
  }

  static async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('projects').select('*').order('name', { ascending: true });
        if (error) throw error;
        return data as Project[];
      } catch (err) {
        console.error('Supabase getProjects error:', err);
        return this.getProjectsSync();
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getProjectsSync());
      }, 150);
    });
  }

  static async saveProject(project: Project): Promise<Project> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('projects').upsert(project);
        if (error) throw error;
        return project;
      } catch (err) {
        console.error('Supabase saveProject error:', err);
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const projects = this.getProjectsSync();
        const existingIndex = projects.findIndex(p => p.id === project.id);
        if (existingIndex > -1) {
          projects[existingIndex] = project;
        } else {
          projects.push(project);
        }
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
        resolve(project);
      }, 200);
    });
  }

  static async deleteProject(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Supabase deleteProject error:', err);
        return false;
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const projects = this.getProjectsSync();
        const filtered = projects.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
        resolve(true);
      }, 200);
    });
  }

  // --- TASKS CRUD ---
  static getTasksSync(): Task[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
  }

  static async getTasks(): Promise<Task[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('createdAt', { ascending: false });
        
        if (error) throw error;

        // Auto check for overdue tasks and update status dynamically
        const today = new Date().toISOString().split('T')[0];
        const updatedTasks = (data as Task[]).map(task => {
          if (
            task.status !== 'Hoàn thành' &&
            task.status !== 'Trễ hạn' &&
            task.deadline < today
          ) {
            const systemLog: TaskLog = {
              id: 'l-sys-' + Math.random().toString(36).substr(2, 9),
              text: `Hệ thống tự động phát hiện trễ deadline - Đổi trạng thái từ ${task.status} sang Trễ hạn`,
              createdAt: new Date().toISOString()
            };
            const newTask = {
              ...task,
              status: 'Trễ hạn' as TaskStatus,
              logs: [...task.logs, systemLog]
            };
            
            // Fire-and-forget update in background
            supabase
              .from('tasks')
              .update({ status: 'Trễ hạn', logs: newTask.logs })
              .eq('id', task.id)
              .then(({ error: updateErr }) => {
                if (updateErr) console.error('Failed to auto update task status', updateErr);
              });

            return newTask;
          }
          return task;
        });

        return updatedTasks;
      } catch (err) {
        console.error('Supabase getTasks error, falling back to local:', err);
        return this.getTasksSync();
      }
    } else {
      this.checkAndUpdateOverdueTasks();
      return this.getTasksSync();
    }
  }

  static async getTaskById(id: string): Promise<Task | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single();
        if (error) throw error;
        return data as Task;
      } catch (err) {
        console.error('Supabase getTaskById error:', err);
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const tasks = this.getTasksSync();
        const found = tasks.find(t => t.id === id);
        resolve(found || null);
      }, 150);
    });
  }

  static async saveTask(task: Task, actorName: string): Promise<Task> {
    if (isSupabaseConfigured) {
      try {
        const now = new Date().toISOString();
        let finalTask = { ...task };

        // Fetch old task to compare and write log entries
        const { data: oldTaskData } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', task.id)
          .maybeSingle();

        if (oldTaskData) {
          const oldTask = oldTaskData as Task;
          const logs = [...finalTask.logs];

          if (oldTask.status !== finalTask.status) {
            logs.push({
              id: 'l-' + Math.random().toString(36).substr(2, 9),
              text: `Trạng thái chuyển sang "${finalTask.status}" bởi ${actorName}`,
              createdAt: now
            });
          }
          if (oldTask.assigneeId !== finalTask.assigneeId) {
            const users = await this.getUsers();
            const assignee = users.find(u => u.id === finalTask.assigneeId);
            logs.push({
              id: 'l-' + Math.random().toString(36).substr(2, 9),
              text: `Được giao cho ${assignee ? assignee.fullName : 'không rõ'} bởi ${actorName}`,
              createdAt: now
            });
          }

          finalTask.logs = logs;
        } else {
          // New task
          finalTask.createdAt = now;
          finalTask.logs = [
            {
              id: 'l-' + Math.random().toString(36).substr(2, 9),
              text: `Công việc được tạo bởi ${actorName}`,
              createdAt: now
            }
          ];

          const users = await this.getUsers();
          const assignee = users.find(u => u.id === finalTask.assigneeId);
          if (assignee) {
            finalTask.logs.push({
              id: 'l-' + Math.random().toString(36).substr(2, 9),
              text: `Được giao cho ${assignee.fullName} bởi ${actorName}`,
              createdAt: now
            });
          }
        }

        const { error } = await supabase.from('tasks').upsert(finalTask);
        if (error) throw error;
        return finalTask;
      } catch (err) {
        console.error('Supabase saveTask error:', err);
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const tasks = this.getTasksSync();
        const existingIndex = tasks.findIndex(t => t.id === task.id);
        
        let finalTask = { ...task };
        const now = new Date().toISOString();

        if (existingIndex > -1) {
          const oldTask = tasks[existingIndex];
          const logs = [...finalTask.logs];
          
          if (oldTask.status !== finalTask.status) {
            logs.push({
              id: 'l-' + Math.random().toString(36).substr(2, 9),
              text: `Trạng thái chuyển sang "${finalTask.status}" bởi ${actorName}`,
              createdAt: now
            });
          }
          if (oldTask.assigneeId !== finalTask.assigneeId) {
            const users = this.getUsersSync();
            const assignee = users.find(u => u.id === finalTask.assigneeId);
            logs.push({
              id: 'l-' + Math.random().toString(36).substr(2, 9),
              text: `Được giao cho ${assignee ? assignee.fullName : 'không rõ'} bởi ${actorName}`,
              createdAt: now
            });
          }
          
          finalTask.logs = logs;
          tasks[existingIndex] = finalTask;
        } else {
          finalTask.createdAt = now;
          finalTask.logs = [
            {
              id: 'l-' + Math.random().toString(36).substr(2, 9),
              text: `Công việc được tạo bởi ${actorName}`,
              createdAt: now
            }
          ];
          
          const users = this.getUsersSync();
          const assignee = users.find(u => u.id === finalTask.assigneeId);
          if (assignee) {
            finalTask.logs.push({
              id: 'l-' + Math.random().toString(36).substr(2, 9),
              text: `Được giao cho ${assignee.fullName} bởi ${actorName}`,
              createdAt: now
            });
          }
          tasks.push(finalTask);
        }
        
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        resolve(finalTask);
      }, 250);
    });
  }

  static async deleteTask(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Supabase deleteTask error:', err);
        return false;
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const tasks = this.getTasksSync();
        const filtered = tasks.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
        resolve(true);
      }, 200);
    });
  }

  // Helper authentication method
  static async authenticate(username: string, passwordPlain: string): Promise<User | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username.toLowerCase());
          
        if (error) throw error;
        if (data && data.length > 0) {
          const matchedUser = data[0] as User;
          if (matchedUser.passwordHash === hashPassword(passwordPlain)) {
            return matchedUser;
          }
        }
        return null;
      } catch (err) {
        console.error('Supabase authenticate error:', err);
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const users = this.getUsersSync();
        const matchedUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (matchedUser && matchedUser.passwordHash === hashPassword(passwordPlain)) {
          resolve(matchedUser);
        } else {
          resolve(null);
        }
      }, 300);
    });
  }

  static hashPasswordPublic(password: string): string {
    return hashPassword(password);
  }
}
