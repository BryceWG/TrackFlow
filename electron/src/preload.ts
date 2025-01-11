/// <reference types="electron" />
import { contextBridge, ipcRenderer } from 'electron/renderer';

declare global {
  interface Window {
    webdav: {
      connect: (config: { url: string; username: string; password: string }) => Promise<{ success: boolean; error?: string }>;
      test: () => Promise<{ success: boolean; error?: string }>;
      upload: (path: string, data: string) => Promise<{ success: boolean; error?: string }>;
      download: (path: string) => Promise<{ success: boolean; data?: string; error?: string }>;
      list: (path: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
    };
  }
}

contextBridge.exposeInMainWorld('webdav', {
  connect: (config: { url: string; username: string; password: string }) => 
    ipcRenderer.invoke('webdav-connect', config),
  
  test: () => 
    ipcRenderer.invoke('webdav-test'),
  
  upload: (path: string, data: string) => 
    ipcRenderer.invoke('webdav-upload', { path, data }),
  
  download: (path: string) => 
    ipcRenderer.invoke('webdav-download', path),
  
  list: (path: string) => 
    ipcRenderer.invoke('webdav-list', path),

  delete: (path: string) =>
    ipcRenderer.invoke('webdav-delete', path),
}); 

contextBridge.exposeInMainWorld('fileOps', {
  saveJsonFile: async (data: string) => {
    return await ipcRenderer.invoke('save-json-file', data);
  },
  loadJsonFile: async () => {
    return await ipcRenderer.invoke('load-json-file');
  },
}); 