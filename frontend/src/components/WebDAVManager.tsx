import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { WebDAVConfig } from './WebDAVConfig';
import { useWebDAV } from '../hooks/useWebDAV';
import { Modal } from './Modal';

interface WebDAVManagerProps {
  projects: any[];
  entries: any[];
  users: any[];
  promptPresets: any[];
  onRestore: (data: { projects: any[]; entries: any[]; users: any[]; promptPresets: any[] }) => void;
  onClose: () => void;
}

export function WebDAVManager({
  projects,
  entries,
  users,
  promptPresets,
  onRestore,
  onClose,
}: WebDAVManagerProps) {
  const {
    config,
    isConnected,
    error,
    connect,
    testConnection,
    backup,
    getLatestBackup,
  } = useWebDAV();

  const [isLoading, setIsLoading] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleBackup = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const success = await backup({
        projects,
        entries,
        users,
        promptPresets,
      });

      if (success) {
        setMessage('备份成功！');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '备份失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const data = await getLatestBackup();
      if (data) {
        onRestore(data);
        setMessage('恢复成功！');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '恢复失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigSave = async (newConfig: { url: string; username: string; password: string }) => {
    setIsLoading(true);
    setMessage('');

    try {
      const success = await connect(newConfig);
      if (success) {
        setIsConfigOpen(false);
        setMessage('连接成功！');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!config && !isConfigOpen) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">WebDAV 数据管理</h3>
        </div>
        <div className="text-sm text-gray-500">请先配置 WebDAV 服务器</div>
        <button
          type="button"
          onClick={() => setIsConfigOpen(true)}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          配置 WebDAV
        </button>
        <Modal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          title="WebDAV 配置"
        >
          <WebDAVConfig
            onClose={() => setIsConfigOpen(false)}
            onSave={handleConfigSave}
          />
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">WebDAV 数据管理</h3>
        <button
          type="button"
          onClick={() => setIsConfigOpen(true)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          修改配置
        </button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {message && (
        <div className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {isConnected ? '已连接到 WebDAV 服务器' : '未连接到 WebDAV 服务器'}
          </div>
          <button
            type="button"
            onClick={testConnection}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            测试连接
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleBackup}
            disabled={isLoading || !isConnected}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : '备份数据'}
          </button>
          <button
            type="button"
            onClick={handleRestore}
            disabled={isLoading || !isConnected}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : '恢复数据'}
          </button>
        </div>
      </div>

      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="WebDAV 配置"
      >
        <WebDAVConfig
          onClose={() => setIsConfigOpen(false)}
          onSave={handleConfigSave}
        />
      </Modal>
    </div>
  );
} 