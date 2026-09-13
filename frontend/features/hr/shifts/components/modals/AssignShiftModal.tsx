"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Form";
import { employees } from "@/mock-data/portal";
import type { ShiftTemplate } from "@/features/hr/shifts/types";

interface Props {
  open: boolean;
  onClose: () => void;
  templates: ShiftTemplate[];
  employee: string;
  branch: string;
  date: string;
  templateId: string;
  note: string;
  onEmployeeChange: (v: string) => void;
  onBranchChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onTemplateChange: (v: string) => void;
  onNoteChange: (v: string) => void;
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
  onEmployeeChange,
  onBranchChange,
  onDateChange,
  onTemplateChange,
  onNoteChange,
  onSave,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Phân công nhân viên vào ca" size="md" footer={<><Button variant="white" onClick={onClose}>Hủy</Button><Button onClick={onSave}>Phân công</Button></>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <Field label="Nhân viên" required>
          <Select value={employee} onChange={(e) => onEmployeeChange(e.target.value)}>
            {employees.filter((e) => e.status === "đang làm").map((emp) => (
              <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
            ))}
          </Select>
        </Field>
        <Field label="Chi nhánh" required>
          <Select value={branch} onChange={(e) => onBranchChange(e.target.value)}>
            <option value="HN-1">Chi nhánh HN-1</option>
            <option value="HN-2">Chi nhánh HN-2</option>
            <option value="ĐN-1">Chi nhánh ĐN-1</option>
          </Select>
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
    </Modal>
  );
}
