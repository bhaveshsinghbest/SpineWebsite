import type { Sector } from './types';

// Industries (main menu → Industries): Manufacturing, Real Estate, and Logistics & Transportation.
// Same shape as sectors, rendered by SectorDetail under /industries/<slug>/.
// Content describes what Spine Advisory offers; it makes no claims about specific past mandates.

export const industries: Sector[] = [
  {
    slug: 'manufacturing',
    title: 'Manufacturing & Industrial Infrastructure',
    shortTitle: 'Manufacturing',
    icon: 'factory',
    tag: 'Industrial Growth',
    banner: 'semiconductor',
    metaDescription:
      'Advisory for manufacturing projects and industrial parks in India: feasibility, PLI and incentive assessment, project finance and automation.',
    summary:
      'Feasibility, incentive assessment, financing and industrial automation support for plants and industrial parks.',
    answer:
      'Spine Advisory helps manufacturers and industrial park developers assess, finance and execute projects. The firm prepares techno-economic feasibility studies, evaluates central and state incentives including Production Linked Incentive schemes, arranges project finance, and provides engineering and industrial automation services through its technology practice.',
    highlights: [
      'Techno-economic feasibility and valuation for manufacturing projects',
      'Assessment of PLI schemes and state industrial incentives',
      'Industrial park and corridor infrastructure advisory',
      'Debt and equity raising for greenfield and expansion projects',
      'Industrial automation, MIS and analytics implementation',
    ],
    sections: [
      {
        heading: 'Feasibility and location decisions',
        body: [
          'A manufacturing investment is shaped as much by location as by technology. Land cost, utility availability, logistics to suppliers and markets, labour and state incentive packages can shift project returns significantly. Industrial corridor nodes developed under the National Industrial Corridor Development Programme offer plug-and-play land, but suitability still varies by sector. Spine prepares techno-economic feasibility reports that compare locations, capacities and technology options, and present the results in a form lenders and boards can act on.',
        ],
      },
      {
        heading: 'Incentives and project finance',
        body: [
          'Production Linked Incentive schemes reward incremental production and sales in notified sectors, and states offer capital subsidies, tax reimbursements and concessional land. Each scheme has eligibility thresholds, investment commitments and disbursement conditions that affect cash flows. The firm models incentive flows realistically, documents compliance requirements, and supports promoters in raising term debt and equity on the strength of a well-founded financial case.',
        ],
      },
      {
        heading: 'Automation and operations',
        body: [
          'Productivity in a new or expanding plant depends on how well equipment, processes and information systems work together. Spine’s technology practice implements industrial automation, enterprise applications and MIS dashboards that give management timely visibility of output, quality and cost. Through its operation and risk advisory practice, the firm also reviews internal controls, procurement and inventory processes for manufacturing businesses.',
        ],
        bullets: [
          'Industrial automation and plant data integration',
          'Enterprise applications and MIS reporting',
          'Process and internal control reviews',
        ],
      },
    ],
    relatedPractices: ['consulting', 'investment-banking', 'technology', 'operations-risk', 'engineering'],
    faqs: [
      {
        q: 'What is a Production Linked Incentive scheme?',
        a: 'A Production Linked Incentive scheme pays eligible manufacturers an incentive linked to incremental sales of goods made in India, over a base year, for a defined period. The Government of India has notified PLI schemes across several sectors, each with its own eligibility criteria, investment thresholds and incentive rates. Applicants must meet these commitments to receive disbursements.',
      },
      {
        q: 'What does a techno-economic feasibility study for a plant include?',
        a: 'A techno-economic feasibility study for a plant covers market demand, capacity and technology selection, location, capital and operating costs, financing structure and projected returns. It also assesses raw material supply, utilities, approvals, applicable incentives and key risks. The study gives promoters, boards and lenders a consistent basis for the investment decision.',
      },
      {
        q: 'How can industrial automation improve plant performance?',
        a: 'Industrial automation improves plant performance by reducing manual intervention, stabilising process quality and capturing operating data in real time. Integrated with MIS and analytics, that data shows management where output, energy use or quality are drifting. The benefit depends on choosing automation that fits the process and on training staff to act on the information.',
      },
      {
        q: 'Does Spine Advisory help raise finance for manufacturing projects?',
        a: 'Yes, Spine Advisory helps promoters raise debt and equity for greenfield and expansion manufacturing projects. The firm prepares the financial model, information memorandum and project documentation, approaches banks, financial institutions and investors, and supports negotiations through to sanction and financial closure.',
      },
    ],
  },
  {
    slug: 'real-estate',
    title: 'Real Estate & Townships',
    shortTitle: 'Real Estate',
    icon: 'apartment',
    tag: 'Commercial & Townships',
    banner: 'urban',
    metaDescription:
      'Advisory for commercial real estate, integrated townships and land monetisation in India: feasibility, valuation, structuring and finance.',
    summary:
      'Market assessment, valuation, structuring and financing for commercial projects, townships and public land monetisation.',
    answer:
      'Spine Advisory advises developers, investors and public landowners on commercial real estate, integrated townships and land monetisation. The firm prepares market and feasibility studies, valuations and financial models, structures joint development and PPP arrangements, and supports debt and equity raising within the RERA and REIT frameworks.',
    highlights: [
      'Market studies and highest-and-best-use analysis',
      'Feasibility, valuation and financial modelling',
      'Joint development and public land monetisation structuring',
      'Project finance and capital raising',
    ],
    sections: [
      {
        heading: 'Market and feasibility analysis',
        body: [
          'Real estate returns depend on absorption, pricing and timing, all of which vary sharply by micro-market. A credible feasibility study tests the development mix against comparable supply, demand drivers and infrastructure that will change accessibility, such as new metro lines or highways. Spine undertakes market assessments, highest-and-best-use studies and phased financial models for commercial, residential and mixed-use projects and integrated townships.',
        ],
      },
      {
        heading: 'Public land monetisation and joint development',
        body: [
          'Public agencies hold substantial land around stations, depots, ports and urban centres. Monetising it through long leases, joint development or PPP can fund infrastructure, but requires transparent valuation and well-designed bid processes. The firm advises authorities on valuation, structuring and bid process management, and advises private developers on evaluating and bidding for such opportunities.',
        ],
      },
      {
        heading: 'Regulation and capital',
        body: [
          'The Real Estate (Regulation and Development) Act, 2016 requires project registration, escrow of a share of collections and disclosure to buyers, which affects cash flow planning. For income-generating assets, SEBI’s REIT regulations provide a route to institutional and retail capital. Spine models RERA-compliant cash flows, assesses asset suitability for REIT or other investor structures, and supports developers in raising construction finance and equity.',
        ],
        bullets: [
          'RERA escrow and cash flow planning',
          'Lease-rental discounting and construction finance',
          'Readiness assessment for REIT and platform investors',
        ],
      },
    ],
    relatedPractices: ['consulting', 'investment-banking', 'engineering'],
    faqs: [
      {
        q: 'How does RERA affect real estate project finance?',
        a: 'RERA affects project finance by requiring developers to deposit a specified share of buyer collections in a dedicated project account and use it only for that project’s land and construction costs. This limits the transfer of funds between projects, so each project needs its own funding plan. Registration and disclosure requirements also shape the launch timeline.',
      },
      {
        q: 'What is public land monetisation?',
        a: 'Public land monetisation is the process by which government agencies generate value from surplus or under-used land through long-term leases, joint development or PPP arrangements, rather than outright sale. Proceeds can fund infrastructure or operations. Good practice requires an independent valuation, a clear development framework and a transparent competitive bid process.',
      },
      {
        q: 'What is a highest-and-best-use study?',
        a: 'A highest-and-best-use study identifies the development option for a site that is legally permissible, physically possible, financially feasible and produces the highest value. It compares alternatives such as office, retail, residential, hospitality or mixed use against market demand and planning controls. The result guides land pricing, development mix and phasing decisions.',
      },
      {
        q: 'When is a commercial asset suitable for a REIT?',
        a: 'A commercial asset is suitable for a REIT when it is completed, substantially leased and generates stable rental income. Investors also look for clear title, quality tenants, reasonable lease tenure and professional management. SEBI’s REIT regulations set conditions on asset composition and distributions, so developers should assess readiness well before a listing.',
      },
    ],
  },
  {
    slug: 'logistics-transportation',
    title: 'Logistics & Transportation',
    shortTitle: 'Logistics & Transportation',
    icon: 'warehouse',
    tag: 'Freight & Supply Chain',
    banner: 'logistics',
    metaDescription:
      'Advisory for logistics and transportation businesses in India: warehousing, cold chain, ICDs, multimodal logistics parks and freight fleets, aligned with NLP 2022.',
    summary:
      'Market assessment, feasibility, financing and operational advisory for warehousing, cold chain, ICDs, logistics parks and transport operators.',
    answer:
      'Spine Advisory helps developers, transport operators, investors and public agencies evaluate, finance and run logistics and transportation businesses. The firm assesses demand, location and economics for Grade-A warehousing, cold chain facilities, inland container depots and multimodal logistics parks, advises fleet and freight operators on costs, controls and capital, and aligns projects with the National Logistics Policy, 2022 and the PM Gati Shakti National Master Plan.',
    highlights: [
      'Market and location studies for Grade-A warehousing',
      'Cold chain feasibility and business model assessment',
      'ICD and CFS feasibility, approvals and financial modelling',
      'PPP structuring for multimodal logistics parks',
      'Capital raising and investor documentation for logistics platforms',
      'Cost, controls and fleet financing advisory for transport operators',
    ],
    sections: [
      {
        heading: 'Policy context: NLP 2022 and PM Gati Shakti',
        body: [
          'The National Logistics Policy, 2022 aims to reduce logistics costs, improve India’s logistics performance and build a data-driven decision support system. It works alongside the PM Gati Shakti National Master Plan, launched in 2021, which brings infrastructure planning by multiple ministries onto a common geospatial platform. For investors, these initiatives make it easier to identify where new road, rail and port capacity is planned, and to locate logistics assets accordingly.',
        ],
      },
      {
        heading: 'Warehousing and cold chain',
        body: [
          'Demand for Grade-A warehousing is driven by manufacturing, e-commerce and the consolidation that followed GST. Location, land title, zoning and access to highways and rail determine lease-up and rentals. Cold chain projects add the complexity of energy costs, utilisation and specialised operations. Spine prepares market studies, site evaluations and financial models for warehousing parks and cold chain facilities, and supports developers in structuring build-to-suit and multi-tenant offerings.',
        ],
      },
      {
        heading: 'ICDs and multimodal logistics parks',
        body: [
          'Inland container depots and container freight stations bring customs clearance closer to shippers, while multimodal logistics parks combine rail, road and warehousing at a single location. Several MMLPs are being developed on PPP terms by National Highways Logistics Management Limited and other agencies. The firm assesses cargo catchments, modal mix and phasing, prepares feasibility reports and bid-stage financial models, and supports bidders and authorities through the transaction process.',
        ],
        bullets: [
          'Container and bulk cargo catchment analysis',
          'Rail siding and road access assessment',
          'Phasing, capital cost and tariff modelling',
          'Bid process support for PPP logistics parks',
        ],
      },
      {
        heading: 'Transportation and freight operators',
        body: [
          'Road transport and freight businesses operate on thin margins, where fuel, tyres, maintenance, driver costs and asset utilisation decide profitability. Spine works with transport operators and logistics service providers on cost analysis and cost minimisation, internal controls over fuel and trip expenses, contract management with shippers, and the financing of fleet expansion and replacement through term loans or asset-backed facilities.',
        ],
        bullets: [
          'Trip and route-level cost and margin analysis',
          'Internal controls and SOPs for fuel, maintenance and claims',
          'Fleet expansion business plans and debt syndication',
          'MIS and analytics dashboards for fleet utilisation',
        ],
      },
    ],
    relatedPractices: ['consulting', 'operations-risk', 'investment-banking', 'engineering', 'technology'],
    faqs: [
      {
        q: 'What is the National Logistics Policy, 2022?',
        a: 'The National Logistics Policy, 2022 is the Government of India’s framework for reducing logistics costs and improving the efficiency of freight movement. Launched in September 2022, it covers digital integration through platforms such as the Unified Logistics Interface Platform, standardisation, skills, and state-level logistics plans, and it complements infrastructure planning under the PM Gati Shakti National Master Plan.',
      },
      {
        q: 'What is a multimodal logistics park?',
        a: 'A multimodal logistics park is a facility that combines at least two modes of freight transport, typically rail and road, with warehousing, container handling and value-added services. By consolidating cargo at a single node, MMLPs aim to lower transport costs and shift freight to rail. In India, several are being developed on PPP terms on national highway corridors.',
      },
      {
        q: 'How do you assess a location for a Grade-A warehouse?',
        a: 'Assessing a Grade-A warehouse location starts with demand: the manufacturing, retail and e-commerce activity the site can serve. Other factors include highway and rail access, land title and zoning, availability of labour and power, prevailing rentals and vacancy, and planned infrastructure under PM Gati Shakti. These inputs feed a financial model that tests lease-up and returns.',
      },
      {
        q: 'What is the difference between an ICD and a CFS?',
        a: 'An inland container depot is a self-contained customs station located away from a port, handling both import and export containers and often connected by rail. A container freight station is usually located near a port and is used mainly for stuffing, de-stuffing and aggregation of cargo. Both require customs notification and appropriate approvals.',
      },
    ],
  },
];
