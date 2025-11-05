// src/lib/api/axiosInstance.ts
import axios from "axios";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  withCredentials: true,
});
