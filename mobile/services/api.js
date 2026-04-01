import axios from "axios";
import { getSecureItem } from "../lib/secureStorage";

export function createApi(getServerUrl, onUnauthorized) {
  const api = axios.create();
  api.interceptors.request.use(async (config) => {
    const token = await getSecureItem("staff_jwt");
    config.baseURL = getServerUrl();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  api.interceptors.response.use(
    (res) => res,
    async (err) => {
      if (err?.response?.status === 401 && onUnauthorized) onUnauthorized();
      return Promise.reject(err);
    }
  );
  return api;
}
