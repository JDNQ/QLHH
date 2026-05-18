"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, Phone } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Tên tối thiểu 2 ký tự")
      .max(50, "Tên tối đa 50 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z
      .string()
      .min(6, "Mật khẩu tối thiểu 6 ký tự")
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
      ),
    confirmPassword: z.string(),
    phone: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async ({ confirmPassword, ...data }: RegisterForm) => {
    try {
      await registerUser(data);
      toast.success("Đăng ký thành công!");
      router.push("/dashboard");
    } catch (err: any) {
      if (err?.errors) {
        Object.entries(err.errors).forEach(([field, messages]) => {
          setError(field as keyof RegisterForm, {
            message: (messages as string[])[0],
          });
        });
      } else {
        toast.error(err?.message ?? "Đăng ký thất bại");
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
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
            Tạo tài khoản
          </h1>
          <p className="text-sm text-neutral-500 mb-6">
            Tham gia cộng đồng MarketPlace
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              required
              {...register("name")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              required
              {...register("email")}
            />
            <Input
              label="Số điện thoại"
              type="tel"
              placeholder="0901234567"
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Input
              label="Mật khẩu"
              type={showPw ? "text" : "password"}
              placeholder="Tối thiểu 6 ký tự"
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
              required
              {...register("password")}
            />
            <Input
              label="Xác nhận mật khẩu"
              type={showPw ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              required
              {...register("confirmPassword")}
            />
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              size="lg"
            >
              Đăng ký
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Đã có tài khoản?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-semibold hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
