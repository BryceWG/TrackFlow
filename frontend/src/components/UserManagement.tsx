import { useState } from 'react';
import { User } from '../types/user';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';

interface UserManagementProps {
  users: User[];
  onUpdateUser: (userId: string, role: 'admin' | 'user') => void;
  onDeleteUser: (userId: string) => void;
  currentUserId: string;
}

export function UserManagement({ users, onUpdateUser, onDeleteUser, currentUserId }: UserManagementProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId: string;
    action: 'delete' | 'role';
    newRole?: 'admin' | 'user';
  }>({
    isOpen: false,
    userId: '',
    action: 'delete',
  });

  const handleRoleChange = (userId: string, newRole: 'admin' | 'user') => {
    setConfirmDialog({
      isOpen: true,
      userId,
      action: 'role',
      newRole,
    });
  };

  const handleDeleteUser = (userId: string) => {
    setConfirmDialog({
      isOpen: true,
      userId,
      action: 'delete',
    });
  };

  const handleConfirm = () => {
    if (confirmDialog.action === 'delete') {
      onDeleteUser(confirmDialog.userId);
    } else if (confirmDialog.action === 'role' && confirmDialog.newRole) {
      onUpdateUser(confirmDialog.userId, confirmDialog.newRole);
    }
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">用户管理</h1>
          <p className="mt-2 text-sm text-gray-700">
            管理系统中的所有用户账户，包括角色分配和账户删除。
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      用户名
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      邮箱
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      角色
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      注册时间
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {user.username}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'user')}
                          disabled={user.id === currentUserId}
                          className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="user">普通用户</option>
                          <option value="admin">管理员</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {user.id !== currentUserId && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleConfirm}
        title={confirmDialog.action === 'delete' ? '删除用户' : '修改用户角色'}
        message={
          confirmDialog.action === 'delete'
            ? '确定要删除这个用户吗？此操作无法撤销。'
            : '确定要修改该用户的角色吗？'
        }
        type={confirmDialog.action === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  );
} 