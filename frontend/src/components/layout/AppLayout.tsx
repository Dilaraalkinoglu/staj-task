"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}
