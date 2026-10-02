import { api } from "./client";
import type { QueryFunctionContext } from "@tanstack/react-query";
import type { ProjectData } from "../types/projectTypes";
function project(value: unknown): ProjectData {
  if (!value || typeof value !== "object")
    throw new Error("Invalid project response.");
  const data = value as Record<string, unknown>;
  if (!Number.isSafeInteger(data.id) || Number(data.id) <= 0)
    throw new Error("Invalid project ID.");
  const text = (key: string) =>
    typeof data[key] === "string" ? (data[key] as string) : "";
  return {
    id: Number(data.id),
    title: text("title") || "Untitled project",
    description: text("description"),
    url: text("url"),
    imageurl: text("imageurl") || "/placeholder.webp",
    imagedescription: text("imagedescription"),
  };
}
export async function getProjects({
  queryKey,
  signal,
}: QueryFunctionContext): Promise<ProjectData[]> {
  const res = await api.get(`/projects/all/${queryKey[1]}`, { signal });
  if (!Array.isArray(res.data)) throw new Error("Invalid project list.");
  return res.data.map(project);
}
export async function getProjectByID({
  queryKey,
  signal,
}: QueryFunctionContext): Promise<ProjectData> {
  return project(
    (await api.get(`/projects/id/${queryKey[1]}`, { signal })).data,
  );
}
