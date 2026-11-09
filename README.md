<a id="readme-top"></a>

<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/readme/wordmark-dark.png">
    <img src="docs/readme/wordmark-light.png" alt="Meridian" width="300">
  </picture>
</h1>

<p align="center">
  A news site with four core pages, five readable stories, a cookie consent gate, and an admin portal that shows every consent.
</p>

<p align="center">
  <a href="https://meridian-production-gohs21.laravel.cloud"><strong>Live site</strong></a> ·
  <a href="https://meridian-production-gohs21.laravel.cloud/admin"><strong>Admin portal</strong></a>
</p>

<p align="center">
  <img alt="Laravel 13" src="https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white">
  <img alt="Inertia 3" src="https://img.shields.io/badge/Inertia-3-9553E9?logo=inertia&logoColor=white">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="MySQL 8.4" src="https://img.shields.io/badge/MySQL-8.4-4479A1?logo=mysql&logoColor=white">
  <img alt="Pest: 304 tests" src="https://img.shields.io/badge/Pest-304%20tests-F28D1A">
  <img alt="Playwright: 152 tests" src="https://img.shields.io/badge/Playwright-152%20tests-2EAD33">
</p>

<p align="center">
  <a href="#required-vs-bonus">Required vs bonus</a> ·
  <a href="#see-it-work">See it work</a> ·
  <a href="#try-to-break-it">Try to break it</a> ·
  <a href="#run-it-locally">Run it locally</a> ·
  <a href="#how-the-consent-works">How it works</a> ·
  <a href="#decisions-and-trade-offs">Decisions</a> ·
  <a href="#tests">Tests</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/readme/hero-dark.png">
    <img src="docs/readme/hero-light.png" alt="The Meridian home page behind an open cookie consent box, on desktop and as a bottom sheet on a phone" width="100%">
  </picture>
</p>

Sign in to the admin with `admin@meridian.test` and the password I'm sharing separately. It's hosted on Laravel Cloud in Singapore, with MySQL 8.4.

## The brief, line by line

Every case ID below is written up in [`tests/cases/`](tests/cases), with the brief rule it proves.

| Brief                                                                          | Where it lives                                                                                                                                                                       | Proved by                                                     |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| 4 pages, mobile friendly                                                       | `/`, `/about`, `/privacy`, `/terms`. Checked from 320px up, light and dark, and right to left.                                                                                       | CON-001, CON-002, CON-003                                     |
| Consent box on first visit, page can't scroll                                  | The server decides, so the scroll lock is in the first HTML, before any JavaScript runs.                                                                                             | CON-010, CON-020, CON-022                                     |
| Exact copy, with links to Terms and Privacy                                    | `resources/js/components/site/consent/consent-dialog.tsx`                                                                                                                            | CON-011, CON-012                                              |
| Accept: cookie with GUID, time, version 1, lasts 1 year, saved to the database | `consent` cookie plus a row in `consents`                                                                                                                                            | CON-030, CON-031, CON-032                                     |
| Box stays away until the cookie expires or is gone                             | Checked on the server on every page, and against the database                                                                                                                        | CON-033, CON-040, CON-041, CON-072                            |
| Decline: cookie with the time, lasts 1 day                                     | `consent_declined` cookie                                                                                                                                                            | CON-050, CON-051, CON-052                                     |
| Bonus: secured admin portal                                                    | `/admin`: overview, 30-day chart, consent health, accept rate, renewals due, device, browser and OS breakdowns, searchable table with a status filter, a page per record, CSV export | ADM-002, ADM-020, ADM-030, ADM-040, ADM-043, ADM-045, ADM-049 |
| Database scripts                                                               | `database/migrations`, plus `database/schema.sql` as plain SQL                                                                                                                       | Pest runs on MySQL 8.4 in CI                                  |

## Required vs bonus

- **Required by the brief:** the four pages, the consent box, the exact copy, the Accept and Decline cookies, the database row and the database scripts.
- **Bonus in the brief:** the secured admin portal.
- **Extras I added beyond the brief:**
    - event history for each consent, shown on its own page in the admin
    - withdrawal, when someone declines after accepting
    - coarse device data, kept on accept only
    - browser and device breakdowns on the overview
    - the database check that stops forged cookies
    - HttpOnly on both cookies
    - five readable sample stories at `/stories/{slug}`, behind the same consent gate (STR-001 to STR-022)
    - a live admin overview over free Pusher or Laravel Reverb, off until it's switched on (ADM-056 to ADM-067)

## See it work

One visitor, one session, from the first page load to the admin table. Every frame is a Playwright capture of a local run.

<p align="center">
  <img src="docs/readme/story.gif" alt="Five steps: the consent box opens and the page won't scroll, Accept frees the page, the server sets a cookie with a GUID, the admin logs in, and searching that GUID finds one matching row" width="100%">
</p>

The admin overview, with seeded demo data:

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/readme/admin-overview-dark.png">
    <img src="docs/readme/admin-overview-light.png" alt="Admin overview with accept, decline and withdrawal totals, a 30-day chart, consent health, weekly accept rate, renewals due, and who accepted by device, browser and OS" width="100%">
  </picture>
</p>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Try to break it

I ran each of these on a local copy on 9 Nov 2026. To edit a cookie, open DevTools, then Application, then Cookies.

| Try this                                                                             | What happens                                                          |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Scroll with the box open                                                             | The page stays at 0px.                                                |
| Press Esc, or click outside the box                                                  | The box stays open.                                                   |
| Press Tab over and over                                                              | Focus stays on the box's two links and two buttons.                   |
| Load a page with JavaScript off                                                      | `<html>` already has the `consent-locked` class and scrolling is off. |
| Change the year in `accepted_at` to 2099                                             | The box comes back.                                                   |
| Set the date to over a year ago                                                      | The box comes back.                                                   |
| Change the GUID to `not-a-guid`                                                      | The box comes back.                                                   |
| Keep a real GUID but move `accepted_at` back an hour                                 | The box comes back.                                                   |
| Forge a cookie with a valid GUID and no row                                          | The box comes back.                                                   |
| Accept, decline, then restore the old `consent` cookie and delete `consent_declined` | The box comes back.                                                   |
| Replace the whole value with `hello`                                                 | The box comes back.                                                   |
| Run locally with `CONSENT_VERSION=2` and a v1 cookie                                 | The box comes back.                                                   |
| Accept, reopen with "Cookie settings", accept again                                  | Same GUID, still one row.                                             |
| Type a fresh time into `consent_declined` by hand                                    | The box stays away for up to a day. Declines have no row to check.    |
| Open `/admin` signed out                                                             | You land on the login page.                                           |
| Open `/register`                                                                     | 404. Nobody can sign up.                                              |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Run it locally

You need PHP 8.3+, Composer, Node 24 with pnpm, and MySQL 8 (MariaDB 10.11 works too).

```bash
git clone https://github.com/imanbinamran/meridian-consent.git meridian && cd meridian
mysql -u root -e "CREATE DATABASE meridian"
composer setup      # installs packages, writes .env, migrates, builds the frontend
php artisan db:seed # the admin account, 30 days of demo consents and one expired consent
composer dev        # http://localhost:8000
```

If your MySQL user isn't `root` with no password, set `DB_USERNAME` and `DB_PASSWORD` in `.env` before `composer setup`.

Log in at http://localhost:8000/login with `admin@meridian.test` / `password`.

### Live overview

The admin overview updates by itself when someone accepts, declines or withdraws. A green **Live** badge next to the title says it's on. If the connection drops the badge reads **Disconnected**, and the numbers stay until it comes back. It reconnects by itself and catches up.

It's off by default, so the app runs without it. It can run on free Pusher or on Reverb, and `BROADCAST_CONNECTION` in `.env` picks which. Either way you need a queue worker, because the app sends each update from the queue. `composer dev` starts one.

- **Pusher:** nothing to host, and the free plan is enough. Create a Channels app, then set `BROADCAST_CONNECTION=pusher`, `PUSHER_APP_ID`, `PUSHER_APP_KEY`, `PUSHER_APP_SECRET` and `PUSHER_APP_CLUSTER`.
- **Reverb:** you run the socket server yourself. Set `BROADCAST_CONNECTION=reverb`. `composer dev` starts Reverb on your own machine, and the Reverb values in `.env.example` work there. If something else is on port 8080, set `REVERB_PORT` and `REVERB_SERVER_PORT` to a free one. On a server you need Reverb running too.

If a setting is missing, the page shows no badge and the app queues nothing for it.

The stats, chart and recent list are live. The browser and device breakdowns refresh on page load.

## How the consent works

How the parts connect:

```mermaid
flowchart LR
    B["Browser<br/>consent and consent_declined cookies"]
    AP["Admin portal<br/>overview, table, record page, CSV"]

    subgraph Laravel
        R["Public pages and<br/>POST /consent/accept, /consent/decline"]
        M["ConsentManager<br/>checks cookies, writes records"]
        A["/admin routes<br/>sign-in required"]
    end

    subgraph MySQL
        C[("consents")]
        E[("consent_events")]
        X[("consent_declines")]
    end

    B -- "cookies on each request" --> R
    R --> M
    M -- "look up, accept, withdraw" --> C
    M -- "accepted, withdrawn" --> E
    M -- "anonymous count" --> X
    AP --> A
    A -- "read" --> MySQL
```

What happens on each visit:

```mermaid
flowchart TD
    A[Visitor opens any public page] --> B{"Consent cookie well formed,<br/>and a live row matches<br/>its GUID, time and version?"}
    B -- Yes --> C[Page renders, no box]
    B -- No --> D{"Decline cookie<br/>under 1 day old?"}
    D -- Yes --> C
    D -- No --> E[Page renders with the box open<br/>and scrolling locked]
    E -- Accept --> F[POST /consent/accept]
    E -- Decline --> G[POST /consent/decline]
    F --> H["New GUID, consents row and accepted event.<br/>Sets consent for 365 days"]
    G --> I{"Cookie matches a consent row,<br/>even from an older notice?"}
    I -- Yes --> J["Marks that row withdrawn and writes<br/>an event, unless it already was"]
    I -- No --> K[Adds to the anonymous decline count]
    J --> L["Sets consent_declined for 1 day<br/>and clears consent"]
    K --> L
    H --> C
    L --> C
```

**The cookies.** Both are set by the server and are left unencrypted, so you can read them in DevTools. Both are HttpOnly, so page scripts can't read them. The front end gets the choice from the page props instead.

```
consent           {"guid":"8f0c…","accepted_at":"2026-11-08T09:30:15Z","version":1}   expires in 365 days
consent_declined  2026-11-08T09:30:15Z                                                expires in 1 day
```

The `consent` value is URL-encoded in transit because it contains commas. Tick "Show URL-decoded" in Chrome's DevTools to read it as above.

**When the box comes back.** The server treats a cookie as missing when it has expired or when it doesn't check out. A `consent` cookie doesn't check out when:

- it isn't valid JSON,
- the GUID isn't a v4 UUID,
- the time is in the future or over a year old,
- the version is older than the current one,
- no row in `consents` has that GUID,
- that row has been withdrawn,
- or the row's time (to the second) or version differs from the cookie's.

So a hand-edited `consent` cookie can't hide the box while the database is up.

Two limits. A real, live cookie copied to another browser still works, because the GUID is the only proof. And a hand-typed `consent_declined` can hide the box for up to a day. Declines are anonymous, so there's no row to check. It records no consent.

**Changing your mind.** Declining while holding an acceptance that matches its row marks that record withdrawn and writes an event. This works for a cookie from an older notice too. The `consent` cookie is cleared, and putting it back doesn't help because the row is no longer live. Declining again with that old cookie adds nothing. Accepting later issues a new GUID and a new row.

**Status in the admin.** Each record is one of three things, worked out when it's read:

- **Withdrawn:** the visitor declined after accepting. This wins over Expired.
- **Expired:** 365 days have passed since it was accepted, or it's on an older notice version than the current one.
- **Active:** neither of those.

The table badge, the record page, the status filter and the CSV all use the same rule.

**Versions.** `CONSENT_VERSION` in `.env` is the version of the notice. Raise it to 2 and every visitor who accepted version 1 sees the box again. That's how you'd handle a change to the Privacy Statement.

**Scroll lock before JavaScript.** The server works out whether the box is needed. When it is, the server puts a `consent-locked` class on `<html>` and an inline style turns off scrolling. React removes the class once the visitor chooses. While the box is open, the page behind it is `inert`, so keyboard and screen reader users can't reach it either.

**The box itself.** It's an accessible alert dialog. Esc and clicking outside don't close it on a first visit. Accept and Decline look the same, so neither is pushed. On phones it's a bottom sheet. "Cookie settings" in the footer reopens it, so a visitor can change their mind.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Decisions and trade-offs

- **The server owns the decision.** The browser never creates consent cookies. The GUID, time and version come from the server. A cookie the browser sends back counts only if a live row agrees with it, and what gets stored comes from the server or that row. This keeps the cookie and the database row in step.
- **Accepting twice makes one row.** The buttons turn off while a choice is saving. After that, accepting with a verified cookie keeps its GUID and writes nothing.
- **The decline count holds no ID.** The brief only asks for a cookie on decline. I also store a count (version and time only, no GUID, no IP), so the admin can see the accept rate. The session record below still exists for people who decline.
- **A withdrawal isn't a decline in the count.** That person already has a record, so the record changes and the anonymous decline count doesn't.
- **The version stays 1,** as the brief says. On a live product, adding device data would be a reason to raise it and ask everyone again.
- **No preference centre.** The site sets no optional cookies, so toggles would control nothing. The brief also fixes the choice as Accept and Decline.
- **Device data is three coarse fields:** device type, browser family and OS family. The server works them out on accept only. The raw user agent is never kept in the consent records. The breakdowns cover accepted visitors only, because declines carry no device data. iPadOS can report as macOS Desktop, so some iPads count as Macs.
- **Database outage.** On a page view, if the row lookup fails, a cookie that passes the format checks is trusted, so readers aren't locked out. Accept never does this. If the database can't answer, the visitor gets an error message, no cookie is set and nothing is called saved. Decline has no such handling yet, so a failed Decline is a 500. To be honest about how far the page view fallback goes: with `SESSION_DRIVER=database`, which is what this app uses, the page returns 500 anyway because sessions fail first. I tried both drivers with the database down. The fallback and the Accept message only help on another session driver.
- **Sessions still store IP and user agent.** Laravel's database session driver writes the raw IP and user agent to the `sessions` table for every visitor, including people who decline. That table is separate from the consent records, which don't hold either value, and the Privacy Statement says so. The fix is to move to a different session driver, such as Redis or cookies.
- **Times are stored in UTC and shown in Malaysia time.** The admin's date filters and chart use Kuala Lumpur days, so picking 12 Oct means 12 Oct as the admin sees it.
- **The admin can't be signed up for.** Registration is turned off. Login is rate limited to 5 tries a minute, and 2FA and passkeys are available in settings.
- **Accept and decline are rate limited** at 30 a minute per IP (`CONSENT_THROTTLE`).
- **Live updates can't hurt a visitor.** With live updates on, saving a choice only adds a job to the queue. With them off, nothing is queued. A worker talks to Pusher or Reverb, so an accept never waits on a socket server that's down, and a failure to queue is logged and ignored. The message says only "something changed". It carries no GUID, IP or device data, and the page then asks for the new numbers behind the admin login. A double click, a retry or a repeat decline changes nothing, so it sends nothing.
- **Ready for right-to-left.** Layouts use logical properties, so a Jawi or Arabic edition would mirror correctly. I tested it with `dir="rtl"`.

## Tests

Last full run on 9 Nov 2026: every test below passed, apart from the two real-server tests that are skipped by default.

- **Pest:** 304 tests (2,078 assertions) cover every consent rule, the admin portal, live updates and the stories. Time travel checks the 1-year and 1-day expiry.
- **Playwright:** 152 tests cover consent, scroll lock, accessibility (axe), phone layout, the article pages, the live overview and the admin in desktop Chrome. The consent, phone-layout and article tests also run on an emulated Pixel 7. One test runs the whole story above: accept on the site, log in as admin, and find that cookie's GUID in the table.
- **Test cases:** `tests/cases/*.yaml` lists every case and which brief rule it proves.
- **CI:** GitHub Actions runs lint, PHPStan, Pest on SQLite and MySQL 8, and the Playwright suite on every push.

```bash
php artisan test                                  # Pest
pnpm exec playwright install chromium             # once
pnpm test:e2e                                     # Playwright (starts the app itself)
```

The live overview tests use a fake socket, so neither CI nor your machine needs Reverb or a Pusher account. Two tests use a real server across two browsers, and both are skipped by default. One needs the app on Reverb and `E2E_REVERB=1`. The other needs the `pusher` connection pointed at a local Reverb through `PUSHER_HOST`, `PUSHER_PORT` and `PUSHER_SCHEME`, and `E2E_PUSHER_LOCAL=1`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Where things are

```
app/Support/Consent/        checking cookies against the database, withdrawals, device parsing
app/Http/Middleware/        shares the consent state with every public page
app/Http/Controllers/       consent accept and decline, admin overview, table and record page
app/Events/                 the "consents changed" broadcast
routes/channels.php         who may listen to it
resources/js/pages/site/    the four public pages and the story page
resources/js/pages/admin/   admin overview, consents table and record page
config/consent.php          version, cookie names, lifetimes, rate limit
database/schema.sql         the schema as plain SQL
tests/Feature/              Pest
tests/e2e/                  Playwright
```

## What I'd add next

- **Admin roles.** Any verified user is an admin today. That's safe only because registration is off.
- **Server-side rendering.** The page needs JavaScript to show content. Inertia SSR would make it work without it.
- **A reviewed Malay edition.** The EN/BM switch works, but the Malay text is a draft. A fluent reader should check it, the Privacy Policy and Terms first.
- **A retention period.** Consent records and the decline count are kept with no end date today. I'd set one and prune past it.
- **Real phones.** Phone checks ran in emulation. I'd confirm safe areas and tap behaviour on a real iPhone and Android.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
