import { about, home, privacy, terms } from '@/routes';

export type SiteNavItem = {
    /** Under common.nav in lang/{locale}/site.php. */
    key: string;
    href: string;
};

export const siteNav: SiteNavItem[] = [
    { key: 'home', href: home.url() },
    { key: 'about', href: about.url() },
    { key: 'privacy', href: privacy.url() },
    { key: 'terms', href: terms.url() },
];
