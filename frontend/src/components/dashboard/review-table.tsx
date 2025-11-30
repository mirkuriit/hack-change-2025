"use client";

import { useState } from "react";
import Image from "next/image";
import { getToneMeta } from "@/lib/tone";
import type { ReviewItem } from "@/types/review";
import type { FilterKey } from "@/hooks/use-review-filters";
import { SortLabel } from "@/components/dashboard/sort-label";
import { ReviewTableSkeletonRow } from "@/components/dashboard/review-table-skeleton-row";

export type ReviewTableProps = {
  reviews: ReviewItem[];
  isLoading: boolean;
  onFilterToggle: (type: FilterKey) => void;
  onClearFilters: () => void;
  tonalityIndicatorActive: boolean;
  sourceIndicatorActive: boolean;
};

export function ReviewTable({
  reviews,
  isLoading,
  onFilterToggle,
  onClearFilters,
  tonalityIndicatorActive,
  sourceIndicatorActive,
}: ReviewTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="rounded-2xl bg-white shadow">
      <div className="overflow-x-hidden px-2 lg:px-6">
        <table className="w-full table-fixed text-center">
          <thead>
            <tr className="h-16">
              <th>
                <div className="flex items-center justify-center">
                  <SortLabel
                    label="Тональность"
                    onClick={() => onFilterToggle("tonality")}
                    isActive={tonalityIndicatorActive}
                    disabled={isLoading}
                  />
                </div>
              </th>
              <th>
                <div className="flex items-center justify-center">
                  <SortLabel
                    label="Источник"
                    onClick={() => onFilterToggle("source")}
                    isActive={sourceIndicatorActive}
                    disabled={isLoading}
                  />
                </div>
              </th>
              <th>Отзыв</th>
              <th>
                <button
                  type="button"
                  onClick={onClearFilters}
                  disabled={isLoading}
                  className={`mx-auto flex items-center justify-center gap-2 font-semibold transition ${
                    isLoading
                      ? "cursor-not-allowed text-[#9aa3b5] opacity-60"
                      : "text-[#1b1f3b] hover:text-[#1C6BE8]"
                  }`}
                >
                  <Image
                    src="/icons/reset.svg"
                    alt="Сброс"
                    width={18}
                    height={18}
                  />
                  Сброс
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef1f7]">
            {isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <ReviewTableSkeletonRow key={`row-skeleton-${index}`} />
              ))}
            {!isLoading && reviews.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="h-24 text-center text-sm text-[#7c8494]"
                >
                  Нет отзывов, подходящих под выбранные фильтры.
                </td>
              </tr>
            )}
            {!isLoading &&
              reviews.map((review) => {
                const isExpanded = !!expandedRows[review.id];
                const cellClass = isExpanded
                  ? "align-middle"
                  : "h-16 align-middle";
                const textCellClass = `${
                  isExpanded ? "align-top py-4" : "h-16 align-middle"
                } px-4 text-left`;
                const toneMeta = getToneMeta(review.tonality);

                return (
                  <tr
                    key={review.id}
                    className={`align-middle text-center transition-[height] duration-200 ${
                      isExpanded ? "h-auto" : "h-16"
                    }`}
                  >
                    <td className={cellClass}>
                      <div className="flex items-center justify-center">
                        <Image
                          src={toneMeta.icon}
                          alt={toneMeta.label}
                          width={36}
                          height={36}
                        />
                      </div>
                    </td>
                    <td className={cellClass}>{review.source}</td>
                    <td className={textCellClass}>
                      <div
                        className={`flex min-w-0 gap-2 text-left ${
                          isExpanded
                            ? "flex-col items-start sm:flex-row"
                            : "items-center"
                        }`}
                      >
                        <p
                          className={`flex-1 min-w-0 text-sm text-[#1b1f3b] ${
                            isExpanded ? "whitespace-normal" : "truncate"
                          }`}
                        >
                          {review.text}
                        </p>
                        <button
                          type="button"
                          aria-label={
                            isExpanded ? "Свернуть отзыв" : "Развернуть отзыв"
                          }
                          onClick={() => toggleRow(review.id)}
                          className={`shrink-0 rounded-full p-1 transition hover:bg-[#eef1f7] ${
                            isExpanded
                              ? "order-first self-end sm:order-0 sm:self-auto"
                              : "self-auto"
                          }`}
                        >
                          <Image
                            src="/icons/open_close_arrow.svg"
                            alt="Переключить отображение отзыва"
                            width={24}
                            height={24}
                            className={`transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className={cellClass}>
                      <div className="flex items-center justify-center">
                        {/* TODO: Возможность редактировать предсказанную тональность отзыва */}
                        {/* <Image
                          src="/icons/edit.svg"
                          alt={toneMeta.label}
                          width={16}
                          height={16}
                        /> */}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
