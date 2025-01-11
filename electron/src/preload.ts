/// <reference types="electron" />
import './types';
import { contextBridge, ipcRenderer } from 'electron';

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
    ipcRenderer.invoke('webdav-list', path)
}); 