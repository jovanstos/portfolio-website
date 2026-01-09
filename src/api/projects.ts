import { api } from "./client";
import type { project } from "../types/project"

export const getProjects = async ({
    queryKey,
}: {
    queryKey: [string, string];
}): Promise<project[]> => {
    const [, type] = queryKey;

    const res = await api.get(`/projects/all/${type}`);

    return res.data;
};

export const getLimitedProjects = async ({
    queryKey,
}: {
    queryKey: [string, string, string];
}): Promise<project[]> => {
    const [, type, limit] = queryKey;

    const res = await api.get(`/projects/all/${type}/${limit}`);

    return res.data;
};

export const getProjectByID = async ({ queryKey }: any): Promise<project> => {
    const [, id] = queryKey;

    const res = await api.get(`/projects/id/${id}`);

    return res.data;
}