import fs from 'fs';

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');
  
  code = code.replace(
    /reader\.onload = \(event\) => \{/g,
    "reader.onload = async (event) => {"
  );
  
  code = code.replace(
    /const success = importBackupFile\(/g,
    "const success = await importBackupFile("
  );
  
  fs.writeFileSync(filePath, code);
}

fixFile('src/components/SettingsView.tsx');
fixFile('src/components/BackupModal.tsx');
