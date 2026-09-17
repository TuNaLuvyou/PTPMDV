"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faPencil,
  faTrashCan,
  faMagnifyingGlass,
  faSitemap,
  faUsers,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import Badge, { StatusBadge } from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Form";
import type { Department, Employee } from "@/types";

interface Props {
  departments: Department[];
  employees: Employee[];
  onEdit: (d: Department) => void;
  onLock?: (d: Department) => void;
  onDelete?: (d: Department) => void;
  isManager?: boolean;
}

export default function DepartmentList({
  departments,
  employees,
  onEdit,
  onLock,
  onDelete,
  isManager = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  // Tính số nhân sự thực tế theo từng phòng ban
  const staffCounts = useMemo(() => {
    const map: Record<string, number> = {};
    employees.forEach((e) => {
      if (e.department) {
        map[e.department] = (map[e.department] || 0) + 1;
      }
    });
    return map;
  }, [employees]);

  const filteredDepartments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.manager.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }, [departments, searchQuery]);

  const totalAssignedStaff = useMemo(() => {
    return employees.filter((e) => !!e.department).length;
  }, [employees]);

  const columns: Column<Department>[] = [
    {
      key: "name",
      header: "Phòng ban",
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary-200">
            <FontAwesomeIcon icon={faSitemap} fontSize={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{d.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-gray-100 text-gray-700 border border-gray-200">
                {d.code}
              </span>
            </div>
            <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{d.description || "Chưa có mô tả"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "manager",
      header: "Trưởng phòng / Phụ trách",
      render: (d) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center text-xs font-bold">
            <FontAwesomeIcon icon={faUserTie} fontSize={12} />
          </div>
          <div>
            <span className="font-medium text-gray-800 text-sm block">{d.manager || "Chưa bổ nhiệm"}</span>
            <span className="text-[11px] text-gray-400">Trưởng bộ phận</span>
          </div>
        </div>
      ),
    },
    {
      key: "staff",
      header: "Nhân sự",
      render: (d) => {
        const count = staffCounts[d.name] ?? d.staff ?? 0;
        return (
          <div className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faUsers} fontSize={13} className="text-gray-400" />
            <span className="font-bold text-sm text-gray-800">{count}</span>
            <span className="text-xs text-gray-400">nhân sự</span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (d) => (
        <StatusBadge status={d.status === "hoạt động" ? "Hoạt động" : "Bị khóa"} />
      ),
    },
    ...(!isManager
      ? [
          {
            key: "actions" as keyof Department,
            header: "Thao tác",
            render: (d: Department) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(d)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary cursor-pointer transition-colors"
                  title="Chỉnh sửa thông tin"
                >
                  <FontAwesomeIcon icon={faPencil} fontSize={15} />
                </button>
                {onLock && (
                  <button
                    onClick={() => onLock(d)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-amber-600 cursor-pointer transition-colors"
                    title={d.status === "hoạt động" ? "Tạm dừng phòng ban" : "Kích hoạt lại"}
                  >
                    <FontAwesomeIcon icon={faLock} fontSize={15} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(d)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-600 cursor-pointer transition-colors"
                    title="Xóa phòng ban"
                  >
                    <FontAwesomeIcon icon={faTrashCan} fontSize={15} />
                  </button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      {/* 3 Thẻ thống kê cơ cấu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng phòng ban</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{departments.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">Bộ máy tổ chức doanh nghiệp</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary border border-primary-200 flex items-center justify-center">
            <FontAwesomeIcon icon={faSitemap} fontSize={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nhân sự đã phân bổ</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{totalAssignedStaff}</div>
            <div className="text-xs text-gray-400 mt-0.5">Trên tổng số {employees.length} nhân viên</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <FontAwesomeIcon icon={faUsers} fontSize={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái vận hành</div>
            <div className="text-2xl font-bold text-blue-700 mt-1">
              {departments.filter((d) => d.status === "hoạt động").length}/{departments.length}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">Phòng ban đang hoạt động</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
            <FontAwesomeIcon icon={faUserTie} fontSize={20} />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Danh sách Phòng ban Doanh nghiệp</CardTitle>
            <Badge tone="gray">{filteredDepartments.length} phòng ban</Badge>
          </div>
          <div className="relative w-64">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              fontSize={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Tìm theo tên, mã, trưởng phòng..."
              className="pl-8 py-1.5 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardBody className="pt-2">
          <Table
            columns={columns}
            data={filteredDepartments}
            rowKey={(d) => d.id}
            emptyMessage="Không tìm thấy phòng ban nào"
          />
        </CardBody>
      </Card>
    </div>
  );
}
