# Routiq

<img width="1893" height="949" alt="Screenshot 2026-10-18 014856" src="https://github.com/user-attachments/assets/48d68ade-c2a8-4599-8002-a6c852b3d06e" />


Routiq is a local dashboard for managing a ZTE F6107A router. It connects to the router interface
at `192.168.1.1` through the project API. Router credentials and data are not sent to an external
service.

## What it can do

- Sign in to the router with CAPTCHA and restore the session after a page refresh
- Show Internet, PON/Fiber, CPU, memory, uptime, and firewall status
- List DHCP devices with their IP, MAC address, interface, and remaining lease time
- Store local device names and Trusted/Review labels in the browser
- Show WAN traffic, LAN ports, Wi-Fi client quality, UPnP mappings, and routing tables
- Run an Internet speed test from the browser
- Change the firewall level and DoS protection settings with validation and confirmation

Routiq does not expose Restart, Reset, WAN, DHCP, or Wi-Fi configuration. Incorrect changes to
these settings could disconnect the Internet or other devices on the network.

## Requirements

- Node.js 22 or newer
- npm
- A computer connected to the same network as the router
- The router username and password

## Setup

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in a browser.

The API runs at `http://127.0.0.1:3001` and connects to `http://192.168.1.1` by default. If the
router uses a different address, update `ROUTER_BASE_URL` in `.env`.

```dotenv
ROUTER_BASE_URL=http://192.168.1.1
SESSION_TTL_MINUTES=30
```

Enter the username, password, and CAPTCHA on the Login page. They are not stored in `.env` or
localStorage.

## Commands

| Command             | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start the Web app and API                 |
| `npm run build`     | Create a production build                 |
| `npm run typecheck` | Check TypeScript                          |
| `npm run lint`      | Check the code with ESLint                |
| `npm test`          | Run the API and router parser test suites |

## Project structure

```text
apps/api   Fastify API, router sessions, and the ZTE adapter
apps/web   React, Vite, Zustand, and shadcn/ui
docs       Development notes and router endpoint documentation
```

Router sessions are kept in API memory. Restarting the API signs every router session out.
Development notes are available in [docs/README.md](docs/README.md).
