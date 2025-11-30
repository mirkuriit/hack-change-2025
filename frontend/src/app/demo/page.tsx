"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { getToneMetaById } from "@/lib/tone";
import Link from "next/link";

type PredictionResponse = {
  predicted_mark: number;
  text: string;
};

export default function DemoPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim()) {
      setError("Введите текст отзыва");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      const { data } = await api.post<PredictionResponse>("/predict-one", {
        text,
      });
      setResult(data);
    } catch (submissionError) {
      setError("Не удалось определить тональность. Попробуйте снова.");
      console.error("predict-one failed", submissionError);
    } finally {
      setIsLoading(false);
    }
  };

  const toneInfo = result ? getToneMetaById(result.predicted_mark) : null;

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-10">
      <Link
        href="/"
        className="absolute right-6 top-6 text-sm font-medium text-[#8a8ea3] transition hover:text-[#1a6bff]"
      >
        Вернуться назад
      </Link>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-3xl bg-white/90 p-8 shadow-xl lg:flex-row lg:gap-12">
        <div className="flex-1">
          <div className="flex items-center gap-3 text-sm font-semibold text-[#1C6BE8]">
            <Link href="/">
              <Image
                src="/icons/logo.svg"
                alt="Логотип"
                width={120}
                height={32}
              />
            </Link>
            <span className="hidden text-[#6b7280] lg:inline">
              Демо классификатора
            </span>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-[#1b1f3b]">
            Узнайте тональность любого отзыва
          </h1>
          <p className="mt-3 text-lg text-[#6b7280]">
            Вставьте или напишите текст сообщения, нажмите кнопку и получите
            мгновенный результат от модели.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#1b1f3b]">
              Текст отзыва
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Например, обслуживающий персонал очень вежлив, но ждать пришлось долго..."
                rows={6}
                className="w-full resize-none rounded-2xl border border-[#dbe4fb] bg-[#fbfcff] px-4 py-3 text-base text-[#1b1f3b] placeholder:text-[#9aa3b5] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1C6BE8]"
              />
            </label>

            {error && <p className="text-sm text-[#d96a66]">{error}</p>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-2xl bg-[#1C6BE8] px-6 py-3 text-center text-lg font-semibold text-white transition hover:bg-[#1557d1] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Определяем..." : "Определить тональность"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setText("");
                  setResult(null);
                  setError(null);
                }}
                className="rounded-2xl border border-[#dbe4fb] px-6 py-3 text-lg font-semibold text-[#1C6BE8] transition hover:border-[#1C6BE8]"
              >
                Очистить
              </button>
            </div>
          </form>
        </div>

        <div className="flex-1 rounded-3xl bg-[#f2f5ff] p-6">
          <h2 className="text-xl font-semibold text-[#1b1f3b]">
            Результат определения
          </h2>
          {!toneInfo ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#c7d4f4] bg-white p-6 text-center text-[#7c8494]">
              Введите текст и запустите проверку, чтобы увидеть прогноз модели.
            </div>
          ) : (
            <div className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <Image
                  src={toneInfo.icon}
                  alt={toneInfo.label}
                  width={32}
                  height={32}
                />
                <div className="">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-semibold uppercase tracking-wide ${toneInfo.accentColor}`}
                    >
                      {toneInfo.label}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-base text-[#4b4f66]">
                    <p>{toneInfo.description}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-[#e1e5f0] bg-[#fbfcff] p-4 text-sm text-[#1b1f3b]">
                {result?.text || text}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
