"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EntryForm } from "@/app/entries/new/form";

export function NewEntryModal({
  accountId,
  accountName,
  currency,
  currentBalanceKrw,
  children,
}: {
  accountId: string;
  accountName: string;
  currency: string;
  currentBalanceKrw: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openCount, setOpenCount] = useState(0);
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

  function openModal() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenCount((c) => c + 1);
    setOpen(true);
  }

  function close() {
    setVisible(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpen(false), 320);
  }

  const modal = open && mounted && createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{
        backgroundColor: visible ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
        transition: "background-color 0.32s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className="w-full max-w-2xl bg-canvas rounded-t-2xl overflow-y-auto max-h-[92vh]"
        style={{
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <div className="relative flex items-center justify-between px-5 h-14 border-b border-hairline sticky top-0 bg-canvas z-10">
          <div className="w-6" />
          <p className="text-[15px] font-semibold text-ink">내역 추가</p>
          <button
            type="button"
            onClick={close}
            className="text-[20px] text-muted leading-none w-6 text-right"
          >
            ✕
          </button>
        </div>
        <div className="px-4 py-5">
          <EntryForm
            key={openCount}
            defaultAccountId={accountId}
            defaultCurrency={currency}
            accountName={accountName}
            accounts={[]}
            currentBalanceKrw={currentBalanceKrw}
          />
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <span className="contents" onClick={openModal}>{children}</span>
      {modal}
    </>
  );
}
