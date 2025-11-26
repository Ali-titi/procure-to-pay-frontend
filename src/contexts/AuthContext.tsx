import React, { useEffect, useState, createContext, useContext } from 'react';
import axios from 'axios';
type UserRole = 'staff' | 'approver1' | 'approver2' | 'finance' | 'admin' | null;
interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    // Check if user is authenticated on page load
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setIsAuthenticated(true);
      setUserRole(parsedUser.role);
      setUser(parsedUser);
      // Set default axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setIsLoading(false);
  }, []);
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        email, // Use email for login
        password,
      });

      const { access, refresh, user } = response.data;

      // Save tokens and user to localStorage
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      // Set auth state
      setIsAuthenticated(true);
      setUserRole(user.role);
      setUser(user);

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:8000/api/auth/register/', {
        name,
        email,
        password,
        role,
      });

      const { access, refresh, user } = response.data;

      // Save tokens and user to localStorage
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      // Set auth state
      setIsAuthenticated(true);
      setUserRole(user.role);
      setUser(user);

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    // Remove token, refresh token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Reset auth state
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
  };
  return <AuthContext.Provider value={{
    isAuthenticated,
    userRole,
    user,
    login,
    register,
    logout,
    isLoading
  }}>
      {children}
    </AuthContext.Provider>;
};