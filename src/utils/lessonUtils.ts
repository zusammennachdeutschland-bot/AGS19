export const isPendingStatus = (status: string) => {
  return status !== 'completed' && status !== 'cancelled';
};

export const checkOverlap = (l1: any, l2: any) => {
  if (l1.date !== l2.date) return false;
  if (l1.id === l2.id) return false;
  const getMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const s1 = getMins(l1.time);
  const e1 = s1 + (l1.durationMinutes || 60);
  const s2 = getMins(l2.time);
  const e2 = s2 + (l2.durationMinutes || 60);
  return s1 < e2 && s2 < e1;
};
