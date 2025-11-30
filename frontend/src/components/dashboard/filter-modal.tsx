"use client";

import type { MouseEventHandler, ReactNode } from "react";
import Image from "next/image";

type FilterModalProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  eyebrow?: string;
};

export function FilterModal({
  isOpen,
  title,
  onClose,
  children,
  eyebrow = "Настройка",
}: FilterModalProps) {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = () => {
    onClose();
  };

  const stopPropagation: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(7,10,25,0.55)] px-4 py-8"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={stopPropagation}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#7c8494]">
              {eyebrow}
            </p>
            <h3 className="text-lg font-semibold text-[#1b1f3b]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть фильтры"
            className="rounded-full p-2 text-[#9aa3b5] transition hover:bg-[#f2f5fb] hover:text-[#1b1f3b]"
          >
            <Image
              src="/icons/menu_close.svg"
              alt="Закрыть"
              width={22}
              height={22}
            />
          </button>
        </div>
        <div className="mt-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}
