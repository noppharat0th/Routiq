const SESSION_STORAGE_KEY = 'routiq.router-session-id';

export const routerSessionStorage = {
  get(): string | null {
    try {
      return sessionStorage.getItem(SESSION_STORAGE_KEY);
    } catch {
      return null;
    }
  },

  save(sessionId: string): void {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } catch {
    }
  },

  clear(): void {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
    }
  },
};
