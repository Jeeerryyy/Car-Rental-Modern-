import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routesDir = path.join(__dirname, 'server', 'src', 'routes');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
};

const files = walk(routesDir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.includes('ownerProtect')) {
      content = content.replace(/import\s+{\s*ownerProtect\s*}\s+from\s+['"]\.\.\/\.\.\/middleware\/auth\.js['"];?/g, "import { protect, restrictTo } from '../../middleware/auth.js';\nimport { USER_ROLES } from '../../utils/constants.js';");
      content = content.replace(/ownerProtect/g, 'protect, restrictTo(USER_ROLES.OWNER)');
      changed = true;
    }

    if (content.includes('customerProtect')) {
      content = content.replace(/import\s+{\s*customerProtect\s*}\s+from\s+['"]\.\.\/\.\.\/middleware\/auth\.js['"];?/g, "import { protect, restrictTo } from '../../middleware/auth.js';\nimport { USER_ROLES } from '../../utils/constants.js';");
      content = content.replace(/customerProtect/g, 'protect, restrictTo(USER_ROLES.CUSTOMER)');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, content);
      console.log('Updated:', file);
    }
  }
});
