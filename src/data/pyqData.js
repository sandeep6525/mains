/**
 * Authentic UPSC CSE Mains Previous Year Question Bank & Practice Vault (2018-2025)
 * Directives: Critically Analyze, Examine, Discuss, Evaluate, Elucidate, Comment
 * Includes: GS I-IV, Essay, and Top 15 Optionals (Economics, PSIR, Sociology, PubAd, Geography, History, Anthro, Philosophy, Law, Commerce, Psychology, Agriculture, Math, Mgmt, Hindi Lit)
 */

export const PYQ_QUESTIONS = [
  // --- ECONOMICS OPTIONAL ---
  {
    id: "pyq-2024-econ-01",
    paper_id: "paper-opt-econ",
    paper_code: "OPT-ECON",
    topic_id: "econ-p1-2",
    topic_title: "Macroeconomics: Mundell-Fleming & Trilemma",
    year: 2024,
    marks: 20,
    word_limit: 250,
    time_limit_mins: 15,
    directive: "Critically Examine",
    directive_tip: "Demand: Explain the Mundell-Fleming open-economy trilemma, apply to RBI's capital flow management, analyze exchange rate volatility, and evaluate macro-prudential tools.",
    question_en: "“The Mundell-Fleming model demonstrates the trilemma (impossible trinity) facing central banks in an era of global capital mobility.” Critically examine the policy choices made by the Reserve Bank of India in managing this trilemma.",
    question_hi: "“मुंडेल-फ्लेमिंग मॉडल वैश्विक पूंजी गतिशीलता के युग में केंद्रीय बैंकों के सामने आने वाले त्रिलम्मा (असंभव त्रिमूर्ति) को प्रदर्शित करता है।” इस त्रिलम्मा के प्रबंधन में भारतीय रिजर्व बैंक द्वारा किए गए नीतिगत विकल्पों का समालोचनात्मक परीक्षण कीजिए।",
    model_framework: {
      introduction: "Define the Policy Trilemma (Impossible Trinity) formulated by Robert Mundell and Marcus Fleming: A country cannot simultaneously maintain (1) Fixed Exchange Rate, (2) Free Capital Mobility, and (3) Independent Monetary Policy.",
      dimensions: [
        {
          name: "Theoretical Framework (Mundell-Fleming)",
          points: [
            "With perfect capital mobility and fixed exchange rates, monetary policy is ineffective in altering domestic output.",
            "With floating exchange rates, monetary policy regains potency while fiscal policy effectiveness diminishes."
          ]
        },
        {
          name: "RBI's Strategic Policy Nuances",
          points: [
            "Managed Float ('Dirty Float'): RBI intervenes in FX markets to curb excessive volatility without defending a specific exchange rate peg.",
            "Calibrated Capital Account Convertibility: Tarapore Committee recommendations; limits on external commercial borrowings (ECBs) and retail outflows (LRS).",
            "Monetary Policy Independence: Flexible Inflation Targeting (FIT) framework under Section 45ZB of RBI Act (4% +/- 2% CPI target)."
          ]
        },
        {
          name: "Macro-Prudential Buffers & Foreign Reserves",
          points: [
            "Accumulation of massive FX reserves (>$680 Bn) acting as a war chest against external taper tantrums.",
            "Standing Deposit Facility (SDF) and Market Stabilization Scheme (MSS) used for sterilizing liquidity inflows."
          ]
        }
      ],
      citations: ["Mundell-Fleming Model (1962/1963)", "Tarapore Committee Reports (1997, 2006)", "Urjit Patel Committee Report (2014)", "Section 45ZB, RBI Act 1934"],
      conclusion: "RBI has adopted an 'intermediate regime' (Rey's Dilemma vs Trilemma) balancing domestic inflation targeting with targeted capital flow management and managed flexible exchange rates."
    },
    sample_submission: {
      student_name: "Economics Aspirant",
      submission_date: "2026-09-22",
      status: "Evaluated",
      v1_text: `The Mundell-Fleming trilemma says that a country cannot have fixed exchange rate, free capital flow, and independent monetary policy at the same time. It can only choose two out of three.

In India, RBI has chosen independent monetary policy to control inflation through MPC. India also has open capital account for investments like FDI and FII. Therefore, India cannot fix its rupee exchange rate and allows rupee to float.

However, when dollar rises, RBI sells dollars from foreign exchange reserves to protect the rupee. This is called managed floating. Tarapore committee suggested full capital convertibility but RBI has been cautious.

In conclusion, RBI balances all three pillars to protect Indian economy from global shocks.`,
      v2_text: `The Policy Trilemma (or 'Impossible Trinity'), formalized by Robert Mundell and Marcus Fleming, posits that a sovereign macroeconomic authority cannot concurrently sustain:
1. Free International Capital Mobility,
2. An Independent Domestic Monetary Policy, and
3. A Fixed/Pegged Exchange Rate Regime.

I. Theoretical Anchor in the Mundell-Fleming Framework:
Under perfect capital mobility, any attempt to fix the exchange rate while altering domestic interest rates induces capital flight or surge, nullifying monetary autonomy. Conversely, a floating exchange rate restores monetary policy autonomy via the external adjustment mechanism.

II. The Reserve Bank of India’s Pragmatic Intermediate Trilemma:
Rather than choosing extreme corner solutions, the RBI operates in an 'intermediate regime':
1. Anchored Monetary Autonomy: Prioritized under the Flexible Inflation Targeting (FIT) regime (Section 45ZB, RBI Act) targeting 4% ± 2% headline CPI.
2. Calibrated Capital Account Openness: Consistent with the Tarapore Committee (1997, 2006) roadmap, India permits uninhibited FDI while maintaining calibrated macro-prudential caps on short-term external commercial debt (ECBs) and FPI debt limits.
3. Managed Flexibility with Tactical FX Intervention: The RBI follows a policy of curbing non-fundamental rupee volatility through two-way spot/forward interventions, supported by a $680+ Bn FX reserve buffer.

III. Sterilization and Liquidity Management:
To insulate domestic money supply from heavy capital surges, RBI utilizes Market Stabilization Schemes (MSS) and the Standing Deposit Facility (SDF), resolving the sterilization dilemma.

Conclusion:
In response to Hélène Rey's critique of the 'Trilemma into Dilemma' driven by the Global Financial Cycle, the RBI’s dynamic synthesis of inflation targeting, substantial FX reserves, and calibrated capital controls demonstrates robust macroeconomic resilience.`
    }
  },

  // --- PSIR OPTIONAL ---
  {
    id: "pyq-2024-psir-01",
    paper_id: "paper-opt-psir",
    paper_code: "OPT-PSIR",
    topic_id: "psir-p1-1",
    topic_title: "Political Theory: Rawls vs Amartya Sen",
    year: 2024,
    marks: 20,
    word_limit: 250,
    time_limit_mins: 15,
    directive: "Comment",
    directive_tip: "Demand: Contrast Rawlsian transcendental institutionalism (Niti) with Sen's realization-focused comparative justice (Nyaya), examining the difference principle and capabilities approach.",
    question_en: "“Rawls's theory of justice as fairness combines the values of liberty and equality in a lexically ordered manner.” Comment with reference to Amartya Sen's 'Realization-focused Niti' critique.",
    question_hi: "“निष्पक्षता के रूप में रॉल्स का न्याय का सिद्धांत स्वतंत्रता और समानता के मूल्यों को एक क्रमिक व्यवस्थित तरीके से जोड़ता है।” अमर्त्य सेन की 'नीति बनाम न्याय' आलोचना के संदर्भ में टिप्पणी कीजिए।",
    model_framework: {
      introduction: "Contextualize John Rawls' 'A Theory of Justice' (1971) and Amartya Sen's 'The Idea of Justice' (2009). Rawls constructs an ideal-institutional architecture of justice as fairness.",
      dimensions: [
        {
          name: "Rawlsian Lexical Ordering of Principles",
          points: [
            "First Principle: Equal basic liberties principle (lexical priority over second principle).",
            "Second Principle (a): Fair equality of opportunity (lexical priority over difference principle).",
            "Second Principle (b): Difference Principle (maximizing the position of the least advantaged)."
          ]
        },
        {
          name: "Amartya Sen's Critique (Niti vs Nyaya)",
          points: [
            "Transcendental Institutionalism (Niti): Rawls seeks perfectly just institutions in an idealized well-ordered society, which Sen argues is both unfeasible and unnecessary.",
            "Realization-Focused Comparison (Nyaya): Sen prioritizes eliminating manifest injustices (famine, illiteracy, healthcare deprivation) in actual lives over searching for transcendental blueprints.",
            "Capability Approach: Shift focus from primary goods metric to substantive capabilities and freedoms of individuals."
          ]
        }
      ],
      citations: ["John Rawls (1971, 1993)", "Amartya Sen (2009 The Idea of Justice)", "Robert Nozick (Anarchy, State and Utopia)"],
      conclusion: "While Rawls provides the foundational ethical benchmark for constitutional democracy, Sen's realization-focused approach guides real-world public policy and human development interventions."
    },
    sample_submission: {
      student_name: "PSIR Scholar",
      submission_date: "2026-09-22",
      status: "Evaluated",
      v1_text: `John Rawls gave theory of justice in 1971. He used veil of ignorance where people choose principles of justice without knowing their position.

The first principle is equal liberty for all. The second principle is fair equality of opportunity and difference principle which helps the poorest people.

Amartya Sen criticized Rawls in his book The Idea of Justice. Sen said Rawls focuses only on institutions (Niti) rather than real life results (Nyaya). Sen gave the Capability approach.

In conclusion, both thinkers help us understand justice and social equality.`,
      v2_text: `In *A Theory of Justice* (1971), John Rawls revitalized normative political philosophy by formulating 'Justice as Fairness' through the heuristic of the Original Position and the Veil of Ignorance.

I. Rawlsian Lexical Architecture of Justice:
Rawls establishes a strict lexical (serial) priority among his principles:
1. Equal Basic Liberties Principle: Each person possesses an inviolable right to the most extensive system of equal basic liberties compatible with similar liberty for all.
2. Fair Equality of Opportunity: Social and economic inequalities must be attached to offices open to all under conditions of fair opportunity.
3. The Difference Principle: Inequalities are justified only if they maximize the expectations of the least advantaged members of society (*Maximin rule*).

II. Amartya Sen’s Critique: Niti vs. Nyaya:
In *The Idea of Justice* (2009), Amartya Sen challenges Rawls’s 'Transcendental Institutionalism':
1. Niti (Organizational/Institutional Perfection): Rawls’s search for a single, universally agreed-upon blueprint of a perfectly just society is, according to Sen, both unfeasible and unnecessary (illustrated by the Flute Analogy: Carla, Bob, and Anne).
2. Nyaya (Realization-Focused Comparison): Justice should focus on eliminating manifest, remediable injustices in the lived realities of citizens (e.g., preventable starvation, infant mortality).
3. Primary Goods vs. Capabilities: Rawls measures distributive justice in primary goods (income, rights), ignoring interpersonal variations in converting goods into actual well-being (the Capability Approach).

Conclusion:
While Rawls supplies the philosophical foundation for modern constitutional welfare states, Sen’s *Nyaya* perspective provides the pragmatic navigational compass for actionable public policy and multidimensional human development.`
    }
  },

  // --- SOCIOLOGY OPTIONAL ---
  {
    id: "pyq-2024-soc-01",
    paper_id: "paper-opt-soc",
    paper_code: "OPT-SOCIO",
    topic_id: "soc-p1-1",
    topic_title: "Sociological Thinkers: Weber's Bureaucracy & Rationalization",
    year: 2024,
    marks: 20,
    word_limit: 250,
    time_limit_mins: 15,
    directive: "Critically Examine",
    directive_tip: "Demand: Analyze Max Weber's Ideal Type of bureaucracy, its rational-legal legitimacy, and evaluate how formal rationality produces the 'Iron Cage' (Stahlhartes Gehäuse).",
    question_en: "“Max Weber’s Ideal Type of Bureaucracy represents the zenith of rational-legal authority, yet results in the 'Iron Cage of Rationality'.” Critically examine.",
    question_hi: "“मैक्स वेबर का नौकरशाही का आदर्श प्रकार तर्कसंगत-कानूनी अधिकार के शिखर का प्रतिनिधित्व करता है, फिर भी 'तार्किकता के लौह पिंजरे' (Iron Cage) का परिणाम देता है।” समालोचनात्मक परीक्षण कीजिए।",
    model_framework: {
      introduction: "Introduce Max Weber's typology of authority (Traditional, Charismatic, Rational-Legal) in *Economy and Society* (1922). Bureaucracy is the administrative apparatus corresponding to rational-legal authority.",
      dimensions: [
        {
          name: "Ideal Type Characteristics",
          points: [
            "Hierarchy of authority, written rules and documentation (files).",
            "Impersonality and separation of official from personal sphere.",
            "Technical qualification, merit-based career tenure and fixed monetary salaries."
          ]
        },
        {
          name: "The 'Iron Cage of Rationality' (Stahlhartes Gehäuse)",
          points: [
            "Substantive rationality (human values/meaning) is eclipsed by formal instrumental rationality (Zweckrationalität).",
            "Loss of individual autonomy, disenchantment of the world (Entzauberung), and ritualistic conformity (Robert K. Merton's 'bureaucratic ritualism')."
          ]
        },
        {
          name: "Contemporary Relevance & Critiques",
          points: [
            "Alvin Gouldner (Patterns of Industrial Bureaucracy), Michel Crozier (Bureaucratic Phenomenon).",
            "Modern governance requiring agile, empathetic, and digital networked structures rather than rigid hierarchy."
          ]
        }
      ],
      citations: ["Max Weber (1922 Economy and Society)", "Robert K. Merton (Social Theory and Social Structure)", "Alvin Gouldner (1954)"],
      conclusion: "While bureaucratic rationalization provides predictability and rule-governed fairness, administrative reforms must integrate human-centric empathy to escape the iron cage."
    },
    sample_submission: {
      student_name: "Sociology Aspirant",
      submission_date: "2026-09-22",
      status: "Evaluated",
      v1_text: `Max Weber gave the theory of bureaucracy as an ideal type of rational-legal authority. It has features like hierarchy, written rules, merit selection, and impersonality.

Weber said bureaucracy is the most efficient form of administration. However, it also creates an Iron cage of rationality because people become like cogs in a machine. They follow rules blindly.

Sociologist Robert Merton called this red tapism and trained incapacity. In modern times, government needs flexibility instead of rigid bureaucracy.

In conclusion, Weber correctly predicted the problems of modern rational organizations.`,
      v2_text: `In *Economy and Society* (1922), Max Weber conceptualized the **Ideal Type of Bureaucracy** as the apex of rational-legal authority, embodying the broader historical trajectory of Western rationalization (*Rationalisierung*).

I. The Architecture of Rational-Legal Domination:
Weber delineated key constitutive characteristics of bureaucratic organization:
1. Fixed jurisdictional areas ordered by statutory administrative regulations.
2. Strict hierarchical ordering of offices with delineated supervisory channels.
3. Management based on written documentation ('the files') and specialized expert training.
4. Impersonality (*Sine ira et studio*—without hatred or passion), insulating administration from affective biases.

II. The Metamorphosis into the 'Iron Cage' (*Stahlhartes Gehäuse*):
Weber presciently warned that unchecked formal rationality inexorably undermines human freedom:
1. Eclipse of Substantive Rationality: Instrumental efficiency (*Zweckrationalität*) displaces ultimate human values (*Wertrationalität*), trapping individuals in depersonalized algorithmic routines.
2. Disenchantment of the World (*Entzauberung*): Erosion of humanistic creativity, transforming administrative personnel into specialized, soulless cogs.

III. Critical Sociological Developments:
- **Robert K. Merton**: Bureaucratic ritualism where compliance with rules becomes an end in itself (*displacement of goals*) and induces *trained incapacity*.
- **Michel Crozier**: Bureaucracy as an inflexible organization incapable of learning from its own errors, creating vicious cycles of power struggles over zones of uncertainty.

Conclusion:
Weber’s critique remains deeply relevant in the era of automated digital governance; escaping the modern 'Iron Cage' requires synthesizing Weberian procedural integrity with citizen-centric empathy and agile governance.`
    }
  },

  // --- PHILOSOPHY OPTIONAL ---
  {
    id: "pyq-2024-phil-01",
    paper_id: "paper-opt-phil",
    paper_code: "OPT-PHIL",
    topic_id: "phil-p1-2",
    topic_title: "Western Philosophy & Epistemology: Kant",
    year: 2024,
    marks: 20,
    word_limit: 250,
    time_limit_mins: 15,
    directive: "Critically Evaluate",
    directive_tip: "Demand: Explain Kant's Copernican revolution, synthetic a priori judgments, forms of intuition (space & time), categories of understanding, and Noumena vs Phenomena.",
    question_en: "“Kant’s Copernican Revolution in epistemology reconciles rationalism and empiricism through synthetic a priori propositions.” Critically evaluate.",
    question_hi: "“ज्ञानमीमांसा में कांट की कोपरनिकन क्रांति संश्लेषणात्मक प्रागनुभविक (Synthetic A Priori) प्रतिज्ञप्तियों के माध्यम से बुद्धिवाद और अनुभववाद का समन्वय करती है।” समालोचनात्मक मूल्यांकन कीजिए।",
    model_framework: {
      introduction: "Contextualize the impasse between Rationalism (Descartes/Spinoza dogmatism) and Empiricism (Hume's skepticism). Kant's famous aphorism: 'Thoughts without content are empty, intuitions without concepts are blind.'",
      dimensions: [
        {
          name: "The Copernican Shift",
          points: [
            "Pre-Kantian realism assumed knowledge must conform to objects; Kant inverted this: Objects must conform to our cognitive apparatus.",
            "Mind is not a passive tabula rasa (Locke) but an active synthesizer organizing raw sensory data."
          ]
        },
        {
          name: "Synthetic A Priori Mechanism",
          points: [
            "Synthetic: Yields new knowledge about the world (unlike analytic tautologies).",
            "A Priori: Universal and necessary, independent of contingent empirical verification.",
            "Transcendental Aesthetic: Pure forms of sensible intuition (Space and Time).",
            "Transcendental Analytic: 12 Categories of Understanding (Causality, Substance, etc.)."
          ]
        }
      ],
      citations: ["Immanuel Kant (Critique of Pure Reason, 1781)", "David Hume (Enquiry Concerning Human Understanding)", "G.W. Leibniz"],
      conclusion: "Evaluate limits: Kant's limitation of knowledge to 'Phenomena' while leaving 'Noumena' (Ding an sich) unknowable sparked Hegelian absolute idealism and phenomenology."
    },
    sample_submission: {
      student_name: "Philosophy Scholar",
      submission_date: "2026-09-21",
      status: "Evaluated",
      v1_text: `Kant reconciled rationalism and empiricism. Empiricists like Locke and Hume believed that all knowledge comes from sense experience. Rationalists like Descartes said knowledge comes from reason.

Kant said both are needed. He gave the concept of synthetic a priori knowledge which is both informative and universal. He made the mind central like Copernicus made Sun central.

Space and time are forms of intuition in human mind. Categories like causality are in understanding. Therefore we can only know phenomena and not noumena.

In conclusion, Kant solved the problem of knowledge in western philosophy.`,
      v2_text: `In the 'Critique of Pure Reason' (1781), Immanuel Kant sought to awaken philosophy from its 'dogmatic slumber' (induced by Wolffian rationalism) and rescue it from the solipsistic skepticism of David Hume.

I. The Epistemological Impasse:
- Rationalism claimed that pure reason can intuit metaphysical truths a priori, degenerating into dogmatism.
- Empiricism (Hume) asserted all knowledge is contingent sensory impressions, reducing the principle of universal causality to mere psychological habit.

II. The Copernican Revolution:
Analogous to Copernicus placing the sun at the center of the solar system, Kant reversed the traditional realist premise: instead of human cognition conforming to external objects, objects must conform to the synthetic constitutive structures of the human mind.

III. Synthetic A Priori Propositions:
Kant demonstrated that genuine scientific and mathematical knowledge is both:
1. Synthetic (informative/ampliative of content), and
2. A Priori (universal and strictly necessary).

This synthesis operates across two transcendental tiers:
- Transcendental Aesthetic: Raw sensations are ordered through the pure forms of sensible intuition—Space (outer sense) and Time (inner sense).
- Transcendental Logic: Sensations are synthesized under the 12 Categories of the Understanding (e.g., Causality, Modality, Substance).

IV. The Phenomenon-Noumenon Boundary:
Cognition is valid only within the realm of possible experience (Phenomena). The Thing-in-itself (Noumenon/Ding an sich) remains fundamentally unknowable to theoretical reason.

Conclusion:
Kant’s transcendental idealism harmonized empirical realism with transcendental subjectivity, laying the cornerstone of modern epistemology and inspiring German Idealism.`
    }
  },

  // --- LAW OPTIONAL ---
  {
    id: "pyq-2024-law-01",
    paper_id: "paper-opt-law",
    paper_code: "OPT-LAW",
    topic_id: "law-p2-1",
    topic_title: "Law of Torts: Absolute Liability (M.C. Mehta)",
    year: 2024,
    marks: 20,
    word_limit: 250,
    time_limit_mins: 15,
    directive: "Examine",
    directive_tip: "Demand: Contrast Strict Liability (Rylands v Fletcher) with Absolute Liability (M.C. Mehta Oleum Gas Leak), analyze statutory exceptions, and discuss Polluter Pays principle.",
    question_en: "“The doctrine of Absolute Liability propounded in M.C. Mehta v. Union of India departs significantly from the Rule in Rylands v. Fletcher.” Examine the jurisprudential rationale and its contemporary environmental significance.",
    question_hi: "“एम.सी. मेहता बनाम भारत संघ में प्रतिपादित पूर्ण दायित्व (Absolute Liability) का सिद्धांत रायलैंड्स बनाम फ्लेचर के नियम से काफी भिन्न है।” इसके विधिशास्त्रीय औचित्य और समकालीन पर्यावरणीय महत्व का परीक्षण कीजिए।",
    model_framework: {
      introduction: "Introduce Justice P.N. Bhagwati's landmark judgment in the Oleum Gas Leak case (M.C. Mehta v. Union of India, 1987) creating an indigenous jurisprudence suited to India's industrial realities.",
      dimensions: [
        {
          name: "Departure from Strict Liability (Rylands v. Fletcher, 1868)",
          points: [
            "Rylands v. Fletcher recognized 5 major exceptions: Act of God (Vis Major), Plaintiff's default, Consent of plaintiff (Volenti non fit injuria), Statutory authority, Independent contractor act.",
            "Absolute Liability allows ZERO exceptions: An enterprise engaged in hazardous/inherently dangerous activity has an absolute, non-delegable duty of care."
          ]
        },
        {
          name: "Jurisprudential Rationale & Measure of Damages",
          points: [
            "Enterprise Liability Principle: The enterprise that derives profit from hazardous activities must internalize all social and ecological risks.",
            "Capacity-Linked Exemplary Damages: Quantum of compensation is correlated with the financial capacity and scale of the enterprise to act as a deterrent."
          ]
        }
      ],
      citations: ["Rylands v. Fletcher (1868)", "M.C. Mehta v. UOI (1987)", "Bhopal Gas Leak Disaster (Union Carbide Corp. 1989)", "Public Liability Insurance Act, 1991", "Article 21 & Article 48A"],
      conclusion: "Absolute Liability became the foundation of India's 'Polluter Pays Principle', National Green Tribunal (NGT) jurisprudence, and environmental constitutionalism under Article 21."
    },
    sample_submission: {
      student_name: "Law Scholar",
      submission_date: "2026-09-22",
      status: "Evaluated",
      v1_text: `Strict liability was started in England in Rylands v Fletcher case in 1868. If a person brings dangerous thing on land and it escapes, he is liable. But it had exceptions like act of God, plaintiff fault, and consent.

In India, after Bhopal Gas tragedy, Oleum gas leaked from Shriram Food factory in Delhi. Supreme Court in MC Mehta case under Justice PN Bhagwati rejected English rule of strict liability and created Absolute liability.

Under absolute liability, there are no exceptions. The company is 100% liable to pay compensation. Also bigger companies must pay higher damages.

This rule is very important for environmental protection in India under Article 21.`,
      v2_text: `In the watershed Oleum Gas Leak Case (M.C. Mehta v. Union of India, 1987), Chief Justice P.N. Bhagwati declared that Indian jurisprudence could not remain tethered to archaic 19th-century English common law principles, establishing the pioneering doctrine of **Absolute Liability**.

I. Strict Liability vs. Absolute Liability: A Jurisprudential Paradigm Shift:
1. Invalidation of Common Law Exceptions:
   - The Rule in *Rylands v. Fletcher (1868)* admitted five explicit defenses: Act of God (*Vis Major*), Plaintiff's Own Default, Third-Party Interference, Statutory Authority, and *Volenti non fit injuria*.
   - Under *M.C. Mehta*, Absolute Liability admits **ZERO exceptions**. Any enterprise carrying on hazardous/inherently dangerous operations owes an absolute and non-delegable duty to the community.
2. Abolition of the 'Escape' Requirement:
   - *Rylands* necessitated escape from the defendant's land. Absolute liability applies whether the harm occurs inside or outside enterprise premises.

II. Economic Rationale of Enterprise Liability:
1. Risk Internalization: Enterprises extracting commercial profits from inherently dangerous technology must internalize the cost of ambient hazard (*Enterprise Liability Doctrine*).
2. Deep-Pocket Compensatory Principle: The quantum of damages is explicitly indexed to the financial capacity and scale of the enterprise, functioning as both restorative justice and punitive deterrence.

III. Contemporary Environmental & Statutory Legacy:
- Legislative Codification: Led directly to the enactment of the *Public Liability Insurance Act, 1991* and statutory underpinnings of the *National Green Tribunal (NGT) Act, 2010*.
- Constitutional Anchoring: Elevated environmental safety into the substantive core of the Right to Life under Article 21 and Directive Principle Article 48A.

Conclusion:
Absolute Liability transformed Indian tort law from an individual fault-based system into a robust instrument of social justice and environmental constitutionalism.`
    }
  },

  // --- GENERAL STUDIES II ---
  {
    id: "pyq-2024-gs2-01",
    paper_id: "paper-3-gs2",
    paper_code: "GS-II",
    topic_id: "gs2-1",
    topic_title: "Indian Constitution & Basic Structure",
    year: 2024,
    marks: 10,
    word_limit: 150,
    time_limit_mins: 7,
    directive: "Critically Analyze",
    directive_tip: "Demand: Break into components, highlight positive aspects, discuss structural limits, and conclude with a synthesis/constitutional remedy.",
    question_en: "“The doctrine of basic structure has prevented constitutional authoritarianism while ensuring institutional equilibrium.” Critically analyze.",
    question_hi: "“मूल संरचना के सिद्धांत ने संस्थागत संतुलन सुनिश्चित करते हुए संवैधानिक अधिनायकवाद को रोका है।” समालोचनात्मक विश्लेषण कीजिए।",
    model_framework: {
      introduction: "Define Basic Structure doctrine (Kesavananda Bharati Case, 1973; Article 368 limitations) as an implied judicial limitation on constituent power.",
      dimensions: [
        {
          name: "Preventing Constitutional Authoritarianism",
          points: [
            "Prevented absolute executive/parliamentary supremacy (e.g., Indira Gandhi v. Raj Narain struck down 39th Amendment).",
            "Safeguarded Fundamental Rights and Judicial Review (Minerva Mills, 1980 - harmony between Part III and Part IV)."
          ]
        },
        {
          name: "Concerns & Institutional Equilibrium Challenges",
          points: [
            "Judicial Overreach / Undefined doctrine (Critique of 'un-elected judges' vetoing legislative will e.g., NJAC judgment 2015).",
            "Lack of fixed constitutional textual definition creates subjective interpretation."
          ]
        }
      ],
      citations: ["Kesavananda Bharati (1973)", "Minerva Mills (1980)", "I.R. Coelho (2007)", "Article 368", "Article 13"],
      conclusion: "Synthesis quoting Granville Austin or N.A. Palkhivala: Basic structure acts as a North Star ensuring constitutionalism without paralyzing dynamic democratic governance."
    },
    sample_submission: {
      student_name: "Aspirant Demo",
      submission_date: "2026-09-20",
      status: "Evaluated",
      v1_text: `The basic structure doctrine was propounded by the Supreme Court in the landmark Kesavananda Bharati case in 1973. It says that Parliament can amend any part of the Constitution under Article 368 but cannot change its basic structure like democracy, secularism and rule of law.

This doctrine has stopped authoritarianism in India. During emergency, 39th amendment tried to put election of PM outside judicial review, but SC struck it down in Raj Narain case. In Minerva Mills case, court held that judicial review and balance between Fundamental rights and DPSP is basic structure.

However, critics say that basic structure is not defined anywhere in the constitution. It leads to judicial activism and friction between legislature and judiciary.

In conclusion, basic structure is very important for Indian democracy and protects citizen rights.`,
      v2_text: `The doctrine of Basic Structure, established in the historic Kesavananda Bharati judgment (1973), acts as an implied substantive limitation on Parliament's constituent amending power under Article 368, reinforcing constitutionalism over parliamentary supremacy.

1. Guarding Against Constitutional Authoritarianism:
- Check on Majoritarianism: Invalidated the 39th Amendment in Indira Nehru Gandhi v. Raj Narain (1975), preserving free and fair elections.
- Preserved Fundamental Rights & Rule of Law: Minerva Mills (1980) restored the golden triangle (Articles 14, 19, 21) and harmonized Part III with Part IV.
- Shielded Judicial Review: I.R. Coelho (2007) brought 9th Schedule laws under judicial scrutiny post-1973.

2. Friction in Institutional Equilibrium:
- 'Judicial Third Chamber': Invalidation of the 99th Constitutional Amendment (NJAC, 2015) was critiqued as impeding democratic appointments.
- Ambiguity & Subjectivity: Absence of a textual definition in the Constitution invites unpredictability.

Conclusion:
As Granville Austin observed, the Indian Constitution is a seamless web. Basic Structure serves as a dynamic ballast, preserving institutional equilibrium while anchoring constitutional morality in India's democracy.`
    }
  },

  // --- GENERAL STUDIES III ---
  {
    id: "pyq-2023-gs3-01",
    paper_id: "paper-4-gs3",
    paper_code: "GS-III",
    topic_id: "gs3-4",
    topic_title: "Science, Tech & Artificial Intelligence",
    year: 2023,
    marks: 15,
    word_limit: 250,
    time_limit_mins: 11,
    directive: "Discuss",
    directive_tip: "Demand: Explore various facets of the issue comprehensively with facts, applications, challenges, and roadmaps.",
    question_en: "“Artificial Intelligence has emerged as a double-edged sword for economic productivity and social ethics.” Discuss the opportunities and risks for India, suggesting a regulatory roadmap.",
    question_hi: "“कृत्रिम बुद्धिमत्ता (AI) आर्थिक उत्पादकता और सामाजिक नैतिकता के लिए दोधारी तलवार के रूप में उभरी है।” भारत के लिए अवसरों और जोखिमों की चर्चा करते हुए एक विनियामक रोडमैप सुझाइए।",
    model_framework: {
      introduction: "Define Generative & Applied AI; cite NITI Aayog's #AIforAll report projecting AI to add $967 Bn to India's economy by 2035.",
      dimensions: [
        {
          name: "Economic Opportunities",
          points: [
            "Agriculture: Precision farming, crop pest prediction (e.g. Kisan e-Mitra, Bhashini AI).",
            "Healthcare: Diagnostic screening in remote PHCs (e.g. AI-driven retinal and tuberculosis scans).",
            "Governance & Financial Inclusion: UPI fraud detection, automated service delivery."
          ]
        },
        {
          name: "Ethical & Socio-Economic Risks",
          points: [
            "Labor Market Disruption: Risk to BPO/IT service sector jobs; algorithmic bias in recruitment.",
            "Deepfakes, Disinformation & Privacy: Threats to electoral integrity and individual dignity (Article 21).",
            "Digital Divide & Data Colonialism: Monopoly of global Big Tech over indigenous LLMs."
          ]
        },
        {
          name: "Regulatory Roadmap",
          points: [
            "Risk-based AI regulation framework (aligned with EU AI Act & Bletchley Declaration).",
            "Digital Personal Data Protection (DPDP) Act enforcement & ethical AI guardrails.",
            "IndiaAI Mission: National compute infrastructure and indigenous sovereign models."
          ]
        }
      ],
      citations: ["NITI Aayog National Strategy on AI", "IndiaAI Mission (₹10,372 Cr)", "DPDP Act 2023", "Bletchley Park Declaration"],
      conclusion: "Conclude with an approach balancing innovation with ethical guardrails to achieve Viksit Bharat @ 2047."
    },
    sample_submission: {
      student_name: "Candidate PS",
      submission_date: "2026-09-21",
      status: "Evaluated",
      v1_text: `Artificial Intelligence (AI) is transforming the world rapidly. India has huge opportunity to use AI in many sectors.

Opportunities:
1. Economy: AI will increase GDP and help in IT sector.
2. Agriculture: Weather forecasting and crop monitoring.
3. Health: AI doctors and diagnosis.
4. Education: Personalized learning for students.

Risks:
1. Job loss in IT and call centres.
2. Deepfakes and crime.
3. Privacy violations.

Suggestions:
Government should make strong law for AI and promote research. NITI Aayog AI for all must be implemented.`,
      v2_text: `Artificial Intelligence (AI) represents the fourth industrial revolution. NITI Aayog projects AI could add $967 billion to the Indian economy by 2035, serving as both a growth multiplier and an ethical challenge.

I. Opportunities for India:
1. Inclusive Agriculture: Precision farming, predictive soil analytics and vernacular advisory through AI platforms (e.g., Kisan e-Mitra).
2. Healthcare Democratization: AI-assisted diagnosis in rural Primary Health Centres (e.g., screening for diabetic retinopathy).
3. Public Service Delivery: Project Bhashini bridging linguistic barriers in citizen-to-government interaction.

II. Socio-Ethical Risks:
1. Employment Disruption: Structural threat to Tier-1/2 IT and BPO jobs without rapid reskilling.
2. Cognitive Security: Proliferation of deepfakes and disinformation threatening democratic discourse.
3. Algorithmic Bias & Privacy: Unchecked data ingestion infringing on Informational Privacy (K.S. Puttaswamy judgment).

III. 4-Pillar Regulatory Roadmap:
1. Risk-Stratified Regulation: Categorize AI applications into Minimal, High, and Unacceptable risk tiers.
2. Robust DPDP 2023 Enforcement: Mandate explicit consent and algorithmic transparency.
3. IndiaAI Mission Sovereign Compute: Subsidize GPU clusters to prevent foreign data dependency.
4. Multilateral Standards: Lead Global Partnership on Artificial Intelligence (GPAI) for ethical governance.

Conclusion:
By synergizing technological innovation with human-centric ethics, India can pioneer 'AI for All' as envisioned in the Viksit Bharat 2047 charter.`
    }
  },

  // --- GENERAL STUDIES I ---
  {
    id: "pyq-2024-gs1-01",
    paper_id: "paper-2-gs1",
    paper_code: "GS-I",
    topic_id: "gs1-1",
    topic_title: "Indian Art Forms, Literature & Architecture",
    year: 2024,
    marks: 10,
    word_limit: 150,
    time_limit_mins: 7,
    directive: "Discuss",
    directive_tip: "Demand: Explain the significance of the topic with facts.",
    question_en: "Evaluate the role of Bhakti and Sufi movements in shaping the composite culture of India.",
    question_hi: "भारत की सामासिक संस्कृति को आकार देने में भक्ति और सूफी आंदोलनों की भूमिका का मूल्यांकन कीजिए।",
    model_framework: {
      introduction: "Define Bhakti and Sufi movements and their origins.",
      dimensions: [
        {
          name: "Cultural Synthesis",
          points: [
            "Amalgamation of Hindu and Islamic traditions.",
            "Development of regional languages (Awadhi, Braj, Punjabi)."
          ]
        }
      ],
      citations: ["Medieval Indian History"],
      conclusion: "Conclude with their lasting impact on secularism."
    },
    sample_submission: {
      student_name: "GS1 Student",
      submission_date: "2026-09-28",
      status: "Evaluated",
      v1_text: "The Bhakti and Sufi movements were very important for Indian culture.",
      v2_text: "These movements promoted religious tolerance and cultural synthesis."
    }
  }
];
