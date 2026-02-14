import { api } from "./client";
import type { ImageFormat } from "../types/converterTypes";

export interface ConvertImageParams {
  file: File;
  outputFormat: ImageFormat;
}

export const convertImage = async (
  params: ConvertImageParams,
): Promise<Blob> => {
  const formData = new FormData();

  formData.append("image", params.file);
  formData.append("outputFormat", params.outputFormat);

  const res = await api.post("/convert", formData, {
    responseType: "blob",
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
