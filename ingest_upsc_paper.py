#!/usr/bin/env python3
"""Extract numbered exam questions; retain passages and multilingual source text."""
import argparse
import csv
import io
import json
import re
import shutil
import subprocess
import tempfile
import unicodedata
import os
import hashlib
from pathlib import Path

MAIN = re.compile(r'^\s*(?:(?:Question|Q|प्रश्न|ప్రశ్న)\s*[.:]?\s*)?(\d+)\s*[.)।:]\s*(.*)$', re.I)
SUB = re.compile(r'^\s*(?:\(([a-zA-Z]|[ivxlcdmIVXLCDM]{1,8}|\d+|[^\W\d_])\)|([a-zA-Z]|[ivxlcdmIVXLCDM]{1,8})[.)])\s*(.*)$')
SECTION = re.compile(r'^\s*(?:section|part|खंड|విభాగం)\s*[-:A-Z\d]', re.I)

def normalized_digits(text):
    return ''.join(str(unicodedata.decimal(c)) if c.isdecimal() else c for c in text)

def parse_pages(pages):
    questions, preamble, warnings = [], [], []
    current = child = None
    for page in pages:
        for raw in page['text'].splitlines():
            line = raw.strip()
            if not line:
                continue
            if SECTION.match(line):
                current = child = None
                preamble.append({'page': page['page'], 'text': line})
                continue
            main = MAIN.match(normalized_digits(line))
            sub = SUB.match(line)
            # Parenthesized numeric markers are children; bare numeric markers are mains.
            if main:
                current = {'id': f'q{len(questions)+1}', 'number': main[1],
                           'text': main[2], 'subquestions': [], 'pages': [page['page']]}
                questions.append(current)
                child = None
            elif sub and current:
                child = {'label': sub[1] or sub[2], 'text': sub[3],
                         'pages': [page['page']]}
                current['subquestions'].append(child)
                if page['page'] not in current['pages']:
                    current['pages'].append(page['page'])
            elif current:
                target = child if child is not None else current
                target['text'] += '\n' + line
                for node in (target, current):
                    if page['page'] not in node['pages']:
                        node['pages'].append(page['page'])
            else:
                preamble.append({'page': page['page'], 'text': line})
    if not questions:
        warnings.append('No numbered main questions detected. Review raw_pages.json and adapt marker patterns.')
    warnings.append('Heuristic parsing: verify numbering, choices, nested parts, formulas and reading order against the source.')
    return {'questions': questions, 'preamble': preamble, 'warnings': warnings}

def ocr(image_path, languages, psm, timeout):
    if not shutil.which('tesseract'):
        raise RuntimeError('Install the Tesseract executable and requested language packs.')
    result = subprocess.run(['tesseract', str(image_path), 'stdout', '-l', languages,
                             '--psm', str(psm)], capture_output=True, text=True,
                            encoding='utf-8', timeout=timeout)
    if result.returncode:
        raise RuntimeError('Tesseract failed: ' + result.stderr.strip())
    return result.stdout

def extract(path, languages='eng', mode='auto', dpi=300, psm=6, columns=1,
            min_chars=50, timeout=120, password=None):
    import fitz
    if columns < 1 or dpi < 72:
        raise ValueError('columns must be positive and dpi must be at least 72')
    pages = []
    with tempfile.TemporaryDirectory() as work:
        if path.suffix.lower() != '.pdf':
            if columns != 1:
                raise ValueError('Image inputs currently support one column. Crop columns before running.')
            pages.append({'page': 1, 'method': 'ocr', 'text': ocr(path, languages, psm, timeout)})
            return pages
        with fitz.open(path) as doc:
            if doc.needs_pass and (not password or not doc.authenticate(password)):
                raise ValueError('Encrypted PDF: provide the correct --password')
            for index, page in enumerate(doc):
                parts, methods = [], []
                for col in range(columns):
                    rect = page.rect
                    clip = fitz.Rect(rect.x0 + rect.width*col/columns, rect.y0,
                                     rect.x0 + rect.width*(col+1)/columns, rect.y1)
                    text = page.get_text('text', clip=clip, sort=True)
                    use_ocr = mode == 'always' or (mode == 'auto' and
                        (sum(c.isalnum() for c in text) < min_chars or '\ufffd' in text))
                    if use_ocr:
                        image = Path(work)/f'{index}_{col}.png'
                        page.get_pixmap(dpi=dpi, clip=clip, alpha=False).save(image)
                        text = ocr(image, languages, psm, timeout)
                    parts.append(text)
                    methods.append('ocr' if use_ocr else 'pdf-text')
                pages.append({'page': index+1, 'method': methods, 'text': '\n'.join(parts)})
    return pages

def save_for_backend(result, input_path):
    # Output to output/upsc_ingestion for backend compatibility
    output_dir = Path('output/upsc_ingestion')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    base_out_name = input_path.stem
    out_json = output_dir / f"{base_out_name}_normalized.json"
    out_val = output_dir / f"{base_out_name}_validation.json"

    # Convert format to backend schema
    extracted_questions = []
    for q in result['questions']:
        # Combine subquestions into text for simplicity, as V2 AI handles them later
        full_text = q['text']
        for sub in q['subquestions']:
            full_text += f"\n({sub['label']}) {sub['text']}"
            
        # Put text entirely in english field since backend/AI expects either english or hindi fields
        extracted_questions.append({
            "questionNumber": int(q['number']),
            "english": full_text,
            "hindi": "",
            "marks": None,
            "wordLimit": None,
            "options": {"a": "", "b": "", "c": "", "d": ""}
        })
        
    normalized_data = {
        "exam": "UPSC CSE Mains",
        "year": None,
        "paper": "UNKNOWN",
        "paperType": "UNKNOWN",
        "source": "UPSC",
        "sourceUrl": None,
        "originalFile": input_path.name,
        "documentHash": "",
        "extractionStatus": "COMPLETED",
        "validationStatus": "REVIEW_REQUIRED",
        "questions": extracted_questions
    }
    
    with out_json.open("w", encoding="utf-8") as f:
        json.dump(normalized_data, f, ensure_ascii=False, indent=2)
        
    validation_report = {
        "missingQuestions": [],
        "duplicateQuestions": [],
        "emptyQuestions": 0,
        "pairingIssues": 0,
        "totalExtracted": len(extracted_questions),
        "status": "REVIEW_REQUIRED"
    }
    with out_val.open("w", encoding="utf-8") as f:
        json.dump(validation_report, f, ensure_ascii=False, indent=2)

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('input', type=Path)
    p.add_argument('--output', type=Path, default=Path('extracted'))
    p.add_argument('--languages', default='eng+hin', help='Tesseract codes: eng+tel+hin')
    p.add_argument('--ocr', choices=['auto','always','never'], default='auto')
    p.add_argument('--dpi', type=int, default=300)
    p.add_argument('--psm', type=int, default=6, help='6: uniform block; 3: automatic layout')
    p.add_argument('--columns', type=int, default=1, help='Equal-width columns, read left to right')
    p.add_argument('--min-chars', type=int, default=50)
    p.add_argument('--timeout', type=int, default=120)
    p.add_argument('--password')
    a = p.parse_args()
    try:
        if not a.input.is_file():
            raise ValueError(f'Input file not found: {a.input}')
        pages = extract(a.input, a.languages, a.ocr, a.dpi, a.psm, a.columns,
                        a.min_chars, a.timeout, a.password)
        result = parse_pages(pages)
        result['source'] = a.input.name
        result['ocr_languages'] = a.languages
        
        # We hook the save function here to ensure backend compatibility
        save_for_backend(result, a.input)
        
        print(f"Extracted {len(result['questions'])} main questions and "
              f"{sum(len(q['subquestions']) for q in result['questions'])} subquestions")
    except (ValueError, RuntimeError, subprocess.TimeoutExpired) as error:
        p.exit(1, f'Error: {error}\n')

if __name__ == '__main__':
    main()
