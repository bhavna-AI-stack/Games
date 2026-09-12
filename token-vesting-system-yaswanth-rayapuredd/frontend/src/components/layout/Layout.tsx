import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * Shared layout wrapping all pages.
 * Renders the Navbar, decorative ambient orbs, and the page content via <Outlet />.
 */
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Decorative ambient glow orbs */}
      <div className="glow-orb w-96 h-96 bg-primary-600 top-0 -left-20" />
      <div className="glow-orb w-80 h-80 bg-accent-500 top-40 right-0" />
      <div className="glow-orb w-64 h-64 bg-primary-400 bottom-20 left-1/3" />

      <Navbar />

      {/* Page content */}
      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 text-center">
        <p className="text-gray-600 text-xs">
          VestChain — Token Vesting DApp &nbsp;·&nbsp; Built on{' '}
          <a
            href="https://explorer.securechain.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 hover:text-primary-400 transition-colors"
          >
            SCAI Mainnet
          </a>
          &nbsp;·&nbsp; B.Tech Final Year Project 2026
        </p>
      </footer>
    </div>
  );
}
