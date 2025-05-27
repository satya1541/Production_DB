import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Key, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Database,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';
import { hashPin } from '@/lib/crypto';
import { apiRequest } from '@/lib/queryClient';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  passwords: any[];
  currentUserId: number | null;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onChangePIN: (oldPin: string, newPin: string) => Promise<void>;
  onClearVault: () => Promise<void>;
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  passwords, 
  currentUserId,
  onExportData,
  onImportData,
  onChangePIN,
  onClearVault
}: SettingsModalProps) {
  const [isChangingPIN, setIsChangingPIN] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleChangePIN = async () => {
    if (newPin !== confirmPin) {
      toast({
        title: "Error",
        description: "New PIN and confirmation don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({
        title: "Error",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChangingPIN(true);
      await onChangePIN(oldPin, newPin);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      toast({
        title: "PIN Changed",
        description: "Your PIN has been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change PIN. Please check your current PIN.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPIN(false);
    }
  };

  const handleClearVault = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: "Error",
        description: "Please type DELETE to confirm",
        variant: "destructive",
      });
      return;
    }

    try {
      await onClearVault();
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      onClose();
      toast({
        title: "Vault Cleared",
        description: "All passwords have been permanently deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear vault",
        variant: "destructive",
      });
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.name.endsWith('.json')) {
        toast({
          title: "Invalid File",
          description: "Please select a valid JSON backup file",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: "Backup file must be smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      onImportData(file);
      event.target.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            Vault Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm py-2">Security</TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs sm:text-sm py-2">Appearance</TabsTrigger>
            <TabsTrigger value="backup" className="text-xs sm:text-sm py-2">Backup</TabsTrigger>
            <TabsTrigger value="danger" className="text-xs sm:text-sm py-2">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Vault Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">Total Passwords</Label>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {passwords.length}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">Database Status</Label>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">User ID</Label>
                  <div className="text-sm text-muted-foreground">#{currentUserId}</div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Encryption Status</Label>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      All data encrypted with AES-256-GCM
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Last Activity</Label>
                  <div className="text-sm text-muted-foreground">
                    Session active since vault unlock
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Change PIN
                </CardTitle>
                <CardDescription>
                  Update your 4-digit security PIN. This will re-encrypt all your data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old-pin" className="text-xs sm:text-sm">Current PIN</Label>
                  <Input
                    id="old-pin"
                    type="password"
                    placeholder="Enter current PIN"
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value)}
                    maxLength={4}
                    className="font-mono text-center text-sm sm:text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-pin" className="text-xs sm:text-sm">New PIN</Label>
                  <Input
                    id="new-pin"
                    type="password"
                    placeholder="Enter new 4-digit PIN"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    maxLength={4}
                    className="font-mono text-center text-sm sm:text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-pin" className="text-xs sm:text-sm">Confirm New PIN</Label>
                  <Input
                    id="confirm-pin"
                    type="password"
                    placeholder="Confirm new PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    maxLength={4}
                    className="font-mono text-center text-sm sm:text-base"
                  />
                </div>
                
                <Button 
                  onClick={handleChangePIN}
                  disabled={isChangingPIN || !oldPin || !newPin || !confirmPin}
                  className="w-full text-sm"
                >
                  {isChangingPIN ? (
                    <>
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                      <span className="text-xs sm:text-sm">Changing PIN...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="text-xs sm:text-sm">Change PIN</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Session Security
                </CardTitle>
                <CardDescription>
                  Manage your current session and security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Current Session</Label>
                    <p className="text-xs text-muted-foreground">
                      Vault is currently unlocked and active
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Browser Storage</Label>
                      <p className="text-xs text-muted-foreground">
                        No sensitive data stored in browser
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                      Secure
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Theme Preferences
                </CardTitle>
                <CardDescription>
                  Customize the appearance of your vault interface.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Theme Mode</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => setTheme('light')}
                      className="flex items-center gap-2 justify-start h-auto p-4"
                    >
                      <Sun className="w-4 h-4" />
                      <div className="text-left">
                        <div className="font-medium">Light</div>
                        <div className="text-xs text-muted-foreground">Clean and bright interface</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setTheme('dark')}
                      className="flex items-center gap-2 justify-start h-auto p-4"
                    >
                      <Moon className="w-4 h-4" />
                      <div className="text-left">
                        <div className="font-medium">Dark</div>
                        <div className="text-xs text-muted-foreground">Easy on the eyes</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      onClick={() => setTheme('system')}
                      className="flex items-center gap-2 justify-start h-auto p-4"
                    >
                      <Monitor className="w-4 h-4" />
                      <div className="text-left">
                        <div className="font-medium">System</div>
                        <div className="text-xs text-muted-foreground">Follow system preference</div>
                      </div>
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Current Theme</Label>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {theme === 'light' && <Sun className="w-4 h-4 text-yellow-500" />}
                    {theme === 'dark' && <Moon className="w-4 h-4 text-blue-500" />}
                    {theme === 'system' && <Monitor className="w-4 h-4 text-gray-500" />}
                    <span className="text-sm capitalize">{theme} mode active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Data
                </CardTitle>
                <CardDescription>
                  Download an encrypted backup of your vault data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={onExportData} className="w-full text-sm">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="text-xs sm:text-sm">Export Vault Data</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                  Import Data
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Import passwords from an encrypted backup file.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <AlertDescription className="text-xs sm:text-sm">
                      Importing will merge with existing passwords. Duplicates will be updated.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">JSON files only</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".json"
                        onChange={handleFileImport}
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger" className="space-y-4">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that will permanently delete your data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This action cannot be undone. This will permanently delete all passwords and vault data.
                  </AlertDescription>
                </Alert>
                
                {!showDeleteConfirm ? (
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Entire Vault
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="delete-confirm">
                        Type <code className="bg-red-100 dark:bg-red-900 px-1 py-0.5 rounded text-sm">DELETE</code> to confirm
                      </Label>
                      <Input
                        id="delete-confirm"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="border-red-300 dark:border-red-600"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="destructive" 
                        onClick={handleClearVault}
                        disabled={deleteConfirmText !== 'DELETE'}
                        className="flex-1 text-xs sm:text-sm"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        <span className="hidden sm:inline">Permanently Delete All Data</span>
                        <span className="sm:hidden">Delete All Data</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                        }}
                        className="flex-1 text-xs sm:text-sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}