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
  faBuildingColumns,
  faCreditCard,
  faClock,
  faInfoCircle,
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

const COMMON_BANKS = [
  "Vietcombank",
  "VietinBank",
  "BIDV",
  "Techcombank",
  "MBBank",
  "Agribank",
  "VPBank",
  "ACB",
  "TPBank",
  "Sacombank",
  "HDBank",
  "VIB",
];

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

  // Tiền lương & Ngân hàng
  const [salaryType, setSalaryType] = useState<"hourly" | "monthly">("monthly");
  const [hourlySalary, setHourlySalary] = useState<number>(30_000);
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [bankName, setBankName] = useState("Vietcombank");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

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
      setSalaryType(employee.salaryType || (employee.role.toLowerCase().includes("lễ tân") || employee.role.toLowerCase().includes("kinh doanh") ? "hourly" : "monthly"));
      setHourlySalary(employee.hourlySalary ?? 35_000);
      setBaseSalary(employee.baseSalary ?? (employee.salaryType === "hourly" ? 0 : 8_500_000));
      setBankName(employee.bankName || "Vietcombank");
      setBankAccountNumber(employee.bankAccountNumber || "0123456789");
      setBankAccountName(employee.bankAccountName || employee.name.toUpperCase());
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
    setSalaryType(employee.salaryType || "monthly");
    setHourlySalary(employee.hourlySalary ?? 35_000);
    setBaseSalary(employee.baseSalary ?? 0);
    setBankName(employee.bankName || "Vietcombank");
    setBankAccountNumber(employee.bankAccountNumber || "0123456789");
    setBankAccountName(employee.bankAccountName || employee.name.toUpperCase());
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
      salaryType,
      hourlySalary: Number(hourlySalary) || 0,
      baseSalary: Number(baseSalary) || 0,
      bankName,
      bankAccountNumber,
      bankAccountName: bankAccountName.trim().toUpperCase(),
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
      size="xl"
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
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/70 border border-gray-200">
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
              <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${(isEditing ? salaryType : employee.salaryType) === "hourly" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"}`}>
                {(isEditing ? salaryType : employee.salaryType) === "hourly" ? "Lương theo giờ (Ca kíp)" : "Lương cơ bản tháng"}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nhóm 1: Thông tin cá nhân & liên hệ */}
            <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <FontAwesomeIcon icon={faUser} className="text-primary text-sm" />
                <h6 className="font-semibold text-gray-800 text-sm">Cá nhân & Liên hệ</h6>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Họ và tên:</span>
                  <span className="font-semibold text-gray-800 text-xs">{employee.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Số điện thoại:</span>
                  <span className="font-semibold text-gray-800 text-xs">{employee.phone}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Email công ty:</span>
                  <span className="font-semibold text-gray-800 text-xs truncate max-w-[150px]">{employee.email}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Trạng thái:</span>
                  <StatusBadge status={employee.status} />
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500 text-xs">Ngày vào làm:</span>
                  <span className="font-semibold text-gray-800 text-xs">{employee.joinDate || "01/01/2024"}</span>
                </div>
              </div>
            </div>

            {/* Nhóm 2: Thông tin công tác & phân quyền */}
            <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <FontAwesomeIcon icon={faBuilding} className="text-primary text-sm" />
                <h6 className="font-semibold text-gray-800 text-sm">Công tác & Phân quyền</h6>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Chi nhánh:</span>
                  <span className="font-semibold text-gray-800 text-xs">{employee.branch}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Phòng ban:</span>
                  <span className="font-semibold text-gray-800 text-xs">{employee.department || "Chưa gán"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Vị trí chức vụ:</span>
                  <span className="font-semibold text-gray-800 text-xs">{employee.role}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500 text-xs">Quyền hệ thống:</span>
                  <span className="font-semibold text-gray-800 text-xs">{getSystemRoleLabel(employee.systemRole)}</span>
                </div>
              </div>
            </div>

            {/* Nhóm 3: Cấu hình lương & Tài khoản ngân hàng (MỚI) */}
            <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-primary text-sm" />
                <h6 className="font-semibold text-gray-800 text-sm">Lương & Ngân hàng</h6>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Hình thức lương:</span>
                  <span className="font-semibold text-gray-800 text-xs">
                    {employee.salaryType === "hourly" ? "Theo giờ làm" : "Cố định tháng"}
                  </span>
                </div>

                {employee.salaryType === "hourly" ? (
                  <div className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="text-gray-500 text-xs">Lương theo giờ:</span>
                    <span className="font-bold text-amber-700 text-xs">
                      {(employee.hourlySalary ?? 35_000).toLocaleString("vi-VN")} ₫/h
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="text-gray-500 text-xs">Lương cơ bản:</span>
                    <span className="font-bold text-success-700 text-xs">
                      {(employee.baseSalary ?? 8_500_000).toLocaleString("vi-VN")} ₫/tháng
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Ngân hàng:</span>
                  <span className="font-semibold text-gray-800 text-xs">{employee.bankName || "Vietcombank"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Số tài khoản:</span>
                  <span className="font-mono font-bold text-primary text-xs">{employee.bankAccountNumber || "1023456789"}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500 text-xs">Chủ tài khoản:</span>
                  <span className="font-semibold text-gray-800 text-xs">{employee.bankAccountName || employee.name.toUpperCase()}</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] text-blue-700 leading-snug">
                {employee.salaryType === "hourly"
                  ? "💡 Ca làm việc khi checkout sẽ cộng theo số giờ làm thực tế (Số giờ × Đơn giá)."
                  : "💡 Hưởng lương cơ bản tháng. Khi checkout ca làm không cộng/trừ giờ, chỉ hiển thị số tiền trừ khi có phạt vi phạm."}
              </div>
            </div>
          </div>
        ) : (
          /* Chế độ chỉnh sửa (Edit Mode) */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 p-4 rounded-xl border border-gray-200 bg-white">
              <div className="md:col-span-2 pb-1 border-b border-gray-100 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-primary text-xs" />
                <h6 className="font-semibold text-gray-800 text-xs uppercase tracking-wide">1. Thông tin cá nhân & Công việc</h6>
              </div>

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

              <Field label="Vị trí / Chức danh" required>
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
            </div>

            {/* Khối chỉnh sửa Tiền lương & Ngân hàng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 p-4 rounded-xl border border-gray-200 bg-white">
              <div className="md:col-span-2 pb-1 border-b border-gray-100 flex items-center gap-2">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-primary text-xs" />
                <h6 className="font-semibold text-gray-800 text-xs uppercase tracking-wide">2. Cơ chế tiền lương & Tài khoản ngân hàng</h6>
              </div>

              <Field label="Hình thức tính lương" required>
                <Select
                  value={salaryType}
                  onChange={(e) => setSalaryType(e.target.value as "hourly" | "monthly")}
                >
                  <option value="hourly">Lương theo giờ (Cộng theo giờ khi checkout ca)</option>
                  <option value="monthly">Lương cơ bản tháng (Cố định, chỉ trừ khi phạt)</option>
                </Select>
              </Field>

              {salaryType === "hourly" ? (
                <Field label="Mức lương theo giờ (VNĐ/h)" required>
                  <Input
                    type="number"
                    value={hourlySalary}
                    onChange={(e) => setHourlySalary(Number(e.target.value))}
                    placeholder="30000"
                  />
                  <p className="text-[11px] text-amber-700 mt-1">
                    * Khi nhân viên checkout, tiền công sẽ được tính: <strong>Số giờ làm × {Number(hourlySalary || 0).toLocaleString()} ₫</strong>
                  </p>
                </Field>
              ) : (
                <Field label="Mức lương cơ bản tháng (VNĐ/tháng)" required>
                  <Input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    placeholder="8500000"
                  />
                  <p className="text-[11px] text-emerald-700 mt-1">
                    * Lương tháng cố định. Khi checkout ca làm chỉ hiển thị tiền phạt khấu trừ nếu vi phạm.
                  </p>
                </Field>
              )}

              <Field label="Tên ngân hàng" required>
                <Select value={bankName} onChange={(e) => setBankName(e.target.value)}>
                  {COMMON_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Số tài khoản (STK)" required>
                <Input
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Ví dụ: 1023456789"
                />
              </Field>

              <Field label="Tên chủ tài khoản" required className="md:col-span-2">
                <Input
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                  placeholder="NGUYEN VAN A"
                />
              </Field>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
