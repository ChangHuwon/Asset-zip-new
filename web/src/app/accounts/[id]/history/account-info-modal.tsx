"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CURRENCY_LABELS: Record<string, string> = {
  KRW: "원화 (KRW)",
  USD: "미국 달러 (USD)",
  JPY: "일본 엔 (JPY)",
  EUR: "유로 (EUR)",
  CNY: "중국 위안 (CNY)",
};

type AccountInfo = {
  name: string;
  categoryName: string;
  currency: string;
  note: string | null;
  createdAt: string;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-hairline last:border-0">
      <span className="text-[13px] text-muted shrink-0">{label}</span>
      <span className="text-[14px] font-medium text-ink text-right break-all">{value}</span>
    </div>
  );
}

export function AccountInfoModal({
  account,
  children,
}: {
  account: AccountInfo;
  children: React.ReactNode;
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
        className="w-full max-w-2xl bg-canvas rounded-t-2xl"
        style={{
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-hairline">
          <div className="w-6" />
          <p className="text-[15px] font-semibold text-ink">계좌 정보</p>
          <button
            type="button"
            onClick={close}
            className="text-[20px] text-muted leading-none w-6 text-right"
          >
            ✕
          </button>
        </div>

        <div className="px-5 pb-8">
          <Row label="계좌명" value={account.name} />
          <Row label="카테고리" value={account.categoryName} />
          <Row label="통화" value={CURRENCY_LABELS[account.currency] ?? account.currency} />
          <Row label="비고" value={account.note || "—"} />
          <Row label="등록일" value={account.createdAt} />
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <span className="contents" onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>
        {children}
      </span>
      {modal}
    </>
  );
}
