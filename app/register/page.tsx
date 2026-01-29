'use client';
import Link from 'next/link';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            // Only allow numbers and max 10 digits
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length <= 10) {
                setFormData({ ...formData, [name]: numericValue });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.email.includes('@')) {
            alert('รูปแบบอีเมลไม่ถูกต้อง');
            return;
        }
        if (formData.password.length < 8) {
            alert('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
            return;
        }
        if (!/^\d{10}$/.test(formData.phone)) {
            alert('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: `${formData.firstName} ${formData.lastName}`,
                    phone: formData.phone
                }
            }
        });

        if (error) {
            alert('เกิดข้อผิดพลาด: ' + error.message);
        } else {
            alert('ลงทะเบียนสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน');
            router.push('/login');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg relative my-10">

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">สร้างบัญชีผู้ใช้ใหม่</h1>
                    <p className="text-gray-500 text-sm">ยินดีต้อนรับสู่ SuperTech</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 ml-1">ชื่อ</label>
                            <div className="relative">
                                <input
                                    name="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-[var(--primary-orange)] focus:ring-1 focus:ring-[var(--primary-orange)] transition-all text-gray-800"
                                    placeholder="ชื่อจริง"
                                />
                                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 ml-1">นามสกุล</label>
                            <div className="relative">
                                <input
                                    name="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-[var(--primary-orange)] focus:ring-1 focus:ring-[var(--primary-orange)] transition-all text-gray-800"
                                    placeholder="นามสกุล"
                                />
                                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600 ml-1">อีเมล</label>
                        <div className="relative">
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-[var(--primary-orange)] focus:ring-1 focus:ring-[var(--primary-orange)] transition-all text-gray-800"
                                placeholder="examle@supertech.com"
                            />
                            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600 ml-1">เบอร์โทรศัพท์ (10 หลัก)</label>
                        <div className="relative">
                            <input
                                name="phone"
                                type="tel"
                                required
                                maxLength={10}
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-[var(--primary-orange)] focus:ring-1 focus:ring-[var(--primary-orange)] transition-all text-gray-800"
                                placeholder="08xxxxxxxx"
                            />
                            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600 ml-1">รหัสผ่าน (ขั้นต่ำ 8 ตัวอักษร)</label>
                        <div className="relative">
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={8}
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-[var(--primary-orange)] focus:ring-1 focus:ring-[var(--primary-orange)] transition-all text-gray-800"
                                placeholder="••••••••"
                            />
                            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="flex items-start mb-4">
                            <div className="flex items-center h-5">
                                <input id="terms" type="checkbox" required className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-[var(--primary-orange)]" />
                            </div>
                            <label htmlFor="terms" className="ml-2 text-xs font-medium text-gray-500">ฉันยอมรับ <a href="#" className="text-[var(--primary-orange)] hover:underline">เงื่อนไขการให้บริการ</a> และ <a href="#" className="text-[var(--primary-orange)] hover:underline">นโยบายความเป็นส่วนตัว</a></label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[var(--primary-orange)] hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'กำลงประมวลผล...' : 'ลงทะเบียน'} {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    มีบัญชีอยู่แล้ว? <Link href="/login" className="text-[var(--primary-orange)] hover:underline font-bold">เข้าสู่ระบบ</Link>
                </div>
            </div>
        </div>
    );
}
