import type { Sector } from './types';

// Core infrastructure sectors. Content describes what Spine Advisory offers;
// it deliberately makes no claims about specific past mandates or outcomes.

export const sectors: Sector[] = [
  {
    slug: 'roads-highways',
    title: 'Roads & Highways',
    shortTitle: 'Roads',
    icon: 'add_road',
    tag: 'NH & State Highways',
    banner: 'roads',
    metaDescription:
      'Transaction advisory, traffic studies, DPRs and HAM, BOT and EPC structuring for national and state highway projects in India.',
    summary:
      'Structuring, bidding, engineering and lifecycle support for highway projects under HAM, BOT and EPC models.',
    answer:
      'Spine Advisory supports highway developers, contractors and authorities across the project lifecycle, from traffic studies and feasibility to bid management, financial closure and operations. The firm structures and evaluates projects under the Hybrid Annuity Model, BOT (Toll and Annuity) and EPC, and provides toll revenue audits, annuity reconciliation and dispute support once projects are in operation.',
    highlights: [
      'Bid process management and financial modelling for HAM, BOT-Toll, BOT-Annuity and EPC projects',
      'Traffic surveys, demand forecasting and toll revenue assessment',
      'Feasibility studies, DPRs, detailed design and proof checking',
      'Toll revenue audits and HAM annuity reconciliation',
      'Claims, change-of-scope and dispute support under concession agreements',
    ],
    sections: [
      {
        heading: 'Choosing and structuring the procurement model',
        body: [
          'The choice between EPC, Hybrid Annuity and BOT determines who carries construction, traffic and financing risk, and therefore what a bidder must price. Under HAM, the authority pays 40 per cent of the bid project cost during construction and the balance is recovered through semi-annual annuities with interest, which shifts traffic risk away from the concessionaire but makes cost of debt and construction efficiency decisive.',
          'Spine Advisory builds bid-stage financial models that test equity returns, debt sizing and annuity cash flows against realistic construction schedules, so that developers bid on numbers they can finance and deliver. For authorities, the firm assesses which model suits a given corridor, prepares bid documents and supports evaluation, so that the procurement route reflects traffic certainty, fiscal capacity and market appetite.',
        ],
      },
      {
        heading: 'Traffic studies and engineering inputs',
        body: [
          'Toll-based projects stand or fall on traffic. The firm undertakes classified traffic volume counts, origin-destination surveys, axle-load surveys and willingness-to-pay assessments, and converts them into growth-adjusted demand forecasts that lenders and independent engineers can review. On the engineering side, Spine prepares feasibility reports and DPRs, carries out detailed design and proof checking of highway and structure designs, and undertakes road safety audits at design and operation stages.',
        ],
        bullets: [
          'Classified traffic volume and origin-destination surveys',
          'Toll plaza location and diversion analysis',
          'Pavement and structure design review',
          'Road safety audits',
        ],
      },
      {
        heading: 'Construction, operations and concession management',
        body: [
          'After financial close, value is protected or lost through concession management. Spine provides project management consultancy and construction supervision, and supports concessionaires in tracking milestones, change-of-scope claims and completion certification. For operating assets, the firm conducts toll revenue audits that reconcile transaction data with collections, and reconciles HAM annuity, interest and O&M payments against concession terms. Where differences arise, Spine prepares the financial analysis and documentation that underpin claims, conciliation and arbitration.',
        ],
      },
    ],
    relatedPractices: ['consulting', 'engineering', 'operations-risk', 'investment-banking'],
    faqs: [
      {
        q: 'What is the Hybrid Annuity Model in Indian highway projects?',
        a: 'The Hybrid Annuity Model is a PPP structure in which the authority funds 40 per cent of the bid project cost during construction and the concessionaire funds the remaining 60 per cent. The concessionaire recovers its share through semi-annual annuities with interest, plus O&M payments, over the operations period. Toll collection remains with the authority, so the concessionaire does not carry traffic risk.',
      },
      {
        q: 'How is HAM different from BOT-Toll?',
        a: 'The main difference is who bears traffic risk. Under BOT-Toll, the concessionaire finances the project and recovers its investment from toll collections, so revenue depends on actual traffic. Under HAM, the authority collects tolls and pays the concessionaire fixed annuities, which reduces revenue uncertainty but makes construction cost, schedule and financing terms the main drivers of returns.',
      },
      {
        q: 'What does a toll revenue audit involve?',
        a: 'A toll revenue audit checks whether recorded collections match the traffic that actually used the plaza. It typically reconciles electronic toll collection data, lane-wise transaction logs, exempt-vehicle records and cash deposits, and reviews system controls for leakage. The findings help concessionaires, authorities and lenders confirm revenue integrity and identify process gaps.',
      },
      {
        q: 'Can Spine Advisory support disputes under a concession agreement?',
        a: 'Yes, Spine Advisory provides the financial and technical analysis that supports claims and disputes under highway concession agreements. This includes quantifying change-of-scope and delay claims, reconciling annuity and interest payments, and preparing documentation for conciliation or arbitration. The firm works alongside the client’s legal counsel rather than in place of it.',
      },
    ],
  },
  {
    slug: 'ports-waterways',
    title: 'Ports & Waterways',
    shortTitle: 'Ports',
    icon: 'directions_boat',
    tag: 'Sagarmala Initiative',
    banner: 'ports',
    metaDescription:
      'Advisory for port modernisation, berth concessions, coastal economic zones and inland waterway terminals under Sagarmala in India.',
    summary:
      'Feasibility, PPP structuring and transaction support for berths, terminals, coastal economic zones and inland waterway hubs.',
    answer:
      'Spine Advisory advises port authorities, terminal operators and investors on port modernisation, berth and terminal concessions, and inland waterway projects. The firm prepares feasibility studies and financial models, manages PPP bid processes, and assesses projects in the context of Sagarmala, Coastal Economic Zones and the Major Port Authorities Act, 2021.',
    highlights: [
      'Feasibility and traffic studies for berths, terminals and port-led industrial clusters',
      'PPP structuring and bid process management for berth concessions',
      'Advisory on Coastal Economic Zones and port-linked logistics',
      'Inland waterway terminal and multimodal hub assessment',
    ],
    sections: [
      {
        heading: 'Port modernisation and berth concessions',
        body: [
          'Capacity additions at major ports are largely delivered through PPP concessions for berths and terminals, governed by model concession agreements and the tariff framework that applies to the port. Bidders must form a view on cargo mix, hinterland competition, revenue share and capital phasing well before the bid date. Spine prepares cargo traffic assessments, techno-economic feasibility reports and bid-stage financial models, and supports authorities and bidders through RFQ, RFP and evaluation stages.',
        ],
      },
      {
        heading: 'Sagarmala and Coastal Economic Zones',
        body: [
          'The Sagarmala programme aims to promote port-led development by modernising ports, improving port connectivity, supporting port-linked industrialisation and developing coastal communities. Coastal Economic Zones are a central element, linking ports with industrial clusters in their hinterland. The firm helps state agencies and developers assess the economic case for port-linked industrial parks, last-mile road and rail connectivity, and the phasing and financing of shared infrastructure within these zones.',
        ],
      },
      {
        heading: 'Governance under the Major Port Authorities Act',
        body: [
          'The Major Port Authorities Act, 2021 replaced the Major Port Trusts Act, 1963 and gave boards of major port authorities greater autonomy, including over tariff setting for their services and the framework for PPP projects. This changes how concessionaires negotiate commercial terms and how authorities plan capital programmes. Spine supports authorities and operators in reviewing commercial structures, tariff assumptions and contract terms under the new framework.',
        ],
      },
      {
        heading: 'Inland waterways and multimodal terminals',
        body: [
          'The National Waterways Act, 2016 declared 111 national waterways, and the Inland Waterways Authority of India is developing terminals and fairways on priority routes. Viable inland water transport depends on assured draught, terminal efficiency and road or rail links at both ends. Spine assesses cargo potential, terminal configuration and operator models for inland waterway hubs, and evaluates how they integrate with rail, road and coastal shipping.',
        ],
      },
    ],
    relatedPractices: ['consulting', 'engineering', 'investment-banking'],
    faqs: [
      {
        q: 'What is the Sagarmala programme?',
        a: 'Sagarmala is the Government of India’s flagship programme for port-led development, administered by the Ministry of Ports, Shipping and Waterways. It covers port modernisation and new port development, port connectivity by road, rail and waterways, port-linked industrialisation including Coastal Economic Zones, and coastal community development. Projects are delivered through central agencies, states, port authorities and private partners.',
      },
      {
        q: 'What changed under the Major Port Authorities Act, 2021?',
        a: 'The Major Port Authorities Act, 2021 replaced the Major Port Trusts Act, 1963 and converted major port trusts into port authorities with more autonomous boards. Boards can set tariffs for their own services and assets, and PPP operators can set tariffs based on market conditions within the concession framework. The Act also provides for an adjudicatory board to address disputes.',
      },
      {
        q: 'How does Spine Advisory help with a berth concession bid?',
        a: 'Spine Advisory helps bidders and authorities by preparing cargo traffic studies, techno-economic feasibility and bid-stage financial models for berth concessions. For bidders, the firm tests revenue share, capital phasing and financing assumptions against realistic throughput. For authorities, it supports bid documentation, evaluation and transaction management through to award.',
      },
      {
        q: 'Are inland waterway terminals commercially viable?',
        a: 'Inland waterway terminals can be viable where there is assured navigable draught, steady bulk or container cargo and efficient road or rail connections at both ends. Viability is weaker on routes with seasonal draught or fragmented cargo. A feasibility study should test cargo commitments, operating costs and modal competition before an operator model is chosen.',
      },
    ],
  },
  {
    slug: 'railways',
    title: 'Railways',
    shortTitle: 'Railways',
    icon: 'train',
    tag: 'Freight Corridors',
    banner: 'railways',
    metaDescription:
      'Advisory for DFC feeder routes, Gati Shakti Cargo Terminals, private sidings and station redevelopment projects in India.',
    summary:
      'Feasibility, structuring and engineering support for freight terminals, DFC-linked infrastructure and station redevelopment.',
    answer:
      'Spine Advisory helps logistics operators, industrial users and public agencies plan and structure rail-linked infrastructure. The firm assesses freight terminals and sidings under the Gati Shakti Cargo Terminal policy, evaluates feeder connectivity to the Dedicated Freight Corridors, and supports station redevelopment projects with commercial, financial and engineering analysis.',
    highlights: [
      'Feasibility and financial models for Gati Shakti Cargo Terminals and private sidings',
      'Demand assessment for DFC feeder and connectivity projects',
      'Commercial and real estate analysis for station redevelopment',
      'Detailed engineering, proof checking and PMC for rail-linked works',
    ],
    sections: [
      {
        heading: 'Dedicated Freight Corridors and feeder connectivity',
        body: [
          'The Eastern and Western Dedicated Freight Corridors, built by DFCCIL, create high-capacity freight paths that free capacity on the existing network. The benefit to shippers depends on how well terminals, sidings and feeder routes connect industrial clusters to the corridors. Spine assesses cargo catchments, modal shift potential and the economics of feeder connectivity, helping developers and agencies decide where rail-linked logistics capacity makes commercial sense.',
        ],
      },
      {
        heading: 'Gati Shakti Cargo Terminals and private sidings',
        body: [
          'Indian Railways’ Gati Shakti Multi-Modal Cargo Terminal policy simplified the process for building cargo terminals on railway or private land, replacing earlier private freight terminal and siding policies. Investors must still evaluate land, connectivity charges, traffic guarantees and operating costs carefully. The firm prepares techno-economic feasibility reports, financial models and approval documentation, and supports detailed design and construction supervision of terminal and siding works.',
        ],
        bullets: [
          'Cargo demand and catchment analysis',
          'Terminal layout and capacity assessment',
          'Capital cost, tariff and return analysis',
          'Approval documentation and engineering review',
        ],
      },
      {
        heading: 'Station redevelopment',
        body: [
          'Station redevelopment programmes aim to upgrade passenger facilities and, in many cases, use surplus railway land for commercial development. The commercial case depends on the local real estate market, phasing of construction around live operations, and the structure under which development rights are granted. Spine provides market assessment, development-mix analysis, financial modelling and transaction support for station redevelopment and associated commercial projects.',
        ],
      },
    ],
    relatedPractices: ['consulting', 'engineering', 'investment-banking'],
    faqs: [
      {
        q: 'What is a Gati Shakti Cargo Terminal?',
        a: 'A Gati Shakti Cargo Terminal is a rail-linked freight terminal developed under Indian Railways’ Gati Shakti Multi-Modal Cargo Terminal policy. The policy allows terminals to be built on railway or non-railway land by private or public parties, with a simplified approval process. It replaced earlier private freight terminal and private siding policies to encourage investment in rail-linked cargo handling.',
      },
      {
        q: 'How do Dedicated Freight Corridors benefit industrial users?',
        a: 'Dedicated Freight Corridors benefit industrial users by offering freight-only rail paths with higher axle loads, longer trains and more predictable transit times. The benefit reaches a plant or warehouse only if it is connected through a siding, terminal or feeder route, so location and last-mile connectivity decisions determine how much value a user can capture.',
      },
      {
        q: 'What does a feasibility study for a rail cargo terminal cover?',
        a: 'A rail cargo terminal feasibility study covers cargo demand, terminal location, layout and capacity, capital and operating costs, and expected tariffs and returns. It also reviews rail connectivity, land, statutory approvals and competing road or terminal options. The output is a bankable assessment that supports the investment decision and the application to the railway authorities.',
      },
      {
        q: 'Does Spine Advisory provide engineering services for railway projects?',
        a: 'Yes, Spine Advisory provides engineering services for rail-linked projects, including feasibility studies, detailed design, proof checking, project management consultancy and construction supervision. These services are typically combined with financial and commercial analysis so that the engineering solution and the business case are developed together.',
      },
    ],
  },
  {
    slug: 'metro-transit',
    title: 'Metro & Urban Transit',
    shortTitle: 'Metro',
    icon: 'subway',
    tag: 'Urban Mobility',
    banner: 'metro',
    metaDescription:
      'Advisory for metro rail, RRTS and LRT projects in India: feasibility, TOD, fare and non-fare revenue, PPP structuring and PMC.',
    summary:
      'Planning, financial structuring and revenue strategy for metro, RRTS and light rail systems.',
    answer:
      'Spine Advisory supports urban transit agencies and private partners on metro rail, regional rapid transit and light rail projects. The firm prepares feasibility and financial analyses, develops fare and non-fare revenue strategies including transit-oriented development, and structures PPP components consistent with the Metro Rail Policy, 2017.',
    highlights: [
      'Feasibility, ridership and alternatives analysis for Metro, RRTS and LRT',
      'Transit-oriented development and value capture assessment',
      'Fare and non-fare revenue strategy',
      'PPP structuring and bid process management for transit components',
      'PMC and construction supervision support',
    ],
    sections: [
      {
        heading: 'Choosing the right mode',
        body: [
          'Not every corridor needs a full metro. Metro rail, RRTS, light rail, Metrolite, Metro Neo and bus rapid transit serve different demand levels, trip lengths and budgets. The Metro Rail Policy, 2017 requires an alternatives analysis and a demonstrated economic case before central assistance is considered. Spine undertakes ridership assessments and alternatives analyses that compare capital cost, operating cost and economic return across modes, so that agencies select a system the city can sustain.',
        ],
      },
      {
        heading: 'Fare and non-fare revenue',
        body: [
          'Most urban transit systems do not recover full costs from fares, which makes non-fare revenue and value capture central to financial sustainability. Advertising, retail, property development, parking and station naming rights can contribute meaningfully if planned at the design stage rather than added later. The firm builds revenue models that combine fare policy, ridership ramp-up and non-fare streams, and tests them against operating and debt service obligations.',
        ],
      },
      {
        heading: 'Transit-oriented development and value capture',
        body: [
          'The National Transit Oriented Development Policy, 2017 and the Value Capture Finance Policy Framework encourage cities to concentrate development around transit corridors and to capture part of the resulting increase in land value. Tools include higher floor area ratios, betterment levies and land monetisation. Spine assesses real estate potential along corridors, quantifies value capture options and helps agencies structure development partnerships around stations and depots.',
        ],
        bullets: [
          'Station-area market assessment',
          'Additional FAR and betterment levy analysis',
          'Land monetisation and development partnership structuring',
        ],
      },
    ],
    relatedPractices: ['consulting', 'engineering', 'investment-banking'],
    faqs: [
      {
        q: 'What does the Metro Rail Policy, 2017 require for new projects?',
        a: 'The Metro Rail Policy, 2017 requires new metro proposals seeking central assistance to include an alternatives analysis, a comprehensive mobility plan, and an assessment of economic returns. It makes a PPP component mandatory for central assistance, encourages transit-oriented development and value capture, and emphasises last-mile connectivity and multimodal integration with other public transport.',
      },
      {
        q: 'What is non-fare revenue in a metro system?',
        a: 'Non-fare revenue is income a metro system earns from sources other than passenger tickets. Common streams include advertising, retail and kiosk leasing, property development on station and depot land, parking, telecom and utility right-of-way, and station naming rights. Planning these streams at the design stage usually yields more than retrofitting them after the system opens.',
      },
      {
        q: 'How is RRTS different from a metro?',
        a: 'RRTS is designed for longer regional trips at higher speeds, while a metro serves shorter trips within a city. Regional rapid transit systems, such as the Delhi–Meerut corridor, have wider station spacing and higher design speeds to connect a metropolitan core with satellite towns. The planning, ridership and financing analysis therefore differs from an intra-city metro.',
      },
      {
        q: 'How can transit-oriented development help fund a metro?',
        a: 'Transit-oriented development helps fund a metro by capturing part of the land value increase that the line creates. Agencies can sell additional floor area, levy betterment charges, or develop and lease station and depot land. These receipts can support capital costs or operating deficits, provided the policy and planning framework is in place before construction.',
      },
    ],
  },
  {
    slug: 'urban-infrastructure',
    title: 'Urban Infrastructure',
    shortTitle: 'Urban',
    icon: 'location_city',
    tag: 'Smart Cities',
    banner: 'urban',
    metaDescription:
      'Advisory for water supply, municipal solid waste, wastewater recycling and municipal bonds for Indian cities and urban local bodies.',
    summary:
      'Project structuring, PPP advisory and financing support for water, waste and municipal infrastructure.',
    answer:
      'Spine Advisory helps urban local bodies, state agencies and private operators plan and finance municipal infrastructure. The firm structures water supply, municipal solid waste and wastewater recycling projects, prepares feasibility and financial analyses, and supports cities in accessing market finance, including municipal bonds.',
    highlights: [
      'Feasibility and PPP structuring for water supply and sewerage projects',
      'Municipal solid waste management project advisory',
      'Wastewater recycling and reuse business models',
      'Credit readiness and municipal bond advisory',
    ],
    sections: [
      {
        heading: 'Water supply and wastewater',
        body: [
          'AMRUT 2.0 focuses on universal water supply coverage and sewerage in mission cities, while Namami Gange has used the Hybrid Annuity Model to procure sewage treatment plants with long-term operations obligations. These programmes have made performance-linked contracts more common in the urban water sector. Spine prepares feasibility studies and DPRs, evaluates procurement options such as EPC with O&M, HAM and performance-based contracts, and models tariffs and operating costs for water and wastewater projects.',
        ],
      },
      {
        heading: 'Municipal solid waste and recycled water',
        body: [
          'Swachh Bharat Mission (Urban) 2.0 has shifted attention from collection to processing, legacy waste remediation and resource recovery. Waste projects succeed when tipping fees, offtake for compost, refuse-derived fuel or power, and land availability are secured before award. Treated wastewater is increasingly sold to industry and power plants. Spine assesses demand, pricing and offtake contracts for recycled water and structures projects so that revenue risk sits with the party best able to manage it.',
        ],
      },
      {
        heading: 'Municipal finance and bonds',
        body: [
          'Municipal bonds, regulated by SEBI’s framework for issue and listing of municipal debt securities, give cities access to capital markets for revenue-generating projects. Issuers need a credit rating, credible project pipelines and sound accounts, and in some cases may qualify for central incentives linked to issuance. Spine helps urban local bodies assess borrowing capacity, improve financial reporting and revenue collection, and prepare the project and financial documentation required for a bond issue.',
        ],
      },
    ],
    relatedPractices: ['consulting', 'engineering', 'investment-banking', 'technology'],
    faqs: [
      {
        q: 'What are municipal bonds in India?',
        a: 'Municipal bonds are debt securities issued by urban local bodies or their entities to raise funds for infrastructure projects. In India they are governed by SEBI regulations on the issue and listing of municipal debt securities. Issuers typically need a credit rating, audited accounts and identified projects, and repayment is often supported by escrowed revenue streams.',
      },
      {
        q: 'How is the Hybrid Annuity Model used in sewage treatment projects?',
        a: 'The Hybrid Annuity Model has been used under Namami Gange to procure sewage treatment plants with long-term operations. The authority pays part of the capital cost during construction and the balance through annuities linked to performance over the operations period. This ties the operator’s payments to plant performance rather than to construction completion alone.',
      },
      {
        q: 'What makes a municipal solid waste project bankable?',
        a: 'A municipal solid waste project is bankable when its revenue streams and inputs are reliable and contractually secured. Key factors include assured waste quantity and quality, a committed tipping fee with payment security, offtake agreements for compost, refuse-derived fuel or power, allotted land and clear environmental approvals. Weakness in any of these usually shows up as delay or default.',
      },
      {
        q: 'Can treated wastewater be a source of revenue for cities?',
        a: 'Yes, treated wastewater can generate revenue when it is sold to industries, power plants or other bulk users under long-term offtake agreements. Viability depends on the distance to buyers, treatment quality required, pipeline costs and the price of competing freshwater sources. A demand and pricing study should precede investment in tertiary treatment and conveyance.',
      },
    ],
  },
];
