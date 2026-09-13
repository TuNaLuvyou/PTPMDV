"use client";

import { useState } from "react";
import { IconSettings } from "@tabler/icons-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { payslips, attendanceConfig, type Payslip } from "@/mock-data/portal";
import PayslipSection from "@/features/hr/components/PayslipSection";
import BulkClosePayslipModal from "@/features/hr/components/modals/BulkClosePayslipModal";
import AttendanceConfigModal, { type AttendanceConfigState } from "@/features/hr/components/modals/AttendanceConfigModal";
import { EditPayslipModal, ConfirmClosePayslipDialog, PrintPayslipModal } from "@/features/hr/components/modals/PayslipModals";

export default function HRPayslipsPage() {
  const [slips, setSlips] = useState(payslips);
  const [closeSlipOpen, setCloseSlipOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [editSlipTarget, setEditSlipTarget] = useState<Payslip | null>(null);
  const [editBonusStr, setEditBonusStr] = useState("");
  const [editPenaltyStr, setEditPenaltyStr] = useState("");
  const [editReasonStr, setEditReasonStr] = useState("");
  const [printSlipTarget, setPrintSlipTarget] = useState<Payslip | null>(null);
  const [confirmCloseSlipTarget, setConfirmCloseSlipTarget] = useState<Payslip | null>(null);
  const [attConfig, setAttConfig] = useState<AttendanceConfigState>({
    gracePeriod: attendanceConfig.gracePeriod,
    shiftSwapMode: attendanceConfig.shiftSwapMode,
    requireReasonSwap: true,
    allowDoubleCheckin: true,
  });

  const handleSavePayslipEdit = () => {
    if (!editSlipTarget) return;
    const bonusVal = Math.max(0, Number(editBonusStr) || 0);
    const penaltyVal = Math.max(0, Number(editPenaltyStr) || 0);
    if ((bonusVal > 0 || penaltyVal > 0) && !editReasonStr.trim()) {
      alert("Vui lòng nhập lý do điều chỉnh khi có tiền thưởng hoặc phạt!");
      return;
    }
    setSlips((prev) => prev.map((s) => (s.id === editSlipTarget.id ? { ...s, bonus: bonusVal, penalty: penaltyVal, reason: editReasonStr.trim() || undefined, total: s.salary + bonusVal - penaltyVal } : s)));
    setEditSlipTarget(null);
  };

  return (
    <div>
      <PageHeader
        title="Phiếu lương"
        breadcrumb={[{ label: "HR", href: "#" }, { label: "Phiếu lương" }]}
        actions={
          <Button variant="white" onClick={() => setAttendanceOpen(true)}>
            <IconSettings size={16} /> Cấu hình chấm công
          </Button>
        }
      />

      <PayslipSection
        payslips={slips}
        onEdit={(p) => {
          setEditSlipTarget(p);
          setEditBonusStr(p.bonus ? String(p.bonus) : "");
          setEditPenaltyStr(p.penalty ? String(p.penalty) : "");
          setEditReasonStr(p.reason ?? "");
        }}
        onCloseOne={setConfirmCloseSlipTarget}
        onPrint={setPrintSlipTarget}
        onBulkClose={() => setCloseSlipOpen(true)}
      />

      <BulkClosePayslipModal open={closeSlipOpen} onClose={() => setCloseSlipOpen(false)} />
      <AttendanceConfigModal open={attendanceOpen} onClose={() => setAttendanceOpen(false)} config={attConfig} setConfig={setAttConfig} />

      <EditPayslipModal
        payslip={editSlipTarget}
        bonusStr={editBonusStr}
        penaltyStr={editPenaltyStr}
        reasonStr={editReasonStr}
        onBonusChange={setEditBonusStr}
        onPenaltyChange={setEditPenaltyStr}
        onReasonChange={setEditReasonStr}
        onClose={() => setEditSlipTarget(null)}
        onSave={handleSavePayslipEdit}
      />
      <ConfirmClosePayslipDialog
        payslip={confirmCloseSlipTarget}
        onConfirm={() => {
          if (confirmCloseSlipTarget) setSlips((prev) => prev.map((s) => (s.id === confirmCloseSlipTarget.id ? { ...s, status: "đã chốt" as const } : s)));
          setConfirmCloseSlipTarget(null);
        }}
        onCancel={() => setConfirmCloseSlipTarget(null)}
      />
      <PrintPayslipModal payslip={printSlipTarget} onClose={() => setPrintSlipTarget(null)} />
    </div>
  );
}
