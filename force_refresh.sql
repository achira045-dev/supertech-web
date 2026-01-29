-- 1. บังคับอัปเดต cache ด้วยการแก้ comment (ไม่มีผลกับข้อมูล)
COMMENT ON TABLE public.products IS 'Products table - Refreshed Cache';

-- 2. เพื่อความชัวร์ ตรวจสอบว่ามีคอลัมน์ครบ
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock integer default 0;

-- 3. สั่ง Refresh Schema Explicitly อีกครั้ง
NOTIFY pgrst, 'reload schema';
