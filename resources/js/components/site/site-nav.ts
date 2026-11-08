import { about, home, privacy, terms } from '@/routes';

export type SiteNavItem = {
    label: string;
    href: string;
};

export const siteNav: SiteNavItem[] = [
    { label: 'Home', href: home.url() },
    { label: 'About & Contact', href: about.url() },
    { label: 'Privacy', href: privacy.url() },
    { label: 'Terms', href: terms.url() },
];
