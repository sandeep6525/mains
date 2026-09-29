/**
 * Dynamic Current Affairs to UPSC Mains Matrix
 * Maps contemporary developments to GS I-IV & Essay papers.
 * Distinguishes verified facts from analytical arguments.
 */

export const CURRENT_AFFAIRS_MAINS_MATRIX = [
  {
    id: "ca-2026-09-01",
    date: "2026-09-20",
    headline: "Supreme Court Clarifies Sub-Classification of Scheduled Castes and Article 341",
    headline_hi: "उच्चतम न्यायालय ने अनुसूचित जातियों के उप-वर्गीकरण और अनुच्छेद 341 पर स्थिति स्पष्ट की",
    source: "The Hindu & Indian Express Editorial Analysis",
    linked_papers: ["PAPER-III (GS-II)", "PAPER-II (GS-I)"],
    linked_topics: ["GS2-CONST", "GS2-SOC-JUST", "GS1-SOC"],
    syllabus_tag: "Social Justice, Affirmative Action, Constitutional Equality (Articles 14, 15, 16, 341)",
    facts_box: [
      "7-judge Constitution Bench ruled 6:1 in State of Punjab v. Davinder Singh (2024).",
      "Overruled the 2004 5-judge bench decision in E.V. Chinnaiah v. State of Andhra Pradesh.",
      "Held that sub-classification within SC/ST categories by States is constitutionally permissible to ensure substantive equality (Article 16(4)).",
      "Mandated that States must base sub-classification on quantifiable empirical data showing inadequate representation."
    ],
    arguments_analysis: [
      {
        perspective: "Arguments in Favor of Sub-classification",
        points: [
          "Addresses internal heterogeneity: Certain vulnerable sub-castes (e.g. Madigas in AP, Valmikis/Mazhabis in Punjab) remained deprived of reservation benefits.",
          "Advances 'Substantive Equality' (Aristotelian principle: treating unequals equally perpetuates inequality).",
          "Decentralizes affirmative action to target the most marginalized."
        ]
      },
      {
        perspective: "Concerns and Counter-arguments",
        points: [
          "Risk of political fragmentation and electoral vote-bank gerrymandering without robust empirical census data.",
          "Potential conflict with Article 341(2) regarding President's notification of the SC list.",
          "Debate on the applicability of creamy layer test in SC/ST categories."
        ]
      }
    ],
    ready_citations: [
      "State of Punjab v. Davinder Singh (2024)",
      "E.V. Chinnaiah v. State of A.P. (2004)",
      "Indra Sawhney v. Union of India (1992)",
      "Constitutional Articles: 14, 15(4), 16(4), 341, 342A"
    ],
    potential_mains_questions: [
      {
        id: "pmq-ca-01",
        paper_code: "GS-II",
        marks: 15,
        word_limit: 250,
        text: "“Sub-classification within reserved categories represents a paradigm shift from formal equality to substantive justice.” In light of recent judicial pronouncements, critically examine the opportunities and administrative challenges in implementing sub-quota frameworks.",
        directive: "Critically Examine"
      }
    ]
  },
  {
    id: "ca-2026-09-02",
    date: "2026-09-18",
    headline: "Operationalization of the Global Loss and Damage Fund & Climate Finance Architecture",
    headline_hi: "ग्लोबल लॉस एंड डैमेज फंड और जलवायु वित्त संरचना का संचालन",
    source: "UNFCCC COP Updates & Ministry of Environment, Forest and Climate Change (MoEFCC)",
    linked_papers: ["PAPER-IV (GS-III)", "PAPER-III (GS-II)", "PAPER-I"],
    linked_topics: ["GS3-ENV", "GS2-IR", "ESS-SEC-B"],
    syllabus_tag: "Environmental Conservation, Climate Negotiations, CBDR-RC, Global Governance",
    facts_box: [
      "Loss and Damage (L&D) Fund established at COP27 (Sharm el-Sheikh) and operationalized at COP28 (Dubai).",
      "World Bank agreed to host the fund on an interim basis with independent board governance.",
      "Global pledges currently stand at ~$700 Million against developing nations' estimated need of $400 Billion annually by 2030.",
      "Principle of Common But Differentiated Responsibilities and Respective Capabilities (CBDR-RC) reaffirmed."
    ],
    arguments_analysis: [
      {
        perspective: "Global South Standpoint (India & Vulnerable States)",
        points: [
          "Historical responsibility: Developed nations generated ~70% of historical cumulative greenhouse gas emissions.",
          "Pledges are tokenistic (<0.2% of actual economic loss from climate extreme events).",
          "Need for non-debt creating grants rather than conditional commercial climate loans."
        ]
      },
      {
        perspective: "Global North Standpoint",
        points: [
          "Pushing for expansion of contributor base to include high-emission emerging economies.",
          "Emphasis on private capital mobilization, green bonds, and risk-insurance instruments."
        ]
      }
    ],
    ready_citations: [
      "UNFCCC Paris Agreement Article 8",
      "IPCC AR6 Synthesis Report (2023)",
      "India's Panchamrit Targets (COP26) & LiFE Movement",
      "Sendai Framework for Disaster Risk Reduction"
    ],
    potential_mains_questions: [
      {
        id: "pmq-ca-02",
        paper_code: "GS-III",
        marks: 10,
        word_limit: 150,
        text: "Discuss the significance of the Loss and Damage Fund for vulnerable nations in the Global South. What are the key bottlenecks in realizing genuine climate justice?",
        directive: "Discuss"
      }
    ]
  },
  {
    id: "ca-2026-09-03",
    date: "2026-09-15",
    headline: "Implementation of the Mediation Act, 2023 & Overcoming Judicial Pendency in India",
    headline_hi: "मध्यस्थता अधिनियम, 2023 का क्रियान्वयन एवं भारत में न्यायिक लंबितता का समाधान",
    source: "Law Commission of India & Ministry of Law and Justice",
    linked_papers: ["PAPER-III (GS-II)", "PAPER-V (GS-IV)"],
    linked_topics: ["GS2-JUD", "GS2-GOV", "GS4-PROBITY"],
    syllabus_tag: "Judiciary, Alternative Dispute Resolution (ADR), Ease of Justice, Access to Justice",
    facts_box: [
      "National Judicial Data Grid (NJDG) records over 5.1 Crore pending cases across Supreme Court, High Courts, and Subordinate Courts.",
      "Mediation Act 2023 promotes voluntary and pre-litigation mediation in civil/commercial disputes.",
      "Creates the Mediation Council of India as a statutory regulator for registration and code of conduct.",
      "Enforces mediated settlement agreements with the same legal effect as court decrees."
    ],
    arguments_analysis: [
      {
        perspective: "Institutional Benefits",
        points: [
          "Decongests courts: Siphons off commercial, family, and property disputes before formal court filing.",
          "Cost and time efficiency: Confidential, non-adversarial resolution completed within statutory 180-day timeline.",
          "Improves India's Ease of Doing Business and contract enforcement metrics."
        ]
      },
      {
        perspective: "Implementation Hurdles",
        points: [
          "Infrastructure bottleneck: Lack of certified institutional mediation centers in Tier-2/3 district courts.",
          "Litigant mindset: Preference for traditional adversarial court decrees due to enforceability doubts.",
          "Capacity building needed for trained advocates and neutral community mediators."
        ]
      }
    ],
    ready_citations: [
      "Mediation Act, 2023",
      "Law Commission of India 230th & 245th Reports",
      "Article 39A (Free legal aid and equal justice)",
      "Malimath Committee recommendations on ADR"
    ],
    potential_mains_questions: [
      {
        id: "pmq-ca-03",
        paper_code: "GS-II",
        marks: 15,
        word_limit: 250,
        text: "“Institutionalization of Alternative Dispute Resolution (ADR) is indispensable for unclogging India's judicial arteries.” In this context, evaluate the salient features and operational challenges of the Mediation Act, 2023.",
        directive: "Evaluate"
      }
    ]
  }
];
