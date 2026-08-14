"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { CategorySlice } from "./page";

function krw(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

function pct(part: number, total: number) {
  if (total === 0) return "0%";
  return ((part / total) * 100).toFixed(1) + "%";
}

export function CategoryPie({ data, total }: { data: CategorySlice[]; total: number }) {
  if (data.length === 0) {
    return (
      <div
        className="rounded-2xl bg-canvas p-10 text-center"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <p className="text-[14px] text-muted">등록된 자산이 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl bg-canvas px-5 pt-5 pb-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* 도넛 차트 */}
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [
              krw(typeof value === "number" ? value : 0),
              String(name),
            ]}
            contentStyle={{
              fontSize: 13,
              borderRadius: 10,
              border: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              padding: "8px 12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* 범례 */}
      <div className="flex flex-col gap-2.5 mt-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[14px] text-ink flex-1 truncate">{item.name}</span>
            <span className="text-[13px] text-muted">{pct(item.value, total)}</span>
            <span className="text-[14px] font-semibold text-ink">{krw(item.value)}</span>
          </div>
        ))}
      </div>

      {/* 합계 */}
      <div className="mt-3 pt-3 border-t border-hairline flex justify-between items-center">
        <span className="text-[13px] text-muted">합계</span>
        <span className="text-[15px] font-bold text-ink">{krw(total)}</span>
      </div>
    </div>
  );
}
