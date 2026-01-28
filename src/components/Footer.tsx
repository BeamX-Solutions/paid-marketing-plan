import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Facebook, Instagram } from 'lucide-react';

// Custom X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'X', icon: XIcon, href: 'https://twitter.com/beamxsolutions' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/beamxsolutions' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/beamxsolutions' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/beamxsolutions' },
  ];

  return (
    <footer className="bg-[#0f1f2e] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center text-center">
          {/* Brand */}
          <Link href="/" className="inline-block mb-6 hover:opacity-80 transition-opacity duration-300 cursor-pointer">
            <Image
              src="/logo-white.png"
              alt="BeamX Solutions"
              width={180}
              height={45}
              className="h-12 w-auto"
            />
          </Link>

          <p className="text-base text-gray-300 mb-8 max-w-lg">
            AI-powered marketing plan generator helping businesses create comprehensive marketing strategies in minutes.
          </p>

          {/* Social Media Links */}
          <div className="flex items-center gap-4 mb-8">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-[#0F5AE0] transition-all duration-300 cursor-pointer"
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5 text-gray-300 hover:text-white" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-400">
            &copy; {currentYear} BeamX Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
