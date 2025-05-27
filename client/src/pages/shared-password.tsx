
import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Copy, Eye, EyeOff, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SharedPassword() {
  const [, params] = useRoute('/share/:linkId');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (params?.linkId) {
      fetchSharedPassword(params.linkId);
    }
  }, [params?.linkId]);

  const fetchSharedPassword = async (linkId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/share/${linkId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Shared password not found or has expired.');
        }
        throw new Error('Failed to load shared password.');
      }
      
      const data = await response.json();
      
      setPasswordData({
        serviceName: data.passwordData.serviceName,
        username: data.passwordData.username,
        password: data.passwordData.password,
        url: data.passwordData.url,
        notes: data.passwordData.notes,
        expiresAt: new Date(data.expiresAt).getTime()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shared password. The link may have expired or is invalid.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: `${field} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const getTimeUntilExpiry = () => {
    if (!passwordData?.expiresAt) return '';
    const now = Date.now();
    const expiry = passwordData.expiresAt;
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading shared password...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <CardTitle className="text-xl">Link Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Go to Vault
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = passwordData?.expiresAt && Date.now() > passwordData.expiresAt;

  if (isExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <CardTitle className="text-xl">Link Expired</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This shared password link has expired and is no longer accessible.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Go to Vault
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold">Shared Password</h1>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/'}
            >
              Go to Vault
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Notice */}
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-green-500 mb-1">Secure Share</h3>
            <p className="text-sm text-muted-foreground">
              This password was shared securely and is encrypted in transit. 
              Please copy the information you need and close this page when done.
            </p>
          </div>
        </div>

        {/* Expiration Warning */}
        {passwordData && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="font-medium text-orange-500">Time Remaining</h3>
              <p className="text-sm text-muted-foreground">{getTimeUntilExpiry()}</p>
            </div>
          </div>
        )}

        {/* Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl">{passwordData?.serviceName}</h2>
                {passwordData?.url && (
                  <p className="text-sm text-muted-foreground font-normal">{passwordData.url}</p>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label>Username/Email</Label>
              <div className="flex gap-2">
                <Input
                  value={passwordData?.username || ''}
                  readOnly
                  className="bg-muted"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(passwordData?.username || '', 'Username')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData?.password || ''}
                    readOnly
                    className="bg-muted pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(passwordData?.password || '', 'Password')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notes */}
            {passwordData?.notes && (
              <div className="space-y-2">
                <Label>Notes</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{passwordData.notes}</p>
                </div>
              </div>
            )}

            {/* URL */}
            {passwordData?.url && (
              <div className="space-y-2">
                <Label>Website URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={passwordData.url}
                    readOnly
                    className="bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(passwordData.url, 'URL')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>This shared password will automatically expire and become inaccessible.</p>
          <p className="mt-1">For security, please close this page when you're done.</p>
        </div>
      </main>
    </div>
  );
}
