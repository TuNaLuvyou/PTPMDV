"use client";

import { IconCheck, IconX } from "@tabler/icons-react";
import Badge, { StatusBadge } from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ShiftRequest } from "@/mock-data/portal";

interface Props {
  requests: ShiftRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function ShiftRequestSection({ requests, onApprove, onReject }: Props) {
  const pendingCount = requests.filter((r) => r.status === "chờ duyệt").length;

  const columns: Column<ShiftRequest>[] = [
    { key: "employee", header: "Nhân viên", render: (r) => <span className="font-semibold text-gray-800">{r.employee}</span> },
    { key: "branch", header: "Chi nhánh", render: (r) => <Badge tone="gray">{r.branch}</Badge> },
    { key: "period", header: "Thời gian", render: (r) => <span className="text-gray-600 text-sm">{r.from} → {r.to}</span> },
    { key: "reason", header: "Lý do", render: (r) => <span className="text-gray-600 text-sm">{r.reason}</span> },
    { key: "status", header: "Trạng thái", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Duyệt",
      render: (r) =>
        r.status === "chờ duyệt" ? (
          <div className="flex gap-1">
            <button onClick={() => onApprove(r.id)} className="p-1.5 rounded-lg text-success hover:bg-success-100 cursor-pointer" title="Duyệt">
              <IconCheck size={16} />
            </button>
            <button onClick={() => onReject(r.id)} className="p-1.5 rounded-lg text-danger hover:bg-danger-100 cursor-pointer" title="Từ chối">
              <IconX size={16} />
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Đã xử lý</span>
        ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yêu cầu đổi / pass ca chờ duyệt</CardTitle>
        <Badge tone="warning" dot>{pendingCount} chờ duyệt</Badge>
      </CardHeader>
      <CardBody className="pt-2">
        <Table columns={columns} data={requests} rowKey={(r) => r.id} emptyMessage="Không có yêu cầu nào" />
      </CardBody>
    </Card>
  );
}
