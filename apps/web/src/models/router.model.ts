export interface RouterSession {
  sessionId: string;
  captchaImage: string;
}

export interface RouterCredentials {
  username: string;
  password: string;
  captcha: string;
}

export interface RouterLoginResponse {
  authenticated: boolean;
}

export interface NetworkDevice {
  id: string;
  name: string | null;
  ipAddress: string | null;
  macAddress: string;
  interfaceName: string | null;
  leaseRemainingSeconds: number | null;
}

export interface RouterDevicesResponse {
  devices: NetworkDevice[];
  total: number;
}

export interface DeleteRouterSessionResponse {
  success: boolean;
}

export interface ApiErrorResponse {
  message?: string;
}

export type RouterPendingAction = 'session' | 'login' | 'devices' | 'logout' | null;
