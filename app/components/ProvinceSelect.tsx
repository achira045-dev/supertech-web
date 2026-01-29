'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { provinces } from '../lib/provinces';

interface ProvinceSelectProps {
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    theme?: 'red' | 'orange';
}

export default function ProvinceSelect({ value, onChange, required, theme = 'red' }: ProvinceSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeBorderClass = theme === 'red' ? 'border-[var(--primary-red)] ring-1 ring-[var(--primary-red)]' : 'border-[var(--primary-orange)] ring-1 ring-[var(--primary-orange)]';
    const activeItemClass = theme === 'red' ? 'bg-red-50 text-[var(--primary-red)]' : 'bg-orange-50 text-[var(--primary-orange)]';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white border rounded-lg px-4 py-3 text-left flex justify-between items-center transition-all ${isOpen ? activeBorderClass : 'border-gray-200 hover:border-gray-300'
                    }`}
            >
                <span className={`font-medium truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                    {value || 'เลือกจังหวัด'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Hidden Input for Form Validation */}
            <input
                type="text"
                required={required}
                value={value}
                onChange={() => { }}
                className="absolute inset-0 opacity-0 pointer-events-none -z-10 h-full w-full"
                tabIndex={-1}
                onInvalid={(e) => {
                    e.preventDefault();
                    setIsOpen(true); // Open dropdown if validation fails
                }}
            />

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1">
                        {provinces.map((province) => (
                            <button
                                key={province}
                                type="button"
                                onClick={() => {
                                    onChange(province);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${value === province ? activeItemClass : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {province}
                                {value === province && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
