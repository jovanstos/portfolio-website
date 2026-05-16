import { api } from "./client";
import type { QueryFunctionContext } from "@tanstack/react-query";
import type { ProjectData } from "../types/projectTypes";

export const getProjects = async ({
  queryKey,
}: QueryFunctionContext): Promise<ProjectData[]> => {
  const type = queryKey[1] as string;

  const res = await api.get(`/projects/all/${type}`);

  return res.data;
};

export const getProjectByID = async ({
  queryKey,
}: QueryFunctionContext): Promise<ProjectData> => {
  const id = queryKey[1];

  const res = await api.get(`/projects/id/${id}`);

  return res.data;
};
