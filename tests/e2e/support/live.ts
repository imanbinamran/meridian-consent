import type { Page, WebSocketRoute } from '@playwright/test';

/** Nothing listens on this port, so an unrouted socket really fails. */
export const REALTIME = {
    service: 'reverb' as const,
    key: 'e2e-key',
    host: '127.0.0.1',
    port: 6001,
    scheme: 'http',
    channel: 'admin.consents',
    event: 'consents.changed',
};

/** Hosted Pusher: no host, so the browser works out the address from the cluster. */
export const PUSHER_HOSTED = {
    service: 'pusher' as const,
    key: 'e2e-key',
    cluster: 'ap1',
    channel: REALTIME.channel,
    event: REALTIME.event,
};

/** The pusher connection sent to a server of our own. */
export const PUSHER_CUSTOM_HOST = {
    ...PUSHER_HOSTED,
    host: REALTIME.host,
    port: REALTIME.port,
    scheme: REALTIME.scheme,
};

/** Where pusher-js connects for hosted Pusher on PUSHER_HOSTED's cluster. */
export const PUSHER_HOSTED_SOCKET = /ws-ap1\.pusher\.com(:443)?\/app\//;

type Realtime =
    | typeof REALTIME
    | typeof PUSHER_HOSTED
    | typeof PUSHER_CUSTOM_HOST;

/**
 * Choose whether the overview has live updates, whatever the running app's
 * .env says, by rewriting the props in the first page load. Later requests
 * for the page are left alone.
 */
export async function setRealtime(
    page: Page,
    realtime: Realtime | null,
): Promise<void> {
    await page.route(/\/admin\/?$/, async (route) => {
        if (route.request().resourceType() !== 'document') {
            await route.fallback();
            return;
        }

        const response = await route.fetch();
        const body = (await response.text()).replace(
            /(<script data-page="app" type="application\/json">)(.*?)(<\/script>)/s,
            (_match, open: string, json: string, close: string) => {
                const data = JSON.parse(json);
                data.props.realtime = realtime;

                return `${open}${JSON.stringify(data).replace(/</g, '\\u003c')}${close}`;
            },
        );

        await route.fulfill({ response, body });
    });
}

export type FakeReverb = {
    /** Announce a change, as Reverb would. */
    announce: () => void;
    /** Drop the socket and refuse new ones until allowReconnect(). */
    drop: () => Promise<void>;
    allowReconnect: () => void;
    closed: () => boolean;
    /** Send an error on the open socket, as the service would. */
    sendError: () => void;
};

const SERVICE_ERROR = JSON.stringify({
    event: 'pusher:error',
    data: { code: null, message: 'Invalid signature' },
});

/** Speak just enough of the Pusher protocol for the page to go live. */
export async function fakeReverb(
    page: Page,
    socketUrl: RegExp = /:6001\/app\//,
    { refuseChannel = false }: { refuseChannel?: boolean } = {},
): Promise<FakeReverb> {
    let socket: WebSocketRoute | undefined;
    let refusing = false;
    let closed = false;

    await page.route('**/broadcasting/auth', (route) =>
        route.fulfill({ json: { auth: `${REALTIME.key}:signature` } }),
    );

    await page.routeWebSocket(socketUrl, (ws) => {
        if (refusing) {
            void ws.close();
            return;
        }

        socket = ws;
        closed = false;
        ws.onClose(() => {
            closed = true;
        });
        ws.onMessage((raw) => {
            const message = JSON.parse(String(raw));

            if (message.event === 'pusher:subscribe' && refuseChannel) {
                ws.send(SERVICE_ERROR);
            } else if (message.event === 'pusher:subscribe') {
                ws.send(
                    JSON.stringify({
                        event: 'pusher_internal:subscription_succeeded',
                        channel: message.data.channel,
                        data: '{}',
                    }),
                );
            }
        });
        ws.send(
            JSON.stringify({
                event: 'pusher:connection_established',
                data: JSON.stringify({
                    socket_id: '1234.5678',
                    activity_timeout: 120,
                }),
            }),
        );
    });

    return {
        announce: () =>
            socket?.send(
                JSON.stringify({
                    event: REALTIME.event,
                    channel: `private-${REALTIME.channel}`,
                    data: '{}',
                }),
            ),
        drop: async () => {
            refusing = true;
            await socket?.close();
        },
        allowReconnect: () => {
            refusing = false;
        },
        closed: () => closed,
        sendError: () => socket?.send(SERVICE_ERROR),
    };
}

/** The props the server put in the first page load. */
export async function pageProps(page: Page): Promise<Record<string, unknown>> {
    return page.evaluate(() => {
        const json = document.querySelector('script[data-page="app"]');

        return JSON.parse(json?.textContent ?? '{}').props;
    });
}

/** The times, in ms, of the overview's background refetches. */
export function watchRefetches(page: Page): {
    times: number[];
    fields: string[];
} {
    const seen = { times: [] as number[], fields: [] as string[] };

    page.on('request', (request) => {
        const only = request.headers()['x-inertia-partial-data'];

        if (only) {
            seen.times.push(Date.now());
            seen.fields.push(only);
        }
    });

    return seen;
}
