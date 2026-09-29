const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'components');

const fixFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix minmax for grids
  const minmaxRegex = /minmax\((340|350|360|380)px/g;
  if (minmaxRegex.test(content)) {
    content = content.replace(minmaxRegex, 'minmax(300px');
    changed = true;
  }

  // Fix AnswerWritingStudio maxWidth: '380px'
  if (content.includes("maxWidth: '380px'")) {
    content = content.replace(/maxWidth: '380px'/g, "maxWidth: '100%'");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', path.basename(filePath));
  }
};

const files = fs.readdirSync(srcDir);
files.forEach(file => {
  if (file.endsWith('.jsx')) {
    fixFile(path.join(srcDir, file));
  }
});
console.log('Done!');
