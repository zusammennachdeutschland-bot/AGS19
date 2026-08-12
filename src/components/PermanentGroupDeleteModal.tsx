import React from 'react';
import { AlertTriangle, X, Users, Calendar, CheckSquare, DollarSign, FileText } from 'lucide-react';
import { Group, Student, Lesson } from '../types';

interface PermanentGroupDeleteModalProps {
  isOpen: boolean;
  group: Group;
  students: Student[];
  lessons: Lesson[];
  payments: any[];
  onClose: () => void;
  onDeleteGroupOnly: () => void;
  onDeleteGroupAndAllData: () => void;
}

export const PermanentGroupDeleteModal: React.FC<PermanentGroupDeleteModalProps> = ({
  isOpen,
  group,
  students,
  lessons,
  payments,
  onClose,
  onDeleteGroupOnly,
  onDeleteGroupAndAllData,
}) => {
  if (!isOpen) return null;

  const groupStudents = students.filter(s => s.groupId === group.id);
  const groupLessons = lessons.filter(l => l.groupId === group.id);
  const groupPayments = payments.filter(p => p.groupId === group.id);
  const attendanceCount = groupLessons.filter(l => l.report?.attendanceStatus || (l.report?.studentAttendance && Object.keys(l.report.studentAttendance).length > 0)).length;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 pb-0">
      <div onClick={(e) => e.stopPropagation()} className="bg-surface border border-surface-border rounded-t-[28px] sm:rounded-xl pb-safe-bottom sm:pb-0 mb-0 w-full max-w-lg p-5 shadow-2xl relative animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-2 mb-1 sm:hidden shrink-0" />
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-text-main">
                ⚠️ Permanent Group Deletion
              </h3>
              <p className="text-xs font-semibold text-text-muted mt-0.5">
                Group: {group.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface-hover rounded-full transition-colors cursor-pointer text-text-muted/70 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className="text-xs text-text-muted space-y-2 leading-relaxed bg-background/50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-surface-border">
          <p className="font-semibold text-text-main">
            You are about to permanently delete this group.
          </p>
          <p>
            Do you also want to delete all data linked to this group?
          </p>
          <p className="font-medium text-text-main pt-1">
            The following data may be removed:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 font-normal text-text-muted">
            <li>Students in this group</li>
            <li>Lesson sessions</li>
            <li>Calendar schedules</li>
            <li>Lesson history</li>
            <li>Attendance records</li>
            <li>Homework records</li>
            <li>Exam/Quiz results</li>
            <li>Payment records</li>
            <li>Notes and reports</li>
            <li>Future scheduled lessons</li>
          </ul>
          <p className="text-red-600 dark:text-red-400 font-bold pt-1">
            This action cannot be undone.
          </p>
        </div>

        {/* Deletion Summary */}
        <div className="bg-primary-soft dark:bg-primary-soft/40 border border-primary-border dark:border-primary-border rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-primary dark:text-primary uppercase tracking-wider">
            Linked Data Summary:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-text-main">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Students: {groupStudents.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Sessions: {groupLessons.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Calendar Events: {groupLessons.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary" />
              <span>Attendance Records: {attendanceCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span>Payments: {groupPayments.length}</span>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={onDeleteGroupAndAllData}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Delete Group + All Linked Data</span>
          </button>

          <button
            type="button"
            onClick={onDeleteGroupOnly}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Delete Group Only (Keep Students & History)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-700 text-text-main font-bold text-xs py-2.5 rounded-xl transition-all text-center cursor-pointer mt-1"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
