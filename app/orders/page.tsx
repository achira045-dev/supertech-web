'use client';

import { Package, Clock, CheckCircle, Truck, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
    // Mock Data for Orders
    const orders = [
        {
            id: 'ORD-2569-001',
            date: '25 ม.ค. 2569',
            total: '89,900',
            status: 'pending', // pending, shipping, completed, cancelled
            items: [
                { name: 'Sony A7 IV', image: 'https://placehold.co/100x100?text=Camera', quantity: 1 }
            ]
        },
        {
            id: 'ORD-2568-884',
            date: '12 ธ.ค. 2568',
            total: '45,900',
            status: 'shipping',
            items: [
                { name: 'LG OLED TV 55"', image: 'https://placehold.co/100x100?text=TV', quantity: 1 },
                { name: 'HDMI Cable', image: 'https://placehold.co/100x100?text=Cable', quantity: 2 }
            ]
        },
        {
            id: 'ORD-2568-102',
            date: '10 พ.ย. 2568',
            total: '3,890',
            status: 'completed',
            items: [
                { name: 'Keychron K2 Pro', image: 'https://placehold.co/100x100?text=Keyboard', quantity: 1 }
            ]
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" /> รอชำระเงิน / ตรวจสอบ
                    </span>
                );
            case 'shipping':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Truck className="w-3 h-3 mr-1" /> กำลังจัดส่ง
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> สำเร็จ
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ยกเลิก
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <Package className="w-8 h-8 text-[var(--primary-orange)]" />
                    ประวัติการสั่งซื้อ
                </h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="flex justify-center mb-4">
                            <Package className="w-24 h-24 text-gray-200" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">ไม่มีประวัติการสั่งซื้อ</h2>
                        <p className="text-gray-500 mb-8">คุณยังไม่เคยทำการสั่งซื้อสินค้ากับเรา</p>
                        <Link href="/" className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[var(--primary-orange)] hover:bg-orange-600 transition-colors">
                            เลือกซื้อสินค้า
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase tracking-wider block">หมายเลขคำสั่งซื้อ</span>
                                            <span className="text-sm font-bold text-gray-900">{order.id}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase tracking-wider block">วันที่สั่งซื้อ</span>
                                            <span className="text-sm text-gray-700">{order.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider block">ยอดสุทธิ</span>
                                            <span className="text-lg font-bold text-[var(--primary-orange)]">฿{order.total}</span>
                                        </div>
                                        <div>{getStatusBadge(order.status)}</div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    <h4 className="sr-only">Items</h4>
                                    <ul className="divide-y divide-gray-100">
                                        {order.items.map((item, idx) => (
                                            <li key={idx} className="flex items-center py-4 first:pt-0 last:pb-0">
                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover object-center bg-gray-100"
                                                    />
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                                                    <p className="mt-1 text-sm text-gray-500">x{item.quantity}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Order Footer Actions */}
                                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
                                    <button className="text-sm font-medium text-[var(--primary-orange)] hover:text-orange-700 flex items-center transition-colors">
                                        ดูรายละเอียดคำสั่งซื้อ <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
