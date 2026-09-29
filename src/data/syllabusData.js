/**
 * Official UPSC CSE Mains Syllabus & Micro-Topic Matrix
 * Controlling Source: UPSC CSE Official Notification & Scheme (Revised 2026)
 * Last Verified: 2026-09-01 | Version: 2026.1
 * Includes: Essay, GS I-IV, Qualifying Indian Lang (Hindi), Qualifying English, and Top 15 Optionals
 */

export const SYLLABUS_METADATA = {
  controlling_source: "Union Public Service Commission (UPSC)",
  exam_scheme: "Civil Services (Main) Examination",
  version_year: 2026,
  last_verified_date: "2026-09-01",
  total_papers: 9,
  merit_papers: 7,
  qualifying_papers: 2,
  total_marks: 1750,
  total_optionals_supported: 15
};

export const MAINS_PAPERS = [
  {
    id: "paper-1-essay",
    code: "PAPER-I",
    title: "Essay",
    title_hi: "निबंध",
    marks: 250,
    duration_hours: 3,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Candidates are required to write essays on multiple topics across philosophical, ethical, socio-economic, and technological themes.",
    micro_topics: [
      { id: "ess-1", code: "ESS-SEC-A", name: "Philosophical & Abstract Themes", name_hi: "दार्शनिक एवं अमूर्त विषय", count_pyq: 28 },
      { id: "ess-2", code: "ESS-SEC-B", name: "Socio-Economic & Sustainable Development", name_hi: "सामाजिक-आर्थिक और सतत विकास", count_pyq: 22 },
      { id: "ess-3", code: "ESS-SEC-C", name: "Science, Technology & AI Ethics", name_hi: "विज्ञान, प्रौद्योगिकी एवं एआई नैतिकता", count_pyq: 19 },
      { id: "ess-4", code: "ESS-SEC-D", name: "Governance, Democracy & Federalism", name_hi: "शासन, लोकतंत्र एवं संघवाद", count_pyq: 24 }
    ]
  },
  {
    id: "paper-2-gs1",
    code: "PAPER-II (GS-I)",
    title: "General Studies I: Heritage, History, Geography & Society",
    title_hi: "सामान्य अध्ययन I: विरासत, इतिहास, भूगोल एवं समाज",
    marks: 250,
    duration_hours: 3,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Indian Heritage and Culture, History and Geography of the World and Society.",
    micro_topics: [
      { id: "gs1-1", code: "GS1-ART", name: "Indian Art Forms, Literature & Architecture", name_hi: "भारतीय कला, साहित्य एवं वास्तुकला", count_pyq: 32 },
      { id: "gs1-2", code: "GS1-MOD-HIST", name: "Modern Indian History (1757-1947)", name_hi: "आधुनिक भारतीय इतिहास", count_pyq: 45 },
      { id: "gs1-3", code: "GS1-FREEDOM", name: "Freedom Struggle & Key Personalities", name_hi: "स्वतंत्रता संग्राम एवं महत्वपूर्ण व्यक्तित्व", count_pyq: 38 },
      { id: "gs1-4", code: "GS1-POST-IND", name: "Post-Independence Consolidation & Reorganization", name_hi: "स्वतंत्रता पश्चात पुनर्गठन", count_pyq: 18 },
      { id: "gs1-5", code: "GS1-WORLD", name: "History of the World (18th c. onwards)", name_hi: "विश्व इतिहास", count_pyq: 25 },
      { id: "gs1-6", code: "GS1-SOC", name: "Indian Society, Women's Role & Social Empowerment", name_hi: "भारतीय समाज, महिला सशक्तिकरण", count_pyq: 50 },
      { id: "gs1-7", code: "GS1-GEO-PHYS", name: "Physical Geography of India and World", name_hi: "भौतिक भूगोल", count_pyq: 42 },
      { id: "gs1-8", code: "GS1-GEO-RES", name: "Distribution of Key Natural Resources & Urbanization", name_hi: "प्राकृतिक संसाधन एवं शहरीकरण", count_pyq: 36 }
    ]
  },
  {
    id: "paper-3-gs2",
    code: "PAPER-III (GS-II)",
    title: "General Studies II: Governance, Constitution, Polity, Social Justice & IR",
    title_hi: "सामान्य अध्ययन II: शासन व्यवस्था, संविधान, राजव्यवस्था, सामाजिक न्याय एवं अंतर्राष्ट्रीय संबंध",
    marks: 250,
    duration_hours: 3,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Governance, Constitution, Polity, Social Justice and International relations.",
    micro_topics: [
      { id: "gs2-1", code: "GS2-CONST", name: "Indian Constitution: Historical Underpinnings & Basic Structure", name_hi: "भारतीय संविधान एवं मूल संरचना", count_pyq: 48 },
      { id: "gs2-2", code: "GS2-FED", name: "Federalism, Devolution of Powers & Local Governance", name_hi: "संघवाद एवं स्थानीय शासन", count_pyq: 39 },
      { id: "gs2-3", code: "GS2-JUD", name: "Judiciary, Separation of Powers & Dispute Redressal", name_hi: "न्यायपालिका एवं शक्तियों का पृथक्करण", count_pyq: 44 },
      { id: "gs2-4", code: "GS2-BODIES", name: "Constitutional, Statutory & Regulatory Bodies", name_hi: "संवैधानिक एवं विनियामक निकाय", count_pyq: 35 },
      { id: "gs2-5", code: "GS2-GOV", name: "Government Policies, Interventions & e-Governance", name_hi: "सरकारी नीतियां एवं ई-गवर्नेंस", count_pyq: 46 },
      { id: "gs2-6", code: "GS2-SOC-JUST", name: "Health, Education, Human Resource & Poverty", name_hi: "स्वास्थ्य, शिक्षा एवं गरीबी उन्मूलन", count_pyq: 52 },
      { id: "gs2-7", code: "GS2-CIVIL", name: "Role of Civil Services in a Democracy", name_hi: "लोकतंत्र में सिविल सेवाओं की भूमिका", count_pyq: 20 },
      { id: "gs2-8", code: "GS2-IR", name: "India & its Neighborhood, Bilateral & Global Groupings", name_hi: "भारत एवं इसके पड़ोसी, वैश्विक समूह", count_pyq: 60 }
    ]
  },
  {
    id: "paper-4-gs3",
    code: "PAPER-IV (GS-III)",
    title: "General Studies III: Technology, Economy, Biodiversity, Security & Disaster Mgmt",
    title_hi: "सामान्य अध्ययन III: प्रौद्योगिकी, आर्थिक विकास, जैव विविधता, सुरक्षा एवं आपदा प्रबंधन",
    marks: 250,
    duration_hours: 3,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Technology, Economic Development, Bio-diversity, Environment, Security and Disaster Management.",
    micro_topics: [
      { id: "gs3-1", code: "GS3-ECON", name: "Indian Economy, Growth, Budgeting & Inclusive Growth", name_hi: "भारतीय अर्थव्यवस्था एवं समावेशी विकास", count_pyq: 55 },
      { id: "gs3-2", code: "GS3-AGRI", name: "Agriculture, PDS, MSP, Food Processing & Irrigation", name_hi: "कृषि, सार्वजनिक वितरण प्रणाली एवं खाद्य प्रसंस्करण", count_pyq: 62 },
      { id: "gs3-3", code: "GS3-INFRA", name: "Infrastructure: Energy, Ports, Roads, Airports, Railways", name_hi: "बुनियादी ढांचा: ऊर्जा, बंदरगाह, रेलवे", count_pyq: 28 },
      { id: "gs3-4", code: "GS3-SCI-TECH", name: "Science & Tech, IT, Space, Biotech, Nano-tech & AI", name_hi: "विज्ञान एवं प्रौद्योगिकी, अंतरिक्ष, जैव प्रौद्योगिकी", count_pyq: 48 },
      { id: "gs3-5", code: "GS3-ENV", name: "Conservation, Environmental Pollution, EIA & Climate Change", name_hi: "पर्यावरण संरक्षण एवं जलवायु परिवर्तन", count_pyq: 50 },
      { id: "gs3-6", code: "GS3-DISASTER", name: "Disaster Management & Resilience Frameworks", name_hi: "आपदा प्रबंधन एवं लचीलापन", count_pyq: 34 },
      { id: "gs3-7", code: "GS3-SEC-INT", name: "Internal Security, Extremism, Border Management & Cyber Security", name_hi: "आंतरिक सुरक्षा, साइबर सुरक्षा एवं सीमा प्रबंधन", count_pyq: 58 }
    ]
  },
  {
    id: "paper-5-gs4",
    code: "PAPER-V (GS-IV)",
    title: "General Studies IV: Ethics, Integrity and Aptitude",
    title_hi: "सामान्य अध्ययन IV: नीतिशास्त्र, सत्यनिष्ठा एवं अभिरुचि",
    marks: 250,
    duration_hours: 3,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Ethics and Human Interface, Attitude, Aptitude, Emotional Intelligence, Thinkers and Case Studies.",
    micro_topics: [
      { id: "gs4-1", code: "GS4-ETH-INT", name: "Ethics & Human Interface: Essence, Determinants & Consequences", name_hi: "नीतिशास्त्र एवं मानवीय अंतर्संबंध", count_pyq: 35 },
      { id: "gs4-2", code: "GS4-ATTITUDE", name: "Attitude: Content, Structure, Function & Moral/Political Attitudes", name_hi: "अभिवृत्ति: संरचना एवं नैतिक दृष्टिकोण", count_pyq: 24 },
      { id: "gs4-3", code: "GS4-VALUES", name: "Aptitude & Foundational Values for Civil Service (Integrity, Empathy)", name_hi: "सत्यनिष्ठा, निष्पक्षता एवं सहानुभूति", count_pyq: 32 },
      { id: "gs4-4", code: "GS4-EI", name: "Emotional Intelligence: Concepts & Utilities in Administration", name_hi: "भावनात्मक समझ (इमोशनल इंटेलिजेंस)", count_pyq: 28 },
      { id: "gs4-5", code: "GS4-THINKERS", name: "Moral Thinkers & Philosophers from India and World", name_hi: "भारतीय एवं विश्व के नैतिक विचारक", count_pyq: 30 },
      { id: "gs4-6", code: "GS4-PROBITY", name: "Probity in Governance, Citizen's Charter & RTI", name_hi: "शासन में ईमानदारी एवं नागरिक अधिकार पत्र", count_pyq: 40 },
      { id: "gs4-7", code: "GS4-CASE", name: "Case Studies on Ethical Dilemmas in Governance & Society", name_hi: "प्रशासनिक एवं नैतिक केस स्टडीज", count_pyq: 54 }
    ]
  },
  {
    id: "paper-a-lang",
    code: "PAPER-A",
    title: "Qualifying Indian Language (Hindi)",
    title_hi: "अनिवार्य भारतीय भाषा (हिंदी)",
    marks: 300,
    duration_hours: 3,
    status: "Live",
    status_label: "Active & Verified",
    category: "Qualifying (25% Threshold)",
    description: "Comprehension, Precis, Usage and Vocabulary, Short Essay, Translation (English to Hindi & Hindi to English).",
    micro_topics: [
      { id: "lang-1", code: "LANG-ESSAY", name: "Nibandh (Hindi Essay Writing - 100 Marks)", name_hi: "हिंदी निबंध लेखन", count_pyq: 15 },
      { id: "lang-2", code: "LANG-COMP", name: "Reading Comprehension (Gadyansh - 60 Marks)", name_hi: "अपठित गद्यांश", count_pyq: 15 },
      { id: "lang-3", code: "LANG-PRECIS", name: "Precis Writing (Sankshepan - 60 Marks)", name_hi: "संक्षेपण लेखन", count_pyq: 15 },
      { id: "lang-4", code: "LANG-TRANS-1", name: "Translation: English to Hindi (20 Marks)", name_hi: "अनुवाद: अंग्रेजी से हिंदी", count_pyq: 15 },
      { id: "lang-5", code: "LANG-TRANS-2", name: "Translation: Hindi to English (20 Marks)", name_hi: "अनुवाद: हिंदी से अंग्रेजी", count_pyq: 15 },
      { id: "lang-6", code: "LANG-GRAMMAR", name: "Hindi Vyakaran & Muhavare (40 Marks)", name_hi: "हिंदी व्याकरण एवं मुहावरे", count_pyq: 25 }
    ]
  },
  {
    id: "paper-b-eng",
    code: "PAPER-B",
    title: "Qualifying English",
    title_hi: "अनिवार्य अंग्रेजी",
    marks: 300,
    duration_hours: 3,
    status: "Live",
    status_label: "Active & Verified",
    category: "Qualifying (25% Threshold)",
    description: "Comprehension of given passages, Precis writing, Usage and vocabulary, Short Essay.",
    micro_topics: [
      { id: "eng-1", code: "ENG-ESSAY", name: "Short Essay Writing (100 Marks)", name_hi: "निबंध लेखन (अंग्रेजी)", count_pyq: 15 },
      { id: "eng-2", code: "ENG-COMP", name: "Comprehension of Unseen Passages (75 Marks)", name_hi: "अपठित गद्यांश (अंग्रेजी)", count_pyq: 15 },
      { id: "eng-3", code: "ENG-PRECIS", name: "Precis Writing (75 Marks)", name_hi: "संक्षेपण (अंग्रेजी)", count_pyq: 15 },
      { id: "eng-4", code: "ENG-GRAMMAR", name: "Grammar, Idioms & Vocabulary Correction (50 Marks)", name_hi: "व्याकरण एवं शब्द भंडार", count_pyq: 30 }
    ]
  },
  {
    id: "paper-opt-econ",
    code: "OPT-ECON",
    title: "Optional: Economics (Paper I & II)",
    title_hi: "वैकल्पिक विषय: अर्थशास्त्र (प्रश्नपत्र I एवं II)",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (Advanced Economic Theory & International Trade) + Paper 2 (Indian Economy Pre/Post Reforms).",
    micro_topics: [
      { id: "econ-p1-1", code: "ECON-P1-MICRO", name: "P1: Advanced Microeconomics & Welfare Economics", name_hi: "व्यष्टि अर्थशास्त्र एवं कल्याणकारी अर्थशास्त्र", count_pyq: 38 },
      { id: "econ-p1-2", code: "ECON-P1-MACRO", name: "P1: Macroeconomics, Monetary Policy & IS-LM Framework", name_hi: "समष्टि अर्थशास्त्र एवं मौद्रिक नीति", count_pyq: 42 },
      { id: "econ-p1-3", code: "ECON-P1-INTL", name: "P1: International Trade & Growth Models (Solow, Lewis)", name_hi: "अंतर्राष्ट्रीय व्यापार एवं विकास मॉडल", count_pyq: 45 },
      { id: "econ-p2-1", code: "ECON-P2-PRE", name: "P2: Pre-Independence Indian Economy & Drain Theory", name_hi: "स्वतंत्रता पूर्व भारतीय अर्थव्यवस्था", count_pyq: 35 },
      { id: "econ-p2-2", code: "ECON-P2-POST", name: "P2: Post-1991 Reforms, Agriculture, Banking & Fiscal Policy", name_hi: "1991 के बाद के आर्थिक सुधार एवं राजकोषीय नीति", count_pyq: 50 }
    ]
  },
  {
    id: "paper-opt-psir",
    code: "OPT-PSIR",
    title: "Optional: Political Science & IR (PSIR)",
    title_hi: "वैकल्पिक विषय: राजनीति विज्ञान एवं IR (PSIR)",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (Political Theory & Indian Politics) + Paper 2 (Comparative Politics & International Relations).",
    micro_topics: [
      { id: "psir-p1-1", code: "PSIR-P1-THEORY", name: "P1: Political Theory: Justice, Equality, Rights, Democracy", name_hi: "राजनीतिक सिद्धांत: न्याय, समानता, अधिकार", count_pyq: 40 },
      { id: "psir-p1-2", code: "PSIR-P1-THINKERS", name: "P1: Western & Indian Political Thinkers (Plato to Gandhi)", name_hi: "पाश्चात्य एवं भारतीय राजनीतिक विचारक", count_pyq: 45 },
      { id: "psir-p1-3", code: "PSIR-P1-INDPOL", name: "P1: Indian Nationalism, Constitution & Party System", name_hi: "भारतीय राष्ट्रवाद, संविधान एवं दलीय प्रणाली", count_pyq: 42 },
      { id: "psir-p2-1", code: "PSIR-P2-COMP", name: "P2: Comparative Politics & State in Global Perspective", name_hi: "तुलनात्मक राजनीति", count_pyq: 38 },
      { id: "psir-p2-2", code: "PSIR-P2-IR", name: "P2: Theories of IR, Global Order, UN & India's Foreign Policy", name_hi: "अंतर्राष्ट्रीय संबंध के सिद्धांत एवं भारत की विदेश नीति", count_pyq: 55 }
    ]
  },
  {
    id: "paper-opt-socio",
    code: "OPT-SOCIO",
    title: "Optional: Sociology",
    title_hi: "वैकल्पिक विषय: समाजशास्त्र",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (Fundamentals of Sociology) + Paper 2 (Indian Society: Structure and Change).",
    micro_topics: [
      { id: "soc-p1-1", code: "SOC-P1-THINKERS", name: "P1: Sociological Thinkers (Marx, Weber, Durkheim, Mead)", name_hi: "समाजशास्त्रीय विचारक", count_pyq: 44 },
      { id: "soc-p1-2", code: "SOC-P1-STRAT", name: "P1: Stratification, Social Mobility & Systems of Kinship", name_hi: "सामाजिक स्तरीकरण एवं गतिशीलता", count_pyq: 36 },
      { id: "soc-p2-1", code: "SOC-P2-PERSPECTIVES", name: "P2: Indology, Structural-Functionalism (Ghurye, Srinivas)", name_hi: "भारतीय समाज पर दृष्टिकोण", count_pyq: 40 },
      { id: "soc-p2-2", code: "SOC-P2-TRANSFORM", name: "P2: Caste, Agrarian Social Structure & Social Movements", name_hi: "जाति, कृषक समाज एवं सामाजिक आंदोलन", count_pyq: 48 }
    ]
  },
  {
    id: "paper-opt-pubad",
    code: "OPT-PUBAD",
    title: "Optional: Public Administration",
    title_hi: "वैकल्पिक विषय: लोक प्रशासन",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (Administrative Theory) + Paper 2 (Indian Administration).",
    micro_topics: [
      { id: "pub-p1-1", code: "PUB-P1-THEORY", name: "P1: Administrative Thought (Taylor, Weber, Simon, Riggs)", name_hi: "प्रशासनिक विचारक", count_pyq: 42 },
      { id: "pub-p1-2", code: "PUB-P1-NPM", name: "P1: New Public Management, Good Governance & Accountability", name_hi: "नवीन लोक प्रबंधन एवं सुशासन", count_pyq: 38 },
      { id: "pub-p2-1", code: "PUB-P2-UNION", name: "P2: Evolution of Indian Admin, PMO, Cabinet Secretariat", name_hi: "भारतीय प्रशासन का विकास", count_pyq: 40 },
      { id: "pub-p2-2", code: "PUB-P2-DISTRICT", name: "P2: District Administration, Civil Services Reforms & 2nd ARC", name_hi: "जिला प्रशासन एवं सिविल सेवा सुधार", count_pyq: 45 }
    ]
  },
  {
    id: "paper-opt-geo",
    code: "OPT-GEO",
    title: "Optional: Geography",
    title_hi: "वैकल्पिक विषय: भूगोल",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (Principles of Geography) + Paper 2 (Geography of India).",
    micro_topics: [
      { id: "geo-p1-1", code: "GEO-P1-PHYS", name: "P1: Geomorphology, Climatology & Oceanography", name_hi: "भू-आकृति विज्ञान, जलवायु विज्ञान", count_pyq: 46 },
      { id: "geo-p1-2", code: "GEO-P1-HUMAN", name: "P1: Models, Theories and Laws in Human Geography", name_hi: "मानव भूगोल के मॉडल एवं सिद्धांत", count_pyq: 40 },
      { id: "geo-p2-1", code: "GEO-P2-IND-PHYS", name: "P2: Physical Setting, Resources & Agriculture of India", name_hi: "भारत का भौतिक स्वरूप एवं संसाधन", count_pyq: 48 },
      { id: "geo-p2-2", code: "GEO-P2-IND-SETTLE", name: "P2: Settlements, Regional Development & Contemporary Issues", name_hi: "बस्तियां एवं क्षेत्रीय विकास", count_pyq: 44 }
    ]
  },
  {
    id: "paper-opt-hist",
    code: "OPT-HIST",
    title: "Optional: History",
    title_hi: "वैकल्पिक विषय: इतिहास",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (Ancient & Medieval India) + Paper 2 (Modern India & World History).",
    micro_topics: [
      { id: "hist-p1-1", code: "HIST-P1-ANC", name: "P1: Sources, Indus Valley, Mauryas, Guptas & Map Work", name_hi: "प्राचीन भारत एवं मानचित्र कार्य", count_pyq: 50 },
      { id: "hist-p1-2", code: "HIST-P1-MED", name: "P1: Delhi Sultanate, Mughals, Vijayanagara & Bhakti/Sufi", name_hi: "मध्यकालीन भारत", count_pyq: 42 },
      { id: "hist-p2-1", code: "HIST-P2-MOD", name: "P2: Colonial Economy, Resistance, Freedom Struggle (1857-1947)", name_hi: "आधुनिक भारत", count_pyq: 48 },
      { id: "hist-p2-2", code: "HIST-P2-WORLD", name: "P2: Enlightenment, Industrial Revolution, World Wars & Cold War", name_hi: "विश्व इतिहास", count_pyq: 44 }
    ]
  },
  {
    id: "paper-opt-anthro",
    code: "OPT-ANTHRO",
    title: "Optional: Anthropology",
    title_hi: "वैकल्पिक विषय: नृविज्ञान",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (Physical & Socio-Cultural Anthropology) + Paper 2 (Indian Anthropology & Tribal Studies).",
    micro_topics: [
      { id: "anth-p1-1", code: "ANTH-P1-PHYS", name: "P1: Human Evolution, Primatology, Genetics & Anthropological Theories", name_hi: "मानव विकास एवं नृवैज्ञानिक सिद्धांत", count_pyq: 45 },
      { id: "anth-p1-2", code: "ANTH-P1-SOC", name: "P1: Marriage, Family, Kinship, Religion & Research Methods", name_hi: "विवाह, परिवार एवं नातेदारी", count_pyq: 42 },
      { id: "anth-p2-1", code: "ANTH-P2-IND", name: "P2: Indian Paleolithic to Civilization, Caste System & Village Studies", name_hi: "भारतीय नृविज्ञान एवं जाति व्यवस्था", count_pyq: 46 },
      { id: "anth-p2-2", code: "ANTH-P2-TRIBAL", name: "P2: Tribal India: Problems, Forest Rights, Policies & Administration", name_hi: "जनजातीय भारत एवं विकास प्रशासन", count_pyq: 52 }
    ]
  },
  {
    id: "paper-opt-phil",
    code: "OPT-PHIL",
    title: "Optional: Philosophy",
    title_hi: "वैकल्पिक विषय: दर्शनशास्त्र",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (Indian & Western Epistemology/Metaphysics) + Paper 2 (Socio-Political Philosophy & Philosophy of Religion).",
    micro_topics: [
      { id: "phil-p1-1", code: "PHIL-P1-IND", name: "P1: Indian Philosophy (Nyaya, Shankara, Buddhism, Jainism)", name_hi: "भारतीय दर्शन", count_pyq: 40 },
      { id: "phil-p1-2", code: "PHIL-P1-WEST", name: "P1: Western Philosophy (Descartes, Kant, Hegel, Existentialism)", name_hi: "पाश्चात्य दर्शन", count_pyq: 42 },
      { id: "phil-p2-1", code: "PHIL-P2-SOCPOL", name: "P2: Socio-Political Philosophy (Justice, Liberty, Swaraj)", name_hi: "सामाजिक-राजनीतिक दर्शन", count_pyq: 38 },
      { id: "phil-p2-2", code: "PHIL-P2-REL", name: "P2: Philosophy of Religion (God, Evil, Pluralism)", name_hi: "धर्म दर्शन", count_pyq: 36 }
    ]
  },
  {
    id: "paper-opt-law",
    code: "OPT-LAW",
    title: "Optional: Law",
    title_hi: "वैकल्पिक विषय: विधि / कानून",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (Constitutional, Administrative & International Law) + Paper 2 (Crimes, Torts, Contracts & Mercantile Law).",
    micro_topics: [
      { id: "law-p1-1", code: "LAW-P1-CONST", name: "P1: Constitutional & Administrative Law", name_hi: "संवैधानिक एवं प्रशासनिक विधि", count_pyq: 45 },
      { id: "law-p1-2", code: "LAW-P1-INTL", name: "P1: International Law (UNCLOS, Human Rights, Treaties)", name_hi: "अंतर्राष्ट्रीय विधि", count_pyq: 40 },
      { id: "law-p2-1", code: "LAW-P2-CRIMES", name: "P2: Law of Crimes (BNS/IPC) & Law of Torts", name_hi: "अपराध एवं अपकृत्य विधि", count_pyq: 44 },
      { id: "law-p2-2", code: "LAW-P2-MERC", name: "P2: Contracts, Arbitration & Intellectual Property", name_hi: "संविदा एवं वाणिज्यिक विधि", count_pyq: 38 }
    ]
  },
  {
    id: "paper-opt-comm",
    code: "OPT-COMM",
    title: "Optional: Commerce & Accountancy",
    title_hi: "वैकल्पिक विषय: वाणिज्य एवं लेखाशास्त्र",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (Accounting, Auditing, Tax & FM) + Paper 2 (Organization Theory, OB & Industrial Relations).",
    micro_topics: [
      { id: "comm-p1-1", code: "COMM-P1-ACC", name: "P1: Financial Accounting, Auditing & Corporate Tax", name_hi: "वित्तीय लेखांकन एवं कराधान", count_pyq: 42 },
      { id: "comm-p1-2", code: "COMM-P1-FM", name: "P1: Financial Management & Capital Structure", name_hi: "वित्तीय प्रबंधन", count_pyq: 38 },
      { id: "comm-p2-1", code: "COMM-P2-OT-OB", name: "P2: Organization Theory & Organizational Behavior", name_hi: "संगठन सिद्धांत एवं व्यवहार", count_pyq: 40 },
      { id: "comm-p2-2", code: "COMM-P2-IR", name: "P2: Human Resource Management & Labour Codes", name_hi: "मानव संसाधन एवं औद्योगिक संबंध", count_pyq: 36 }
    ]
  },
  {
    id: "paper-opt-psych",
    code: "OPT-PSYCH",
    title: "Optional: Psychology",
    title_hi: "वैकल्पिक विषय: मनोविज्ञान",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (Foundations of Psychology) + Paper 2 (Issues and Applied Psychology).",
    micro_topics: [
      { id: "psych-p1-1", code: "PSYCH-P1-FOUND", name: "P1: Cognitive Processes, Learning, Memory & Intelligence", name_hi: "संज्ञानात्मक प्रक्रियाएं एवं बुद्धि", count_pyq: 44 },
      { id: "psych-p1-2", code: "PSYCH-P1-PERS", name: "P1: Personality Theories, Motivation & Emotion", name_hi: "व्यक्तित्व सिद्धांत एवं अभिप्रेरणा", count_pyq: 38 },
      { id: "psych-p2-1", code: "PSYCH-P2-CLINICAL", name: "P2: Psychopathology, Psychotherapies & Mental Health", name_hi: "मानसिक स्वास्थ्य एवं मनोचिकित्सा", count_pyq: 40 },
      { id: "psych-p2-2", code: "PSYCH-P2-APPLIED", name: "P2: Organizational Psychology & Social Interventions", name_hi: "अनुप्रयुक्त सामाजिक मनोविज्ञान", count_pyq: 42 }
    ]
  },
  {
    id: "paper-opt-agri",
    code: "OPT-AGRI",
    title: "Optional: Agriculture",
    title_hi: "वैकल्पिक विषय: कृषि विज्ञान",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (Ecology, Agronomy, Soil Science & Agri Economics) + Paper 2 (Genetics, Plant Breeding, Physiology & Protection).",
    micro_topics: [
      { id: "agri-p1-1", code: "AGRI-P1-AGRONOMY", name: "P1: Agronomy, Climate Resilient Agriculture & Soils", name_hi: "सस्य विज्ञान एवं मृदा विज्ञान", count_pyq: 45 },
      { id: "agri-p1-2", code: "AGRI-P1-ECON", name: "P1: Agricultural Economics, Extension & MSP Framework", name_hi: "कृषि अर्थशास्त्र एवं प्रसार", count_pyq: 40 },
      { id: "agri-p2-1", code: "AGRI-P2-BREEDING", name: "P2: Plant Genetics, CRISPR-Cas9 & Seed Tech", name_hi: "पादप आनुवंशिकी एवं प्रजनन", count_pyq: 42 },
      { id: "agri-p2-2", code: "AGRI-P2-PROTECT", name: "P2: Horticulture & Integrated Pest Management (IPM)", name_hi: "उद्यानिकी एवं पादप संरक्षण", count_pyq: 38 }
    ]
  },
  {
    id: "paper-opt-math",
    code: "OPT-MATH",
    title: "Optional: Mathematics",
    title_hi: "वैकल्पिक विषय: गणित",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (Linear Algebra, Calculus, 3D Geometry, ODE) + Paper 2 (Modern Algebra, Complex Analysis, PDE, Mechanics & Fluid Dynamics).",
    micro_topics: [
      { id: "math-p1-1", code: "MATH-P1-LA-CALC", name: "P1: Linear Algebra, Calculus & Real Analysis", name_hi: "रैखिक बीजगणित एवं कलन", count_pyq: 48 },
      { id: "math-p1-2", code: "MATH-P1-ODE-VEC", name: "P1: 3D Geometry, Ordinary Differential Equations & Vector Analysis", name_hi: "त्रिविमीय ज्यामिति एवं अवकल समीकरण", count_pyq: 45 },
      { id: "math-p2-1", code: "MATH-P2-ALG-COMP", name: "P2: Abstract/Modern Algebra & Complex Analysis", name_hi: "आधुनिक बीजगणित एवं सम्मिश्र विश्लेषण", count_pyq: 46 },
      { id: "math-p2-2", code: "MATH-P2-PDE-MECH", name: "P2: Partial Differential Equations, Mechanics & Fluid Dynamics", name_hi: "आंशिक अवकल समीकरण एवं यांत्रिकी", count_pyq: 44 }
    ]
  },
  {
    id: "paper-opt-mgmt",
    code: "OPT-MGMT",
    title: "Optional: Management",
    title_hi: "वैकल्पिक विषय: प्रबंधन",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (Managerial Economics, Org Behavior, HR & FM) + Paper 2 (Marketing, Operations, MIS & Strategic Management).",
    micro_topics: [
      { id: "mgmt-p1-1", code: "MGMT-P1-BEH-HR", name: "P1: Managerial Economics, Org Behavior & Human Resource Management", name_hi: "प्रबंधकीय अर्थशास्त्र एवं मानव संसाधन", count_pyq: 42 },
      { id: "mgmt-p1-2", code: "MGMT-P1-FINANCE", name: "P1: Financial Management, M&A & Corporate Valuation", name_hi: "वित्तीय प्रबंधन एवं मूल्यांकन", count_pyq: 40 },
      { id: "mgmt-p2-1", code: "MGMT-P2-MKTG-OPS", name: "P2: Marketing Management, Operations & Supply Chain", name_hi: "विपणन एवं आपूर्ति श्रृंखला प्रबंधन", count_pyq: 44 },
      { id: "mgmt-p2-2", code: "MGMT-P2-STRAT", name: "P2: Strategic Management, MIS & ESG Strategy", name_hi: "रणनीतिक प्रबंधन एवं सूचना प्रणाली", count_pyq: 38 }
    ]
  },
  {
    id: "paper-opt-hindi-lit",
    code: "OPT-HINDI-LIT",
    title: "Optional: Hindi Literature (हिंदी साहित्य)",
    title_hi: "वैकल्पिक विषय: हिंदी साहित्य",
    marks: 500,
    duration_hours: 6,
    status: "Live",
    status_label: "Active & Verified",
    category: "Merit",
    description: "Paper 1 (हिंदी भाषा एवं साहित्य का इतिहास) + Paper 2 (पद्य एवं गद्य कृतियों का गंभीर अध्ययन).",
    micro_topics: [
      { id: "hlit-p1-1", code: "HLIT-P1-BHASHA", name: "P1: हिंदी भाषा और नागरी लिपि का इतिहास", name_hi: "हिंदी भाषा और नागरी लिपि का इतिहास", count_pyq: 46 },
      { id: "hlit-p1-2", code: "HLIT-P1-ITIHAS", name: "P1: हिंदी साहित्य का इतिहास (आदिकाल, भक्तिकाल, रीतिकाल, आधुनिक काल)", name_hi: "हिंदी साहित्य का इतिहास", count_pyq: 52 },
      { id: "hlit-p2-1", code: "HLIT-P2-PADYA", name: "P2: पद्य कृतियां (कबीर, सूर, तुलसी, बिहारी, प्रसाद, निराला, दिनकर)", name_hi: "पद्य कृतियां", count_pyq: 48 },
      { id: "hlit-p2-2", code: "HLIT-P2-GADYA", name: "P2: गद्य कृतियां (गोदान, मैला आंचल, भारत दुर्दशा, आषाढ़ का एक दिन)", name_hi: "गद्य कृतियां", count_pyq: 45 }
    ]
  }
];
