import { CookieJar } from 'tough-cookie';

export class ZteSession {
  private readonly jar = new CookieJar();
  private sessionToken: string | null = null;
  private authenticated = false;

  async captureCookies(url: string, headers: Headers): Promise<void> {
    const cookies = headers.getSetCookie();
    for (const cookie of cookies) {
      await this.jar.setCookie(cookie, url);
    }
  }

  async getCookieHeader(url: string): Promise<string> {
    return this.jar.getCookieString(url);
  }

  setSessionToken(token: string): void {
    if (!token) {
      throw new Error('ZTE session token is empty');
    }
    this.sessionToken = token;
  }

  getSessionToken(): string | null {
    return this.sessionToken;
  }

  hasSessionToken(): boolean {
    return Boolean(this.sessionToken);
  }

  setAuthenticated(value: boolean): void {
    this.authenticated = value;
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  async clear(): Promise<void> {
    await this.jar.removeAllCookies();
    this.sessionToken = null;
    this.authenticated = false;
  }
}
