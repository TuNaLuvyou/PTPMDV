"use client";

import { IconCalendarClock } from "@tabler/icons-react";
import Badge, { StatusBadge } from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Shift } from "@/mock-data/portal";

interface Props {
  shiftHistory: Shift[];
}

export default function ShiftHistorySection({ shiftHistory }: Props) {
  const columns: Column<Shift>[] = [
    { key: "employee", header: "Nhân viên", render: (s) => <span className="font-semibold text-gray-800">{s.employee}</span> },
    { key: "branch", header: "Chi nhánh", render: (s) => <Badge tone="gray">{s.branch}</Badge> },
    { key: "date", header: "Ngày", render: (s) => <span className="text-gray-600 text-sm">{s.date}</span> },
    { key: "template", header: "Khung ca", render: (s) => <Badge tone="primary">{s.template}</Badge> },
    { key: "scheduled", header: "Giờ làm", render: (s) => <span className="font-mono text-sm">{s.scheduled}</span> },
    { key: "checkIn", header: "Check-in", render: (s) => <span className="font-mono text-sm">{s.checkIn ?? "—"}</span> },
    { key: "checkOut", header: "Check-out", render: (s) => <span className="font-mono text-sm">{s.checkOut ?? "—"}</span> },
    { key: "status", header: "Trạng thái", render: (s) => <StatusBadge status={s.status} /> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử chấm công</CardTitle>
        <Badge tone="gray"><IconCalendarClock size={12} /> Tổng {shiftHistory.length} lượt</Badge>
      </CardHeader>
      <CardBody className="pt-2">
        <Table columns={columns} data={shiftHistory} rowKey={(s) => s.id} emptyMessage="Chưa có dữ liệu chấm công" />
      </CardBody>
    </Card>
  );
}
