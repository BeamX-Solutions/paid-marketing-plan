'use client';

/**
 * Admin Layout
 *
 * Layout wrapper for all admin pages with:
 * - Top navigation bar with menu items
 * - Notification bell with real-time updates
 * - User profile dropdown
 * - Responsive design
 */

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import NotificationBell from '@/components/admin/NotificationBell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Check if on login page
  const isLoginPage = pathname === '/admin/login';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navLinkClasses = (path: string) => {
    const baseClasses = 'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer';
    const activeClasses = 'bg-[#1e3a5f] text-white';
    const inactiveClasses = 'text-gray-700 hover:text-[#1e3a5f] hover:bg-gray-100';

    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  // Don't show navbar on login page or when not authenticated
  const showNavbar = !isLoginPage && status === 'authenticated' && session?.user;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {showNavbar && (
      <nav className="bg-[#f0f4f8] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <Link href="/admin" className="flex items-center hover:opacity-80 transition-opacity duration-300">
                  <Image
                    src="/logo.png"
                    alt="BeamX Solutions"
                    width={140}
                    height={35}
                    className="h-9 w-auto"
                    priority
                  />
                </Link>
                <span className="text-sm font-medium text-gray-500 border-l border-gray-300 pl-4">Admin</span>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/admin" className={navLinkClasses('/admin')}>
                  Dashboard
                </Link>
                <Link href="/admin/users" className={navLinkClasses('/admin/users')}>
                  Users
                </Link>
                <Link href="/admin/security-dashboard" className={navLinkClasses('/admin/security-dashboard')}>
                  Security
                </Link>
                <Link href="/admin/audit-logs" className={navLinkClasses('/admin/audit-logs')}>
                  Audit Logs
                </Link>
                <Link href="/admin/settings" className={navLinkClasses('/admin/settings')}>
                  Settings
                </Link>
              </div>
            </div>

            {/* Right Side - Notifications & Profile */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-[#1e3a5f] text-sm font-medium transition-colors duration-300 cursor-pointer">
                View Site
              </Link>

              {/* Notification Bell */}
              <NotificationBell />

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-[#1e3a5f] p-2 rounded-lg hover:bg-white transition-all duration-300 cursor-pointer"
                >
                  <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <Link
                        href="/admin/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#1e3a5f] transition-colors duration-300 cursor-pointer"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Account Settings
                      </Link>
                      <Link
                        href="/admin/settings/security"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#1e3a5f] transition-colors duration-300 cursor-pointer"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Security Settings
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-300 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      )}

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
