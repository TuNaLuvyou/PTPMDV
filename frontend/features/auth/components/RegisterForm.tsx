"use client";

import { useState } from "react";
import { IconUser, IconMail, IconPhone, IconLock, IconEye, IconEyeOff } from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";

interface Props {
  onSuccess: (data: { name: string; email: string; phone: string }) => void;
}

export default function RegisterForm({ onSuccess }: Props) {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const pwd = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (pwd !== confirm) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    onSuccess({
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Field label="Họ và tên" required>
        <div className="relative">
          <IconUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input name="name" placeholder="Nguyễn Văn A" className="pl-9" required defaultValue="" />
        </div>
      </Field>
      <Field label="Email" required>
        <div className="relative">
          <IconMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input name="email" type="email" placeholder="you@company.com" className="pl-9" required />
        </div>
      </Field>
      <Field label="Số điện thoại" required>
        <div className="relative">
          <IconPhone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input name="phone" placeholder="0901 234 567" className="pl-9" required />
        </div>
      </Field>
      <Field label="Mật khẩu" required>
        <div className="relative">
          <IconLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input name="password" type={showPwd ? "text" : "password"} placeholder="••••••••" className="pl-9 pr-10" required />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
            {showPwd ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        </div>
      </Field>
      <Field label="Xác nhận mật khẩu" required>
        <div className="relative">
          <IconLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input name="confirm" type={showConfirm ? "text" : "password"} placeholder="••••••••" className="pl-9 pr-10" required />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
            {showConfirm ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        </div>
      </Field>
      <p className="text-xs text-gray-400 mb-5">Bằng việc đăng ký, bạn đồng ý với Điều khoản & Chính sách bảo mật.</p>
      <Button type="submit" block size="lg">Tạo tài khoản</Button>
    </form>
  );
}
