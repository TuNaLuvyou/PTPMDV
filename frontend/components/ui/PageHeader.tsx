"use client";

import { useEffect } from "react";
import { useTopbar } from "@/context/TopbarContext";

interface PageHeaderProps {
  title?: string;
  breadcrumb?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ actions }: PageHeaderProps) {
  const { setHeaderActions } = useTopbar();

  useEffect(() => {
    setHeaderActions(actions ?? null);
    return () => setHeaderActions(null);
  }, [actions, setHeaderActions]);

  return null; // Xóa hoàn toàn tiêu đề & breadcrumbs ở khu vực content bên dưới
}
