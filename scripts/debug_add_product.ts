
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load Env
const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            if (key.trim() === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value.trim();
            if (key.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = value.trim();
        }
    });
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAdd() {
    console.log('Attempting to add product with failing URL...');
    const product = {
        name: 'Debug Product',
        price: 999,
        category: 'สินค้าทั่วไป',
        image_url: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products88910_800.jpg',
        description: 'Debug Description',
        stock: 10
    };

    const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select();

    if (error) {
        console.error('FAILED:', JSON.stringify(error, null, 2));
    } else {
        console.log('SUCCESS:', data);
    }
}

debugAdd();
