# Multilingual PDF question extractor

Python 3.10+. Runs locally with no cloud API or translation service. Tested on the supplied image: one main question numbered 2, the shared passage, and five children (a)–(e). Actual OCR output is in example_output/.

## Installation

    python -m pip install -r requirements.txt

For scanned PDFs and images, install Tesseract separately. Ubuntu/Debian:

    sudo apt-get install tesseract-ocr tesseract-ocr-eng tesseract-ocr-tel tesseract-ocr-hin

Windows: install Tesseract following its official installation documentation, add its executable directory to PATH, and install requested .traineddata files in tessdata. Confirm:

    tesseract --list-langs

OCR language codes: English eng; Telugu tel; Hindi hin; Tamil tam; Kannada kan; Malayalam mal; Bengali ben; Marathi mar; Gujarati guj; Punjabi pan; Urdu ur; Arabic ara. Install each requested pack. Choose only the languages actually present in the document.

## Run

Text or scanned PDF, automatically choosing text extraction or OCR per page:

    python extract_questions.py exam.pdf --languages eng+tel --output results

English/Hindi:

    python extract_questions.py exam.pdf --languages eng+hin --output results

Image:

    python extract_questions.py question.png --languages eng --output results

Force OCR when a PDF has incomplete, scrambled or misleading text layers:

    python extract_questions.py exam.pdf --ocr always --languages eng+tel

Two equal-width columns (read left column before right column):

    python extract_questions.py exam.pdf --columns 2 --psm 3

Disable OCR for a known text PDF:

    python extract_questions.py exam.pdf --ocr never

Import into your application:

    from pathlib import Path
    from extract_questions import extract, parse_pages, save
    pages = extract(Path('exam.pdf'), languages='eng+tel')
    result = parse_pages(pages)
    save(result, pages, Path('results'))

## Outputs

- questions.json: main question text (including its shared passage), child labels/text, page numbers, preamble and warnings.
- questions.csv: one row per child; repeats the parent's passage so each row retains context. UTF-8 BOM supports common spreadsheet applications.
- raw_pages.json: original extracted page text and extraction method for review and re-parsing.

Source scripts and language are preserved. This does not translate a Telugu question into English or create parallel bilingual versions. OCR languages select recognition models; they are not translation targets.

## Parsing contract and limitations

Main markers: 1., 1), Q. 1., Question 1:, ప్రశ్న 1., प्रश्न १. Child markers: (a), a), (i), (1), and a single Unicode letter in parentheses. Unicode decimal digits in main markers normalize to ASCII. Unnumbered continuation lines remain with the active question/child, including across page breaks. Section headings reset the active question; other preamble is retained.

The parser supports one child level. Roman parts and alphabetic parts are siblings; nested sub-subquestions, answer choices and bilingual duplicates are not inferred or merged. MCQ options (a)–(d) can look identical to subquestions: review or adapt SUB for those papers. Numbered passage lines may look like new questions. Marks, instructions and passages remain in parent text, not separate semantic fields. No questions are invented, answered, translated or scored.

Automatic OCR uses a low-text/replacement-character heuristic, not a quality guarantee. A mixed page with readable text and an embedded scanned question may need --ocr always. Digital text is sorted geometrically, which cannot guarantee semantic reading order. Two-column mode assumes equal widths and no spanning passage/header; custom layouts need preprocessing or custom clipping. RTL multi-column ordering is not supported. Repeated headers/footers remain in raw text and may affect grouping. Equations, tables, illustrations and handwriting are not reconstructed. All results need source verification before use in a question bank. Multilingual OCR was not validated on an actual multilingual scan in this run.

Keep originals; check raw_pages.json if output is missing or incorrectly grouped. For a new exam format adapt MAIN, SUB and SECTION rather than silently accepting faulty grouping.

## Validation

    python -m unittest discover -s . -p 'test_*.py'

Official references:
- https://pymupdf.readthedocs.io/en/latest/page.html
- https://tesseract-ocr.github.io/tessdoc/Installation.html
- https://tesseract-ocr.github.io/tessdoc/Command-Line-Usage.html
- https://tesseract-ocr.github.io/tessdoc/Data-Files-in-different-versions.html

Review PyMuPDF's license for your intended redistribution and commercial integration.
