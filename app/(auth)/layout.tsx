import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Coffee, Sparkles, ShieldCheck, Star, Users, MapPin } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#101010] via-[#141414] to-[#101010] relative overflow-hidden">
      {/* Inline styles for steam animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes auth-steam-rise {
          0% { transform: translateY(0px) scale(0.9); opacity: 0; }
          40% { opacity: 0.8; }
          80% { transform: translateY(-8px) scale(1.08); opacity: 0.35; }
          100% { transform: translateY(-14px) scale(1.2); opacity: 0; }
        }
        .auth-steam-1 { animation: auth-steam-rise 2.6s ease-in-out infinite; }
        .auth-steam-2 { animation: auth-steam-rise 2.6s ease-in-out 0.85s infinite; }
        .auth-steam-3 { animation: auth-steam-rise 2.6s ease-in-out 1.7s infinite; }
      `}} />

      {/* Atmospheric Ambient Background Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-gold/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-gold/8 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      {/* Subtle radial pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(212,160,87,0.06),transparent_70%)] pointer-events-none" />

      {/* Central Card Wrapper with Warm Ambient Glow */}
      <div className="relative w-full max-w-4xl">
        {/* Soft Warm Glow Behind Card */}
        <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-amber-gold/20 via-amber-gold/10 to-amber-gold/20 rounded-[2.5rem] blur-2xl opacity-75 -z-10 pointer-events-none" />

        {/* Main Auth Card Container */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl shadow-black/60 border border-[#2A2A2A]/80 bg-[#101010] gap-0">
          
          {/* Mobile Header Branding (Visible only on mobile) */}
          <div className="md:hidden p-5 bg-gradient-to-b from-[#141414] to-[#101010] border-b border-[#2A2A2A]/80 text-white flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-gold/15 border border-amber-gold/30 flex items-center justify-center shadow-md overflow-hidden shrink-0">
                <Image
                  src="/logo.svg"
                  alt="PhinFind"
                  width={40}
                  height={40}
                  className="w-7.5 h-7.5 object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="font-sans font-bold text-lg leading-none text-white">PhinFind</h1>
                <p className="text-[10px] text-amber-gold font-semibold tracking-wider uppercase mt-0.5">
                  Cà phê Việt PWA
                </p>
              </div>
            </Link>
            <span className="text-[10px] font-semibold text-amber-gold bg-amber-gold/10 border border-amber-gold/25 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles size={11} /> Hộ chiếu Cà phê
            </span>
          </div>

          {/* Left Coffee Branding Hero Panel (Desktop) */}
          <div className="hidden md:flex flex-col justify-between p-8 lg:p-10 bg-gradient-to-b from-[#141414] to-[#101010] text-white relative overflow-hidden border-r border-[#2A2A2A]/80">
            {/* Subtle decorative amber warmth overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-gold/5 via-transparent to-amber-gold/5 pointer-events-none" />

            {/* Decorative Background Drip Line Watermark */}
            <svg
              className="absolute -right-12 -bottom-12 w-64 h-64 text-amber-gold/[0.04] pointer-events-none select-none"
              viewBox="0 0 200 200"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
              <circle cx="100" cy="100" r="55" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="6 6" opacity="0.3" />
              <path d="M100 30 C 95 60, 80 80, 80 110 A 20 20 0 0 0 120 110 C 120 80, 105 60, 100 30 Z" fill="currentColor" opacity="0.5" />
            </svg>

            {/* Top Branding Section */}
            <div className="relative z-10 space-y-6">
              <Link href="/" className="inline-flex items-center gap-3.5 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-gold/20 to-amber-gold/5 backdrop-blur-md border border-amber-gold/35 flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:border-amber-gold/60 transition-all duration-300 overflow-hidden shrink-0">
                  <Image
                    src="/logo.svg"
                    alt="PhinFind"
                    width={48}
                    height={48}
                    className="w-9 h-9 object-contain"
                    priority
                  />
                </div>
                <div>
                  <h1 className="font-sans font-bold text-2xl lg:text-3xl leading-none text-white tracking-tight group-hover:text-amber-gold transition-colors">
                    PhinFind
                  </h1>
                  <p className="text-[11px] text-amber-gold font-semibold tracking-widest uppercase mt-1">
                    Cà phê Việt PWA
                  </p>
                </div>
              </Link>

              <div className="pt-4 space-y-3">
                <span className="inline-flex items-center text-xs font-semibold text-amber-gold bg-amber-gold/10 px-3 py-1 rounded-full border border-amber-gold/30 backdrop-blur-sm shadow-sm gap-1.5">
                  <Sparkles size={13} className="text-amber-gold" /> Tham gia Cộng đồng
                </span>
                <h2 className="font-sans font-bold text-2xl lg:text-3xl leading-tight tracking-tight text-white">
                  Khám phá những quán cà phê tuyệt vời nhất ở mọi nơi bạn đến.
                </h2>
                <p className="text-sm text-[#D0D0D0]/80 leading-relaxed font-body">
                  Lưu lại các quán yêu thích, khám phá bản đồ tương tác và nhận chỉ đường nhanh chóng đến những quán cà phê độc đáo.
                </p>
              </div>

              {/* Floating Coffee Cup Illustration with Animated Steam */}
              <div className="pt-2 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-amber-gold/30 flex items-center justify-center shadow-md backdrop-blur-md shrink-0">
                  {/* Rising Steam Wisps */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
                    <span className="auth-steam-1 w-1 h-3 rounded-full bg-gradient-to-t from-amber-gold/70 to-transparent block" />
                    <span className="auth-steam-2 w-1 h-4 rounded-full bg-gradient-to-t from-amber-gold/80 to-transparent block" />
                    <span className="auth-steam-3 w-1 h-3 rounded-full bg-gradient-to-t from-amber-gold/70 to-transparent block" />
                  </div>
                  <Coffee className="w-8 h-8 text-amber-gold animate-float" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-gold text-amber-gold" />
                    ))}
                    <span className="text-xs font-bold text-white ml-1.5">4.9 / 5</span>
                  </div>
                  <p className="text-xs text-[#D0D0D0]/75">
                    Hơn 500+ quán cà phê được chọn lọc kỹ lưỡng
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Trust Badge Section */}
            <div className="relative z-10 pt-6 border-t border-[#2A2A2A]/80 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-gold/10 border border-amber-gold/20 flex items-center justify-center text-amber-gold shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-xs text-[#D0D0D0]/85 leading-snug">
                  Được tin dùng bởi những người yêu cà phê và những người khám phá phố thị.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-medium text-amber-gold/90 bg-amber-gold/10 border border-amber-gold/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Users size={11} /> Cộng đồng năng động
                </span>
                <span className="text-[11px] font-medium text-amber-gold/90 bg-amber-gold/10 border border-amber-gold/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <MapPin size={11} /> Chỉ đường trực tiếp
                </span>
              </div>
            </div>
          </div>

          {/* Right Form Card Panel */}
          <div className="bg-[#101010]/95 backdrop-blur-md p-6 sm:p-8 lg:p-10 flex flex-col justify-center relative text-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
