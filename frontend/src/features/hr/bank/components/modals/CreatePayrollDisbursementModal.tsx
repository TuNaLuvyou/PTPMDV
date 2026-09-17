"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faCircleCheck,
  faMoneyBillTransfer,
  faShieldHalved,
  faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Field, Select, Input } from "@/components/ui/Form";
import { formatVND } from "@/lib/utils";
import type { BankPartner, SoapTransaction } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  partners: BankPartner[];
  onDisburseSuccess: (newTx: SoapTransaction) => void;
}

export default function CreatePayrollDisbursementModal({
  open,
  onClose,
  partners,
  onDisburseSuccess,
}: Props) {
  const [selectedBankId, setSelectedBankId] = useState(
    partners.find((p) => p.isPrimary)?.id || partners[0]?.id || "vtb"
  );
  const [period, setPeriod] = useState("08/2026");
  const [loading, setLoading] = useState(false);
  const [memo, setMemo] = useState("Chi lương kỳ Tháng 08/2026 qua SOAP API");

  // Dữ liệu mẫu nhân sự giải ngân
  const totalEmployees = 18;
  const totalAmount = 154200000;

  const selectedBank = partners.find((p) => p.id === selectedBankId) || partners[0];

  const handleDisburse = () => {
    setLoading(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${now.getFullYear()} ${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

      const randomRef = `${selectedBank.shortName.toUpperCase()}-FT-${Math.floor(
        10000000 + Math.random() * 90000000
      )}`;
      const txId = `SOAP-TXN-${period.replace("/", "")}-${Math.floor(10 + Math.random() * 90)}`;

      const newTx: SoapTransaction = {
        id: txId,
        batchName: `Chi lương kỳ Tháng ${period}`,
        bankName: selectedBank.shortName,
        totalEmployees,
        totalAmount,
        status: "success",
        createdAt: timeStr,
        completedAt: timeStr,
        bankReference: randomRef,
        soapAction: "ConfirmPayrollTransfer",
        xmlPayload: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:pay="http://hrm.company.local/soap/payroll">
  <soap:Header>
    <pay:AuthToken>SEC_KEY_${Math.random().toString(36).substring(2, 10).toUpperCase()}</pay:AuthToken>
    <pay:RequestTimestamp>${now.toISOString()}</pay:RequestTimestamp>
  </soap:Header>
  <soap:Body>
    <pay:ConfirmPayrollTransferRequest>
      <pay:BatchId>PAY-${period.replace("/", "")}-AUTO</pay:BatchId>
      <pay:SourceAccount>${selectedBank.accountNumber}</pay:SourceAccount>
      <pay:TotalBeneficiaries>${totalEmployees}</pay:TotalBeneficiaries>
      <pay:TotalAmount Currency="VND">${totalAmount}</pay:TotalAmount>
      <pay:Memo>${memo}</pay:Memo>
    </pay:ConfirmPayrollTransferRequest>
  </soap:Body>
</soap:Envelope>`,
        xmlResponse: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:pay="http://hrm.company.local/soap/payroll">
  <soap:Body>
    <pay:ConfirmPayrollTransferResponse>
      <pay:Status>SUCCESS</pay:Status>
      <pay:BankReference>${randomRef}</pay:BankReference>
      <pay:ProcessedCount>${totalEmployees}</pay:ProcessedCount>
      <pay:FeeAmount Currency="VND">0</pay:FeeAmount>
      <pay:ExecutionTimeMs>${Math.floor(95 + Math.random() * 40)}</pay:ExecutionTimeMs>
    </pay:ConfirmPayrollTransferResponse>
  </soap:Body>
</soap:Envelope>`,
      };

      setLoading(false);
      onDisburseSuccess(newTx);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo Lệnh Chi Lương Tự Động qua Cổng SOAP Ngân hàng"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="white" onClick={onClose} disabled={loading} className="text-xs">
            Hủy
          </Button>
          <Button onClick={handleDisburse} disabled={loading} className="text-xs">
            <FontAwesomeIcon
              icon={loading ? faArrowsRotate : faMoneyBillTransfer}
              className={loading ? "animate-spin" : ""}
            />
            {loading ? "Đang gửi lệnh SOAP tới Ngân hàng..." : "Ký duyệt & Chi lương qua SOAP"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Tóm tắt đợt chi */}
        <div className="p-4 bg-primary-50/30 border border-primary-200 rounded-xl">
          <div className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faShieldHalved} />
            Lệnh chi lương điện tử qua giao thức bảo mật On-Premises SOAP
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500">Số lượng nhân sự nhận lương:</span>
              <div className="text-base font-bold text-gray-900 mt-0.5">{totalEmployees} nhân viên</div>
            </div>
            <div>
              <span className="text-gray-500">Tổng số tiền cần giải ngân:</span>
              <div className="text-base font-bold text-primary mt-0.5">{formatVND(totalAmount)}</div>
            </div>
          </div>
        </div>

        {/* Form lựa chọn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Kỳ bảng lương cần chi trả" required>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} disabled={loading}>
              <option value="08/2026">Tháng 08/2026 (Đã chốt công)</option>
              <option value="07/2026">Tháng 07/2026 (Đã chốt công)</option>
            </Select>
          </Field>

          <Field label="Tài khoản Doanh nghiệp nguồn" required>
            <Select
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
              disabled={loading}
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.shortName} — {p.accountNumber} ({formatVND(p.balance)})
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Nội dung giao dịch (Memo)">
          <Input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={loading}
            placeholder="Nội dung chuyển khoản hiển thị trên sao kê..."
          />
        </Field>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Giao thức kết nối:</span>
            <span className="font-mono font-medium text-gray-900">{selectedBank.soapProtocol}</span>
          </div>
          <div className="flex justify-between">
            <span>Phí giao dịch chi lương theo lô:</span>
            <span className="font-semibold text-emerald-700">0 đ (Miễn phí qua API doanh nghiệp)</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
