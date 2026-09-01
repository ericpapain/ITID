const fs = require('fs');
const path = require('path');

const replacements = {
  'â† ': '←',
  'ðŸ” ': '🔒',
  'ðŸ’‰': '💉',
  'ðŸ§ ': '🧠',
  'â ±': '⏳',
  'â­ ': '⭐',
  'ðŸŒ ': '🌍',
  'â™¾ï¸ ': '♾️',
  'ðŸ †': '🏆',
  'ðŸ“ ': '📍',
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
      
      for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
          content = content.split(bad).join(good);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed emojis 2:', fullPath);
      }
    }
  }
}

fixEncoding(path.join(__dirname, 'src'));
console.log('Done 2!');
