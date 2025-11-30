import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getToneMeta,
  toneKeysAsc,
  toneKeysDesc,
  type ToneKey,
} from "@/lib/tone";
import type { ReviewItem } from "@/types/review";

export type FilterKey = "tonality" | "source";
type SortDirection = "asc" | "desc" | null;

export type FilterOptionConfig =
  | {
      id: string;
      label: string;
      type: "checkbox";
      checked: boolean;
      onChange: () => void;
    }
  | {
      id: string;
      label: string;
      type: "button";
      active: boolean;
      onClick: () => void;
    };

export type FilterSectionConfig = {
  title: string;
  options: FilterOptionConfig[];
  scrollable?: boolean;
};

export type UseReviewFiltersResult = {
  filteredReviews: ReviewItem[];
  toggleFilterPanel: (type: FilterKey) => void;
  closeFilterPanel: () => void;
  clearFiltersAndSorts: () => void;
  tonalityIndicatorActive: boolean;
  sourceIndicatorActive: boolean;
  isFilterModalOpen: boolean;
  filterModalTitle: string;
  filterSections: FilterSectionConfig[];
};

export function useReviewFilters(
  reviews: ReviewItem[]
): UseReviewFiltersResult {
  const [filters, setFilters] = useState<{
    tonality: ToneKey[];
    source: string[];
  }>({ tonality: [], source: [] });
  const [sorts, setSorts] = useState<{
    tonality: SortDirection;
    source: SortDirection;
  }>({ tonality: null, source: null });
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (filters.tonality.length) {
      result = result.filter((review) =>
        filters.tonality.includes(review.tonality)
      );
    }

    if (filters.source.length) {
      result = result.filter((review) =>
        filters.source.includes(review.source)
      );
    }

    const sorted = [...result];

    sorted.sort((a, b) => {
      if (sorts.tonality) {
        const order = sorts.tonality === "asc" ? toneKeysAsc : toneKeysDesc;
        const diff = order.indexOf(a.tonality) - order.indexOf(b.tonality);
        if (diff !== 0) {
          return diff;
        }
      }

      if (sorts.source) {
        const direction = sorts.source === "asc" ? 1 : -1;
        const diff = a.source.localeCompare(b.source, "ru") * direction;
        if (diff !== 0) {
          return diff;
        }
      }

      return 0;
    });

    return sorted;
  }, [filters.source, filters.tonality, reviews, sorts.source, sorts.tonality]);

  const toggleFilterPanel = useCallback((type: FilterKey) => {
    setActiveFilter((prev) => (prev === type ? null : type));
  }, []);

  const closeFilterPanel = useCallback(() => {
    setActiveFilter(null);
  }, []);

  useEffect(() => {
    if (!activeFilter) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveFilter(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFilter]);

  const toggleTonalityFilter = useCallback((tone: ToneKey) => {
    setFilters((prev) => {
      const exists = prev.tonality.includes(tone);
      const tonality = exists
        ? prev.tonality.filter((value) => value !== tone)
        : [...prev.tonality, tone];
      return { ...prev, tonality };
    });
  }, []);

  const toggleSourceFilter = useCallback((source: string) => {
    setFilters((prev) => {
      const exists = prev.source.includes(source);
      const nextSource = exists
        ? prev.source.filter((value) => value !== source)
        : [...prev.source, source];
      return { ...prev, source: nextSource };
    });
  }, []);

  const handleSortChange = useCallback(
    (type: FilterKey, direction: Exclude<SortDirection, null>) => {
      setSorts((prev) => ({
        ...prev,
        [type]: prev[type] === direction ? null : direction,
      }));
    },
    []
  );

  const clearFiltersAndSorts = useCallback(() => {
    setFilters({ tonality: [], source: [] });
    setSorts({ tonality: null, source: null });
    setActiveFilter(null);
  }, []);

  const tonalityIndicatorActive = Boolean(
    filters.tonality.length || sorts.tonality
  );
  const sourceIndicatorActive = Boolean(filters.source.length || sorts.source);

  const sourceOptions = useMemo(() => {
    const unique = new Set(reviews.map((review) => review.source));
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "ru"));
  }, [reviews]);

  const filterModalTitle = useMemo(() => {
    if (activeFilter === "tonality") {
      return "Фильтр по тональности";
    }
    if (activeFilter === "source") {
      return "Фильтр по источнику";
    }
    return "";
  }, [activeFilter]);

  const filterSections = useMemo<FilterSectionConfig[]>(() => {
    if (!activeFilter) {
      return [];
    }

    if (activeFilter === "tonality") {
      return [
        {
          title: "Фильтры",
          options: toneKeysAsc.map((tone) => ({
            id: tone,
            label: getToneMeta(tone).label,
            type: "checkbox" as const,
            checked: filters.tonality.includes(tone),
            onChange: () => toggleTonalityFilter(tone),
          })),
        },
        {
          title: "Сортировка",
          options: [
            {
              id: "tone-asc",
              label: "Позитив → Негатив",
              type: "button" as const,
              active: sorts.tonality === "asc",
              onClick: () => handleSortChange("tonality", "asc"),
            },
            {
              id: "tone-desc",
              label: "Негатив → Позитив",
              type: "button" as const,
              active: sorts.tonality === "desc",
              onClick: () => handleSortChange("tonality", "desc"),
            },
          ],
        },
      ];
    }

    return [
      {
        title: "Фильтры",
        scrollable: true,
        options: sourceOptions.map((source) => ({
          id: source,
          label: source,
          type: "checkbox" as const,
          checked: filters.source.includes(source),
          onChange: () => toggleSourceFilter(source),
        })),
      },
      {
        title: "Сортировка",
        options: [
          {
            id: "source-asc",
            label: "А → Я",
            type: "button" as const,
            active: sorts.source === "asc",
            onClick: () => handleSortChange("source", "asc"),
          },
          {
            id: "source-desc",
            label: "Я → А",
            type: "button" as const,
            active: sorts.source === "desc",
            onClick: () => handleSortChange("source", "desc"),
          },
        ],
      },
    ];
  }, [
    activeFilter,
    filters.source,
    filters.tonality,
    handleSortChange,
    sorts.source,
    sorts.tonality,
    sourceOptions,
    toggleSourceFilter,
    toggleTonalityFilter,
  ]);

  return {
    filteredReviews,
    toggleFilterPanel,
    closeFilterPanel,
    clearFiltersAndSorts,
    tonalityIndicatorActive,
    sourceIndicatorActive,
    isFilterModalOpen: Boolean(activeFilter),
    filterModalTitle,
    filterSections,
  };
}
