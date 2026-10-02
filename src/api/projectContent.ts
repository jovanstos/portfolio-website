import { api } from "./client";
import type { QueryFunctionContext } from "@tanstack/react-query";
import type { ProjectContent } from "../types/projectTypes";
export async function getProjectContentByID({
  queryKey,
  signal,
}: QueryFunctionContext): Promise<ProjectContent[]> {
  const res = await api.get(`/project-content/id/${queryKey[1]}`, { signal });
  if (!Array.isArray(res.data)) throw new Error("Invalid article response.");
  return res.data.map((value: unknown) => {
    if (!value || typeof value !== "object")
      throw new Error("Invalid article.");
    const article = value as Record<string, unknown>;
    if (!Number.isSafeInteger(article.id))
      throw new Error("Invalid article ID.");
    const text = (key: string) =>
      typeof article[key] === "string" ? (article[key] as string) : "";
    return {
      id: Number(article.id),
      title: text("title"),
      text: text("text"),
      imageurl: text("imageurl"),
      imagedescription: text("imagedescription"),
    };
  });
}
