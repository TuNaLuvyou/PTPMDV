"use client";

import { IconKey, IconArrowLeft, IconUserPlus } from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";

interface Props {
  onBack: () => void;
  onSubmit: (data: { inviteCode: string }) => void;
}

export default function JoinCompanyForm({ onBack, onSubmit }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const code = String(fd.get("code") ?? "").trim();
    if (!code) {
      alert("Vui lòng nhập mã mời!");
      return;
    }
    onSubmit({ inviteCode: code });
  };

  return (
    <div>
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        <IconArrowLeft size={16} /> Quay lại
      </button>
      <div className="flex items-center gap-3 mb-5">
        <span className="w-10 h-10 rounded-xl bg-gray-100 text-primary flex items-center justify-center border border-gray-200"><IconUserPlus size={20} /></span>
        <div>
          <h3 className="font-semibold text-gray-800">Gia nhập công ty</h3>
          <p className="text-xs text-gray-500">Nhập mã mời từ quản trị viên</p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <Field label="Mã mời / Mã công ty" required hint="VD: ABC-HN1-2026 hoặc mã do quản trị viên cung cấp">
          <div className="relative">
            <IconKey size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input name="code" placeholder="Nhập mã mời..." className="pl-9 font-mono" required />
          </div>
        </Field>
        <div className="rounded-lg bg-info-100/60 border border-info-200 px-4 py-3 text-xs text-gray-600 mb-5">
          <b>Lưu ý:</b> Yêu cầu gia nhập sẽ được quản trị viên phê duyệt. Bạn sẽ nhận thông báo khi được duyệt.
        </div>
        <Button type="submit" block size="lg">Gửi yêu cầu gia nhập</Button>
      </form>
    </div>
  );
}
