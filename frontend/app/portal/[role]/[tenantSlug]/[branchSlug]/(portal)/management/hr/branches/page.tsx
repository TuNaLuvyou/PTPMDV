"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { branches as initialBranches, type Branch } from "@/mock-data/portal";
import BranchSection from "@/features/hr/branches/components/BranchSection";
import BranchModal from "@/features/hr/branches/components/modals/BranchModal";

export default function HRBranchesPage() {
  const [list, setList] = useState<Branch[]>(initialBranches);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [lockTarget, setLockTarget] = useState<Branch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);

  const handleSave = (data: Omit<Branch, "id"> & { id?: string }) => {
    if (data.id) {
      setList((prev) => prev.map((b) => (b.id === data.id ? { ...b, ...data } as Branch : b)));
    } else {
      const created: Branch = { id: `b-${Date.now()}`, name: data.name, slug: data.slug, address: data.address, phone: data.phone, manager: data.manager, status: data.status, staff: 0 };
      setList((prev) => [...prev, created]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Quản lý Chi nhánh"
        breadcrumb={[{ label: "HR", href: "#" }, { label: "Chi nhánh" }]}
        actions={
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <IconPlus size={18} /> Thêm chi nhánh
          </Button>
        }
      />

      <BranchSection
        branches={list}
        onEdit={(b) => { setEditing(b); setModalOpen(true); }}
        onLock={setLockTarget}
        onDelete={setDeleteTarget}
      />

      <BranchModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} branch={editing} onSave={handleSave} />

      <ConfirmDialog
        open={!!lockTarget}
        title="Khóa chi nhánh"
        message={`Khóa "${lockTarget?.name}"? Chi nhánh sẽ chuyển sang trạng thái vô hiệu hóa.`}
        confirmLabel="Xác nhận khóa"
        tone="warning"
        onConfirm={() => {
          if (lockTarget) setList((prev) => prev.map((b) => (b.id === lockTarget.id ? { ...b, status: "vô hiệu hóa" as const } : b)));
          setLockTarget(null);
        }}
        onCancel={() => setLockTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa chi nhánh"
        message={`Xóa vĩnh viễn "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xác nhận xóa"
        tone="danger"
        onConfirm={() => {
          if (deleteTarget) setList((prev) => prev.filter((b) => b.id !== deleteTarget.id));
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
