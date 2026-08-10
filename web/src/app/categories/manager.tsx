"use client";
import { useActionState } from "react";
import { createCategory, deleteCategory } from "@/actions/categories";

type Category = {
  id: string;
  name: string;
  sortOrder: number;
  _count: { accounts: number };
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [addState, addAction, addPending] = useActionState(createCategory, null);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteCategory, null);

  return (
    <div className="flex flex-col gap-5">
      {deleteState && !deleteState.success && (
        <p className="error-box">{deleteState.error}</p>
      )}

      {/* 카테고리 목록 */}
      <div className="bg-canvas rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        {categories.length === 0 ? (
          <p className="px-5 py-6 text-[14px] text-muted">등록된 카테고리가 없습니다.</p>
        ) : (
          <ul>
            {categories.map((cat, i) => (
              <li
                key={cat.id}
                className={`flex items-center justify-between px-5 py-4 ${
                  i < categories.length - 1 ? "border-b border-hairline" : ""
                }`}
              >
                <div>
                  <p className="text-[15px] font-medium text-ink">{cat.name}</p>
                  {cat._count.accounts > 0 && (
                    <p className="text-[12px] text-muted mt-0.5">계좌 {cat._count.accounts}개</p>
                  )}
                </div>
                <form action={deleteAction}>
                  <input type="hidden" name="categoryId" value={cat.id} />
                  <button
                    type="submit"
                    disabled={deletePending || cat._count.accounts > 0}
                    className="text-[13px] font-medium text-muted disabled:opacity-25 px-3 py-1.5 rounded-full transition-colors"
                    title={cat._count.accounts > 0 ? "계좌가 있으면 삭제 불가" : ""}
                  >
                    삭제
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 추가 폼 */}
      <div>
        <p className="field-label">카테고리 추가</p>
        <div className="flex gap-2">
          <form action={addAction} className="flex gap-2 flex-1">
            <input
              name="name"
              placeholder="예: 부동산"
              className="field-input flex-1"
              style={{ width: "auto" }}
            />
            <button
              type="submit"
              disabled={addPending}
              className="btn-primary shrink-0"
              style={{ width: "auto", paddingLeft: "1.25rem", paddingRight: "1.25rem" }}
            >
              {addPending ? "..." : "추가"}
            </button>
          </form>
        </div>
        {addState && !addState.success && (
          <p className="error-box mt-2">{addState.error}</p>
        )}
      </div>
    </div>
  );
}
