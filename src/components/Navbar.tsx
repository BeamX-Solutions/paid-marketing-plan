'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#f0f4f8] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity duration-300 cursor-pointer">
            <Image
              src="/logo.png"
              alt="BeamX Solutions"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/#features"
              className="text-sm font-medium text-gray-700 hover:text-[#0F5AE0] transition-colors duration-300 cursor-pointer"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-gray-700 hover:text-[#0F5AE0] transition-colors duration-300 cursor-pointer"
            >
              How It Works
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#0F5AE0] text-[#0F5AE0] hover:bg-white hover:scale-105 transition-all duration-300 cursor-pointer rounded-lg"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href="/questionnaire">
                  <Button
                    size="sm"
                    className="bg-[#0F5AE0] hover:bg-[#0C48B3] text-white hover:scale-105 transition-all duration-300 cursor-pointer rounded-lg"
                  >
                    Create Plan
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-[#0F5AE0] hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="bg-[#0F5AE0] hover:bg-[#0C48B3] text-white hover:scale-105 transition-all duration-300 cursor-pointer rounded-lg"
                  >
                    Get Started
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-[#0F5AE0] p-2 transition-colors duration-300 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-white rounded-b-lg shadow-lg">
            <div className="flex flex-col space-y-4">
              <Link
                href="/#features"
                className="text-sm font-medium text-gray-700 hover:text-[#0F5AE0] px-4 py-2 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-sm font-medium text-gray-700 hover:text-[#0F5AE0] px-4 py-2 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              {session && (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-[#0F5AE0] px-4 py-2 transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <div className="border-t border-gray-200 pt-4 px-4 space-y-3">
                {session ? (
                  <>
                    <Link href="/dashboard" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-[#0F5AE0] text-[#0F5AE0] rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/questionnaire" className="block">
                      <Button
                        className="w-full bg-[#0F5AE0] hover:bg-[#0C48B3] text-white rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Create Plan
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-[#0F5AE0] text-[#0F5AE0] rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" className="block">
                      <Button
                        className="w-full bg-[#0F5AE0] hover:bg-[#0C48B3] text-white rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
