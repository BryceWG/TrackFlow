import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { UserManagement } from './components/UserManagement';
import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { User } from './types/user';
import { Toast } from './components/Toast';

// 主界面组件
function MainApp() {
  const { user, logout } = useAuth();
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string; show: boolean }>({
    type: 'info',
    message: '',
    show: false,
  });

  // 显示提示信息
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message, show: true });
  };

  // 这里是原来的App组件的内容
  // ... 保留原有的所有状态和逻辑 ...

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">TrackFlow</h2>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4">
            {/* 原有的项目列表 */}
          </nav>

          <div className="p-4 border-t space-y-2">
            {user?.role === 'admin' && (
              <button
                onClick={() => {/* 导航到用户管理 */}}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 rounded-md hover:bg-gray-100"
              >
                用户管理
              </button>
            )}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-md">
              <span className="text-sm text-gray-600">{user?.username}</span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        {/* 原有的主内容 */}
      </main>

      {/* Toast 通知 */}
      <Toast
        type={toast.type}
        message={toast.message}
        show={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}

// 认证页面容器
function AuthPages() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleLogin = async (data: { username: string; password: string }) => {
    try {
      setIsLoading(true);
      setError('');
      await login(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      setError('');
      await register(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : '注册失败');
    } finally {
      setIsLoading(false);
    }
  };

  return isLogin ? (
    <Login
      onLogin={handleLogin}
      onRegister={() => setIsLogin(false)}
      isLoading={isLoading}
      error={error}
    />
  ) : (
    <Register
      onRegister={handleRegister}
      onBack={() => setIsLogin(true)}
      isLoading={isLoading}
      error={error}
    />
  );
}

// 用户管理页面
function AdminPage() {
  const { user } = useAuth();
  const [users] = useState<User[]>([
    // 模拟数据
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      username: 'user1',
      email: 'user1@example.com',
      role: 'user',
      createdAt: new Date().toISOString(),
    },
  ]);

  const handleUpdateUser = (userId: string, role: 'admin' | 'user') => {
    // TODO: 实现用户角色更新
    console.log('Update user role:', userId, role);
  };

  const handleDeleteUser = (userId: string) => {
    // TODO: 实现用户删除
    console.log('Delete user:', userId);
  };

  return (
    <UserManagement
      users={users}
      onUpdateUser={handleUpdateUser}
      onDeleteUser={handleDeleteUser}
      currentUserId={user?.id || ''}
    />
  );
}

// 主应用
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPages />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainApp />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute requireAdmin>
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
