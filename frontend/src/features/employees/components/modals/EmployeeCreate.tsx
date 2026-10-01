"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Form";
import { apiGet, apiPost } from "@/lib/api";
import type { Branch, Department, Employee } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  isManager?: boolean;
  managerBranch?: string;
  defaultBranch?: string;
  branches?: Branch[];
  departments?: Department[];
  onCreated?: (emp: Employee) => void;
}

export default function CreateEmployeeModal({
  open,
  onClose,
  isManager = false,
  managerBranch = "hn-1",
  defaultBranch,
  branches: branchesProp,
  departments: departmentsProp,
  onCreated,
}: Props) {
  const [branchesState, setBranchesState] = useState<Branch[]>(branchesProp ?? []);
  const [departmentsState, setDepartmentsState] = useState<Department[]>(departmentsProp ?? []);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState(managerBranch || "HN-1");
  const [department, setDepartment] = useState("Phòng Kinh Doanh");
  const [role, setRole] = useState("Nhân viên");
  const [salaryType, setSalaryType] = useState<"hourly" | "monthly">("monthly");
  const [hourlySalary, setHourlySalary] = useState("35000");
  const [baseSalary, setBaseSalary] = useState("8500000");
  const [bankName, setBankName] = useState("Vietcombank");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if ((branchesProp ?? []).length === 0) {
      apiGet<Branch[]>("/api/branches").then((d) => setBranchesState(d || [])).catch(() => {});
    } else {
      setBranchesState(branchesProp ?? []);
    }
    if ((departmentsProp ?? []).length === 0) {
      apiGet<Department[]>("/api/departments").then((d) => setDepartmentsState(d || [])).catch(() => {});
    } else {
      setDepartmentsState(departmentsProp ?? []);
    }
  }, [open, branchesProp, departmentsProp]);

  const branches = branchesState;
  const departments = departmentsState;
  const fixedBranch = isManager ? managerBranch : defaultBranch ?? branches[0]?.slug ?? "hn-1";

  const handleCreate = async () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Vui lòng điền đủ các trường bắt buộc (Họ tên, SĐT, Email, Mật khẩu)");
      return;
    }
    try {
      setSubmitting(true);
      setErrorMsg(null);
      const res = await apiPost<Employee>("/api/employees", {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password: password.trim(),
        branch: isManager ? managerBranch : branch,
        branchSlug: isManager ? managerBranch : branch,
        department,
        role,
        systemRole: role === "Quản lý" ? "manager" : "staff",
        salaryType,
        hourlySalary: salaryType === "hourly" ? Number(hourlySalary) || 0 : undefined,
        baseSalary: salaryType === "monthly" ? Number(baseSalary) || 0 : undefined,
        bankName,
        bankAccountNumber: bankAccountNumber.trim(),
        status: "đang làm",
        joinDate: new Date().toLocaleDateString("vi-VN").replace(/\//g, "-"),
      });
      if (onCreated && res) {
        onCreated(res);
      }
      onClose();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Lỗi khi tạo nhân viên");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo tài khoản nhân viên"
      size="lg"
      footer={
        <>
          <Button variant="white" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? "Đang tạo..." : "Tạo"}
          </Button>
        </>
      }
    >
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {errorMsg}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Họ tên" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ và tên nhân viên" />
        </Field>
        <Field label="SĐT" required>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901 234 567" />
        </Field>
        <Field label="Email" required>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nv@company.com" />
        </Field>
        <Field label="Mật khẩu" required>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu ban đầu" />
        </Field>
        <Field label="Gán chi nhánh" required>
          {isManager ? (
            <div className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-bold text-gray-800 flex items-center justify-between">
              <span>
                {branches.find((b) => b.slug.toLowerCase() === fixedBranch.toLowerCase())?.name ??
                  `Chi nhánh ${fixedBranch.toUpperCase()}`}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-primary-50 text-primary border border-primary-200">
                Cố định
              </span>
            </div>
          ) : (
            <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
              {branches.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
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
        <Field label="Vai trò" required>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Nhân viên">Nhân viên</option>
            <option value="Trưởng nhóm">Trưởng nhóm</option>
            <option value="Quản lý">Quản lý</option>
            <option value="Nhân sự">Nhân sự</option>
            <option value="Kế toán">Kế toán</option>
          </Select>
        </Field>
        <Field label="Hình thức tính lương" required>
          <Select value={salaryType} onChange={(e) => setSalaryType(e.target.value as "hourly" | "monthly")}>
            <option value="monthly">Lương cơ bản tháng</option>
            <option value="hourly">Lương theo giờ</option>
          </Select>
        </Field>
        <Field label="Mức lương (VNĐ)" required>
          <Input
            type="number"
            value={salaryType === "monthly" ? baseSalary : hourlySalary}
            onChange={(e) => {
              if (salaryType === "monthly") setBaseSalary(e.target.value);
              else setHourlySalary(e.target.value);
            }}
            placeholder="Ví dụ: 35000 hoặc 8500000"
          />
        </Field>
        <Field label="Ngân hàng" required>
          <Select value={bankName} onChange={(e) => setBankName(e.target.value)}>
            <option value="Vietcombank">Vietcombank</option>
            <option value="VietinBank">VietinBank</option>
            <option value="BIDV">BIDV</option>
            <option value="Techcombank">Techcombank</option>
            <option value="MBBank">MBBank</option>
            <option value="Agribank">Agribank</option>
          </Select>
        </Field>
        <Field label="Số tài khoản (STK)" required className="md:col-span-2">
          <Input
            value={bankAccountNumber}
            onChange={(e) => setBankAccountNumber(e.target.value)}
            placeholder="Số tài khoản ngân hàng nhận lương"
          />
        </Field>
      </div>
    </Modal>
  );
}
