import { api } from "./client";

export const postCodeToCompiler = async (usersScript: string): Promise<Blob> => {
    const res = await api.post("/python/compile",
        { code: usersScript },
        { responseType: 'blob' }
    );

    return res.data;
};