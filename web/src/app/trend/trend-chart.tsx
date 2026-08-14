"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailySnapshot } from "./page";

function formatYAxis(value: number): string {
  if (value >= 100_000_000) return (value / 100_000_000).toFixed(0) + "억";
  if (value >= 10_000_000) return (value / 10_000_000).toFixed(0) + "천만";
  if (value >= 10_000) return (value / 10_000).toFixed(0) + "만";
  return value.toLocaleString("ko-KR");
}

function formatXAxis(date: string): string {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}


export function TrendChart({ data }: { data: DailySnapshot[] }) {
  const nonZero = data.filter((d) => d.totalKrw > 0);

  if (nonZero.length === 0) {
    return (
      <div
        className="rounded-2xl bg-canvas p-10 text-center"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <p className="text-[15px] font-semibold text-ink mb-1">데이터 없음</p>
        <p className="text-[13px] text-muted">해당 기간에 기록된 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl bg-canvas px-2 pt-5 pb-3"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff385c" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ff385c" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 11, fill: "#a0a0a0" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11, fill: "#a0a0a0" }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [
              (typeof value === "number" ? value : 0).toLocaleString("ko-KR") + "원",
              "총 자산",
            ]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            labelFormatter={(label: any) =>
              new Date(String(label)).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
            }
            contentStyle={{
              fontSize: 13,
              borderRadius: 10,
              border: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              padding: "8px 12px",
            }}
            cursor={{ stroke: "#ff385c", strokeWidth: 1, strokeDasharray: "4 2" }}
          />
          <Area
            type="monotone"
            dataKey="totalKrw"
            stroke="#ff385c"
            strokeWidth={2}
            fill="url(#trendGrad)"
            dot={false}
            activeDot={{ r: 5, fill: "#ff385c", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
