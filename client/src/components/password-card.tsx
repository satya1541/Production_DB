import { useState } from 'react';
import { PasswordEntry } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faEye, faEyeSlash, faEllipsisV, faEdit, faShare, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { calculatePasswordStrength } from '@/lib/password-generator';
import { Edit2, Share2, Trash2, Globe, FileText, User, Key, Eye, EyeOff, Copy } from 'lucide-react'; // Importing necessary icons

interface PasswordCardProps {
  password: PasswordEntry;
  onCopy: (text: string, label: string) => void;
  onEdit: (password: PasswordEntry) => void;
  onShare: (password: PasswordEntry) => void;
  onDelete: (password: PasswordEntry) => void;
}

export function PasswordCard({ password, onCopy, onEdit, onShare, onDelete }: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false);

  const favicon = password.url ? `https://www.google.com/s2/favicons?domain=${new URL(password.url).hostname}&sz=64` : null;

  return (
    <Card className="bg-card border-border hover:bg-muted transition-colors">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {favicon ? (
              <img 
                src={favicon} 
                alt={`${password.serviceName} favicon`}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-slate-300" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate text-sm sm:text-base">{password.serviceName}</h3>
              <p className="text-xs sm:text-sm text-slate-400 truncate">{password.username}</p>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-slate-400 hover:text-white transition-colors duration-300"
              >
                <FontAwesomeIcon icon={faEllipsisV} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-700 border-slate-600">
              <DropdownMenuItem 
                onClick={() => onEdit(password)}
                className="text-slate-300 hover:bg-slate-600 hover:text-white text-sm"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onShare(password)}
                className="text-slate-300 hover:bg-slate-600 hover:text-white text-sm"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-600" />
              <DropdownMenuItem 
                onClick={() => onDelete(password)}
                className="text-red-400 hover:bg-red-500/20 hover:text-red-300 text-sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Password Field */}
        <div className="space-y-2 sm:space-y-3">
          <div className="relative">
            <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-700 rounded-lg border border-slate-600">
              <span className="text-monospace text-xs sm:text-sm text-slate-300 flex-1 mr-2">
                {showPassword ? password.password : '•'.repeat(12)}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopy(password.password, 'Password')}
                  className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* URL */}
          {password.url && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
              <a 
                href={password.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 truncate"
              >
                {password.url}
              </a>
            </div>
          )}

          {/* Notes */}
          {password.notes && (
            <div className="flex items-start gap-2 text-xs sm:text-sm">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 text-xs sm:text-sm line-clamp-2">{password.notes}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 pt-1 sm:pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(password.username, 'Username')}
              className="flex-1 bg-transparent border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground text-xs sm:text-sm h-7 sm:h-8"
            >
              <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
              <span className="hidden sm:inline">Copy </span>Username
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(password.password, 'Password')}
              className="flex-1 bg-transparent border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground text-xs sm:text-sm h-7 sm:h-8"
            >
              <Key className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
              <span className="hidden sm:inline">Copy </span>Password
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}