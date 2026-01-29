'use client';
import Link from 'next/link';
import { ShoppingCart, User, Search, LogOut, Grid, ChevronDown, ChevronRight, Store, X, Gift, Monitor } from 'lucide-react';
import TechcoinIcon from './TechcoinIcon';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useRouter } from 'next/navigation';

// ... (imports remain same)

// ... (imports)

export default function Navbar() {
    const { cartCount } = useCart();
    const { user, logout, isAdmin, techcoinBalance } = useAuth();
    const { products } = useProducts();
    const router = useRouter();
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); // New Mobile State
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // New User Menu State
    const searchRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
        router.refresh();
    };

    // Filter products for search
    const filteredProducts = searchQuery.length > 0
        ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
        : [];

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setShowSearchResults(false);
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'บัญชี';

    const categories = [
        {
            name: 'โน๊ตบุ๊ค',
            icon: '💻',
            subcategories: [
                'โน๊ตบุ๊คเล่นเกม',
                'โน๊ตบุ๊คบางเบา',
                'โน๊ตบุ๊คสำหรับองค์กร',
                'ดูทั้งหมด'
            ]
        },
        {
            name: 'จอมอนิเตอร์',
            icon: '🖥️',
            subcategories: [
                '49 นิ้ว', '34 นิ้ว', '32 นิ้ว', '30 นิ้ว', '28 นิ้ว',
                '27 นิ้ว', '25 นิ้ว', '24 นิ้ว', '22 นิ้ว', '20 นิ้ว',
                '19 นิ้ว', '16 นิ้ว', 'ดูทั้งหมด'
            ]
        },
        { name: 'แท็บเล็ต', icon: '📱' },
        {
            name: 'ซีพียู',
            icon: '🧠',
            subcategories: [
                'INTEL',
                'AMD',
                'ดูทั้งหมด'
            ]
        },
        {
            name: 'การ์ดจอ',
            icon: '🎮',
            subcategories: [
                'INTEL ARC',
                'AMD RADEON',
                'NVIDIA GEFORCE',
                'NVIDIA PRO',
                'ดูทั้งหมด'
            ]
        },
        {
            name: 'เมนบอร์ด',
            icon: '🔌',
            subcategories: [
                'INTEL',
                'AMD',
                'ดูทั้งหมด'
            ]
        },
        {
            name: 'แรม',
            icon: '💾',
            subcategories: [
                'RAM NOTEBOOK',
                'DDR5',
                'DDR4',
                'ดูทั้งหมด'
            ]
        },
        {
            name: 'ฮาร์ดดิสก์ และ เอสเอสดี',
            icon: '💽',
            subcategories: [
                'การ์ด M.2',
                'โซลิดสเตตไดรฟ์ (เอสเอสดี)',
                'ฮาร์ดดิสก์',
                'ดูทั้งหมด'
            ]
        },
        {
            name: 'พาวเวอร์ซัพพลาย',
            icon: '⚡',
            subcategories: [
                '1300 วัตต์',
                '1200 วัตต์',
                '1050 วัตต์',
                '1000 วัตต์',
                '850 วัตต์',
                '800 วัตต์',
                '750 วัตต์',
                '700 วัตต์',
                '650 วัตต์',
                '600 วัตต์',
                '550 วัตต์',
                'ดูทั้งหมด'
            ]
        },
        {
            name: 'เคส',
            icon: '🕋',
            subcategories: [
                'Small Form Factor',
                'Open Air',
                'Full-Tower',
                'Mini-Tower',
                'Mid-Tower',
                'ดูทั้งหมด'
            ]
        },
        {
            name: 'ชุดระบายความร้อน',
            icon: '❄️',
            subcategories: [
                'ที่วางโน๊ตบุ๊ค',
                'ซิลิโคน',
                'พัดลมเคส',
                'พัดลมซีพียู',
                'ชุดน้ำปิด',
                'ดูทั้งหมด'
            ]
        },
        { name: 'คีย์บอร์ด', icon: '⌨️' },
        { name: 'เมาส์', icon: '🖱️' }
    ];

    return (
        <nav className="bg-white sticky top-0 z-50 w-full shadow-lg border-b border-gray-100 font-sans">
            {/* Top Bar */}
            <div className="hidden md:block bg-gradient-to-r from-[var(--secondary-blue)] to-[var(--primary-blue)] text-white text-sm py-2 shadow-sm">
                <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <span className="opacity-90 tracking-wide">ยินดีต้อนรับสู่ SPT SuperTech - ผู้นำอุปกรณ์ไอทีระดับโลก</span>
                    <div className="flex space-x-6">
                        <Link href="/help" className="hover:text-orange-200 transition-colors flex items-center gap-1">
                            ช่วยเหลือ
                        </Link>
                        <div className="w-px h-3 bg-white/20 my-auto"></div>
                        <Link href="/track" className="hover:text-orange-200 transition-colors flex items-center gap-1">
                            ติดตามสถานะ
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between gap-2 md:gap-8 relative">
                    {/* Logo */}
                    <div className="flex-shrink-0 relative z-50">
                        <Link href="/" className="flex items-center -my-4">
                            <img
                                src="/spt_logo_v2.png"
                                alt="SPT SuperTech Logo"
                                className="h-10 md:h-24 w-auto object-contain hover:scale-105 transition-transform duration-300 mix-blend-multiply filter drop-shadow-sm"
                            />
                        </Link>
                    </div>

                    {/* Category Dropdown - Hidden on Mobile */}
                    <div className="relative z-50 hidden md:block">
                        <button
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className={`flex items-center gap-2.5 bg-white text-gray-700 px-2 md:px-6 py-2 md:py-2.5 rounded-full border border-gray-200 hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)] transition-all duration-300 font-bold text-sm shadow-sm group ${isCategoryOpen ? 'border-[var(--primary-blue)] bg-blue-50/50 text-[var(--primary-blue)] ring-2 ring-blue-100' : ''}`}
                        >
                            <div className={`p-1.5 rounded-md transition-colors ${isCategoryOpen ? 'bg-[var(--primary-blue)] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-[var(--primary-blue)] group-hover:text-white'}`}>
                                <Grid className="w-4 h-4" />
                            </div>
                            <span className="hidden md:inline">หมวดหมู่สินค้า</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 hidden md:block ${isCategoryOpen ? 'rotate-180 text-[var(--primary-blue)]' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isCategoryOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40 bg-transparent"
                                    onClick={() => setIsCategoryOpen(false)}
                                />
                                <div className="absolute top-full left-0 w-80 bg-white shadow-xl rounded-2xl border border-gray-100 mt-3 z-50 animate-in fade-in slide-in-from-top-2 max-h-[75vh] overflow-y-auto custom-scrollbar ring-1 ring-black/5">
                                    <div className="py-2">
                                        {categories.map((cat, idx) => (
                                            <div key={idx} className="group/item">
                                                <div
                                                    onClick={() => {
                                                        if (cat.subcategories) {
                                                            setExpandedCategory(expandedCategory === cat.name ? null : cat.name);
                                                        } else {
                                                            setIsCategoryOpen(false);
                                                            router.push(`/products?category=${cat.name}`);
                                                        }
                                                    }}
                                                    className={`flex items-center justify-between px-6 py-4 text-base text-gray-600 hover:bg-blue-50 hover:text-[var(--primary-blue)] transition-all cursor-pointer border-b border-gray-50/50 last:border-0 ${expandedCategory === cat.name ? 'bg-blue-50 text-[var(--primary-blue)] font-bold' : ''}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-2xl filter drop-shadow-sm">{cat.icon}</span>
                                                        <span>{cat.name}</span>
                                                    </div>
                                                    {cat.subcategories && (
                                                        <ChevronDown className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${expandedCategory === cat.name ? 'rotate-180 text-[var(--primary-blue)]' : ''}`} />
                                                    )}
                                                </div>

                                                {/* Submenu (Accordion Style) */}
                                                {cat.subcategories && expandedCategory === cat.name && (
                                                    <div className="bg-gray-50/80 border-l-[3px] border-[var(--primary-blue)] ml-0 animate-in slide-in-from-top-1 overflow-hidden">
                                                        {cat.subcategories.map((sub, subIdx) => (
                                                            <Link
                                                                key={subIdx}
                                                                href={`/products?category=${cat.name}&subcategory=${sub}`}
                                                                onClick={() => setIsCategoryOpen(false)}
                                                                className="block px-6 py-3 text-sm text-gray-500 hover:text-[var(--primary-orange)] hover:bg-white pl-14 transition-all relative hover:pl-16"
                                                            >
                                                                <span className="absolute left-10 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[var(--primary-orange)] transition-colors"></span>
                                                                {sub}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* PC Builder Button */}
                    <Link href="/pc-builder" className="hidden md:flex items-center gap-2.5 bg-white text-gray-700 px-2 md:px-5 py-2 md:py-2.5 rounded-full border border-gray-200 hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)] transition-all duration-300 font-bold text-sm shadow-sm group">
                        <div className="p-1.5 rounded-md bg-orange-50 text-[var(--primary-orange)] group-hover:bg-[var(--primary-orange)] group-hover:text-white transition-colors">
                            <Monitor className="w-4 h-4" />
                        </div>
                        <span className="whitespace-nowrap">จัดสเปคคอม</span>
                    </Link>

                    {/* Desktop Search */}
                    <div className="hidden md:block flex-1 max-w-2xl mx-6" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} className="relative group">
                            <input
                                type="text"
                                placeholder="ค้นหา: ไอโฟน 15, การ์ดจอ, ชุดน้ำ..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:bg-white transition-all text-sm group-hover:shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowSearchResults(true)}
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1.5 bg-[var(--primary-blue)] text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                            >
                                <Search className="h-4 w-4" />
                            </button>

                            {/* Live Search Results Dropdown */}
                            {showSearchResults && searchQuery.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-2xl border border-gray-100 mt-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    {filteredProducts.length > 0 ? (
                                        <div className="py-2">
                                            <div className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-50/50">สินค้าที่พบล่าสุด</div>
                                            {filteredProducts.map(product => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => {
                                                        router.push(`/product/${product.id}`);
                                                        setShowSearchResults(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors flex items-center gap-3 group border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1 mix-blend-multiply" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-[var(--primary-blue)] truncate">{product.name}</h4>
                                                        <div className="text-xs text-gray-500 mt-0.5">{product.category}</div>
                                                    </div>
                                                    <div className="text-sm font-bold text-[var(--primary-orange)] whitespace-nowrap">
                                                        ฿{product.price.toLocaleString()}
                                                    </div>
                                                </button>
                                            ))}
                                            <button
                                                onClick={handleSearchSubmit}
                                                className="w-full p-2.5 text-center text-xs text-[var(--primary-blue)] font-bold hover:bg-gray-50 border-t border-gray-100"
                                            >
                                                ดูผลการค้นหาทั้งหมด ({products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length})
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">
                                            <Search className="w-6 h-6 mx-auto mb-2 opacity-20" />
                                            <p className="text-xs">ไม่พบสินค้าที่คุณค้นหา</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center space-x-4 md:space-x-8">
                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                            className="md:hidden text-gray-600 hover:text-[var(--primary-orange)] transition-colors flex flex-col items-center group"
                        >
                            <Search className="h-6 w-6 group-hover:scale-110 transition-transform" />
                            <span className="text-xs mt-1.5 font-medium">ค้นหา</span>
                        </button>

                        <Link href="/products" className="hidden md:flex text-gray-600 hover:text-[var(--primary-orange)] transition-colors relative flex-col items-center group">
                            <Store className="h-6 w-6 group-hover:scale-110 transition-transform" />
                            <span className="text-xs mt-1.5 font-medium">สินค้าทั้งหมด</span>
                        </Link>



                        <Link href="/cart" className="hidden md:flex text-gray-600 hover:text-[var(--primary-orange)] transition-colors relative flex-col items-center group">
                            <div className="relative">
                                <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-[var(--primary-orange)] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">{cartCount}</span>
                                )}
                            </div>
                            <span className="text-xs mt-1.5 font-medium">รถเข็น</span>
                        </Link>

                        {user ? (
                            <div className="relative group flex flex-col items-center cursor-pointer hidden md:flex">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex flex-col items-center text-[var(--primary-orange)] focus:outline-none"
                                >
                                    <User className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs mt-1.5 font-bold max-w-[100px] truncate">{displayName}</span>
                                </button>

                                {/* Overlay to close when clicking outside */}
                                {isUserMenuOpen && (
                                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                                )}

                                {isUserMenuOpen && (
                                    <div className="absolute top-10 right-0 pt-2 w-56 z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="bg-white shadow-xl rounded-lg py-1 border border-gray-100 relative">
                                            <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100"></div>
                                            <div className="px-5 py-3 text-sm text-gray-700 border-b border-gray-100 mb-1 relative z-10 bg-white rounded-t-lg">
                                                สวัสดี, <b>{displayName}</b>
                                                <div className="flex items-center gap-1.5 mt-2 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-xs font-bold w-fit border border-indigo-100">
                                                    <TechcoinIcon size={16} />
                                                    <span className="mt-0.5">{techcoinBalance?.toLocaleString() || 0} Coins</span>
                                                </div>
                                            </div>
                                            <Link
                                                href="/dashboard/customer"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[var(--primary-orange)] relative z-10"
                                            >
                                                บัญชีของฉัน
                                            </Link>
                                            <Link
                                                href="/dashboard/customer?tab=techcoin"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[var(--primary-orange)] relative z-10"
                                            >
                                                ประวัติการใช้ Techcoin
                                            </Link>
                                            {isAdmin && (
                                                <Link
                                                    href="/dashboard/admin"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="block px-5 py-2.5 text-sm text-[var(--primary-orange)] hover:bg-orange-50 font-bold transition-colors relative z-10"
                                                >
                                                    จัดการระบบหลังบ้าน
                                                </Link>
                                            )}
                                            <Link
                                                href="/dashboard/customer?tab=orders"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[var(--primary-orange)] relative z-10"
                                            >
                                                ประวัติการสั่งซื้อ
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setIsUserMenuOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full text-left px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 relative z-10 rounded-b-lg"
                                            >
                                                <LogOut className="w-4 h-4" /> ออกจากระบบ
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="hidden md:flex flex-col items-center text-gray-600 hover:text-[var(--primary-orange)] transition-colors group">
                                <User className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                <span className="text-xs mt-1.5 font-medium">เข้าสู่ระบบ</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            {/* Mobile Search Overlay */}
            {
                isMobileSearchOpen && (
                    <div className="md:hidden bg-white border-b border-gray-100 p-4 animate-in slide-in-from-top-2 absolute top-full left-0 w-full z-40 shadow-lg">
                        <form onSubmit={(e) => { handleSearchSubmit(e); setIsMobileSearchOpen(false); }} className="relative flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="ค้นหาสินค้า..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:bg-white transition-all text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMobileSearchOpen(false)}
                                className="bg-gray-100 text-gray-500 p-3 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                )
            }
        </nav >
    );
}
