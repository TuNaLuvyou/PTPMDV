"use client";

import { useState } from "react";
import { IconSettings } from "@tabler/icons-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { shiftRequests, attendanceConfig } from "@/mock-data/portal";
import ShiftRequestSection from "@/features/hr/components/ShiftRequestSection";
import AttendanceConfigModal, { type AttendanceConfigState } from "@/features/hr/components/modals/AttendanceConfigModal";

export default function HRRequestsPage() {
  const [requests, setRequests] = useState(shiftRequests);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attConfig, setAttConfig] = useState<AttendanceConfigState>({
    gracePeriod: attendanceConfig.gracePeriod,
    shiftSwapMode: attendanceConfig.shiftSwapMode,
    requireReasonSwap: true,
    allowDoubleCheckin: true,
  });

  const handleApprove = (id: string) => setRequests((prev) => prev.map((x) => (x.id === id ? { ...x, status: "đã duyệt" as const } : x)));
  const handleReject = (id: string) => setRequests((prev) => prev.map((x) => (x.id === id ? { ...x, status: "từ chối" as const } : x)));

  return (
    <div>
      <PageHeader
        title="Yêu cầu đổi ca"
        breadcrumb={[{ label: "HR", href: "#" }, { label: "Yêu cầu đổi ca" }]}
        actions={
          <Button variant="white" onClick={() => setAttendanceOpen(true)}>
            <IconSettings size={16} /> Cấu hình chấm công
          </Button>
        }
      />

      <ShiftRequestSection requests={requests} onApprove={handleApprove} onReject={handleReject} />

      <AttendanceConfigModal open={attendanceOpen} onClose={() => setAttendanceOpen(false)} config={attConfig} setConfig={setAttConfig} />
    </div>
  );
}
