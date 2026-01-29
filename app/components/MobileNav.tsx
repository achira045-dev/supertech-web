'use client';
import Link from 'next/link';
import { Home, Grid, ShoppingCart, User, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function MobileNav() {
    const pathname = usePathname();
    const { cartCount } = useCart();
    const { user } = useAuth();

    const navItems = [
        { href: '/', label: 'หน้าหลัก', icon: Home },
        { href: '/products', label: 'สินค้า', icon: Grid },
        // Search could be a modal or just link to products page with auto focus, but let's keep it simple
        // { href: '/search', label: 'ค้นหา', icon: Search }, 
        { href: '/cart', label: 'รถเข็น', icon: ShoppingCart, badge: cartCount },
        { href: user ? '/dashboard/customer' : '/login', label: user ? 'บัญชี' : 'เข้าสู่ระบบ', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 md:hidden pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-[var(--primary-blue)]' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <div className="relative">
                                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                                {item.badge ? (
                                    <span className="absolute -top-1.5 -right-1.5 bg-[var(--primary-orange)] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                                        {item.badge}
                                    </span>
                                ) : null}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
