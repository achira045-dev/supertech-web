'use client';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { CreditCard, Banknote, Truck, Gift, Check, ChevronRight, MapPin, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateOrderId } from '../../lib/orderIdGenerator';
import { supabase } from '../lib/supabase';
import ProvinceSelect from '../components/ProvinceSelect';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, clearCart } = useCart();
    const { user, techcoinBalance, refreshProfile } = useAuth();

    // Address Management State
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

    // Target Address for Order (Linked to Selection)
    const [address, setAddress] = useState({
        fullName: '',
        phone: '',
        fullAddress: '',
        province: '',
        zipCode: ''
    });

    // New Address Form State
    const [newAddressForm, setNewAddressForm] = useState({
        recipient_name: '',
        phone: '',
        address: '',
        sub_district: '',
        district: '',
        province: '',
        zipcode: ''
    });

    // Fetch Addresses on Mount
    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        const { data } = await supabase.from('address').select('*').eq('user_id', user?.id).order('is_default', { ascending: false });
        if (data) {
            setSavedAddresses(data);
            // Auto-select default or first if address not set
            if (!selectedAddressId && data.length > 0) {
                const def = data.find((a: any) => a.is_default) || data[0];
                selectAddress(def);
            }
        }
    };

    const selectAddress = (addr: any) => {
        setSelectedAddressId(addr.id);
        const fullAddr = `${addr.address} ${addr.sub_district || ''} ${addr.district}`;
        setAddress({
            fullName: addr.recipient_name || '',
            phone: addr.phone || '',
            fullAddress: fullAddr,
            province: addr.province || '',
            zipCode: addr.zipcode || ''
        });
        setIsAddingNew(false);
    };

    const handleSaveNewAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAddressForm.recipient_name || !newAddressForm.phone || !newAddressForm.address || !newAddressForm.province) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (user) {
            const { error } = await supabase.from('address').insert({
                user_id: user.id,
                ...newAddressForm,
                is_default: savedAddresses.length === 0
            });
            if (!error) {
                await fetchAddresses();
                // We need to re-fetch to get the ID, or optimistically update. 
                // fetching is safer.
                // We'll trust fetchAddresses to run.
                // But we want to Select the new one.
                // Quick fix: Fetch again immediately and select the latest?
                const { data } = await supabase.from('address').select('*').eq('user_id', user.id).order('id', { ascending: false }).limit(1).single();
                if (data) selectAddress(data);
            } else {
                alert('เกิดข้อผิดพลาด: ' + error.message);
            }
        } else {
            // Guest Mode
            const mock = { id: 9999, ...newAddressForm, is_default: true };
            selectAddress(mock);
            // We don't save to DB for guest, but we populate the Order Address
        }
        setIsAddingNew(false);
        setNewAddressForm({ recipient_name: '', phone: '', address: '', district: '', province: '', zipcode: '' });
    };

    const handleDeleteAddress = async (id: number) => {
        if (!confirm('ยืนยันการลบที่อยู่?')) return;
        await supabase.from('address').delete().eq('id', id);
        fetchAddresses();
        if (selectedAddressId === id) {
            setAddress({ fullName: '', phone: '', fullAddress: '', province: '', zipCode: '' });
            setSelectedAddressId(null);
        }
    };

    // Payment & Discount State
    const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'cod' | null>(null);
    const [discountCode, setDiscountCode] = useState('');
    const [showCoupons, setShowCoupons] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

    // Timer Logic for SupertechOpenHouse (10 Days from now)
    // We'll set a static end date for demo purposes or just a countdown from 10 days
    useEffect(() => {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 10); // 10 days expiration

        const timer = setInterval(() => {
            const now = new Date();
            const diff = endDate.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('หมดเวลา');
                clearInterval(timer);
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const [appliedDiscount, setAppliedDiscount] = useState(0);

    // Techcoin State
    const [useTechcoins, setUseTechcoins] = useState(false);

    // Calculate Prices
    // Calculate Prices & Totals
    const getPriceNumber = (price: string | number | undefined) => {
        if (!price) return 0;
        if (typeof price === 'number') return price;
        return parseFloat(price.toString().replace(/[^0-9.]/g, '')) || 0;
    };

    let totalNormalItems = 0; // Post-20% discount
    let totalFlashSaleItems = 0; // Full price (Flash Sale)

    cart.forEach(item => {
        const rawPrice = getPriceNumber(item.price);
        const isFlashSale = !!item.discount; // Check if item is Flash Sale

        if (isFlashSale) {
            totalFlashSaleItems += rawPrice * item.quantity;
        } else {
            // Normal items - Discount comes from Techcoin usage, not automatic
            totalNormalItems += rawPrice * item.quantity;
        }
    });

    const subtotal = totalNormalItems + totalFlashSaleItems;

    // Shipping Logic: Free for Ubon Ratchathani OR SupertechOpenHouse code
    let shipping = 50;
    // Check if province is Ubon Ratchathani (Exact match from Select or partial from address string fallback)
    const isUbon = address.province === 'อุบลราชธานี' || address.fullAddress?.includes('อุบลราชธานี');

    if (isUbon || discountCode === 'SupertechOpenHouse') {
        shipping = 0;
    }
    const totalBeforeExtraDiscount = subtotal + shipping;

    // Techcoin Calculations
    // Logic: Flash Sale items cannot be discounted further.
    // So distinct base for Techcoin usage is ONLY the total of Normal Items.
    const eligibleForTechcoin = totalNormalItems;

    // Policy: 1 Techcoin = 1 THB
    // Limit: Max discount is 20% of the eligible product price.
    const maxRedeemableValue = Math.floor(eligibleForTechcoin * 0.20);

    // Earn Coins calculation
    const earnedCoins = Math.floor(totalBeforeExtraDiscount / 40);

    // Actual coins to use is the lesser of: User's Balance OR The 20% Limit
    const coinsToRedeem = Math.min(techcoinBalance, maxRedeemableValue);

    // Discount value matches coins used (1:1 rate)
    const coinDiscount = useTechcoins ? coinsToRedeem : 0;

    const finalTotal = Math.max(0, totalBeforeExtraDiscount - appliedDiscount - coinDiscount);

    // Handlers
    const handleApplyDiscount = () => {
        if (discountCode.trim().toUpperCase() === 'SUPERTECH') {
            setAppliedDiscount(100);
            alert('ใช้โค้ดส่วนลดสำเร็จ! ลดทันที 100 บาท');
        } else {
            alert('โค้ดส่วนลดไม่ถูกต้อง');
            setAppliedDiscount(0);
        }
    };

    const handleConfirmOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!paymentMethod) {
            alert('กรุณาเลือกวิธีการชำระเงิน');
            return;
        }

        // Validate Address
        if (!address.fullName || !address.phone || !address.fullAddress) {
            alert('กรุณากรอกที่อยู่ให้ครบถ้วน');
            return;
        }

        // Calculate Delivery Date (approx 5 days)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5);
        const deliveryDateStr = deliveryDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

        // Helper: Save Order to DB
        const saveOrderToDB = async (status: string, paymentStatus: string) => {
            if (!user) return true;

            // 1. Insert Order
            const { data: orderData, error: orderError } = await (supabase.from('orders' as any) as any).insert({
                user_id: user.id,
                status: status,
                payment_status: paymentStatus,
                total_amount: finalTotal,
                techcoins_used: useTechcoins ? coinsToRedeem : 0,
                shipping_cost: shipping,
                discount_amount: appliedDiscount + coinDiscount,
                payment_method: paymentMethod,
                recipient_name: address.fullName,
                shipping_address: address.fullAddress,
                phone: address.phone,
                order_number: generateOrderId() // Generate formal Order ID
            }).select().single();

            if (orderError) {
                console.error('Order Save Error:', orderError);
                return null;
            }

            // 2. Insert Items
            if (orderData) {
                const itemsToInsert = cart.map(item => ({
                    order_id: orderData.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    price_at_purchase: typeof item.price === 'number' ? item.price : parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) || 0
                }));
                const { error: itemsError } = await (supabase.from('order_items' as any) as any).insert(itemsToInsert);
                if (itemsError) console.error('Items Save Error:', itemsError);

                return orderData.id;
            }
            return null;
        };

        // --- Execute Flow ---

        // 1. COD (Cash on Delivery)
        if (paymentMethod === 'cod') {
            if (user && useTechcoins && coinsToRedeem > 0) {
                await (supabase.from('techcoin_transactions' as any) as any).insert({
                    user_id: user.id,
                    amount: -coinsToRedeem,
                    type: 'redeem',
                    description: `ใช้ส่วนลดคำสั่งซื้อ`
                });
                const { data } = await supabase.from('profiles').select('techcoin_balance' as any).eq('id', user.id).single();
                await supabase.from('profiles').update({ techcoin_balance: Math.max(0, ((data as any)?.techcoin_balance || 0) - coinsToRedeem) } as any).eq('id', user.id);
                await refreshProfile();
            }

            // Save with status 'to_ship', payment 'pending'
            await saveOrderToDB('to_ship', 'pending');

            const itemsList = cart.map(i => `- ${i.name}`).join('\n');
            const deliveryMsg = `ยืนยันคำสั่งซื้อสำเร็จ (เก็บเงินปลายทาง)\n\nรายการสินค้า:\n${itemsList}\n\nระยะเวลาจัดส่งโดยประมาณ: 4-5 วัน\nสินค้าจะถึงมือคุณภายในวันที่: ${deliveryDateStr}\n\nสถานะ: เตรียมจัดส่ง`;

            alert(deliveryMsg);
            // Cart cleared
            clearCart();
            router.push('/dashboard/customer?tab=orders');
        }

        // 2. PromptPay / QR
        else if (paymentMethod === 'promptpay' || paymentMethod === 'credit_card') {
            const confirmed = confirm(`ระบบกำลังพาท่านไปหน้าชำระเงิน (จำลอง QR Code)...\n\nยอดชำระ: ฿${finalTotal.toLocaleString()}\n\n[ QR CODE IMAGE ]\n\nกด 'ตกลง' เพื่อจำลองการชำระเงินสำเร็จ`);

            if (confirmed) {
                if (user && useTechcoins && coinsToRedeem > 0) {
                    await (supabase.from('techcoin_transactions' as any) as any).insert({
                        user_id: user.id,
                        amount: -coinsToRedeem,
                        type: 'redeem',
                        description: `ใช้ส่วนลดคำสั่งซื้อ`
                    });
                    const { data } = await supabase.from('profiles').select('techcoin_balance' as any).eq('id', user.id).single();
                    await supabase.from('profiles').update({ techcoin_balance: Math.max(0, ((data as any)?.techcoin_balance || 0) - coinsToRedeem) } as any).eq('id', user.id);
                    await refreshProfile();
                }

                // Save with status 'to_ship' (Paid)
                await saveOrderToDB('to_ship', 'paid');

                alert('ชำระเงินเรียบร้อย! ขอบคุณสำหรับการสั่งซื้อ\nสถานะ: ชำระแล้ว / เตรียมจัดส่ง');
                // Cart cleared
                clearCart();
                router.push('/dashboard/customer?tab=orders');
            }
        }
    };
    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">ตะกร้าสินค้าว่างเปล่า</h2>
                    <p className="text-gray-500 mb-6">เลือกสินค้าก่อนทำการสั่งซื้อนะครับ</p>
                    <Link href="/" className="inline-block w-full bg-[var(--primary-orange)] text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors">
                        ไปเลือกซื้อสินค้า
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-8">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/cart" className="hover:text-[var(--primary-orange)]">ตะกร้าสินค้า</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-bold">ยืนยันการสั่งซื้อ</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Form Info */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* 1. Shipping Address */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Truck className="w-6 h-6 text-[var(--primary-orange)]" />
                                ที่อยู่จัดส่ง
                            </h2>

                            {!isAddingNew ? (
                                <div className="space-y-4">
                                    {/* Saved Addresses List */}
                                    {savedAddresses.length > 0 && (
                                        <div className="grid grid-cols-1 gap-3 mb-4">
                                            {savedAddresses.map((addr) => (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => selectAddress(addr)}
                                                    className={`relative border rounded-xl p-4 cursor-pointer transition-all ${selectedAddressId === addr.id
                                                        ? 'border-[var(--primary-orange)] bg-orange-50/30 ring-1 ring-[var(--primary-orange)]'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex gap-3">
                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 ${selectedAddressId === addr.id ? 'border-[var(--primary-orange)] bg-[var(--primary-orange)]' : 'border-gray-300'}`}>
                                                                {selectedAddressId === addr.id && <Check className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                                                    {addr.recipient_name}
                                                                    <span className="text-gray-500 font-normal text-sm">| {addr.phone}</span>
                                                                    {addr.is_default && <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">ค่าเริ่มต้น</span>}
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                                                    {addr.address} {addr.sub_district} {addr.district} {addr.province} {addr.zipcode}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }}
                                                            className="text-gray-400 hover:text-red-500 p-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add New Button */}
                                    <button
                                        onClick={() => setIsAddingNew(true)}
                                        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center text-gray-500 hover:text-[var(--primary-orange)] hover:border-[var(--primary-orange)] hover:bg-orange-50 transition-all gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span className="font-bold">{savedAddresses.length > 0 ? 'เพิ่มที่อยู่ใหม่' : 'เพิ่มที่อยู่จัดส่ง'}</span>
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSaveNewAddress} className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-gray-800">ข้อมูลที่อยู่ใหม่</h3>
                                        <button type="button" onClick={() => setIsAddingNew(false)} className="text-sm text-gray-500 hover:text-red-500">ยกเลิก</button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600">ชื่อ-นามสกุล</label>
                                            <input
                                                required
                                                type="text"
                                                value={newAddressForm.recipient_name}
                                                onChange={e => setNewAddressForm({ ...newAddressForm, recipient_name: e.target.value })}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primary-orange)]"
                                                placeholder="ชื่อ-นามสกุล ผู้รับ"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600">เบอร์โทรศัพท์</label>
                                            <input
                                                required
                                                type="tel"
                                                value={newAddressForm.phone}
                                                onChange={e => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primary-orange)]"
                                                placeholder="08X-XXX-XXXX"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-600">ที่อยู่ (บ้านเลขที่, ถนน, ซอย)</label>
                                        <input
                                            required
                                            type="text"
                                            value={newAddressForm.address}
                                            onChange={e => setNewAddressForm({ ...newAddressForm, address: e.target.value })}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primary-orange)]"
                                            placeholder="บ้านเลขที่, ถนน, ซอย"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600">จังหวัด</label>
                                            <ProvinceSelect
                                                required
                                                theme="orange"
                                                value={newAddressForm.province}
                                                onChange={(val) => setNewAddressForm({ ...newAddressForm, province: val })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600">รหัสไปรษณีย์</label>
                                            <input
                                                required
                                                type="text"
                                                value={newAddressForm.zipcode}
                                                onChange={e => setNewAddressForm({ ...newAddressForm, zipcode: e.target.value })}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primary-orange)]"
                                                placeholder="XXXXX"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600">อำเภอ / เขต</label>
                                            <input
                                                required
                                                type="text"
                                                value={newAddressForm.district}
                                                onChange={e => setNewAddressForm({ ...newAddressForm, district: e.target.value })}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primary-orange)]"
                                                placeholder="อำเภอ / เขต"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600">ตำบล / แขวง</label>
                                            <input
                                                required
                                                type="text"
                                                value={newAddressForm.sub_district}
                                                onChange={e => setNewAddressForm({ ...newAddressForm, sub_district: e.target.value })}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--primary-orange)]"
                                                placeholder="ตำบล / แขวง"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            className="w-full bg-[var(--primary-orange)] text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100"
                                        >
                                            บันทึกและใช้ที่อยู่
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* 2. Payment Method */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <CreditCard className="w-6 h-6 text-[var(--primary-orange)]" />
                                ช่องทางการชำระเงิน
                            </h2>
                            <div className="space-y-3">
                                {/* PromptPay/QR */}
                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'promptpay'
                                    ? 'border-[var(--primary-orange)] bg-orange-50/50 ring-1 ring-[var(--primary-orange)]'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="hidden"
                                        checked={paymentMethod === 'promptpay'}
                                        onChange={() => setPaymentMethod('promptpay')}
                                    />
                                    <div className={`p-2.5 rounded-full mr-4 ${paymentMethod === 'promptpay' ? 'bg-[var(--primary-orange)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900">Scan QR Code / PromptPay</div>
                                        <div className="text-xs text-gray-500">สแกนจ่ายง่ายๆ ผ่านแอพธนาคาร</div>
                                    </div>
                                    {paymentMethod === 'promptpay' && <Check className="w-5 h-5 text-[var(--primary-orange)]" />}
                                </label>

                                {/* COD */}
                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod'
                                    ? 'border-[var(--primary-orange)] bg-orange-50/50 ring-1 ring-[var(--primary-orange)]'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="hidden"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                    />
                                    <div className={`p-2.5 rounded-full mr-4 ${paymentMethod === 'cod' ? 'bg-[var(--primary-orange)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <Banknote className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900">เก็บเงินปลายทาง (COD)</div>
                                        <div className="text-xs text-gray-500">ชำระเงินสดเมื่อได้รับสินค้า</div>
                                    </div>
                                    {paymentMethod === 'cod' && <Check className="w-5 h-5 text-[var(--primary-orange)]" />}
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-4 space-y-6 sticky top-8">

                        {/* Product List */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">รายการสินค้า ({cart.length})</h3>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.map((item) => {
                                    const isFlashSale = !!item.discount;
                                    const rawPrice = getPriceNumber(item.price);
                                    // For display in list, show full price for normal items, but maybe hint at techcoin eligibility?
                                    // Or just show raw price. The discount is applied at the bottom.
                                    const displayPrice = rawPrice;

                                    return (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 relative">
                                                <img src={item.image} className="w-full h-full object-contain" />
                                                {isFlashSale && (
                                                    <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-[8px] font-bold text-center py-0.5">
                                                        FLASH SALE
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h4>
                                                <div className="flex items-center justify-between mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">x{item.quantity}</span>
                                                        {!isFlashSale && (
                                                            <div className="flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                                                <Gift className="w-3 h-3" />
                                                                ใช้ Techcoin ลดได้ 20%
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        ฿{(displayPrice * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Techcoin Redemption */}
                        {user && (
                            <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Gift className="w-32 h-32" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                        <Gift className="w-5 h-5 text-yellow-300" />
                                        ใช้ Techcoin ลดเพิ่ม
                                    </h3>
                                    <p className="text-xs text-indigo-100 mb-4">คุณมี {techcoinBalance.toLocaleString()} เหรียญ (ใช้ลดได้ 20%)</p>

                                    <div
                                        className={`flex items-center justify-between bg-white/10 rounded-xl p-3 border border-white/20 transition-opacity ${techcoinBalance === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${useTechcoins ? 'bg-yellow-400 border-yellow-400' : 'border-white/50'}`}
                                                onClick={() => techcoinBalance > 0 && setUseTechcoins(!useTechcoins)}
                                            >
                                                {useTechcoins && <Check className="w-3 h-3 text-indigo-900" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">ใช้ {coinsToRedeem.toLocaleString()} เหรียญ</span>
                                                {techcoinBalance > maxRedeemableValue ? (
                                                    <span className="text-[10px] text-yellow-200">ใช้สิทธิ์ลดสูงสุด 20% ({maxRedeemableValue.toLocaleString()} บาท)</span>
                                                ) : techcoinBalance > 0 ? (
                                                    <span className="text-[10px] text-gray-300">ใช้เหรียญทั้งหมดที่มี</span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <span className="font-bold text-yellow-300">-฿{coinsToRedeem.toLocaleString()}</span>
                                    </div>
                                    {techcoinBalance === 0 && (
                                        <p className="text-[10px] text-red-200 mt-2 flex items-center gap-1">
                                            * คุณไม่มี Techcoin (สะสมได้จากการซื้อสินค้า)
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Free Shipping Code Selection */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <label className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Gift className="w-4 h-4 text-[var(--primary-orange)]" />
                                โค้ดส่งฟรี
                            </label>

                            {!discountCode ? (
                                <button
                                    onClick={() => setShowCoupons(!showCoupons)}
                                    className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-sm hover:border-[var(--primary-blue)] transition-colors group"
                                >
                                    <span className="text-gray-500 group-hover:text-gray-900">เลือกโค้ดส่งฟรี</span>
                                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showCoupons ? 'rotate-90' : ''}`} />
                                </button>
                            ) : (
                                <div className="flex items-center justify-between border border-green-200 bg-green-50 rounded-xl px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-bold text-green-700">{discountCode}</span>
                                    </div>
                                    <button onClick={() => setDiscountCode('')} className="text-xs text-gray-500 hover:text-red-500 underline">
                                        ยกเลิก
                                    </button>
                                </div>
                            )}

                            {/* Coupon List Dropdown */}
                            {showCoupons && !discountCode && (
                                <div className="mt-3 space-y-3 animate-fade-in">
                                    {/* Coupon Item: SupertechOpenHouse */}
                                    <button
                                        onClick={() => {
                                            setDiscountCode('SupertechOpenHouse');
                                            setShowCoupons(false);
                                        }}
                                        className="w-full text-left bg-gradient-to-r from-orange-50 to-white border border-orange-100 hover:border-orange-300 rounded-xl p-3 shadow-sm transition-all relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Gift className="w-12 h-12 text-[var(--primary-orange)]" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-gray-900">SupertechOpenHouse</span>
                                                <span className="bg-[var(--primary-orange)] text-white text-[10px] px-1.5 py-0.5 rounded font-bold">ส่งฟรี</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">ต้อนรับเปิดบ้านลดค่าจัดส่ง 100%</p>

                                            {/* Countdown */}
                                            <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-orange-600 bg-orange-100/50 px-2 py-1 rounded w-fit">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                                หมดเขตใน: {timeLeft}
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Totals */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="space-y-3 text-sm mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>ยอดรวมสินค้า</span>
                                    <span>฿{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>ค่าจัดส่ง</span>
                                    <span>{shipping === 0 ? <span className="text-green-600 font-bold">ฟรี</span> : `฿${shipping.toLocaleString()}`}</span>
                                </div>
                                {appliedDiscount > 0 && (
                                    <div className="flex justify-between text-green-600 font-bold">
                                        <span>ส่วนลด (Code)</span>
                                        <span>-฿{appliedDiscount.toLocaleString()}</span>
                                    </div>
                                )}
                                {useTechcoins && coinDiscount > 0 && (
                                    <div className="flex justify-between text-indigo-600 font-bold">
                                        <span>ส่วนลด (Techcoin)</span>
                                        <span>-฿{coinDiscount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex items-center justify-between mb-6">
                                <span className="text-lg font-bold text-gray-900">ยอดสุทธิ</span>
                                <span className="text-2xl font-black text-[var(--primary-orange)]">฿{finalTotal.toLocaleString()}</span>
                            </div>

                            <button
                                onClick={handleConfirmOrder}
                                className="w-full bg-[var(--primary-orange)] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 hover:shadow-xl transition-all active:scale-95"
                            >
                                ยืนยันคำสั่งซื้อ
                            </button>
                            <p className="mt-3 text-[10px] text-center text-gray-400">
                                โดยการสั่งซื้อ คุณยอมรับเงื่อนไขและข้อตกลงการใช้บริการของเรา
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
