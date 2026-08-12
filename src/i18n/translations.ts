import { AppLanguage } from '../types';

export type TranslationKey = 
  | 'nav_home'
  | 'nav_schedule'
  | 'nav_students'
  | 'nav_history'
  | 'nav_payments'
  | 'nav_reports'
  | 'nav_settings'
  | 'nav_quickLesson'
  | 'nav_more'
  | 'nav_widgets'
  | 'goodMorning'
  | 'goodAfternoon'
  | 'goodEvening'
  | 'greeting'
  | 'refreshData'
  | 'dataRefreshed'
  | 'upcomingLessonAlert'
  | 'open'
  | 'save'
  | 'cancel'
  | 'delete'
  | 'edit'
  | 'add'
  | 'search'
  | 'all'
  | 'filter'
  | 'status'
  | 'date'
  | 'time'
  | 'notes'
  | 'confirm'
  | 'back'
  | 'close'
  | 'actions'
  | 'copied'
  | 'yes'
  | 'no'
  | 'archive'
  | 'status_completed'
  | 'status_cancelled'
  | 'status_upcoming'
  | 'status_in_progress'
  | 'status_pending'
  | 'status_scheduled'
  | 'att_present'
  | 'att_absent'
  | 'att_late'
  | 'hw_assigned'
  | 'hw_completed'
  | 'hw_not_completed'
  | 'settings_title'
  | 'settings_sub'
  | 'settings_language'
  | 'settings_lang_desc'
  | 'settings_parent_comm_notice'
  | 'settings_theme'
  | 'settings_theme_light'
  | 'settings_theme_dark'
  | 'settings_profile'
  | 'settings_name'
  | 'settings_email'
  | 'settings_currency'
  | 'settings_working_hours'
  | 'settings_start_time'
  | 'settings_end_time'
  | 'settings_payment_details'
  | 'settings_phone'
  | 'settings_instapay'
  | 'settings_vodafone'
  | 'settings_bank'
  | 'settings_payment_link'
  | 'settings_share_payment'
  | 'settings_backup'
  | 'settings_download_backup'
  | 'settings_restore_backup'
  | 'settings_clear_data'
  | 'settings_save_success'
  | 'schedule_title'
  | 'schedule_today'
  | 'schedule_week'
  | 'schedule_month'
  | 'schedule_add_lesson'
  | 'schedule_start_now'
  | 'schedule_no_lessons'
  | 'schedule_conflict'
  | 'schedule_working_hours'
  | 'schedule_refresh'
  | 'schedule_ical'
  | 'schedule_no_conflicts'
  | 'schedule_day_view'
  | 'schedule_week_view'
  | 'schedule_month_view'
  | 'schedule_reschedule'
  | 'schedule_new_date'
  | 'schedule_new_time'
  | 'schedule_conflict_alert'
  | 'schedule_reschedule_success'
  | 'schedule_weekly'
  | 'schedule_no_lessons_day'
  | 'schedule_add_lesson_for'
  | 'lesson_control_title'
  | 'lesson_timer'
  | 'lesson_duration'
  | 'lesson_start'
  | 'lesson_resume'
  | 'lesson_pause'
  | 'lesson_end'
  | 'lesson_cancel'
  | 'lesson_report_form'
  | 'lesson_show_timer'
  | 'lesson_attendance'
  | 'lesson_homework'
  | 'lesson_teacher_notes'
  | 'lesson_parent_report_btn'
  | 'lesson_save_report'
  | 'students_title'
  | 'students_tab_all'
  | 'students_tab_groups'
  | 'students_add_student'
  | 'students_add_group'
  | 'students_search_placeholder'
  | 'students_search_group_placeholder'
  | 'students_group_name'
  | 'students_student_name'
  | 'students_grade'
  | 'students_parent_phone'
  | 'students_student_phone'
  | 'students_package'
  | 'students_no_students'
  | 'students_no_groups'
  | 'students_group'
  | 'students_individual'
  | 'students_active'
  | 'students_archived'
  | 'students_lessons_count'
  | 'students_phone'
  | 'students_parent_phone_label'
  | 'students_details'
  | 'students_all_grades'
  | 'students_no_students_found'
  | 'students_all_days'
  | 'students_today'
  | 'students_archive_info'
  | 'students_archived_students_title'
  | 'students_no_archived_students'
  | 'students_archived_groups_title'
  | 'students_no_archived_groups'
  | 'students_restore'
  | 'students_reset_filters'
  | 'history_title'
  | 'history_header_sub'
  | 'history_total_lessons'
  | 'history_completed'
  | 'history_cancelled_missed'
  | 'history_total_hours'
  | 'history_filter_all'
  | 'history_filter_completed'
  | 'history_filter_cancelled'
  | 'history_filter_pending'
  | 'history_search_placeholder'
  | 'history_search'
  | 'history_export'
  | 'history_filter_entity_label'
  | 'history_all_entities'
  | 'history_groups_category'
  | 'history_students_category'
  | 'history_filter_period_label'
  | 'history_period_all'
  | 'history_period_today'
  | 'history_period_this_week'
  | 'history_period_this_month'
  | 'history_results_count'
  | 'history_reset_filters'
  | 'payments_title'
  | 'payments_total_collected'
  | 'payments_total_pending'
  | 'payments_record'
  | 'payments_send_reminder'
  | 'payments_paid'
  | 'payments_unpaid'
  | 'payments_partial'
  | 'payments_collected'
  | 'payments_pending'
  | 'payments_plan'
  | 'payments_history'
  | 'payments_method'
  | 'payments_due_date'
  | 'payments_daily'
  | 'payments_weekly'
  | 'payments_monthly'
  | 'payments_total_pending_label'
  | 'payments_open_tab'
  | 'payments_history_tab'
  | 'payments_all_groups'
  | 'payments_no_due_title'
  | 'payments_no_due_desc'
  | 'payments_completed_dates_label'
  | 'payments_pending_expectation'
  | 'payments_amount_due'
  | 'payments_mark_paid'
  | 'payments_mark_not_yet'
  | 'payments_notify_parent_wa'
  | 'payments_no_history'
  | 'payments_history_auto_archive'
  | 'payments_paid_on'
  | 'payments_notice_title'
  | 'payments_copy_text'
  | 'payments_copied'
  | 'payments_open_whatsapp'
  | 'payments_daily_gain_title'
  | 'payments_weekly_gain_title'
  | 'payments_monthly_gain_title'
  | 'payments_gain_summary_sub'
  | 'payments_total_gains'
  | 'payments_paid_cycles'
  | 'payments_details_header'
  | 'payments_no_paid_period'
  | 'payments_monthly_gain'
  | 'payments_weekly_gain'
  | 'payments_daily_gain'
  | 'payments_weekly_summary'
  | 'payments_pending_tag'
  | 'payments_parent_notice'
  | 'payments_paid_btn'
  | 'payments_not_yet_btn'
  | 'payments_no_due_sub'
  | 'payments_no_cycles_period'
  | 'payments_monthly_summary'
  | 'payments_history_sub'
  | 'payments_due_tab'
  | 'payments_details_heading'
  | 'payments_daily_summary'
  | 'payments_completed_cycle'
  | 'payments_overdue'
  | 'payments_expected'
  | 'payments_revenue_overview'
  | 'reports_title'
  | 'reports_header_sub'
  | 'reports_print_pdf'
  | 'reports_collected_revenue'
  | 'reports_from_paid_sessions'
  | 'reports_unpaid_amount'
  | 'reports_pending_payments'
  | 'reports_sessions_completed'
  | 'reports_total_conducted'
  | 'reports_unpaid_last_sessions'
  | 'reports_urgent_collect'
  | 'reports_all_good'
  | 'reports_weekly_protocol'
  | 'reports_weekly_protocol_sub'
  | 'reports_filter_all'
  | 'reports_filter_this_week'
  | 'reports_filter_paid'
  | 'reports_filter_unpaid'
  | 'reports_no_sessions_filter'
  | 'reports_weekly_chart_title'
  | 'reports_attendance_overview_title'
  | 'reports_total_lessons'
  | 'reports_active_students'
  | 'reports_attendance_rate'
  | 'reports_lessons_completed'
  | 'reports_revenue'
  | 'reports_students'
  | 'reports_export_pdf'
  | 'daily_stats_lessons_today'
  | 'daily_stats_students_today'
  | 'daily_stats_revenue_today'
  | 'daily_stats_completed'
  | 'daily_stats_monthly_overview'
  | 'daily_stats_students'
  | 'daily_stats_groups'
  | 'daily_stats_completed_short'
  | 'daily_stats_revenue'
  | 'tomorrows_lessons_title'
  | 'no_lessons_tomorrow'
  | 'weekly_overview_title'
  | 'weekly_overview_sub'
  | 'stat_remaining'
  | 'stat_cancelled'
  | 'stat_uncollected'
  | 'stat_total_expected'
  | 'smart_summary_title'
  | 'smart_summary_badge'
  | 'smart_summary_today'
  | 'smart_summary_expected_income'
  | 'smart_summary_first_lesson'
  | 'smart_summary_overdue_students'
  | 'smart_summary_todays_lessons'
  | 'smart_summary_todays_students'
  | 'smart_summary_no_lessons_regular'
  | 'next_action_title'
  | 'next_action_no_lessons'
  | 'next_action_today'
  | 'next_action_tomorrow'
  | 'next_action_this_week'
  | 'next_action_all'
  | 'next_action_online'
  | 'next_action_offline'
  | 'next_action_open'
  | 'time_in_progress'
  | 'time_starts_in'
  | 'time_starts_at'
  | 'time_scheduled_today'
  | 'timeline_title'
  | 'todays_lessons_title'
  | 'timeline_pending_action'
  | 'past_pending_lessons_title'
  | 'past_pending_lessons_desc'
  | 'timeline_requires_action'
  | 'timeline_pending_desc'
  | 'timeline_no_lessons'
  | 'timeline_completed_of'
  | 'timeline_live_now'
  | 'timeline_upcoming'
  | 'timeline_group'
  | 'timeline_individual'
  | 'system_time'
  | 'sofort_badge'
  | 'sofort_title'
  | 'sofort_desc'
  | 'quick_lesson_modal_title'
  | 'quick_lesson_modal_desc'
  | 'students_and_groups_title'
  | 'session_history_modal_title'
  | 'daily_gain_label'
  | 'weekly_gain_label'
  | 'monthly_gain_label'
  | 'open_payments_tab'
  | 'payment_history_tab'
  | 'all_groups_option'
  | 'no_due_payments_title'
  | 'no_due_payments_desc'
  | 'dismiss_from_dashboard'
  | 'todo_widget_title'
  | 'todo_add_placeholder'
  | 'todo_no_tasks'
  | 'todo_add_btn'
  | 'reports_and_analytics_title'
  | 'notifications_title'
  | 'free_time_available_today'
  | 'nav_free_time'
  | 'add_group_title'
  | 'add_group_subtitle'
  | 'lesson_duration_label'
  | 'schedule_lesson_title'
  | 'save_lesson_btn'
  | 'duplicate_student_warning'
  | 'students_all_groups'
  | 'payments_no_due'
  | 'payment_plan_lessons'
  | 'payments_completed_dates'
  | 'reports_copied'
  | 'reports_and_analyses'
  | 'lesson_session_num'
  | 'daily_stats_student'
  | 'todo_more_tasks';

export const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  ar: {
    notifications_title: 'الإشعارات',
    free_time_available_today: 'الأوقات المتاحة اليوم',
    nav_home: 'الرئيسية',
    nav_schedule: 'الجدول',
    nav_students: 'الطلاب',
    nav_history: 'السجل',
    nav_payments: 'المدفوعات',
    nav_reports: 'التقارير',
    nav_settings: 'الإعدادات',
    nav_quickLesson: 'حصة سريعة',
    nav_more: 'المزيد',
    nav_widgets: 'ويدجت أندرويد',
    goodMorning: 'صباح الخير',
    goodAfternoon: 'مساء الخير',
    goodEvening: 'مساء الخير',
    greeting: 'مرحباً بك',
    refreshData: 'تحديث البيانات',
    dataRefreshed: 'تم تحديث البيانات بنجاح',
    upcomingLessonAlert: 'حصة قريبة',
    open: 'فتح',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    all: 'الكل',
    filter: 'تصفية',
    status: 'الحالة',
    date: 'التاريخ',
    time: 'الوقت',
    notes: 'الملاحظات',
    confirm: 'تأكيد',
    back: 'رجوع',
    close: 'إغلاق',
    actions: 'الإجراءات',
    copied: 'تم النسخ',
    yes: 'نعم',
    no: 'لا',
    archive: 'أرشيف',
    status_completed: 'مكتملة',
    status_cancelled: 'ملغاة',
    status_upcoming: 'قادمة',
    status_in_progress: 'جارية',
    status_pending: 'معلقة',
    status_scheduled: 'مجدولة',
    att_present: 'حاضر',
    att_absent: 'غائب',
    att_late: 'متأخر',
    hw_assigned: 'مطلوب',
    hw_completed: 'مكتمل',
    hw_not_completed: 'غير مكتمل',
    settings_title: 'الإعدادات والحساب',
    settings_sub: 'إدارة الحساب والمظهر والنسخ الاحتياطي',
    settings_language: 'لغة الواجهة',
    settings_lang_desc: 'اختر اللغة المستخدمة في واجهة التطبيق',
    settings_parent_comm_notice: 'ملاحظة: تقارير ورسائل أولياء الأمور تُصاغ دائماً باللغة العربية.',
    settings_theme: 'المظهر',
    settings_theme_light: 'الوضع الفاتح',
    settings_theme_dark: 'الوضع الداكن',
    settings_profile: 'بيانات المعلم',
    settings_name: 'اسم المعلم',
    settings_email: 'البريد الإلكتروني',
    settings_currency: 'العملة',
    settings_working_hours: 'ساعات العمل',
    settings_start_time: 'بداية اليوم',
    settings_end_time: 'نهاية اليوم',
    settings_payment_details: 'بيانات التحويل والدفع',
    settings_phone: 'رقم الهاتف',
    settings_instapay: 'حساب انستا باي',
    settings_vodafone: 'فودافون كاش',
    settings_bank: 'الحساب البنكي',
    settings_payment_link: 'رابط الدفع',
    settings_share_payment: 'نسخ بيانات التحويل',
    settings_backup: 'النسخ الاحتياطي والاستعادة',
    settings_download_backup: 'تحميل نسخة احتياطية',
    settings_restore_backup: 'استعادة من ملف',
    settings_clear_data: 'مسح جميع البيانات',
    settings_save_success: 'تم حفظ التغييرات بنجاح',
    schedule_title: 'جدول الحصص',
    schedule_today: 'اليوم',
    schedule_week: 'الأسبوع',
    schedule_month: 'الشهر',
    schedule_add_lesson: 'إضافة حصة',
    schedule_start_now: 'بدء حصة الآن',
    schedule_no_lessons: 'لا توجد حصص مجدولة',
    schedule_conflict: 'تعارض',
    schedule_working_hours: 'ساعات العمل',
    schedule_refresh: 'تحديث',
    schedule_ical: 'تصدير التقويم',
    schedule_no_conflicts: 'لا توجد تعارضات زمنية',
    schedule_day_view: 'عرض اليوم',
    schedule_week_view: 'عرض الأسبوع',
    schedule_month_view: 'عرض الشهر',
    schedule_reschedule: 'تغيير الموعد',
    schedule_new_date: 'التاريخ الجديد',
    schedule_new_time: 'الوقت الجديد',
    schedule_conflict_alert: 'تنبيه: يوجد تعارض في هذا الموعد',
    schedule_reschedule_success: 'تم تغيير الموعد بنجاح',
    schedule_weekly: 'أسبوعياً',
    schedule_no_lessons_day: 'لا توجد حصص مجدولة لهذا اليوم',
    schedule_add_lesson_for: 'إضافة حصة جديدة',
    lesson_control_title: 'إدارة الحصة',
    lesson_timer: 'مؤقت الحصة المباشر',
    lesson_duration: 'المدة',
    lesson_start: 'بدء الحصة',
    lesson_resume: 'استئناف الحصة',
    lesson_pause: 'إيقاف مؤقت',
    lesson_end: 'إنهاء الحصة',
    lesson_cancel: 'إلغاء الحصة',
    lesson_report_form: 'تقرير الحصة',
    lesson_show_timer: 'إظهار المؤقت',
    lesson_attendance: 'الحضور والغياب',
    lesson_homework: 'الواجب المدرسي',
    lesson_teacher_notes: 'ملاحظات المعلم',
    lesson_parent_report_btn: 'تقرير ولي الأمر',
    lesson_save_report: 'حفظ التقرير',
    students_title: 'الطلاب والمجموعات',
    students_tab_all: 'جميع الطلاب',
    students_tab_groups: 'المجموعات',
    students_add_student: '+ طالب',
    students_add_group: '+ مجموعة',
    students_search_placeholder: 'بحث باسم الطالب، ولي الأمر، أو الهاتف...',
    students_search_group_placeholder: 'البحث عن مجموعة...',
    students_group_name: 'اسم المجموعة',
    students_student_name: 'اسم الطالب',
    students_grade: 'الصف الدراسي',
    students_parent_phone: 'هاتف ولي الأمر',
    students_student_phone: 'هاتف الطالب',
    students_package: 'الباقة',
    students_no_students: 'لا يوجد طلاب بعد',
    students_no_groups: 'لا توجد مجموعات بعد',
    students_group: 'مجموعة',
    students_individual: 'فردي',
    students_active: 'نشط',
    students_archived: 'مؤرشف',
    students_lessons_count: 'عدد الحصص',
    students_phone: 'الهاتف',
    students_parent_phone_label: 'ولي الأمر',
    students_details: 'التفاصيل',
    students_all_grades: 'جميع الصفوف',
    students_no_students_found: 'لم يتم العثور على طلاب.',
    students_all_days: 'كل الأيام',
    students_today: 'اليوم',
    students_archive_info: 'الطلاب والمجموعات المؤرشفة تظل محفوظة في السجل ويمكن إعادة تنشيطها في أي وقت.',
    students_archived_students_title: 'الطلاب المؤرشفون',
    students_no_archived_students: 'لا يوجد طلاب مؤرشفون.',
    students_archived_groups_title: 'المجموعات المؤرشفة',
    students_no_archived_groups: 'لا توجد مجموعات مؤرشفة.',
    students_restore: 'استعادة',
    students_reset_filters: 'إعادة ضبط الفلاتر',
    history_title: 'سجل الحصص',
    history_header_sub: 'عرض وإدارة أرشيف جميع الحصص والتقارير السابقة',
    history_total_lessons: 'إجمالي الحصص',
    history_completed: 'مكتملة',
    history_cancelled_missed: 'ملغاة/غائب',
    history_total_hours: 'إجمالي الساعات',
    history_filter_all: 'الكل',
    history_filter_completed: 'مكتملة',
    history_filter_cancelled: 'ملغاة',
    history_filter_pending: 'معلقة',
    history_search_placeholder: 'بحث باسم الطالب، المجموعة، أو موضوع الحصة...',
    history_search: 'بحث في السجل',
    history_export: 'تصدير السجل',
    history_filter_entity_label: 'تصفية حسب الطالب/المجموعة:',
    history_all_entities: 'كل الطلاب والمجموعات',
    history_groups_category: 'المجموعات',
    history_students_category: 'الطلاب',
    history_filter_period_label: 'الفترة الزمنية:',
    history_period_all: 'كل الأوقات',
    history_period_today: 'اليوم',
    history_period_this_week: 'هذا الأسبوع',
    history_period_this_month: 'هذا الشهر',
    history_results_count: 'نتائج السجل ({count} حصة)',
    history_reset_filters: 'إعادة ضبط الفلاتر',
    payments_title: 'إدارة المدفوعات',
    payments_total_collected: 'المحصل',
    payments_total_pending: 'المتبقي',
    payments_completed_cycle: 'الدورة اكتملت',
    payments_daily_summary: 'ملخص اليوم',
    payments_details_heading: 'التفاصيل',
    payments_due_tab: 'المستحقات',
    payments_history_sub: 'تاريخ سداد المدفوعات',
    payments_monthly_summary: 'ملخص الشهر',
    payments_no_cycles_period: 'لا توجد دورات مسددة',
    payments_no_due_sub: 'لا توجد مستحقات سداد حاليا',
    payments_not_yet_btn: 'لم يتم السداد',
    payments_paid_btn: 'تم السداد',
    payments_parent_notice: 'إشعار لولي الأمر',
    payments_pending_tag: 'في الانتظار',
    payments_weekly_summary: 'ملخص الأسبوع',
    payments_daily_gain: 'أرباح اليوم',
    payments_weekly_gain: 'أرباح الأسبوع',
    payments_monthly_gain: 'أرباح الشهر',
    payments_overdue: 'متأخر',
    payments_expected: 'المتوقع',
    payments_revenue_overview: 'نظرة عامة على الإيرادات',
    payments_record: 'تسجيل دفعة',
    payments_send_reminder: 'تذكير بالدفع',
    payments_paid: 'مدفوع',
    payments_unpaid: 'غير مدفوع',
    payments_partial: 'جزئي',
    payments_collected: 'تم تحصيله',
    payments_pending: 'في الانتظار',
    payments_plan: 'خطة الدفع',
    payments_history: 'سجل المدفوعات',
    payments_method: 'طريقة الدفع',
    payments_due_date: 'تاريخ الاستحقاق',
    payments_daily: 'يومياً:',
    payments_weekly: 'أسبوعياً:',
    payments_monthly: 'شهرياً:',
    payments_total_pending_label: 'إجمالي المستحقات',
    payments_open_tab: 'المستحقات المفتوحة',
    payments_history_tab: 'سجل المدفوعات',
    payments_all_groups: 'كل المجموعات',
    payments_no_due_title: 'لا توجد مستحقات سداد حالياً ✨',
    payments_no_due_desc: 'جميع الطلاب مسددون حتى الآن. يظهر الطلاب هنا تلقائياً فقط بعد اكتمال دورتهم الدراسية (مثل 4/4 أو 8/8 حصص).',
    payments_completed_dates_label: 'مواعيد الحصص المكتملة في هذا التنسيق:',
    payments_pending_expectation: '(قيد الانتظار ⏳)',
    payments_amount_due: 'المبلغ المستحق',
    payments_mark_paid: 'تم السداد (Paid)',
    payments_mark_not_yet: 'لم يتم بعد (Not Yet)',
    payments_notify_parent_wa: 'إشعار الوالد (WhatsApp)',
    payments_no_history: 'لا توجد مدفوعات سابقة مؤرشفة',
    payments_history_auto_archive: 'الدورات المسددة تتأرشف هنا تلقائياً.',
    payments_paid_on: 'تاريخ السداد:',
    payments_notice_title: 'إشعار سداد للوالد',
    payments_copy_text: 'نسخ النص',
    payments_copied: 'تم النسخ! ✓',
    payments_open_whatsapp: 'فتح WhatsApp',
    payments_daily_gain_title: 'أرباح اليوم (اليوم)',
    payments_weekly_gain_title: 'أرباح الأسبوع (آخر 7 أيام)',
    payments_monthly_gain_title: 'أرباح الشهر (هذا الشهر)',
    payments_gain_summary_sub: 'ملخص الإيرادات والدورات المسددة',
    payments_total_gains: 'إجمالي الإيرادات',
    payments_paid_cycles: 'الدورات المسددة',
    payments_details_header: 'تفاصيل المدفوعات',
    payments_no_paid_period: 'لم يتم تسجيل دورات مسددة في هذه الفترة.',
    reports_title: 'التقارير والتحليلات',
    reports_header_sub: 'الحصص، الإيرادات الأسبوعية، ومتابعة المدفوعات',
    reports_print_pdf: 'طباعة / PDF',
    reports_collected_revenue: 'الإيرادات المحصلة',
    reports_from_paid_sessions: 'محصلة من الحصص',
    reports_unpaid_amount: 'المبلغ المتبقي',
    reports_pending_payments: 'مدفوعات قيد الانتظار',
    reports_sessions_completed: 'الحصص المكتملة',
    reports_total_conducted: 'إجمالي ما تم تنفيذه',
    reports_unpaid_last_sessions: 'حصص ختامية غير مسددة',
    reports_urgent_collect: '⚠️ تحصيل عاجل!',
    reports_all_good: 'كل شيء ممتاز',
    reports_weekly_protocol: 'سجل الحصص والإيرادات الأسبوعي',
    reports_weekly_protocol_sub: 'كل حصة مع الرسوم المحصلة وتنبيهات الدفع',
    reports_filter_all: 'الكل',
    reports_filter_this_week: 'هذا الأسبوع',
    reports_filter_paid: 'مدفوع',
    reports_filter_unpaid: 'غير مدفوع',
    reports_no_sessions_filter: 'لم يتم العثور على حصص للمرشح المحدد.',
    reports_weekly_chart_title: 'مقارنة المبيعات الأسبوعية',
    reports_attendance_overview_title: 'ملخص حضور الطلاب',
    reports_total_lessons: 'إجمالي الحصص',
    reports_active_students: 'الطلاب النشطون',
    reports_attendance_rate: 'نسبة الحضور',
    reports_lessons_completed: 'الحصص المكتملة',
    reports_revenue: 'الإيرادات',
    reports_students: 'عدد الطلاب',
    reports_export_pdf: 'تصدير تقرير PDF',
    daily_stats_lessons_today: 'حصص اليوم',
    daily_stats_students_today: 'طلاب اليوم',
    daily_stats_revenue_today: 'دخل اليوم',
    daily_stats_completed: 'المكتملة',
    daily_stats_monthly_overview: 'ملخص الشهر',
    daily_stats_students: 'الطلاب',
    daily_stats_groups: 'المجموعات',
    daily_stats_completed_short: 'المكتملة',
    daily_stats_revenue: 'الإيرادات',
    tomorrows_lessons_title: 'حصص الغد',
    no_lessons_tomorrow: 'لا توجد حصص مجدولة لغداً ✨',
    weekly_overview_title: 'المعاينة الأسبوعية',
    weekly_overview_sub: 'الجمعة - الخميس',
    stat_remaining: 'المتبقية',
    stat_cancelled: 'الملغاة',
    stat_uncollected: 'غير محصلة',
    stat_total_expected: 'الإجمالي المتوقع',
    smart_summary_title: 'ملخص اليوم الذكي',
    smart_summary_badge: 'تحديث ذكي',
    smart_summary_today: 'اليوم',
    smart_summary_expected_income: 'متوقع تحصيله',
    smart_summary_first_lesson: 'أول حصة',
    smart_summary_overdue_students: 'طلاب متأخرون',
    smart_summary_todays_lessons: 'حصص اليوم',
    smart_summary_todays_students: 'طلاب اليوم',
    smart_summary_no_lessons_regular: 'لا توجد حصص مجدولة لليوم. جميع الدفوعات منتظمة بالكامل ✨',
    next_action_title: 'الحصة القادمة',
    next_action_no_lessons: 'لا توجد حصص قادمة للمرشح المحدد',
    next_action_today: 'اليوم',
    next_action_tomorrow: 'غداً',
    next_action_this_week: 'هذا الأسبوع',
    next_action_all: 'الكل',
    next_action_online: 'أونلاين',
    next_action_offline: 'حضوري',
    next_action_open: 'فتح الحصة',
    time_in_progress: 'جارية الآن',
    time_starts_in: 'تبدأ قريباً',
    time_starts_at: 'تبدأ الساعة',
    time_scheduled_today: 'مجدولة اليوم',
    timeline_title: 'جدول حصص اليوم',
    todays_lessons_title: 'حصص اليوم',
    timeline_pending_action: 'الحصص السابقة المعلقة',
    past_pending_lessons_title: 'الحصص السابقة المعلقة (Past Pending Lessons)',
    past_pending_lessons_desc: 'حصص سابقة لم تتلق حالة نهائية بعد (مكتملة أو ملغاة):',
    timeline_requires_action: 'تتطلب إجراء',
    timeline_pending_desc: 'هذه الحصص السابقة لم تُستكمل بعد:',
    timeline_no_lessons: 'لا توجد حصص مجدولة اليوم',
    timeline_completed_of: 'حصص مكتملة',
    timeline_live_now: 'مباشر الآن',
    timeline_upcoming: 'قادمة',
    timeline_group: 'مجموعة',
    timeline_individual: 'فردي',
    system_time: 'وقت النظام',
    sofort_badge: 'بدء حصة فورية',
    sofort_title: 'بدء حصة الآن (في أي وقت)',
    sofort_desc: 'بدء حصة فورية لأي مجموعة، بغض النظر عن الجدول الزمني.',
    quick_lesson_modal_title: 'حصة سريعة',
    quick_lesson_modal_desc: 'للحصص التجريبية أو الطلاب بدون ملف شخصي',
    students_and_groups_title: 'الطلاب والمجموعات',
    session_history_modal_title: 'سجل الحصص',
    daily_gain_label: 'يومياً:',
    weekly_gain_label: 'أسبوعياً:',
    monthly_gain_label: 'شهرياً:',
    open_payments_tab: 'المستحقات المفتوحة',
    payment_history_tab: 'سجل المدفوعات',
    all_groups_option: 'كل المجموعات',
    no_due_payments_title: 'لا توجد مستحقات سداد حالياً ✨',
    no_due_payments_desc: 'جميع الطلاب مسددون حتى الآن. يظهر الطلاب هنا تلقائياً فقط بعد اكتمال دورتهم الدراسية (مثل 4/4 أو 8/8 حصص).',
    dismiss_from_dashboard: 'إخفاء من اللوحة الرئيسية',
    todo_widget_title: 'قائمة المهام السريعة',
    todo_add_placeholder: 'اكتب مهمة جديدة...',
    todo_no_tasks: 'لا توجد مهام معلقة ✨',
    todo_add_btn: 'إضافة',
    reports_and_analytics_title: 'التقارير والتحليلات',
    nav_free_time: 'الأوقات المتاحة',
    add_group_title: 'إضافة مجموعة جديدة',
    add_group_subtitle: 'أدخل تفاصيل المجموعة والباقة الشهرية',
    lesson_duration_label: 'مدة الحصة',
    schedule_lesson_title: 'جدولة حصة جديدة',
    save_lesson_btn: 'حفظ الحصة',
    duplicate_student_warning: 'طالب بنفس الاسم موجود بالفعل في هذه المجموعة. هل تريد المتابعة؟',
    students_all_groups: 'جميع المجموعات',
    payments_no_due: 'لا توجد مستحقات سداد حالياً',
    payment_plan_lessons: 'حصص',
    payments_completed_dates: 'مواعيد الحصص المكتملة',
    reports_copied: 'تم نسخ التقرير',
    reports_and_analyses: 'التقارير والتحليلات',
    lesson_session_num: 'رقم الحصة',
    daily_stats_student: 'الطالب',
    todo_more_tasks: 'مهام إضافية...',
  },

  en: {
    notifications_title: 'Notifications',
    free_time_available_today: 'Available Today',
    nav_home: 'Home',
    nav_schedule: 'Schedule',
    nav_students: 'Students',
    nav_history: 'History',
    nav_payments: 'Payments',
    nav_reports: 'Reports',
    nav_settings: 'Settings',
    nav_quickLesson: 'Quick Lesson',
    nav_more: 'More',
    nav_widgets: 'Android Widgets',
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    greeting: 'Welcome',
    refreshData: 'Refresh data',
    dataRefreshed: 'Data refreshed successfully',
    upcomingLessonAlert: 'Upcoming lesson',
    open: 'Open',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    all: 'All',
    filter: 'Filter',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    notes: 'Notes',
    confirm: 'Confirm',
    back: 'Back',
    close: 'Close',
    actions: 'Actions',
    copied: 'Copied',
    yes: 'Yes',
    no: 'No',
    archive: 'Archive',
    status_completed: 'Completed',
    status_cancelled: 'Cancelled',
    status_upcoming: 'Upcoming',
    status_in_progress: 'In progress',
    status_pending: 'Pending',
    status_scheduled: 'Scheduled',
    att_present: 'Present',
    att_absent: 'Absent',
    att_late: 'Late',
    hw_assigned: 'Assigned',
    hw_completed: 'Completed',
    hw_not_completed: 'Not completed',
    settings_title: 'Settings & Account',
    settings_sub: 'Manage account, interface language, and backup',
    settings_language: 'Interface Language',
    settings_lang_desc: 'Select the language for the app interface',
    settings_parent_comm_notice: 'Note: Parent reports and messages are always generated in Arabic.',
    settings_theme: 'Appearance',
    settings_theme_light: 'Light mode',
    settings_theme_dark: 'Dark mode',
    settings_profile: 'Teacher Profile',
    settings_name: 'Teacher name',
    settings_email: 'Email',
    settings_currency: 'Currency',
    settings_working_hours: 'Working hours',
    settings_start_time: 'Start time',
    settings_end_time: 'End time',
    settings_payment_details: 'Payment Details',
    settings_phone: 'Phone number',
    settings_instapay: 'InstaPay ID',
    settings_vodafone: 'Vodafone Cash',
    settings_bank: 'Bank account',
    settings_payment_link: 'Payment link',
    settings_share_payment: 'Copy payment details',
    settings_backup: 'Backup & Restore',
    settings_download_backup: 'Download backup',
    settings_restore_backup: 'Restore from file',
    settings_clear_data: 'Clear all data',
    settings_save_success: 'Changes saved successfully',
    schedule_title: 'Lesson Schedule',
    schedule_today: 'Today',
    schedule_week: 'Week',
    schedule_month: 'Month',
    schedule_add_lesson: 'Add lesson',
    schedule_start_now: 'Start lesson now',
    schedule_no_lessons: 'No scheduled lessons',
    schedule_conflict: 'Conflict',
    schedule_working_hours: 'Working hours',
    schedule_refresh: 'Refresh',
    schedule_ical: 'Export Calendar',
    schedule_no_conflicts: 'No time conflicts',
    schedule_day_view: 'Day view',
    schedule_week_view: 'Week view',
    schedule_month_view: 'Month view',
    schedule_reschedule: 'Reschedule',
    schedule_new_date: 'New date',
    schedule_new_time: 'New time',
    schedule_conflict_alert: 'Alert: Conflict detected for this time slot',
    schedule_reschedule_success: 'Lesson rescheduled successfully',
    schedule_weekly: 'Weekly',
    schedule_no_lessons_day: 'No lessons scheduled for this day',
    schedule_add_lesson_for: 'Add new lesson',
    lesson_control_title: 'Lesson Control',
    lesson_timer: 'Live Lesson Timer',
    lesson_duration: 'Duration',
    lesson_start: 'Start lesson',
    lesson_resume: 'Resume lesson',
    lesson_pause: 'Pause lesson',
    lesson_end: 'End lesson',
    lesson_cancel: 'Cancel lesson',
    lesson_report_form: 'Lesson Report',
    lesson_show_timer: 'Show timer',
    lesson_attendance: 'Attendance',
    lesson_homework: 'Homework',
    lesson_teacher_notes: 'Teacher notes',
    lesson_parent_report_btn: 'Parent Report',
    lesson_save_report: 'Save report',
    students_title: 'Students & Groups',
    students_tab_all: 'All Students',
    students_tab_groups: 'Groups',
    students_add_student: '+ Student',
    students_add_group: '+ Group',
    students_search_placeholder: 'Search student, parent or phone...',
    students_search_group_placeholder: 'Search group...',
    students_group_name: 'Group name',
    students_student_name: 'Student name',
    students_grade: 'Grade level',
    students_parent_phone: 'Parent phone',
    students_student_phone: 'Student phone',
    students_package: 'Package',
    students_no_students: 'No students yet',
    students_no_groups: 'No groups yet',
    students_group: 'Group',
    students_individual: 'Individual',
    students_active: 'Active',
    students_archived: 'Archived',
    students_lessons_count: 'Lesson count',
    students_phone: 'Phone',
    students_parent_phone_label: 'Parent',
    students_details: 'Details',
    students_all_grades: 'All Grades',
    students_no_students_found: 'No students found.',
    students_all_days: 'All Days',
    students_today: 'Today',
    students_archive_info: 'Archived students and groups remain stored in history and can be reactivated at any time.',
    students_archived_students_title: 'Archived Students',
    students_no_archived_students: 'No archived students.',
    students_archived_groups_title: 'Archived Groups',
    students_no_archived_groups: 'No archived groups.',
    students_restore: 'Restore',
    students_reset_filters: 'Reset Filters',
    history_title: 'Session History',
    history_header_sub: 'View and manage history of all past sessions and reports',
    history_total_lessons: 'Total Lessons',
    history_completed: 'Completed',
    history_cancelled_missed: 'Cancelled / Absent',
    history_total_hours: 'Total Hours',
    history_filter_all: 'All',
    history_filter_completed: 'Completed',
    history_filter_cancelled: 'Cancelled',
    history_filter_pending: 'Pending',
    history_search_placeholder: 'Search by student, group or topic...',
    history_search: 'Search history',
    history_export: 'Export history',
    history_filter_entity_label: 'Filter by Student/Group:',
    history_all_entities: 'All Students & Groups',
    history_groups_category: 'Groups',
    history_students_category: 'Students',
    history_filter_period_label: 'Time Period:',
    history_period_all: 'All Time',
    history_period_today: 'Today',
    history_period_this_week: 'This Week',
    history_period_this_month: 'This Month',
    history_results_count: 'History Results ({count} lessons)',
    history_reset_filters: 'Reset Filters',
    payments_title: 'Payment Management',
    payments_total_collected: 'Collected',
    payments_total_pending: 'Pending',
    payments_completed_cycle: 'Completed Cycle',
    payments_daily_summary: 'Daily Summary',
    payments_details_heading: 'Details',
    payments_due_tab: 'Due',
    payments_history_sub: 'Payment history records',
    payments_monthly_summary: 'Monthly Summary',
    payments_no_cycles_period: 'No paid cycles.',
    payments_no_due_sub: 'No payments are due right now.',
    payments_not_yet_btn: 'Not Yet',
    payments_paid_btn: 'Paid',
    payments_parent_notice: 'Parent Notice',
    payments_pending_tag: 'Pending',
    payments_weekly_summary: 'Weekly Summary',
    payments_daily_gain: 'Daily Revenue',
    payments_weekly_gain: 'Weekly Revenue',
    payments_monthly_gain: 'Monthly Revenue',
    payments_overdue: 'Overdue',
    payments_expected: 'Expected',
    payments_revenue_overview: 'Revenue Overview',
    payments_record: 'Record payment',
    payments_send_reminder: 'Send reminder',
    payments_paid: 'Paid',
    payments_unpaid: 'Unpaid',
    payments_partial: 'Partially paid',
    payments_collected: 'Collected',
    payments_pending: 'Pending',
    payments_plan: 'Payment Plan',
    payments_history: 'Payment History',
    payments_method: 'Payment Method',
    payments_due_date: 'Due Date',
    payments_daily: 'Daily:',
    payments_weekly: 'Weekly:',
    payments_monthly: 'Monthly:',
    payments_total_pending_label: 'Total Pending',
    payments_open_tab: 'Open Payments',
    payments_history_tab: 'Payment History',
    payments_all_groups: 'All Groups',
    payments_no_due_title: 'No due payments available ✨',
    payments_no_due_desc: 'All students are currently up to date. Students will appear here automatically only after completing their payment cycle (e.g., 4/4 or 8/8 lessons).',
    payments_completed_dates_label: 'Completed lesson dates in this cycle:',
    payments_pending_expectation: '(Pending ⏳)',
    payments_amount_due: 'Amount Due',
    payments_mark_paid: 'Mark Paid',
    payments_mark_not_yet: 'Not Yet',
    payments_notify_parent_wa: 'Notify Parent (WhatsApp)',
    payments_no_history: 'No payment history recorded',
    payments_history_auto_archive: 'Paid cycles are automatically archived here.',
    payments_paid_on: 'Paid on:',
    payments_notice_title: 'Payment Notice to Parent',
    payments_copy_text: 'Copy Text',
    payments_copied: 'Copied! ✓',
    payments_open_whatsapp: 'Open WhatsApp',
    payments_daily_gain_title: 'Daily Revenue (Today)',
    payments_weekly_gain_title: 'Weekly Revenue (Last 7 Days)',
    payments_monthly_gain_title: 'Monthly Revenue (This Month)',
    payments_gain_summary_sub: 'Revenue Summary & Paid Cycles',
    payments_total_gains: 'Total Revenue',
    payments_paid_cycles: 'Paid Cycles',
    payments_details_header: 'Payment Details',
    payments_no_paid_period: 'No paid cycles in this period.',
    reports_title: 'Reports & Analytics',
    reports_header_sub: 'Sessions, weekly revenue & payment tracking',
    reports_print_pdf: 'Print / PDF',
    reports_collected_revenue: 'Collected Revenue',
    reports_from_paid_sessions: 'Collected from sessions',
    reports_unpaid_amount: 'Pending Amount',
    reports_pending_payments: 'Pending payments',
    reports_sessions_completed: 'Sessions Completed',
    reports_total_conducted: 'Total conducted',
    reports_unpaid_last_sessions: 'Unpaid Final Sessions',
    reports_urgent_collect: '⚠️ Collect urgently!',
    reports_all_good: 'Everything in order',
    reports_weekly_protocol: 'Weekly Sessions & Revenue Protocol',
    reports_weekly_protocol_sub: 'Every session with received fees and payment alerts',
    reports_filter_all: 'All',
    reports_filter_this_week: 'This Week',
    reports_filter_paid: 'Paid',
    reports_filter_unpaid: 'Unpaid',
    reports_no_sessions_filter: 'No sessions found for selected filter.',
    reports_weekly_chart_title: 'Weekly Revenue Comparison',
    reports_attendance_overview_title: 'Student Attendance Overview',
    reports_total_lessons: 'Total lessons',
    reports_active_students: 'Active students',
    reports_attendance_rate: 'Attendance rate',
    reports_lessons_completed: 'Completed lessons',
    reports_revenue: 'Revenue',
    reports_students: 'Students count',
    reports_export_pdf: 'Export PDF Report',
    daily_stats_lessons_today: 'Lessons Today',
    daily_stats_students_today: 'Students Today',
    daily_stats_revenue_today: 'Revenue Today',
    daily_stats_completed: 'Completed',
    daily_stats_monthly_overview: 'Monthly Overview',
    daily_stats_students: 'Students',
    daily_stats_groups: 'Groups',
    daily_stats_completed_short: 'Completed',
    daily_stats_revenue: 'Revenue',
    tomorrows_lessons_title: "Tomorrow's Lessons",
    no_lessons_tomorrow: 'No lessons scheduled for tomorrow ✨',
    weekly_overview_title: 'Weekly Overview',
    weekly_overview_sub: 'Friday - Thursday',
    stat_remaining: 'Remaining',
    stat_cancelled: 'Cancelled',
    stat_uncollected: 'Uncollected',
    stat_total_expected: 'Total Expected',
    smart_summary_title: 'Smart Daily Summary',
    smart_summary_badge: 'Smart Update',
    smart_summary_today: 'Today',
    smart_summary_expected_income: 'Expected Income',
    smart_summary_first_lesson: 'First Lesson',
    smart_summary_overdue_students: 'Overdue Students',
    smart_summary_todays_lessons: "Today's Lessons",
    smart_summary_todays_students: "Today's Students",
    smart_summary_no_lessons_regular: 'No lessons scheduled for today. All payments are up to date ✨',
    next_action_title: 'NEXT LESSON',
    next_action_no_lessons: 'No upcoming lessons for the selected filter',
    next_action_today: 'Today',
    next_action_tomorrow: 'Tomorrow',
    next_action_this_week: 'This Week',
    next_action_all: 'All',
    next_action_online: 'Online',
    next_action_offline: 'Offline',
    next_action_open: 'Open Lesson',
    time_in_progress: 'In progress now',
    time_starts_in: 'Starts soon',
    time_starts_at: 'Starts at',
    time_scheduled_today: 'Scheduled today',
    timeline_title: 'Today\'s Lessons',
    todays_lessons_title: 'Today\'s Lessons',
    timeline_pending_action: 'Past Pending Lessons',
    past_pending_lessons_title: 'Past Pending Lessons',
    past_pending_lessons_desc: 'Old lessons from previous days that have no final status:',
    timeline_requires_action: 'Action Required',
    timeline_pending_desc: 'These past lessons have not been completed yet:',
    timeline_no_lessons: 'No lessons scheduled for today',
    timeline_completed_of: 'Lessons completed',
    timeline_live_now: 'LIVE NOW',
    timeline_upcoming: 'Upcoming',
    timeline_group: 'Group',
    timeline_individual: 'Individual',
    system_time: 'System time',
    sofort_badge: 'Start Instant Lesson',
    sofort_title: 'Start Lesson Now (Anytime)',
    sofort_desc: 'Start a lesson immediately for any group, independent of the schedule.',
    quick_lesson_modal_title: 'Quick Lesson',
    quick_lesson_modal_desc: 'For trial / single students without profile',
    students_and_groups_title: 'Students & Groups',
    session_history_modal_title: 'Session History',
    daily_gain_label: 'Daily:',
    weekly_gain_label: 'Weekly:',
    monthly_gain_label: 'Monthly:',
    open_payments_tab: 'Open Payments',
    payment_history_tab: 'Payment History',
    all_groups_option: 'All Groups',
    no_due_payments_title: 'No due payments available ✨',
    no_due_payments_desc: 'All students are currently up to date. Students will appear here automatically only after completing their payment cycle (e.g., 4/4 or 8/8 lessons).',
    dismiss_from_dashboard: 'Hide from Dashboard',
    todo_widget_title: 'To-Do',
    todo_add_placeholder: 'Add a quick task...',
    todo_no_tasks: 'No pending tasks ✨',
    todo_add_btn: 'Add',
    reports_and_analytics_title: 'Reports & Analytics',
    nav_free_time: 'Free Time',
    add_group_title: 'Add New Group',
    add_group_subtitle: 'Enter group details and monthly package',
    lesson_duration_label: 'Lesson Duration',
    schedule_lesson_title: 'Schedule New Lesson',
    save_lesson_btn: 'Save Lesson',
    duplicate_student_warning: 'A student with the same name already exists in this group. Do you want to continue?',
    students_all_groups: 'All Groups',
    payments_no_due: 'No due payments available',
    payment_plan_lessons: 'lessons',
    payments_completed_dates: 'Completed lesson dates',
    reports_copied: 'Report copied',
    reports_and_analyses: 'Reports & Analytics',
    lesson_session_num: 'Session Number',
    daily_stats_student: 'Student',
    todo_more_tasks: 'more tasks...',
  },

  de: {
    notifications_title: 'Benachrichtigungen',
    free_time_available_today: 'Heute verfügbar',
    nav_home: 'Start',
    nav_schedule: 'Kalender',
    nav_students: 'Schüler',
    nav_history: 'Historie',
    nav_payments: 'Zahlungen',
    nav_reports: 'Berichte',
    nav_settings: 'Einstellungen',
    nav_quickLesson: 'Schnellstunde',
    nav_more: 'Mehr',
    nav_widgets: 'Android Widgets',
    goodMorning: 'Guten Morgen',
    goodAfternoon: 'Guten Tag',
    goodEvening: 'Guten Abend',
    greeting: 'Willkommen',
    refreshData: 'Daten aktualisieren',
    dataRefreshed: 'Daten erfolgreich aktualisiert',
    upcomingLessonAlert: 'Nächste Stunde',
    open: 'Öffnen',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    search: 'Suchen',
    all: 'Alle',
    filter: 'Filtern',
    status: 'Status',
    date: 'Datum',
    time: 'Uhrzeit',
    notes: 'Notizen',
    confirm: 'Bestätigen',
    back: 'Zurück',
    close: 'Schließen',
    actions: 'Aktionen',
    copied: 'Kopiert',
    yes: 'Ja',
    no: 'Nein',
    archive: 'Archivieren',
    status_completed: 'Abgeschlossen',
    status_cancelled: 'Abgesagt',
    status_upcoming: 'Anstehend',
    status_in_progress: 'Laufend',
    status_pending: 'Ausstehend',
    status_scheduled: 'Geplant',
    att_present: 'Anwesend',
    att_absent: 'Abwesend',
    att_late: 'Verspätet',
    hw_assigned: 'Aufgegeben',
    hw_completed: 'Erledigt',
    hw_not_completed: 'Nicht erledigt',
    settings_title: 'Einstellungen und Konto',
    settings_sub: 'Konto, Oberflächensprache und Sicherung verwalten',
    settings_language: 'Oberflächensprache',
    settings_lang_desc: 'Wählen Sie die Sprache für die App-Oberfläche',
    settings_parent_comm_notice: 'Hinweis: Elternberichte und Nachrichten werden immer auf Arabisch erstellt.',
    settings_theme: 'Erscheinungsbild',
    settings_theme_light: 'Heller Modus',
    settings_theme_dark: 'Dunkler Modus',
    settings_profile: 'Lehrerprofil',
    settings_name: 'Lehrername',
    settings_email: 'E-Mail',
    settings_currency: 'Währung',
    settings_working_hours: 'Arbeitszeiten',
    settings_start_time: 'Startzeit',
    settings_end_time: 'Endzeit',
    settings_payment_details: 'Zahlungsdaten',
    settings_phone: 'Telefonnummer',
    settings_instapay: 'InstaPay ID',
    settings_vodafone: 'Vodafone Cash',
    settings_bank: 'Bankkonto',
    settings_payment_link: 'Zahlungslink',
    settings_share_payment: 'Zahlungsdaten kopieren',
    settings_backup: 'Sicherung und Wiederherstellung',
    settings_download_backup: 'Sicherung herunterladen',
    settings_restore_backup: 'Aus Datei wiederherstellen',
    settings_clear_data: 'Alle Daten löschen',
    settings_save_success: 'Änderungen erfolgreich gespeichert',
    schedule_title: 'Stundenplan',
    schedule_today: 'Heute',
    schedule_week: 'Woche',
    schedule_month: 'Monat',
    schedule_add_lesson: 'Stunde hinzufügen',
    schedule_start_now: 'Jetzt Stunde starten',
    schedule_no_lessons: 'Keine Stunden geplant',
    schedule_conflict: 'Konflikt',
    schedule_working_hours: 'Arbeitszeiten',
    schedule_refresh: 'Aktualisieren',
    schedule_ical: 'Kalender exportieren',
    schedule_no_conflicts: 'Keine Zeitkonflikte',
    schedule_day_view: 'Tagesansicht',
    schedule_week_view: 'Wochenansicht',
    schedule_month_view: 'Monatsansicht',
    schedule_reschedule: 'Termin verschieben',
    schedule_new_date: 'Neues Datum',
    schedule_new_time: 'Neue Uhrzeit',
    schedule_conflict_alert: 'Achtung: Zeitkonflikt für diesen Termin entdeckt',
    schedule_reschedule_success: 'Termin erfolgreich verschoben',
    schedule_weekly: 'Wöchentlich',
    schedule_no_lessons_day: 'Keine Stunden für diesen Tag geplant',
    schedule_add_lesson_for: 'Neue Stunde hinzufügen',
    lesson_control_title: 'Stundenverwaltung',
    lesson_timer: 'Live-Timer',
    lesson_duration: 'Dauer',
    lesson_start: 'Stunde starten',
    lesson_resume: 'Fortsetzen',
    lesson_pause: 'Pausieren',
    lesson_end: 'Stunde beenden',
    lesson_cancel: 'Stunde absagen',
    lesson_report_form: 'Stundenbericht',
    lesson_show_timer: 'Timer anzeigen',
    lesson_attendance: 'Anwesenheit',
    lesson_homework: 'Hausaufgabe',
    lesson_teacher_notes: 'Lehrernotizen',
    lesson_parent_report_btn: 'Elternbericht',
    lesson_save_report: 'Bericht speichern',
    students_title: 'Schüler und Gruppen',
    students_tab_all: 'Alle Schüler',
    students_tab_groups: 'Gruppen',
    students_add_student: '+ Schüler',
    students_add_group: '+ Gruppe',
    students_search_placeholder: 'Schüler, Eltern oder Telefon suchen...',
    students_search_group_placeholder: 'Gruppe suchen...',
    students_group_name: 'Gruppenname',
    students_student_name: 'Schülername',
    students_grade: 'Klassenstufe',
    students_parent_phone: 'Telefon der Eltern',
    students_student_phone: 'Telefon des Schülers',
    students_package: 'Paket',
    students_no_students: 'Noch keine Schüler',
    students_no_groups: 'Noch keine Gruppen',
    students_group: 'Gruppe',
    students_individual: 'Einzel',
    students_active: 'Aktiv',
    students_archived: 'Archiviert',
    students_lessons_count: 'Anzahl Stunden',
    students_phone: 'Telefon',
    students_parent_phone_label: 'Eltern',
    students_details: 'Details',
    students_all_grades: 'Alle Grade',
    students_no_students_found: 'Keine Schüler gefunden.',
    students_all_days: 'Alle Tage',
    students_today: 'Heute',
    students_archive_info: 'Archivierte Schüler und Gruppen bleiben in der Historie gespeichert. Sie können jederzeit reaktiviert werden.',
    students_archived_students_title: 'Archivierte Schüler',
    students_no_archived_students: 'Keine archivierten Schüler.',
    students_archived_groups_title: 'Archivierte Gruppen',
    students_no_archived_groups: 'Keine archivierten Gruppen.',
    students_restore: 'Wiederherstellen',
    students_reset_filters: 'Filter zurücksetzen',
    history_title: 'Unterrichtshistorie',
    history_header_sub: 'Anzeige und Verwaltung des Archivs aller vergangenen Sitzungen und Berichte',
    history_total_lessons: 'Gesamtstunden',
    history_completed: 'Abgeschlossen',
    history_cancelled_missed: 'Abgesagt / Abwesend',
    history_total_hours: 'Gesamtstunden',
    history_filter_all: 'Alle',
    history_filter_completed: 'Abgeschlossen',
    history_filter_cancelled: 'Abgesagt',
    history_filter_pending: 'Ausstehend',
    history_search_placeholder: 'Stunden nach Schüler, Gruppe oder Thema suchen...',
    history_search: 'Historie durchsuchen',
    history_export: 'Historie exportieren',
    history_filter_entity_label: 'Nach Schüler / Gruppe filtern:',
    history_all_entities: 'Alle Schüler und Gruppen',
    history_groups_category: 'Gruppen',
    history_students_category: 'Schüler',
    history_filter_period_label: 'Zeitraum:',
    history_period_all: 'Alle Zeiten',
    history_period_today: 'Heute',
    history_period_this_week: 'Diese Woche',
    history_period_this_month: 'Diesen Monat',
    history_results_count: 'Ergebnisse ({count} Stunden)',
    history_reset_filters: 'Filter zurücksetzen',
    payments_title: 'Zahlungsverwaltung',
    payments_total_collected: 'Eingenommen',
    payments_total_pending: 'Ausstehend',
    payments_completed_cycle: 'Abgeschlossener Zyklus',
    payments_daily_summary: 'Tagesübersicht',
    payments_details_heading: 'Details',
    payments_due_tab: 'Fällig',
    payments_history_sub: 'Verlauf der Zahlungen',
    payments_monthly_summary: 'Monatsübersicht',
    payments_no_cycles_period: 'Keine bezahlten Zyklen.',
    payments_no_due_sub: 'Derzeit keine fälligen Zahlungen.',
    payments_not_yet_btn: 'Noch nicht',
    payments_paid_btn: 'Bezahlt',
    payments_parent_notice: 'Elternnotiz',
    payments_pending_tag: 'Ausstehend',
    payments_weekly_summary: 'Wochenübersicht',
    payments_daily_gain: 'Tagesumsatz',
    payments_weekly_gain: 'Wochenumsatz',
    payments_monthly_gain: 'Monatsumsatz',
    payments_overdue: 'Überfällig',
    payments_expected: 'Erwartet',
    payments_revenue_overview: 'Umsatzübersicht',
    payments_record: 'Zahlung erfassen',
    payments_send_reminder: 'Erinnerung senden',
    payments_paid: 'Bezahlt',
    payments_unpaid: 'Offen',
    payments_partial: 'Teilweise bezahlt',
    payments_collected: 'Eingenommen',
    payments_pending: 'Ausstehend',
    payments_plan: 'Zahlungsplan',
    payments_history: 'Zahlungsverlauf',
    payments_method: 'Zahlungsart',
    payments_due_date: 'Fälligkeitsdatum',
    payments_daily: 'Täglich:',
    payments_weekly: 'Wöchentlich:',
    payments_monthly: 'Monatlich:',
    payments_total_pending_label: 'Gesamt Ausstehend',
    payments_open_tab: 'Offene Zahlungen',
    payments_history_tab: 'Zahlungshistorie',
    payments_all_groups: 'Alle Gruppen',
    payments_no_due_title: 'Keine fälligen Zahlungen vorhanden ✨',
    payments_no_due_desc: 'Alle Schüler sind aktuell auf dem neuesten Stand. Schüler erscheinen hier automatisch erst dann, wenn sie ihren Zahlungszyklus (z. B. 4/4 oder 8/8 Lektionen) vollständig abgeschlossen haben.',
    payments_completed_dates_label: 'Meldungen / Abgeschlossene Termine:',
    payments_pending_expectation: '(In Erwartung ⏳)',
    payments_amount_due: 'Fälliger Betrag',
    payments_mark_paid: 'تم السداد (Paid)',
    payments_mark_not_yet: 'لم يتم بعد (Not Yet)',
    payments_notify_parent_wa: 'Eltern benachrichtigen (WhatsApp)',
    payments_no_history: 'Keine bezahlten Historien-Einträge vorhanden',
    payments_history_auto_archive: 'Bezahlte Zyklen werden hier automatisch archiviert.',
    payments_paid_on: 'Bezahlt am:',
    payments_notice_title: 'Zahlungserinnerung an Eltern',
    payments_copy_text: 'Text kopieren',
    payments_copied: 'Kopiert! ✓',
    payments_open_whatsapp: 'WhatsApp öffnen',
    payments_daily_gain_title: 'Tageseinnahmen (Heute)',
    payments_weekly_gain_title: 'Wocheneinnahmen (Letzte 7 Tage)',
    payments_monthly_gain_title: 'Monatseinnahmen (Diesen Monat)',
    payments_gain_summary_sub: 'Einnahmen-Zusammenfassung & Bezahlte Zyklen',
    payments_total_gains: 'Gesamteinnahmen',
    payments_paid_cycles: 'Bezahlte Zyklen',
    payments_details_header: 'Details der Zahlungen',
    payments_no_paid_period: 'Keine bezahlten Zyklen in diesem Zeitraum erfasst.',
    reports_title: 'Berichte & Analysen',
    reports_header_sub: 'Sitzungen, wöchentliche Einnahmen & Bezahlungs-Kontrolle',
    reports_print_pdf: 'Drucken / PDF',
    reports_collected_revenue: 'Erhaltene Einnahmen',
    reports_from_paid_sessions: 'Aus Sitzungen bezahlt',
    reports_unpaid_amount: 'Offener Betrag',
    reports_pending_payments: 'Ausstehende Zahlungen',
    reports_sessions_completed: 'Sitzungen Absolviert',
    reports_total_conducted: 'Insgesamt durchgeführt',
    reports_unpaid_last_sessions: 'Letzte Sitzung Unbezahlt',
    reports_urgent_collect: '⚠️ Dringend kassieren!',
    reports_all_good: 'Alles im grünen Bereich',
    reports_weekly_protocol: 'Wöchentliches Sitzungs- & Einnahmen-Protokoll',
    reports_weekly_protocol_sub: 'Jede Sitzung mit erhaltenem Honorar und Bezahlungs-Warnungen',
    reports_filter_all: 'Alle',
    reports_filter_this_week: 'Diese Woche',
    reports_filter_paid: 'Bezahlt',
    reports_filter_unpaid: 'Unbezahlt',
    reports_no_sessions_filter: 'Keine Sitzungen für die ausgewählte Filteroption gefunden.',
    reports_weekly_chart_title: 'Wöchentlicher Umsatzvergleich',
    reports_attendance_overview_title: 'Anwesenheitsübersicht der Schüler',
    reports_total_lessons: 'Gesamtstunden',
    reports_active_students: 'Aktive Schüler',
    reports_attendance_rate: 'Anwesenheitsquote',
    reports_lessons_completed: 'Abgeschlossene Stunden',
    reports_revenue: 'Einnahmen',
    reports_students: 'Anzahl Schüler',
    reports_export_pdf: 'PDF-Bericht exportieren',
    daily_stats_lessons_today: 'Stunden heute',
    daily_stats_students_today: 'Schüler heute',
    daily_stats_revenue_today: 'Umsatz heute',
    daily_stats_completed: 'Abgeschlossen',
    daily_stats_monthly_overview: 'Monatlicher Überblick',
    daily_stats_students: 'Schüler',
    daily_stats_groups: 'Gruppen',
    daily_stats_completed_short: 'Abgeschlossen',
    daily_stats_revenue: 'Umsatz',
    tomorrows_lessons_title: 'Stunden morgen',
    no_lessons_tomorrow: 'Keine Stunden für morgen geplant ✨',
    weekly_overview_title: 'Wöchentliche Übersicht',
    weekly_overview_sub: 'Freitag - Donnerstag',
    stat_remaining: 'Verbleibend',
    stat_cancelled: 'Storniert',
    stat_uncollected: 'Ausstehend',
    stat_total_expected: 'Gesamt erwartet',
    smart_summary_title: 'Kluge Tageszusammenfassung',
    smart_summary_badge: 'Kluges Update',
    smart_summary_today: 'Heute',
    smart_summary_expected_income: 'Erwartete Einnahmen',
    smart_summary_first_lesson: 'Erste Stunde',
    smart_summary_overdue_students: 'Überfällige Schüler',
    smart_summary_todays_lessons: 'Stunden heute',
    smart_summary_todays_students: 'Schüler heute',
    smart_summary_no_lessons_regular: 'Keine Stunden für heute geplant. Alle Zahlungen sind aktuell ✨',
    next_action_title: 'NÄCHSTE STUNDE',
    next_action_no_lessons: 'Keine bevorstehenden Stunden für den gewählten Filter',
    next_action_today: 'Heute',
    next_action_tomorrow: 'Morgen',
    next_action_this_week: 'Diese Woche',
    next_action_all: 'Alle',
    next_action_online: 'Online',
    next_action_offline: 'Offline',
    next_action_open: 'Stunde öffnen',
    time_in_progress: 'Läuft gerade',
    time_starts_in: 'Startet demnächst',
    time_starts_at: 'Startet um',
    time_scheduled_today: 'Heute geplant',
    timeline_title: 'Heutige Lektionen',
    todays_lessons_title: 'Heutige Lektionen (Today\'s Lessons)',
    timeline_pending_action: 'Vergangene ausstehende Lektionen',
    past_pending_lessons_title: 'Vergangene ausstehende Lektionen (Past Pending Lessons)',
    past_pending_lessons_desc: 'Alte Lektionen aus vergangenen Tagen ohne aktiven Status:',
    timeline_requires_action: 'Aktion erforderlich',
    timeline_pending_desc: 'Diese früheren Stunden wurden noch nicht abgeschlossen:',
    timeline_no_lessons: 'Keine Stunden für heute geplant',
    timeline_completed_of: 'Stunden abgeschlossen',
    timeline_live_now: 'JETZT LIVE',
    timeline_upcoming: 'Anstehend',
    timeline_group: 'Gruppe',
    timeline_individual: 'Einzel',
    system_time: 'Systemzeit',
    sofort_badge: 'Sofort-Lektion starten',
    sofort_title: 'Start Lesson Now (Jederzeit starten)',
    sofort_desc: 'Starten Sie eine Lektion sofort für jede Gruppe, unabhängig vom Stundenplan.',
    quick_lesson_modal_title: 'Schnelle Lektion (Quick Lesson)',
    quick_lesson_modal_desc: 'Für Test- / Einzellerne ohne Profil',
    students_and_groups_title: 'Schüler & Gruppen',
    session_history_modal_title: 'Sitzungshistorie (Session History)',
    daily_gain_label: 'Täglich:',
    weekly_gain_label: 'Wöchentlich:',
    monthly_gain_label: 'Monatlich:',
    open_payments_tab: 'Offene Zahlungen',
    payment_history_tab: 'Zahlungshistorie',
    all_groups_option: 'Alle Gruppen',
    no_due_payments_title: 'Keine fälligen Zahlungen vorhanden ✨',
    no_due_payments_desc: 'Alle Schüler sind aktuell auf dem neuesten Stand. Schüler erscheinen hier automatisch erst dann, wenn sie ihren Zahlungszyklus (z. B. 4/4 oder 8/8 Lektionen) vollständig abgeschlossen haben.',
    dismiss_from_dashboard: 'Aus Dashboard ausblenden',
    todo_widget_title: 'To-Do',
    todo_add_placeholder: 'Schnelle Aufgabe hinzufügen...',
    todo_no_tasks: 'Keine ausstehenden Aufgaben ✨',
    todo_add_btn: 'Hinzufügen',
    reports_and_analytics_title: 'Berichte & Analysen',
    nav_free_time: 'Freie Zeit',
    add_group_title: 'Neue Gruppe hinzufügen',
    add_group_subtitle: 'Gruppendetails und Monatspaket eingeben',
    lesson_duration_label: 'Lektionsdauer',
    schedule_lesson_title: 'Neue Lektion planen',
    save_lesson_btn: 'Lektion speichern',
    duplicate_student_warning: 'Ein Schüler mit demselben Namen existiert bereits in dieser Gruppe. Möchten Sie fortfahren?',
    students_all_groups: 'Alle Gruppen',
    payments_no_due: 'Keine fälligen Zahlungen',
    payment_plan_lessons: 'Lektionen',
    payments_completed_dates: 'Abgeschlossene Termine',
    reports_copied: 'Bericht kopiert',
    reports_and_analyses: 'Berichte & Analysen',
    lesson_session_num: 'Lektionsnummer',
    daily_stats_student: 'Schüler',
    todo_more_tasks: 'weitere Aufgaben...',
  }
};
