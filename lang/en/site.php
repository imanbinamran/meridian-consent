<?php

/*
| Every word a public visitor sees, in English. lang/ms/site.php holds the same
| keys in Bahasa Melayu, and a test keeps the two files in step.
|
| `common` goes to every public page. The other top-level groups go only to the
| page they name (see HandleInertiaRequests). `toast` stays on the server.
|
| In text, :name is a value filled in by the page, and <tag>text</tag> marks
| words the page wraps in a link or emphasis.
*/

return [
    'toast' => [
        'consent_save_failed' => 'We could not save your cookie choice. Please try again.',
        'consent_saved' => 'Thanks. Your cookie choice is saved.',
        'consent_declined' => 'Understood. We will ask again tomorrow.',
        'contact_sent' => 'Thanks. Your message has reached the newsroom.',
    ],

    'common' => [
        'site' => [
            'edition' => 'Kuala Lumpur edition',
            'tagline' => 'Independent journalism for Malaysia',
            'menu_description' => 'News and lifestyle from Kuala Lumpur.',
            'skip_to_content' => 'Skip to content',
            'logo_home' => ', home',
            'main_nav' => 'Main',
            'mobile_nav' => 'Mobile',
            'footer_nav' => 'Footer',
            'open_menu' => 'Open menu',
            'close' => 'Close',
            'theme_to_light' => 'Switch to light mode',
            'theme_to_dark' => 'Switch to dark mode',
            'back_to_top' => 'Back to top',
        ],
        'language' => [
            'label' => 'Language',
            'en' => 'English',
            'ms' => 'Bahasa Melayu',
        ],
        'nav' => [
            'home' => 'Home',
            'about' => 'About & Contact',
            'privacy' => 'Privacy',
            'terms' => 'Terms',
        ],
        'footer' => [
            'about' => 'Independent news and lifestyle journalism from Kuala Lumpur, for everyone who calls Malaysia home.',
            'pages' => 'Pages',
            'your_data' => 'Your data',
            'privacy_policy' => 'Privacy Policy',
            'terms' => 'Terms & Conditions',
            'cookie_settings' => 'Cookie settings',
            'newsroom' => 'Newsroom',
            'address' => ['Level 18, Menara Meridian', '182 Jalan Ampang', '50450 Kuala Lumpur'],
            'rights' => '© :year Meridian Media Sdn. Bhd. All rights reserved.',
            'send_tip' => 'Send a tip',
            'staff_sign_in' => 'Staff sign-in',
        ],
        'consent' => [
            'kicker' => 'Your privacy',
            'title' => 'Cookie consent',
            'intro' => 'Cookies are necessary for this website to function properly, for performance measurement, and to provide you with the best experience.',
            'agreement' => 'By continuing to access or use this site, you acknowledge and consent to our use of cookies in accordance with our <terms>Terms & Conditions</terms> and <privacy>Privacy Statement</privacy>.',
            'status_accepted' => 'You <strong>accepted</strong> on :date. Choose again to change it.',
            'status_declined' => 'You <strong>declined</strong> on :date. Choose again to change it.',
            'docked' => 'Read as long as you need. Choose to continue to the site.',
            'decline' => 'Decline',
            'accept' => 'Accept',
        ],
        'story' => [
            'desk_suffix' => ' desk',
            'min_read' => ':minutes min read',
            'min_left' => ':minutes min left',
            'resume' => ':minutes min left, pick up where you left off',
            'read' => 'Read',
            'finished' => 'Finished',
            'edition' => 'This week’s edition',
            'sample_notice' => 'Sample story. The people and businesses are made up.',
            'sections_nav' => 'Sections of this story',
            'drag_to_scroll' => 'Drag to scroll the story',
            'reading_position' => 'Reading position',
            'end' => 'You’ve reached the end.',
            'end_quick' => 'That was quick. :time on this story.',
            'end_promised' => 'Finished. :time on this story, about what we promised.',
            'seconds' => ':seconds sec',
            'minutes_seconds' => ':minutes min :seconds sec',
            'next_in_edition' => 'Next in this week’s edition',
            'back_to_edition' => 'Back to this week’s edition',
        ],
        'legal' => [
            'last_updated' => 'Last updated',
            'contents' => 'Contents',
        ],
    ],

    'home' => [
        'title' => 'Malaysian news and lifestyle, told with care',
        'description' => 'Meridian is an independent Malaysian digital publisher covering news, business, lifestyle, food, culture and sport from Kuala Lumpur.',
        'hero' => [
            'kicker' => 'Independent · Kuala Lumpur · Since 2014',
            'title' => 'The stories that shape Malaysia, <em>told with care.</em>',
            'body' => 'Meridian is a digital news and lifestyle publisher for readers who want to understand the country, not just scroll past it. Every morning our newsroom sorts what matters from what is merely loud, and explains it plainly.',
            'meet' => 'Meet the newsroom',
            'standards' => 'Our editorial standards',
        ],
        'edition' => [
            'title' => 'This week’s edition',
            'selected' => 'Selected by the editors',
        ],
        'desks' => [
            'kicker' => 'What we cover',
            'title' => 'Six desks, one promise: context before noise.',
            'description' => 'Our reporters are specialists. They stay on a beat for years, build sources across the country and know which numbers to trust.',
            'items' => [
                ['name' => 'Nation', 'body' => 'Parliament, policy and the decisions that reach your household, from Putrajaya to the state assemblies.', 'rhythm' => 'Daily'],
                ['name' => 'Business', 'body' => 'Markets, start-ups and the cost of living, explained by reporters who read the filings so you do not have to.', 'rhythm' => 'Daily'],
                ['name' => 'Lifestyle', 'body' => 'Homes, health, work and family life, written for how Malaysians actually live today.', 'rhythm' => 'Weekdays'],
                ['name' => 'Food', 'body' => 'Hawker legends, new openings and recipes from every corner of the peninsula, Sabah and Sarawak.', 'rhythm' => 'Three times a week'],
                ['name' => 'Culture', 'body' => 'Film, music, books and the artists shaping a confident Malaysian identity at home and abroad.', 'rhythm' => 'Weekly'],
                ['name' => 'Sport', 'body' => 'Badminton to football to the grassroots leagues, with analysis that goes beyond the scoreline.', 'rhythm' => 'Daily'],
            ],
        ],
        'long_read' => [
            'kicker' => 'The Sunday long read',
            'quote' => '“We used to ride two hours to the town bank. Now my mother sells her tuhau paste to buyers in Johor from her kitchen.”',
            'quote_source' => 'Rosnah, a smallholder in Kota Marudu',
            'body' => 'Over six months, our East Malaysia bureau followed three villages as fibre broadband, e-wallets and community-run delivery networks arrived. The result is a portrait of change that is faster, messier and more hopeful than the national statistics suggest.',
        ],
        'figures' => [
            'title' => 'Meridian in numbers',
            'items' => [
                ['value' => 2400000, 'label' => 'readers every month'],
                ['value' => 38, 'label' => 'journalists and editors'],
                ['value' => 2, 'label' => 'languages, English and Bahasa Malaysia'],
                ['value' => 16, 'label' => 'states and federal territories covered'],
            ],
        ],
        'principles' => [
            'kicker' => 'How we work',
            'title' => 'Trust is earned one story at a time.',
            'items' => [
                ['title' => 'Verified before published', 'body' => 'Every story is checked by a second editor. If we cannot confirm it, we do not run it, however fast the rest of the internet moves.'],
                ['title' => 'Explained, not shouted', 'body' => 'We write headlines that tell you what happened, and stories that tell you why it matters. No outrage bait, no clickbait.'],
                ['title' => 'Corrected in the open', 'body' => 'When we get something wrong we fix it within 24 hours and say so at the top of the story, with the date of the change.'],
            ],
        ],
        'tip' => [
            'title' => 'Know a story Malaysia should hear?',
            'body' => 'Our best reporting often starts with a reader. Tell us what you have seen, and a member of the newsroom will read every word.',
            'cta' => 'Contact the newsroom',
        ],
    ],

    'about' => [
        'title' => 'About Us & Contact',
        'description' => 'Meet the Meridian newsroom in Kuala Lumpur: our story, our editorial standards, our team and how to reach us.',
        'hero' => [
            'kicker' => 'About Meridian',
            'title' => 'A newsroom built for the long view.',
            'paragraphs' => [
                'Meridian began in 2014 with three reporters, one borrowed printer and a belief that Malaysians deserve journalism that respects their time and their intelligence.',
                'Twelve years on, we are a team of 38 across Kuala Lumpur, Penang and Kota Kinabalu. We are funded by readers and responsible advertising, and we answer to no one but the people who read us.',
            ],
        ],
        'story' => [
            'kicker' => 'Our story',
            'title' => 'Twelve years, one rule.',
            'timeline' => [
                ['year' => '2014', 'text' => 'Three reporters open Meridian in a rented shophouse in Bangsar with one rule: no story goes out unchecked.'],
                ['year' => '2017', 'text' => 'The Bahasa Malaysia edition launches, written by its own team rather than translated.'],
                ['year' => '2020', 'text' => 'The Meridian Briefing newsletter starts. Five stories, seven minutes, every weekday at 7am.'],
                ['year' => '2023', 'text' => 'Lifestyle and Food become full desks, and the newsroom moves to Jalan Ampang.'],
                ['year' => '2026', 'text' => 'Our East Malaysia bureau opens in Kota Kinabalu, so Sabah and Sarawak are reported from Sabah and Sarawak.'],
            ],
        ],
        'facts' => [
            'title' => 'The newsroom at a glance',
            'items' => [
                ['term' => 'Founded', 'detail' => '2014, Kuala Lumpur'],
                ['term' => 'Newsroom', 'detail' => '38 journalists, editors and producers'],
                ['term' => 'Bureaus', 'detail' => 'Kuala Lumpur, Penang and Kota Kinabalu'],
                ['term' => 'Languages', 'detail' => 'English and Bahasa Malaysia'],
                ['term' => 'Readers', 'detail' => '2.4 million a month'],
                ['term' => 'Publisher', 'detail' => 'Meridian Media Sdn. Bhd.'],
            ],
        ],
        'standards' => [
            'kicker' => 'Editorial standards',
            'title' => 'What you can hold us to.',
            'description' => 'These are the commitments every Meridian journalist signs. If you think we have fallen short, tell us. A senior editor reviews every complaint.',
            'items' => [
                ['title' => 'Accuracy first', 'body' => 'Two editors read every story before it is published. Figures are sourced, quotes are recorded and claims are put to the people they concern.'],
                ['title' => 'Independence', 'body' => 'No owner, advertiser or political party sees a story before you do. Sponsored content is always labelled and written by a separate team.'],
                ['title' => 'Fairness', 'body' => 'We give people a real chance to respond, we avoid sensational language, and we report on communities with the respect we would want ourselves.'],
                ['title' => 'Transparency', 'body' => 'Corrections are made within 24 hours and noted at the top of the story. Our editorial code is published and open to challenge.'],
            ],
        ],
        'team' => [
            'kicker' => 'The people',
            'title' => 'Who runs the newsroom.',
            'items' => [
                ['name' => 'Nadia Hassan', 'role' => 'Editor-in-chief', 'bio' => 'Former political correspondent who has covered five general elections.'],
                ['name' => 'Kelvin Tan', 'role' => 'Managing editor', 'bio' => 'Runs the daily news meeting and the corrections desk.'],
                ['name' => 'Priya Raman', 'role' => 'Head of Lifestyle & Food', 'bio' => 'Food writer and author of a guide to Malaysian breakfast.'],
                ['name' => 'Joanna Gimbang', 'role' => 'Bureau chief, East Malaysia', 'bio' => 'Reports on Sabah and Sarawak from Kota Kinabalu.'],
            ],
        ],
        'contact' => [
            'kicker' => 'Contact us',
            'title' => 'Talk to the newsroom.',
            'description' => 'Tips, corrections, partnerships or a simple hello. Choose the right inbox, or use the form and we will route it for you.',
            'visit' => 'Visit',
            'address' => ['Level 18, Menara Meridian', '182 Jalan Ampang, 50450 Kuala Lumpur'],
            'call' => 'Call',
            'write' => 'Write',
            'general' => 'General',
            'news_tips' => 'News tips',
            'corrections' => 'Corrections',
            'hours' => 'Hours',
            'hours_lines' => ['Office: Monday to Friday, 9am to 6pm', 'The news desk is staffed every day.'],
        ],
        'form' => [
            'title' => 'Send us a message',
            'intro' => 'All fields are required. We use your details only to reply.',
            'name' => 'Name',
            'email' => 'Email',
            'topic' => 'Topic',
            'topics' => [
                ['value' => 'general', 'label' => 'General enquiry'],
                ['value' => 'news-tip', 'label' => 'News tip'],
                ['value' => 'correction', 'label' => 'Correction request'],
                ['value' => 'advertising', 'label' => 'Advertising and partnerships'],
                ['value' => 'careers', 'label' => 'Careers'],
            ],
            'message' => 'Message',
            'message_hint' => 'At least 20 characters.',
            'submit' => 'Send message',
        ],
    ],

    'privacy' => [
        'title' => 'Privacy Policy',
        'description' => 'How Meridian uses cookies and handles personal data, including exactly what our consent cookies hold and how long they last.',
        'kicker' => 'Privacy Statement',
        'intro' => 'Plain answers about the data we keep, starting with cookies. We have written it to be read, not skimmed past.',
        'cookie_table' => [
            'label' => 'Cookies set by this website',
            'name' => 'Name',
            'set' => 'Set',
            'holds' => 'What it holds',
            'lasts' => 'Lasts',
            'rows' => [
                ['cookie' => 'accepted', 'when' => 'When you choose Accept', 'holds' => 'A random ID (GUID), the time you accepted (UTC) and the version of the cookie notice you saw.', 'lasts' => '1 year'],
                ['cookie' => 'declined', 'when' => 'When you choose Decline', 'holds' => 'The time you declined (UTC). Nothing else.', 'lasts' => '1 day'],
                ['cookie' => 'session', 'when' => 'On every visit', 'holds' => 'A random session reference that keeps the site working between pages.', 'lasts' => '2 hours after your last visit'],
                ['cookie' => 'XSRF-TOKEN', 'when' => 'On every visit', 'holds' => 'A random token that protects our forms from cross-site request forgery.', 'lasts' => '2 hours after your last visit'],
                ['cookie' => 'appearance', 'when' => 'On your first visit', 'holds' => 'Your light, dark or system theme setting.', 'lasts' => '1 year'],
                ['cookie' => 'locale', 'when' => 'When you switch language', 'holds' => 'The language you chose: en for English or ms for Bahasa Melayu.', 'lasts' => '1 year'],
            ],
        ],
        'sections' => [
            ['id' => 'who-we-are', 'title' => 'Who we are', 'blocks' => [
                ['p' => 'Meridian is published by Meridian Media Sdn. Bhd., Level 18, Menara Meridian, 182 Jalan Ampang, 50450 Kuala Lumpur (“Meridian”, “we”, “us”). We decide how and why your personal data is processed on this website, which makes us the data user under Malaysian law.'],
                ['p' => 'This policy explains what we collect when you visit, why, how long we keep it and the choices you have. It sits alongside our <terms>Terms & Conditions</terms>.'],
            ]],
            ['id' => 'summary', 'title' => 'The short version', 'blocks' => [
                ['ul' => [
                    'We only set the cookies listed in this policy. We do not currently use advertising or analytics cookies.',
                    'When you accept cookies, we keep a random ID, the time and the notice version, in a cookie and in our database. In the database we also keep your general device type, browser family, operating system family and the language of the notice. None of it is your name, email address or IP address.',
                    'When you decline, we keep the time in a cookie that lasts one day. We also add a line to a count of declines, with no ID or IP address in it.',
                    'Whatever you choose, our servers keep a session record of your visit, with your IP address and browser details. It is separate from your consent record.',
                    'You can change your choice at any time. If you decline after accepting, we mark your record as withdrawn.',
                ]],
            ]],
            ['id' => 'cookies', 'title' => 'Cookies we use', 'blocks' => [
                ['p' => 'A cookie is a small text file a website stores in your browser. These are all the cookies this site sets:'],
                ['cookie_table' => true],
                ['p' => 'The session, <code>XSRF-TOKEN</code> and <code>appearance</code> cookies are strictly necessary: the site cannot work safely without them. Staff who sign in to our admin area also receive a cookie that remembers how their sidebar is laid out.'],
                ['p' => 'The <code>locale</code> cookie is set only if you use the language switch, and it remembers that choice and nothing else. Without it, the site is in English.'],
                ['p' => 'If you accept cookies, your browser also remembers how far you have read each story, so you can pick up where you left off. This is kept in your browser’s local storage under <code>meridian.reading</code>. It is never sent to us, and it is removed if you decline or your choice expires.'],
            ]],
            ['id' => 'accepting', 'title' => 'When you accept', 'blocks' => [
                ['p' => 'Choosing <strong>Accept</strong> sets the <code>:accepted</code> cookie. It holds three values, written as plain text you can read in your browser’s developer tools:'],
                ['ul' => [
                    '<strong>A random ID (GUID)</strong>, such as <code>3f2b8c1e-7a4d-4e9b-9c1a-5d6e7f8a9b0c</code>. It is generated for you at random and is not linked to your name, email address or IP address.',
                    '<strong>The time you accepted</strong>, in UTC.',
                    '<strong>The version of the cookie notice</strong> you agreed to.',
                ]],
                ['p' => 'The cookie lasts <strong>1 year</strong> from the moment you accept. We store the same three values in our database, so we can show that consent was given and when. If you click Accept again while your cookie is still valid, we keep your existing record rather than create a new one.'],
                ['p' => 'When you first accept, we also work out three broad details from the header your browser sends and keep them with that record in our database, not in the cookie:'],
                ['ul' => [
                    '<strong>Device type</strong>: Desktop, Mobile, Tablet or Unknown.',
                    '<strong>Browser family</strong>: Chrome, Safari, Firefox, Edge or Other.',
                    '<strong>Operating system family</strong>: Windows, macOS, Android, iOS, Linux or Other.',
                ]],
                ['p' => 'We use these to understand the kinds of device consent comes from. They are broad and sometimes wrong: an iPad can show up as a Mac desktop. We do not keep your IP address or the full browser header with this record.'],
                ['p' => 'We also note the language the notice was in when you accepted, English or Bahasa Melayu, so we can show which wording you agreed to. This is kept with your record in our database, not in the cookie.'],
            ]],
            ['id' => 'declining', 'title' => 'When you decline', 'blocks' => [
                ['p' => 'Choosing <strong>Decline</strong> sets the <code>:declined</code> cookie. It holds only the time you declined, in UTC, and lasts <strong>1 day</strong>. When it expires, we ask you again.'],
                ['p' => 'If you had not accepted, we also add one line to a count of declines, holding just the time and the notice version. That line has no ID, IP address or browser details in it. The session record described under “Other personal data” is kept whatever you choose.'],
            ]],
            ['id' => 'changing-your-mind', 'title' => 'Changing your mind', 'blocks' => [
                ['p' => 'You can change your choice at any time with the <settings>Cookie settings</settings> link at the foot of every page. Choosing Decline after accepting removes the <code>:accepted</code> cookie, and choosing Accept removes the <code>:declined</code> cookie.'],
                ['p' => 'When you decline after accepting, we mark your record in our database as withdrawn and note the time, so your random ID stops being valid. We keep the withdrawn record, with its device details, as evidence of what you chose and when. If you accept again later, you get a new random ID and a new record.'],
                ['p' => 'You can also delete cookies through your browser settings. If you do, we will ask for your choice again on your next visit.'],
            ]],
            ['id' => 'notice-versions', 'title' => 'When our notice changes', 'blocks' => [
                ['p' => 'Every version of the cookie notice has a number, and your choice is tied to the version you saw. If we change how we use cookies in a way you should know about, for example by adding performance measurement, we raise the version number and ask everyone again, even if their cookie has not yet expired.'],
            ]],
            ['id' => 'other-data', 'title' => 'Other personal data', 'blocks' => [
                ['p' => 'If you write to us through the contact form or by email, we use your name, email address and message only to read and reply to it.'],
                ['p' => 'Like every website, our servers receive technical information such as your IP address and browser type when you load a page. We use it to deliver the site and keep it secure. If you accept, we also use your browser header to work out the broad device details described under “When you accept”.'],
                ['p' => 'Our servers also keep a session record in our database for every visitor, whether you accept, decline or have not chosen yet. It holds your IP address, your full browser header (user agent), when you were last active, and working data such as a security token and the last page you opened.'],
                ['p' => 'This session record is separate from your consent record. It does not hold your random ID, and your consent record does not hold your IP address or your full browser header. A session ends 2 hours after your last visit. We clear ended sessions from our database from time to time, so a record can stay longer than that.'],
            ]],
            ['id' => 'pdpa', 'title' => 'Your rights under the PDPA', 'blocks' => [
                ['p' => 'We handle personal data in line with Malaysia’s <strong>Personal Data Protection Act 2010</strong> (PDPA) and its principles: we tell you what we collect and why, use it only for that purpose, keep it secure, keep it no longer than needed, keep it accurate, and let you see it.'],
                ['p' => 'Under the PDPA you may:'],
                ['ul' => [
                    'ask for access to personal data we hold about you;',
                    'ask us to correct data that is inaccurate or out of date;',
                    'withdraw your consent, which you can do for cookies at any time;',
                    'ask us to stop processing that is likely to cause you damage or distress.',
                ]],
                ['p' => 'Because the data behind your cookie choice is not linked to your identity, we may need your random ID from the <code>:accepted</code> cookie to find a specific record.'],
            ]],
            ['id' => 'sharing', 'title' => 'Sharing and security', 'blocks' => [
                ['p' => 'We do not sell personal data. We share it only with service providers who host and run this website for us, under contracts that require them to protect it, or where the law requires us to. Access to our database is limited to staff who need it, and all traffic to this site should be encrypted in transit.'],
            ]],
            ['id' => 'children', 'title' => 'Children', 'blocks' => [
                ['p' => 'Meridian is written for a general adult audience. We do not knowingly collect personal data from children under 13. If you believe a child has sent us personal data, contact us and we will delete it.'],
            ]],
            ['id' => 'changes', 'title' => 'Changes to this policy', 'blocks' => [
                ['p' => 'We review this policy at least once a year. The date at the top shows when it last changed. Where a change affects how we use cookies, we will also ask for your choice again.'],
            ]],
            ['id' => 'contact', 'title' => 'Contact us', 'blocks' => [
                ['p' => 'For any question about this policy or your personal data, write to our Data Protection Officer at <privacy_email>privacy@meridian.example</privacy_email> or by post to the address above. You can also reach the newsroom through our <contact>contact page</contact>.'],
            ]],
        ],
    ],

    'terms' => [
        'title' => 'Terms & Conditions',
        'description' => 'The terms that govern your use of the Meridian website and its content.',
        'kicker' => 'Legal',
        'intro' => 'The rules for using Meridian, written as plainly as we could manage. Please read them alongside our Privacy Policy.',
        'sections' => [
            ['id' => 'agreement', 'title' => 'Agreement to these terms', 'blocks' => [
                ['p' => 'These terms govern your use of the Meridian website and everything published on it. By accessing or using the site, you agree to them. If you do not agree, please do not use the site.'],
                ['p' => 'The site is operated by Meridian Media Sdn. Bhd., Level 18, Menara Meridian, 182 Jalan Ampang, 50450 Kuala Lumpur (“Meridian”, “we”, “us”).'],
            ]],
            ['id' => 'using-the-site', 'title' => 'Using the site', 'blocks' => [
                ['p' => 'You may read, share links to and print our articles for your own personal, non-commercial use. You must be at least 13 years old to use the site, and you are responsible for keeping any device you use to access it secure.'],
            ]],
            ['id' => 'our-content', 'title' => 'Our content', 'blocks' => [
                ['p' => 'All articles, photographs, illustrations, video, graphics and the Meridian name and logo are owned by Meridian or our licensors and are protected by the Copyright Act 1987 and other laws.'],
                ['p' => 'You may quote short extracts with a clear credit and a link to the original story. Anything more, including republishing a full article, systematic copying or use in a commercial product, needs our written permission. To ask, use our <contact>contact page</contact>.'],
            ]],
            ['id' => 'acceptable-use', 'title' => 'Acceptable use', 'blocks' => [
                ['p' => 'When using the site, you agree not to:'],
                ['ul' => [
                    'break any law, or help anyone else to;',
                    'scrape, harvest or bulk download content, including to train machine learning models, without our written permission;',
                    'try to gain unauthorised access to the site, our servers or our admin area, or interfere with how they work;',
                    'send us anything that is defamatory, abusive or that you do not have the right to share.',
                ]],
            ]],
            ['id' => 'what-you-send', 'title' => 'What you send us', 'blocks' => [
                ['p' => 'When you send us a tip, comment or message, you confirm that it is accurate to the best of your knowledge and that you have the right to share it. We may use the information to report a story, but we will never name a confidential source without their agreement.'],
            ]],
            ['id' => 'accuracy', 'title' => 'Accuracy and corrections', 'blocks' => [
                ['p' => 'We work hard to get things right and correct errors promptly, as described in our editorial standards. Our journalism is published for general information. It is not financial, legal, medical or other professional advice, and you should not rely on it as such.'],
            ]],
            ['id' => 'advertising', 'title' => 'Advertising and sponsored content', 'blocks' => [
                ['p' => 'The site may carry advertising and sponsored content. Sponsored content is always clearly labelled and is produced separately from our newsroom. Appearing on Meridian does not mean we endorse an advertiser or its products.'],
            ]],
            ['id' => 'links', 'title' => 'Links to other websites', 'blocks' => [
                ['p' => 'Our stories sometimes link to other websites. We do not control them and are not responsible for their content, availability or privacy practices.'],
            ]],
            ['id' => 'availability', 'title' => 'Availability', 'blocks' => [
                ['p' => 'We aim to keep the site available at all times but cannot promise it will be free of interruptions or errors. We may change, suspend or withdraw any part of it without notice.'],
            ]],
            ['id' => 'liability', 'title' => 'Limitation of liability', 'blocks' => [
                ['p' => 'To the extent the law allows, Meridian is not liable for any indirect or consequential loss arising from your use of the site or reliance on its content. Nothing in these terms limits liability that cannot be limited under Malaysian law, including your rights under the Consumer Protection Act 1999.'],
            ]],
            ['id' => 'privacy-and-cookies', 'title' => 'Privacy and cookies', 'blocks' => [
                ['p' => 'Our <privacy>Privacy Policy</privacy> explains how we handle personal data and exactly which cookies we set. When you first visit, we ask you to accept or decline cookies, and you can change that choice at any time from the Cookie settings link at the foot of every page.'],
            ]],
            ['id' => 'changes', 'title' => 'Changes to these terms', 'blocks' => [
                ['p' => 'We may update these terms from time to time. The date at the top shows when they last changed. If you keep using the site after a change, you accept the updated terms.'],
            ]],
            ['id' => 'governing-law', 'title' => 'Governing law', 'blocks' => [
                ['p' => 'These terms are governed by the laws of Malaysia. Any dispute will be decided by the courts of Kuala Lumpur.'],
            ]],
            ['id' => 'contact', 'title' => 'Contact us', 'blocks' => [
                ['p' => 'Questions about these terms can be sent to <legal_email>legal@meridian.example</legal_email> or by post to the address above.'],
            ]],
        ],
    ],
];
