"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faPencil, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import Badge, { StatusBadge } from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Branch } from "@/types";

interface Props {
  branches: Branch[];
  onEdit: (b: Branch) => void;
  onLock?: (b: Branch) => void;
  onDelete?: (b: Branch) => void;
}

export default function BranchSection({ branches, onEdit, onLock, onDelete }: Props) {
  const columns: Column<Branch>[] = [
    {
      key: "name",
      header: "Chi nhánh",
      render: (b) => (
        <div>
          <div className="font-semibold text-gray-800">{b.name}</div>
          <div className="text-xs text-gray-400">{b.slug} • {b.phone}</div>
        </div>
      ),
    },
    { key: "address", header: "Địa chỉ", render: (b) => <span className="text-gray-600 text-sm max-w-[260px] truncate block" title={b.address}>{b.address}</span> },
    { key: "manager", header: "Quản lý", render: (b) => <span className="text-gray-700">{b.manager}</span> },
    { key: "staff", header: "Nhân sự", render: (b) => <span className="font-semibold text-gray-800">{b.staff}</span> },
    { key: "status", header: "Trạng thái", render: (b) => <StatusBadge status={b.status === "hoạt động" ? "Hoạt động" : "Bị khóa"} /> },
    {
      key: "actions",
      header: "Thao tác",
      render: (b) => (
        <div className="flex items-center gap-0.5">
          <button onClick={() => onEdit(b)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary cursor-pointer" title="Sửa">
            <FontAwesomeIcon icon={faPencil} fontSize={16} />
          </button>
          {onLock && (
            <button onClick={() => onLock(b)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-warning-700 cursor-pointer" title="Khóa">
              <FontAwesomeIcon icon={faLock} fontSize={16} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(b)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-danger cursor-pointer" title="Xóa">
              <FontAwesomeIcon icon={faTrashCan} fontSize={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách chi nhánh</CardTitle>
        <Badge tone="gray">{branches.length} chi nhánh</Badge>
      </CardHeader>
      <CardBody className="pt-2">
        <Table columns={columns} data={branches} rowKey={(b) => b.id} emptyMessage="Chưa có chi nhánh nào" />
      </CardBody>
    </Card>
  );
}
