import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AppLanguage } from '../types';
import { 
  Settings, User, Globe, Moon, Sun, Clock, DollarSign, Check, Camera, CheckCircle2,
  HardDrive, Download, Upload, Trash2, AlertTriangle, MessageSquare, ChevronRight,
  ArrowLeft, ArrowRight, Calendar, ShieldAlert, Info, Copy, Save, Phone, ExternalLink,
  BookOpen, FileText, Bell, CheckSquare, XCircle, Award, Sparkles, Star, Plus, Pencil, RotateCcw, Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

type SettingsCategory = 
  | 'language'
  | 'profile'
  | 'payment'
  | 'messages'
  | 'calendar'
  | 'inspiration'
  | 'backup'
  | 'about'
  | 'danger';

const DEFAULT_PARENT_TEMPLATES: Record<string, string> = {
  homework: 'السلام عليكم ورحمة الله وبركاته،\n\nنود إحاطتكم علماً بأن الطالب/ة {student_name} (مجموعة: {group_name}) قد استلم واجب الدرس الجديد بتاريخ {date}. يرجى المتابعة وحل الواجب قبل الحصة القادمة.\n\nمع تحيات: {teacher_name}',
  attendance: 'السلام عليكم ورحمة الله وبركاته،\n\nنفيدكم بحضور الطالب/ة {student_name} بحصة {group_name} اليوم {date}، وكان تفاعله ممتازاً مع الشرح.\n\nشكراً لمتابعتكم: {teacher_name}',
  absence: 'السلام عليكم ورحمة الله وبركاته،\n\nنود إحاطتكم بعدم حضور الطالب/ة {student_name} لحصة {group_name} المقررة اليوم {date}. يرجى التواصل معنا للتنسيق والاطمئنان.\n\nمع تحيات: {teacher_name}',
  payment: 'السلام عليكم ورحمة الله وبركاته،\n\nنود تذكيركم بموعد سداد الرسوم المستحقة للطالب/ة {student_name} عن حزمة دروس {group_name}.\nالمبلغ المطلوب: {amount}.\n\nشاكرين حسن تعاونكم: {teacher_name}',
  exam: 'السلام عليكم ورحمة الله وبركاته،\n\nنتيجة اختبار الطالب/ة {student_name} في مجموعة {group_name}:\nحصل على أداء ممتاز وتم تكريمه في الحصة.\n\nمع خالص التقدير: {teacher_name}',
  summary: 'السلام عليكم ورحمة الله وبركاته،\n\nملخص درس اليوم لمجموعة {group_name} ({date}):\nتم شرح أجزاء الهامة والتطبيق عليها، وأبدى الطلاب تفاعلاً طيباً.\n\nمع تحيات: {teacher_name}'
};

export const SettingsView: React.FC = () => {
  const { 
    profile, updateProfile, theme, toggleTheme, language, setLanguage, t, 
    exportBackupFile, importBackupFile, clearAllData, groups, updateGroup,
    inspirationSettings, inspirationMessages, updateInspirationSettings,
    addInspirationMessage, updateInspirationMessage, deleteInspirationMessage,
    toggleFavoriteInspirationMessage, restoreDefaultInspirationMessages,
    checkAndTriggerInspirationReminder, accentColor, setAccentColor
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<SettingsCategory | null>(null);

  // Inspiration Messages UI States
  const [isManagingMessages, setIsManagingMessages] = useState(false);
  const [msgFilterSource, setMsgFilterSource] = useState<'all' | 'favorites'>('all');
  const [isAddMsgModalOpen, setIsAddMsgModalOpen] = useState(false);
  const [newMsgText, setNewMsgText] = useState('');
  const [editingMsg, setEditingMsg] = useState<{ id: string; text: string } | null>(null);
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);
  const [showRestoreDefaultsConfirm, setShowRestoreDefaultsConfirm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Form States
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [email, setEmail] = useState(profile.email || '');
  const [currency, setCurrency] = useState(profile.currency || 'EGP');
  const [startTime, setStartTime] = useState(profile.workingHours?.startTime || '08:00');
  const [endTime, setEndTime] = useState(profile.workingHours?.endTime || '20:00');
  const [workingDays, setWorkingDays] = useState<number[]>(profile.workingHours?.workingDays || [1, 2, 3, 4, 5, 6, 7]);

  // Payment Profile Fields
  const [phone, setPhone] = useState(profile.phone || '');
  const [instaPayId, setInstaPayId] = useState(profile.instaPayId || '');
  const [vodafoneCashNumber, setVodafoneCashNumber] = useState(profile.vodafoneCashNumber || '');
  const [bankAccount, setBankAccount] = useState(profile.bankAccount || '');
  const [paymentLink, setPaymentLink] = useState(profile.paymentLink || '');
  const [whatsappNumber, setWhatsappNumber] = useState(profile.whatsappNumber || '');

  // Reminder Settings
  const [enableLessonAlerts, setEnableLessonAlerts] = useState(profile.enableLessonAlerts ?? true);
  const [enableBrowserPush, setEnableBrowserPush] = useState(profile.enableBrowserPush ?? false);

  // Parent Message Templates State
  const [activeMessageTab, setActiveMessageTab] = useState<'homework' | 'attendance' | 'absence' | 'payment' | 'exam' | 'summary'>('homework');
  const [messageTemplates, setMessageTemplates] = useState<Record<string, string>>({
    ...DEFAULT_PARENT_TEMPLATES,
    ...(profile.parentMessageTemplates || {})
  });

  // UI Toast & Modal States
  const [copiedPaymentDetails, setCopiedPaymentDetails] = useState(false);
  const [copiedTemplateText, setCopiedTemplateText] = useState(false);
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);
  const [restoreStatusMsg, setRestoreStatusMsg] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRtl = language === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const ForwardIcon = isRtl ? ArrowLeft : ChevronRight;

  const handleSharePaymentInfo = () => {
    const text = `السلام عليكم ورحمة الله وبركاته\n\nبيانات التحويل والدفع:\n\n📱 رقم الهاتف:\n${phone || 'غير محدد'}\n\n💳 InstaPay:\n${instaPayId || 'غير محدد'}\n${vodafoneCashNumber ? `\n💸 فودافون كاش:\n${vodafoneCashNumber}\n` : ''}${bankAccount ? `\n🏦 الحساب البنكي:\n${bankAccount}\n` : ''}${paymentLink ? `\n🔗 رابط الدفع:\n${paymentLink}\n` : ''}${whatsappNumber ? `\n💬 واتساب:\n${whatsappNumber}\n` : ''}\nشكراً لحضراتكم.\n\nمع تحيات\n${displayName || 'المعلم'}`;
    
    navigator.clipboard.writeText(text);
    setCopiedPaymentDetails(true);
    confetti({ particleCount: 50, spread: 50 });
    setTimeout(() => setCopiedPaymentDetails(false), 2500);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = await importBackupFile(content);
          if (success) {
            setRestoreStatusMsg(t('dataRefreshed'));
            confetti({ particleCount: 70, spread: 60 });
            setTimeout(() => setRestoreStatusMsg(null), 4000);
          } else {
            alert('JSON File invalid');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTeacherAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
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
            confetti({ particleCount: 40, spread: 40 });
          };
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerSaveToast = () => {
    setSavedSuccessToast(true);
    confetti({ particleCount: 50, spread: 40 });
    setTimeout(() => setSavedSuccessToast(false), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ 
      displayName, 
      email, 
      currency,
      workingHours: {
        workingDays,
        startTime,
        endTime
      }
    });
    triggerSaveToast();
  };

  const handleSavePaymentInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ 
      phone,
      instaPayId,
      vodafoneCashNumber,
      bankAccount,
      paymentLink,
      whatsappNumber
    });
    triggerSaveToast();
  };

  const handleSaveMessageTemplates = () => {
    updateProfile({
      parentMessageTemplates: messageTemplates
    });
    triggerSaveToast();
  };

  const handleSaveCalendarSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      workingHours: {
        workingDays,
        startTime,
        endTime
      },
      enableLessonAlerts,
      enableBrowserPush
    });
    triggerSaveToast();
  };

  const toggleWorkingDay = (dayNum: number) => {
    setWorkingDays(prev => 
      prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum].sort()
    );
  };

  const languagesList: { id: AppLanguage; label: string; flag: string }[] = [
    { id: 'ar', label: 'العربية', flag: '🇪🇬' },
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  const categoryCards = [
    {
      id: 'language' as SettingsCategory,
      title: language === 'ar' ? 'اللغة والمظهر' : language === 'de' ? 'Sprache & Erscheinungsbild' : 'Language & Appearance',
      description: language === 'ar' ? 'لغة الواجهة ووضع المظهر الداكن/الفاتح' : language === 'de' ? 'Oberflächensprache & Dunkelmodus' : 'Interface language & light/dark theme',
      icon: Globe,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50',
      badge: languagesList.find(l => l.id === language)?.label
    },
    {
      id: 'profile' as SettingsCategory,
      title: language === 'ar' ? 'الملف الشخصي للمعلم' : language === 'de' ? 'Lehrerprofil' : 'Teacher Profile',
      description: language === 'ar' ? 'الاسم، البريد، ساعات العمل والعملة' : language === 'de' ? 'Name, E-Mail, Arbeitszeiten & Währung' : 'Name, email, working hours & currency',
      icon: User,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/50',
      badge: profile.displayName
    },
    {
      id: 'payment' as SettingsCategory,
      title: language === 'ar' ? 'بيانات التحويل والدفع' : language === 'de' ? 'Zahlungsinformationen' : 'Payment Information',
      description: language === 'ar' ? 'رقم الهاتف، انستا باي، فودافون كاش والروابط' : language === 'de' ? 'Telefon, InstaPay, Vodafone Cash & Bank' : 'Phone, InstaPay, Vodafone Cash & links',
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50',
      badge: phone || 'InstaPay'
    },
    {
      id: 'messages' as SettingsCategory,
      title: language === 'ar' ? 'قوالب رسائل أولياء الأمور' : language === 'de' ? 'Elternnachrichten Vorlagen' : 'Parent Messages',
      description: language === 'ar' ? 'إدارة قوالب الواجبات، الحضور، الغياب والتقارير' : language === 'de' ? 'Vorlagen für Hausaufgaben, Anwesenheit & Berichte' : 'Manage templates for homework, attendance & reports',
      icon: MessageSquare,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50',
      badge: language === 'ar' ? '6 قوالب' : '6 Templates'
    },
    {
      id: 'calendar' as SettingsCategory,
      title: language === 'ar' ? 'التقويم ومدة الحصص' : language === 'de' ? 'Kalender & Lektionsdauer' : 'Calendar & Lessons',
      description: language === 'ar' ? 'تحديد مدة حصص كل مجموعة، أيام وساعات العمل والتنبيهات' : language === 'de' ? 'Dauer pro Gruppe, Arbeitstage & Erinnerungen' : 'Group lesson durations, working days & reminders',
      icon: Calendar,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50',
      badge: `${groups.length} ${language === 'ar' ? 'مجموعات' : 'Groups'}`
    },
    {
      id: 'inspiration' as SettingsCategory,
      title: language === 'ar' ? 'الإلهام والامتنان' : language === 'de' ? 'Inspiration & Dankbarkeit' : 'Inspiration & Gratitude',
      description: language === 'ar' ? 'تذكيرات وأدعية للمعلم عن العلم والرزق والتعليم' : language === 'de' ? 'Tägliche Motivation & Dankbarkeits-Erinnerungen' : 'Daily motivational & gratitude reminders',
      icon: Sparkles,
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/50',
      badge: inspirationSettings.frequency === 'disabled' 
        ? (language === 'ar' ? 'معطل' : 'Disabled') 
        : inspirationSettings.frequency === 'daily'
        ? (language === 'ar' ? 'تذكير يومي' : 'Daily')
        : inspirationSettings.frequency === 'before_first_lesson'
        ? (language === 'ar' ? 'قبل أول حصة' : 'Before Lesson')
        : (language === 'ar' ? 'عشوائي يومي' : 'Random')
    },
    {
      id: 'backup' as SettingsCategory,
      title: language === 'ar' ? 'النسخ الاحتياطي والبيانات' : language === 'de' ? 'Sicherung & Daten' : 'Backup & Restore',
      description: language === 'ar' ? 'تنزيل واستعادة النسخة الاحتياطية وإعادة ضبط البيانات' : language === 'de' ? 'Sicherung herunterladen, wiederherstellen & zurücksetzen' : 'Download, restore backups & reset data',
      icon: HardDrive,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200/50 dark:border-cyan-800/50',
      badge: 'Backup & Reset'
    },
    {
      id: 'about' as SettingsCategory,
      title: language === 'ar' ? 'حول التطبيق' : language === 'de' ? 'Über die App' : 'About',
      description: language === 'ar' ? 'تفاصيل التطبيق، الميزات، المطور والتواصل' : language === 'de' ? 'App-Info, Entwickler & Version' : 'App details, features, developer & version',
      icon: Info,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200/50 dark:border-teal-800/50',
      badge: 'v2.5.0'
    }
  ];

  // Helper Header Component for Subpages
  const renderSubPageHeader = (title: string, subtitle?: string) => (
    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
          title={language === 'ar' ? 'العودة للإعدادات' : 'Back to Settings'}
        >
          <BackIcon className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-28">
      {/* ==========================================
          HOME SETTINGS VIEW (CATEGORY CARDS)
      ========================================== */}
      {activeCategory === null && (
        <div className="space-y-4 animate-scale-up">
          {/* Main Title Header */}
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>{t('settings_title')}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'ar' ? 'اختر قسماً لإدارة إعدادات التطبيق' : language === 'de' ? 'Wählen Sie einen Bereich zur Verwaltung aus' : 'Select a section to manage application settings'}
            </p>
          </div>

          {/* Main Category Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categoryCards.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-lg p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-start group"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                    <div className={`p-3 rounded-lg border shrink-0 ${cat.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {cat.title}
                        </h3>
                      </div>
                      
                    </div>
                  </div>

                  <div className="p-2 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0">
                    <ForwardIcon className="w-5 h-5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ==========================================
          SUBPAGE 1: LANGUAGE & APPEARANCE
      ========================================== */}
      {activeCategory === 'language' && (
        <div className="space-y-4 animate-scale-up">
          {renderSubPageHeader(
            language === 'ar' ? 'اللغة والمظهر' : language === 'de' ? 'Sprache & Erscheinungsbild' : 'Language & Appearance',
            language === 'ar' ? 'اختر لغة التطبيق ومظهر الشاشة' : 'Choose application language and theme mode'
          )}

          {/* Interface Language Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>{t('settings_language')}</span>
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('settings_lang_desc')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {languagesList.map((langItem) => {
                const isSelected = language === langItem.id;
                return (
                  <button
                    key={langItem.id}
                    type="button"
                    onClick={() => {
                      if (language !== langItem.id) {
                        setLanguage(langItem.id);
                        confetti({ particleCount: 30, spread: 40 });
                      }
                    }}
                    className={`p-3.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-base">{langItem.flag}</span>
                    <span>{langItem.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>

            {/* Language Note Banner */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-lg flex items-start gap-2.5 text-amber-800 dark:text-amber-200 text-xs">
              <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                {language === 'ar' 
                  ? 'ملاحظة: اللسان واللغة المختارة تنطبق على واجهة التطبيق بالكامل. رسائل أولياء الأمور والتقارير الموجهة للأهالي تظل دائماً باللغة العربية.'
                  : 'Note: The selected language applies to the entire application interface. Parent messages and reports always remain in Arabic.'}
              </span>
            </div>
          </div>

          {/* Theme Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>{t('settings_theme')}</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`p-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  theme === 'light'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>{t('settings_theme_light')}</span>
              </button>

              <button
                type="button"
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`p-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>{t('settings_theme_dark')}</span>
              </button>
            </div>
          </div>

          {/* Accent Color Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>
                  {language === 'ar' ? 'لون الواجهة (Accent Color)' : language === 'de' ? 'Akzentfarbe' : 'Accent Color'}
                </span>
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'ar' 
                ? 'اختر لون التمييز المفضل لجميع الأزرار والأيقونات والتبويبات النشطة وعناصر الواجهة التفاعلية.' 
                : language === 'de'
                ? 'Wählen Sie die bevorzugte Akzentfarbe für alle Schaltflächen, Symbole, Tabs und Steuerelemente.'
                : 'Select your preferred accent color for all buttons, icons, active tabs, and interactive controls.'}
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 pt-1">
              {[
                { id: 'blue' as const, bg: 'bg-blue-600', ring: 'ring-blue-500/50', border: 'border-blue-700' },
                { id: 'green' as const, bg: 'bg-green-600', ring: 'ring-green-500/50', border: 'border-green-700' },
                { id: 'purple' as const, bg: 'bg-purple-600', ring: 'ring-purple-500/50', border: 'border-purple-700' },
                { id: 'orange' as const, bg: 'bg-orange-600', ring: 'ring-orange-500/50', border: 'border-orange-700' },
                { id: 'red' as const, bg: 'bg-red-600', ring: 'ring-red-500/50', border: 'border-red-700' },
                { id: 'teal' as const, bg: 'bg-teal-600', ring: 'ring-teal-500/50', border: 'border-teal-700' },
                { id: 'indigo' as const, bg: 'bg-indigo-600', ring: 'ring-indigo-500/50', border: 'border-indigo-700' },
              ].map((item) => {
                const isSelected = accentColor === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (accentColor !== item.id) {
                        setAccentColor(item.id);
                        confetti({ particleCount: 30, spread: 40 });
                      }
                    }}
                    className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center border ${item.border} shadow-xs relative transition-all duration-300 transform group-hover:scale-110 active:scale-95 ${
                        isSelected 
                          ? 'ring-4 ' + item.ring + ' scale-105' 
                          : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-5 h-5 text-white stroke-[3.5px] drop-shadow-sm animate-scale-up" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          SUBPAGE 2: TEACHER PROFILE
      ========================================== */}
      {activeCategory === 'profile' && (
        <div className="space-y-4 animate-scale-up">
          {renderSubPageHeader(
            language === 'ar' ? 'الملف الشخصي للمعلم' : 'Teacher Profile',
            language === 'ar' ? 'إدارة البيانات الشخصية وساعات العمل والعملة' : 'Manage personal details, working hours & currency'
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            {/* Avatar Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="relative shrink-0 group">
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-16 h-16 rounded-lg object-cover ring-2 ring-blue-500/30 shadow-md"
                />
                <label 
                  className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" onChange={handleTeacherAvatarUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-1 flex-1">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">{displayName || t('settings_name')}</p>
                <p className="text-xs text-slate-500 font-mono">{email || '-'}</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                    {t('settings_currency')}: {currency}
                  </span>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-md">
                    {startTime} - {endTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Display / Edit Toggle */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs font-bold px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
              >
                {isEditingProfile ? (language === 'ar' ? 'إلغاء' : 'Cancel') : (language === 'ar' ? 'تعديل البيانات' : 'Edit Profile')}
              </button>
            </div>
            
            {/* Profile Form */}
            <form onSubmit={(e) => { handleSaveProfile(e); setIsEditingProfile(false); }} className="space-y-4">
              <fieldset disabled={!isEditingProfile} className={!isEditingProfile ? 'opacity-70 pointer-events-none' : ''}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('settings_name')} *</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('settings_email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('settings_currency')}</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="EGP">EGP (ج.م)</option>
                    <option value="€">EUR (€)</option>
                    <option value="$">USD ($)</option>
                    <option value="SAR">SAR (ر.س)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('settings_start_time')}</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('settings_end_time')}</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {savedSuccessToast && (
                <div className="bg-emerald-600 text-white text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2 animate-scale-up">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('settings_save_success')}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{t('save')}</span>
                {isEditingProfile && <span>{t('save')}</span>}
              </button>
              </fieldset>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          SUBPAGE 3: PAYMENT INFORMATION
      ========================================== */}
      {activeCategory === 'payment' && (
        <div className="space-y-4 animate-scale-up">
          {renderSubPageHeader(
            language === 'ar' ? 'بيانات التحويل والدفع' : 'Payment Information',
            language === 'ar' ? 'البيانات المستخدمة عند إرسال مطالبات الرسوم لأولياء الأمور' : 'Information used when sending payment requests to parents'
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ar' ? 'بيانات الدفع الإلكتروني المباشر' : 'Direct Electronic Payment Profile'}</span>
              </div>

              <button
                type="button"
                onClick={handleSharePaymentInfo}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedPaymentDetails ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPaymentDetails ? t('copied') : (language === 'ar' ? 'نسخ بيانات التحويل' : 'Copy Payment Info')}</span>
              </button>
            </div>

            <form onSubmit={handleSavePaymentInfo} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t('settings_phone')}</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t('settings_instapay')}</label>
                  <input
                    type="text"
                    value={instaPayId}
                    onChange={(e) => setInstaPayId(e.target.value)}
                    placeholder="name@instapay"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t('settings_vodafone')}</label>
                  <input
                    type="text"
                    value={vodafoneCashNumber}
                    onChange={(e) => setVodafoneCashNumber(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t('settings_bank')}</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="EG1234567890..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{t('settings_payment_link')}</label>
                  <input
                    type="text"
                    value={paymentLink}
                    onChange={(e) => setPaymentLink(e.target.value)}
                    placeholder="https://pay.link/..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">WhatsApp</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+201012345678"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {savedSuccessToast && (
                <div className="bg-emerald-600 text-white text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2 animate-scale-up">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('settings_save_success')}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSharePaymentInfo}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{language === 'ar' ? 'نسخ بيانات التحويل' : 'Copy Payment Info'}</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          SUBPAGE 4: PARENT MESSAGES TEMPLATES
      ========================================== */}
      {activeCategory === 'messages' && (
        <div className="space-y-4 animate-scale-up">
          {renderSubPageHeader(
            language === 'ar' ? 'قوالب رسائل أولياء الأمور' : 'Parent Message Templates',
            language === 'ar' ? 'تخصيص الرسائل التلقائية للواجبات، الحضور، الغياب والتقارير' : 'Manage templates for homework, attendance, absence, payment & reports'
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            {/* Template Categories Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'homework', label: language === 'ar' ? 'الواجبات' : 'Homework', icon: BookOpen },
                { id: 'attendance', label: language === 'ar' ? 'الحضور' : 'Attendance', icon: CheckSquare },
                { id: 'absence', label: language === 'ar' ? 'الغياب' : 'Absence', icon: XCircle },
                { id: 'payment', label: language === 'ar' ? 'المدفوعات' : 'Payments', icon: DollarSign },
                { id: 'exam', label: language === 'ar' ? 'الاختبارات' : 'Exam Reports', icon: Award },
                { id: 'summary', label: language === 'ar' ? 'ملخص الدرس' : 'Lesson Summary', icon: FileText },
              ].map(tab => {
                const TabIcon = tab.icon;
                const isSelected = activeMessageTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveMessageTab(tab.id as any)}
                    className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Template Editor */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span>
                    {language === 'ar' ? 'نص قالب الرسالة (بالعربية)' : 'Message Template Text (Arabic)'}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(messageTemplates[activeMessageTab] || '');
                    setCopiedTemplateText(true);
                    setTimeout(() => setCopiedTemplateText(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedTemplateText ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTemplateText ? t('copied') : (language === 'ar' ? 'نسخ النص' : 'Copy Text')}</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={messageTemplates[activeMessageTab] || ''}
                onChange={(e) => setMessageTemplates(prev => ({ ...prev, [activeMessageTab]: e.target.value }))}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold leading-relaxed focus:ring-2 focus:ring-purple-500 outline-none font-sans"
                dir="rtl"
              />

              {/* Dynamic Variables Legend */}
              <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/50 rounded-lg text-[11px] text-purple-900 dark:text-purple-200 space-y-1">
                <p className="font-bold">{language === 'ar' ? 'المتغيرات المتاحة للاستخدام تلقائياً:' : 'Available Dynamic Placeholders:'}</p>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px] pt-1">
                  <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-bold">{'{student_name}'}</span>
                  <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-bold">{'{group_name}'}</span>
                  <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-bold">{'{date}'}</span>
                  <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-bold">{'{amount}'}</span>
                  <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-bold">{'{teacher_name}'}</span>
                </div>
              </div>

              {savedSuccessToast && (
                <div className="bg-emerald-600 text-white text-xs font-bold p-2.5 rounded-xl flex items-center justify-center gap-2 animate-scale-up">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('settings_save_success')}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMessageTemplates(prev => ({ ...prev, [activeMessageTab]: DEFAULT_PARENT_TEMPLATES[activeMessageTab] }))}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'استعادة الافتراضي' : 'Reset to Default'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveMessageTemplates}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{language === 'ar' ? 'حفظ القوالب' : 'Save Templates'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          SUBPAGE 5: CALENDAR & LESSONS
      ========================================== */}
      {activeCategory === 'calendar' && (
        <div className="space-y-4 animate-scale-up">
          {renderSubPageHeader(
            language === 'ar' ? 'التقويم ومدة الحصص' : 'Calendar & Lessons',
            language === 'ar' ? 'تحديد مدة حصص كل مجموعة، أيام وساعات العمل وتنبيهات التقويم' : 'Group lesson durations, working days & schedule alerts'
          )}

          {/* Group Lesson Durations Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{language === 'ar' ? 'مدة الحصص حسب المجموعات' : 'Lesson Duration per Group'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'ar' ? 'مدة الحصة الافتراضية 60 دقيقة. يمكنك تخصيص مدة أطول لكل مجموعة لتعكس في التقويم' : 'Default duration is 60 mins. Customize specific group durations below (e.g. 60, 90, 120 mins)'}
                </p>
              </div>
            </div>

            {/* Groups Durations Table / List */}
            {groups.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-500 text-center font-semibold">
                {language === 'ar' ? 'لا توجد مجموعات حالياً. أضف مجموعة أولاً.' : 'No groups available yet. Create a group first.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {groups.map(grp => (
                  <div key={grp.id} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg flex items-center justify-between gap-3 border border-slate-200/60 dark:border-slate-700">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{grp.name}</p>
                      <p className="text-[11px] text-slate-500">{grp.grade} • {grp.type === 'online' ? 'Online' : 'Offline'}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-bold text-slate-500">{language === 'ar' ? 'المدة:' : 'Duration:'}</span>
                      <select
                        value={grp.lessonDurationMinutes || 60}
                        onChange={(e) => updateGroup(grp.id, { lessonDurationMinutes: Number(e.target.value) })}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                      >
                        <option value={60}>60 Min (1 Std / 1 Hour)</option>
                        <option value={75}>75 Min (1h 15m)</option>
                        <option value={90}>90 Min (1.5 Std / 1.5 Hours)</option>
                        <option value={105}>105 Min (1h 45m)</option>
                        <option value={120}>120 Min (2 Std / 2 Hours)</option>
                        <option value={150}>150 Min (2.5 Std / 2.5 Hours)</option>
                        <option value={180}>180 Min (3 Std / 3 Hours)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Working Days & Working Hours Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{t('settings_working_hours')}</span>
            </h3>

            <form onSubmit={handleSaveCalendarSettings} className="space-y-4">
              {/* Working Days Checkboxes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'ar' ? 'أيام العمل الأسبوعية:' : 'Working Days:'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { num: 6, label: language === 'ar' ? 'السبت' : 'Sa' },
                    { num: 7, label: language === 'ar' ? 'الأحد' : 'So' },
                    { num: 1, label: language === 'ar' ? 'الإثنين' : 'Mo' },
                    { num: 2, label: language === 'ar' ? 'الثلاثاء' : 'Di' },
                    { num: 3, label: language === 'ar' ? 'الأربعاء' : 'Mi' },
                    { num: 4, label: language === 'ar' ? 'الخميس' : 'Do' },
                    { num: 5, label: language === 'ar' ? 'الجمعة' : 'Fr' },
                  ].map(day => {
                    const isSelected = workingDays.includes(day.num);
                    return (
                      <button
                        key={day.num}
                        type="button"
                        onClick={() => toggleWorkingDay(day.num)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Working Hours Times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('settings_start_time')}</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('settings_end_time')}</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Reminder Settings */}
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 rounded-lg space-y-2">
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span>{language === 'ar' ? 'إعدادات التنبيهات والتذكير' : 'Reminder Settings'}</span>
                </h4>

                <label className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl cursor-pointer text-xs font-semibold">
                  <span>{language === 'ar' ? 'تنبيهات الحصص المباشرة (قبل 30 دقيقة)' : 'In-App Lesson Alerts (Within 30 mins)'}</span>
                  <input 
                    type="checkbox" 
                    checked={enableLessonAlerts} 
                    onChange={(e) => setEnableLessonAlerts(e.target.checked)} 
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl cursor-pointer text-xs font-semibold">
                  <span>{language === 'ar' ? 'إشعارات المتصفح والسطح' : 'Browser Push Notifications'}</span>
                  <input 
                    type="checkbox" 
                    checked={enableBrowserPush} 
                    onChange={(e) => setEnableBrowserPush(e.target.checked)} 
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </label>
              </div>

              {savedSuccessToast && (
                <div className="bg-emerald-600 text-white text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2 animate-scale-up">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('settings_save_success')}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{t('save')}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          SUBPAGE 7: INSPIRATION & GRATITUDE
      ========================================== */}
      {activeCategory === 'inspiration' && (
        <div className="space-y-4 animate-scale-up pb-24">
          {renderSubPageHeader(
            language === 'ar' ? 'الإلهام والامتنان' : language === 'de' ? 'Inspiration & Dankbarkeit' : 'Inspiration & Gratitude',
            language === 'ar' ? 'تذكيرات وأدعية للمعلم' : language === 'de' ? 'Motivation & Dankbarkeits-Erinnerungen' : 'Teacher reminders & motivation'
          )}

          {!isManagingMessages ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span>{language === 'ar' ? 'إعدادات الظهور' : 'Display Settings'}</span>
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'ar' ? 'تكرار التذكير' : 'Frequency'}
                    </label>
                    <select
                      value={inspirationSettings.frequency}
                      onChange={(e) => updateInspirationSettings({ frequency: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 font-medium text-sm transition-all"
                    >
                      <option value="disabled">{language === 'ar' ? 'معطل (عدم الإظهار)' : 'Disabled'}</option>
                      <option value="daily">{language === 'ar' ? 'مرة واحدة يومياً' : 'Once Daily'}</option>
                      <option value="before_first_lesson">{language === 'ar' ? 'قبل الحصة الأولى في اليوم' : 'Before First Lesson'}</option>
                      <option value="random_daily">{language === 'ar' ? 'عشوائي خلال اليوم' : 'Randomly During Day'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'ar' ? 'طريقة العرض' : 'Display Method'}
                    </label>
                    <select
                      value={inspirationSettings.displayMethod}
                      onChange={(e) => updateInspirationSettings({ displayMethod: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 font-medium text-sm transition-all"
                      disabled={inspirationSettings.frequency === 'disabled'}
                    >
                      <option value="in_app">{language === 'ar' ? 'داخل التطبيق فقط (بطاقة)' : 'In-App Only (Card)'}</option>
                      <option value="notification">{language === 'ar' ? 'إشعار نظام فقط' : 'System Notification Only'}</option>
                      <option value="both">{language === 'ar' ? 'داخل التطبيق + إشعار' : 'In-App & Notification'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'ar' ? 'مصدر الرسائل' : 'Message Source'}
                    </label>
                    <select
                      value={inspirationSettings.source}
                      onChange={(e) => updateInspirationSettings({ source: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 font-medium text-sm transition-all"
                      disabled={inspirationSettings.frequency === 'disabled'}
                    >
                      <option value="all">{language === 'ar' ? 'جميع الرسائل' : 'All Messages'}</option>
                      <option value="favorites_only">{language === 'ar' ? 'المفضلة فقط' : 'Favorites Only'}</option>
                    </select>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => checkAndTriggerInspirationReminder('manual')}
                  className="w-full p-3 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تجربة التذكير الآن' : 'Test Reminder Now'}</span>
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>{language === 'ar' ? 'الرسائل والأدعية' : 'Messages'}</span>
                  </h3>
                  <div className="text-xs font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-lg">
                    {inspirationMessages.length} {language === 'ar' ? 'رسالة' : 'Messages'}
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  {language === 'ar' 
                    ? 'إدارة العبارات التحفيزية والأدعية التي تظهر لك. يمكنك إضافة رسائلك الخاصة أو تفضيل الرسائل التي تحبها.'
                    : 'Manage the motivational quotes and prayers. Add your own custom messages or favorite the ones you like.'}
                </p>

                <button
                  onClick={() => setIsManagingMessages(true)}
                  className="w-full p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إدارة الرسائل' : 'Manage Messages'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => {
                    setIsManagingMessages(false);
                    setEditingMsg(null);
                    setDeletingMsgId(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === 'ar' ? 'عودة' : 'Back'}</span>
                </button>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setMsgFilterSource('all')}
                    className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-md transition-colors ${msgFilterSource === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                  >
                    {language === 'ar' ? 'الكل' : 'All'}
                  </button>
                  <button
                    onClick={() => setMsgFilterSource('favorites')}
                    className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-md transition-colors flex items-center gap-1 ${msgFilterSource === 'favorites' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}
                  >
                    <Star className={`w-3 h-3 ${msgFilterSource === 'favorites' ? 'fill-current' : ''}`} />
                    {language === 'ar' ? 'المفضلة' : 'Favorites'}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    setEditingMsg(null);
                    setNewMsgText('');
                    setIsAddMsgModalOpen(true);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إضافة رسالة' : 'Add Message'}</span>
                </button>
                
                <button
                  onClick={() => setShowRestoreDefaultsConfirm(true)}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title={language === 'ar' ? 'استعادة الرسائل الافتراضية' : 'Restore Default Messages'}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Message List */}
              <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto pr-1 pb-4">
                {inspirationMessages
                  .filter(m => msgFilterSource === 'all' || m.isFavorite)
                  .map(msg => (
                  <div key={msg.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-lg flex flex-col gap-3">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 dir-rtl text-right">
                      {msg.text}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        {msg.isCustom && (
                          <span className="text-[9px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                            {language === 'ar' ? 'مخصص' : 'Custom'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavoriteInspirationMessage(msg.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${msg.isFavorite ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        >
                          <Star className={`w-4 h-4 ${msg.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingMsg({ id: msg.id, text: msg.text });
                            setIsAddMsgModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingMsgId(msg.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Delete Confirmation Inline */}
                    {deletingMsgId === msg.id && (
                      <div className="mt-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2">
                        <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
                          {language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDeletingMsgId(null)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                          </button>
                          <button
                            onClick={() => {
                              deleteInspirationMessage(msg.id);
                              setDeletingMsgId(null);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                          >
                            {t('delete')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {inspirationMessages.filter(m => msgFilterSource === 'all' || m.isFavorite).length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{language === 'ar' ? 'لا توجد رسائل' : 'No messages found'}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message Edit/Add Modal */}
      {isAddMsgModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-sm shadow-xl p-5 space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {editingMsg 
                ? (language === 'ar' ? 'تعديل الرسالة' : 'Edit Message')
                : (language === 'ar' ? 'إضافة رسالة جديدة' : 'Add New Message')}
            </h3>
            <textarea
              value={editingMsg ? editingMsg.text : newMsgText}
              onChange={(e) => editingMsg ? setEditingMsg({ ...editingMsg, text: e.target.value }) : setNewMsgText(e.target.value)}
              placeholder={language === 'ar' ? 'اكتب رسالتك أو دعاءك هنا...' : 'Write your message...'}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-sm min-h-[100px] resize-none dir-rtl"
              dir="auto"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsAddMsgModalOpen(false);
                  setEditingMsg(null);
                  setNewMsgText('');
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  if (editingMsg && editingMsg.text.trim()) {
                    updateInspirationMessage(editingMsg.id, editingMsg.text);
                  } else if (!editingMsg && newMsgText.trim()) {
                    addInspirationMessage(newMsgText);
                  }
                  setIsAddMsgModalOpen(false);
                  setEditingMsg(null);
                  setNewMsgText('');
                }}
                disabled={editingMsg ? !editingMsg.text.trim() : !newMsgText.trim()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Defaults Confirm Modal */}
      {showRestoreDefaultsConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-sm shadow-xl p-5 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">
                {language === 'ar' ? 'استعادة الرسائل الافتراضية' : 'Restore Defaults'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {language === 'ar' 
                  ? 'سيتم استعادة الرسائل والأدعية الافتراضية. رسائلك المخصصة لن يتم حذفها.'
                  : 'Default messages will be restored. Your custom messages will not be deleted.'}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowRestoreDefaultsConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  restoreDefaultInspirationMessages();
                  setShowRestoreDefaultsConfirm(false);
                }}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-colors"
              >
                {language === 'ar' ? 'استعادة' : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          SUBPAGE 6: DATA & BACKUP
      ========================================== */}
      {/* ==========================================
          SUBPAGE 6: DATA & BACKUP (INCLUDES DANGER ZONE)
      ========================================== */}
      {(activeCategory === 'backup' || activeCategory === 'danger') && (
        <div className="space-y-4 animate-scale-up">
          {renderSubPageHeader(
            language === 'ar' ? 'النسخ الاحتياطي وإدارة البيانات' : 'Backup & Data Management',
            language === 'ar' ? 'تنزيل واستعادة نسخة احتياطية من البيانات أو مسح البيانات' : 'Download, restore backup or reset application data'
          )}

          {/* Backup & Restore Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ar' ? 'النسخ الاحتياطي والاستعادة' : 'Backup & Restore'}</span>
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'ar' 
                ? 'احتفظ بنسخة من جميع الطلاب والمجموعات والحصص والمدفوعات آمنة محلياً (ملف JSON) أو استعدها في أي وقت.'
                : 'Keep a secure local JSON backup of all students, groups, lessons, and payment records, or restore at any time.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={exportBackupFile}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'ar' ? 'تنزيل / تصدير النسخة الاحتياطية (JSON)' : 'Download / Export Backup (JSON)'}</span>
              </button>

              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleRestoreFile} 
                  accept=".json" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>{language === 'ar' ? 'استعادة / استيراد من ملف (JSON)' : 'Restore / Import Backup (JSON)'}</span>
                </button>
              </div>
            </div>

            {restoreStatusMsg && (
              <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold p-3 rounded-xl flex items-center gap-2 animate-scale-up">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{restoreStatusMsg}</span>
              </div>
            )}
          </div>

          {/* Danger Zone Section inside Backup */}
          <div className="bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-200 dark:border-rose-900/80 rounded-xl p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-lg shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-200">
                  {language === 'ar' ? 'منطقة الخطر (إعادة ضبط البيانات)' : 'Danger Zone (Data Reset)'}
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
                  {language === 'ar'
                    ? 'إجراءات حساسة: سيؤدي هذا إلى حذف كافة الطلاب والمجموعات والحصص والمدفوعات نهائياً من هذا الجهاز.'
                    : 'Sensitive actions: Resetting data will permanently delete all students, groups, lessons, and payment records.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="w-full bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-black text-xs py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('settings_clear_data')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          SUBPAGE 7: DEDICATED ABOUT PAGE
      ========================================== */}
      {activeCategory === 'about' && (
        <div className="space-y-4 animate-scale-up">
          {renderSubPageHeader(
            language === 'ar' ? 'حول التطبيق' : 'About',
            language === 'ar' ? 'معلومات التطبيق والميزات وتفاصيل التواصل مع المطور' : 'Application details, features & developer contacts'
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-2xs space-y-6 text-center sm:text-start">
            {/* App Hero Branding Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <img
                src="/logo.svg"
                alt="AGS19 Logo"
                className="w-16 h-16 rounded-lg object-contain bg-white p-1 shadow-md border border-slate-200/80 dark:border-slate-800 shrink-0"
              />
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  AGS19
                </h1>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-extrabold mt-0.5">
                  {language === 'ar' ? 'نظام إداري متكامل لمعلمي اللغة الألمانية والدروس الخاصة' : 'German Teacher Management System'}
                </p>
              </div>
            </div>

            {/* App Description */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                {language === 'ar' ? 'الوصف' : 'Description'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200/60 dark:border-slate-700">
                AGS19 helps private teachers manage students, groups, lessons, attendance, payments, reports, parent communication, and scheduling from one place.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                {language === 'ar' ? 'الميزات الرئيسية (Features)' : 'Features'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800 dark:text-slate-200">
                {[
                  'Student Management',
                  'Group Management',
                  'Attendance Tracking',
                  'Lesson History',
                  'Payment Tracking',
                  'Parent Communication',
                  'Reports & Statistics',
                  'Calendar & Scheduling'
                ].map((feat, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2.5 font-bold shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Developer Contact Section */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                    {language === 'ar' ? 'تطوير وتصميم' : 'Developer'}
                  </p>
                  <p className="text-base font-black">Abdul-rahman Ghareeb</p>
                </div>
                <div className="p-2 bg-white/10 rounded-xl shrink-0">
                  <User className="w-5 h-5 text-indigo-300" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2 font-mono font-bold">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp: 01156435802</span>
                </div>

                <a
                  href="https://wa.me/201156435802"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1 shrink-0"
                >
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Application Version */}
            <div className="text-center pt-2 text-xs font-mono font-bold text-slate-400">
              AGS19 • Version 2.5.0
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CONFIRMATION MODAL FOR DATA CLEAR
      ========================================== */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-up text-center font-sans">
            <div className="w-12 h-12 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">{t('settings_clear_data')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('confirm')}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllData();
                  setShowClearConfirm(false);
                  setActiveCategory(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
