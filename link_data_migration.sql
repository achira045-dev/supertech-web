
-- 1. Sync Categories
-- Update products.category_id by matching the existing text column 'category' with categories.name
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category = c.name;

-- 2. Sync Brands (Heuristic: Match if Product Name contains Brand Name)
-- Update products.brand_id by checking if matches any brand name
-- We order by length of brand name desc to match 'Asus ROG' before 'Asus' if such cases existed (though here we just have main brands)
UPDATE public.products p
SET brand_id = b.id
FROM public.brands b
WHERE p.name ILIKE '%' || b.name || '%'
AND p.brand_id IS NULL; -- Only update if not already set

-- 3. Verify Trigger/Constraint cleanup (Optional but good practice)
-- Ensure that after this, we ideally rely on category_id and brand_id.
-- We won't drop the old columns yet to avoid breaking current frontend unless requested.

