import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordEntry, InsertPasswordEntry, insertPasswordEntrySchema } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Globe, RefreshCw, Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import { generatePassword, calculatePasswordStrength, PasswordGeneratorOptions } from '@/lib/password-generator';
import { useWebsiteMetadata } from '@/hooks/use-website-metadata';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (password: InsertPasswordEntry) => Promise<void>;
  editingPassword?: PasswordEntry;
}

export function PasswordModal({ isOpen, onClose, onSave, editingPassword }: PasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [generatorOptions, setGeneratorOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false,
  });
  
  const { metadata, fetchMetadata } = useWebsiteMetadata();

  const form = useForm<InsertPasswordEntry>({
    resolver: zodResolver(insertPasswordEntrySchema.extend({
      url: insertPasswordEntrySchema.shape.url.optional(),
    })),
    defaultValues: {
      serviceName: '',
      url: '',
      username: '',
      password: '',
      notes: '',
    },
  });

  const watchedPassword = form.watch('password');
  const watchedUrl = form.watch('url');
  const passwordStrength = calculatePasswordStrength(watchedPassword || '');

  // Auto-fetch metadata when URL changes
  useEffect(() => {
    if (watchedUrl && watchedUrl.trim() && !editingPassword) {
      const timeoutId = setTimeout(() => {
        fetchMetadata(watchedUrl);
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [watchedUrl, fetchMetadata, editingPassword]);

  // Auto-fill service name from metadata
  useEffect(() => {
    if (metadata.title && !editingPassword && !form.getValues('serviceName')) {
      form.setValue('serviceName', metadata.title);
    }
  }, [metadata.title, form, editingPassword]);

  // Reset form when modal opens/closes or editing password changes
  useEffect(() => {
    if (isOpen) {
      if (editingPassword) {
        form.reset({
          serviceName: editingPassword.serviceName,
          url: editingPassword.url || '',
          username: editingPassword.username,
          password: editingPassword.password,
          notes: editingPassword.notes || '',
        });
      } else {
        form.reset({
          serviceName: '',
          url: '',
          username: '',
          password: '',
          notes: '',
        });
      }
    }
  }, [isOpen, editingPassword, form]);

  const handleGeneratePassword = () => {
    try {
      const newPassword = generatePassword(generatorOptions);
      form.setValue('password', newPassword);
    } catch (error) {
      console.error('Failed to generate password:', error);
    }
  };

  const handleSubmit = async (data: InsertPasswordEntry) => {
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Failed to save password:', error);
    }
  };

  const getStrengthIndicator = () => {
    if (!watchedPassword) return null;
    
    const widthPercentage = ((passwordStrength.score + 1) / 5) * 100;
    
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400">Password strength</span>
          <span className={`text-xs font-medium ${
            passwordStrength.color.includes('red') ? 'text-red-400' :
            passwordStrength.color.includes('orange') ? 'text-orange-400' :
            passwordStrength.color.includes('yellow') ? 'text-yellow-400' :
            passwordStrength.color.includes('blue') ? 'text-blue-400' :
            'text-green-400'
          }`}>
            {passwordStrength.label}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              passwordStrength.color.includes('red') ? 'bg-red-500' :
              passwordStrength.color.includes('orange') ? 'bg-orange-500' :
              passwordStrength.color.includes('yellow') ? 'bg-yellow-500' :
              passwordStrength.color.includes('blue') ? 'bg-blue-500' :
              'bg-green-500'
            }`}
            style={{ width: `${widthPercentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border text-card-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingPassword ? 'Edit Password' : 'Add New Password'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Service Name */}
            <FormField
              control={form.control}
              name="serviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Gmail, Twitter, Netflix"
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website URL */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        type="url"
                        placeholder="e.g. https://gmail.com"
                        className="pl-10 pr-10 bg-slate-700 dark:bg-slate-700 bg-white dark:border-slate-600 border-slate-200 text-black dark:text-white placeholder-slate-400 focus:border-blue-500"
                        {...field}
                      />
                      {metadata.isLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  
                  {/* Website Preview - Only show if URL is entered and metadata is fetched */}
                  {watchedUrl && watchedUrl.trim() && metadata.title && (
                    <div className="mt-2 p-3 bg-slate-700/50 dark:bg-slate-700/50 bg-slate-100 rounded-lg border border-slate-600 dark:border-slate-600 border-slate-200">
                      <div className="flex items-center gap-3">
                        {metadata.favicon && (
                          <img 
                            src={metadata.favicon} 
                            alt={`${metadata.title} favicon`}
                            className="w-6 h-6 rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-slate-200 dark:text-slate-200 text-slate-800 truncate">
                            {metadata.title}
                          </div>
                          {metadata.description && (
                            <div className="text-xs text-slate-400 dark:text-slate-400 text-slate-600 truncate">
                              {metadata.description}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                          Auto-detected
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username/Email */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username/Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your login username or email"
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Your password"
                        className="pr-20 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 font-mono"
                        {...field}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-blue-400 p-1 h-8 w-8"
                          onClick={handleGeneratePassword}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-white p-1 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  {getStrengthIndicator()}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Generator Options */}
            <div className="bg-slate-800/50 rounded-xl p-4 space-y-4">
              <h4 className="text-sm font-medium">Password Generator Options</h4>
              
              {/* Length Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Length</Label>
                  <span className="text-sm font-mono">{generatorOptions.length}</span>
                </div>
                <Slider
                  value={[generatorOptions.length]}
                  onValueChange={(value) => setGeneratorOptions(prev => ({ ...prev, length: value[0] }))}
                  min={8}
                  max={32}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Character Options */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={generatorOptions.includeUppercase}
                    onCheckedChange={(checked) => 
                      setGeneratorOptions(prev => ({ ...prev, includeUppercase: !!checked }))
                    }
                    className="border-slate-600"
                  />
                  <Label htmlFor="uppercase" className="text-sm">Uppercase</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={generatorOptions.includeLowercase}
                    onCheckedChange={(checked) => 
                      setGeneratorOptions(prev => ({ ...prev, includeLowercase: !!checked }))
                    }
                    className="border-slate-600"
                  />
                  <Label htmlFor="lowercase" className="text-sm">Lowercase</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={generatorOptions.includeNumbers}
                    onCheckedChange={(checked) => 
                      setGeneratorOptions(prev => ({ ...prev, includeNumbers: !!checked }))
                    }
                    className="border-slate-600"
                  />
                  <Label htmlFor="numbers" className="text-sm">Numbers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="symbols"
                    checked={generatorOptions.includeSymbols}
                    onCheckedChange={(checked) => 
                      setGeneratorOptions(prev => ({ ...prev, includeSymbols: !!checked }))
                    }
                    className="border-slate-600"
                  />
                  <Label htmlFor="symbols" className="text-sm">Symbols</Label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes"
                      rows={3}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Security Notice */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Protected with encryption</span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editingPassword ? 'Update' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
