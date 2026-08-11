import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# We need to replace the entire categoryCards array.
# Here is the current array definition verbatim from earlier:

old_categories = """  const categoryCards = [
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
  ];"""

new_categories = """  const categoryCards = [
    {
      id: 'profile' as SettingsCategory,
      title: _t('الملف الشخصي للمعلم', 'Teacher Profile', 'Lehrerprofil'),
      description: _t('الاسم، البريد، ساعات العمل والعملة', 'Name, email, working hours & currency', 'Name, E-Mail, Arbeitszeiten & Währung'),
      icon: User,
      color: 'bg-primary/10 text-primary dark:text-primary border-primary-border dark:border-primary-border',
      badge: profile.displayName
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
      id: 'language' as SettingsCategory,
      title: _t('اللغة والمظهر', 'Language & Appearance', 'Sprache & Erscheinungsbild'),
      description: _t('لغة الواجهة ووضع المظهر الداكن/الفاتح', 'Interface language & light/dark theme', 'Oberflächensprache & Dunkelmodus'),
      icon: Globe,
      color: 'bg-primary/10 text-primary dark:text-primary border-primary-border/50 dark:border-primary-border/50',
      badge: languagesList.find(l => l.id === language)?.label
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
  ];"""

if old_categories in content:
    content = content.replace(old_categories, new_categories)
    with open('src/components/SettingsView.tsx', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Could not find the exact old categories string.")

