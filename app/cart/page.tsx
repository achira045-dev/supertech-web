'use client';

import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { cart, removeFromCart } = useCart();
    const router = useRouter();

    // Calculate subtotal
    // Assuming price is a string like "3,890" or "฿3,890", we need to parse it.
    // Helper to get numeric price
    const getPriceNumber = (price: string | number | undefined) => {
        if (!price) return 0;
        if (typeof price === 'number') return price;
        return parseFloat(price.toString().replace(/[^0-9.]/g, '')) || 0;
    };

    // Calculate totals - Simple Subtotal for Cart Page (No Discounts/Shipping yet)
    const subtotal = cart.reduce((acc, item) => {
        const price = getPriceNumber(item.price);
        return acc + (price * item.quantity);
    }, 0);

    const handleCheckout = () => {
        router.push('/checkout');
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-[var(--primary-orange)]" />
                    ตะกร้าสินค้าของฉัน
                </h1>

                {cart.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="flex justify-center mb-4">
                            <ShoppingBag className="w-24 h-24 text-gray-200" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">ตะกร้าของคุณยังว่างอยู่</h2>
                        <p className="text-gray-500 mb-8">เลือกซื้อสินค้าสุดพิเศษจาก SuperTech ได้เลย</p>
                        <Link href="/" className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[var(--primary-orange)] hover:bg-orange-600 transition-colors">
                            กลับไปเลือกซื้อสินค้า
                        </Link>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                        {/* Cart Items List */}
                        <section className="lg:col-span-8">
                            <ul className="bg-white rounded-xl shadow-sm divide-y divide-gray-100 overflow-hidden">
                                {cart.map((item) => {
                                    const isFlashSale = !!item.discount;
                                    const itemPrice = getPriceNumber(item.price);

                                    return (
                                        <li key={item.id} className="p-6 flex items-center hover:bg-gray-50 transition-colors">
                                            {/* Product Image */}
                                            <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-center object-contain bg-white"
                                                />
                                            </div>

                                            {/* Product Details */}
                                            <div className="ml-6 flex-1 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            <Link href={`/product/${item.id}`} className="hover:text-[var(--primary-orange)] transition-colors">{item.name}</Link>
                                                        </h3>
                                                        {isFlashSale && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-red-500 text-white shadow-sm">
                                                                Flash Sale
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.name} - สินค้าคุณภาพจาก SuperTech</p>
                                                    <div className="mt-2 text-sm text-gray-900 font-medium">
                                                        จำนวน: {item.quantity}
                                                    </div>
                                                </div>

                                                {/* Price & Actions */}
                                                <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-end gap-4">
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-[var(--primary-orange)]">฿{itemPrice.toLocaleString()}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="flex items-center text-sm font-medium text-red-500 hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1.5" />
                                                        ลบ
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </section>

                        {/* Order Summary */}
                        <section className="lg:col-span-4 mt-8 lg:mt-0">
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                                <h2 className="text-lg font-medium text-gray-900 mb-6 border-b pb-4">สรุปคำสั่งซื้อ</h2>

                                <dl className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-gray-600">ยอดรวมสินค้า</dt>
                                        <dd className="font-medium text-gray-900">฿{subtotal.toLocaleString()}</dd>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-4">
                                        <dt className="text-xl font-bold text-gray-900">ยอดรวมโดยประมาณ</dt>
                                        <dd className="text-2xl font-bold text-[var(--primary-orange)]">฿{subtotal.toLocaleString()}</dd>
                                    </div>
                                    <p className="text-xs text-gray-500 text-right mt-1">*ค่าจัดส่งและส่วนลดจะคำนวณในขั้นตอนถัดไป</p>
                                </dl>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full mt-8 bg-[var(--primary-orange)] hover:bg-orange-600 text-white text-lg font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    สั่งซื้อสินค้า
                                </button>
                                <p className="mt-4 text-xs text-center text-gray-500 flex items-center justify-center gap-1">
                                    🔒 ปลอดภัยด้วยระบบชำระเงินมาตรฐานสากล
                                </p>
                            </div>
                        </section>
                        {cart.length > 0 && (
                            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden z-50 pb-safe">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-gray-600 font-medium">ยอดรวมสุทธิ</span>
                                    <span className="text-xl font-bold text-[var(--primary-orange)]">฿{subtotal.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-[var(--primary-orange)] text-white font-bold py-3 rounded-lg shadow-lg"
                                >
                                    สั่งซื้อสินค้า ({cart.length})
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
