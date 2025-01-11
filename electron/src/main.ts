/// <reference types="electron" />
import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron/main';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let webdavClient: any = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 开发环境下加载本地服务
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境下加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }
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
    await webdavClient.getDirectoryContents('/');
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