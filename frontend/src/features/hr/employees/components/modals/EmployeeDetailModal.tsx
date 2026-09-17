"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faCheck,
  faXmark,
  faUser,
  faBuilding,
  faPhone,
  faEnvelope,
  faIdCard,
  faBriefcase,
  faCalendarDay,
  faMoneyBillWave,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Form";
import Badge, { StatusBadge } from "@/components/ui/Badge";
import { branches, departments } from "@/mock-data/portal";
import type { Employee, UserRole } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave?: (updated: Employee) => void;
  isManager?: boolean;
  managerBranch?: string;
}

export default function EmployeeDetailModal({
  open,
  onClose,
  employee,
  onSave,
  isManager = false,
  managerBranch = "HN-1",
}: Props) {
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [systemRole, setSystemRole] = useState<UserRole>("staff");
  const [status, setStatus] = useState<"đang làm" | "vô hiệu hóa">("đang làm");
  const [joinDate, setJoinDate] = useState("");
  const [baseSalary, setBaseSalary] = useState<number>(0);

  // Đồng bộ dữ liệu khi mở modal hoặc chọn nhân viên khác
  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setPhone(employee.phone);
      setEmail(employee.email);
      setBranch(employee.branch);
      setDepartment(employee.department || departments[0]?.name || "Phòng Vận Hành");
      setRole(employee.role);
      setSystemRole(employee.systemRole || "staff");
      setStatus(employee.status);
      setJoinDate(employee.joinDate || "01/01/2024");
      setBaseSalary(employee.baseSalary || 10_000_000);
      setIsEditing(false);
    }
  }, [employee, open]);

  if (!employee) return null;

  const handleCancelEdit = () => {
    // Hoàn tác về dữ liệu ban đầu của nhân viên
    setName(employee.name);
    setPhone(employee.phone);
    setEmail(employee.email);
    setBranch(employee.branch);
    setDepartment(employee.department || departments[0]?.name || "Phòng Vận Hành");
    setRole(employee.role);
    setSystemRole(employee.systemRole || "staff");
    setStatus(employee.status);
    setJoinDate(employee.joinDate || "01/01/2024");
    setBaseSalary(employee.baseSalary || 10_000_000);
    setIsEditing(false);
  };

  const handleSave = () => {
    const updated: Employee = {
      ...employee,
      name,
      phone,
      email,
      branch: isManager ? managerBranch : branch,
      department,
      role,
      systemRole,
      status,
      joinDate,
      baseSalary: Number(baseSalary) || 0,
    };

    if (onSave) {
      onSave(updated);
    }
    setIsEditing(false);
  };

  const getSystemRoleLabel = (r: UserRole) => {
    switch (r) {
      case "admin":
        return "Quản trị viên (Admin)";
      case "manager":
        return "Quản lý Chi nhánh (Manager)";
      case "staff":
      default:
        return "Nhân viên (Staff)";
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Chỉnh sửa thông tin nhân viên" : "Hồ sơ chi tiết nhân viên"}
      size="lg"
      footer={
        isEditing ? (
          <>
            <Button variant="white" onClick={handleCancelEdit}>
              <FontAwesomeIcon icon={faXmark} className="mr-1.5" />
              Huỷ
            </Button>
            <Button onClick={handleSave}>
              <FontAwesomeIcon icon={faCheck} className="mr-1.5" />
              Lưu
            </Button>
          </>
        ) : (
          <>
            <Button variant="white" onClick={onClose}>
              Đóng
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              <FontAwesomeIcon icon={faPencil} className="mr-1.5" />
              Sửa
            </Button>
          </>
        )
      }
    >
      <div className="space-y-5">
        {/* Header Profile Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/60 border border-gray-200">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xl font-bold shrink-0">
            {employee.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-lg font-bold text-gray-900 truncate">{employee.name}</h4>
              <StatusBadge status={isEditing ? status : employee.status} />
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {isEditing ? department : employee.department || "Chưa gán"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>Mã NV: <strong className="text-gray-700">{employee.id}</strong></span>
              <span>•</span>
              <span>Chi nhánh: <strong className="text-gray-700">{isEditing ? branch : employee.branch}</strong></span>
              <span>•</span>
              <span>Chức vụ: <strong className="text-gray-700">{isEditing ? role : employee.role}</strong></span>
            </p>
          </div>
        </div>

        {/* Chế độ xem chi tiết (View Mode) */}
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nhóm 1: Thông tin cá nhân & liên hệ */}
            <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <FontAwesomeIcon icon={faUser} className="text-primary text-sm" />
                <h6 className="font-semibold text-gray-800 text-sm">Thông tin cá nhân & liên hệ</h6>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faIdCard} className="text-gray-400 text-xs w-4" />
                    Họ và tên:
                  </span>
                  <span className="font-semibold text-gray-800">{employee.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faPhone} className="text-gray-400 text-xs w-4" />
                    Số điện thoại:
                  </span>
                  <span className="font-semibold text-gray-800">{employee.phone}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 text-xs w-4" />
                    Email công ty:
                  </span>
                  <span className="font-semibold text-gray-800">{employee.email}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-gray-400 text-xs w-4" />
                    Trạng thái:
                  </span>
                  <StatusBadge status={employee.status} />
                </div>
              </div>
            </div>

            {/* Nhóm 2: Thông tin công tác & phân quyền */}
            <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <FontAwesomeIcon icon={faBuilding} className="text-primary text-sm" />
                <h6 className="font-semibold text-gray-800 text-sm">Công tác & Phân quyền</h6>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuilding} className="text-gray-400 text-xs w-4" />
                    Chi nhánh:
                  </span>
                  <span className="font-semibold text-gray-800">{employee.branch}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBriefcase} className="text-gray-400 text-xs w-4" />
                    Phòng ban:
                  </span>
                  <span className="font-semibold text-gray-800">{employee.department || "Chưa gán"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faIdCard} className="text-gray-400 text-xs w-4" />
                    Vị trí công việc:
                  </span>
                  <span className="font-semibold text-gray-800">{employee.role}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-gray-400 text-xs w-4" />
                    Quyền hệ thống:
                  </span>
                  <span className="font-semibold text-gray-800">{getSystemRoleLabel(employee.systemRole)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarDay} className="text-gray-400 text-xs w-4" />
                    Ngày vào làm:
                  </span>
                  <span className="font-semibold text-gray-800">{employee.joinDate || "01/01/2024"}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-gray-400 text-xs w-4" />
                    Lương cơ bản:
                  </span>
                  <span className="font-bold text-success-700">
                    {(employee.baseSalary ?? 10_000_000).toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chế độ chỉnh sửa (Edit Mode) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <Field label="Họ và tên" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </Field>

            <Field label="Số điện thoại" required>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
              />
            </Field>

            <Field label="Email công ty" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
              />
            </Field>

            <Field label="Chi nhánh làm việc" required>
              {isManager ? (
                <div className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-bold text-gray-800 flex items-center justify-between">
                  <span>{managerBranch}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary-50 text-primary border border-primary-200">
                    Cố định
                  </span>
                </div>
              ) : (
                <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
                  {branches.map((b) => (
                    <option key={b.id} value={b.slug.toUpperCase()}>
                      {b.name} ({b.slug.toUpperCase()})
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="Phòng ban" required>
              <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Vị trí / Chức vụ" required>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Nhân viên kinh doanh / Thu ngân..."
              />
            </Field>

            <Field label="Quyền hệ thống" required>
              <Select
                value={systemRole}
                onChange={(e) => setSystemRole(e.target.value as UserRole)}
                disabled={isManager}
              >
                <option value="staff">Nhân viên (Staff)</option>
                <option value="manager">Quản lý Chi nhánh (Manager)</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </Select>
            </Field>

            <Field label="Trạng thái tài khoản" required>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as "đang làm" | "vô hiệu hóa")}
              >
                <option value="đang làm">Đang làm</option>
                <option value="vô hiệu hóa">Vô hiệu hóa</option>
              </Select>
            </Field>

            <Field label="Ngày vào làm">
              <Input
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                placeholder="01/01/2024"
              />
            </Field>

            <Field label="Lương cơ bản (VNĐ)">
              <Input
                type="number"
                value={baseSalary}
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                placeholder="10000000"
              />
            </Field>
          </div>
        )}
      </div>
    </Modal>
  );
}
