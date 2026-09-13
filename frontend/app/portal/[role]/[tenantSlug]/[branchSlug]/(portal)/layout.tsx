"use client";

import { use } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { portalNotifications } from "@/mock-data/portal";
import { IconUsers, IconArrowsExchange, IconCoin, IconCalendarTime, IconBuildingStore, IconWifi } from "@tabler/icons-react";

export default function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ role: string; tenantSlug: string; branchSlug: string }>;
}) {
  const { role, tenantSlug, branchSlug } = use(params);
  const base = `/portal/${role}/${tenantSlug}/${branchSlug}`;

  const tenantName = tenantSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "HR System";
  const roleName = role === "tenant-admin" ? "Quản trị" : "Nhân viên";

  const hrGroup = {
    title: "",
    items: [
      { label: "Nhân sự", href: `${base}/management/hr/employees`, icon: <IconUsers size={20} strokeWidth={1.5} /> },
      { label: "Chi nhánh", href: `${base}/management/hr/branches`, icon: <IconBuildingStore size={20} strokeWidth={1.5} /> },
      { label: "Xếp ca & Lịch làm", href: `${base}/management/hr/shifts`, icon: <IconCalendarTime size={20} strokeWidth={1.5} /> },
      { label: "Yêu cầu đổi ca", href: `${base}/management/hr/requests`, icon: <IconArrowsExchange size={20} strokeWidth={1.5} /> },
      { label: "Phiếu lương", href: `${base}/management/hr/payslips`, icon: <IconCoin size={20} strokeWidth={1.5} /> },
      { label: "Cấu hình Wi-Fi", href: `${base}/management/hr/wifi`, icon: <IconWifi size={20} strokeWidth={1.5} /> },
    ],
  };


  return (
    <DashboardShell
      brand={tenantName}
      groups={[hrGroup]}
      userName="Admin Doanh Nghiệp"
      userRole={roleName}
      notifications={portalNotifications}
      logoutHref="/portal/login"
      profileHref={`${base}/management/hr/employees`}
      sidebarFooter={{
        icon: <IconBuildingStore size={16} />,
        text: `Chi nhánh ${branchSlug.toUpperCase()}`,
      }}
    >
      {children}
    </DashboardShell>
  );
}

