import axios from "axios";
export class ApiError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
export const api = axios.create({ baseURL: "/api", timeout: 45_000 });
export async function errorMessage(error: unknown): Promise<string> {
  if (axios.isAxiosError(error)) {
    let data: unknown = error.response?.data;
    if (data instanceof Blob) {
      try {
        data = JSON.parse(await data.text());
      } catch {
        data = undefined;
      }
    }
    if (data && typeof data === "object") {
      const body = data as Record<string, unknown>;
      if (typeof body.message === "string") return body.message;
      if (typeof body.error === "string") return body.error;
    }
    if (error.code === "ECONNABORTED")
      return "The request timed out. Please try again.";
    if (!error.response)
      return "Unable to connect. Check your connection and try again.";
  }
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    throw new ApiError(
      await errorMessage(error),
      axios.isAxiosError(error) ? error.response?.status : undefined,
    );
  },
);
