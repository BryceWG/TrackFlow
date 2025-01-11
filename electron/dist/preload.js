"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="electron" />
const renderer_1 = require("electron/renderer");
renderer_1.contextBridge.exposeInMainWorld('webdav', {
    connect: (config) => renderer_1.ipcRenderer.invoke('webdav-connect', config),
    test: () => renderer_1.ipcRenderer.invoke('webdav-test'),
    upload: (path, data) => renderer_1.ipcRenderer.invoke('webdav-upload', { path, data }),
    download: (path) => renderer_1.ipcRenderer.invoke('webdav-download', path),
    list: (path) => renderer_1.ipcRenderer.invoke('webdav-list', path)
});