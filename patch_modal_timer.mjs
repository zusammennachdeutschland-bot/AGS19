import fs from 'fs';
let code = fs.readFileSync('src/components/LessonControlModal.tsx', 'utf8');

const oldTimerLogic = `  // Persistent Timer Restoration & Calculation (handles background/minimized state)
  useEffect(() => {
    if (!selectedLesson) return;
    const storedStart = localStorage.getItem(timerStartKey);
    const storedAccumulated = Number(localStorage.getItem(timerAccumulatedKey) || '0');

    if (storedStart) {
      const startTime = Number(storedStart);
      const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      setTimerSeconds(storedAccumulated + elapsed);
      setIsTimerRunning(true);
    } else {
      setTimerSeconds(storedAccumulated);
    }
  }, [selectedLesson?.id]);

  // Stopwatch interval timer with Date.now() delta calculation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const updateElapsedTime = () => {
      const storedStart = localStorage.getItem(timerStartKey);
      const storedAccumulated = Number(localStorage.getItem(timerAccumulatedKey) || '0');
      if (storedStart) {
        const startTime = Number(storedStart);
        const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        setTimerSeconds(storedAccumulated + elapsed);
      }
    };

    if (isTimerRunning) {
      updateElapsedTime();
      interval = setInterval(updateElapsedTime, 1000);
      window.addEventListener('visibilitychange', updateElapsedTime);
      window.addEventListener('focus', updateElapsedTime);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('visibilitychange', updateElapsedTime);
      window.removeEventListener('focus', updateElapsedTime);
    };
  }, [isTimerRunning, timerStartKey, timerAccumulatedKey]);`;

const newTimerLogic = `  // Use activeLessonSession from Context for global robust state
  useEffect(() => {
    if (!selectedLesson) return;
    
    // If the active global lesson is the current lesson, use its state
    if (activeLessonSession && activeLessonSession.lessonId === selectedLesson.id) {
      if (activeLessonSession.isRunning) {
        const elapsed = Math.max(0, Math.floor((Date.now() - activeLessonSession.startedAt) / 1000));
        setTimerSeconds(activeLessonSession.accumulatedSeconds + elapsed);
        setIsTimerRunning(true);
      } else {
        setTimerSeconds(activeLessonSession.accumulatedSeconds);
        setIsTimerRunning(false);
      }
    } else {
      // If it's not the active lesson, reset to 0 (or you could load from localforage if you wanted persistent accumulated time per lesson)
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  }, [selectedLesson?.id, activeLessonSession?.startedAt, activeLessonSession?.isRunning, activeLessonSession?.accumulatedSeconds, activeLessonSession?.lessonId]);

  // Stopwatch interval timer with Date.now() delta calculation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const updateElapsedTime = () => {
      if (activeLessonSession && activeLessonSession.lessonId === selectedLesson?.id && activeLessonSession.isRunning) {
        const elapsed = Math.max(0, Math.floor((Date.now() - activeLessonSession.startedAt) / 1000));
        setTimerSeconds(activeLessonSession.accumulatedSeconds + elapsed);
      }
    };

    if (isTimerRunning) {
      updateElapsedTime();
      interval = setInterval(updateElapsedTime, 1000);
      window.addEventListener('visibilitychange', updateElapsedTime);
      window.addEventListener('focus', updateElapsedTime);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('visibilitychange', updateElapsedTime);
      window.removeEventListener('focus', updateElapsedTime);
    };
  }, [isTimerRunning, activeLessonSession, selectedLesson?.id]);`;

code = code.replace(oldTimerLogic, newTimerLogic);

const oldStartLogic = `  const handleStartLesson = () => {
    const now = Date.now();
    localStorage.setItem(timerStartKey, now.toString());
    setIsTimerRunning(true);
    if (selectedLesson) {
      if (selectedLesson.status !== 'completed') {
        updateLesson(selectedLesson.id, { status: 'in_progress' });
      }
      startActiveLessonTimer(selectedLesson);
    }
  };`;

const newStartLogic = `  const handleStartLesson = () => {
    setIsTimerRunning(true);
    if (selectedLesson) {
      if (selectedLesson.status !== 'completed') {
        updateLesson(selectedLesson.id, { status: 'in_progress' });
      }
      if (activeLessonSession && activeLessonSession.lessonId === selectedLesson.id) {
         resumeActiveLessonTimer();
      } else {
         startActiveLessonTimer(selectedLesson);
      }
    }
  };`;
code = code.replace(oldStartLogic, newStartLogic);

const oldPauseLogic = `  const handlePauseLesson = () => {
    const storedStart = localStorage.getItem(timerStartKey);
    const storedAccumulated = Number(localStorage.getItem(timerAccumulatedKey) || '0');
    
    if (storedStart) {
      const elapsed = Math.max(0, Math.floor((Date.now() - Number(storedStart)) / 1000));
      const newAccumulated = storedAccumulated + elapsed;
      localStorage.setItem(timerAccumulatedKey, newAccumulated.toString());
      localStorage.removeItem(timerStartKey);
      setTimerSeconds(newAccumulated);
    }

    setIsTimerRunning(false);
    pauseActiveLessonTimer();
  };`;

const newPauseLogic = `  const handlePauseLesson = () => {
    setIsTimerRunning(false);
    pauseActiveLessonTimer();
  };`;
code = code.replace(oldPauseLogic, newPauseLogic);

fs.writeFileSync('src/components/LessonControlModal.tsx', code);
