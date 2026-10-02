"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEye, faEyeSlash, faLock } from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/ui/Button";
import { Field, Input, Checkbox } from "@/components/ui/Form";
import { useCurrentUser } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useCurrentUser();
  const [email, setEmail] = useState("admin@company.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      const from =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("from")
          : null;
      router.push(from && from.startsWith("/dashboard") ? from : "/dashboard/employees");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Đăng nhập Quản trị</h1>
          <p className="text-gray-500 text-sm">Cổng quản trị dành cho Ban Giám đốc & Quản lý Chi nhánh</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleLogin}>
            <Field label="Email tài khoản" required>
              <div className="relative">
                <FontAwesomeIcon icon={faEnvelope} fontSize={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="admin@company.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </Field>

            <Field label="Mật khẩu" required>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} fontSize={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label="Hiện/ẩn mật khẩu"
                >
                  {showPassword ? <FontAwesomeIcon icon={faEyeSlash} fontSize={16} /> : <FontAwesomeIcon icon={faEye} fontSize={16} />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between mb-5">
              <Checkbox label="Ghi nhớ đăng nhập" defaultChecked />
            </div>

            <Button type="submit" block size="lg" disabled={submitting}>
              {submitting ? "Đang đăng nhập..." : "Đăng nhập hệ thống"}
            </Button>
            {error && (
              <p className="text-sm text-red-600 mt-3 text-center">{error}</p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
