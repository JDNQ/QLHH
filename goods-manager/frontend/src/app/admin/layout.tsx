"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { PageSpinner } from "@/components/ui/Spinner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin, isLoading, user, fetchMe } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && !user) {
      fetchMe();
      return;
    }

    if (!isLoading) {
      if (!isAuthenticated) router.push("/auth/login");
      else if (!isAdmin) router.push("/");
    }
  }, [fetchMe, isAuthenticated, isAdmin, isLoading, router, user]);

  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="h-14 bg-white border-b border-neutral-200" />
        <PageSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">
          <AdminSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
