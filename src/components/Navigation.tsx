"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useCurrentUser } from "@/context/UserContext";

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/expenses", label: "Expenses", icon: "💰" },
  { href: "/washing", label: "Washing", icon: "🧺" },
  { href: "/parking", label: "Parking", icon: "🚗" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { userName, userColor } = useCurrentUser();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#007ea7]/20 md:top-0 md:bottom-auto md:border-b md:border-t-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex justify-around md:justify-start md:gap-8 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col md:flex-row items-center gap-1 py-3 px-2 md:px-4 text-sm transition-colors ${
                    isActive
                      ? "text-[#00a7e1] font-semibold"
                      : "text-[#003459] hover:text-[#00a7e1]"
                  }`}
                >
                  <span className="text-xl md:text-base">{item.icon}</span>
                  <span className="text-xs md:text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User info */}
          <div className="hidden md:flex items-center gap-3">
            {userName && (
              <span className={`${userColor} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                {userName}
              </span>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
}
