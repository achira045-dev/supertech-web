
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAddProduct() {
    console.log('Testing adding product with category "โน๊ตบุ๊ค"...');

    const payload = {
        name: 'Test Notebook ' + Date.now(),
        price: 25000,
        category: 'โน๊ตบุ๊ค',
        image_url: 'https://example.com/test.jpg',
        description: 'Test description with specs',
        stock: 0
    };

    const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error('FAILED to add notebook:', error);
    } else {
        console.log('SUCCESS adding notebook:', data);

        // Clean up
        const { error: delError } = await supabase.from('products').delete().eq('id', data.id);
        if (delError) console.error('Error cleaning up:', delError);
    }

    console.log('Testing adding product with category "สินค้าทั่วไป"...');
    const payloadGeneral = {
        name: 'Test General ' + Date.now(),
        price: 100,
        category: 'สินค้าทั่วไป',
        image_url: 'https://example.com/general.jpg',
        description: 'General desc',
        stock: 0
    };

    const { data: dataG, error: errorG } = await supabase
        .from('products')
        .insert([payloadGeneral])
        .select()
        .single();

    if (errorG) {
        console.error('FAILED to add general:', errorG);
    } else {
        console.log('SUCCESS adding general:', dataG);
        // Clean up
        await supabase.from('products').delete().eq('id', dataG.id);
    }
}

testAddProduct();
