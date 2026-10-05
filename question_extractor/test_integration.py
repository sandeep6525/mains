import os,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
os.environ['YUKTI_IMPORT_ADMIN_TOKEN']='test-only-secret'
from fastapi.testclient import TestClient
from yuktiprep.api import app
from yuktiprep import store
from yuktiprep.worker import process_one

class IntegrationTests(unittest.TestCase):
    def setUp(self):
        self.work=tempfile.TemporaryDirectory()
        self.patch=patch.object(store,'DATA',Path(self.work.name));self.patch.start()
        self.api_patch=patch('yuktiprep.api.DATA',Path(self.work.name));self.api_patch.start()
        self.client=TestClient(app)
        self.headers={'Authorization':'Bearer test-only-secret'}
    def tearDown(self):
        self.api_patch.stop();self.patch.stop()
        try:
            # Clean up what we can, but ignore locks
            import shutil
            shutil.rmtree(self.work.name, ignore_errors=True)
        except Exception:
            pass
    def upload(self,data=None):
        import fitz
        if data is None:
            with fitz.open() as doc:
                p=doc.new_page();p.insert_text((72,72),'2. Read the passage\nKnowledge is shared.\n(a) Why share?\n(b) How to learn?')
                data=doc.tobytes()
        return self.client.post('/api/v1/question-imports',headers=self.headers,
            data={'exam_id':'UPSC-CSE','syllabus_topic_id':'reading','languages':'eng'},
            files={'file':('paper.pdf',data,'application/pdf')})
    def test_flow_and_duplicate(self):
        response=self.upload();self.assertEqual(response.status_code,202,response.text)
        ident=response.json()['job_id']
        self.assertTrue(process_one())
        response=self.client.get('/api/v1/question-imports/'+ident,headers=self.headers)
        self.assertEqual(response.json()['status'],'review')
        body={'questions':response.json()['result']['questions']}
        self.assertEqual(len(body['questions'][0]['subquestions']),2)
        url='/api/v1/question-imports/'+ident+'/approve'
        self.assertEqual(self.client.post(url,headers=self.headers,json=body).status_code,200)
        self.assertEqual(self.client.post(url,headers=self.headers,json=body).status_code,409)
        exported=self.client.get('/api/v1/question-bank/imports/'+ident,headers=self.headers).json()
        self.assertEqual(exported['metadata']['exam_id'],'UPSC-CSE')
    def test_unauthorized(self):
        self.assertIn(self.client.get('/api/v1/question-imports/x').status_code,[401,403])
    def test_invalid_file(self):
        self.assertEqual(self.upload(b'not a pdf').status_code,415)
    def test_size_limit(self):
        self.assertEqual(self.upload(b'%PDF-'+b'x'*(25*1024*1024)).status_code,413)
        self.assertEqual(len(list(Path(self.work.name).glob('*.pdf'))),0)

if __name__=='__main__':unittest.main()
