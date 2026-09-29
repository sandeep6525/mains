/**
 * Dedicated UPSC CSE Top 15 Optional Subjects Deep-Dive Data
 * Comprehensive Paper 1 & Paper 2 syllabus mapping, high-yield thinkers/theorists, and sample PYQ questions.
 */

export const OPTIONAL_SUBJECTS = [
  {
    id: "economics",
    name: "Economics",
    code: "OPT-ECON",
    category: "Business & Economics",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "Rigorous analytical study of microeconomic foundations, macroeconomic equilibria, monetary/fiscal policy, international trade theorems, growth models, and Indian economic history & post-reform policies.",
    key_thinkers: ["Adam Smith", "David Ricardo", "John Maynard Keynes", "Milton Friedman", "Paul Samuelson", "Amartya Sen", "Joseph Stiglitz", "Robert Solow", "W. Arthur Lewis", "Jagdish Bhagwati", "Joan Robinson", "Paul Krugman", "Abhijit Banerjee", "Esther Duflo"],
    papers: [
      {
        paper: "Paper 1 (Section A & B)",
        title: "Advanced Economic Theory & International Economics",
        syllabus_focus: [
          "Microeconomics: Consumer behavior, Marshallian & Hicksian demand, Market structures (Oligopoly, Monopolistic), Welfare Economics & Pareto Optimality",
          "Macroeconomics: IS-LM framework, Mundell-Fleming open economy model, Rational Expectations & New Classical economics",
          "Money, Banking & Public Finance: Theories of inflation (Phillips curve), Fiscal federalism, Optimal taxation & Public debt dynamics",
          "International Economics: Heckscher-Ohlin-Samuelson model, Krugman New Trade Theory, Balance of Payments & Exchange rate regimes",
          "Growth & Development: Harrod-Domar, Solow-Swan neoclassical model, Lewis dual sector model, Endogenous growth theory (Romer/Lucas)"
        ]
      },
      {
        paper: "Paper 2 (Section A & B)",
        title: "Indian Economy in Pre-Independence Era & Post-1991 Reforms",
        syllabus_focus: [
          "Pre-Independence Era: Drain of wealth theory (Naoroji, Dutt), Commercialization of agriculture, De-industrialization & Colonial land tenure systems",
          "Planning & Development Strategies: Mahalanobis strategy, Green Revolution, 1991 LPG reforms & structural adjustments",
          "Agriculture & Rural Development: Land reforms, MSP, Food security, Agricultural credit & Capital formation",
          "Industry, Infrastructure & Services: Disinvestment, National Manufacturing Policy, MSMEs & Digital Public Infrastructure (DPI)",
          "Money, Banking & External Sector: Inflation targeting framework (MPC), Twin balance sheet problem, Foreign trade trends & FTAs"
        ]
      }
    ],
    sample_question: {
      year: 2024,
      marks: 20,
      directive: "Critically Examine",
      text: "“The Mundell-Fleming model demonstrates the trilemma (impossible trinity) facing central banks in an era of global capital mobility.” Critically examine the policy choices made by the Reserve Bank of India in managing the trilemma."
    }
  },
  {
    id: "psir",
    name: "Political Science & International Relations (PSIR)",
    code: "OPT-PSIR",
    category: "Humanities & Social Sciences",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "Blend of classical political philosophy, Indian constitutional dynamics, comparative politics, and dynamic geopolitical foreign policy.",
    key_thinkers: ["Plato", "Aristotle", "Machiavelli", "Hobbes", "Locke", "Rousseau", "J.S. Mill", "Karl Marx", "Gramsci", "Hannah Arendt", "Kautilya", "B.R. Ambedkar", "M.K. Gandhi", "Hans Morgenthau", "Kenneth Waltz", "Alexander Wendt"],
    papers: [
      {
        paper: "Paper 1 (Section A & B)",
        title: "Political Theory and Indian Politics",
        syllabus_focus: [
          "Theories of Justice (Rawls, Nozick, Amartya Sen) & Theories of Rights",
          "Western & Indian Political Thought: Plato, Aristotle, Machiavelli, Mill, Marx, Kautilya, Gandhi, Ambedkar",
          "Indian National Movement & Constitutional Evolution: Making of the Constitution, Fundamental Rights, DPSP",
          "Party System, Social Movements & Federalism in Indian Politics"
        ]
      },
      {
        paper: "Paper 2 (Section A & B)",
        title: "Comparative Politics and International Relations",
        syllabus_focus: [
          "Theories of IR: Realism, Liberalism, Marxist & Constructivist approaches",
          "Global Economic Order (WTO, IMF, World Bank, BRICS, G20)",
          "India's Foreign Policy Evolution: Non-Alignment to Strategic Autonomy",
          "India-US, India-China, Global South Leadership & Maritime Indo-Pacific dynamics"
        ]
      }
    ],
    sample_question: {
      year: 2024,
      marks: 20,
      directive: "Comment",
      text: "“Rawls's theory of justice as fairness combines the values of liberty and equality in a lexically ordered manner.” Comment with reference to Amartya Sen's 'Realization-focused Niti' critique."
    }
  },
  {
    id: "sociology",
    name: "Sociology",
    code: "OPT-SOC",
    category: "Humanities & Social Sciences",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "Rigorous study of social structures, institutions, sociological paradigms, and the evolving fabric of contemporary Indian society.",
    key_thinkers: ["Karl Marx", "Max Weber", "Émile Durkheim", "Talcott Parsons", "Robert K. Merton", "G.H. Mead", "G.S. Ghurye", "M.N. Srinivas", "A.R. Desai", "Yogendra Singh", "Andre Beteille", "Leela Dube"],
    papers: [
      {
        paper: "Paper 1 (Section A & B)",
        title: "Fundamentals of Sociology",
        syllabus_focus: [
          "Sociology as Science, Quantitative & Qualitative research methodologies",
          "Sociological Thinkers: Marx (Historical Materialism), Weber (Social Action), Durkheim (Suicide, Religion)",
          "Social Stratification: Hierarchy, Class, Gender and Social Mobility",
          "Politics and Society: Power elite, Bureaucracy, Social movements and Religion"
        ]
      },
      {
        paper: "Paper 2 (Section A & B)",
        title: "Indian Society: Structure and Change",
        syllabus_focus: [
          "Indology, Structural-Functionalism & Marxist perspectives on Indian society",
          "Caste System: Features, Untouchability, Dominant caste & OBC mobilizations",
          "Agrarian Social Structure & Impact of Green Revolution and Land Reforms",
          "Tribal Communities, Women's Movements, Communalism & Secularization"
        ]
      }
    ],
    sample_question: {
      year: 2024,
      marks: 20,
      directive: "Critically Examine",
      text: "“Sanskritization and Westernization operate concurrently rather than sequentially in shaping contemporary Indian social mobility.” Critically examine M.N. Srinivas's formulation."
    }
  },
  {
    id: "pubad",
    name: "Public Administration",
    code: "OPT-PUBAD",
    category: "Legal & Governance",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "Exploration of administrative theory, organizational behavior, public policy, civil services reforms, and district governance.",
    key_thinkers: ["Woodrow Wilson", "F.W. Taylor", "Max Weber", "Chester Barnard", "Herbert Simon", "Chris Argyris", "Dwight Waldo", "Fred W. Riggs", "Yehezkel Dror", "Peter Drucker"],
    papers: [
      {
        paper: "Paper 1",
        title: "Administrative Theory",
        syllabus_focus: [
          "Evolution of Public Administration, Classical vs Behavioral paradigms",
          "Administrative Behavior & Decision-Making (Simon's Bounded Rationality)",
          "Accountability, Control & Citizen's Charters",
          "New Public Management, Digital Era Governance & Prismatic Ecology (Riggs)"
        ]
      },
      {
        paper: "Paper 2",
        title: "Indian Administration",
        syllabus_focus: [
          "Historical legacy (Kautilyan, Mughal, British) to Post-Independence structure",
          "Union Executive: PMO, Cabinet Secretariat, National Institution for Transforming India (NITI)",
          "District Administration: Role of Collector, Law and Order & 73rd/74th Constitutional Amendments",
          "Civil Services Reforms: Lateral Entry, Mission Karmayogi & 2nd ARC Recommendations"
        ]
      }
    ],
    sample_question: {
      year: 2023,
      marks: 15,
      directive: "Discuss",
      text: "“New Public Governance replaces the command-and-control paradigm with networked collaborative ecosystems.” Discuss in the context of digital public infrastructure in India."
    }
  },
  {
    id: "geography",
    name: "Geography",
    code: "OPT-GEO",
    category: "STEM & Applied Sciences",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "Spatial science integrating physical landforms, climatology, oceanography, biogeography, human settlements, and economic regional planning.",
    key_thinkers: ["W.M. Davis", "Walther Penck", "W. Koppen", "C.W. Thornthwaite", "Walter Christaller", "Alfred Weber", "J.H. Von Thunen", "Halford Mackinder", "Nicholas Spykman"],
    papers: [
      {
        paper: "Paper 1",
        title: "Principles of Geography",
        syllabus_focus: [
          "Geomorphology: Plate tectonics, Cycle of erosion (Davis vs Penck), Channel morphology",
          "Climatology: Jet streams, El Niño/La Niña, Indian Monsoon dynamics & Global climate models",
          "Oceanography & Biogeography: Ocean currents, Coral bleaching, Marine resources",
          "Human Geography: Central Place Theory, Von Thunen agricultural model, Population theories"
        ]
      },
      {
        paper: "Paper 2",
        title: "Geography of India",
        syllabus_focus: [
          "Physical Setting: Drainage systems, Physiographic divisions, Geological structure",
          "Resources & Agriculture: Green/Blue/White revolutions, Irrigation networks, Energy crisis",
          "Industry & Transport: Industrial corridors, Multimodal logistics (Gati Shakti)",
          "Regional Planning & Contemporary Issues: River interlinking, Urban flooding, Island development"
        ]
      }
    ],
    sample_question: {
      year: 2024,
      marks: 20,
      directive: "Explain",
      text: "Explain the morphological characteristics and evolutionary dynamics of Karst topography with suitable structural diagrams."
    }
  },
  {
    id: "history",
    name: "History",
    code: "OPT-HIST",
    category: "Humanities & Social Sciences",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "Comprehensive analytical survey of archaeological sources, ancient, medieval, modern Indian history, and landmark world historical transformations.",
    key_thinkers: ["R.C. Majumdar", "Romila Thapar", "D.D. Kosambi", "R.S. Sharma", "Satish Chandra", "Irfan Habib", "Bipan Chandra", "Sumit Sarkar", "E.J. Hobsbawm"],
    papers: [
      {
        paper: "Paper 1",
        title: "Ancient & Medieval India",
        syllabus_focus: [
          "Archaeological Sites & Map Work: Paleolithic to Harappan civilization",
          "Vedic Period, Rise of Mahajanapadas, Mauryan Administration, Gupta Golden Age",
          "Early Medieval Feudalism Debate, Chola Maritime Trade",
          "Delhi Sultanate, Mughal Agrarian Economy, Vijayanagara Empire & Bhakti/Sufi Movements"
        ]
      },
      {
        paper: "Paper 2",
        title: "Modern India & World History",
        syllabus_focus: [
          "Colonial Rule: Permanent Settlement, Drain of Wealth, 1857 Revolt",
          "Indian Freedom Movement: Moderates, Extremists, Gandhian Mass Movements, Partition",
          "Enlightenment, Industrial Revolution, American & French Revolutions",
          "World Wars, Rise of Fascism, Russian Revolution, Cold War & Decolonization"
        ]
      }
    ],
    sample_question: {
      year: 2024,
      marks: 20,
      directive: "Critically Examine",
      text: "“The Bhakti movement in medieval India acted as both a religious revitalization and an egalitarian social protest against orthodoxy.” Critically examine."
    }
  },
  {
    id: "anthropology",
    name: "Anthropology",
    code: "OPT-ANTHRO",
    category: "STEM & Applied Sciences",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "Holistic science of humankind covering human biological evolution, genetics, socio-cultural institutions, and Indian tribal ethnography.",
    key_thinkers: ["E.B. Tylor", "L.H. Morgan", "Franz Boas", "Bronislaw Malinowski", "A.R. Radcliffe-Brown", "Claude Lévi-Strauss", "Clifford Geertz", "L.P. Vidyarthi", "Nirmal Kumar Bose", "Verrier Elwin"],
    papers: [
      {
        paper: "Paper 1",
        title: "Physical & Socio-Cultural Anthropology",
        syllabus_focus: [
          "Human Evolution: Primatology, Fossil hominids (Australopithecus, Homo erectus, Neanderthal)",
          "Human Genetics: DNA, Hardy-Weinberg equilibrium, Mendelian genetics",
          "Socio-Cultural Anthropology: Marriage, Family, Kinship, Economic & Political systems",
          "Theories of Culture: Cultural Evolutionism, Historical Particularism, Functionalism"
        ]
      },
      {
        paper: "Paper 2",
        title: "Indian Anthropology & Tribal Studies",
        syllabus_focus: [
          "Indian Paleolithic to Harappa, Vedic foundation & Great Tradition vs Little Tradition",
          "Caste System: Dominant Caste, Jajmani System & Tribe-Caste Continuum",
          "Tribal India: Problems of Land Alienation, Indebtedness, Forest Rights Act 2006",
          "Tribal Administration: 5th & 6th Schedules, Particularly Vulnerable Tribal Groups (PVTGs)"
        ]
      }
    ],
    sample_question: {
      year: 2024,
      marks: 15,
      directive: "Discuss",
      text: "Discuss the evolutionary significance of Australopithecus in hominization with anatomical evidence of bipedalism."
    }
  },
  {
    id: "philosophy",
    name: "Philosophy",
    code: "OPT-PHIL",
    category: "Humanities & Social Sciences",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "In-depth study of Indian epistemology & metaphysics (Nyaya, Sankhya, Advaita Vedanta, Buddhism, Jainism), Western philosophy (Rationalism, Empiricism, Kant, Phenomenology), Socio-Political philosophy, and Philosophy of Religion.",
    key_thinkers: ["Adi Shankara", "Nagarjuna", "Ramanuja", "Gautama (Nyaya)", "Kanada", "Plato", "Aristotle", "Descartes", "Spinoza", "Leibniz", "John Locke", "David Hume", "Immanuel Kant", "G.W.F. Hegel", "Wittgenstein", "Jean-Paul Sartre"],
    papers: [
      {
        paper: "Paper 1 (Section A & B)",
        title: "History and Problems of Philosophy (Indian & Western)",
        syllabus_focus: [
          "Indian Philosophy: Carvaka, Jainism (Syadvada), Buddhism (Pratityasamutpada, Kshanikavada), Nyaya Epistemology (Pramanas), Advaita Vedanta (Maya, Brahman)",
          "Western Philosophy: Rationalism (Descartes Cogito), Empiricism (Hume's skepticism), Kant's Synthetic A Priori, Logical Positivism & Existentialism"
        ]
      },
      {
        paper: "Paper 2 (Section A & B)",
        title: "Socio-Political Philosophy & Philosophy of Religion",
        syllabus_focus: [
          "Socio-Political: Equality, Justice (Rawls), Liberty, Democracy, Human Rights, Gender equality, Sovereignty & Gandhian Swaraj",
          "Philosophy of Religion: Proofs for existence of God, Problem of Evil, Religious pluralism, Immortality of Soul & Religious Experience"
        ]
      }
    ],
    sample_question: {
      year: 2024,
      marks: 20,
      directive: "Critically Evaluate",
      text: "“Kant's Copernican Revolution in epistemology bridges rationalism and empiricism through synthetic a priori propositions.” Critically evaluate."
    }
  },
  {
    id: "law",
    name: "Law",
    code: "OPT-LAW",
    category: "Legal & Governance",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "Comprehensive study of Constitutional & Administrative Law, International Law, Law of Crimes, Law of Torts, Mercantile Law, and Contemporary Legal Reforms.",
    key_thinkers: ["John Austin", "H.L.A. Hart", "Hans Kelsen", "Roscoe Pound", "Lon Fuller", "Jeremy Bentham", "Hugo Grotius", "Sir Hersch Lauterpacht", "Lord Denning", "Justice V.R. Krishna Iyer", "Justice P.N. Bhagwati"],
    papers: [
      {
        paper: "Paper 1",
        title: "Constitutional & Administrative Law + International Law",
        syllabus_focus: [
          "Constitutional Law: Basic Structure, Judicial Review, Separation of Powers, Fundamental Rights & Emergency Provisions",
          "Administrative Law: Natural Justice, Delegated Legislation, Judicial Control over Administrative Action, Ombudsman (Lokpal)",
          "International Law: Sources of International Law, State Recognition & Succession, Law of the Sea (UNCLOS), Extradition, Use of Force & UN Charter"
        ]
      },
      {
        paper: "Paper 2",
        title: "Law of Crimes, Torts, Contracts & Mercantile Law",
        syllabus_focus: [
          "Law of Crimes (Bharatiya Nyaya Sanhita / IPC): General principles, Mens Rea, Defences, Culpable Homicide vs Murder, Cybercrimes",
          "Law of Torts: Strict & Absolute Liability, Defamation, Vicarious Liability, Consumer Protection Act",
          "Law of Contracts & Mercantile: Formation, Validity, Breach & Remedies, Arbitration and Conciliation, Competition Act, IP Law (Patents, Copyrights)"
        ]
      }
    ],
    sample_question: {
      year: 2024,
      marks: 20,
      directive: "Examine",
      text: "“The doctrine of Absolute Liability propounded in M.C. Mehta v. Union of India departs significantly from the Rule in Rylands v. Fletcher.” Examine the jurisprudential rationale and contemporary environmental significance."
    }
  },
  {
    id: "commerce",
    name: "Commerce & Accountancy",
    code: "OPT-COMM",
    category: "Business & Economics",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "Professional discipline covering Financial Accounting, Cost Management, Auditing, Corporate Tax Planning, Financial Markets, Human Resource Management, and Industrial Relations.",
    key_thinkers: ["Luca Pacioli", "F.W. Taylor", "Elton Mayo", "Michael Porter", "Eugene Fama", "Modigliani & Miller", "Harry Markowitz", "Henry Fayol"],
    papers: [
      {
        paper: "Paper 1",
        title: "Accounting, Auditing, Taxation & Financial Management",
        syllabus_focus: [
          "Financial Accounting & Ind AS: Standards, Valuation of Shares, Corporate Restructuring & Amalgamation",
          "Cost Accounting & Auditing: Marginal costing, Standard costing, Internal control, Forensic Auditing & Statutory audits",
          "Taxation: Corporate Tax planning, GST architecture, Transfer pricing & International taxation",
          "Financial Management: Capital Structure (MM Hypothesis, Traditional), Capital Budgeting (NPV, IRR), Working capital & Dividend theories"
        ]
      },
      {
        paper: "Paper 2",
        title: "Organization Theory, Organizational Behavior & Industrial Relations",
        syllabus_focus: [
          "Organization Theory: Classical, Neo-classical & Modern systems theories, Organizational design and culture",
          "Organizational Behavior: Motivation theories (Maslow, Herzberg, Vroom), Leadership styles, Conflict management & Change dynamics",
          "HRM & Industrial Relations: Recruitment, Performance appraisal, Collective bargaining, Industrial Disputes Act & Labour Codes 2020"
        ]
      }
    ],
    sample_question: {
      year: 2024,
      marks: 20,
      directive: "Critically Analyze",
      text: "“Modigliani-Miller theorem asserts that under perfect market conditions, dividend policy is irrelevant to company valuation.” Critically analyze the validity of this assertion in the context of emerging market dividend signaling."
    }
  },
  {
    id: "psychology",
    name: "Psychology",
    code: "OPT-PSYCH",
    category: "STEM & Applied Sciences",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "Scientific study of behavioral foundations, cognitive processes (learning, memory, intelligence), personality theories, psychopathology, organizational psychology, and psychological interventions in public policy.",
    key_thinkers: ["Sigmund Freud", "Carl Jung", "B.F. Skinner", "Jean Piaget", "Lev Vygotsky", "Albert Bandura", "Abraham Maslow", "Carl Rogers", "Daniel Kahneman", "Amos Tversky", "Martin Seligman"],
    papers: [
      {
        paper: "Paper 1",
        title: "Foundations of Psychology",
        syllabus_focus: [
          "Research Methods: Experimental, Correlational, Psychological testing (Reliability, Validity)",
          "Cognition & Learning: Classical & Operant conditioning, Information processing model of memory, Creativity & Problem solving",
          "Intelligence & Personality: Gardner's Multiple Intelligences, Big Five model, Psychoanalytic vs Humanistic theories",
          "Motivation & Emotion: Biological and social motives, Cognitive appraisal theory of emotion, Stress and Coping mechanisms"
        ]
      },
      {
        paper: "Paper 2",
        title: "Issues and Applied Psychology",
        syllabus_focus: [
          "Psychological Measurement & Mental Health: DSM-5 diagnostic criteria, Psychotherapies (CBT, Psychodynamic)",
          "Applied Social Psychology: Prejudice, Group dynamics, Social influence, Attitude change",
          "Organizational Psychology: Personnel selection, Leadership, Burnout, Work-life balance",
          "Psychology in National Development: Gender empowerment, Disadvantaged groups, Cyberpsychology & Defense personnel resilience"
        ]
      }
    ],
    sample_question: {
      year: 2024,
      marks: 15,
      directive: "Discuss",
      text: "Discuss Daniel Kahneman's Dual-System Theory (System 1 vs System 2) in the context of cognitive biases influencing administrative decision-making."
    }
  },
  {
    id: "agriculture",
    name: "Agriculture",
    code: "OPT-AGRI",
    category: "STEM & Applied Sciences",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "Applied agricultural science covering Agronomy, Agro-climatic zones, Soil science & Nutrient management, Plant breeding & Genetics, Plant pathology, Horticulture, and Agricultural Economics & Extension.",
    key_thinkers: ["M.S. Swaminathan", "Norman Borlaug", "Gregor Mendel", "V.P. Singh", "Justus von Liebig", "C.T. Patel"],
    papers: [
      {
        paper: "Paper 1",
        title: "Ecology, Agronomy, Soil Science & Agricultural Economics",
        syllabus_focus: [
          "Agro-ecology & Climate Resilient Agriculture: Cropping systems, Precision farming, Organic & Natural farming",
          "Soil Science: Soil fertility, Soil degradation, Saline/Alkali reclamation, Micro-irrigation techniques (Drip, Sprinkler)",
          "Weed Management & Water Conservation: Integrated Weed Management, Watershed development",
          "Agricultural Economics: MSP mechanisms, e-NAM, FPOs, Crop insurance (PMFBY), WTO Agriculture Agreement & Green Box subsidies"
        ]
      },
      {
        paper: "Paper 2",
        title: "Genetics, Plant Breeding, Seed Tech, Physiology & Horticulture",
        syllabus_focus: [
          "Genetics & Plant Breeding: Mendelian inheritance, Heterosis breeding, Molecular markers, CRISPR-Cas9 in crop improvement",
          "Seed Technology: Seed certification, Breeder-Foundation-Certified seed chain, GM crops regulation",
          "Plant Physiology & Horticulture: Photosynthesis, Transpiration, Post-harvest technology, High-density orcharding & Floriculture",
          "Plant Protection: Integrated Pest Management (IPM), Biological control, Major diseases of Rice, Wheat, Cotton & Sugarcane"
        ]
      }
    ],
    sample_question: {
      year: 2024,
      marks: 20,
      directive: "Evaluate",
      text: "Evaluate the role of Climate-Smart Agriculture (CSA) and genome editing (CRISPR/Cas9) in enhancing agricultural productivity and nutritional security in drought-prone agro-climatic zones of India."
    }
  },
  {
    id: "mathematics",
    name: "Mathematics",
    code: "OPT-MATH",
    category: "STEM & Applied Sciences",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "Rigorous mathematical sciences including Linear Algebra, Real Analysis, Vector Calculus, Ordinary/Partial Differential Equations, Complex Analysis, Mechanics & Fluid Dynamics, and Numerical Analysis.",
    key_thinkers: ["Carl Friedrich Gauss", "Leonhard Euler", "Bernhard Riemann", "Isaac Newton", "Augustin-Louis Cauchy", "Joseph-Louis Lagrange", "Srinivasa Ramanujan", "Henri Poincaré"],
    papers: [
      {
        paper: "Paper 1",
        title: "Linear Algebra, Calculus, 3D Geometry, ODE & Vector Analysis",
        syllabus_focus: [
          "Linear Algebra: Vector spaces, Linear transformations, Rank-Nullity theorem, Eigenvalues/Eigenvectors, Cayley-Hamilton theorem",
          "Calculus & Real Analysis: Continuity, Differentiability, Taylor's series, Maxima/Minima of several variables, Riemann integration",
          "3D Analytic Geometry: Planes, Lines, Sphere, Cone, Cylinder, Conicoids",
          "Ordinary Differential Equations: First and higher-order ODEs, Method of variation of parameters, Laplace transforms",
          "Vector Analysis: Gradient, Divergence, Curl, Gauss Divergence theorem, Stokes' theorem & Green's theorem"
        ]
      },
      {
        paper: "Paper 2",
        title: "Modern Algebra, Complex Analysis, PDE, Mechanics & Fluid Dynamics",
        syllabus_focus: [
          "Modern Algebra: Groups, Subgroups, Homomorphisms, Sylow theorems, Rings, Integral domains, Fields",
          "Complex Analysis: Analytic functions, Cauchy-Riemann equations, Cauchy's Integral Formula, Residue theorem",
          "Partial Differential Equations: Charpit's method, Monge's method, Wave/Heat/Laplace equations",
          "Mechanics & Fluid Dynamics: Generalized coordinates, D'Alembert's principle, Euler's equations of motion, Navier-Stokes formulation",
          "Numerical Analysis: Newton-Raphson method, Runge-Kutta methods, Linear Programming (Simplex method)"
        ]
      }
    ],
    sample_question: {
      year: 2024,
      marks: 20,
      directive: "Solve & Prove",
      text: "Using the Residue Theorem of complex integration, evaluate the integral ∫₀^∞ (cos(mx) / (x² + a²)) dx, where m > 0 and a > 0."
    }
  },
  {
    id: "management",
    name: "Management",
    code: "OPT-MGMT",
    category: "Business & Economics",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "Strategic corporate and public enterprise management covering Managerial Economics, Financial Management, Marketing Management, Operations Strategy, Human Resource Management, and Strategic Leadership.",
    key_thinkers: ["Peter Drucker", "Michael Porter", "Philip Kotler", "C.K. Prahalad", "Clayton Christensen", "Henry Mintzberg", "W. Edwards Deming", "Eliyahu Goldratt"],
    papers: [
      {
        paper: "Paper 1",
        title: "Managerial Economics, Org Behavior, HR & Financial Management",
        syllabus_focus: [
          "Managerial Economics: Demand analysis, Cost-Volume-Profit analysis, Pricing strategies under imperfect markets",
          "Organizational Behavior: Leadership styles, Transformational leadership, Organization culture, Power and Politics",
          "Human Resource Management: Talent acquisition, Succession planning, Performance management & Competency mapping",
          "Financial Management: Corporate valuation, Mergers and Acquisitions (M&A), Capital structure optimization & Risk management"
        ]
      },
      {
        paper: "Paper 2",
        title: "Marketing, Operations, Information Systems & Strategic Management",
        syllabus_focus: [
          "Marketing Management: STP strategy (Segmentation, Targeting, Positioning), Digital marketing, Brand equity & CRM",
          "Operations Management: Supply Chain Management, Six Sigma, Lean manufacturing, Total Quality Management (TQM), Agile project management",
          "Management Information Systems: Enterprise Resource Planning (ERP), Big Data Analytics, Cloud computing in business",
          "Strategic Management: Porter's Five Forces, Blue Ocean Strategy, Core Competencies, ESG (Environmental, Social, Governance) compliance"
        ]
      }
    ],
    sample_question: {
      year: 2024,
      marks: 20,
      directive: "Critically Evaluate",
      text: "“Digital public infrastructure and platform ecosystems have redefined traditional Porter's Five Forces competitive advantages.” Critically evaluate with case studies of Indian fintech unicorns."
    }
  },
  {
    id: "hindi_lit",
    name: "Hindi Literature (हिंदी साहित्य)",
    code: "OPT-HINDI-LIT",
    category: "Humanities & Social Sciences",
    total_marks: 500,
    status: "Live & Fully Verified",
    overview: "Comprehensive study of Hindi language history, grammar, Apabhramsha evolution, medieval Bhakti/Reeti poetry (Kabir, Sur, Tulsi, Bihari), modern poetry (Chhayavad, Pragativad, Prayogvad), prose, novels (Godan), and dramatic texts.",
    key_thinkers: ["Acharya Ramchandra Shukla", "Hazari Prasad Dwivedi", "Kabir", "Surdas", "Tulsidas", "Bihari", "Bharatendu Harishchandra", "Jaishankar Prasad", "Suryakant Tripathi Nirala", "Munshi Premchand", "Ramdhari Singh Dinkar", "Phanishwar Nath Renu", "Mohan Rakesh"],
    papers: [
      {
        paper: "Paper 1 (Section A & B)",
        title: "हिंदी भाषा एवं साहित्य का इतिहास",
        syllabus_focus: [
          "Section A: हिंदी भाषा और नागरी लिपि का इतिहास: अपभ्रंश, अवहट्ठ, ब्रजभाषा, अवधी एवं खड़ी बोली का विकास, देवनागरी लिपि के मानकीकरण का प्रयास",
          "Section B: हिंदी साहित्य का इतिहास: आदिकाल (सिद्ध, नाथ, रासो), भक्तिकाल (कबीर, जायसी, सूर, तुलसी), रीतिकाल एवं आधुनिक काल (भारतेंदु, द्विवेदी युग, छायावाद, प्रगतिवाद, प्रयोगवाद, नई कविता, उपन्यास, कहानी, नाटक एवं आलोचना)"
        ]
      },
      {
        paper: "Paper 2 (Section A & B)",
        title: "पद्य एवं गद्य कृतियां (गंभीर अध्ययन)",
        syllabus_focus: [
          "Section A (पद्य): कबीर ग्रंथावली, सूरसागर सार, रामचरितमानस (सुंदरकांड), बिहारी रत्नाकर, कामायनी (चिंता, श्रद्धा, लज्जा सर्ग), राम की शक्ति पूजा, कुरुक्षेत्र",
          "Section B (गद्य): भारत दुर्दशा, स्कंदगुप्त, आषाढ़ का एक दिन, गोदान (प्रेमचंद), मैला आंचल (फणीश्वरनाथ रेणु), चिंतामणि (भाग-1), निबंध निलय"
        ]
      }
    ],
    sample_question: {
      year: 2024,
      marks: 20,
      directive: "समीक्षा कीजिए",
      text: "“गोदान भारतीय कृषक जीवन का करुण महाकाव्य होने के साथ-साथ तत्कालीन सामंती और पूंजीवादी शोषण का यथार्थवादी दस्तावेज है।” समीक्षा कीजिए।"
    }
  }
];
