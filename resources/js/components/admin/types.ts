export type ConsentStatus = 'active' | 'expired' | 'withdrawn';

/** Coarse device details. Never null: a missing value arrives as "Unknown". */
export type ConsentDevice = {
    deviceType: string;
    browserFamily: string;
    osFamily: string;
};

export type ConsentRow = ConsentDevice & {
    id: number;
    guid: string;
    version: number;
    isCurrent: boolean;
    status: ConsentStatus;
    acceptedAt: string;
    recordedAt: string | null;
};

export type ConsentEvent = {
    id: number;
    type: string;
    version: number;
    occurredAt: string;
};

export type ConsentRecord = ConsentDevice & {
    guid: string;
    version: number;
    isCurrent: boolean;
    status: ConsentStatus;
    events: ConsentEvent[];
};

export type BreakdownBucket = {
    label: string;
    count: number;
    /** One decimal place. A list's percents add up to exactly 100. */
    percent: number;
};

export type RecentConsent = {
    id: number;
    guid: string;
    version: number;
    acceptedAt: string;
};

export type DailyPoint = {
    date: string;
    accepted: number;
    declined: number;
};

export type OverviewStats = {
    totalAccepted: number;
    totalDeclined: number;
    accepted7d: number;
    acceptedPrev7d: number;
    declined7d: number;
    declinedPrev7d: number;
    acceptRate30d: number | null;
    responses30d: number;
    withdrawn30d: number;
    totalWithdrawn: number;
    currentVersion: number;
    acceptedCurrentVersion: number;
};

export type SortDirection = 'asc' | 'desc';

export type ConsentFilters = {
    search?: string;
    version?: number;
    status?: ConsentStatus;
    from?: string;
    to?: string;
    direction: SortDirection;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type RealtimeSignal = {
    channel: string;
    event: string;
};

export type ReverbRealtime = RealtimeSignal & {
    service: 'reverb';
    key: string;
    host: string;
    port: number;
    scheme: string;
};

/** The host, port and scheme come only when it isn't hosted Pusher. */
export type PusherRealtime = RealtimeSignal & {
    service: 'pusher';
    key: string;
    cluster: string;
    host?: string;
    port?: number;
    scheme?: string;
};

/** Where the browser reaches the socket service. Null when live updates are off. */
export type RealtimeConfig = ReverbRealtime | PusherRealtime;
