import { api } from "@/lib/api";
import type { ReportPrediction } from "@/store/reports-store";

export type ReportJsonResponse = {
  id: string;
  created_at?: string;
  prediction?: ReportPrediction[];
};

export type ReportUploadResponse = {
  id: string;
};

export type NormalizedReport = {
  id: string;
  createdAt: string;
  prediction: ReportPrediction[];
};

const normalizeReport = (
  response: ReportJsonResponse,
  fallbackId: string
): NormalizedReport => ({
  id: response?.id ?? fallbackId,
  createdAt: response?.created_at ?? new Date().toISOString(),
  prediction: Array.isArray(response?.prediction) ? response.prediction : [],
});

export const fetchReportById = async (
  reportId: string
): Promise<NormalizedReport> => {
  const { data } = await api.get<ReportJsonResponse>(
    `/reports/json/${reportId}`
  );
  return normalizeReport(data, reportId);
};

export const uploadReportFile = async (
  file: File
): Promise<NormalizedReport> => {
  const formData = new FormData();
  formData.append("input_file", file);

  const { data } = await api.post<ReportUploadResponse>("/reports/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!data?.id) {
    throw new Error("Бэкенд не вернул идентификатор отчёта");
  }

  return fetchReportById(data.id);
};

export const deleteReportById = async (reportId: string) => {
  await api.delete(`/reports/${reportId}`);
};

export const downloadReportCsv = async (reportId: string) => {
  const response = await api.get<Blob>(`/reports/csv/${reportId}`, {
    responseType: "blob",
  });

  return response.data;
};
