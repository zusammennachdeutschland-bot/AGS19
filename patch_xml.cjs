const fs = require('fs');

function patch(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('ic_launcher_monochrome')) {
    content = content.replace(
      '</adaptive-icon>',
      '    <monochrome android:drawable="@mipmap/ic_launcher_monochrome" />\n</adaptive-icon>'
    );
    fs.writeFileSync(file, content);
  }
}

patch('android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml');
patch('android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml');
console.log("Patched XML");
