"use client";

import { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faBuilding, faCalendarDay, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge, { StatusBadge } from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { apiGet } from "@/lib/api";
import type { Branch } from "@/types";
import type { WorkShift } from "@/features/shifts/types";
import { usePersistentState } from "@/hooks/usePersistentState";

interface Props {
  workShifts: WorkShift[];
  onDelete: (id: string) => void;
}

export default function WorkShiftSection({ workShifts, onDelete }: Props) {
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);
  // Nhớ bộ lọc của bảng phân công qua localStorage.
  const [branchFilter, setBranchFilter] = usePersistentState<string>("hrm.shifts.list.branch", "all");
  const [dateFilter, setDateFilter] = usePersistentState<string>("hrm.shifts.list.date", "");
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    apiGet<Branch[]>("/api/branches").then((d) => setBranches(d || [])).catch(() => {});
  }, []);

  const filteredShifts = useMemo(() => {
    return workShifts.filter((s) => {
      if (
        branchFilter !== "all" &&
        (s.branch || "").toLowerCase().replace(/[\s-_]/g, "") !== branchFilter.toLowerCase().replace(/[\s-_]/g, "")
      ) {
        return false;
      }
      if (dateFilter) {
        const [y, m, d] = dateFilter.split("-");
        const formatted = `${d}/${m}/${y}`;
        if (s.date !== formatted && !s.date.includes(formatted)) return false;
      }
      return true;
    });
  }, [workShifts, branchFilter, dateFilter]);

  const columns: Column<WorkShift>[] = [
    {
      key: "employee",
      header: "Nhân viên",
      render: (s) => (
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
            {s.avatar ? (
              <img src={s.avatar} alt={s.employee} className="w-full h-full object-cover" />
            ) : (
              s.employee.charAt(0)
            )}
          </span>
          <span className="font-semibold text-gray-800">{s.employee}</span>
        </div>
      ),
    },
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
        <button
          type="button"
          onClick={() => setSelectedShift(s)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-primary hover:text-white transition-all cursor-pointer shadow-2xs"
        >
          Chi tiết
        </button>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lịch phân công nhân viên (Xếp ca)</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              className="w-auto h-[38px] text-xs"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="all">Tất cả chi nhánh</option>
              {branches.map((b) => (
                <option key={b.id || b.slug} value={b.slug.toUpperCase()}>
                  {b.slug.toUpperCase()}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              className="w-auto h-[38px] text-xs"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter("")}
                className="text-xs text-gray-500 hover:text-gray-800 underline"
              >
                Xóa lọc ngày
              </button>
            )}
          </div>
        </CardHeader>
        <CardBody className="pt-2">
          <Table columns={columns} data={filteredShifts} rowKey={(s) => s.id} emptyMessage="Chưa có nhân viên nào được phân công" />
        </CardBody>
      </Card>

      {/* Modal Chi tiết phân công ca */}
      <Modal
        open={!!selectedShift}
        onClose={() => setSelectedShift(null)}
        title="Chi tiết phân công ca làm việc"
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (selectedShift) {
                  onDelete(selectedShift.id);
                  setSelectedShift(null);
                }
              }}
            >
              <FontAwesomeIcon icon={faTrashCan} className="mr-1.5" />
              Xóa phân công
            </Button>
            <Button variant="white" size="sm" onClick={() => setSelectedShift(null)}>
              Đóng
            </Button>
          </div>
        }
      >
        {selectedShift && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold overflow-hidden shrink-0">
                  {selectedShift.avatar ? (
                    <img
                      src={selectedShift.avatar}
                      alt={selectedShift.employee}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedShift.employee.charAt(0)
                  )}
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-900 text-base truncate">{selectedShift.employee}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Mã ca: {selectedShift.code || selectedShift.id}</p>
                </div>
              </div>
              <Badge tone="primary">{selectedShift.templateName}</Badge>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 space-y-2.5 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarDay} className="text-gray-400 text-xs w-4" />
                  Ngày làm việc:
                </span>
                <span className="font-semibold text-gray-800">{selectedShift.date}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs w-4" />
                  Khung giờ dự kiến:
                </span>
                <span className="font-semibold text-gray-800">{selectedShift.scheduled}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-2">
                  <FontAwesomeIcon icon={faBuilding} className="text-gray-400 text-xs w-4" />
                  Chi nhánh:
                </span>
                <span className="font-semibold text-gray-800">{selectedShift.branch}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Giờ Check-in thực tế:</span>
                <span className="font-mono font-semibold text-gray-800">{selectedShift.checkIn}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Giờ Check-out thực tế:</span>
                <span className="font-mono font-semibold text-gray-800">{selectedShift.checkOut}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Trạng thái:</span>
                <StatusBadge status={selectedShift.status} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
