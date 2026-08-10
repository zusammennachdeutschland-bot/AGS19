import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student, Group } from '../types';
import { Users, UserPlus, Search, Phone, Send, ChevronRight, Plus, MapPin, Video, FolderCheck, X, Trash2, Edit3, Archive, RotateCcw, MoreVertical, User, FileText, Award, DollarSign, Bot } from 'lucide-react';
import { StudentProfileModal } from './StudentProfileModal';
import { GroupProfileModal } from './GroupProfileModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { AiImportModal } from './AiImportModal';
import { formatGroupScheduleDisplay, getDayNumber } from '../utils/scheduleUtils';

export const StudentsView: React.FC = () => {
  const { 
    students, groups, profile, lessons, payments, language,
    setIsAddStudentModalOpen, setIsAddGroupModalOpen,
    deleteStudent, archiveStudent, deleteGroup, archiveGroup,
    updateStudent, updateGroup, t
  } = useApp();

  const [activeSegment, setActiveSegment] = useState<'students' | 'groups' | 'archive'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedGroupDay, setSelectedGroupDay] = useState<string>('all');

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentTab, setSelectedStudentTab] = useState<'overview' | 'attendance' | 'scores' | 'payments' | 'files' | 'edit'>('overview');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isAiImportModalOpen, setIsAiImportModalOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'student' | 'group';
    id: string;
    name: string;
  } | null>(null);

  const GERMAN_WEEKDAYS = [
    { short: 'Mo', full: 'Montag', dayNum: 1 },
    { short: 'Di', full: 'Dienstag', dayNum: 2 },
    { short: 'Mi', full: 'Mittwoch', dayNum: 3 },
    { short: 'Do', full: 'Donnerstag', dayNum: 4 },
    { short: 'Fr', full: 'Freitag', dayNum: 5 },
    { short: 'Sa', full: 'Samstag', dayNum: 6 },
    { short: 'So', full: 'Sonntag', dayNum: 0 },
  ];

  const matchGroupDay = (group: Group, dayFilter: string): boolean => {
    if (!dayFilter || dayFilter === 'all') return true;
    if (!group.scheduleDays || group.scheduleDays.length === 0) return false;

    const targetDayNum = dayFilter === 'today' ? new Date().getDay() : getDayNumber(dayFilter);
    if (targetDayNum === -1) return true;

    return group.scheduleDays.some(d => getDayNumber(d) === targetDayNum);
  };

  const activeStudents = students.filter(s => s.status !== 'archived');
  const archivedStudents = students.filter(s => s.status === 'archived');

  const activeGroups = groups.filter(g => g.status !== 'archived');
  const archivedGroups = groups.filter(g => g.status === 'archived');

  const filteredStudents = activeStudents.filter(s => {
    const studentGroup = groups.find(g => g.id === s.groupId);
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
                          s.name.toLowerCase().includes(term) || 
                          s.parentName.toLowerCase().includes(term) ||
                          s.studentPhone.toLowerCase().includes(term) ||
                          s.parentPhone.toLowerCase().includes(term) ||
                          s.grade.toLowerCase().includes(term) ||
                          (studentGroup && studentGroup.name.toLowerCase().includes(term));
    const matchesGrade = selectedGrade === 'all' || s.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const filteredGroups = activeGroups.filter(g => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
                          g.name.toLowerCase().includes(term) ||
                          g.grade.toLowerCase().includes(term);
    const matchesGrade = selectedGrade === 'all' || g.grade === selectedGrade;
    const matchesDay = matchGroupDay(g, selectedGroupDay);
    return matchesSearch && matchesGrade && matchesDay;
  });

  const filteredArchivedStudents = archivedStudents.filter(s => {
    const term = searchTerm.toLowerCase();
    return !term || s.name.toLowerCase().includes(term) || s.parentName.toLowerCase().includes(term);
  });

  const filteredArchivedGroups = archivedGroups.filter(g => {
    const term = searchTerm.toLowerCase();
    return !term || g.name.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600 shrink-0" />
          <span>{t('students_and_groups_title')}</span>
        </h2>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsAddStudentModalOpen(true)}
            className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-3 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span>{t('students_add_student')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddGroupModalOpen(true)}
            className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs px-3 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>{t('students_add_group')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAiImportModalOpen(true)}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-xs px-3 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <Bot className="w-3.5 h-3.5 shrink-0 text-purple-200" />
            <span>{language === 'ar' ? 'استيراد مجموعة + طلاب' : 'Import Group + Students'}</span>
          </button>
        </div>
      </div>

      {/* Segment Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-bold">
        <button
          onClick={() => setActiveSegment('students')}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            activeSegment === 'students'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {t('daily_stats_students')} ({activeStudents.length})
        </button>

        <button
          onClick={() => setActiveSegment('groups')}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            activeSegment === 'groups'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {t('daily_stats_groups')} ({activeGroups.length})
        </button>

        <button
          onClick={() => setActiveSegment('archive')}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeSegment === 'archive'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>{t('archive')} ({archivedStudents.length + archivedGroups.length})</span>
        </button>
      </div>

      {/* Search & Grade Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={activeSegment === 'students' ? t('students_search_placeholder') : t('students_search_group_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="all">{t('students_all_grades')}</option>
          {Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {(searchTerm || selectedGrade !== 'all' || selectedGroupDay !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedGrade('all');
              setSelectedGroupDay('all');
            }}
            className="px-2.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
            title={t('students_reset_filters')}
          >
            {t('students_reset_filters')}
          </button>
        )}
      </div>

      {/* DAILY FILTER FOR GROUPS */}
      {activeSegment === 'groups' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedGroupDay('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              selectedGroupDay === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('students_all_days')}
          </button>

          <button
            type="button"
            onClick={() => setSelectedGroupDay('today')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              selectedGroupDay === 'today'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/60 hover:bg-amber-100'
            }`}
          >
            <span>{t('students_today')}</span>
            <span className="text-[10px] font-mono opacity-80">({GERMAN_WEEKDAYS.find(w => w.dayNum === new Date().getDay())?.short})</span>
          </button>

          {GERMAN_WEEKDAYS.map(w => (
            <button
              key={w.short}
              type="button"
              onClick={() => setSelectedGroupDay(w.short)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                selectedGroupDay === w.short || selectedGroupDay === w.full
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {w.short}
            </button>
          ))}
        </div>
      )}

      {/* STUDENTS LIST SEGMENT */}
      {activeSegment === 'students' && (
        <div className="space-y-2.5">
          {filteredStudents.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {language === 'ar' ? 'لا يوجد طلاب حتى الآن' : language === 'de' ? 'Noch keine Schüler vorhanden' : 'No students yet.'}
              </p>
              <p className="text-xs text-slate-500">
                {language === 'ar' ? 'أضف طالبك الأول للبدء في تتبع الحضور، الدروس والمدفوعات.' : language === 'de' ? 'Füge deinen ersten Schüler hinzu, um Anwesenheit, Lektionen und Zahlungen zu verwalten.' : 'Add your first student to track attendance, lessons, and payments.'}
              </p>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(true)}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t('students_add_student')}</span>
              </button>
            </div>
          ) : (
            filteredStudents.map((student, idx) => {
              const studentGroup = groups.find(g => g.id === student.groupId);
              const cleanParentPhone = student.parentPhone.replace(/[^0-9+]/g, '');

              return (
                <div
                  key={`${student.id}_${idx}`}
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer group relative"
                  onClick={() => {
                    setSelectedStudent(student);
                    setSelectedStudentTab('overview');
                  }}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                      alt={student.name}
                      className="w-11 h-11 rounded-lg border border-slate-100 dark:border-slate-800 object-cover shrink-0"
                    />

                    <div className="min-w-0 space-y-0.5">
                      {/* PROMINENT STUDENT NAME */}
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors tracking-tight truncate">
                          {student.name}
                        </h3>
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100/50 dark:border-blue-900/30 px-1.5 py-0.5 rounded-md shrink-0">
                          {student.grade}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-extrabold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 px-1.5 py-0.5 rounded text-[10px]">
                          {studentGroup?.name || 'Gruppe A1'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          • {t('students_parent_phone_label')}: <span className="font-semibold text-slate-600 dark:text-slate-300">{student.parentName}</span> ({student.parentPhone})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Redesigned Student Actions Menu */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === `student_${student.id}` ? null : `student_${student.id}`)}
                        className={`p-2 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                          activeMenuId === `student_${student.id}` ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100' : ''
                        }`}
                        title={language === 'ar' ? 'خيارات الطالب' : language === 'de' ? 'Optionen' : 'Options'}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === `student_${student.id}` && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                          
                          <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xl z-30 py-1.5 animate-scale-up text-left rtl:text-right">
                            {/* View Profile link */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudent(student);
                                setSelectedStudentTab('overview');
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer text-left rtl:text-right"
                            >
                              <User className="w-4 h-4 text-blue-500" />
                              <span>{language === 'ar' ? 'الملف الشخصي' : language === 'de' ? 'Profil ansehen' : 'View Profile'}</span>
                            </button>

                            {/* Attendance tracking */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudent(student);
                                setSelectedStudentTab('attendance');
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer text-left rtl:text-right"
                            >
                              <FileText className="w-4 h-4 text-emerald-500" />
                              <span>{language === 'ar' ? 'تتبع الحضور' : language === 'de' ? 'Anwesenheit prüfen' : 'Check Attendance'}</span>
                            </button>

                            {/* Scores & grades */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudent(student);
                                setSelectedStudentTab('scores');
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer text-left rtl:text-right"
                            >
                              <Award className="w-4 h-4 text-amber-500" />
                              <span>{language === 'ar' ? 'الدرجات والواجبات' : language === 'de' ? 'Noten & Aufgaben' : 'Scores & Homework'}</span>
                            </button>

                            {/* Payments and finances */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudent(student);
                                setSelectedStudentTab('payments');
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer text-left rtl:text-right"
                            >
                              <DollarSign className="w-4 h-4 text-indigo-500" />
                              <span>{language === 'ar' ? 'السجلات المالية' : language === 'de' ? 'Zahlungsverlauf' : 'Payment History'}</span>
                            </button>

                            <div className="border-t border-slate-100 dark:border-slate-800/80 my-1.5" />

                            {/* Send WhatsApp message */}
                            <a
                              href={`https://wa.me/${cleanParentPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => setActiveMenuId(null)}
                              className="w-full px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer text-left rtl:text-right"
                            >
                              <Send className="w-4 h-4 text-emerald-500" />
                              <span>{language === 'ar' ? 'إرسال واتساب' : language === 'de' ? 'WhatsApp senden' : 'Send WhatsApp'}</span>
                            </a>

                            {/* Phone Call Parent */}
                            <a
                              href={`tel:${student.parentPhone}`}
                              onClick={() => setActiveMenuId(null)}
                              className="w-full px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer text-left rtl:text-right"
                            >
                              <Phone className="w-4 h-4 text-blue-500" />
                              <span>{language === 'ar' ? 'اتصال هاتفياً' : language === 'de' ? 'Anrufen (Telefon)' : 'Call (Phone)'}</span>
                            </a>

                            <div className="border-t border-slate-100 dark:border-slate-800/80 my-1.5" />

                            {/* Delete Student */}
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget({
                                  type: 'student',
                                  id: student.id,
                                  name: student.name
                                });
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2.5 cursor-pointer text-left rtl:text-right"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                              <span>{language === 'ar' ? 'حذف أو أرشفة' : language === 'de' ? 'Löschen / Archiv' : 'Delete / Archive'}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors ml-0.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* GROUPS LIST SEGMENT */}
      {activeSegment === 'groups' && (
        <div className="space-y-2.5">
          {filteredGroups.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {language === 'ar' ? 'لا توجد مجموعات حتى الآن' : language === 'de' ? 'Keine Gruppen vorhanden' : 'No groups yet.'}
              </p>
              <p className="text-xs text-slate-500">
                {language === 'ar' ? 'أنشئ مجموعتك الأولى للبدء في تنظيم الطلاب والدروس.' : language === 'de' ? 'Erstelle deine erste Gruppe, um Schüler und Lektionen zu organisieren.' : 'Create your first group to start organizing students and lessons.'}
              </p>
              <button
                type="button"
                onClick={() => setIsAddGroupModalOpen(true)}
                className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('students_add_group')}</span>
              </button>
            </div>
          ) : (
            filteredGroups.map((group, idx) => {
            const count = students.filter(s => s.groupId === group.id).length;

            return (
              <div
                key={`${group.id}_${idx}`}
                onClick={() => setSelectedGroup(group)}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                    group.type === 'online' 
                      ? 'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400' 
                      : 'bg-amber-50/50 border-amber-100 dark:bg-amber-950/40 dark:border-amber-900/40 text-amber-600 dark:text-amber-400'
                  }`}>
                    {group.type === 'online' ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                        {group.name}
                      </h3>
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 px-1.5 py-0.5 rounded-md shrink-0">
                        {group.grade}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-extrabold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 px-1.5 py-0.5 rounded text-[10px]">
                        {count} {t('daily_stats_students')}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-900/30 px-1.5 py-0.5 rounded text-[10px] font-mono">
                        {group.paymentModel === 'per_session'
                          ? `${group.pricePerSession || Math.round(group.monthlyPackagePrice / (group.sessionCount || 8))} ${profile.currency} / Sitzung`
                          : `${group.monthlyPackagePrice} ${profile.currency} / ${group.sessionCount} Sessions`}
                      </span>
                      <span className="text-slate-400 text-[11px] truncate max-w-[150px] sm:max-w-[240px]" title={formatGroupScheduleDisplay(group, language)}>
                        • {formatGroupScheduleDisplay(group, language)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Redesigned Group Actions Menu */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === `group_${group.id}` ? null : `group_${group.id}`)}
                      className={`p-2 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                        activeMenuId === `group_${group.id}` ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100' : ''
                      }`}
                      title={language === 'ar' ? 'خيارات المجموعة' : language === 'de' ? 'Optionen' : 'Options'}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === `group_${group.id}` && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                        
                        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xl z-30 py-1.5 animate-scale-up text-left rtl:text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGroup(group);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer text-left rtl:text-right"
                          >
                            <User className="w-4 h-4 text-blue-500" />
                            <span>{language === 'ar' ? 'عرض تفاصيل المجموعة' : language === 'de' ? 'Details anzeigen' : 'View Details'}</span>
                          </button>

                          <div className="border-t border-slate-100 dark:border-slate-800/80 my-1.5" />

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget({
                                  type: 'group',
                                  id: group.id,
                                  name: group.name
                              });
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2.5 cursor-pointer text-left rtl:text-right"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                            <span>{language === 'ar' ? 'حذف أو أرشفة' : language === 'de' ? 'Löschen / Archiv' : 'Delete / Archive'}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors ml-0.5" />
                </div>
              </div>
            );
          }))}
        </div>
      )}

      {/* ARCHIVE SEGMENT */}
      {activeSegment === 'archive' && (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
            <Archive className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              {t('students_archive_info')}
            </span>
          </div>

          {/* Archived Students Subsection */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>{t('students_archived_students_title')} ({archivedStudents.length})</span>
            </h3>

            {filteredArchivedStudents.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center text-xs text-slate-400">
                {t('students_no_archived_students')}
              </div>
            ) : (
              filteredArchivedStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 flex items-center justify-between gap-3 opacity-80 hover:opacity-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                      alt={student.name}
                      className="w-10 h-10 rounded-xl object-cover grayscale"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-through">
                          {student.name}
                        </h4>
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                          {t('students_archived')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {t('students_parent_phone_label')}: {student.parentName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateStudent(student.id, { status: 'active' })}
                      className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title={t('students_restore')}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('students_restore')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget({
                          type: 'student',
                          id: student.id,
                          name: student.name
                        });
                      }}
                      className="p-1.5 bg-red-50 dark:bg-red-950 hover:bg-red-100 text-red-600 rounded-xl transition-all cursor-pointer"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Archived Groups Subsection */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>{t('students_archived_groups_title')} ({archivedGroups.length})</span>
            </h3>

            {filteredArchivedGroups.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center text-xs text-slate-400">
                {t('students_no_archived_groups')}
              </div>
            ) : (
              filteredArchivedGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 flex items-center justify-between gap-3 opacity-80 hover:opacity-100 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-through">
                        {group.name}
                      </h4>
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                        {t('students_archived')}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Grade: {group.grade}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateGroup(group.id, { status: 'active' })}
                      className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title={t('students_restore')}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('students_restore')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget({
                          type: 'group',
                          id: group.id,
                          name: group.name
                        });
                      }}
                      className="p-1.5 bg-red-50 dark:bg-red-950 hover:bg-red-100 text-red-600 rounded-xl transition-all cursor-pointer"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Profile Modals */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          initialTab={selectedStudentTab}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {selectedGroup && (
        <GroupProfileModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}

      {/* AI Import Group + Students Modal */}
      <AiImportModal
        isOpen={isAiImportModalOpen}
        onClose={() => setIsAiImportModalOpen(false)}
        onSelectGroup={(g) => setSelectedGroup(g)}
      />

      {/* Custom Delete & Archive Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          itemType={deleteTarget.type}
          itemName={deleteTarget.name}
          recordsSummary={
            deleteTarget.type === 'student'
              ? {
                  lessonsCount: lessons.filter(l => l.studentId === deleteTarget.id || l.studentName === deleteTarget.name).length,
                  paymentsCount: payments.filter(p => p.studentId === deleteTarget.id || p.studentName === deleteTarget.name).length,
                  attendanceCount: lessons.filter(l => (l.studentId === deleteTarget.id || l.studentName === deleteTarget.name) && l.report?.attendanceStatus).length,
                }
              : {
                  studentsCount: students.filter(s => s.groupId === deleteTarget.id).length,
                  lessonsCount: lessons.filter(l => l.groupId === deleteTarget.id).length,
                  paymentsCount: payments.filter(p => p.groupId === deleteTarget.id).length,
                  attendanceCount: lessons.filter(l => l.groupId === deleteTarget.id && l.report?.attendanceStatus).length,
                }
          }
          onConfirmDelete={() => {
            if (deleteTarget.type === 'student') {
              deleteStudent(deleteTarget.id);
            } else {
              deleteGroup(deleteTarget.id);
            }
            setDeleteTarget(null);
          }}
          onConfirmArchive={() => {
            if (deleteTarget.type === 'student') {
              archiveStudent(deleteTarget.id);
            } else {
              archiveGroup(deleteTarget.id);
            }
            setDeleteTarget(null);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
