import { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginForm, RegisterForm, AuthState } from '../types/user';

interface AuthContextType extends AuthState {
  login: (data: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedAuth = localStorage.getItem('auth');
    return savedAuth
      ? JSON.parse(savedAuth)
      : { user: null, token: null, isAuthenticated: false };
  });

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(authState));
  }, [authState]);

  const login = async (data: LoginForm) => {
    try {
      // TODO: 实际项目中这里需要调用后端 API
      // 这里暂时模拟登录成功
      const mockUser: User = {
        id: '1',
        username: data.username,
        email: 'user@example.com',
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      const mockToken = 'mock-jwt-token';

      setAuthState({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
      });
    } catch (error) {
      throw new Error('登录失败');
    }
  };

  const register = async (data: RegisterForm) => {
    try {
      // TODO: 实际项目中这里需要调用后端 API
      // 这里暂时模拟注册成功
      const mockUser: User = {
        id: '1',
        username: data.username,
        email: data.email,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      const mockToken = 'mock-jwt-token';

      setAuthState({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
      });
    } catch (error) {
      throw new Error('注册失败');
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 