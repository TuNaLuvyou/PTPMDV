"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge, { StatusBadge } from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Form";
import type { WorkShift } from "@/features/hr/shifts/types";

interface Props {
  workShifts: WorkShift[];
  onDelete: (id: string) => void;
}

export default function WorkShiftSection({ workShifts, onDelete }: Props) {
  const columns: Column<WorkShift>[] = [
    { key: "employee", header: "Nhân viên", render: (s) => <span className="font-semibold text-gray-800">{s.employee}</span> },
    { key: "branch", header: "Chi nhánh", render: (s) => <Badge tone="gray">{s.branch}</Badge> },
    { key: "date", header: "Ngày", render: (s) => <span className="text-gray-600">{s.date}</span> },
    { key: "templateName", header: "Khung ca", render: (s) => <Badge tone="primary">{s.templateName}</Badge> },
    { key: "scheduled", header: "Giờ làm", render: (s) => <span className="font-medium text-gray-700">{s.scheduled}</span> },
    { key: "checkIn", header: "Check-in", render: (s) => <span className="font-mono text-sm">{s.checkIn}</span> },
    { key: "checkOut", header: "Check-out", render: (s) => <span className="font-mono text-sm">{s.checkOut}</span> },
    {
      key: "status",
      header: "Trạng thái",
      render: (s) => (s.status === "Chưa làm" ? <Badge tone="gray">{s.status}</Badge> : <StatusBadge status={s.status} />),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (s) => (
        <button onClick={() => onDelete(s.id)} className="p-1 text-gray-400 hover:text-danger cursor-pointer transition-colors" title="Xóa phân công">
          <FontAwesomeIcon icon={faTrashCan} fontSize={16} />
        </button>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch phân công nhân viên (Xếp ca)</CardTitle>
        <div className="flex gap-2">
          <Select className="w-auto py-1.5 text-sm" defaultValue="hn-1">
            <option value="hn-1">HN-1</option>
            <option value="hn-2">HN-2</option>
            <option value="dn-1">ĐN-1</option>
          </Select>
          <Input type="date" className="w-auto py-1.5 text-sm" defaultValue="2026-08-17" />
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        <Table columns={columns} data={workShifts} rowKey={(s) => s.id} emptyMessage="Chưa có nhân viên nào được phân công" />
      </CardBody>
    </Card>
  );
}
