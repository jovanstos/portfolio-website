import { api } from "./client";

export interface projects {
    id: number;
    title: string;
    description: string;
    url: string;
    imagedescription: string;
    imageurl: string;
}

export const getProjects = async ({
    queryKey,
}: {
    queryKey: [string, string];
}): Promise<projects[]> => {
    const [, type] = queryKey;

    const res = await api.get(`/projects/all/${type}`);

    return res.data;
};

export const getLimitedProjects = async ({
    queryKey,
}: {
    queryKey: [string, string, string];
}): Promise<projects[]> => {
    const [, type, limit] = queryKey;

    const res = await api.get(`/projects/all/${type}/${limit}`);

    return res.data;
};

export const getProjectByID = async ({
    queryKey,
}: {
    queryKey: [string, string];
}): Promise<projects[]> => {
    const [, id] = queryKey;

    const res = await api.get(`/projects/id/${id}`);

    return res.data;
};