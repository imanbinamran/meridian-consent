import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import {
    Kicker,
    MeridianLines,
    SectionHeading,
} from '@/components/site/section-heading';
import { about } from '@/routes';

const edition = [
    {
        desk: 'Business',
        title: "Why Penang's chip boom is finally reaching the factory floor",
        minutes: 6,
    },
    {
        desk: 'Nation',
        title: 'Flood season, explained: what has changed since the 2021 floods',
        minutes: 8,
    },
    {
        desk: 'Food',
        title: 'The quiet return of the neighbourhood kopitiam',
        minutes: 4,
    },
    {
        desk: 'Culture',
        title: 'Inside the Ipoh studio reviving hand-painted cinema posters',
        minutes: 5,
    },
];

const desks = [
    {
        name: 'Nation',
        body: 'Parliament, policy and the decisions that reach your household, from Putrajaya to the state assemblies.',
        rhythm: 'Daily',
    },
    {
        name: 'Business',
        body: 'Markets, start-ups and the cost of living, explained by reporters who read the filings so you do not have to.',
        rhythm: 'Daily',
    },
    {
        name: 'Lifestyle',
        body: 'Homes, health, work and family life, written for how Malaysians actually live today.',
        rhythm: 'Weekdays',
    },
    {
        name: 'Food',
        body: 'Hawker legends, new openings and recipes from every corner of the peninsula, Sabah and Sarawak.',
        rhythm: 'Three times a week',
    },
    {
        name: 'Culture',
        body: 'Film, music, books and the artists shaping a confident Malaysian identity at home and abroad.',
        rhythm: 'Weekly',
    },
    {
        name: 'Sport',
        body: 'Badminton to football to the grassroots leagues, with analysis that goes beyond the scoreline.',
        rhythm: 'Daily',
    },
];

const figures = [
    { value: '2.4M', label: 'readers every month' },
    { value: '38', label: 'journalists and editors' },
    { value: '2', label: 'languages, English and Bahasa Malaysia' },
    { value: '16', label: 'states and federal territories covered' },
];

const principles = [
    {
        title: 'Verified before published',
        body: 'Every story is checked by a second editor. If we cannot confirm it, we do not run it, however fast the rest of the internet moves.',
    },
    {
        title: 'Explained, not shouted',
        body: 'We write headlines that tell you what happened, and stories that tell you why it matters. No outrage bait, no clickbait.',
    },
    {
        title: 'Corrected in the open',
        body: 'When we get something wrong we fix it within 24 hours and say so at the top of the story, with the date of the change.',
    },
];

export default function Home() {
    return (
        <>
            <Head title="Malaysian news and lifestyle, told with care">
                <meta
                    name="description"
                    content="Meridian is an independent Malaysian digital publisher covering news, business, lifestyle, food, culture and sport from Kuala Lumpur."
                />
            </Head>

            {/* Hero */}
            <section
                aria-labelledby="home-title"
                className="relative overflow-hidden border-b border-foreground/10"
            >
                <MeridianLines className="absolute -end-64 -top-40 size-[52rem] text-foreground/[0.06] sm:-end-40" />
                <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pt-24 lg:pb-24">
                    <div className="lg:col-span-7">
                        <Kicker>Independent · Kuala Lumpur · Since 2014</Kicker>
                        <h1
                            id="home-title"
                            className="mt-6 font-display text-[2.75rem] leading-[1.02] font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl"
                        >
                            The stories that shape Malaysia,{' '}
                            <em className="text-brand">told with care.</em>
                        </h1>
                        <p className="mt-7 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">
                            Meridian is a digital news and lifestyle publisher
                            for readers who want to understand the country, not
                            just scroll past it. Every morning our newsroom
                            sorts what matters from what is merely loud, and
                            explains it plainly.
                        </p>
                        <div className="mt-9 flex flex-wrap gap-3">
                            <Link
                                href={about()}
                                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                            >
                                Meet the newsroom
                                <ArrowUpRight
                                    className="size-4 rtl:-scale-x-100"
                                    aria-hidden="true"
                                />
                            </Link>
                            <Link
                                href={`${about.url()}#standards`}
                                className="inline-flex h-12 items-center rounded-full border border-foreground/20 px-6 text-sm font-semibold transition-colors hover:border-foreground/50 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                            >
                                Our editorial standards
                            </Link>
                        </div>
                    </div>

                    <aside
                        aria-labelledby="edition-title"
                        className="lg:col-span-5 lg:border-s lg:border-foreground/10 lg:ps-10"
                    >
                        <h2
                            id="edition-title"
                            className="flex items-baseline justify-between border-b-2 border-foreground pb-3 font-display text-xl font-medium"
                        >
                            This week&rsquo;s edition
                            <span className="font-sans text-xs font-medium tracking-wide text-muted-foreground">
                                Selected by the editors
                            </span>
                        </h2>
                        <ol className="divide-y divide-foreground/10">
                            {edition.map((story, index) => (
                                <li
                                    key={story.title}
                                    className="flex gap-5 py-5"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="font-display text-4xl leading-none font-medium text-brand/80 tabular-nums"
                                    >
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                            {story.desk}
                                            <span className="sr-only">
                                                {' '}
                                                desk
                                            </span>
                                        </p>
                                        <p className="mt-1.5 font-display text-lg leading-snug font-medium text-pretty">
                                            {story.title}
                                        </p>
                                        <p className="mt-1.5 text-xs text-muted-foreground">
                                            {story.minutes} min read
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </aside>
                </div>
            </section>

            {/* Desks */}
            <section
                aria-labelledby="desks-title"
                className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
            >
                <SectionHeading
                    id="desks-title"
                    kicker="What we cover"
                    title="Six desks, one promise: context before noise."
                    description="Our reporters are specialists. They stay on a beat for years, build sources across the country and know which numbers to trust."
                />
                <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {desks.map((desk) => (
                        <li
                            key={desk.name}
                            className="group border-t-2 border-foreground pt-5"
                        >
                            <div className="flex items-baseline justify-between gap-4">
                                <h3 className="font-display text-2xl font-medium">
                                    {desk.name}
                                </h3>
                                <span className="text-xs font-medium text-muted-foreground">
                                    {desk.rhythm}
                                </span>
                            </div>
                            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                                {desk.body}
                            </p>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Long read */}
            <section
                aria-labelledby="longread-title"
                className="bg-ink text-ink-foreground"
            >
                <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-28">
                    <div className="lg:col-span-5">
                        <Kicker className="text-brand-bright [&>span]:bg-brand-bright">
                            The Sunday long read
                        </Kicker>
                        <h2
                            id="longread-title"
                            className="mt-5 font-display text-4xl leading-[1.08] font-medium tracking-tight text-balance sm:text-5xl"
                        >
                            Kampung to cloud: the quiet digitisation of rural
                            Sabah
                        </h2>
                        <p className="mt-5 text-sm text-ink-foreground/70">
                            By Joanna Gimbang, East Malaysia bureau · 18 min
                            read
                        </p>
                    </div>
                    <div className="lg:col-span-7 lg:ps-6">
                        <blockquote className="border-s-4 border-brand-bright ps-6">
                            <p className="font-display text-2xl leading-snug text-pretty italic sm:text-3xl">
                                &ldquo;We used to ride two hours to the town
                                bank. Now my mother sells her tuhau paste to
                                buyers in Johor from her kitchen.&rdquo;
                            </p>
                            <footer className="mt-4 text-sm text-ink-foreground/70">
                                Rosnah, a smallholder in Kota Marudu
                            </footer>
                        </blockquote>
                        <p className="mt-8 max-w-[65ch] leading-relaxed text-ink-foreground/80">
                            Over six months, our East Malaysia bureau followed
                            three villages as fibre broadband, e-wallets and
                            community-run delivery networks arrived. The result
                            is a portrait of change that is faster, messier and
                            more hopeful than the national statistics suggest.
                        </p>
                    </div>
                </div>
            </section>

            {/* Figures */}
            <section
                aria-labelledby="figures-title"
                className="border-b border-foreground/10"
            >
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                    <h2 id="figures-title" className="sr-only">
                        Meridian in numbers
                    </h2>
                    <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-foreground/10 rtl:lg:divide-x-reverse">
                        {figures.map((figure) => (
                            <div
                                key={figure.label}
                                className="flex flex-col-reverse gap-2 pe-4 lg:px-8 lg:first:ps-0"
                            >
                                <dt className="text-sm leading-snug text-muted-foreground">
                                    {figure.label}
                                </dt>
                                <dd className="font-display text-5xl font-medium tracking-tight tabular-nums sm:text-6xl">
                                    {figure.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* Principles */}
            <section
                aria-labelledby="principles-title"
                className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
            >
                <div className="grid gap-12 lg:grid-cols-12">
                    <SectionHeading
                        id="principles-title"
                        kicker="How we work"
                        title="Trust is earned one story at a time."
                        className="lg:col-span-4"
                    />
                    <ol className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
                        {principles.map((principle, index) => (
                            <li key={principle.title}>
                                <span
                                    aria-hidden="true"
                                    className="font-display text-sm text-brand tabular-nums"
                                >
                                    0{index + 1}
                                </span>
                                <h3 className="mt-2 font-display text-xl leading-snug font-medium">
                                    {principle.title}
                                </h3>
                                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                                    {principle.body}
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Call to action */}
            <section
                aria-labelledby="tip-title"
                className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28"
            >
                <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-primary-foreground sm:px-12 lg:py-16">
                    <MeridianLines className="absolute -end-32 -bottom-72 size-[36rem] text-primary-foreground/15" />
                    <div className="relative max-w-2xl">
                        <h2
                            id="tip-title"
                            className="font-display text-3xl leading-tight font-medium text-balance sm:text-4xl"
                        >
                            Know a story Malaysia should hear?
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-primary-foreground">
                            Our best reporting often starts with a reader. Tell
                            us what you have seen, and a member of the newsroom
                            will read every word.
                        </p>
                        <Link
                            href={`${about.url()}#contact`}
                            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-background/90 focus-visible:ring-3 focus-visible:ring-background/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary focus-visible:outline-none"
                        >
                            Contact the newsroom
                            <ArrowUpRight
                                className="size-4 rtl:-scale-x-100"
                                aria-hidden="true"
                            />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
