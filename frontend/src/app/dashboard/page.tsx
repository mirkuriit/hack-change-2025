"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { useReportsStore } from "@/store/reports-store";
import {
  getToneMeta,
  getToneMetaById,
  toneKeysAsc,
  type ToneKey,
} from "@/lib/tone";
import { ToneChartCard } from "@/components/dashboard/tone-chart-card";
import { ToneStatCard } from "@/components/dashboard/tone-stat-card";
import { FilterModal } from "@/components/dashboard/filter-modal";
import { ReviewTable } from "@/components/dashboard/review-table";
import {
  useReviewFilters,
  type FilterSectionConfig,
} from "@/hooks/use-review-filters";
import type { ReviewItem } from "@/types/review";

type TonalityTotals = Record<ToneKey, number> & { total: number };

const defaultStats = [
  {
    label: getToneMeta("positive").label,
    value: 0,
    count: "0 отзывов",
    tone: getToneMeta("positive"),
  },
  {
    label: getToneMeta("neutral").label,
    value: 0,
    count: "0 отзывов",
    tone: getToneMeta("neutral"),
  },
  {
    label: getToneMeta("negative").label,
    value: 0,
    count: "0 отзывов",
    tone: getToneMeta("negative"),
  },
];

const labelToTonality = (label: number): ToneKey => getToneMetaById(label).key;

const renderFilterSections = (sections: FilterSectionConfig[]) => {
  if (!sections.length) {
    return null;
  }

  const sanitizeId = (sectionTitle: string, optionId: string) =>
    `${sectionTitle}-${optionId}`.replace(/\s+/g, "-").toLowerCase();

  return sections.map((section) => (
    <div key={section.title} className="space-y-3">
      <p className="text-sm font-semibold text-[#1b1f3b]">{section.title}</p>
      <div
        className={`space-y-2 ${
          section.scrollable ? "max-h-64 overflow-y-auto pr-1" : ""
        }`}
      >
        {section.options.map((option) => {
          if (option.type === "checkbox") {
            const optionId = sanitizeId(section.title, option.id);
            return (
              <label
                key={option.id}
                htmlFor={optionId}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  option.checked
                    ? "border-[#1C6BE8] text-[#1C6BE8]"
                    : "border-[#e1e5f0] text-[#1b1f3b] hover:border-[#1C6BE8]"
                }`}
              >
                <input
                  id={optionId}
                  type="checkbox"
                  checked={option.checked}
                  onChange={() => option.onChange()}
                  className="sr-only"
                />
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    option.checked
                      ? "border-[#1C6BE8] bg-[#1C6BE8] text-white"
                      : "border-[#c6ccd9]"
                  }`}
                >
                  {option.checked && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
                <span className="flex-1">{option.label}</span>
              </label>
            );
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={option.onClick}
              aria-pressed={option.active}
              className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                option.active
                  ? "border-[#1C6BE8] bg-[#1C6BE8] text-white"
                  : "border-[#e1e5f0] text-[#1b1f3b] hover:border-[#1C6BE8]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  ));
};

export default function DashboardPage() {
  const { report, isLoading } = useReportsStore();
  const hasPredictions = Boolean(report?.prediction?.length);

  const reviews = useMemo<ReviewItem[]>(() => {
    if (!hasPredictions) {
      return [];
    }

    const predictionList = report?.prediction ?? [];
    return predictionList.map((prediction, index) => ({
      id: prediction.id?.toString() ?? `review-${index}`,
      tonality: labelToTonality(Number(prediction.label)),
      source: prediction.src || "Неизвестный источник",
      text: prediction.text || "",
      label: Number(prediction.label),
    }));
  }, [hasPredictions, report]);

  const {
    filteredReviews,
    toggleFilterPanel,
    closeFilterPanel,
    clearFiltersAndSorts,
    tonalityIndicatorActive,
    sourceIndicatorActive,
    isFilterModalOpen,
    filterModalTitle,
    filterSections,
  } = useReviewFilters(reviews);

  const tonalityTotals = useMemo<TonalityTotals>(() => {
    return reviews.reduce<TonalityTotals>(
      (acc, review) => {
        acc[review.tonality] += 1;
        acc.total += 1;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0, total: 0 }
    );
  }, [reviews]);

  const chartOptions = useMemo<EChartsOption>(() => {
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      grid: { left: "3%", right: "3%", bottom: "5%", containLabel: true },
      xAxis: {
        type: "category",
        data: ["Позитивно", "Нейтрально", "Негативно"],
        axisTick: { alignWithLabel: true },
        axisLine: { lineStyle: { color: "#d9dff0" } },
        axisLabel: { color: "#4b5563" },
      },
      yAxis: {
        type: "value",
        name: "Отзывы",
        nameTextStyle: { color: "#6b7280", padding: [0, 0, 10, 0] },
        axisLine: { lineStyle: { color: "#d9dff0" } },
        splitLine: { lineStyle: { color: "#f1f3f8" } },
        axisLabel: { color: "#4b5563" },
      },
      series: [
        {
          name: "Отзывы",
          type: "bar",
          barWidth: "45%",
          data: [
            tonalityTotals.positive,
            tonalityTotals.neutral,
            tonalityTotals.negative,
          ],
          itemStyle: {
            color: (params: { dataIndex: number }) => {
              const palette = ["#22a873", "#7a6ee6", "#d96a66"];
              return palette[params.dataIndex] ?? "#1C6BE8";
            },
            borderRadius: [8, 8, 0, 0],
          },
        },
      ],
    } satisfies EChartsOption;
  }, [tonalityTotals]);

  const computedStats = useMemo(() => {
    return toneKeysAsc.map((tone) => {
      const toneMeta = getToneMeta(tone);
      const count = tonalityTotals[tone];
      const percentage = tonalityTotals.total
        ? Math.round((count / tonalityTotals.total) * 100)
        : 0;

      return {
        label: toneMeta.label,
        value: percentage,
        count: `${count} отзывов`,
        tone: toneMeta,
      };
    });
  }, [tonalityTotals]);

  if (!isLoading && !hasPredictions) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#1b1f3b]">
            Не выбрана версия анализа тональности отзывов!
          </p>
          <p className="mt-3 text-sm text-[#6b7280]">
            Импортируйте новые отзывы в формате .csv, используя кнопку
            <span className="font-semibold text-[#1C6BE8]"> «Импорт»</span>,
            чтобы увидеть результаты анализа.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid w-full grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr_1fr_1fr]">
        <ToneChartCard
          total={tonalityTotals.total}
          isLoading={isLoading}
          options={chartOptions}
        />

        {(isLoading ? defaultStats : computedStats).map((stat) => (
          <ToneStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            count={stat.count}
            tone={stat.tone}
            isLoading={isLoading}
          />
        ))}
      </section>

      <ReviewTable
        reviews={filteredReviews}
        isLoading={isLoading}
        onFilterToggle={toggleFilterPanel}
        onClearFilters={clearFiltersAndSorts}
        tonalityIndicatorActive={tonalityIndicatorActive}
        sourceIndicatorActive={sourceIndicatorActive}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        title={filterModalTitle}
        onClose={closeFilterPanel}
      >
        {renderFilterSections(filterSections)}
      </FilterModal>
    </div>
  );
}
