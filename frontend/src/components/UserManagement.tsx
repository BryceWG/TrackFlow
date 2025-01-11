import { useState } from 'react';
import { User, UserRole } from '../types/user';
import { Modal } from './Modal';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onAddUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  onClose: () => void;
}

interface UserFormData {
  username: string;
  password: string;
  role: UserRole;
}

export function UserManagement({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onClose
}: UserManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    role: 'user'
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '',
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        role: 'user'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (editingUser) {
      const updates: Partial<User> = {
        username: formData.username,
        role: formData.role
      };
      if (formData.password) {
        updates.password = formData.password;
      }
      onUpdateUser(editingUser.id, updates);
    } else {
      onAddUser(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">用户管理</h2>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          添加用户
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {users.map(user => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <div className="font-medium">{user.username}</div>
              <div className="text-sm text-gray-500">
                {user.role === 'admin' ? '管理员' : '普通用户'}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {(currentUser.id === user.id || currentUser.role === 'admin') && (
                <button
                  onClick={() => handleOpenModal(user)}
                  className="p-1 text-gray-600 hover:text-gray-900"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              )}
              {currentUser.role === 'admin' && currentUser.id !== user.id && (
                <button
                  onClick={() => onDeleteUser(user.id)}
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          关闭
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? '编辑用户' : '添加用户'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              用户名
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {editingUser ? '新密码（留空保持不变）' : '密码'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required={!editingUser}
            />
          </div>
          {currentUser.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                角色
              </label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editingUser ? '保存' : '创建'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 