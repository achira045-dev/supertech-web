'use client';
import { LayoutDashboard, ShoppingBag, Users, DollarSign, Settings, Plus, Edit, Trash2, LogOut, X, Save, Image as ImageIcon, Search, Filter, Truck, CheckCircle, Clock, AlertCircle, MapPin, Phone, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useProducts, Product } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();
    const { logout } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('overview');

    // === Product Modal States ===
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', category: '', price: 0, image: '', description: ''
    });

    // === Order Management States ===
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [orderFilter, setOrderFilter] = useState('all');
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [cancelReason, setCancelReason] = useState('');

    // === Customer Management States ===
    const [customers, setCustomers] = useState<any[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    // === Address Modal States ===
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [selectedCustomerAddresses, setSelectedCustomerAddresses] = useState<any[]>([]);
    const [selectedCustomerName, setSelectedCustomerName] = useState('');
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    const fetchCustomerAddresses = async (userId: string, name: string) => {
        setLoadingAddresses(true);
        setSelectedCustomerName(name);
        setAddressModalOpen(true);

        // Try 'addresses' first (as per schema), fallback to 'address' if needed
        let { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false });

        if (error) {
            // Fallback for inconsistency
            const { data: data2, error: error2 } = await (supabase.from('address' as any) as any).select('*').eq('user_id', userId);
            if (!error2) {
                data = data2;
                error = null;
            }
        }

        if (error) {
            console.error('Error fetching addresses:', error);
            alert('ไม่สามารถโหลดข้อมูลที่อยู่ได้');
        } else {
            setSelectedCustomerAddresses(data || []);
        }
        setLoadingAddresses(false);
    };

    // Fetch orders on tab change
    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        } else if (activeTab === 'customers') {
            fetchCustomers();
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        // Fetch orders directly from Supabase for admin
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                profiles:user_id (full_name, email),
                order_items (
                    *,
                    products (name, image_url)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            alert('โหลดข้อมูลคำสั่งซื้อไม่สำเร็จ');
        } else {
            setOrders(data || []);
        }
        setLoadingOrders(false);
    };

    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        if (!confirm(`ยืนยันการเปลี่ยนสถานะเป็น ${newStatus}?`)) return;

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus } as any)
            .eq('id', orderId);

        if (error) {
            alert('อัปเดตสถานะไม่สำเร็จ');
        } else {
            fetchOrders(); // Refresh
        }
    };

    const handleCancelOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrderId || !cancelReason.trim()) return;

        try {
            // 1. Fetch Order Data
            const { data: orderData, error: fetchError } = await supabase
                .from('orders')
                .select('techcoins_used, user_id, status')
                .eq('id', selectedOrderId)
                .single();

            const order = orderData as any;

            if (fetchError || !order) throw new Error('ไม่พบข้อมูลคำสั่งซื้อ');
            if (order.status === 'cancelled') throw new Error('คำสั่งซื้อนี้ถูกยกเลิกแล้ว');

            // 2. Refund Logic
            if (order.techcoins_used > 0 && order.user_id) {
                // Insert Transaction
                const { error: txError } = await (supabase.from('techcoin_transactions' as any) as any).insert({
                    user_id: order.user_id,
                    amount: order.techcoins_used,
                    type: 'earn',
                    description: `คืนเหรียญจากการยกเลิกคำสั่งซื้อ #${selectedOrderId} (โดย Admin)`
                });

                if (txError) throw new Error('บันทึกการคืนเหรียญไม่สำเร็จ: ' + txError.message);

                // Update Customer Balance
                const { data: profile } = await supabase.from('profiles').select('techcoin_balance' as any).eq('id', order.user_id).single();
                const currentBalance = (profile as any)?.techcoin_balance || 0;

                const { error: updateError } = await supabase.from('profiles')
                    .update({ techcoin_balance: currentBalance + order.techcoins_used } as any)
                    .eq('id', order.user_id);

                if (updateError) throw new Error('คืนเหรียญให้ลูกค้าไม่สำเร็จ: ' + updateError.message);
            }

            // 3. Cancel Order
            const { error } = await supabase
                .from('orders')
                .update({
                    status: 'cancelled',
                    cancel_reason: cancelReason
                } as any)
                .eq('id', selectedOrderId);

            if (error) {
                throw error;
            } else {
                alert('ยกเลิกคำสั่งซื้อเรียบร้อย' + (order.techcoins_used > 0 ? ` (คืนเหรียญ ${order.techcoins_used})` : ''));
                setCancelModalOpen(false);
                setCancelReason('');
                fetchOrders();
            }
        } catch (error: any) {
            console.error('Cancel Error:', error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        }
    };

    const openCancelModal = (orderId: number) => {
        setSelectedOrderId(orderId);
        setCancelReason('');
        setCancelModalOpen(true);
    };

    const deleteOrder = async (orderId: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบประวัติคำสั่งซื้อนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) {
            alert('ลบคำสั่งซื้อไม่สำเร็จ');
            console.error(error);
        } else {
            fetchOrders();
        }
    };

    const fetchCustomers = async () => {
        setLoadingCustomers(true);
        // Simplification: We now have address data synced directly to the profiles table
        // so we don't strictly need the join, which might be causing RLS/Relation errors.
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('role', 'admin') // Exclude admins
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching customers:', error);
            alert('ไม่สามารถโหลดข้อมูลลูกค้าได้: ' + error.message);
        } else {
            console.log('Customers Data:', data);
            setCustomers(data || []);
        }
        setLoadingCustomers(false);
    };

    // Categories and their specific specs
    const CATEGORY_OPTIONS = [
        'สินค้าทั่วไป', 'โน๊ตบุ๊ค', 'จอมอนิเตอร์', 'แท็บเล็ต', 'ซีพียู', 'การ์ดจอ', 'เมนบอร์ด',
        'แรม', 'ฮาร์ดดิสก์ และ เอสเอสดี', 'พาวเวอร์ซัพพลาย', 'เคส', 'ชุดระบายความร้อน',
        'คีย์บอร์ด', 'เมาส์'
    ];

    const SUBCATEGORIES: Record<string, string[]> = {
        'โน๊ตบุ๊ค': ['โน๊ตบุ๊คเล่นเกม', 'โน๊ตบุ๊คบางเบา', 'โน๊ตบุ๊คสำหรับองค์กร'],
        'จอมอนิเตอร์': ['49 นิ้ว', '34 นิ้ว', '32 นิ้ว', '30 นิ้ว', '28 นิ้ว', '27 นิ้ว', '25 นิ้ว', '24 นิ้ว', '22 นิ้ว', '20 นิ้ว', '19 นิ้ว', '16 นิ้ว'],
        'ซีพียู': ['INTEL', 'AMD'],
        'การ์ดจอ': ['INTEL ARC', 'AMD RADEON', 'NVIDIA GEFORCE', 'NVIDIA PRO'],
        'เมนบอร์ด': ['INTEL', 'AMD'],
        'แรม': ['RAM NOTEBOOK', 'DDR5', 'DDR4'],
        'ฮาร์ดดิสก์ และ เอสเอสดี': ['การ์ด M.2', 'SSD', 'HDD'],
        'พาวเวอร์ซัพพลาย': [
            '1300 วัตต์', '1200 วัตต์', '1050 วัตต์', '1000 วัตต์',
            '850 วัตต์', '800 วัตต์', '750 วัตต์', '700 วัตต์',
            '650 วัตต์', '600 วัตต์', '550 วัตต์'
        ],
        'เคส': ['Small Form Factor', 'Open Air', 'Full-Tower', 'Mini-Tower', 'Mid-Tower'],
        'ชุดระบายความร้อน': ['ที่วางโน๊ตบุ๊ค', 'ซิลิโคน', 'พัดลมเคส', 'พัดลมซีพียู', 'ชุดน้ำปิด']
    };

    const CATEGORY_SPECS: Record<string, string[]> = {
        'โน๊ตบุ๊ค': [
            'Brands', 'Model', 'Processors', 'Processor Speed', 'Video Graphics',
            'Screen Size', 'Display', 'Memory', 'Memory Slots', 'Storage',
            'Operating System', 'Camera', 'Connection port', 'Wi-Fi/ Bluetooth',
            'Battery', 'Color', 'Dimensions', 'Weight', 'Warranty'
        ],
        'แท็บเล็ต': ['Screen Size', 'Storage', 'Color', 'Connectivity', 'Chipset'],
        'ซีพียู': ['Socket', 'Cores / Threads', 'Base Clock', 'Boost Clock', 'L3 Cache', 'TDP'],
        'การ์ดจอ': [
            'Brands', 'GPU Series', 'GPU Model', 'Memory Size', 'Bus Standards',
            'OpenGL', 'CUDA Cores', 'Memory Interface', 'Boost Clock',
            'Memory Clock', 'Max Digital Resolution', 'HDMI Port', 'Display Port',
            'Power Connector', 'Power Requirement', 'Dimension', 'Warranty'
        ],
        'เมนบอร์ด': ['Brands', 'CPU Support', 'CPU Socket', 'Chipset', 'Memory Slots', 'Memory Type', 'Max Memory', 'Onboard Graphics', 'Onboard Audio Chipset', 'Audio Channels', 'Expansion Slots', 'Storage', 'Rear Panel I/O', 'LAN Chipset', 'LAN Speed', 'Dimensions', 'Power Pin', 'Form Factor', 'Warranty'],
        'แรม': ['Memory Series', 'Memory Capacity', 'Cas Latency', 'Memory Type', 'Tested Latency', 'SPD Voltage', 'Memory Color', 'Warranty'],
        'ฮาร์ดดิสก์ และ เอสเอสดี': ['Brand', 'Form Factor', 'Capacity', 'Interface', 'Read Speed', 'Write Speed', 'Warranty'],
        'พาวเวอร์ซัพพลาย': ['Brand', 'Energy Efficient', 'Continuous Power W', 'PSU Form Factor', 'Input Frequency', 'MB Connector', 'CPU Connector', 'PCIe Connector', 'SATA Connector', 'Warranty'],
        'เคส': [
            'Brand', 'Model', 'Form Factor', 'Mainboard Support', 'VGA Support',
            'CPU Cooler Support', 'Power Supply Support', 'Front I/O', 'Expansion Slots',
            'Drive Bays Support', 'Fan Installment', 'Fan Support', 'Radiator Support',
            'Color', 'Dimensions D x W x H', 'Warranty'
        ],
        'ชุดระบายความร้อน': [
            'Brands', 'Cooler Model', 'Exterior Color', 'CPU Socket', 'Radiator Dimensions',
            'Radiator Material', 'Block Material', 'Radiator Size', 'Pump Speed',
            'Fan Dimensions', 'Fan Quantity', 'Fan LED Type', 'Fan Speed', 'Fan Airflow',
            'Fan Pressure', 'Fan Noise', 'Connector', 'TDP', 'Cooler Type', 'Warranty'
        ],
        'จอมอนิเตอร์': [
            'Brands', 'Display Size (in.)', 'Panel Size (in.)', 'Resolution', 'Resolution Type',
            'Display color', 'Display Viewing Area (H x V)', 'Brightness', 'Contrast ratio',
            'Response Time', 'Aspect Ratio', 'Refresh Rate', 'Screen Curvature',
            'Pixel Pitch (H x V)', 'Viewing Angle (CR>=10)', 'Color Gamut', 'HDR Support',
            'Display Surface', 'Low Blue Light', 'Connectivity', 'Power Consumption',
            'Mechanical', 'Dimension (W x H x D)', 'Weight (Esti.)', 'Color',
            'Accessory in box', 'Warranty'
        ],
        'คีย์บอร์ด': [
            'Brand', 'Switch Name', 'Connectivity', 'Lighting', 'Localization',
            'Wireless Frequency', 'Dimensions', 'Weight', 'Color', 'USB Port',
            'Type', 'WIRED/WIRELESS', 'Warranty'
        ],
        'เมาส์': [
            'Brand', 'Tilt scroll function', 'Click life span', 'Scroll Wheel',
            'Number of buttons', 'Battery Life', 'Battery Type', 'Interface',
            'Sensor Resolution', 'Sensor technology', 'Wireless technology',
            'Color', 'Warranty'
        ]
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Calculate Stats
    const totalSales = products.reduce((acc, p) => acc + (p.price * 15), 0); // Mock sales
    const totalProducts = products.length;

    // Dynamic Specs State
    const [specs, setSpecs] = useState<Record<string, string>>({});

    // Helper to parse specs from description
    const parseSpecsFromDescription = (fullDesc: string): { cleanDesc: string, parsedSpecs: Record<string, string> } => {
        if (!fullDesc) return { cleanDesc: '', parsedSpecs: {} };

        const splitMarker = '\n\n--- ข้อมูลจำเพาะ ---\n';
        const parts = fullDesc.split(splitMarker);

        const cleanDesc = parts[0] || '';
        const specsPart = parts[1] || '';

        const parsedSpecs: Record<string, string> = {};
        if (specsPart) {
            specsPart.split('\n').forEach(line => {
                const match = line.match(/^- (.*?): (.*)$/);
                if (match) {
                    parsedSpecs[match[1]] = match[2];
                }
            });
        }

        return { cleanDesc, parsedSpecs };
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', category: 'สินค้าทั่วไป', price: 0, image: '', description: '' });
        setSpecs({});
        setIsProductModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        const { cleanDesc, parsedSpecs } = parseSpecsFromDescription(product.description);
        setFormData({ ...product, description: cleanDesc });
        setSpecs(parsedSpecs);
        setIsProductModalOpen(true);
    };

    const handleCategoryChange = (cat: string) => {
        setFormData({ ...formData, category: cat });
        setSpecs({});
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            let finalDescription = formData.description || '';
            const specKeys = Object.keys(specs);
            if (specKeys.length > 0) {
                finalDescription += '\n\n--- ข้อมูลจำเพาะ ---\n';
                specKeys.forEach(key => {
                    if (specs[key]) finalDescription += `- ${key}: ${specs[key]}\n`;
                });
            }
            const productData = {
                ...formData,
                name: formData.name?.trim(),
                image: formData.image?.trim(),
                category: formData.category?.trim(),
                description: finalDescription?.trim()
            };
            console.log('Submitting Product Data:', productData);

            let success = false;
            if (editingProduct) {
                // Ensure we aren't passing ID to update body if not needed, but updateProduct takes ID as arg
                success = await updateProduct(editingProduct.id, productData);
            } else {
                // Remove ID if present in formData (though it shouldn't be for new)
                const { id, ...newProduct } = productData as any;
                success = await addProduct(newProduct);
            }

            if (success) {
                alert('บันทึกสินค้าเรียบร้อยแล้ว!');
                setIsProductModalOpen(false);
                // Reset form completely
                setFormData({ name: '', category: 'สินค้าทั่วไป', price: 0, image: '', description: '' });
                setSpecs({});
                setEditingProduct(null);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) {
            deleteProduct(id);
        }
    };

    // Helper for Status Badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_payment': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">รอชำระเงิน (COD)</span>;
            case 'paid': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">ชำระแล้ว</span>;
            case 'to_ship': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">ที่ต้องจัดส่ง</span>;
            case 'shipped': return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">กำลังจัดส่ง</span>;
            case 'completed': return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">สำเร็จ</span>;
            case 'cancelled': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">ยกเลิกแล้ว</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    const [filterCategory, setFilterCategory] = useState<string | null>(null);

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:block fixed h-full z-10 shadow-sm">
                <div className="p-6">
                    <h1 className="text-2xl font-black italic tracking-tighter mb-8 text-[var(--primary-blue)]">
                        SUPER<span className="text-[var(--primary-orange)]">TECH</span> <span className="text-xs not-italic font-medium text-gray-400 block tracking-normal mt-1">MANAGEMENT</span>
                    </h1>
                    <nav className="space-y-1">
                        <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'overview' ? 'bg-blue-50 text-[var(--primary-blue)] shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <LayoutDashboard className="w-5 h-5" /> ภาพรวม
                        </button>
                        <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'products' ? 'bg-blue-50 text-[var(--primary-blue)] shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <ShoppingBag className="w-5 h-5" /> จัดการสินค้า
                        </button>
                        <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'orders' ? 'bg-blue-50 text-[var(--primary-blue)] shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <Truck className="w-5 h-5" /> จัดการคำสั่งซื้อ
                        </button>
                        <button onClick={() => setActiveTab('customers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'customers' ? 'bg-blue-50 text-[var(--primary-blue)] shadow-sm ring-1 ring-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <Users className="w-5 h-5" /> ลูกค้า
                        </button>
                    </nav>
                </div>
                <div className="absolute bottom-0 w-full p-6 border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-gray-500 hover:text-red-600 transition-colors w-full font-medium px-4 py-2 hover:bg-red-50 rounded-lg">
                        <LogOut className="w-5 h-5" /> ออกจากระบบ
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
                        <header>
                            <h2 className="text-3xl font-bold text-gray-900">ภาพรวมร้านค้า</h2>
                            <p className="text-gray-500 mt-1">ข้อมูลสรุปและสถิติประจำวัน</p>
                        </header>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <DollarSign className="w-24 h-24 text-[var(--primary-blue)]" />
                                </div>
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="text-gray-500 font-medium">ยอดขายโดยประมาณ</span>
                                    <div className="p-2 bg-blue-50 rounded-lg text-[var(--primary-blue)]">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-1 text-gray-900 relative z-10">฿{totalSales.toLocaleString()}</div>
                                <div className="text-sm text-green-600 font-medium relative z-10 flex items-center gap-1">+12% <span className="text-gray-400 font-normal">จากเดือนที่แล้ว</span></div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <ShoppingBag className="w-24 h-24 text-[var(--primary-orange)]" />
                                </div>
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="text-gray-500 font-medium">สินค้าทั้งหมด</span>
                                    <div className="p-2 bg-orange-50 rounded-lg text-[var(--primary-orange)]">
                                        <ShoppingBag className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-1 text-gray-900 relative z-10">{totalProducts}</div>
                                <div className="text-sm text-[var(--primary-orange)] font-medium relative z-10">รายการสินค้าพร้อมขาย</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Truck className="w-24 h-24 text-green-500" />
                                </div>
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="text-gray-500 font-medium">คำสั่งซื้อรอส่ง</span>
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                        <Truck className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-1 text-gray-900 relative z-10">{orders.filter(o => o.status === 'to_ship').length}</div>
                                <div className="text-sm text-green-600 font-medium relative z-10">รายการที่ต้องจัดส่ง</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">จัดการสินค้า</h2>
                                <p className="text-gray-500 mt-1">เพิ่ม ลบ หรือแก้ไขรายการสินค้าในร้าน</p>
                            </div>
                            <button onClick={openAddModal} className="bg-[var(--primary-blue)] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 font-medium">
                                <Plus className="w-5 h-5" /> เพิ่มสินค้าใหม่
                            </button>
                        </div>

                        {/* Category Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {CATEGORY_OPTIONS.map(cat => {
                                const count = products.filter(p => p.category === cat).length;
                                const isActive = filterCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setFilterCategory(isActive ? null : cat)}
                                        className={`p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-all group ${isActive
                                            ? 'bg-[var(--primary-blue)] border-[var(--primary-blue)] ring-2 ring-blue-200'
                                            : 'bg-white border-gray-100 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className={`text-2xl font-black mb-1 group-hover:scale-110 transition-transform ${isActive ? 'text-white' : 'text-[var(--primary-blue)]'}`}>{count}</div>
                                        <div className={`text-xs text-center font-medium ${isActive ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-800'}`}>{cat}</div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Filter Status */}
                        {filterCategory && (
                            <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                                <span className="text-sm text-gray-600">แสดงสินค้าหมวดหมู่: <span className="font-bold text-[var(--primary-blue)]">{filterCategory}</span></span>
                                <button onClick={() => setFilterCategory(null)} className="text-xs text-gray-400 hover:text-red-500 underline">ล้างตัวกรอง</button>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
                                        <tr>
                                            <th className="p-5">รูปภาพ</th>
                                            <th className="p-5">ชื่อสินค้า</th>
                                            <th className="p-5">หมวดหมู่</th>
                                            <th className="p-5">ราคา</th>
                                            <th className="p-5 text-right">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.filter(p => !filterCategory || p.category === filterCategory).map((product) => (
                                            <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="p-5">
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group-hover:scale-105 transition-transform">
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                                                    </div>
                                                </td>
                                                <td className="p-5 font-medium text-gray-900 group-hover:text-[var(--primary-blue)]">{product.name}</td>
                                                <td className="p-5 text-gray-500 text-sm"><span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600">{product.category}</span></td>
                                                <td className="p-5 text-[var(--primary-orange)] font-bold">฿{product.price.toLocaleString()}</td>
                                                <td className="p-5">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openEditModal(product)} className="p-2 hover:bg-blue-50 text-gray-400 hover:text-[var(--primary-blue)] rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* === ORDERS TAB === */}
                {activeTab === 'orders' && (
                    <div className="space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto">
                        <header>
                            <h2 className="text-3xl font-bold text-gray-900">จัดการคำสั่งซื้อ</h2>
                            <p className="text-gray-500 mt-1">ตรวจสอบสถานะและดูแลการจัดส่งสินค้า</p>
                        </header>

                        {/* Order Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {['all', 'pending_payment', 'paid', 'to_ship', 'shipped', 'completed', 'cancelled'].map(status => {
                                const count = status === 'all'
                                    ? orders.length
                                    : orders.filter(o => o.status === status).length;

                                return (
                                    <button
                                        key={status}
                                        onClick={() => setOrderFilter(status)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${orderFilter === status
                                            ? 'bg-[var(--primary-blue)] text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        <span>{status === 'all' ? 'ทั้งหมด' : getStatusBadge(status)}</span>
                                        <span className={`text-xs py-0.5 px-2 rounded-full ${orderFilter === status ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {loadingOrders ? (
                            <div className="text-center py-20 text-gray-500">กำลังโหลดข้อมูล...</div>
                        ) : (
                            <div className="space-y-4">
                                {orders.filter(o => orderFilter === 'all' || o.status?.toLowerCase() === orderFilter.toLowerCase()).map((order) => (
                                    <div key={order.id} className={`border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${order.status === 'cancelled' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-bold text-lg text-gray-900">
                                                        #{order.order_number || order.id}
                                                    </span>
                                                    {getStatusBadge(order.status)}
                                                </div>
                                                <div className="text-gray-500 text-sm flex items-center gap-2">
                                                    <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleString('th-TH')}
                                                    <span className="text-gray-300">|</span>
                                                    <Users className="w-3 h-3" /> {order.profiles?.full_name || 'ไม่ระบุชื่อ'}
                                                </div>
                                            </div>

                                            {/* Status Actions */}
                                            <div className="flex items-center gap-2">
                                                {order.status === 'pending_payment' && (
                                                    // COD Flow
                                                    <>
                                                        <button onClick={() => updateOrderStatus(order.id, 'to_ship')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">ยืนยันการจัดส่ง</button>
                                                        <button onClick={() => openCancelModal(order.id)} className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors">ยกเลิก</button>
                                                    </>
                                                )}
                                                {order.status === 'paid' && (
                                                    // Paid Flow
                                                    <>
                                                        <button onClick={() => updateOrderStatus(order.id, 'to_ship')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">เตรียมจัดส่ง</button>
                                                    </>
                                                )}
                                                {order.status === 'to_ship' && (
                                                    <>
                                                        <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center gap-2"><Truck className="w-4 h-4" /> เริ่มจัดส่ง</button>
                                                        <button onClick={() => openCancelModal(order.id)} className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors">ยกเลิก</button>
                                                    </>
                                                )}
                                                {order.status === 'shipped' && (
                                                    <button onClick={() => updateOrderStatus(order.id, 'completed')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"><CheckCircle className="w-4 h-4" /> ส่งสำเร็จ</button>
                                                )}
                                                {order.status === 'cancelled' && (
                                                    <span className="text-red-500 text-sm italic">เหตุผล: {order.cancel_reason}</span>
                                                )}

                                                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                                <button onClick={() => deleteOrder(order.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ลบประวัติคำสั่งซื้อ">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-4 flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-700 mb-2 text-sm">รายการสินค้า</h4>
                                                <div className="space-y-2">
                                                    {order.order_items?.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                                                    {item.products?.image_url && <img src={item.products.image_url} className="w-full h-full object-cover" />}
                                                                </div>
                                                                <span className="text-gray-600">{item.products?.name} x {item.quantity}</span>
                                                            </div>
                                                            <span className="font-medium">฿{item.price_at_purchase.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="md:w-64 md:border-l md:border-gray-100 md:pl-6">
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between text-gray-500"><span>ยอดรวม</span> <span>฿{order.total_amount?.toLocaleString()}</span></div>
                                                    <div className="flex justify-between text-gray-500"><span>การชำระเงิน</span> <span>{order.payment_method === 'cod' ? 'เก็บเงินปลายทาง' : 'โอนจ่าย'}</span></div>
                                                    <div className="pt-2 mt-2 border-t border-gray-100">
                                                        <div className="font-bold text-gray-900 text-lg flex justify-between">
                                                            <span>สุทธิ</span>
                                                            <span className="text-[var(--primary-blue)]">฿{order.total_amount?.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {orders.filter(o => orderFilter === 'all' || o.status === orderFilter).length === 0 && (
                                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        ไม่พบคำสั่งซื้อในสถานะนี้
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* === CUSTOMERS TAB === */}
                {activeTab === 'customers' && (
                    <div className="space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto">
                        <header>
                            <h2 className="text-3xl font-bold text-gray-900">ลูกค้าร้านค้า</h2>
                            <p className="text-gray-500 mt-1">รายชื่อลูกค้าทั้งหมดในระบบ</p>
                        </header>

                        {loadingCustomers ? (
                            <div className="text-center py-20 text-gray-500">กำลังโหลดข้อมูล...</div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
                                            <tr>
                                                <th className="p-5">ลูกค้า</th>
                                                <th className="p-5">ข้อมูลติดต่อ</th>
                                                <th className="p-5">ที่อยู่</th>
                                                <th className="p-5 text-center">TechCoins</th>
                                                {/* <th className="p-5 text-right">จัดการ</th> */}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {customers.map((customer) => (
                                                <tr key={customer.id} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                                {customer.avatar_url ? (
                                                                    <img src={customer.avatar_url} alt={customer.full_name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                                                        <Users className="w-5 h-5" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{customer.full_name || 'ไม่ระบุชื่อ'}</div>
                                                                <div className="text-xs text-gray-500">{customer.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-5 text-sm text-gray-600">
                                                        <div className="flex flex-col gap-1">
                                                            <span>{customer.phone || '-'}</span>
                                                            {customer.line_id && <span className="text-xs text-green-600">Line: {customer.line_id}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-5">
                                                        <button
                                                            onClick={() => fetchCustomerAddresses(customer.id, customer.full_name)}
                                                            className="text-[var(--primary-blue)] hover:text-blue-700 font-medium flex items-center gap-2 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                                                        >
                                                            <MapPin className="w-4 h-4" />
                                                            <span className="text-sm">ดูที่อยู่จัดส่ง</span>
                                                        </button>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                                                            {customer.techcoin_balance || 0}
                                                        </span>
                                                    </td>
                                                    {/* <td className="p-5 text-right">
                                                        <button className="text-gray-400 hover:text-[var(--primary-blue)] transition-colors">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </td> */}
                                                </tr>
                                            ))}
                                            {customers.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-10 text-center text-gray-400">
                                                        ไม่พบข้อมูลลูกค้า
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Existing Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {editingProduct ? <div className="p-2 bg-blue-100 rounded-lg text-[var(--primary-blue)]"><Edit className="w-5 h-5" /></div> : <div className="p-2 bg-orange-100 rounded-lg text-[var(--primary-orange)]"><Plus className="w-5 h-5" /></div>}
                                {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
                            </h3>
                            <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                            {/* Product Name & Category */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="productName" className="text-sm font-semibold text-gray-700">ชื่อสินค้า <span className="text-red-500">*</span></label>
                                    <input
                                        id="productName"
                                        name="name"
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400"
                                        placeholder="เช่น iPhone 15 Pro"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="productCategory" className="text-sm font-semibold text-gray-700">หมวดหมู่ <span className="text-red-500">*</span></label>
                                    <select
                                        id="productCategory"
                                        name="category"
                                        required
                                        value={formData.category}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                                    >
                                        {CATEGORY_OPTIONS.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                                    </select>
                                </div>
                            </div>

                            {/* Subcategory */}
                            {SUBCATEGORIES[formData.category || ''] && (
                                <div className="space-y-2">
                                    <label htmlFor="productSubcategory" className="text-sm font-semibold text-gray-700">ประเภทสินค้า</label>
                                    <select
                                        id="productSubcategory"
                                        name="subcategory"
                                        value={specs['Subcategory'] || ''}
                                        onChange={(e) => setSpecs({ ...specs, 'Subcategory': e.target.value })}
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                                    >
                                        <option value="">-- เลือกประเภท --</option>
                                        {SUBCATEGORIES[formData.category || ''].map(sub => (<option key={sub} value={sub}>{sub}</option>))}
                                    </select>
                                </div>
                            )}

                            {/* Price Group */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="productPrice" className="text-sm font-semibold text-gray-700">ราคาขายจริง (บาท) <span className="text-red-500">*</span></label>
                                    <input
                                        id="productPrice"
                                        name="price"
                                        required
                                        type="number"
                                        min="0"
                                        max="1000000"
                                        step="1"
                                        value={formData.price || ''}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-blue-100 transition-all font-bold text-[var(--primary-orange)]"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="originalPrice" className="text-sm font-semibold text-gray-700">ราคาเต็ม (ก่อนลด) <span className="text-xs text-gray-400 font-normal">(ใส่หากมีส่วนลด)</span></label>
                                    <input
                                        id="originalPrice"
                                        name="originalPrice"
                                        type="number"
                                        min="0"
                                        max="1000000"
                                        step="1"
                                        value={formData.originalPrice || ''}
                                        onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-blue-100 transition-all"
                                        placeholder="0"
                                    />
                                    {(formData.originalPrice || 0) > (formData.price || 0) && (formData.price || 0) > 0 && (
                                        <div className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded inline-block mt-1">
                                            ลดราคา {Math.round((((formData.originalPrice || 0) - (formData.price || 0)) / (formData.originalPrice || 0)) * 100)}%
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Image URL */}
                            <div className="space-y-2">
                                <label htmlFor="productImage" className="text-sm font-semibold text-gray-700">ลิงก์รูปภาพ (URL) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        id="productImage"
                                        name="image"
                                        required
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-blue-100 transition-all pl-10 placeholder-gray-400"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                                </div>
                                {formData.image && (
                                    <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> เชื่อมต่อรูปภาพแล้ว
                                    </div>
                                )}
                            </div>

                            {/* Dynamic Specs */}
                            {CATEGORY_SPECS[formData.category || ''] && (
                                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                                    <h4 className="text-sm font-bold text-[var(--primary-blue)] mb-4 flex items-center gap-2"><Settings className="w-4 h-4" /> สเปคเฉพาะ: {formData.category}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {CATEGORY_SPECS[formData.category || ''].map((spec) => (
                                            <div key={spec} className="space-y-1">
                                                <label htmlFor={`spec-${spec}`} className="text-xs font-medium text-gray-500">{spec}</label>
                                                <input
                                                    id={`spec-${spec}`}
                                                    name={`spec-${spec}`}
                                                    type="text"
                                                    value={specs[spec] || ''}
                                                    onChange={(e) => setSpecs({ ...specs, [spec]: e.target.value })}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[var(--primary-blue)] focus:ring-1 focus:ring-blue-100 transition-all"
                                                    placeholder={`ระบุ ${spec}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div className="space-y-2">
                                <label htmlFor="productDescription" className="text-sm font-semibold text-gray-700">รายละเอียดอื่นๆ</label>
                                <textarea
                                    id="productDescription"
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-blue-100 transition-all resize-none placeholder-gray-400"
                                    placeholder="รายละเอียดสินค้าเพิ่มเติม..."
                                />
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6 flex-shrink-0">
                                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-6 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors font-medium border border-transparent">
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-[var(--primary-blue)] hover:bg-blue-700 text-white'}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            กำลังบันทึก...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            {editingProduct ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {cancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
                            <h3 className="text-lg font-bold text-red-700 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> ยกเลิกคำสั่งซื้อ</h3>
                            <button onClick={() => setCancelModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCancelOrder} className="p-6">
                            <p className="text-gray-600 mb-4 text-sm">กรุณาระบุเหตุผลที่ต้องการยกเลิกคำสั่งซื้อนี้ (จำเป็น)</p>
                            <textarea
                                required
                                rows={3}
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                                placeholder="ระบุเหตุผล..."
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setCancelModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium">ปิด</button>
                                <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 shadow-lg shadow-red-500/20">ยืนยันการยกเลิก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Address Modal */}
            {addressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-[var(--primary-blue)]" />
                                    ที่อยู่จัดส่ง
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">ลูกค้า: <span className="font-medium text-gray-900">{selectedCustomerName}</span></p>
                            </div>
                            <button onClick={() => setAddressModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {loadingAddresses ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--primary-blue)] rounded-full animate-spin mb-4"></div>
                                    <p>กำลังโหลดที่อยู่...</p>
                                </div>
                            ) : selectedCustomerAddresses.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedCustomerAddresses.map((addr, idx) => (
                                        <div key={addr.id || idx} className={`p-4 rounded-xl border ${addr.is_default ? 'border-[var(--primary-blue)] bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'} transition-colors relative group`}>
                                            {addr.is_default && (
                                                <div className="absolute top-4 right-4 bg-blue-100 text-[var(--primary-blue)] text-xs font-bold px-2 py-0.5 rounded-full">
                                                    ที่อยู่หลัก
                                                </div>
                                            )}
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                                        {addr.recipient_name}
                                                        <span className="text-gray-300">|</span>
                                                        <span className="text-gray-500 font-normal flex items-center gap-1"><Phone className="w-3 h-3" /> {addr.phone}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {addr.address}
                                                        {addr.sub_district && ` ต.${addr.sub_district}`}
                                                        {addr.district && ` อ.${addr.district}`}
                                                        {addr.province && ` จ.${addr.province}`}
                                                        {addr.zipcode && ` ${addr.zipcode}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">ไม่พบข้อมูลที่อยู่</p>
                                    <p className="text-xs text-gray-400">ลูกค้ารายนี้ยังไม่ได้เพิ่มที่อยู่จัดส่ง</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button onClick={() => setAddressModalOpen(false)} className="px-5 py-2 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 shadow-sm transition-all">
                                ปิดหน้าต่าง
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
