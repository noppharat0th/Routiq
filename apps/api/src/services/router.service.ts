import { randomUUID } from "node:crypto";
import { ZteAdapter } from "../adapters/zte/zte.adapter.js";

interface RouterSession {
    adapter: ZteAdapter
    authenticated: boolean
}

const sessions = new Map<string, RouterSession>()

// function checkSession(sessionId: string) {
//     const session = sessions.get(sessionId)
//     if (!session) {
//         return false
//     }

//     return true
// }

export async function HandleCreateSession() {
    // demo/ production env only
    const adapter = new ZteAdapter('http://192.168.1.1')

    await adapter.prepareLogin();
    const captcha = await adapter.getCaptcha()

    const sessionId = randomUUID()
    sessions.set(sessionId, {
        adapter,
        authenticated: false
    })

    return {
        sessionId,
        captchaImage: `data:image/jpeg;base64,${captcha.toString('base64')}`,
    }
}

export async function handleLogin(
    sessionId: string,
    username: string,
    password: string,
    captcha: string
) {
    // if (checkSession(sessionId)) {
    //     throw new Error("router is not authen")
    // }
    const session = sessions.get(sessionId)
    if (!session) {
        throw new Error("router is not authen")
    }


    await session.adapter.login(username, password, captcha)
    session.authenticated = true;

    return { authenticated: true }
}


export async function handleGetDevice(sessionId: string) {
    const session = sessions.get(sessionId)
    if (!session) {
        throw new Error("router is not authen")
    }

    return await session.adapter.getDevices()
}

export async function clearSession(sessionId: string) {
    const session = sessions.get(sessionId)
    if (session) {
        await session.adapter.clearSession();
        sessions.delete(sessionId)
    }
}