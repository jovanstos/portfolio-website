import { api } from "./client";
import type { projectContent } from "../types/project"

export const getProjectContentByID = async ({ queryKey }: any): Promise<projectContent[]> => {
    const [, id] = queryKey;

    const res = await api.get(`/project-content/id/${id}`);

    return res.data;
}