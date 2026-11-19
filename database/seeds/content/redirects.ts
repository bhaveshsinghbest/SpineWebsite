// Old URLs → current pages, so existing search rankings and backlinks carry over.
// Covers the legacy WordPress site and the earlier structure of this site
// (/about/leadership/, /clients/, /sectors/<industry>/).
// Service pages on the old site map to an anchor on the new practice page.

const practiceItems: Record<string, string[]> = {
  consulting: ['transaction-advisory', 'project-structuring', 'bid-process-management', 'strategy-planning', 'financial-modelling', 'economic-analysis', 'pmc', 'techno-economic-valuation'],
  'operations-risk': ['internal-controls', 'contract-management', 'operational-risk-management', 'cost-minimization', 'process-re-engineering', 'accounting-financial-reporting', 'development-sop', 'regulatory-compliance'],
  'investment-banking': ['due-diligence', 'business-valuation', 'investment', 'debt-syndication', 'project-financing', 'deal-structuring', 'asset-management'],
  engineering: ['feasibility-report', 'traffic-analysis', 'detailed-project-report', 'detailed-design', 'project-management-consulting', 'project-implementation-operation', 'proof-checking', 'safety-audit', 'construction-supervision'],
  technology: ['enterprise-application-development', 'industrial-automation', 'mobility', 'analytics-mis'],
};

/** Investment-banking services that were merged into the single "Investment" service. */
const mergedIntoInvestment = ['private-equity', 'venture-capital', 'angle-investment'];

const legacySectorMap: Record<string, string> = {
  'road-highways': '/sectors/roads-highways/',
  railways: '/sectors/railways/',
  metro: '/sectors/metro-transit/',
  port: '/sectors/ports-waterways/',
  'urban-infrastructure': '/sectors/urban-infrastructure/',
  manufacturing: '/industries/manufacturing/',
  'real-estate': '/industries/real-estate/',
  'logistic-transportation': '/industries/logistics-transportation/',
};

const leaderSlugs = ['sanjeet-kumar', 'sujeet-kumar', 'sumit-chaturvedi', 'lovely-singh'];

export const legacyRedirects: Record<string, string> = {
  // Legacy WordPress pages
  '/overview': '/about/',
  '/mission': '/about/mission/',
  '/vision': '/about/vision/',
  '/team': '/about/team/',
  '/career': '/careers/',
  '/contact-us': '/contact/',
  '/blog': '/insights/',
  // Earlier structure of this site
  '/about/leadership': '/about/team/',
  '/clients': '/clientele/',
  '/sectors/manufacturing': '/industries/manufacturing/',
  '/sectors/real-estate': '/industries/real-estate/',
  '/sectors/logistics-warehousing': '/industries/logistics-transportation/',
};

for (const slug of leaderSlugs) legacyRedirects[`/about/leadership/${slug}`] = `/about/team/${slug}/`;
for (const [practice, ids] of Object.entries(practiceItems)) {
  for (const id of ids) legacyRedirects[`/${id}`] = `/services/${practice}/#${id}`;
}
for (const id of mergedIntoInvestment) legacyRedirects[`/${id}`] = '/services/investment-banking/#investment';
for (const [oldSlug, target] of Object.entries(legacySectorMap)) legacyRedirects[`/${oldSlug}`] = target;
