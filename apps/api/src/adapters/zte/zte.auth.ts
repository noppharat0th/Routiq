import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';
import { ZteClient } from './zte.client.js';
import { ZteSession } from './zte.session.js';

interface LoginResponse {
  sess_token?: string;
  lockingTime?: number;
  loginErrMsg?: string;
  promptMsg?: string;
  login_need_refresh?: boolean;
}

const parser = new XMLParser({
  parseTagValue: false,
});

function extractSessionToken(html: string): string | null {
  const scriptTokens = [...html.matchAll(/\b_sessionTmpToken\s*=\s*(["'])(.*?)\1/g)]
    .map((match) => match[2])
    .filter((token): token is string => Boolean(token))
    .map((token) =>
      token
        .replace(/\\x([0-9a-f]{2})/gi, (_, hex: string) =>
          String.fromCharCode(Number.parseInt(hex, 16))
        )
        .replace(/\\u([0-9a-f]{4})/gi, (_, hex: string) =>
          String.fromCharCode(Number.parseInt(hex, 16))
        )
    );

  const scriptToken = scriptTokens.at(-1);
  if (scriptToken) {
    return scriptToken;
  }

  return html.match(/\bid=["']_sessionTOKEN["'][^>]*\bvalue=["']([^"']+)["']/i)?.[1] ?? null;
}

export class ZteAuth {
  constructor(
    private readonly client: ZteClient,
    private readonly session: ZteSession
  ) {}

  async prepare(): Promise<void> {
    await this.session.clear();
    await this.client.openLoginPage();

    const response = await this.client.get('loginData', 'login_entry');
    const data = (await response.json()) as LoginResponse;

    if (!data.sess_token) {
      throw new Error('ZTE did not return session token');
    }

    this.session.setSessionToken(data.sess_token);
  }

  async getCaptcha(): Promise<Buffer> {
    return this.client.getCaptchaImage();
  }

  private hashPassword(password: string, challenge: string): string {
    return createHash('sha256')
      .update(password + challenge, 'utf8')
      .digest('hex');
  }

  private async getLoginChallenge(): Promise<string> {
    const response = await this.client.get('loginData', 'login_token');
    const xml = await response.text();
    const document = parser.parse(xml);

    const challenge = document.ajax_response_xml_root;
    if (typeof challenge !== 'string' || !challenge.trim()) {
      throw new Error('Invalid ZTE login challenge');
    }

    return challenge.trim();
  }

  async login(username: string, password: string, captcha: string): Promise<boolean> {
    if (!username || !password || !captcha) {
      throw new Error('Missing login credentials or CAPTCHA');
    }

    this.session.setAuthenticated(false);

    const challenge = await this.getLoginChallenge();
    const hashedPassword = this.hashPassword(password, challenge);

    const postData = {
      action: 'login',
      Username: username,
      Password: hashedPassword,
      _sessionTOKEN: this.session.getSessionToken() ?? '',
      captcha,
    };

    const response = await this.client.post('loginData', 'login_entry', postData);
    const data = (await response.json()) as LoginResponse;

    if (data.sess_token) {
      this.session.setSessionToken(data.sess_token);
    }

    if (data.login_need_refresh !== true) {
      throw new Error(data.loginErrMsg || 'Router rejected login. Check credentials or CAPTCHA.');
    }

    // ZTE requires a GET / after login to activate the session
    // Without this, all subsequent API calls return SessionTimeout
    const authenticatedPage = await this.client.openLoginPage();
    const pageSessionToken = extractSessionToken(authenticatedPage);
    if (pageSessionToken) {
      this.session.setSessionToken(pageSessionToken);
    }

    this.session.setAuthenticated(true);
    return true;
  }

  isAuthenticated(): boolean {
    return this.session.isAuthenticated();
  }
}
