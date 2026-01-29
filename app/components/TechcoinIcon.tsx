import React from 'react';

interface TechcoinIconProps {
    className?: string;
    size?: number;
}

export default function TechcoinIcon({ className = "", size = 24 }: TechcoinIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="coinGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FCD34D" /> {/* amber-300 */}
                    <stop offset="50%" stopColor="#F59E0B" /> {/* amber-500 */}
                    <stop offset="100%" stopColor="#D97706" /> {/* amber-600 */}
                </linearGradient>
                <linearGradient id="techGradient" x1="8" y1="8" x2="16" y2="16" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4F46E5" /> {/* indigo-600 */}
                    <stop offset="100%" stopColor="#312E81" /> {/* indigo-900 */}
                </linearGradient>
            </defs>

            {/* Outer Coin Circle */}
            <circle cx="12" cy="12" r="10" fill="url(#coinGradient)" stroke="#B45309" strokeWidth="1.5" />

            {/* Inner Ring (Tech Circuit Style) */}
            <path
                d="M12 4.5A7.5 7.5 0 1 1 4.5 12"
                stroke="white"
                strokeWidth="0.5"
                strokeOpacity="0.5"
                strokeDasharray="2 2"
            />

            {/* The 'T' Logo */}
            <path
                d="M8 8H16M12 8V16"
                stroke="url(#techGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Circuit Nodes */}
            <circle cx="12" cy="16" r="1" fill="#4F46E5" />
            <circle cx="8" cy="8" r="1" fill="#4F46E5" />
            <circle cx="16" cy="8" r="1" fill="#4F46E5" />

            {/* Shine Effect */}
            <ellipse cx="8" cy="6" rx="2" ry="1" fill="white" fillOpacity="0.4" transform="rotate(-45 8 6)" />
        </svg>
    );
}
