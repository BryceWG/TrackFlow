export interface IpcRenderer {
  send(channel: string, ...args: any[]): void;
  on(channel: string, listener: (event: any, ...args: any[]) => void): void;
  removeListener(channel: string, listener: (event: any, ...args: any[]) => void): void;
}

declare global {
  interface Window {
    electron?: {
      ipcRenderer: IpcRenderer;
    };
  }
} 