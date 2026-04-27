import { useCallback, useState } from "react";
import { useToast } from "../context/ToastContext";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const callApi = useCallback(
    async <T>(apiFn: () => Promise<T>, options?: { successMessage?: string; errorMessage?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn();
        if (options?.successMessage) {
          showToast({ type: "success", title: options.successMessage });
        }
        return result;
      } catch (err: any) {
        const message =
          options?.errorMessage ??
          err?.response?.data?.detail ??
          err?.message ??
          "Something went wrong while processing your request.";
        setError(message);
        showToast({ type: "error", title: "Request failed", description: message });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  return { loading, error, callApi };
}
