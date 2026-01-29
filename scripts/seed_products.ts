
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Load Environment Variables from .env.local manually
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

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Could not find NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Generate 100 Realistic Products
const categories = [
    'ซีพียู', 'เมนบอร์ด', 'การ์ดจอ', 'แรม', 'SSD', 'พาวเวอร์ซัพพลาย', 'เคส', 'ชุดระบายความร้อน', 'จอมอนิเตอร์', 'เก้าอี้เกมมิ่ง'
];

const mockProducts = [];

// CPU (Inte/AMD) - 15 items
const cpus = [
    { name: 'CPU INTEL CORE I9-14900KS', price: 26900 },
    { name: 'CPU INTEL CORE I7-14700K', price: 15900 },
    { name: 'CPU INTEL CORE I5-14600K', price: 11900 },
    { name: 'CPU INTEL CORE I5-13500', price: 8900 },
    { name: 'CPU INTEL CORE I3-14100', price: 5200 },
    { name: 'CPU AMD RYZEN 9 7950X3D', price: 24900 },
    { name: 'CPU AMD RYZEN 7 7800X3D', price: 14500 },
    { name: 'CPU AMD RYZEN 5 7600X', price: 8500 },
    { name: 'CPU AMD RYZEN 5 5600G', price: 4500 },
    { name: 'CPU INTEL CORE I9-13900K', price: 20900 },
    { name: 'CPU INTEL PENTIUM GOLD G7400', price: 2500 },
    { name: 'CPU AMD RYZEN 3 4100', price: 2200 },
    { name: 'CPU INTEL CORE I7-12700F', price: 10500 },
    { name: 'CPU AMD RYZEN 9 5900X', price: 12900 },
    { name: 'CPU INTEL CORE I5-12400F', price: 4900 }
];
cpus.forEach(p => mockProducts.push({ ...p, category: 'ซีพียู', image_url: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product22696_800.jpg' }));

// VGA - 15 items
const vgas = [
    { name: 'VGA ASUS ROG STRIX GEFORCE RTX 4090 OC 24GB', price: 79900 },
    { name: 'VGA GIGABYTE AORUS GEFORCE RTX 4080 SUPER MASTER', price: 48500 },
    { name: 'VGA MSI GEFORCE RTX 4070 TI SUPER VENTUS 3X', price: 34900 },
    { name: 'VGA GALAX GEFORCE RTX 4060 TI 8GB', price: 14500 },
    { name: 'VGA ZOTAC GAMING GEFORCE RTX 3050 ECO 6GB', price: 6500 },
    { name: 'VGA AMD RADEON RX 7900 XTX 24GB', price: 39900 },
    { name: 'VGA SAPPHIRE PULSE AMD RADEON RX 7800 XT', price: 19900 },
    { name: 'VGA ASROCK CHALLENGER RADEON RX 6600 8GB', price: 7200 },
    { name: 'VGA INTEL ARC A770 16GB', price: 11900 },
    { name: 'VGA INTEL ARC A750 8GB', price: 7900 },
    { name: 'VGA ASUS TUF GAMING GEFORCE RTX 4070 SUPER', price: 26900 },
    { name: 'VGA PNY GEFORCE RTX 4060 8GB VERTO', price: 10500 },
    { name: 'VGA INNO3D GEFORCE RTX 3060 TWIN X2 12GB', price: 9500 },
    { name: 'VGA POWERCOLOR FIGHTER AMD RADEON RX 6500 XT', price: 4500 },
    { name: 'VGA MANLI GEFORCE GTX 1650 4GB', price: 3900 }
];
vgas.forEach(p => mockProducts.push({ ...p, category: 'การ์ดจอ', image_url: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product55787_800.jpg' }));

// Mainboard - 10 items
const mbs = [
    { name: 'MAINBOARD ASUS ROG MAXIMUS Z790 HERO', price: 24500 },
    { name: 'MAINBOARD MSI MAG Z790 TOMAHAWK WIFI', price: 11500 },
    { name: 'MAINBOARD GIGABYTE B760M AORUS ELITE AX', price: 6500 },
    { name: 'MAINBOARD ASROCK B760M PRO RS/D4', price: 3900 },
    { name: 'MAINBOARD BIOSTAR H610MHP', price: 2200 },
    { name: 'MAINBOARD ASUS ROG CROSSHAIR X670E HERO', price: 26900 },
    { name: 'MAINBOARD GIGABYTE X670 AORUS ELITE AX', price: 10900 },
    { name: 'MAINBOARD MSI MAG B650 TOMAHAWK WIFI', price: 7500 },
    { name: 'MAINBOARD ASROCK B650M-HDV/M.2', price: 4200 },
    { name: 'MAINBOARD ASUS PRIME A520M-K', price: 1900 }
];
mbs.forEach(p => mockProducts.push({ ...p, category: 'เมนบอร์ด', image_url: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product26442_800.jpg' }));

// RAM - 10 items
const rams = [
    { name: 'RAM DDR5 G.SKILL TRIDENT Z5 RGB 32GB (16x2) 6000MHz', price: 5900 },
    { name: 'RAM DDR5 CORSAIR VENGEANCE RGB 32GB (16x2) 5600MHz', price: 5200 },
    { name: 'RAM DDR5 KINGSTON FURY BEAST 16GB (8x2) 5200MHz', price: 3500 },
    { name: 'RAM DDR5 TEAMGROUP ELITE 16GB (8x2) 4800MHz', price: 2900 },
    { name: 'RAM DDR5 ADATA XPG LANCER RGB 32GB (16x2) 6000MHz White', price: 6200 },
    { name: 'RAM DDR4 G.SKILL TRIDENT Z NEO 32GB (16x2) 3600MHz', price: 3500 },
    { name: 'RAM DDR4 CORSAIR VENGEANCE LPX 16GB (8x2) 3200MHz', price: 1900 },
    { name: 'RAM DDR4 KINGSTON FURY BEAST 16GB (8x2) 3200MHz RGB', price: 2200 },
    { name: 'RAM DDR4 TEAMGROUP T-FORCE DELTA RGB 16GB (8x2) 3600MHz', price: 2400 },
    { name: 'RAM DDR4 BLACKBERRY MAXIMUS 8GB 2666MHz', price: 790 }
];
rams.forEach(p => mockProducts.push({ ...p, category: 'แรม', image_url: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product49013_800.jpg' }));

// SSD - 10 items
const ssds = [
    { name: 'SSD M.2 SAMSUNG 990 PRO 2TB NVMe Gen4', price: 6900 },
    { name: 'SSD M.2 WD BLACK SN850X 1TB NVMe Gen4', price: 3900 },
    { name: 'SSD M.2 KINGSTON KC3000 1TB NVMe Gen4', price: 3500 },
    { name: 'SSD M.2 HIKSEMI FUTURE 1TB NVMe Gen4', price: 2500 },
    { name: 'SSD M.2 WD BLUE SN580 500GB NVMe Gen4', price: 1800 },
    { name: 'SSD M.2 SAMSUNG 980 1TB NVMe Gen3', price: 2900 },
    { name: 'SSD SATA SAMSUNG 870 EVO 1TB', price: 3500 },
    { name: 'SSD SATA WD GREEN 480GB', price: 1200 },
    { name: 'SSD SATA HIKVISION C100 240GB', price: 690 },
    { name: 'EXTERNAL SSD SANDISK EXTREME V2 1TB', price: 4500 }
];
ssds.forEach(p => mockProducts.push({ ...p, category: 'SSD', image_url: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product5718_800.jpg' }));

// PSU - 10 items
const psus = [
    { name: 'PSU ASUS ROG THOR 1200W PLATINUM II', price: 12900 },
    { name: 'PSU CORSAIR RM1000e 1000W GOLD ATX 3.0', price: 6500 },
    { name: 'PSU THERMALTAKE TOUGHPOWER GF3 850W GOLD', price: 4900 },
    { name: 'PSU MSI MAG A850GL PCIE5 850W GOLD', price: 4500 },
    { name: 'PSU COOLER MASTER MWE GOLD 750 V2', price: 3900 },
    { name: 'PSU DEEPCOOL PK650D 650W BRONZE', price: 1900 },
    { name: 'PSU SILVERSTONE ST50F-ES230 500W', price: 1200 },
    { name: 'PSU AEROCOOL SUPERB 600W', price: 890 },
    { name: 'PSU FSP HYDRO G PRO 1000W GOLD', price: 5900 },
    { name: 'PSU SEASONIC FOCUS GX-750 750W GOLD', price: 4200 }
];
psus.forEach(p => mockProducts.push({ ...p, category: 'พาวเวอร์ซัพพลาย', image_url: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product54460_800.jpg' }));

// Case - 10 items
const cases = [
    { name: 'CASE LIAN LI O11 DYNAMIC EVO BLACK', price: 5500 },
    { name: 'CASE NZXT H9 FLOW WHITE', price: 5900 },
    { name: 'CASE CORSAIR 4000D AIRFLOW BLACK', price: 3200 },
    { name: 'CASE HYTE Y60 RED', price: 7900 },
    { name: 'CASE MONTECH AIR 100 ARGB BLACK (Micro-ATX)', price: 1900 },
    { name: 'CASE Tsunami E-Sport D7 Tempered Glass', price: 1200 },
    { name: 'CASE COUGAR DUOFACE RGB WHITE', price: 2500 },
    { name: 'CASE DEEPCOOL MATREXX 55 MESH', price: 1500 },
    { name: 'CASE ASUS TUF GAMING GT502', price: 4900 },
    { name: 'CASE COOLER MASTER MASTERBOX NR200P', price: 3500 }
];
cases.forEach(p => mockProducts.push({ ...p, category: 'เคส', image_url: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product22633_800.jpg' }));

// Monitor - 10 items
const monitors = [
    { name: 'MONITOR SAMSUNG ODYSSEY G9 OLED 49"', price: 49900 },
    { name: 'MONITOR ALIENWARE AW3423DWF 34" QD-OLED', price: 36900 },
    { name: 'MONITOR LG ULTRAGEAR 27GR95QE-B 27" OLED 240Hz', price: 29900 },
    { name: 'MONITOR ASUS ROG SWIFT PG27AQDM 27" OLED 240Hz', price: 31900 },
    { name: 'MONITOR DELL G2724D 27" IPS 165Hz', price: 11900 },
    { name: 'MONITOR GIGABYTE G24F 2 23.8" IPS 165Hz', price: 5500 },
    { name: 'MONITOR AOC 24G2SE 23.8" VA 165Hz', price: 4200 },
    { name: 'MONITOR ZOWIE XL2566K 24.5" TN 360Hz', price: 21900 },
    { name: 'MONITOR MSI G274F 27" IPS 180Hz', price: 6900 },
    { name: 'MONITOR ACER NITRO VG240Y 23.8" IPS 75Hz', price: 3500 }
];
monitors.forEach(p => mockProducts.push({ ...p, category: 'จอมอนิเตอร์', image_url: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product28585_800.jpg' }));

// Genaral/Gaming Gear - 10 items
const gears = [
    { name: 'MOUSE LOGITECH G PRO X SUPERLIGHT 2 BLACK', price: 4900 },
    { name: 'MOUSE RAZER DEATHADDER V3 PRO WHITE', price: 4500 },
    { name: 'KEYBOARD LOGITECH G915 TKL LIGHTSPEED', price: 6500 },
    { name: 'KEYBOARD ROYAL KLUDGE RK61', price: 1500 },
    { name: 'HEADSET HYPERX CLOUD II WIRELESS', price: 4200 },
    { name: 'HEADSET STEELSERIES ARCTIS NOVA PRO WIRELESS', price: 12900 },
    { name: 'MOUSEPAD STEELSERIES QCK EDGE XL', price: 990 },
    { name: 'MICROPHONE HYPERX QUADCAST S', price: 5500 },
    { name: 'WEBCAM LOGITECH C922 PRO', price: 2900 },
    { name: 'CHAIR ANDA SEAT KAISER 3 SERIES BLACK', price: 14900 }
];
gears.forEach(p => mockProducts.push({ ...p, category: 'สินค้าทั่วไป', image_url: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product52184_800.jpg' }));

async function seed() {
    console.log(`Starting seed... Prepared ${mockProducts.length} products.`);

    // Batch insert
    const { data, error } = await supabase
        .from('products')
        .insert(mockProducts.map(p => ({
            ...p,
            description: 'สินค้าคุณภาพประกันศูนย์ไทย 100% จัดส่งรวดเร็วทั่วประเทศ\n\n- สินค้ามือหนึ่ง\n- ประกันศูนย์ไทย\n- ออกใบกำกับภาษีได้',
            stock: 10
        })))
        .select();

    if (error) {
        console.error('Error feeding products:', error);
    } else {
        console.log(`Successfully added ${data.length} products!`);
    }
}

seed();
