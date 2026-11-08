import { Head, Link } from '@inertiajs/react';
import { LegalDocument } from '@/components/site/legal-document';
import type { LegalSection } from '@/components/site/legal-document';
import { about, privacy } from '@/routes';

const sections: LegalSection[] = [
    {
        id: 'agreement',
        title: 'Agreement to these terms',
        body: (
            <>
                <p>
                    These terms govern your use of the Meridian website and
                    everything published on it. By accessing or using the site,
                    you agree to them. If you do not agree, please do not use
                    the site.
                </p>
                <p>
                    The site is operated by Meridian Media Sdn. Bhd., Level 18,
                    Menara Meridian, 182 Jalan Ampang, 50450 Kuala Lumpur
                    (&ldquo;Meridian&rdquo;, &ldquo;we&rdquo;,
                    &ldquo;us&rdquo;).
                </p>
            </>
        ),
    },
    {
        id: 'using-the-site',
        title: 'Using the site',
        body: (
            <p>
                You may read, share links to and print our articles for your own
                personal, non-commercial use. You must be at least 13 years old
                to use the site, and you are responsible for keeping any device
                you use to access it secure.
            </p>
        ),
    },
    {
        id: 'our-content',
        title: 'Our content',
        body: (
            <>
                <p>
                    All articles, photographs, illustrations, video, graphics
                    and the Meridian name and logo are owned by Meridian or our
                    licensors and are protected by the Copyright Act 1987 and
                    other laws.
                </p>
                <p>
                    You may quote short extracts with a clear credit and a link
                    to the original story. Anything more, including republishing
                    a full article, systematic copying or use in a commercial
                    product, needs our written permission. To ask, use our{' '}
                    <Link href={`${about.url()}#contact`}>contact page</Link>.
                </p>
            </>
        ),
    },
    {
        id: 'acceptable-use',
        title: 'Acceptable use',
        body: (
            <>
                <p>When using the site, you agree not to:</p>
                <ul>
                    <li>break any law, or help anyone else to;</li>
                    <li>
                        scrape, harvest or bulk download content, including to
                        train machine learning models, without our written
                        permission;
                    </li>
                    <li>
                        try to gain unauthorised access to the site, our servers
                        or our admin area, or interfere with how they work;
                    </li>
                    <li>
                        send us anything that is defamatory, abusive or that you
                        do not have the right to share.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: 'what-you-send',
        title: 'What you send us',
        body: (
            <p>
                When you send us a tip, comment or message, you confirm that it
                is accurate to the best of your knowledge and that you have the
                right to share it. We may use the information to report a story,
                but we will never name a confidential source without their
                agreement.
            </p>
        ),
    },
    {
        id: 'accuracy',
        title: 'Accuracy and corrections',
        body: (
            <p>
                We work hard to get things right and correct errors promptly, as
                described in our editorial standards. Our journalism is
                published for general information. It is not financial, legal,
                medical or other professional advice, and you should not rely on
                it as such.
            </p>
        ),
    },
    {
        id: 'advertising',
        title: 'Advertising and sponsored content',
        body: (
            <p>
                The site may carry advertising and sponsored content. Sponsored
                content is always clearly labelled and is produced separately
                from our newsroom. Appearing on Meridian does not mean we
                endorse an advertiser or its products.
            </p>
        ),
    },
    {
        id: 'links',
        title: 'Links to other websites',
        body: (
            <p>
                Our stories sometimes link to other websites. We do not control
                them and are not responsible for their content, availability or
                privacy practices.
            </p>
        ),
    },
    {
        id: 'availability',
        title: 'Availability',
        body: (
            <p>
                We aim to keep the site available at all times but cannot
                promise it will be free of interruptions or errors. We may
                change, suspend or withdraw any part of it without notice.
            </p>
        ),
    },
    {
        id: 'liability',
        title: 'Limitation of liability',
        body: (
            <p>
                To the extent the law allows, Meridian is not liable for any
                indirect or consequential loss arising from your use of the site
                or reliance on its content. Nothing in these terms limits
                liability that cannot be limited under Malaysian law, including
                your rights under the Consumer Protection Act 1999.
            </p>
        ),
    },
    {
        id: 'privacy-and-cookies',
        title: 'Privacy and cookies',
        body: (
            <p>
                Our <Link href={privacy()}>Privacy Policy</Link> explains how we
                handle personal data and exactly which cookies we set. When you
                first visit, we ask you to accept or decline cookies, and you
                can change that choice at any time from the Cookie settings link
                at the foot of every page.
            </p>
        ),
    },
    {
        id: 'changes',
        title: 'Changes to these terms',
        body: (
            <p>
                We may update these terms from time to time. The date at the top
                shows when they last changed. If you keep using the site after a
                change, you accept the updated terms.
            </p>
        ),
    },
    {
        id: 'governing-law',
        title: 'Governing law',
        body: (
            <p>
                These terms are governed by the laws of Malaysia. Any dispute
                will be decided by the courts of Kuala Lumpur.
            </p>
        ),
    },
    {
        id: 'contact',
        title: 'Contact us',
        body: (
            <p>
                Questions about these terms can be sent to{' '}
                <a href="mailto:legal@meridian.example">
                    legal@meridian.example
                </a>{' '}
                or by post to the address above.
            </p>
        ),
    },
];

export default function Terms() {
    return (
        <>
            <Head title="Terms & Conditions">
                <meta
                    name="description"
                    content="The terms that govern your use of the Meridian website and its content."
                />
            </Head>
            <LegalDocument
                kicker="Legal"
                title="Terms & Conditions"
                intro={
                    <p>
                        The rules for using Meridian, written as plainly as we
                        could manage. Please read them alongside our Privacy
                        Policy.
                    </p>
                }
                updated="2026-11-08"
                sections={sections}
            />
        </>
    );
}
