import type { Article } from './types';

// Thought-leadership policy briefs. Facts are limited to publicly documented
// programme features; anything uncertain is described qualitatively.
export const articles: Article[] = [
  {
    slug: 'india-semiconductor-mission-incentives',
    title:
      "Navigating India's Semiconductor Incentives: What Fab, OSAT and Display Investors Need to Know",
    category: 'Industrial Policy',
    banner: 'semiconductor',
    published: '2025-02-15',
    readingMinutes: 6,
    metaDescription:
      "How India's ₹76,000 crore semiconductor programme works for fab, display and OSAT investors: fiscal support, pari-passu disbursal and state top-ups.",
    summary:
      "India's semiconductor programme offers fiscal support of up to half of eligible project cost, but bankability depends on how investors structure disbursal, state incentives and execution risk.",
    takeaways: [
      'The Semicon India programme, approved in December 2021 with an outlay of ₹76,000 crore, is administered through the India Semiconductor Mission (ISM).',
      'Under the modified programme, central fiscal support of up to 50% of eligible project cost is available for fabs, display fabs and ATMP/OSAT units, released on a pari-passu basis.',
      'State incentives are layered on top and vary materially between states, so the effective support package must be negotiated and documented project by project.',
      'Pari-passu disbursal means the investor must fund its share first; financing plans, milestone definitions and audit trails matter as much as the headline percentage.',
    ],
    sections: [
      {
        heading: 'The policy architecture in brief',
        body: [
          "The Union Cabinet approved the Programme for Development of Semiconductors and Display Manufacturing Ecosystem in India in December 2021, with a total outlay of ₹76,000 crore. The programme is implemented through the India Semiconductor Mission, a specialised division set up under the Ministry of Electronics and Information Technology to evaluate applications, recommend approvals and monitor disbursal. For an investor, ISM is the single most important counterparty: it appraises the technology, the promoter and the financial plan before any fiscal commitment is made.",
          "The programme is not one scheme but a family of schemes. It covers semiconductor fabs, display fabs, compound semiconductor and related fabs together with assembly, testing, marking and packaging (ATMP) and outsourced assembly and test (OSAT) units, and a design-linked incentive scheme for chip design. Each scheme has its own eligibility tests and application windows, so investors should read the specific scheme guidelines rather than relying on summaries of the programme as a whole.",
        ],
      },
      {
        heading: 'What the modified programme offers',
        body: [
          "The original 2021 design graded fiscal support for fabs by technology node. The programme was subsequently modified so that eligible fabs receive fiscal support of up to 50% of project cost on a pari-passu basis, irrespective of node, with similar uniform support for display fabs. Support for compound semiconductor, silicon photonics, sensor and ATMP/OSAT units was likewise moved to up to 50% of capital expenditure. The change simplified the economics for investors and removed an incentive to cluster around particular nodes for subsidy reasons alone.",
          "Two words in that formulation deserve close attention. 'Eligible' means that only defined categories of capital cost qualify; land, certain buildings, pre-operative expenses and working capital may be treated differently, and the scheme guidelines govern. 'Pari-passu' means central support is released in proportion to the investor's own spending, not in advance. The headline 50% is therefore a ceiling on a defined base, and the investor's cash flow profile during construction remains its own responsibility.",
        ],
        bullets: [
          'Confirm which cost heads count towards eligible project cost under the applicable scheme.',
          'Model disbursal lags between investor spend, verification and release of central support.',
          'Treat the approval letter and any agreement with ISM as the controlling documents, not press summaries.',
        ],
      },
      {
        heading: 'State incentives: the second layer',
        body: [
          "Several states have notified electronics or semiconductor policies that offer support over and above the central programme. Gujarat, for example, has a dedicated semiconductor policy, and other states compete through capital subsidies, land at concessional rates, stamp duty and electricity duty exemptions, and assured utilities. The combination of central and state support can materially change project returns, but state packages differ in structure, timing and conditions, and they are rarely identical even for comparable projects within the same state.",
          "Investors should treat the state package as a negotiated contract rather than a menu. Key points include whether the state subsidy is calculated on the same cost base as central support, whether it is disbursed on a parallel schedule, what clawback or performance conditions apply, and how commitments on water, power and land are documented. A fab consumes large volumes of ultra-pure water and stable power, so the reliability of utility commitments often matters more than the size of the cash subsidy.",
        ],
      },
      {
        heading: 'Bankability and execution risk',
        body: [
          "Fiscal support reduces the capital that must be raised, but it does not remove the main risks of semiconductor projects: technology transfer, ramp-up yields, customer offtake and the availability of skilled manpower. Lenders will look for credible technology partners, binding offtake or capacity arrangements where possible, and a construction budget with contingencies that do not assume subsidy releases arrive on time. A financing plan that works only if every instalment of support is released promptly is fragile.",
          "ATMP and OSAT projects generally have lower capital intensity and shorter construction periods than fabs, which is one reason the first wave of approved projects has included several assembly and test units alongside a fab. For display fabs and front-end fabs, the scale and duration of capital commitment are far larger, and the financing structure typically needs a mix of promoter equity, strategic partners, long-tenor debt and, in some cases, export credit support linked to equipment suppliers.",
        ],
        bullets: [
          'Stress-test the project for delays of six to twelve months in subsidy release.',
          'Map every condition precedent in central and state approvals to a responsible party and date.',
          'Align equipment supply contracts with the milestone definitions used for disbursal verification.',
        ],
      },
      {
        heading: 'A practitioner checklist before applying',
        body: [
          "Before an application is filed, the promoter group should be able to answer a short set of questions with documents rather than intentions. Is the technology licence or partnership agreed in principle, and on what terms? Is land identified with clear title and utility access? What is the equity commitment of each partner and how will it be funded? Which state package has been offered, in writing, and on what cost base? Weak answers at this stage usually surface later as delays.",
          "Applicants should also prepare for continuing obligations after approval. Disbursal claims will require audited evidence of expenditure, progress reports and, typically, independent verification. Building a project management and accounting system that produces this evidence from the outset avoids disputes over eligible cost and keeps the release of support in step with construction. Governance arrangements between joint venture partners should be settled early, because changes in shareholding may require prior approval.",
        ],
      },
      {
        heading: 'How Spine Advisory can help',
        body: [
          "Spine Advisory supports investors, joint venture partners and state agencies in structuring semiconductor and electronics manufacturing projects. Our work typically covers reading and interpreting scheme guidelines, building financial models that capture pari-passu disbursal and state incentives, preparing application documentation, and setting up the monitoring and claims processes needed after approval. We also help state governments design incentive packages that are fiscally sustainable and transparent for investors.",
          "On the financing side, we assist promoters in preparing lender information packages, identifying risk allocation gaps in technology, supply and offtake contracts, and coordinating between central agencies, state departments and financial institutions. Our aim is to make the incentive package and the financing plan consistent with each other, so that the project can be appraised by lenders on its own merits.",
        ],
      },
    ],
    faqs: [
      {
        q: 'How much fiscal support does India offer for semiconductor fabs?',
        a: "Under the modified Semicon India programme, eligible fabs can receive central fiscal support of up to 50% of project cost, released on a pari-passu basis with the investor's own spending. The support is a ceiling on a defined eligible cost base, and states may offer additional incentives through their own policies.",
      },
      {
        q: 'What does pari-passu disbursal mean for investors?',
        a: "It means central support is released in proportion to the investor's own expenditure rather than in advance. The investor must first spend its share, document it, and then claim the matching support. Financing plans therefore need bridge liquidity and should assume some delay between spending and release of funds.",
      },
      {
        q: 'Are OSAT and ATMP units covered by the incentives?',
        a: 'Yes, ATMP and OSAT units are covered under a dedicated scheme within the programme, which also includes compound semiconductor, silicon photonics and sensor fabs. Under the modified programme, support of up to 50% of eligible capital expenditure is available, subject to the scheme guidelines and approval by the government.',
      },
      {
        q: 'Do state incentives differ across India?',
        a: 'Yes, state incentives vary considerably in structure, cost base, timing and conditions. Some states, such as Gujarat, have dedicated semiconductor policies, while others offer support through broader electronics or industrial policies. Investors should obtain the state package in writing and check how it interacts with central support before finalising location.',
      },
    ],
  },
  {
    slug: 'ham-highway-concessions-risk',
    title: 'Hybrid Annuity Model: How Risk Allocation Shapes Bankability for Highway Developers',
    category: 'Highways & PPP',
    banner: 'highway-mountains',
    published: '2024-11-20',
    readingMinutes: 6,
    metaDescription:
      'How the Hybrid Annuity Model allocates construction, traffic, inflation and interest rate risk on Indian highway projects, and what lenders look for.',
    summary:
      'The Hybrid Annuity Model shares construction funding between the authority and the developer while leaving traffic risk with the authority; its bankability rests on how the remaining risks are priced and managed.',
    takeaways: [
      'Under HAM, the authority pays 40% of the bid project cost during construction in instalments, and the concessionaire funds the remaining 60% through equity and debt.',
      "The concessionaire's 60% is recovered through semi-annual annuities with interest over the operations period, while O&M is paid separately.",
      'NHAI collects tolls and bears traffic risk, so developer returns depend on construction cost control, timely completion and the counterparty strength of the authority.',
      'Inflation indexation through a price index multiple combining WPI and CPI(IW) protects part of the cost base, but interest rate, land and approval risks need close attention.',
    ],
    sections: [
      {
        heading: 'Why HAM emerged',
        body: [
          "The Hybrid Annuity Model was adopted for national highways in 2016 after a period in which the build-operate-transfer toll model had lost favour with developers and lenders. Under BOT toll, the concessionaire bore traffic risk, and several projects were stressed when traffic fell short of forecasts, land acquisition was delayed or costs escalated. Engineering, procurement and construction contracts, on the other hand, placed the entire funding burden on the public exchequer. HAM was designed as a middle path between these two approaches.",
          "The model shares the construction funding requirement between the authority and the private developer, while leaving revenue risk with the authority. This combination was intended to attract developers and banks back to highway PPPs, reduce the upfront fiscal requirement compared with EPC, and preserve the incentive for the private party to build on time and maintain the asset well through the operations period. Its success in drawing participation has made it a mainstay of national highway procurement.",
        ],
      },
      {
        heading: 'How the payment mechanism works',
        body: [
          "Bidders compete on the bid project cost and the cost of operation and maintenance, as specified in the bid documents. During construction, the authority pays 40% of the bid project cost in instalments linked to physical progress milestones. The concessionaire arranges the remaining 60% through its own equity and debt. This constant-support structure means the developer's funding requirement is substantially lower than under BOT toll, which in turn reduces the equity that must be committed to each project.",
          "After commercial operation, the concessionaire recovers its 60% share through semi-annual annuity payments over the operations period, together with interest on the outstanding amount at a rate linked to a benchmark specified in the concession agreement. Operation and maintenance payments are made separately and are also linked to performance standards. Tolls, where levied, are collected by the authority, so the concessionaire's revenue stream does not depend on how many vehicles use the road.",
        ],
        bullets: [
          'Construction support: 40% of bid project cost, paid by the authority in milestone-linked instalments.',
          'Concessionaire funding: 60% of bid project cost, recovered through semi-annual annuities with interest.',
          'O&M: paid separately during operations, subject to maintenance standards and deductions.',
        ],
      },
      {
        heading: 'Where the risks sit',
        body: [
          "HAM removes traffic risk from the developer, but it does not remove risk altogether. Construction risk, including cost overruns, contractor performance and design errors, remains with the concessionaire. Completion risk is also material, because annuities begin only after the project achieves commercial operation, and delays increase interest during construction. Land availability and statutory clearances are obligations largely on the authority side, but their delay affects the developer's schedule, financing costs and covenant compliance with lenders.",
          "Inflation is addressed through a price index multiple, which combines the Wholesale Price Index and the Consumer Price Index for Industrial Workers to adjust the bid project cost and related payments. This protects the real value of a part of the cost base, but the indexation may not exactly match the developer's actual input cost movements. Interest rate exposure depends on how the concession agreement benchmarks interest on annuities against the developer's own cost of debt, which is a key area for lender diligence.",
        ],
      },
      {
        heading: 'What lenders look for',
        body: [
          "Because revenue risk sits with the authority, lenders appraise a HAM project largely on completion risk and on the quality of the annuity stream. The credit strength of the authority, the payment track record on existing projects and the termination payment provisions in the concession agreement all matter. Lenders typically want to see a capable EPC contractor with a fixed-price, date-certain contract, adequate performance security and liquidated damages that back-stop the concessionaire's obligations to the authority.",
          "Lenders also look carefully at the degree of land availability at the appointed date, the scope of change-of-scope and change-in-law provisions, and the mechanism for deductions from O&M payments. A sponsor that has priced aggressively in the bid may find that lenders apply conservative assumptions to cost and schedule, which can lead to higher equity requirements. Refinancing after construction, once the risk profile improves, is a common strategy, but it should not be assumed when the original financing is arranged.",
        ],
        bullets: [
          'Assess the authority payment record and termination payment formula.',
          'Check that EPC contract terms mirror the concession obligations, including milestones and standards.',
          'Model the gap between the annuity interest benchmark and the actual cost of project debt.',
          'Confirm land availability and clearances at the appointed date, and the remedies for delay.',
        ],
      },
      {
        heading: 'A bid-stage checklist for developers',
        body: [
          "The most expensive mistakes in HAM are usually made at the bid stage. Developers should base the bid project cost on independent quantity estimates and ground investigations rather than on the authority's indicative cost alone. They should assess how much of the right of way is actually available and what the realistic timeline is for the remainder. They should also consider the interaction between milestone definitions for construction support and their own construction programme, since mismatches can strain cash flow.",
          "Finally, developers should model the project under a range of interest rate and inflation scenarios, test the impact of a delay in commercial operation, and price O&M with a realistic view of the maintenance regime required over the operations period. A disciplined bid may win fewer projects, but it reduces the risk of stressed assets and preserves the sponsor's credibility with lenders for future concessions.",
        ],
      },
      {
        heading: 'How Spine Advisory can help',
        body: [
          "Spine Advisory works with developers, contractors, lenders and public authorities on highway PPP transactions. For developers, our services include bid-stage financial modelling, review of the concession agreement and risk allocation, assessment of right of way and approvals, and preparation of information packages for lenders. We help sponsors understand how sensitive their returns are to cost, schedule, interest rate and inflation assumptions before they commit to a bid.",
          "For lenders and investors, we provide independent review of financial models, concession terms and project documents, and support refinancing and asset acquisition diligence. For authorities, we assist in project structuring, preparation of bid documents and transaction management. In each case, our focus is on aligning risk allocation with the party best able to manage it, so that projects are both bankable and good value for the public.",
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the Hybrid Annuity Model in Indian highways?',
        a: 'The Hybrid Annuity Model is a PPP structure in which the authority pays 40% of the bid project cost during construction and the concessionaire funds the remaining 60%. The concessionaire recovers its share through semi-annual annuities with interest during operations, while the authority collects tolls and bears traffic risk.',
      },
      {
        q: 'Who bears traffic risk under HAM?',
        a: "The authority bears traffic risk under HAM, because it collects tolls and pays the concessionaire fixed annuities regardless of traffic volumes. The concessionaire's returns therefore depend on building the road on time and within budget, maintaining it to the required standards, and the authority meeting its payment obligations.",
      },
      {
        q: 'How is inflation handled in HAM concessions?',
        a: 'Inflation is handled through a price index multiple that combines the Wholesale Price Index and the Consumer Price Index for Industrial Workers. The multiple adjusts the bid project cost and related payments, protecting part of the cost base, although it may not exactly match the developer’s actual input cost changes.',
      },
      {
        q: 'Why do lenders focus on completion risk in HAM projects?',
        a: 'Lenders focus on completion risk because annuity payments begin only after commercial operation, so delays increase interest costs and postpone revenue. Since traffic risk sits with the authority, the main uncertainties are construction cost, schedule, land availability and approvals, which lenders assess through EPC terms, contingencies and security packages.',
      },
    ],
  },
  {
    slug: 'sagarmala-port-modernisation',
    title:
      'Port Modernisation Under Sagarmala: Landlord Models, Terminal Concessions and Logistics Cost',
    category: 'Maritime & EXIM',
    banner: 'port-dusk',
    published: '2024-10-10',
    readingMinutes: 6,
    metaDescription:
      "How Sagarmala, the landlord port model and the Major Port Authorities Act 2021 shape terminal concessions and India's logistics cost debate.",
    summary:
      "India's port modernisation rests on the landlord model, PPP terminal concessions and better hinterland connectivity; the logistics cost debate shows why measurement matters as much as investment.",
    takeaways: [
      'Sagarmala, launched in 2015, links port modernisation with port connectivity, port-led industrialisation and coastal community development.',
      'Major ports increasingly follow a landlord model, in which the port authority owns land and basic infrastructure while private operators run terminals under concessions.',
      'The Major Port Authorities Act, 2021 replaced the Major Port Trusts Act, 1963, giving port boards greater autonomy and changing how PPP tariffs are set.',
      "India's logistics cost has commonly been cited at 13–14% of GDP, while an NCAER assessment for DPIIT in 2023 estimated 7.8–8.9% of GDP for 2021-22; the gap reflects methodology.",
    ],
    sections: [
      {
        heading: 'Sagarmala and the policy context',
        body: [
          "The Sagarmala programme was approved in 2015 as the government's flagship initiative for port-led development. Its scope goes beyond port capacity. The programme groups projects into port modernisation and new port development, port connectivity by road, rail, coastal shipping and inland waterways, port-led industrialisation through coastal economic zones and clusters, and coastal community development. This framing recognises that a port's competitiveness depends on the whole logistics chain, not only on berth productivity or crane rates.",
          "Sagarmala now sits within a wider policy set. PM Gati Shakti, launched in October 2021, provides a national master plan platform for coordinating infrastructure across ministries. The National Logistics Policy, released in September 2022, sets out a framework for reducing logistics costs and improving performance. The Maritime India Vision 2030 outlines longer-term goals for the sector. For investors, the practical consequence is that port projects are increasingly assessed for their connectivity and integration with these programmes, not as stand-alone assets.",
        ],
      },
      {
        heading: 'The landlord port model',
        body: [
          "In a landlord port, the port authority owns the land and the basic infrastructure, such as breakwaters, channels and common access, and acts as regulator and planner. Private operators finance, build and operate terminals and their equipment under long-term concessions, and pay the authority a revenue share or royalty. The model separates the public role of planning and stewardship from the commercial role of running cargo operations, and it allows port authorities to attract private capital and operating expertise.",
          "India's major ports have moved steadily towards this model, with a growing share of capacity operated by private terminal operators. The transition is not complete; some berths are still operated by the port authorities themselves, and the balance varies by port. The direction of policy, however, is clear: port authorities are expected to focus on planning, common infrastructure, land management and oversight, while operations are progressively handed to concessionaires through competitive bidding.",
        ],
      },
      {
        heading: 'The Major Port Authorities Act, 2021',
        body: [
          "The Major Port Authorities Act, 2021 replaced the Major Port Trusts Act, 1963 and reconstituted the major port trusts as major port authorities with professional boards. The Act gives boards greater autonomy in decisions on land use, tariffs for services provided by the authority, and the raising of resources. It also replaced the earlier tariff-setting role of the Tariff Authority for Major Ports with a different framework, including an adjudicatory board to deal with disputes.",
          "For PPP terminal operators, an important change is that tariffs for PPP projects are to be set by the concessionaire in line with market conditions, subject to the terms of the concession agreement. This reduces regulatory uncertainty that previously affected bidding and operations under tariff caps. However, the transition from older concession agreements to the new framework has raised questions on legacy contracts, and investors should review the provisions that apply to each specific terminal.",
        ],
        bullets: [
          'Confirm whether the concession was awarded under the earlier or the current regulatory regime.',
          'Review how tariff freedom interacts with revenue share and performance standards.',
          'Identify the forum for disputes and the role of the adjudicatory board.',
        ],
      },
      {
        heading: 'Terminal concessions: what drives value',
        body: [
          "Terminal concessions at major ports are generally awarded through competitive bidding, with revenue share to the port authority a common bid parameter. Value is driven by cargo volumes, the cargo mix, achievable tariffs, competition from nearby ports and terminals, and the efficiency of hinterland connectivity. Bidders must also consider minimum guaranteed throughput obligations, performance standards and the authority's commitments on dredging, channel depth and common infrastructure, which affect the vessel sizes the terminal can handle.",
          "Risk allocation in port concessions differs from highways because volume risk usually sits with the operator. A terminal's revenues depend on attracting shipping lines and cargo owners, so market studies, customer commitments and an honest view of competition are central to bankability. Lenders will examine the concession term, termination payment provisions, the treatment of capacity additions by the authority at the same port, and the operator's ability to manage tariff and volume risk over a long period.",
        ],
        bullets: [
          'Test volume forecasts against competing terminals and ports in the same catchment.',
          'Check the authority obligations on draft, dredging and common user infrastructure.',
          'Review provisions on additional capacity at the same port during the concession term.',
          'Model revenue share sensitivity under lower tariff and volume scenarios.',
        ],
      },
      {
        heading: 'Reading the logistics cost numbers',
        body: [
          "India's logistics cost has for many years been cited at around 13–14% of GDP, a figure frequently used in policy documents and commentary to argue for investment in ports, rail and roads. In 2023, an assessment by the National Council of Applied Economic Research for the Department for Promotion of Industry and Internal Trade estimated logistics cost at 7.8–8.9% of GDP for 2021-22. The difference between these figures reflects differences in methodology, data sources and the definition of logistics cost.",
          "For practitioners, the lesson is to treat any single headline figure with caution. Both estimates indicate that logistics efficiency matters for competitiveness, but project appraisal should rely on corridor-specific data on transit times, dwell times, handling charges and modal shares rather than national averages. A port project that reduces the total cost of moving cargo from a specific hinterland to the world market has a stronger case than one justified only by a national statistic.",
        ],
      },
      {
        heading: 'How Spine Advisory can help',
        body: [
          "Spine Advisory advises port authorities, state maritime boards, terminal operators, investors and lenders on port and logistics transactions. Our services include traffic and market assessment, financial modelling of terminal concessions, review of concession agreements and risk allocation, and support through bid processes. For authorities, we assist with project structuring, preparation of bid documents and transaction management for PPP terminals and related infrastructure.",
          "We also help clients evaluate hinterland connectivity and logistics cost on specific corridors, drawing on the frameworks of Sagarmala, PM Gati Shakti and the National Logistics Policy. Our approach is to connect terminal economics with the wider logistics chain, so that investment decisions are grounded in realistic volumes, tariffs and connectivity, and concession terms are bankable for operators and lenders alike.",
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the landlord port model?',
        a: 'The landlord port model is one in which the port authority owns land and basic infrastructure and acts as planner and regulator, while private operators finance, build and run terminals under concessions. The operator usually pays the authority a revenue share or royalty and bears cargo volume risk.',
      },
      {
        q: 'What changed with the Major Port Authorities Act, 2021?',
        a: 'The Act replaced the Major Port Trusts Act, 1963 and converted major port trusts into port authorities with professional boards and greater autonomy. It ended the earlier tariff-setting role of the Tariff Authority for Major Ports, allowed PPP operators to set tariffs in line with market conditions, and created an adjudicatory board.',
      },
      {
        q: "What is India's logistics cost as a share of GDP?",
        a: 'Estimates differ: a figure of 13–14% of GDP has been widely cited for years, while a 2023 assessment by NCAER for DPIIT estimated 7.8–8.9% of GDP for 2021-22. The difference reflects methodology and definitions, so corridor-level data is more useful for project appraisal than any single national figure.',
      },
      {
        q: 'Who bears volume risk in a port terminal concession?',
        a: "The terminal operator usually bears volume risk in a port concession, because its revenues depend on attracting cargo and shipping lines. This makes market studies, competition analysis and customer commitments central to bankability, unlike highway HAM projects where the authority bears traffic risk.",
      },
    ],
  },
];

