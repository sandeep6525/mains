# YuktiPrep Mains 360° — Evaluation Engine Pedagogical Specification

**Document Code:** YUKTI-SPEC-EVAL-360  
**Version:** 2026.1  
**Target Module:** `src/data/evaluationEngine.js`  
**Standard:** UPSC CSE Mains Subject Matter Expert & Board Examiner Grading Rubric  

---

## 1. Pedagogical Foundation & Marking Philosophy

The UPSC Civil Services Mains Examination is not an objective recall test; it is an assessment of an administrative aspirant's **intellectual integrity, depth of understanding, multi-dimensional problem solving, constitutional balance, and crisp communication under extreme time compression**.

The `evaluationEngine.js` module in YuktiPrep Mains 360° is designed to emulate the multi-layered evaluation patterns of senior UPSC Board Examiners.

```
                                  +---------------------------------------+
                                  |     Raw Answer Submission String      |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |      Lexical & Structural Parser      |
                                  |  - Paragraph splitting                |
                                  |  - Word count calculation             |
                                  |  - Bullet & hierarchy detection       |
                                  +-------------------+-------------------+
                                                      |
         +--------------------+-----------------------+-----------------------+--------------------+
         |                    |                       |                       |                    |
         v                    v                       v                       v                    v
+------------------+ +------------------+   +------------------+    +------------------+ +------------------+
|    Directive     | | PESTLE Coverage  |   | Citation Auditor |    |  Structure &     | | Forward-Looking  |
|  Demand Engine   | |   (7 Pillars)    |   | (Cases/Reports)  |    | Scannability     | |    Conclusion    |
|   (25% Weight)   | |   (30% Weight)   |   |   (20% Weight)   |    |   (15% Weight)   | |   (10% Weight)   |
+--------+---------+ +--------+---------+   +--------+---------+    +--------+---------+ +--------+---------+
         |                    |                       |                       |                    |
         +--------------------+-----------------------+-----------------------+--------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |   Aggregate Board Score Calculation   |
                                  |  (10M: 0-7.8M | 15M: 0-11.7M | 250M)  |
                                  +-------------------+-------------------+
                                                      |
         +--------------------------------------------+--------------------------------------------+
         |                                                                                         |
         v                                                                                         v
+------------------------------------+                                   +------------------------------------+
| Unsuccessful Risk & Penalty Engine |                                   | Actionable Remedial Blueprint Gen  |
| - Failure Probability %            |                                   | - Before vs After Rephrasing       |
| - Examiner Skimming Vulnerability  |                                   | - Plug-in Gold Booster Lines       |
| - Generic Generalist Trap Alert    |                                   | - Tailored Micro-Diagram Blueprint |
+------------------------------------+                                   +------------------------------------+
```

---

## 2. Five-Pillar Board Marking Criteria & Weight Distribution

The engine decomposes every question into 5 weighted marking components:

| Pillar ID | Assessment Pillar | Weightage (%) | Max Score (10M) | Max Score (15M) | Max Score (20M) | Key Evaluation Signals |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `directive_demand` | **Directive & Demand Adherence** | 25% | 2.50 M | 3.75 M | 5.00 M | Exact execution of command verbs (*Critically Analyze, Discuss, Evaluate, Examine*). Inclusion of counter-critiques and balanced synthesis. |
| `content_depth` | **Content Depth & PESTLE Breadth** | 30% | 3.00 M | 4.50 M | 6.00 M | Coverage across Political, Economic, Social, Technological, Legal, Administrative, and Environmental dimensions. |
| `substantiation` | **Authoritative Substantiation** | 20% | 2.00 M | 3.00 M | 4.00 M | Explicit citations of Constitutional Articles, Supreme Court ratios, Committee recommendations (e.g. 2nd ARC, Sarkaria), and empirical metrics. |
| `structure_flow` | **Structure, Flow & Scannability** | 15% | 1.50 M | 2.25 M | 3.00 M | Clear introduction, point-wise body with bold/underlined sub-headings, no dense monolithic text blocks. |
| `conclusion_vision` | **Forward-Looking Visionary Synthesis** | 10% | 1.00 M | 1.50 M | 2.00 M | Avoids abrupt endings; connects solution to Constitutional Morality, SDG 2030, or Viksit Bharat @ 2047 frameworks. |
| **Total** | **Comprehensive Score** | **100%** | **10.0 M** | **15.0 M** | **20.0 M** | **Realistic UPSC Merit Ceiling: 60–75% Max** |

---

## 3. PESTLE Multidimensional Dictionary

The engine applies regex pattern matching and semantic parsing across 7 core dimensions:

```javascript
const dimensionKeywords = {
  "Constitutional / Statutory": [
    "article", "constitution", "amendment", "act", "supreme court", 
    "high court", "judgment", "statutory", "rule of law", "rights", 
    "basic structure", "preamble", "bns", "statute", "doctrine"
  ],
  "Economic / Fiscal": [
    "gdp", "economy", "growth", "cost", "investment", "budget", 
    "fiscal", "poverty", "inflation", "revenue", "trade", "monetary", 
    "rbi", "manufacturing", "capital", "trilemma"
  ],
  "Social & Grassroots Equity": [
    "society", "women", "gender", "caste", "marginalized", "tribal", 
    "vulnerable", "education", "health", "community", "equality", 
    "inclusion", "sanskritization", "dalit"
  ],
  "Administrative / Governance": [
    "governance", "administration", "policy", "implementation", 
    "bureaucracy", "civil services", "delivery", "accountability", 
    "transparency", "reforms", "local body", "panchayat", "2nd arc"
  ],
  "Technological & Scientific": [
    "technology", "ai", "digital", "data", "cyber", "innovation", 
    "automation", "platform", "infrastructure", "telecom", "semiconductor", "crispr"
  ],
  "Environmental / Ecological": [
    "environment", "climate", "sustainable", "ecology", "biodiversity", 
    "green", "pollution", "landslide", "fragile", "disaster", "water"
  ],
  "Geopolitical & International": [
    "global", "international", "un", "unfccc", "treaty", "cooperation", 
    "foreign", "multilateral", "bilateral", "cop", "geopolitical", "quad", "brics"
  ]
};
```

---

## 4. Citation & Authority Extraction Patterns

The engine extracts authentic statutory, judicial, and institutional citations via prioritized regular expressions:

1. **Constitutional Articles:** `/article\s+\d+[a-z]?/gi`
2. **Landmark Supreme Court Judgments:** `/(kesavananda|minerva\s*mills|coelho|puttaswamy|davinder|indira\s*gandhi|navtej|maneka|s.r.\s*bommai|vishaka|m.c.\s*mehta|rylands|chandra\s*kumar)/gi`
3. **Official Committees & Commissions:** `/(niti\s*aayog|2nd\s*arc|sarkaria|punchhi|law\s*commission|plfs|economic\s*survey|tarapore|shanta\s*kumar|kasturirangan|xaxa|famine\s*commission)/gi`
4. **Global Frameworks & Theorists:** `/(sdg\s*\d*|sendai|cop\d+|paris\s*agreement|un-habitat|unclos|who|mundell|krugman|rawls|weber|durkheim|kant|kahneman|porter|merton|srinivas|bettelle|kautilya|simon|riggs)/gi`

---

## 5. Unsuccessful Risk & Penalty Diagnostics

Examiners evaluate 25–30 answer scripts within 2 hours. Candidates who exhibit common failure patterns are immediately categorized into the **"35–45% Average Mark Bunch"**.

The engine computes a **Failure Probability Index (0–100%)** based on:
1. **Zero Authoritative Citations Penalty (+30% Risk):** Answer reads like general opinion.
2. **Directive Non-Compliance Trap (+35% Risk):** Failure to provide counter-arguments when asked to *Critically Analyze*.
3. **Monolithic Text & Visual Fatigue Penalty (+15% Risk):** Dense text blocks without sub-headings.
4. **Under-Length Deficit Penalty (+20% Risk):** Word count `< 65%` of required limit.

---

## 6. Multi-Persona SME Feedback Generation

To provide comprehensive pedagogical feedback, the engine generates 3 distinct feedback personas:

```
+----------------------------------------------------------------------------------------------------+
|                                    MULTI-PERSONA SME VERDICT PANEL                                 |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  +-----------------------------+  +-----------------------------+  +----------------------------+  |
|  |     BOARD LEAD EXAMINER     |  |      DOMAIN SPECIALIST      |  |      REVISION MENTOR       |  |
|  |                             |  |                             |  |                            |  |
|  | - Numerical Mark Verdict    |  | - PESTLE Coverage Audit     |  | - Actionable Mark-Jump     |  |
|  | - Realism & Percentile Band |  | - Missing Thinkers/Articles |  |   Strategy (+1.5 - +3.0M)  |  |
|  | - Examiner Psychology Tip   |  | - Precedent Recommendations |  | - Iterative Draft Drill   |  |
|  +-----------------------------+  +-----------------------------+  +----------------------------+  |
+----------------------------------------------------------------------------------------------------+
```
