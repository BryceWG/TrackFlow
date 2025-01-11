import { useState, useEffect } from 'react';
import { useWebDAV } from '../hooks/useWebDAV';

interface WebDAVConfigProps {
  onClose: () => void;
  onSave: (config: { url: string; username: string; password: string }) => Promise<void>;
}

export function WebDAVConfig({ onClose, onSave }: WebDAVConfigProps) {
  const { config, error } = useWebDAV();
  const [url, setUrl] = useState(config?.url || '');
  const [username, setUsername] = useState(config?.username || '');
  const [password, setPassword] = useState(config?.password || '');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError('');

    try {
      await onSave({ url, username, password });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {localError && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {localError}
        </div>
      )}

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
          服务器地址
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="https://dav.jianguoyun.com/dav/"
          required
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          用户名
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          密码
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
        {url.includes('jianguoyun') && (
          <p className="mt-1 text-sm text-gray-500">
            注意：如果使用坚果云，请使用应用密码而不是登录密码
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
} 