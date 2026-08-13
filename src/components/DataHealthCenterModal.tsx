import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { StudentProfileModal } from './StudentProfileModal';
import { GroupProfileModal } from './GroupProfileModal';
import { Student, Group } from '../types';
import { X, CheckCircle2, AlertTriangle, AlertCircle, ChevronRight, Activity, Video, MapPin } from 'lucide-react';

interface DataHealthCenterModalProps {
  onClose: () => void;
}

export const DataHealthCenterModal: React.FC<DataHealthCenterModalProps> = ({ onClose }) => {
  const { students, groups, language } = useApp();
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const isRtl = language === 'ar';
  const _t = (ar: string, en: string, de?: string) => {
    return language === 'ar' ? ar : language === 'de' ? (de || en) : en;
  };

  const healthData = useMemo(() => {
    const studentsWithoutParentPhone: Student[] = [];
    const groupsWithoutSchedule: Group[] = [];
    const groupsWithoutPrice: Group[] = [];
    const groupsWithoutZoomLink: Group[] = [];
    const groupsWithoutAddress: Group[] = [];

    students.forEach(st => {
      if (!st.parentPhone || st.parentPhone.trim() === '') {
        studentsWithoutParentPhone.push(st);
      }
    });

    groups.forEach(g => {
      const hasSchedule = (g.scheduleDays && g.scheduleDays.length > 0) || (g.schedules && g.schedules.length > 0);
      if (!hasSchedule) {
        groupsWithoutSchedule.push(g);
      }
      if (!g.pricePerSession && !g.monthlyPackagePrice) {
        groupsWithoutPrice.push(g);
      }
      if (g.type === 'online' && (!g.zoomLink || g.zoomLink.trim() === '')) {
        groupsWithoutZoomLink.push(g);
      }
      if (g.type === 'offline' && (!g.address || g.address.trim() === '')) {
        groupsWithoutAddress.push(g);
      }
    });

    const completeStudentsCount = students.length - studentsWithoutParentPhone.length;

    return {
      completeStudentsCount,
      studentsWithoutParentPhone,
      groupsWithoutSchedule,
      groupsWithoutPrice,
      groupsWithoutZoomLink,
      groupsWithoutAddress
    };
  }, [students, groups]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
      <div className={`w-full max-w-md h-full bg-surface shadow-2xl flex flex-col ${isRtl ? 'text-right' : 'text-left'} animate-slide-in-right`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-border bg-surface-hover/30">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-black text-lg text-text">{_t('مركز صحة البيانات', 'Data Health Center')}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-surface-hover rounded-xl text-text-muted hover:text-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
          {/* Complete Students */}
          <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{healthData.completeStudentsCount} {_t('طالب مكتمل البيانات', 'Students with complete data')}</span>
          </div>

          {/* Missing Parent Phone (Students) */}
          {healthData.studentsWithoutParentPhone.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>{healthData.studentsWithoutParentPhone.length} {_t('طلاب بدون رقم ولي أمر', 'Students missing parent phone')}</span>
              </div>
              <div className="space-y-1 pl-6 rtl:pl-0 rtl:pr-6">
                {healthData.studentsWithoutParentPhone.map(st => (
                  <div key={st.id} className="flex items-center justify-between p-2 bg-surface-hover/50 rounded-lg text-xs">
                    <span className="font-medium text-text">{st.name}</span>
                    <button 
                      onClick={() => setSelectedStudent(st)}
                      className="px-3 py-1 bg-amber-500 text-white rounded-md font-bold hover:bg-amber-600 transition-colors cursor-pointer"
                    >
                      {_t('إصلاح', 'Fix Now')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Schedule (Groups) */}
          {healthData.groupsWithoutSchedule.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>{healthData.groupsWithoutSchedule.length} {_t('جروب بدون جدول زمني', 'Groups missing schedule')}</span>
              </div>
              <div className="space-y-1 pl-6 rtl:pl-0 rtl:pr-6">
                {healthData.groupsWithoutSchedule.map(g => (
                  <div key={g.id} className="flex items-center justify-between p-2 bg-surface-hover/50 rounded-lg text-xs">
                    <span className="font-medium text-text">{g.name}</span>
                    <button 
                      onClick={() => setSelectedGroup(g)}
                      className="px-3 py-1 bg-rose-500 text-white rounded-md font-bold hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      {_t('إصلاح', 'Fix Now')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Price (Groups) */}
          {healthData.groupsWithoutPrice.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>{healthData.groupsWithoutPrice.length} {_t('جروب بدون سعر حصة', 'Groups missing session price')}</span>
              </div>
              <div className="space-y-1 pl-6 rtl:pl-0 rtl:pr-6">
                {healthData.groupsWithoutPrice.map(g => (
                  <div key={g.id} className="flex items-center justify-between p-2 bg-surface-hover/50 rounded-lg text-xs">
                    <span className="font-medium text-text">{g.name}</span>
                    <button 
                      onClick={() => setSelectedGroup(g)}
                      className="px-3 py-1 bg-rose-500 text-white rounded-md font-bold hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      {_t('إصلاح', 'Fix Now')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Online Groups Missing Zoom Link */}
          {healthData.groupsWithoutZoomLink.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold">
                <Video className="w-4 h-4" />
                <span>{healthData.groupsWithoutZoomLink.length} {_t('جروب أونلاين بدون رابط زووم', 'Online groups missing Zoom link')}</span>
              </div>
              <div className="space-y-1 pl-6 rtl:pl-0 rtl:pr-6">
                {healthData.groupsWithoutZoomLink.map(g => (
                  <div key={g.id} className="flex items-center justify-between p-2 bg-surface-hover/50 rounded-lg text-xs">
                    <span className="font-medium text-text">{g.name}</span>
                    <button 
                      onClick={() => setSelectedGroup(g)}
                      className="px-3 py-1 bg-sky-500 text-white rounded-md font-bold hover:bg-sky-600 transition-colors cursor-pointer"
                    >
                      {_t('إصلاح', 'Fix Now')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline Groups Missing Location Address */}
          {healthData.groupsWithoutAddress.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                <MapPin className="w-4 h-4" />
                <span>{healthData.groupsWithoutAddress.length} {_t('جروب أوفلاين بدون عنوان المكان', 'Offline groups missing location address')}</span>
              </div>
              <div className="space-y-1 pl-6 rtl:pl-0 rtl:pr-6">
                {healthData.groupsWithoutAddress.map(g => (
                  <div key={g.id} className="flex items-center justify-between p-2 bg-surface-hover/50 rounded-lg text-xs">
                    <span className="font-medium text-text">{g.name}</span>
                    <button 
                      onClick={() => setSelectedGroup(g)}
                      className="px-3 py-1 bg-amber-500 text-white rounded-md font-bold hover:bg-amber-600 transition-colors cursor-pointer"
                    >
                      {_t('إصلاح', 'Fix Now')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Everything Perfect State */}
          {healthData.studentsWithoutParentPhone.length === 0 && 
           healthData.groupsWithoutSchedule.length === 0 && 
           healthData.groupsWithoutPrice.length === 0 && 
           healthData.groupsWithoutZoomLink.length === 0 && 
           healthData.groupsWithoutAddress.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 opacity-70">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <p className="font-bold text-text">{_t('جميع البيانات مكتملة ولا يوجد أي مشاكل!', 'All data is complete, no issues found!')}</p>
            </div>
          )}
        </div>
      </div>

      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          initialTab="edit"
        />
      )}

      {selectedGroup && (
        <GroupProfileModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
};
