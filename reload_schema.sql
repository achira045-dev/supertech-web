-- คำสั่งสำหรับรีเฟรช Cache ของ Supabase API
-- ใช้แก้ปัญหา Error: "Could not find the '...' column in the schema cache"

NOTIFY pgrst, 'reload schema';
