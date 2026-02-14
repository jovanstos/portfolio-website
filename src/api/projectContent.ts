import { api } from "./client";
import type { ProjectContent } from "../types/projectTypes";

export const getProjectContentByID = async ({
  queryKey,
}: any): Promise<ProjectContent[]> => {
  const [, id] = queryKey;

  const res = await api.get(`/project-content/id/${id}`);

  return res.data;
};
