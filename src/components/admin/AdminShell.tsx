"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  LogOut,
  PlusCircle,
  Shield,
  Sun,
  Moon,
} from "lucide-react";
import { isLoggedIn, logout } from "@/lib/admin-auth";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects/new", label: "New Project", icon: PlusCircle },
  { href: "/admin/dashboard?tab=page", label: "Page Details", icon: FolderOpen },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoggedIn()) router.replace("/admin");
  }, [router]);

  function handleLogout() {
    logout();
    router.replace("/admin");
  }

  function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme");
    html.setAttribute("data-theme", current === "dark" ? "light" : "dark");
  }

  return (
    <div className="admin-shell flex min-h-screen" data-admin>
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--line)] bg-[var(--surface)]">
        {/* Brand */}
        <div className="flex h-20 shrink-0 items-center gap-3 border-b border-[var(--line)] px-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg">
            <Shield size={18} />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">Admin</p>
            <p className="text-sm font-black text-[var(--foreground)]">Control Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href.startsWith("/admin/projects/new")
              ? pathname === "/admin/projects/new"
              : pathname.startsWith(href.split("?")[0]) && href.split("?")[0] !== "/admin/projects/new";
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black transition-all ${
                  active
                    ? "bg-[var(--primary)] text-white shadow-md"
                    : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-[var(--line)] p-4 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] transition-all"
          >
            <FolderOpen size={17} />
            View Live Site
          </Link>
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-black text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] transition-all"
          >
            <Sun size={17} className="dark-hidden" />
            <Moon size={17} className="light-hidden" />
            Toggle Theme
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-black text-[var(--danger)] hover:bg-red-500/10 transition-all"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen bg-[var(--background)]">
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
