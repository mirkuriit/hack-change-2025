"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteCookie, getCookie } from "cookies-next";
import { useAuthStore } from "@/store/auth-store";
import { useReportsStore } from "@/store/reports-store";
import { api } from "@/lib/api";
import { decodeUserToken } from "@/lib/token";
import { getToneLabelById } from "@/lib/tone";
import {
  deleteReportById,
  downloadReportCsv,
  fetchReportById,
  uploadReportFile,
} from "@/lib/reports";
import { useFileUpload } from "@/hooks/use-file-upload";
import { FileUploadModal } from "@/components/file-upload-modal";

type Action = {
  label: string;
  icon?: string;
  type: "import" | "export" | "validate";
};

const actions: Action[] = [
  { label: "Импорт", icon: "/icons/import.svg", type: "import" },
  { label: "Экспорт", icon: "/icons/export.svg", type: "export" },
  { label: "Метрики ML", type: "validate" },
];

type VersionOption = {
  id: string;
  label: string;
};

type SentimentalReport = {
  id: string;
  user_id?: string;
  created_at: string;
};

type MetricClassResult = {
  label: string;
  precision: number;
  recall: number;
  f1: number;
};

type MetricsResult = {
  macroF1: number | null;
  classes: MetricClassResult[];
};

const placeholderVersion: VersionOption = {
  id: "placeholder",
  label: "Выберите версию",
};

const formatReportDate = (dateIso: string) => {
  const baseDate = new Date(dateIso);
  const date = new Date(baseDate.getTime() + 3 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const {
    login,
    reset,
    setUser,
    sentimentalReports,
    setReports,
    addReport,
    removeReport,
  } = useAuthStore();
  const {
    setReportData,
    setLoading: setReportLoading,
    reset: resetReport,
  } = useReportsStore();
  const displayName = login || "SomeCoolLogin";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const versionRef = useRef<HTMLDivElement>(null);
  const [isMobileVersionOpen, setIsMobileVersionOpen] = useState(false);
  const mobileVersionRef = useRef<HTMLDivElement>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    placeholderVersion.id
  );
  const [isFetchingVersion, setIsFetchingVersion] = useState(false);
  const [isDeletingVersion, setIsDeletingVersion] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isSubmittingMetrics, setIsSubmittingMetrics] = useState(false);
  const [metricsResult, setMetricsResult] = useState<MetricsResult | null>(
    null
  );
  const importUpload = useFileUpload();
  const metricsUpload = useFileUpload();

  const fetchAndSetReport = useCallback(
    async (reportId: string) => {
      if (!reportId || reportId === placeholderVersion.id) {
        return;
      }

      try {
        setIsFetchingVersion(true);
        setReportLoading(true);
        const fetchedReport = await fetchReportById(reportId);
        setReportData(fetchedReport);
      } catch (error) {
        console.error("Не удалось загрузить версию отчёта:", error);
      } finally {
        setIsFetchingVersion(false);
        setReportLoading(false);
      }
    },
    [setReportData, setReportLoading]
  );

  const versionOptions = useMemo(() => {
    const formatted = sentimentalReports.map((report) => ({
      id: report.id,
      label: formatReportDate(report.created_at),
    }));
    return [placeholderVersion, ...formatted];
  }, [sentimentalReports]);

  const selectableVersions = useMemo(
    () =>
      versionOptions.filter((version) => version.id !== placeholderVersion.id),
    [versionOptions]
  );

  const selectedVersion = useMemo(() => {
    return (
      versionOptions.find((version) => version.id === selectedVersionId) ||
      placeholderVersion
    );
  }, [selectedVersionId, versionOptions]);

  const hasSelectedVersion = selectedVersionId !== placeholderVersion.id;
  const selectedVersionLabel = isDeletingVersion
    ? "Удаляем..."
    : isFetchingVersion
    ? "Загрузка..."
    : selectedVersion.label;
  const isExportDisabled = !hasSelectedVersion || isExporting;
  const isDeleteDisabled =
    !hasSelectedVersion || isDeletingVersion || isFetchingVersion;

  useEffect(() => {
    const loadUser = async () => {
      const token = getCookie("access_token");
      if (!token || typeof token !== "string") {
        router.replace("/login");
        return;
      }

      const tokenUser = await decodeUserToken(token);
      if (!tokenUser.id) {
        router.replace("/login");
        return;
      }

      try {
        const { data } = await api.get(`/users/${tokenUser.id}`);
        const normalizedId = data?.id ?? tokenUser.id ?? null;
        const normalizedLogin = data?.login ?? tokenUser.login ?? null;
        setUser({ id: normalizedId, login: normalizedLogin });

        const reports: SentimentalReport[] = Array.isArray(
          data?.sentimental_reports
        )
          ? data.sentimental_reports
          : [];

        const normalizedReports = reports
          .slice()
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .map((report: SentimentalReport) => ({
            id: report.id,
            created_at: report.created_at,
          }));

        setReports(normalizedReports);

        if (normalizedReports.length) {
          const newestReportId = normalizedReports[0].id;
          setSelectedVersionId(newestReportId);
          await fetchAndSetReport(newestReportId);
        } else {
          setSelectedVersionId(placeholderVersion.id);
        }
      } catch (error) {
        console.error("Не удалось загрузить данные пользователя:", error);
        router.replace("/login");
      }
    };

    void loadUser();
  }, [fetchAndSetReport, router, setReports, setUser]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsMobileVersionOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isVersionOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (
        versionRef.current &&
        !versionRef.current.contains(event.target as Node)
      ) {
        setIsVersionOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [isVersionOpen]);

  useEffect(() => {
    if (!isMobileVersionOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (
        mobileVersionRef.current &&
        !mobileVersionRef.current.contains(event.target as Node)
      ) {
        setIsMobileVersionOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [isMobileVersionOpen]);

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setIsMobileVersionOpen(false);
  };

  const openImportModal = () => {
    setIsImportModalOpen(true);
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    importUpload.reset();
  };

  const openMetricsModal = () => {
    setIsMetricsModalOpen(true);
  };

  const closeMetricsModal = () => {
    setIsMetricsModalOpen(false);
    setMetricsResult(null);
    metricsUpload.reset();
  };

  const upsertVersion = (reportId: string, createdAtIso: string) => {
    addReport({ id: reportId, created_at: createdAtIso });
    setSelectedVersionId(reportId);
  };

  const handleSelectVersion = (
    versionId: string,
    origin: "desktop" | "mobile"
  ) => {
    if (!versionId || versionId === placeholderVersion.id) {
      if (origin === "desktop") {
        setIsVersionOpen(false);
      } else {
        setIsMobileVersionOpen(false);
      }
      return;
    }

    if (versionId !== selectedVersionId) {
      setSelectedVersionId(versionId);
      void fetchAndSetReport(versionId);
    }

    if (origin === "desktop") {
      setIsVersionOpen(false);
    } else {
      setIsMobileVersionOpen(false);
    }
  };

  const handleDeleteVersion = async () => {
    if (!hasSelectedVersion || isDeletingVersion) {
      return;
    }

    try {
      setIsDeletingVersion(true);
      setReportLoading(true);
      await deleteReportById(selectedVersionId);
      removeReport(selectedVersionId);

      const remainingReports = sentimentalReports.filter(
        (report) => report.id !== selectedVersionId
      );

      if (remainingReports.length) {
        const nextVersionId = remainingReports[0].id;
        setSelectedVersionId(nextVersionId);
        await fetchAndSetReport(nextVersionId);
      } else {
        setSelectedVersionId(placeholderVersion.id);
        resetReport();
      }

      setIsVersionOpen(false);
      setIsMobileVersionOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Не удалось удалить отчёт:", error);
    } finally {
      setIsDeletingVersion(false);
      setReportLoading(false);
    }
  };

  const handleImportSubmit = async () => {
    if (!importUpload.file) {
      return;
    }

    try {
      setIsImporting(true);
      setReportLoading(true);
      const uploadedReport = await uploadReportFile(importUpload.file);

      setReportData(uploadedReport);
      upsertVersion(uploadedReport.id, uploadedReport.createdAt);
      closeImportModal();
    } catch (error) {
      console.error("Не удалось импортировать файл:", error);
    } finally {
      setIsImporting(false);
      setReportLoading(false);
    }
  };

  const handleExport = async (origin: "desktop" | "mobile" = "desktop") => {
    if (!hasSelectedVersion || isExporting) {
      if (origin === "mobile") {
        closeMobileMenu();
      }
      return;
    }

    try {
      setIsExporting(true);
      const csvBlob = await downloadReportCsv(selectedVersionId);
      const filename = `tonality-report-${selectedVersion.label}.csv`;
      triggerDownload(csvBlob, filename);
    } catch (error) {
      console.error("Не удалось экспортировать отчёт:", error);
    } finally {
      setIsExporting(false);
      if (origin === "mobile") {
        closeMobileMenu();
      }
    }
  };

  const handleDesktopAction = (action: Action) => {
    if (action.type === "export") {
      void handleExport("desktop");
      return;
    }
    if (action.type === "import") {
      openImportModal();
      return;
    }
    if (action.type === "validate") {
      openMetricsModal();
      return;
    }
  };

  const handleMobileAction = (action: Action) => {
    if (action.type === "export") {
      void handleExport("mobile");
      return;
    }
    if (action.type === "import") {
      openImportModal();
      closeMobileMenu();
      return;
    }
    if (action.type === "validate") {
      openMetricsModal();
      closeMobileMenu();
      return;
    }
    closeMobileMenu();
  };

  const handleLogout = () => {
    closeMobileMenu();
    reset();
    resetReport();
    deleteCookie("access_token");
    router.replace("/");
  };

  const normalizeMetricsResult = (response: unknown): MetricsResult => {
    if (!response || typeof response !== "object") {
      return { macroF1: null, classes: [] };
    }

    const entries = Object.entries(response as Record<string, unknown>);
    const classes: MetricClassResult[] = [];
    let macroF1: number | null = null;

    entries.forEach(([key, value]) => {
      if (key === "f1-macro" && typeof value === "number") {
        macroF1 = value;
        return;
      }

      if (typeof value === "object" && value !== null) {
        const metricsValue = value as Partial<MetricClassResult>;
        classes.push({
          label: key,
          precision: Number(metricsValue.precision ?? 0),
          recall: Number(metricsValue.recall ?? 0),
          f1: Number(metricsValue.f1 ?? 0),
        });
      }
    });

    classes.sort((a, b) => Number(a.label) - Number(b.label));

    return { macroF1, classes };
  };

  const handleMetricsSubmit = async () => {
    if (!metricsUpload.file) {
      return;
    }

    try {
      setIsSubmittingMetrics(true);
      const formData = new FormData();
      formData.append("input_file", metricsUpload.file);

      const { data } = await api.post("/predict-one/f1", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMetricsResult(normalizeMetricsResult(data));
    } catch (error) {
      console.error("Не удалось получить метрики модели:", error);
      setMetricsResult(null);
    } finally {
      setIsSubmittingMetrics(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-[#e1e5f0] bg-white/95 px-4 py-4 backdrop-blur md:px-8 lg:px-36">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Десктоп меню */}
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/icons/logo.svg"
                  alt="Анализ Москвы логотип"
                  width={120}
                  height={32}
                  priority
                />
              </Link>
            </div>

            <div className="hidden flex-1 items-center justify-center gap-4 2xl:flex">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleDesktopAction(action)}
                  disabled={action.type === "export" && isExportDisabled}
                  className="flex items-center gap-2.5 rounded-2xl bg-[#1C6BE8] px-6 py-2.5 font-bold text-white transition hover:bg-[#1557d1] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {action.icon && (
                    <Image src={action.icon} alt="" width={18} height={18} />
                  )}
                  {action.label}
                </button>
              ))}
              <div className="relative" ref={versionRef}>
                <button
                  type="button"
                  onClick={() => setIsVersionOpen((prev) => !prev)}
                  className="flex items-center justify-between rounded-2xl border border-[#d9dff0] px-5 py-2.5 font-semibold text-[#1b1f3b] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] transition hover:border-[#1a6bff] w-52"
                >
                  {selectedVersionLabel}
                  <Image
                    src="/icons/open_close_arrow.svg"
                    alt="Открыть список версий"
                    width={18}
                    height={18}
                    className={`transition-transform ${
                      isVersionOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isVersionOpen && (
                  <div className="absolute left-0 right-0 top-full z-10 rounded-xl border border-[#e1e5f0] bg-white shadow-[0_12px_40px_rgba(18,22,33,0.12)]">
                    {selectableVersions.length ? (
                      selectableVersions.map((version) => (
                        <Fragment key={version.id}>
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectVersion(version.id, "desktop")
                            }
                            className={`flex w-full items-center justify-between px-4 py-2 text-left transition hover:bg-[#f2f5fb] ${
                              selectedVersion.id === version.id
                                ? "font-semibold text-[#1c6be8]"
                                : "text-[#1b1f3b]"
                            } ${
                              version.id ===
                              selectableVersions[selectableVersions.length - 1]
                                .id
                                ? "rounded-b-xl"
                                : ""
                            } ${
                              version.id === selectableVersions[0].id
                                ? "rounded-t-xl"
                                : ""
                            }`}
                          >
                            {version.label}
                          </button>
                          <div className="h-px bg-[#edf0f5]" />
                        </Fragment>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-[#7c8494]">
                        Нет версий
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleDeleteVersion}
                disabled={isDeleteDisabled}
                className="rounded-2xl border border-[#f4d3d6] px-5 py-2.5 font-semibold text-[#d96a66] transition hover:bg-[#ffecef] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Удалить
              </button>
            </div>
          </div>

          <div className="hidden items-center gap-4 2xl:flex">
            <div className="font-semibold text-[#1b1f3b]">{displayName}</div>
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-[#DBDBDB] px-6 py-2.5 font-bold text-[#1b1f3b] transition hover:border-[#1a6bff] hover:text-[#1a6bff]"
            >
              Выйти
            </button>
          </div>

          {/* Мобильное меню */}
          <div className="flex flex-1 items-center justify-end gap-3 2xl:hidden">
            <div className="text-right text-sm font-semibold leading-tight text-[#1b1f3b]">
              {displayName}
            </div>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="Открыть меню"
                aria-expanded={isMenuOpen}
                onClick={() =>
                  setIsMenuOpen((prev) => {
                    const next = !prev;
                    if (!next) {
                      setIsMobileVersionOpen(false);
                    }
                    return next;
                  })
                }
                className="p-2 transition hover:border-[#1a6bff]"
              >
                <Image
                  src={isMenuOpen ? "/icons/menu_close.svg" : "/icons/menu.svg"}
                  alt="Меню"
                  width={28}
                  height={28}
                />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-10 z-10 mt-4 w-48 rounded-xl border border-[#e1e5f0] bg-white shadow-[0_12px_40px_rgba(18,22,33,0.15)]">
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-t-xl px-4 py-3 text-left text-[#1b1f3b] hover:bg-[#f2f5fb]"
                  >
                    Выйти
                  </button>
                  <div className="h-px bg-[#edf0f5]" />
                  {actions.map((action) => (
                    <Fragment key={action.label}>
                      <button
                        type="button"
                        onClick={() => handleMobileAction(action)}
                        disabled={action.type === "export" && isExportDisabled}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-[#1b1f3b] hover:bg-[#1557d1] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {action.label}
                      </button>
                      <div className="h-px bg-[#edf0f5]" />
                    </Fragment>
                  ))}

                  <button
                    type="button"
                    onClick={handleDeleteVersion}
                    disabled={isDeleteDisabled}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-[#1b1f3b] hover:bg-[#1557d1] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Удалить
                  </button>
                  <div className="h-px bg-[#edf0f5]" />
                  <div
                    ref={mobileVersionRef}
                    className={`relative ${
                      isMobileVersionOpen ? "" : "rounded-b-xl"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setIsMobileVersionOpen((prev) => !prev)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left transition ${
                        isMobileVersionOpen
                          ? "rounded-b-xl bg-[#1C6BE8] text-white"
                          : "rounded-b-xl text-[#1b1f3b] hover:bg-[#f2f5fb]"
                      }`}
                    >
                      {selectedVersionLabel}
                      <Image
                        src="/icons/open_close_arrow.svg"
                        alt="Выбрать версию"
                        width={18}
                        height={18}
                        className={`transition-transform ${
                          isMobileVersionOpen ? "rotate-180" : ""
                        } ${isMobileVersionOpen ? "brightness-0 invert" : ""}`}
                      />
                    </button>
                    {isMobileVersionOpen && (
                      <div className="absolute left-2 right-2 top-full z-10 rounded-xl border border-[#e1e5f0] bg-white shadow-[0_12px_30px_rgba(18,22,33,0.12)]">
                        {selectableVersions.length ? (
                          selectableVersions.map((version) => (
                            <Fragment key={version.id}>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSelectVersion(version.id, "mobile")
                                }
                                className={`flex w-full items-center px-4 py-2 text-left transition hover:bg-[#f2f5fb] ${
                                  selectedVersion.id === version.id
                                    ? "font-semibold text-[#1c6be8]"
                                    : "text-[#1b1f3b]"
                                }`}
                              >
                                {version.label}
                              </button>
                              <div className="h-px bg-[#edf0f5]" />
                            </Fragment>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-[#7c8494]">
                            Нет версий
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full py-5 md:px-8 lg:px-36 justify-center">
        {children}
      </main>

      <FileUploadModal
        isOpen={isImportModalOpen}
        title="Импорт отзывов"
        description="Перетащите CSV-файл или выберите его вручную"
        onClose={closeImportModal}
        upload={importUpload}
        onSubmit={handleImportSubmit}
        submitLabel="Загрузить"
        submittingLabel="Загружаем..."
        isSubmitting={isImporting}
      />

      <FileUploadModal
        isOpen={isMetricsModalOpen}
        title="Метрики ML модели"
        description="Загрузите размеченный CSV-файл, чтобы получить precision / recall / f1 по каждому классу"
        onClose={closeMetricsModal}
        upload={metricsUpload}
        onSubmit={handleMetricsSubmit}
        submitLabel="Загрузить"
        submittingLabel="Считаем..."
        isSubmitting={isSubmittingMetrics}
        hideDropzoneOnFile
      >
        {metricsResult && (
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-[#d9dff0] bg-[#f9fbff] px-6 py-4">
              <p className="text-sm font-medium text-[#7c8494]">F1 macro</p>
              <p className="text-3xl font-semibold text-[#1b1f3b]">
                {metricsResult.macroF1 !== null
                  ? metricsResult.macroF1.toFixed(3)
                  : "—"}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {metricsResult.classes.map((metric) => {
                const sentimentLabel = getToneLabelById(Number(metric.label));
                return (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-[#d9dff0] bg-white px-5 py-4"
                  >
                    <div className="text-sm font-semibold text-[#1b1f3b]">
                      Класс {metric.label} ({sentimentLabel})
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm text-[#1b1f3b]">
                      <div>
                        <p className="text-xs uppercase text-[#7c8494]">
                          Precision
                        </p>
                        <p className="text-lg font-semibold">
                          {metric.precision.toFixed(3)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-[#7c8494]">
                          Recall
                        </p>
                        <p className="text-lg font-semibold">
                          {metric.recall.toFixed(3)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-[#7c8494]">F1</p>
                        <p className="text-lg font-semibold">
                          {metric.f1.toFixed(3)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </FileUploadModal>
    </div>
  );
}
