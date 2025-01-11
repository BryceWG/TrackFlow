import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
}

interface BackupData {
  projects: any[];
  entries: any[];
  users: any[];
  promptPresets: any[];
}

export function useWebDAV() {
  const [config, setConfig] = useLocalStorage<WebDAVConfig | null>('webdav-config', null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async (newConfig: WebDAVConfig) => {
    try {
      const result = await window.webdav.connect(newConfig);
      if (result.success) {
        setConfig(newConfig);
        setIsConnected(true);
        setError(null);
        return true;
      } else {
        setError(result.error || '连接失败');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败');
      return false;
    }
  };

  const testConnection = async () => {
    if (!config) {
      setError('未配置 WebDAV');
      return false;
    }

    try {
      const result = await window.webdav.test();
      setIsConnected(result.success);
      if (!result.success) {
        setError(result.error || '连接测试失败');
      }
      return result.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接测试失败');
      return false;
    }
  };

  const backup = async (data: BackupData) => {
    if (!config) {
      setError('未配置 WebDAV');
      return false;
    }

    try {
      // 创建带时间戳的备份文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `trackflow-backup-${timestamp}.json`;
      
      // 上传备份文件
      const result = await window.webdav.upload(
        `/trackflow/${filename}`,
        JSON.stringify(data, null, 2)
      );

      if (!result.success) {
        setError(result.error || '备份失败');
      }
      return result.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : '备份失败');
      return false;
    }
  };

  const getLatestBackup = async () => {
    if (!config) {
      setError('未配置 WebDAV');
      return null;
    }

    try {
      // 获取备份目录下的所有文件
      const result = await window.webdav.list('/trackflow');
      if (!result.success) {
        setError(result.error || '获取备份列表失败');
        return null;
      }

      // 找到最新的备份文件
      const backupFiles = result.data
        .filter((file: any) => file.filename.startsWith('trackflow-backup-'))
        .sort((a: any, b: any) => b.filename.localeCompare(a.filename));

      if (backupFiles.length === 0) {
        setError('未找到备份文件');
        return null;
      }

      // 下载最新的备份文件
      const latestBackup = backupFiles[0];
      const downloadResult = await window.webdav.download(`/trackflow/${latestBackup.filename}`);
      
      if (!downloadResult.success) {
        setError(downloadResult.error || '下载备份失败');
        return null;
      }

      return JSON.parse(downloadResult.data as string) as BackupData;
    } catch (err) {
      setError(err instanceof Error ? err.message : '恢复失败');
      return null;
    }
  };

  return {
    config,
    isConnected,
    error,
    connect,
    testConnection,
    backup,
    getLatestBackup,
  };
} 