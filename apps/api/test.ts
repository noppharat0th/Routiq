import { ZteAdapter } from './src/adapters/zte/zte.adapter.js';
import { writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const router = new ZteAdapter('http://192.168.1.1');
const rl = createInterface({ input, output });

async function main() {
  try {
    await router.prepareLogin();
    console.log('Session prepared');

    const captcha = await router.getCaptcha();
    await writeFile('captcha.jpg', captcha);
    console.log('CAPTCHA saved to captcha.jpg');

    const username = await rl.question('Username: ');
    const password = await rl.question('Password: ');
    const captchaCode = await rl.question('CAPTCHA: ');

    const success = await router.login(username, password, captchaCode);

    if (!success) {
      console.log('Login failed');
      return;
    }

    console.log('Login successful!');

    const devices = await router.getDevices();
    console.log('Total DHCP entries:', devices.length);
    console.table(
      devices.map((device) => ({
        name: device.name,
        ip: device.ipAddress,
        mac: device.macAddress,
        interface: device.interfaceName,
        leaseSeconds: device.leaseRemainingSeconds,
      }))
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  } finally {
    rl.close();
    await router.clearSession();
  }
}

void main();
