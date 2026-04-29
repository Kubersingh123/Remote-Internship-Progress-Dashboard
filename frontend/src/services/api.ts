import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AnalyticsOverview, Internship, NotificationItem, ReportItem, TaskItem, User } from "../app/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
const ACCESS_TOKEN_KEY = "dashboard_access_token";
const REFRESH_TOKEN_KEY = "dashboard_refresh_token";

type Nullable<T> = T | null;

let accessToken: Nullable<string> = localStorage.getItem(ACCESS_TOKEN_KEY);
let refreshToken: Nullable<string> = localStorage.getItem(REFRESH_TOKEN_KEY);
let onSessionExpired: (() => void) | null = null;
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

let refreshSupported = true;

function processRefreshQueue(newToken: string | null) {
  refreshQueue.forEach((callback) => callback(newToken));
  refreshQueue = [];
}

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}

api.interceptors.request.use(authRequestInterceptor);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshToken) {
      clearTokens();
      onSessionExpired?.();
      return Promise.reject(error);
    }
    if (!refreshSupported) {
      clearTokens();
      onSessionExpired?.();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
      const nextAccessToken = response.data.access_token as string | undefined;
      const nextRefreshToken = (response.data.refresh_token as string | undefined) ?? refreshToken;
      if (!nextAccessToken) {
        throw new Error("Refresh token endpoint did not return access_token");
      }
      setTokens(nextAccessToken, nextRefreshToken);
      processRefreshQueue(nextAccessToken);
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      const statusCode = (refreshError as AxiosError)?.response?.status;
      if (statusCode === 404 || statusCode === 405) {
        refreshSupported = false;
      }
      processRefreshQueue(null);
      clearTokens();
      onSessionExpired?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

export function setTokens(nextAccessToken: string, nextRefreshToken?: string | null) {
  accessToken = nextAccessToken;
  refreshToken = nextRefreshToken ?? null;
  localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken);
  if (nextRefreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getStoredAccessToken() {
  return accessToken;
}

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    return response.data as {
      access_token: string;
      token_type: string;
      refresh_token?: string;
      user: User;
    };
  },
  async me() {
    const response = await api.get("/auth/me");
    return response.data as User;
  },
};

export const taskService = {
  async list(params?: { student_id?: string; status_filter?: string; search?: string }) {
    const response = await api.get("/tasks/", { params });
    return response.data as TaskItem[];
  },
  async create(payload: {
    title: string;
    description?: string;
    student_id?: string;
    student_ids?: string[];
    status?: "todo" | "in_progress" | "done";
    due_date?: string | null;
    tags?: string[];
  }) {
    const response = await api.post("/tasks/", payload);
    return response.data as TaskItem | { created: TaskItem[]; count: number };
  },
  async update(taskId: string, payload: Partial<TaskItem>) {
    const response = await api.patch(`/tasks/${taskId}`, payload);
    return response.data as TaskItem;
  },
};

export const reportService = {
  async list(params?: { student_id?: string; mentor_id?: string; search?: string }) {
    const response = await api.get("/reports/", { params });
    return response.data as ReportItem[];
  },
  async create(payload: {
    title: string;
    week_label: string;
    content: string;
    highlights: string[];
    blockers: string[];
  }) {
    const response = await api.post("/reports/", payload);
    return response.data as ReportItem;
  },
  async upload(reportId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/reports/${reportId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  async feedback(reportId: string, comment: string) {
    const response = await api.post(`/reports/${reportId}/feedback`, { comment });
    return response.data;
  },
};

export const analyticsService = {
  async overview() {
    const response = await api.get("/analytics/overview");
    return response.data as AnalyticsOverview;
  },
};

export const notificationService = {
  async list() {
    const response = await api.get("/notifications/");
    return response.data as NotificationItem[];
  },
  async markRead(notificationId: string) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },
};

export const userService = {
  async list(params?: { role?: "admin" | "mentor" | "student"; search?: string }) {
    const response = await api.get("/users/", { params });
    return response.data as User[];
  },
  async create(payload: {
    name: string;
    email: string;
    password: string;
    role: "mentor" | "student";
    mentor_id?: string | null;
    internship_id?: string | null;
    github_username?: string | null;
  }) {
    const response = await api.post("/users/", payload);
    return response.data as User;
  },
  async update(
    userId: string,
    payload: {
      name?: string;
      email?: string;
      password?: string;
      role?: "admin" | "mentor" | "student";
      mentor_id?: string | null;
      internship_id?: string | null;
      github_username?: string | null;
    }
  ) {
    const response = await api.patch(`/users/${userId}`, payload);
    return response.data as User;
  },
  async resetPassword(userId: string, newPassword: string) {
    const response = await api.patch(`/users/${userId}/reset-password`, { new_password: newPassword });
    return response.data as { message: string };
  },
  async remove(userId: string) {
    const response = await api.delete(`/users/${userId}`);
    return response.data as { message: string };
  },
};

export const internshipService = {
  async list() {
    const response = await api.get("/internships/");
    return response.data as Internship[];
  },
  async create(payload: {
    title: string;
    domain: string;
    description?: string | null;
    duration_weeks?: number;
    is_active?: boolean;
  }) {
    const response = await api.post("/internships/", payload);
    return response.data as Internship;
  },
  async update(
    internshipId: string,
    payload: {
      title?: string;
      domain?: string;
      description?: string | null;
      duration_weeks?: number;
      is_active?: boolean;
    }
  ) {
    const response = await api.patch(`/internships/${internshipId}`, payload);
    return response.data as Internship;
  },
  async remove(internshipId: string) {
    const response = await api.delete(`/internships/${internshipId}`);
    return response.data as { message: string };
  },
};
