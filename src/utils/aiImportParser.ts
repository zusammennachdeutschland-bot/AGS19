import { GradeLevel, LessonType, PaymentCycle } from '../types';
import { normalizeDayToShortKey } from './scheduleUtils';

export interface ParsedScheduleSlot {
  day: string;
  time: string;
}

export interface ParsedGroupData {
  name: string;
  grade: GradeLevel;
  type: LessonType;
  days: string[];
  time: string; // Default or first schedule time
  schedules: ParsedScheduleSlot[];
  dayTimes: Record<string, string>;
  payment_type: PaymentCycle;
  payment_amount: number;
  lesson_price?: number;
}

export interface ParsedStudentData {
  name: string;
  phone: string;
}

export interface AiImportResult {
  isValid: boolean;
  group: ParsedGroupData | null;
  students: ParsedStudentData[];
  errors: string[];
  warnings: string[];
}

const SAMPLE_IMPORT_TEMPLATE = `[GROUP]
name=Grade 5 A
grade=Grade 5
type=offline
days=Sunday,Wednesday
time=18:00
payment_type=every_4_lessons
payment_amount=400

[STUDENTS]
Ahmed Mohamed|01012345678
Mohamed Ali|01112345679
Mariam Hassan|01212345670`;

const SAMPLE_MULTI_SCHEDULE_TEMPLATE = `[GROUP]
name=Grade 10 Physics
grade=Grade 10
type=offline
lesson_price=150
payment_type=every_8_lessons

[SCHEDULE]
Saturday|15:00
Wednesday|19:00

[STUDENTS]
Omar Farouk|01098765432
Nour El Din|01123456789
Youssef Ahmed|01234567890`;

export const AI_PROMPT_TEMPLATE_AR = `أنت مساعد إدخال بيانات متخصص لنظام إدارة المجموعات والدروس التعليمية (Educational Management System Data-Entry Assistant).

وظيفتك الأساسية:
1. استقبال النص العادي أو الملاحظات الخام للمجموعات والطلاب من المعلم.
2. استخراج وفحص جميع معلومات المجموعة، المواعيد، نظام الدفع، وقائمة الطلاب.
3. التحقق من وجود كافة البيانات المطلوبة كاملة وبدون استثناء.
4. إذا كان أي بيان مطلوب مفقوداً أو غير واضح، **قم بسؤال المعلم مباشرة عن البيانات المفقودة أولاً** ولا تقم بتوليد كود الاستيراد النهائي.
5. لا تقم أبداً بتوليد كود استيراد جزئي أو ناقص.
6. قم بتوليد كود الاستيراد النهائي فقط بعد اكتمال والتحقق من جميع البيانات المطلوبة.

==================== قائمة البيانات المطلوبة للتحقق ====================

1. بيانات المجموعة [GROUP]:
- اسم المجموعة (اسم واضح ومحدد مثل: مجموعة الفيزياء 10، Grade 5 Math).
- الصف الدراسي (grade): اختر من Grade 1 حتى Grade 12.
- نوع الحضور (type): إما "offline" أو "online".

2. مواعيد الحصص [SCHEDULE]:
- يوم واحد على الأقل من أيام الأسبوع المدعومة بالإنجليزية:
  Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday, Friday
- توقيت كل يوم بنظام 24 ساعة (HH:MM)، مثلاً:
  "الساعة 3 عصرًا" تحول إلى 15:00
  "الساعة 7 مساءً" تحول إلى 19:00
  "3 PM" تحول إلى 15:00
- **دعم المواعيد المختلفة**: إذا كانت المواعيد مختلفة بين الأيام (مثل السبت الساعة 3 والاربعاء الساعة 7)، اكتب كل يوم بتوقيته الخاص في قسم [SCHEDULE] كالتالي:
  [SCHEDULE]
  Saturday|15:00
  Wednesday|19:00
  إياك أن تجبر المواعيد المختلفة على وقت موحد مطلقاً!

3. نظام الدفع والأسعار PAYMENT:
- نوع الدفع (payment_type) ويجب أن يكون أحد الخيارات التالية حصراً:
  * per_lesson (بالحصة)
  * every_4_lessons (كل 4 حصص)
  * every_8_lessons (كل 8 حصص)
  * every_12_lessons (كل 12 حصة)
  * monthly (شهري)
- سعر الحصة الواحدة (lesson_price).
- حساب المبلغ الإجمالي تلقائياً (payment_amount) بناءً على سعر الحصة ونظام الدفع:
  * إذا كان payment_type=every_4_lessons وسعر الحصة 100 -> payment_amount=400
  * إذا كان payment_type=every_8_lessons وسعر الحصة 150 -> payment_amount=1200
  * إذا كان payment_type=every_12_lessons وسعر الحصة 200 -> payment_amount=2400
  * إذا كان payment_type=per_lesson -> payment_amount هو نفسه lesson_price
  * إذا كان payment_type=monthly (شهري): **لا تخمن المبلغ الشهري**. إذا لم يذكر المعلم سعر الاشتراك الشهري، اسأله عن المبلغ الشهري مباشرة.

4. قائمة الطلاب [STUDENTS]:
- طالب واحد على الأقل.
- اسم الطالب لكل طالب في القائمة.
- رقم الهاتف لكل طالب:
  * الحفاظ التام على أرقام الهواتف الحقيقية بدون تغيير.
  * إذا كان الرقم دولي مصري مثل "+20 10 50723607" قم بتنسيقه إلى "201050723607".
  * إذا كان الرقم محلي مثل "01050723607" احتفظ به كما هو.
  * لا تستبدل رقم هاتف حقيقي أبداً برقم 01000000000.
  * استخدم الرقم 01000000000 فقط وفقط إذا كان رقم الهاتف مفقوداً تماماً ولم يذكره المعلم.
- **تنبيه حاسم للطلاب**: يجب تضمين كل طالب في القائمة بدون استثناء، وبدون حذف أو دمج أو تعديل للأسماء أو الأرقام. كل طالب في سطر مستقل (الاسم|الهاتف).

==================== التعامل مع البيانات المفقودة أو الغامضة ====================
- إذا كانت هناك بيانات مطلوبة مفقودة، **لا تولد كود الاستيراد [GROUP]**.
- بدلاً من ذلك، اذكر الحقول المفقودة بوضوح واسأل المعلم عنها بأسلوب طبيعي، مثال:
[MISSING_INFORMATION]
group_name=Missing
type=Missing

"محتاج اسم الجروب ونوعه (Online أو Offline) عشان أقدر أستورد القائمة."

- إذا كان هناك غموض في البيانات (مثل: "الجروب بتاع تالين" أو "بتدفع كل فترة")، اسأل المعلم للتوضيح ولا تخمن بناءً على نص غير محدد.

==================== التنسيق النهائي عند مكتمل البيانات ====================
عند توفر كافة البيانات المطلوبة والتحقق منها، يجب إخراج كود الاستيراد النهائي داخل كود بلين تيكست (Plain-text Code Block) بالتنسيق المباشر التالي:

\`\`\`
[GROUP]
name=اسم المجموعة
grade=Grade 5
type=offline
lesson_price=150
payment_type=every_8_lessons
payment_amount=1200

[SCHEDULE]
Saturday|15:00
Wednesday|19:00

[STUDENTS]
اسم الطالب الأول|01012345678
اسم الطالب الثاني|01112345679
\`\`\`

قواعد التنسيق الشديدة:
1. عنوان [GROUP] في سطر مستقل، وكل حقل داخل المجموعة في سطر مستقل.
2. عنوان [SCHEDULE] في سطر مستقل، وكل موعد (اليوم|التوقيت) في سطر مستقل.
3. عنوان [STUDENTS] في سطر مستقل، وكل طالب (الاسم|الهاتف) في سطر مستقل.
4. اترك سطر فارغ بين الأقسام الرئيسية.
5. لا تضف أي نص أو شرح أو تعليقات داخل أو بعد مربع كود الاستيراد النهائي.

إليك البيانات الخام لتحويلها أو فحصها:
[الصق الملاحظات أو قائمة الأسماء ورسائل الواتساب هنا]`;

export const AI_PROMPT_TEMPLATE_EN = `You are a strict Educational Management System Data-Entry Assistant.

YOUR CORE ROLE:
1. Receive natural-language text or raw student/group notes from the teacher.
2. Identify all group details, schedule timings, payment configurations, and student records.
3. Check whether ALL required information exists and is valid.
4. If ANY required information is missing or ambiguous, ASK THE TEACHER FOR THE MISSING INFORMATION FIRST. Do NOT generate the import block.
5. NEVER generate a partial or incomplete import block.
6. Only generate the final import block after all required information has been collected and validated.

==================== REQUIRED INFORMATION CHECKLIST ====================

1. GROUP INFORMATION [GROUP]:
- Group Name: Clear descriptive name (e.g., Grade 10 Physics, Math Group A)
- Grade Level (grade): Grade 1 through Grade 12
- Attendance Type (type): "offline" OR "online"

2. CLASS SCHEDULE [SCHEDULE]:
- At least one valid day from supported days:
  Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday, Friday
- Class time for every day in 24-hour HH:MM format (e.g., "3 PM" -> 15:00, "7:30 PM" -> 19:30)
- Support independent day times (e.g., Saturday at 15:00, Wednesday at 19:00).
  Format as:
  [SCHEDULE]
  Saturday|15:00
  Wednesday|19:00
  NEVER force different class times into one single common time!

3. PAYMENT CONFIGURATION:
- Payment Type (payment_type) must be strictly one of:
  * per_lesson
  * every_4_lessons
  * every_8_lessons
  * every_12_lessons
  * monthly
- Price per lesson (lesson_price)
- Automatic payment_amount calculation:
  * every_4_lessons with price 100 -> payment_amount = 400
  * every_8_lessons with price 150 -> payment_amount = 1200
  * every_12_lessons with price 200 -> payment_amount = 2400
  * per_lesson -> payment_amount = lesson_price
  * monthly: Do NOT guess the monthly amount. If monthly payment is chosen and monthly package price is not provided, ASK the teacher for the monthly package price.

4. STUDENTS LIST [STUDENTS]:
- At least one student record.
- Student name for every student.
- Phone number for every student when available:
  * Preserve real phone numbers!
  * Normalize Egyptian international numbers like "+20 10 50723607" to "201050723607".
  * Keep standard local numbers like "01050723607" as is.
  * Never replace a real phone number with 01000000000.
  * Use "01000000000" ONLY when the student phone number is genuinely missing.
- CRITICAL STUDENT PRESERVATION: You MUST include every student provided by the teacher without omission, merging, renaming, or duplicate stripping. Every student must be on its own line ("Name|Phone").

==================== MISSING / AMBIGUOUS INFORMATION BEHAVIOR ====================
- If required information is missing, DO NOT generate the [GROUP] import block.
- Instead, specify what is missing and ask the teacher naturally for the missing fields:
[MISSING_INFORMATION]
group_name=Missing
type=Missing

"Please provide the group name and attendance type (Online or Offline) so I can complete your import."

- If information is ambiguous (e.g. "Talin's group" or "pays periodically"), ask for clarification instead of guessing.

==================== FINAL OUTPUT FORMAT (WHEN ALL DATA IS COMPLETE) ====================
When ALL required information is present and validated, output the final result inside a plain-text code block in EXACTLY this format:

\`\`\`
[GROUP]
name=Grade 5 Math
grade=Grade 5
type=offline
lesson_price=150
payment_type=every_8_lessons
payment_amount=1200

[SCHEDULE]
Saturday|15:00
Wednesday|19:00

[STUDENTS]
Student Name 1|01012345678
Student Name 2|01112345679
\`\`\`

STRICT FORMATTING RULES:
1. [GROUP] header MUST be on its own line. Each group field MUST be on its own line.
2. [SCHEDULE] header MUST be on its own line. Each schedule entry MUST be on its own line (Day|HH:MM).
3. [STUDENTS] header MUST be on its own line. Each student MUST be on its own line (Name|Phone).
4. Preserve blank lines between section headers.
5. Do NOT add conversational text inside or after the final import code block.

Here is the raw group data / student list to process:
[PASTE YOUR RAW LIST / TEXT HERE]`;

export { SAMPLE_IMPORT_TEMPLATE, SAMPLE_MULTI_SCHEDULE_TEMPLATE };

/**
 * Normalizes grade strings into valid GradeLevel values
 */
function normalizeGrade(rawGrade: string): GradeLevel {
  const trimmed = rawGrade.trim();
  if (trimmed.startsWith('Grade ')) {
    return trimmed as GradeLevel;
  }
  const match = trimmed.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (num >= 1 && num <= 12) {
      return `Grade ${num}` as GradeLevel;
    }
  }
  return 'Grade 5';
}

/**
 * Validates HH:MM format (e.g., "18:00", "09:30", "9:30")
 */
function isValidTimeStr(timeStr: string): boolean {
  if (!timeStr) return false;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr.trim());
}

/**
 * Normalizes time string to standard HH:MM format (e.g., "9:30" -> "09:30")
 */
function normalizeTimeStr(timeStr: string): string {
  const trimmed = timeStr.trim();
  const parts = trimmed.split(':');
  if (parts.length === 2) {
    const h = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    return `${h}:${m}`;
  }
  return trimmed;
}

/**
 * Parses and strictly validates AI-generated import text according to ZERO-DATA-LOSS specifications.
 */
export function parseAiImportText(text: string): AiImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!text || !text.trim()) {
    return {
      isValid: false,
      group: null,
      students: [],
      errors: ['Import text is empty. Please paste the template generated by AI.'],
      warnings: [],
    };
  }

  // Automatically strip markdown code block fences if present (e.g. ```text ... ``` or ```ini)
  const cleanInput = text
    .replace(/^```[a-zA-Z]*\n?/gm, '')
    .replace(/```$/gm, '')
    .trim();

  const rawLines = cleanInput.split('\n');

  // Locate sections
  let groupSectionStartIndex = -1;
  let scheduleSectionStartIndex = -1;
  let studentsSectionStartIndex = -1;

  for (let i = 0; i < rawLines.length; i++) {
    const lineUpper = rawLines[i].trim().toUpperCase();
    if (lineUpper === '[GROUP]') {
      groupSectionStartIndex = i;
    } else if (lineUpper === '[SCHEDULE]' || lineUpper === '[TIMINGS]') {
      scheduleSectionStartIndex = i;
    } else if (lineUpper === '[STUDENTS]') {
      studentsSectionStartIndex = i;
    }
  }

  if (cleanInput.toUpperCase().includes('[MISSING_INFORMATION]')) {
    errors.push('The pasted response indicates missing required information. Please answer the AI with the requested details before importing.');
  }

  if (groupSectionStartIndex === -1) {
    errors.push('Missing [GROUP] section header in the pasted text.');
  }

  if (studentsSectionStartIndex === -1) {
    errors.push('Missing [STUDENTS] section header in the pasted text.');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      group: null,
      students: [],
      errors,
      warnings,
    };
  }

  // Helper to slice lines belonging to a section until the next section
  const sectionIndices = [
    { name: 'group', idx: groupSectionStartIndex },
    { name: 'schedule', idx: scheduleSectionStartIndex },
    { name: 'students', idx: studentsSectionStartIndex },
  ]
    .filter((s) => s.idx !== -1)
    .sort((a, b) => a.idx - b.idx);

  const getSectionLines = (sectionName: string): string[] => {
    const secObj = sectionIndices.find((s) => s.name === sectionName);
    if (!secObj) return [];
    const currentPos = sectionIndices.indexOf(secObj);
    const start = secObj.idx + 1;
    const end = currentPos + 1 < sectionIndices.length ? sectionIndices[currentPos + 1].idx : rawLines.length;
    return rawLines.slice(start, end);
  };

  const groupLines = getSectionLines('group');
  const scheduleLines = getSectionLines('schedule');
  const studentLines = getSectionLines('students');

  // Parse [GROUP] key-value pairs
  const groupKv: Record<string, string> = {};
  for (const line of groupLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
      continue;
    }
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.substring(0, eqIdx).trim().toLowerCase();
      const val = trimmed.substring(eqIdx + 1).trim();
      if (key) {
        groupKv[key] = val;
      }
    }
  }

  // Validate GROUP basic fields
  const name = groupKv['name'] || '';
  const rawGrade = groupKv['grade'] || '';
  const rawType = (groupKv['type'] || '').toLowerCase();
  const rawDaysKey = groupKv['days'] || '';
  const rawScheduleKey = groupKv['schedule'] || groupKv['timings'] || '';
  const rawTimeKey = groupKv['time'] || groupKv['default_time'] || '';

  if (!name.trim()) {
    errors.push('Group "name" field is required in [GROUP] section.');
  }

  if (!rawGrade.trim()) {
    errors.push('Group "grade" field is required in [GROUP] section.');
  }

  if (!rawType.trim()) {
    errors.push('Group "type" field is required in [GROUP] section (accepted: online, offline).');
  } else if (rawType !== 'online' && rawType !== 'offline') {
    errors.push(`Invalid group "type" "${rawType}". Must be either "online" or "offline".`);
  }

  // Parse Schedule Slots
  const parsedSchedules: ParsedScheduleSlot[] = [];
  const parsedDaysSet = new Set<string>();
  const dayTimesMap: Record<string, string> = {};

  // Strategy A: Parse dedicated [SCHEDULE] section if present
  if (scheduleLines.length > 0) {
    for (let i = 0; i < scheduleLines.length; i++) {
      const line = scheduleLines[i].trim();
      if (!line || line.startsWith('#') || line.startsWith('//')) continue;

      let dayStr = '';
      let timeStr = '';

      if (line.includes('|')) {
        const parts = line.split('|');
        dayStr = parts[0].trim();
        timeStr = parts[1].trim();
      } else if (line.includes('@')) {
        const parts = line.split('@');
        dayStr = parts[0].trim();
        timeStr = parts[1].trim();
      } else if (line.includes(':') && !isValidTimeStr(line)) {
        // e.g. "Saturday: 15:00" -> split on first colon
        const cIdx = line.indexOf(':');
        dayStr = line.substring(0, cIdx).trim();
        timeStr = line.substring(cIdx + 1).trim();
      } else {
        // Space separated, e.g. "Saturday 15:00"
        const spaceIdx = line.lastIndexOf(' ');
        if (spaceIdx !== -1) {
          dayStr = line.substring(0, spaceIdx).trim();
          timeStr = line.substring(spaceIdx + 1).trim();
        }
      }

      if (!dayStr) {
        errors.push(`Invalid schedule line "${line}" in [SCHEDULE] block. Missing day name.`);
        continue;
      }

      if (!isValidTimeStr(timeStr)) {
        errors.push(`Invalid time format "${timeStr}" for day "${dayStr}" in [SCHEDULE]. Expected HH:MM format (e.g. 15:00).`);
        continue;
      }

      const formattedTime = normalizeTimeStr(timeStr);
      const normDay = normalizeDayToShortKey(dayStr);
      parsedSchedules.push({ day: normDay, time: formattedTime });
      parsedDaysSet.add(normDay);
      dayTimesMap[normDay] = formattedTime;
    }
  }

  // Strategy B: If no [SCHEDULE] section, check `schedule=` or `days=` key in [GROUP]
  if (parsedSchedules.length === 0) {
    const scheduleKeyValue = rawScheduleKey || rawDaysKey;

    if (scheduleKeyValue) {
      // Check if scheduleKeyValue has day@time pairs e.g. "Saturday@15:00,Wednesday@19:00" or "Saturday|15:00,Wednesday|19:00"
      const items = scheduleKeyValue.split(',').map((s) => s.trim()).filter(Boolean);

      for (const item of items) {
        if (item.includes('@') || item.includes('|')) {
          const sep = item.includes('@') ? '@' : '|';
          const [dStr, tStr] = item.split(sep).map((s) => s.trim());
          if (dStr && isValidTimeStr(tStr)) {
            const formattedTime = normalizeTimeStr(tStr);
            const normDay = normalizeDayToShortKey(dStr);
            parsedSchedules.push({ day: normDay, time: formattedTime });
            parsedDaysSet.add(normDay);
            dayTimesMap[normDay] = formattedTime;
          } else {
            errors.push(`Invalid day/time format "${item}". Expected format: Day@HH:MM (e.g. Saturday@15:00).`);
          }
        } else {
          // Standard day name without inline time e.g. "Sunday", "Wednesday"
          const fallbackTime = rawTimeKey && isValidTimeStr(rawTimeKey) ? normalizeTimeStr(rawTimeKey) : '18:00';
          const normDay = normalizeDayToShortKey(item);
          parsedSchedules.push({ day: normDay, time: fallbackTime });
          parsedDaysSet.add(normDay);
          dayTimesMap[normDay] = fallbackTime;
        }
      }
    }
  }

  // Validation checks for schedule
  if (parsedSchedules.length === 0) {
    errors.push(
      'Schedule information is required. Provide either a [SCHEDULE] block (e.g. Saturday|15:00) or "days=" and "time=" in [GROUP].'
    );
  }

  // Fallback default group time
  const primaryTime = parsedSchedules.length > 0 ? parsedSchedules[0].time : (isValidTimeStr(rawTimeKey) ? normalizeTimeStr(rawTimeKey) : '18:00');
  const parsedDays = Array.from(parsedDaysSet);

  // Parse & Calculate Payment
  const rawPaymentType = (groupKv['payment_type'] || groupKv['payment_cycle'] || groupKv['payment_model'] || groupKv['payment'] || '').toLowerCase();
  const rawPaymentAmount = groupKv['payment_amount'] || groupKv['amount'] || groupKv['package_price'] || groupKv['price'] || '';
  const rawLessonPrice = groupKv['lesson_price'] || groupKv['price_per_lesson'] || groupKv['price_per_session'] || groupKv['session_price'] || '';

  const validPaymentTypes = [
    'per_lesson', 'per_session', 
    'every_4_lessons', '4_lessons', 
    'every_8_lessons', '8_lessons', 
    'every_12_lessons', '12_lessons', 
    'monthly', 'package'
  ];
  let mappedPaymentCycle: PaymentCycle = '4_lessons';

  if (!rawPaymentType.trim()) {
    errors.push(
      'Group "payment_type" field is required in [GROUP] section (accepted: per_lesson, every_4_lessons, every_8_lessons, monthly).'
    );
  } else if (!validPaymentTypes.includes(rawPaymentType)) {
    errors.push(
      `Invalid payment_type "${rawPaymentType}". Must be one of: per_lesson, every_4_lessons, every_8_lessons, monthly.`
    );
  } else {
    if (rawPaymentType === 'per_lesson' || rawPaymentType === 'per_session') {
      mappedPaymentCycle = 'per_lesson';
    } else if (rawPaymentType === 'every_4_lessons' || rawPaymentType === '4_lessons') {
      mappedPaymentCycle = '4_lessons';
    } else if (rawPaymentType === 'every_8_lessons' || rawPaymentType === '8_lessons') {
      mappedPaymentCycle = '8_lessons';
    } else if (rawPaymentType === 'every_12_lessons' || rawPaymentType === '12_lessons') {
      mappedPaymentCycle = '12_lessons';
    } else {
      mappedPaymentCycle = 'monthly';
    }
  }

  let finalPaymentAmount = 0;
  let parsedLessonPrice: number | undefined = undefined;

  if (rawLessonPrice.trim()) {
    const parsedLp = parseFloat(rawLessonPrice);
    if (!isNaN(parsedLp) && parsedLp >= 0) {
      parsedLessonPrice = parsedLp;
    } else {
      errors.push(`Invalid lesson_price "${rawLessonPrice}". Must be a non-negative number.`);
    }
  }

  if (rawPaymentAmount.trim()) {
    const parsedAmt = parseFloat(rawPaymentAmount);
    if (isNaN(parsedAmt) || parsedAmt < 0) {
      errors.push(`Invalid payment_amount "${rawPaymentAmount}". Must be a non-negative number.`);
    } else {
      finalPaymentAmount = parsedAmt;
    }
  } else if (parsedLessonPrice !== undefined) {
    // Dynamically calculate payment_amount from lesson_price based on payment_type
    if (mappedPaymentCycle === 'per_lesson') {
      finalPaymentAmount = parsedLessonPrice;
    } else if (mappedPaymentCycle === '4_lessons') {
      finalPaymentAmount = parsedLessonPrice * 4;
    } else if (mappedPaymentCycle === '8_lessons') {
      finalPaymentAmount = parsedLessonPrice * 8;
    } else if (mappedPaymentCycle === 'monthly') {
      finalPaymentAmount = parsedLessonPrice * 8; // Default 8 sessions per month
    }
  } else {
    errors.push('Payment details missing: Either "payment_amount" or "lesson_price" must be specified in [GROUP].');
  }

  // Parse [STUDENTS] section
  const parsedStudents: ParsedStudentData[] = [];
  const seenPhones = new Set<string>();
  const seenNames = new Set<string>();

  let studentLineCount = 0;

  for (let idx = 0; idx < studentLines.length; idx++) {
    const rawLine = studentLines[idx];
    const trimmedLine = rawLine.trim();

    if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
      continue;
    }

    studentLineCount++;

    let studentName = '';
    let studentPhone = '';

    if (trimmedLine.includes('|')) {
      const parts = trimmedLine.split('|');
      studentName = parts[0].trim();
      studentPhone = parts.slice(1).join('|').trim();
    } else if (trimmedLine.includes('-')) {
      const parts = trimmedLine.split('-');
      studentName = parts[0].trim();
      studentPhone = parts.slice(1).join('-').trim();
    } else if (trimmedLine.includes(':')) {
      const parts = trimmedLine.split(':');
      studentName = parts[0].trim();
      studentPhone = parts.slice(1).join(':').trim();
    } else if (trimmedLine.includes(',')) {
      const parts = trimmedLine.split(',');
      studentName = parts[0].trim();
      studentPhone = parts.slice(1).join(',').trim();
    } else if (trimmedLine.includes('\t')) {
      const parts = trimmedLine.split('\t');
      studentName = parts[0].trim();
      studentPhone = parts.slice(1).join('\t').trim();
    } else {
      // Try regex match for trailing phone number
      const phoneMatch = trimmedLine.match(/(.*?)\s+([+0-9\s-]{7,15})$/);
      if (phoneMatch) {
        studentName = phoneMatch[1].trim();
        studentPhone = phoneMatch[2].trim();
      } else {
        studentName = trimmedLine;
        studentPhone = '01000000000';
      }
    }

    if (!studentName) {
      errors.push(`Student name is empty on student line ${studentLineCount}.`);
    }

    if (!studentPhone) {
      studentPhone = '01000000000';
    } else {
      // Normalize international +20 10 ... -> 2010... or local 010 123 4567 -> 0101234567
      if (studentPhone.startsWith('+')) {
        studentPhone = studentPhone.replace(/[^\d]/g, '');
      } else if (/^[\d\s-]{8,20}$/.test(studentPhone)) {
        studentPhone = studentPhone.replace(/[\s-]/g, '');
      }
    }

    if (studentName) {
      const lowerPhone = studentPhone.replace(/\s+/g, '');
      const lowerName = studentName.toLowerCase();

      if (seenPhones.has(lowerPhone) && lowerPhone !== '01000000000') {
        warnings.push(
          `Note: Duplicate phone number "${studentPhone}" for student "${studentName}". Both students will keep this phone.`
        );
      } else {
        seenPhones.add(lowerPhone);
      }

      if (seenNames.has(lowerName)) {
        errors.push(
          `Duplicate student name "${studentName}" detected in the import list. Please ensure student names are unique.`
        );
      } else {
        seenNames.add(lowerName);
      }

      parsedStudents.push({
        name: studentName,
        phone: studentPhone,
      });
    }
  }

  if (studentLineCount === 0) {
    errors.push('At least one student record is required in the [STUDENTS] section.');
  }

  const isValid = errors.length === 0;

  const groupData: ParsedGroupData | null =
    isValid || (name && rawGrade && rawType)
      ? {
          name: name.trim(),
          grade: normalizeGrade(rawGrade),
          type: (rawType === 'online' ? 'online' : 'offline') as LessonType,
          days: parsedDays,
          time: primaryTime,
          schedules: parsedSchedules,
          dayTimes: dayTimesMap,
          payment_type: mappedPaymentCycle,
          payment_amount: finalPaymentAmount,
          lesson_price: parsedLessonPrice,
        }
      : null;

  return {
    isValid,
    group: groupData,
    students: parsedStudents,
    errors,
    warnings,
  };
}
