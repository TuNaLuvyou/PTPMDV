"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faShieldHalved,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { formatVND } from "@/lib/utils";
import type { BankPartner } from "../../types";

interface Props {
  partner: BankPartner | null;
  onClose: () => void;
}

export default function BankConfigModal({ partner, onClose }: Props) {
  if (!partner) return null;

  return (
    <Modal
      open={Boolean(partner)}
      onClose={onClose}
      title={`Cấu hình Kết nối: ${partner.name}`}
      size="md"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="white" onClick={onClose} className="text-xs">
            Đóng
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Tên ngân hàng đối tác:</span>
            <span className="font-bold text-gray-900">{partner.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Số tài khoản nguồn:</span>
            <span className="font-mono font-bold text-primary">{partner.accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Chi nhánh mở tài khoản:</span>
            <span className="font-semibold text-gray-800">{partner.branch}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Số dư khả dụng hiện tại:</span>
            <span className="font-bold text-emerald-700 text-sm">{formatVND(partner.balance)}</span>
          </div>
        </div>

        <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <FontAwesomeIcon icon={faShieldHalved} />
            Chứng chỉ Bảo mật mTLS / X.509
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Trạng thái chứng chỉ:</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <FontAwesomeIcon icon={faCircleCheck} fontSize={11} /> Hợp lệ (Valid)
            </span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Ngày hết hạn:</span>
            <span className="font-mono">{partner.certExpiry}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Chuẩn giao tiếp:</span>
            <span className="font-mono text-gray-900">{partner.soapProtocol}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
