"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconUserCog,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
} from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Field, Input, Checkbox } from "@/components/ui/Form";

export default function HRLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/portal/tenant-admin/my-company/hn-1/management/hr/employees");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <span className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center">
              <IconUserCog size={24} />
            </span>
            <span className="text-xl font-bold text-gray-800">HR System</span>
          </div>
          <h1 className="text-2xl font-semibold mb-1">Đăng nhập</h1>
          <p className="text-gray-500 text-sm">Hệ thống quản lý Nhân sự chung</p>
        </div>


        <div className="bg-white rounded-xl border border-gray-300 shadow-card p-6">
          <form onSubmit={handleLogin}>
            <Field label="Email" required>
              <div className="relative">
                <IconMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input type="text" placeholder="hr@company.com" className="pl-9" defaultValue="hr@company.com" required />
              </div>
            </Field>
            <Field label="Mật khẩu" required>
              <div className="relative">
                <IconLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  defaultValue="abc123"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label="Hiện/ẩn mật khẩu"
                >
                  {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </Field>
            <div className="flex items-center justify-between mb-5">
              <Checkbox label="Ghi nhớ đăng nhập" defaultChecked />
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>
            <Button type="submit" block size="lg">
              Đăng nhập
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            Chưa có tài khoản? <a href="/portal/register" className="text-primary hover:underline font-semibold">Đăng ký ngay</a>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 HR System — Hệ thống quản lý Nhân sự chung
        </p>
      </div>

      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Quên mật khẩu"
        size="sm"
        footer={
          <>
            <Button variant="white" onClick={() => setForgotOpen(false)}>Hủy</Button>
            <Button onClick={() => setForgotOpen(false)}>Gửi liên kết đặt lại mật khẩu</Button>
          </>
        }
      >
        <Field label="Email" required>
          <Input type="email" placeholder="hr@company.com" />
        </Field>
      </Modal>
    </main>
  );
}
