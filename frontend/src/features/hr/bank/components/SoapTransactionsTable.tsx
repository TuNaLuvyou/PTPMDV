"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faFileInvoiceDollar,
  faFilter,
  faPlus,
  faCheckCircle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Select, Input } from "@/components/ui/Form";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { formatVND } from "@/lib/utils";
import type { SoapTransaction } from "../types";

interface Props {
  transactions: SoapTransaction[];
  onViewPayload: (t: SoapTransaction) => void;
  onCreateDisbursement: () => void;
}

export default function SoapTransactionsTable({
  transactions,
  onViewPayload,
  onCreateDisbursement,
}: Props) {
  const [filterBank, setFilterBank] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchBank = filterBank === "all" || t.bankName.toLowerCase().includes(filterBank.toLowerCase());
      const matchSearch =
        t.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.bankReference.toLowerCase().includes(searchTerm.toLowerCase());
      return matchBank && matchSearch;
    });
  }, [transactions, filterBank, searchTerm]);

  const columns: Column<SoapTransaction>[] = [
    {
      key: "id",
      header: "Mã Giao dịch SOAP",
      render: (t) => (
        <div>
          <div className="font-mono font-bold text-xs text-primary">{t.id}</div>
          <div className="text-[11px] text-gray-400 font-mono">Ref: {t.bankReference}</div>
        </div>
      ),
    },
    {
      key: "batchName",
      header: "Kỳ lương / Nội dung",
      render: (t) => (
        <div>
          <div className="font-semibold text-gray-900 text-sm">{t.batchName}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
            <span className="font-medium text-gray-700">{t.bankName}</span>
            <span>•</span>
            <span>{t.totalEmployees} nhân viên</span>
          </div>
        </div>
      ),
    },
    {
      key: "totalAmount",
      header: "Tổng tiền giải ngân",
      render: (t) => (
        <span className="font-bold text-gray-900 text-sm">
          {formatVND(t.totalAmount)}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Thời gian thực hiện",
      render: (t) => (
        <div className="text-xs text-gray-600">
          <div>{t.createdAt}</div>
          {t.completedAt && (
            <div className="text-[11px] text-emerald-600 font-medium">Hoàn tất: {t.completedAt.split(" ")[1]}</div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái SOAP",
      render: (t) => {
        if (t.status === "success") {
          return (
            <Badge tone="success" className="inline-flex items-center gap-1">
              <FontAwesomeIcon icon={faCheckCircle} fontSize={10} /> Đã chuyển tiền
            </Badge>
          );
        }
        if (t.status === "processing") {
          return (
            <Badge tone="primary" className="inline-flex items-center gap-1">
              <FontAwesomeIcon icon={faClock} fontSize={10} /> Đang xử lý WSDL
            </Badge>
          );
        }
        return <Badge tone="warning">Chờ ký duyệt</Badge>;
      },
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (t) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewPayload(t)}
            className="p-1.5 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors cursor-pointer text-xs flex items-center gap-1 border border-gray-200"
            title="Xem XML SOAP Envelope"
          >
            <FontAwesomeIcon icon={faCode} fontSize={12} /> XML Payload
          </button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Nhật ký Lệnh Chi Lương SOAP API Trực tiếp</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            Lịch sử giao dịch giải ngân tự động từ máy chủ HRM tới hệ thống Core Banking qua WSDL
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button onClick={onCreateDisbursement} className="text-xs">
            <FontAwesomeIcon icon={faPlus} fontSize={12} /> Tạo lệnh chi lương SOAP
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm theo mã giao dịch, kỳ lương, mã đối soát..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={filterBank}
              onChange={(e) => setFilterBank(e.target.value)}
              className="text-xs"
            >
              <option value="all">Tất cả ngân hàng</option>
              <option value="VietinBank">VietinBank</option>
              <option value="Vietcombank">Vietcombank</option>
              <option value="BIDV">BIDV</option>
            </Select>
          </div>
        </div>

        <Table<SoapTransaction>
          data={filtered}
          columns={columns}
          rowKey={(item) => item.id}
          emptyMessage="Chưa có lệnh chi lương SOAP nào phù hợp."
        />
      </CardBody>
    </Card>
  );
}
