import { useState, useEffect, useCallback } from "react";

export const useAdminAuth = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const login = useCallback(async (inputPassword) => {
    setIsLoading(true);
    setAuthError("");
    try {
      const response = await fetch("/api/admin/emails", {
        headers: {
          Authorization: inputPassword,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setPassword(inputPassword);
        sessionStorage.setItem("vayo_admin_token", inputPassword);
        return true;
      } else {
        setAuthError(data.error || "Authentication failed.");
        sessionStorage.removeItem("vayo_admin_token");
        return false;
      }
    } catch (err) {
      setAuthError("Failed to connect to database.");
      addToast("Failed to connect to database.", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const logout = useCallback(() => {
    sessionStorage.removeItem("vayo_admin_token");
    setIsAuthenticated(false);
    setPassword("");
    addToast("Logged out of session", "info");
  }, [addToast]);

  useEffect(() => {
    const cachedPassword = sessionStorage.getItem("vayo_admin_token");
    if (cachedPassword) {
      Promise.resolve().then(() => {
        setPassword(cachedPassword);
        login(cachedPassword);
      });
    }
  }, [login]);

  return {
    password,
    setPassword,
    isAuthenticated,
    setIsAuthenticated,
    authError,
    setAuthError,
    isLoading,
    login,
    logout,
    toasts,
    addToast
  };
};
