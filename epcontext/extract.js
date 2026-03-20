const fs = require('fs');
const xml = fs.readFileSync('C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\even-play-data\\epcontext\\extracted_docx\\word\\document.xml', 'utf8');
const lines = xml.split(/<w:p[^>]*>/);
const text = lines.map(line => line.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')).join('\n');
fs.writeFileSync('C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\even-play-data\\epcontext\\extracted.txt', text);
