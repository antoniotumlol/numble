import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, RotateCcw, Trophy, HelpCircle, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NumberTile from '@/components/game/NumberTile';
import OperationButton from '@/components/game/OperationButton';
import StarRating from '@/components/game/StarRating';
import PuzzleTab from '@/components/game/PuzzleTab';
import TargetDisplay from '@/components/game/TargetDisplay';
import CurrentOperation from '@/components/game/CurrentOperation';
import OperationHistory from '@/components/game/OperationHistory';
import HelpDialog from '@/components/game/HelpDialog';
import ShareDialog from '@/components/game/ShareDialog';

// Seeded random number generator
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate puzzles for today
function generateDailyPuzzles() {
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  const puzzles = [];
  
  for (let p = 0; p < 5; p++) {
    let seed = dateSeed * 100 + p;
    
    // Generate 6 starting numbers (1-25)
    const numbers = [];
    for (let i = 0; i < 6; i++) {
      numbers.push(Math.floor(seededRandom(seed + i * 7) * 25) + 1);
    }
    
    // Generate a target that's achievable
    // We'll combine some numbers to create a reachable target
    seed += 100;
    const ops = ['+', '-', '*'];
    
    // Start with first two numbers
    let result = numbers[0];
    const usedIndices = [0];
    
    // Apply 2-4 operations to get a target
    const numOps = 2 + Math.floor(seededRandom(seed + 50) * 3);
    
    for (let i = 0; i < numOps && usedIndices.length < 6; i++) {
      const availableIndices = [1, 2, 3, 4, 5].filter(idx => !usedIndices.includes(idx));
      if (availableIndices.length === 0) break;
      
      const nextIdx = availableIndices[Math.floor(seededRandom(seed + i * 13) * availableIndices.length)];
      const op = ops[Math.floor(seededRandom(seed + i * 17) * ops.length)];
      
      const nextNum = numbers[nextIdx];
      usedIndices.push(nextIdx);
      
      switch (op) {
        case '+':
          result = result + nextNum;
          break;
        case '-':
          result = Math.abs(result - nextNum);
          break;
        case '*':
          result = result * nextNum;
          break;
      }
    }
    
    // Ensure target is reasonable (between 1 and 999)
    let target = Math.max(1, Math.min(999, Math.abs(result)));
    
    // Ensure target is not among the starting numbers
    while (numbers.includes(target)) {
      // If target is in the starting numbers, adjust it
      if (target < 999) {
        target++;
      } else {
        target--;
      }
    }
    
    puzzles.push({
      id: p,
      target,
      startingNumbers: numbers
    });
  }
  
  return puzzles;
}

function calculateStars(target, closest) {
  if (closest === null) return 0;
  const diff = Math.abs(target - closest);
  if (diff === 0) return 3;
  if (diff <= 10) return 2;
  if (diff <= 25) return 1;
  return 0;
}

// Get today's date key for localStorage
function getTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

// Load saved progress from localStorage
function loadSavedProgress(puzzles) {
  try {
    const savedData = localStorage.getItem('numble-progress');
    if (!savedData) return null;
    
    const { date, puzzleStates, activePuzzle } = JSON.parse(savedData);
    
    // Check if saved data is from today
    if (date !== getTodayKey()) {
      // Clear old data
      localStorage.removeItem('numble-progress');
      return null;
    }
    
    return { puzzleStates, activePuzzle };
  } catch (error) {
    console.error('Error loading saved progress:', error);
    return null;
  }
}

// Save progress to localStorage
function saveProgress(puzzleStates, activePuzzle) {
  try {
    const data = {
      date: getTodayKey(),
      puzzleStates,
      activePuzzle
    };
    localStorage.setItem('numble-progress', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

export default function Game() {
  const puzzles = useMemo(() => generateDailyPuzzles(), []);
  
  const [helpOpen, setHelpOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  // Load saved progress or initialize new state
  const [puzzleStates, setPuzzleStates] = useState(() => {
    const saved = loadSavedProgress(puzzles);
    if (saved) {
      return saved.puzzleStates;
    }
    return puzzles.map(puzzle => ({
      numbers: puzzle.startingNumbers.map((n, i) => ({ value: n, id: i, isOriginal: true, used: false })),
      history: [],
      selectedFirst: null,
      selectedOperation: null
    }));
  });

  const [activePuzzle, setActivePuzzle] = useState(() => {
    const saved = loadSavedProgress(puzzles);
    return saved ? saved.activePuzzle : 0;
  });

  const currentPuzzle = puzzles[activePuzzle];
  const currentState = puzzleStates[activePuzzle];

  const availableNumbers = currentState.numbers.filter(n => !n.used);
  const closestNumber = useMemo(() => {
    const nums = currentState.numbers.filter(n => !n.used).map(n => n.value);
    if (nums.length === 0) return null;
    return nums.reduce((closest, num) => 
      Math.abs(num - currentPuzzle.target) < Math.abs(closest - currentPuzzle.target) ? num : closest
    );
  }, [currentState.numbers, currentPuzzle.target]);

  const stars = calculateStars(currentPuzzle.target, closestNumber);
  const isComplete = closestNumber === currentPuzzle.target;

  useEffect(() => {
    if (closestNumber === currentPuzzle.target && activePuzzle < puzzles.length - 1) {
      setTimeout(() => {
        setActivePuzzle(prev => prev + 1);
      }, 1000);
    } else if (activePuzzle === puzzles.length - 1 && isComplete && closestNumber === currentPuzzle.target) {
        setShareOpen(true);
    }
  }, [closestNumber, currentPuzzle.target, activePuzzle, puzzles.length, isComplete]);

  // Save progress whenever state changes
  useEffect(() => {
    saveProgress(puzzleStates, activePuzzle);
  }, [puzzleStates, activePuzzle]);

  const updateCurrentState = useCallback((updater) => {
    setPuzzleStates(prev => {
      const newStates = [...prev];
      newStates[activePuzzle] = typeof updater === 'function' 
        ? updater(newStates[activePuzzle]) 
        : { ...newStates[activePuzzle], ...updater };
      return newStates;
    });
  }, [activePuzzle]);

  const handleNumberClick = (numberObj) => {
    if (numberObj.used) return;

    if (currentState.selectedFirst === null) {
      // Select first number
      updateCurrentState({ selectedFirst: numberObj });
    } else if (currentState.selectedFirst.id === numberObj.id) {
      // Deselect if clicking same number
      updateCurrentState({ selectedFirst: null, selectedOperation: null });
    } else if (currentState.selectedOperation === null) {
      // Change first number if no operation selected
      updateCurrentState({ selectedFirst: numberObj });
    } else {
      // Perform calculation
      const a = currentState.selectedFirst.value;
      const b = numberObj.value;
      let result;

      switch (currentState.selectedOperation) {
        case 'add':
          result = a + b;
          break;
        case 'subtract':
          result = a - b;
          if (result < 0) return; // No negative numbers allowed
          break;
        case 'multiply':
          result = a * b;
          break;
        case 'divide':
          if (b === 0 || a % b !== 0) return; // Invalid division
          result = a / b;
          break;
        default:
          return;
      }

      updateCurrentState(state => ({
        numbers: state.numbers.map(n => {
          if (n.id === state.selectedFirst.id) {
            return { ...n, value: result };
          }
          if (n.id === numberObj.id) {
            return { ...n, used: true };
          }
          return n;
        }),
        history: [...state.history, {
          firstId: state.selectedFirst.id,
          secondId: numberObj.id,
          firstValue: state.selectedFirst.value,
          secondValue: numberObj.value,
          operation: state.selectedOperation,
          result: result
        }],
        selectedFirst: null,
        selectedOperation: null
      }));
    }
  };

  const handleOperationClick = (operation) => {
    if (currentState.selectedFirst === null) return;
    
    if (currentState.selectedOperation === operation) {
      updateCurrentState({ selectedOperation: null });
    } else {
      updateCurrentState({ selectedOperation: operation });
    }
  };

  const handleUndo = () => {
    if (currentState.selectedFirst !== null || currentState.selectedOperation !== null) {
      // Cancel current input
      updateCurrentState({ selectedFirst: null, selectedOperation: null });
    } else if (currentState.history.length > 0) {
      // Undo last operation
      const lastAction = currentState.history[currentState.history.length - 1];
      updateCurrentState(state => ({
        numbers: state.numbers.map(n => {
          if (n.id === lastAction.firstId) {
            return { ...n, value: lastAction.firstValue };
          }
          if (n.id === lastAction.secondId) {
            return { ...n, used: false };
          }
          return n;
        }),
        history: state.history.slice(0, -1),
        selectedFirst: null,
        selectedOperation: null
      }));
    }
  };

  const handleReset = () => {
    updateCurrentState({
      numbers: currentPuzzle.startingNumbers.map((n, i) => ({ value: n, id: i, isOriginal: true, used: false })),
      history: [],
      selectedFirst: null,
      selectedOperation: null
    });
  };

  const canUndo = currentState.selectedFirst !== null || 
                  currentState.selectedOperation !== null || 
                  currentState.history.length > 0;

  const totalStars = puzzleStates.reduce((sum, state, idx) => {
    const puzzle = puzzles[idx];
    const nums = state.numbers.filter(n => !n.used).map(n => n.value);
    if (nums.length === 0) return sum;
    const closest = nums.reduce((c, n) => 
      Math.abs(n - puzzle.target) < Math.abs(c - puzzle.target) ? n : c
    );
    return sum + calculateStars(puzzle.target, closest);
  }, 0);

  return (
    <div className="min-h-screen bg-[#0f0d1a] flex flex-col overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/30 via-transparent to-blue-950/30 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-screen max-h-screen p-3 sm:p-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              NUMBLE
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">Daily Math Puzzle</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHelpOpen(true)}
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShareOpen(true)}
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            {showInstallButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleInstallClick}
                className="h-8 w-8 text-amber-400 hover:text-white hover:bg-slate-800/50"
                title="Install App"
              >
                <Download className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">{totalStars}</span>
              <span className="text-xs text-slate-500">/ 15</span>
            </div>
          </div>
        </header>

        {/* Puzzle Tabs */}
        <div className="flex justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
          {puzzles.map((puzzle, idx) => {
            const state = puzzleStates[idx];
            const nums = state.numbers.filter(n => !n.used).map(n => n.value);
            const closest = nums.length > 0 ? nums.reduce((c, n) => 
              Math.abs(n - puzzle.target) < Math.abs(c - puzzle.target) ? n : c
            ) : null;
            const tabStars = calculateStars(puzzle.target, closest);
            
            return (
              <PuzzleTab
                key={idx}
                index={idx}
                isActive={activePuzzle === idx}
                stars={tabStars}
                onClick={() => setActivePuzzle(idx)}
              />
            );
          })}
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col items-center justify-between min-h-0">
          {/* Target Display */}
          <TargetDisplay 
            target={currentPuzzle.target} 
            closest={closestNumber}
            isComplete={isComplete}
          />

          {/* Star Rating */}
          <div className="my-0 sm:my-4">
            <StarRating stars={stars} size="large" />
          </div>

          {/* Operation History */}
          <div className="mb-2 sm:mb-4 w-full px-4">
            <OperationHistory history={currentState.history} />
          </div>

          {/* Current Operation Display */}
          <div className="h-10 sm:h-14 mb-1 sm:mb-4">
            <AnimatePresence>
              <CurrentOperation 
                firstNumber={currentState.selectedFirst?.value}
                operation={currentState.selectedOperation}
                isActive={currentState.selectedFirst !== null}
              />
            </AnimatePresence>
          </div>

          {/* Numbers Grid */}
          <div className="flex flex-row justify-center gap-1 sm:gap-3 mb-1 sm:mb-6">
            <AnimatePresence mode="popLayout">
              {currentState.numbers.map((numObj) => (
                <motion.div
                  key={numObj.id}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <NumberTile
                    number={numObj.value}
                    isSelected={currentState.selectedFirst?.id === numObj.id}
                    isUsed={numObj.used}
                    isResult={!numObj.isOriginal}
                    onClick={() => handleNumberClick(numObj)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Operations */}
          <div className="flex gap-1 sm:gap-3 mb-1 sm:mb-6">
            {[
              { op: 'add', symbol: '+' },
              { op: 'subtract', symbol: '−' },
              { op: 'multiply', symbol: '×' },
              { op: 'divide', symbol: '÷' }
            ].map(({ op, symbol }) => (
              <OperationButton
                key={op}
                operation={op}
                symbol={symbol}
                isSelected={currentState.selectedOperation === op}
                onClick={() => handleOperationClick(op)}
                disabled={currentState.selectedFirst === null}
              />
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleUndo}
              disabled={!canUndo}
              className="bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              className="bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-2">
          <p className="text-[10px] sm:text-xs text-slate-600">
            New puzzles every day at midnight
          </p>
        </footer>
      </div>

      {/* Help Dialog */}
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      {/* Share Dialog */}
      <ShareDialog 
        open={shareOpen} 
        onOpenChange={setShareOpen} 
        stars={totalStars} 
        title={totalStars === 15 ? "Congratulations!" : "Share your result"}
        icon={totalStars === 15 ? <Trophy className="w-6 h-6 text-amber-400" /> : null}
      />
    </div>
  );
}
