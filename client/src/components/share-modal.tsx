import { useState } from 'react';
import { PasswordEntry } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Link, Copy, Clock, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  password: PasswordEntry | null;
}

export function ShareModal({ isOpen, onClose, password }: ShareModalProps) {
  const [expiration, setExpiration] = useState('24hours');
  const [shareLink, setShareLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  if (!password) return null;

  const getServiceLogo = () => {
    const firstLetter = password.serviceName.charAt(0).toUpperCase();
    const colors = [
      'bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600',
      'bg-orange-600', 'bg-pink-600', 'bg-indigo-600', 'bg-cyan-600'
    ];
    const colorIndex = password.serviceName.charCodeAt(0) % colors.length;
    
    // If URL is available, try to get favicon
    if (password.url) {
      try {
        const urlObj = new URL(password.url);
        const hostname = urlObj.hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
        
        return (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white dark:bg-white bg-slate-100">
            <img 
              src={faviconUrl}
              alt={`${password.serviceName} logo`}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                // Fallback to letter-based logo on error
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className={`hidden w-10 h-10 ${colors[colorIndex]} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
              {firstLetter}
            </div>
          </div>
        );
      } catch {
        // Fall through to letter-based logo
      }
    }
    
    // Fallback to letter-based logo
    return (
      <div className={`w-10 h-10 ${colors[colorIndex]} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
        {firstLetter}
      </div>
    );
  };

  const generateShareLink = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passwordData: {
            serviceName: password.serviceName,
            username: password.username,
            password: password.password,
            url: password.url,
            notes: password.notes,
          },
          expiresAt: getExpirationTime().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create share link');
      }

      const { shareId } = await response.json();
      const baseUrl = window.location.origin;
      const shareLink = `${baseUrl}/share/${shareId}`;
      
      setShareLink(shareLink);
      
      toast({
        title: "Share Link Generated",
        description: "Secure link has been created successfully.",
      });
    } catch (error) {
      console.error('Failed to generate share link:', error);
      toast({
        title: "Error",
        description: "Failed to generate share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: "Copied",
        description: "Share link copied to clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const getExpirationTime = () => {
    const now = new Date();
    switch (expiration) {
      case '1hour':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case '24hours':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case '7days':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  };

  const handleClose = () => {
    setShareLink('');
    setExpiration('24hours');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-black dark:text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Share Credential</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Info */}
          <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
            {getServiceLogo()}
            <div>
              <h3 className="font-semibold">{password.serviceName}</h3>
              <p className="text-sm text-slate-400">{password.username}</p>
            </div>
          </div>

          {!shareLink ? (
            <>
              {/* Expiration Options */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Share expiration</Label>
                <RadioGroup value={expiration} onValueChange={setExpiration}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1hour" id="1hour" className="border-slate-600 text-blue-600" />
                    <Label htmlFor="1hour" className="text-sm cursor-pointer">1 hour</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="24hours" id="24hours" className="border-slate-600 text-blue-600" />
                    <Label htmlFor="24hours" className="text-sm cursor-pointer">24 hours</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="7days" id="7days" className="border-slate-600 text-blue-600" />
                    <Label htmlFor="7days" className="text-sm cursor-pointer">7 days</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Warning */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-orange-200">
                    <p className="font-medium mb-1">Security Warning</p>
                    <p>This will create a secure link that allows anyone with the link to view this credential until it expires. Only share with trusted contacts.</p>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={generateShareLink}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    'Generating...'
                  ) : (
                    <>
                      <Link className="w-4 h-4 mr-2" />
                      Generate Link
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Generated Link */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-400">
                  <Link className="w-4 h-4" />
                  <span className="text-sm font-medium">Share link generated successfully</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Secure share link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={shareLink}
                      readOnly
                      className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={copyShareLink}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Expiration Info */}
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      Expires on {getExpirationTime().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <Button
                className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                onClick={handleClose}
              >
                Done
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
