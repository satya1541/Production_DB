import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Info } from 'lucide-react';

interface PinSetupProps {
  onCreateVault: (pin: string) => Promise<void>;
  onUnlockVault: (pin: string) => Promise<boolean>;
  hasExistingVault: boolean;
  isLoading: boolean;
}

export function PinSetup({ onCreateVault, onUnlockVault, hasExistingVault, isLoading }: PinSetupProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');

  const handleNumberClick = useCallback((num: string) => {
    if (step === 'enter' && pin.length < 4) {
      setPin(prev => prev + num);
    } else if (step === 'confirm' && confirmPin.length < 4) {
      setConfirmPin(prev => prev + num);
    }
  }, [step, pin.length, confirmPin.length]);

  const handleClear = useCallback(() => {
    if (step === 'enter') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  }, [step]);

  const handleSubmit = useCallback(async () => {
    if (hasExistingVault) {
      // Unlock existing vault
      if (pin.length === 4) {
        const success = await onUnlockVault(pin);
        if (!success) {
          setPin('');
        }
      }
    } else {
      // Create new vault
      if (step === 'enter' && pin.length === 4) {
        setStep('confirm');
      } else if (step === 'confirm' && confirmPin.length === 4) {
        if (pin === confirmPin) {
          await onCreateVault(pin);
        } else {
          // PINs don't match, reset
          setPin('');
          setConfirmPin('');
          setStep('enter');
        }
      }
    }
  }, [hasExistingVault, pin, confirmPin, step, onUnlockVault, onCreateVault]);

  const renderPinDots = () => {
    const currentPin = step === 'confirm' ? confirmPin : pin;
    return (
      <div className="flex justify-center space-x-4 mb-8">
        {[0, 1, 2, 3].map(index => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              index < currentPin.length
                ? 'bg-blue-500 border-blue-500 scale-110'
                : 'border-slate-600 bg-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  const getTitle = () => {
    if (hasExistingVault) {
      return 'Enter Your PIN';
    }
    return step === 'enter' ? 'Create Your PIN' : 'Confirm Your PIN';
  };

  const getDescription = () => {
    if (hasExistingVault) {
      return 'Enter your 4-digit PIN to unlock your vault';
    }
    return step === 'enter' 
      ? 'Choose a 4-digit PIN to secure your password vault'
      : 'Enter your PIN again to confirm';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-800 from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white dark:text-white text-slate-900 mb-2">DNVAULT</h1>
          <p className="text-slate-400 dark:text-slate-400 text-slate-600">Your secure password manager with client-side encryption</p>
        </div>

        {/* PIN Setup Card */}
        <Card className="bg-slate-800/50 dark:bg-slate-800/50 bg-white/80 backdrop-blur-sm border-slate-700/50 dark:border-slate-700/50 border-slate-200/50 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-700/50 dark:bg-slate-700/50 bg-slate-100 rounded-xl mb-4">
                <Lock className="w-6 h-6 text-slate-300 dark:text-slate-300 text-slate-600" />
              </div>
              <h2 className="text-xl font-semibold text-white dark:text-white text-slate-900 mb-2">{getTitle()}</h2>
              <p className="text-slate-400 dark:text-slate-400 text-slate-600 text-sm">{getDescription()}</p>
            </div>

            {/* PIN Dots */}
            {renderPinDots()}

            {/* PIN Keypad */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <Button
                  key={num}
                  variant="outline"
                  size="lg"
                  className="h-16 bg-slate-700/50 dark:bg-slate-700/50 bg-slate-50 border-slate-600 dark:border-slate-600 border-slate-200 hover:bg-slate-600/50 dark:hover:bg-slate-600/50 hover:bg-slate-100 text-white dark:text-white text-slate-900 font-semibold text-lg transition-all duration-200 hover:scale-105"
                  onClick={() => handleNumberClick(num.toString())}
                  disabled={isLoading}
                >
                  {num}
                </Button>
              ))}
              <div></div>
              <Button
                variant="outline"
                size="lg"
                className="h-16 bg-slate-700/50 dark:bg-slate-700/50 bg-slate-50 border-slate-600 dark:border-slate-600 border-slate-200 hover:bg-slate-600/50 dark:hover:bg-slate-600/50 hover:bg-slate-100 text-white dark:text-white text-slate-900 font-semibold text-lg transition-all duration-200 hover:scale-105"
                onClick={() => handleNumberClick('0')}
                disabled={isLoading}
              >
                0
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-16 bg-slate-700/50 dark:bg-slate-700/50 bg-slate-50 border-slate-600 dark:border-slate-600 border-slate-200 hover:bg-red-500/30 text-slate-400 dark:text-slate-400 text-slate-600 hover:text-red-400 transition-all duration-200 hover:scale-105"
                onClick={handleClear}
                disabled={isLoading}
              >
                ⌫
              </Button>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition-colors duration-200 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={
                isLoading || 
                (step === 'enter' && pin.length !== 4) || 
                (step === 'confirm' && confirmPin.length !== 4)
              }
            >
              {isLoading ? (
                'Processing...'
              ) : hasExistingVault ? (
                'Unlock Vault'
              ) : step === 'enter' ? (
                'Continue'
              ) : (
                'Create Vault'
              )}
            </Button>

            {/* Security Notice */}
            <div className="mt-6 flex items-start gap-3 text-sm text-slate-400 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-300 mb-1">Security Notice</p>
                <p>Your PIN will be used to encrypt your passwords. Make sure to remember it as it cannot be recovered.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-500 text-sm">
          © 2025 SecureVault — Your secure password manager
        </div>
      </div>
    </div>
  );
}