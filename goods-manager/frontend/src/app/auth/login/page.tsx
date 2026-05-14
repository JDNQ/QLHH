"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginInner() {
  const { login, fetchMe } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      // Ensure auth state + cookies are ready before next navigation
      await fetchMe();

      toast.success("Đăng nhập thành công!");
      window.location.href = redirect;
    } catch (err: any) {
      if (err?.errors) {
        Object.entries(err.errors).forEach(([field, messages]) => {
          setError(field as keyof LoginForm, {
            message: (messages as string[])[0],
          });
        });
      } else {
        toast.error(err?.message ?? "Email hoặc mật khẩu không đúng");
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-lg">
            M
          </div>
          <span className="text-xl font-bold text-neutral-900">
            MarketPlace
          </span>
        </Link>

        <div className="bg-white rounded-2xl p-8 shadow-card border border-neutral-100">
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">
            Đăng nhập
          </h1>
          <p className="text-sm text-neutral-500 mb-6">Chào mừng trở lại!</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Mật khẩu"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="cursor-pointer"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              error={errors.password?.message}
              {...register("password")}
            />
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              size="lg"
            >
              Đăng nhập
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Chưa có tài khoản?{" "}
            <Link
              href="/auth/register"
              className="text-primary font-semibold hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50" />}>
      <LoginInner />
    </Suspense>
  );
}
