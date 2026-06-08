import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Kiểm tra xem đã điền đầy đủ Key chưa, nếu chưa có thì log cảnh báo và dùng localstorage fallback
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url');

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Cảnh báo: Chưa cấu hình VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong file .env.\n' +
    'Hệ thống đang tự động chuyển sang chế độ LocalStorage để xem trước giao diện.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
