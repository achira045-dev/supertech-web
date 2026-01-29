'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Gift, ArrowUpRight, ArrowDownLeft, Clock, History } from 'lucide-react';
import Link from 'next/link';

interface TechcoinTransaction {
    id: number;
    amount: number;
    type: 'earn' | 'redeem' | 'expire';
    description: string;
    created_at: string;
}

export default function ProfilePage() {
    const { user, techcoinBalance } = useAuth();
    const [transactions, setTransactions] = useState<TechcoinTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchTransactions();
        }
    }, [user]);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            // Cast to any to bypass missing type definitions
            const { data, error } = await (supabase
                .from('techcoin_transactions' as any)
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false }) as any);

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">กรุณาเข้าสู่ระบบ</h1>
                    <Link href="/login" className="text-[var(--primary-blue)] hover:underline">ไปที่หน้าเข้าสู่ระบบ</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-8">
            <div className="container mx-auto px-4 max-w-4xl">

                <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                    <History className="w-8 h-8 text-[var(--primary-orange)]" />
                    บัญชีของฉัน
                </h1>

                {/* Balance Card */}
                <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Gift className="w-48 h-48" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-lg font-medium text-indigo-200 mb-2">Techcoin Balance</h2>
                        <div className="text-5xl font-bold mb-4 flex items-baseline gap-2">
                            {techcoinBalance.toLocaleString()}
                            <span className="text-xl font-medium text-indigo-200">เหรียญ</span>
                        </div>
                        <div className="flex gap-4">
                            <div className="px-4 py-2 bg-white/10 rounded-lg text-sm backdrop-blur-sm border border-white/20">
                                🪙 1 Coin ≈ 1 THB
                            </div>
                            <div className="px-4 py-2 bg-white/10 rounded-lg text-sm backdrop-blur-sm border border-white/20">
                                📅 หมดอายุใน 30-60 วัน
                            </div>
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

                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
                    ) : transactions.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                            <History className="w-12 h-12 mb-4 opacity-20" />
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
        </div>
    );
}
