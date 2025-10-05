"use client"

import React, { useState } from "react";
import Link from "next/link";

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

      return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-bold">Simo&apos;s</h1>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-4 items-center">
            <Link href="/" className="hover:bg-gray-700 px-3 py-2 rounded">Home</Link>
            <Link href="/photo" className="hover:bg-gray-700 px-3 py-2 rounded">Photo</Link>
            <Link href="/close" className="hover:bg-gray-700 px-3 py-2 rounded">Close</Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
            >
              {isOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
          <Link href="/" className="block px-3 py-2 rounded hover:bg-gray-700">Home</Link>
          <Link href="/photo" className="block px-3 py-2 rounded hover:bg-gray-700">Photo</Link>
          <Link href="/close" className="block px-3 py-2 rounded hover:bg-gray-700">Close</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;