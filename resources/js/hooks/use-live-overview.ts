import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { RealtimeConfig } from '@/components/admin/types';
import { trailingThrottle } from '@/lib/trailing-throttle';

export type LiveStatus = 'off' | 'connecting' | 'live' | 'disconnected';

const REFETCH_GAP_MS = 2000;

const SOCKET_TRANSPORTS: ['ws', 'wss'] = ['ws', 'wss'];

/**
 * Refetch the overview's numbers. The visit is asynchronous so it neither
 * cancels nor is cancelled by a link the admin clicks. If it fails the page
 * keeps what it has, with no error dialog, until the next change.
 */
function refetchOverview(done: () => void): () => void {
    let cancel: (() => void) | undefined;

    router.reload({
        only: ['stats', 'chart', 'recent'],
        showProgress: false,
        onCancelToken: (token) => {
            cancel = token.cancel;
        },
        onHttpException: () => false,
        onNetworkError: () => false,
        onFinish: done,
    });

    return () => cancel?.();
}

/**
 * Keep the overview's numbers current for as long as the page is open. Echo is
 * loaded here, inside an effect, so the public site never downloads it and
 * server rendering never runs it. Any failure only ever changes the status.
 */
export function useLiveOverview(realtime: RealtimeConfig | null): LiveStatus {
    const [status, setStatus] = useState<LiveStatus>(
        realtime ? 'connecting' : 'off',
    );

    const service = realtime?.service;
    const key = realtime?.key;
    const cluster =
        realtime?.service === 'pusher' ? realtime.cluster : undefined;
    const host = realtime?.host;
    const port = realtime?.port;
    const scheme = realtime?.scheme;
    const channelName = realtime?.channel;
    const eventName = realtime?.event;

    useEffect(() => {
        if (
            service === undefined ||
            key === undefined ||
            channelName === undefined ||
            eventName === undefined ||
            (service === 'reverb' &&
                (host === undefined || port === undefined)) ||
            (service === 'pusher' && cluster === undefined)
        ) {
            return;
        }

        let unmounted = false;
        let closeSocket: (() => void) | undefined;
        const refetch = trailingThrottle(refetchOverview, REFETCH_GAP_MS);

        const connect = async () => {
            const [{ default: Echo }, { default: Pusher }] = await Promise.all([
                import('laravel-echo'),
                import('pusher-js'),
            ]);

            if (unmounted) {
                return;
            }

            // Hosted Pusher picks its own address from the cluster.
            const address =
                host !== undefined && port !== undefined
                    ? {
                          wsHost: host,
                          wsPort: port,
                          wssPort: port,
                          forceTLS: scheme === 'https',
                          enabledTransports: SOCKET_TRANSPORTS,
                      }
                    : { forceTLS: true };

            const echo =
                service === 'pusher'
                    ? new Echo({
                          broadcaster: 'pusher',
                          key,
                          cluster,
                          ...address,
                          Pusher,
                      })
                    : new Echo({
                          broadcaster: 'reverb',
                          key,
                          ...address,
                          Pusher,
                      });

            let subscribedBefore = false;

            closeSocket = () => echo.disconnect();

            echo.connector.pusher.connection.bind(
                'state_change',
                ({ current }: { current: string }) => {
                    // Live waits for the channel below, not just the socket.
                    if (!unmounted && current !== 'connected') {
                        setStatus(
                            current === 'connecting' && !subscribedBefore
                                ? 'connecting'
                                : 'disconnected',
                        );
                    }
                },
            );

            echo.private(channelName)
                .subscribed(() => {
                    setStatus('live');

                    // Anything that changed during the gap was never announced.
                    if (subscribedBefore) {
                        refetch.request();
                    }

                    subscribedBefore = true;
                })
                .error(() => setStatus('disconnected'))
                .listen(`.${eventName}`, () => refetch.request());
        };

        connect().catch(() => {
            if (!unmounted) {
                setStatus('disconnected');
            }
        });

        return () => {
            unmounted = true;
            refetch.stop();
            closeSocket?.();
        };
    }, [service, key, cluster, host, port, scheme, channelName, eventName]);

    return status;
}
