import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { PomodoroSettings, PomodoroMode } from '../../types';
import { Play, Pause, RotateCcw, SkipForward, LogIn, Clock4 } from 'lucide-react';
import { formatMinutesToHoursAndMinutes } from '../../utils/formatting';
import { useToast } from '../../hooks/useToast';

interface TaskTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  initialTimeMinutes: number;
  onLogTime: (minutes: number, type: 'pomodoro' | 'stopwatch' | 'manual') => void;
}

const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
};

export const TaskTimerModal: React.FC<TaskTimerModalProps> = ({
  isOpen,
  onClose,
  taskName,
  initialTimeMinutes,
  onLogTime,
}) => {
  const { addToast } = useToast();
  // Pomodoro State
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>('work');
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(pomodoroSettings.workMinutes * 60);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [pomodoroCyclesCompleted, setPomodoroCyclesCompleted] = useState(0);
  const pomodoroTimerRef = useRef<number | null>(null);
  // Simple Stopwatch State
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchActive, setIsStopwatchActive] = useState(false);
  const stopwatchTimerRef = useRef<number | null>(null);
  // Manual Log State
  const [manualLogMinutes, setManualLogMinutes] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (typeof Audio !== "undefined" && !audioRef.current) {
        audioRef.current = new Audio('/assets/sounds/timer-notification.mp3'); 
      }
      // Reset timers when modal opens
      resetPomodoroCycle('work', true); 
      resetStopwatch();
      setManualLogMinutes('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Pomodoro Timer Effect
  useEffect(() => {
    if (isPomodoroActive && pomodoroTimeLeft > 0) {
      pomodoroTimerRef.current = window.setInterval(() => {
        setPomodoroTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (pomodoroTimeLeft === 0 && isPomodoroActive) {
      audioRef.current?.play().catch(e => console.warn("Audio play failed:", e));
      setIsPomodoroActive(false);
      if (pomodoroMode === 'work') {
        onLogTime(pomodoroSettings.workMinutes, 'pomodoro');
        addToast(`Logged ${pomodoroSettings.workMinutes} minutes for Pomodoro work cycle.`, 'success');
        const newCyclesCompleted = pomodoroCyclesCompleted + 1;
        setPomodoroCyclesCompleted(newCyclesCompleted);
        if (newCyclesCompleted % pomodoroSettings.cyclesBeforeLongBreak === 0) {
          setPomodoroMode('longBreak');
          setPomodoroTimeLeft(pomodoroSettings.longBreakMinutes * 60);
        } else {
          setPomodoroMode('shortBreak');
          setPomodoroTimeLeft(pomodoroSettings.shortBreakMinutes * 60);
        }
      } else { // Break ended
        setPomodoroMode('work');
        setPomodoroTimeLeft(pomodoroSettings.workMinutes * 60);
      }
    }
    return () => {
      if (pomodoroTimerRef.current) clearInterval(pomodoroTimerRef.current);
    };
  }, [isPomodoroActive, pomodoroTimeLeft, pomodoroMode, pomodoroSettings, pomodoroCyclesCompleted, onLogTime, addToast]);

  // Stopwatch Timer Effect
  useEffect(() => {
    if (isStopwatchActive) {
      stopwatchTimerRef.current = window.setInterval(() => {
        setStopwatchTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (stopwatchTimerRef.current) clearInterval(stopwatchTimerRef.current);
    }
    return () => {
      if (stopwatchTimerRef.current) clearInterval(stopwatchTimerRef.current);
    };
  }, [isStopwatchActive]);

  const togglePomodoro = () => setIsPomodoroActive(!isPomodoroActive);
  const resetPomodoroCycle = (newMode: PomodoroMode = 'work', resetCycles = false) => {
    setIsPomodoroActive(false);
    setPomodoroMode(newMode);
    if (resetCycles) setPomodoroCyclesCompleted(0);
    if (newMode === 'work') setPomodoroTimeLeft(pomodoroSettings.workMinutes * 60);
    else if (newMode === 'shortBreak') setPomodoroTimeLeft(pomodoroSettings.shortBreakMinutes * 60);
    else setPomodoroTimeLeft(pomodoroSettings.longBreakMinutes * 60);
  };
  const skipPomodoroMode = () => {
    setIsPomodoroActive(false);
    if (pomodoroMode === 'work') {
        const timeWorkedThisCycleMinutes = Math.floor((pomodoroSettings.workMinutes * 60 - pomodoroTimeLeft) / 60);
        if (timeWorkedThisCycleMinutes > 0) {
            onLogTime(timeWorkedThisCycleMinutes, 'pomodoro');
            addToast(`Logged ${timeWorkedThisCycleMinutes} minutes for current Pomodoro cycle.`, 'success');
        }
        const newCyclesCompleted = pomodoroCyclesCompleted + 1;
        setPomodoroCyclesCompleted(newCyclesCompleted);
        if (newCyclesCompleted % pomodoroSettings.cyclesBeforeLongBreak === 0) resetPomodoroCycle('longBreak');
        else resetPomodoroCycle('shortBreak');
    } else {
        resetPomodoroCycle('work');
    }
  };

  const toggleStopwatch = () => setIsStopwatchActive(!isStopwatchActive);
  const resetStopwatch = () => {
    setIsStopwatchActive(false);
    setStopwatchTime(0);
  };
  const logStopwatchTime = () => {
    const minutes = Math.floor(stopwatchTime / 60);
    if (minutes > 0) {
      onLogTime(minutes, 'stopwatch');
      addToast(`Logged ${formatMinutesToHoursAndMinutes(minutes)} from stopwatch.`, 'success');
    } else {
      addToast("No significant time recorded on stopwatch to log.", "info");
    }
    resetStopwatch();
  };

  const handleManualLog = () => {
    const minutes = parseInt(manualLogMinutes, 10);
    if (!isNaN(minutes) && minutes > 0) {
      onLogTime(minutes, 'manual');
      addToast(`Manually logged ${formatMinutesToHoursAndMinutes(minutes)}.`, 'success');
      setManualLogMinutes('');
    } else {
        addToast("Please enter a valid number of minutes.", "warning");
    }
  };

  const formatDisplayTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getPomodoroModeDisplay = () => {
    if (pomodoroMode === 'work') return `Focus: ${taskName}`;
    if (pomodoroMode === 'shortBreak') return "Short Break";
    return "Long Break";
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setPomodoroSettings(prev => ({ ...prev, [name]: numValue }));
      // If changing current mode's duration, reset that mode's timer
      if (name === 'workMinutes' && pomodoroMode === 'work' && !isPomodoroActive) setPomodoroTimeLeft(numValue * 60);
      if (name === 'shortBreakMinutes' && pomodoroMode === 'shortBreak' && !isPomodoroActive) setPomodoroTimeLeft(numValue * 60);
      if (name === 'longBreakMinutes' && pomodoroMode === 'longBreak' && !isPomodoroActive) setPomodoroTimeLeft(numValue * 60);
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Timer & Time Logger" size="xl">
      <p className="text-xs text-muted-light dark:text-muted-dark mb-3">
        Total time logged for <span className="font-semibold text-text-light dark:text-text-dark">{taskName}</span> so far: {formatMinutesToHoursAndMinutes(initialTimeMinutes)}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pomodoro Section */}
        <div className="md:col-span-2 p-4 border rounded-lg dark:border-gray-700">
          <h4 className="text-md font-semibold mb-2 text-center text-indigo-600 dark:text-indigo-400">Pomodoro Timer</h4>
          <div className="text-center mb-3">
            <p className="text-sm text-muted-light dark:text-muted-dark">{getPomodoroModeDisplay()}</p>
            <p className="text-5xl font-mono font-bold text-text-light dark:text-text-dark">{formatDisplayTime(pomodoroTimeLeft)}</p>
          </div>
          <div className="flex justify-center space-x-2 mb-2">
            <Button onClick={togglePomodoro} size="md" variant={isPomodoroActive ? "secondary" : "primary"} leftIcon={isPomodoroActive ? <Pause size={16} /> : <Play size={16} />}>
              {isPomodoroActive ? 'Pause' : 'Start'} {pomodoroMode === 'work' ? 'Work' : 'Break'}
            </Button>
            <Button onClick={() => resetPomodoroCycle(pomodoroMode)} size="md" variant="outline" leftIcon={<RotateCcw size={16}/>}>Reset</Button>
            <Button onClick={skipPomodoroMode} size="md" variant="outline" leftIcon={<SkipForward size={16}/>}>Skip</Button>
          </div>
          <p className="text-xs text-muted-light dark:text-muted-dark text-center">Pomodoros completed this session: {pomodoroCyclesCompleted}</p>
          
          <details className="mt-3 text-xs text-muted-light dark:text-muted-dark">
            <summary className="cursor-pointer hover:underline">Pomodoro Settings</summary>
            <div className="grid grid-cols-2 gap-2 mt-1 p-2 bg-gray-50 dark:bg-gray-750 rounded">
              <Input type="number" label="Work (min)" name="workMinutes" value={pomodoroSettings.workMinutes.toString()} onChange={handleSettingsChange} className="text-xs p-1"/>
              <Input type="number" label="Short Break (min)" name="shortBreakMinutes" value={pomodoroSettings.shortBreakMinutes.toString()} onChange={handleSettingsChange} className="text-xs p-1"/>
              <Input type="number" label="Long Break (min)" name="longBreakMinutes" value={pomodoroSettings.longBreakMinutes.toString()} onChange={handleSettingsChange} className="text-xs p-1"/>
              <Input type="number" label="Cycles for Long Break" name="cyclesBeforeLongBreak" value={pomodoroSettings.cyclesBeforeLongBreak.toString()} onChange={handleSettingsChange} className="text-xs p-1"/>
            </div>
          </details>
        </div>

        {/* Stopwatch & Manual Log Section */}
        <div className="md:col-span-1 p-4 border rounded-lg dark:border-gray-700 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-md font-semibold mb-2 text-center text-green-600 dark:text-green-400">Simple Stopwatch</h4>
             <div className="text-center mb-2">
                <p className="text-4xl font-mono font-bold text-text-light dark:text-text-dark">{formatDisplayTime(stopwatchTime)}</p>
            </div>
            <div className="flex justify-center space-x-2 mb-1">
                <Button onClick={toggleStopwatch} size="sm" variant={isStopwatchActive ? "secondary" : "primary"} leftIcon={isStopwatchActive ? <Pause size={14} /> : <Play size={14} />}>{isStopwatchActive ? 'Pause' : 'Start'}</Button>
                <Button onClick={resetStopwatch} size="sm" variant="outline" leftIcon={<RotateCcw size={14}/>}>Reset</Button>
                <Button onClick={logStopwatchTime} size="sm" variant="outline" leftIcon={<LogIn size={14}/>} disabled={stopwatchTime === 0 && !isStopwatchActive}>Log Time</Button>
            </div>
          </div>
          <hr className="dark:border-gray-600"/>
          <div>
            <h4 className="text-md font-semibold mb-2">Manually Log Time</h4>
            <div className="flex items-center space-x-2">
                <Input
                    type="number"
                    id="manualTimeLog"
                    value={manualLogMinutes}
                    onChange={(e) => setManualLogMinutes(e.target.value)}
                    placeholder="Minutes spent"
                    min="1"
                    className="h-9 text-sm"
                />
                <Button onClick={handleManualLog} disabled={!manualLogMinutes || parseInt(manualLogMinutes) <=0} leftIcon={<LogIn size={14}/>} className="h-9">Log</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
         <Button variant="primary" onClick={onClose} leftIcon={<Clock4 size={16}/>}>Done With Timers</Button>
      </div>
    </Modal>
  );
};
