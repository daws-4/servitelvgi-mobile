const sizeOf = require('image-size');
const path = require('path');

const files = [
  'assets/logo_bgless.png',
  'assets/logo_.jpeg'
];

files.forEach(file => {
  try {
    const dimensions = sizeOf(path.join(__dirname, file));
    console.log(`${file}: ${dimensions.width}x${dimensions.height}`);
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
});
