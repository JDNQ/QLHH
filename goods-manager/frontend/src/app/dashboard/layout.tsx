"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { UserSidebar } from "@/components/layout/UserSidebar";
import { PageSpinner } from "@/components/ui/Spinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user, fetchMe } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const hasToken =
      typeof window !== "undefined" &&
      ((localStorage.getItem("token") ?? "") !== "" ||
        document.cookie.includes("accessToken="));

    // If we have a token but user isn't hydrated yet, verify first.
    if (!isLoading && hasToken && !user) {
      fetchMe();
      return;
    }

    if (!isLoading && isAuthenticated && !user) {
      // already logged-in but user not hydrated yet
      return;
    }

    // If user is authenticated, route them based on role.
    // (Your requirement: user login => go to main menu '/', not /dashboard)
    if (!isLoading && isAuthenticated && user && user.role !== "ADMIN") {
      router.replace("/");
      return;
    }

    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [fetchMe, isAuthenticated, isLoading, router, user]);

  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="h-14 bg-white border-b border-neutral-200" />
        <PageSpinner />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">
          <UserSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
