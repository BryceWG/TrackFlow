export interface IpcRenderer {
  send(channel: string, ...args: any[]): void;
  on(channel: string, listener: (event: any, ...args: any[]) => void): void;
  removeListener(channel: string, listener: (event: any, ...args: any[]) => void): void;
}

export interface FileOps {
  saveJsonFile(content: string): Promise<{ success: boolean; error?: string }>;
  loadJsonFile(): Promise<{ success: boolean; data?: string; error?: string }>;
}

export interface WebDAV {
  connect(config: { url: string; username: string; password: string }): Promise<{ success: boolean; error?: string }>;
  test(): Promise<{ success: boolean; error?: string }>;
  list(path: string): Promise<{ success: boolean; data?: any[]; error?: string }>;
  download(path: string): Promise<{ success: boolean; data?: string; error?: string }>;
  delete(path: string): Promise<{ success: boolean; error?: string }>;
  upload(options: { path: string; data: string }): Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electron?: {
      ipcRenderer: IpcRenderer;
    };
    fileOps: FileOps;
    webdav: WebDAV;
  }
}
