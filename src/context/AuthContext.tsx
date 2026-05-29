import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LocalDB } from '../db/localDb';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (username: string, passwordPlain: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if there is a logged in user in localStorage
    const savedUser = localStorage.getItem('mediaflow_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        // Fetch fresh copy from DB to reflect updates
        const users = LocalDB.getUsersSync();
        const freshUser = users.find(u => u.id === parsed.id);
        if (freshUser) {
          setCurrentUser(freshUser);
        } else {
          setCurrentUser(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved session', e);
        localStorage.removeItem('mediaflow_session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, passwordPlain: string): Promise<boolean> => {
    setLoading(true);
    try {
      const user = await LocalDB.authenticate(username, passwordPlain);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('mediaflow_session', JSON.stringify(user));
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Login error', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mediaflow_session');
  };

  const refreshUser = () => {
    if (currentUser) {
      const users = LocalDB.getUsersSync();
      const freshUser = users.find(u => u.id === currentUser.id);
      if (freshUser) {
        setCurrentUser(freshUser);
        localStorage.setItem('mediaflow_session', JSON.stringify(freshUser));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
