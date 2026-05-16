import { useCallback, useState } from "react";
import { mapAuthError } from "#/lib/auth-errors";

interface UseAuthFormOptions {
  onSuccess: () => void;
}

interface UseAuthFormReturn {
  serverError: string | null;
  isLoading: boolean;
  execute: <T>(
    action: () => Promise<{
      data?: T;
      error?: {
        code?: string;
        message?: string;
      } | null;
    }>,
  ) => Promise<void>;
}

export const useAuthForm = ({
  onSuccess,
}: UseAuthFormOptions): UseAuthFormReturn => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async <T>(
      action: () => Promise<{
        data?: T;
        error?: {
          code?: string;
          message?: string;
        } | null;
      }>,
    ) => {
      setServerError(null);
      setIsLoading(true);
      try {
        const { data, error } = await action();

        if (error) {
          setServerError(mapAuthError(error));
          return;
        }

        if (data) {
          onSuccess();
        }
      } catch {
        setServerError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess],
  );

  return {
    serverError,
    isLoading,
    execute,
  };
};
