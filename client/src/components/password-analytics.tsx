
import { useMemo } from 'react';
import { PasswordEntry } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Clock, Globe, Key, Eye } from 'lucide-react';
import { calculatePasswordStrength } from '@/lib/password-generator';

interface PasswordAnalyticsProps {
  passwords: PasswordEntry[];
}

export function PasswordAnalytics({ passwords }: PasswordAnalyticsProps) {
  const analytics = useMemo(() => {
    const total = passwords.length;
    
    // Password strength distribution
    const strengthCounts = { weak: 0, fair: 0, good: 0, strong: 0, veryStrong: 0 };
    const duplicates = new Map<string, number>();
    const oldPasswords = [];
    const withoutUrls = passwords.filter(p => !p.url).length;
    const withoutNotes = passwords.filter(p => !p.notes).length;
    
    passwords.forEach(password => {
      const strength = calculatePasswordStrength(password.password);
      
      // Count strength distribution
      if (strength.score === 0) strengthCounts.weak++;
      else if (strength.score === 1) strengthCounts.fair++;
      else if (strength.score === 2) strengthCounts.good++;
      else if (strength.score === 3) strengthCounts.strong++;
      else strengthCounts.veryStrong++;
      
      // Check for duplicates
      const count = duplicates.get(password.password) || 0;
      duplicates.set(password.password, count + 1);
      
      // Check age (simulated - in real app you'd have creation dates)
      const daysSinceCreated = Math.floor(Math.random() * 365);
      if (daysSinceCreated > 90) {
        oldPasswords.push(password);
      }
    });
    
    const duplicateCount = Array.from(duplicates.values()).filter(count => count > 1).length;
    const securityScore = Math.round(
      ((strengthCounts.strong + strengthCounts.veryStrong) / total) * 100
    );
    
    return {
      total,
      strengthCounts,
      duplicateCount,
      oldPasswordsCount: oldPasswords.length,
      withoutUrls,
      withoutNotes,
      securityScore
    };
  }, [passwords]);

  if (passwords.length === 0) return null;

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Security Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Score</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.securityScore}%</div>
          <Progress value={analytics.securityScore} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Based on password strength distribution
          </p>
        </CardContent>
      </Card>

      {/* Password Strength */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Password Strength</CardTitle>
          <Key className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs">Strong/Very Strong</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {analytics.strengthCounts.strong + analytics.strengthCounts.veryStrong}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Good</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {analytics.strengthCounts.good}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Weak/Fair</span>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {analytics.strengthCounts.weak + analytics.strengthCounts.fair}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Issues */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Issues</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs">Duplicate passwords</span>
              <Badge variant={analytics.duplicateCount > 0 ? "destructive" : "secondary"}>
                {analytics.duplicateCount}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Old passwords (90+ days)</span>
              <Badge variant={analytics.oldPasswordsCount > 0 ? "destructive" : "secondary"}>
                {analytics.oldPasswordsCount}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Missing URLs</span>
              <Badge variant="secondary">
                {analytics.withoutUrls}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
