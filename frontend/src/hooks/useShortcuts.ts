import { useEffect, useState } from 'react';
import { Shortcut, ShortcutMap } from '../types/shortcuts';

const DEFAULT_SHORTCUTS: ShortcutMap = {
  newRecord: {
    id: 'newRecord',
    name: '新建记录',
    description: '打开新建记录对话框',
    defaultKey: 'CommandOrControl+N',
  },
  aiAnalysis: {
    id: 'aiAnalysis',
    name: 'AI分析',
    description: '打开AI分析对话框',
    defaultKey: 'CommandOrControl+A',
  },
  search: {
    id: 'search',
    name: '搜索',
    description: '打开搜索对话框',
    defaultKey: 'CommandOrControl+F',
  },
  backup: {
    id: 'backup',
    name: '备份',
    description: '执行数据备份',
    defaultKey: 'CommandOrControl+B',
  },
  quit: {
    id: 'quit',
    name: '退出',
    description: '退出应用',
    defaultKey: 'CommandOrControl+Q',
  },
  switchProject: {
    id: 'switchProject',
    name: '切换项目',
    description: '打开项目切换对话框',
    defaultKey: 'CommandOrControl+P',
  },
};

export const useShortcuts = () => {
  const [shortcuts, setShortcuts] = useState<ShortcutMap>(DEFAULT_SHORTCUTS);

  // 更新快捷键
  const updateShortcut = (id: string, customKey: string) => {
    const newShortcuts = {
      ...shortcuts,
      [id]: {
        ...shortcuts[id],
        customKey,
      },
    };
    setShortcuts(newShortcuts);
    // 通知主进程更新快捷键
    window.electron?.ipcRenderer.send('UPDATE_SHORTCUTS', newShortcuts);
  };

  // 重置快捷键
  const resetShortcut = (id: string) => {
    const newShortcuts = {
      ...shortcuts,
      [id]: {
        ...shortcuts[id],
        customKey: undefined,
      },
    };
    setShortcuts(newShortcuts);
    // 通知主进程更新快捷键
    window.electron?.ipcRenderer.send('UPDATE_SHORTCUTS', newShortcuts);
  };

  // 获取实际使用的快捷键
  const getActiveKey = (id: string): string => {
    const shortcut = shortcuts[id];
    return shortcut.customKey || shortcut.defaultKey;
  };

  useEffect(() => {
    // 从本地存储加载自定义快捷键
    const loadCustomShortcuts = () => {
      const stored = localStorage.getItem('shortcuts');
      if (stored) {
        const loadedShortcuts = JSON.parse(stored);
        setShortcuts(loadedShortcuts);
        // 通知主进程更新快捷键
        window.electron?.ipcRenderer.send('UPDATE_SHORTCUTS', loadedShortcuts);
      }
    };
    loadCustomShortcuts();

    // 监听快捷键触发事件
    const handleShortcutTriggered = (_event: any, shortcutId: string) => {
      switch (shortcutId) {
        case 'newRecord':
          // 触发新建记录事件
          window.dispatchEvent(new CustomEvent('shortcut:newRecord'));
          break;
        case 'aiAnalysis':
          // 触发AI分析事件
          window.dispatchEvent(new CustomEvent('shortcut:aiAnalysis'));
          break;
        case 'search':
          // 触发搜索事件
          window.dispatchEvent(new CustomEvent('shortcut:search'));
          break;
        case 'backup':
          // 触发备份事件
          window.dispatchEvent(new CustomEvent('shortcut:backup'));
          break;
        case 'quit':
          // 触发退出事件
          window.electron?.ipcRenderer.send('APP_QUIT');
          break;
        case 'switchProject':
          // 触发切换项目事件
          window.dispatchEvent(new CustomEvent('shortcut:switchProject'));
          break;
      }
    };

    window.electron?.ipcRenderer.on('SHORTCUT_TRIGGERED', handleShortcutTriggered);

    return () => {
      window.electron?.ipcRenderer.removeListener('SHORTCUT_TRIGGERED', handleShortcutTriggered);
    };
  }, []);

  useEffect(() => {
    // 保存自定义快捷键到本地存储
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  return {
    shortcuts,
    updateShortcut,
    resetShortcut,
    getActiveKey,
  };
}; 