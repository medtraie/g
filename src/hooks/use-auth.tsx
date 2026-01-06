import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { API_BASE_URL } from "@/lib/api-client";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  company?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

type AuthProviderProps = {
  children: ReactNode;
};

const STORAGE_KEY_TOKEN = "fleetwise_token";
const STORAGE_KEY_USER = "fleetwise_user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedToken = window.localStorage.getItem(STORAGE_KEY_TOKEN);
    const storedUser = window.localStorage.getItem(STORAGE_KEY_USER);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthUser;
        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY_TOKEN);
        window.localStorage.removeItem(STORAGE_KEY_USER);
      }
    } else {
      // Auto-login for demo purposes
      const demoUser: AuthUser = {
        id: "demo",
        name: "Admin Demo",
        email: "demo@fleetpro.ma",
        company: "FleetPro Demo",
      };
      setToken("demo-token");
      setUser(demoUser);
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    if (email === "demo@fleetpro.ma" && password === "Demo123!") {
      const accessToken = "demo-token";
      const apiUser: AuthUser = {
        id: "demo",
        name: "Admin Demo",
        email,
        company: "FleetPro Demo",
      };

      setToken(accessToken);
      setUser(apiUser);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY_TOKEN, accessToken);
        window.localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(apiUser));
      }

      return;
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const contentType = response.headers.get("Content-Type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message = isJson && data && typeof data === "object" && "message" in data ? (data as any).message : response.statusText;
      throw new Error(typeof message === "string" ? message : "Authentication failed");
    }

    const accessToken = (data as any).accessToken as string | undefined;
    const apiUser = (data as any).user as AuthUser | undefined;

    if (!accessToken || !apiUser) {
      throw new Error("Invalid authentication response");
    }

    setToken(accessToken);
    setUser(apiUser);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_TOKEN, accessToken);
      window.localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(apiUser));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY_TOKEN);
      window.localStorage.removeItem(STORAGE_KEY_USER);
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
