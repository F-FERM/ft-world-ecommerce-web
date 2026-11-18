import axios from "axios";
import { baseURL } from "./baseurl";
import { TOKEN_KEYS } from "../utility/localStorage";

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Admin axios — always reads admin_access_token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEYS.admin);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;