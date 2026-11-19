import type { Sector } from './types';

// Frontier strategic pillars. These are advisory offerings where the firm applies
// its structuring, financial and engineering skills; they are not past track record.

export const pillars: Sector[] = [
  {
    slug: 'semiconductors',
    title: 'Semiconductor Ecosystem Strategy',
    shortTitle: 'Semiconductors',
    icon: 'memory',
    tag: 'ISM Scheme',
    banner: 'semiconductor',
    metaDescription:
      'Advisory for semiconductor fabs, ATMP/OSAT units and supporting infrastructure in India under the India Semiconductor Mission.',
    summary:
      'Feasibility, incentive structuring, site infrastructure and financing advice for semiconductor and electronics projects.',
    answer:
      'Spine Advisory offers feasibility, financial structuring and infrastructure advisory for investors and state governments pursuing semiconductor and electronics projects. The firm applies its project finance, techno-economic analysis and engineering capabilities to fab, display, ATMP and OSAT proposals, including the evaluation of support available under the India Semiconductor Mission and state policies.',
    highlights: [
      'Techno-economic feasibility for fab, ATMP and OSAT proposals',
      'Assessment of central and state fiscal support and its cash flow impact',
      'Site, utility and logistics infrastructure planning for semiconductor clusters',
      'Financial modelling and capital raising for supply chain participants',
    ],
    sections: [
      {
        heading: 'The policy framework',
        body: [
          'The India Semiconductor Mission, set up under the Ministry of Electronics and Information Technology, administers the programme for development of semiconductor and display manufacturing approved in December 2021. It covers semiconductor fabs, display fabs, compound semiconductors and sensors, ATMP and OSAT facilities, and a Design Linked Incentive scheme for chip design. Several states have notified semiconductor policies that add capital subsidies, power tariff concessions and land support on top of central assistance.',
        ],
      },
      {
        heading: 'Feasibility and incentive structuring',
        body: [
          'Semiconductor projects are capital-intensive, with long ramp-up periods and demanding technology partnerships. Central support is typically disbursed pari-passu with project expenditure and is conditional on milestones, so the timing of incentive inflows has a direct bearing on funding requirements. Spine prepares techno-economic feasibility studies and financial models that integrate central and state support, technology licensing, capacity ramp-up and working capital, giving promoters and boards a realistic view of funding needs and returns.',
        ],
      },
      {
        heading: 'Cluster infrastructure',
        body: [
          'Fabs and assembly units need uninterrupted power, large volumes of ultra-pure water, specialty gases, effluent treatment and reliable logistics. These requirements usually exceed what conventional industrial parks provide, and states competing for investment must plan shared infrastructure ahead of anchor tenants. Drawing on its infrastructure and engineering practices, Spine helps state agencies and park developers plan, phase and structure the utilities and logistics that semiconductor clusters require.',
        ],
        bullets: [
          'Power reliability and redundancy planning',
          'Water sourcing, recycling and effluent treatment',
          'Industrial park structuring and PPP options',
          'Logistics links to airports and ports',
        ],
      },
      {
        heading: 'The wider supply chain',
        body: [
          'Beyond fabs, the ecosystem includes chemicals and gases, equipment servicing, substrates, testing and electronics manufacturing. Many of these are mid-sized investments where a clear business plan and financing strategy determine whether a promoter can participate. The firm supports such suppliers with market assessment, project reports, incentive evaluation and debt and equity raising.',
        ],
      },
    ],
    relatedPractices: ['consulting', 'investment-banking', 'engineering', 'technology'],
    faqs: [
      {
        q: 'What is the India Semiconductor Mission?',
        a: 'The India Semiconductor Mission is the specialised unit under the Ministry of Electronics and Information Technology that administers India’s programme for semiconductor and display manufacturing. The programme, approved in December 2021, supports semiconductor fabs, display fabs, compound semiconductor and sensor units, ATMP and OSAT facilities, and chip design through the Design Linked Incentive scheme.',
      },
      {
        q: 'What is the difference between a fab and an OSAT facility?',
        a: 'A fab manufactures semiconductor wafers by building integrated circuits through a long sequence of processing steps, while an OSAT facility assembles, packages and tests the chips cut from those wafers. Fabs require far higher capital investment and more demanding utilities. OSAT and ATMP units are smaller, faster to build and are often the first step in developing a regional ecosystem.',
      },
      {
        q: 'How do state semiconductor policies interact with central support?',
        a: 'State semiconductor policies generally add to central support rather than replace it. States may offer capital subsidies, concessional land, power and water tariff concessions, and stamp duty or electricity duty exemptions. Because combined incentives and their conditions vary by state, promoters should model each location’s package alongside infrastructure readiness before choosing a site.',
      },
      {
        q: 'How can Spine Advisory support a semiconductor project?',
        a: 'Spine Advisory can support a semiconductor project with techno-economic feasibility studies, financial models that integrate central and state incentives, and debt and equity raising. For state agencies and park developers, the firm can advise on planning and structuring shared infrastructure such as power, water and effluent treatment that semiconductor clusters require.',
      },
    ],
  },
  {
    slug: 'ai-adoption',
    title: 'Enterprise AI/ML Sectoral Adoption',
    shortTitle: 'AI Adoption',
    icon: 'psychology',
    tag: 'Public DPI',
    metaDescription:
      'Advisory for AI and machine learning adoption by Indian enterprises and public agencies, built on digital public infrastructure and sound data governance.',
    summary:
      'Use-case prioritisation, data readiness, implementation and governance for AI adoption in infrastructure and public services.',
    answer:
      'Spine Advisory helps infrastructure companies and public agencies identify where AI and machine learning can improve decisions, and implement them with appropriate governance. The firm combines its sector knowledge with its technology practice’s work in enterprise applications, analytics and MIS to move from use-case assessment to working systems.',
    highlights: [
      'AI use-case identification and business case assessment',
      'Data readiness reviews and analytics foundations',
      'Integration with digital public infrastructure and enterprise systems',
      'Governance, data protection and risk controls for AI deployments',
    ],
    sections: [
      {
        heading: 'Where AI adds value in infrastructure',
        body: [
          'Infrastructure owners and operators generate large volumes of operational data: traffic counts, toll transactions, asset condition surveys, energy consumption and maintenance records. Machine learning can improve demand forecasting, predict maintenance needs, detect revenue leakage and support inspection through image analysis. Spine helps organisations rank such use cases by value, data availability and implementation effort, so that early projects deliver measurable results.',
        ],
        bullets: [
          'Traffic and demand forecasting',
          'Predictive maintenance of assets',
          'Toll and revenue anomaly detection',
          'Document processing for contracts and claims',
        ],
      },
      {
        heading: 'Building on digital public infrastructure',
        body: [
          'India’s digital public infrastructure, including Aadhaar, UPI, DigiLocker and the Account Aggregator framework, provides identity, payments and consented data-sharing layers that public and private services can build on. The IndiaAI Mission adds compute access, datasets and support for AI development. The firm advises agencies and enterprises on designing AI-enabled services that integrate with these platforms rather than duplicating them.',
        ],
      },
      {
        heading: 'Data readiness and implementation',
        body: [
          'Most AI initiatives stall on data rather than algorithms. Records are often fragmented across systems, inconsistently coded or unavailable at the frequency a model needs. A data readiness review identifies these gaps before investment is committed. Spine’s technology practice builds the enterprise applications, data pipelines and MIS dashboards that AI systems depend on, and implements models within existing workflows so that outputs reach the people who make decisions.',
        ],
      },
      {
        heading: 'Governance and data protection',
        body: [
          'The Digital Personal Data Protection Act, 2023 sets obligations for processing personal data, including consent, purpose limitation and security safeguards. AI systems that use citizen or customer data must be designed with these obligations in mind. Through its operation and risk advisory practice, Spine helps organisations put in place policies, controls and review processes for model accuracy, bias, accountability and data protection.',
        ],
      },
    ],
    relatedPractices: ['technology', 'consulting', 'operations-risk'],
    faqs: [
      {
        q: 'What is digital public infrastructure?',
        a: 'Digital public infrastructure refers to shared, interoperable digital systems that provide identity, payments and data exchange at population scale. In India, examples include Aadhaar for identity, UPI for payments, DigiLocker for documents and the Account Aggregator framework for consented financial data sharing. Public and private services can build on these layers instead of creating their own.',
      },
      {
        q: 'Where should an infrastructure company start with AI?',
        a: 'An infrastructure company should start with a use case where data already exists and the decision it supports is clearly valuable. Demand forecasting, predictive maintenance and revenue anomaly detection are common starting points. A short data readiness review and a defined success measure help confirm feasibility before larger investment in platforms or models.',
      },
      {
        q: 'How does the DPDP Act affect AI projects?',
        a: 'The Digital Personal Data Protection Act, 2023 affects AI projects that process personal data by requiring a lawful basis such as consent, limiting use to specified purposes and mandating reasonable security safeguards. Organisations must also honour data principal rights. AI projects should map personal data flows and build these obligations into system design from the outset.',
      },
      {
        q: 'What does Spine Advisory offer in AI adoption?',
        a: 'Spine Advisory offers use-case assessment, data readiness reviews, implementation and governance support for AI adoption. The firm’s technology practice builds enterprise applications, analytics and MIS that AI systems rely on, while its operation and risk practice helps establish controls for model risk and data protection. The focus is on practical, measurable deployments.',
      },
    ],
  },
  {
    slug: 'export-trade-corridors',
    title: 'Export Transformation & Trade Corridors',
    shortTitle: 'Trade Corridors',
    icon: 'public',
    tag: 'FTP & Logistics',
    banner: 'port-dusk',
    metaDescription:
      'Advisory for export-oriented infrastructure, trade corridors and district export strategies in India under the Foreign Trade Policy 2023.',
    summary:
      'Export strategy, trade infrastructure planning and project structuring linked to the Foreign Trade Policy and logistics reforms.',
    answer:
      'Spine Advisory helps state governments, industrial agencies and exporters plan and structure the infrastructure that export growth depends on. The firm brings its logistics, ports and financial structuring capabilities to export hub strategies, trade corridor projects and export-oriented manufacturing, framed by the Foreign Trade Policy 2023 and the National Logistics Policy, 2022.',
    highlights: [
      'District and state export strategy and infrastructure gap analysis',
      'Feasibility of export-linked logistics, ICDs and port connectivity',
      'Assessment of trade agreements and their effect on sector competitiveness',
      'Structuring and financing of export-oriented industrial projects',
    ],
    sections: [
      {
        heading: 'The policy framework',
        body: [
          'The Foreign Trade Policy 2023, effective from 1 April 2023, shifts emphasis from incentives towards remission of duties, trade facilitation and collaboration with states and districts. Its Districts as Export Hubs initiative asks districts to identify export products and the infrastructure and services needed to grow them. Trade agreements such as the India–UAE CEPA and the India–Australia ECTA change tariff conditions for specific products, creating opportunities that depend on supply chain and logistics readiness.',
        ],
      },
      {
        heading: 'Export hub and corridor strategy',
        body: [
          'Export competitiveness depends on the whole chain: production clusters, testing and certification, inland logistics, customs clearance and port or airport capacity. Bottlenecks at any point raise costs and reduce reliability for buyers. Spine assesses this chain for priority products and regions, identifies infrastructure gaps, and prepares project concepts and feasibility studies for common facilities, ICDs, cargo terminals and connectivity links.',
        ],
        bullets: [
          'Cluster mapping and product prioritisation',
          'Logistics cost and transit time analysis',
          'Common facility and testing infrastructure concepts',
        ],
      },
      {
        heading: 'International trade corridors',
        body: [
          'Proposed corridors such as the India–Middle East–Europe Economic Corridor and the International North–South Transport Corridor aim to create new multimodal routes linking India with partner regions. Their value to Indian exporters will depend on port, rail and customs infrastructure at the Indian end. The firm helps agencies and investors evaluate port-linked and gateway infrastructure in the context of these corridors, using the same feasibility and structuring methods it applies to domestic projects.',
        ],
      },
    ],
    relatedPractices: ['consulting', 'investment-banking', 'engineering'],
    faqs: [
      {
        q: 'What is the Foreign Trade Policy 2023?',
        a: 'The Foreign Trade Policy 2023 is India’s framework for promoting exports, which came into effect on 1 April 2023. Unlike earlier policies, it has no fixed end date and is updated as needed. It emphasises remission of duties over direct incentives, trade facilitation, e-commerce exports, and partnership with states and districts through the Districts as Export Hubs initiative.',
      },
      {
        q: 'What is the Districts as Export Hubs initiative?',
        a: 'Districts as Export Hubs is an initiative under the Foreign Trade Policy that asks each district to identify products and services with export potential and prepare a district export action plan. The plan addresses infrastructure, logistics, testing and skill gaps, with support from state export promotion committees and district-level institutions.',
      },
      {
        q: 'What is the India–Middle East–Europe Economic Corridor?',
        a: 'The India–Middle East–Europe Economic Corridor is a proposed multimodal connectivity initiative announced in September 2023 during India’s G20 presidency. It envisages shipping and rail links connecting India with the Arabian Gulf and onward to Europe, along with energy and digital connectivity. Its implementation will depend on agreements and investment among participating countries.',
      },
      {
        q: 'How does Spine Advisory support export infrastructure?',
        a: 'Spine Advisory supports export infrastructure by analysing logistics chains for priority products, identifying gaps, and preparing feasibility studies and financial structures for projects such as ICDs, cargo terminals, common facility centres and port connectivity. The firm also helps exporters raise finance for export-oriented manufacturing investments.',
      },
    ],
  },
  {
    slug: 'green-energy',
    title: 'Green Energy & Decarbonisation',
    shortTitle: 'Green Energy',
    icon: 'eco',
    tag: 'Green Hydrogen Mission',
    metaDescription:
      'Advisory for green hydrogen, renewable energy and decarbonisation projects in India: feasibility, structuring, offtake and finance.',
    summary:
      'Feasibility, structuring and financing advice for green hydrogen, renewables and industrial decarbonisation.',
    answer:
      'Spine Advisory offers feasibility, financial structuring and transaction advisory for green hydrogen, renewable energy and decarbonisation projects. The firm applies the project finance, bid management and engineering skills it uses in infrastructure to help developers, industrial users and public agencies evaluate projects under the National Green Hydrogen Mission and related policies.',
    highlights: [
      'Techno-economic feasibility for green hydrogen and derivative projects',
      'Bid support and financial modelling for incentive and offtake tenders',
      'Renewable power sourcing and open access assessment',
      'Decarbonisation roadmaps and carbon market readiness',
      'Debt and equity raising for clean energy assets',
    ],
    sections: [
      {
        heading: 'National Green Hydrogen Mission',
        body: [
          'The National Green Hydrogen Mission, approved in January 2023, aims to make India a global hub for the production, use and export of green hydrogen and its derivatives, with a target of at least 5 million tonnes of annual production by 2030. Its SIGHT programme supports domestic electrolyser manufacturing and green hydrogen production through competitively bid incentives. Projects are also expected to benefit from green hydrogen hubs and pilot programmes in steel, mobility and shipping.',
        ],
      },
      {
        heading: 'Project economics and structuring',
        body: [
          'The cost of green hydrogen is dominated by the cost and availability of round-the-clock renewable power and by electrolyser capital cost and utilisation. Offtake is the other critical variable: fertiliser, refining, steel and export ammonia buyers each bring different contract terms and credit profiles. Spine builds integrated models that link renewable generation, storage, electrolyser sizing and offtake, and uses them to support bids, investment decisions and lender discussions.',
        ],
        bullets: [
          'Renewable power and storage sizing',
          'Electrolyser capacity and utilisation analysis',
          'Offtake structuring and credit assessment',
          'Incentive bid modelling',
        ],
      },
      {
        heading: 'Renewables and industrial decarbonisation',
        body: [
          'Industrial users are increasingly sourcing renewable power through open access, captive and group captive arrangements under the Green Energy Open Access Rules, 2022. At the same time, the Carbon Credit Trading Scheme, 2023 establishes a domestic compliance and offset market that will affect emission-intensive sectors. The firm helps companies assess power sourcing options, prepare decarbonisation roadmaps with costed measures, and understand their likely position under the emerging carbon market.',
        ],
      },
    ],
    relatedPractices: ['consulting', 'investment-banking', 'engineering', 'operations-risk'],
    faqs: [
      {
        q: 'What is the National Green Hydrogen Mission?',
        a: 'The National Green Hydrogen Mission is the Government of India’s programme, approved in January 2023, to develop production, use and export of green hydrogen and its derivatives. It targets at least 5 million tonnes of annual green hydrogen production by 2030 and includes the SIGHT programme for electrolyser manufacturing and hydrogen production incentives, pilot projects and hub development.',
      },
      {
        q: 'What is the SIGHT programme?',
        a: 'SIGHT, or Strategic Interventions for Green Hydrogen Transition, is the financial incentive component of the National Green Hydrogen Mission. It provides separate incentive mechanisms for domestic manufacturing of electrolysers and for production of green hydrogen and its derivatives. Incentives are awarded through competitive selection processes run by designated implementing agencies.',
      },
      {
        q: 'What drives the cost of green hydrogen?',
        a: 'The cost of green hydrogen is driven mainly by the price and reliability of renewable electricity, which is the largest input, and by electrolyser capital cost and utilisation. Storage, water treatment, transmission charges and financing costs also matter. Projects that secure low-cost, high-availability renewable power and steady offtake achieve the most competitive production costs.',
      },
      {
        q: 'How can Spine Advisory support a green energy project?',
        a: 'Spine Advisory can support a green energy project with techno-economic feasibility, integrated financial models, bid preparation for incentive and offtake tenders, and debt and equity raising. For industrial users, the firm can assess renewable sourcing through open access or captive structures and prepare decarbonisation roadmaps that set out costed measures and their financial impact.',
      },
    ],
  },
];
