interface WebDAVAPI {
  connect: (config: { url: string; username: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  test: () => Promise<{ success: boolean; error?: string }>;
  upload: (path: string, data: string) => Promise<{ success: boolean; error?: string }>;
  download: (path: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  list: (path: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
}

declare global {
  interface Window {
    webdav: WebDAVAPI;
  }
}

export {}; 