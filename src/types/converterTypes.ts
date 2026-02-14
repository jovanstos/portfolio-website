export type ImageFormat = "png" | "jpg" | "jpeg" | "webp" | "gif";

export interface ConvertImageRequest {
  file: File;
  outputFormat: ImageFormat;
}
