import { api } from "./client";

export interface projects {
    id: number;
    title: string;
    description: string;
    url: string;
    imagedescription: string;
    imageurl: string;
}

export const getProjects = async (): Promise<projects[]> => {
    const res = await api.get("/projects");

    return res.data;
};