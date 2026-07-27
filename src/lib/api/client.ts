import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { ApiRequestError } from "@/lib/api/error";
import { isApiEnvelope, unwrapApiEnvelope } from "@/lib/api/envelope";
import { redirectToSignInAfterUnauthorized } from "@/lib/api/unauthorized-redirect";
import {
  addErrorBreadcrumb,
  markClientErrorAsReported,
  reportApiFailure,
} from "@/lib/monitoring/client-error-reporter";
import { sanitizeRoutePath } from "@/domain/error-reporting";

export const apiClient = axios.create({
  headers: { Accept: "application/json" },
  timeout: 20_000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const path = sanitizeRoutePath(config.url ?? "/");
  if (path !== "/api/error-reports") {
    addErrorBreadcrumb("request", "api.request", {
      method: (config.method || "get").toUpperCase(),
      path,
    });
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => ({ ...response, data: unwrapApiEnvelope(response.data, response.status) }),
  (error: unknown) => {
    if (!(error instanceof AxiosError)) return Promise.reject(error);

    const status = error.response?.status;
    const body = error.response?.data;
    const requestId =
      isApiEnvelope(body) && !body.success ? body.meta.requestId : error.response?.headers?.["x-request-id"];
    reportApiFailure({
      method: error.config?.method,
      url: error.config?.url,
      status,
      code: error.code,
      requestId,
    });
    redirectToSignInAfterUnauthorized(status);
    const normalizedError =
      isApiEnvelope(body) && !body.success
        ? new ApiRequestError(
            body.error.message,
            body.error.code,
            body.meta.requestId,
            body.error.details,
            status,
          )
        : new ApiRequestError(
            error.code === "ECONNABORTED" ? "Yêu cầu mất quá nhiều thời gian" : "Không thể kết nối máy chủ",
            error.code ?? "NETWORK_ERROR",
            error.response?.headers?.["x-request-id"],
            body,
            status,
          );
    markClientErrorAsReported(normalizedError);
    return Promise.reject(normalizedError);
  },
);

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}
