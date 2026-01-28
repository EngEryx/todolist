'use client';

import { useState, useRef, useEffect } from 'react';
import { hashPin, verifyPin, isValidPin } from '@/lib/pin';
import { getPinHash, savePinHash, hasPin } from '@/lib/storage';

interface PinGateProps {
  onSuccess: () => void;
}

export default function PinGate({ onSuccess }: PinGateProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [isSetup, setIsSetup] = useState(false);
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setIsSetup(!hasPin());
    setLoading(false);
  }, []);

  const handleInput = (
    index: number,
    value: string,
    isConfirm: boolean = false
  ) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = isConfirm ? [...confirmPin] : [...pin];
    newPin[index] = value.slice(-1);

    if (isConfirm) {
      setConfirmPin(newPin);
    } else {
      setPin(newPin);
    }
    setError('');

    if (value && index < 3) {
      const refs = isConfirm ? confirmRefs : inputRefs;
      refs.current[index + 1]?.focus();
    }

    const fullPin = newPin.join('');
    if (fullPin.length === 4) {
      if (isSetup) {
        if (isConfirm) {
          handleConfirmSetup(fullPin);
        } else {
          setStep('confirm');
          setTimeout(() => confirmRefs.current[0]?.focus(), 100);
        }
      } else {
        handleVerify(fullPin);
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent,
    isConfirm: boolean = false
  ) => {
    if (e.key === 'Backspace') {
      const currentPin = isConfirm ? confirmPin : pin;
      if (!currentPin[index] && index > 0) {
        const refs = isConfirm ? confirmRefs : inputRefs;
        refs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async (fullPin: string) => {
    const storedHash = getPinHash();
    if (!storedHash) return;

    const valid = await verifyPin(fullPin, storedHash);
    if (valid) {
      onSuccess();
    } else {
      setError('Incorrect PIN');
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleConfirmSetup = async (fullConfirmPin: string) => {
    const originalPin = pin.join('');
    if (fullConfirmPin !== originalPin) {
      setError('PINs do not match');
      setConfirmPin(['', '', '', '']);
      confirmRefs.current[0]?.focus();
      return;
    }

    if (!isValidPin(fullConfirmPin)) {
      setError('Invalid PIN');
      return;
    }

    const hash = await hashPin(fullConfirmPin);
    savePinHash(hash);
    onSuccess();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl font-light tracking-tight mb-2">void</div>
          <p className="text-gray-500 text-sm">
            {isSetup
              ? step === 'enter'
                ? 'Create a 4-digit PIN to protect your tasks'
                : 'Confirm your PIN'
              : 'Enter your PIN to continue'}
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {(step === 'confirm' ? confirmPin : pin).map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                if (step === 'confirm') {
                  confirmRefs.current[index] = el;
                } else {
                  inputRefs.current[index] = el;
                }
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(index, e.target.value, step === 'confirm')}
              onKeyDown={(e) => handleKeyDown(index, e, step === 'confirm')}
              className="pin-input"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-red-500 text-sm mb-4">{error}</p>
        )}

        {isSetup && step === 'confirm' && (
          <button
            onClick={() => {
              setStep('enter');
              setConfirmPin(['', '', '', '']);
              setError('');
            }}
            className="w-full text-center text-gray-500 text-sm hover:text-foreground transition-colors"
          >
            Go back
          </button>
        )}
      </div>
    </div>
  );
}
