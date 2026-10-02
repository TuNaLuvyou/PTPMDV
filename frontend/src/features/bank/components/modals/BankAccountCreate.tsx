"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Field, Input, Select, Checkbox } from "@/components/ui/Form";
import { GATEWAY_URL, GatewayError } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const POPULAR_BANKS = [
  "Vietcombank",
  "Techcombank",
  "MB Bank",
  "BIDV",
  "VietinBank",
  "ACB",
  "VPBank",
  "TPBank",
  "Sacombank",
  "HDBank",
];

export default function CreateBankAccountModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const [bankName, setBankName] = useState("Techcombank");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("CONG TY TNHH HRM SYSTEM");
  const [balanceStr, setBalanceStr] = useState("200000000");
  const [isPrimary, setIsPrimary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) {
      setError("Vui lòng nhập số tài khoản ngân hàng.");
      return;
    }
    if (!accountName.trim()) {
      setError("Vui lòng nhập tên chủ tài khoản.");
      return;
    }

    const balance = Number(balanceStr) || 0;
    if (balance < 0) {
      setError("Số dư ban đầu không được âm.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${GATEWAY_URL}/api/payroll/bank-accounts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName,
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
          balance,
          isPrimary,
          status: "hoạt động",
        }),
      });

      const text = await res.text();
      let body: any = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = null;
      }

      if (!res.ok) {
        throw new GatewayError(
          body?.error?.code || `HTTP_${res.status}`,
          body?.error?.message || "Lỗi khi liên kết tài khoản ngân hàng",
          res.status
        );
      }

      setAccountNumber("");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo tài khoản ngân hàng");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Liên kết Tài khoản Ngân hàng Mới"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <Field label="Ngân hàng đối tác" required>
          <Select
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          >
            {POPULAR_BANKS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Số tài khoản ngân hàng" required>
          <Input
            placeholder="Ví dụ: 19036789012015"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />
        </Field>

        <Field label="Tên chủ tài khoản (In hoa không dấu)" required>
          <Input
            placeholder="CONG TY TNHH HRM SYSTEM"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value.toUpperCase())}
            required
          />
        </Field>

        <Field label="Số dư khả dụng ban đầu (VND)" required>
          <Input
            type="number"
            min="0"
            step="1000000"
            placeholder="200000000"
            value={balanceStr}
            onChange={(e) => setBalanceStr(e.target.value)}
            required
          />
        </Field>

        <div className="pt-1">
          <Checkbox
            label="Đặt làm tài khoản chi lương chính (Primary)"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
          <Button type="button" variant="white" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            <FontAwesomeIcon icon={faPlus} fontSize={12} />
            {submitting ? "Đang liên kết..." : "Liên kết tài khoản"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
