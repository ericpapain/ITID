const fs = require('fs');
const path = require('path');

function fixEncoding(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixEncoding(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      
      content = content.replace(/â†/g, '←');
      content = content.replace(/ðŸ”/g, '🔒');
      content = content.replace(/ðŸ’‰/g, '💉');
      content = content.replace(/ðŸ§/g, '🧠');
      content = content.replace(/â±/g, '⏳');
      content = content.replace(/â­/g, '⭐');
      content = content.replace(/ðŸŒ/g, '🌍');
      content = content.replace(/â™¾ï¸/g, '♾️');
      content = content.replace(/ðŸ†/g, '🏆');
      content = content.replace(/ðŸ“/g, '📍');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed emojis with regex:', fullPath);
      }
    }
  }
}

fixEncoding(path.join(__dirname, 'src'));
console.log('Done Regex!');
