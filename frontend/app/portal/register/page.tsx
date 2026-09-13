"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconUserCog, IconCheck, IconArrowRight } from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import RegisterForm from "@/features/auth/components/RegisterForm";
import CreateCompanyForm from "@/features/auth/components/CreateCompanyForm";

type Step = "register" | "create" | "success-create";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("register");
  const [userData, setUserData] = useState<{ name: string; email: string; phone: string }>({ name: "", email: "", phone: "" });
  const [companySlug, setCompanySlug] = useState("");

  const handleRegisterSuccess = (data: { name: string; email: string; phone: string }) => {
    setUserData(data);
    setStep("create");
  };

  const handleCreateCompany = (data: { companyName: string; slug: string }) => {
    setCompanySlug(data.slug);
    setStep("success-create");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/portal/login" className="inline-flex items-center gap-2.5 mb-5 hover:opacity-80 transition-opacity">
            <span className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center">
              <IconUserCog size={24} />
            </span>
            <span className="text-xl font-bold text-gray-800">HR System</span>
          </Link>
          {step === "register" && (
            <>
              <h1 className="text-2xl font-semibold mb-1">Tạo tài khoản mới</h1>
              <p className="text-gray-500 text-sm">Gia nhập hệ thống quản lý Nhân sự</p>
            </>
          )}
          {step === "create" && (
            <>
              <h1 className="text-2xl font-semibold mb-1">Tạo doanh nghiệp</h1>
              <p className="text-gray-500 text-sm">Doanh nghiệp mặc định sau khi đăng ký</p>
            </>
          )}
        </div>

        {/* Step indicator */}
        {step === "register" && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-8 h-1.5 rounded-full bg-primary" />
            <span className="w-8 h-1.5 rounded-full bg-gray-200" />
            <span className="w-8 h-1.5 rounded-full bg-gray-200" />
          </div>
        )}
        {step === "create" && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-8 h-1.5 rounded-full bg-success" />
            <span className="w-8 h-1.5 rounded-full bg-primary" />
            <span className="w-8 h-1.5 rounded-full bg-gray-200" />
          </div>
        )}
        {step === "success-create" && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-8 h-1.5 rounded-full bg-success" />
            <span className="w-8 h-1.5 rounded-full bg-success" />
            <span className="w-8 h-1.5 rounded-full bg-success" />
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-300 shadow-card p-6">
          {step === "register" && <RegisterForm onSuccess={handleRegisterSuccess} />}
          {step === "create" && (
            <CreateCompanyForm
              initialName={userData.name}
              initialEmail={userData.email}
              initialPhone={userData.phone}
              onBack={() => setStep("register")}
              onSubmit={handleCreateCompany}
            />
          )}

          {step === "success-create" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-success-100 text-success-700 flex items-center justify-center mx-auto mb-4">
                <IconCheck size={26} />
              </div>
              <h3 className="font-semibold text-gray-800">Tạo doanh nghiệp thành công!</h3>
              <p className="text-sm text-gray-500 mt-2">Doanh nghiệp <b className="text-gray-700">{companySlug}</b> đã sẵn sàng. Bạn là Quản trị viên.</p>
              <p className="text-xs text-gray-400 mt-1">{userData.name} • {userData.email} • {userData.phone}</p>
              <Button block size="lg" className="mt-6" onClick={() => router.push(`/portal/tenant-admin/${companySlug || "my-company"}/hn-1/management/hr/employees`)}>
                Vào hệ thống <IconArrowRight size={16} />
              </Button>
            </div>
          )}
        </div>

        {step === "register" && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Đã có tài khoản? <Link href="/portal/login" className="text-primary hover:underline font-semibold">Đăng nhập</Link>
          </p>
        )}
        {step !== "register" && step !== "success-create" && (
          <p className="text-center text-sm text-gray-500 mt-6">
            <button type="button" onClick={() => router.push("/portal/login")} className="text-primary hover:underline cursor-pointer">Về đăng nhập</button>
          </p>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">© 2026 HR System</p>
      </div>
    </main>
  );
}
