"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <p className="text-lg font-medium text-ink mb-2">문제가 발생했습니다</p>
      <p className="text-sm text-muted mb-6">잠시 후 다시 시도해주세요.</p>
      <button
        onClick={reset}
        className="h-10 px-6 rounded-[8px] bg-primary text-on-primary text-sm font-medium"
      >
        다시 시도
      </button>
    </div>
  );
}
