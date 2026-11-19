import { Injectable } from '@angular/core';
import { PathLocationStrategy } from '@angular/common';

/**
 * Keeps the original site's URL convention: every page URL ends with "/" (e.g. /about/mission/).
 * The router works with slash-less paths; this strategy adds the slash to links and the address bar.
 */
@Injectable()
export class TrailingSlashLocationStrategy extends PathLocationStrategy {
  override prepareExternalUrl(internal: string): string {
    const url = super.prepareExternalUrl(internal);
    const [, path, rest] = url.match(/^([^?#]*)(.*)$/)!;
    if (path === '' || path.endsWith('/') || /\.[a-z0-9]{2,5}$/i.test(path)) return url;
    return `${path}/${rest}`;
  }
}
