# YuktiPrep Mains 360° — Integration Flows, Sequence Diagrams & Flowcharts

**Document Code:** YUKTI-INT-FLOW-2026  
**Version:** 2026.1  
**Classification:** Technical Specification & System Integrations  

---

## 1. System Integration Overview

The YuktiPrep Mains 360° platform integrates multiple decoupled modules into a cohesive pedagogical engine. This document specifies all inter-component integration flows, sequence lifecycles, and cryptographic pipelines using standard Mermaid diagrams and API contract schemas.

```
                                  +---------------------------------------+
                                  |     Candidate UI & Event Dispatch     |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |     Unified Router & State Manager    |
                                  +---------+-------------------+---------+
                                            |                   |
                     +----------------------+                   +----------------------+
                     |                                                                 |
                     v                                                                 v
+-----------------------------------------+                       +-----------------------------------------+
|     Answer Writing & Simulator Flow     |                       |       Neural Vision OCR Ingestion       |
|  - Timed Writing Workspace              |                       |  - UPSC QCAB Margin Cropping            |
|  - Word Count & Format Sanitizer        |                       |  - OCR Bounding Box Extractor           |
+--------------------+--------------------+                       +--------------------+--------------------+
                     |                                                                 |
                     +----------------------+                   +----------------------+
                                            |                   |
                                            v                   v
                                  +---------------------------------------+
                                  |   360° Board Evaluation Engine Core   |
                                  |   (evaluationEngine.js Pipeline)      |
                                  +-------------------+-------------------+
                                                      |
                     +--------------------------------+--------------------------------+
                     |                                |                                |
                     v                                v                                v
+-------------------------+      +-------------------------+      +-------------------------+
|  Risk & Penalty Audits  |      |  Root-Cause Diagnostics |      | Multi-Persona SME Panel |
|  - Failure Prob %       |      |  - PESTLE Gaps          |      | - Lead Examiner Verdict |
|  - Directives Traps     |      |  - Missed Citations     |      | - Delta v1->v2 Tracker  |
+-------------------------+      +-------------------------+      +-------------------------+
```

---

## 2. End-to-End Answer Writing & Iterative Revision Flowchart

This flowchart illustrates the complete lifecycle of a candidate practicing a single question: from question selection, timed composition (or OCR upload), multi-criteria evaluation, to launching the revision workspace and tracking the delta improvement.

```mermaid
flowchart TD
    Start([Candidate Initiates Practice Session]) --> SelectQ[Select Question from PYQ Vault / 10Y Archive / Syllabus]
    SelectQ --> InitStudio[Initialize Answer Writing Studio with Target Time & Words]
    
    InitStudio --> InputMethod{Input Modality Choice}
    InputMethod -->|Direct Typing| StartTimer[Start Countdown Timer: 7m/11m/15m]
    InputMethod -->|Handwritten Answer| OpenOCR[Open Handwritten OCR Scanner Modal]
    
    OpenOCR --> ScanQCAB[Scan UPSC QCAB 32-Line Sheet]
    ScanQCAB --> ExtractText[Extract Neural Vision Transcript]
    ExtractText --> ImportStudio[Transfer Transcript to Answer Studio Editor]
    ImportStudio --> StartTimer
    
    StartTimer --> TypeDraft[Compose Answer Draft v1]
    TypeDraft --> SubmitDraft[Click 'Evaluate Submission' Button]
    
    SubmitDraft --> EvalEngine[Execute evaluateAnswerSubmission Pipeline]
    
    subgraph Evaluation_Suite ["360° Pedagogical Diagnostic Processing"]
        EvalEngine --> ParseDirective[1. Directive Compliance & Demands]
        EvalEngine --> ParsePESTLE[2. PESTLE Multi-Dimensional Keyword Extraction]
        EvalEngine --> ParseCitations[3. Supreme Court, Articles & Committees Audit]
        EvalEngine --> ParseStructure[4. Paragraph Hierarchy & Scannability Scoring]
        EvalEngine --> CalcMarks[5. Authentic UPSC Board Numerical Scoring]
        EvalEngine --> CalcRisk[6. Penalty Vulnerability & Failure Probability %]
        EvalEngine --> GenSME[7. Multi-Persona SME Verdicts & Annotations]
        EvalEngine --> GenRemedial[8. Remedial Blueprint & Micro-Diagram Blueprint]
    end
    
    Evaluation_Suite --> RenderScorecard[Render 360° Multi-Pillar Scorecard & Feedback Panels]
    
    RenderScorecard --> UserChoice{Candidate Action Decision}
    UserChoice -->|Accept & Exit| SaveProgress[Record Session in Mastery Analytics]
    UserChoice -->|Iterative Revision| LaunchRevision[Open 360° Board Revision Studio]
    
    LaunchRevision --> LoadV1Context[Load Draft v1 Text + Identified Penalty Gaps]
    LoadV1Context --> EditV2[Edit Draft v2: Inject Precedents & Refine Structure]
    EditV2 --> EvalRevision[Execute Revision Evaluation with Delta Comparator]
    
    EvalRevision --> CalcDelta[Compute: Mark Jump, Score Leap %, Risk Reduction & Citation Additions]
    CalcDelta --> Confetti[Trigger Gamified Milestone Celebration]
    Confetti --> ApplyV2[Apply Draft v2 to Studio History]
    ApplyV2 --> SaveProgress
    SaveProgress --> EndSession([Session Complete & Knowledge Retained])
```

---

## 3. Sequence Diagram: Neural Vision OCR & Handwritten QCAB Ingestion

This sequence diagram details the exact event flow between the candidate, the UI layer, the OCR scanner modal, the neural vision engine, and the evaluation engine.

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate / Aspirant
    participant Studio as AnswerWritingStudio (React)
    participant OCRModal as OCRScannerModal
    participant OCRSim as Neural Vision OCR Engine
    participant EvalCore as evaluationEngine.js
    participant Storage as Local State / Vault

    Candidate->>Studio: Clicks "Scan Handwritten Answer"
    Studio->>OCRModal: Set isOpen = true (Pass questionMeta)
    OCRModal-->>Candidate: Displays QCAB 32-Line Canvas & Margin Boundaries
    Candidate->>OCRModal: Uploads Image or Selects QCAB Sample Page
    Candidate->>OCRModal: Clicks "Scan & Extract Text"
    OCRModal->>OCRSim: Dispatch OCR Scan Job (Image Data, QCAB Profile)
    
    loop Scanning Animation & Laser Sweeper
        OCRSim-->>OCRModal: Stream Progress (10% -> 50% -> 100%)
    end
    
    OCRSim->>OCRSim: Execute Text Bounding Box & Margin Filtration
    OCRSim-->>OCRModal: Return Extracted Transcript + Confidence Score (98.7%)
    OCRModal-->>Candidate: Renders Side-by-Side Editable Transcript
    Candidate->>OCRModal: Edits / Verifies Transcription
    Candidate->>OCRModal: Clicks "Transfer to Answer Studio"
    OCRModal->>Studio: Invoke onImportText(transcript)
    OCRModal->>Studio: Close Modal (isOpen = false)
    Studio-->>Candidate: Answer Editor Populated with Digitized Text
    
    Candidate->>Studio: Clicks "Evaluate Submission"
    Studio->>EvalCore: evaluateAnswerSubmission(transcript, questionMeta)
    EvalCore->>EvalCore: Compute 360° Scoring, Citations, PESTLE & Risk
    EvalCore-->>Studio: Return comprehensive evaluationResult
    Studio->>Storage: Persist Attempt Metadata
    Studio-->>Candidate: Render 360° Diagnostic Scorecard
```

---

## 4. Sequence Diagram: 360° Iterative Revision Studio (Draft v1 → v2 Delta Tracker)

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate / Aspirant
    participant Studio as AnswerWritingStudio
    participant RevModal as RevisionWorkspaceModal
    participant EvalCore as evaluationEngine.js (isRevision=true)
    participant Analytics as MasteryAnalytics

    Candidate->>Studio: Reviews v1 Scorecard (e.g. 4.5/10M, High Failure Risk)
    Candidate->>Studio: Clicks "Launch Iterative Revision (Draft v2)"
    Studio->>RevModal: Open Modal (Pass v1Text, v1Evaluation, questionMeta)
    RevModal-->>Candidate: Renders Split Workspace (v1 Gaps Left, v2 Editor Right)
    
    Candidate->>RevModal: Modifies Text / Injects Missing Cases & Structured Headings
    Candidate->>RevModal: Clicks "Measure Delta Score Jump"
    RevModal->>EvalCore: evaluateAnswerSubmission(v2Text, questionMeta, true, v1Evaluation)
    
    EvalCore->>EvalCore: Evaluate v2 Raw Metrics
    EvalCore->>EvalCore: Calculate Deltas (Mark Jump, % Gain, Resolved Gaps, Risk Drop)
    EvalCore-->>RevModal: Return evaluationResult with delta_analysis
    RevModal-->>Candidate: Displays Delta Scorecard (+2.5 Marks, -35% Failure Risk)
    RevModal-->>Candidate: Triggers Confetti Animation
    
    Candidate->>RevModal: Clicks "Apply Draft v2 to Studio"
    RevModal->>Studio: onSaveRevision(v2Text, v2Evaluation)
    RevModal->>Studio: Close Modal
    Studio->>Analytics: Update Candidate Progression Ledger (+Delta Jump)
    Studio-->>Candidate: Studio Displays Updated Mastery State
```

---

## 5. 3-Hour Full Paper Simulator Lifecycle Flowchart

This flowchart outlines how the 3-Hour (180 Minutes), 250-Mark, 20-Question simulation engine executes, manages real-time test state, and performs aggregate multi-question grading upon submission.

```mermaid
flowchart TD
    subgraph Sim_Initialization ["Simulation Phase 1: Test Initialization"]
        SimStart([Candidate Starts 3-Hour Full Mock]) --> SelectPaper[Select Paper: GS-I, GS-II, GS-III, GS-IV, or Optional]
        SelectPaper --> LoadPaperData[Load 20 Official Questions from fullPaperData.js]
        LoadPaperData --> InitClock[Initialize Master Clock: 180 Minutes / 10,800 Seconds]
        InitClock --> InitState[Initialize Question Palette: 1-10 Section A, 11-20 Section B]
    end

    subgraph Sim_Active_Exam ["Simulation Phase 2: Live Test Orchestration"]
        InitState --> ActiveTimer[Master Countdown Active]
        ActiveTimer --> DisplayCurrentQ[Display Active Question Card with Marks & Time Target]
        
        DisplayCurrentQ --> UserAction{Candidate Action}
        UserAction -->|Type Answer| UpdateAnswer[Update answers Map: answers[qId] = text]
        UserAction -->|Flag Question| ToggleFlag[Update flagged Map: flagged[qId] = !flagged[qId]]
        UserAction -->|Scan Handwritten| LaunchOCRModal[OCR Modal -> Import to Current Q]
        UserAction -->|Navigate Palette| SelectIndex[Set currentQIndex = targetIndex]
        
        UpdateAnswer --> AutoSaveBuffer[Continuous In-Memory State Sync]
        ToggleFlag --> AutoSaveBuffer
        LaunchOCRModal --> AutoSaveBuffer
        SelectIndex --> DisplayCurrentQ
        AutoSaveBuffer --> ActiveTimer
    end

    subgraph Sim_Termination ["Simulation Phase 3: Final Submission & Aggregate Board Evaluation"]
        ActiveTimer --> TimeExpires{Time Expired OR Manual Submit?}
        TimeExpires -->|Yes| HaltClock[Halt Master Timer]
        HaltClock --> BatchEval[Dispatch Batch Evaluation for All 20 Questions]
        
        BatchEval --> EvalLoop[Iterate through questions 1 to 20]
        EvalLoop --> EvalItem[Call evaluateAnswerSubmission for Each Answer]
        EvalItem --> Accumulate[Accumulate Section A Score, Section B Score, Total Marks & Percentile]
        
        Accumulate --> GenSimReport[Generate Full Paper Comprehensive Performance Report]
        GenSimReport --> RenderSummary[Render 250M Summary Dashboard with Question Breakdown]
        RenderSummary --> SyncAnalytics[Push Aggregated Score to Mastery Analytics]
        SyncAnalytics --> SimEnd([Simulation Concluded])
    end
```

---

## 6. Post-Quantum Cryptography (PQC) & Zero-Trust Security Pipeline

YuktiPrep Mains 360° incorporates a forward-looking quantum-ready cryptographic architecture designed to safeguard candidate intellectual property, examination papers, and evaluation transcripts against "Harvest Now, Decrypt Later" (HNDL) quantum threats.

```mermaid
flowchart LR
    subgraph Candidate_Client ["Candidate Client Terminal (React 19 / Browser)"]
        RawDraft[Candidate Answer Draft / QCAB Image]
        PQC_KEM[NIST FIPS 203 ML-KEM Key Encapsulation]
        PQC_DSA[NIST FIPS 204 ML-DSA Lattice Signature]
        AES_GCM[AES-256-GCM Symmetrical Payload Cipher]
    end

    subgraph Zero_Trust_Transport ["Zero-Trust Quantum-Safe Transport"]
        TLS_PQC[Hybrid Post-Quantum TLS 1.3 Tunnel]
    end

    subgraph Cloud_Vault ["Quantum-Safe Evaluation Vault & Storage"]
        KMS_PQC[Post-Quantum Key Management Service]
        Watermark_Engine[QCAB Tamper-Evident Watermark Engine]
        Encrypted_DB[(Encrypted Ledger & Analytics DB)]
    end

    RawDraft --> AES_GCM
    PQC_KEM --> AES_GCM
    RawDraft --> PQC_DSA
    AES_GCM --> TLS_PQC
    PQC_DSA --> TLS_PQC
    
    TLS_PQC --> KMS_PQC
    KMS_PQC --> Watermark_Engine
    Watermark_Engine --> Encrypted_DB
```

### 6.1 Cryptographic Protocol Specifications
1. **Key Encapsulation Mechanism (KEM):** ML-KEM-768 (CRYSTALS-Kyber) for post-quantum symmetric key exchange.
2. **Digital Signatures (DSA):** ML-DSA-65 (CRYSTALS-Dilithium) for non-repudiation of submitted examination papers.
3. **Payload Encryption:** AES-256-GCM authenticated encryption for candidate answer payloads in local memory and storage.
4. **Zero-Knowledge Proofs (ZKP):** Anonymous score verification enabling candidates to prove percentile rankings without exposing raw answer text.

---

## 7. Mastery Analytics & Remedial Loop Flowchart

```mermaid
flowchart TD
    subgraph Signal_Collection ["1. Diagnostic Signal Collection"]
        InStudio[Single Question Submissions in Studio] --> DataCollector[Diagnostic Signal Aggregator]
        InRevision[Revision Delta Gains in Revision Studio] --> DataCollector
        InSim[Full 250M Simulated Paper Results] --> DataCollector
    end

    subgraph Analysis_Engine ["2. Multi-Dimensional Competency Mapping"]
        DataCollector --> PaperCoverage[Calculate Paper-Wise Syllabus Coverage %]
        DataCollector --> DirectiveEngine[Analyze Directive Mastery: Discuss, Critically Analyze, etc.]
        DataCollector --> SpeedTracker[Calculate Writing Velocity: Words/Min & Latency]
        DataCollector --> GapClassifier[Identify High-Yield Conceptual Gaps]
    end

    subgraph Remedial_Dispatcher ["3. Dynamic Action Recommendation Engine"]
        GapClassifier --> GenTasks[Generate Prioritized Remedial Task Cards]
        GenTasks --> RemPolity[E.g., GS-II Governor Discretionary Powers Practice]
        GenTasks --> RemEcon[E.g., GS-III Semiconductor PLI Framework Practice]
        GenTasks --> RemEthics[E.g., GS-IV Deontological Ethics Case Studies]
    end

    subgraph Execution_Loop ["4. Closed-Loop Practice Execution"]
        RemPolity --> ClickRemedial[Candidate Clicks 'Launch Targeted Remedial Drill']
        RemEcon --> ClickRemedial
        RemEthics --> ClickRemedial
        ClickRemedial --> LoadTargetQ[Auto-Load Tailored PYQ into Answer Studio]
        LoadTargetQ --> InStudio
    end
```

---

## 8. API & Data Contract Specifications

### 8.1 Answer Evaluation Request Payload (`EvaluationRequest`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "EvaluationRequest",
  "type": "object",
  "required": ["submissionText", "questionMeta"],
  "properties": {
    "submissionText": {
      "type": "string",
      "description": "Full text of candidate answer submission."
    },
    "questionMeta": {
      "type": "object",
      "required": ["id", "marks", "word_limit", "directive"],
      "properties": {
        "id": { "type": "string" },
        "paper_code": { "type": "string" },
        "topic_name": { "type": "string" },
        "marks": { "type": "integer", "enum": [10, 15, 20, 125, 250] },
        "word_limit": { "type": "integer" },
        "directive": { "type": "string" },
        "key_articles": { "type": "array", "items": { "type": "string" } },
        "model_framework": { "type": "object" }
      }
    },
    "isRevision": {
      "type": "boolean",
      "default": false
    },
    "previousEvaluation": {
      "type": "object",
      "description": "Nullable previous evaluation result for Draft v1 -> v2 delta calculation."
    }
  }
}
```

### 8.2 Answer Evaluation Result Payload (`EvaluationResult`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "EvaluationResult",
  "type": "object",
  "required": [
    "id",
    "timestamp",
    "word_count",
    "max_marks",
    "awarded_marks",
    "marks_percentage",
    "pillars_360",
    "risk_analysis",
    "root_cause_analysis",
    "remedial_blueprint",
    "sme_feedback"
  ],
  "properties": {
    "id": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "is_revision": { "type": "boolean" },
    "word_count": { "type": "integer" },
    "target_words": { "type": "integer" },
    "max_marks": { "type": "number" },
    "awarded_marks": { "type": "number" },
    "marks_percentage": { "type": "integer" },
    "realism_band": { "type": "string" },
    "percentile_band": { "type": "string" },
    "pillars_360": {
      "type": "object",
      "properties": {
        "directive_precision": { "type": "integer" },
        "substantive_authority": { "type": "integer" },
        "multidimensional_pestle": { "type": "integer" },
        "examiner_impression_index": { "type": "integer" },
        "visual_scannability": { "type": "integer" },
        "visionary_synthesis": { "type": "integer" }
      }
    },
    "risk_analysis": {
      "type": "object",
      "properties": {
        "risk_level": { "type": "string" },
        "failure_probability_pct": { "type": "integer" },
        "vulnerabilities": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": { "type": "string" },
              "severity": { "type": "string" },
              "impact": { "type": "string" },
              "description": { "type": "string" },
              "how_examiner_views_it": { "type": "string" }
            }
          }
        }
      }
    },
    "delta_analysis": {
      "type": "object",
      "properties": {
        "previous_marks": { "type": "number" },
        "new_marks": { "type": "number" },
        "mark_jump": { "type": "string" },
        "mark_jump_pct": { "type": "string" },
        "risk_reduction_pct": { "type": "string" },
        "resolved_dimensions": { "type": "array", "items": { "type": "string" } },
        "newly_added_citations": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
```
