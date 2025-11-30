import { create } from "zustand";

type AuthState = {
  userId: string | null;
  login: string | null;
  sentimentalReports: SentimentalReport[];
  setUser: (payload: { id: string | null; login: string | null }) => void;
  setReports: (reports: SentimentalReport[]) => void;
  addReport: (report: SentimentalReport) => void;
  removeReport: (reportId: string) => void;
  reset: () => void;
};

type SentimentalReport = {
  id: string;
  created_at: string;
};

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  login: null,
  sentimentalReports: [],
  setUser: ({ id, login }) => set({ userId: id, login }),
  setReports: (reports) => set({ sentimentalReports: reports }),
  addReport: (report) =>
    set((state) => {
      const existingIds = new Set(
        state.sentimentalReports.map((item) => item.id)
      );
      const next = existingIds.has(report.id)
        ? state.sentimentalReports.map((item) =>
            item.id === report.id ? report : item
          )
        : [report, ...state.sentimentalReports];
      return { sentimentalReports: next };
    }),
  removeReport: (reportId) =>
    set((state) => ({
      sentimentalReports: state.sentimentalReports.filter(
        (report) => report.id !== reportId
      ),
    })),
  reset: () => set({ userId: null, login: null, sentimentalReports: [] }),
}));
