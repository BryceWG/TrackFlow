import { useState } from 'react';

interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
}

export function useWebDAV() {
  const [config, setConfig] = useState<WebDAVConfig | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>('');

  const connect = async (newConfig: WebDAVConfig) => {
    setError('');
    try {
      const result = await window.webdav.connect(newConfig);
      if (result.success) {
        setConfig(newConfig);
        setIsConnected(true);
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
    setError('');
    try {
      const result = await window.webdav.test();
      if (result.success) {
        setIsConnected(true);
        return true;
      } else {
        setError(result.error || '连接测试失败');
        setIsConnected(false);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接测试失败');
      setIsConnected(false);
      return false;
    }
  };

  const backup = async (data: any) => {
    if (!config) {
      throw new Error('未配置 WebDAV');
    }

    const filename = `trackflow-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const path = `/trackflow/${filename}`;
    const jsonData = JSON.stringify(data);

    const result = await window.webdav.upload({ path, data: jsonData });
    if (!result.success) {
      throw new Error(result.error || '备份失败');
    }

    return true;
  };

  return {
    config,
    isConnected,
    error,
    connect,
    testConnection,
    backup,
  };
} 