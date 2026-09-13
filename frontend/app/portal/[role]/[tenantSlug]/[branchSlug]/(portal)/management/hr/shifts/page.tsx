"use client";

import { useState } from "react";
import { IconDownload, IconUsers } from "@tabler/icons-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { shiftHistory, employees } from "@/mock-data/portal";
import type { ShiftTemplate, WorkShift } from "@/features/hr/shifts/types";
import ShiftTemplateSection from "@/features/hr/shifts/components/ShiftTemplateSection";
import WorkShiftSection from "@/features/hr/shifts/components/WorkShiftSection";
import ShiftHistorySection from "@/features/hr/shifts/components/ShiftHistorySection";
import TemplateModal from "@/features/hr/shifts/components/modals/TemplateModal";
import AssignShiftModal from "@/features/hr/shifts/components/modals/AssignShiftModal";
import ExportModal from "@/features/hr/shifts/components/modals/ExportModal";

const initialTemplates: ShiftTemplate[] = [
  { id: "t1", name: "Ca Sáng", startTime: "07:00", endTime: "14:00" },
  { id: "t2", name: "Ca Chiều", startTime: "14:00", endTime: "22:00" },
  { id: "t3", name: "Ca Tối (Part-time)", startTime: "18:00", endTime: "23:00" },
];

const initialWorkShifts: WorkShift[] = [
  { id: "ws1", employee: "Nguyễn Thu Hà", branch: "HN-1", date: "17/08/2026", templateName: "Ca Sáng", scheduled: "07:00-14:00", checkIn: "06:58", checkOut: "14:02", status: "Đúng giờ" },
  { id: "ws2", employee: "Phạm Quỳnh Trang", branch: "HN-1", date: "17/08/2026", templateName: "Ca Sáng", scheduled: "07:00-14:00", checkIn: "07:06", checkOut: "14:00", status: "Trễ" },
  { id: "ws3", employee: "Hoàng Minh Đức", branch: "HN-1", date: "17/08/2026", templateName: "Ca Chiều", scheduled: "14:00-22:00", checkIn: "13:55", checkOut: "—", status: "Đúng giờ" },
  { id: "ws4", employee: "Vũ Thành Công", branch: "HN-1", date: "17/08/2026", templateName: "Ca Chiều", scheduled: "14:00-22:00", checkIn: "14:01", checkOut: "—", status: "Đúng giờ" },
];

export default function ShiftsManagementPage() {
  const [templates, setTemplates] = useState<ShiftTemplate[]>(initialTemplates);
  const [workShiftList, setWorkShiftList] = useState<WorkShift[]>(initialWorkShifts);
  const [exportOpen, setExportOpen] = useState(false);
  const [addTemplateOpen, setAddTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const [assignShiftOpen, setAssignShiftOpen] = useState(false);

  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateStart, setNewTemplateStart] = useState("07:00");
  const [newTemplateEnd, setNewTemplateEnd] = useState("14:00");

  const [assignEmployee, setAssignEmployee] = useState(employees[0]?.name ?? "Nguyễn Thu Hà");
  const [assignBranch, setAssignBranch] = useState("HN-1");
  const [assignDate, setAssignDate] = useState("17/08/2026");
  const [assignTemplateId, setAssignTemplateId] = useState(templates[0]?.id ?? "");
  const [assignNote, setAssignNote] = useState("");

  const openAddTemplate = () => {
    setEditingTemplate(null);
    setNewTemplateName("");
    setNewTemplateStart("07:00");
    setNewTemplateEnd("14:00");
    setAddTemplateOpen(true);
  };

  const openEditTemplate = (t: ShiftTemplate) => {
    setEditingTemplate(t);
    setNewTemplateName(t.name);
    setNewTemplateStart(t.startTime);
    setNewTemplateEnd(t.endTime);
    setAddTemplateOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName) return;
    if (editingTemplate) {
      setTemplates((prev) => prev.map((t) => (t.id === editingTemplate.id ? { ...t, name: newTemplateName, startTime: newTemplateStart, endTime: newTemplateEnd } : t)));
    } else {
      setTemplates((prev) => [...prev, { id: `t-${Date.now()}`, name: newTemplateName, startTime: newTemplateStart, endTime: newTemplateEnd }]);
    }
    setAddTemplateOpen(false);
    setEditingTemplate(null);
    setNewTemplateName("");
  };

  const handleAssignShift = () => {
    const template = templates.find((t) => t.id === assignTemplateId) || templates[0];
    const created: WorkShift = {
      id: `ws-${Date.now()}`,
      employee: assignEmployee,
      branch: assignBranch,
      date: assignDate,
      templateName: template.name,
      scheduled: `${template.startTime}-${template.endTime}`,
      checkIn: "—",
      checkOut: "—",
      status: "Chưa làm",
      note: assignNote,
    };
    setWorkShiftList((prev) => [created, ...prev]);
    setAssignShiftOpen(false);
    setAssignNote("");
  };

  return (
    <div>
      <PageHeader
        title="Quản lý Ca Làm Việc & Phân Công Xếp Ca"
        breadcrumb={[{ label: "HR & Quản trị", href: "#" }, { label: "Xếp ca & Lịch làm" }]}
        actions={
          <>
            <Button variant="white" onClick={() => setExportOpen(true)}>
              <IconDownload size={16} /> Xuất báo cáo
            </Button>
            <Button onClick={() => setAssignShiftOpen(true)}>
              <IconUsers size={18} /> Phân công nhân viên
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-6">
        <ShiftTemplateSection templates={templates} onAdd={openAddTemplate} onEdit={openEditTemplate} onDelete={(id) => setTemplates((prev) => prev.filter((t) => t.id !== id))} />
        <WorkShiftSection workShifts={workShiftList} onDelete={(id) => setWorkShiftList((prev) => prev.filter((s) => s.id !== id))} />
        <ShiftHistorySection shiftHistory={shiftHistory} />
      </div>

      <TemplateModal
        open={addTemplateOpen}
        onClose={() => setAddTemplateOpen(false)}
        editing={!!editingTemplate}
        name={newTemplateName}
        start={newTemplateStart}
        end={newTemplateEnd}
        onNameChange={setNewTemplateName}
        onStartChange={setNewTemplateStart}
        onEndChange={setNewTemplateEnd}
        onSave={handleSaveTemplate}
      />

      <AssignShiftModal
        open={assignShiftOpen}
        onClose={() => setAssignShiftOpen(false)}
        templates={templates}
        employee={assignEmployee}
        branch={assignBranch}
        date={assignDate}
        templateId={assignTemplateId}
        note={assignNote}
        onEmployeeChange={setAssignEmployee}
        onBranchChange={setAssignBranch}
        onDateChange={setAssignDate}
        onTemplateChange={setAssignTemplateId}
        onNoteChange={setAssignNote}
        onSave={handleAssignShift}
      />

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
