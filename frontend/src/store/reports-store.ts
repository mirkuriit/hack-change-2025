import { create } from "zustand";

export type ReportPrediction = {
  id: string;
  text: string;
  src: string;
  label: number;
};

export type ReportData = {
  id: string;
  createdAt: string;
  prediction: ReportPrediction[];
};

type ReportsState = {
  report: ReportData | null;
  isLoading: boolean;
  setReportData: (payload: ReportData) => void;
  setLoading: (value: boolean) => void;
  reset: () => void;
};

export const useReportsStore = create<ReportsState>((set) => ({
  report: null,
  isLoading: false,
  setReportData: (payload) => set({ report: payload }),
  setLoading: (value) => set({ isLoading: value }),
  reset: () => set({ report: null, isLoading: false }),
}));
