import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as customerApi from "../lib/customerApi";
import type { Customer } from "../lib/customerApi";

interface CustomerState {
  customer: Customer | null;
  /** True until the initial "restore session from token" check finishes. */
  initializing: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

const CustomerContext = createContext<CustomerState | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount, restore the session if a token is present.
  useEffect(() => {
    let active = true;
    (async () => {
      if (!customerApi.getToken()) {
        setInitializing(false);
        return;
      }
      try {
        const me = await customerApi.getProfile();
        if (active) setCustomer(me);
      } catch {
        customerApi.clearToken();
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const me = await customerApi.login({ email, password });
      setCustomer(me);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Login failed.";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register: CustomerState["register"] = async (input) => {
    setLoading(true);
    setError(null);
    try {
      const me = await customerApi.register(input);
      setCustomer(me);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Registration failed.";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    customerApi.logout();
    setCustomer(null);
  };

  const updateProfile: CustomerState["updateProfile"] = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const me = await customerApi.updateProfile(data);
      setCustomer(me);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Update failed.";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    try {
      const me = await customerApi.getProfile();
      setCustomer(me);
    } catch {
      logout();
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        initializing,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        refresh,
        clearError: () => setError(null),
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer(): CustomerState {
  const ctx = useContext(CustomerContext);
  if (!ctx)
    throw new Error("useCustomer must be used within a CustomerProvider");
  return ctx;
}
