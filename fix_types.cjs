const fs = require('fs');

let t = fs.readFileSync('types_current.ts', 'utf16le');

const regex = /<<<<<<< HEAD\r?\n[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> [0-9a-fA-F]+\r?\n/g;

const fixed = t.replace(regex, "$1");

fs.writeFileSync('src/integrations/supabase/types.ts', fixed, 'utf8');
console.log("Fixed by accepting lovable changes!");
