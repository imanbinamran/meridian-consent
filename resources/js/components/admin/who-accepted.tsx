import { ChartCard } from './chart-card';
import { DetailPopover } from './detail-popover';
import { formatNumber, pluralize } from './format';
import type { BreakdownBucket } from './types';

type Group = {
    title: string;
    buckets: BreakdownBucket[];
};

type Props = {
    groups: Group[];
};

const NOTE =
    'Accepted visitors only, last 30 days, including any later withdrawn. Declines are anonymous and carry no device data.';

/** Same blue as "Accepted" in the daily chart, fading with each slice. */
const BLUE = 'bg-[oklch(0.55_0.17_255)] dark:bg-[oklch(0.72_0.14_250)]';
const FADE = [1, 0.72, 0.5, 0.34, 0.22];

function Swatch({ bucket, index }: { bucket: BreakdownBucket; index: number }) {
    return bucket.label === 'Unknown' ? (
        <span className="block h-full w-full bg-muted-foreground/50" />
    ) : (
        <span
            className={`block h-full w-full ${BLUE}`}
            style={{ opacity: FADE[Math.min(index, FADE.length - 1)] }}
        />
    );
}

export function WhoAccepted({ groups }: Props) {
    const total = groups[0].buckets.reduce(
        (sum, bucket) => sum + bucket.count,
        0,
    );

    return (
        <ChartCard
            title="Who accepted"
            subtitle={`${pluralize(total, { one: 'consent', other: 'consents' })}, last 30 days`}
            info={NOTE}
            bodyClassName="min-h-32"
        >
            <p className="sr-only">{NOTE}</p>
            {groups.map((group) => (
                <ul
                    key={group.title}
                    className="sr-only"
                    aria-label={group.title}
                >
                    {group.buckets.map((bucket) => (
                        <li key={bucket.label}>
                            <span>{bucket.label}</span>{' '}
                            {formatNumber(bucket.count)},{' '}
                            {bucket.percent.toFixed(1)}%
                        </li>
                    ))}
                </ul>
            ))}
            {total === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No accepted consents in the last 30 days.
                </p>
            ) : (
                <div className="flex h-full flex-col justify-evenly gap-1">
                    {groups.map((group) => (
                        <GroupRow key={group.title} {...group} />
                    ))}
                </div>
            )}
        </ChartCard>
    );
}

function GroupRow({ title, buckets }: Group) {
    const shown = buckets.filter((bucket) => bucket.count > 0);
    const top = shown[0];

    return (
        <DetailPopover
            className="-mx-1 block rounded-md px-1 py-1 text-start hover:bg-muted/60"
            trigger={
                <>
                    <span className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="text-muted-foreground">{title}</span>
                        <span className="min-w-0 truncate font-medium tabular-nums">
                            {top.label} {top.percent.toFixed(1)}%
                        </span>
                    </span>
                    <span
                        aria-hidden
                        className="mt-1 flex h-2 gap-px overflow-hidden rounded-full bg-muted"
                    >
                        {shown.map((bucket, index) => (
                            <span
                                key={bucket.label}
                                className="block h-full"
                                style={{ width: `${bucket.percent}%` }}
                            >
                                <Swatch bucket={bucket} index={index} />
                            </span>
                        ))}
                    </span>
                </>
            }
        >
            <p className="mb-1.5 font-medium">{title}</p>
            <ul className="min-w-40 space-y-1 tabular-nums">
                {shown.map((bucket, index) => (
                    <li
                        key={bucket.label}
                        className="flex items-center justify-between gap-4"
                    >
                        <span className="flex items-center gap-1.5">
                            <span
                                aria-hidden
                                className="size-2 overflow-hidden rounded-[2px]"
                            >
                                <Swatch bucket={bucket} index={index} />
                            </span>
                            {bucket.label}
                        </span>
                        <span>
                            <span className="text-muted-foreground">
                                {formatNumber(bucket.count)}
                            </span>{' '}
                            <span className="font-medium">
                                {bucket.percent.toFixed(1)}%
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
        </DetailPopover>
    );
}
