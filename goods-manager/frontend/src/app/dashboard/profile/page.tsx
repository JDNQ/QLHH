'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Lock, Save, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getImageUrl } from '@/lib/utils';
import { uploadService } from '@/services/upload.service';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Mật khẩu xác nhận không khớp',
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [avatarUploading, setAvatarUploading] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '', address: user?.address ?? '' },
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadService.uploadAvatar(file);
      const res = await api.patch('/users/profile/update', { avatar: url });
      setUser(res.data.data);
      toast.success('Cập nhật ảnh đại diện thành công');
    } catch (err: any) {
      toast.error(err?.message ?? 'Upload thất bại');
    } finally {
      setAvatarUploading(false);
    }
  };

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      const res = await api.patch('/users/profile/update', data);
      setUser(res.data.data);
      toast.success('Cập nhật hồ sơ thành công');
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật thất bại');
    }
  };

  const onPasswordSubmit = async ({ confirmPassword, ...data }: PasswordForm) => {
    try {
      await api.patch('/users/profile/change-password', data);
      toast.success('Đổi mật khẩu thành công');
      passwordForm.reset();
    } catch (err: any) {
      toast.error(err?.message ?? 'Đổi mật khẩu thất bại');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Hồ sơ cá nhân</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-xl p-5 border border-neutral-100 shadow-card">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4">Ảnh đại diện</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-100 border-2 border-neutral-200">
              {user?.avatar ? (
                <img src={getImageUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-neutral-400">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors shadow-sm">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarUploading} />
            </label>
          </div>
          <div>
            <p className="font-semibold text-neutral-900">{user?.name}</p>
            <p className="text-sm text-neutral-400">{user?.email}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{avatarUploading ? 'Đang upload...' : 'Click vào icon camera để đổi ảnh'}</p>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-xl p-5 border border-neutral-100 shadow-card">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4 pb-3 border-b border-neutral-100">Thông tin cá nhân</h2>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <Input label="Họ và tên" error={profileForm.formState.errors.name?.message} required leftIcon={<User className="w-4 h-4" />} {...profileForm.register('name')} />
          <Input label="Số điện thoại" type="tel" {...profileForm.register('phone')} />
          <Input label="Địa chỉ" {...profileForm.register('address')} />
          <div className="flex justify-end">
            <Button type="submit" isLoading={profileForm.formState.isSubmitting} leftIcon={<Save className="w-4 h-4" />}>Lưu thay đổi</Button>
          </div>
        </form>
      </div>

      {/* Password form */}
      <div className="bg-white rounded-xl p-5 border border-neutral-100 shadow-card">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4 pb-3 border-b border-neutral-100">Đổi mật khẩu</h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <Input label="Mật khẩu hiện tại" type="password" leftIcon={<Lock className="w-4 h-4" />} error={passwordForm.formState.errors.currentPassword?.message} required {...passwordForm.register('currentPassword')} />
          <Input label="Mật khẩu mới" type="password" leftIcon={<Lock className="w-4 h-4" />} error={passwordForm.formState.errors.newPassword?.message} required {...passwordForm.register('newPassword')} />
          <Input label="Xác nhận mật khẩu mới" type="password" leftIcon={<Lock className="w-4 h-4" />} error={passwordForm.formState.errors.confirmPassword?.message} required {...passwordForm.register('confirmPassword')} />
          <div className="flex justify-end">
            <Button type="submit" isLoading={passwordForm.formState.isSubmitting} variant="secondary">Đổi mật khẩu</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
