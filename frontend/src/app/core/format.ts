/** "7 November 2026" from an ISO date (YYYY-MM-DD). */
export function formatDate(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function initials(name: string): string {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
export const sectionId = (h: string) => h.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function officeAddress(o: { lines: string[]; postalCode: string | null; city: string }, sep = ', '): string {
  return [...o.lines, o.postalCode ? `${o.city} – ${o.postalCode}` : o.city, 'India'].join(sep);
}

export function officeMapsUrl(o: { lines: string[]; postalCode: string | null; city: string }): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([...o.lines, o.city, o.postalCode].filter(Boolean).join(' '))}`;
}

/** "a, b and c" */
export const joinAnd = (items: string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`);
