interface Window {
  webdav: {
    connect: (config: { url: string; username: string; password: string }) => Promise<{ success: boolean; error?: string }>;
    test: () => Promise<{ success: boolean; error?: string }>;
    upload: (params: { path: string; data: string }) => Promise<{ success: boolean; error?: string }>;
    download: (path: string) => Promise<{ success: boolean; data?: string; error?: string }>;
    list: (path: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  };
  fileOps: {
    saveJsonFile: (data: string) => Promise<{ success: boolean; error?: string }>;
    loadJsonFile: () => Promise<{ success: boolean; data?: string; error?: string }>;
  };
} 