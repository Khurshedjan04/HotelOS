"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  title: string;
  navItems: NavItem[];
  allowedRoles: Role[];
  children: React.ReactNode;
}

export default function DashboardLayout({
  title,
  navItems,
  allowedRoles,
  children,
}: Props) {
  const { user, isLoading, clearUser } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !allowedRoles.includes(user.role))) {
      router.push("/login");
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading || !user) return null;

  const logout = () => {
    clearUser();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-navy-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-navy-800 border-r border-navy-700 flex flex-col">
        <div className="px-5 py-4 border-b border-navy-700">
          <Link href="/" className="text-gold-500 font-bold text-lg tracking-tight">
            Hotel<span className="text-white">OS</span>
          </Link>
          <p className="text-xs text-slate-500 mt-0.5">{title}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                    : "text-slate-400 hover:text-white hover:bg-navy-700"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy-700">
          <div className="text-xs text-slate-500 mb-1 truncate">{user.email}</div>
          <div className="text-xs text-gold-500 mb-3">{user.role}</div>
          <button
            onClick={logout}
            className="w-full text-left text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
