import { api } from "./client";
import type { ProjectData } from "../types/projectTypes";

export const getProjects = async ({
  queryKey,
}: {
  queryKey: [string, string];
}): Promise<ProjectData[]> => {
  const [, type] = queryKey;

  const res = await api.get(`/projects/all/${type}`);

  return res.data;
};

export const getProjectByID = async ({
  queryKey,
}: any): Promise<ProjectData> => {
  const [, id] = queryKey;

  const res = await api.get(`/projects/id/${id}`);

  return res.data;
};
