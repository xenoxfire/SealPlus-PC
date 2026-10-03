import React, { useState } from 'react';
import { Lock, Delete, ShieldAlert } from 'lucide-react';

interface LockScreenProps {
  correctPin: string;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ correctPin, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    setError(false);

    if (next === correctPin) {
      onUnlock();
    } else if (next.length === correctPin.length) {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 700);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 text-white select-none">
      <div className="w-full max-w-xs text-center space-y-6">
        
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30 shadow-lg shadow-rose-500/10">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Seal Plus Locked</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your Security PIN to access</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center space-x-3 py-2">
          {Array.from({ length: correctPin.length || 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                error 
                  ? 'bg-rose-500 scale-110 animate-bounce' 
                  : i < pin.length 
                    ? 'bg-sky-400 scale-105' 
                    : 'bg-slate-800 border border-slate-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-400 font-semibold animate-pulse">Incorrect PIN. Try again.</p>
        )}

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num.toString())}
              className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-lg font-bold text-white active:scale-95 transition-all border border-slate-800/80 shadow-sm"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-lg font-bold text-white active:scale-95 transition-all border border-slate-800/80 shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center active:scale-95 transition-all border border-slate-800/80"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
