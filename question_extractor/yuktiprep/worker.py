"""Durable queue, single worker. Restart interrupted jobs explicitly via --recover."""
import argparse, json, logging, time
from pathlib import Path
from extract_questions import extract, parse_pages
from .store import connect

def process_one():
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        row=db.execute("SELECT * FROM jobs WHERE status='queued' ORDER BY created LIMIT 1").fetchone()
        if not row: db.rollback(); return False
        db.execute("UPDATE jobs SET status='processing' WHERE id=?",(row['id'],)); db.commit()
    try:
        import fitz
        with fitz.open(row['path']) as doc:
            if len(doc)>100: raise ValueError('Maximum 100 pages per import')
            if doc.needs_pass: raise ValueError('Encrypted PDF not supported by import API')
        meta=json.loads(row['meta'])
        result=parse_pages(extract(Path(row['path']),languages=meta['languages'],mode=meta['ocr_mode'],timeout=90,dpi=200))
        if not result['questions']: raise ValueError('No questions detected; review the source and numbering')
        with connect() as db:
            db.execute("UPDATE jobs SET status='review',result=? WHERE id=?",(json.dumps(result,ensure_ascii=False),row['id']))
            db.execute('INSERT INTO audit VALUES(?,?,?)',(row['id'],'extracted',time.time()))
    except Exception:
        logging.exception('Import failed: %s',row['id'])
        with connect() as db:
            db.execute("UPDATE jobs SET status='failed',error=? WHERE id=?",('Extraction failed. Operator must check worker logs.',row['id']))
    return True

def main():
    p=argparse.ArgumentParser();p.add_argument('--once',action='store_true');p.add_argument('--recover',action='store_true');a=p.parse_args()
    if a.recover:
        with connect() as db: db.execute("UPDATE jobs SET status='queued' WHERE status='processing'")
    while True:
        worked=process_one()
        if a.once: break
        if not worked: time.sleep(2)
if __name__=='__main__': main()
