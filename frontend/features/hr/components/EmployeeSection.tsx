"use client";

import { IconSearch, IconLock, IconTrash } from "@tabler/icons-react";
import Badge, { StatusBadge } from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Form";
import type { Employee } from "@/mock-data/portal";

interface Props {
  employees: Employee[];
  onLock: (e: Employee) => void;
  onDelete: (e: Employee) => void;
}

export default function EmployeeSection({ employees, onLock, onDelete }: Props) {
  const columns: Column<Employee>[] = [
    {
      key: "name",
      header: "Nhân viên",
      render: (e) => (
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
            {e.name.charAt(0)}
          </span>
          <div>
            <div className="font-semibold text-gray-800">{e.name}</div>
            <div className="text-xs text-gray-400 font-mono">{e.phone}</div>
          </div>
        </div>
      ),
    },
    { key: "branch", header: "Chi nhánh", render: (e) => <Badge tone="gray">{e.branch}</Badge> },
    { key: "role", header: "Vai trò", render: (e) => <span className="text-gray-600">{e.role}</span> },
    { key: "status", header: "Trạng thái", render: (e) => <StatusBadge status={e.status} /> },
    {
      key: "actions",
      header: "Thao tác",
      render: (e) => (
        <div className="flex items-center gap-0.5">
          <button onClick={() => onLock(e)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-warning-700 cursor-pointer" title="Khóa">
            <IconLock size={16} />
          </button>
          <button onClick={() => onDelete(e)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-danger cursor-pointer" title="Xóa">
            <IconTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách nhân sự</CardTitle>
        <div className="relative w-56">
          <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Tìm nhân viên..." className="pl-8 py-1.5" />
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        <Table columns={columns} data={employees} rowKey={(e) => e.id} emptyMessage="Không có nhân viên nào" />
      </CardBody>
    </Card>
  );
}
