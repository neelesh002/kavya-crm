// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Map of all valid users by email
const USERS = {
  "admin@salescrm.com":  { id:1, name:"System Admin", role:"ADMIN",       initials:"SA", password:"Admin@123" },
  "ananya@salescrm.com": { id:2, name:"Ananya Rao",   role:"SALES_AGENT", initials:"AR", password:"Sales@123" },
  "ravi@salescrm.com":   { id:3, name:"Ravi Patel",   role:"SALES_AGENT", initials:"RP", password:"Sales@123" },
  "sneha@salescrm.com":  { id:4, name:"Sneha Kumar",  role:"MANAGER",     initials:"SK", password:"Sales@123" },
  "mohan@salescrm.com":  { id:5, name:"Mohan Krishnan",role:"SALES_AGENT",initials:"MK", password:"Sales@123" },
};

export function AuthProvider({ children }) {

  // Load user from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("crm_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email, password) => {
    const found = USERS[email];

    if (found && found.password === password) {
      const { password: _, ...userData } = found;

      const loggedUser = { email, ...userData };

      setUser(loggedUser);

      // Save user to localStorage
      localStorage.setItem("crm_user", JSON.stringify(loggedUser));

      return { success: true };
    }

    return { success: false, error: "Invalid credentials" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("crm_user");
  };

  const isAdmin   = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER" || isAdmin;
  const isAgent   = user?.role === "SALES_AGENT";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isManager, isAgent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}