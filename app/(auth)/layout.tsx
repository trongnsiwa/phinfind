import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-phin-50 to-phin-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-2xl shadow-md group-hover:bg-primary-hover transition-colors">
              ☕
            </span>
            <div className="text-left">
              <h1 className="font-display font-bold text-2xl text-phin-900 leading-tight">
                PhinFind
              </h1>
              <p className="text-xs text-phin-600 font-medium">Discover Vietnamese Coffee</p>
            </div>
          </Link>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-card border border-phin-200">
          {children}
        </div>
      </div>
    </div>
  );
}
