"""Standalone admin-only import service. Replace auth dependency for existing SSO."""
import json, os, secrets, time, uuid, re
from pathlib import Path
from typing import Annotated
from fastapi import FastAPI, Depends, UploadFile, Form, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from .store import connect, job, approve, DATA
app=FastAPI(title='YuktiPrep Question Import',version='1.0.0')
security=HTTPBearer()
def admin(credentials: Annotated[HTTPAuthorizationCredentials,Depends(security)]):
    expected=os.getenv('YUKTI_IMPORT_ADMIN_TOKEN','')
    if not expected or not secrets.compare_digest(credentials.credentials,expected):
        raise HTTPException(401,'Invalid admin credential')

class Child(BaseModel):
    label: str=Field(min_length=1,max_length=50)
    text: str=Field(min_length=1,max_length=100000)
    pages: list[int]=Field(default_factory=list)
class Question(BaseModel):
    id: str=Field(min_length=1,max_length=100)
    number: str=Field(min_length=1,max_length=50)
    text: str=Field(min_length=1,max_length=100000)
    subquestions: list[Child]=Field(default_factory=list,max_length=100)
    pages: list[int]=Field(default_factory=list)
class Review(BaseModel):
    questions: list[Question]=Field(min_length=1,max_length=5000)

@app.post('/api/v1/question-imports',status_code=202,dependencies=[Depends(admin)])
async def upload(file: UploadFile, exam_id: Annotated[str,Form(min_length=1,max_length=100)],
                 syllabus_topic_id: Annotated[str,Form(min_length=1,max_length=100)],
                 languages: Annotated[str,Form()]='eng',
                 source_reference: Annotated[str,Form(max_length=1000)]='',
                 ocr_mode: Annotated[str,Form()]='auto'):
    if not re.fullmatch(r'[a-z]{3}(\+[a-z]{3}){0,4}',languages):
        raise HTTPException(422,'Use up to five Tesseract language codes, e.g. eng+tel')
    if ocr_mode not in {'auto','always','never'}: raise HTTPException(422,'Invalid OCR mode')
    suffix=Path(file.filename or '').suffix.lower()
    if suffix not in {'.pdf','.png','.jpg','.jpeg'}: raise HTTPException(415,'PDF, PNG or JPEG required')
    ident=uuid.uuid4().hex
    DATA.mkdir(parents=True,exist_ok=True)
    path=DATA/(ident+suffix)
    size=0
    try:
        with path.open('wb') as out:
            while chunk:=await file.read(1024*1024):
                size+=len(chunk)
                if size>25*1024*1024: raise HTTPException(413,'Maximum file size: 25 MiB')
                out.write(chunk)
        with path.open('rb') as source:
            magic=source.read(8)
        valid=(suffix=='.pdf' and magic.startswith(b'%PDF-')) or (suffix=='.png' and magic==b'\x89PNG\r\n\x1a\n') or (suffix in {'.jpg','.jpeg'} and magic.startswith(b'\xff\xd8\xff'))
        if not valid: raise HTTPException(415,'File signature does not match extension')
        meta=dict(exam_id=exam_id,syllabus_topic_id=syllabus_topic_id,languages=languages,
                  source_reference=source_reference,ocr_mode=ocr_mode)
        with connect() as db:
            db.execute('INSERT INTO jobs VALUES(?,?,?,?,?,?,?)',(ident,str(path),json.dumps(meta),'queued',None,None,time.time()))
            db.execute('INSERT INTO audit VALUES(?,?,?)',(ident,'uploaded',time.time()))
    except Exception:
        path.unlink(missing_ok=True)
        raise
    finally: await file.close()
    return {'job_id':ident,'status':'queued'}

@app.get('/api/v1/question-imports/{ident}',dependencies=[Depends(admin)])
def status(ident:str):
    with connect() as db: row=job(db,ident)
    if not row: raise HTTPException(404,'Import not found')
    return {'job_id':ident,'status':row['status'],'metadata':json.loads(row['meta']),
            'result':json.loads(row['result']) if row['result'] else None,'error':row['error']}

@app.post('/api/v1/question-imports/{ident}/approve',dependencies=[Depends(admin)])
def review(ident:str,body:Review):
    ids=[q.id for q in body.questions]
    if len(ids)!=len(set(ids)): raise HTTPException(422,'Duplicate question ids')
    with connect() as db:
        row=job(db,ident)
        if not row: raise HTTPException(404,'Import not found')
        payload={'metadata':json.loads(row['meta']),'questions':[q.model_dump() for q in body.questions]}
        try: approve(db,ident,payload)
        except ValueError as e: raise HTTPException(409,str(e))
    return {'job_id':ident,'status':'approved'}

@app.get('/api/v1/question-bank/imports/{ident}',dependencies=[Depends(admin)])
def bank_export(ident:str):
    with connect() as db: row=db.execute('SELECT payload FROM bank WHERE job_id=?',(ident,)).fetchone()
    if not row: raise HTTPException(404,'Approved import not found')
    return json.loads(row['payload'])

@app.get('/admin/question-import', include_in_schema=False)
def admin_page():
    from fastapi.responses import FileResponse
    return FileResponse(Path(__file__).with_name('admin.html'))
