import axios from "axios";
import { LocalStorage, TOKEN_KEYS } from "../utility/localStorage";



let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001/api/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
  timeout: 10000, 
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = LocalStorage.getItem(TOKEN_KEYS.customer);
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = LocalStorage.getItem("customer_refresh_token");

      if (!refreshToken) {
        LocalStorage.removeItem(TOKEN_KEYS.customer);
        LocalStorage.removeItem("customer_refresh_token");
        return Promise.reject(error);
      }

      try {
        const response = await axiosInstance.post("v1/auth/refresh-token", {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.tokens;

        LocalStorage.setItem(TOKEN_KEYS.customer, accessToken);
        LocalStorage.setItem("customer_refresh_token", newRefreshToken);

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        isRefreshing = false;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        LocalStorage.removeItem(TOKEN_KEYS.customer);
        LocalStorage.removeItem("customer_refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
