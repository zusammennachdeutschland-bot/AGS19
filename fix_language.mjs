import fs from 'fs';
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const replacement = `  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = initialData['dl_language'] as AppLanguage;
    if (saved && ['ar', 'en', 'de'].includes(saved)) return saved;
    const profileSaved = initialData['dl_profile'];
    if (profileSaved) {
      if (profileSaved.language && ['ar', 'en', 'de'].includes(profileSaved.language)) return profileSaved.language;
    }
    return INITIAL_TEACHER_PROFILE.language || 'de';
  });`;

code = code.replace(
  /  const \[language, setLanguageState\] = useState<AppLanguage>\(\(\) => \{[\s\S]*?return INITIAL_TEACHER_PROFILE\.language \|\| 'de';\n  \}\);/,
  replacement
);

fs.writeFileSync('src/context/AppContext.tsx', code);
