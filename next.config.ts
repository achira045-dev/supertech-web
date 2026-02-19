/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // คำสั่งนี้จะทำให้ build ผ่านแม้จะมี error ของ eslint
    ignoreDuringBuilds: true,
  },
}

export default nextConfig