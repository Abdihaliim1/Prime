import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prime Trucking LLC – Now Hiring CDL Drivers in Minnesota",
  description: "Prime Trucking LLC is hiring CDL-A and CDL-B drivers in Minneapolis, MN. Apply online today.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Nav */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Prime Trucking LLC</p>
            <p className="text-xs text-gray-400">USDOT #4341809</p>
          </div>
        </div>
        <Link
          href="/login"
          className="text-xs font-medium text-gray-400 hover:text-white px-4 py-2 border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
        >
          Admin Login
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          Now Hiring in Minnesota
        </div>

        <h1 className="text-5xl font-bold tracking-tight leading-tight max-w-2xl mb-6">
          Drive with<br />
          <span className="text-orange-500">Prime Trucking</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed">
          We are actively hiring CDL-A and CDL-B drivers in the Minneapolis–Saint Paul area.
          Competitive pay, consistent miles, and a team that has your back.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/apply"
            className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-base transition-colors"
          >
            Apply Now
          </Link>
          <a
            href="tel:+19522545503"
            className="px-8 py-3.5 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-medium rounded-xl text-base transition-colors"
          >
            Call (952) 254-5503
          </a>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          {[
            { icon: "📍", label: "Location", value: "Minneapolis, MN 55432" },
            { icon: "🪪", label: "Requirements", value: "CDL-A or CDL-B, valid medical cert" },
            { icon: "📞", label: "Questions?", value: "(952) 254-5503" },
          ].map((card) => (
            <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-left">
              <p className="text-xl mb-2">{card.icon}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
              <p className="text-sm text-gray-200 mt-1">{card.value}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-5 border-t border-gray-800 flex items-center justify-between text-xs text-gray-600">
        <p>© 2026 Prime Trucking LLC. All rights reserved.</p>
        <p>6530 University Ave NE, Minneapolis, MN 55432</p>
      </footer>
    </div>
  );
}
