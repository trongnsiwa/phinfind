import Link from 'next/link';
import { Coffee, Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-phin-900 via-phin-800 to-phin-700">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-phin-600">
        {/* Left Coffee Branding Hero Panel (Visible on Desktop) */}
        <div className="hidden md:flex flex-col justify-between p-8 bg-gradient-to-b from-phin-900/90 to-phin-950 text-white relative overflow-hidden border-r border-phin-700/50">
          <div className="relative z-10 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <span className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-bold text-2xl shadow-md group-hover:scale-105 transition-transform">
                ☕
              </span>
              <div>
                <h1 className="font-sans font-bold text-2xl leading-none text-white">
                  PhinFind
                </h1>
                <p className="text-[10px] text-phin-300 font-semibold tracking-wider uppercase mt-0.5">
                  Vietnamese Coffee PWA
                </p>
              </div>
            </Link>

            <div className="pt-8 space-y-2">
              <span className="inline-flex items-center text-xs font-semibold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/30 backdrop-blur-sm">
                <Sparkles size={12} className="mr-1" /> Join the Community
              </span>
              <h2 className="font-sans font-bold text-2xl leading-tight">
                Discover the best coffee spots everywhere you go.
              </h2>
              <p className="text-xs text-phin-300 leading-relaxed font-body">
                Save your favorite cafés, explore interactive maps, and get instant directions to local hidden gems.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 pt-6 border-t border-phin-800">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl animate-float">
              ☕
            </div>
            <p className="text-[11px] text-phin-300">
              Trusted by coffee lovers, digital nomads, and urban explorers.
            </p>
          </div>
        </div>

        {/* Right Form Card Panel */}
        <div className="bg-white p-6 sm:p-8 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
