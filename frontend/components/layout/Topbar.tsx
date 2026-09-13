"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconBell,
  IconLogout2,
  IconSearch,
  IconUserCircle,
} from "@tabler/icons-react";
import NotificationPanel from "./NotificationPanel";
import { cn } from "@/lib/utils";

interface TopbarProps {
  title?: string;
  headerActions?: React.ReactNode;
  userName: string;
  userRole: string;
  width: number;
  resizing: boolean;
  notifications: { id: string; title: string; content: string; time: string; read: boolean; tone?: string }[];
  onLogout?: () => void;
  logoutHref?: string;
  profileHref?: string;
  rightExtra?: React.ReactNode; // vd: nút chuyển phân hệ (Web 2 R2)
  showSearch?: boolean;
}

export default function Topbar({
  title,
  headerActions,
  userName,
  userRole,
  width,
  resizing,
  notifications,
  onLogout,
  logoutHref = "/platform-admin/login",
  profileHref = "#",
  rightExtra,
  showSearch = true,
}: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-20 h-14 bg-white/80 backdrop-blur border-b border-dashed border-gray-300",
        resizing ? "" : "transition-all duration-300"
      )}
      style={{ left: width }}
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {title && (
            <h1 className="text-base font-bold text-gray-900 tracking-tight whitespace-nowrap">
              {title}
            </h1>
          )}
          {title && rightExtra && <span className="h-4 w-[1px] bg-gray-300 mx-0.5" />}
          {rightExtra}
        </div>

        <div className="flex items-center gap-2">
          {headerActions && (
            <div className="flex items-center gap-2 mr-1">
              {headerActions}
            </div>
          )}
          {showSearch && (
            <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-500 text-xs hover:bg-gray-50 cursor-pointer">
              <IconSearch size={15} />
              <span>Tìm kiếm...</span>
              <kbd className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-[10px]">⌘K</kbd>
            </button>
          )}

          {/* Thông báo */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
              title="Thông báo"
            >
              <IconBell size={20} />
              {unread > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>

            <NotificationPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              notifications={notifications}
            />
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                {userName.charAt(0)}
              </span>
              <span className="hidden lg:block text-left">
                <span className="block text-sm font-semibold text-gray-800 leading-tight">{userName}</span>
                <span className="block text-xs text-gray-500 leading-tight">{userRole}</span>
              </span>
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-2">
                  <div className="px-4 py-2 border-b border-dashed border-gray-300 mb-1">
                    <div className="font-semibold text-gray-800 text-sm">{userName}</div>
                    <div className="text-xs text-gray-500">{userRole}</div>
                  </div>
                  <Link
                    href={profileHref}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    <IconUserCircle size={18} />
                    Bảo mật tài khoản
                  </Link>
                  <Link
                    href={logoutHref}
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 border-t border-dashed border-gray-300 mt-1 pt-2"
                  >
                    <IconLogout2 size={18} />
                    Đăng xuất
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
