
-- Function to assist in seeding specs safely
DO $$
DECLARE
    cat_id bigint;
BEGIN
    -- 1. โน๊ตบุ๊ค
    SELECT id INTO cat_id FROM public.categories WHERE name = 'โน๊ตบุ๊ค';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'CPU'), (cat_id, 'RAM'), (cat_id, 'Storage'), (cat_id, 'Display'), (cat_id, 'Graphics'), (cat_id, 'OS'), (cat_id, 'Weight')
        ON CONFLICT DO NOTHING; -- Note: table needs unique constraint for this to work perfectly, or just allow duplicates for demo
    END IF;

    -- 2. จอมอนิเตอร์
    SELECT id INTO cat_id FROM public.categories WHERE name = 'จอมอนิเตอร์';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'Screen Size'), (cat_id, 'Resolution'), (cat_id, 'Panel Type'), (cat_id, 'Refresh Rate'), (cat_id, 'Response Time')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 3. แท็บเล็ต
    SELECT id INTO cat_id FROM public.categories WHERE name = 'แท็บเล็ต';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'Screen Size'), (cat_id, 'Storage'), (cat_id, 'Color'), (cat_id, 'Connectivity'), (cat_id, 'Chipset')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4. ซีพียู
    SELECT id INTO cat_id FROM public.categories WHERE name = 'ซีพียู';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'Socket'), (cat_id, 'Cores / Threads'), (cat_id, 'Base Clock'), (cat_id, 'Boost Clock'), (cat_id, 'L3 Cache'), (cat_id, 'TDP')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 5. การ์ดจอ
    SELECT id INTO cat_id FROM public.categories WHERE name = 'การ์ดจอ';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'Graphic Engine'), (cat_id, 'Memory Size'), (cat_id, 'Memory Type'), (cat_id, 'Memory Interface'), (cat_id, 'Boost Clock'), (cat_id, 'PSU Requirement')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 6. เมนบอร์ด
    SELECT id INTO cat_id FROM public.categories WHERE name = 'เมนบอร์ด';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'Socket'), (cat_id, 'Chipset'), (cat_id, 'Form Factor'), (cat_id, 'Memory Support'), (cat_id, 'Storage'), (cat_id, 'LAN / Wireless')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 7. แรม
    SELECT id INTO cat_id FROM public.categories WHERE name = 'แรม';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'Memory Type (DDR)'), (cat_id, 'Capacity'), (cat_id, 'Bus Speed'), (cat_id, 'Latency (CL)'), (cat_id, 'Voltage')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 8. ฮาร์ดดิสก์ และ เอสเอสดี
    SELECT id INTO cat_id FROM public.categories WHERE name = 'ฮาร์ดดิสก์ และ เอสเอสดี';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'Form Factor'), (cat_id, 'Capacity'), (cat_id, 'Interface'), (cat_id, 'Sequencial Read'), (cat_id, 'Sequencial Write')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 9. พาวเวอร์ซัพพลาย
    SELECT id INTO cat_id FROM public.categories WHERE name = 'พาวเวอร์ซัพพลาย';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'Wattage'), (cat_id, '80 Plus Certification'), (cat_id, 'Modularity'), (cat_id, 'Fan Size')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 10. เคส
    SELECT id INTO cat_id FROM public.categories WHERE name = 'เคส';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'Form Factor Support'), (cat_id, 'Dimensions'), (cat_id, 'Side Panel'), (cat_id, 'Included Fans')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 11. ชุดระบายความร้อน
    SELECT id INTO cat_id FROM public.categories WHERE name = 'ชุดระบายความร้อน';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'Type (Air/Liquid)'), (cat_id, 'Fan Speed'), (cat_id, 'Noise Level'), (cat_id, 'Socket Support')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 12. คีย์บอร์ด
    SELECT id INTO cat_id FROM public.categories WHERE name = 'คีย์บอร์ด';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'Switch Type'), (cat_id, 'Key Layout'), (cat_id, 'Connectivity'), (cat_id, 'Backlight (RGB)')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 13. เมาส์
    SELECT id INTO cat_id FROM public.categories WHERE name = 'เมาส์';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'DPI Max'), (cat_id, 'Sensor Type'), (cat_id, 'Connectivity'), (cat_id, 'Programmable Buttons')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 14. ลำโพง
    SELECT id INTO cat_id FROM public.categories WHERE name = 'ลำโพง';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'Total Power (RMS)'), (cat_id, 'Channels'), (cat_id, 'Connectivity'), (cat_id, 'Frequency Response')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 15. เกมมิ่งเกียร์
    SELECT id INTO cat_id FROM public.categories WHERE name = 'เกมมิ่งเกียร์';
    IF cat_id IS NOT NULL THEN
        INSERT INTO public.category_specs (category_id, name) VALUES
        (cat_id, 'Type'), (cat_id, 'Connectivity'), (cat_id, 'Switch / Sensor'), (cat_id, 'Lighting (RGB)')
        ON CONFLICT DO NOTHING;
    END IF;

END $$;
