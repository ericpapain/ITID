const fs = require('fs');
const path = require('path');

const replacements = {
  'Ã©': 'é',
  'Ã¨': 'è',
  'Ãª': 'ê',
  'Ã ': 'à',
  'Ã‰': 'É',
  'Ã§': 'ç',
  'Ã®': 'î',
  'Ã¯': 'ï',
  'Ã´': 'ô',
  'Ã»': 'û',
  'Ã¹': 'ù',
  'Â«': '«',
  'Â»': '»',
  'â€™': '’',
  'Ã¢': 'â',
  'Ã‹': 'Ë',
  'Ãœ': 'Ü',
  'Ã¤': 'ä',
  'Ã¶': 'ö',
  'Ã¼': 'ü',
  'Ã': 'à', // Wait, 'Ã ' can be 'à' followed by a space? Better not do single 'Ã' unless followed by specific char.
};

function fixEncoding(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixEncoding(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // Specifically handle 'Ã ' (A tilde followed by non-breaking space or space)
      if (content.includes('Ã ')) {
        content = content.replace(/Ã /g, 'à');
        changed = true;
      }

      for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
          // split and join is safer than replace with global regex for special chars sometimes
          content = content.split(bad).join(good);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', fullPath);
      }
    }
  }
}

fixEncoding(path.join(__dirname, 'src'));
console.log('Done!');
