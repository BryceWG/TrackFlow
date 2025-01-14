import { useState } from 'react';
import { User, LoginCredentials } from '../types/user';
import { useLocalStorage } from './useLocalStorage';

// 使用更安全的加密方法
function encryptPassword(password: string): string {
  // 使用一个简单的 salt
  const salt = 'trackflow-salt';
  const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0));
  const byteHex = (n: number[]) => n.map(num => ("0" + Number(num).toString(16)).substr(-2)).join('');
  const applySaltToChar = (code: number[]) => code.map(c => textToChars(salt).reduce((a, b) => a ^ b, c));

  return password
    .split('')
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join('');
}

// 解密密码
function decryptPassword(encoded: string): string {
  const salt = 'trackflow-salt';
  const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0));
  const applySaltToChar = (code: number) => textToChars(salt).reduce((a, b) => a ^ b, code);
  
  return encoded
    .match(/.{1,2}/g)!
    .map(hex => parseInt(hex, 16))
    .map(applySaltToChar)
    .map(charCode => String.fromCharCode(charCode))
    .join('');
}

const INITIAL_ADMIN: User = {
  id: '1',
  username: 'admin',
  password: encryptPassword('admin123'),
  role: 'admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function useAuth() {
  const [users, setUsers] = useLocalStorage<User[]>('users', [INITIAL_ADMIN]);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [error, setError] = useState<string>('');

  const login = ({ username, password }: LoginCredentials) => {
    const user = users.find(u => u.username === username);
    if (!user || decryptPassword(user.password) !== password) {
      setError('用户名或密码错误');
      return false;
    }
    setCurrentUser(user);
    setError('');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const existingUser = users.find(u => u.username === newUser.username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    const user: User = {
      ...newUser,
      password: encryptPassword(newUser.password),
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUsers([...users, user]);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    if (updates.username) {
      const existingUser = users.find(
        u => u.username === updates.username && u.id !== userId
      );
      if (existingUser) {
        throw new Error('用户名已存在');
      }
    }

    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        const updatedUser = {
          ...user,
          ...updates,
          password: updates.password ? encryptPassword(updates.password) : user.password,
          updatedAt: new Date().toISOString(),
        };
        if (currentUser?.id === userId) {
          setCurrentUser(updatedUser);
        }
        return updatedUser;
      }
      return user;
    });

    setUsers(updatedUsers);
  };

  const deleteUser = (userId: string) => {
    if (users.length === 1) {
      throw new Error('不能删除最后一个用户');
    }
    
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) {
      throw new Error('不能删除最后一个管理员');
    }

    setUsers(users.filter(u => u.id !== userId));
  };

  return {
    users,
    currentUser,
    error,
    isAuthenticated: !!currentUser,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
  };
}
