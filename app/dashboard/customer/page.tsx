'use client';
import { Package, Heart, MapPin, CreditCard, LogOut, User, Clock, CheckCircle, Truck, Search, ChevronRight, X, AlertCircle, ShoppingBag, Star, ArrowUpRight, ArrowDownLeft, Gift, Plus, Trash2, Edit } from 'lucide-react';
import TechcoinIcon from '../../components/TechcoinIcon';
import Link from 'next/link';
import ProvinceSelect from '../../components/ProvinceSelect';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Address {
    id: number;
    recipient_name: string | null;
    phone: string | null;
    address: string | null;
    district: string | null;
    sub_district: string | null;
    province: string | null;
    zipcode: string | null;
    is_default: boolean | null;
}

export default function CustomerDashboard() {
    const { user, isLoading, logout, techcoinBalance, refreshProfile } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'profile';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [isEditing, setIsEditing] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_number,
                order_items (
                    *,
                    products (name, image_url)
                )
            `)
            .eq('user_id', user?.id || '')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching orders:', error);
        else setOrders(data || []);
        setLoadingOrders(false);
    };
    const [isSaving, setIsSaving] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        fullName: '',
        phone: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',
        lineId: '',
        facebook: '',
        instagram: '',
        email: ''
    });

    // Address State
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        recipient_name: '',
        phone: '',
        address: '',
        sub_district: '',
        district: '',
        province: '',
        zipcode: ''
    });

    // Techcoin Redemption State
    const [promoCode, setPromoCode] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);

    const handleRedeemCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !promoCode.trim()) return;

        if (promoCode.trim().toLowerCase() !== 'supertechloveu') {
            alert('รหัสโค้ดไม่ถูกต้อง หรือหมดอายุแล้ว');
            return;
        }

        setIsRedeeming(true);
        try {
            const amount = 100;
            // 1. Check if already redeemed
            const { data: existing } = await (supabase.from('techcoin_transactions' as any) as any)
                .select('id')
                .eq('user_id', user.id)
                .eq('description', 'Redeem Code: SUPERTECHLOVEU');

            if (existing && existing.length > 0) {
                alert('ขออภัย คุณเคยใช้โค้ดนี้ไปแล้ว (จำกัด 1 สิทธิ์/บัญชี)');
                setIsRedeeming(false);
                return;
            }

            // 2. Insert Transaction
            const { error: txError } = await (supabase.from('techcoin_transactions' as any) as any).insert({
                user_id: user.id,
                amount: amount,
                type: 'earn',
                description: 'Redeem Code: ' + promoCode.toUpperCase()
            });

            if (txError) throw txError;

            // 3. Update Profile Balance (Fallback to direct update if RPC fails logic usually, but here we simulate)
            const { data: profile } = await supabase.from('profiles').select('techcoin_balance' as any).eq('id', user.id).single();
            const currentBalance = (profile as any)?.techcoin_balance || 0;
            await supabase.from('profiles').update({ techcoin_balance: currentBalance + amount } as any).eq('id', user.id);

            // 4. Refresh
            await refreshProfile();
            fetchTransactions();
            alert(`สำเร็จ! คุณได้รับ ${amount} Techcoins`);
            setPromoCode('');
        } catch (error: any) {
            alert('เกิดข้อผิดพลาด: ' + error.message);
        } finally {
            setIsRedeeming(false);
        }
    };

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        } else {
            setActiveTab('profile');
        }
    }, [searchParams]);

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    // Fetch Data
    useEffect(() => {
        if (user) {
            setProfileData(prev => ({
                ...prev,
                email: user.email || '',
                fullName: user.user_metadata?.full_name || '',
                phone: user.user_metadata?.phone || ''
            }));
            fetchProfile();
            fetchAddresses();
        }
    }, [user]);

    const fetchProfile = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data) {
                const birthDate = data.birth_date ? new Date(data.birth_date) : null;
                // Auto-sync metadata if missing in DB
                const missingPhone = !data.phone && user.user_metadata?.phone;
                const missingName = !data.full_name && user.user_metadata?.full_name;

                if (missingPhone || missingName) {
                    const updates: any = {};
                    if (missingPhone) updates.phone = user.user_metadata.phone;
                    if (missingName) updates.full_name = user.user_metadata.full_name;

                    // Background update (no await needed for UI render)
                    supabase.from('profiles').update(updates).eq('id', user.id).then(({ error }) => {
                        if (error) console.error('Error auto-syncing profile:', error);
                        else console.log('Auto-synced profile data:', updates);
                    });
                }

                setProfileData(prev => ({
                    ...prev,
                    fullName: data.full_name || user.user_metadata?.full_name || '',
                    phone: data.phone || user.user_metadata?.phone || '',
                    lineId: data.line_id || '',
                    facebook: data.facebook || '',
                    instagram: data.instagram || '',
                    birthDay: birthDate ? birthDate.getDate().toString() : '',
                    birthMonth: birthDate ? (birthDate.getMonth() + 1).toString() : '',
                    birthYear: birthDate ? birthDate.getFullYear().toString() : '',
                }));
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchAddresses = async () => {
        if (!user) return;
        const { data } = await supabase.from('address').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setAddresses(data);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);

        try {
            let birth_date = null;
            if (profileData.birthYear && profileData.birthMonth && profileData.birthDay) {
                birth_date = `${profileData.birthYear}-${profileData.birthMonth.padStart(2, '0')}-${profileData.birthDay.padStart(2, '0')}`;
            }

            const updates = {
                id: user.id,
                email: user.email,
                full_name: profileData.fullName,
                phone: profileData.phone,
                birth_date,
                line_id: profileData.lineId,
                facebook: profileData.facebook,
                instagram: profileData.instagram,
                updated_at: new Date().toISOString(),
            };

            console.log('💾 Saving profile data:', updates);

            const { data, error } = await supabase
                .from('profiles')
                .upsert(updates, { onConflict: 'id' })
                .select();

            if (error) {
                console.error('❌ Supabase error:', error);
                throw error;
            }

            console.log('✅ Save successful:', data);
            setIsEditing(false);
            alert('บันทึกข้อมูลเรียบร้อย');

        } catch (error: any) {
            console.error('❌ Save error:', error);
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + (error.message || 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const { error } = await supabase.from('address').insert({
            user_id: user.id,
            ...newAddress,
            is_default: addresses.length === 0 // First address is default
        });

        if (error) {
            alert('บันทึกที่อยู่ไม่สำเร็จ: ' + error.message);
        } else {
            alert('เพิ่มที่อยู่เรียบร้อย');
            setIsAddingAddress(false);
            setNewAddress({ recipient_name: '', phone: '', address: '', district: '', province: '', zipcode: '' });
            fetchAddresses();
        }
    };

    // Orders & Reviews State
    const [orders, setOrders] = useState<any[]>([]);
    const [userReviews, setUserReviews] = useState<Set<number>>(new Set());
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewData, setReviewData] = useState({ productId: 0, rating: 5, comment: '' });
    const [activeOrderFilter, setActiveOrderFilter] = useState('all');

    // Techcoin State
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    // fetchOrders is already defined above, so we don't need to redefine it here.
    // Instead, we ensure the useEffect calls the main fetchOrders function.

    const fetchUserReviews = async () => {
        if (!user) return;
        const { data } = await supabase.from('reviews').select('product_id').eq('user_id', user.id);
        if (data) {
            setUserReviews(new Set(data.map(r => r.product_id)));
        }
    };

    const fetchTransactions = async () => {
        if (!user) return;
        setLoadingTransactions(true);
        // Cast to any to bypass missing type definitions
        const { data } = await (supabase.from('techcoin_transactions' as any)
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }) as any);
        if (data) setTransactions(data);
        setLoadingTransactions(false);
    };

    // Effects
    useEffect(() => {
        if (activeTab === 'orders' && user) {
            fetchOrders();
            fetchUserReviews();
        }
    }, [activeTab, user]);

    useEffect(() => {
        if (activeTab === 'techcoin' && user) {
            fetchTransactions();
        }
    }, [activeTab, user]);


    if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const handleDeleteAddress = async (id: number) => {
        if (!confirm('ยืนยันการลบที่อยู่นี้?')) return;
        const { error } = await supabase.from('address').delete().eq('id', id);
        if (error) {
            alert('เกิดข้อผิดพลาดในการลบที่อยู่: ' + error.message);
        } else {
            fetchAddresses();
        }
    };

    const menuGroups = [
        {
            title: null,
            items: [
                { id: 'profile', label: 'ข้อมูลส่วนตัว', icon: User },
                { id: 'wishlist', label: 'สินค้าที่ถูกใจ', icon: Heart },
                { id: 'address', label: 'ที่อยู่สำหรับจัดส่ง', icon: MapPin },
                { id: 'payment', label: 'ช่องทางชำระเงิน', icon: CreditCard },
                { id: 'orders', label: 'ประวัติการสั่งซื้อ', icon: Package, mobileOnly: true },
                { id: 'techcoin', label: 'ประวัติการใช้ Techcoin', icon: TechcoinIcon, mobileOnly: true },
            ]
        }
    ];

    const handleCancelOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cancelOrderId || !cancelReason.trim()) return;

        try {
            // 1. Fetch Order Details to check Techcoins
            const { data: orderData, error: fetchError } = await supabase
                .from('orders')
                .select('techcoins_used, payment_status, status')
                .eq('id', cancelOrderId)
                .single();

            const order = orderData as any;

            if (fetchError) throw new Error('ดึงข้อมูลคำสั่งซื้อไม่สำเร็จ: ' + fetchError.message);
            if (!order) throw new Error('ไม่พบคำสั่งซื้อ');
            if (order.status === 'cancelled') throw new Error('คำสั่งซื้อนี้ถูกยกเลิกไปแล้ว');

            // 2. Refund Techcoins if used
            if (order.techcoins_used > 0) {
                const refundAmount = order.techcoins_used;

                // Insert Refund Transaction
                const { error: txError } = await (supabase.from('techcoin_transactions' as any) as any).insert({
                    user_id: user?.id,
                    amount: refundAmount,
                    type: 'earn', // earning back
                    description: `คืนเหรียญจากการยกเลิกคำสั่งซื้อ #${cancelOrderId}`
                });

                if (txError) throw new Error('บันทึกประวัติการคืนเหรียญไม่สำเร็จ: ' + txError.message);

                // Update Profile Balance
                const { data: profile } = await supabase.from('profiles').select('techcoin_balance' as any).eq('id', user?.id).single();
                const currentBalance = (profile as any)?.techcoin_balance || 0;

                const { error: updateError } = await supabase.from('profiles')
                    .update({ techcoin_balance: currentBalance + refundAmount } as any)
                    .eq('id', user?.id);

                if (updateError) throw new Error('อัปเดตยอดเหรียญไม่สำเร็จ: ' + updateError.message);
            }

            // 3. Cancel Order
            const { error: cancelError } = await supabase
                .from('orders')
                .update({ status: 'cancelled', cancel_reason: cancelReason })
                .eq('id', cancelOrderId)
                .eq('user_id', user?.id || '');

            if (cancelError) {
                throw cancelError;
            } else {
                alert(order.techcoins_used > 0 ? `ยกเลิกคำสั่งซื้อแล้ว (คืน ${order.techcoins_used} Techcoins)` : 'ยกเลิกคำสั่งซื้อแล้ว');
                setCancelModalOpen(false);
                setCancelReason('');
                fetchOrders();
                if (order.techcoins_used > 0) {
                    fetchTransactions(); // Refresh techcoins if tab active
                    fetchProfile(); // Update balance display
                }
            }
        } catch (error: any) {
            console.error('Cancel Order Error:', error);
            alert('ยกเลิกไม่สำเร็จ: ' + error.message);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !reviewData.productId) return;

        const { error } = await supabase.from('reviews').insert({
            user_id: user.id,
            product_id: reviewData.productId,
            rating: reviewData.rating,
            comment: reviewData.comment
        });

        if (error) {
            alert('บันทึกรีวิวไม่สำเร็จ: ' + error.message);
        } else {
            alert('ขอบคุณสำหรับการรีวิว!');
            setReviewModalOpen(false);
            setReviewData({ productId: 0, rating: 5, comment: '' });
            fetchUserReviews(); // Update reviewed set
        }
    };

    const openReviewModal = (productId: number) => {
        setReviewData({ productId, rating: 5, comment: '' });
        setReviewModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_payment': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">รอชำระเงิน</span>;
            case 'paid': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">ชำระแล้ว</span>;
            case 'to_ship': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">ที่ต้องจัดส่ง</span>;
            case 'shipped': return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">กำลังจัดส่ง</span>;
            case 'completed': return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">สำเร็จ</span>;
            case 'cancelled': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">ยกเลิกแล้ว</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    {!['orders', 'techcoin'].includes(activeTab) && (
                        <div className="bg-white p-6 rounded-xl shadow-sm h-fit md:sticky md:top-24">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-gray-900 truncate">{profileData.fullName || 'User'}</p>
                                    <p className="text-xs text-gray-500 truncate">{profileData.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-6">
                                {menuGroups.map((group, groupIndex) => (
                                    <div key={groupIndex}>
                                        {group.title && (
                                            <p className="px-4 text-xs font-bold text-gray-400 mb-2 uppercasetracking-wider">
                                                {group.title}
                                            </p>
                                        )}
                                        <div className="space-y-1">
                                            {group.items.map(item => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setActiveTab(item.id)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${(item as any).mobileOnly ? 'md:hidden' : ''} ${activeTab === item.id
                                                        ? 'bg-red-50 text-[var(--primary-red)] border-l-4 border-[var(--primary-red)]'
                                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                >
                                                    <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-[var(--primary-red)]' : 'text-gray-400'}`} />
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-red-500 rounded-lg transition-colors mt-4 text-left"
                                >
                                    <LogOut className="w-4 h-4" /> ออกจากระบบ
                                </button>
                            </nav>
                        </div>
                    )}

                    {/* Content */}
                    <div className={['orders', 'techcoin'].includes(activeTab) ? "col-span-1 md:col-span-4" : "col-span-1 md:col-span-3"}>
                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Profile Header */}
                                <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-start">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                                        <User className="text-[var(--primary-red)]" /> ข้อมูลส่วนตัว
                                    </h2>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-red-50 text-[var(--primary-red)] px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                                        >
                                            แก้ไขข้อมูลส่วนตัว
                                        </button>
                                    )}
                                </div>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 border border-gray-100">
                                        <span className="text-2xl font-bold text-emerald-500">{orders.filter(o => o.status === 'completed').length}</span>
                                        <span className="text-xs text-gray-500">สำเร็จแล้ว</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 border border-gray-100">
                                        <span className="text-2xl font-bold text-yellow-500">{orders.filter(o => o.status === 'pending_payment').length}</span>
                                        <span className="text-xs text-gray-500">ที่ต้องชำระ</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 border border-gray-100">
                                        <span className="text-2xl font-bold text-blue-500">{orders.filter(o => ['to_ship', 'shipped'].includes(o.status)).length}</span>
                                        <span className="text-xs text-gray-500">รอรับสินค้า</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 border border-gray-100">
                                        <span className="text-2xl font-bold text-red-500">{orders.filter(o => o.status === 'cancelled').length}</span>
                                        <span className="text-xs text-gray-500">ยกเลิก</span>
                                    </div>
                                </div>

                                {/* Profile Form */}
                                <div className="bg-white p-8 rounded-xl shadow-sm">
                                    {isEditing ? (
                                        <form onSubmit={handleSaveProfile} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500">ชื่อ - นามสกุล</label>
                                                    <input type="text" value={profileData.fullName} onChange={e => setProfileData({ ...profileData, fullName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[var(--primary-red)] transition-colors" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500">อีเมล (ไม่สามารถแก้ไขได้)</label>
                                                    <input type="text" value={profileData.email} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500">เบอร์โทรศัพท์</label>
                                                    <input type="tel" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[var(--primary-red)] transition-colors" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500">วัน / เดือน / ปี เกิด</label>
                                                    <div className="flex gap-2">
                                                        <input type="text" placeholder="DD" value={profileData.birthDay} onChange={e => setProfileData({ ...profileData, birthDay: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[var(--primary-red)] text-center transition-colors" />
                                                        <input type="text" placeholder="MM" value={profileData.birthMonth} onChange={e => setProfileData({ ...profileData, birthMonth: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[var(--primary-red)] text-center transition-colors" />
                                                        <input type="text" placeholder="YYYY" value={profileData.birthYear} onChange={e => setProfileData({ ...profileData, birthYear: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[var(--primary-red)] text-center transition-colors" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500">Line ID</label>
                                                    <input type="text" value={profileData.lineId} onChange={e => setProfileData({ ...profileData, lineId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[var(--primary-red)] transition-colors" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500">Facebook</label>
                                                    <input type="text" value={profileData.facebook} onChange={e => setProfileData({ ...profileData, facebook: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[var(--primary-red)] transition-colors" />
                                                </div>
                                            </div>
                                            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                                                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-lg text-gray-500 hover:bg-gray-100 font-bold transition-colors">ยกเลิก</button>
                                                <button
                                                    type="submit"
                                                    disabled={isSaving}
                                                    className="px-6 py-2 rounded-lg bg-[var(--primary-red)] text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                                    {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                            <div><label className="block text-xs text-gray-400 mb-1">ชื่อ - นามสกุล</label><p className="font-bold text-gray-800 border-b border-gray-100 pb-2">{profileData.fullName || '-'}</p></div>
                                            <div><label className="block text-xs text-gray-400 mb-1">อีเมล</label><p className="font-bold text-gray-800 border-b border-gray-100 pb-2">{profileData.email || '-'}</p></div>
                                            <div><label className="block text-xs text-gray-400 mb-1">เบอร์โทรศัพท์</label><p className="font-bold text-gray-800 border-b border-gray-100 pb-2">{profileData.phone || '-'}</p></div>
                                            <div><label className="block text-xs text-gray-400 mb-1">วัน / เดือน / ปี เกิด</label><p className="font-bold text-gray-800 border-b border-gray-100 pb-2">{profileData.birthDay ? `${profileData.birthDay} / ${profileData.birthMonth} / ${profileData.birthYear}` : '-'}</p></div>
                                            <div><label className="block text-xs text-gray-400 mb-1">Line ID</label><p className="font-bold text-gray-800 border-b border-gray-100 pb-2">{profileData.lineId || '-'}</p></div>
                                            <div><label className="block text-xs text-gray-400 mb-1">Facebook</label><p className="font-bold text-gray-800 border-b border-gray-100 pb-2">{profileData.facebook || '-'}</p></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800"><MapPin className="text-[var(--primary-red)]" /> ที่อยู่สำหรับจัดส่ง</h2>
                                    <button onClick={() => setIsAddingAddress(true)} className="bg-[var(--primary-red)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-red-200">
                                        <Plus className="w-4 h-4" /> เพิ่มที่อยู่ใหม่
                                    </button>
                                </div>
                                {!isAddingAddress ? (
                                    <>
                                        {addresses.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                {addresses.map((addr) => (
                                                    <div key={addr.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start group hover:border-red-100 transition-colors">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-gray-900">{addr.recipient_name}</span>
                                                                <span className="text-gray-500 text-sm">| {addr.phone}</span>
                                                                {addr.is_default && <span className="bg-red-100 text-[var(--primary-red)] text-xs px-2 py-0.5 rounded-full font-bold">ค่าเริ่มต้น</span>}
                                                            </div>
                                                            <p className="text-gray-600 text-sm">{addr.address} {addr.sub_district} {addr.district} {addr.province} {addr.zipcode}</p>
                                                        </div>
                                                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-white p-12 rounded-xl shadow-sm flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-300">
                                                <MapPin className="w-16 h-16 mb-4 text-gray-200" />
                                                <p>คุณยังไม่มีที่อยู่สำหรับจัดส่ง</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--primary-red)]">
                                                <MapPin className="w-6 h-6" /> เพิ่มที่อยู่สำหรับจัดส่ง
                                            </h3>
                                            <button
                                                onClick={() => setIsAddingAddress(false)}
                                                className="text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                กลับไปหน้า ที่อยู่
                                            </button>
                                        </div>

                                        <form onSubmit={(e) => {
                                            // Handle combining tambon if needed, or stick to simple basic fields for now to ensure DB success
                                            // The provided design implies specific structure.
                                            // I'll stick to saving what we have.
                                            handleSaveAddress(e);
                                        }} className="space-y-5">

                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-600 ml-1">ชื่อ - นามสกุล</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={newAddress.recipient_name}
                                                    onChange={e => setNewAddress({ ...newAddress, recipient_name: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--primary-red)] focus:bg-white transition-all font-medium"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-600 ml-1">เบอร์โทรศัพท์</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    value={newAddress.phone}
                                                    onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--primary-red)] focus:bg-white transition-all font-medium"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-600 ml-1">ที่อยู่ (บ้านเลขที่, หมู่, อาคาร, ชั้น)</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={newAddress.address}
                                                    onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--primary-red)] focus:bg-white transition-all font-medium"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-600 ml-1">รหัสไปรษณีย์</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={newAddress.zipcode}
                                                        onChange={e => setNewAddress({ ...newAddress, zipcode: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--primary-red)] focus:bg-white transition-all font-medium"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-600 ml-1">จังหวัด</label>
                                                    <ProvinceSelect
                                                        required
                                                        theme="red"
                                                        value={newAddress.province}
                                                        onChange={(val) => setNewAddress({ ...newAddress, province: val })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-600 ml-1">อำเภอ / เขต</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={newAddress.district}
                                                        onChange={e => setNewAddress({ ...newAddress, district: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--primary-red)] focus:bg-white transition-all font-medium"
                                                    />
                                                </div>
                                                {/* For Tambon, since we don't have a column, we can either append to District or Address? 
                                                    Or we leave it blank for now as the table schema might not support it natively? 
                                                    Wait, I can just use a visual Input and not save it? No, user loses data.
                                                    I will skip adding a separate Tambon field to avoid data loss until schema is updated, 
                                                    OR I can rename the District label to "อำเภอ / เขต / ตำบล / แขวง" to cover both.
                                                    Let's stick to the visual provided. I will assume 'district' covers Amphoe. 
                                                    If I add Tambon input, I must save it. I'll stick to what I can save. 
                                                    Maybe I'll rename "Address" (form above) label to include "Tambon"? 
                                                    Or just keep standard fields.
                                                */}
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-600 ml-1">ตำบล / แขวง</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={newAddress.sub_district}
                                                        onChange={e => setNewAddress({ ...newAddress, sub_district: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--primary-red)] focus:bg-white transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <button type="submit" className="bg-[var(--primary-red)] text-white font-bold px-8 py-3 rounded-lg hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center gap-2">
                                                    <Plus className="w-5 h-5" /> เพิ่มที่อยู่
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="space-y-8 animate-fade-in">

                                {/* Header Stats & Tabs */}
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                                <div className="bg-red-100 p-2 rounded-lg text-[var(--primary-red)]">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                                ประวัติการสั่งซื้อ
                                            </h2>
                                            <p className="text-gray-500 mt-1 text-sm">จัดการและติดตามสถานะคำสั่งซื้อของคุณ</p>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex gap-2 text-sm overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
                                        {[
                                            { id: 'all', label: 'ทั้งหมด', icon: Package },
                                            { id: 'pending_payment', label: 'รอชำระเงิน', icon: Clock },
                                            { id: 'to_ship', label: 'ที่ต้องจัดส่ง', icon: Truck },
                                            { id: 'shipped', label: 'กำลังจัดส่ง', icon: Truck },
                                            { id: 'completed', label: 'สำเร็จ', icon: CheckCircle },
                                            { id: 'cancelled', label: 'ยกเลิกแล้ว', icon: X }
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveOrderFilter(tab.id)}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 font-bold text-sm ${activeOrderFilter === tab.id
                                                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 transform scale-105'
                                                    : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                                                    }`}
                                            >
                                                <tab.icon className={`w-4 h-4 ${activeOrderFilter === tab.id ? 'text-yellow-400' : 'text-gray-400'}`} />
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {orders.length > 0 ? (
                                    <div className="space-y-4 md:space-y-6">
                                        {orders.filter(o => activeOrderFilter === 'all' || o.status === activeOrderFilter).map((order) => (
                                            <div key={order.id} className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group ring-1 ring-gray-50">

                                                {/* Header Bar */}
                                                <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 p-3 md:p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-4">
                                                    <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-white p-2 md:p-3 rounded-xl md:rounded-2xl shadow-sm border border-gray-100">
                                                                <span className="font-black text-sm md:text-lg text-gray-900">#{order.order_number || order.id}</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    <span>{new Date(order.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                                                                    <span className="hidden md:inline">{new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Mobile Status Badge */}
                                                        <div className="md:hidden">
                                                            {getStatusBadge(order.status)}
                                                        </div>
                                                    </div>
                                                    {/* Desktop Status Badge */}
                                                    <div className="hidden md:block ml-auto">
                                                        {getStatusBadge(order.status)}
                                                    </div>
                                                </div>

                                                {/* Progress Bar (Responsive) */}
                                                {['pending_payment', 'paid', 'to_ship', 'shipped', 'completed'].includes(order.status) && (
                                                    <div className="px-4 py-4 md:px-8 md:py-10 bg-gradient-to-b from-white to-gray-50/50 border-b border-gray-100">
                                                        {/* Mobile Compact Progress */}
                                                        <div className="md:hidden flex items-center justify-between text-[10px] gap-2">
                                                            {/* Simple Active Step Display */}
                                                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-red)] rounded-full"
                                                                    style={{ width: `${order.status === 'completed' ? '100%' : order.status === 'shipped' ? '75%' : order.status === 'to_ship' ? '50%' : '25%'}` }}
                                                                />
                                                            </div>
                                                            <div className="font-bold text-[var(--primary-red)] whitespace-nowrap">
                                                                {order.status === 'pending_payment' && 'รอชำระเงิน'}
                                                                {order.status === 'paid' && 'ชำระแล้ว'}
                                                                {order.status === 'to_ship' && 'ที่ต้องจัดส่ง'}
                                                                {order.status === 'shipped' && 'กำลังจัดส่ง'}
                                                                {order.status === 'completed' && 'จัดส่งสำเร็จ'}
                                                            </div>
                                                        </div>

                                                        {/* Desktop Detailed Progress */}
                                                        <div className="hidden md:block relative mx-12">
                                                            {/* Background Track */}
                                                            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 -translate-y-1/2 rounded-full overflow-hidden">
                                                                <div className="w-full h-full bg-gray-200/50 backdrop-blur-sm"></div>
                                                            </div>

                                                            {/* Active Track with Gradient */}
                                                            <div
                                                                className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-red)] -translate-y-1/2 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-orange-200"
                                                                style={{ width: `${order.status === 'completed' ? '100%' : order.status === 'shipped' ? '66%' : order.status === 'to_ship' ? '33%' : '0%'}` }}
                                                            ></div>

                                                            {/* Steps */}
                                                            <div className="relative flex justify-between">
                                                                {/* Step 1: Payment */}
                                                                <div className="flex flex-col items-center group">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 z-10 transition-all duration-500 ${['pending_payment', 'paid', 'to_ship', 'shipped', 'completed'].includes(order.status) ? 'bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-red)] shadow-lg shadow-orange-200 scale-110' : 'bg-white border-2 border-gray-200'}`}>
                                                                        {['pending_payment', 'paid', 'to_ship', 'shipped', 'completed'].includes(order.status) && <CheckCircle className="w-4 h-4 text-white" />}
                                                                    </div>
                                                                    <div className={`mt-6 text-sm font-bold transition-colors duration-300 ${['pending_payment', 'paid', 'to_ship', 'shipped', 'completed'].includes(order.status) ? 'text-gray-900' : 'text-gray-400'}`}>
                                                                        {order.payment_method === 'cod' && !['paid', 'completed'].includes(order.status) ? 'รอชำระเงิน' : 'ชำระเงินสำเร็จ'}
                                                                    </div>
                                                                </div>

                                                                {/* Step 2: To Ship */}
                                                                <div className="flex flex-col items-center group">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 z-10 transition-all duration-500 ${['to_ship', 'shipped', 'completed'].includes(order.status) ? 'bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-red)] shadow-lg shadow-orange-200 scale-110' : 'bg-white border-2 border-gray-200'}`}>
                                                                        {['to_ship', 'shipped', 'completed'].includes(order.status) ? <Package className="w-4 h-4 text-white" /> : <div className="w-2 h-2 bg-gray-300 rounded-full"></div>}
                                                                    </div>
                                                                    <div className={`mt-6 text-sm font-bold transition-colors duration-300 ${['to_ship', 'shipped', 'completed'].includes(order.status) ? 'text-gray-900' : 'text-gray-400'}`}>
                                                                        ที่ต้องจัดส่ง
                                                                    </div>
                                                                </div>

                                                                {/* Step 3: Shipped */}
                                                                <div className="flex flex-col items-center group">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 z-10 transition-all duration-500 ${['shipped', 'completed'].includes(order.status) ? 'bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-red)] shadow-lg shadow-orange-200 scale-110' : 'bg-white border-2 border-gray-200'}`}>
                                                                        {['shipped', 'completed'].includes(order.status) ? <Truck className="w-4 h-4 text-white" /> : <div className="w-2 h-2 bg-gray-300 rounded-full"></div>}
                                                                    </div>
                                                                    <div className={`mt-6 text-sm font-bold transition-colors duration-300 ${['shipped', 'completed'].includes(order.status) ? 'text-gray-900' : 'text-gray-400'}`}>
                                                                        กำลังจัดส่ง
                                                                    </div>
                                                                </div>

                                                                {/* Step 4: Completed */}
                                                                <div className="flex flex-col items-center group">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 z-10 transition-all duration-500 ${order.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-200 scale-110' : 'bg-white border-2 border-gray-200'}`}>
                                                                        {order.status === 'completed' ? <Star className="w-4 h-4 text-white fill-white" /> : <div className="w-2 h-2 bg-gray-300 rounded-full"></div>}
                                                                    </div>
                                                                    <div className={`mt-6 text-sm font-bold transition-colors duration-300 ${order.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                                                                        สำเร็จ
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Content Grid */}
                                                <div className="p-4 md:p-6">
                                                    <div className="space-y-4">
                                                        {order.order_items?.map((item: any) => (
                                                            <div key={item.id} className="flex gap-3 md:gap-4 items-start group/item">
                                                                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-lg md:rounded-xl border border-gray-100 overflow-hidden flex-shrink-0 relative">
                                                                    {item.products?.image_url ? (
                                                                        <img src={item.products.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-6 h-6" /></div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0 py-0.5">
                                                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 md:gap-4">
                                                                        <div className="flex-1">
                                                                            <Link href={`/product/${item.products?.id}`} className="font-bold text-gray-900 line-clamp-2 text-xs md:text-base leading-relaxed group-hover/item:text-[var(--primary-red)] transition-colors cursor-pointer hover:underline">
                                                                                {item.products?.name}
                                                                            </Link>

                                                                            {/* Specs Table - Enhanced for Mobile Visibility */}
                                                                            {item.products?.description && item.products.description.includes('--- ข้อมูลจำเพาะ ---') ? (
                                                                                <div className="mt-2 bg-gray-50 rounded-lg p-2 md:p-3 border border-gray-100 w-full md:max-w-md">
                                                                                    <h5 className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                                                        <CheckCircle className="w-3 h-3" /> คุณสมบัติเด่น
                                                                                    </h5>
                                                                                    <div className="grid grid-cols-1 gap-0.5">
                                                                                        {item.products.description.split('--- ข้อมูลจำเพาะ ---')[1]
                                                                                            .split('\n')
                                                                                            .filter((line: string) => line.trim().startsWith('-'))
                                                                                            .slice(0, 5)
                                                                                            .map((line: string, idx: number) => {
                                                                                                const [key, value] = line.replace('-', '').split(':');
                                                                                                if (!key || !value) return null;
                                                                                                return (
                                                                                                    <div key={idx} className="flex items-start text-[10px] md:text-xs">
                                                                                                        <span className="text-gray-500 w-24 flex-shrink-0 truncate">{key.trim()}</span>
                                                                                                        <span className="text-gray-900 font-medium line-clamp-1 flex-1">{value.trim()}</span>
                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                item.products?.description && <p className="text-[10px] md:text-xs text-gray-500 line-clamp-2 mt-1">{item.products.description}</p>
                                                                            )}

                                                                            <div className="flex items-center gap-2 mt-2">
                                                                                <span className="text-[10px] md:text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-medium">x{item.quantity}</span>
                                                                                {order.status === 'completed' && !userReviews.has(item.product_id) && (
                                                                                    <button onClick={() => openReviewModal(item.product_id)} className="text-[10px] md:text-xs flex items-center gap-1 text-yellow-600 hover:text-yellow-700 font-bold bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100">
                                                                                        <Star className="w-3 h-3 fill-yellow-600" /> ให้คะแนน
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center justify-between md:block mt-1 md:mt-0">
                                                                            {/* Mobile Price Label */}
                                                                            <span className="md:hidden text-[10px] text-gray-400">ราคาต่อชิ้น</span>
                                                                            <div className="font-bold text-gray-900 text-sm md:text-base">฿{item.price_at_purchase.toLocaleString()}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Footer Summary */}
                                                <div className="bg-gray-50/50 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 border-t border-gray-100">
                                                    <div className="flex flex-col gap-1 w-full md:w-auto text-xs md:text-sm text-gray-500">
                                                        <div className="flex items-center gap-2">
                                                            <CreditCard className="w-4 h-4" />
                                                            <span className="font-medium">{order.payment_method === 'cod' ? 'ชำระปลายทาง' : 'PromptPay'}</span>
                                                        </div>
                                                        {order.techcoins_used > 0 && (
                                                            <div className="flex items-center gap-2 text-indigo-600">
                                                                <div className="w-4 h-4 flex items-center justify-center bg-indigo-100 rounded-full"><TechcoinIcon className="w-3 h-3" /></div>
                                                                <span className="font-bold">ลด {order.techcoins_used.toLocaleString()} Coins</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-8">
                                                        <div className="text-right">
                                                            <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">ยอดสุทธิ</p>
                                                            <p className="text-lg md:text-2xl font-black text-[var(--primary-red)] -mt-0.5 md:-mt-1">฿{order.total_amount?.toLocaleString()}</p>
                                                        </div>
                                                        {['pending_payment', 'to_ship'].includes(order.status) && (
                                                            <button
                                                                onClick={() => { setCancelOrderId(order.id); setCancelModalOpen(true); }}
                                                                className="h-8 md:h-10 px-4 md:px-6 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 font-bold transition-all shadow-sm hover:shadow-red-100 text-xs md:text-sm whitespace-nowrap"
                                                            >
                                                                ขอยกเลิก
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
                                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                            <Package className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">ยังไม่มีประวัติการสั่งซื้อ</h3>
                                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">คุณยังไม่ได้ทำการสั่งซื้อสินค้า เริ่มต้นช้อปปิ้งกับเราเพื่อรับประสบการณ์สุดพิเศษ</p>
                                        <Link href="/" className="bg-[var(--primary-red)] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform hover:-translate-y-1">
                                            เลือกซื้อสินค้า
                                        </Link>
                                    </div>
                                )
                                }
                            </div>
                        )}

                        {activeTab === 'techcoin' && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Balance Card */}
                                <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <TechcoinIcon size={192} />
                                    </div>
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div>
                                            <h2 className="text-lg font-medium text-indigo-200 mb-2">Techcoin Balance</h2>
                                            <div className="text-5xl font-bold mb-4 flex items-baseline gap-2">
                                                {techcoinBalance.toLocaleString()}
                                                <span className="text-xl font-medium text-indigo-200">เหรียญ</span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-4">
                                                    <div className="px-4 py-2 bg-white/10 rounded-lg text-sm backdrop-blur-sm border border-white/20 font-bold text-yellow-300">
                                                        🪙 1 Techcoin = 1 บาท
                                                    </div>
                                                    <div className="px-4 py-2 bg-white/10 rounded-lg text-sm backdrop-blur-sm border border-white/20">
                                                        📅 หมดอายุใน 30-60 วัน
                                                    </div>
                                                </div>
                                                <p className="text-xs text-indigo-200 mt-2 max-w-md leading-relaxed">
                                                    * สามารถใช้ Techcoin ลดราคาได้สูงสุด 20% ของราคาสินค้าที่ร่วมรายการ <br />
                                                    * หากมี Techcoin ไม่ถึง 20% ระบบจะลดราคาตามจำนวนเหรียญที่มีจริงแบบ 1:1
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 w-full md:w-80">
                                            <label className="text-sm font-bold text-indigo-100 mb-2 block flex items-center gap-2">
                                                <Gift className="w-4 h-4" /> กรอกโค้ดรับเหรียญฟรี
                                            </label>
                                            <form onSubmit={handleRedeemCode} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={promoCode}
                                                    onChange={e => setPromoCode(e.target.value)}
                                                    placeholder="กรอกโค้ดที่นี่..."
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-indigo-300/50 focus:outline-none focus:bg-black/30 transition-colors"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isRedeeming || !promoCode}
                                                    className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-bold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                >
                                                    {isRedeeming ? '...' : 'รับ'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction History */}
                                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-gray-400" />
                                            ประวัติการใช้งาน Techcoin
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            {transactions.length} รายการ
                                        </span>
                                    </div>

                                    {loadingTransactions ? (
                                        <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
                                    ) : transactions.length === 0 ? (
                                        <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                                            <Clock className="w-12 h-12 mb-4 opacity-20" />
                                            <p>ยังไม่มีประวัติการใช้งาน Techcoin</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {transactions.map((tx) => (
                                                <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'earn' ? 'bg-green-100 text-green-600' :
                                                        tx.type === 'redeem' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {tx.type === 'earn' ? <ArrowDownLeft className="w-5 h-5" /> :
                                                            tx.type === 'redeem' ? <ArrowUpRight className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-gray-900 truncate">{tx.description}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(tx.created_at).toLocaleDateString('th-TH', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div className={`font-bold whitespace-nowrap ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cancel Modal */}
                {cancelModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
                            <h3 className="text-lg font-bold mb-4">ยืนยันการยกเลิก</h3>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-4"
                                rows={3}
                                placeholder="ระบุเหตุผลที่ต้องการยกเลิก..."
                                value={cancelReason}
                                onChange={e => setCancelReason(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setCancelModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">ปิด</button>
                                <button onClick={handleCancelOrder} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">ยืนยัน</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Review Modal */}
                {reviewModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
                            <h3 className="text-lg font-bold mb-4">รีวิวสินค้า</h3>
                            <form onSubmit={handleSubmitReview}>
                                <div className="flex gap-2 justify-center mb-6">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star <= reviewData.rating ? "gold" : "#e5e7eb"} className="w-8 h-8">
                                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-4"
                                    rows={3}
                                    placeholder="เขียนรีวิวสินค้า..."
                                    value={reviewData.comment}
                                    onChange={e => setReviewData({ ...reviewData, comment: e.target.value })}
                                />
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setReviewModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">ยกเลิก</button>
                                    <button type="submit" className="px-4 py-2 bg-[var(--primary-red)] text-white rounded-lg hover:bg-red-700 text-sm">ส่งรีวิว</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
