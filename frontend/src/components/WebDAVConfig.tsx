import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface WebDAVConfigProps {
  onClose: () => void;
  onSave: (config: { url: string; username: string; password: string }) => void;
}

export function WebDAVConfig({ onClose, onSave }: WebDAVConfigProps) {
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTest = async () => {
    if (!url || !username || !password) {
      setError('请填写完整的配置信息');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await window.webdav.connect({ url, username, password });
      if (result.success) {
        setError('连接成功！');
      } else {
        setError(result.error || '连接失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!url || !username || !password) {
      setError('请填写完整的配置信息');
      return;
    }
    onSave({ url, username, password });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          WebDAV 服务器地址
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/webdav/"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          用户名
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          密码
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className={`text-sm ${error.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleTest}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : '测试连接'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          保存
        </button>
      </div>
    </div>
  );
} 