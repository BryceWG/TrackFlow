import { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { WebDAVConfig } from './WebDAVConfig';
import { useWebDAV } from '../hooks/useWebDAV';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';

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
  const [backupFiles, setBackupFiles] = useState<{ filename: string; lastmod: string; path: string }[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
  });

  // 获取备份文件列表
  const fetchBackupFiles = async () => {
    try {
      const result = await window.webdav.list('/trackflow');
      if (result.success && result.data) {
        const files = result.data
          .filter((file: any) => file.filename.endsWith('.json'))
          .map((file: any) => ({
            filename: file.filename,
            lastmod: file.lastmod,
            // 确保路径以 / 开头，并且包含完整的目录结构
            path: file.filename.startsWith('/') ? file.filename : `/trackflow/${file.filename}`
          }))
          .sort((a: any, b: any) => b.lastmod.localeCompare(a.lastmod));
        console.log('Backup files:', files); // 添加调试日志
        setBackupFiles(files);
      }
    } catch (err) {
      console.error('获取备份文件列表失败:', err);
    }
  };

  // 当配置存在时，自动获取备份文件列表
  useEffect(() => {
    if (config) {
      fetchBackupFiles();
    }
  }, [config]);

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
        // 刷新备份文件列表
        await fetchBackupFiles();
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '备份失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (file: { filename: string; path: string }) => {
    setIsLoading(true);
    setMessage('');

    try {
      console.log('Attempting to restore file:', file); // 添加调试日志
      const result = await window.webdav.download(file.path);
      console.log('Download result:', result); // 添加调试日志
      
      if (result.success && result.data) {
        try {
          const data = JSON.parse(result.data);
          onRestore(data);
          setMessage('恢复成功！');
        } catch (parseError) {
          console.error('解析备份数据失败:', parseError); // 添加调试日志
          setMessage('解析备份数据失败');
        }
      } else {
        console.error('下载失败:', result.error); // 添加调试日志
        setMessage(result.error || '恢复失败');
      }
    } catch (err) {
      console.error('恢复失败:', err);
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
        await fetchBackupFiles();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigClose = () => {
    setIsConfigOpen(false);
  };

  // 添加本地文件备份功能
  const handleLocalBackup = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const backupData = {
        projects,
        entries,
        users,
        promptPresets,
      };
      const result = await window.fileOps.saveJsonFile(JSON.stringify(backupData, null, 2));
      
      if (result.success) {
        setMessage('本地备份成功！');
      } else {
        setMessage(result.error || '本地备份失败');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '本地备份失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 添加本地文件恢复功能
  const handleLocalRestore = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const result = await window.fileOps.loadJsonFile();
      
      if (result.success && result.data) {
        try {
          const data = JSON.parse(result.data);
          setConfirmDialog({
            isOpen: true,
            title: '恢复数据',
            message: '确定要恢复数据吗？当前的数据将被覆盖。',
            type: 'warning',
            onConfirm: () => {
              onRestore(data);
              setMessage('本地恢复成功！');
            },
          });
        } catch (parseError) {
          setMessage('解析备份文件失败');
        }
      } else {
        setMessage(result.error || '本地恢复失败');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '本地恢复失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!config && !isConfigOpen) {
    return (
      <div className="space-y-4">
        {/* WebDAV 配置部分 */}
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
        </div>

        {/* 分隔线 */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* 本地备份部分 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">本地数据管理</h3>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleLocalBackup}
              disabled={isLoading}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : '导出备份'}
            </button>
            <button
              type="button"
              onClick={handleLocalRestore}
              disabled={isLoading}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : '导入备份'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </div>
        )}

        <Modal
          isOpen={isConfigOpen}
          onClose={handleConfigClose}
          title="WebDAV 配置"
        >
          <WebDAVConfig
            onClose={handleConfigClose}
            onSave={handleConfigSave}
          />
        </Modal>

        {/* 确认对话框 */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={() => {
            confirmDialog.onConfirm();
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          }}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* WebDAV 管理部分 */}
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

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {isConnected ? '已连接到 WebDAV 服务器' : '未连接到 WebDAV 服务器'}
          </div>
          <button
            type="button"
            onClick={testConnection}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            测试连接
          </button>
        </div>

        <button
          type="button"
          onClick={handleBackup}
          disabled={isLoading}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : 'WebDAV 备份'}
        </button>

        {/* 备份文件列表 */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">备份文件列表</h4>
          {backupFiles.length > 0 ? (
            <div className="space-y-2">
              {backupFiles.map((file) => (
                <div
                  key={file.filename}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{file.filename}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(file.lastmod).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: '恢复数据',
                        message: '确定要恢复数据吗？当前的数据将被覆盖。',
                        type: 'warning' as const,
                        onConfirm: () => handleRestore(file),
                      });
                    }}
                    disabled={isLoading}
                    className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    恢复此备份
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              暂无备份文件
            </div>
          )}
        </div>
      </div>

      {/* 分隔线 */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* 本地备份部分 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">本地数据管理</h3>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleLocalBackup}
            disabled={isLoading}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : '导出备份'}
          </button>
          <button
            type="button"
            onClick={handleLocalRestore}
            disabled={isLoading}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : '导入备份'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </div>
      )}

      <Modal
        isOpen={isConfigOpen}
        onClose={handleConfigClose}
        title="WebDAV 配置"
      >
        <WebDAVConfig
          onClose={handleConfigClose}
          onSave={handleConfigSave}
        />
      </Modal>

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  );
} 