"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import {
  LayoutDashboard,
  Building2,
  Receipt,
  Upload,
  FilePlus,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Firmalar",
    href: "/companies",
    icon: Building2,
  },
  {
    label: "Finansal Kayıtlar",
    href: "/transactions",
    icon: Receipt,
  },
  {
    label: "Excel Yükle",
    href: null,
    icon: Upload,
    children: [
      { label: "Hesap Planı Yükle", href: "/upload/accounts" },
      { label: "Firma Yükle", href: "/upload/companies" },
      { label: "İşlem Yükle", href: "/upload/transactions" },
    ],
  },
  {
    label: "Manuel Giriş",
    href: null,
    icon: FilePlus,
    children: [
      { label: "Firma Ekle", href: "/add/company" },
      { label: "İşlem Ekle", href: "/add/transaction" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    removeToken();
    localStorage.clear();
    router.push("/login");
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">F</div>
        <span className="sidebar-logo-text">FinansApp</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          if (item.children) {
            const hasActive = item.children.some((c) => isActive(c.href));
            return (
              <div key={item.label} className="sidebar-group">
                <div className={`sidebar-group-label${hasActive ? " active" : ""}`}>
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </div>
                <div className="sidebar-sub">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`sidebar-sub-item${isActive(child.href) ? " active" : ""}`}
                    >
                      <ChevronRight size={14} />
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`sidebar-item${isActive(item.href!) ? " active" : ""}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={18} />
        <span>Çıkış Yap</span>
      </button>
    </aside>
  );
}
