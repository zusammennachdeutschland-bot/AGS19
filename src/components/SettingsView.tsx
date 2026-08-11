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
import { NotificationSettingsSection } from './NotificationSettingsSection';

type SettingsCategory = 
  | 'language'
  | 'notifications'
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
    checkAndTriggerInspirationReminder, accentColor, setAccentColor,
    notificationSettings
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

  // Helper for inline translations
  const _t = (ar: string, en: string, de?: string) => {
    return language === 'ar' ? ar : language === 'de' ? (de || en) : en;
  };

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
      title: _t('اللغة والمظهر', 'Language & Appearance', 'Sprache & Erscheinungsbild'),
      description: _t('لغة الواجهة ووضع المظهر الداكن/الفاتح', 'Interface language & light/dark theme', 'Oberflächensprache & Dunkelmodus'),
      icon: Globe,
      color: 'bg-primary/10 text-primary dark:text-primary border-primary-border/50 dark:border-primary-border/50',
      badge: languagesList.find(l => l.id === language)?.label
    },
    {
      id: 'notifications' as SettingsCategory,
      title: _t('الإشعارات والتنبيهات', 'Notifications & Alerts', 'Benachrichtigungen & Alarme'),
      description: _t('التحكم الشامل بإشعارات الحصص، المواعيد، المستحقات والملخص اليومي', 'Full control over lesson reminders, start alerts, payments & daily summary', 'Umfassende Steuerung für Lektionserinnerungen, Zahlungen & Berichte'),
      icon: Bell,
      color: 'bg-primary/10 text-primary dark:text-primary border-primary-border dark:border-primary-border',
      badge: notificationSettings?.masterEnabled 
        ? (_t('مفعلة', 'Active')) 
        : (_t('معطلة', 'Disabled'))
    },
    {
      id: 'profile' as SettingsCategory,
      title: _t('الملف الشخصي للمعلم', 'Teacher Profile', 'Lehrerprofil'),
      description: _t('الاسم، البريد، ساعات العمل والعملة', 'Name, email, working hours & currency', 'Name, E-Mail, Arbeitszeiten & Währung'),
      icon: User,
      color: 'bg-primary/10 text-primary dark:text-primary border-primary-border dark:border-primary-border',
      badge: profile.displayName
    },
    {
      id: 'payment' as SettingsCategory,
      title: _t('بيانات التحويل والدفع', 'Payment Information', 'Zahlungsinformationen'),
      description: _t('رقم الهاتف، انستا باي، فودافون كاش والروابط', 'Phone, InstaPay, Vodafone Cash & links', 'Telefon, InstaPay, Vodafone Cash & Bank'),
      icon: DollarSign,
      color: 'bg-primary/10 text-primary dark:text-primary border-primary-border dark:border-primary-border',
      badge: phone || 'InstaPay'
    },
    {
      id: 'messages' as SettingsCategory,
      title: _t('قوالب رسائل أولياء الأمور', 'Parent Messages', 'Elternnachrichten Vorlagen'),
      description: _t('إدارة قوالب الواجبات، الحضور، الغياب والتقارير', 'Manage templates for homework, attendance & reports', 'Vorlagen für Hausaufgaben, Anwesenheit & Berichte'),
      icon: MessageSquare,
      color: 'bg-primary/10 text-primary dark:text-primary border-primary-border dark:border-primary-border',
      badge: _t('6 قوالب', '6 Templates')
    },
    {
      id: 'calendar' as SettingsCategory,
      title: _t('التقويم ومدة الحصص', 'Calendar & Lessons', 'Kalender & Lektionsdauer'),
      description: _t('تحديد مدة حصص كل مجموعة، أيام وساعات العمل والتنبيهات', 'Group lesson durations, working days & reminders', 'Dauer pro Gruppe, Arbeitstage & Erinnerungen'),
      icon: Calendar,
      color: 'bg-primary/10 text-primary dark:text-primary border-primary-border dark:border-primary-border',
      badge: `${groups.length} ${_t('مجموعات', 'Groups')}`
    },
    {
      id: 'inspiration' as SettingsCategory,
      title: _t('الإلهام والامتنان', 'Inspiration & Gratitude', 'Inspiration & Dankbarkeit'),
      description: _t('تذكيرات وأدعية للمعلم عن العلم والرزق والتعليم', 'Daily motivational & gratitude reminders', 'Tägliche Motivation & Dankbarkeits-Erinnerungen'),
      icon: Sparkles,
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/50',
      badge: inspirationSettings.frequency === 'disabled' 
        ? (_t('معطل', 'Disabled')) 
        : inspirationSettings.frequency === 'daily'
        ? (_t('تذكير يومي', 'Daily'))
        : inspirationSettings.frequency === 'before_first_lesson'
        ? (_t('قبل أول حصة', 'Before Lesson'))
        : (_t('عشوائي يومي', 'Random'))
    },
    {
      id: 'backup' as SettingsCategory,
      title: _t('النسخ الاحتياطي والبيانات', 'Backup & Restore', 'Sicherung & Daten'),
      description: _t('تنزيل واستعادة النسخة الاحتياطية وإعادة ضبط البيانات', 'Download, restore backups & reset data', 'Sicherung herunterladen, wiederherstellen & zurücksetzen'),
      icon: HardDrive,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200/50 dark:border-cyan-800/50',
      badge: 'Backup & Reset'
    },
    {
      id: 'about' as SettingsCategory,
      title: _t('حول التطبيق', 'About', 'Über die App'),
      description: _t('تفاصيل التطبيق، الميزات، المطور والتواصل', 'App details, features, developer & version', 'App-Info, Entwickler & Version'),
      icon: Info,
      color: 'bg-primary/10 text-primary dark:text-primary border-primary-border dark:border-primary-border',
      badge: 'v2.5.0'
    }
  ];

  // Helper Header Component for Subpages
  const renderSubPageHeader = (title: string, subtitle?: string) => (
    <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border/80 dark:border-surface-border">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className="p-2.5 rounded-xl bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-700 text-text-main transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
          title={_t('العودة للإعدادات', 'Back to Settings')}
        >
          <BackIcon className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-black text-text-main">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-text-muted mt-0.5">
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
            <h2 className="text-lg font-black text-text-main flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <span>{t('settings_title')}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {_t('اختر قسماً لإدارة إعدادات التطبيق', 'Select a section to manage application settings', 'Wählen Sie einen Bereich zur Verwaltung aus')}
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
                  className="bg-surface border border-surface-border/90 dark:border-surface-border hover:border-primary dark:hover:border-primary rounded-lg p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-start group"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                    <div className={`p-3 rounded-lg border shrink-0 ${cat.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-extrabold text-text-main truncate group-hover:text-primary dark:group-hover:text-primary transition-colors">
                          {cat.title}
                        </h3>
                      </div>
                      
                    </div>
                  </div>

                  <div className="p-2 text-text-muted/70 group-hover:text-primary dark:group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0">
                    <ForwardIcon className="w-5 h-5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ==========================================
          SUBPAGE 0: NOTIFICATION SETTINGS
      ========================================== */}
      {activeCategory === 'notifications' && (
        <NotificationSettingsSection onBack={() => setActiveCategory(null)} />
      )}

      {/* ==========================================
          SUBPAGE 1: LANGUAGE & APPEARANCE
      ========================================== */}
      {activeCategory === 'language' && (
        <div className="space-y-4 animate-scale-up">
          {renderSubPageHeader(
            _t('اللغة والمظهر', 'Language & Appearance', 'Sprache & Erscheinungsbild'),
            _t('اختر لغة التطبيق ومظهر الشاشة', 'Choose application language and theme mode')
          )}

          {/* Interface Language Card */}
          <div className="bg-surface border border-surface-border/90 dark:border-surface-border rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-primary" />
                <span>{t('settings_language')}</span>
              </h3>
            </div>

            <p className="text-xs text-text-muted">
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
                        ? 'bg-primary text-white border-primary-border shadow-sm'
                        : 'bg-surface-hover text-text-main border-surface-border dark:border-surface-border-soft hover:bg-slate-100 dark:hover:bg-slate-700'
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
            <div className="p-3 bg-primary-soft dark:bg-primary-soft border border-primary-border dark:border-primary-border rounded-lg flex items-start gap-2.5 text-primary dark:text-primary text-xs">
              <MessageSquare className="w-4 h-4 text-primary dark:text-primary shrink-0 mt-0.5" />
              <span>
                {_t('ملاحظة: اللسان واللغة المختارة تنطبق على واجهة التطبيق بالكامل. رسائل أولياء الأمور والتقارير الموجهة للأهالي تظل دائماً باللغة العربية.', 'Note: The selected language applies to the entire application interface. Parent messages and reports always remain in Arabic.')}
              </span>
            </div>
          </div>

          {/* Theme Section */}
          <div className="bg-surface border border-surface-border/90 dark:border-surface-border rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
                <span>{t('settings_theme')}</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`p-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  theme === 'light'
                    ? 'bg-primary text-white border-primary-border shadow-sm'
                    : 'bg-surface-hover text-text-main border-surface-border dark:border-surface-border-soft hover:bg-slate-100 dark:hover:bg-slate-700'
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
                    ? 'bg-primary text-white border-primary-border shadow-sm'
                    : 'bg-surface-hover text-text-main border-surface-border dark:border-surface-border-soft hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>{t('settings_theme_dark')}</span>
              </button>
            </div>
          </div>

          {/* Accent Color Section */}
          <div className="bg-surface border border-surface-border/90 dark:border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>
                  {_t('لون الواجهة (Accent Color)', 'Accent Color', 'Akzentfarbe')}
                </span>
              </h3>
            </div>

            <p className="text-xs text-text-muted">
              {_t('اختر لون التمييز المفضل لجميع الأزرار والأيقونات والتبويبات النشطة وعناصر الواجهة التفاعلية.', 'Select your preferred accent color for all buttons, icons, active tabs, and interactive controls.', 'Wählen Sie die bevorzugte Akzentfarbe für alle Schaltflächen, Symbole, Tabs und Steuerelemente.')}
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 pt-2 pb-2">
              {[
                { id: 'blue' as const, hex: '#3b82f6', color: 'blue' },
                { id: 'indigo' as const, hex: '#6366f1', color: 'indigo' },
                { id: 'violet' as const, hex: '#8b5cf6', color: 'violet' },
                { id: 'purple' as const, hex: '#a855f7', color: 'purple' },
                { id: 'fuchsia' as const, hex: '#d946ef', color: 'fuchsia' },
                { id: 'rose' as const, hex: '#f43f5e', color: 'rose' },
                { id: 'red' as const, hex: '#ef4444', color: 'red' },
                { id: 'orange' as const, hex: '#f97316', color: 'orange' },
                { id: 'amber' as const, hex: '#f59e0b', color: 'amber' },
                { id: 'green' as const, hex: '#22c55e', color: 'green' },
                { id: 'emerald' as const, hex: '#10b981', color: 'emerald' },
                { id: 'teal' as const, hex: '#14b8a6', color: 'teal' },
                { id: 'cyan' as const, hex: '#06b6d4', color: 'cyan' },
                { id: 'slate' as const, hex: '#64748b', color: 'slate' },
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
                      
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg relative transition-all duration-300 transform group-hover:scale-110 active:scale-95 ${
                        isSelected 
                          ? 'ring-4 ring-offset-2 ring-offset-surface scale-110' 
                          : 'opacity-80 hover:opacity-100 border border-white/20'
                      }`}
                      style={{ backgroundColor: item.hex, ...(isSelected ? { "--tw-ring-color": item.hex } : {}) } as React.CSSProperties}
                    >
                      {isSelected && (
                        <Check className="w-5 h-5 text-white stroke-[3.5px] drop-shadow-sm animate-scale-up" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Accent Preview */}
            <div className="mt-4 p-4 rounded-2xl border border-primary-border/60 bg-primary-soft/30 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <h4 className="text-[10px] uppercase font-bold text-text-muted relative z-10">Live Preview</h4>
              <div className="flex gap-3 relative z-10">
                <button className="flex-1 bg-primary text-white py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover active:scale-95">
                  Primary Button
                </button>
                <button className="flex-1 bg-primary-soft text-primary py-2 rounded-xl text-xs font-bold transition-all hover:bg-primary/20 active:scale-95">
                  Secondary
                </button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-surface-border relative z-10 shadow-sm">
                <div className="p-2 bg-primary-soft rounded-lg text-primary shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-main truncate">Premium Widget</p>
                  <p className="text-[10px] text-text-muted truncate">Adapts to your accent color</p>
                </div>
                <div className="ml-auto shrink-0">
                   <div className="w-8 h-4 rounded-full bg-primary relative cursor-pointer">
                     <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                   </div>
                </div>
              </div>
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
            _t('الملف الشخصي للمعلم', 'Teacher Profile'),
            _t('إدارة البيانات الشخصية وساعات العمل والعملة', 'Manage personal details, working hours & currency')
          )}

          <div className="bg-surface border border-surface-border/90 dark:border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
            {/* Avatar Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-surface-border">
              <div className="relative shrink-0 group">
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-16 h-16 rounded-lg object-cover ring-2 ring-primary/30 shadow-md"
                />
                <label 
                  className="absolute -bottom-1 -right-1 p-1.5 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-md cursor-pointer transition-transform hover:scale-110 flex items-center justify-center active:scale-95 hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" onChange={handleTeacherAvatarUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-1 flex-1">
                <p className="text-sm font-extrabold text-text-main">{displayName || t('settings_name')}</p>
                <p className="text-xs text-slate-500 font-mono">{email || '-'}</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[11px] font-bold text-text-muted bg-surface-hover px-2.5 py-0.5 rounded-md">
                    {t('settings_currency')}: {currency}
                  </span>
                  <span className="text-[11px] font-bold text-primary dark:text-primary bg-primary-soft dark:bg-primary-soft px-2.5 py-0.5 rounded-md">
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
                className="text-xs font-bold px-4 py-2 bg-primary-soft text-primary rounded-xl hover:bg-primary-soft dark:bg-primary-soft/30 dark:text-primary dark:hover:bg-primary-soft transition-colors active:scale-95 transition-all"
              >
                {isEditingProfile ? (_t('إلغاء', 'Cancel')) : (_t('تعديل البيانات', 'Edit Profile'))}
              </button>
            </div>
            
            {/* Profile Form */}
            <form onSubmit={(e) => { handleSaveProfile(e); setIsEditingProfile(false); }} className="space-y-4">
              <fieldset disabled={!isEditingProfile} className={!isEditingProfile ? 'opacity-70 pointer-events-none' : ''}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">{t('settings_name')} *</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">{t('settings_email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">{t('settings_currency')}</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="EGP">EGP (ج.م)</option>
                    <option value="€">EUR (€)</option>
                    <option value="$">USD ($)</option>
                    <option value="SAR">SAR (ر.س)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">{t('settings_start_time')}</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">{t('settings_end_time')}</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {savedSuccessToast && (
                <div className="bg-primary text-white text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2 animate-scale-up">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('settings_save_success')}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-black text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 hover:shadow-lg hover:shadow-primary/30"
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
            _t('بيانات التحويل والدفع', 'Payment Information'),
            _t('البيانات المستخدمة عند إرسال مطالبات الرسوم لأولياء الأمور', 'Information used when sending payment requests to parents')
          )}

          <div className="bg-surface border border-surface-border/90 dark:border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
            <div className="p-3 bg-primary-soft dark:bg-primary-soft border border-primary-border dark:border-primary-border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-primary dark:text-primary">
                <DollarSign className="w-4 h-4 text-primary" />
                <span>{_t('بيانات الدفع الإلكتروني المباشر', 'Direct Electronic Payment Profile')}</span>
              </div>

              <button
                type="button"
                onClick={handleSharePaymentInfo}
                className="bg-primary hover:bg-primary-hover text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedPaymentDetails ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPaymentDetails ? t('copied') : (_t('نسخ بيانات التحويل', 'Copy Payment Info'))}</span>
              </button>
            </div>

            <form onSubmit={handleSavePaymentInfo} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-text-main">{t('settings_phone')}</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-main">{t('settings_instapay')}</label>
                  <input
                    type="text"
                    value={instaPayId}
                    onChange={(e) => setInstaPayId(e.target.value)}
                    placeholder="name@instapay"
                    className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-main">{t('settings_vodafone')}</label>
                  <input
                    type="text"
                    value={vodafoneCashNumber}
                    onChange={(e) => setVodafoneCashNumber(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-main">{t('settings_bank')}</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="EG1234567890..."
                    className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-main">{t('settings_payment_link')}</label>
                  <input
                    type="text"
                    value={paymentLink}
                    onChange={(e) => setPaymentLink(e.target.value)}
                    placeholder="https://pay.link/..."
                    className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-main">WhatsApp</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+201012345678"
                    className="w-full px-3.5 py-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {savedSuccessToast && (
                <div className="bg-primary text-white text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2 animate-scale-up">
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
                  <span>{_t('نسخ بيانات التحويل', 'Copy Payment Info')}</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
            _t('قوالب رسائل أولياء الأمور', 'Parent Message Templates'),
            _t('تخصيص الرسائل التلقائية للواجبات، الحضور، الغياب والتقارير', 'Manage templates for homework, attendance, absence, payment & reports')
          )}

          <div className="bg-surface border border-surface-border/90 dark:border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
            {/* Template Categories Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'homework', label: _t('الواجبات', 'Homework'), icon: BookOpen },
                { id: 'attendance', label: _t('الحضور', 'Attendance'), icon: CheckSquare },
                { id: 'absence', label: _t('الغياب', 'Absence'), icon: XCircle },
                { id: 'payment', label: _t('المدفوعات', 'Payments'), icon: DollarSign },
                { id: 'exam', label: _t('الاختبارات', 'Exam Reports'), icon: Award },
                { id: 'summary', label: _t('ملخص الدرس', 'Lesson Summary'), icon: FileText },
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
                        ? 'bg-primary text-white shadow-2xs'
                        : 'bg-surface-hover text-text-main hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Template Editor */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-surface-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-primary dark:text-primary flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span>
                    {_t('نص قالب الرسالة (بالعربية)', 'Message Template Text (Arabic)')}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(messageTemplates[activeMessageTab] || '');
                    setCopiedTemplateText(true);
                    setTimeout(() => setCopiedTemplateText(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-surface-hover hover:bg-slate-200 text-text-main text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedTemplateText ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTemplateText ? t('copied') : (_t('نسخ النص', 'Copy Text'))}</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={messageTemplates[activeMessageTab] || ''}
                onChange={(e) => setMessageTemplates(prev => ({ ...prev, [activeMessageTab]: e.target.value }))}
                className="w-full p-3.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-lg text-xs font-semibold leading-relaxed focus:ring-2 focus:ring-primary outline-none font-sans"
                dir="rtl"
              />

              {/* Dynamic Variables Legend */}
              <div className="p-3 bg-primary-soft dark:bg-primary-soft border border-primary-border dark:border-primary-border rounded-lg text-[11px] text-primary dark:text-primary space-y-1">
                <p className="font-bold">{_t('المتغيرات المتاحة للاستخدام تلقائياً:', 'Available Dynamic Placeholders:')}</p>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px] pt-1">
                  <span className="bg-surface px-2 py-0.5 rounded border border-primary-border dark:border-primary-border font-bold">{'{student_name}'}</span>
                  <span className="bg-surface px-2 py-0.5 rounded border border-primary-border dark:border-primary-border font-bold">{'{group_name}'}</span>
                  <span className="bg-surface px-2 py-0.5 rounded border border-primary-border dark:border-primary-border font-bold">{'{date}'}</span>
                  <span className="bg-surface px-2 py-0.5 rounded border border-primary-border dark:border-primary-border font-bold">{'{amount}'}</span>
                  <span className="bg-surface px-2 py-0.5 rounded border border-primary-border dark:border-primary-border font-bold">{'{teacher_name}'}</span>
                </div>
              </div>

              {savedSuccessToast && (
                <div className="bg-primary text-white text-xs font-bold p-2.5 rounded-xl flex items-center justify-center gap-2 animate-scale-up">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('settings_save_success')}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMessageTemplates(prev => ({ ...prev, [activeMessageTab]: DEFAULT_PARENT_TEMPLATES[activeMessageTab] }))}
                  className="px-4 py-2.5 bg-surface-hover hover:bg-slate-200 text-text-main font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  {_t('استعادة الافتراضي', 'Reset to Default')}
                </button>

                <button
                  type="button"
                  onClick={handleSaveMessageTemplates}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{_t('حفظ القوالب', 'Save Templates')}</span>
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
            _t('التقويم ومدة الحصص', 'Calendar & Lessons'),
            _t('تحديد مدة حصص كل مجموعة، أيام وساعات العمل وتنبيهات التقويم', 'Group lesson durations, working days & schedule alerts')
          )}

          {/* Group Lesson Durations Card */}
          <div className="bg-surface border border-surface-border/90 dark:border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primary flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{_t('مدة الحصص حسب المجموعات', 'Lesson Duration per Group')}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {_t('مدة الحصة الافتراضية 60 دقيقة. يمكنك تخصيص مدة أطول لكل مجموعة لتعكس في التقويم', 'Default duration is 60 mins. Customize specific group durations below (e.g. 60, 90, 120 mins)')}
                </p>
              </div>
            </div>

            {/* Groups Durations Table / List */}
            {groups.length === 0 ? (
              <div className="p-4 bg-surface-hover rounded-lg text-xs text-slate-500 text-center font-semibold">
                {_t('لا توجد مجموعات حالياً. أضف مجموعة أولاً.', 'No groups available yet. Create a group first.')}
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {groups.map(grp => (
                  <div key={grp.id} className="p-3 bg-surface-hover/80 rounded-lg flex items-center justify-between gap-3 border border-surface-border/60 dark:border-surface-border-soft">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-text-main truncate">{grp.name}</p>
                      <p className="text-[11px] text-slate-500">{grp.grade} • {grp.type === 'online' ? 'Online' : 'Offline'}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-bold text-slate-500">{_t('المدة:', 'Duration:')}</span>
                      <select
                        value={grp.lessonDurationMinutes || 60}
                        onChange={(e) => updateGroup(grp.id, { lessonDurationMinutes: Number(e.target.value) })}
                        className="px-3 py-1.5 bg-surface border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-bold text-primary dark:text-primary focus:ring-2 focus:ring-primary outline-none cursor-pointer"
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
          <div className="bg-surface border border-surface-border/90 dark:border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{t('settings_working_hours')}</span>
            </h3>

            <form onSubmit={handleSaveCalendarSettings} className="space-y-4">
              {/* Working Days Checkboxes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-main">
                  {_t('أيام العمل الأسبوعية:', 'Working Days:')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { num: 6, label: _t('السبت', 'Sa') },
                    { num: 7, label: _t('الأحد', 'So') },
                    { num: 1, label: _t('الإثنين', 'Mo') },
                    { num: 2, label: _t('الثلاثاء', 'Di') },
                    { num: 3, label: _t('الأربعاء', 'Mi') },
                    { num: 4, label: _t('الخميس', 'Do') },
                    { num: 5, label: _t('الجمعة', 'Fr') },
                  ].map(day => {
                    const isSelected = workingDays.includes(day.num);
                    return (
                      <button
                        key={day.num}
                        type="button"
                        onClick={() => toggleWorkingDay(day.num)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white shadow-2xs'
                            : 'bg-surface-hover text-text-muted border border-surface-border dark:border-surface-border-soft'
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
                  <label className="text-xs font-bold text-text-main">{t('settings_start_time')}</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main">{t('settings_end_time')}</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Reminder Settings */}
              <div className="p-3.5 bg-primary-soft dark:bg-primary-soft/40 border border-primary-border/60 dark:border-primary-border/60 rounded-lg space-y-2">
                <h4 className="text-xs font-bold text-primary-hover dark:text-primary/70 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-primary" />
                  <span>{_t('إعدادات التنبيهات والتذكير', 'Reminder Settings')}</span>
                </h4>

                <label className="flex items-center justify-between p-2 bg-surface rounded-xl cursor-pointer text-xs font-semibold">
                  <span>{_t('تنبيهات الحصص المباشرة (قبل 30 دقيقة)', 'In-App Lesson Alerts (Within 30 mins)')}</span>
                  <input 
                    type="checkbox" 
                    checked={enableLessonAlerts} 
                    onChange={(e) => setEnableLessonAlerts(e.target.checked)} 
                    className="w-4 h-4 rounded text-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-2 bg-surface rounded-xl cursor-pointer text-xs font-semibold">
                  <span>{_t('إشعارات المتصفح والسطح', 'Browser Push Notifications')}</span>
                  <input 
                    type="checkbox" 
                    checked={enableBrowserPush} 
                    onChange={(e) => setEnableBrowserPush(e.target.checked)} 
                    className="w-4 h-4 rounded text-primary"
                  />
                </label>
              </div>

              {savedSuccessToast && (
                <div className="bg-primary text-white text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2 animate-scale-up">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('settings_save_success')}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 hover:shadow-lg hover:shadow-primary/30"
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
        <div className="space-y-4 animate-scale-up ">
          {renderSubPageHeader(
            _t('الإلهام والامتنان', 'Inspiration & Gratitude', 'Inspiration & Dankbarkeit'),
            _t('تذكيرات وأدعية للمعلم', 'Teacher reminders & motivation', 'Motivation & Dankbarkeits-Erinnerungen')
          )}

          {!isManagingMessages ? (
            <div className="space-y-4">
              <div className="bg-surface border border-surface-border/90 dark:border-surface-border rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span>{_t('إعدادات الظهور', 'Display Settings')}</span>
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-main mb-1.5">
                      {_t('تكرار التذكير', 'Frequency')}
                    </label>
                    <select
                      value={inspirationSettings.frequency}
                      onChange={(e) => updateInspirationSettings({ frequency: e.target.value as any })}
                      className="w-full p-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl focus:ring-2 focus:ring-orange-500 font-medium text-sm transition-all"
                    >
                      <option value="disabled">{_t('معطل (عدم الإظهار)', 'Disabled')}</option>
                      <option value="daily">{_t('مرة واحدة يومياً', 'Once Daily')}</option>
                      <option value="before_first_lesson">{_t('قبل الحصة الأولى في اليوم', 'Before First Lesson')}</option>
                      <option value="random_daily">{_t('عشوائي خلال اليوم', 'Randomly During Day')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-main mb-1.5">
                      {_t('طريقة العرض', 'Display Method')}
                    </label>
                    <select
                      value={inspirationSettings.displayMethod}
                      onChange={(e) => updateInspirationSettings({ displayMethod: e.target.value as any })}
                      className="w-full p-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl focus:ring-2 focus:ring-orange-500 font-medium text-sm transition-all"
                      disabled={inspirationSettings.frequency === 'disabled'}
                    >
                      <option value="in_app">{_t('داخل التطبيق فقط (بطاقة)', 'In-App Only (Card)')}</option>
                      <option value="notification">{_t('إشعار نظام فقط', 'System Notification Only')}</option>
                      <option value="both">{_t('داخل التطبيق + إشعار', 'In-App & Notification')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-main mb-1.5">
                      {_t('مصدر الرسائل', 'Message Source')}
                    </label>
                    <select
                      value={inspirationSettings.source}
                      onChange={(e) => updateInspirationSettings({ source: e.target.value as any })}
                      className="w-full p-2.5 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl focus:ring-2 focus:ring-orange-500 font-medium text-sm transition-all"
                      disabled={inspirationSettings.frequency === 'disabled'}
                    >
                      <option value="all">{_t('جميع الرسائل', 'All Messages')}</option>
                      <option value="favorites_only">{_t('المفضلة فقط', 'Favorites Only')}</option>
                    </select>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => checkAndTriggerInspirationReminder('manual')}
                  className="w-full p-3 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-200 dark:hover:bg-primary-soft transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{_t('تجربة التذكير الآن', 'Test Reminder Now')}</span>
                </button>
              </div>

              <div className="bg-surface border border-surface-border/90 dark:border-surface-border rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-primary dark:text-primary" />
                    <span>{_t('الرسائل والأدعية', 'Messages')}</span>
                  </h3>
                  <div className="text-xs font-bold bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary px-2 py-1 rounded-lg">
                    {inspirationMessages.length} {_t('رسالة', 'Messages')}
                  </div>
                </div>

                <p className="text-xs text-text-muted mb-4 leading-relaxed">
                  {_t('إدارة العبارات التحفيزية والأدعية التي تظهر لك. يمكنك إضافة رسائلك الخاصة أو تفضيل الرسائل التي تحبها.', 'Manage the motivational quotes and prayers. Add your own custom messages or favorite the ones you like.')}
                </p>

                <button
                  onClick={() => setIsManagingMessages(true)}
                  className="w-full p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-main font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  <span>{_t('إدارة الرسائل', 'Manage Messages')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-surface-border/90 dark:border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => {
                    setIsManagingMessages(false);
                    setEditingMsg(null);
                    setDeletingMsgId(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{_t('عودة', 'Back')}</span>
                </button>
                <div className="flex gap-1 bg-surface-hover p-1 rounded-lg">
                  <button
                    onClick={() => setMsgFilterSource('all')}
                    className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-md transition-colors ${msgFilterSource === 'all' ? 'bg-surface dark:bg-slate-700 shadow-sm text-primary dark:text-primary' : 'text-slate-500'}`}
                  >
                    {_t('الكل', 'All')}
                  </button>
                  <button
                    onClick={() => setMsgFilterSource('favorites')}
                    className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-md transition-colors flex items-center gap-1 ${msgFilterSource === 'favorites' ? 'bg-surface dark:bg-slate-700 shadow-sm text-primary dark:text-primary' : 'text-slate-500'}`}
                  >
                    <Star className={`w-3 h-3 ${msgFilterSource === 'favorites' ? 'fill-current' : ''}`} />
                    {_t('المفضلة', 'Favorites')}
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
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{_t('إضافة رسالة', 'Add Message')}</span>
                </button>
                
                <button
                  onClick={() => setShowRestoreDefaultsConfirm(true)}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-main font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title={_t('استعادة الرسائل الافتراضية', 'Restore Default Messages')}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Message List */}
              <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto pr-1 pb-4">
                {inspirationMessages
                  .filter(m => msgFilterSource === 'all' || m.isFavorite)
                  .map(msg => (
                  <div key={msg.id} className="p-3.5 bg-surface-hover/50 border border-surface-border/60 dark:border-surface-border-soft rounded-lg flex flex-col gap-3">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 dir-rtl text-right">
                      {msg.text}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-surface-border dark:border-surface-border-soft">
                      <div className="flex items-center gap-2">
                        {msg.isCustom && (
                          <span className="text-[9px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary">
                            {_t('مخصص', 'Custom')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavoriteInspirationMessage(msg.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${msg.isFavorite ? 'text-primary bg-primary-soft dark:bg-primary-soft' : 'text-text-muted/70 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        >
                          <Star className={`w-4 h-4 ${msg.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingMsg({ id: msg.id, text: msg.text });
                            setIsAddMsgModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-text-muted/70 hover:text-primary hover:bg-primary-soft dark:hover:bg-primary-soft transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingMsgId(msg.id)}
                          className="p-1.5 rounded-lg text-text-muted/70 hover:text-primary hover:bg-primary-soft dark:hover:bg-primary-soft transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Delete Confirmation Inline */}
                    {deletingMsgId === msg.id && (
                      <div className="mt-2 p-3 bg-primary-soft dark:bg-primary-soft border border-primary-border dark:border-primary-border rounded-xl flex items-center justify-between animate-in slide-in-from-top-2">
                        <span className="text-xs font-bold text-primary dark:text-primary">
                          {_t('هل أنت متأكد من الحذف؟', 'Are you sure?')}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDeletingMsgId(null)}
                            className="px-3 py-1.5 text-xs font-bold text-text-muted hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            {_t('إلغاء', 'Cancel')}
                          </button>
                          <button
                            onClick={() => {
                              deleteInspirationMessage(msg.id);
                              setDeletingMsgId(null);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                          >
                            {t('delete')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {inspirationMessages.filter(m => msgFilterSource === 'all' || m.isFavorite).length === 0 && (
                  <div className="text-center py-5 text-text-muted/70">
                    <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{_t('لا توجد رسائل', 'No messages found')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message Edit/Add Modal */}
      {isAddMsgModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in p-0 sm:p-4 pb-0">
          <div className="bg-surface rounded-t-[28px] sm:rounded-xl pb-safe-bottom sm:pb-0 mb-0 w-full max-w-sm shadow-xl p-5 space-y-4 animate-in zoom-in-95">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
            <h3 className="text-sm font-black text-text-main">
              {editingMsg 
                ? (_t('تعديل الرسالة', 'Edit Message'))
                : (_t('إضافة رسالة جديدة', 'Add New Message'))}
            </h3>
            <textarea
              value={editingMsg ? editingMsg.text : newMsgText}
              onChange={(e) => editingMsg ? setEditingMsg({ ...editingMsg, text: e.target.value }) : setNewMsgText(e.target.value)}
              placeholder={_t('اكتب رسالتك أو دعاءك هنا...', 'Write your message...')}
              className="w-full p-3 bg-surface-hover border border-surface-border dark:border-surface-border-soft rounded-xl focus:ring-2 focus:ring-primary font-medium text-sm min-h-[100px] resize-none dir-rtl"
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
                {_t('إلغاء', 'Cancel')}
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
                className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Defaults Confirm Modal */}
      {showRestoreDefaultsConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in p-0 sm:p-4 pb-0">
          <div className="bg-surface rounded-t-[28px] sm:rounded-xl pb-safe-bottom sm:pb-0 mb-0 w-full max-w-sm shadow-xl p-5 space-y-4 animate-in zoom-in-95">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
            <div className="w-12 h-12 bg-primary-soft dark:bg-primary-soft text-primary rounded-lg flex items-center justify-center mb-2 mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-black text-text-main mb-2">
                {_t('استعادة الرسائل الافتراضية', 'Restore Defaults')}
              </h3>
              <p className="text-xs text-text-muted">
                {_t('سيتم استعادة الرسائل والأدعية الافتراضية. رسائلك المخصصة لن يتم حذفها.', 'Default messages will be restored. Your custom messages will not be deleted.')}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowRestoreDefaultsConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors"
              >
                {_t('إلغاء', 'Cancel')}
              </button>
              <button
                onClick={() => {
                  restoreDefaultInspirationMessages();
                  setShowRestoreDefaultsConfirm(false);
                }}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs transition-colors"
              >
                {_t('استعادة', 'Restore')}
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
            _t('النسخ الاحتياطي وإدارة البيانات', 'Backup & Data Management'),
            _t('تنزيل واستعادة نسخة احتياطية من البيانات أو مسح البيانات', 'Download, restore backup or reset application data')
          )}

          {/* Backup & Restore Section */}
          <div className="bg-surface border border-surface-border/90 dark:border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-primary" />
                <span>{_t('النسخ الاحتياطي والاستعادة', 'Backup & Restore')}</span>
              </h3>
            </div>

            <p className="text-xs text-text-muted">
              {_t('احتفظ بنسخة من جميع الطلاب والمجموعات والحصص والمدفوعات آمنة محلياً (ملف JSON) أو استعدها في أي وقت.', 'Keep a secure local JSON backup of all students, groups, lessons, and payment records, or restore at any time.')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={exportBackupFile}
                className="bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{_t('تنزيل / تصدير النسخة الاحتياطية (JSON)', 'Download / Export Backup (JSON)')}</span>
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
                  <Upload className="w-4 h-4 text-primary" />
                  <span>{_t('استعادة / استيراد من ملف (JSON)', 'Restore / Import Backup (JSON)')}</span>
                </button>
              </div>
            </div>

            {restoreStatusMsg && (
              <div className="bg-primary-soft dark:bg-primary-soft border border-primary-border dark:border-primary-border text-primary dark:text-primary text-xs font-bold p-3 rounded-xl flex items-center gap-2 animate-scale-up">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>{restoreStatusMsg}</span>
              </div>
            )}
          </div>

          {/* Danger Zone Section inside Backup */}
          <div className="bg-primary-soft dark:bg-primary-soft border-2 border-primary-border dark:border-primary-border rounded-xl p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary text-white rounded-lg shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-primary dark:text-primary">
                  {_t('منطقة الخطر (إعادة ضبط البيانات)', 'Danger Zone (Data Reset)')}
                </h3>
                <p className="text-xs text-primary dark:text-primary mt-0.5 leading-relaxed">
                  {_t('إجراءات حساسة: سيؤدي هذا إلى حذف كافة الطلاب والمجموعات والحصص والمدفوعات نهائياً من هذا الجهاز.', 'Sensitive actions: Resetting data will permanently delete all students, groups, lessons, and payment records.')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-black text-xs py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            _t('حول التطبيق', 'About'),
            _t('معلومات التطبيق والميزات وتفاصيل التواصل مع المطور', 'Application details, features & developer contacts')
          )}

          <div className="bg-surface border border-surface-border/90 dark:border-surface-border rounded-xl p-4 shadow-2xs space-y-4 text-center sm:text-start">
            {/* App Hero Branding Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-slate-100 dark:border-surface-border">
              <img
                src="/logo.svg"
                alt="AGS19 Logo"
                className="w-16 h-16 rounded-lg object-contain bg-surface p-1 shadow-md border border-surface-border/80 dark:border-surface-border shrink-0"
              />
              <div>
                <h1 className="text-xl font-black text-text-main">
                  AGS19
                </h1>
                <p className="text-xs text-primary dark:text-primary font-extrabold mt-0.5">
                  {_t('نظام إداري متكامل لمعلمي اللغة الألمانية والدروس الخاصة', 'German Teacher Management System')}
                </p>
              </div>
            </div>

            {/* App Description */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-muted/70">
                {_t('الوصف', 'Description')}
              </h3>
              <p className="text-xs sm:text-sm text-text-main font-medium leading-relaxed bg-surface-hover/60 p-4 rounded-lg border border-surface-border/60 dark:border-surface-border-soft">
                AGS19 helps private teachers manage students, groups, lessons, attendance, payments, reports, parent communication, and scheduling from one place.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-muted/70">
                {_t('الميزات الرئيسية (Features)', 'Features')}
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
                  <div key={idx} className="p-3 bg-surface dark:bg-slate-800/80 rounded-xl border border-surface-border/80 dark:border-surface-border-soft/80 flex items-center gap-2.5 font-bold shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Developer Contact Section */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-primary-hover text-white rounded-xl space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {_t('تطوير وتصميم', 'Developer')}
                  </p>
                  <p className="text-base font-black">Abdul-rahman Ghareeb</p>
                </div>
                <div className="p-2 bg-surface/10 rounded-xl shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2 font-mono font-bold">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>WhatsApp: 01156435802</span>
                </div>

                <a
                  href="https://wa.me/201156435802"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-primary hover:bg-primary text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1 shrink-0"
                >
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Application Version */}
            <div className="text-center pt-2 text-xs font-mono font-bold text-text-muted/70">
              AGS19 • Version 2.5.0
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CONFIRMATION MODAL FOR DATA CLEAR
      ========================================== */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 pb-0">
          <div className="bg-surface rounded-t-[28px] sm:rounded-xl pb-safe-bottom sm:pb-0 mb-0 max-w-sm w-full p-4 border border-surface-border shadow-2xl space-y-4 animate-scale-up text-center font-sans">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
            <div className="w-12 h-12 rounded-lg bg-primary-soft dark:bg-primary-soft text-primary flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-text-main">{t('settings_clear_data')}</h3>
              <p className="text-xs text-text-muted mt-1">
                {t('confirm')}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 bg-surface-hover text-text-main rounded-xl font-bold text-xs cursor-pointer"
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
                className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
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
