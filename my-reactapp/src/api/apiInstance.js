import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3001/api",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        await axios.post(
          "http://localhost:3001/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        return axiosInstance(err.config);
      } catch {
        // ✅ Only redirect if NOT already on login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;