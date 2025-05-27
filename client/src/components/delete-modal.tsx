import { PasswordEntry } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  password: PasswordEntry | null;
}

export function DeleteModal({ isOpen, onClose, onConfirm, password }: DeleteModalProps) {
  if (!password) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-red-400">Confirm Delete</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning Icon and Message */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Delete "{password.serviceName}" password?</h3>
              <p className="text-slate-400 text-sm">
                This action cannot be undone. The password for {password.serviceName} will be permanently deleted from your vault.
              </p>
            </div>
          </div>

          {/* Service Info */}
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-sm text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Service:</span>
                <span>{password.serviceName}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-400">Username:</span>
                <span className="font-mono">{password.username}</span>
              </div>
              {password.url && (
                <div className="flex justify-between mt-1">
                  <span className="text-slate-400">URL:</span>
                  <span className="text-blue-400">{password.url}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirm}
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
