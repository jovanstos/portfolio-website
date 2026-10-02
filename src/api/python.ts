import { api } from "./client";

export const postCodeToCompiler = async (
  usersScript: string,
  signal?: AbortSignal,
): Promise<Blob> => {
  const res = await api.post(
    "/python/compile",
    { code: usersScript },
    { responseType: "blob", signal },
  );

  return res.data;
};

export const postDataToPIM = async (
  stockData: number[][],
): Promise<number[]> => {
  const res = await api.post("/python/pim", { data: stockData });

  return res.data;
};
