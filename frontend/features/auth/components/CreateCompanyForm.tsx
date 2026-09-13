"use client";

import { IconBuildingStore, IconUser, IconMail, IconPhone } from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 30) || "my-company";
}

interface Props {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  onBack: () => void;
  onSubmit: (data: { companyName: string; slug: string }) => void;
}

export default function CreateCompanyForm({ initialName, initialEmail, initialPhone, onBack, onSubmit }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const companyName = String(fd.get("companyName") ?? "").trim();
    if (!companyName) return;
    onSubmit({ companyName, slug: slugify(companyName) });
  };

  return (
    <div>
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        ← Quay lại chỉnh thông tin
      </button>
      <div className="flex items-center gap-3 mb-5">
        <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center"><IconBuildingStore size={20} /></span>
        <div>
          <h3 className="font-semibold text-gray-800">Tạo doanh nghiệp mới</h3>
          <p className="text-xs text-gray-500">Thông tin tài khoản đã được điền sẵn — chỉ cần nhập tên công ty</p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <Field label="Họ và tên">
          <div className="relative">
            <IconUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input value={initialName} readOnly className="pl-9 bg-gray-50 text-gray-600" />
          </div>
        </Field>
        <Field label="Email">
          <div className="relative">
            <IconMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input value={initialEmail} readOnly className="pl-9 bg-gray-50 text-gray-600" />
          </div>
        </Field>
        <Field label="Số điện thoại">
          <div className="relative">
            <IconPhone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input value={initialPhone} readOnly className="pl-9 bg-gray-50 text-gray-600" />
          </div>
        </Field>
        <Field label="Tên công ty" required hint="VD: Công ty TNHH ABC">
          <div className="relative">
            <IconBuildingStore size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input name="companyName" placeholder="Công ty TNHH ABC" className="pl-9" required autoFocus />
          </div>
        </Field>
        <div className="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500 mb-5">
          Bạn sẽ trở thành <b className="text-gray-700">Quản trị viên</b> của doanh nghiệp và có thể mời nhân sự sau khi tạo.
        </div>
        <Button type="submit" block size="lg">Tạo doanh nghiệp</Button>
      </form>
    </div>
  );
}
