
-- Robust Sync Categories
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE TRIM(p.category) = TRIM(c.name)
AND p.category_id IS NULL;

-- Handle Specific English -> Thai Mappings
UPDATE public.products p SET category_id = (SELECT id FROM public.categories WHERE slug = 'storage') WHERE TRIM(category) ILIKE 'SSD' OR TRIM(category) ILIKE 'HDD' OR TRIM(category) ILIKE 'Storage';
UPDATE public.products p SET category_id = (SELECT id FROM public.categories WHERE slug = 'cpu') WHERE TRIM(category) ILIKE 'CPU';
UPDATE public.products p SET category_id = (SELECT id FROM public.categories WHERE slug = 'ram') WHERE TRIM(category) ILIKE 'RAM';
UPDATE public.products p SET category_id = (SELECT id FROM public.categories WHERE slug = 'motherboard') WHERE TRIM(category) ILIKE 'Mainboard';
UPDATE public.products p SET category_id = (SELECT id FROM public.categories WHERE slug = 'gpu') WHERE TRIM(category) ILIKE 'VGA' OR TRIM(category) ILIKE 'GPU';
UPDATE public.products p SET category_id = (SELECT id FROM public.categories WHERE slug = 'notebook') WHERE TRIM(category) ILIKE 'Laptop';

-- Force Sync specific mismatched text if any (Debugging)
-- e.g. 'ซีพียู' to id 5
UPDATE public.products 
SET category_id = (SELECT id FROM public.categories WHERE name = 'ซีพียู') 
WHERE category = 'ซีพียู' AND category_id IS NULL;

-- Re-run Brand Sync
UPDATE public.products p
SET brand_id = b.id
FROM public.brands b
WHERE p.name ILIKE '%' || b.name || '%'
AND p.brand_id IS NULL;
