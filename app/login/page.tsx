'use client';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
        } else {
            router.push('/');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <div className="glass w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)]"></div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold italic mb-2">ยินดีต้อนรับกลับ</h1>
                    <p className="text-gray-400">เข้าสู่ระบบเพื่อจัดการบัญชีของคุณ</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300 ml-1">อีเมล</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-[var(--primary-orange)] focus:ring-1 focus:ring-[var(--primary-orange)] transition-all text-white"
                                placeholder="examle@supertech.com"
                                required
                            />
                            <Mail className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-300 ml-1">รหัสผ่าน</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-[var(--primary-orange)] focus:ring-1 focus:ring-[var(--primary-orange)] transition-all text-white"
                                placeholder="••••••••"
                                required
                            />
                            <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white">
                            <input type="checkbox" className="rounded bg-gray-800 border-gray-700 text-[var(--primary-orange)] focus:ring-[var(--primary-orange)]" />
                            จำฉันไว้ในระบบ
                        </label>
                        <a href="#" className="text-[var(--primary-orange)] hover:underline">ลืมรหัสผ่าน?</a>
                    </div>

                    <button type="submit" className="w-full bg-[var(--primary-orange)] hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:translate-y-[-2px] hover:shadow-lg">
                        เข้าสู่ระบบ <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-400">
                    ยังไม่มีบัญชีสมาชิก? <Link href="/register" className="text-[var(--primary-orange)] hover:underline font-medium">สมัครสมาชิกเลย</Link>
                </div>
            </div>
        </div>
    );
}
