import { Form, Head } from '@inertiajs/react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import {
    Kicker,
    MeridianLines,
    SectionHeading,
} from '@/components/site/section-heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { store } from '@/routes/contact';

const timeline = [
    {
        year: '2014',
        text: 'Three reporters open Meridian in a rented shophouse in Bangsar with one rule: no story goes out unchecked.',
    },
    {
        year: '2017',
        text: 'The Bahasa Malaysia edition launches, written by its own team rather than translated.',
    },
    {
        year: '2020',
        text: 'The Meridian Briefing newsletter starts. Five stories, seven minutes, every weekday at 7am.',
    },
    {
        year: '2023',
        text: 'Lifestyle and Food become full desks, and the newsroom moves to Jalan Ampang.',
    },
    {
        year: '2026',
        text: 'Our East Malaysia bureau opens in Kota Kinabalu, so Sabah and Sarawak are reported from Sabah and Sarawak.',
    },
];

const values = [
    {
        title: 'Accuracy first',
        body: 'Two editors read every story before it is published. Figures are sourced, quotes are recorded and claims are put to the people they concern.',
    },
    {
        title: 'Independence',
        body: 'No owner, advertiser or political party sees a story before you do. Sponsored content is always labelled and written by a separate team.',
    },
    {
        title: 'Fairness',
        body: 'We give people a real chance to respond, we avoid sensational language, and we report on communities with the respect we would want ourselves.',
    },
    {
        title: 'Transparency',
        body: 'Corrections are made within 24 hours and noted at the top of the story. Our editorial code is published and open to challenge.',
    },
];

const facts = [
    { term: 'Founded', detail: '2014, Kuala Lumpur' },
    { term: 'Newsroom', detail: '38 journalists, editors and producers' },
    { term: 'Bureaus', detail: 'Kuala Lumpur, Penang and Kota Kinabalu' },
    { term: 'Languages', detail: 'English and Bahasa Malaysia' },
    { term: 'Readers', detail: '2.4 million a month' },
    { term: 'Publisher', detail: 'Meridian Media Sdn. Bhd.' },
];

const team = [
    {
        name: 'Nadia Hassan',
        role: 'Editor-in-chief',
        bio: 'Former political correspondent who has covered five general elections.',
    },
    {
        name: 'Kelvin Tan',
        role: 'Managing editor',
        bio: 'Runs the daily news meeting and the corrections desk.',
    },
    {
        name: 'Priya Raman',
        role: 'Head of Lifestyle & Food',
        bio: 'Food writer and author of a guide to Malaysian breakfast.',
    },
    {
        name: 'Joanna Gimbang',
        role: 'Bureau chief, East Malaysia',
        bio: 'Reports on Sabah and Sarawak from Kota Kinabalu.',
    },
];

const topics = [
    { value: 'general', label: 'General enquiry' },
    { value: 'news-tip', label: 'News tip' },
    { value: 'correction', label: 'Correction request' },
    { value: 'advertising', label: 'Advertising and partnerships' },
    { value: 'careers', label: 'Careers' },
];

function initials(name: string): string {
    const words = name.trim().split(/\s+/);
    const first = Array.from(words[0] ?? '')[0] ?? '';
    const last =
        words.length > 1 ? (Array.from(words.at(-1) ?? '')[0] ?? '') : '';

    return (first + last).toUpperCase();
}

export default function About() {
    return (
        <>
            <Head title="About Us & Contact">
                <meta
                    name="description"
                    content="Meet the Meridian newsroom in Kuala Lumpur: our story, our editorial standards, our team and how to reach us."
                />
            </Head>

            <section
                aria-labelledby="about-title"
                className="relative overflow-hidden border-b border-foreground/10"
            >
                <MeridianLines className="absolute -end-72 -top-56 size-[52rem] text-foreground/[0.06]" />
                <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:grid-cols-12 lg:px-8 lg:pt-24 lg:pb-20">
                    <div className="lg:col-span-7">
                        <Kicker>About Meridian</Kicker>
                        <h1
                            id="about-title"
                            className="mt-6 font-display text-[2.6rem] leading-[1.04] font-medium tracking-tight text-balance sm:text-6xl"
                        >
                            A newsroom built for the long view.
                        </h1>
                    </div>
                    <div className="space-y-5 text-lg leading-relaxed text-muted-foreground lg:col-span-5 lg:pt-16">
                        <p>
                            Meridian began in 2014 with three reporters, one
                            borrowed printer and a belief that Malaysians
                            deserve journalism that respects their time and
                            their intelligence.
                        </p>
                        <p>
                            Twelve years on, we are a team of 38 across Kuala
                            Lumpur, Penang and Kota Kinabalu. We are funded by
                            readers and responsible advertising, and we answer
                            to no one but the people who read us.
                        </p>
                    </div>
                </div>
            </section>

            {/* Timeline + facts */}
            <section
                aria-labelledby="story-title"
                className="mx-auto grid max-w-6xl gap-16 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-24"
            >
                <div className="lg:col-span-7">
                    <SectionHeading
                        id="story-title"
                        kicker="Our story"
                        title="Twelve years, one rule."
                    />
                    <ol className="mt-10 border-s-2 border-foreground/10">
                        {timeline.map((entry) => (
                            <li
                                key={entry.year}
                                className="relative ps-8 pb-9 last:pb-0"
                            >
                                <span
                                    aria-hidden="true"
                                    className="absolute -start-[7px] top-1.5 size-3 rounded-full border-2 border-background bg-primary"
                                />
                                <p className="font-display text-2xl font-medium text-brand tabular-nums">
                                    {entry.year}
                                </p>
                                <p className="mt-1 max-w-lg leading-relaxed text-muted-foreground">
                                    {entry.text}
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>

                <aside
                    aria-labelledby="facts-title"
                    className="self-start rounded-3xl border border-foreground/10 bg-muted/40 p-7 sm:p-8 lg:col-span-5"
                >
                    <h2
                        id="facts-title"
                        className="font-display text-2xl font-medium"
                    >
                        The newsroom at a glance
                    </h2>
                    <dl className="mt-6 divide-y divide-foreground/10">
                        {facts.map((fact) => (
                            <div
                                key={fact.term}
                                className="grid grid-cols-[7rem_1fr] gap-4 py-3.5 text-sm"
                            >
                                <dt className="font-medium text-muted-foreground">
                                    {fact.term}
                                </dt>
                                <dd className="text-foreground">
                                    {fact.detail}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </aside>
            </section>

            {/* Standards */}
            <section
                id="standards"
                aria-labelledby="standards-title"
                className="scroll-mt-28 bg-muted/50"
            >
                <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
                    <SectionHeading
                        id="standards-title"
                        kicker="Editorial standards"
                        title="What you can hold us to."
                        description="These are the commitments every Meridian journalist signs. If you think we have fallen short, tell us. A senior editor reviews every complaint."
                    />
                    <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/10 sm:grid-cols-2">
                        {values.map((value) => (
                            <li
                                key={value.title}
                                className="bg-background p-7 sm:p-9"
                            >
                                <h3 className="font-display text-2xl font-medium">
                                    {value.title}
                                </h3>
                                <p className="mt-3 leading-relaxed text-muted-foreground">
                                    {value.body}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Team */}
            <section
                aria-labelledby="team-title"
                className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
            >
                <SectionHeading
                    id="team-title"
                    kicker="The people"
                    title="Who runs the newsroom."
                />
                <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {team.map((person) => (
                        <li key={person.name}>
                            <div
                                aria-hidden="true"
                                className="flex aspect-[4/3] items-end rounded-2xl bg-gradient-to-br from-primary/15 via-muted to-muted p-5"
                            >
                                <span className="font-display text-5xl font-medium text-brand/70">
                                    {initials(person.name)}
                                </span>
                            </div>
                            <h3 className="mt-4 font-display text-xl font-medium">
                                {person.name}
                            </h3>
                            <p className="text-sm font-medium text-brand">
                                {person.role}
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {person.bio}
                            </p>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Contact */}
            <section
                id="contact"
                aria-labelledby="contact-title"
                className="scroll-mt-28 border-t border-foreground/10"
            >
                <div className="mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-24">
                    <div className="lg:col-span-5">
                        <SectionHeading
                            id="contact-title"
                            kicker="Contact us"
                            title="Talk to the newsroom."
                            description="Tips, corrections, partnerships or a simple hello. Choose the right inbox, or use the form and we will route it for you."
                        />
                        <ul className="mt-10 space-y-6">
                            <ContactRow icon={<MapPin />} label="Visit">
                                Level 18, Menara Meridian
                                <br />
                                182 Jalan Ampang, 50450 Kuala Lumpur
                            </ContactRow>
                            <ContactRow icon={<Phone />} label="Call">
                                <a
                                    href="tel:+60321814600"
                                    className="rounded-sm underline decoration-foreground/20 underline-offset-4 hover:decoration-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    +60 3-2181 4600
                                </a>
                            </ContactRow>
                            <ContactRow icon={<Mail />} label="Write">
                                <span className="grid gap-x-4 sm:grid-cols-[auto_1fr]">
                                    <span className="text-muted-foreground">
                                        General
                                    </span>
                                    <EmailLink address="newsroom@meridian.example" />
                                    <span className="mt-2 text-muted-foreground sm:mt-0">
                                        News tips
                                    </span>
                                    <EmailLink address="tips@meridian.example" />
                                    <span className="mt-2 text-muted-foreground sm:mt-0">
                                        Corrections
                                    </span>
                                    <EmailLink address="corrections@meridian.example" />
                                </span>
                            </ContactRow>
                            <ContactRow icon={<Clock />} label="Hours">
                                Office: Monday to Friday, 9am to 6pm
                                <br />
                                The news desk is staffed every day.
                            </ContactRow>
                        </ul>
                    </div>

                    <div className="lg:col-span-7">
                        <ContactForm />
                    </div>
                </div>
            </section>
        </>
    );
}

function ContactRow({
    icon,
    label,
    children,
}: {
    icon: ReactNode;
    label: string;
    children: ReactNode;
}) {
    return (
        <li className="flex gap-4">
            <span
                aria-hidden="true"
                className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-brand [&_svg]:size-[1.1rem]"
            >
                {icon}
            </span>
            <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="mt-1 leading-relaxed">{children}</p>
            </div>
        </li>
    );
}

function EmailLink({ address }: { address: string }) {
    return (
        <a
            href={`mailto:${address}`}
            className="rounded-sm font-medium underline decoration-foreground/20 underline-offset-4 hover:decoration-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
            {address}
        </a>
    );
}

function ContactForm() {
    return (
        <div className="rounded-3xl border border-foreground/10 bg-card p-6 shadow-sm sm:p-10">
            <h3 className="font-display text-2xl font-medium">
                Send us a message
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
                All fields are required. We use your details only to reply.
            </p>

            <Form
                {...store.form()}
                options={{ preserveScroll: true }}
                resetOnSuccess
                className="mt-8 grid gap-6 sm:grid-cols-2"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="contact-name">Name</Label>
                            <Input
                                id="contact-name"
                                name="name"
                                required
                                maxLength={100}
                                autoComplete="name"
                                aria-invalid={errors.name ? true : undefined}
                                aria-describedby={
                                    errors.name
                                        ? 'contact-name-error'
                                        : undefined
                                }
                            />
                            <InputError
                                id="contact-name-error"
                                message={errors.name}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="contact-email">Email</Label>
                            <Input
                                id="contact-email"
                                name="email"
                                type="email"
                                required
                                maxLength={255}
                                autoComplete="email"
                                aria-invalid={errors.email ? true : undefined}
                                aria-describedby={
                                    errors.email
                                        ? 'contact-email-error'
                                        : undefined
                                }
                            />
                            <InputError
                                id="contact-email-error"
                                message={errors.email}
                            />
                        </div>

                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="contact-topic">Topic</Label>
                            <Select
                                name="topic"
                                required
                                defaultValue="general"
                            >
                                <SelectTrigger
                                    id="contact-topic"
                                    className="w-full"
                                    aria-invalid={
                                        errors.topic ? true : undefined
                                    }
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    {topics.map((topic) => (
                                        <SelectItem
                                            key={topic.value}
                                            value={topic.value}
                                        >
                                            {topic.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.topic} />
                        </div>

                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="contact-message">Message</Label>
                            <Textarea
                                id="contact-message"
                                name="message"
                                required
                                minLength={20}
                                maxLength={5000}
                                rows={6}
                                aria-invalid={errors.message ? true : undefined}
                                aria-describedby={
                                    errors.message
                                        ? 'contact-message-error'
                                        : 'contact-message-hint'
                                }
                            />
                            {errors.message ? (
                                <InputError
                                    id="contact-message-error"
                                    message={errors.message}
                                />
                            ) : (
                                <p
                                    id="contact-message-hint"
                                    className="text-xs text-muted-foreground"
                                >
                                    At least 20 characters.
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={processing}
                                className="h-11 px-6"
                            >
                                {processing && (
                                    <Spinner
                                        role="presentation"
                                        aria-hidden="true"
                                        aria-label={undefined}
                                    />
                                )}
                                Send message
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}
