import { afterAll, vi } from "vitest";
import "dotenv/config";

// Suppress expected library error logs (Better Auth logs auth failures at ERROR level).
// Vitest already captures assertion failures — noisy console.error from libraries
// during negative tests just clutters output.
vi.spyOn(console, "error").mockImplementation(() => {});

afterAll(() => {
  vi.restoreAllMocks();
});
