import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { ApiRequestError } from "@/lib/api/error";
import { isApiEnvelope, unwrapApiEnvelope } from "@/lib/api/envelope";
import { redirectToSignInAfterUnauthorized } from "@/lib/api/unauthorized-redirect";

export const apiClient = axios.create({
  headers: { Accept: "application/json" },
  timeout: 20_000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => ({ ...response, data: unwrapApiEnvelope(response.data, response.status) }),
  (error: unknown) => {
    if (!(error instanceof AxiosError)) return Promise.reject(error);

    const status = error.response?.status;
    const body = error.response?.data;
    redirectToSignInAfterUnauthorized(status);
    if (isApiEnvelope(body) && !body.success) {
      return Promise.reject(
        new ApiRequestError(
          body.error.message,
          body.error.code,
          body.meta.requestId,
          body.error.details,
          status,
        ),
      );
    }

    return Promise.reject(
      new ApiRequestError(
        error.code === "ECONNABORTED" ? "Yêu cầu mất quá nhiều thời gian" : "Không thể kết nối máy chủ",
        error.code ?? "NETWORK_ERROR",
        error.response?.headers?.["x-request-id"],
        body,
        status,
      ),
    );
  },
);

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}
