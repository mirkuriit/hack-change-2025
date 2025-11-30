import axios from "axios";
import { deleteCookie, getCookie, hasCookie } from "cookies-next";
import { redirect } from "next/navigation";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (hasCookie("access_token")) {
    const token = getCookie("access_token") as string | null;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      deleteCookie("access_token");
      redirect("/login");
    }
    return Promise.reject(error);
  }
);
