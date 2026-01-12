const isDev = __DEV__;

export const logger = {
  info: (message: string, data?: any) => {
    if (isDev) {
      console.log(`[INFO] ${message}`, data !== undefined ? data : '');
    }
  },

  error: (message: string, error?: any) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, error !== undefined ? error : '');
    }
  },

  warn: (message: string, data?: any) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, data !== undefined ? data : '');
    }
  },

  debug: (message: string, data?: any) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, data !== undefined ? data : '');
    }
  },

  api: (method: string, url: string, status?: number, data?: any) => {
    if (isDev) {
      console.log(`[API] ${method} ${url}`, status ? `Status: ${status}` : '', data !== undefined ? data : '');
    }
  },

  storage: (action: string, key: string, data?: any) => {
    if (isDev) {
      console.log(`[STORAGE] ${action} - ${key}`, data !== undefined ? data : '');
    }
  },
};
