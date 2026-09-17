"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faMagnifyingGlass, faStore, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import Badge, { StatusBadge } from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Form";
import type { Employee } from "@/types";

interface Props {
  employees: Employee[];
  onLock: (e: Employee) => void;
  onDelete: (e: Employee) => void;
  isManager?: boolean;
  managerBranch?: string;
}

export default function EmployeeSection({ employees, onLock, onDelete, isManager = false, managerBranch }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>(isManager && managerBranch ? managerBranch : "all");

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.phone.includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q);
      const matchesBranch = branchFilter === "all" || e.branch === branchFilter;
      return matchesSearch && matchesBranch;
    });
  }, [employees, searchQuery, branchFilter]);

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
            <FontAwesomeIcon icon={faLock} fontSize={16} />
          </button>
          <button onClick={() => onDelete(e)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-danger cursor-pointer" title="Xóa">
            <FontAwesomeIcon icon={faTrashCan} fontSize={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách nhân sự {branchFilter !== "all" ? `• ${branchFilter}` : ""} {filteredEmployees.length !== employees.length ? `(${filteredEmployees.length}/${employees.length})` : `(${employees.length})`}</CardTitle>
        <div className="flex items-center gap-2">
          {isManager ? (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700">
              <FontAwesomeIcon icon={faStore} fontSize={14} className="text-primary" />
              <span>Chi nhánh: <strong className="text-gray-900">{managerBranch}</strong></span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary border border-primary-200">Cố định</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
              <FontAwesomeIcon icon={faStore} fontSize={14} className="text-gray-500" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-gray-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Tất cả chi nhánh</option>
                <option value="HN-1">HN-1</option>
                <option value="HN-2">HN-2</option>
                <option value="ĐN-1">ĐN-1</option>
              </select>
            </div>
          )}
          <div className="relative w-48">
            <FontAwesomeIcon icon={faMagnifyingGlass} fontSize={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Tìm nhân viên..." className="pl-8 py-1.5" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        <Table columns={columns} data={filteredEmployees} rowKey={(e) => e.id} emptyMessage="Không có nhân viên nào" />
      </CardBody>
    </Card>
  );
}
