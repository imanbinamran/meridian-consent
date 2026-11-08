import { ExternalLink, LayoutDashboard, ListChecks } from 'lucide-react';
import { dashboard, home } from '@/routes';
import { index as consentsIndex } from '@/routes/admin/consents';
import type { NavItem } from '@/types';

export const mainNavItems: NavItem[] = [
    { title: 'Overview', href: dashboard(), icon: LayoutDashboard },
    { title: 'Consents', href: consentsIndex(), icon: ListChecks },
];

export const footerNavItems: NavItem[] = [
    { title: 'View site', href: home(), icon: ExternalLink },
];
