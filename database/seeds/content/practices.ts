import type { Practice } from './types';

// The five practices of Spine Advisory. Item ids are the old WordPress URL
// slugs and drive redirects: do not rename them. The old private-equity, venture-capital and
// angle-investment pages now redirect to the single 'investment' item.

export const practices: Practice[] = [
  {
    slug: 'consulting',
    title: 'Consulting',
    icon: 'handshake',
    banner: 'highway-mountains',
    metaDescription:
      'Transaction advisory, project structuring, bid process management and financial modelling for infrastructure projects under HAM, BOT and EPC in India.',
    summary:
      'Structuring, procurement and financial advisory that takes infrastructure projects from concept to an awarded, bankable contract.',
    answer:
      'Consulting and Transaction Advisory at Spine Advisory covers the structuring, procurement and financial analysis of infrastructure projects for government authorities and private developers. The team prepares feasibility and financial models, selects the delivery model across HAM, BOT and EPC, drafts RFQ and RFP documents and concession agreements, and manages the bid process through to award and financial close.',
    tags: ['PPP Structuring', 'Bid Process Management', 'Financial Modelling'],
    items: [
      {
        id: 'transaction-advisory',
        title: 'Transaction Advisory',
        description:
          'End-to-end advice to authorities and developers on bringing an infrastructure project to market. The engagement spans project assessment, choice of delivery model, risk allocation, preparation of tender and contract documents, investor and lender engagement, and support through bid evaluation, negotiation and financial close. The aim is a transaction that is commercially viable for bidders, defensible for the authority and bankable for lenders.',
        deliverables: [
          'Transaction structure report',
          'Risk allocation matrix',
          'Tender and contract documents',
          'Bid evaluation report',
          'Financial close support',
        ],
      },
      {
        id: 'project-structuring',
        title: 'Project Structuring',
        description:
          'Structuring of infrastructure projects under Hybrid Annuity (HAM), Build-Operate-Transfer (BOT Toll and Annuity), EPC and other PPP formats. Spine evaluates revenue streams, payment mechanisms, concession period, viability gap funding requirements and the allocation of construction, traffic and financing risk, and drafts project-specific provisions aligned with the applicable Model Concession Agreement.',
        deliverables: [
          'Delivery model options analysis',
          'Value for money assessment',
          'Concession term sheet',
          'VGF requirement estimate',
        ],
      },
      {
        id: 'bid-process-management',
        title: 'Bid Process Management',
        description:
          'Management of the competitive procurement process on behalf of the authority. This includes drafting RFQ and RFP documents, setting qualification and evaluation criteria, conducting pre-bid meetings, responding to bidder queries, issuing addenda, and evaluating technical and financial bids. A transparent, well-documented process reduces the scope for disputes and supports approval by the competent authority.',
        deliverables: [
          'RFQ and RFP documents',
          'Pre-bid query responses and addenda',
          'Technical and financial evaluation reports',
          'Award recommendation note',
        ],
      },
      {
        id: 'strategy-planning',
        title: 'Strategy & Planning',
        description:
          'Strategic advice for public agencies and infrastructure companies on sector entry, portfolio prioritisation, organisational capability and long-range investment planning. Work typically combines market and policy assessment, competitor and pipeline analysis, and financial capacity review, and concludes in a phased plan with clear decision points, resource requirements and performance indicators that management can track.',
        deliverables: [
          'Market and policy assessment',
          'Project pipeline prioritisation',
          'Business plan',
          'Implementation roadmap',
        ],
      },
      {
        id: 'financial-modelling',
        title: 'Financial Modelling',
        description:
          'Construction of transparent, auditable project finance models for infrastructure assets. Models capture capital cost phasing, construction-period funding, revenue or annuity streams, operations and maintenance costs, debt sizing and repayment, taxation and returns to equity. Sensitivity and scenario analysis tests the project against traffic, cost, interest rate and schedule variations, supporting bid pricing, lender appraisal and authority decision-making.',
        deliverables: [
          'Project finance model',
          'Model assumptions book',
          'Sensitivity and scenario analysis',
          'Debt sizing and coverage ratios',
        ],
      },
      {
        id: 'economic-analysis',
        title: 'Economic Analysis',
        description:
          'Assessment of the economic case for public infrastructure, distinct from its financial return to an investor. Spine quantifies economic costs and benefits such as travel time savings, vehicle operating cost savings and accident reduction, applies appropriate shadow pricing, and computes economic internal rate of return and net present value to support appraisal and funding approvals.',
        deliverables: [
          'Economic cost-benefit analysis',
          'EIRR and ENPV computation',
          'Sensitivity analysis',
          'Appraisal note for approvals',
        ],
      },
      {
        id: 'pmc',
        title: 'Project Management Consultancy (PMC)',
        description:
          'Project management support to authorities and developers through the pre-construction and construction phases. The PMC role covers planning and scheduling, monitoring of physical and financial progress, coordination among contractors, consultants and government departments, review of contractor claims and payments, and structured reporting to management so that delays and cost overruns are identified and addressed early.',
        deliverables: [
          'Project master schedule',
          'Monthly progress reports',
          'Payment and claims review',
          'Risk and issue register',
        ],
      },
      {
        id: 'techno-economic-valuation',
        title: 'Techno-Economic Valuation',
        description:
          'Integrated technical and financial assessment of a project or operating asset, typically required by lenders, investors or boards before committing capital. Spine reviews technical parameters, capital and operating cost estimates, implementation schedule, market demand and regulatory position, and combines these into a valuation and viability opinion that identifies key risks and the assumptions on which the conclusion depends.',
        deliverables: [
          'Techno-economic viability report',
          'Capital and operating cost review',
          'Demand and revenue assessment',
          'Key risk summary',
        ],
      },
    ],
    faqs: [
      {
        q: 'What does a transaction advisor do on an infrastructure PPP project?',
        a: 'A transaction advisor structures the project and runs its procurement on behalf of the authority. This involves assessing viability, selecting the delivery model, allocating risk, drafting RFQ, RFP and concession documents, managing bidder interaction and evaluating bids. The advisor also supports negotiation and the conditions precedent to financial close, so that the awarded contract is both competitive and bankable.',
      },
      {
        q: 'How does Spine Advisory choose between HAM, BOT and EPC for a project?',
        a: 'The choice depends on the project\'s revenue certainty, the authority\'s budget capacity and the appetite of the private market for traffic and financing risk. Spine compares the options through financial modelling and a value for money assessment, examining fiscal outlay, risk transfer, bidder interest and lender acceptability, and recommends the model that best balances public cost against delivery certainty.',
      },
      {
        q: 'What is Viability Gap Funding and when does it apply?',
        a: 'Viability Gap Funding is a capital grant from the Government of India that supports PPP projects which are economically justified but fall short of financial viability. The scheme is administered by the Department of Economic Affairs, Ministry of Finance. Spine estimates the funding gap through the financial model, structures the bid parameter accordingly and prepares the documentation needed for the approval process.',
      },
      {
        q: 'What makes a financial model acceptable to lenders and authorities?',
        a: 'A model is acceptable when its logic is transparent, its assumptions are documented and sourced, and its outputs can be traced and tested. Spine separates inputs, calculations and outputs, avoids hard-coded values, includes integrity checks and provides an assumptions book. This allows lenders\' model auditors and authority reviewers to verify results and run their own sensitivities with confidence.',
      },
    ],
  },
  {
    slug: 'operations-risk',
    title: 'Operation and Risk Advisory',
    icon: 'security',
    metaDescription:
      'Internal controls, contract management, operational risk, process re-engineering, SOPs and regulatory compliance for infrastructure and industrial firms.',
    summary:
      'Controls, process and compliance advisory that strengthens how infrastructure and industrial organisations run, report and manage risk.',
    answer:
      'Operation and Risk Advisory at Spine Advisory helps organisations design and test internal controls, manage contracts, reduce cost and meet regulatory obligations. The practice is led by Chartered Accountants and combines process review, risk assessment and documentation of standard operating procedures, with recommendations that management can implement and auditors can verify.',
    tags: ['Internal Controls', 'Risk Management', 'Regulatory Compliance'],
    items: [
      {
        id: 'internal-controls',
        title: 'Internal Controls',
        description:
          'Design, documentation and testing of internal financial controls. Under the Companies Act, 2013, boards of listed companies must confirm that internal financial controls are adequate and operating effectively, and statutory auditors report on them. Spine maps key processes, builds risk and control matrices, tests design and operating effectiveness, and reports gaps with practical remediation steps.',
        deliverables: [
          'Process narratives and flowcharts',
          'Risk and control matrix',
          'Control testing report',
          'Remediation plan',
        ],
      },
      {
        id: 'contract-management',
        title: 'Contract Management',
        description:
          'Support across the contract lifecycle for concession, EPC and service contracts. Spine builds obligation registers, tracks milestones and compliance with contractual conditions, reviews variations, change of scope and claims, and assists with documentation for dispute resolution. For authorities and concessionaires alike, disciplined contract administration preserves entitlements and reduces the risk of costly disputes.',
        deliverables: [
          'Contract obligation register',
          'Milestone and compliance tracker',
          'Change of scope and claims review',
          'Contract administration manual',
        ],
      },
      {
        id: 'operational-risk-management',
        title: 'Operational Risk Management',
        description:
          'Identification, assessment and mitigation of risks arising from people, processes, systems and external events. Spine facilitates risk workshops with management, develops a risk register with likelihood and impact ratings, defines risk appetite and key risk indicators, and sets out ownership and reporting arrangements so that the board receives a consistent, periodic view of the organisation\'s risk profile.',
        deliverables: [
          'Enterprise risk register',
          'Risk assessment methodology',
          'Key risk indicators',
          'Risk management policy',
        ],
      },
      {
        id: 'cost-minimization',
        title: 'Cost Minimization',
        description:
          'Structured review of operating and project costs to identify savings without compromising service levels or safety. Spine analyses spend by category, benchmarks unit costs, examines procurement practices, inventory and overheads, and assesses contract terms with major vendors. Recommendations are quantified, prioritised by ease of implementation and tracked against a baseline so that savings are realised rather than estimated.',
        deliverables: [
          'Spend analysis',
          'Cost benchmarking report',
          'Quantified savings plan',
          'Savings tracking framework',
        ],
      },
      {
        id: 'process-re-engineering',
        title: 'Process Re-engineering',
        description:
          'Redesign of business processes to remove redundancy, shorten cycle times and strengthen control. Spine documents current-state processes, identifies bottlenecks, duplicated approvals and manual workarounds, and designs future-state processes that align with the organisation\'s structure and systems. The work often precedes ERP implementation, so that technology is configured around an improved process rather than an inefficient one.',
        deliverables: [
          'Current-state process maps',
          'Gap and bottleneck analysis',
          'Future-state process design',
          'Implementation plan',
        ],
      },
      {
        id: 'accounting-financial-reporting',
        title: 'Accounting & Financial Reporting',
        description:
          'Support for accurate, timely and compliant financial reporting. Spine assists with Ind AS implementation and accounting policy papers, including complex areas such as service concession arrangements, revenue recognition and financial instruments. The team also streamlines month-end and year-end close, prepares management information packs and supports finance teams in responding to statutory audit requirements.',
        deliverables: [
          'Accounting policy papers',
          'Ind AS impact assessment',
          'Financial close calendar',
          'Management reporting pack',
        ],
      },
      {
        id: 'development-sop',
        title: 'Development of SOPs',
        description:
          'Preparation of standard operating procedures that set out how each activity is performed, by whom, with what approvals and within what timelines. Spine drafts SOPs for finance, procurement, project execution, stores and human resources, incorporating delegation of financial powers and embedded controls. Clear SOPs reduce dependence on individuals and give auditors and new staff a reliable reference.',
        deliverables: [
          'Standard operating procedure manuals',
          'Delegation of financial powers',
          'Process control checklists',
          'Staff orientation material',
        ],
      },
      {
        id: 'regulatory-compliance',
        title: 'Regulatory Compliance',
        description:
          'Review of an organisation\'s compliance with applicable corporate, tax, labour, environmental and sector-specific laws. Spine builds a compliance universe mapped to responsible owners and due dates, tests compliance status, and sets up a monitoring and certification process for management and the board. The objective is early identification of lapses and a documented compliance trail.',
        deliverables: [
          'Compliance universe and calendar',
          'Compliance status review',
          'Compliance certification framework',
          'Gap remediation plan',
        ],
      },
    ],
    faqs: [
      {
        q: 'Why do infrastructure companies need an internal controls review?',
        a: 'Infrastructure companies need an internal controls review because large, multi-site projects create significant exposure in procurement, contractor payments and asset accounting. A review confirms that controls are designed and operating as intended, supports the board\'s responsibility statements under the Companies Act, 2013, and gives lenders and auditors greater comfort over reported numbers and the use of project funds.',
      },
      {
        q: 'How is operational risk management different from internal audit?',
        a: 'Operational risk management is a continuous management process, whereas internal audit is an independent periodic assurance activity. Risk management identifies and rates risks, assigns owners and monitors mitigation. Internal audit then tests whether those controls and mitigations work. Spine helps establish the risk framework so that audit effort can be directed at the areas of greatest exposure.',
      },
      {
        q: 'What does a contract management engagement typically cover?',
        a: 'A contract management engagement typically covers obligation tracking, milestone monitoring, review of variations and claims, and documentation for dispute resolution. Spine reads the contract into a structured register, aligns it with the project schedule and payment records, and establishes reporting that shows management which obligations are due, which are at risk and where entitlements may be lost.',
      },
      {
        q: 'Should process re-engineering happen before an ERP implementation?',
        a: 'Yes, process re-engineering should ideally precede ERP implementation. Configuring software around existing inefficient processes tends to automate the inefficiency and increases customisation cost. Spine first documents and redesigns key processes, defines controls and approval hierarchies, and then translates the future-state design into business requirements that the ERP implementation partner can configure against.',
      },
    ],
  },
  {
    slug: 'investment-banking',
    title: 'Investment Banking',
    icon: 'account_balance',
    banner: 'urban',
    metaDescription:
      'Due diligence, valuation, private equity, venture and angel funding, debt syndication, project financing and deal structuring for Indian businesses.',
    summary:
      'Capital raising, valuation and transaction support that connects infrastructure and growth businesses with the right equity and debt.',
    answer:
      'Investment Banking and Capital Advisory at Spine Advisory helps companies and project developers raise equity and debt, value businesses and execute transactions. The practice undertakes due diligence and valuation, prepares information memoranda and financial models, approaches investors and lenders, and supports negotiation and documentation through to closing.',
    tags: ['Capital Raising', 'Valuation', 'Debt Syndication'],
    items: [
      {
        id: 'due-diligence',
        title: 'Due Diligence',
        description:
          'Financial, tax and commercial due diligence for acquisitions, investments and lending decisions. Spine examines quality of earnings, working capital, debt and contingent liabilities, related party transactions and tax exposures, and for infrastructure assets reviews concession terms, traffic or revenue history and maintenance obligations. Findings are presented with their effect on value and recommended protections in transaction documents.',
        deliverables: [
          'Financial due diligence report',
          'Quality of earnings analysis',
          'Key findings and red flags summary',
          'Transaction document recommendations',
        ],
      },
      {
        id: 'business-valuation',
        title: 'Business Valuation',
        description:
          'Independent valuation of businesses, shares and infrastructure assets for transactions, fund raising, restructuring, financial reporting and regulatory purposes. Spine applies income, market and asset approaches as appropriate, with discounted cash flow analysis typically central for concession assets with defined lives. Each report sets out methodology, key assumptions and sensitivities so that the conclusion can be understood and defended.',
        deliverables: [
          'Valuation report',
          'Discounted cash flow model',
          'Comparable company and transaction analysis',
          'Sensitivity analysis',
        ],
      },
      {
        id: 'investment',
        title: 'Investment',
        description:
          'Advisory to promoters and founders raising equity — private equity for growth, expansion or partial exit, venture capital for early-stage and growth companies, and first external capital from angel investors and networks. Spine assesses investment readiness, prepares the business plan, financial model, information memorandum and data room, identifies investors whose stage and sector focus fit, and manages the process through term sheet, due diligence and definitive agreements. Advice covers valuation, instrument choice (equity, CCPS, convertible notes), dilution, governance rights and exit terms.',
        deliverables: [
          'Investment readiness assessment',
          'Information memorandum and investor presentation',
          'Investor long list and outreach',
          'Valuation and instrument advice',
          'Term sheet and shareholder agreement negotiation support',
        ],
      },
      {
        id: 'debt-syndication',
        title: 'Debt Syndication',
        description:
          'Arrangement of term loans, working capital and refinancing facilities from banks and financial institutions. Spine prepares the credit proposal and financial projections, approaches lenders with an appetite for the sector and risk profile, compares sanctioned terms, and supports documentation and compliance with conditions precedent to disbursement. For operating infrastructure assets, refinancing can materially reduce interest cost and extend repayment.',
        deliverables: [
          'Credit information memorandum',
          'Lender identification and outreach',
          'Term sheet comparison',
          'Documentation and disbursement support',
        ],
      },
      {
        id: 'project-financing',
        title: 'Project Financing',
        description:
          'Limited-recourse financing of infrastructure projects, where debt is serviced from project cash flows. Spine sizes debt against cash flow coverage, structures the funding plan including equity, debt and any grant such as VGF, and coordinates with lenders, lenders\' engineers and legal counsel through appraisal, sanction and financial close. Careful structuring of the escrow and security package is central to lender comfort.',
        deliverables: [
          'Funding plan and debt sizing',
          'Bankable project information memorandum',
          'Lender appraisal support',
          'Financial close checklist',
        ],
      },
      {
        id: 'deal-structuring',
        title: 'Deal Structuring',
        description:
          'Design of transaction structures that balance the commercial, tax and regulatory objectives of the parties. Spine evaluates options such as share or asset acquisition, slump sale, joint ventures and staged investment, and advises on consideration mechanisms, earn-outs, and representations and warranties. The team works alongside legal and tax counsel to ensure the agreed structure can be implemented in practice.',
        deliverables: [
          'Structuring options paper',
          'Consideration and earn-out mechanics',
          'Transaction step plan',
          'Negotiation support',
        ],
      },
      {
        id: 'asset-management',
        title: 'Asset Management',
        description:
          'Advisory on the management of operating infrastructure and real estate portfolios to preserve and enhance value. Spine monitors asset performance against plan, reviews operating and maintenance costs, tracks lender covenants and concession obligations, and evaluates monetisation options. For portfolios being considered for an InvIT or REIT, the team assesses asset suitability and readiness under the applicable SEBI regulations.',
        deliverables: [
          'Asset performance dashboard',
          'Covenant and obligation monitoring',
          'Monetisation options assessment',
          'Periodic investor reporting',
        ],
      },
    ],
    faqs: [
      {
        q: 'How does Spine Advisory help an infrastructure developer raise project finance?',
        a: 'Spine helps an infrastructure developer raise project finance by preparing a bankable financial model and information memorandum, sizing debt against project cash flows and approaching suitable lenders. The team then supports lender appraisal, coordinates with lenders\' engineers and legal counsel, compares sanctioned terms and tracks conditions precedent through to financial close and first disbursement.',
      },
      {
        q: 'Which valuation methods does Spine use for infrastructure assets?',
        a: 'Spine primarily uses the discounted cash flow method for infrastructure assets because concession and annuity assets have defined lives and contracted or forecastable cash flows. Market approaches using comparable transactions or listed trusts are applied as cross-checks where reliable data exists. Each valuation documents the discount rate build-up, traffic or revenue assumptions and key sensitivities.',
      },
      {
        q: 'What is the difference between debt syndication and project financing?',
        a: 'Debt syndication is the process of arranging loans from one or more lenders, whereas project financing is a particular structure in which debt is repaid mainly from a project\'s own cash flows. Syndication may support corporate borrowing, working capital or refinancing. Project financing relies on ring-fenced cash flows, escrow arrangements and a security package over project assets.',
      },
      {
        q: 'Can Spine Advisory help evaluate an asset for an InvIT or REIT?',
        a: 'Yes, Spine can assess whether operating assets are suitable for transfer to an InvIT or REIT. The review covers cash flow stability, remaining concession life, debt and covenant position, and readiness under the SEBI (Infrastructure Investment Trusts) Regulations, 2014 or SEBI (Real Estate Investment Trusts) Regulations, 2014. Formal valuation and legal structuring are coordinated with the registered valuer and counsel.',
      },
    ],
  },
  {
    slug: 'engineering',
    title: 'Engineering Services',
    icon: 'engineering',
    banner: 'railways',
    metaDescription:
      'Feasibility studies, traffic surveys, DPRs, detailed design, proof checking, safety audit and construction supervision for roads, railways and urban works.',
    summary:
      'Engineering studies, design review and supervision that carry infrastructure projects from feasibility through construction and operation.',
    answer:
      'Engineering Services at Spine Advisory span the technical lifecycle of infrastructure projects, from feasibility studies, traffic analysis and detailed project reports to design, proof checking and construction supervision. The team acts for authorities as Independent Engineer or Authority\'s Engineer and for developers as design and project management consultant, working to applicable IRC codes and MoRTH specifications.',
    tags: ['Detailed Project Reports', 'Independent Engineer', 'Road Safety Audit'],
    items: [
      {
        id: 'feasibility-report',
        title: 'Feasibility Report',
        description:
          'Pre-investment studies that establish whether a project is technically sound, economically justified and financially viable. Spine examines alignment options, site conditions, traffic or demand, preliminary cost estimates, environmental and social considerations and land requirements, and recommends whether and how the project should proceed. A rigorous feasibility study prevents costly changes of scope later in the project cycle.',
        deliverables: [
          'Feasibility study report',
          'Alignment options analysis',
          'Preliminary cost estimate',
          'Economic and financial viability assessment',
        ],
      },
      {
        id: 'traffic-analysis',
        title: 'Traffic Analysis',
        description:
          'Traffic surveys and forecasting for highway, urban and transport projects. Spine plans and conducts classified volume counts, origin-destination and axle load surveys, and turning movement counts, and analyses the data to estimate base-year traffic, growth rates, diverted and generated traffic, and capacity requirements. Forecasts inform lane configuration, pavement design, toll revenue estimates and the financial model.',
        deliverables: [
          'Traffic survey data and analysis',
          'Traffic forecast report',
          'Capacity and level of service analysis',
          'Toll revenue estimates',
        ],
      },
      {
        id: 'detailed-project-report',
        title: 'Detailed Project Report',
        description:
          'Preparation of detailed project reports (DPRs) that provide the technical basis for sanction, procurement and construction. A DPR covers topographic and geotechnical surveys, alignment design, pavement and structure design, drainage, quantities and cost estimates, land acquisition and utility shifting requirements, and environmental and social assessments, prepared in line with the applicable IRC codes, MoRTH specifications and client terms of reference.',
        deliverables: [
          'Detailed project report',
          'Engineering drawings',
          'Bill of quantities and cost estimate',
          'Land acquisition and utility shifting plans',
        ],
      },
      {
        id: 'detailed-design',
        title: 'Detailed Design',
        description:
          'Detailed engineering design of highways, bridges, structures and associated works for construction. Spine prepares geometric design, pavement design, structural design of bridges, culverts and retaining structures, and drainage and road furniture layouts, with supporting design calculations. Designs are developed to the applicable IRC codes and contract specifications and coordinated with the construction schedule.',
        deliverables: [
          'Design basis report',
          'Design calculations',
          'Good-for-construction drawings',
          'Quantity estimates',
        ],
      },
      {
        id: 'project-management-consulting',
        title: 'Project Management Consulting',
        description:
          'Technical project management for owners and developers during design and construction. Spine sets up the project control framework, reviews contractor work programmes, monitors progress, quality and safety, manages design interfaces and coordinates approvals with statutory bodies. Regular reporting gives management an accurate view of schedule, cost and emerging technical risk so that corrective action can be taken in time.',
        deliverables: [
          'Project control framework',
          'Work programme review',
          'Progress and quality reports',
          'Interface and approvals tracker',
        ],
      },
      {
        id: 'project-implementation-operation',
        title: 'Project Implementation & Operation',
        description:
          'Support during commissioning and the operation and maintenance period of infrastructure assets. Spine monitors compliance with maintenance obligations and performance standards in the concession agreement, reviews maintenance programmes, and assesses asset condition through periodic inspections. In the Independent Engineer role, this includes certifying compliance and reporting on the concessionaire\'s performance during operations.',
        deliverables: [
          'Operation and maintenance compliance reports',
          'Asset condition inspection reports',
          'Maintenance programme review',
          'Performance standards monitoring',
        ],
      },
      {
        id: 'proof-checking',
        title: 'Proof Checking',
        description:
          'Independent verification of designs prepared by contractors or design consultants before construction. Spine checks design assumptions, loadings, calculations and drawings for structures, pavements and geometric elements against the applicable codes and contract requirements, and issues observations for resolution. Proof checking reduces the risk of structural deficiency, rework and disputes, and is frequently mandated by authorities for major structures.',
        deliverables: [
          'Proof checking observations',
          'Design compliance certificate',
          'Reviewed drawings record',
        ],
      },
      {
        id: 'safety-audit',
        title: 'Safety Audit',
        description:
          'Road safety audits at the feasibility, design, construction and pre-opening stages, and of existing roads in operation. Spine\'s auditors examine geometry, junctions, signage, markings, crash barriers, pedestrian facilities and work zone traffic management, and identify hazards with recommended corrective measures. Audits follow the approach set out in the IRC Manual on Road Safety Audit (IRC:SP:88).',
        deliverables: [
          'Road safety audit report',
          'Hazard identification register',
          'Recommended corrective measures',
          'Compliance verification report',
        ],
      },
      {
        id: 'construction-supervision',
        title: 'Construction Supervision',
        description:
          'Supervision of construction on behalf of the authority as Authority\'s Engineer for EPC contracts or Independent Engineer for PPP concessions. Spine reviews and approves contractor submissions, inspects works and materials testing, monitors progress against milestones, certifies payments and completion, and reports on quality and safety. The role requires impartial application of the contract between authority and contractor.',
        deliverables: [
          'Monthly progress reports',
          'Quality assurance and inspection records',
          'Payment and milestone certificates',
          'Completion certificates',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the role of an Independent Engineer on a PPP highway project?',
        a: 'An Independent Engineer is an impartial technical consultant appointed under the concession agreement to monitor the project on behalf of both the authority and the concessionaire. The Independent Engineer reviews designs, inspects construction, monitors progress, certifies milestones and completion, and during operations reports on compliance with maintenance obligations. Lenders also rely on these certifications.',
      },
      {
        q: 'How is an Authority\'s Engineer different from an Independent Engineer?',
        a: 'An Authority\'s Engineer supervises EPC contracts, while an Independent Engineer is appointed for PPP concessions such as BOT and HAM. Both review designs, inspect works and certify progress, but the Authority\'s Engineer administers an EPC contract on the authority\'s behalf, whereas the Independent Engineer acts impartially between authority and concessionaire under the concession agreement.',
      },
      {
        q: 'What does a detailed project report include?',
        a: 'A detailed project report includes the surveys, engineering design, cost estimates and implementation plan required to sanction and procure a project. Typical contents are topographic, geotechnical and traffic surveys, alignment and pavement design, structures, drainage, bill of quantities, land acquisition and utility shifting plans, environmental and social assessment, and an economic and financial analysis.',
      },
      {
        q: 'When should a road safety audit be carried out?',
        a: 'A road safety audit should be carried out at several stages: feasibility, preliminary and detailed design, during construction, before opening to traffic, and periodically on existing roads. Early audits are the most cost-effective because design changes are cheaper before construction. Pre-opening and operational audits identify hazards that emerge once the road carries real traffic.',
      },
    ],
  },
  {
    slug: 'technology',
    title: 'Information Technology',
    icon: 'terminal',
    metaDescription:
      'Enterprise applications, ERP, industrial automation, mobile solutions and MIS analytics for infrastructure operators, toll systems and project authorities.',
    summary:
      'Technology and automation solutions that give infrastructure operators and authorities reliable data, controls and visibility across their assets.',
    answer:
      'Information Technology and Automation at Spine Advisory delivers enterprise applications, ERP, industrial automation, mobile solutions and management information systems for infrastructure and industrial organisations. The practice combines domain knowledge of projects, toll operations and finance with software delivery, so that systems reflect how the business actually works and produce information management can act on.',
    tags: ['Enterprise Applications', 'MIS & Analytics', 'Automation'],
    items: [
      {
        id: 'enterprise-application-development',
        title: 'Enterprise Application Development',
        description:
          'Design and development of business applications for project monitoring, finance, procurement, contract management and asset management. Spine gathers requirements with business users, designs the data model and workflows, develops and tests the application, and supports deployment and user training. Where an ERP is in place or planned, applications are integrated with it rather than duplicating its functions.',
        deliverables: [
          'Business requirements specification',
          'Solution architecture and design',
          'Tested application release',
          'User training and documentation',
        ],
      },
      {
        id: 'industrial-automation',
        title: 'Industrial Automation',
        description:
          'Automation of operational processes in infrastructure and industrial facilities, including toll plazas, plant operations and field data capture. Spine assesses existing systems, defines automation requirements, and integrates field devices, control systems and enterprise software so that operational data flows reliably to the people who need it. The aim is reduced manual intervention, fewer errors and better audit trails.',
        deliverables: [
          'Automation requirements study',
          'System integration design',
          'Implementation and commissioning support',
          'Operations handover documentation',
        ],
      },
      {
        id: 'mobility',
        title: 'Mobility',
        description:
          'Mobile applications that extend enterprise systems to field staff, site engineers and managers. Typical uses include site inspection and progress reporting with geo-tagged photographs, attendance and resource tracking, approvals on the move and access to dashboards. Applications are designed to work under intermittent connectivity common on project sites, synchronising data with central systems once a connection is available.',
        deliverables: [
          'Mobile application design',
          'Android and iOS applications',
          'Offline data synchronisation',
          'Integration with enterprise systems',
        ],
      },
      {
        id: 'analytics-mis',
        title: 'Analytics & MIS',
        description:
          'Management information systems and analytics that consolidate data from projects, operations and finance into consistent reports and dashboards. For organisations managing multi-state highway packages, toll operations or large project portfolios, Spine defines key performance indicators, builds data pipelines from source systems and designs dashboards that present physical progress, revenue, cost and compliance in a single view.',
        deliverables: [
          'KPI framework',
          'Data integration pipelines',
          'Management dashboards',
          'Periodic MIS reports',
        ],
      },
    ],
    faqs: [
      {
        q: 'What kind of MIS does Spine Advisory build for infrastructure organisations?',
        a: 'Spine builds management information systems that consolidate physical progress, financial, revenue and compliance data across projects into a single reporting layer. For highway portfolios spread across several states, this means standardised KPIs, automated data collection from sites and toll systems, and dashboards that let senior management compare packages and identify issues without relying on manually compiled spreadsheets.',
      },
      {
        q: 'Does Spine Advisory implement ERP systems?',
        a: 'Spine supports ERP programmes by defining business requirements, redesigning processes and integrating ERP with other enterprise and field applications. Drawing on its accounting and operations practice, the team ensures that controls, approval hierarchies and reporting needs are reflected in the configuration, and that project and toll data flow correctly into the financial records.',
      },
      {
        q: 'How do mobile applications help on infrastructure project sites?',
        a: 'Mobile applications help by capturing progress, inspections and resource data at the point of work, with photographs and location stamps that improve reliability. This reduces delays and errors in manual reporting. Applications designed for offline use store data on the device where connectivity is poor and synchronise it with central systems once a network is available.',
      },
      {
        q: 'Why combine domain advisory with technology delivery?',
        a: 'Combining domain advisory with technology delivery produces systems that reflect real business processes, contractual obligations and control requirements. A software team without infrastructure finance or project experience often builds what is specified rather than what is needed. Spine\'s consultants and developers work together, so requirements are tested against practice before they are built.',
      },
    ],
  },
];
