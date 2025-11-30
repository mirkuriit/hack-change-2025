"use client";

import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export type ToneChartCardProps = {
  total: number;
  isLoading: boolean;
  options: EChartsOption;
};

export function ToneChartCard({
  total,
  isLoading,
  options,
}: ToneChartCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl bg-white p-6 shadow">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-left">Диаграмма</h1>
        <p className="text-[#6b7280]">Всего: {total}</p>
      </div>
      {isLoading ? (
        <div className="flex-1 min-h-[260px] animate-pulse rounded-2xl bg-[#f1f4fb]" />
      ) : (
        <div className="flex-1 min-h-[260px]">
          <ReactECharts
            option={options}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      )}
    </article>
  );
}
