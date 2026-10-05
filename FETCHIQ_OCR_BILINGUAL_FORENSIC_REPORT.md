# FetchIQ OCR Bilingual Forensic Report

## Raw OCR Diagnostic Table

| OCR index | questionNumber | page | source field | detected language | text preview | likely question |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | 1 | null | english | HINDI | (vasrimiler9) ... नागर-शैली के शिखर हैं? मालेगिटी... | Q4 (Hindi) start + stmt 1 |
| 0 | 1 | null | hindi | HINDI | निम्नलिखित में से कर्नाटिक संगीत के किस राग का... | Q1 (Hindi) |
| 1 | 2 | null | english | HINDI | हुचिमलिलगुड़ी मंदिर, ऐहोल | Q4 (Hindi) stmt 2 |
| 1 | 2 | null | hindi | HINDI | हिल्टन-यंग कमीशन (1926) द्वारा कृत्रिम रूप से... | Q2 (Hindi) |
| 2 | 3 | null | english | HINDI | दशावतार मंदिर, देवगढ़ | Q4 (Hindi) stmt 3 |
| 2 | 3 | null | hindi | HINDI | निम्नलिखित कथनों पर विचार कीजिए: I. पाली ग्रंथों... | Q3 (Hindi) |
| 3 | 4 | null | english | HINDI | विरुपाक्ष मंदिर, पृदकल नीचे दिए गए कूट का प्रयोग... | Q4 (Hindi) stmt 4 + instruction |
| 4 | 5 | null | english | HINDI | जैन धर्म में मान्यता-प्रासत जीवन के अस्त्व के... | Q5 (Hindi) |
| 5 | 6 | null | english | HINDI | बाघ गुफाओं में विदधयमान हल्लसालस्य चित्र क्या... | Q6 (Hindi) |
| 6 | 1 | null | english | ENGLISH | Which one of the following Carnatic music ragas... | Q1 (English) |
| 6 | 1 | null | hindi | ENGLISH | Malegitti Shivalaya, Badami | Q4 (English) stmt 1 |
| 7 | 2 | null | english | ENGLISH | The artificially fixed rupee-sterling exchange... | Q2 (English) |
| 7 | 2 | null | hindi | ENGLISH | Huchimalligudi Temple, Aihole | Q4 (English) stmt 2 |
| 8 | 3 | null | english | ENGLISH | Consider the following statements : I. Pali texts... | Q3 (English) |
| 8 | 3 | null | hindi | ENGLISH | Dashavatara Temple, Deogarh | Q4 (English) stmt 3 |
| 9 | 4 | null | hindi | ENGLISH | Which of the following temples has/have a Nagara... | Q4 (English) start + stmt 4 |
| 10 | 5 | null | hindi | ENGLISH | Among the four main forms of existence of life... | Q5 (English) |
| 11 | 6 | null | hindi | ENGLISH | The Hallisalasya painting in the Bagh Caves... | Q6 (English) |

## Forensic Analysis

### Q1 (Carnatic Music / Raga Bilawal)
- **Actual English source block:** Index 6 (`english` field)
- **Actual Hindi source block:** Index 0 (`hindi` field)
- **Unrelated fragments:** None. The fields for Q1 cleanly contain the full Q1 text.
- **Confidence/reason:** High confidence. These two blocks cleanly represent Q1. They share `questionNumber: 1` and are the dominant blocks for that question.

### Q4 (Temple Shikhara)
- **Actual English source block:** Fragmented across Index 9 (`hindi` field, main text + stmt 4), Index 6 (`hindi` field, stmt 1), Index 7 (`hindi` field, stmt 2), Index 8 (`hindi` field, stmt 3).
- **Actual Hindi source block:** Fragmented across Index 0 (`english` field, main text + stmt 1), Index 1 (`english` field, stmt 2), Index 2 (`english` field, stmt 3), Index 3 (`english` field, stmt 4).
- **Unrelated fragments:** The fragments for Q4 are assigned `questionNumber` 1, 2, 3, and 4 because the Python OCR script assigned the horizontal row number to both columns.
- **Confidence/reason:** Low confidence for automated programmatic merging. The OCR engine outputted Q4 entirely out of order for English (main text is at index 9, statements at 6-8). The Hindi text is sequentially spread across 0-3. Relying strictly on sequential pairing of English/Hindi arrays fails here because Q4's English sequence is 9, 6, 7, 8, while its Hindi sequence is 0, 1, 2, 3.

## Proposed Strategy
The current architecture must NOT merge fragments across different `questionNumber` values. Since Q4 was fragmented across `qNum` 1, 2, 3, 4, these fragments must be emitted as **independent, unpaired blocks** during normalization. The Admin will manually merge them in the Review UI. 

For Q1, it can be confidently paired because Q1 Hindi is `qNum=1` and Q1 English is `qNum=1`, and neither is fragmented across other numbers.

**Status:** FORENSIC PASS / BLOCKED (Normalization fix pending)
