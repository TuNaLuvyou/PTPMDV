"use client";

import { IconBuildingStore, IconUserPlus, IconArrowRight, IconCheck } from "@tabler/icons-react";

interface Props {
  userName: string;
  onCreate: () => void;
  onJoin: () => void;
}

export default function ChooseCompany({ userName, onCreate, onJoin }: Props) {
  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-success-100 text-success-700 flex items-center justify-center mx-auto mb-3">
          <IconCheck size={22} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Chào {userName || "bạn"}! Tài khoản đã được tạo</h3>
        <p className="text-sm text-gray-500 mt-1">Chọn cách bạn muốn bắt đầu với HR System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onCreate}
          className="group text-left rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary-50/50 p-5 transition-all cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <IconBuildingStore size={22} />
          </div>
          <h4 className="font-semibold text-gray-800">Tạo công ty mới</h4>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Bạn là quản trị viên, muốn tạo không gian làm việc riêng cho công ty của mình.</p>
          <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary">
            Tạo công ty <IconArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          type="button"
          onClick={onJoin}
          className="group text-left rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary-50/50 p-5 transition-all cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-gray-100 text-gray-700 group-hover:bg-primary group-hover:text-white flex items-center justify-center mb-3 transition-colors">
            <IconUserPlus size={22} />
          </div>
          <h4 className="font-semibold text-gray-800">Gia nhập công ty</h4>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Bạn đã có mã mời, muốn tham gia vào công ty hiện có với vai trò nhân sự.</p>
          <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary">
            Nhập mã mời <IconArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-5">Bạn có thể đổi lựa chọn sau trong phần Cài đặt.</p>
    </div>
  );
}
