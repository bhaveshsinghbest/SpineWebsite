import { DOCUMENT } from '@angular/common';
import { Injectable, RESPONSE_INIT, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import type { Site } from './models';
import { SITE_URL, abs, organization, website } from './schema';

export interface PageSeo {
  /** Page title without the brand suffix ("Home" for the homepage). */
  title: string;
  description: string;
  /** Path or URL of the social sharing image. */
  image?: string;
  type?: 'website' | 'article' | 'profile';
  schema?: object[];
  noindex?: boolean;
  publishedTime?: string;
}

/**
 * Sets the title, meta description, canonical URL, robots, Open Graph / Twitter tags and the JSON-LD graph.
 * Runs during server-side rendering, so search engines receive complete metadata in the HTML.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);
  private router = inject(Router);
  private response = inject(RESPONSE_INIT, { optional: true });

  set(site: Site, page: PageSeo) {
    const path = this.path();
    const name = site.company.name;
    const fullTitle = path === '/' ? `${name} | ${site.company.tagline}` : `${page.title} | ${name}`;
    const canonical = abs(path);
    const image = abs(page.image ?? '/assets/brand/og-default.jpg');

    this.title.setTitle(fullTitle);
    this.tag('name', 'description', page.description);
    this.tag('name', 'robots', page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1');
    this.tag('name', 'author', site.company.legalName);
    this.tag('property', 'og:site_name', name);
    this.tag('property', 'og:locale', 'en_IN');
    this.tag('property', 'og:type', page.type ?? 'website');
    this.tag('property', 'og:title', fullTitle);
    this.tag('property', 'og:description', page.description);
    this.tag('property', 'og:url', canonical);
    this.tag('property', 'og:image', image);
    this.tag('property', 'og:image:alt', path === '/' ? name : `${page.title} — ${name}`);
    if (page.publishedTime) this.tag('property', 'article:published_time', page.publishedTime);
    else this.meta.removeTag("property='article:published_time'");
    this.tag('name', 'twitter:card', 'summary_large_image');
    this.tag('name', 'twitter:title', fullTitle);
    this.tag('name', 'twitter:description', page.description);
    this.tag('name', 'twitter:image', image);
    this.link('canonical', canonical);
    this.jsonLd({ '@context': 'https://schema.org', '@graph': [organization(site), website(site), ...(page.schema ?? [])] });
  }

  /** Marks the server response as 404 and keeps the page out of search indexes. */
  notFound() {
    if (this.response) this.response.status = 404;
    this.tag('name', 'robots', 'noindex, follow');
  }

  /** Current path with the site's trailing-slash convention ("/about/"). */
  path(): string {
    const p = this.router.url.split(/[?#]/)[0] || '/';
    return p === '/' || p.endsWith('/') ? p : `${p}/`;
  }

  private tag(attr: 'name' | 'property', key: string, content: string) {
    this.meta.updateTag({ [attr]: key, content }, `${attr}='${key}'`);
  }

  private link(rel: string, href: string) {
    let el = this.doc.head.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);
    if (!el) {
      el = this.doc.createElement('link');
      el.setAttribute('rel', rel);
      this.doc.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  private jsonLd(graph: object) {
    let el = this.doc.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]#page-schema');
    if (!el) {
      el = this.doc.createElement('script');
      el.type = 'application/ld+json';
      el.id = 'page-schema';
      this.doc.head.appendChild(el);
    }
    // JSON.stringify output is safe inside <script> once "<" is escaped.
    el.textContent = JSON.stringify(graph).replace(/</g, '\\u003c');
  }
}

export { SITE_URL };
