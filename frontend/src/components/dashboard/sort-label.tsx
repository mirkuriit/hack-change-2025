"use client";

import Image from "next/image";

export type SortLabelProps = {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
};

export function SortLabel({
  label,
  onClick,
  isActive = false,
  disabled = false,
}: SortLabelProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`mx-auto flex items-center justify-center gap-1 font-bold transition ${
        isActive ? "text-[#1C6BE8]" : "text-[#1b1f3b]"
      } ${disabled ? "cursor-not-allowed opacity-60" : "hover:text-[#1C6BE8]"}`}
    >
      {label}
      <Image
        src="/icons/filter_sort.svg"
        alt="Сортировка"
        width={16}
        height={16}
      />
    </button>
  );
}
