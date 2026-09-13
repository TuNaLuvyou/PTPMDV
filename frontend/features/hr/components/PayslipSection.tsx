"use client";

import { IconPencil, IconCheck, IconPrinter, IconLockSquare } from "@tabler/icons-react";
import Badge, { StatusBadge } from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Form";
import { formatVND } from "@/lib/utils";
import type { Payslip } from "@/mock-data/portal";

interface Props {
  payslips: Payslip[];
  onEdit: (p: Payslip) => void;
  onCloseOne: (p: Payslip) => void;
  onPrint: (p: Payslip) => void;
  onBulkClose: () => void;
}

export default function PayslipSection({ payslips, onEdit, onCloseOne, onPrint, onBulkClose }: Props) {
  const columns: Column<Payslip>[] = [
    { key: "employee", header: "Nhân viên", render: (p) => <span className="font-semibold text-gray-800">{p.employee}</span> },
    { key: "month", header: "Kỳ lương", render: (p) => <Badge tone="gray">{p.month}</Badge> },
    { key: "days", header: "Công", render: (p) => <span className="text-gray-600">{p.days} ngày</span> },
    { key: "salary", header: "Lương cơ bản", render: (p) => <span className="text-gray-700">{formatVND(p.salary)}</span> },
    { key: "bonus", header: "Thưởng", render: (p) => <span className="text-success">{formatVND(p.bonus)}</span> },
    { key: "penalty", header: "Phạt", render: (p) => <span className="text-danger">{formatVND(p.penalty)}</span> },
    { key: "total", header: "Tổng lương", render: (p) => <span className="font-bold text-gray-800">{formatVND(p.total)}</span> },
    { key: "status", header: "Trạng thái", render: (p) => <StatusBadge status={p.status} /> },
    {
      key: "actions",
      header: "Thao tác",
      render: (p) => (
        <div className="flex items-center gap-1">
          {p.status === "chưa chốt" ? (
            <>
              <button onClick={() => onEdit(p)} className="p-1.5 rounded-lg text-primary hover:bg-primary-50 cursor-pointer" title="Chỉnh sửa (thưởng/phạt)">
                <IconPencil size={16} />
              </button>
              <button onClick={() => onCloseOne(p)} className="p-1.5 rounded-lg text-success hover:bg-success-100 cursor-pointer" title="Chốt lương nhân viên này">
                <IconCheck size={16} />
              </button>
            </>
          ) : (
            <button onClick={() => onPrint(p)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer" title="In phiếu lương">
              <IconPrinter size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phiếu lương theo tháng</CardTitle>
        <div className="flex gap-2">
          <Select className="w-auto py-1.5" defaultValue="08/2026">
            <option value="08/2026">Tháng 08/2026</option>
            <option value="07/2026">Tháng 07/2026</option>
          </Select>
          <Button size="sm" onClick={onBulkClose}>
            <IconLockSquare size={14} /> Chốt phiếu lương
          </Button>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        <Table columns={columns} data={payslips} rowKey={(p) => p.id} emptyMessage="Chưa có phiếu lương nào" />
      </CardBody>
    </Card>
  );
}
