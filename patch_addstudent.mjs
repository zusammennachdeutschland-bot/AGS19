import fs from 'fs';
let code = fs.readFileSync('src/components/AddStudentModal.tsx', 'utf8');
code = code.replace(
  "const { groups, addStudent } = useApp();",
  "const { groups, students, addStudent, t } = useApp();"
);
code = code.replace(
  "  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!name || !groupId) return;\n\n    addStudent({",
  "  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!name || !groupId) return;\n    const isDuplicate = students.some(s => s.name.toLowerCase() === name.toLowerCase() && s.groupId === groupId);\n    if (isDuplicate) {\n      if (!window.confirm(t('duplicate_student_warning') || 'طالب بنفس الاسم موجود بالفعل. هل تريد المتابعة؟ / A student with the same name already exists in this group. Do you want to continue?')) return;\n    }\n\n    addStudent({"
);
fs.writeFileSync('src/components/AddStudentModal.tsx', code);
