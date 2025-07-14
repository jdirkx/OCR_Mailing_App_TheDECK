require('dotenv').config();

console.log('Using OpenCV paths:');
console.log('INCLUDE:', process.env.OPENCV_INCLUDE_DIR);
console.log('LIB:', process.env.OPENCV_LIB_DIR);
console.log('BIN:', process.env.OPENCV_BIN_DIR);

const { execSync } = require('child_process');

execSync(`npm install opencv4nodejs`, {
  env: {
    ...process.env,
    OPENCV4NODEJS_DISABLE_AUTOBUILD: '1',
    OPENCV_INCLUDE_DIR: process.env.OPENCV_INCLUDE_DIR,
    OPENCV_LIB_DIR: process.env.OPENCV_LIB_DIR,
    OPENCV_BIN_DIR: process.env.OPENCV_BIN_DIR
  },
  stdio: 'inherit'
});
