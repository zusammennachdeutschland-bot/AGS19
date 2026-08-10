import fs from 'fs';
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');
code = code.replace(
  "        if (event.target?.result) {\n          updateProfile({ avatarUrl: event.target.result as string });\n        }",
  `        if (event.target?.result) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const max_size = 300;
            if (width > height) {
              if (width > max_size) {
                height *= max_size / width;
                width = max_size;
              }
            } else {
              if (height > max_size) {
                width *= max_size / height;
                height = max_size;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            updateProfile({ avatarUrl: dataUrl });
          };
          img.src = event.target.result as string;
        }`
);
fs.writeFileSync('src/components/Header.tsx', code);
