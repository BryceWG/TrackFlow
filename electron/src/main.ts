/// <reference types="electron" />
import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent, globalShortcut } from 'electron/main';
import * as path from 'path';
import { ShortcutMap, Shortcut } from './types/shortcuts';

let mainWindow: BrowserWindow | null = null;
let webdavClient: any = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../../icon_512.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 开发环境下加载本地服务
  if (process.env.NODE_ENV === 'development') {
    // 在开发环境下清除缓存
    mainWindow.webContents.session.clearCache();
    mainWindow.webContents.session.clearStorageData({
      storages: ['filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage'],
    });
    
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境下加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }

  registerShortcuts(mainWindow);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// WebDAV 相关 IPC 处理
ipcMain.handle('webdav-connect', async (_event: IpcMainInvokeEvent, config: { url: string, username: string, password: string }) => {
  try {
    const { createClient } = await import('webdav');
    webdavClient = createClient(config.url, {
      username: config.username,
      password: config.password
    });
    
    // 测试连接
    try {
      await webdavClient.getDirectoryContents('/');
    } catch (err) {
      // 如果目录不存在，尝试创建
      const error = err as { response?: { status?: number } };
      if (error?.response?.status === 404) {
        try {
          await webdavClient.createDirectory('/');
        } catch (createError) {
          // 忽略创建错误，因为目录可能已存在
        }
      }
    }

    // 确保 trackflow 目录存在
    try {
      await webdavClient.getDirectoryContents('/trackflow');
    } catch (err) {
      const error = err as { response?: { status?: number } };
      if (error?.response?.status === 404) {
        await webdavClient.createDirectory('/trackflow');
      }
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '连接失败' 
    };
  }
});

ipcMain.handle('webdav-test', async (_event: IpcMainInvokeEvent) => {
  if (!webdavClient) {
    return { success: false, error: '未连接到 WebDAV 服务器' };
  }

  try {
    await webdavClient.getDirectoryContents('/');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '连接测试失败' 
    };
  }
});

ipcMain.handle('webdav-upload', async (_event: IpcMainInvokeEvent, { path, data }: { path: string, data: string }) => {
  if (!webdavClient) {
    return { success: false, error: '未连接到 WebDAV 服务器' };
  }

  try {
    await webdavClient.putFileContents(path, data);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '上传失败' 
    };
  }
});

ipcMain.handle('webdav-download', async (_event: IpcMainInvokeEvent, path: string) => {
  if (!webdavClient) {
    return { success: false, error: '未连接到 WebDAV 服务器' };
  }

  try {
    const content = await webdavClient.getFileContents(path, { format: 'text' });
    return { success: true, data: content };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '下载失败' 
    };
  }
});

ipcMain.handle('webdav-list', async (_event: IpcMainInvokeEvent, path: string) => {
  if (!webdavClient) {
    return { success: false, error: '未连接到 WebDAV 服务器' };
  }

  try {
    const contents = await webdavClient.getDirectoryContents(path);
    return { success: true, data: contents };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '获取文件列表失败' 
    };
  }
});

// 文件操作相关 IPC 处理
ipcMain.handle('save-json-file', async (_event: IpcMainInvokeEvent, data: string) => {
  try {
    const { dialog } = await import('electron');
    const defaultPath = `trackflow-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    const { filePath } = await dialog.showSaveDialog(mainWindow!, {
      title: '保存备份文件',
      defaultPath: defaultPath,
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });

    if (filePath) {
      const fs = await import('fs/promises');
      await fs.writeFile(filePath, data, 'utf-8');
      return { success: true };
    }
    return { success: false, error: '未选择保存位置' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '保存文件失败' 
    };
  }
});

ipcMain.handle('load-json-file', async (_event: IpcMainInvokeEvent) => {
  try {
    const { dialog } = await import('electron');
    const { filePaths } = await dialog.showOpenDialog(mainWindow!, {
      title: '选择备份文件',
      properties: ['openFile'],
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });

    if (filePaths.length > 0) {
      const fs = await import('fs/promises');
      const data = await fs.readFile(filePaths[0], 'utf-8');
      return { success: true, data };
    }
    return { success: false, error: '未选择文件' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '读取文件失败' 
    };
  }
});

ipcMain.handle('webdav-delete', async (_event: IpcMainInvokeEvent, path: string) => {
  if (!webdavClient) {
    return { success: false, error: '未连接到 WebDAV 服务器' };
  }

  try {
    await webdavClient.deleteFile(path);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '删除文件失败' 
    };
  }
});

// 注册快捷键
function registerShortcuts(mainWindow: BrowserWindow) {
  // 从渲染进程接收快捷键更新
  ipcMain.on('UPDATE_SHORTCUTS', (event, shortcuts: ShortcutMap) => {
    // 先注销所有快捷键
    globalShortcut.unregisterAll();

    // 重新注册快捷键
    Object.values(shortcuts).forEach((shortcut: Shortcut) => {
      const key = shortcut.customKey || shortcut.defaultKey;
      try {
        globalShortcut.register(key, () => {
          mainWindow.webContents.send('SHORTCUT_TRIGGERED', shortcut.id);
        });
      } catch (error) {
        console.error(`Failed to register shortcut: ${key}`, error);
      }
    });
  });

  // 应用退出时注销所有快捷键
  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
}
