import { type FormEvent, useState } from 'react';

interface RouterSession {
  sessionId: string;
  captchaImage: string;
}

interface NetworkDevice {
  id: string;
  name: string | null;
  ipAddress: string | null;
  macAddress: string;
  interfaceName: string | null;
  leaseRemainingSeconds: number | null;
}

type DevicesResponse = NetworkDevice[] | { devices: NetworkDevice[]; total: number };
type PendingAction = 'session' | 'login' | 'devices' | 'logout' | null;

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export default function App() {
  const [session, setSession] = useState<RouterSession | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  async function removeRouterSession(sessionId: string) {
    await fetch('/api/router/session', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
  }

  async function createSession() {
    setPendingAction('session');
    setError(null);

    try {
      if (session) {
        await removeRouterSession(session.sessionId);
      }

      const response = await fetch('/api/router/session', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const data = (await response.json()) as RouterSession;

      setSession(data);
      setAuthenticated(false);
      setPassword('');
      setCaptcha('');
      setDevices([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'สร้าง Router session ไม่สำเร็จ');
    } finally {
      setPendingAction(null);
    }
  }

  async function loadDevices(sessionId: string) {
    setPendingAction('devices');
    setError(null);

    try {
      const response = await fetch(
        `/api/router/devices?sessionId=${encodeURIComponent(sessionId)}`
      );

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const data = (await response.json()) as DevicesResponse;
      setDevices(Array.isArray(data) ? data : data.devices);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'โหลดรายการอุปกรณ์ไม่สำเร็จ');
    } finally {
      setPendingAction(null);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session || !username.trim() || !password || !captcha.trim()) {
      return;
    }

    setPendingAction('login');
    setError(null);

    try {
      const response = await fetch('/api/router/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          username: username.trim(),
          password,
          captcha: captcha.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      setAuthenticated(true);
      setPassword('');
      setCaptcha('');

      await loadDevices(session.sessionId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'เข้าสู่ระบบไม่สำเร็จ');
      setPendingAction(null);
    }
  }

  async function closeSession() {
    if (!session) {
      return;
    }

    setPendingAction('logout');
    setError(null);

    try {
      const response = await fetch('/api/router/session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId }),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      setSession(null);
      setAuthenticated(false);
      setUsername('');
      setPassword('');
      setCaptcha('');
      setDevices([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ออกจากระบบไม่สำเร็จ');
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <main>
      <h1>Routiq</h1>

      {error && <p role="alert">{error}</p>}

      {!session && (
        <section>
          <h2>เชื่อมต่อ Router</h2>
          <button type="button" onClick={() => void createSession()} disabled={pendingAction !== null}>
            {pendingAction === 'session' ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อ Router'}
          </button>
        </section>
      )}

      {session && !authenticated && (
        <section>
          <h2>เข้าสู่ระบบ Router</h2>

          <form onSubmit={(event) => void handleLogin(event)}>
            <p>
              <label htmlFor="username">Username</label>
              <br />
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </p>

            <p>
              <label htmlFor="password">Password</label>
              <br />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </p>

            <p>
              <label htmlFor="captcha">CAPTCHA</label>
              <br />
              <img src={session.captchaImage} alt="Router CAPTCHA" />
              <br />
              <input
                id="captcha"
                type="text"
                autoComplete="off"
                value={captcha}
                onChange={(event) => setCaptcha(event.target.value)}
                required
              />
            </p>

            <button type="submit" disabled={pendingAction !== null}>
              {pendingAction === 'login' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>{' '}

            <button type="button" onClick={() => void createSession()} disabled={pendingAction !== null}>
              CAPTCHA ใหม่
            </button>
          </form>
        </section>
      )}

      {session && authenticated && (
        <section>
          <h2>อุปกรณ์ในเครือข่าย</h2>
          <p>พบ {devices.length} รายการ</p>

          <button
            type="button"
            onClick={() => void loadDevices(session.sessionId)}
            disabled={pendingAction !== null}
          >
            {pendingAction === 'devices' ? 'loading' : 'logout'}
          </button>{' '}

          <button type="button" onClick={() => void closeSession()} disabled={pendingAction !== null}>
            {pendingAction === 'logout' ? 'loading' : 'lgout'}
          </button>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>IP Address</th>
                <th>MAC Address</th>
                <th>Interface</th>
                <th>Lease</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.id}>
                  <td>{device.name || 'ไม่ทราบชื่อ'}</td>
                  <td>{device.ipAddress || '-'}</td>
                  <td>{device.macAddress}</td>
                  <td>{device.interfaceName || '-'}</td>
                  <td>{device.leaseRemainingSeconds ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {devices.length === 0 && pendingAction !== 'devices' && <p>ไม่พบข้อมูลอุปกรณ์</p>}
        </section>
      )}
    </main>
  );
}
