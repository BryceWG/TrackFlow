"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="electron" />
const main_1 = require("electron/main");
const path = __importStar(require("path"));
let mainWindow = null;
let webdavClient = null;
function createWindow() {
    mainWindow = new main_1.BrowserWindow({
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
    }
    else {
        // 生产环境下加载打包后的文件
        mainWindow.loadFile(path.join(__dirname, '../../frontend/dist/index.html'));
    }
}
main_1.app.whenReady().then(createWindow);
main_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        main_1.app.quit();
    }
});
main_1.app.on('activate', () => {
    if (main_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
// WebDAV 相关 IPC 处理
main_1.ipcMain.handle('webdav-connect', async (_event, config) => {
    try {
        const { createClient } = await Promise.resolve().then(() => __importStar(require('webdav')));
        webdavClient = createClient(config.url, {
            username: config.username,
            password: config.password
        });
        // 测试连接
        try {
            await webdavClient.getDirectoryContents('/');
        }
        catch (err) {
            // 如果目录不存在，尝试创建
            const error = err;
            if (error?.response?.status === 404) {
                try {
                    await webdavClient.createDirectory('/');
                }
                catch (createError) {
                    // 忽略创建错误，因为目录可能已存在
                }
            }
        }
        // 确保 trackflow 目录存在
        try {
            await webdavClient.getDirectoryContents('/trackflow');
        }
        catch (err) {
            const error = err;
            if (error?.response?.status === 404) {
                await webdavClient.createDirectory('/trackflow');
            }
        }
        return { success: true };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : '连接失败'
        };
    }
});
main_1.ipcMain.handle('webdav-test', async (_event) => {
    if (!webdavClient) {
        return { success: false, error: '未连接到 WebDAV 服务器' };
    }
    try {
        await webdavClient.getDirectoryContents('/');
        return { success: true };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : '连接测试失败'
        };
    }
});
main_1.ipcMain.handle('webdav-upload', async (_event, { path, data }) => {
    if (!webdavClient) {
        return { success: false, error: '未连接到 WebDAV 服务器' };
    }
    try {
        await webdavClient.putFileContents(path, data);
        return { success: true };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : '上传失败'
        };
    }
});
main_1.ipcMain.handle('webdav-download', async (_event, path) => {
    if (!webdavClient) {
        return { success: false, error: '未连接到 WebDAV 服务器' };
    }
    try {
        const content = await webdavClient.getFileContents(path, { format: 'text' });
        return { success: true, data: content };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : '下载失败'
        };
    }
});
main_1.ipcMain.handle('webdav-list', async (_event, path) => {
    if (!webdavClient) {
        return { success: false, error: '未连接到 WebDAV 服务器' };
    }
    try {
        const contents = await webdavClient.getDirectoryContents(path);
        return { success: true, data: contents };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : '获取文件列表失败'
        };
    }
});
