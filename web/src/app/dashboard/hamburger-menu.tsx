"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { logout } from "@/actions/auth";

export function HamburgerMenu({
  displayName,
  isOwner,
}: {
  displayName: string;
  isOwner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function close() {
    setVisible(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpen(false), 300);
  }

  const menuItem =
    "flex items-center gap-3 px-4 py-3 rounded-[10px] text-[15px] font-medium text-ink hover:bg-surface-soft transition-colors";

  const drawer = open && mounted && createPortal(
    <div className="fixed inset-0 z-50 flex">
      {/* 백드롭 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: visible ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
          transition: "background-color 0.3s ease",
        }}
        onClick={close}
      />

      {/* 드로어 패널 */}
      <div
        className="relative w-72 max-w-[82vw] h-full bg-canvas flex flex-col shadow-2xl"
        style={{
          transform: visible ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* 사용자 정보 */}
        <div className="px-5 pt-12 pb-5 border-b border-hairline">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#fff1f3] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff385c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[16px] font-bold text-ink truncate">{displayName}</p>
              <p className="text-[12px] text-muted">{isOwner ? "관리자" : "멤버"}</p>
            </div>
          </div>
        </div>

        {/* 메뉴 항목 */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {isOwner && (
            <Link href="/settings/accounts" onClick={close} className={menuItem}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              계좌 관리
            </Link>
          )}
          {isOwner && (
            <Link href="/settings/members" onClick={close} className={menuItem}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              계정관리
            </Link>
          )}
          <Link href="/settings/pin" onClick={close} className={menuItem}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            PIN 변경
          </Link>
        </nav>

        {/* 로그아웃 */}
        <div className="px-3 pb-10 border-t border-hairline pt-4">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-[10px] text-[15px] font-medium text-[#fc642d] hover:bg-[#fff3ef] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-[8px] text-muted hover:bg-hairline transition-colors"
        aria-label="메뉴 열기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      {drawer}
    </>
  );
}
