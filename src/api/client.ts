import axios from "axios";

// Set up the base api path with axios
export const api = axios.create({
  baseURL: "/api",
});
