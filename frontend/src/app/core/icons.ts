// Material Symbols is loaded as a subset (Google Fonts `icon_names`) to keep the font small.
// The subset = icons used by the page templates (below) + icons chosen for content in the admin panel
// (returned by the API in site.icons).
export const UI_ICONS = [
  'arrow_forward', 'arrow_outward', 'arrow_downward', 'north_east', 'expand_more', 'menu', 'close',
  'call', 'mail', 'location_on', 'schedule', 'check_circle', 'verified', 'send', 'event_available',
  'description', 'domain', 'groups', 'person', 'apartment', 'bolt', 'workspace_premium', 'gavel',
  'lock', 'chevron_right', 'format_quote', 'lightbulb', 'calendar_today', 'link', 'download', 'hub',
  'travel_explore', 'account_tree', 'help', 'flag', 'visibility', 'upload_file', 'work', 'school', 'favorite',
  'account_balance', 'engineering', 'insights', 'factory', 'handshake', 'verified_user', 'refresh', 'error',
];

export function iconFontUrl(contentIcons: string[] = []): string {
  const names = [...new Set([...UI_ICONS, ...contentIcons])].filter((n) => /^[a-z0-9_]+$/.test(n)).sort();
  return `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=${names.join(',')}&display=block`;
}
