const fs = require('fs');
const path = require('path');

const baseDir = 'd:\\All Together\\IT\\Projects\\Tools\\Tools\\JobTracker';
const srcDir = path.join(baseDir, 'src');
const componentsDir = path.join(srcDir, 'components');
const featuresDir = path.join(componentsDir, 'features');
const uiDir = path.join(componentsDir, 'ui');
const utilsDir = path.join(srcDir, 'utils');
const libDir = path.join(srcDir, 'lib');

if (!fs.existsSync(featuresDir)) fs.mkdirSync(featuresDir, { recursive: true });
if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });

// Move files
const files = fs.readdirSync(componentsDir);
for (const file of files) {
  if (file.endsWith('.tsx')) {
    fs.renameSync(path.join(componentsDir, file), path.join(featuresDir, file));
  }
}

if (fs.existsSync(utilsDir)) {
  fs.renameSync(utilsDir, libDir);
}

console.log("Done");
