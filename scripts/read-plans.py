from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pypdf import PdfReader

root = Path(__file__).resolve().parents[2]
out = root / 'app/review/plan-sources'
out.mkdir(parents=True, exist_ok=True)
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

class WordHtml(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.hidden = 0
    def handle_starttag(self, tag, attrs):
        if tag in ['style', 'script']: self.hidden += 1
        if tag in ['p', 'tr', 'h1', 'h2', 'h3']: self.parts.append('\n')
        if tag == 'br': self.parts.append('\n')
        if tag in ['td', 'th']: self.parts.append(' | ')
    def handle_endtag(self, tag):
        if tag in ['style', 'script']: self.hidden -= 1
        if tag in ['p', 'tr']: self.parts.append('\n')
    def handle_data(self, data):
        if not self.hidden: self.parts.append(data)

for path in root.iterdir():
    if path.suffix == '.docx':
        with zipfile.ZipFile(path) as z:
            body = ET.fromstring(z.read('word/document.xml')).find('w:body', ns)
            chunks = []
            for element in body:
                if element.tag.endswith('}tbl'):
                    chunks.append('[TABLE]')
                    for row in element.findall('w:tr', ns):
                        chunks.append(' | '.join(' '.join(t.text or '' for t in cell.findall('.//w:t', ns)) for cell in row.findall('w:tc', ns)))
                else: chunks.append(' '.join(t.text or '' for t in element.findall('.//w:t', ns)))
            text = '\n'.join(chunks)
    elif path.suffix == '.doc':
        parser = WordHtml()
        parser.feed(path.read_text(encoding='utf-16'))
        text = '\n'.join(line.strip() for line in ''.join(parser.parts).splitlines() if line.strip())
    elif path.suffix == '.pdf':
        pdf = PdfReader(path)
        text = '\n\n'.join(f'[PAGE {i + 1}]\n{page.extract_text() or ""}' for i, page in enumerate(pdf.pages))
    else: continue
    target = out / (path.stem + '.txt')
    target.write_text(text, encoding='utf-8')
    print(f'{path.name}: {len(text)} characters -> {target.name}')
