export type ToneKey = "positive" | "neutral" | "negative";
export type ToneId = 0 | 1 | 2;

export type ToneMeta = {
  id: ToneId;
  key: ToneKey;
  label: string;
  description: string;
  icon: string;
  accentColor: string;
  backgroundColor: string;
  ringColor: string;
};

const toneMap: Record<ToneKey, ToneMeta> = {
  positive: {
    id: 1,
    key: "positive",
    label: "Положительно",
    description: "Отзывы с положительным окрасом",
    icon: "/icons/happy.svg",
    accentColor: "text-[#22a873]",
    backgroundColor: "bg-[#e7f7f1]",
    ringColor: "text-[#22a873]",
  },
  neutral: {
    id: 0,
    key: "neutral",
    label: "Нейтрально",
    description: "Сдержанные комментарии без эмоций",
    icon: "/icons/neutral.svg",
    accentColor: "text-[#7a6ee6]",
    backgroundColor: "bg-[#efe9ff]",
    ringColor: "text-[#7a6ee6]",
  },
  negative: {
    id: 2,
    key: "negative",
    label: "Отрицательно",
    description: "Сигналы о недовольстве клиентов",
    icon: "/icons/negative.svg",
    accentColor: "text-[#d96a66]",
    backgroundColor: "bg-[#FFE8EA]",
    ringColor: "text-[#d96a66]",
  },
};

const toneIdToKey: Record<ToneId, ToneKey> = {
  0: "neutral",
  1: "positive",
  2: "negative",
};

export const toneKeysAsc: ToneKey[] = ["positive", "neutral", "negative"];
export const toneKeysDesc: ToneKey[] = [...toneKeysAsc].reverse();

export const getToneMeta = (key: ToneKey) => toneMap[key];

export const getToneMetaById = (id: number): ToneMeta => {
  const toneKey = toneIdToKey[id as ToneId] ?? "neutral";
  return toneMap[toneKey];
};

export const getToneLabelById = (id: number) => getToneMetaById(id).label;

export const getToneDescriptionById = (id: number) =>
  getToneMetaById(id).description;

export const getToneIconById = (id: number) => getToneMetaById(id).icon;
