import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, WorkerProfile, ContractorProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithOtp: (phone: string, otp: string, role: UserRole) => Promise<User>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateWorkerProfile: (profile: Partial<WorkerProfile>) => Promise<void>;
  updateContractorProfile: (profile: Partial<ContractorProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  setDemoWorker: () => void;
  setDemoContractor: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('proofwork_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const role: UserRole = user?.role || 'worker';

  useEffect(() => {
    if (user) {
      localStorage.setItem('proofwork_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('proofwork_user');
    }
  }, [user]);

  const loginWithOtp = async (phone: string, otp: string, userRole: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      const resp = await api.verifyOtp(phone, otp, userRole);
      setUser(resp.user);
      return resp.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('proofwork_user');
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const refreshed = await api.getMe(user.id);
      setUser(refreshed);
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  const updateWorkerProfile = async (profileData: Partial<WorkerProfile>) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updated = await api.updateWorkerProfile(user.id, profileData);
      setUser(prev => prev ? { ...prev, worker_profile: updated } : null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateContractorProfile = async (profileData: Partial<ContractorProfile>) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updated = await api.updateContractorProfile(user.id, profileData);
      setUser(prev => prev ? { ...prev, contractor_profile: updated } : null);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper quick seed switches for smooth demo
  const setDemoWorker = () => {
    const demo: User = {
      id: "worker-01",
      phone: "+919845012341",
      role: "worker",
      created_at: "2026-11-20T09:00:00Z",
      worker_profile: {
        user_id: "worker-01",
        name: "Manjunath K.",
        language: "kn",
        trade: "Electrician",
        locality: "Peenya",
        latitude: 13.0285,
        longitude: 77.5197,
        experience_years: 8,
        bio: "Expert in industrial panel boards, star-delta starters, and factory conduit routing.",
        daily_rate: 1000,
        available: 1
      }
    };
    setUser(demo);
  };

  const setDemoContractor = () => {
    const demo: User = {
      id: "user-contractor-demo",
      phone: "+919900112233",
      role: "contractor",
      created_at: "2026-11-20T10:00:00Z",
      contractor_profile: {
        user_id: "user-contractor-demo",
        company_name: "Nandi Electrical Projects & Infra",
        contact_person: "Srinivas Rao (Lead Contractor)",
        phone: "+919900112233",
        locality: "Jayanagar",
        latitude: 12.9308,
        longitude: 77.5838
      }
    };
    setUser(demo);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoading,
        loginWithOtp,
        logout,
        switchRole,
        updateWorkerProfile,
        updateContractorProfile,
        refreshUser,
        setDemoWorker,
        setDemoContractor
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
