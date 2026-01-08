/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  AuthState,
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '../types/auth.types';

const API_BASE_URL = 'http://127.0.0.1:8000';
const TOKEN_KEY = 'promptlens_token';
const USER_KEY = 'promptlens_user';

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Transform API response to frontend User type
function transformUser(apiUser: AuthResponse['user']): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    avatarUrl: apiUser.avatar_url,
    provider: apiUser.provider as 'local' | 'google',
    createdAt: apiUser.created_at,
    lastLogin: apiUser.last_login,
  };
}

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          // Verify token is still valid
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setState({
              user: transformUser(userData),
              token: storedToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  // Login with email and password
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: data.detail || 'Login failed' };
        }

        const authData = data as AuthResponse;
        const user = transformUser(authData.user);

        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, authData.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        setState({
          user,
          token: authData.access_token,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error. Please try again.' };
      }
    },
    []
  );

  // Register new user
  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: data.detail || 'Registration failed' };
        }

        const authData = data as AuthResponse;
        const user = transformUser(authData.user);

        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, authData.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        setState({
          user,
          token: authData.access_token,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Network error. Please try again.' };
      }
    },
    []
  );

  // Login with Google
  const loginWithGoogle = useCallback(
    async (credential: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ credential }),
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: data.detail || 'Google login failed' };
        }

        const authData = data as AuthResponse;
        const user = transformUser(authData.user);

        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, authData.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        setState({
          user,
          token: authData.access_token,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } catch (error) {
        console.error('Google login error:', error);
        return { success: false, error: 'Network error. Please try again.' };
      }
    },
    []
  );

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const user = transformUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setState((prev) => ({ ...prev, user }));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
