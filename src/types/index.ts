export type GradeLevel = 
  | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4' 
  | 'Grade 5' | 'Grade 6' | 'Grade 7' | 'Grade 8' 
  | 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12';

export type LessonType = 'online' | 'offline';

export type LessonStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'pending_action';

export type AppLanguage = 'ar' | 'en' | 'de';

export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'indigo' | 'rose' | 'amber' | 'emerald' | 'fuchsia' | 'cyan' | 'violet' | 'slate' | 'pink' | 'lime' | 'darkblue';

export type PaymentStatus = 'paid' | 'pending' | 'partial';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type HomeworkStatus = 'assigned' | 'completed' | 'not_completed';

export interface TeacherProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  currency: string;
  language?: AppLanguage;
  phone?: string;
  instaPayId?: string;
  vodafoneCashNumber?: string;
  bankAccount?: string;
  paymentLink?: string;
  instagramAccount?: string;
  whatsappNumber?: string;
  isGoogleConnected: boolean;
  lastSyncedAt: string | null;
  weeklyWorkingHours?: WeeklyWorkingHours;
  workingHours: {
    workingDays: number[]; // 1 = Mon, 7 = Sun
    startTime: string; // e.g. "09:00"
    endTime: string; // e.g. "21:00"
  };
  defaultZoomLink: string;
  defaultMeetLink: string;
  enableLessonAlerts?: boolean; // In-app alerts for upcoming lessons (within 30 mins)
  enableBrowserPush?: boolean; // Browser push notifications
  parentMessageTemplates?: Record<string, string>;
}


export type DayWorkingHours = {
  isOff: boolean;
  startTime: string;
  endTime: string;
};

export type WeeklyWorkingHours = {
  0: DayWorkingHours;
  1: DayWorkingHours;
  2: DayWorkingHours;
  3: DayWorkingHours;
  4: DayWorkingHours;
  5: DayWorkingHours;
  6: DayWorkingHours;
};

export type PaymentCycle = 'per_lesson' | '4_lessons' | '8_lessons' | '12_lessons' | 'monthly';

export interface GroupScheduleSlot {
  day: string;
  time: string;
}

export interface Group {
  id: string;
  name: string;
  grade: GradeLevel;
  type: LessonType;
  monthlyPackagePrice: number;
  pricePerSession?: number;
  sessionCount: number; // e.g., 1, 4, 8, 12
  startingSessionNumber?: number; // e.g., 1, 3, 5, 8...
  paymentMethod?: 'vodafone_cash' | 'cash' | 'bank_transfer' | 'paypal' | 'instapay';
  paymentCycle?: PaymentCycle;
  paymentModel?: 'per_session' | 'package';
  scheduleDays?: string[]; // e.g. ['Sunday', 'Wednesday']
  scheduleTime?: string; // e.g. "17:00"
  scheduleDayTimes?: Record<string, string>; // e.g. { "Sunday": "15:00", "Wednesday": "19:00" }
  schedules?: GroupScheduleSlot[]; // Multi-schedule slots with independent day/time
  zoomLink?: string;
  meetLink?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  color: string;
  lessonDurationMinutes?: number; // Default 60 mins
  status?: 'active' | 'archived';
  whatsAppGroupLink?: string;
  isPinned?: boolean;
}

export interface StudentDocument {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'doc';
  fileSize: string;
  uploadedAt: string;
  url: string;
  category: 'homework' | 'exam' | 'doc';
}

export type PaymentPlanType = 'per_lesson' | '4_lessons' | '8_lessons' | '12_lessons' | 'custom_bundle';

export interface Student {
  id: string;
  name: string;
  groupId: string;
  grade: GradeLevel;
  parentName: string;
  parentPhone: string;
  studentPhone: string;
  phone?: string;
  notes?: string;
  avatarUrl?: string;
  documents: StudentDocument[];
  joinedDate: string;
  status?: 'active' | 'archived';
  paymentStatus?: PaymentStatus;
  packageProgress?: number;
  totalLessonsCount?: number;
  paymentPlan?: PaymentPlanType;
  pricePerLesson?: number;
  bundleSize?: number;
  customBundlePrice?: number;
  advanceBalance?: number;
  monthlyFee?: number;
  isPinned?: boolean;
}

export interface StudentPaymentDetail {
  studentId: string;
  studentName: string;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  amountDue: number;
  notes?: string;
}

export interface LessonReport {
  attendanceStatus?: AttendanceStatus;
  studentAttendance?: Record<string, AttendanceStatus>;
  homeworkStatus?: HomeworkStatus;
  homeworkTitle?: string;
  homeworkDescription?: string;
  quizScore?: number;
  examScore?: number;
  participationScore?: number;
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  studentPayments?: Record<string, { status: PaymentStatus; amount: number }>;
  teacherNotes?: string;
  dictationScore?: string;
  arabicExamScore?: string;
  arabicPerformance?: string;
  arabicHomeworkOption?: string;
  arabicHomeworkRequired?: string;
  arabicParentNotes?: string;
  arabicTemplateMessage?: string;
  arabicFullGeneratedReport?: string;
  studentHomeworkDone?: Record<string, 'yes' | 'no'>;
  studentDictationGrade?: Record<string, number>;
  studentExamGrade?: Record<string, number>;
  studentNotes?: Record<string, string>;
  savedAt?: string;
  scores?: any;
}

export interface DeletedItem<T> {
  item: T;
  deletedAt: string;
}

export interface RecentlyDeletedData {
  students: DeletedItem<Student>[];
  groups: DeletedItem<Group>[];
  lessons: DeletedItem<Lesson>[];
}

export interface ActiveLessonSession {
  lessonId: string;
  lessonTitle: string;
  groupName: string;
  grade?: string;
  type?: LessonType;
  startedAt: number; // epoch timestamp
  accumulatedSeconds: number;
  durationMinutes: number;
  isRunning: boolean;
  startTimeStr: string;
}

export interface Lesson {
  id: string;
  groupId: string;
  groupName: string;
  studentId?: string; // Optional for individual vs group lesson
  studentName?: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h or 12h formatted display)
  durationMinutes: number;
  type: LessonType;
  grade: GradeLevel;
  sessionNumber: number;
  totalSessionsInPackage: number;
  status: LessonStatus;
  paymentStatus: PaymentStatus;
  amountDue: number;
  amountPaid: number;
  meetingLink?: string;
  locationAddress?: string;
  location?: string;
  isPinned?: boolean;
  report?: LessonReport;
  studentPayments?: Record<string, StudentPaymentDetail>;
  offlinePaymentAction?: 'paid_now' | 'will_pay_next' | 'partially_paid' | 'not_paid';
  notes?: string;
  duration?: number;
  // Quick Lesson fields
  isQuickLesson?: boolean;
  quickStudentName?: string;
  quickParentName?: string;
  quickStudentPhone?: string;
  quickParentPhone?: string;
  quickNotes?: string;
}

export type SyncStatus = 'synced' | 'pending' | 'error';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'max';
export type NotificationSound = 'default' | 'beep' | 'chime' | 'bell' | 'gentle';

export interface CategoryNotificationConfig {
  enabled: boolean;
  sound: NotificationSound;
  priority: NotificationPriority;
}

export interface NotificationSettings {
  masterEnabled: boolean;
  
  // Category configs
  lessonReminder: CategoryNotificationConfig;
  lessonStart: CategoryNotificationConfig;
  paymentDue: CategoryNotificationConfig;
  dailySummary: CategoryNotificationConfig;
  attendanceReminder: CategoryNotificationConfig;

  // Reminder timing controls
  lessonReminderMinutesBefore: number; // 5, 10, 15, 30, 60 or custom

  // Daily summary controls
  dailySummaryTime: string; // e.g. "20:00"
  dailySummaryIncludeLessons: boolean;
  dailySummaryIncludeIncome: boolean;
  dailySummaryIncludePendingPayments: boolean;
}

export interface ScheduledNotificationItem {
  id: number;
  title: string;
  body: string;
  scheduledAt: string; // ISO date string or formatted date
  category: 'lessonReminder' | 'lessonStart' | 'paymentDue' | 'dailySummary' | 'attendanceReminder' | 'general';
  extra?: Record<string, any>;
}

export interface BackupData {
  timestamp: string;
  version: string;
  profile: TeacherProfile;
  groups: Group[];
  students: Student[];
  lessons: Lesson[];
  payments: PaymentRecord[];
  notifications: NotificationItem[];
  notificationSettings?: NotificationSettings;
  inspirationSettings?: InspirationSettings;
  inspirationMessages?: InspirationMessage[];
  syncQueue: any[];
  todos?: TodoItem[];
}

export type InspirationFrequency = 'disabled' | 'daily' | 'before_first_lesson' | 'random_daily';
export type InspirationDisplayMethod = 'notification' | 'in_app' | 'both';
export type InspirationSource = 'all' | 'favorites_only';

export interface InspirationMessage {
  id: string;
  text: string;
  isFavorite: boolean;
  isCustom?: boolean;
  createdAt?: string;
}

export interface InspirationSettings {
  frequency: InspirationFrequency;
  displayMethod: InspirationDisplayMethod;
  source: InspirationSource;
  lastShownDate?: string; // YYYY-MM-DD
  lastShownMessageId?: string;
}

export interface BackupIntegrityReport {
  timestamp: string;
  isValid: boolean;
  totalRecords: number;
  details: {
    groupsCount: number;
    studentsCount: number;
    lessonsCount: number;
    paymentsCount: number;
    quickLessonsCount: number;
  };
  messages: string[];
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  lessonId?: string;
  lessonIds?: string[];
  lessonDates?: string[]; // Array of formatted dates e.g. ["01/08/2026", "03/08/2026"]
  cycleNumber?: number;
  bundleSize?: number; // e.g. 1, 4, 8, 12
  amountDue: number;
  amountPaid: number;
  discountAmount?: number;
  advanceAmount?: number;
  refundAmount?: number;
  remainingBalance?: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  paymentType?: 'lesson_fee' | 'package_bundle' | 'advance_payment' | 'refund' | 'adjustment';
  paymentMethod?: 'cash' | 'vodafone_cash' | 'bank_transfer' | 'instapay' | 'paypal';
  lessonsIncluded?: string[];
  notes?: string;
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'reminder' | 'payment' | 'system';
  read: boolean;
  lessonId?: string;
}
export interface TodoItem {
  id: string;
  text: string;
  createdAt: number;
}
