// Main navigation, built from the site data so new services or industries appear automatically.
import type { Site } from '../core/models';

export interface NavLink { label: string; href: string; icon?: string; hint?: string }
export interface NavItem extends NavLink { children?: NavLink[] }

export const aboutLinks: NavLink[] = [
  { label: 'Overview', href: '/about', icon: 'domain', hint: 'Who we are and what we do' },
  { label: 'Mission', href: '/about/mission', icon: 'flag', hint: 'Objectives and approach' },
  { label: 'Vision', href: '/about/vision', icon: 'visibility', hint: 'What drives the firm' },
  { label: 'Team', href: '/about/team', icon: 'groups', hint: 'Leadership of the firm' },
];

export const serviceLinks = (site: Site): NavLink[] =>
  site.navigation.practices.map((p) => ({ label: p.title, href: `/services/${p.slug}`, icon: p.icon, hint: `${p.itemCount} services` }));

export const industryLinks = (site: Site): NavLink[] =>
  site.navigation.industries.map((i) => ({ label: i.shortTitle, href: `/industries/${i.slug}`, icon: i.icon, hint: i.tag }));

export const mainNav = (site: Site): NavItem[] => [
  { label: 'About Us', href: '/about', children: aboutLinks },
  { label: 'Services', href: '/services', children: serviceLinks(site) },
  { label: 'Industries', href: '/industries', children: industryLinks(site) },
  { label: 'Projects', href: '/projects' },
  { label: 'Clientele', href: '/clientele' },
  { label: 'Career', href: '/careers' },
  { label: 'Association', href: '/association' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Contact Us', href: '/contact' },
];
