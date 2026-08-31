const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Import
content = content.replace('import { PathologiesPremium } from "./components/pages/PathologiesPremium";', 'import { PathologiesPremium } from "./components/pages/PathologiesPremium";\nimport { TraitementsPremium } from "./components/pages/TraitementsPremium";');

// 2. Replace Traitements route
const traitStart = content.indexOf('<Route path="/traitements"');
const traitEnd = content.indexOf('<Route path="/equipe"');

if (traitStart !== -1 && traitEnd !== -1) {
  const traitNewContent = `<Route path="/traitements" element={<TraitementsPremium />} />\n\n          `;
  content = content.substring(0, traitStart) + traitNewContent + content.substring(traitEnd);
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx successfully updated!');
