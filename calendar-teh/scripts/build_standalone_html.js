const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');
const publicDir = path.join(baseDir, 'public');

let html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');

// Inline all CSS
const cssFiles = [
  'css/variables.css',
  'css/patterns.css',
  'css/main.css',
  'css/calendar.css',
  'css/modals.css',
  'css/admin.css',
  'css/tasks.css'
];

let combinedCss = '';
cssFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    combinedCss += `\n/* --- ${file} --- */\n` + fs.readFileSync(filePath, 'utf8');
  }
});

// Replace stylesheet links with combined <style>
html = html.replace(/<link\s+rel="stylesheet"\s+href="css\/[^"]+">/g, '');
html = html.replace('</head>', `<style>\n${combinedCss}\n</style>\n</head>`);

// Inline all JS
const jsFiles = [
  'js/confetti.js',
  'js/events-data.js',
  'js/api.js',
  'js/auth.js',
  'js/tasks.js',
  'js/calendar.js',
  'js/modals.js',
  'js/admin.js',
  'js/app.js'
];

let combinedJs = '';
jsFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    combinedJs += `\n// --- ${file} ---\n` + fs.readFileSync(filePath, 'utf8');
  }
});

// Replace script tags with inlined <script>
html = html.replace(/<script\s+src="js\/[^"]+"><\/script>/g, '');
html = html.replace('</body>', `<script>\n${combinedJs}\n</script>\n</body>`);

// Save standalone file in calendar-teh AND in the parent Tools directory for easy access
const outPath1 = path.join(baseDir, 'the_electricity_hub_calendar_2026_standalone.html');
const outPath2 = path.join(baseDir, '..', 'the_electricity_hub_calendar_2026_standalone.html');

fs.writeFileSync(outPath1, html, 'utf8');
fs.writeFileSync(outPath2, html, 'utf8');

console.log('Successfully generated standalone single-file HTML:');
console.log('1.', outPath1);
console.log('2.', outPath2);
