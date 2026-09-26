import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "sonner";

// Full-screen loader rendered while a page is only rendered after auth check/login completes.

export function AuthProvider({ children }) {
  const url = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const login = async (data) => {
    setLoading(true);
    setErr(null);
    try {
      const response = await axios.post(`${url}/users/login`, data, {
        withCredentials: true,
      });
      setUser(response.data.user);
      setLoading(false);
      return true;
    } catch (error) {
      // console.log(error);
      // console.log(error.response);
      setErr(error.response?.data?.message || error.message);
      setLoading(false);
      toast.error(`Login failed: ${error.response.data.message}`, {
        richColors: true,
        position: "top-center",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${url}/users/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${url}/users/me`, {
          credentials: "include",
        });
        console.log(response);
        if (response.ok) {
          const res = await response.json();
          setUser(res.user);
        }
      } catch (error) {
        console.log("CHECK USER:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [url]);
  return (
    <AuthContext.Provider value={{ user, loading, err, url, login, logout }}>
      {/* Show loading screen during auth check/login; only render the page when done */}
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
}
