// components/SuperAdminProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../../../api/apiInstance";


export default function SuperAdminProtectedRoute({ children }) {
  const [status, setStatus] = useState("loading"); // "loading" | "authorized" | "unauthorized"

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        if (res.data.role === "superadmin") {
          setStatus("authorized");
        } else {
          setStatus("unauthorized");
        }
      } catch {
        setStatus("unauthorized");
      }
    };
    check();
  }, []);

  if (status === "loading") return null; // or a spinner
  if (status === "unauthorized") return <Navigate to="/superadmin/login" />;
  return children;
}