"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Field, Input, Select, Checkbox } from "@/components/ui/Form";
import type { ShiftTemplate } from "@/features/shifts/types";
import type { Employee } from "@/types";
import type { BranchOption } from "@/lib/branches";

interface Props {
  open: boolean;
  onClose: () => void;
  templates: ShiftTemplate[];
  employee: string;
  branch: string;
  branches?: BranchOption[];
  date: string;
  templateId: string;
  note: string;
  isRecurring: boolean;
  isManager?: boolean;
  managerBranch?: string;
  lockedBranch?: string;
  employees?: Employee[];
  onEmployeeChange: (v: string) => void;
  onBranchChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onTemplateChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onRecurringChange: (v: boolean) => void;
  onSave: () => void;
}

export default function AssignShiftModal({
  open,
  onClose,
  templates,
  employee,
  branch,
  date,
  templateId,
  note,
  isRecurring,
  isManager = false,
  managerBranch,
  lockedBranch,
  employees: employeesProp,
  branches: branchesProp = [],
  onEmployeeChange,
  onBranchChange,
  onDateChange,
  onTemplateChange,
  onNoteChange,
  onRecurringChange,
  onSave,
}: Props) {
  const empList = employeesProp ?? [];
  const isBranchLocked = isManager || (lockedBranch !== undefined && lockedBranch !== "all" && lockedBranch !== "");
  const branchDisplay = isManager ? (managerBranch ?? branch) : (lockedBranch && lockedBranch !== "all" ? lockedBranch : branch);
  return (
    <Modal open={open} onClose={onClose} title="Phân công nhân viên vào ca" size="lg" footer={<><Button variant="white" onClick={onClose}>Hủy</Button><Button onClick={onSave}>Phân công</Button></>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        <Field label="Nhân viên" required>
          <Select value={employee} onChange={(e) => onEmployeeChange(e.target.value)}>
            {empList.filter((e) => e.status === "đang làm").map((emp) => (
              <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
            ))}
          </Select>
        </Field>
        <Field label="Chi nhánh" required>
          {isBranchLocked ? (
            <div className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-bold text-gray-800 flex items-center justify-between">
              <span>Chi nhánh {branchDisplay}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-primary-50 text-primary border border-primary-200">{isManager ? "Cố định" : "Đã chọn"}</span>
            </div>
          ) : branchesProp.length > 0 ? (
            <Select value={branch} onChange={(e) => onBranchChange(e.target.value)}>
              {branchesProp.map((b) => (
                <option key={b.slug} value={b.slug}>{b.name || b.slug}</option>
              ))}
            </Select>
          ) : (
            <div className="px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-800">
              Chưa tải được danh mục chi nhánh từ máy chủ.
            </div>
          )}
          {isManager && <p className="text-[11px] text-gray-400 mt-1">Manager chỉ phân ca cho chi nhánh phụ trách</p>}
          {!isManager && isBranchLocked && <p className="text-[11px] text-gray-400 mt-1">Đã khóa theo chi nhánh đã chọn ở bộ lọc tổng</p>}
        </Field>
        <Field label="Ngày làm việc" required>
          <Input type="text" placeholder="VD: 17/08/2026" value={date} onChange={(e) => onDateChange(e.target.value)} />
        </Field>
        <Field label="Khung ca áp dụng" required>
          <Select value={templateId} onChange={(e) => onTemplateChange(e.target.value)}>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.startTime} - {t.endTime})</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Ghi chú phân công (tùy chọn)">
        <Input placeholder="VD: Phụ trách ca chính, hỗ trợ chi nhánh..." value={note} onChange={(e) => onNoteChange(e.target.value)} />
      </Field>
      <div className="mt-1">
        <Checkbox
          label="Lặp lại"
          checked={isRecurring}
          onChange={(e) => onRecurringChange(e.target.checked)}
        />
        <p className="text-[11px] text-gray-400 mt-1 ml-6">Áp dụng ca này lặp lại hàng tuần cho nhân viên</p>
      </div>
    </Modal>
  );
}
