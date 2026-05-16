const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_LOCKED: "Account temporarily locked. Try again later.",
  RATE_LIMITED: "Too many attempts. Please wait.",
  USER_NOT_FOUND: "Invalid email or password",
};

export const mapAuthError = (error: {
  code?: string;
  message?: string;
}): string => {
  if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }
  return "An unexpected error occurred. Please try again.";
};
