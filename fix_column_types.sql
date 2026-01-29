-- เปลี่ยนชนิดข้อมูลของ column image_url ให้เป็น TEXT (รับความยาวได้ไม่จำกัด)
-- ป้องกันปัญหา value too long for type character varying(...)
ALTER TABLE public.products ALTER COLUMN image_url TYPE text;
ALTER TABLE public.products ALTER COLUMN name TYPE text;
ALTER TABLE public.products ALTER COLUMN category TYPE text;
ALTER TABLE public.products ALTER COLUMN description TYPE text;

-- รีเฟรช Schema Cache
NOTIFY pgrst, 'reload schema';
