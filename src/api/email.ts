import { api } from "./client";
import type { ContactPayload } from "../types/contactTypes";

export const sendEmail = async (payload: ContactPayload) => {
  const res = await api.post("/email", payload);

  return res.data;
};
