const fs = require('fs');
const path = require('path');

const rootDir = 'e:/Modern-Drive/apps/public/src';
const replacements = [
  { old: /#F4F0E6/gi, new: '#F9F8F3' },
  { old: /#e3d8c5/gi, new: '#F2EEE5' },
  { old: /#d5c9b4/gi, new: '#EBE6DE' },
  { old: /#c9bca5/gi, new: '#DCCFBA' }
];

const userRequestedReplacements = [
    { old: /#DCCFBA/gi, new: '#F9F8F3' }
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const r of replacements) {
        if (r.old.test(content)) {
          content = content.replace(r.old, r.new);
          modified = true;
        }
      }

      for (const r of userRequestedReplacements) {
        if (r.old.test(content)) {
          content = content.replace(r.old, r.new);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

walk(rootDir);
