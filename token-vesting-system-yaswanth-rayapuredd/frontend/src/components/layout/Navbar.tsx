import { Link, NavLink, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAdminCheck } from '../../hooks/useAdminCheck';
import { useAccount } from 'wagmi';

const navLinks = [
  { to: '/',            label: 'Dashboard' },
  { to: '/create',      label: 'Create Vesting' },
  { to: '/my-vestings', label: 'My Vestings' },
];

/**
 * Top navigation bar with logo, nav links, admin link (owner only), and wallet connect button.
 */
export default function Navbar() {
  const { isConnected } = useAccount();
  const { isOwner } = useAdminCheck();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-dark-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/ether-authority-logo.png" 
              alt="Ether Authority" 
              className="h-8 object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>

          {/* Nav Links – desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {isConnected && isOwner && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-accent-500/15 text-accent-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                Admin Panel
              </NavLink>
            )}
          </nav>

          {/* Connect Button */}
          <ConnectButton
            accountStatus="avatar"
            chainStatus="icon"
            showBalance={false}
          />
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/15 text-primary-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          {isConnected && isOwner && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive ? 'bg-accent-500/15 text-accent-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              Admin
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
