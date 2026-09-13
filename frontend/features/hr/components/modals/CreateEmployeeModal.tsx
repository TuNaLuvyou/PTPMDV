"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Form";
import { branches } from "@/mock-data/portal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateEmployeeModal({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo tài khoản nhân viên"
      footer={
        <>
          <Button variant="white" onClick={onClose}>Hủy</Button>
          <Button onClick={onClose}>Tạo</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <Field label="Họ tên" required><Input placeholder="Họ và tên nhân viên" /></Field>
        <Field label="SĐT" required><Input placeholder="0901 234 567" /></Field>
        <Field label="Email" required><Input type="email" placeholder="nv@company.com" /></Field>
        <Field label="Mật khẩu" required><Input type="password" placeholder="Mật khẩu ban đầu" /></Field>
        <Field label="Gán chi nhánh" required>
          <Select defaultValue={branches[0]?.slug ?? "hn-1"}>
            {branches.map((b) => (
              <option key={b.id} value={b.slug}>{b.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Vai trò" required>
          <Select defaultValue="nv">
            <option value="nv">Nhân viên</option>
            <option value="truong-nhom">Trưởng nhóm</option>
            <option value="quan-ly">Quản lý</option>
            <option value="nhan-su">Nhân sự</option>
            <option value="ke-toan">Kế toán</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
