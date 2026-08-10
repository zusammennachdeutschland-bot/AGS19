import fs from 'fs';
let code = fs.readFileSync('src/components/LessonControlModal.tsx', 'utf8');

const regexTimerLogic = /\/\/ Persistent Timer Restoration & Calculation[\s\S]*?\}, \[isTimerRunning, timerStartKey, timerAccumulatedKey\]\);/;

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

code = code.replace(regexTimerLogic, newTimerLogic);

const regexPauseLogic = /const handlePauseLesson = \(\) => \{[\s\S]*?pauseActiveLessonTimer\(\);\n  \};/;
const newPauseLogic = `const handlePauseLesson = () => {
    setIsTimerRunning(false);
    pauseActiveLessonTimer();
  };`;
  
code = code.replace(regexPauseLogic, newPauseLogic);

fs.writeFileSync('src/components/LessonControlModal.tsx', code);
