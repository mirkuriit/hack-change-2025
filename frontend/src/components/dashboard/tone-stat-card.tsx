"use client";

import Image from "next/image";
import type { ToneMeta } from "@/lib/tone";

export type ToneStatCardProps = {
  label: string;
  value: number;
  count: string;
  tone: ToneMeta;
  isLoading?: boolean;
};

export function ToneStatCard({
  label,
  value,
  count,
  tone,
  isLoading = false,
}: ToneStatCardProps) {
  return (
    <article className="flex h-full flex-col justify-center gap-6 rounded-2xl bg-white p-6 shadow">
      <h2 className="text-left text-2xl font-bold">{label}</h2>
      <div className="flex items-center gap-12">
        <Image src={tone.icon} alt={tone.label} width={97} height={97} />
        <div className={isLoading ? "animate-pulse" : ""}>
          {isLoading ? (
            <>
              <div className="h-10 w-20 rounded bg-[#e7ebf3]" />
              <div className="mt-3 h-5 w-28 rounded bg-[#edf0f7]" />
            </>
          ) : (
            <>
              <p className="text-5xl font-bold">{value}%</p>
              <p className="text-xl text-[#9BA2AC]">{count}</p>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
