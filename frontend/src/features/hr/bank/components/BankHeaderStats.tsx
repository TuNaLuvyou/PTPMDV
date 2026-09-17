"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faCircleCheck,
  faNetworkWired,
  faMoneyBillWave,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { formatVND } from "@/lib/utils";
import type { BankPartner, SoapGatewayConfig, SoapTransaction } from "../types";

interface Props {
  gatewayConfig: SoapGatewayConfig;
  partners: BankPartner[];
  transactions: SoapTransaction[];
  onTestSoap: () => void;
}

export default function BankHeaderStats({
  gatewayConfig,
  partners,
  transactions,
  onTestSoap,
}: Props) {
  const primaryBank = partners.find((p) => p.isPrimary) || partners[0];
  const totalBalance = partners.reduce((sum, p) => sum + p.balance, 0);
  const totalDisbursed = transactions
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. Trạng thái SOAP Gateway */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Cổng SOAP API Ngân hàng
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            200 OK Active
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900 font-mono">
            /soap/payroll
          </span>
          <span className="text-xs text-gray-400 font-mono">
            {gatewayConfig.avgResponseTime}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2.5 text-gray-600">
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faShieldHalved} className="text-primary text-[11px]" />
            Bảo mật mTLS + X.509
          </span>
          <button
            onClick={onTestSoap}
            className="text-primary hover:underline font-semibold cursor-pointer"
          >
            Kiểm tra Ping WSDL
          </button>
        </div>
      </div>

      {/* 2. Ngân hàng Chi lương Chính */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Ngân hàng Chi trả Chính
          </span>
          <FontAwesomeIcon icon={faBuildingColumns} className="text-primary" />
        </div>
        <div className="text-base font-bold text-gray-900 truncate">
          {primaryBank.shortName}
        </div>
        <div className="text-xs text-gray-500 font-mono mt-0.5 truncate">
          STK: {primaryBank.accountNumber}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2.5 text-gray-600">
          <span>Chi nhánh nguồn:</span>
          <span className="font-semibold text-gray-800 truncate max-w-[150px]">
            {primaryBank.branch}
          </span>
        </div>
      </div>

      {/* 3. Tổng số dư khả dụng chi lương */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Số dư nguồn chi khả dụng
          </span>
          <FontAwesomeIcon icon={faMoneyBillWave} className="text-emerald-600" />
        </div>
        <div className="text-xl font-black text-gray-900 tracking-tight">
          {formatVND(totalBalance)}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          Tổng trên 3 tài khoản doanh nghiệp
        </div>
        <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2.5 text-gray-600">
          <span>Tài khoản chính:</span>
          <span className="font-bold text-emerald-700">
            {formatVND(primaryBank.balance)}
          </span>
        </div>
      </div>

      {/* 4. Tổng giải ngân qua SOAP API */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Đã chi trả qua SOAP API
          </span>
          <FontAwesomeIcon icon={faCircleCheck} className="text-blue-600" />
        </div>
        <div className="text-xl font-black text-primary tracking-tight">
          {formatVND(totalDisbursed)}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          Ghi nhận tự động từ Core Banking
        </div>
        <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2.5 text-gray-600">
          <span>Tổng số lệnh:</span>
          <span className="font-bold text-gray-800">
            {transactions.length} đợt chi trả
          </span>
        </div>
      </div>
    </div>
  );
}
