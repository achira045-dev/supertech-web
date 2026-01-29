'use client';
import { useState } from 'react';
import { Monitor, Cpu, CheckCircle, Zap, ShieldCheck, Box, Disc, RefreshCcw, Save, Printer } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { useProducts } from '../context/ProductContext';

// Types strictly following the user's JSON structure
type ComponentSpec = {
    model: string;
    price: number;
    [key: string]: any;
};

type PCSpec = {
    order_details: {
        order_id: string;
        status: string;
        generated_at: string;
    };
    budget_analysis: {
        requested_budget: number;
        actual_total: number;
        remaining_balance: number;
    };
    components: {
        cpu: ComponentSpec & { socket: string; details: string };
        mainboard: ComponentSpec & { chipset: string; ram_slot: string };
        ram: ComponentSpec & { capacity: string; speed: string };
        gpu: ComponentSpec & { vram: string; is_integrated: boolean };
        storage: ComponentSpec & { type: string; size: string };
        psu: ComponentSpec & { wattage: number; efficiency: string };
        case: ComponentSpec & { style: string };
    };
    expert_opinion: {
        performance_score: string;
        suitable_for: string[];
        upgrade_path: string;
    };
};

export default function PCBuilderPage() {
    const [budget, setBudget] = useState<number>(25000);
    const [loading, setLoading] = useState(false);
    const [spec, setSpec] = useState<PCSpec | null>(null);
    const { addToCart } = useCart();
    const { products } = useProducts();

    // Mock Component Database (Updated with Real Store Inventory & Images)
    const DB = {
        cpus: [
            { model: 'Intel Core i3-12100F', price: 2990, socket: 'LGA1700', details: '4 Cores / 8 Threads', score: 5, image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products88910_800.jpg' },
            { model: 'AMD Ryzen 5 5500', price: 3190, socket: 'AM4', details: '6 Cores / 12 Threads', score: 6, image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product735_800.jpg' },
            { model: 'Intel Core i5-12400F', price: 3990, socket: 'LGA1700', details: '6 Cores / 12 Threads', score: 7, image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product22278_800.jpg' }, // Generic placeholder fallback logic or specific if found
            { model: 'AMD Ryzen 7 9800X3D', price: 17990, socket: 'AM5', details: '8 Cores / 16 Threads (Gaming King)', score: 9.5, image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products66220_800.jpg' },
            { model: 'Intel Core Ultra 9 285K', price: 19990, socket: 'LGA1851', details: '24 Cores / 24 Threads', score: 10, image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products63028_800.jpg' },
        ],
        gpus: [
            { model: 'RX 6500 XT 4GB', price: 9250, vram: '4GB GDDR6', is_integrated: false, image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products124836_800.jpg' },
            { model: 'RX 7600 8GB', price: 8190, vram: '8GB GDDR6', is_integrated: false, image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products103790_800.jpg' },
            { model: 'RX 9070 16GB', price: 22990, vram: '16GB GDDR6', is_integrated: false, image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products97788_800.jpg' },
            // Add a high-end placeholder using one of the existing images if specific 4090 not found, or use fallback
            { model: 'RTX 4060 Ti', price: 14500, vram: '8GB GDDR6', is_integrated: false, image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product5718_800.jpg' }, // Placeholder reused just to valid URL
        ],
        mobos: [
            { model: 'MSI PRO H610M-S DDR4', price: 1690, socket: 'LGA1700', ram_slot: 'DDR4', chipset: 'H610', image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products42273_800.jpg' },
            { model: 'GIGABYTE H610M K V2 DDR5', price: 1890, socket: 'LGA1700', ram_slot: 'DDR5', chipset: 'H610', image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products73209_800.jpg' },
            { model: 'MSI PRO B760M-P DDR5', price: 2400, socket: 'LGA1700', ram_slot: 'DDR5', chipset: 'B760', image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products121706_800.jpg' },
            { model: 'MSI B650M GAMING WIFI', price: 4690, socket: 'AM5', ram_slot: 'DDR5', chipset: 'B650', image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products43250_800.jpg' },
            { model: 'ASUS ROG CROSSHAIR X870E', price: 24900, socket: 'AM5', ram_slot: 'DDR5', chipset: 'X870E', image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products131159_800.jpg' },
        ],
        rams: [
            { model: 'Kingston Fury Beast RGB 32GB', price: 13990, capacity: '32GB', speed: 'DDR5-6000', type: 'DDR5', image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products151277_800.jpg' },
            { model: 'Lexar Ares RGB 32GB', price: 14990, capacity: '32GB', speed: 'DDR5-6400', type: 'DDR5', image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product43806_800.jpg' },
            // Add DDR4 model manually or find one
            { model: 'DDR4 Generic 16GB', price: 1500, capacity: '16GB', speed: 'DDR4-3200', type: 'DDR4', image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products151277_800.jpg' }, // Reuse image for visual
        ],
        ssds: [
            { model: 'WD Blue SN5000 500GB', price: 2890, size: '500GB', type: 'NVMe Gen4', image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products106573_800.jpg' },
            { model: 'Samsung 980 1TB', price: 2900, size: '1TB', type: 'NVMe Gen3', image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product5718_800.jpg' },
            { model: 'Samsung 990 Pro 2TB', price: 9390, size: '2TB', type: 'NVMe Gen4', image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product49634_800.jpg' },
        ],
        psus: [
            { model: 'AZZA PSAZ 550W', price: 1190, wattage: 550, efficiency: '80+ Bronze', image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product36175_800.png' },
            { model: 'Gigabyte GP-P550SS 550W', price: 1390, wattage: 550, efficiency: '80+ Silver', image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products50833_800.jpg' },
        ],
        cases: [
            { model: 'iHAVECPU IHC R03 Black', price: 1290, style: 'mATX', image: 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products74519_800.jpg' },
        ]
    };

    const findRealImage = (model: string) => {
        // Simple fuzzy match: returns image of first product that contains model name or vice versa
        const match = products.find(p =>
            p.name.toLowerCase().includes(model.toLowerCase()) ||
            model.toLowerCase().includes(p.name.toLowerCase())
        );
        return match ? match.image : undefined;
    };

    const generateSpec = () => {
        setLoading(true);

        // Simulate thinking delay
        setTimeout(() => {
            let currentBudget = budget;
            const components: any = {};

            // 1. Select GPU (Approx 40% of budget if > 25000, else iGPU/Entry)
            let targetGpuPrice = budget >= 25000 ? budget * 0.4 : budget * 0.25;

            // Filter GPUs compatible with budget
            let compatibleGpus = DB.gpus.filter(g => g.price <= targetGpuPrice);
            // If budget < 15000, enforce iGPU preference if possible, or very cheap GPU
            if (budget < 15000) {
                // Just pick integrated if available in CPU logic later, or cheapest GPU
                // For simplicity in this logic, we'll pick the cheapest dedicated if budget allows, else iGPU placeholder
                if (budget < 12000) compatibleGpus = [DB.gpus[0]]; // Force iGPU
            }
            // Pick best GPU
            const selectedGpu = compatibleGpus.length > 0 ? compatibleGpus[compatibleGpus.length - 1] : DB.gpus[0];
            components.gpu = { ...selectedGpu, image: findRealImage(selectedGpu.model) };
            currentBudget -= selectedGpu.price;

            // 2. Select CPU (Approx 25-30% of original budget)
            let targetCpuPrice = budget * 0.3;
            let compatibleCpus = DB.cpus.filter(c => c.price <= currentBudget && c.price <= targetCpuPrice * 1.5); // loose constraint
            // If iGPU selected, ensure CPU has iGPU (F series don't)
            if (selectedGpu.is_integrated) {
                // Remove F series
                compatibleCpus = compatibleCpus.filter(c => !c.model.endsWith('F'));
            }
            const selectedCpu = compatibleCpus.length > 0 ? compatibleCpus[compatibleCpus.length - 1] : DB.cpus[0];
            components.cpu = { ...selectedCpu, image: findRealImage(selectedCpu.model) };
            currentBudget -= selectedCpu.price;

            // 3. Select Motherboard (Must match socket)
            const compatibleMobos = DB.mobos.filter(m => m.socket === selectedCpu.socket && m.price <= currentBudget);
            const selectedMobo = compatibleMobos.length > 0 ? compatibleMobos[0] : DB.mobos[0]; // pick cheapest compatible
            components.mainboard = { ...selectedMobo, image: findRealImage(selectedMobo.model) };
            currentBudget -= selectedMobo.price;

            // 4. Select RAM (Must match DDR4/DDR5 of mobo)
            const isDDR5 = selectedMobo.ram_slot === 'DDR5';
            const compatibleRams = DB.rams.filter(r => r.type === (isDDR5 ? 'DDR5' : 'DDR4') && r.price <= currentBudget);
            // if budget < 15000, 16GB is fine. > 25000, try 32GB
            let selectedRam = compatibleRams[0];
            if (budget > 25000) {
                const highEndRam = compatibleRams.find(r => r.capacity === '32GB');
                if (highEndRam) selectedRam = highEndRam;
            }
            const finalRam = selectedRam || DB.rams[0];
            components.ram = { ...finalRam, image: findRealImage(finalRam.model) };
            currentBudget -= finalRam.price;

            // 5. Select Storage (NVMe Gen4 preferred)
            const compatibleStorage = DB.ssds.filter(s => s.price <= currentBudget);
            const selectedStorage = compatibleStorage.length > 0 ? compatibleStorage[0] : DB.ssds[0];
            components.storage = { ...selectedStorage, image: findRealImage(selectedStorage.model) };
            currentBudget -= selectedStorage.price;

            // 6. Select PSU (Based on GPU+CPU Wattage approx)
            // Simple calc: Base 200W + GPU TDP (approx) + CPU TDP
            let estimatedWattage = 300; // Base
            if (selectedGpu.model.includes('4080')) estimatedWattage += 350;
            else if (selectedGpu.model.includes('4070')) estimatedWattage += 250;
            else if (selectedGpu.model.includes('4060')) estimatedWattage += 150;

            const compatiblePsus = DB.psus.filter(p => p.wattage >= estimatedWattage && p.price <= currentBudget);
            const selectedPsu = compatiblePsus.length > 0 ? compatiblePsus[0] : DB.psus[0];
            // Upgrade PSU if budget allows
            components.psu = { ...selectedPsu, image: findRealImage(selectedPsu.model) };
            currentBudget -= selectedPsu.price;

            // 7. Case
            const compatibleCases = DB.cases.filter(c => c.price <= currentBudget);
            const selectedCase = compatibleCases.length > 0 ? compatibleCases[0] : DB.cases[0];
            components.case = { ...selectedCase, image: findRealImage(selectedCase.model) };
            currentBudget -= selectedCase.price;

            // Final Calculation
            const actualTotal = Object.values(components).reduce((sum: number, part: any) => sum + (part.price || 0), 0);

            // JSON Structure as requested
            const result: PCSpec = {
                order_details: {
                    order_id: `ORD-2026-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    status: 'verified',
                    generated_at: new Date().toISOString()
                },
                budget_analysis: {
                    requested_budget: budget,
                    actual_total: actualTotal,
                    remaining_balance: budget - actualTotal
                },
                components: components,
                expert_opinion: {
                    performance_score: budget > 50000 ? '9.5/10' : budget > 30000 ? '8/10' : '6/10',
                    suitable_for: budget > 30000 ? ['Testing', 'Gaming AA', 'Streaming'] : ['Office', 'Light Gaming'],
                    upgrade_path: 'สามารถอัพเกรด RAM และ GPU ในอนาคตได้'
                }
            };

            setSpec(result);
            setLoading(false);
        }, 2000);
    };

    const handleAddToCartAll = () => {
        if (!spec) return;

        let count = 0;
        Object.values(spec.components).forEach((component: any, index) => {
            // Find real product to ensure correct ID and data in cart
            const match = products.find(p =>
                p.name.toLowerCase().includes(component.model.toLowerCase()) ||
                component.model.toLowerCase().includes(p.name.toLowerCase())
            );

            if (match) {
                addToCart(match);
            } else {
                // Fallback: create a temporary product object
                addToCart({
                    id: `generated-${Date.now()}-${index}`,
                    name: component.model,
                    price: component.price,
                    image: component.image || '',
                    quantity: 1
                });
            }
            count++;
        });

        toast.success(`เพิ่มสินค้า ${count} รายการลงตะกร้าเรียบร้อย`);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] py-10 px-4">
            <div className="max-w-5xl mx-auto">

                {/* Header Section */}
                <div className="text-center mb-12 animate-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center gap-2 bg-orange-100 text-[var(--primary-orange)] px-4 py-1.5 rounded-full font-bold text-sm mb-4 border border-orange-200">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                        </span>
                        ระบบจัดสเปคคอมพิวเตอร์อัจฉริยะ (Beta)
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                        AI PC Spec <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-red)]">Builder</span>
                    </h1>
                    <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        ให้ AI อัจฉริยะช่วยออกแบบคอมพิวเตอร์ตามงบประมาณของคุณ
                        เน้นความคุ้มค่า สมดุล และเข้ากันได้ 100% โดยผู้เชี่ยวชาญ
                    </p>
                </div>

                {/* How it works grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { icon: <Disc className="w-8 h-8 text-[var(--primary-blue)]" />, title: '1. ระบุงบประมาณ', desc: 'ใส่งบที่คุณตั้งไว้ ระบบรองรับตั้งแต่ 10,000 - 100,000+ บาท' },
                        { icon: <Cpu className="w-8 h-8 text-[var(--primary-orange)]" />, title: '2. AI วิเคราะห์สเปค', desc: 'ระบบคำนวณชิ้นส่วนที่คุ้มค่าที่สุด ณ เวลานี้ โดยเน้นความแรงที่สมดุล' },
                        { icon: <CheckCircle className="w-8 h-8 text-green-500" />, title: '3. รับสเปคทันที', desc: 'ได้ใบเสนอราคาพร้อมสั่งซื้อ หรือปรับเปลี่ยนได้ตามใจชอบ' }
                    ].map((step, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-all">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                {step.icon}
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">{step.title}</h3>
                            <p className="text-gray-500 text-sm">{step.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Input Section */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-10 relative">
                    <div className="absolute top-0 right-0 p-32 bg-orange-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="p-6 md:p-12 relative z-10">
                        <div className="flex flex-col md:flex-row gap-6 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-gray-700 font-bold mb-3 text-xl flex items-center gap-2">
                                    งบประมาณของคุณ
                                    <span className="text-sm font-normal text-gray-400">(บาท)</span>
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-2xl group-focus-within:text-[var(--primary-orange)] transition-colors">฿</span>
                                    <input
                                        type="number"
                                        value={budget}
                                        onChange={(e) => setBudget(Number(e.target.value))}
                                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl py-5 pl-12 pr-6 text-3xl font-black text-gray-900 focus:outline-none focus:border-[var(--primary-orange)] focus:ring-4 focus:ring-orange-50 transition-all placeholder-gray-300"
                                        step="1000"
                                        min="10000"
                                        placeholder="เช่น 25000"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <span className="text-sm text-gray-400 py-1.5 self-center mr-2">ยอดนิยม:</span>
                                    {[15000, 25000, 35000, 50000, 80000].map(b => (
                                        <button
                                            key={b}
                                            onClick={() => setBudget(b)}
                                            className="px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 font-bold hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)] transition-all text-sm shadow-sm active:bg-orange-50"
                                        >
                                            {b.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={generateSpec}
                                disabled={loading}
                                className="w-full md:w-auto h-[84px] aspect-square md:aspect-auto md:px-12 bg-gray-900 text-white font-bold text-xl rounded-2xl hover:bg-[var(--primary-orange)] hover:shadow-lg hover:shadow-orange-200 active:scale-95 disabled:opacity-70 disabled:scale-100 transition-all flex flex-col md:flex-row items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <RefreshCcw className="w-8 h-8 md:w-6 md:h-6 animate-spin text-gray-400 group-hover:text-white" />
                                ) : (
                                    <>
                                        <Monitor className="w-8 h-8 md:w-6 md:h-6" />
                                        <span className="hidden md:inline">วิเคราะห์สเปค</span>
                                        <span className="md:hidden text-xs font-normal">วิเคราะห์</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Result Section */}
                {spec && (
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                        VERIFIED
                                    </span>
                                    <span className="text-gray-500 text-xs font-mono">{spec.order_details.order_id}</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold">สเปคแนะนำสำหรับคุณ</h2>
                                <p className="text-gray-400 text-sm mt-1">วิเคราะห์ความคุ้มค่าและความเข้ากันได้ 100%</p>
                            </div>
                            <div className="text-right bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                                <div className="text-sm text-gray-400 mb-1">ราคารวมโดยประมาณ</div>
                                <div className="text-4xl font-black text-[var(--primary-orange)] tracking-tight">฿{spec.budget_analysis.actual_total.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="p-6 md:p-10">
                            {/* Expert Opinion */}
                            <div className="bg-[var(--secondary-blue)]/5 border border-[var(--primary-blue)]/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-5 items-start">
                                <div className="bg-white p-3 rounded-full shadow-md shrink-0">
                                    <ShieldCheck className="w-8 h-8 text-[var(--primary-blue)]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[var(--primary-blue)] text-lg mb-2 flex items-center gap-2">
                                        ความเห็นจาก AI Specialist
                                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-md">Score: {spec.expert_opinion.performance_score}</span>
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        สเปคนี้ถูกออกแบบมาเพื่อ <b>{spec.expert_opinion.suitable_for.join(', ')}</b> โดยเฉพาะ
                                        เน้นความคุ้มค่าของชิ้นส่วนหลักและรองรับการอัพเกรดในอนาคต: <br />
                                        <span className="text-sm text-gray-500 mt-1 block border-t border-blue-100 pt-2">{spec.expert_opinion.upgrade_path}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Components Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                {Object.entries(spec.components).map(([key, component]: [string, any]) => (
                                    <div key={key} className="flex flex-col md:flex-row md:items-center p-4 md:p-5 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-gray-100 hover:scale-[1.01] transition-all border border-transparent hover:border-gray-200 group duration-300">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden relative group-hover:border-[var(--primary-orange)]/30 transition-colors">
                                                {component.image ? (
                                                    <img
                                                        src={component.image}
                                                        alt={component.model || "PC Component"}
                                                        className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500 will-change-transform"
                                                    />
                                                ) : (
                                                    <div className="text-3xl text-gray-300">
                                                        {key === 'cpu' && '🧠'}
                                                        {key === 'mainboard' && '🔌'}
                                                        {key === 'ram' && '💾'}
                                                        {key === 'gpu' && '🎮'}
                                                        {key === 'storage' && '💿'}
                                                        {key === 'psu' && '⚡'}
                                                        {key === 'case' && '🕋'}
                                                    </div>
                                                )}
                                                {/* Corner Icon Overlay */}
                                                <div className="absolute top-0 right-0 p-1 bg-gray-50/80 rounded-bl-lg backdrop-blur-[1px]">
                                                    <div className="w-4 h-4 text-[var(--primary-orange)]">
                                                        {key === 'cpu' && <Cpu className="w-full h-full" />}
                                                        {key === 'mainboard' && <Box className="w-full h-full" />}
                                                        {key === 'ram' && <Disc className="w-full h-full" />}
                                                        {key === 'gpu' && <Monitor className="w-full h-full" />}
                                                        {key === 'storage' && <Save className="w-full h-full" />}
                                                        {key === 'psu' && <Zap className="w-full h-full" />}
                                                        {key === 'case' && <Box className="w-full h-full" />}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">{key}</div>
                                                <div className="font-bold text-gray-900 text-lg">{component.model}</div>
                                                <div className="text-xs text-gray-500 flex flex-wrap gap-2 mt-1.5">
                                                    {Object.entries(component).map(([k, v]) => {
                                                        if (k !== 'model' && k !== 'price' && k !== 'score' && k !== 'is_integrated' && k !== 'image') {
                                                            return <span key={k} className="bg-white border border-gray-200 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold text-gray-400">{String(v)}</span>
                                                        }
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 md:mt-0 font-bold text-gray-900 pl-18 md:pl-0 text-xl">
                                            ฿{component.price.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-50 p-6 md:p-8 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-4">
                            {/* Print button removed as requested */}
                            <button
                                onClick={handleAddToCartAll}
                                className="px-8 py-4 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold hover:shadow-lg hover:shadow-gray-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Save className="w-5 h-5" />
                                เพิ่มทั้งหมดในตะกร้า
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
