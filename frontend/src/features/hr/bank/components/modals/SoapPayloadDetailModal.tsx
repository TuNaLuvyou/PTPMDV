"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCode, faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { SoapTransaction } from "../../types";

interface Props {
  transaction: SoapTransaction | null;
  onClose: () => void;
}

export default function SoapPayloadDetailModal({ transaction, onClose }: Props) {
  const [copiedReq, setCopiedReq] = useState(false);
  const [copiedRes, setCopiedRes] = useState(false);

  if (!transaction) return null;

  const copyToClipboard = (text: string, isReq: boolean) => {
    navigator.clipboard.writeText(text);
    if (isReq) {
      setCopiedReq(true);
      setTimeout(() => setCopiedReq(false), 2000);
    } else {
      setCopiedRes(true);
      setTimeout(() => setCopiedRes(false), 2000);
    }
  };

  return (
    <Modal
      open={Boolean(transaction)}
      onClose={onClose}
      title={`Chi tiết Lệnh SOAP: ${transaction.id}`}
      size="lg"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="white" onClick={onClose} className="text-xs">
            Đóng
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-gray-400 block">Kỳ lương</span>
            <span className="font-semibold text-gray-900">{transaction.batchName}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Ngân hàng</span>
            <span className="font-semibold text-gray-900">{transaction.bankName}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Mã Core Banking Ref</span>
            <span className="font-mono font-bold text-primary">{transaction.bankReference}</span>
          </div>
          <div>
            <span className="text-gray-400 block">SOAP Action</span>
            <span className="font-mono text-gray-800">{transaction.soapAction}</span>
          </div>
        </div>

        {/* SOAP Request Payload */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-gray-700">
              SOAP Request Payload (XML)
            </span>
            <button
              onClick={() => copyToClipboard(transaction.xmlPayload, true)}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <FontAwesomeIcon icon={copiedReq ? faCheck : faCopy} fontSize={11} />
              {copiedReq ? "Đã sao chép" : "Sao chép XML"}
            </button>
          </div>
          <pre className="bg-gray-950 text-gray-200 p-3 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto max-h-52 border border-gray-800">
            {transaction.xmlPayload}
          </pre>
        </div>

        {/* SOAP Response Payload */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-gray-700">
              Core Banking Response (XML)
            </span>
            <button
              onClick={() => copyToClipboard(transaction.xmlResponse, false)}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <FontAwesomeIcon icon={copiedRes ? faCheck : faCopy} fontSize={11} />
              {copiedRes ? "Đã sao chép" : "Sao chép XML"}
            </button>
          </div>
          <pre className="bg-gray-950 text-emerald-300 p-3 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto max-h-52 border border-gray-800">
            {transaction.xmlResponse}
          </pre>
        </div>
      </div>
    </Modal>
  );
}
