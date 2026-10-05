import unittest
from extract_questions import parse_pages

class ParsingTests(unittest.TestCase):
    def test_passage_and_page_continuation(self):
        r = parse_pages([{'page':1,'text':'2. Read passage\nShared passage\n(a) First question?\n(b) Second'}, {'page':2,'text':'question?\n3. Next main'}])
        self.assertEqual(len(r['questions']),2)
        self.assertIn('Shared passage',r['questions'][0]['text'])
        self.assertEqual(r['questions'][0]['subquestions'][1]['text'],'Second\nquestion?')
        self.assertEqual(r['questions'][0]['pages'],[1,2])
    def test_unicode_digits_and_text(self):
        r = parse_pages([{'page':1,'text':'२. प्रश्न पढ़ें\n(a) शिक्षा क्या है?\n(b) విద్య అంటే ఏమిటి?'}])
        self.assertEqual(r['questions'][0]['number'],'2')
        self.assertIn('విద్య',r['questions'][0]['subquestions'][1]['text'])
    def test_orphan_and_numeric_child(self):
        r = parse_pages([{'page':1,'text':'Exam title\n1. Prompt\n(1) Part one\n(2) Part two'}])
        self.assertEqual(len(r['preamble']),1)
        self.assertEqual(len(r['questions'][0]['subquestions']),2)

if __name__ == '__main__': unittest.main()
