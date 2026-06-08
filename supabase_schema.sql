-- ==========================================================================
-- VU ANH MEDIA - MEDIAFLOW DATABASE SCHEMA FOR SUPABASE
-- COPY TOÀN BỘ NỘI DUNG FILE NÀY DÁN VÀO SQL EDITOR TRÊN SUPABASE ĐỂ CHẠY
-- ==========================================================================

-- 1. XÓA CÁC BẢNG CŨ NẾU CÓ (Để tránh xung đột khi làm lại)
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

-- 2. TẠO BẢNG USERS (Thành viên)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    "fullName" TEXT NOT NULL,
    role TEXT NOT NULL,
    position TEXT NOT NULL DEFAULT '',
    avatar TEXT NOT NULL DEFAULT '',
    "passwordHash" TEXT NOT NULL
);

-- 3. TẠO BẢNG PROJECTS (Dự án / Khách hàng)
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    client TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TẠO BẢNG TASKS (Công việc)
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    "assigneeId" TEXT REFERENCES users(id) ON DELETE SET NULL,
    position TEXT NOT NULL,
    "projectId" TEXT REFERENCES projects(id) ON DELETE CASCADE,
    deadline TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    checklist JSONB DEFAULT '[]'::jsonb,
    notes JSONB DEFAULT '[]'::jsonb,
    files JSONB DEFAULT '[]'::jsonb,
    reports JSONB DEFAULT '[]'::jsonb,
    logs JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TẮT ROW LEVEL SECURITY (RLS)
-- Để đơn giản hóa cho việc kết nối Client trực tiếp của team nhỏ, chúng ta tắt RLS.
-- (Nếu cần bảo mật cao hơn sau này, bạn có thể bật lại và cấu hình Policies).
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- 6. CHÈN DỮ LIỆU TÀI KHOẢN MẪU BAN ĐẦU (Nếu chưa có)
-- Mật khẩu mặc định là: tên_username + 123 (ví dụ: admin123, editor123...)
-- Passwords đã được hash bằng cơ chế base64+salt của hệ thống MediaFlow:
INSERT INTO users (id, username, "fullName", role, position, avatar, "passwordHash") VALUES
('u-1', 'admin', 'Vũ Thế Anh (Director)', 'admin', '', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'YWRtaW4xMjNfbWVkaWFmbG93X3NhbHQ='),
('u-2', 'editor', 'Nguyễn Văn Editor', 'staff', 'Editor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'ZWRpdG9yMTIzX21lZGlhZmxvd19zYWx0'),
('u-3', 'cameraman', 'Trần Văn Quay Phim', 'staff', 'Cameraman', 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80', 'Y2FtZXJhbWFuanMxMjNfbWVkaWFmbG93X3NhbHQ='),
('u-4', 'tiktok', 'Lê Thị TikToker', 'staff', 'TikTok', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'dGlrdG9rMTIzX21lZGlhZmxvd19zYWx0'),
('u-5', 'writer', 'Phạm Biên Tập Nội Dung', 'staff', 'Biên tập nội dung', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', 'd3JpdGVyMTIzX21lZGlhZmxvd19zYWx0')
ON CONFLICT (id) DO NOTHING;

-- 7. CHÈN CÁC DỰ ÁN MẪU BAN ĐẦU
INSERT INTO projects (id, name, client, description, status) VALUES
('p-1', 'Royal Beauty Clinic', 'Royal Beauty Group', 'Chiến dịch truyền thông phủ sóng thương hiệu cơ sở thẩm mỹ viện Royal Beauty Clinic dịp hè.', 'Active'),
('p-2', 'Nha khoa Quốc tế', 'Nha khoa Việt Mỹ', 'Sản xuất loạt video giới thiệu tay nghề bác sĩ và quy trình bọc răng sứ thẩm mỹ.', 'Active'),
('p-3', 'Dự án TikTok nội bộ', 'Vũ Anh Media', 'Xây dựng thương hiệu cá nhân của team Vũ Anh Media trên kênh TikTok đạt 100k followers.', 'Active'),
('p-4', 'Video giới thiệu doanh nghiệp', 'TechCorp Việt Nam', 'Phim tự giới thiệu doanh nghiệp kỉ niệm 10 năm thành lập TechCorp Việt Nam.', 'Active')
ON CONFLICT (id) DO NOTHING;
