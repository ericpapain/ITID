const fs = require('fs');
const path = require('path');

const replacements = {
  'â‚¬': '€',
  'âœ•': '✕',
  'âž¤': '➤',
  'ðŸ’¬': '💬',
  'ðŸ” ': '🔒',
  'â€¢': '•',
  'ðŸ›’': '🛒',
  'ðŸ—‘ï¸ ': '🗑️',
  'ðŸ’³': '💳',
  'â˜°': '☰',
  'â† ': '←',
  'ðŸ‘¤': '👤',
  'ðŸ§ ': '🧠',
  'ðŸ“š': '📚',
  'â ±': '⏳',
  'ðŸ‘†': '👆',
  'â†’': '→',
  'â–¶': '▶',
  'â€º': '›',
  'â­ ': '⭐',
  'ðŸŒ ': '🌍',
  'âœ“': '✓',
  'ðŸ“º': '📺',
  'ðŸ“„': '📄',
  'ðŸ“±': '📱',
  'â™¾ï¸ ': '♾️',
  'ðŸ †': '🏆',
  'âœ”ï¸ ': '✔️',
  'âœ”': '✔',
  'â€”': '—',
  'ðŸ“ ': '📍',
  'ðŸ•’': '🕒',
  'âœ✅': '✅',
  'âœ…': '✅',
  'Â©': '©',
  'â€¦': '…',
  'ðŸ©º': '🩺',
  'ðŸ“ž': '📞',
  'ðŸ“…': '📅',
  'â€“': '–',
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
        console.log('Fixed emojis:', fullPath);
      }
    }
  }
}

fixEncoding(path.join(__dirname, 'src'));
console.log('Done!');
