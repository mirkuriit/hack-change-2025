import type { ToneKey } from "@/lib/tone";

export type ReviewItem = {
  id: string;
  tonality: ToneKey;
  source: string;
  text: string;
  label: number;
};
