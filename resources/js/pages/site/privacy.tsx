import { Head, Link } from '@inertiajs/react';
import { useConsent } from '@/components/site/consent/consent-context';
import { LegalDocument } from '@/components/site/legal-document';
import type { LegalSection } from '@/components/site/legal-document';
import { about, terms } from '@/routes';

type PrivacyProps = {
    cookies: {
        accepted: string;
        declined: string;
        session: string;
    };
};

export default function Privacy({ cookies }: PrivacyProps) {
    const { reopen } = useConsent();

    const cookieRows = [
        {
            name: cookies.accepted,
            when: 'When you choose Accept',
            holds: 'A random ID (GUID), the time you accepted (UTC) and the version of the cookie notice you saw.',
            lasts: '1 year',
        },
        {
            name: cookies.declined,
            when: 'When you choose Decline',
            holds: 'The time you declined (UTC). Nothing else.',
            lasts: '1 day',
        },
        {
            name: cookies.session,
            when: 'On every visit',
            holds: 'A random session reference that keeps the site working between pages.',
            lasts: '2 hours after your last visit',
        },
        {
            name: 'XSRF-TOKEN',
            when: 'On every visit',
            holds: 'A random token that protects our forms from cross-site request forgery.',
            lasts: '2 hours after your last visit',
        },
        {
            name: 'appearance',
            when: 'On your first visit',
            holds: 'Your light, dark or system theme setting.',
            lasts: '1 year',
        },
    ];

    const sections: LegalSection[] = [
        {
            id: 'who-we-are',
            title: 'Who we are',
            body: (
                <>
                    <p>
                        Meridian is published by Meridian Media Sdn. Bhd., Level
                        18, Menara Meridian, 182 Jalan Ampang, 50450 Kuala
                        Lumpur (&ldquo;Meridian&rdquo;, &ldquo;we&rdquo;,
                        &ldquo;us&rdquo;). We decide how and why your personal
                        data is processed on this website, which makes us the
                        data user under Malaysian law.
                    </p>
                    <p>
                        This policy explains what we collect when you visit,
                        why, how long we keep it and the choices you have. It
                        sits alongside our{' '}
                        <Link href={terms()}>Terms &amp; Conditions</Link>.
                    </p>
                </>
            ),
        },
        {
            id: 'summary',
            title: 'The short version',
            body: (
                <ul>
                    <li>
                        We only set the cookies listed in this policy. We do not
                        currently use advertising or analytics cookies.
                    </li>
                    <li>
                        When you accept cookies, we keep a random ID, the time
                        and the notice version, in a cookie and in our database.
                        None of it says who you are.
                    </li>
                    <li>
                        When you decline, we keep only the time, in a cookie
                        that lasts one day. We count declines without storing
                        anything that could identify you.
                    </li>
                    <li>You can change your choice at any time.</li>
                </ul>
            ),
        },
        {
            id: 'cookies',
            title: 'Cookies we use',
            body: (
                <>
                    <p>
                        A cookie is a small text file a website stores in your
                        browser. These are all the cookies this site sets:
                    </p>
                    <div
                        // Scrolls sideways on phones, so keyboard users need to reach it.
                        role="region"
                        aria-label="Cookies set by this website"
                        tabIndex={0}
                        className="legal-table -mx-4 overflow-x-auto overscroll-x-contain rounded-md px-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:mx-0 sm:px-0"
                    >
                        <table className="w-full min-w-[36rem] border-collapse text-start text-sm">
                            <caption className="sr-only">
                                Cookies set by this website
                            </caption>
                            <thead>
                                <tr className="border-b-2 border-foreground text-start">
                                    <th
                                        scope="col"
                                        className="py-2.5 pe-4 text-start font-semibold"
                                    >
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="py-2.5 pe-4 text-start font-semibold"
                                    >
                                        Set
                                    </th>
                                    <th
                                        scope="col"
                                        className="py-2.5 pe-4 text-start font-semibold"
                                    >
                                        What it holds
                                    </th>
                                    <th
                                        scope="col"
                                        className="py-2.5 text-start font-semibold"
                                    >
                                        Lasts
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {cookieRows.map((row) => (
                                    <tr
                                        key={row.name}
                                        className="border-b border-foreground/10 align-top"
                                    >
                                        <th
                                            scope="row"
                                            className="py-3 pe-4 text-start font-normal"
                                        >
                                            <code>{row.name}</code>
                                        </th>
                                        <td className="py-3 pe-4">
                                            {row.when}
                                        </td>
                                        <td className="py-3 pe-4">
                                            {row.holds}
                                        </td>
                                        <td className="py-3 whitespace-nowrap">
                                            {row.lasts}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p>
                        The session, <code>XSRF-TOKEN</code> and{' '}
                        <code>appearance</code> cookies are strictly necessary:
                        the site cannot work safely without them. Staff who sign
                        in to our admin area also receive a cookie that
                        remembers how their sidebar is laid out.
                    </p>
                </>
            ),
        },
        {
            id: 'accepting',
            title: 'When you accept',
            body: (
                <>
                    <p>
                        Choosing <strong>Accept</strong> sets the{' '}
                        <code>{cookies.accepted}</code> cookie. It holds three
                        values, written as plain text you can read in your
                        browser&rsquo;s developer tools:
                    </p>
                    <ul>
                        <li>
                            <strong>A random ID (GUID)</strong>, such as{' '}
                            <code>3f2b8c1e-7a4d-4e9b-9c1a-5d6e7f8a9b0c</code>.
                            It is generated for you at random and is not linked
                            to your name, email address, IP address or device.
                        </li>
                        <li>
                            <strong>The time you accepted</strong>, in UTC.
                        </li>
                        <li>
                            <strong>The version of the cookie notice</strong>{' '}
                            you agreed to.
                        </li>
                    </ul>
                    <p>
                        The cookie lasts <strong>1 year</strong> from the moment
                        you accept. We store the same three values in our
                        database, so we can show that consent was given and
                        when. If you click Accept again while your cookie is
                        still valid, we keep your existing record rather than
                        create a new one.
                    </p>
                </>
            ),
        },
        {
            id: 'declining',
            title: 'When you decline',
            body: (
                <>
                    <p>
                        Choosing <strong>Decline</strong> sets the{' '}
                        <code>{cookies.declined}</code> cookie. It holds only
                        the time you declined, in UTC, and lasts{' '}
                        <strong>1 day</strong>. When it expires, we ask you
                        again.
                    </p>
                    <p>
                        We also add one line to an anonymous count of declines,
                        holding just the time and the notice version. There is
                        no ID, IP address or anything else that could link the
                        count back to you or your browser.
                    </p>
                </>
            ),
        },
        {
            id: 'changing-your-mind',
            title: 'Changing your mind',
            body: (
                <>
                    <p>
                        You can change your choice at any time with the{' '}
                        <button
                            type="button"
                            onClick={reopen}
                            className="font-medium text-foreground underline decoration-brand/40 underline-offset-4 hover:decoration-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            Cookie settings
                        </button>{' '}
                        link at the foot of every page. Choosing Decline after
                        accepting removes the <code>{cookies.accepted}</code>{' '}
                        cookie, and choosing Accept removes the{' '}
                        <code>{cookies.declined}</code> cookie.
                    </p>
                    <p>
                        You can also delete cookies through your browser
                        settings. If you do, we will ask for your choice again
                        on your next visit.
                    </p>
                </>
            ),
        },
        {
            id: 'notice-versions',
            title: 'When our notice changes',
            body: (
                <p>
                    Every version of the cookie notice has a number, and your
                    choice is tied to the version you saw. If we change how we
                    use cookies in a way you should know about, for example by
                    adding performance measurement, we raise the version number
                    and ask everyone again, even if their cookie has not yet
                    expired.
                </p>
            ),
        },
        {
            id: 'other-data',
            title: 'Other personal data',
            body: (
                <>
                    <p>
                        If you write to us through the contact form or by email,
                        we use your name, email address and message only to read
                        and reply to it.
                    </p>
                    <p>
                        Like every website, our servers receive technical
                        information such as your IP address and browser type
                        when you load a page. We use it only to deliver the site
                        and keep it secure.
                    </p>
                </>
            ),
        },
        {
            id: 'pdpa',
            title: 'Your rights under the PDPA',
            body: (
                <>
                    <p>
                        We handle personal data in line with Malaysia&rsquo;s{' '}
                        <strong>Personal Data Protection Act 2010</strong>{' '}
                        (PDPA) and its principles: we tell you what we collect
                        and why, use it only for that purpose, keep it secure,
                        keep it no longer than needed, keep it accurate, and let
                        you see it.
                    </p>
                    <p>Under the PDPA you may:</p>
                    <ul>
                        <li>
                            ask for access to personal data we hold about you;
                        </li>
                        <li>
                            ask us to correct data that is inaccurate or out of
                            date;
                        </li>
                        <li>
                            withdraw your consent, which you can do for cookies
                            at any time;
                        </li>
                        <li>
                            ask us to stop processing that is likely to cause
                            you damage or distress.
                        </li>
                    </ul>
                    <p>
                        Because the data behind your cookie choice is not linked
                        to your identity, we may need your random ID from the{' '}
                        <code>{cookies.accepted}</code> cookie to find a
                        specific record.
                    </p>
                </>
            ),
        },
        {
            id: 'sharing',
            title: 'Sharing and security',
            body: (
                <p>
                    We do not sell personal data. We share it only with service
                    providers who host and run this website for us, under
                    contracts that require them to protect it, or where the law
                    requires us to. Access to our database is limited to staff
                    who need it, and all traffic to this site should be
                    encrypted in transit.
                </p>
            ),
        },
        {
            id: 'children',
            title: 'Children',
            body: (
                <p>
                    Meridian is written for a general adult audience. We do not
                    knowingly collect personal data from children under 13. If
                    you believe a child has sent us personal data, contact us
                    and we will delete it.
                </p>
            ),
        },
        {
            id: 'changes',
            title: 'Changes to this policy',
            body: (
                <p>
                    We review this policy at least once a year. The date at the
                    top shows when it last changed. Where a change affects how
                    we use cookies, we will also ask for your choice again.
                </p>
            ),
        },
        {
            id: 'contact',
            title: 'Contact us',
            body: (
                <p>
                    For any question about this policy or your personal data,
                    write to our Data Protection Officer at{' '}
                    <a href="mailto:privacy@meridian.example">
                        privacy@meridian.example
                    </a>{' '}
                    or by post to the address above. You can also reach the
                    newsroom through our{' '}
                    <Link href={`${about.url()}#contact`}>contact page</Link>.
                </p>
            ),
        },
    ];

    return (
        <>
            <Head title="Privacy Policy">
                <meta
                    name="description"
                    content="How Meridian uses cookies and handles personal data, including exactly what our consent cookies hold and how long they last."
                />
            </Head>
            <LegalDocument
                kicker="Privacy Statement"
                title="Privacy Policy"
                intro={
                    <p>
                        Plain answers about the data we keep, starting with
                        cookies. We have written it to be read, not skimmed
                        past.
                    </p>
                }
                updated="2026-11-08"
                sections={sections}
            />
        </>
    );
}
