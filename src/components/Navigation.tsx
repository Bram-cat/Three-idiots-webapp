"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useCurrentUser } from "@/context/UserContext";
import { Home, Receipt, WashingMachine, Car, MessageCircle } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/washing", label: "Laundry", icon: WashingMachine },
  { href: "/parking", label: "Parking", icon: Car },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

export default function Navigation() {
  const pathname = usePathname();
  const { userName, userImage } = useCurrentUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 hidden md:block ${
          scrolled
            ? "bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-cyan-500/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold text-white">
              Three Idiots
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "text-cyan-400 bg-cyan-500/10"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User info */}
            <div className="flex items-center gap-3">
              {userName && (
                <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-full">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-cyan-500/50">
                    <Image
                      src={userImage}
                      alt={userName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-white">{userName}</span>
                </div>
              )}
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/80 backdrop-blur-xl border-t border-white/10">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "text-cyan-400"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
