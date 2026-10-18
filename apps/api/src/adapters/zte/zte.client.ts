import { ZteSession } from './zte.session.js';

export class ZteClient {
  private readonly baseUrl: string;

  constructor(
    routerUrl: string,
    private readonly session: ZteSession
  ) {
    const url = new URL(routerUrl);

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Unsupported Router protocol');
    }

    if (url.username || url.password) {
      throw new Error('Credentials in URL are not allowed');
    }

    this.baseUrl = url.origin;
  }

  // Send a request with the current router session.
  private async request(path: string, options: RequestInit = {}): Promise<Response> {
    const url = new URL(path, this.baseUrl);
    const cookie = await this.session.getCookieHeader(url.toString());
    const headers = new Headers(options.headers);

    headers.set('X-Requested-With', 'XMLHttpRequest');

    if (cookie) {
      headers.set('Cookie', cookie);
    }

    const response = await fetch(url, {
      ...options,
      headers,
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    await this.session.captureCookies(url.toString(), response.headers);

    if (!response.ok) {
      throw new Error(`ZTE returned HTTP ${response.status}`);
    }

    return response;
  }

  private buildUrl(type: string, tag: string, params: Record<string, string> = {}): string {
    const url = new URL('/', this.baseUrl);

    url.searchParams.set('_type', type);
    url.searchParams.set('_tag', tag);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    url.searchParams.set('_', Date.now().toString());

    return url.pathname + url.search;
  }

  async get(type: string, tag: string, params?: Record<string, string>): Promise<Response> {
    return this.request(this.buildUrl(type, tag, params), {
      method: 'GET',
    });
  }

  async post(type: string, tag: string, data: Record<string, string>): Promise<Response> {
    const body = new URLSearchParams(data);

    return this.request(this.buildUrl(type, tag), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body,
    });
  }

  async openLoginPage(): Promise<string> {
    const response = await this.request('/', {
      method: 'GET',
    });

    return response.text();
  }

  async getCaptchaImage(): Promise<Buffer> {
    const captchaInit = await this.get('hiddenData', 'captcha_data');
    await captchaInit.arrayBuffer();

    const imagePath = `/webimg/captcha.jpg?${Math.random()}`;

    const response = await this.request(imagePath, {
      method: 'GET',
      headers: {
        Accept: 'image/jpeg,image/*',
      },
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().startsWith('image/jpeg')) {
      throw new Error(`Unexpected CAPTCHA content type: ${contentType}`);
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    if (imageBuffer.length === 0) {
      throw new Error('CAPTCHA image is empty');
    }

    return imageBuffer;
  }
}
