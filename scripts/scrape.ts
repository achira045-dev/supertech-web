import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// ควรย้ายไปเก็บใน .env.local เพื่อความปลอดภัย
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lgtlzhknafgnfwjuwazs.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_g6N812b8yqBMgf6R_cuvTg_JSViAUym';

const supabase = createClient(supabaseUrl, supabaseKey);

async function startScraping() {
    console.log('--- เริ่มต้นการดูดข้อมูลสินค้าจาก iHAVECPU (โหมด Next.js JSON) ---');
    try {
        const targetUrl = 'https://www.ihavecpu.com/category/cpu';

        // 1. ดึงข้อมูล HTML
        console.log('Fetching HTML...');
        const { data } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const jsonData = $('#__NEXT_DATA__').html();

        let items: any[] = [];

        if (jsonData) {
            const parsed = JSON.parse(jsonData);
            const products = parsed.props?.pageProps?.product?.data || [];

            console.log(`Found ${products.length} products in JSON data.`);

            items = products.map((p: any) => ({
                name: p.name_th,
                price: parseFloat(p.price_sale || p.price_before),
                image_url: p.image800 || p.image, // Use higher res image if available
                category: 'CPU',
                description: `Brand: ${p.brand}`
            }));
        } else {
            console.log('❌ ไม่พบข้อมูล __NEXT_DATA__ อาจต้องใช้วิธีอื่น');
        }

        console.log(`เตรียมอัปโหลดสินค้า ${items.length} รายการ...`);

        if (items.length > 0) {
            const { error } = await supabase.from('products').insert(items);
            if (error) throw error;
            console.log('✅ บันทึกเข้า Database สำเร็จ!');
        } else {
            console.log('⚠️ ไม่พบสินค้าที่จะบันทึก');
        }

    } catch (err: any) {
        console.error('❌ เกิดข้อผิดพลาด:', err.message);
    }
}

startScraping();