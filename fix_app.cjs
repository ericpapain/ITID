const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Imports
const imports = `
import { HeroPremium } from "./components/home/HeroPremium";
import { EquipePanorama } from "./components/home/EquipePanorama";
import { ImmersionSection } from "./components/home/ImmersionSection";
import { StatsPremium } from "./components/home/StatsPremium";
import { ProjectsMasonry } from "./components/home/ProjectsMasonry";
import { FormationsPremium } from "./components/home/FormationsPremium";
import { CustomCursor } from "./components/CustomCursor";
import { PathologiesPremium } from "./components/pages/PathologiesPremium";
import { FaFacebook`;
content = content.replace('import { FaFacebook', imports);

// 2. Add CustomCursor
content = content.replace('<ChatBot />', '<ChatBot />\n        <CustomCursor />');

// 3. Replace Home Page content
const homeStart = content.indexOf('<Route path="/" element={');
const homeEnd = content.indexOf('          <Route path="/pathologies"');
if (homeStart !== -1 && homeEnd !== -1) {
  const homeNewContent = `<Route path="/" element={
            <>
              <HeroPremium />
              <ImmersionSection />
              <FormationsPremium />
              <ProjectsMasonry />
              <EquipePanorama />
              <StatsPremium />
            </>
          } />\n\n`;
  content = content.substring(0, homeStart) + homeNewContent + content.substring(homeEnd);
}

// 4. Replace Pathologies route
const pathoStart = content.indexOf('<Route path="/pathologies"');
const pathoEnd = content.indexOf('<Route path="/traitements"');
if (pathoStart !== -1 && pathoEnd !== -1) {
  const pathoNewContent = `<Route path="/pathologies" element={<PathologiesPremium />} />\n\n          `;
  content = content.substring(0, pathoStart) + pathoNewContent + content.substring(pathoEnd);
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx successfully updated!');
