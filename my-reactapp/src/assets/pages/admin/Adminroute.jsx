import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axiosInstance from "../../../api/apiInstance";

export default function AdminRoute() {
  const [authState, setAuthState] = useState({
    loading: true,
    isAdmin: false,
  });

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await axiosInstance.get("/auth/me");

        const data = response.data;

        setAuthState({
          loading: false,
          isAdmin: data.role === "admin",
        });
      } catch (error) {
        setAuthState({
          loading: false,
          isAdmin: false,
        });
      }
    };

    verifyAdmin();
  }, []);

  if (authState.loading) return <div>Loading...</div>;
  if (!authState.isAdmin) return <Navigate to="/login" replace />;

  return <Outlet />;
}