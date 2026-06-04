import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

// Attach token from localStorage to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;

      // Don't retry if the refresh endpoint itself failed
      if (err.config.url?.includes("/auth/refresh")) {
        return Promise.reject(err);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
          err.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axiosInstance(err.config);
        }
      } catch {
        // Only redirect if user was actually logged in
        const hadToken = localStorage.getItem("accessToken");
        localStorage.removeItem("accessToken");
        if (hadToken && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        // Guest user → silently reject, no redirect
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;