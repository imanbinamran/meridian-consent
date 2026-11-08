export type ConsentRow = {
    id: number;
    guid: string;
    version: number;
    isCurrent: boolean;
    acceptedAt: string;
    recordedAt: string | null;
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
    currentVersion: number;
    acceptedCurrentVersion: number;
};

export type SortDirection = 'asc' | 'desc';

export type ConsentFilters = {
    search?: string;
    version?: number;
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
