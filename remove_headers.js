const fs = require('fs');
const path = require('path');

const files = [
  "src/app/workspace/page.tsx",
  "src/app/workspace/3d/page.tsx",
  "src/app/workspace/3d-shapes/page.tsx",
  "src/app/workspace/active-learning/page.tsx",
  "src/app/workspace/analysis/page.tsx",
  "src/app/workspace/camera/page.tsx",
  "src/app/workspace/compare/page.tsx",
  "src/app/workspace/draw/page.tsx",
  "src/app/workspace/feedback/page.tsx",
  "src/app/workspace/models/page.tsx",
  "src/app/workspace/multi-detect/page.tsx",
  "src/app/workspace/quiz/page.tsx",
  "src/app/workspace/settings/page.tsx",
  "src/app/workspace/upload/page.tsx",
  "src/app/workspace/xai/page.tsx"
];

let removedCount = 0;

for (const rel of files) {
  const file = path.join(__dirname, rel);
  if (!fs.existsSync(file)) continue;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Try to remove <header ...> ... </header> if it contains the logo
  const headerRegex = /<header[^>]*>[\s\S]*?<\/header>/g;
  let matches = content.match(headerRegex);
  
  if (matches) {
    for (const match of matches) {
      if (match.includes('/logo.png') || match.includes('ShapeVision')) {
        content = content.replace(match, '');
        console.log(`Removed header in ${rel}`);
        removedCount++;
      }
    }
  }

  // Same for nav
  const navRegex = /<nav[^>]*>[\s\S]*?<\/nav>/g;
  matches = content.match(navRegex);
  if (matches) {
    for (const match of matches) {
      if (match.includes('/logo.png') || match.includes('ShapeVision')) {
        content = content.replace(match, '');
        console.log(`Removed nav in ${rel}`);
        removedCount++;
      }
    }
  }
  
  fs.writeFileSync(file, content);
}

console.log(`Total removals: ${removedCount}`);
