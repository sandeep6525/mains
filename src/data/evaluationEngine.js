/**
 * Authentic UPSC CSE Mains Board-Level 360-Degree Evaluation Engine
 * Emulates the rigorous multi-criteria marking system and psychological evaluation patterns
 * of senior UPSC Board Examiners, Subject Matter Experts (SMEs), and Topper Mentors.
 * 
 * 360-Degree Capabilities:
 * 1. Realistic Numerical Score & Sub-Component Breakdowns (10M, 15M, 20M, 125M, 250M).
 * 2. Unsuccessful Risk Diagnostic & Examiner Penalty Vulnerabilities (Risk Level, Failure Prob %, Generic Traps).
 * 3. "Where They Missed & Why" Root-Cause Failure Analysis (Missed Articles, Precedents, Thinkers, Committees).
 * 4. Cognitive Difficulties & Bottleneck Diagnosis (Time discipline, Recall latency, Structuring friction).
 * 5. Actionable "How to Fix" Topper Blueprint (Step-by-step fix, Before vs. After Rephrasing, Gold Booster Lines).
 * 6. Tailored Micro-Diagram / Flowchart Presentation Generator.
 * 7. 360° Multi-Pillar Scorecard across 6 Dimensions (Directive, Authority, PESTLE, Examiner Psychology, Scannability, Vision).
 * 8. Multi-Persona SME Feedback Panels (Board Lead Examiner, Domain Specialist, Revision Mentor, Annotations).
 * 9. Threaded Delta Improvement Tracker for Draft v1 -> Draft v2 rewrites.
 */

export const BOARD_MARKING_CRITERIA = [
  { id: "directive_demand", name: "Demand & Directive Fulfillment", weight_pct: 25, max_10m: 2.5, max_15m: 3.75 },
  { id: "content_depth", name: "Content Depth & Multidimensionality (PESTLE)", weight_pct: 30, max_10m: 3.0, max_15m: 4.5 },
  { id: "substantiation", name: "Substantiation (Cases, Articles, Committees, Data)", weight_pct: 20, max_10m: 2.0, max_15m: 3.0 },
  { id: "structure_flow", name: "Structure, Sub-headings & Flow", weight_pct: 15, max_10m: 1.5, max_15m: 2.25 },
  { id: "conclusion_vision", name: "Forward-Looking Conclusion / Way Forward", weight_pct: 10, max_10m: 1.0, max_15m: 1.5 }
];

export function evaluateAnswerSubmission(submissionText, questionMeta, isRevision = false, previousEvaluation = null) {
  if (!submissionText || submissionText.trim().length === 0) {
    throw new Error("Submission text is empty.");
  }

  const words = submissionText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const maxMarks = questionMeta?.marks || 10;
  const targetWords = questionMeta?.word_limit || (maxMarks === 15 ? 250 : (maxMarks === 20 ? 250 : (maxMarks >= 100 ? 1000 : 150)));
  const directive = questionMeta?.directive || "Discuss";
  const topicTitle = questionMeta?.topic_title || questionMeta?.topic_name || "Mains Core Subject Theme";
  const lowerText = submissionText.toLowerCase();

  // =========================================================================
  // 1. DIRECTIVE & DEMAND ADHERENCE ANALYSIS
  // =========================================================================
  const directiveLower = directive.toLowerCase();
  const hasCritiqueMarkers = lowerText.includes("however") || lowerText.includes("critique") || lowerText.includes("limitation") || lowerText.includes("challenge") || lowerText.includes("concern") || lowerText.includes("friction") || lowerText.includes("on the other hand") || lowerText.includes("bottleneck") || lowerText.includes("flaw") || lowerText.includes("counter");
  const hasBalancingSynthesis = lowerText.includes("way forward") || lowerText.includes("in conclusion") || lowerText.includes("synthesis") || lowerText.includes("thus") || lowerText.includes("therefore") || lowerText.includes("madhyam marg") || lowerText.includes("harmonious");

  let directiveScoreRatio = 0.55;
  let directiveRating = "Moderate";
  let directiveFeedback = `Addressed basic theme of '${directive}'. Needs explicit multi-part deconstruction and counter-critique balance.`;

  if (directiveLower.includes("critically") || directiveLower.includes("examine") || directiveLower.includes("evaluate")) {
    if (hasCritiqueMarkers && hasBalancingSynthesis) {
      directiveScoreRatio = 0.85;
      directiveRating = "Strong (Topper Quality)";
      directiveFeedback = `Exceptional compliance with '${directive}'. Balanced positive arguments with institutional bottlenecks and a forward-looking constitutional synthesis.`;
    } else if (hasCritiqueMarkers) {
      directiveScoreRatio = 0.68;
      directiveRating = "Proficient";
      directiveFeedback = `Identified key criticisms, but the conclusion lacks an actionable synthesis to fully satisfy '${directive}'.`;
    } else {
      directiveScoreRatio = 0.38;
      directiveRating = "Needs Improvement (High Penalty Risk)";
      directiveFeedback = `The directive '${directive}' strictly demands critical scrutiny of counter-arguments, which was largely missing.`;
    }
  } else {
    directiveScoreRatio = wordCount >= targetWords * 0.75 ? 0.80 : 0.55;
    directiveRating = wordCount >= targetWords * 0.75 ? "Strong" : "Moderate";
  }

  // =========================================================================
  // 2. MULTIDIMENSIONAL COVERAGE (PESTLE + CONSTITUTIONAL + ETHICAL)
  // =========================================================================
  const dimensionKeywords = {
    "Constitutional / Statutory": ["article", "constitution", "amendment", "act", "supreme court", "high court", "judgment", "statutory", "rule of law", "rights", "basic structure", "preamble", "bns", "statute", "doctrine"],
    "Economic / Fiscal": ["gdp", "economy", "growth", "cost", "investment", "budget", "fiscal", "poverty", "inflation", "revenue", "dollar", "billion", "trade", "monetary", "rbi", "manufacturing", "capital", "trilemma"],
    "Social & Grassroots Equity": ["society", "women", "gender", "caste", "marginalized", "tribal", "vulnerable", "education", "health", "poverty", "community", "equality", "inclusion", "sanskritization", "dalit"],
    "Administrative / Governance": ["governance", "administration", "policy", "implementation", "bureaucracy", "civil services", "delivery", "accountability", "transparency", "reforms", "local body", "panchayat", "collector", "2nd arc"],
    "Technological & Scientific": ["technology", "ai", "digital", "data", "cyber", "innovation", "automation", "platform", "infrastructure", "telecom", "semiconductor", "crispr", "precision"],
    "Environmental / Ecological": ["environment", "climate", "sustainable", "ecology", "biodiversity", "green", "pollution", "landslide", "fragile", "disaster", "water", "karst", "irrigation"],
    "Geopolitical & International": ["global", "international", "un", "unfccc", "treaty", "cooperation", "foreign", "multilateral", "bilateral", "cop", "geopolitical", "quad", "brics", "sco", "strategic autonomy"]
  };

  const detectedDimensions = [];
  const missingDimensions = [];

  for (const [dim, keywords] of Object.entries(dimensionKeywords)) {
    const matched = keywords.some(kw => lowerText.includes(kw));
    if (matched) {
      detectedDimensions.push(dim);
    } else {
      missingDimensions.push(dim);
    }
  }

  const coveragePercent = Math.min(100, Math.round((detectedDimensions.length / Object.keys(dimensionKeywords).length) * 100));
  const contentScoreRatio = Math.min(0.88, 0.35 + (detectedDimensions.length * 0.08));

  // =========================================================================
  // 3. CITATIONS & SUBSTANTIATION AUDIT
  // =========================================================================
  const detectedCitations = [];
  const citationMatches = [
    { pattern: /article\s+\d+[a-z]?/gi, name: "Constitutional Article" },
    { pattern: /(kesavananda|minerva\s*mills|coelho|puttaswamy|davinder|indira\s*gandhi|navtej|maneka|s.r.\s*bommai|vishaka|m.c.\s*mehta|rylands|chandra\s*kumar)/gi, name: "Landmark SC Judgment" },
    { pattern: /(niti\s*aayog|2nd\s*arc|sarkaria|punchhi|law\s*commission|plfs|economic\s*survey|tarapore|shanta\s*kumar|kasturirangan|xaxa|famine\s*commission)/gi, name: "Official Committee / Report" },
    { pattern: /(sdg\s*\d*|sendai|cop\d+|paris\s*agreement|un-habitat|unclos|who|mundell|krugman|rawls|weber|durkheim|kant|kahneman|porter|merton|srinivas|bettelle|kautilya|simon|riggs)/gi, name: "Theorist / Global Benchmark" }
  ];

  citationMatches.forEach(item => {
    const match = submissionText.match(item.pattern);
    if (match) {
      match.forEach(m => {
        const clean = m.trim();
        if (!detectedCitations.some(c => c.toLowerCase() === clean.toLowerCase())) {
          detectedCitations.push(clean);
        }
      });
    }
  });

  const substantiationScoreRatio = Math.min(0.90, 0.28 + (detectedCitations.length * 0.16));

  // =========================================================================
  // 4. STRUCTURE, PRESENTATION & PARAGRAPH ANNOTATIONS
  // =========================================================================
  const paragraphs = submissionText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const hasIntro = paragraphs.length >= 1 && paragraphs[0].split(/\s+/).length >= 12;
  const hasBodyBreakdown = submissionText.includes("1.") || submissionText.includes("•") || submissionText.includes("-") || submissionText.includes(":") || paragraphs.length >= 3;
  const hasConclusion = lowerText.includes("conclusion") || lowerText.includes("way forward") || lowerText.includes("in summary") || lowerText.includes("thus") || lowerText.includes("therefore");

  const structureScoreRatio = (hasIntro && hasBodyBreakdown && hasConclusion) ? 0.88 : (paragraphs.length >= 2 ? 0.62 : 0.38);

  const paragraphAnnotations = paragraphs.map((para, pIdx) => {
    const pWords = para.split(/\s+/).length;
    const isFirst = pIdx === 0;
    const isLast = pIdx === paragraphs.length - 1 && paragraphs.length > 1;
    
    if (isFirst) {
      return {
        section: "Introduction & Contextual Hook",
        text_snippet: para.slice(0, 110) + "...",
        rating: pWords >= 15 ? "Strong Conceptual Opening" : "Too Brief / Underdeveloped",
        status: pWords >= 15 ? "Effective Anchor" : "Needs Conceptual Expansion",
        severity: pWords >= 15 ? "good" : "medium",
        comment: pWords >= 15 
          ? "Good initiation. Clearly links the prompt to the core constitutional/theoretical baseline."
          : "Introduction is overly brief. Define the core term or provide the recent statutory trigger to catch examiner attention in the first 10 seconds."
      };
    } else if (isLast) {
      return {
        section: "Conclusion & Forward-Looking Synthesis",
        text_snippet: para.slice(0, 110) + "...",
        rating: hasConclusion ? "Forward-Looking Synthesis" : "Abrupt / Incomplete Ending",
        status: hasConclusion ? "Visionary Wrap-up" : "High Penalty Risk",
        severity: hasConclusion ? "good" : "high",
        comment: hasConclusion
          ? "Balanced synthesis anchoring the conclusion in sustainable constitutional morality or 2nd ARC recommendations."
          : "Abrupt closure without a constructive Way Forward. Examiners penalize answers that merely stop without offering solutions."
      };
    } else {
      const hasStructure = para.includes(":") || para.includes("-") || para.includes("1.") || para.includes("•");
      return {
        section: `Body Section ${pIdx}`,
        text_snippet: para.slice(0, 110) + "...",
        rating: hasStructure ? "Structured & Point-wise" : "Dense Monolithic Paragraph",
        status: hasStructure ? "High Scannability" : "Examiner Fatigue Risk",
        severity: hasStructure ? "good" : "medium",
        comment: hasStructure
          ? "Good point-wise breakdown with distinct sub-headings and readable hierarchy."
          : "Dense unformatted text causes examiner visual fatigue. Break into 2-3 concise bullet points with underlined keywords."
      };
    }
  });

  // =========================================================================
  // 5. AUTHENTIC UPSC BOARD MARKS SCORING
  // =========================================================================
  const compIntro = (maxMarks * 0.15) * (hasIntro ? (pWordsCount(paragraphs[0]) >= 15 ? 0.85 : 0.60) : 0.30);
  const compBody = (maxMarks * 0.45) * ((directiveScoreRatio * 0.5) + (contentScoreRatio * 0.5));
  const compSubstantiation = (maxMarks * 0.25) * substantiationScoreRatio;
  const compConclusion = (maxMarks * 0.15) * (hasConclusion ? 0.85 : 0.40);

  let rawTotalScore = compIntro + compBody + compSubstantiation + compConclusion;
  
  if (wordCount < targetWords * 0.5) {
    rawTotalScore *= 0.70;
  } else if (wordCount > targetWords * 1.4) {
    rawTotalScore *= 0.90;
  }

  const awardedMarks = Math.round(Math.min(maxMarks * 0.78, Math.max(maxMarks * 0.25, rawTotalScore)) * 2) / 2;
  const marksPercentage = Math.round((awardedMarks / maxMarks) * 100);

  // =========================================================================
  // 6. UNSUCCESSFUL RISK AUDIT & EXAMINER PENALTY DIAGNOSTIC
  // =========================================================================
  let failureProbability = 15;
  let riskLevel = "Low Risk (Topper Trajectory)";
  let riskBadgeColor = "emerald";
  const identifiedVulnerabilities = [];

  if (detectedCitations.length === 0) {
    failureProbability += 30;
    identifiedVulnerabilities.push({
      type: "Zero Authoritative Citations",
      severity: "Critical",
      impact: "Marks capped at Average (3.5/10M or 6.0/15M)",
      description: "Answer reads like general knowledge without citing statutory Articles, Supreme Court cases, or official Committees.",
      how_examiner_views_it: "Examiner perceives the candidate as lacking authentic revision depth and slots the copy into the generic 35-45% average bunch."
    });
  } else if (detectedCitations.length === 1) {
    failureProbability += 15;
    identifiedVulnerabilities.push({
      type: "Thin Substantiation Buffer",
      severity: "Moderate",
      impact: "Loss of 1.0 - 1.5 Competitive Marks",
      description: "Only 1 reference detected. Minimum 2-3 distinct legal/empirical anchors required to breach 60% mark threshold.",
      how_examiner_views_it: "Candidate has basic awareness but lacks comprehensive mastery across multiple dimensions."
    });
  }

  if (directiveRating.includes("Needs Improvement")) {
    failureProbability += 35;
    identifiedVulnerabilities.push({
      type: "Directive Non-Compliance Trap",
      severity: "Critical",
      impact: "Severe Mark Deduction (-2.0 Marks)",
      description: `Failed to execute the core demand of '${directive}' (omitted structural counter-critiques or balanced synthesis).`,
      how_examiner_views_it: "Examiner evaluates this as 'answering a memorized topic rather than the specific question asked'."
    });
  }

  if (!hasBodyBreakdown) {
    failureProbability += 15;
    identifiedVulnerabilities.push({
      type: "Monolithic Text & Visual Fatigue",
      severity: "Medium",
      impact: "Examiner Skimming Penalty (-1.0 Mark)",
      description: "Dense essay-style paragraphs without distinct sub-headings or bullet markers.",
      how_examiner_views_it: "Examiners evaluate 25-30 copies daily in 2 hours; unformatted blocks make key arguments invisible during rapid scanning."
    });
  }

  if (wordCount < targetWords * 0.65) {
    failureProbability += 20;
    identifiedVulnerabilities.push({
      type: "Content Breadth Deficit (Under-Length)",
      severity: "High",
      impact: "Premature Score Ceiling",
      description: `Submitted ${wordCount} words against target of ${targetWords} words. Left critical sub-themes unaddressed.`,
      how_examiner_views_it: "Signals lack of content depth or running out of time during real examination conditions."
    });
  }

  failureProbability = Math.min(95, Math.max(8, failureProbability));

  if (failureProbability >= 65) {
    riskLevel = "Critical Vulnerability (Below Cutoff Risk)";
    riskBadgeColor = "rose";
  } else if (failureProbability >= 40) {
    riskLevel = "Moderate Risk (Average Mark Bunching)";
    riskBadgeColor = "gold";
  } else {
    riskLevel = "Low Risk (Top 100 Rank Potential)";
    riskBadgeColor = "emerald";
  }

  // =========================================================================
  // 7. "WHERE THEY MISSED & ROOT-CAUSE FAILURE ANALYSIS"
  // =========================================================================
  const expectedPrecedents = questionMeta?.key_articles || questionMeta?.model_framework?.citations || ["Relevant Constitutional Provision", "Supreme Court Ratio", "2nd ARC Recommendation"];
  const missedPrecedents = expectedPrecedents.filter(p => !detectedCitations.some(c => p.toLowerCase().includes(c.toLowerCase())));

  const rootCauseAnalysis = {
    primary_failure_mode: detectedCitations.length === 0 
      ? "Generic Generalist Expression: Writing intuitive viewpoints instead of statutory/institutional arguments."
      : !hasCritiqueMarkers 
      ? "One-Sided Affirmation Bias: Discussing only benefits while ignoring structural friction and institutional constraints."
      : "Visual & Hierarchy Bottleneck: High-quality thoughts hidden inside dense, un-highlighted prose.",
    cognitive_blindspots: [
      "Failing to break the question into 3 distinct sub-demands during the first 30 seconds.",
      "Treating Introduction as a summary rather than establishing the conceptual/constitutional definition.",
      "Omitting administrative implementation hurdles (e.g. state capacity, fiscal devolution, inter-state friction)."
    ],
    missed_key_dimensions: missingDimensions.slice(0, 3),
    missed_authoritative_anchors: missedPrecedents.length > 0 ? missedPrecedents : ["2nd ARC 4th/10th Report", "NITI Aayog Strategy Charter", "Economic Survey Evidence"]
  };

  // =========================================================================
  // 8. 360-DEGREE MULTI-PILLAR RADAR SCORECARD (0 - 100)
  // =========================================================================
  const pillars360 = {
    directive_precision: Math.round(directiveScoreRatio * 100),
    substantive_authority: Math.round(substantiationScoreRatio * 100),
    multidimensional_pestle: coveragePercent,
    examiner_impression_index: Math.round(Math.max(25, 100 - failureProbability)),
    visual_scannability: Math.round(structureScoreRatio * 100),
    visionary_synthesis: hasConclusion ? 88 : 35
  };

  const overall360Index = Math.round(
    (pillars360.directive_precision * 0.25) +
    (pillars360.substantive_authority * 0.25) +
    (pillars360.multidimensional_pestle * 0.20) +
    (pillars360.examiner_impression_index * 0.15) +
    (pillars360.visual_scannability * 0.15)
  );

  // =========================================================================
  // 9. "HOW TO BE SUCCESSFUL" & REMEDIAL BLUEPRINT (ACTIONABLE FIXES)
  // =========================================================================
  const remedialBlueprint = {
    phase_1_immediate_fix: "Transform introduction from generic background to a sharp 2-line constitutional definition with statutory article/doctrine.",
    phase_2_body_overhaul: `Split the body into 2 distinct thematic headings: (A) Supporting Dimensions & Catalytic Role, and (B) Structural Bottlenecks & Critical Friction points (${missingDimensions[0] || 'Administrative & Social'}).`,
    phase_3_evidence_injection: `Directly inject 2 authoritative anchors: ${expectedPrecedents[0] || 'Supreme Court Landmark'} and ${expectedPrecedents[1] || '2nd ARC Commission'}.`,
    phase_4_conclusion_upgrade: "Replace abrupt ending with a visionary 3-pillar Way Forward linking to Constitutional Morality / SDG 2030 / Viksit Bharat @ 2047.",
    
    // Before vs After Rephrasing Example tailored to the question
    sentence_transformation_demo: {
      before_candidate_draft: "The government has introduced policies for this issue but there are many implementation problems and people face difficulties.",
      after_topper_rewrite: `While statutory frameworks provide enabling architectures, institutional friction—characterized by fiscal bottlenecks and state-capacity deficit (as highlighted by the 2nd ARC)—inhibits seamless last-mile service delivery.`,
      why_it_scores_more: "Replaces vague adjectives ('many problems', 'difficulties') with administrative precision ('institutional friction', 'fiscal bottlenecks', '2nd ARC')."
    },

    // 3 High-Impact Booster Quotes / Precedents for direct plug-in
    topper_gold_booster_lines: [
      `Anchor 1 (Constitutional Morality): "As held in Kesavananda Bharati (1973), institutional equilibrium must preserve constitutionalism without paralyzing executive dynamism."`,
      `Anchor 2 (Administrative Reform): "In line with 2nd ARC 10th Report recommendations, domain competence must be synthesized with citizen-centric transparency."`,
      `Anchor 3 (Empirical Metric): "Socio-economic outcomes must align with NITI Aayog's multidimensional inclusion index to bridge structural disparities."`
    ]
  };

  // =========================================================================
  // 10. CUSTOM MICRO-DIAGRAM PRESENTATION BLUEPRINT
  // =========================================================================
  const valueAddDiagram = {
    title: `Tailored Visual Presentation Blueprint: ${topicTitle}`,
    benefit: "+0.75 to +1.5 Marks boost in examiner impression index",
    suggested_diagram: `┌──────────────────────────────────────────────────────────┐
│  CORE THEME: ${topicTitle.slice(0, 38)}...
└────────────┬─────────────────────────────┬───────────────┘
             │                             │
    ┌────────▼──────────┐         ┌────────▼──────────┐
    │ Legal / Doctrine  │         │ Structural Gaps   │
    │ • ${expectedPrecedents[0] || 'Statutory Pillar'} │         │ • ${missingDimensions[0] || 'Fiscal/Admin Deficit'} │
    └────────┬──────────┘         └────────┬──────────┘
             │                             │
             └──────────────┬──────────────┘
                            │
               ┌────────────▼─────────────┐
               │ Synthesis: 2nd ARC Path  │
               │ • Constitutional Harmony │
               └──────────────────────────┘`
  };

  // =========================================================================
  // 11. MULTI-PERSONA SME FEEDBACK PANELS
  // =========================================================================
  const smeFeedback = {
    board_lead_examiner: {
      title: "Board Lead Examiner Verdict",
      verdict: `Awarded Score: ${awardedMarks} / ${maxMarks} Marks (${marksPercentage}%). ${
        marksPercentage >= 65 
          ? "Outstanding Topper Copy. Exhibits intellectual maturity, structured sub-headings, and strong constitutional balance without ideological bias."
          : marksPercentage >= 50
          ? "Solid attempt that understands the core premise. However, the copy is currently grouped in the 50-55% 'Safe Zone'; to break into the Top 5% bracket, you must inject specific statutory case laws and sharper counter-critiques."
          : "Underdeveloped submission. Answer relies on common-sense generalities rather than authentic UPSC Mains taxonomy, triggering examiner penalty algorithms."
      }`,
      examiner_psychology_tip: marksPercentage >= 60
        ? "Examiner spends ~90 seconds on this copy and immediately recognizes structured mastery. Maintain this under strict 7-11 minute timer conditions."
        : "Examiner's eyes hunt for underlined Articles, Court ratios, and distinct bullet points. Dense unformatted text causes quick skimming and average marking.",
      advice: marksPercentage >= 60
        ? "Maintain this depth in 3-hour timed conditions; use micro-diagrams for high-speed presentation."
        : "Adopt a structured sub-heading format and anchor your thesis in statutory/constitutional provisions."
    },
    domain_specialist: {
      title: "Domain Specialist & Thinker Audit",
      technical_critique: `Detected ${detectedCitations.length} authoritative citations (${detectedCitations.join(", ") || "None"}). Multi-dimensional PESTLE coverage is ${coveragePercent}%. Missing key institutional dimensions: ${missingDimensions.slice(0, 2).join(" & ") || "None"}.`,
      recommended_precedents: expectedPrecedents,
      thinker_advice: "Ground your core arguments in authoritative literature and statutory frameworks rather than generic impressions."
    },
    revision_mentor: {
      title: "Revision Mentor: Score-Leap Plan",
      score_leap_strategy: `Actionable Mark-Jump (+1.5 to +3.0 Marks): Rewrite the body by inserting 1 Supreme Court landmark judgment (${expectedPrecedents[0] || 'Constitutional Article'}) and explicitly addressing the ${missingDimensions[0] || 'Administrative'} dimension.`,
      practical_drill: "Launch the Iterative Revision Studio (Draft v2) to re-evaluate and verify your numerical mark leap."
    }
  };

  // Sectional Scores Breakdown
  const sectionalScores = {
    introduction: `${Math.round(compIntro * 10) / 10} / ${Math.round((maxMarks * 0.15) * 10) / 10}M`,
    body_structure: `${Math.round(compBody * 10) / 10} / ${Math.round((maxMarks * 0.45) * 10) / 10}M`,
    substantiation: `${Math.round(compSubstantiation * 10) / 10} / ${Math.round((maxMarks * 0.25) * 10) / 10}M`,
    conclusion: `${Math.round(compConclusion * 10) / 10} / ${Math.round((maxMarks * 0.15) * 10) / 10}M`
  };

  const evaluationResult = {
    id: `eval-${Date.now()}`,
    timestamp: new Date().toISOString(),
    is_revision: isRevision,
    word_count: wordCount,
    target_words: targetWords,
    max_marks: maxMarks,
    awarded_marks: awardedMarks,
    percentage: marksPercentage,
    marks_percentage: marksPercentage,
    sectional_scores: sectionalScores,
    sub_scores: {
      introduction: Math.round(compIntro * 10) / 10,
      max_intro: Math.round((maxMarks * 0.15) * 10) / 10,
      body_content: Math.round(compBody * 10) / 10,
      max_body: Math.round((maxMarks * 0.45) * 10) / 10,
      substantiation: Math.round(compSubstantiation * 10) / 10,
      max_substantiation: Math.round((maxMarks * 0.25) * 10) / 10,
      conclusion: Math.round(compConclusion * 10) / 10,
      max_conclusion: Math.round((maxMarks * 0.15) * 10) / 10
    },
    realism_band: marksPercentage >= 65 ? "Topper / Top 50 Rank Trajectory" : marksPercentage >= 50 ? "Interview Call / Merit List Band" : "Average / Developing Band",
    percentile_band: marksPercentage >= 65 ? "Top 5% (Score > 65%)" : marksPercentage >= 50 ? "Top 15% (Score 50-64%)" : "40th - 60th Percentile",
    band_color: marksPercentage >= 65 ? "gold" : marksPercentage >= 50 ? "emerald" : "sky",
    
    // 360-Degree Diagnostics Suite
    pillars_360: pillars360,
    overall_360_index: overall360Index,
    risk_analysis: {
      risk_level: riskLevel,
      badge_color: riskBadgeColor,
      failure_probability_pct: failureProbability,
      vulnerabilities: identifiedVulnerabilities
    },
    root_cause_analysis: rootCauseAnalysis,
    remedial_blueprint: remedialBlueprint,
    value_add_diagram: valueAddDiagram,
    
    directive_adherence: {
      rating: directiveRating,
      directive: directive,
      feedback: directiveFeedback
    },
    coverage_percentage: coveragePercent,
    detected_dimensions: detectedDimensions,
    missing_dimensions: missingDimensions,
    detected_citations: detectedCitations,
    paragraph_annotations: paragraphAnnotations,
    sme_feedback: smeFeedback,
    strengths: [
      directiveRating.includes("Strong") && "Precise directive execution balancing affirmative and counter-arguments.",
      detectedDimensions.length >= 4 && `Multidimensional coverage across: ${detectedDimensions.slice(0, 3).join(", ")}.`,
      detectedCitations.length >= 2 && `Substantiated with authentic citations (${detectedCitations.slice(0, 3).join(", ")}).`,
      hasBodyBreakdown && "Clear hierarchical presentation with structured sub-headings."
    ].filter(Boolean),
    gaps: [
      detectedCitations.length === 0 && "Zero authoritative legal/statutory citations.",
      missingDimensions.length > 0 && `Omission of: ${missingDimensions.slice(0, 3).join(", ")} perspectives.`,
      !hasConclusion && "Incomplete / abrupt ending without an actionable forward-looking synthesis.",
      wordCount < targetWords * 0.7 && `Under-length (${wordCount}/${targetWords} words) indicating missing dimensions.`
    ].filter(Boolean),
    actionable_revision_prompt: `SME Action Plan: Inject ${expectedPrecedents[0] || 'key statutory case'} and format body with sub-headings to boost score.`
  };

  // Delta calculation if revising
  if (isRevision && previousEvaluation) {
    const markJump = Math.round((awardedMarks - (previousEvaluation.awarded_marks || 0)) * 10) / 10;
    const markJumpPct = previousEvaluation.awarded_marks > 0 
      ? Math.round(((awardedMarks - previousEvaluation.awarded_marks) / previousEvaluation.awarded_marks) * 100)
      : 0;
    const coverageDelta = coveragePercent - (previousEvaluation.coverage_percentage || 0);
    const newCitations = detectedCitations.filter(c => !previousEvaluation.detected_citations?.includes(c));
    const resolvedGaps = (previousEvaluation.missing_dimensions || []).filter(d => detectedDimensions.includes(d));
    const previousRisk = previousEvaluation.risk_analysis?.failure_probability_pct || 50;
    const riskReduction = Math.max(0, previousRisk - failureProbability);

    evaluationResult.delta_analysis = {
      previous_marks: previousEvaluation.awarded_marks,
      new_marks: awardedMarks,
      mark_jump: markJump > 0 ? `+${markJump} Marks` : "Maintained",
      mark_jump_pct: markJumpPct > 0 ? `+${markJumpPct}% Score Jump` : "Steady",
      coverage_improvement_pct: coverageDelta > 0 ? `+${coverageDelta}%` : "Maintained",
      resolved_dimensions: resolvedGaps,
      newly_added_citations: newCitations,
      risk_reduction_pct: `-${riskReduction}% Failure Risk`,
      percentile_shift: `${previousEvaluation.percentile_band} → ${evaluationResult.percentile_band}`,
      overall_verdict: markJump >= 1.5 || coverageDelta >= 15 || newCitations.length > 0
        ? "Outstanding Topper-Grade Leap (v1 → v2)"
        : "Incremental Polish"
    };
  }

  return evaluationResult;
}

function pWordsCount(str) {
  return str ? str.trim().split(/\s+/).filter(Boolean).length : 0;
}
