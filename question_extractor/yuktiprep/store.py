import os, sqlite3, json, time
from pathlib import Path
DATA = Path(os.getenv('YUKTI_IMPORT_DATA','./import_data')).resolve()
def connect():
    DATA.mkdir(parents=True,exist_ok=True)
    db=sqlite3.connect(DATA/'imports.sqlite',timeout=30)
    db.row_factory=sqlite3.Row
    db.execute('PRAGMA journal_mode=WAL')
    db.executescript('''
    CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,path TEXT,meta TEXT,status TEXT,result TEXT,error TEXT,created REAL);
    CREATE TABLE IF NOT EXISTS bank(job_id TEXT PRIMARY KEY, payload TEXT, approved REAL);
    CREATE TABLE IF NOT EXISTS audit(job_id TEXT,action TEXT,at REAL);
    ''')
    return db

def job(db, ident):
    row=db.execute('SELECT * FROM jobs WHERE id=?',(ident,)).fetchone()
    if row is None: return None
    return dict(row)

def approve(db,ident,payload):
    # One transaction prevents double approval and question-bank duplication.
    db.execute('BEGIN IMMEDIATE')
    row=job(db,ident)
    if not row or row['status']!='review':
        db.rollback()
        raise ValueError('Only jobs awaiting review can be approved')
    data=json.dumps(payload,ensure_ascii=False)
    db.execute('INSERT INTO bank VALUES(?,?,?)',(ident,data,time.time()))
    db.execute("UPDATE jobs SET status='approved',result=? WHERE id=?",(data,ident))
    db.execute('INSERT INTO audit VALUES(?,?,?)',(ident,'approved',time.time()))
    db.commit()
