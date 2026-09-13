"use client";

import { useState } from "react";
import { IconPlus, IconSettings } from "@tabler/icons-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { employees, attendanceConfig, type Employee } from "@/mock-data/portal";
import EmployeeSection from "@/features/hr/components/EmployeeSection";
import CreateEmployeeModal from "@/features/hr/components/modals/CreateEmployeeModal";
import DisableEmployeeDialog from "@/features/hr/components/modals/DisableEmployeeDialog";
import AttendanceConfigModal, { type AttendanceConfigState } from "@/features/hr/components/modals/AttendanceConfigModal";

export default function HREmployeesPage() {
  const [empList, setEmpList] = useState(employees);
  const [createOpen, setCreateOpen] = useState(false);
  const [lockTarget, setLockTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attConfig, setAttConfig] = useState<AttendanceConfigState>({
    gracePeriod: attendanceConfig.gracePeriod,
    shiftSwapMode: attendanceConfig.shiftSwapMode,
    requireReasonSwap: true,
    allowDoubleCheckin: true,
  });

  return (
    <div>
      <PageHeader
        title="Nhân sự"
        breadcrumb={[{ label: "HR", href: "#" }, { label: "Nhân sự" }]}
        actions={
          <>
            <Button variant="white" onClick={() => setAttendanceOpen(true)}>
              <IconSettings size={16} /> Cấu hình chấm công
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <IconPlus size={18} /> Tạo tài khoản nhân viên
            </Button>
          </>
        }
      />

      <EmployeeSection employees={empList} onLock={setLockTarget} onDelete={setDeleteTarget} />

      <CreateEmployeeModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <DisableEmployeeDialog
        employee={lockTarget}
        onConfirm={() => {
          if (lockTarget) setEmpList((prev) => prev.map((e) => (e.id === lockTarget.id ? { ...e, status: "vô hiệu hóa" as const } : e)));
          setLockTarget(null);
        }}
        onCancel={() => setLockTarget(null)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa nhân viên"
        message={`Xóa vĩnh viễn "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xác nhận xóa"
        tone="danger"
        onConfirm={() => {
          if (deleteTarget) setEmpList((prev) => prev.filter((e) => e.id !== deleteTarget.id));
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
      <AttendanceConfigModal open={attendanceOpen} onClose={() => setAttendanceOpen(false)} config={attConfig} setConfig={setAttConfig} />
    </div>
  );
}
