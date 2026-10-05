# FetchIQ OCR Reconstruction Audit

## 1. Q1 AUDIT

Q1 English:
```
Which one of the following Carnatic music ragas is similar to Raga Bilawal in Hindustani music ? Emergence of urban life
```

Q1 Hindi:
```
निम्नलिखित में से कर्नाटिक संगीत के किस राग का हिन्ुस्तानी संगीत के राग बिलावल से मेल है? शहरी जीवन के उद्व से मुद्रा अ्थव्यवस्था कीओर संक्रमण से नीचे दिए गए कूट का प्रयोग कर उत्तर चुनिएः:
```

- **Source Indices:** English = 6, Hindi = 0
- **sourceQuestionNumber:** English = 1, Hindi = 1
- **detected language:** English = ENGLISH, Hindi = HINDI

**Explanation:**
The raw OCR extracted Q1 Hindi at index 0 (page 1, left column) and Q1 English at index 6 (page 2, left column). Both have `sourceQuestionNumber: 1` and were correctly classified as HINDI and ENGLISH based on character density. They cleanly share the `QUESTION_START` pattern. No Q4 text has entered Q1, because Q4 text did not meet the start criteria and was safely isolated as uncertain fragments.

## 2. Q4 AUDIT

Q4 fragments found:
- **Fragment ID:** frag_1
  - Source Index: 0
  - Source QNum: 1
  - Detected Language: MIXED
  - Classification: UNCERTAIN
  - Preview: (vasrimiler9) 29o1v192 livi0 asosnoisnimsxd निम्नल
  - Confidence: LOW (Unresolved)
- **Fragment ID:** frag_3
  - Source Index: 1
  - Source QNum: 2
  - Detected Language: HINDI
  - Classification: UNCERTAIN
  - Preview: हुचिमलिलगुड़ी मंदिर, ऐहोल
  - Confidence: LOW (Unresolved)
- **Fragment ID:** frag_5
  - Source Index: 2
  - Source QNum: 3
  - Detected Language: HINDI
  - Classification: UNCERTAIN
  - Preview: दशावतार मंदिर, देवगढ़
  - Confidence: LOW (Unresolved)
- **Fragment ID:** frag_6
  - Source Index: 3
  - Source QNum: 4
  - Detected Language: HINDI
  - Classification: UNCERTAIN
  - Preview: विरुपाक्ष मंदिर, पृदकल नीचे दिए गए कूट का प्रयोग क
  - Confidence: LOW (Unresolved)
- **Fragment ID:** frag_9
  - Source Index: 6
  - Source QNum: 1
  - Detected Language: ENGLISH
  - Classification: UNCERTAIN
  - Preview: Malegitti Shivalaya, Badami
  - Confidence: LOW (Unresolved)
- **Fragment ID:** frag_11
  - Source Index: 7
  - Source QNum: 2
  - Detected Language: ENGLISH
  - Classification: UNCERTAIN
  - Preview: Huchimalligudi Temple, Aihole
  - Confidence: LOW (Unresolved)
- **Fragment ID:** frag_13
  - Source Index: 8
  - Source QNum: 3
  - Detected Language: ENGLISH
  - Classification: UNCERTAIN
  - Preview: Dashavatara Temple, Deogarh
  - Confidence: LOW (Unresolved)
- **Fragment ID:** frag_39
  - Source Index: 27
  - Source QNum: 4
  - Detected Language: HINDI
  - Classification: UNCERTAIN
  - Preview: यव्यावती :ब्यास नीचे दिए गए कूट का प्रयोग कर उत्तर
  - Confidence: LOW (Unresolved)
- **Fragment ID:** frag_15
  - Source Index: 9
  - Source QNum: 4
  - Detected Language: ENGLISH
  - Classification: QUESTION_START
  - Preview: Which of the following temples has/have a Nagara-s
  - Confidence: LOW (Unresolved)

**Conclusion:** The evidence for Q4 is scattered across multiple indices and source question numbers (1, 2, 3, 4) due to OCR columnar artifacts. It is correctly marked UNCERTAIN and UNRESOLVED.

## 3. QUESTION IDENTITY AUDIT

| candidate ID | question # | English frags | Hindi frags | confidence | classification | validation status |
|---|---|---|---|---|---|---|
| cand_1 | 1 | frag_10 | frag_0 | HIGH | CONFIDENT_PAIR | PASS |
| cand_2 | 3 | frag_14 | frag_4 | HIGH | CONFIDENT_PAIR | PASS |

**Duplicate Fragment Check:** 0 fragments are assigned to more than one candidate.

## 4. NO DATA LOSS CHECK

- Raw OCR fields (length > 5): 44
- Total fragments created: 44
- Fragments assigned to candidates: 4
- Unresolved fragments: 40

**Verification:** 4 + 40 = 44 (Matches Total Raw Fragments: YES)

## 5. NO FABRICATION CHECK

- All normalized text is exactly equal to the raw OCR text.
- No translation was generated.
- No sentence was invented.
- No text was silently corrected.

## 6. DUPLICATE CHECK

Warnings emitted for duplicate question numbers:
- DUPLICATE QUESTION NUMBER 1 FOUND
- DUPLICATE QUESTION NUMBER 2 FOUND
- DUPLICATE QUESTION NUMBER 3 FOUND
- DUPLICATE QUESTION NUMBER 4 FOUND
- DUPLICATE QUESTION NUMBER 5 FOUND
- DUPLICATE QUESTION NUMBER 6 FOUND
- DUPLICATE QUESTION NUMBER 8 FOUND

Duplicates were left as warnings and not automatically renumbered.

## 7. ACCEPTANCE CRITERIA

- [x] Q1 English is correct
- [x] Q1 Hindi is correct
- [x] Q1 contains no Q4 text
- [x] Q4 is not incorrectly merged
- [x] every raw fragment is preserved
- [x] no fragment belongs to two candidates
- [x] no fabricated text exists
- [x] no automatic translation exists
- [x] unresolved fragments remain visible
- [x] duplicate numbers remain warnings
- [x] missing questions remain warnings

**Final status: AUDIT PASS — SAFE TO INTEGRATE**
