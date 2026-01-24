import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

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

          <p className="text-base text-gray-300 mb-12 max-w-lg">
            AI-powered marketing plan generator helping businesses create comprehensive marketing strategies in minutes.
          </p>

          {/* Copyright */}
          <p className="text-sm text-gray-400">
            &copy; {currentYear} BeamX Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
